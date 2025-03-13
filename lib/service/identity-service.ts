import { OIDCContext } from "@/graphql/graphql-context";
import { getIdentityDaoImpl } from "@/utils/dao-utils";
import IdentityDao from "../dao/identity-dao";
import { User, UserCreateInput } from "@/graphql/generated/graphql-types";


const identityDao: IdentityDao = getIdentityDaoImpl();



class IdentitySerivce {
    
    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    public async registerUser(userCreateInput: UserCreateInput, tenantId: string, password: string){

    }


    public async createUser(userCreateInput: UserCreateInput, tenantId: string): Promise<User>{

        // TODO
        // 1.   Refactor the create user function. We need to do a couple of 
        //      things.
        //      a.  Create a new table where user data is staged prior to user
        //          creation of the user, since we will (most likely) have to
        //          verity the user's email, using a one-time token.
        //          When the email is validated, then just copy over the data from
        //          the staging table to the user table and the user_credential
        //          table.
        // 2.   Need to hash the password (need to therefore lookup the tenant and 
        //      find the hash algorithm for the tenant to which they are trying to
        //      be added which we can get from the OIDCContext)
        // 
        //
        const user: User = {
            domain: "",
            email: "",
            emailVerified: false,
            enabled: true,
            firstName: "",
            lastName: "",
            locked: false,
            nameOrder: "",
            userId: "",
            address: "",
            countryCode: "",
            middleName: "",
            phoneNumber: "",
            preferredLanguageCode: "",
            twoFactorAuthType: "",
            federatedOIDCProviderSubjectId: ""
        }

        await identityDao.createUser(user);
        await identityDao.assignUserToTenant(tenantId, user.userId, "PRIMARY");

        await identityDao.addUserCredential({
            dateCreated: "",
            hashedPassword: "",
            hashingAlgorithm: "",
            salt: "",
            userId: ""
        })
        return user;
    }


}

export default IdentitySerivce;