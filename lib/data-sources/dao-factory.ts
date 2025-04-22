import AccessRuleDao from "../dao/access-rule-dao";
import AuthDao from "../dao/auth-dao";
import AuthenticationGroupDao from "../dao/authentication-group-dao";
import AuthorizationGroupDao from "../dao/authorization-group-dao";
import ClientDao from "../dao/client-dao";
import ContactDao from "../dao/contact-dao";
import FederatedOIDCProviderDao from "../dao/federated-oidc-provider-dao";
import IdentityDao from "../dao/identity-dao";
import RateLimitDao from "../dao/rate-limit-dao";
import ScopeDao from "../dao/scope-dao";
import SigningKeysDao from "../dao/signing-keys-dao";
import TenantDao from "../dao/tenant-dao";
import DBTenantDao from "@/lib/dao/impl/db/db-tenant-dao";
import DBFederatedOIDCProviderDao from "@/lib/dao/impl/db/db-federated-oidc-provider-dao";
import DBClientDao from "@/lib/dao/impl/db/db-client-dao";
import DBSigningKeysDao from "@/lib/dao/impl/db/db-signing-keys-dao";
import DBAuthenticationGroupDao from "@/lib/dao/impl/db/db-authentication-group-dao";
import DBAuthDao from "@/lib/dao/impl/db/db-auth-dao";
import DBRateLimitDao from "@/lib/dao/impl/db/db-rate-limit-dao";
import DBScopeDao from "@/lib/dao/impl/db/db-scope-dao";
import DBAuthorizationGroupDao from "@/lib/dao/impl/db/db-authorization-group-dao";
import DBAccessRuleDao from "@/lib/dao/impl/db/db-access-rule-dao";
import DBIdentityDao from "@/lib/dao/impl/db/db-identity-dao";
import DBContactDao from "@/lib/dao/impl/db/db-contact-dao";

const daoStrategy = process.env.DAO_STRATEGY

class DaoFactory {

    private static instance: DaoFactory;
    protected tenantDao: TenantDao;
    protected clientDao: ClientDao;
    protected signingKeysDao: SigningKeysDao;
    protected rateLimitDao: RateLimitDao;
    protected scopeDao: ScopeDao;
    protected authenticationGroupDao: AuthenticationGroupDao;
    protected authorizationGroupDao: AuthorizationGroupDao;
    protected federatedOIDCProviderDao: FederatedOIDCProviderDao;
    protected authDao: AuthDao;
    protected identityDao: IdentityDao;
    protected accessRuleDao: AccessRuleDao;
    protected contactDao: ContactDao;

    private constructor() {
        // NO-OP
    }

    public static getInstance(): DaoFactory {        
        if(!DaoFactory.instance){
            DaoFactory.instance = new DaoFactory();
        }
        return DaoFactory.instance;
    }
    
    public getTenantDao(): TenantDao {
        if(DaoFactory.instance.tenantDao){
            return DaoFactory.instance.tenantDao;
        }
        if(daoStrategy=== "rdb"){
            DaoFactory.instance.tenantDao = new DBTenantDao();
            return DaoFactory.instance.tenantDao;
        }
        else{
            throw new Error("DAO strategy not defined.");
        }
    }

    public getClientDao(): ClientDao {
        if(DaoFactory.instance.clientDao){
            return DaoFactory.instance.clientDao;
        }
        if(daoStrategy=== "rdb"){
            DaoFactory.instance.clientDao = new DBClientDao();
            return DaoFactory.instance.clientDao;
        }
        else{
            throw new Error("DAO strategy not defined.");
        }
    }

    public getSigningKeysDao(): SigningKeysDao {
        if(DaoFactory.instance.signingKeysDao){
            return DaoFactory.instance.signingKeysDao;
        }
        if(daoStrategy=== "rdb"){
            DaoFactory.instance.signingKeysDao = new DBSigningKeysDao();
            return DaoFactory.instance.signingKeysDao;
        }
        else{
            throw new Error("DAO strategy not defined.");
        }
    }

