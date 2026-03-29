import NodeCache from "node-cache";
import Kms from "./kms";

const CACHE_TTL_SECONDS = 60 * 60; // 60 minutes

abstract class CachingKms extends Kms {

    private readonly cache = new NodeCache({ stdTTL: CACHE_TTL_SECONDS, useClones: false });

    protected abstract decryptUncached(data: string, aad?: string): Promise<string | null>;

    public async decrypt(data: string, aad?: string): Promise<string | null> {
        const cacheKey = `${data}:${aad ?? ""}`;
        const cached = this.cache.get<string>(cacheKey);
        if (cached !== undefined) {
            return cached;
        }
        const result = await this.decryptUncached(data, aad);
        if (result !== null) {
            this.cache.set(cacheKey, result);
        }
        return result;
    }
}

export default CachingKms;
