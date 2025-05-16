import { OIDCContext } from "@/graphql/graphql-context";

import IdentityDao from "../dao/identity-dao";
import { ObjectSearchResultItem, RelSearchResultItem, SearchResultType, Tenant, TenantPasswordConfig, User, UserCreateInput, UserCredential, UserTenantRel, UserTenantRelView } from "@/graphql/generated/graphql-types";
import { DaoFactory } from "../data-sources/dao-factory";
import TenantDao from "../dao/tenant-dao";
import { GraphQLError } from "graphql/error";
import { randomUUID } from "crypto";
import { NAME_ORDER_WESTERN, PASSWORD_HASH_ITERATION_128K, PASSWORD_HASH_ITERATION_256K, PASSWORD_HASH_ITERATION_32K, PASSWORD_HASH_ITERATION_64K, PASSWORD_HASHING_ALGORITHM_BCRYPT_10_ROUNDS, PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS, PASSWORD_HASHING_ALGORITHM_BCRYPT_12_ROUNDS, PASSWORD_HASHING_ALGORITHM_PBKDF2_128K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_PBKDF2_256K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SCRYPT_128K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SCRYPT_32K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SCRYPT_64K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SHA_256_128K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SHA_256_64K_ITERATIONS, SEARCH_INDEX_OBJECT_SEARCH, SEARCH_INDEX_REL_SEARCH, TENANT_TYPE_ROOT_TENANT, USER_TENANT_REL_TYPE_GUEST, USER_TENANT_REL_TYPE_PRIMARY } from "@/utils/consts";
import { sha256HashPassword, pbkdf2HashPassword, bcryptHashPassword, generateSalt, scryptHashPassword } from "@/utils/dao-utils";
import { Client } from "@opensearch-project/opensearch";
import { getOpenSearchClient } from "../data-sources/search";
import { Get_Response } from "@opensearch-project/opensearch/api/index.js";


