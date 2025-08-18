import { AuthenticationGroup, AuthorizationGroup, Client, Contact, MarkForDelete, MarkForDeleteObjectType, SchedulerLock, SigningKey, TenantAvailableScope, TenantManagementDomainRel } from "@/graphql/generated/graphql-types";
import AuthDao from "../dao/auth-dao";
import ClientDao from "../dao/client-dao";
import IdentityDao from "../dao/identity-dao";
import MarkForDeleteDao from "../dao/mark-for-delete-dao";
import SchedulerDao from "../dao/scheduler-dao";
import SigningKeysDao from "../dao/signing-keys-dao";
import TenantDao from "../dao/tenant-dao";
import { DaoFactory } from "../data-sources/dao-factory";
import { randomUUID } from 'crypto'; 
import { DELETE_EXPIRED_DATA_LOCK_NAME, MARK_FOR_DELETE_LOCK_NAME_PREFIX, SEARCH_INDEX_OBJECT_SEARCH, SEARCH_INDEX_REL_SEARCH } from "@/utils/consts";
import { getOpenSearchClient } from "../data-sources/search";
import AuthenticationGroupDao from "../dao/authentication-group-dao";
import AuthorizationGroupDao from "../dao/authorization-group-dao";
import FederatedOIDCProviderDao from "../dao/federated-oidc-provider-dao";
import ScopeDao from "../dao/scope-dao";
import RateLimitDao from "../dao/rate-limit-dao";
import ContactDao from "../dao/contact-dao";
import SecretShareDao from "../dao/secret-share-dao";
import { logWithDetails } from "../logging/logger";
import ChangeEventDao from "../dao/change-event-dao";


const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const signingKeysDao: SigningKeysDao = DaoFactory.getInstance().getSigningKeysDao();
const schedulerDao: SchedulerDao = DaoFactory.getInstance().getSchedulerDao();
const identityDao: IdentityDao = DaoFactory.getInstance().getIdentityDao();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const federatedOidcProviderDao: FederatedOIDCProviderDao = DaoFactory.getInstance().getFederatedOIDCProvicerDao();
const authDao: AuthDao = DaoFactory.getInstance().getAuthDao();
const markForDeleteDao: MarkForDeleteDao = DaoFactory.getInstance().getMarkForDeleteDao();
const authenticationGroupDao: AuthenticationGroupDao = DaoFactory.getInstance().getAuthenticationGroupDao();
const authorizationGroupDao: AuthorizationGroupDao = DaoFactory.getInstance().getAuthorizationGroupDao();
const scopeDao: ScopeDao = DaoFactory.getInstance().getScopeDao();
const rateLimitDao: RateLimitDao = DaoFactory.getInstance().getRateLimitDao();
const contactDao: ContactDao = DaoFactory.getInstance().getContactDao();
const secretShareDao: SecretShareDao = DaoFactory.getInstance().getSecretShareDao();
const changeEventDao: ChangeEventDao = DaoFactory.getInstance().getChangeEventDao();
const searchClient = getOpenSearchClient();

interface CompletionCallback {
    onFinished: () => void
}


class DeletionService {

    public async deleteExpiredRecords() {
        const schedulerLock: SchedulerLock = {
            lockExpiresAtMS: Date.now() + (1000 * 1800),
            lockInstanceId: randomUUID().toString(),
            lockName: DELETE_EXPIRED_DATA_LOCK_NAME,
            lockStartTimeMS: Date.now()
        };

        await schedulerDao.createSchedulerLock(schedulerLock);
        const arr: Array<SchedulerLock> = await schedulerDao.getSchedulerLocksByName(DELETE_EXPIRED_DATA_LOCK_NAME);
        if(arr.length === 0){
            return;
        }
        try{
            if(arr[0].lockInstanceId === schedulerLock.lockInstanceId){
                await clientDao.deleteExpiredData();
                await identityDao.deleteExpiredData();
                await authDao.deleteExpiredData();
                await schedulerDao.deleteExpiredData();
                await markForDeleteDao.deleteCompletedRecords();
                await markForDeleteDao.resetStalledJobs();
                await secretShareDao.deleteExpiredData();
                await changeEventDao.deleteExpiredData();
            }
        }
        // @typescript-eslint/no-explicit-any
        catch(err: any){            
            logWithDetails("error", `Error deleting expired records. ${err.message}.`, {...err});
        }
        await schedulerDao.deleteSchedulerLock(schedulerLock.lockInstanceId);
    }

