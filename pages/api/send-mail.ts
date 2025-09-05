import type { NextApiRequest, NextApiResponse } from 'next'
import OIDCServiceUtils from '@/lib/service/oidc-service-utils';
import { render } from "@react-email/render";
import { VerifyRegistration } from '@/components/email-templates/verify-registration-template';
import React from "react";
import { DaoFactory } from '@/lib/data-sources/dao-factory';
import TenantDao from '@/lib/dao/tenant-dao';
import { Tenant, TenantLookAndFeel } from '@/graphql/generated/graphql-types';
import { DEFAULT_TENANT_LOOK_AND_FEEL } from '@/utils/consts';

const oidcServiceUtils: OIDCServiceUtils = new OIDCServiceUtils()
const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const rootTenant: Tenant = await tenantDao.getRootTenant();
    let tenantLookAndFeel: TenantLookAndFeel | null = await tenantDao.getTenantLookAndFeel(rootTenant.tenantId);
    if(!tenantLookAndFeel){
        tenantLookAndFeel = DEFAULT_TENANT_LOOK_AND_FEEL;
    }
   
    
    const html = await render(React.createElement(VerifyRegistration, {name: "Reggie White", token: "748392EA3", tenantLookAndFeel: tenantLookAndFeel, contactEmail: "contactus@opentrust.org"}));

    oidcServiceUtils.sendEmail("no-reply@opentrust.org", "reggie.white@opentrust.org", "Verify Email", undefined, html);

    res.status(200).setHeader("Content-Type", "text/html").write(html);
    res.end();
}