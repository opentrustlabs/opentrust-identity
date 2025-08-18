import { Client, ClientScopeRel, ErrorDetail, ObjectSearchResultItem, RelSearchResultItem, SearchResultType, Tenant } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import ClientDao from "@/lib/dao/client-dao";
import { generateRandomToken } from "@/utils/dao-utils";
import TenantDao from "@/lib/dao/tenant-dao";
import { GraphQLError } from "graphql/error/GraphQLError";
import { randomUUID } from 'crypto'; 
import { CHANGE_EVENT_CLASS_CLIENT, CHANGE_EVENT_CLASS_CLIENT_REDIRECT_URI, CHANGE_EVENT_TYPE_CREATE, CHANGE_EVENT_TYPE_CREATE_REL, CHANGE_EVENT_TYPE_REMOVE_REL, CHANGE_EVENT_TYPE_UPDATE, CLIENT_CREATE_SCOPE, CLIENT_READ_SCOPE, CLIENT_TYPE_SERVICE_ACCOUNT, CLIENT_TYPES, CLIENT_TYPES_DISPLAY, CLIENT_UPDATE_SCOPE, SEARCH_INDEX_OBJECT_SEARCH, SEARCH_INDEX_REL_SEARCH, TENANT_READ_ALL_SCOPE } from "@/utils/consts";
import { getOpenSearchClient } from "@/lib/data-sources/search";
import { DaoFactory } from "../data-sources/dao-factory";
import Kms from "../kms/kms";
import { authorizeByScopeAndTenant, ServiceAuthorizationWrapper } from "@/utils/authz-utils";
import ScopeDao from "../dao/scope-dao";
import { isValidRedirectUri } from "@/utils/client-utils";
import { ERROR_CODES } from "../models/error";
import ChangeEventDao from "../dao/change-event-dao";

const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const searchClient = getOpenSearchClient();
const kms: Kms = DaoFactory.getInstance().getKms();
const scopeDao: ScopeDao = DaoFactory.getInstance().getScopeDao();
const changeEventDao: ChangeEventDao = DaoFactory.getInstance().getChangeEventDao();

class ClientService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }


    public async getClients(tenantId?: string): Promise<Array<Client>> {
        const getData = ServiceAuthorizationWrapper(
            {
                preProcess: async function(oidcContext, ...args) {
                    if (oidcContext.portalUserProfile?.managementAccessTenantId !== oidcContext.rootTenant.tenantId) {
                        return [oidcContext.portalUserProfile?.managementAccessTenantId || ""];
                    }
                    return [args];
                },
                performOperation: async function(_, ...args) {
                    const clients: Array<Client> = await clientDao.getClients(...args);
                    return clients;
                },
                postProcess: async function(_, result) {
                    if(result){
                        result.forEach(
                            (c: Client) => c.clientSecret = ""
                        );                        
                    }
                    return result;
                },
            }
        );

        const clients = await getData(this.oidcContext, [CLIENT_READ_SCOPE, TENANT_READ_ALL_SCOPE], tenantId);
        return clients || [];
    }
    

    public async getClientById(clientId: string): Promise<Client | null> {
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

    public async updateClient(client: Client): Promise<Client> {
        const clientToUpdate: Client | null = await this.getClientById(client.clientId);
        
        if(!clientToUpdate){
            throw new GraphQLError(ERROR_CODES.EC00011.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00011}});
        }
        
        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, CLIENT_UPDATE_SCOPE, clientToUpdate.tenantId);
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

        // If the client type has changed, then delete the scope values assigned to the client
        if(clientToUpdate.clientType !== client.clientType){
            const rels: Array<ClientScopeRel> = await scopeDao.getClientScopeRels(client.clientId);
            for(let i = 0; i < rels.length; i++){
                scopeDao.removeScopeFromClient(rels[i].tenantId, rels[i].clientId, rels[i].scopeId);
            }
        }
        
        // tenantId is a write-only-read-only property, no updates regardless of what the client has sent
        // same for client secret
        clientToUpdate.clientDescription = client.clientDescription;
        clientToUpdate.clientName = client.clientName;
        clientToUpdate.enabled = client.enabled;
        clientToUpdate.oidcEnabled = client.oidcEnabled;
        // Only allow the pkce entension when oidc (i.e. SSO) is enabled.
        clientToUpdate.pkceEnabled = client.oidcEnabled === false ? false : client.pkceEnabled;
        clientToUpdate.clientTokenTTLSeconds = client.clientTokenTTLSeconds;
        clientToUpdate.clientType = client.clientType;
        clientToUpdate.maxRefreshTokenCount = client.maxRefreshTokenCount;
        clientToUpdate.userTokenTTLSeconds = client.userTokenTTLSeconds;
        clientToUpdate.audience = client.audience;

        await clientDao.updateClient(clientToUpdate);
        await this.updateSearchIndex(clientToUpdate);
        changeEventDao.addChangeEvent({
            objectId: client.clientId,
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
        const client: Client | null = await this.getClientById(clientId);
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
        changeEventDao.addChangeEvent({
            objectId: clientId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_CLIENT_REDIRECT_URI,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({clientId, uri})
        });
        
        
        return clientDao.addRedirectURI(clientId, uri);
    }

    public async removeRedirectURI(clientId: string, uri: string): Promise<void>{
        const client: Client | null = await this.getClientById(clientId);
        if(!client){
            throw new GraphQLError(ERROR_CODES.EC00031.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00031}});
        }
        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, CLIENT_UPDATE_SCOPE, client.tenantId);
        if(!isAuthorized){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }
        changeEventDao.addChangeEvent({
            objectId: clientId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_CLIENT_REDIRECT_URI,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_REMOVE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({clientId, uri})
        });
        return clientDao.removeRedirectURI(clientId, uri);
    }
    
}

export default ClientService;