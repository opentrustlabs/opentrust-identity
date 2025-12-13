import { SecretShare } from "@/graphql/generated/graphql-types";

export type SecretShareLookupType = "id" | "otp";

abstract class SecretShareDao {

    abstract getSecretShareBy(value: string, type: SecretShareLookupType): Promise<SecretShare | null>;

    abstract createSecretShare(secretShare: SecretShare): Promise<SecretShare>;

    abstract deleteSecretShare(secretShareId: string): Promise<void>;

    abstract deleteExpiredData(): Promise<void>;

}

export default SecretShareDao;