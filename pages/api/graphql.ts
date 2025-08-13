import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { ApolloServerPluginLandingPageLocalDefault, ApolloServerPluginLandingPageProductionDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloServerErrorCode } from '@apollo/server/errors';
import { PortalUserProfile, Tenant, typeDefs } from "@/graphql/generated/graphql-types";
import resolvers from "@/graphql/resolvers/oidc-resolvers";
import { NextApiRequest, NextApiResponse } from "next";
import { ERROR_CODES, ErrorDetail, ErrorResponseBody } from "@/lib/models/error";
import JwtServiceUtils from "@/lib/service/jwt-service-utils";
import { OIDCContext } from "@/graphql/graphql-context";
import { DaoFactory } from "@/lib/data-sources/dao-factory";
import TenantDao from "@/lib/dao/tenant-dao";
import { initSchedulers } from "@/lib/service/init-scheduled-services";
import { HTTP_HEADER_X_GEO_LOCATION, HTTP_HEADER_X_IP_ADDRESS } from "@/utils/consts";


declare global {
    var schedulerInitialized: boolean | undefined;
}

const {
    ALLOW_GRAPHQL_INTROSPECTION,
    ALLOW_GRAPHQL_ERROR_STACK_TRACES
} = process.env;

/**
 * Why is this funciton call here an not in the instrumentation.ts file at the root of 
 * the project? Good question. It was not possible to properly instantiate database
 * connections or use any of the crypto libraries, even when the NEXT_RUNTIME value
 * was set to "nodejs". There are a number of questions/complaints to the Vercel team
 * about why it was not working correctly for a number of common initialization 
 * scenarios. At this point in the code, the server should be correctly up-and-running,
 * and since this is a common point of entry for almost anything that the app needs
 * to do, it was the next-best place to put the initialization code.
 */
if(!global.schedulerInitialized){
    initSchedulers();
    global.schedulerInitialized = true;
}

const jwtServiceUtils: JwtServiceUtils = new JwtServiceUtils();
const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const allowErrorStackTraces: boolean = ALLOW_GRAPHQL_ERROR_STACK_TRACES && ALLOW_GRAPHQL_ERROR_STACK_TRACES === "true" ? false : true;


const server = new ApolloServer(
    {
        resolvers: resolvers,
        typeDefs: typeDefs,
        introspection: ALLOW_GRAPHQL_INTROSPECTION && ALLOW_GRAPHQL_INTROSPECTION === "true" ? true : false,
        includeStacktraceInErrorResponses: ALLOW_GRAPHQL_ERROR_STACK_TRACES && ALLOW_GRAPHQL_ERROR_STACK_TRACES === "true" ? true : false,
        plugins: [
            process.env.NODE_ENV === 'production' 
                ?   ApolloServerPluginLandingPageProductionDefault({
                        graphRef: 'my-graph-id@my-graph-variant',
                        footer: false,
                    })
                :   ApolloServerPluginLandingPageLocalDefault({ footer: false })
        ],
        formatError(formattedError) {
            if(formattedError && formattedError.extensions?.code === ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED){
                return {
                    ...formattedError, 
                    message: "Your query does not match the graphql schema."
                }
            }
            const errorDetail: ErrorDetail | null = ERROR_CODES[formattedError?.message] || ERROR_CODES.DEFAULT;
            if(formattedError && formattedError.extensions?.lang){                
                return {
                    ...formattedError, 
                    extensions: {
                        errorCode: errorDetail.errorCode,
                        errorMessage: errorDetail.errorMessage,
                        errorKey: errorDetail.errorKey,
                        lang: formattedError.extensions?.lang
                    },
                    message: errorDetail.errorMessage // TODO => i18N.translate(errorDetail.errorKey)
                }
            }            
            return {
                ...formattedError,
                extensions: {
                    errorCode: errorDetail.errorCode,
                    errorMessage: errorDetail.errorMessage,
                    errorKey: errorDetail.errorKey,
                    lang: "en"
                },
                message: errorDetail.errorMessage
            }
        },
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

    const ipAddress: string = req.headers[HTTP_HEADER_X_IP_ADDRESS] as string || "";
    const geoLocation: string = req.headers[HTTP_HEADER_X_GEO_LOCATION] as string || ""

    const rootTenant: Tenant = await tenantDao.getRootTenant();

    const context: OIDCContext = {
        authToken: jwt || "",
        portalUserProfile: portalUserProfile,
        rootTenant: rootTenant,
        requestCache: new Map(),
        ipAddress: ipAddress,
        geoLocation: geoLocation,
        deviceFingerPrint: null
    }
    return context;
}


export const config = {
    api: {
      bodyParser: true,
    },
  };