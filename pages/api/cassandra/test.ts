import CassandraTenantDao from '@/lib/dao/impl/cassandra/cassandra-tenant-dao'
import TenantDao from '@/lib/dao/tenant-dao';
import type { NextApiRequest, NextApiResponse } from 'next'



const tenantDao: TenantDao = new CassandraTenantDao();

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    console.log(req.headers);

    const a = await tenantDao.getTenants();

    return res.json(a);
}
