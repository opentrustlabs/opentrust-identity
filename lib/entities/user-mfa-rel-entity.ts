import { Entity, PrimaryKey, Property } from "@mikro-orm/core";


// primarymfa BOOLEAN NOT NULL,
// mfatype VARCHAR(64) NOT NULL,
// totpsecret VARCHAR(1024),
// fido2publickey VARCHAR(4000),
// fido2credentialid VARCHAR(1024),
// fido2algorithm VARCHAR(1024),
// fido2transports VARCHAR(1024),
// fido2keysupportscounters BOOLEAN,
// PRIMARY KEY (userid, mfatype),
// FOREIGN KEY (userid) REFERENCES user(userid)

@Entity({
    tableName: "user_mfa_rel"
})
class UserMfaRelEntity {

    @PrimaryKey({fieldName: "userid"})
    userId: string;

    @Property({fieldName: "mfatype"})
    mfaType: string;

    @Property({fieldName: "primarymfa"})
    primaryMfa: boolean;
    
    @Property({fieldName: "totpsecret"})
    totpSecret: string;
    
    @Property({fieldName: "fido2publickey"})
    fido2PublicKey: string;
    
    @Property({fieldName: "fido2credentialid"})
    fido2CredentialId: string;
    
    @Property({fieldName: "fido2algorithm"})
    fido2Algorithm: string;
    
    @Property({fieldName: "fido2transports"})
    fido2Transports: string;

    @Property({fieldName: "fido2keysupportscounters"})
    fido2KeySupportsCounters: boolean;

}

export default UserMfaRelEntity;