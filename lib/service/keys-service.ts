import { AutoCreateSigningKeyInput, ObjectSearchResultItem, RelSearchResultItem, SearchResultType, SigningKey, Tenant } from "@/graphql/generated/graphql-types";
import { GraphQLError } from "graphql/error/GraphQLError";
import { randomUUID } from 'crypto'; 
import { OIDCContext } from "@/graphql/graphql-context";
import { CHANGE_EVENT_CLASS_SIGNING_KEY, CHANGE_EVENT_TYPE_CREATE, CHANGE_EVENT_TYPE_UPDATE, KEY_CREATE_SCOPE, KEY_DELETE_SCOPE, KEY_READ_SCOPE, KEY_TYPE_RSA, KEY_TYPES, KEY_UPDATE_SCOPE, KEY_USES, MIN_PRIVATE_KEY_PASSWORD_LENGTH, PKCS8_ENCRYPTED_PRIVATE_KEY_HEADER, SEARCH_INDEX_OBJECT_SEARCH, SEARCH_INDEX_REL_SEARCH, SIGNING_KEY_STATUS_ACTIVE, SIGNING_KEY_STATUS_REVOKED, TENANT_READ_ALL_SCOPE } from "@/utils/consts";
import { DaoFactory } from "../data-sources/dao-factory";
import { Client } from "@opensearch-project/opensearch";
import { getOpenSearchClient } from "../data-sources/search";
import Kms from "../kms/kms";
import { X509Certificate } from "crypto";
import { authorizeByScopeAndTenant, ServiceAuthorizationWrapper } from "@/utils/authz-utils";
import { createSigningKey } from "@/utils/signing-key-utils";
import { ERROR_CODES } from "../models/error";
import ChangeEventDao from "../dao/change-event-dao";


const signingKeysDao = DaoFactory.getInstance().getSigningKeysDao();
const tenantDao = DaoFactory.getInstance().getTenantDao();
const searchClient: Client = getOpenSearchClient();
const kms: Kms = DaoFactory.getInstance().getKms();
const changeEventDao: ChangeEventDao = DaoFactory.getInstance().getChangeEventDao();

