import axios, { AxiosResponse } from "axios";
import { Jwks, WellknownConfig } from "@/lib/models/wellknown-config";
import NodeCache from "node-cache";
import { LegacyUserAuthenticationPayload, LegacyUserAuthenticationResponse, LegacyUserProfile } from "../models/principal";
import { SecurityEvent } from "../models/security-event";
import { timeout } from "cron";


// TODO
// Need to consider the following properties on the axios requests:
//   httpsAgent?: any;
//   proxy?: AxiosProxyConfig | false;
//
// and make these configurable in the .env file
// Examples:
//
// import { Agent } from "https";
// import axios, { AxiosProxyConfig, AxiosResponse } from "axios";
// 
//      agent: Agent = new Agent({
//         key: "",
//         cert: "",
//         passphrase: "",
//         rejectUnauthorized: true,
//         ca: ""
//     });
//
//      proxy: AxiosProxyConfig = {
//         host: "",
//         port: 0
//     }

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

    /**
     * Performs a HEAD request with the give URI (which should look like: http(s)://domain/path?email=)
     * and returns true if the service responded with 200, else false
     * @param uri 
     * @returns 
     */
    public async legacyUsernameCheck(uri: string): Promise<boolean> {
        const response: AxiosResponse = await axios.head(uri, {
            timeout: 30000,
            responseEncoding: "utf-8"
        });
        return response.status === 200;
    }

    /**
     * Authenticates the user against the legacy auth system. Success returns an
     * access token which will be used to query the user profile. See #legacyUserProfile()
     * 
     * @param uri 
     * @param email 
     * @param password 
     * @returns 
     */
    public async legacyUserAuthentication(uri: string, email: string, password: string): Promise<LegacyUserAuthenticationResponse | null>{

        const payload: LegacyUserAuthenticationPayload = {
            email: email,
            password: password
        }

        const response: AxiosResponse = await axios.post(uri, payload, {
            timeout: 30000,
            responseEncoding: "utf-8",
            headers: {
                "Content-Type": "application/json"
            },
            responseType: "json"
        });

        if(response.status === 200){
            return response.data as LegacyUserAuthenticationResponse;
        }
        else{
            return null;
        }
    }

    /**
     * Invokes a GET request on the legacy user profile URI with the access token obtained
     * in the #legacyUserAuthentication() call
     * @param uri 
     * @param authToken 
     * @returns 
     */
    public async legacyUserProfile(uri: string, authToken: string): Promise<LegacyUserProfile | null>{

        const response: AxiosResponse = await axios.get(uri, {
            headers: {
                "Authorization": `Bearer ${authToken}`
            },
            timeout: 30000,
            responseType: "json"
        });

        if(response.status === 200){
            return response.data as LegacyUserProfile;
        }
        else{
            return null;
        }
    }

    public async invokeSecurityEventCallback(uri: string, securityEvent: SecurityEvent, authToken: string){
        // Fire asynchronously, but if there is an error, log the error.
        axios.post(uri, securityEvent, {
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json"
            },
            timeout: 30000
        }).catch(
            (error) => {
                // TODO
                // Log the error
                console.log(error);
            }
        )
    }

}

export default OIDCServiceUtils;