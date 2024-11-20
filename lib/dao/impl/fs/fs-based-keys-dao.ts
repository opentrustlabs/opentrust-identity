import { Key } from "@/graphql/generated/graphql-types";
import SigningKeysDao from "../../keys-dao";
import { KEY_FILE } from "@/utils/consts";
import { getFileContents } from "@/utils/dao-utils";
import { writeFileSync } from "node:fs";
import path from "node:path";

const dataDir = process.env.FS_BASED_DATA_DIR ?? path.join(__dirname);

class FSBasedSigningKeysDao extends SigningKeysDao {


    public async getSigningKeys(tenantId?: string): Promise<Array<Key>> {
        let keys: Array<Key> = JSON.parse(getFileContents(`${dataDir}/${KEY_FILE}`, "[]"));
        if(tenantId){
            keys = keys.filter(
                (k: Key) => k.tenantId === tenantId
            )
        }
        return Promise.resolve(keys);
    }    

    public async createSigningKey(key: Key): Promise<Key> {
        
        const keys = await this.getSigningKeys();
        
        keys.push(key);
        writeFileSync(`${dataDir}/${KEY_FILE}`, JSON.stringify(keys), {encoding: "utf-8"});
        return Promise.resolve(key);
    }    

    public async getSigningKeyById(keyId: string): Promise<Key | null> {
        const keys: Array<Key> = await this.getSigningKeys();
        const key = keys.find(
            (k: Key) => k.keyId === keyId
        )
        return key === undefined ? Promise.resolve(null) : Promise.resolve(key);
    }

    public async deleteSigningKey(keyId: String): Promise<void> {
        const keys: Array<Key> = await this.getSigningKeys();
        const a: Array<Key> = keys.filter(
            (k: Key) => k.keyId !== keyId
        );
        writeFileSync(`${dataDir}/${KEY_FILE}`, JSON.stringify(a), {encoding: "utf-8"})
        
    }
    
}

export default FSBasedSigningKeysDao;