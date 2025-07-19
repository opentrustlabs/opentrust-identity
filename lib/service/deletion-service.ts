import { MarkForDelete, MarkForDeleteObjectType, SchedulerLock } from "@/graphql/generated/graphql-types";
import AuthDao from "../dao/auth-dao";
import ClientDao from "../dao/client-dao";
import IdentityDao from "../dao/identity-dao";
import MarkForDeleteDao from "../dao/mark-for-delete-dao";
import SchedulerDao from "../dao/scheduler-dao";
import SigningKeysDao from "../dao/signing-keys-dao";
import TenantDao from "../dao/tenant-dao";
import { DaoFactory } from "../data-sources/dao-factory";
import { randomUUID } from 'crypto'; 
import { MARK_FOR_DELETE_LOCK_NAME_PREFIX, SEARCH_INDEX_OBJECT_SEARCH, SEARCH_INDEX_REL_SEARCH } from "@/utils/consts";
import { getOpenSearchClient } from "../data-sources/search";
import AuthenticationGroupDao from "../dao/authentication-group-dao";
import AuthorizationGroupDao from "../dao/authorization-group-dao";


const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const signingKeysDao: SigningKeysDao = DaoFactory.getInstance().getSigningKeysDao();
const schedulerDao: SchedulerDao = DaoFactory.getInstance().getSchedulerDao();
const identityDao: IdentityDao = DaoFactory.getInstance().getIdentityDao();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const authDao: AuthDao = DaoFactory.getInstance().getAuthDao();
const markForDeleteDao: MarkForDeleteDao = DaoFactory.getInstance().getMarkForDeleteDao();
const authenticationGroupDao: AuthenticationGroupDao = DaoFactory.getInstance().getAuthenticationGroupDao();
const authorizationGroupDao: AuthorizationGroupDao = DaoFactory.getInstance().getAuthorizationGroupDao();
const searchClient = getOpenSearchClient();

interface CompletionCallback {
    onFinished: () => void
}


class DeletionService {

    public async run(): Promise<void> {
        console.log("will delete marked-for-delete records");
        const arrMarkForDelete: Array<MarkForDelete> = await markForDeleteDao.getLatestMarkForDeleteRecords(20);
        // Find the first record that does not have a start date value and try to get a lock
        // on it. 
        const m: MarkForDelete | undefined = arrMarkForDelete.find(
            (d: MarkForDelete) => d.startedData === null || d.startedData === undefined
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
                m.startedData = Date.now()
                await markForDeleteDao.updateMarkForDelete(m);

                const onFinishedCallback: CompletionCallback = {
                    onFinished: function (): void {
                        schedulerDao.deleteSchedulerLock(schedulerLock.lockInstanceId)
                    }
                };
                switch (m.objectType) {
                    case MarkForDeleteObjectType.Client:
                        this.deleteClient(m.objectId, onFinishedCallback);
                        break;
                    case MarkForDeleteObjectType.AuthenticationGroup:
                        this.deleteAuthenticationGroup(m.objectId, onFinishedCallback);
                        break;
                    // case MarkForDeleteObjectType.FederatedOidcProvider:
                    //     this.deleteFederatedOidcProvider(m.objectId, onFinishedCallback);
                    //     break;
                    case MarkForDeleteObjectType.AuthorizationGroup:
                        this.deleteAuthorizationGroup(m.objectId, onFinishedCallback);
                        break;
                    // case MarkForDeleteObjectType.RateLimitServiceGroup:
                    //     this.deleteRateLimitServiceGroup(m.objectId, onFinishedCallback);
                    //     break;
                    // case MarkForDeleteObjectType.Scope:
                    //     this.deleteScope(m.objectId, onFinishedCallback);
                    //     break;
                    // case MarkForDeleteObjectType.SigningKey:
                    //     this.deleteSigningKey(m.objectId, onFinishedCallback);
                    //     break;
                    // case MarkForDeleteObjectType.User:
                    //     this.deleteUser(m.objectId, onFinishedCallback);
                    //     break;
                    // case MarkForDeleteObjectType.Tenant:
                    //     this.deleteTenant(m.objectId, onFinishedCallback);
                    //     break;
                    default:
                        break;
                }

            }
        }
        catch(err){
            // TODO
            // Log error
            await schedulerDao.deleteSchedulerLock(schedulerLock.lockInstanceId);
        }
        //await schedulerDao.deleteSchedulerLock(schedulerLock.lockInstanceId);

    }

    protected async deleteAuthenticationGroup(authenticationGroupId: string, callback: CompletionCallback): Promise<void> {
        await authenticationGroupDao.deleteAuthenticationGroup(authenticationGroupId);
        await this.deleteObjectSearchRecord(authenticationGroupId);
        this.deleteRelSearchRecords(authenticationGroupId);
        callback.onFinished();
    }

    protected async deleteAuthorizationGroup(groupId: string, callback: CompletionCallback): Promise<void> {
        await authorizationGroupDao.deleteAuthorizationGroup(groupId);
        await this.deleteObjectSearchRecord(groupId);
        this.deleteRelSearchRecords(groupId);
        callback.onFinished();
    }

    protected async deleteClient(clientId: string, callback: CompletionCallback): Promise<void> {
        await clientDao.deleteClient(clientId);
        await this.deleteObjectSearchRecord(clientId);
        this.deleteRelSearchRecords(clientId);
        callback.onFinished();
    }

    protected async deleteFederatedOidcProvider(providerId: string, callback: CompletionCallback): Promise<void> {

    }

    protected async deleteRateLimitServiceGroup(serviceGroupId: string, callback: CompletionCallback): Promise<void> {

    }

    protected async deleteScope(scopeId: string, callback: CompletionCallback): Promise<void> {

    }

    protected async deleteSigningKey(keyId: string, callback: CompletionCallback): Promise<void> {

    }

    protected async deleteUser(userId: string, callback: CompletionCallback): Promise<void> {

    }

    protected async deleteTenant(tenantId: string, callback: CompletionCallback): Promise<void> {

    }

    protected async deleteObjectSearchRecord(id: string): Promise<void> {
        await searchClient.delete({
            id: id,
            index: SEARCH_INDEX_OBJECT_SEARCH
        })

    }

    /**
     * Use the bulk delete operation for elastic/open search. Do not wait on
     * the results. Set a 4 hour timeout in case there are millions of records to
     * delete
     * @param id 
     */
    protected async deleteRelSearchRecords(id: string): Promise<void> {
        let query: any = {
            bool: {
                should: []
            }
        }
        query.bool.should.push({
            term: {parentid: id}
        });
        query.bool.should.push({
            term: {childid: id}
        });       
        
        searchClient.deleteByQuery({
            index: SEARCH_INDEX_REL_SEARCH,
            body: query,
            requests_per_second: 100,
            conflicts: "proceed",
            wait_for_completion: false,
            scroll: "240m"
        });         

    }
}

export default DeletionService;