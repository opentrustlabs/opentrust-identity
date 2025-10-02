// import { AuthenticationGroup, Client, Tenant } from '@/graphql/generated/graphql-types';
import AuthenticationGroupDao from '@/lib/dao/authentication-group-dao';
// import ClientDao from '@/lib/dao/client-dao';
import CassandraAuthenticationGroupDao from '@/lib/dao/impl/cassandra/cassandra-authentication-group-dao';
// import CassandraClientDao from '@/lib/dao/impl/cassandra/cassandra-client-dao';
// import CassandraTenantDao from '@/lib/dao/impl/cassandra/cassandra-tenant-dao'
// import TenantDao from '@/lib/dao/tenant-dao';
import type { NextApiRequest, NextApiResponse } from 'next'
// import { randomUUID } from 'node:crypto';



// const tenantDao: TenantDao = new CassandraTenantDao();
// const clientDao: ClientDao = new CassandraClientDao();
const authenticationGroupDao: AuthenticationGroupDao = new CassandraAuthenticationGroupDao();

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    // const authnGroup: AuthenticationGroup = {
    //     authenticationGroupId: randomUUID().toString(),
    //     authenticationGroupName: "Test Authn Group",
    //     defaultGroup: false,
    //     markForDelete: false,
    //     tenantId: randomUUID().toString(),
    //     authenticationGroupDescription: "Test Group Description"
    // };

    // await authenticationGroupDao.createAuthenticationGroup(authnGroup);
    // await authenticationGroupDao.assignAuthenticationGroupToClient(authnGroup.authenticationGroupId, randomUUID().toString());
    // await authenticationGroupDao.assignUserToAuthenticationGroup(randomUUID().toString(), authnGroup.authenticationGroupId);

    const g = await authenticationGroupDao.getAuthenticationGroupById("3d7af4a2-cc35-47f6-9eed-72bed8da025b");

    await authenticationGroupDao.deleteAuthenticationGroup("3d7af4a2-cc35-47f6-9eed-72bed8da025b");

    return res.json({group: g});
}
