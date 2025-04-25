import { Contact, SigningKey } from "@/graphql/generated/graphql-types";


abstract class SigningKeysDao {
    
    abstract getSigningKeys(tenantId?: string): Promise<Array<SigningKey>>;

    abstract getSigningKeyById(keyId: string): Promise<SigningKey | null>;

    abstract createSigningKey(key: SigningKey): Promise<SigningKey>;

    // abstract revokeSigningKey(keyId: string): Promise<void>;
    
    abstract updateSigningKey(key: SigningKey): Promise<SigningKey>;

    abstract deleteSigningKey(keyId: string): Promise<void>;

}

export default SigningKeysDao;