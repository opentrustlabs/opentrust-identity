import { AuthorizationScopeApprovalData, Client, ClientFapiConfiguration, ClientFapiConfigurationInput, ClientScopeRel, ClientUpdateInput, ErrorDetail, ObjectSearchResultItem, PreAuthenticationState, RelSearchResultItem, SearchResultType, Tenant } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import ClientDao from "@/lib/dao/client-dao";
import { generateRandomToken } from "@/utils/dao-utils";
import TenantDao from "@/lib/dao/tenant-dao";
import { GraphQLError } from "graphql/error/GraphQLError";
import { randomUUID } from 'crypto'; 
import { CHANGE_EVENT_CLASS_CLIENT, CHANGE_EVENT_CLASS_CLIENT_FAPI_CONFIGURATION, CHANGE_EVENT_CLASS_CLIENT_REDIRECT_URI, CHANGE_EVENT_TYPE_CREATE, CHANGE_EVENT_TYPE_CREATE_REL, CHANGE_EVENT_TYPE_REMOVE_REL, CHANGE_EVENT_TYPE_UPDATE, CHANGE_EVENT_TYPE_UPDATE_REL, CLIENT_CREATE_SCOPE, CLIENT_READ_SCOPE, CLIENT_TYPE_DEVICE, CLIENT_TYPE_SERVICE_ACCOUNT, CLIENT_TYPE_USER_DELEGATED_PERMISSIONS, CLIENT_TYPES, CLIENT_TYPES_DISPLAY, CLIENT_UPDATE_SCOPE, FAPI_ID_TYPE_SAN_URI, SEARCH_INDEX_OBJECT_SEARCH, SEARCH_INDEX_REL_SEARCH, TENANT_READ_ALL_SCOPE } from "@/utils/consts";
import { getOpenSearchClient } from "@/lib/data-sources/search";
import { DaoFactory } from "../data-sources/dao-factory";
import Kms from "../kms/kms";
import { authorizeByScopeAndTenant, ServiceAuthorizationWrapper } from "@/utils/authz-utils";
import ScopeDao from "../dao/scope-dao";
import { isValidRedirectUri } from "@/utils/client-utils";
import { ERROR_CODES } from "../models/error";
import ChangeEventDao from "../dao/change-event-dao";
import AuthDao from "../dao/auth-dao";

const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const searchClient = getOpenSearchClient();
const kms: Kms = DaoFactory.getInstance().getKms();
const scopeDao: ScopeDao = DaoFactory.getInstance().getScopeDao();
const changeEventDao: ChangeEventDao = DaoFactory.getInstance().getChangeEventDao();
const authDao: AuthDao = DaoFactory.getInstance().getAuthDao();

