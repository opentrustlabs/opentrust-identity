import { Maybe, SigningKey } from "@/graphql/generated/graphql-types";
import { PrimaryKey, Property } from "@mikro-orm/core";


class SigningKeyEntity {

    constructor(signingKey?: SigningKey){
        if(signingKey){
            this.expiresAtMs = signingKey.expiresAtMs;
            this.keyId = signingKey.keyId;
            this.keyType = signingKey.keyType;
            this.keyuse = signingKey.keyuse;
            this.status = signingKey.status;
            this.tenantId = signingKey.tenantId;
            this.certificate = Buffer.from(signingKey.certificate ? signingKey.certificate : "");
            this.privateKeyPkcs8 = Buffer.from(signingKey.privateKeyPkcs8);
            this.publicKey = Buffer.from(signingKey.publicKey ? signingKey.publicKey : "");

        }
    }
    __typename?: "SigningKey" | undefined;

    @PrimaryKey({fieldName: "keyid"})
    keyId: string;

    @Property({fieldName: "keytype"})
    keyType: string;

    
    keytypeid?: Maybe<string> | undefined;
    
    @Property({fieldName: "keyuse"})
    keyuse: string;
    
    @Property({fieldName: "privatekeypkcs8"})
    privateKeyPkcs8: Buffer;

    @Property({fieldName: "password"})
    password?: Maybe<string> | undefined;

    @Property({fieldName: "publickey"})
    publicKey?: Buffer | undefined;

    @Property({fieldName: "certificate"})
    certificate: Buffer | undefined;

    @Property({fieldName: "expiresatms"})
    expiresAtMs: number;

    @Property({fieldName: "status"})
    status: string;

    @Property({fieldName: ""})
    statusid?: Maybe<string> | undefined;

    @Property({fieldName: "tenantid"})
    tenantId: string;

    public toModel(): SigningKey {
        const m: SigningKey = {
            expiresAtMs: this.expiresAtMs,
            keyId: this.keyId,
            keyType: this.keyType,
            keyuse: this.keyuse,
            privateKeyPkcs8: this.privateKeyPkcs8.toString("utf-8"),
            status: this.status,
            tenantId: this.tenantId,
            certificate: this.certificate?.toString("utf-8"),
            password: this.password,
            publicKey: this.publicKey?.toString("utf-8"),
            keytypeid: "",
            statusid: "",
            __typename: "SigningKey"
        }
        return m;
    }

}

export default SigningKeyEntity;