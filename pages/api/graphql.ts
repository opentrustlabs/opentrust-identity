import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { ApolloServerPluginLandingPageLocalDefault, ApolloServerPluginLandingPageProductionDefault } from '@apollo/server/plugin/landingPage/default';
import { typeDefs } from "@/graphql/generated/graphql-types";
import resolvers from "@/graphql/resolvers/oidc-resolvers";
import { NextApiRequest, NextApiResponse } from "next";
import { ErrorResponseBody } from "@/lib/models/error";


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
                
        return {
            authToken: "auth token here",
            requestCache: new Map()
        }
    }

});

export const config = {
    api: {
      bodyParser: true,
    },
  };