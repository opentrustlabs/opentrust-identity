import type { NextApiRequest, NextApiResponse } from 'next';
import AuthDao from '@/lib/dao/auth-dao';
import ClientDao from '@/lib/dao/client-dao';
import TenantDao from '@/lib/dao/tenant-dao';
import { generateHash, generateRandomToken } from '@/utils/dao-utils';
import { DaoFactory } from '@/lib/data-sources/dao-factory'; 
import { AuthorizationDeviceCodeData, Client, DeviceCodeAuthorizationStatus, Tenant } from '@/graphql/generated/graphql-types';
import { OIDCErrorResponseBody } from '@/lib/models/error';
import { randomUUID } from 'node:crypto';
import { ALL_OIDC_SUPPORTED_SCOPE_VALUES, CLIENT_TYPE_DEVICE, OIDC_AUTHORIZATION_ERROR_UNAUTHORIZED_CLIENT,  } from '@/utils/consts';
import { OIDCDeviceAuthorizationResponse } from '@/lib/models/token-response';



const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const authDao: AuthDao = DaoFactory.getInstance().getAuthDao();

const {
    AUTH_DOMAIN
} = process.env;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    if(req.method !== "POST"){
        res.status(405);
        return;
    }

    // read the tenant id from the query params (in this case, the path params) in the request
    const {
		tenant_id
    } = req.query;

    // Read the form post contents, auto-magically parsed by nextjs
    const {
        client_id,
        scope
    } = req.body;

    const tenantId: string = tenant_id as string;
    const clientId: string = client_id as string;
    const requestedScope = scope as string;

    const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);
    if(tenant === null || tenant.enabled === false || tenant.markForDelete === true){
        const error: OIDCErrorResponseBody = {
            error: OIDC_AUTHORIZATION_ERROR_UNAUTHORIZED_CLIENT,
            error_code: "0000731",
            error_description: "ERROR_INVALID_TENANT",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: randomUUID().toString()
        }
        return res.status(400).json(error);
    }

    const client: Client | null = await clientDao.getClientById(clientId);
    if(client === null || client.enabled === false || client.markForDelete === true || client.tenantId !== tenantId || client.clientType !== CLIENT_TYPE_DEVICE){
        const error: OIDCErrorResponseBody = {
            error: OIDC_AUTHORIZATION_ERROR_UNAUTHORIZED_CLIENT,
            error_code: "0000731",
            error_description: "ERROR_INVALID_CLIENT",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: randomUUID().toString()
        }
        return res.status(400).json(error);
    }

    let arrScope = requestedScope ? requestedScope.split(/\s+/) : [];
    arrScope = arrScope.filter(
        (s: string) => {
            return ALL_OIDC_SUPPORTED_SCOPE_VALUES.includes(s);
        }
    );
    if(arrScope.length === 0){
        const error: OIDCErrorResponseBody = {
            error: OIDC_AUTHORIZATION_ERROR_UNAUTHORIZED_CLIENT,
            error_code: "0000731",
            error_description: "ERROR_INVALID_CLIENT",
            error_uri: "",
            timestamp: Date.now(),
            trace_id: randomUUID().toString()
        }
        return res.status(400).json(error);
    }

    const deviceCode = generateRandomToken(20, "hex");
    const userCode = generateRandomToken(4, "hex").toUpperCase();

    const deviceCodeData: AuthorizationDeviceCodeData = {
        deviceCodeId: randomUUID().toString(),
        clientId: clientId,
        deviceCode: generateHash(deviceCode),
        expiresAtMs: Date.now() + (60 * 60 * 1000),
        scope: arrScope.join(","),
        tenantId: tenantId,
        userCode: generateHash(userCode),
        authorizationStatus: DeviceCodeAuthorizationStatus.Pending,
        userId: null
    }

    await authDao.saveAuthorizationDeviceCodeData(deviceCodeData);

    const oidcDeviceAuthorizationResponse: OIDCDeviceAuthorizationResponse = {
        device_code: deviceCode,
        user_code: userCode,
        verification_uri: `${AUTH_DOMAIN}/device`,
        expires_in: 3600,
        interval: 5,
        message: ""
    }

    res.status(200).json(oidcDeviceAuthorizationResponse);

}