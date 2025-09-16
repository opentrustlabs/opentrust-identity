import { FederatedOidcProvider, SecretShare, SecretShareObjectType, SystemSettings, TenantLookAndFeel } from "@/graphql/generated/graphql-types";
import SecretShareDao from "../dao/secret-share-dao";
import { DaoFactory } from "../data-sources/dao-factory";
import FederatedOIDCProviderDao from "../dao/federated-oidc-provider-dao";
import { randomUUID } from "node:crypto";
import { GraphQLError } from "graphql";
import { generateHash, generateRandomToken } from "@/utils/dao-utils";
import { OIDCContext } from "@/graphql/graphql-context";
import { authorizeByScopeAndTenant } from "@/utils/authz-utils";
import { DEFAULT_TENANT_LOOK_AND_FEEL, QUERY_PARAM_SECRET_ENTRY_OTP, SECRET_ENTRY_DELEGATE_SCOPE } from "@/utils/consts";
import Kms from "../kms/kms";
import { ERROR_CODES } from "../models/error";
import JwtServiceUtils from "./jwt-service-utils";
import OIDCServiceUtils from "./oidc-service-utils";
import TenantDao from "../dao/tenant-dao";


const secretShareDao: SecretShareDao = DaoFactory.getInstance().getSecretShareDao();
const federatedOIDCProvderDao: FederatedOIDCProviderDao = DaoFactory.getInstance().getFederatedOIDCProvicerDao();
const kms: Kms = DaoFactory.getInstance().getKms();
const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const jwtServiceUtils: JwtServiceUtils = new JwtServiceUtils();
const oidcServiceUtils: OIDCServiceUtils = new OIDCServiceUtils();

const {
     AUTH_DOMAIN
} = process.env;

class SecretShareService {

    oidcContext: OIDCContext;
    
    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    public async generateSecretShareLink(objectId: string, secretShareObjectType: SecretShareObjectType, email: string): Promise<boolean> {

        const authResult = authorizeByScopeAndTenant(this.oidcContext, [SECRET_ENTRY_DELEGATE_SCOPE], null);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }

        if(email.length < 6 || email.indexOf("@") < 1){
            throw new GraphQLError(ERROR_CODES.EC00017.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00017}});
        }
        
        // We only support oidc providers at the moment. Need to make sure it exists and is enabled.
        const provider: FederatedOidcProvider | null = await federatedOIDCProvderDao.getFederatedOidcProviderById(objectId);
        if(provider === null){
            throw new GraphQLError(ERROR_CODES.EC00023.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00023}});
        }
        if(provider.markForDelete === true){
            throw new GraphQLError(ERROR_CODES.EC00046.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00046}});
        }

        const otp = generateRandomToken(24, "base64url");


        const secretShare: SecretShare = {
            objectId: objectId,
            otp: generateHash(otp),
            secretShareId: randomUUID().toString(),
            secretShareObjectType: secretShareObjectType,
            expiresAtMs: Date.now() + (2 * 60 * 60 * 1000) // 2 hours from now
        };
        await secretShareDao.createSecretShare(secretShare);

        if(this.oidcContext.portalUserProfile){
            const authToken = await jwtServiceUtils.getAuthTokenForOutboundCalls();
            oidcServiceUtils.fireSecurityEvent("secret_share_link_generated", this.oidcContext, this.oidcContext.portalUserProfile, null, authToken);
        }
        
        const systemSettings: SystemSettings = await tenantDao.getSystemSettings();
        const fromEmail = systemSettings.noReplyEmail ? systemSettings.noReplyEmail : "no-reply";
        const secretEntryLink = `${AUTH_DOMAIN}/secret-entry?${QUERY_PARAM_SECRET_ENTRY_OTP}=${otp}`;
        const tenantLookAndFeel: TenantLookAndFeel = await tenantDao.getTenantLookAndFeel(this.oidcContext.rootTenant.tenantId) || DEFAULT_TENANT_LOOK_AND_FEEL;

        oidcServiceUtils.sendSecretEntryEmail(
            fromEmail,
            email,
            secretEntryLink,
            tenantLookAndFeel,
            this.oidcContext.portalUserProfile?.preferredLanguageCode || "en"
        );
        
        return true;
    }

    public async enterSecretValue(otp: string, secretValue: string): Promise<boolean> {

        const hashedValue = generateHash(otp);
        const secretShare: SecretShare | null = await secretShareDao.getSecretShareBy(hashedValue, "otp");
        if(secretShare === null){
            throw new GraphQLError(ERROR_CODES.EC00047.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00047}});
        }
        if(secretShare.expiresAtMs < Date.now()){
            // Delete it and throw an error
            await secretShareDao.deleteSecretShare(secretShare.secretShareId);
            throw new GraphQLError(ERROR_CODES.EC00048.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00048}});
        }
        const provider: FederatedOidcProvider | null = await federatedOIDCProvderDao.getFederatedOidcProviderById(secretShare.objectId);
        if(provider === null){
            throw new GraphQLError(ERROR_CODES.EC00023.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00023}});
        }
        if(provider.markForDelete === true){
            throw new GraphQLError(ERROR_CODES.EC00046.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00046}});
        }

        const encryptedValue = await kms.encrypt(secretValue);
        provider.federatedOIDCProviderClientSecret = encryptedValue;
        await federatedOIDCProvderDao.updateFederatedOidcProvider(provider);
        await secretShareDao.deleteSecretShare(secretShare.secretShareId);
        return true;
    }
}

export default SecretShareService;