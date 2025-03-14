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

class DaoImpl {

    private static instance: DaoImpl;
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

    public static getInstance(): DaoImpl {        
        if(!DaoImpl.instance){
            DaoImpl.instance = new DaoImpl();
        }
        return DaoImpl.instance;
    }
    
    public getTenantDao(): TenantDao {
        if(DaoImpl.instance.tenantDao){
            return DaoImpl.instance.tenantDao;
        }
        if(daoStrategy === "postgresql" || daoStrategy === "mysql" || daoStrategy === "mssql"){
            DaoImpl.instance.tenantDao = new DBTenantDao();
            return DaoImpl.instance.tenantDao;
        }
        else{
            throw new Error("DAO strategy not defined.");
        }
    }

    public getClientDao(): ClientDao {
        if(DaoImpl.instance.clientDao){
            return DaoImpl.instance.clientDao;
        }
        if(daoStrategy === "postgresql" || daoStrategy === "mysql" || daoStrategy === "mssql"){
            DaoImpl.instance.clientDao = new DBClientDao();
            return DaoImpl.instance.clientDao;
        }
        else{
            throw new Error("DAO strategy not defined.");
        }
    }

    public getSigningKeysDao(): SigningKeysDao {
        if(DaoImpl.instance.signingKeysDao){
            return DaoImpl.instance.signingKeysDao;
        }
        if(daoStrategy === "postgresql" || daoStrategy === "mysql" || daoStrategy === "mssql"){
            DaoImpl.instance.signingKeysDao = new DBSigningKeysDao();
            return DaoImpl.instance.signingKeysDao;
        }
        else{
            throw new Error("DAO strategy not defined.");
        }
    }

    public getRateLimitDao(): RateLimitDao {
        if(DaoImpl.instance.rateLimitDao){
            return DaoImpl.instance.rateLimitDao;
        }
    
        if(daoStrategy === "postgresql" || daoStrategy === "mysql" || daoStrategy === "mssql"){
            DaoImpl.instance.rateLimitDao = new DBRateLimitDao();
            return DaoImpl.instance.rateLimitDao
        }
        else{
            throw new Error("DAO strategy not defined.");
        }
    }

    public getScopeDao(): ScopeDao {
        if(DaoImpl.instance.scopeDao){
            return DaoImpl.instance.scopeDao;
        }
        if(daoStrategy === "postgresql" || daoStrategy === "mysql" || daoStrategy === "mssql"){
            DaoImpl.instance.scopeDao = new DBScopeDao();
            return DaoImpl.instance.scopeDao; 
        }
        else{
            throw new Error("DAO strategy not defined.");
        }  
    }

    public getAuthenticationGroupDao(): AuthenticationGroupDao {
        if(DaoImpl.instance.authenticationGroupDao){
            return DaoImpl.instance.authenticationGroupDao;
        }
        if(daoStrategy === "postgresql" || daoStrategy === "mysql" || daoStrategy === "mssql"){
            DaoImpl.instance.authenticationGroupDao = new DBAuthenticationGroupDao();
            return DaoImpl.instance.authenticationGroupDao;
        }
        else{
            throw new Error("DAO strategy not defined.");
        }
    }

    public getAuthorizationGroupDao(): AuthorizationGroupDao {
        if(DaoImpl.instance.authorizationGroupDao){
            return DaoImpl.instance.authorizationGroupDao;
        }
        if(daoStrategy === "postgresql" || daoStrategy === "mysql" || daoStrategy === "mssql"){
            DaoImpl.instance.authorizationGroupDao = new DBAuthorizationGroupDao();
            return DaoImpl.instance.authorizationGroupDao; 
        }
        else{
            throw new Error("DAO strategy not defined.");
        }
    }

    public getFederatedOIDCProvicerDao(): FederatedOIDCProviderDao {
        if(DaoImpl.instance.federatedOIDCProviderDao){
            return DaoImpl.instance.federatedOIDCProviderDao;
        }
        if(daoStrategy === "postgresql" || daoStrategy === "mysql" || daoStrategy === "mssql"){
            DaoImpl.instance.federatedOIDCProviderDao = new DBFederatedOIDCProviderDao();
            return DaoImpl.instance.federatedOIDCProviderDao;
        }
        else{
            throw new Error("DAO strategy not defined.");
        }
    }

    public getAuthDao(): AuthDao {
        if(DaoImpl.instance.authDao){
            return DaoImpl.instance.authDao;
        }
        if(daoStrategy === "postgresql" || daoStrategy === "mysql" || daoStrategy === "mssql"){
            DaoImpl.instance.authDao = new DBAuthDao();
            return DaoImpl.instance.authDao;
        }
        else{
            throw new Error("DAO strategy not defined.");
        }
    }

    public getIdentityDao(): IdentityDao {
        if(DaoImpl.instance.identityDao){
            return DaoImpl.instance.identityDao;
        }
        if(daoStrategy === "postgresql" || daoStrategy === "mysql" || daoStrategy === "mssql"){
            DaoImpl.instance.identityDao = new DBIdentityDao();
            return DaoImpl.instance.identityDao; 
        }
        else{
            throw new Error("DAO strategy not defined.");
        }
    }

    public getAccessRuleDao(): AccessRuleDao {
        if(DaoImpl.instance.accessRuleDao){
            return DaoImpl.instance.accessRuleDao;
        }
        if(daoStrategy === "postgresql" || daoStrategy === "mysql" || daoStrategy === "mssql"){
            DaoImpl.instance.accessRuleDao = new DBAccessRuleDao();
            return DaoImpl.instance.accessRuleDao; 
        }
        else{
            throw new Error("DAO strategy not defined.");
        }
    }

    public getContactDao(): ContactDao {
        if(DaoImpl.instance.contactDao){
            return DaoImpl.instance.contactDao;
        }
        if(daoStrategy === "postgresql" || daoStrategy === "mysql" || daoStrategy === "mssql"){
            DaoImpl.instance.contactDao = new DBContactDao();
            return DaoImpl.instance.contactDao; 
        }
        else{
            throw new Error("DAO strategy not defined.");
        }
    }

}

export { DaoImpl }