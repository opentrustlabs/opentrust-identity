import { SigningKey, Tenant } from '@/graphql/generated/graphql-types';
import SigningKeysDao from '@/lib/dao/signing-keys-dao';
import TenantDao from '@/lib/dao/tenant-dao';
import { DaoFactory } from '@/lib/data-sources/dao-factory';
import { KEY_USE_JWT_SIGNING } from '@/utils/consts';
import { exportJWK } from 'jose';
import type { NextApiRequest, NextApiResponse } from 'next'
import { createPublicKey, X509Certificate } from 'node:crypto';


const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const signingKeysDao: SigningKeysDao = DaoFactory.getInstance().getSigningKeysDao();


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    // For future development:
    // Clients will be able to upload or create their own JWT signing keys,
    // which can then be used to sign JWTs. In which case we will add those
    // client keys to the list of JWT signing keys that belong to the root
    // tenant.
    // const { 
    //     tenant_id
    // } = req.query;

    // const tenantId = tenant_id as string;
    

    const rootTenant: Tenant | null = await tenantDao.getRootTenant();
    if(rootTenant === null){
        res.status(404).end();
        return;
    }
    
    const nowMs = Date.now();

    let keys: Array<SigningKey> = await signingKeysDao.getSigningKeys(rootTenant.tenantId);
    keys = keys.filter(
        (key: SigningKey) => key.keyUse === KEY_USE_JWT_SIGNING && key.expiresAtMs > nowMs
    );

    const jwksResponseArray = [];

    for(let i = 0; i < keys.length; i++){
        const key: SigningKey = keys[i];
        if(key.keyCertificate){
                const x509Cert: X509Certificate = new X509Certificate(key.keyCertificate);  
                //const publicKey = createPublicKey(x509Cert.publicKey);
                const jwk: JsonWebKey = x509Cert.publicKey.export( {format: "jwk" });
                jwksResponseArray.push(
                    {
                        ...jwk,
                        kid: key.keyId,
                        use: "sig",
                        x5c: [key.keyCertificate.replaceAll(/-----.*-----/g, "").replaceAll(/\n/g, "").replaceAll(/\r/g, "")]
                    }
                );
            }
            else if(key.publicKey){
                const publicKey = createPublicKey(key.publicKey);
                const jwk: JsonWebKey = publicKey.export( {format: "jwk" });
                jwksResponseArray.push(
                    {
                        ...jwk,
                        kid: key.keyId,
                        use: "sig"
                    }
                );
            }
    }



    res.json({keys: jwksResponseArray});

}