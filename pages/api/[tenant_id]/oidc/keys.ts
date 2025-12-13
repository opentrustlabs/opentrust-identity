import { SigningKey, Tenant } from '@/graphql/generated/graphql-types';
import SigningKeysDao from '@/lib/dao/signing-keys-dao';
import TenantDao from '@/lib/dao/tenant-dao';
import { DaoFactory } from '@/lib/data-sources/dao-factory';
import { KEY_USE_JWT_SIGNING, SIGNING_KEY_STATUS_REVOKED } from '@/utils/consts';
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
    // How long should we still return expired certificates? Typically, the JWTs are signed
    // for not more than several hours. So 1 extra day? Could there still be some long-lived
    // tokens out there? If we say 30 days then we should be safe. It is highly unlikely that
    // there will be any JWTs (or anything else) signed with a keys whose certificate expired
    // 30 days previous
    const expirationCutoffMs = Date.now() - ( 30 * 24 * 60 * 60 * 1000 );

    let keys: Array<SigningKey> = await signingKeysDao.getSigningKeys(rootTenant.tenantId);
    keys = keys.filter(
        (key: SigningKey) => key.keyUse === KEY_USE_JWT_SIGNING && key.keyStatus !== SIGNING_KEY_STATUS_REVOKED && key.expiresAtMs > expirationCutoffMs
    );

    const jwksResponseArray = [];

    for(let i = 0; i < keys.length; i++){
        const key: SigningKey = keys[i];
        if(key.keyCertificate){
                const x509Cert: X509Certificate = new X509Certificate(key.keyCertificate);                  
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