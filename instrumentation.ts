import { SchedulerLock, SigningKey, Tenant } from "./graphql/generated/graphql-types";
import SchedulerDao from "./lib/dao/scheduler-dao";
import SigningKeysDao from "./lib/dao/signing-keys-dao";
import TenantDao from "./lib/dao/tenant-dao";
import { DaoFactory } from "./lib/data-sources/dao-factory";
import Kms from "./lib/kms/kms";
import { CREATE_NEW_SIGNING_KEY_LOCK_NAME, KEY_TYPE_RSA, KEY_USE_DIGITAL_SIGNING, SIGNING_KEY_STATUS_ACTIVE } from "./utils/consts";
import { randomUUID } from 'crypto'; 
import { createJwtSigningKey } from "./utils/signing-key-utils";


const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const signingKeysDao: SigningKeysDao = DaoFactory.getInstance().getSigningKeysDao();
const schedulerDao: SchedulerDao = DaoFactory.getInstance().getSchedulerDao();
const kms: Kms = DaoFactory.getInstance().getKms();

// TODO
// Add cron scheduler from https://github.com/kelektiv/node-cron
// Schedule:
// 1.   Key creation every 3 months
// 2.   Expired data every 15 minutes (for those tables that have an expiration data timestamp)

export function register(){
    setInterval(() => 
        {
            console.log("Runtime is: " + process.env.NEXT_RUNTIME);
            console.log(new Date().toISOString());
            if(process.env.NEXT_RUNTIME === "nodejs"){
                doKeyCreation();
            }
        }, 
        10000
    ) ;
}

async function doKeyCreation(){
    
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
    if(arr[0].lockInstanceId === schedulerLock.lockInstanceId){
        // Set for expiration after 120 days
        const expiresAtDate = new Date();
        // 1000 ms/second * 60 seconds/min * 60 min/hr * 24 hr/day * 120 days
        expiresAtDate.setTime(expiresAtDate.getTime() + 1000 * 60 * 60 * 24 * 120);
        
        const signingKeyData = createJwtSigningKey(tenant.tenantName, expiresAtDate);
        console.log(signingKeyData.passphrase);
        console.log(signingKeyData.privateKey);
        console.log(signingKeyData.certificate);
        const key: SigningKey = {
            expiresAtMs: expiresAtDate.getTime(),
            keyId: randomUUID().toString(),
            keyName: `${tenant.tenantName} JWT Signing Key`,
            keyType: KEY_TYPE_RSA,
            keyUse: KEY_USE_DIGITAL_SIGNING,
            markForDelete: false,
            privateKeyPkcs8: signingKeyData.privateKey,
            status: SIGNING_KEY_STATUS_ACTIVE,
            tenantId: tenant.tenantId,
            password: signingKeyData.passphrase,
            certificate: signingKeyData.certificate
        };
        //await signingKeysDao.createSigningKey(key);
    }
    await schedulerDao.deleteSchedulerLock(schedulerLock.lockInstanceId);
    
}

