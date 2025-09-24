
import cassandra from "cassandra-driver";
import { 
    TENANT_MODEL,
    ACCESS_RULE_MODEL,
    AUTHENTICATION_GROUP_CLIENT_REL_MODEL,
    AUTHENTICATION_GROUP_MODEL,
    AUTHENTICATION_GROUP_USER_REL_MODEL,
    AUTHORIZATION_CODE_DATA_MODEL,
    AUTHORIZATION_DEVICE_CODE_DATA_MODEL,
    AUTHORIZATION_GROUP_MODEL,
    AUTHORIZATION_GROUP_SCOPE_REL_MODEL,
    AUTHORIZATION_GROUP_USER_REL_MODEL,
    CAPTCHA_CONFIG_MODEL,
    CHANGE_EVENT_MODEL,
    CLIENT_AUTH_HISTORY_MODEL,
    CLIENT_MODEL,
    CLIENT_REDIRECT_URI_REL_MODEL,
    CLIENT_SCOPE_REL_MODEL,
    CONTACT_MODEL,
    DELETION_STATUS_MODEL,
    FEDERATED_AUTH_TEST_MODEL,
    FEDERATED_OIDC_AUTHORIZATION_REL_MODEL,
    FEDERATED_OIDC_PROVIDER_DOMAIN_REL_MODEL,
    FEDERATED_OIDC_PROVIDER_MODEL,
    FEDERATED_OIDC_PROVIDER_TENANT_REL_MODEL,
    MARK_FOR_DELETE_MODEL,
    PRE_AUTHENTICATION_STATE_MODEL,
    PROHIBITED_PASSWORD_MODEL,
    RATE_LIMIT_SERVICE_GROUP_MODEL,
    REFRESH_DATA_MODEL,
    SCHEDULER_LOCK_MODEL,
    SCOPE_MODEL,
    SECRET_SHARE_MODEL,
    SIGNING_KEY_MODEL,
    STATE_PROVINCE_REGION_MODEL,
    SYSTEM_SETTINGS_MODEL,
    TENANT_ANONYMOUS_USER_CONFIGURATION_MODEL,
    TENANT_AVAILABLE_SCOPE_MODEL,
    TENANT_LEGACY_USER_MIGRATION_CONFIG_MODEL,
    TENANT_LOGIN_FAILURE_POLICY_MODEL,
    TENANT_LOOK_AND_FEEL_MODEL,
    TENANT_MANAGEMENT_DOMAIN_REL_MODEL,
    TENANT_PASSWORD_CONFIG_MODEL,
    TENANT_RATE_LIMIT_REL_MODEL,
    TENANT_RESTRICTED_AUTHENTICATION_DOMAIN_REL_MODEL,
    USER_AUTHENTICATION_HISTORY_MODEL,
    USER_AUTHENTICATION_STATE_MODEL,
    USER_CREDENTIAL_MODEL,
    USER_DURESS_CREDENTIAL_MODEL,
    USER_EMAIL_RECOVERY_MODEL,
    USERS_MODEL,
    USERS_BY_PHONE_NUMBER_MODEL,
    USER_FAILED_LOGIN_MODEL,
    USER_FIDO2_CHALLENGE_MODEL,
    USER_FIDO2_COUNTER_REL_MODEL,
    USER_MFA_REL_MODEL,
    USER_PROFILE_EMAIL_CHANGE_STATE_MODEL,
    USER_REGISTRATION_STATE_MODEL,
    USER_SCOPE_REL_MODEL,
    USER_TENANT_REL_MODEL,
    USER_TERMS_AND_CONDITIONS_ACCEPTED_MODEL,
    USER_VERIFICATION_TOKEN_MODEL
} from "../cassandra-mappings/mappings";
import { logWithDetails } from "../logging/logger";


const {
    CASSANDRA_CONTACT_POINTS,
    CASSANDRA_KEY_SPACE,
    CASSANDRA_LOCAL_DATA_CENTER,
    CASSANDRA_USERNAME,
    CASSANDRA_PASSWORD
} = process.env;

declare global {
    // eslint-disable-next-line no-var
    var cassandraClient: cassandra.Client | undefined;
    var mapper:  cassandra.mapping.Mapper | undefined;
}


class CassandraDriver {

    private static instance: CassandraDriver;


    private constructor() {
        // NO-OP
    }

    public static getInstance(): CassandraDriver {
        if (!CassandraDriver.instance) {
            CassandraDriver.instance = new CassandraDriver();            
        }
        return CassandraDriver.instance;
    }

    public async getModelMapper(modelName: string): Promise<cassandra.mapping.ModelMapper> {
        const m: cassandra.mapping.Mapper = await CassandraDriver.getMapper();
        return m.forModel(modelName);
    }

