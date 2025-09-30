import { TenantAnonymousUserConfiguration, TenantLoginFailurePolicy, Tenant, TenantLegacyUserMigrationConfig, TenantLookAndFeel, TenantManagementDomainRel, TenantPasswordConfig, TenantRestrictedAuthenticationDomainRel, CaptchaConfig, SystemSettings, SystemCategory } from "@/graphql/generated/graphql-types";
import { DEFAULT_HTTP_TIMEOUT_MS } from "@/utils/consts";
import NodeCache from "node-cache";

abstract class TenantDao {

    rootTenantCache = new NodeCache({
        stdTTL: 900, // 15 minutes
        useClones: false,
        checkperiod: 1800, 
    });

    public getRootTenantFromCache(): Tenant | null {
        if(this.rootTenantCache.has("root_tenant")){
            return this.rootTenantCache.get("root_tenant") as Tenant;
        }
        else {
            return null;
        }
    }

    public setRootTenantOnCache(tenant: Tenant){
        this.rootTenantCache.set("root_tenant", tenant);
    }

    /**
     * This should throw an error if the root tenant is not found. For system initialization,
     * where there is no root tenant, this will be handled in a try/catch block.
     * 
     */
    abstract getRootTenant(): Promise<Tenant | null>;

    abstract createRootTenant(tenant: Tenant): Promise<Tenant>;

    abstract updateRootTenant(tenant: Tenant): Promise<Tenant>;

    abstract getTenants(tenantIds: Array<string>): Promise<Array<Tenant>>;
 
    abstract getTenantById(tenantId: string): Promise<Tenant | null>;

    abstract getTenantLookAndFeel(tenantId: string): Promise<TenantLookAndFeel | null>;

    abstract createTenant(tenant: Tenant): Promise<Tenant | null>;

    abstract updateTenant(tenant: Tenant): Promise<Tenant>;

    abstract deleteTenant(tenantId: string): Promise<void>;

    abstract getDomainTenantManagementRels(tenantId?: string, domain?: string): Promise<Array<TenantManagementDomainRel>>;

    abstract addDomainToTenantManagement(tenantId: string, domain: string): Promise<TenantManagementDomainRel | null>;

    abstract removeDomainFromTenantManagement(tenantId: string, domain: string): Promise<TenantManagementDomainRel | null>;

    abstract getAnonymousUserConfiguration(tenantId: string): Promise<TenantAnonymousUserConfiguration | null>;

    abstract createAnonymousUserConfiguration(anonymousUserConfiguration: TenantAnonymousUserConfiguration): Promise<TenantAnonymousUserConfiguration>;

    abstract updateAnonymousUserConfiguration(anonymousUserConfiguration: TenantAnonymousUserConfiguration): Promise<TenantAnonymousUserConfiguration>;

    abstract deleteAnonymousUserConfiguration(tenantId: string): Promise<void>;

    abstract createTenantLookAndFeel(tenantLookAndFeel: TenantLookAndFeel): Promise<TenantLookAndFeel>;

    abstract updateTenantLookAndFeel(tenantLookAndFeel: TenantLookAndFeel): Promise<TenantLookAndFeel>;

    abstract deleteTenantLookAndFeel(tenantId: string): Promise<void>;

    abstract assignPasswordConfigToTenant(tenantPasswordConfig: TenantPasswordConfig): Promise<TenantPasswordConfig>;

    abstract updatePasswordConfig(tenantPasswordConfig: TenantPasswordConfig): Promise<TenantPasswordConfig>;

    abstract getTenantPasswordConfig(tenantId: string): Promise<TenantPasswordConfig | null>;

    abstract removePasswordConfigFromTenant(tenantId: string): Promise<void>;

    abstract getLoginFailurePolicy(tenantId: string): Promise<TenantLoginFailurePolicy | null>;

    abstract createLoginFailurePolicy(loginFailurePolicy: TenantLoginFailurePolicy): Promise<TenantLoginFailurePolicy>;

    abstract updateLoginFailurePolicy(loginFailurePolicy: TenantLoginFailurePolicy): Promise<TenantLoginFailurePolicy>;

    abstract removeLoginFailurePolicy(tenantId: string): Promise<void>;

    abstract getLegacyUserMigrationConfiguration(tenantId: string): Promise<TenantLegacyUserMigrationConfig | null>;

    abstract createTenantLegacyUserMigrationConfiguration(tenantLegacyUserMigrationConfig: TenantLegacyUserMigrationConfig): Promise<TenantLegacyUserMigrationConfig | null>;

