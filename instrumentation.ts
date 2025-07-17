import SigningKeysDao from "./lib/dao/signing-keys-dao";
import TenantDao from "./lib/dao/tenant-dao";
import { DaoFactory } from "./lib/data-sources/dao-factory";


const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const signingKeysDao: SigningKeysDao = DaoFactory.getInstance().getSigningKeysDao();


export function register(){
    setInterval(() => console.log(new Date().toISOString()), 2000) ;
}

