import { Client, Tenant } from '@/graphql/generated/graphql-types';
import ClientDao from '@/lib/dao/client-dao';
import CassandraClientDao from '@/lib/dao/impl/cassandra/cassandra-client-dao';
import CassandraTenantDao from '@/lib/dao/impl/cassandra/cassandra-tenant-dao'
import TenantDao from '@/lib/dao/tenant-dao';
import type { NextApiRequest, NextApiResponse } from 'next'
import { randomUUID } from 'node:crypto';



const tenantDao: TenantDao = new CassandraTenantDao();
const clientDao: ClientDao = new CassandraClientDao();

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    console.log(req.headers);

    const a = await tenantDao.getTenants(["58203718-2396-4d77-974a-cee7582b0121"]);
    console.log(a);

    const client: Client = {
        clientId: randomUUID().toString(),
        clientName: `Test Client - ${randomUUID().toString()}`,
        clientSecret: "df72889374982793874lkjsdlkjf",
        clientType: "SERVIICES",
        enabled: true,
        markForDelete: false,
        oidcEnabled: true,
        pkceEnabled: false,
        tenantId: "58203718-2396-4d77-974a-cee7582b0121",
        clientDescription: "Testing Cassandra I/O",
        clientTokenTTLSeconds: 600,
        maxRefreshTokenCount: 250,
        userTokenTTLSeconds: 84400
    }

    await clientDao.createClient(client);

    const t: Tenant | null = await tenantDao.getTenantById("58203718-2396-4d77-974a-cee7582b0121");
    const t2: Tenant | null = await tenantDao.getTenantById("58203718-2396-4d77-974a-cee7582b0122");

    return res.json({tenantList: a, client: client, t: t, t2: t2});
}
