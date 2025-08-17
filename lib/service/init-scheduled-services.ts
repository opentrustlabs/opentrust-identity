import { AutoCreateSigningKeyInput, SchedulerLock, SigningKey, Tenant } from "@/graphql/generated/graphql-types";
import SchedulerDao from "@/lib/dao/scheduler-dao";
import SigningKeysDao from "@/lib/dao/signing-keys-dao";
import TenantDao from "@/lib/dao/tenant-dao";
import { DaoFactory } from "@/lib/data-sources/dao-factory";
import { CREATE_NEW_SIGNING_KEY_LOCK_NAME, KEY_TYPE_RSA, KEY_USE_JWT_SIGNING, SIGNING_KEY_STATUS_REVOKED } from "@/utils/consts";
import { randomUUID } from 'crypto'; 
import { generateRandomToken } from "@/utils/dao-utils";
import { CronJob } from "cron";
import DeletionService from "./deletion-service";
import SigningKeysService from "./keys-service";
import { logWithDetails } from "../logging/logger";


const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const signingKeysDao: SigningKeysDao = DaoFactory.getInstance().getSigningKeysDao();
const schedulerDao: SchedulerDao = DaoFactory.getInstance().getSchedulerDao();

export function initSchedulers(){

    // every 15 minutes at 0, 15, 30, and 45 minutes past the hour
    const deleteExpiredRecordsJob = new CronJob(
        "0,5,10,15,20,25,30,35,40,45,50,55 * * * *",
        () => {            
            const service: DeletionService = new DeletionService();
            service.deleteExpiredRecords()
        },
        null
    );
    deleteExpiredRecordsJob.start();

    // at 00:00 on the first day of the month for every month
    const newSigningKeyJob = new CronJob(
        "0 0 1 1-12 *",
        () => createNewJwtSigningKey(),
        null
    );
    newSigningKeyJob.start();

    const removeMarkedForDeleteRecordsJob = new CronJob(
        "0,5,10,15,20,25,30,35,40,45,50,55 * * * *",
        () => {
            const service: DeletionService = new DeletionService();
            service.deleteMarkForDeleteRecords();
        },
        null
    )
    removeMarkedForDeleteRecordsJob.start();

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
            // Filter out the non-jwt signing keys and sort by expires date descending
            keysArray = keysArray
            .filter(
                (k: SigningKey) => k.keyType === KEY_USE_JWT_SIGNING
            )
            .sort(
                (key1, key2) => key2.expiresAtMs - key1.expiresAtMs
            );

            let shouldCreateKey: boolean = false;
            if(keysArray.length === 0){
                shouldCreateKey = true;
            }
            // If the newest key is inactive, then create a new one
            else if(keysArray[0].status === SIGNING_KEY_STATUS_REVOKED){
                shouldCreateKey = true;
            }
            // If the newest key was not created within the last 90 days, then create a new one
            else if( (Date.now() - keysArray[0].createdAtMs) > (90 * 24 * 60 * 60 * 1000)){
                shouldCreateKey = true;
            }
            // If the newest key will expire in less than 31 days
            else if( (keysArray[0].expiresAtMs - Date.now()) <= (31 * 24 * 60 * 60 * 1000) ){
                shouldCreateKey = true;
            }

            if(shouldCreateKey){
                await createKey(tenant);
            }
        }
    }
    catch(err: any){
        logWithDetails("error", `Error creating new JWT signing key. ${err.message}.`, {...err});
    }
    await schedulerDao.deleteSchedulerLock(schedulerLock.lockInstanceId);
}
    

async function createKey(tenant: Tenant){

    const keyVersion = generateRandomToken(8, "hex").toUpperCase();
    const keyName = `${tenant.tenantName} JWT Signing Key V-${keyVersion}`;

    // Set for expiration after 120 days
    const keyInput: AutoCreateSigningKeyInput = {
        commonName: keyName,
        expiresAtMs: Date.now() + (120 * 24 * 60 * 60 * 1000), // 1000 ms/second * 60 seconds/min * 60 min/hr * 24 hr/day * 120 days
        keyName: keyName,
        keyType: KEY_TYPE_RSA,
        keyUse: KEY_USE_JWT_SIGNING,
        organizationName: tenant.tenantName,
        tenantId: tenant.tenantId
    };

    const keyService: SigningKeysService = new SigningKeysService({
        authToken: "",
        geoLocation: "",
        ipAddress: "",
        portalUserProfile: null,
        requestCache: new Map(),
        rootTenant: tenant,
        deviceFingerPrint: null
    });
    
    await keyService.uncheckedAutoCreateSigningKey(keyInput);    
    
}