    public static async getMapper(): Promise<cassandra.mapping.Mapper> {        
        if(!global.mapper){
            const client: cassandra.Client = await CassandraDriver.getClient();
            global.mapper = new cassandra.mapping.Mapper(
                client,
                {
                    models: {
                        ...TENANT_MODEL,
                        ...ACCESS_RULE_MODEL,
                        ...AUTHENTICATION_GROUP_CLIENT_REL_MODEL,
                        ...AUTHENTICATION_GROUP_MODEL,
                        ...AUTHENTICATION_GROUP_USER_REL_MODEL,
                        ...AUTHORIZATION_CODE_DATA_MODEL,
                        ...AUTHORIZATION_DEVICE_CODE_DATA_MODEL,
                        ...AUTHORIZATION_GROUP_MODEL,
                        ...AUTHORIZATION_GROUP_SCOPE_REL_MODEL,
                        ...AUTHORIZATION_GROUP_USER_REL_MODEL,
                        ...CAPTCHA_CONFIG_MODEL,
                        ...CHANGE_EVENT_MODEL,
                        ...CLIENT_AUTH_HISTORY_MODEL,
                        ...CLIENT_MODEL,
                        ...CLIENT_REDIRECT_URI_REL_MODEL,
                        ...CLIENT_SCOPE_REL_MODEL,
                        ...CONTACT_MODEL,
                        ...DELETION_STATUS_MODEL,
                        ...FEDERATED_AUTH_TEST_MODEL,
                        ...FEDERATED_OIDC_AUTHORIZATION_REL_MODEL,
                        ...FEDERATED_OIDC_PROVIDER_DOMAIN_REL_MODEL,
                        ...FEDERATED_OIDC_PROVIDER_MODEL,
                        ...FEDERATED_OIDC_PROVIDER_TENANT_REL_MODEL,
                        ...MARK_FOR_DELETE_MODEL,
                        ...PRE_AUTHENTICATION_STATE_MODEL,
                        ...PROHIBITED_PASSWORD_MODEL,
                        ...RATE_LIMIT_SERVICE_GROUP_MODEL,
                        ...REFRESH_DATA_MODEL,
                        ...SCHEDULER_LOCK_MODEL,
                        ...SCOPE_MODEL,
                        ...SECRET_SHARE_MODEL,
                        ...SIGNING_KEY_MODEL,
                        ...STATE_PROVINCE_REGION_MODEL,
                        ...SYSTEM_SETTINGS_MODEL,
                        ...TENANT_ANONYMOUS_USER_CONFIGURATION_MODEL,
                        ...TENANT_AVAILABLE_SCOPE_MODEL,
                        ...TENANT_LEGACY_USER_MIGRATION_CONFIG_MODEL,
                        ...TENANT_LOGIN_FAILURE_POLICY_MODEL,
                        ...TENANT_LOOK_AND_FEEL_MODEL,
                        ...TENANT_MANAGEMENT_DOMAIN_REL_MODEL,
                        ...TENANT_PASSWORD_CONFIG_MODEL,
                        ...TENANT_RATE_LIMIT_REL_MODEL,
                        ...TENANT_RESTRICTED_AUTHENTICATION_DOMAIN_REL_MODEL,
                        ...USER_AUTHENTICATION_HISTORY_MODEL,
                        ...USER_AUTHENTICATION_STATE_MODEL,
                        ...USER_CREDENTIAL_MODEL,
                        ...USER_DURESS_CREDENTIAL_MODEL,
                        ...USER_EMAIL_RECOVERY_MODEL,
                        ...USERS_MODEL,
                        ...USERS_BY_PHONE_NUMBER_MODEL,
                        ...USER_FAILED_LOGIN_MODEL,
                        ...USER_FIDO2_CHALLENGE_MODEL,
                        ...USER_FIDO2_COUNTER_REL_MODEL,
                        ...USER_MFA_REL_MODEL,
                        ...USER_PROFILE_EMAIL_CHANGE_STATE_MODEL,
                        ...USER_REGISTRATION_STATE_MODEL,
                        ...USER_SCOPE_REL_MODEL,
                        ...USER_TENANT_REL_MODEL,
                        ...USER_TERMS_AND_CONDITIONS_ACCEPTED_MODEL,
                        ...USER_VERIFICATION_TOKEN_MODEL
                    }
                }
            );
        }
        return global.mapper;
    }

    public static async getClient(): Promise<cassandra.Client> {
        if (!global.cassandraClient){

            const authProvider = new cassandra.auth.PlainTextAuthProvider(CASSANDRA_USERNAME || "", CASSANDRA_PASSWORD || "");
            global.cassandraClient = new cassandra.Client({
                contactPoints: CASSANDRA_CONTACT_POINTS?.split(","),
                localDataCenter: CASSANDRA_LOCAL_DATA_CENTER,
                keyspace: CASSANDRA_KEY_SPACE,
                authProvider: authProvider
            });           
            try{
                global.cassandraClient.connect();
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            catch(err: any){
                logWithDetails("error", `Error connecting to Cassandra: ${err.message}`, {});
            }

        }
        return global.cassandraClient;
    }

}




export default CassandraDriver;