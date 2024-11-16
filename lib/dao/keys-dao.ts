import { Key } from "@/graphql/generated/graphql-types";


abstract class SigningKeysDao {
    
    abstract getSigningKeys(tenantId?: string): Promise<Array<Key>>;

    abstract getSigningKeyById(keyId: string): Promise<Key | null>;

    abstract createSigningKey(key: Key): Promise<Key>;

    abstract deleteSigningKey(keyId: String): Promise<void>;

}

export default SigningKeysDao;