    abstract updateTenantLegacyUserMigrationConfiguration(tenantLegacyUserMigrationConfig: TenantLegacyUserMigrationConfig): Promise<TenantLegacyUserMigrationConfig | null>;

    abstract removeLegacyUserMigrationConfiguration(tenantId: string): Promise<void>;

    abstract getDomainsForTenantRestrictedAuthentication(tenantId: string): Promise<Array<TenantRestrictedAuthenticationDomainRel>>;

    abstract addDomainToTenantRestrictedAuthentication(tenantId: string, domain: string): Promise<TenantRestrictedAuthenticationDomainRel>;

    abstract removeDomainFromTenantRestrictedAuthentication(tenantId: string, domain: string): Promise<void>;

    abstract removeAllUsersFromTenant(tenantId: string): Promise<void>;

    abstract removeAllAuthStateFromTenant(tenantId: string): Promise<void>;

    abstract getCaptchaConfig(): Promise<CaptchaConfig | null>;

    abstract setCaptchaConfig(captchaConfig: CaptchaConfig): Promise<CaptchaConfig>;

    abstract removeCaptchaConfig(): Promise<void>;

    abstract getSystemSettings(): Promise<SystemSettings>;

    abstract updateSystemSettings(systemSettings: SystemSettings): Promise<SystemSettings>;