    public async deleteMarkForDeleteRecords(): Promise<void> {
        const arrMarkForDelete: Array<MarkForDelete> = await markForDeleteDao.getLatestMarkForDeleteRecords(20);
        // Find the first record that does not have a start date value and try to get a lock
        // on it. 
        const m: MarkForDelete | undefined = arrMarkForDelete.find(
            (d: MarkForDelete) => d.startedDate === null || d.startedDate === undefined
        );
        if(!m){
            return;
        }
    
        const lockName = `${MARK_FOR_DELETE_LOCK_NAME_PREFIX}-${m.markForDeleteId}`;
        const schedulerLock: SchedulerLock = {
            lockExpiresAtMS: Date.now() + (1000 * 7200),
            lockInstanceId: randomUUID().toString(),
            lockName: lockName,
            lockStartTimeMS: Date.now()
        };

        await schedulerDao.createSchedulerLock(schedulerLock);
        const arr: Array<SchedulerLock> = await schedulerDao.getSchedulerLocksByName(lockName);
        if(arr.length === 0){
            return;
        }
        try{
            if(arr[0].lockInstanceId === schedulerLock.lockInstanceId){
                m.startedDate = Date.now();
                await markForDeleteDao.updateMarkForDelete(m);

                const onFinishedCallback: CompletionCallback = {
                    onFinished: function (): void {
                        m.completedDate = Date.now();
                        markForDeleteDao.updateMarkForDelete(m);
                        schedulerDao.deleteSchedulerLock(schedulerLock.lockInstanceId);
                    }
                };
                switch (m.objectType) {
                    case MarkForDeleteObjectType.Client:
                        this.deleteClient(m.objectId, onFinishedCallback);
                        break;
                    case MarkForDeleteObjectType.AuthenticationGroup:
                        this.deleteAuthenticationGroup(m.objectId, onFinishedCallback);
                        break;
                    case MarkForDeleteObjectType.FederatedOidcProvider:
                        this.deleteFederatedOidcProvider(m.objectId, onFinishedCallback);
                        break;
                    case MarkForDeleteObjectType.AuthorizationGroup:
                        this.deleteAuthorizationGroup(m.objectId, onFinishedCallback);
                        break;
                    case MarkForDeleteObjectType.RateLimitServiceGroup:
                        this.deleteRateLimitServiceGroup(m.objectId, onFinishedCallback);
                        break;
                    case MarkForDeleteObjectType.Scope:
                        this.deleteScope(m.objectId, onFinishedCallback);
                        break;
                    case MarkForDeleteObjectType.SigningKey:
                        this.deleteSigningKey(m.objectId, onFinishedCallback);
                        break;
                    case MarkForDeleteObjectType.User:
                        this.deleteUser(m.objectId, onFinishedCallback);
                        break;
                    case MarkForDeleteObjectType.Tenant:
                        this.deleteTenant(m.objectId, onFinishedCallback);
                        break;
                    default:
                        break;
                }

            }
        }
        // @typescript-eslint/no-explicit-any
        catch(err: any){
            logWithDetails("error", `Error deleting marked-for-delete records. ${err.message}.`, {...err, ...m});
        }
        await schedulerDao.deleteSchedulerLock(schedulerLock.lockInstanceId);
        
    }

    protected async deleteAuthenticationGroup(authenticationGroupId: string, callback: CompletionCallback): Promise<void> {
        try{
            await authenticationGroupDao.deleteAuthenticationGroup(authenticationGroupId);
            await this.deleteObjectSearchRecord(authenticationGroupId);
            this.deleteRelSearchRecords(authenticationGroupId);
            callback.onFinished();
        }
        // @typescript-eslint/no-explicit-any
        catch (err: any) {
            logWithDetails("error", `Error deleting authentication group. ${err.message}.`, {...err, authenticationGroupId});
        }
    }

    protected async deleteAuthorizationGroup(groupId: string, callback: CompletionCallback): Promise<void> {
        try{
            await authorizationGroupDao.deleteAuthorizationGroup(groupId);
            await this.deleteObjectSearchRecord(groupId);
            this.deleteRelSearchRecords(groupId);
            callback.onFinished();
        }
        // @typescript-eslint/no-explicit-any
        catch (err: any) {
            logWithDetails("error", `Error deleting authorization group. ${err.message}.`, {...err, groupId});
        }
    }

