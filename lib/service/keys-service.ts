import { AutoCreateSigningKeyInput, ObjectSearchResultItem, RelSearchResultItem, SearchResultType, SigningKey, Tenant } from "@/graphql/generated/graphql-types";
import { GraphQLError } from "graphql/error/GraphQLError";
import { randomUUID } from 'crypto'; 
import { OIDCContext } from "@/graphql/graphql-context";
import { KEY_CREATE_SCOPE, KEY_DELETE_SCOPE, KEY_READ_SCOPE, KEY_TYPE_RSA, KEY_TYPES, KEY_UPDATE_SCOPE, KEY_USES, MIN_PRIVATE_KEY_PASSWORD_LENGTH, PKCS8_ENCRYPTED_PRIVATE_KEY_HEADER, SEARCH_INDEX_OBJECT_SEARCH, SEARCH_INDEX_REL_SEARCH, SIGNING_KEY_STATUS_ACTIVE, SIGNING_KEY_STATUS_REVOKED, TENANT_READ_ALL_SCOPE } from "@/utils/consts";
import { DaoFactory } from "../data-sources/dao-factory";
import { Client } from "@opensearch-project/opensearch";
import { getOpenSearchClient } from "../data-sources/search";
import Kms from "../kms/kms";
import { X509Certificate } from "crypto";
import { authorizeByScopeAndTenant, ServiceAuthorizationWrapper } from "@/utils/authz-utils";
import { createSigningKey } from "@/utils/signing-key-utils";