const identityDao: IdentityDao = DaoFactory.getInstance().getIdentityDao();
const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
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
        if (existingUser !== null) {
            if (existingUser.locked === true && user.locked !== true) {
                user.locked = true;
            }
            user.federatedOIDCProviderSubjectId = existingUser.federatedOIDCProviderSubjectId;
            user.emailVerified = existingUser.emailVerified;
            user.domain = existingUser.domain;

            // Did the email change and if so, what parts of the email have changed?
            // 1    domains 
            // 2    just the name
            // 3    both
            // In case of change.
            // 1    verify the email does not already exist
            // 2    unset the verified email flag
            if (user.email !== existingUser.email) {
                const userByEmail: User | null = await identityDao.getUserBy("email", user.email);
                if (userByEmail) {
                    throw new GraphQLError("ERROR_ATTEMPTING_TO_CHANGE_EMAIL_FAILED");
                }
                else {
                    const domain: string = user.email.substring(
                        user.email.indexOf("@") + 1
                    )
                    user.domain = domain;
                    user.emailVerified = false;
                }
            }

            await identityDao.updateUser(user);

            // Only update the search index if anything has changed
            if (
                user.email !== existingUser.email ||
                user.firstName !== existingUser.firstName ||
                user.lastName !== existingUser.lastName ||
                user.enabled !== existingUser.enabled
            ) {
                const getResponse: Get_Response = await searchClient.get({
                    id: user.userId,
                    index: SEARCH_INDEX_OBJECT_SEARCH
                });
                
                if (getResponse.body) {
                    const document: ObjectSearchResultItem = getResponse.body._source as ObjectSearchResultItem;
                    document.name = user.nameOrder === NAME_ORDER_WESTERN ? `${user.firstName} ${user.lastName}` : `${user.lastName} ${user.firstName}`,
                    document.email = user.email;
                    document.enabled = user.enabled;
                    await searchClient.index({
                        id: user.userId,
                        index: SEARCH_INDEX_OBJECT_SEARCH,
                        body: document
                    })
                }
                // TODO: Update the rel_index as well, but do NOT wait on the results since
                // there could be 1000s of records to modify.
            }
            return user;
        }
        else {
            throw new GraphQLError("ERROR_USER_DOES_NOT_EXIST");
        }
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
            federatedOIDCProviderSubjectId: userCreateInput.federatedOIDCProviderSubjectId,
            markForDelete: false
        }

        await identityDao.createUser(user);
        await identityDao.assignUserToTenant(tenant.tenantId, user.userId, "PRIMARY");
        await this.updateObjectSearchIndex(tenant, user, "PRIMARY");
        await this.updateRelSearchIndex(tenant.tenantId, tenant.tenantId, user, USER_TENANT_REL_TYPE_PRIMARY);

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
            hashedPassword = sha256HashPassword(password, salt, PASSWORD_HASH_ITERATION_64K);            
        }
        else if(hashAlgorithm === PASSWORD_HASHING_ALGORITHM_SHA_256_128K_ITERATIONS){
            salt = generateSalt();
            hashedPassword = sha256HashPassword(password, salt, PASSWORD_HASH_ITERATION_128K);            
        }
        else if(hashAlgorithm === PASSWORD_HASHING_ALGORITHM_PBKDF2_128K_ITERATIONS){
            salt = generateSalt();
            hashedPassword = pbkdf2HashPassword(password, salt, PASSWORD_HASH_ITERATION_128K);            
        }
        else if(hashAlgorithm === PASSWORD_HASHING_ALGORITHM_PBKDF2_256K_ITERATIONS){
            salt = generateSalt();
            hashedPassword = pbkdf2HashPassword(password, salt, PASSWORD_HASH_ITERATION_256K);            
        }
        else if(hashAlgorithm === PASSWORD_HASHING_ALGORITHM_SCRYPT_32K_ITERATIONS){
            salt = generateSalt();
            hashedPassword = scryptHashPassword(password, salt, PASSWORD_HASH_ITERATION_32K);            
        }
        else if(hashAlgorithm === PASSWORD_HASHING_ALGORITHM_SCRYPT_64K_ITERATIONS){
            salt = generateSalt();
            hashedPassword = scryptHashPassword(password, salt, PASSWORD_HASH_ITERATION_64K);  
        }
        else if(hashAlgorithm === PASSWORD_HASHING_ALGORITHM_SCRYPT_128K_ITERATIONS){
            salt = generateSalt();
            hashedPassword = scryptHashPassword(password, salt, PASSWORD_HASH_ITERATION_128K);
        }

        return {
            dateCreated: Date.now().valueOf().toString(),
            hashedPassword: hashedPassword,
            salt: salt,
            hashingAlgorithm: hashAlgorithm,
            userId: userId
        }
    }


    public async getUserTenantRels(userId: string): Promise<Array<UserTenantRelView>> {
        const rels: Array<UserTenantRel> = await identityDao.getUserTenantRelsByUserId(userId);
        const retVal: Array<UserTenantRelView> = [];
        for(let i = 0; i < rels.length; i++){
            const tenant: Tenant | null = await tenantDao.getTenantById(rels[i].tenantId);
            const tenantName = tenant ? tenant.tenantName : "";
            retVal.push({
                userId: userId,
                tenantId: rels[i].tenantId,
                relType: rels[i].relType,
                tenantName: tenantName
            });
        }
        return retVal;
    }

    public async assignUserToTenant(tenantId: string, userId: string, relType: string): Promise<UserTenantRel> {
        let userTenantRel: UserTenantRel = {
            enabled: false,
            relType: relType,
            tenantId: tenantId,
            userId: userId
        };
        if(! ( relType === USER_TENANT_REL_TYPE_PRIMARY || relType === USER_TENANT_REL_TYPE_GUEST) ){
            throw new GraphQLError("ERROR_INVALID_USER_TENANT_RELATIONSHIP_TYPE");
        }
        const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);
        if(!tenant){
            throw new GraphQLError("ERROR_UNABLE_TO_FIND_TENANT");
        }
        const user: User | null = await identityDao.getUserBy("id", userId);
        if(!user){
            throw new GraphQLError("ERROR_UNABLE_TO_FIND_USERS");
        }

        const rels: Array<UserTenantRel> = await identityDao.getUserTenantRelsByUserId(userId);
        // If there is not an existing relationship, then it MUST be a PRIMARY relationship.
        // If not, throw an error.
        if(rels.length === 0){
            if(relType !== USER_TENANT_REL_TYPE_PRIMARY){
                throw new GraphQLError("ERROR_MUST_BE_PRIMARY_TENANT");
            }
            else{
                userTenantRel = await identityDao.assignUserToTenant(tenantId, userId, relType);
                // Both the owning and parent tenant ids are the same in this case
                await this.updateRelSearchIndex(tenantId, tenantId, user, relType);
            }
        }
        // Otherwise, there already exists one or more relationships. 
        else {
            const primaryRel: UserTenantRel | undefined  = rels.find(
                (rel: UserTenantRel) => rel.relType === USER_TENANT_REL_TYPE_PRIMARY
            );
            // There should always be a primary rel
            // TODO
            // There might not be a primary rel in cases where the tenant has been deleted, leaving
            // orphaned users. Re-factor this code to account for that.
            if(!primaryRel){
                throw new GraphQLError("ERROR_NO_PRIMARY_RELATIONSHIP_EXISTS_FOR_THE_USER_AND_TENANT");
            }

            // If there are no existing rels that match the incoming data, then create a 
            // new one, but ONLY if the relationship type is GUEST.
            const existingTenantRel: UserTenantRel | undefined = rels.find(
                (rel: UserTenantRel) => rel.tenantId === tenantId && rel.userId === userId
            )            
            if(!existingTenantRel){
                if(relType === USER_TENANT_REL_TYPE_PRIMARY){
                    throw new GraphQLError("ERROR_MUST_BE_GUEST_TENANT");
                }
                else{
                    userTenantRel = await identityDao.assignUserToTenant(tenantId, userId, relType);
                    // The primary rel remains as the owning tenant id, which the incoming tenant id 
                    // is the parent id
                    await this.updateRelSearchIndex(primaryRel.tenantId, tenantId, user, relType);
                }
            }
            
            // Otherwise, we may have to update more than one record if the incoming data
            // is set to a relationship type of PRIMARY. In this case we have to remove
            // the PRIMARY relationship from the existing data and set it to GUEST and we
            // have to update the incoming as PRIMARY
            else{
                if(existingTenantRel.relType === USER_TENANT_REL_TYPE_PRIMARY && relType === USER_TENANT_REL_TYPE_GUEST){
                    throw new GraphQLError("ERROR_CANNOT_ASSIGN_TO_A_GUEST_RELATIONSHIP");
                }
                else if(existingTenantRel.relType === USER_TENANT_REL_TYPE_GUEST && relType === USER_TENANT_REL_TYPE_PRIMARY){
                    // Assign the incoming as primary
                    userTenantRel = await identityDao.assignUserToTenant(tenantId, userId, relType);
                    // The incoming tenant becomes the new owning tenant as well as the parent.
                    await this.updateRelSearchIndex(tenantId, tenantId, user, relType);
                    // Then update the existing primary as guest
                    await identityDao.assignUserToTenant(primaryRel.tenantId, primaryRel.userId, USER_TENANT_REL_TYPE_GUEST);
                    // The incoming tenant is the owning tenant, which the existing primary becomes just the parent
                    await this.updateRelSearchIndex(tenantId, primaryRel.tenantId, user, relType);
                }
            }
        }
        return userTenantRel;        
    }

    public async removeUserFromTenant(tenantId: string, userId: string): Promise<void> {
        // Cannot remove a primary relationship
        const rel: UserTenantRel | null = await identityDao.getUserTenantRel(tenantId, userId);
        if(rel){
            if(rel.relType === USER_TENANT_REL_TYPE_PRIMARY){
                throw new GraphQLError("ERROR_CANNOT_CANNOT_REMOVE_A_PRIMARY_RELATIONSHIP");
            }
            else {
                await identityDao.removeUserFromTenant(tenantId, userId);
            }
        }        
        return Promise.resolve();
    }


    protected async updateObjectSearchIndex(tenant: Tenant, user: User, relType: string): Promise<void> {
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
    }

    protected async updateRelSearchIndex(owningTenantId: string, parentTenantId: string, user: User, relType: string): Promise<void> {
        
        const relDocument: RelSearchResultItem = {
            childid: user.userId,
            childname: user.nameOrder === NAME_ORDER_WESTERN ? `${user.firstName} ${user.lastName}` : `${user.lastName} ${user.firstName}`,
            childtype: SearchResultType.User,
            owningtenantid: owningTenantId,
            parentid: parentTenantId,
            parenttype: SearchResultType.Tenant,
            childdescription: user.email
        }
        await searchClient.index({
            id: `${parentTenantId}::${user.userId}`,
            index: SEARCH_INDEX_REL_SEARCH,
            body: relDocument
        })
    }

}

export default IdentitySerivce;