    protected async deleteClient(clientId: string, callback: CompletionCallback): Promise<void> {
        try {
            await clientDao.deleteClient(clientId);
            await this.deleteObjectSearchRecord(clientId);
            this.deleteRelSearchRecords(clientId);
            callback.onFinished();
        }
        catch (err: any) {
            logWithDetails("error", `Error deleting client. ${err.message}.`, {...err, clientId});
        }
    }

    protected async deleteFederatedOidcProvider(providerId: string, callback: CompletionCallback): Promise<void> {
        try {
            await federatedOidcProviderDao.deleteFederatedOidcProvider(providerId);
            await this.deleteObjectSearchRecord(providerId);
            this.deleteRelSearchRecords(providerId);
            callback.onFinished();
        }
        // @typescript-eslint/no-explicit-any
        catch (err: any) {
            logWithDetails("error", `Error deleting federated OIDC provider. ${err.message}.`, {...err, providerId});
        }
    }

    protected async deleteRateLimitServiceGroup(serviceGroupId: string, callback: CompletionCallback): Promise<void> {
        try {
            await rateLimitDao.deleteRateLimitServiceGroup(serviceGroupId);
            await this.deleteObjectSearchRecord(serviceGroupId);
            this.deleteRelSearchRecords(serviceGroupId);
            callback.onFinished();
        }
        // @typescript-eslint/no-explicit-any
        catch (err: any) {
            logWithDetails("error", `Error deleting rate limit service group. ${err.message}.`, {...err, serviceGroupId});
        }
    }

    protected async deleteScope(scopeId: string, callback: CompletionCallback): Promise<void> {
        try {
            await scopeDao.deleteScope(scopeId);
            await this.deleteObjectSearchRecord(scopeId);
            this.deleteRelSearchRecords(scopeId);
            callback.onFinished();
        }
        // @typescript-eslint/no-explicit-any
        catch (err: any) {
            logWithDetails("error", `Error deleting scope. ${err.message}.`, {...err, scopeId});
        }
    }

    protected async deleteSigningKey(keyId: string, callback: CompletionCallback): Promise<void> {
        try {
            await signingKeysDao.deleteSigningKey(keyId);
            await this.deleteObjectSearchRecord(keyId);
            this.deleteRelSearchRecords(keyId);
            callback.onFinished();
        }
        // @typescript-eslint/no-explicit-any
        catch (err: any) {
            logWithDetails("error", `Error deleting signing key. ${err.message}.`, {...err, keyId});
        }
    }

    protected async deleteUser(userId: string, callback: CompletionCallback): Promise<void> {
        try {
            await identityDao.deleteUser(userId);
            await this.deleteObjectSearchRecord(userId);
            this.deleteRelSearchRecords(userId);
            callback.onFinished();
        }
        // @typescript-eslint/no-explicit-any
        catch (err: any) {
            logWithDetails("error", `Error deleting user. ${err.message}.`, {...err, userId});
        }
    }

