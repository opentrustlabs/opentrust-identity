import { TenantLookAndFeel } from '@/graphql/generated/graphql-types';
import TenantDao from '@/lib/dao/tenant-dao';
import { DaoFactory } from '@/lib/data-sources/dao-factory';
import type { NextApiRequest, NextApiResponse } from 'next'

const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();

const EMPTY_LOGO = "<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>";
const DEFAULT_CONTENT_TYPE = "image/svg+xml";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const { 
        tenant_id
    } = req.query;


    let logo = EMPTY_LOGO;
    const contentType = DEFAULT_CONTENT_TYPE;
    const tenantLookAndFeel: TenantLookAndFeel | null = await tenantDao.getTenantLookAndFeel(tenant_id as string || "");
    if(tenantLookAndFeel){
        logo = tenantLookAndFeel.authenticationlogo || EMPTY_LOGO;        
    }

    // const f: Buffer = readFileSync("C:\\Users\\David\\Downloads\\mc-logo-52.svg");

    res.setHeader("Content-Type", contentType); // image/svg+xm
    res.setHeader("Content-Length", logo.length);    
    res.write(logo);
    res.end();

}