import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { ApolloServerPluginLandingPageLocalDefault, ApolloServerPluginLandingPageProductionDefault } from '@apollo/server/plugin/landingPage/default';
import { PortalUserProfile, Tenant, typeDefs } from "@/graphql/generated/graphql-types";
import resolvers from "@/graphql/resolvers/oidc-resolvers";
import { NextApiRequest, NextApiResponse } from "next";
import { ErrorResponseBody } from "@/lib/models/error";
import JwtServiceUtils from "@/lib/service/jwt-service-utils";
import { OIDCContext } from "@/graphql/graphql-context";
import { DaoFactory } from "@/lib/data-sources/dao-factory";
import TenantDao from "@/lib/dao/tenant-dao";

const jwtServiceUtils: JwtServiceUtils = new JwtServiceUtils();
const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();

const server = new ApolloServer(
    {
        resolvers: resolvers,
        typeDefs: typeDefs,
        introspection: true,
        plugins: [
            process.env.NODE_ENV === 'production' 
                ?   ApolloServerPluginLandingPageProductionDefault({
                        graphRef: 'my-graph-id@my-graph-variant',
                        footer: false,
                    })
                :   ApolloServerPluginLandingPageLocalDefault({ footer: false })
        ]
    }
);

export default startServerAndCreateNextHandler(server, {

    context: async(req: NextApiRequest, res: NextApiResponse) => {
        return getOIDCContext(req);        
    }

});

async function getOIDCContext(req: NextApiRequest): Promise<OIDCContext> {
    const bearerToken = req.headers.authorization || null;

    let jwt: string | null = null;
    let portalUserProfile: PortalUserProfile | null = null;
 
    if(bearerToken){
        jwt = bearerToken.replace(/Bearer\s+/, "");

        const p = await jwtServiceUtils.getPortalUserProfile(jwt);
        if(p){
            portalUserProfile = p;
        }
    }

    const rootTenant: Tenant = await tenantDao.getRootTenant();

    const context: OIDCContext = {
        authToken: jwt || "",
        portalUserProfile: portalUserProfile,
        rootTenant: rootTenant,
        requestCache: new Map()
    }
    return context;
}


export const config = {
    api: {
      bodyParser: true,
    },
  };