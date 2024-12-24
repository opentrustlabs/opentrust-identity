import { SigningKey } from "@/graphql/generated/graphql-types";


abstract class SigningKeysDao {
    
    abstract getSigningKeys(tenantId?: string): Promise<Array<SigningKey>>;

    abstract getSigningKeyById(keyId: string): Promise<SigningKey | null>;

    abstract createSigningKey(key: SigningKey): Promise<SigningKey>;

    abstract deleteSigningKey(keyId: String): Promise<void>;

}

export default SigningKeysDao;