class ClientService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }


    // public async getClients(tenantId?: string): Promise<Array<Client>> {
    //     const getData = ServiceAuthorizationWrapper(
    //         {
    //             preProcess: async function(oidcContext, ...args) {
    //                 if (oidcContext.portalUserProfile?.managementAccessTenantId !== oidcContext.rootTenant.tenantId) {
    //                     return [oidcContext.portalUserProfile?.managementAccessTenantId || ""];
    //                 }
    //                 return [args];
    //             },
    //             performOperation: async function(_, ...args) {
    //                 const clients: Array<Client> = await clientDao.getClients(...args);
    //                 return clients;
    //             },
    //             postProcess: async function(_, result) {
    //                 if(result){
    //                     result.forEach(
    //                         (c: Client) => c.clientSecret = ""
    //                     );                        
    //                 }
    //                 return result;
    //             },
    //         }
    //     );

    //     const clients = await getData(this.oidcContext, [CLIENT_READ_SCOPE, TENANT_READ_ALL_SCOPE], tenantId);
    //     return clients || [];
    // }
    

    public async getClientById(clientId: string): Promise<Client | null> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getData = ServiceAuthorizationWrapper<any[], Client | null>(
            {
                performOperation: async function(): Promise<Client | null> {
                    const client = await clientDao.getClientById(clientId);                       
                    return client;
                },
                additionalConstraintCheck: async function(oidcContext, result: Client | null): Promise<{ isAuthorized: boolean; errorDetail: ErrorDetail}> {
                    if(result && result.tenantId !== oidcContext.portalUserProfile?.managementAccessTenantId){
                        return {isAuthorized: false, errorDetail: ERROR_CODES.EC00030}
                    }
                    return {isAuthorized: true, errorDetail: ERROR_CODES.NULL_ERROR}
                },
                postProcess: async function(_, result) {
                    if(result){
                        result.clientSecret = ""
                    }
                    return result;
                },
            }
        );

        const client = getData(this.oidcContext, [CLIENT_READ_SCOPE, TENANT_READ_ALL_SCOPE], clientId);
        return client === null ? Promise.resolve(null) : Promise.resolve(client);
    }

    public async createClient(client: Client): Promise<Client> {
        const tenant: Tenant | null = await tenantDao.getTenantById(client.tenantId);
        if(!tenant){
            throw new GraphQLError(ERROR_CODES.EC00008.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00008}});
        }
        if(tenant.enabled === false || tenant.markForDelete === true){
            throw new GraphQLError(ERROR_CODES.EC00009.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00009}});
        }

        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, CLIENT_CREATE_SCOPE, client.tenantId);
        if(!isAuthorized){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }

        if(!CLIENT_TYPES.includes(client.clientType)){
            throw new GraphQLError(ERROR_CODES.EC00031.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00031}});
        }
        if(client.oidcEnabled === false && client.pkceEnabled === true){
            throw new GraphQLError(ERROR_CODES.EC00188.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00188}});
        }
        if(client.clientType === CLIENT_TYPE_SERVICE_ACCOUNT && (client.oidcEnabled === true || client.pkceEnabled === true)){
            throw new GraphQLError(ERROR_CODES.EC00187.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00187}});
        }
        if(client.fapiEnabled === true && (client.clientType !== CLIENT_TYPE_SERVICE_ACCOUNT)){
            throw new GraphQLError(ERROR_CODES.EC00231.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00231}});
        }

        if(client.fapiEnabled === true){
            client.oidcEnabled = false;
            client.pkceEnabled = false;
            client.fapiEnabledAtMs = Date.now();
        }

        client.clientId = randomUUID().toString();
        const clientSecret = generateRandomToken(24, "hex");
        const encryptedClientSecret = await kms.encrypt(clientSecret);
        if(encryptedClientSecret === null){
            throw new GraphQLError(ERROR_CODES.EC00032.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00032}});
        }        
        client.clientSecret = encryptedClientSecret;

        await clientDao.createClient(client);
        await this.updateSearchIndex(client);
        // Now we need to set the actual client secret back on the object that
        // we are going to return so that the user can copy it somewhere.
        client.clientSecret = clientSecret;
        changeEventDao.addChangeEvent({
            objectId: client.clientId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_CLIENT,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE,
            changeTimestamp: Date.now(),
            data: JSON.stringify({...client, clientSecret: ""})
        });

        return Promise.resolve(client);
    }

    public async updateClient(clientUpdateInput: ClientUpdateInput): Promise<Client> {
    //public async updateClient(client: Client): Promise<Client> {
        const clientToUpdate: Client | null = await clientDao.getClientById(clientUpdateInput.clientId);
        
        if(!clientToUpdate){
            throw new GraphQLError(ERROR_CODES.EC00011.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00011}});
        }
        
        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, CLIENT_UPDATE_SCOPE, clientToUpdate.tenantId);
        if(!isAuthorized){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }

        if(!CLIENT_TYPES.includes(clientUpdateInput.clientType)){
            throw new GraphQLError(ERROR_CODES.EC00031.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00031}});
        }
        if(clientUpdateInput.oidcEnabled === false && clientUpdateInput.pkceEnabled === true){
            throw new GraphQLError(ERROR_CODES.EC00188.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00188}});
        }
        if(clientUpdateInput.clientType === CLIENT_TYPE_SERVICE_ACCOUNT && (clientUpdateInput.oidcEnabled === true || clientUpdateInput.pkceEnabled === true)){
            throw new GraphQLError(ERROR_CODES.EC00187.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00187}});
        }
        if(clientToUpdate.fapiEnabled === true && (clientUpdateInput.clientType !== CLIENT_TYPE_SERVICE_ACCOUNT)){
            throw new GraphQLError(ERROR_CODES.EC00231.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00231}});
        }

        // If the client type has changed, then delete the scope values assigned to the client
        if(clientToUpdate.clientType !== clientUpdateInput.clientType){
            const rels: Array<ClientScopeRel> = await scopeDao.getClientScopeRels(clientUpdateInput.clientId);
            for(let i = 0; i < rels.length; i++){
                scopeDao.removeScopeFromClient(rels[i].tenantId, rels[i].clientId, rels[i].scopeId);
            }
        }
        
        // tenantId is a write-only-read-only property, no updates regardless of what the client has sent,
        // same for client secret, fapiEnabled, and fapiEnabledAtMs
        clientToUpdate.clientDescription = clientUpdateInput.clientDescription;
        clientToUpdate.clientName = clientUpdateInput.clientName;
        clientToUpdate.enabled = clientUpdateInput.enabled;
        clientToUpdate.clientTokenTTLSeconds = clientUpdateInput.clientTokenTTLSeconds;
        clientToUpdate.maxRefreshTokenCount = clientUpdateInput.maxRefreshTokenCount;
        clientToUpdate.userTokenTTLSeconds = clientUpdateInput.userTokenTTLSeconds;
        clientToUpdate.audience = clientUpdateInput.audience;

        // Only allow these updates to the client when the FAPI flag is not true
        if(clientToUpdate.fapiEnabled !== true){
            clientToUpdate.oidcEnabled = clientUpdateInput.oidcEnabled;
            // Only allow the pkce entension when oidc (i.e. SSO) is enabled.
            clientToUpdate.pkceEnabled = clientUpdateInput.oidcEnabled === false ? false : clientUpdateInput.pkceEnabled;            
            clientToUpdate.clientType = clientUpdateInput.clientType;
        }

        await clientDao.updateClient(clientToUpdate);
        await this.updateSearchIndex(clientToUpdate);
        changeEventDao.addChangeEvent({
            objectId: clientUpdateInput.clientId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_CLIENT,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_UPDATE,
            changeTimestamp: Date.now(),
            data: JSON.stringify({...clientToUpdate, clientSecret: ""})
        });

        return Promise.resolve(clientToUpdate);
    }

    protected async updateSearchIndex(client: Client): Promise<void> {
        
        const document: ObjectSearchResultItem = {
            name: client.clientName,
            description: client.clientDescription,
            objectid: client.clientId,
            objecttype: SearchResultType.Client,
            owningtenantid: client.tenantId,
            email: "",
            enabled: client.enabled,
            owningclientid: "",
            subtype: CLIENT_TYPES_DISPLAY.get(client.clientType),
            subtypekey: client.clientType
        }
        
        await searchClient.index({
            id: client.clientId,
            index: SEARCH_INDEX_OBJECT_SEARCH,
            body: document
        });

        const relSearch: RelSearchResultItem = {
            childid: client.clientId,
            childname: client.clientName,
            childtype: SearchResultType.Client,
            owningtenantid: client.tenantId,
            parentid: client.tenantId,
            parenttype: SearchResultType.Tenant,
            childdescription: client.clientDescription
        }
        await searchClient.index({
            id: `${client.tenantId}::${client.clientId}`,
            index: SEARCH_INDEX_REL_SEARCH,
            body: relSearch
        });
        
    }

    public async getRedirectURIs(clientId: string): Promise<Array<string>>{
        const client: Client | null = await clientDao.getClientById(clientId);
        if(client){
            const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, [CLIENT_READ_SCOPE, TENANT_READ_ALL_SCOPE], client.tenantId);
            if(!isAuthorized){
                throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
            }
            return clientDao.getRedirectURIs(clientId);
        }
        return [];        
    }

    public async addRedirectURI(clientId: string, uri: string): Promise<string>{
        const client: Client | null = await clientDao.getClientById(clientId);
        if(!client){
            throw new GraphQLError(ERROR_CODES.EC00031.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00031}});
        }
        if(client.oidcEnabled === false){
            throw new GraphQLError(ERROR_CODES.EC00033.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00033}});
        }
        if(!isValidRedirectUri(uri)){
            throw new GraphQLError(ERROR_CODES.EC00034.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00034}});
        }

        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, CLIENT_UPDATE_SCOPE, client.tenantId);
        if(!isAuthorized){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }

        const s = await clientDao.addRedirectURI(clientId, uri);
        changeEventDao.addChangeEvent({
            objectId: clientId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_CLIENT_REDIRECT_URI,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({clientId, uri})
        });
        return s;
    }

    public async removeRedirectURI(clientId: string, uri: string): Promise<void>{
        const client: Client | null = await clientDao.getClientById(clientId);
        if(!client){
            throw new GraphQLError(ERROR_CODES.EC00031.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00031}});
        }
        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, CLIENT_UPDATE_SCOPE, client.tenantId);
        if(!isAuthorized){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }
        await clientDao.removeRedirectURI(clientId, uri);

        changeEventDao.addChangeEvent({
            objectId: clientId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_CLIENT_REDIRECT_URI,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_REMOVE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({clientId, uri})
        });

        return;
        
    }

    public async getAuthorizationScopeApprovalData(preAuthToken: string): Promise<AuthorizationScopeApprovalData>{        
        const approvalData: AuthorizationScopeApprovalData = {
            clientId: "",
            clientName: "",
            requestedScope: [],
            requiresUserApproval: false
        };
        const preAuthenticationState: PreAuthenticationState | null = await authDao.getPreAuthenticationState(preAuthToken);        
        if(preAuthenticationState === null){
            return approvalData;
        }
        
        const client: Client | null = await clientDao.getClientById(preAuthenticationState.clientId);
        if(client === null){            
            return approvalData;
        }
        
        const clientScopes: Array<ClientScopeRel> = await scopeDao.getClientScopeRels(client.clientId);
        const ids: Array<string> = clientScopes.map( (rel: ClientScopeRel) => rel.scopeId);
        const scopes = await scopeDao.getScope(undefined, ids);
        approvalData.clientId = client.clientId;
        approvalData.clientName = client.clientName;
        approvalData.requestedScope = scopes;
        approvalData.requiresUserApproval = client.clientType === CLIENT_TYPE_DEVICE || client.clientType === CLIENT_TYPE_USER_DELEGATED_PERMISSIONS
        return approvalData;
    }

    public async getClientFapiConfiguration(clientId: string): Promise<ClientFapiConfiguration | null>{
        const client: Client | null = await clientDao.getClientById(clientId);
        if(!client){
            return null;
        }

        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, [CLIENT_READ_SCOPE, TENANT_READ_ALL_SCOPE], client.tenantId);
        if(!isAuthorized){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }

        const config = await clientDao.getClientFapiConfigurationBy("clientid", clientId);
        return config;
    }
    
    public async setClientFapiConfiguration(fapiConfigurationInput: ClientFapiConfigurationInput): Promise<ClientFapiConfiguration | null>{

        // We are ONLY support one type of identifier type for the client certificate, and that is SAN:URI, which
        // is the most common one. Once a identifier type is selected, it must be used universally throughout the
        // application - that is, every client must have exactly one entry of that type in their list of SAN values.
        // We cannot mix and match SAN types based on client, so that one client could use SAN:DNS and other could use
        // SAN:URI, another could use otherName, and another could use a thumbprint. But future work may include 
        // support for a system-wide setting of identifier type, so keep this configurable for now, but also
        // hard-code it to the value that the system supports
        fapiConfigurationInput.identifierType = FAPI_ID_TYPE_SAN_URI;

        const client: Client | null = await clientDao.getClientById(fapiConfigurationInput.clientId);
        if(!client){
            return null;
        }
        // At the moment, we are only implementing baseline FAPI (client_credentials grant, limited to service accounts)
        if(client.clientType !== CLIENT_TYPE_SERVICE_ACCOUNT){
            throw new GraphQLError(ERROR_CODES.EC00231.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00231}});
        }

        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, CLIENT_UPDATE_SCOPE, client.tenantId);
        if(!isAuthorized){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }        
        
        const configByIdentifierValue = await clientDao.getClientFapiConfigurationBy("identifiervalue", fapiConfigurationInput.identifierValue);
        // The user can only update the identifier value, so if a record already exists with that identifier value
        // we need to return an error.
        if(configByIdentifierValue){
            throw new GraphQLError(ERROR_CODES.EC00230.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00230}});
        }
        
        const configByClientId = await clientDao.getClientFapiConfigurationBy("clientid", fapiConfigurationInput.clientId);
        // If we cannot find a value by either client id or identifier value, then it is safe to insert a new record
        if(!configByClientId){
            const config = await clientDao.createClientFapiConfiguration(fapiConfigurationInput);
            changeEventDao.addChangeEvent({
                objectId: client.clientId,
                changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
                changeEventClass: CHANGE_EVENT_CLASS_CLIENT_FAPI_CONFIGURATION,
                changeEventId: randomUUID().toString(),
                changeEventType: CHANGE_EVENT_TYPE_UPDATE_REL,
                changeTimestamp: Date.now(),
                data: JSON.stringify({clientId: client.clientId, fapiConfig: config})
            });
            return config;
        }
        else{
            // We need to delete the old record and insert a new one
            await clientDao.deleteClientFapiConfiguration(client.clientId);
            const config = await clientDao.createClientFapiConfiguration(fapiConfigurationInput);
            changeEventDao.addChangeEvent({
                objectId: client.clientId,
                changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
                changeEventClass: CHANGE_EVENT_CLASS_CLIENT_FAPI_CONFIGURATION,
                changeEventId: randomUUID().toString(),
                changeEventType: CHANGE_EVENT_TYPE_CREATE_REL,
                changeTimestamp: Date.now(),
                data: JSON.stringify({clientId: client.clientId, fapiConfig: config})
            });
            return config;
        }        
    }

    
    public async deleteClientFapiConfiguration(clientId: string): Promise<void>{
        const client: Client | null = await clientDao.getClientById(clientId);
        if(!client){
            return;
        }
        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, CLIENT_UPDATE_SCOPE, client.tenantId);
        if(!isAuthorized){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }
        await clientDao.deleteClientFapiConfiguration(clientId);
        changeEventDao.addChangeEvent({
                objectId: client.clientId,
                changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
                changeEventClass: CHANGE_EVENT_CLASS_CLIENT_FAPI_CONFIGURATION,
                changeEventId: randomUUID().toString(),
                changeEventType: CHANGE_EVENT_TYPE_REMOVE_REL,
                changeTimestamp: Date.now(),
                data: JSON.stringify({clientId})
            });
    }
    
}

export default ClientService;