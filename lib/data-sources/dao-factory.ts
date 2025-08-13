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
import Kms from "../kms/kms";
import FSBasedKms from "../kms/fs-based-kms";
import MarkForDeleteDao from "../dao/mark-for-delete-dao";
import DBMarkForDeleteDao from "../dao/impl/db/db-mark-for-delete-dao";
import I18NDao from "../dao/i18n-dao";
import DBI18NDao from "../dao/impl/db/db-i18n-dao";
import SchedulerDao from "../dao/scheduler-dao";
import DBSchedulerDao from "../dao/impl/db/db-scheduler-dao";
import NoOpKms from "../kms/no-op-kms";
import SecretShareDao from "../dao/secret-share-dao";
import DBSecretShareDao from "../dao/impl/db/db-secret-share-dao";

const daoStrategy = process.env.DAO_STRATEGY;
const ksmStrategy = process.env.KMS_STRATEGY;

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
    protected markForDeleteDao: MarkForDeleteDao;
    protected i18nDao: I18NDao;
    protected kms: Kms;
    protected schedulerDao: SchedulerDao;
    protected secretShareDao: SecretShareDao;

    private constructor() {
        // NO-OP
    }

    public static getInstance(): DaoFactory {        
        if(!DaoFactory.instance){
            DaoFactory.instance = new DaoFactory();
        }
        return DaoFactory.instance;
    }

    public getSchedulerDao(): SchedulerDao {
        if(DaoFactory.instance.schedulerDao){
            return DaoFactory.instance.schedulerDao;
        }
        if(daoStrategy === "rdb"){
            DaoFactory.instance.schedulerDao = new DBSchedulerDao();
            return DaoFactory.instance.schedulerDao;
        }
        else{
            throw new Error("ERROR_DAO_STRATEGY_NOT_DEFINED");
        }
    }

    public getKms(): Kms {
        if(DaoFactory.instance.kms){
            return DaoFactory.instance.kms;
        }
        if(ksmStrategy === "filesystem"){
            DaoFactory.instance.kms = new FSBasedKms();
            return DaoFactory.instance.kms;
        }
        else {
            throw new Error("ERROR_KMS_STRATEGY_NOT_IMPLEMENTED");
        }
    }
    
    public getTenantDao(): TenantDao {
        if(DaoFactory.instance.tenantDao){
            return DaoFactory.instance.tenantDao;
        }
        if(daoStrategy === "rdb"){
            DaoFactory.instance.tenantDao = new DBTenantDao();
            return DaoFactory.instance.tenantDao;
        }
        else{
            throw new Error("ERROR_DAO_STRATEGY_NOT_DEFINED");
        }
    }

    public getMarkForDeleteDao(): MarkForDeleteDao {
        if(DaoFactory.instance.markForDeleteDao){
            return DaoFactory.instance.markForDeleteDao;
        }
        if(daoStrategy === "rdb"){
            DaoFactory.instance.markForDeleteDao = new DBMarkForDeleteDao();
            return DaoFactory.instance.markForDeleteDao;
        }
        else{
            throw new Error("ERROR_DAO_STRATEGY_NOT_DEFINED");
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
            throw new Error("ERROR_DAO_STRATEGY_NOT_DEFINED");
        }
    }

    public getSigningKeysDao(): SigningKeysDao {
        if(DaoFactory.instance.signingKeysDao){
            return DaoFactory.instance.signingKeysDao;
        }
        if(daoStrategy === "rdb"){
            DaoFactory.instance.signingKeysDao = new DBSigningKeysDao();
            return DaoFactory.instance.signingKeysDao;
        }
        else{
            throw new Error("ERROR_DAO_STRATEGY_NOT_DEFINED");
        }
    }

    public getRateLimitDao(): RateLimitDao {
        if(DaoFactory.instance.rateLimitDao){
            return DaoFactory.instance.rateLimitDao;
        }
    
        if(daoStrategy === "rdb"){
            DaoFactory.instance.rateLimitDao = new DBRateLimitDao();
            return DaoFactory.instance.rateLimitDao
        }
        else{
            throw new Error("ERROR_DAO_STRATEGY_NOT_DEFINED");
        }
    }

    public getScopeDao(): ScopeDao {
        if(DaoFactory.instance.scopeDao){
            return DaoFactory.instance.scopeDao;
        }
        if(daoStrategy === "rdb"){
            DaoFactory.instance.scopeDao = new DBScopeDao();
            return DaoFactory.instance.scopeDao; 
        }
        else{
            throw new Error("ERROR_DAO_STRATEGY_NOT_DEFINED");
        }  
    }

    public getAuthenticationGroupDao(): AuthenticationGroupDao {
        if(DaoFactory.instance.authenticationGroupDao){
            return DaoFactory.instance.authenticationGroupDao;
        }
        if(daoStrategy === "rdb"){
            DaoFactory.instance.authenticationGroupDao = new DBAuthenticationGroupDao();
            return DaoFactory.instance.authenticationGroupDao;
        }
        else{
            throw new Error("ERROR_DAO_STRATEGY_NOT_DEFINED");
        }
    }

    public getAuthorizationGroupDao(): AuthorizationGroupDao {
        if(DaoFactory.instance.authorizationGroupDao){
            return DaoFactory.instance.authorizationGroupDao;
        }
        if(daoStrategy === "rdb"){
            DaoFactory.instance.authorizationGroupDao = new DBAuthorizationGroupDao();
            return DaoFactory.instance.authorizationGroupDao; 
        }
        else{
            throw new Error("ERROR_DAO_STRATEGY_NOT_DEFINED");
        }
    }

    public getFederatedOIDCProvicerDao(): FederatedOIDCProviderDao {
        if(DaoFactory.instance.federatedOIDCProviderDao){
            return DaoFactory.instance.federatedOIDCProviderDao;
        }
        if(daoStrategy === "rdb"){
            DaoFactory.instance.federatedOIDCProviderDao = new DBFederatedOIDCProviderDao();
            return DaoFactory.instance.federatedOIDCProviderDao;
        }
        else{
            throw new Error("ERROR_DAO_STRATEGY_NOT_DEFINED");
        }
    }

    public getAuthDao(): AuthDao {
        if(DaoFactory.instance.authDao){
            return DaoFactory.instance.authDao;
        }
        if(daoStrategy === "rdb"){
            DaoFactory.instance.authDao = new DBAuthDao();
            return DaoFactory.instance.authDao;
        }
        else{
            throw new Error("ERROR_DAO_STRATEGY_NOT_DEFINED");
        }
    }

    public getIdentityDao(): IdentityDao {
        if(DaoFactory.instance.identityDao){
            return DaoFactory.instance.identityDao;
        }
        if(daoStrategy === "rdb"){
            DaoFactory.instance.identityDao = new DBIdentityDao();
            return DaoFactory.instance.identityDao; 
        }
        else{
            throw new Error("ERROR_DAO_STRATEGY_NOT_DEFINED");
        }
    }

    public getAccessRuleDao(): AccessRuleDao {
        if(DaoFactory.instance.accessRuleDao){
            return DaoFactory.instance.accessRuleDao;
        }
        if(daoStrategy === "rdb"){
            DaoFactory.instance.accessRuleDao = new DBAccessRuleDao();
            return DaoFactory.instance.accessRuleDao; 
        }
        else{
            throw new Error("ERROR_DAO_STRATEGY_NOT_DEFINED");
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
            throw new Error("ERROR_DAO_STRATEGY_NOT_DEFINED");
        }
    }

    public getI18NDao(): I18NDao {
        if(DaoFactory.instance.i18nDao){
            return DaoFactory.instance.i18nDao;
        }
        if(daoStrategy=== "rdb"){
            DaoFactory.instance.i18nDao = new DBI18NDao();
            return DaoFactory.instance.i18nDao; 
        }
        else{
            throw new Error("ERROR_DAO_STRATEGY_NOT_DEFINED");
        }
    }

    public getSecretShareDao(): SecretShareDao {
        if(DaoFactory.instance.secretShareDao){
            return DaoFactory.instance.secretShareDao;
        }
        if(daoStrategy=== "rdb"){
            DaoFactory.instance.secretShareDao = new DBSecretShareDao();
            return DaoFactory.instance.secretShareDao;
        }
        else {
            throw new Error("ERROR_KMS_STRATEGY_NOT_IMPLEMENTED");
        }
    }

}

export { DaoFactory }