    public getEnvironmentSystemSettings(): Array<SystemCategory> {

        const systemCategories: Array<SystemCategory> = [];

        // KMS Settings
        const kmsCategory: SystemCategory = {
            categoryEntries: [],
            categoryName: "Key Management Settings"
        }
        const {KMS_STRATEGY, FS_BASED_DATA_DIR} = process.env;
        if(KMS_STRATEGY === "filesystem"){
            kmsCategory.categoryEntries.push({
                categoryKey: "KMS Provider",
                categoryValue: "Filesystem"
            });
            kmsCategory.categoryEntries.push({
                categoryKey: "Keys data directory",
                categoryValue: FS_BASED_DATA_DIR || ""
            });
        }
        systemCategories.push(kmsCategory);

        // MFA settings
        const mfaSettings: SystemCategory = {
            categoryEntries: [],
            categoryName: "MFA Settings"
        }
        const {MFA_ISSUER, MFA_ORIGIN, MFA_ID} = process.env;
        mfaSettings.categoryEntries.push({
            categoryKey: "MFA Issuer",
            categoryValue: MFA_ISSUER || ""
        });
        mfaSettings.categoryEntries.push({
            categoryKey: "MFA Origin",
            categoryValue: MFA_ORIGIN || ""
        });
        mfaSettings.categoryEntries.push({
            categoryKey: "MFA ID",
            categoryValue: MFA_ID || ""
        });
        systemCategories.push(mfaSettings);

        // Search settings
        const searchSettings: SystemCategory = {
            categoryEntries: [],
            categoryName: "Search Engine Settings"
        }
        const {OPENSEARCH_HOST, OPENSEARCH_PORT, TRUST_STORE_PATH} = process.env;
        searchSettings.categoryEntries.push({
            categoryKey: "Opensearch Host",
            categoryValue: OPENSEARCH_HOST || ""
        });
        searchSettings.categoryEntries.push({
            categoryKey: "Opensearch Port",
            categoryValue: OPENSEARCH_PORT || ""
        });
        searchSettings.categoryEntries.push({
            categoryKey: "Opensearch Truststore Path",
            categoryValue: TRUST_STORE_PATH || ""
        });
        systemCategories.push(searchSettings);

        
        // Auth domain settings 
        const authDomainCategory: SystemCategory = {
            categoryEntries: [],
            categoryName: "Portal Authorization Settings"
        }
        const {PORTAL_AUTH_TOKEN_TTL_HOURS, AUTH_DOMAIN, SECURITY_EVENT_CALLBACK_URI} = process.env;
        authDomainCategory.categoryEntries.push({
            categoryKey: "Authorization Domain",
            categoryValue: AUTH_DOMAIN || ""
        });
        authDomainCategory.categoryEntries.push({
            categoryKey: "Token TTL in Hours",
            categoryValue: PORTAL_AUTH_TOKEN_TTL_HOURS || ""
        });
        authDomainCategory.categoryEntries.push({
            categoryKey: "Security Event Webhook URI",
            categoryValue: SECURITY_EVENT_CALLBACK_URI || ""
        });
        systemCategories.push(authDomainCategory);

        // GraphQL Settings
        const graphqlSettingCategory: SystemCategory = {
            categoryEntries: [],
            categoryName: "GraphQL Settings"
        };
        const {ALLOW_GRAPHQL_INTROSPECTION, ALLOW_GRAPHQL_ERROR_STACK_TRACES} = process.env;
        graphqlSettingCategory.categoryEntries.push({
            categoryKey: "Allow GraphQL Introspection",
            categoryValue: ALLOW_GRAPHQL_INTROSPECTION || "false"
        });
        graphqlSettingCategory.categoryEntries.push({
            categoryKey: "Allow GraphQL Error Stack Traces",
            categoryValue: ALLOW_GRAPHQL_ERROR_STACK_TRACES || "false"
        });
        systemCategories.push(graphqlSettingCategory);

        // Logging Settings
        const loggingSettingsCategory: SystemCategory = {
            categoryEntries: [],
            categoryName: "Logging Settings"
        };
        const {LOG_FILE_DIRECTORY, LOG_TO_STD_OUT, LOG_LEVEL} = process.env;
        loggingSettingsCategory.categoryEntries.push({
            categoryKey: "Log file directory",
            categoryValue: LOG_FILE_DIRECTORY || "Not Configured"
        });
        loggingSettingsCategory.categoryEntries.push({
            categoryKey: "Log to STDOUT",
            categoryValue: LOG_TO_STD_OUT || "false"
        });
        loggingSettingsCategory.categoryEntries.push({
            categoryKey: "Log level",
            categoryValue: LOG_LEVEL || "Not Configured"
        });
        systemCategories.push(loggingSettingsCategory);

        // HTTP Client Settings
        const httpClientSettingsCategory: SystemCategory = {
            categoryEntries: [],
            categoryName: "HTTP Client Settings"
        };
        const {
            HTTP_TIMEOUT_MS, MTLS_USE_PKI_IDENTITY, MTLS_PKI_IDENTITY_PRIVATE_KEY_FILE, MTLS_PKI_IDENTITY_CERTIFICATE_FILE, 
            MTLS_PKI_IDENTITY_TRUST_STORE_FILE, HTTP_CLIENT_USE_PROXY, HTTP_PROXY_PROTOCOL, HTTP_PROXY_HOST, 
            HTTP_PROXY_PORT, HTTP_PROXY_USE_AUTHENTICATION 
        } = process.env;
        httpClientSettingsCategory.categoryEntries.push({
            categoryKey: "Request Timeout (milliseconds)",
            categoryValue: HTTP_TIMEOUT_MS || DEFAULT_HTTP_TIMEOUT_MS.toString()
        });
        httpClientSettingsCategory.categoryEntries.push({
            categoryKey: "Use mTLS",
            categoryValue: MTLS_USE_PKI_IDENTITY || "false"
        });
        httpClientSettingsCategory.categoryEntries.push({
            categoryKey: "Private Key File",
            categoryValue: MTLS_PKI_IDENTITY_PRIVATE_KEY_FILE || "Not Configured"
        });
        httpClientSettingsCategory.categoryEntries.push({
            categoryKey: "Certificate File",
            categoryValue: MTLS_PKI_IDENTITY_CERTIFICATE_FILE || "Not Configured"
        });
        httpClientSettingsCategory.categoryEntries.push({
            categoryKey: "Trust Store File",
            categoryValue: MTLS_PKI_IDENTITY_TRUST_STORE_FILE || "Not Configured"
        });
        httpClientSettingsCategory.categoryEntries.push({
            categoryKey: "Use Proxy",
            categoryValue: HTTP_CLIENT_USE_PROXY || "false"
        });
        httpClientSettingsCategory.categoryEntries.push({
            categoryKey: "Proxy Protocol",
            categoryValue: HTTP_PROXY_PROTOCOL || "Not Configured"
        });
        httpClientSettingsCategory.categoryEntries.push({
            categoryKey: "Proxy Host",
            categoryValue: HTTP_PROXY_HOST || "Not Configured"
        });
        httpClientSettingsCategory.categoryEntries.push({
            categoryKey: "Proxy Port",
            categoryValue: HTTP_PROXY_PORT || "Not Configured"
        });
        httpClientSettingsCategory.categoryEntries.push({
            categoryKey: "Use Proxy Authentication",
            categoryValue: HTTP_PROXY_USE_AUTHENTICATION || "false"
        });        
        systemCategories.push(httpClientSettingsCategory);
        return systemCategories;
    }

}

export default TenantDao;