    public getRateLimitDao(): RateLimitDao {
        if(DaoFactory.instance.rateLimitDao){
            return DaoFactory.instance.rateLimitDao;
        }
    
        if(daoStrategy=== "rdb"){
            DaoFactory.instance.rateLimitDao = new DBRateLimitDao();
            return DaoFactory.instance.rateLimitDao
        }
        else{
            throw new Error("DAO strategy not defined.");
        }
    }

    public getScopeDao(): ScopeDao {
        if(DaoFactory.instance.scopeDao){
            return DaoFactory.instance.scopeDao;
        }
        if(daoStrategy=== "rdb"){
            DaoFactory.instance.scopeDao = new DBScopeDao();
            return DaoFactory.instance.scopeDao; 
        }
        else{
            throw new Error("DAO strategy not defined.");
        }  
    }

    public getAuthenticationGroupDao(): AuthenticationGroupDao {
        if(DaoFactory.instance.authenticationGroupDao){
            return DaoFactory.instance.authenticationGroupDao;
        }
        if(daoStrategy=== "rdb"){
            DaoFactory.instance.authenticationGroupDao = new DBAuthenticationGroupDao();
            return DaoFactory.instance.authenticationGroupDao;
        }
        else{
            throw new Error("DAO strategy not defined.");
        }
    }

    public getAuthorizationGroupDao(): AuthorizationGroupDao {
        if(DaoFactory.instance.authorizationGroupDao){
            return DaoFactory.instance.authorizationGroupDao;
        }
        if(daoStrategy=== "rdb"){
            DaoFactory.instance.authorizationGroupDao = new DBAuthorizationGroupDao();
            return DaoFactory.instance.authorizationGroupDao; 
        }
        else{
            throw new Error("DAO strategy not defined.");
        }
    }

    public getFederatedOIDCProvicerDao(): FederatedOIDCProviderDao {
        if(DaoFactory.instance.federatedOIDCProviderDao){
            return DaoFactory.instance.federatedOIDCProviderDao;
        }
        if(daoStrategy=== "rdb"){
            DaoFactory.instance.federatedOIDCProviderDao = new DBFederatedOIDCProviderDao();
            return DaoFactory.instance.federatedOIDCProviderDao;
        }
        else{
            throw new Error("DAO strategy not defined.");
        }
    }

    public getAuthDao(): AuthDao {
        if(DaoFactory.instance.authDao){
            return DaoFactory.instance.authDao;
        }
        if(daoStrategy=== "rdb"){
            DaoFactory.instance.authDao = new DBAuthDao();
            return DaoFactory.instance.authDao;
        }
        else{
            throw new Error("DAO strategy not defined.");
        }
    }

    public getIdentityDao(): IdentityDao {
        if(DaoFactory.instance.identityDao){
            return DaoFactory.instance.identityDao;
        }
        if(daoStrategy=== "rdb"){
            DaoFactory.instance.identityDao = new DBIdentityDao();
            return DaoFactory.instance.identityDao; 
        }
        else{
            throw new Error("DAO strategy not defined.");
        }
    }

    public getAccessRuleDao(): AccessRuleDao {
        if(DaoFactory.instance.accessRuleDao){
            return DaoFactory.instance.accessRuleDao;
        }
        if(daoStrategy=== "rdb"){
            DaoFactory.instance.accessRuleDao = new DBAccessRuleDao();
            return DaoFactory.instance.accessRuleDao; 
        }
        else{
            throw new Error("DAO strategy not defined.");
        }
    }

    public getContactDao(): ContactDao {
        if(DaoFactory.instance.contactDao){
            return DaoFactory.instance.contactDao;
        }
        if(daoStrategy=== "rdb"){
            DaoFactory.instance.contactDao = new DBContactDao();
            return DaoFactory.instance.contactDao; 
        }
        else{
            throw new Error("DAO strategy not defined.");
        }
    }

}

export { DaoFactory }