const signingKeysDao = DaoFactory.getInstance().getSigningKeysDao();
const tenantDao = DaoFactory.getInstance().getTenantDao();
const searchClient: Client = getOpenSearchClient();
const kms: Kms = DaoFactory.getInstance().getKms();

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
                    console.log("args is: " + args);
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
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }

        const tenant: Tenant | null = await tenantDao.getTenantById(key.tenantId);
        if(!tenant){
            throw new GraphQLError("ERROR_TENANT_NOT_FOUND");
        }
        if(tenant.enabled === false || tenant.markForDelete === true){
            throw new GraphQLError("ERROR_TENANT_IS_DISABLED_OR_MARKED_FOR_DELETE");
        }

        if(!key.keyName || key.keyName === ""){
            throw new GraphQLError("ERROR_MISSING_KEY_NAME_OR_ALIAS");
        }
        if(!key.privateKeyPkcs8 || key.privateKeyPkcs8 === ""){
            throw new GraphQLError("ERROR_MISSING_PRIVATE_KEY");
        }
        if(key.certificate === "" && key.publicKey === ""){
            throw new GraphQLError("ERROR_MUST_PROVIDE_EITHER_A_PUBLIC_KEY_OR_CERTIFICATE");
        }
        if(key.password === "" && key.privateKeyPkcs8.startsWith(PKCS8_ENCRYPTED_PRIVATE_KEY_HEADER)){
            throw new GraphQLError("ERROR_ENCRYPTED_PRIVATE_KEY_REQUIRES_PASSPHRASE");
        }
        if(key.password && key.password !== "" && key.password.length < MIN_PRIVATE_KEY_PASSWORD_LENGTH){
            throw new GraphQLError("ERROR_INVALID_PASSPHRASE_LENGTH_FOR_PRIVATE_KEY");
        }

        if(key.keyType === "" || !KEY_TYPES.includes(key.keyType)){
            throw new GraphQLError("ERROR_MISSING_OR_INVALID_KEY_TYPE");
        }
        if(key.keyUse === "" || !KEY_USES.includes(key.keyUse)){
            throw new GraphQLError("ERROR_MISSING_OR_INVALID_KEY_USE");
        }
        if(key.publicKey && key.publicKey.length > 0){
            const now: number = new Date().getTime();                                                    
            const diff: number = key.expiresAtMs - now;
            // if negative or greater than a year, then reject
            if(diff < 0 || diff > 31557600000){
                throw new GraphQLError("ERROR_INVALID_EXPIRATION_FOR_PUBLIC_KEY");    
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
            throw new GraphQLError("ERROR_UNABLE_TO_ENCRYPT_PRIVATE_KEY_INFORMATION");
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
        return Promise.resolve(key);        
    } 

    public async uncheckedAutoCreateSigningKey(keyInput: AutoCreateSigningKeyInput): Promise<SigningKey> {
        const tenant: Tenant | null = await tenantDao.getTenantById(keyInput.tenantId);
        if(!tenant){
            throw new GraphQLError("ERROR_TENANT_NOT_FOUND");
        }
        if(tenant.enabled === false || tenant.markForDelete === true){
            throw new GraphQLError("ERROR_TENANT_IS_DISABLED_OR_MARKED_FOR_DELETE");
        }
        if(!keyInput.keyName || keyInput.keyName === ""){
            throw new GraphQLError("ERROR_MISSING_KEY_NAME_OR_ALIAS");
        }
        if(keyInput.keyType === "" || keyInput.keyType !== KEY_TYPE_RSA){
            throw new GraphQLError("ERROR_MISSING_OR_INVALID_KEY_TYPE");
        }
        if(keyInput.keyUse === "" || !KEY_USES.includes(keyInput.keyUse)){
            throw new GraphQLError("ERROR_MISSING_OR_INVALID_KEY_USE");
        }
        if(!keyInput.commonName || keyInput.commonName === ""){
            throw new GraphQLError("ERROR_MISSING_COMMON_NAME");
        }
        if(!keyInput.organizationName || keyInput.organizationName === ""){
            throw new GraphQLError("ERROR_MISSING_ORGANIZATION_NAME");
        }
        const now: number = new Date().getTime();                                                    
        const diff: number = keyInput.expiresAtMs - now;
        // if negative or greater than a year, then reject
        if(diff < 0 || diff > 31557600000){
            throw new GraphQLError("ERROR_INVALID_EXPIRATION_FOR_CERTIFICATE");    
        }
        if(keyInput.password && keyInput.password !== "" && keyInput.password.length < MIN_PRIVATE_KEY_PASSWORD_LENGTH){
            throw new GraphQLError("ERROR_INVALID_PASSPHRASE_LENGTH_FOR_PRIVATE_KEY");
        }
        
        const expiresAtDate = new Date(keyInput.expiresAtMs);        
        const inputPassword: string | undefined = !keyInput.password || keyInput.password === "" ? undefined : keyInput.password;
        const {passphrase, privateKey, certificate} = createSigningKey(keyInput.commonName, keyInput.organizationName, expiresAtDate, inputPassword);
        
        const encrypted: string | null = await kms.encrypt(passphrase);
        if(encrypted === null){
            throw new GraphQLError("ERROR_UNABLE_TO_ENCRYPT_PRIVATE_KEY_INFORMATION");
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
        return Promise.resolve(key); 
    }
    
    public async autoCreateSigningKey(keyInput: AutoCreateSigningKeyInput): Promise<SigningKey> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [KEY_CREATE_SCOPE], keyInput.tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }
        return this.uncheckedAutoCreateSigningKey(keyInput);        
    }

    public async updateSigningKey(key: SigningKey): Promise<SigningKey> {
        
        if( ! (key.status === SIGNING_KEY_STATUS_REVOKED || key.status === SIGNING_KEY_STATUS_ACTIVE)) {
            throw new GraphQLError("ERROR_INVALID_SIGNING_KEY_STATUS");
        }
        const existingKey: SigningKey | null = await signingKeysDao.getSigningKeyById(key.keyId);
        if(!existingKey){
            throw new GraphQLError("ERROR_SIGNING_KEY_DOES_NOT_EXIST");
        }

        const authResult = authorizeByScopeAndTenant(this.oidcContext, [KEY_UPDATE_SCOPE], existingKey.tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }

        if(existingKey.status === SIGNING_KEY_STATUS_REVOKED){
            throw new GraphQLError("ERROR_CANNOT_UPDATE_A_REVOKED_KEY");
        }
        
        existingKey.keyName = key.keyName;
        existingKey.status = key.status;

        await signingKeysDao.updateSigningKey(existingKey);
        await this.updateSearchIndex(existingKey);
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
                            return {isAuthorized: false, errorMessage: "ERROR_NO_ACCESS_TO_SIGNING_KEY"};
                        }
                        else {
                            return {isAuthorized: true, errorMessage: null};
                        }
                    }
                    return {isAuthorized: true, errorMessage: null};
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
    

    public async deleteSigningKey(keyId: string): Promise<void> {
        const signingKey: SigningKey | null = await signingKeysDao.getSigningKeyById(keyId);
        if(signingKey){
            const authResult = authorizeByScopeAndTenant(this.oidcContext, [KEY_DELETE_SCOPE], signingKey.tenantId);
            if(!authResult.isAuthorized){
                throw new GraphQLError(authResult.errorMessage || "ERROR");
            }

            await signingKeysDao.deleteSigningKey(keyId);
            await searchClient.delete({
                id: keyId,
                index: SEARCH_INDEX_OBJECT_SEARCH,
                refresh: "wait_for"
            });
            await searchClient.delete({
                id: `${signingKey.tenantId}::${signingKey.keyId}`,
                index: SEARCH_INDEX_REL_SEARCH,
                refresh: "wait_for"
            });
        }        
        return Promise.resolve();        
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