class SigningKeysService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }
   
    public async getSigningKeys(tenantId?: string): Promise<Array<SigningKey>> {

        const getData = ServiceAuthorizationWrapper(
            {
                async preProcess(oidcContext: OIDCContext, ...args) {
                    if (oidcContext.portalUserProfile?.managementAccessTenantId !== oidcContext.rootTenant.tenantId) {
                        return [oidcContext.portalUserProfile?.managementAccessTenantId || ""];
                    }
                    return args;
                },
                async performOperation(_, ...args) {
                    const signingKeys: Array<SigningKey> = await signingKeysDao.getSigningKeys(...args);
                    return signingKeys
                },
                async postProcess(_, result) {
                    // Do NOT!!! return any private key or password data with this call.
                    if(result){
                        result.forEach(
                            (k: SigningKey) => {
                                k.password = "";
                                k.privateKeyPkcs8 = "";
                            }
                        );
                    }
                    return result;
                },
            }
        );

        const signingKeys: Array<SigningKey> | null = await getData(this.oidcContext, [TENANT_READ_ALL_SCOPE, KEY_READ_SCOPE], tenantId);
        return signingKeys || [];        
    }    


    public async createSigningKey(key: SigningKey): Promise<SigningKey> {

        const authResult = authorizeByScopeAndTenant(this.oidcContext, [KEY_CREATE_SCOPE], key.tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }

        const tenant: Tenant | null = await tenantDao.getTenantById(key.tenantId);
        if(!tenant){
            throw new GraphQLError(ERROR_CODES.EC00008.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00008}});
        }
        if(tenant.enabled === false || tenant.markForDelete === true){
            throw new GraphQLError(ERROR_CODES.EC00009.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00009}});
        }

        if(!key.keyName || key.keyName === ""){
            throw new GraphQLError(ERROR_CODES.EC00050.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00050}});
        }
        if(!key.privateKeyPkcs8 || key.privateKeyPkcs8 === ""){
            throw new GraphQLError(ERROR_CODES.EC00051.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00051}});
        }
        if(key.certificate === "" && key.publicKey === ""){
            throw new GraphQLError(ERROR_CODES.EC00052.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00052}});
        }
        if(key.password === "" && key.privateKeyPkcs8.startsWith(PKCS8_ENCRYPTED_PRIVATE_KEY_HEADER)){
            throw new GraphQLError(ERROR_CODES.EC00053.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00053}});
        }
        if(key.password && key.password !== "" && key.password.length < MIN_PRIVATE_KEY_PASSWORD_LENGTH){
            throw new GraphQLError(ERROR_CODES.EC00054.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00054}});
        }

        if(key.keyType === "" || !KEY_TYPES.includes(key.keyType)){
            throw new GraphQLError(ERROR_CODES.EC00055.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00055}});
        }
        if(key.keyUse === "" || !KEY_USES.includes(key.keyUse)){
            throw new GraphQLError(ERROR_CODES.EC00056.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00056}});
        }
        if(key.publicKey && key.publicKey.length > 0){
            const now: number = new Date().getTime();                                                    
            const diff: number = key.expiresAtMs - now;
            // if negative or greater than a year, then reject
            if(diff < 0 || diff > 31557600000){
                throw new GraphQLError(ERROR_CODES.EC00057.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00057}});
            }
        }
        if(key.certificate && key.certificate.length > 0){
            const x509Cert: X509Certificate = new X509Certificate(key.certificate);            
            const d: Date = new Date(x509Cert.validTo);
            key.expiresAtMs = d.getTime();
        }
        
        const plainText = key.password && key.password !== "" ? key.password : key.privateKeyPkcs8;
        const encrypted: string | null = await kms.encrypt(plainText);
        if(encrypted === null){
            throw new GraphQLError(ERROR_CODES.EC00058.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00058}});
        }
        if(key.password && key.password !== ""){
            key.password = encrypted
        }
        else{
            key.privateKeyPkcs8 = encrypted;
        }
        
        key.keyId = randomUUID().toString();
        key.status === SIGNING_KEY_STATUS_ACTIVE

        await signingKeysDao.createSigningKey(key);
        await this.updateSearchIndex(key);

        changeEventDao.addChangeEvent({
            objectId: key.keyId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_SIGNING_KEY,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE,
            changeTimestamp: Date.now(),
            data: JSON.stringify({keyName: key.keyName, keyType: key.keyType, keyUse: key.keyUse})
        });

        return Promise.resolve(key);        
    } 

    public async uncheckedAutoCreateSigningKey(keyInput: AutoCreateSigningKeyInput): Promise<SigningKey> {
        const tenant: Tenant | null = await tenantDao.getTenantById(keyInput.tenantId);
        if(!tenant){
            throw new GraphQLError(ERROR_CODES.EC00008.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00008}});
        }
        if(tenant.enabled === false || tenant.markForDelete === true){
            throw new GraphQLError(ERROR_CODES.EC00009.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00009}});
        }
        if(!keyInput.keyName || keyInput.keyName === ""){
            throw new GraphQLError(ERROR_CODES.EC00050.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00050}});
        }
        if(keyInput.keyType === "" || keyInput.keyType !== KEY_TYPE_RSA){
            throw new GraphQLError(ERROR_CODES.EC00055.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00055}});
        }
        if(keyInput.keyUse === "" || !KEY_USES.includes(keyInput.keyUse)){
            throw new GraphQLError(ERROR_CODES.EC00056.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00056}});
        }
        if(!keyInput.commonName || keyInput.commonName === ""){
            throw new GraphQLError(ERROR_CODES.EC00059.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00057}});
        }
        if(!keyInput.organizationName || keyInput.organizationName === ""){
            throw new GraphQLError(ERROR_CODES.EC00060.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00058}});
        }
        const now: number = new Date().getTime();                                                    
        const diff: number = keyInput.expiresAtMs - now;
        // if negative or greater than a year, then reject
        if(diff < 0 || diff > 31557600000){
            throw new GraphQLError(ERROR_CODES.EC00061.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00061}});
        }
        if(keyInput.password && keyInput.password !== "" && keyInput.password.length < MIN_PRIVATE_KEY_PASSWORD_LENGTH){
            throw new GraphQLError(ERROR_CODES.EC00054.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00054}});
        }
        
        const expiresAtDate = new Date(keyInput.expiresAtMs);        
        const inputPassword: string | undefined = !keyInput.password || keyInput.password === "" ? undefined : keyInput.password;
        const {passphrase, privateKey, certificate} = createSigningKey(keyInput.commonName, keyInput.organizationName, expiresAtDate, inputPassword);
        
        const encrypted: string | null = await kms.encrypt(passphrase);
        if(encrypted === null){
            throw new GraphQLError(ERROR_CODES.EC00058.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00058}});
        }

        const key: SigningKey = {
            createdAtMs: now,
            expiresAtMs: keyInput.expiresAtMs,
            keyId: randomUUID().toString(),
            keyName: keyInput.keyName,
            keyType: keyInput.keyType,
            keyUse: keyInput.keyUse,
            markForDelete: false,
            privateKeyPkcs8: privateKey,
            status: SIGNING_KEY_STATUS_ACTIVE,
            tenantId: keyInput.tenantId,
            certificate: certificate,
            password: encrypted
        }
        await signingKeysDao.createSigningKey(key);
        await this.updateSearchIndex(key);

        changeEventDao.addChangeEvent({
            objectId: key.keyId,
            changedBy: "SCHEDULED_PROCESS",
            changeEventClass: CHANGE_EVENT_CLASS_SIGNING_KEY,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE,
            changeTimestamp: Date.now(),
            data: JSON.stringify({keyName: key.keyName, keyType: key.keyType, keyUse: key.keyUse})
        });

        return Promise.resolve(key); 
    }
    
    public async autoCreateSigningKey(keyInput: AutoCreateSigningKeyInput): Promise<SigningKey> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [KEY_CREATE_SCOPE], keyInput.tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }
        return this.uncheckedAutoCreateSigningKey(keyInput);        
    }

    public async updateSigningKey(key: SigningKey): Promise<SigningKey> {
        
        if( ! (key.status === SIGNING_KEY_STATUS_REVOKED || key.status === SIGNING_KEY_STATUS_ACTIVE)) {
            throw new GraphQLError(ERROR_CODES.EC00062.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00062}});
        }
        const existingKey: SigningKey | null = await signingKeysDao.getSigningKeyById(key.keyId);
        if(!existingKey){
            throw new GraphQLError(ERROR_CODES.EC00015.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00015}});
        }

        const authResult = authorizeByScopeAndTenant(this.oidcContext, [KEY_UPDATE_SCOPE], existingKey.tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }

        if(existingKey.status === SIGNING_KEY_STATUS_REVOKED){
            throw new GraphQLError(ERROR_CODES.EC00063.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00063}});
        }
        
        existingKey.keyName = key.keyName;
        existingKey.status = key.status;

        await signingKeysDao.updateSigningKey(existingKey);
        await this.updateSearchIndex(existingKey);

        changeEventDao.addChangeEvent({
            objectId: key.keyId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_SIGNING_KEY,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_UPDATE,
            changeTimestamp: Date.now(),
            data: JSON.stringify({keyName: key.keyName, keyType: key.keyType, keyUse: key.keyUse})
        });

        return Promise.resolve(existingKey);
    }

    public async getSigningKeyById(keyId: string): Promise<SigningKey | null> {

        const getData = ServiceAuthorizationWrapper(
            {
                async performOperation(_, __) {
                    const signingKey: SigningKey | null = await signingKeysDao.getSigningKeyById(keyId);
                    return signingKey;
                },
                async additionalConstraintCheck(oidcContext: OIDCContext, result: SigningKey | null) {
                    if(result){                        
                        if(oidcContext.portalUserProfile?.managementAccessTenantId !== result.tenantId){
                            return {isAuthorized: false, errorDetail: ERROR_CODES.EC00064};
                        }
                        else {
                            return {isAuthorized: true, errorDetail: ERROR_CODES.NULL_ERROR};
                        }
                    }
                    return {isAuthorized: true, errorDetail: ERROR_CODES.NULL_ERROR};
                },
                async postProcess(_, result) {
                    if(result){
                        // Only return the public data. Viewing either the password for an encrypted
                        // private key or a plain text private key requires special permissions.

                        // A non-empty password means that an encrypted private key was supplied
                        if(result.password && result.password !== ""){
                            result.password = ""
                        }
                        // else a plain text password was supplied.
                        else{
                            result.privateKeyPkcs8 = ""
                        }
                    }
                    return result;
                },
            }
        );

        const signingKey: SigningKey | null = await getData(this.oidcContext, [TENANT_READ_ALL_SCOPE, KEY_READ_SCOPE], keyId);        
        return Promise.resolve(signingKey);        
    }
    
    
    protected async updateSearchIndex(key: SigningKey): Promise<void> {
        
        const document: ObjectSearchResultItem = {
            name: key.keyName,
            description: key.keyUse,
            objectid: key.keyId,
            objecttype: SearchResultType.Key,
            owningtenantid: key.tenantId,
            email: "",
            enabled: key.status === SIGNING_KEY_STATUS_ACTIVE,
            owningclientid: "",
            subtype: key.keyType,
            subtypekey: key.keyType
        }        
        await searchClient.index({
            id: key.keyId,
            index: SEARCH_INDEX_OBJECT_SEARCH,
            body: document
        });   
        
        const relSearch: RelSearchResultItem = {
            childid: key.keyId,
            childname: key.keyName,
            childtype: SearchResultType.Key,
            owningtenantid: key.tenantId,
            parentid: key.tenantId,
            parenttype: SearchResultType.Tenant,
            childdescription: key.keyType
        }
        await searchClient.index({
            id: `${key.tenantId}::${key.keyId}`,
            index: SEARCH_INDEX_REL_SEARCH,
            body: relSearch
        });         
    }

}

export default SigningKeysService;