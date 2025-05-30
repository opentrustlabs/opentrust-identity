

import { Tenant, Client, FederatedOidcProvider, FederatedOidcAuthorizationRel, PreAuthenticationState } from '@/graphql/generated/graphql-types';
import AuthDao from '@/lib/dao/auth-dao';
import ClientDao from '@/lib/dao/client-dao';
import FederatedOIDCProviderDao from '@/lib/dao/federated-oidc-provider-dao';
import TenantDao from '@/lib/dao/tenant-dao';
import { DaoFactory } from '@/lib/data-sources/dao-factory';
import { WellknownConfig } from '@/lib/models/wellknown-config';
import OIDCServiceClient from '@/lib/service/oidc-service-utils';
import { ALL_OIDC_SUPPORTED_SCOPE_VALUES, OIDC_OPENID_SCOPE } from '@/utils/consts';
import { generateCodeVerifierAndChallenge, generateRandomToken} from '@/utils/dao-utils';
import type { NextApiRequest, NextApiResponse } from 'next'

const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const federatedOIDCProviderDao: FederatedOIDCProviderDao = DaoFactory.getInstance().getFederatedOIDCProvicerDao();
const authDao: AuthDao = DaoFactory.getInstance().getAuthDao();
const oidcServiceClient: OIDCServiceClient = new OIDCServiceClient();

const {
    AUTH_DOMAIN
} = process.env;

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {




}