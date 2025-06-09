import axios, { AxiosResponse } from "axios";
import { Jwks, WellknownConfig } from "@/lib/models/wellknown-config";
import NodeCache from "node-cache";

const oidcWellknowCache = new NodeCache(
    {
        stdTTL: 43200, // 12 hours
        useClones: false,
        checkperiod: 1800, 
    }
);

const oidcJwksCache = new NodeCache(
    {
        stdTTL: 14400, // 2 hours
        useClones: false,
        checkperiod: 1800, 
    }
);

class OIDCServiceUtils {

    /**
     * 
     * @param wellKnownUri 
     * @returns 
     */
    public async getWellKnownConfig(wellKnownUri: string): Promise<WellknownConfig | null> {
        let wellknownConfig: WellknownConfig | undefined = oidcWellknowCache.get(wellKnownUri);
        if (wellknownConfig) {
            return Promise.resolve(wellknownConfig);
        }
        try {
            const response: AxiosResponse = await axios.get<WellknownConfig>(wellKnownUri, {
                timeout: 30000, // 30 seconds
                responseEncoding: "utf-8",
                responseType: "json"
            });
            if (response.status !== 200) {
                return Promise.resolve(null);
            }
            wellknownConfig = response.data;
            oidcWellknowCache.set(wellKnownUri, wellknownConfig);
        }
        catch (err) {
            console.log(err);
        }
        return wellknownConfig !== undefined ? Promise.resolve(wellknownConfig) : Promise.resolve(null);
    }

    /**
     * 
     * @param jwksUri 
     * @returns 
     */
    public async getJwksKeys(jwksUri: string): Promise<Jwks | null>{
        let keys: Jwks | undefined = oidcJwksCache.get(jwksUri);
        if(keys){
            return Promise.resolve(keys);
        }
        const response: AxiosResponse = await axios.get<Jwks>(jwksUri, {
            timeout: 30000,
            responseEncoding: "utf-8",
            responseType: "json"
        });
        if(response.status !== 200){
            return Promise.resolve(null);
        }
        keys = response.data;
        oidcJwksCache.set(jwksUri, keys);
        return keys !== undefined ? Promise.resolve(keys) : Promise.resolve(null);
    }

    

}

export default OIDCServiceUtils;