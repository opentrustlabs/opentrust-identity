import { OIDCContext } from "@/graphql/graphql-context";

import IdentityDao from "../dao/identity-dao";
import { ObjectSearchResultItem, RelSearchResultItem, SearchResultType, Tenant, TenantPasswordConfig, User, UserCreateInput, UserCredential } from "@/graphql/generated/graphql-types";
import { DaoImpl } from "../data-sources/dao-impl";
import TenantDao from "../dao/tenant-dao";
import { GraphQLError } from "graphql/error";
import { randomUUID } from "crypto";
import { NAME_ORDER_WESTERN, PASSWORD_HASHING_ALGORITHM_BCRYPT_10_ROUNDS, PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS, PASSWORD_HASHING_ALGORITHM_BCRYPT_12_ROUNDS, PASSWORD_HASHING_ALGORITHM_PBKDF2_128K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_PBKDF2_256K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SHA_256_128K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SHA_256_64K_ITERATIONS, SEARCH_INDEX_OBJECT_SEARCH, SEARCH_INDEX_REL_SEARCH, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { sha256HashPassword, pbkdf2HashPassword, bcryptHashPassword, generateSalt } from "@/utils/dao-utils";
import { Client } from "@opensearch-project/opensearch";
import { getOpenSearchClient } from "../data-sources/search";


const identityDao: IdentityDao = DaoImpl.getInstance().getIdentityDao();
const tenantDao: TenantDao = DaoImpl.getInstance().getTenantDao();
const searchClient: Client = getOpenSearchClient();

class IdentitySerivce {
    
    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    public async registerUser(userCreateInput: UserCreateInput, tenantId: string, password: string){
        const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);
        if(!tenant){
            throw new GraphQLError("ERROR_TENANT_DOES_NOT_EXIST");
        }
        if(tenant.enabled === false){
            throw new GraphQLError("ERROR_TENANT_IS_NOT_ENABLED");
        }
        if(tenant.allowUserSelfRegistration === false){
            throw new GraphQLError("ERROR_TENANT_DOES_NOT_ALLOW_USER_SELF_REGISTRATION");
        }
        const passwordConfig: TenantPasswordConfig | null = await tenantDao.getTenantPasswordConfig(tenantId);
        if(!passwordConfig){
            throw new GraphQLError("ERROR_NO_PASSWORD_CONFIGURATION_FOR_TENANT");
        }
        const isValidPassword: boolean = await this.validatePassword(password, passwordConfig);
        if(!isValidPassword){
            throw new GraphQLError("ERROR_INVALID_PASSWORD");
        }

        const enabled: boolean = !tenant.verifyEmailOnSelfRegistration;
        const user: User = await this._createUser(userCreateInput, tenant, enabled);
        
        const userCredential: UserCredential = this.generateUserCredential(user.userId, password, passwordConfig.passwordHashingAlgorithm);

        await identityDao.addUserCredential(userCredential);

        return Promise.resolve(user);
        
    }

    public async getUserById(userId: string): Promise<User | null> {
        return identityDao.getUserBy("id", userId);
    }

    public async createUser(userCreateInput: UserCreateInput, tenantId: string): Promise<User>{
        const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);
        if(!tenant){
            throw new GraphQLError("ERROR_TENANT_DOES_NOT_EXIST");
        }
        if(tenant.enabled === false){
            throw new GraphQLError("ERROR_TENANT_IS_NOT_ENABLED");
        }
        const user: User = await this._createUser(userCreateInput, tenant, true);
        return user;
    }

    protected async validatePassword(password: string, passwordConfig: TenantPasswordConfig): Promise<boolean> {
        // TODO
        // Validate length, complexity, etc.

        // Finally, need to check to see if the password is diallowed because is has been
        // previously found to be easily cracked, as in the top 100K or top 1M cracked passwords.
        const passwordProhibited: boolean = await identityDao.passwordProhibited(password);
        if(passwordProhibited){
            return Promise.resolve(false);
        }

        return Promise.resolve(true);
    }

    public async updateUser(user: User): Promise<User> {
        
        const existingUser: User | null = await identityDao.getUserBy("id", user.userId);
        if(!user){
            throw new GraphQLError("ERROR_USER_DOES_NOT_EXIST");
        }



        await identityDao.updateUser(user);

        return user;

    }

    protected async _createUser(userCreateInput: UserCreateInput, tenant: Tenant, enabled: boolean): Promise<User>  {

        const domain: string = userCreateInput.email.substring(
            userCreateInput.email.indexOf("@") + 1
        )
        const user: User = {
            domain: domain,
            email: userCreateInput.email,
            emailVerified: userCreateInput.emailVerified,
            enabled: enabled,
            firstName: userCreateInput.firstName,
            lastName: userCreateInput.lastName,
            locked: false,
            nameOrder: userCreateInput.nameOrder,
            userId: randomUUID().toString(),
            address: userCreateInput.address,
            countryCode: userCreateInput.countryCode,
            middleName: userCreateInput.middleName,
            phoneNumber: userCreateInput.phoneNumber,
            preferredLanguageCode: userCreateInput.preferredLanguageCode,
            twoFactorAuthType: userCreateInput.twoFactorAuthType,
            federatedOIDCProviderSubjectId: userCreateInput.federatedOIDCProviderSubjectId
        }

        await identityDao.createUser(user);
        await identityDao.assignUserToTenant(tenant.tenantId, user.userId, "PRIMARY");
        await this.updateSearchIndex(tenant, user, "PRIMARY");

        return Promise.resolve(user);
    }

    protected generateUserCredential(userId: string, password: string, hashAlgorithm: string): UserCredential {
        // For the Bcrypt hashing algorithm, the salt value is included in the final salted password
        // so we can just leave it as the empty string.
        let salt = "";
        let hashedPassword = "";

        if(hashAlgorithm === PASSWORD_HASHING_ALGORITHM_BCRYPT_10_ROUNDS){
            hashedPassword = bcryptHashPassword(password, 10);
        }
        else if(hashAlgorithm === PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS){
            hashedPassword = bcryptHashPassword(password, 11);
        }
        else if(hashAlgorithm === PASSWORD_HASHING_ALGORITHM_BCRYPT_12_ROUNDS){
            hashedPassword = bcryptHashPassword(password, 12);
        }                   
        else if(hashAlgorithm === PASSWORD_HASHING_ALGORITHM_SHA_256_64K_ITERATIONS){
            salt = generateSalt();
            hashedPassword = sha256HashPassword(password, salt, 64000);            
        }
        else if(hashAlgorithm === PASSWORD_HASHING_ALGORITHM_SHA_256_128K_ITERATIONS){
            salt = generateSalt();
            hashedPassword = sha256HashPassword(password, salt, 128000);            
        }
        else if(hashAlgorithm === PASSWORD_HASHING_ALGORITHM_PBKDF2_128K_ITERATIONS){
            salt = generateSalt();
            hashedPassword = pbkdf2HashPassword(password, salt, 128000);            
        }
        else if(hashAlgorithm === PASSWORD_HASHING_ALGORITHM_PBKDF2_256K_ITERATIONS){
            salt = generateSalt();
            hashedPassword = pbkdf2HashPassword(password, salt, 256000);            
        }

        return {
            dateCreated: Date.now().valueOf().toString(),
            hashedPassword: hashedPassword,
            salt: salt,
            hashingAlgorithm: hashAlgorithm,
            userId: userId
        }
    }

    protected async updateSearchIndex(tenant: Tenant, user: User, relType: string): Promise<void> {
        let owningTenantId: string = tenant.tenantId;
        const document: ObjectSearchResultItem = {
            name: user.nameOrder === NAME_ORDER_WESTERN ? `${user.firstName} ${user.lastName}` : `${user.lastName} ${user.firstName}`,
            description: "",
            objectid: user.userId,
            objecttype: SearchResultType.User,
            owningtenantid: owningTenantId,
            email: user.email,
            enabled: user.enabled,
            owningclientid: "",
            subtype: "",
            subtypekey: ""
        }
        
        await searchClient.index({
            id: user.userId,
            index: SEARCH_INDEX_OBJECT_SEARCH,
            body: document
        });
        
        const relDocument: RelSearchResultItem = {
            childid: user.userId,
            childname: user.nameOrder === NAME_ORDER_WESTERN ? `${user.firstName} ${user.lastName}` : `${user.lastName} ${user.firstName}`,
            childtype: SearchResultType.User,
            owningtenantid: owningTenantId,
            parentid: owningTenantId,
            parenttype: SearchResultType.Tenant,
            childdescription: user.email
        }
        await searchClient.index({
            id: `${tenant.tenantId}::${user.userId}`,
            index: SEARCH_INDEX_REL_SEARCH,
            body: relDocument
        })
    }




}

export default IdentitySerivce;