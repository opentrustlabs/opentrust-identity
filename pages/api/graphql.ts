import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { ApolloServerPluginLandingPageLocalDefault, ApolloServerPluginLandingPageProductionDefault } from '@apollo/server/plugin/landingPage/default';
import { Tenant, typeDefs } from "@/graphql/generated/graphql-types";
import resolvers from "@/graphql/resolvers/oidc-resolvers";
import { NextApiRequest, NextApiResponse } from "next";
import { ErrorResponseBody } from "@/lib/models/error";
import JwtServiceUtils from "@/lib/service/jwt-service-utils";
import { OIDCContext } from "@/graphql/graphql-context";
import { DaoFactory } from "@/lib/data-sources/dao-factory";
import TenantDao from "@/lib/dao/tenant-dao";
import { OIDCPrincipal } from "@/lib/models/principal";

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
    let principal: OIDCPrincipal | null = null;
    //  = {
    //     sub: "",
    //     iss: "",
    //     aud: "",
    //     iat: 0,
    //     exp: 0,
    //     at_hash: "",
    //     name: "",
    //     given_name: "",
    //     family_name: "",
    //     middle_name: "",
    //     nickname: "",
    //     preferred_username: "",
    //     profile: "",
    //     phone_number: "",
    //     address: "",
    //     updated_at: "",
    //     email: "",
    //     country_code: "",
    //     language_code: "",
    //     jwt_id: "",
    //     tenant_id: "",
    //     tenant_name: "",
    //     client_id: "",
    //     client_name: "",
    //     client_type: "",
    //     token_type: ""
    // }

    if(bearerToken){
        jwt = bearerToken.replace(/Bearer\s+/, "");
        const p = await jwtServiceUtils.validateJwt(jwt);
        if(p){
            principal = p;
        }
    }

    const rootTenant: Tenant = await tenantDao.getRootTenant();

    const context: OIDCContext = {
        authToken: jwt || "",
        oidcPrincipal: principal,
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