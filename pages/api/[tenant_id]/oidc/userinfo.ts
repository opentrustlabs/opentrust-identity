

import { Tenant, Client, DelegatedAuthenticationConstraint, FederatedOidcProvider, FederatedOidcAuthorizationRel, PreAuthenticationState } from '@/graphql/generated/graphql-types';
import AuthDao from '@/lib/dao/auth-dao';
import ClientDao from '@/lib/dao/client-dao';
import FederatedOIDCProviderDao from '@/lib/dao/federated-oidc-provider-dao';
import ExternalOIDCProviderDao from '@/lib/dao/federated-oidc-provider-dao';
import TenantDao from '@/lib/dao/tenant-dao';
import { WellknownConfig } from '@/lib/models/wellknown-config';
import OIDCServiceClient from '@/lib/service/oidc-service-client';
import { ALL_OIDC_SUPPORTED_SCOPE_VALUES, OIDC_OPENID_SCOPE } from '@/utils/consts';
import { generateCodeVerifierAndChallenge, generateRandomToken, getAuthDaoImpl, getClientDaoImpl, getFederatedOIDCProvicerDaoImpl, getTenantDaoImpl } from '@/utils/dao-utils';
import type { NextApiRequest, NextApiResponse } from 'next'

const tenantDao: TenantDao = getTenantDaoImpl();
const clientDao: ClientDao = getClientDaoImpl();
const federatedOIDCProviderDao: FederatedOIDCProviderDao = getFederatedOIDCProvicerDaoImpl();
const authDao: AuthDao = getAuthDaoImpl();
const oidcServiceClient: OIDCServiceClient = new OIDCServiceClient();

const {
    AUTH_DOMAIN
} = process.env;

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {




}