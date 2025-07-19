import { SchedulerLock, SigningKey, Tenant } from "@/graphql/generated/graphql-types";
import SchedulerDao from "@/lib/dao/scheduler-dao";
import SigningKeysDao from "@/lib/dao/signing-keys-dao";
import TenantDao from "@/lib/dao/tenant-dao";
import { DaoFactory } from "@/lib/data-sources/dao-factory";
import { CREATE_NEW_SIGNING_KEY_LOCK_NAME, DELETE_EXPIRED_DATA_LOCK_NAME, KEY_TYPE_RSA, KEY_USE_DIGITAL_SIGNING, SIGNING_KEY_STATUS_ACTIVE, SIGNING_KEY_STATUS_REVOKED } from "@/utils/consts";
import { randomUUID } from 'crypto'; 
import { createJwtSigningKey } from "@/utils/signing-key-utils";
import { generateRandomToken } from "@/utils/dao-utils";
import { CronJob } from "cron";
import IdentityDao from "../dao/identity-dao";
import AuthDao from "../dao/auth-dao";
import ClientDao from "../dao/client-dao";


const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const signingKeysDao: SigningKeysDao = DaoFactory.getInstance().getSigningKeysDao();
const schedulerDao: SchedulerDao = DaoFactory.getInstance().getSchedulerDao();
const identityDao: IdentityDao = DaoFactory.getInstance().getIdentityDao();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const authDao: AuthDao = DaoFactory.getInstance().getAuthDao();


// TODO
// Add cron scheduler from https://github.com/kelektiv/node-cron
// Schedule:
// 1.   Key creation every  month
// 2.   Expired data every 15 minutes (for those tables that have an expiration data timestamp)
// 3.   Mark for delete records every 15 minutes

export function initSchedulers(){

    // every 15 minutes at 0, 15, 30, and 45 minutes past the hour
    const deleteUpExpiredRecordsJob = new CronJob(
        "0,15,30,45 * * * *",
        () => deleteExpiredRecords(),
        null
    );
    deleteUpExpiredRecordsJob.start();

    // at 00:00 on the first day of the month for every month
    const newSigningKeyJob = new CronJob(
        "0 0 1 1-12 *",
        () => createNewJwtSigningKey(),
        null
    );
    newSigningKeyJob.start();

    const removeMarkedForDelete = new CronJob(
        "0,15,30,45 * * * *",
        () => console.log("will remove marked for delete jobs"),
        null
    )
    removeMarkedForDelete.start();

}



async function deleteExpiredRecords() {
    console.log("will delete expired records");
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
        }
    }
    catch(err){
        // TODO 
        // LOG error
    }
    await schedulerDao.deleteSchedulerLock(schedulerLock.lockInstanceId);
}



async function createNewJwtSigningKey(){
    
    const tenant: Tenant = await tenantDao.getRootTenant();

    const schedulerLock: SchedulerLock = {
        lockExpiresAtMS: Date.now() + (1000 * 1800),
        lockInstanceId: randomUUID().toString(),
        lockName: CREATE_NEW_SIGNING_KEY_LOCK_NAME,
        lockStartTimeMS: Date.now()
    };

    await schedulerDao.createSchedulerLock(schedulerLock);
    const arr: Array<SchedulerLock> = await schedulerDao.getSchedulerLocksByName(CREATE_NEW_SIGNING_KEY_LOCK_NAME);
    if(arr.length === 0){
        return;
    }
    try{
        if(arr[0].lockInstanceId === schedulerLock.lockInstanceId){

            let keysArray: Array<SigningKey> = await signingKeysDao.getSigningKeys(tenant.tenantId);
            if(keysArray.length === 0){
                await createKey(tenant);
            }

            keysArray = keysArray.sort(
                (key1, key2) => key2.expiresAtMs - key1.expiresAtMs
            );

            // If the newest key is inactive, then create a new one
            if(keysArray[0].status === SIGNING_KEY_STATUS_REVOKED){
                await createKey(tenant);
            }
            // If the newest key was not created within the last 90 days, then create a new one
            if( (Date.now() - keysArray[0].createdAtMs) > (90 * 24 * 60 * 60 * 1000)){
                await createKey(tenant);
            }
            // If the newest key will expire in less than 31 days
            if( (keysArray[0].expiresAtMs - Date.now()) <= (31 * 24 * 60 * 60 * 1000) ){
                await createKey(tenant);
            }
        }
    }
    catch(err){
        // TODO
        // Log error message and send alert.
    }
    await schedulerDao.deleteSchedulerLock(schedulerLock.lockInstanceId);
}
    

async function createKey(tenant: Tenant){

    // Set for expiration after 120 days
    const expiresAtDate = new Date();
    // 1000 ms/second * 60 seconds/min * 60 min/hr * 24 hr/day * 120 days
    expiresAtDate.setTime(expiresAtDate.getTime() + (120 * 24 * 60 * 60 * 1000) );
    
    const keyVersion = generateRandomToken(8, "hex").toUpperCase();
    const keyName = `${tenant.tenantName} JWT Signing Key V-${keyVersion}`;

    const signingKeyData = createJwtSigningKey(keyName, tenant.tenantName, expiresAtDate);
    console.log(signingKeyData.passphrase);
    console.log(signingKeyData.privateKey);
    console.log(signingKeyData.certificate);
    const key: SigningKey = {
        expiresAtMs: expiresAtDate.getTime(),
        keyId: randomUUID().toString(),
        keyName: keyName,
        keyType: KEY_TYPE_RSA,
        keyUse: KEY_USE_DIGITAL_SIGNING,
        markForDelete: false,
        privateKeyPkcs8: signingKeyData.privateKey,
        status: SIGNING_KEY_STATUS_ACTIVE,
        tenantId: tenant.tenantId,
        password: signingKeyData.passphrase,
        certificate: signingKeyData.certificate,
        createdAtMs: Date.now()
    };
    //await signingKeysDao.createSigningKey(key);            
}



