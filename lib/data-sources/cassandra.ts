
import cassandra from "cassandra-driver";
import { TENANT_MODEL } from "../cassandra-mappings/mappings";
import { logWithDetails } from "../logging/logger";


const {
    CASSANDRA_CONTACT_POINTS,
    CASSANDRA_KEY_SPACE,
    CASSANDRA_LOCAL_DATA_CENTER,
    CASSANDRA_USERNAME,
    CASSANDRA_PASSWORD
} = process.env;

declare global {
    // eslint-disable-next-line no-var
    var cassandraClient: cassandra.Client | undefined;
    var mapper:  cassandra.mapping.Mapper | undefined;
}


class CassandraDriver {

    private static instance: CassandraDriver;


    private constructor() {
        // NO-OP
    }

    public static getInstance(): CassandraDriver {
        if (!CassandraDriver.instance) {
            CassandraDriver.instance = new CassandraDriver();            
        }
        return CassandraDriver.instance;
    }

    public async getModelMapper(modelName: string): Promise<cassandra.mapping.ModelMapper> {
        const m: cassandra.mapping.Mapper = await CassandraDriver.getMapper();
        return m.forModel(modelName);
    }

    public static async getMapper(): Promise<cassandra.mapping.Mapper> {        
        if(!global.mapper){
            const client: cassandra.Client = await CassandraDriver.getClient();
            global.mapper = new cassandra.mapping.Mapper(
                client,
                {
                    models: {
                        ...TENANT_MODEL
                    }
                }
            );
        }
        return global.mapper;
    }

    public static async getClient(): Promise<cassandra.Client> {
        if (!global.cassandraClient){

            const authProvider = new cassandra.auth.PlainTextAuthProvider(CASSANDRA_USERNAME || "", CASSANDRA_PASSWORD || "");
            global.cassandraClient = new cassandra.Client({
                contactPoints: CASSANDRA_CONTACT_POINTS?.split(","),
                localDataCenter: CASSANDRA_LOCAL_DATA_CENTER,
                keyspace: CASSANDRA_KEY_SPACE,
                authProvider: authProvider
            });           
            try{
                global.cassandraClient.connect();
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            catch(err: any){
                logWithDetails("error", `Error connecting to Cassandra: ${err.message}`, {});
            }

        }
        return global.cassandraClient;
    }

}




export default CassandraDriver;