    protected async deleteTenant(tenantId: string, callback: CompletionCallback): Promise<void> {
        const noOpCompletionCallback: CompletionCallback = {
            onFinished() {
                // NO OP
            }
        }
        try{
            const clients: Array<Client> = await clientDao.getClients(tenantId);
            for(let i = 0; i < clients.length; i++){
                await this.deleteClient(clients[i].clientId, noOpCompletionCallback);
            }

            const authenticationGroups: Array<AuthenticationGroup> = await authenticationGroupDao.getAuthenticationGroups(tenantId);
            for(let i = 0; i < authenticationGroups.length; i++){
                await this.deleteAuthenticationGroup(authenticationGroups[i].authenticationGroupId, noOpCompletionCallback);
            }

            const authorizationGroups: Array<AuthorizationGroup> = await authorizationGroupDao.getAuthorizationGroups(tenantId);
            for(let i = 0; i < authorizationGroups.length; i++){
                await this.deleteAuthorizationGroup(authorizationGroups[i].groupId, noOpCompletionCallback);
            }

            const arrTenantAvailableScope: Array<TenantAvailableScope> = await scopeDao.getTenantAvailableScope(tenantId);
            for(let i = 0; i < arrTenantAvailableScope.length; i++){
                await scopeDao.removeScopeFromTenant(tenantId, arrTenantAvailableScope[i].scopeId);
            }

            const rateLimitRels = await rateLimitDao.getRateLimitTenantRel(tenantId, null);
            for(let i = 0; i < rateLimitRels.length; i++){
                await rateLimitDao.removeRateLimitFromTenant(tenantId, rateLimitRels[i].servicegroupid);
            }

            const arrTenantManagementDomainRel: Array<TenantManagementDomainRel> = await tenantDao.getDomainTenantManagementRels(tenantId);
            for(let i = 0; i < arrTenantManagementDomainRel.length; i ++){
                await tenantDao.removeDomainFromTenantManagement(tenantId, arrTenantManagementDomainRel[i].domain);
            }

            const arrTenantRestrictedAuthnDomains = await tenantDao.getDomainsForTenantRestrictedAuthentication(tenantId);
            for(let i = 0; i < arrTenantRestrictedAuthnDomains.length; i++){
                await tenantDao.removeDomainFromTenantRestrictedAuthentication(tenantId, arrTenantRestrictedAuthnDomains[i].domain);
            }

            const arrOidcProviderTenantRels = await federatedOidcProviderDao.getFederatedOidcProviderTenantRels(tenantId);
            for(let i = 0; i < arrOidcProviderTenantRels.length; i++){
                await federatedOidcProviderDao.removeFederatedOidcProviderFromTenant(arrOidcProviderTenantRels[i].federatedOIDCProviderId, tenantId);
            }

            const arrContacts: Array<Contact> = await contactDao.getContacts(tenantId);
            for(let i = 0; i < arrContacts.length; i++){
                await contactDao.removeContact(arrContacts[i].contactid);
            }

            const arrSigningKeys: Array<SigningKey> = await signingKeysDao.getSigningKeys(tenantId);
            for(let i = 0; i < arrSigningKeys.length; i++){
                await signingKeysDao.deleteSigningKey(arrSigningKeys[i].keyId);
            }
            
            await tenantDao.removePasswordConfigFromTenant(tenantId);
            await tenantDao.removeLegacyUserMigrationConfiguration(tenantId);
            await tenantDao.removeLoginFailurePolicy(tenantId);
            await tenantDao.deleteAnonymousUserConfiguration(tenantId);
            await tenantDao.deleteTenantLookAndFeel(tenantId);
            await tenantDao.removeAllAuthStateFromTenant(tenantId);
            await tenantDao.removeAllUsersFromTenant(tenantId);
            await tenantDao.deleteTenant(tenantId);

            await this.deleteObjectSearchRecord(tenantId);
            this.deleteRelSearchRecords(tenantId);
            callback.onFinished();

        }
        // @typescript-eslint/no-explicit-any
        catch (err: any) {
            logWithDetails("error", `Error deleting tenant. ${err.message}.`, {...err, tenantId});
        }
    }

    protected async deleteObjectSearchRecord(id: string): Promise<void> {
        try {
            await searchClient.delete({
                id: id,
                index: SEARCH_INDEX_OBJECT_SEARCH
            });
        }
        // @typescript-eslint/no-explicit-any
        catch (err: any) {
            logWithDetails("error", `Error deleting object search record. ${err.message}.`, {...err, id});
        }
    }

    /**
     * Use the bulk delete operation for elastic/open search. Do not wait on
     * the results. Set a 4 hour timeout in case there are millions of records to
     * delete
     * @param id 
     */
    protected async deleteRelSearchRecords(id: string): Promise<void> {
        const query: any = {
            bool: {
                should: []
            }
        }
        query.bool.should.push({
            term: { parentid: id }
        });
        query.bool.should.push({
            term: { childid: id }
        });

        const searchBody: any = {
            query: query
        }
        try {
            searchClient.deleteByQuery({
                index: SEARCH_INDEX_REL_SEARCH,
                body: searchBody,
                requests_per_second: 100,
                conflicts: "proceed",
                wait_for_completion: false,
                scroll: "240m"
            });
        }
        // @typescript-eslint/no-explicit-any
        catch (err: any) {
            logWithDetails("error", `Error deleting rel search index. ${err.message}.`, {...err, id});
        }
    }
}

export default DeletionService;