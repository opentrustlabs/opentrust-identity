import { SigningKey } from "@/graphql/generated/graphql-types";
import SigningKeysDao from "../../signing-keys-dao";
import { KEY_FILE } from "@/utils/consts";
import { getFileContents } from "@/utils/dao-utils";
import { writeFileSync } from "node:fs";
import path from "node:path";

const dataDir = process.env.FS_BASED_DATA_DIR ?? path.join(__dirname);

class FSBasedSigningKeysDao extends SigningKeysDao {


    public async getSigningKeys(tenantId?: string): Promise<Array<SigningKey>> {
        let keys: Array<SigningKey> = JSON.parse(getFileContents(`${dataDir}/${KEY_FILE}`, "[]"));
        if(tenantId){
            keys = keys.filter(
                (k: SigningKey) => k.tenantId === tenantId
            )
        }
        return Promise.resolve(keys);
    }    

    public async createSigningKey(key: SigningKey): Promise<SigningKey> {
        
        const keys = await this.getSigningKeys();
        
        keys.push(key);
        writeFileSync(`${dataDir}/${KEY_FILE}`, JSON.stringify(keys), {encoding: "utf-8"});
        return Promise.resolve(key);
    }    

    public async getSigningKeyById(keyId: string): Promise<SigningKey | null> {
        const keys: Array<SigningKey> = await this.getSigningKeys();
        const key = keys.find(
            (k: SigningKey) => k.keyId === keyId
        )
        return key === undefined ? Promise.resolve(null) : Promise.resolve(key);
    }

    public async deleteSigningKey(keyId: String): Promise<void> {
        const keys: Array<SigningKey> = await this.getSigningKeys();
        const a: Array<SigningKey> = keys.filter(
            (k: SigningKey) => k.keyId !== keyId
        );
        writeFileSync(`${dataDir}/${KEY_FILE}`, JSON.stringify(a), {encoding: "utf-8"})
        
    }
    
}

export default FSBasedSigningKeysDao;