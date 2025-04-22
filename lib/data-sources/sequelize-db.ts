import { Dialect, Sequelize } from "sequelize";
import { TenantEntity2 } from "../entities/tenant-entity-2";

const {
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_NAME,
    DB_PORT,
    DB_MIN_POOL_SIZE,
    DB_MAX_POOL_SIZE,
    DB_AUTH_SCHEME,
    DB_USER_DOMAIN,
    DAO_STRATEGY
} = process.env;


declare global {
    var sequelize: Sequelize | undefined;
}

// let sequelize: Sequelize | null = null;

function getSequelizeInstance(): Sequelize {
    // If running in development and the module was hot-reloaded, preserve the instance
    if (sequelize) {
        return sequelize;
    }

    // For first time initialization or module reload during dev
    if(process.env.NODE_ENV === "development"){
        if( (module as any).hot){
            (module as any).hot.accept();
        }
    }

    console.log("will need to create a new sequelize");

    // Create Sequelize instance as usual
    let dialect: Dialect = "sqlite";
    if (DAO_STRATEGY === "postgresql") {
        dialect = "postgres";
    } else if (DAO_STRATEGY === "mysql") {
        dialect = "mysql";
    } else if (DAO_STRATEGY === "mssql") {
        dialect = "mssql";
    } else if (DAO_STRATEGY === "oracle") {
        dialect = "oracle";
    }

    sequelize = new Sequelize(
        DB_NAME || "",
        DB_USER || "",
        DB_PASSWORD,
        {
            host: DB_HOST,
            dialect,
            port: parseInt(DB_PORT || "0"),
            pool: {
                max: parseInt(DB_MAX_POOL_SIZE || "10"),
                min: parseInt(DB_MIN_POOL_SIZE || "4"),
            },
            logging: false,  // Disable logging for better performance in development
        }
    );
    TenantEntity2.initModel(sequelize);

    return sequelize;
}



class DBDriver {

    

    private constructor() {
        // NO-OP
    }


    /**
     * 
     */
    public static async getConnection(): Promise<Sequelize> {


        if(!global.sequelize){
            
            console.log("will need to create a new sequelize");
            
            let dialect: Dialect = "sqlite";
            if(DAO_STRATEGY === "postgresql"){
                dialect = "postgres";
            } 
            else if(DAO_STRATEGY === "mysql"){
                dialect = "mysql";
            } 
            else if(DAO_STRATEGY === "mssql"){
                dialect = "mssql";
            }
            else if(DAO_STRATEGY === "oracle"){
                dialect = "oracle"
            }

            global.sequelize = new Sequelize(
                DB_NAME || "",
                DB_USER || "",
                DB_PASSWORD,
                {
                    host: DB_HOST,
                    dialect: dialect,
                    port: parseInt(DB_PORT || "0"),
                    pool: {
                        max: parseInt(DB_MAX_POOL_SIZE || "10"),
                        min: parseInt(DB_MIN_POOL_SIZE || "4")
                    }
                }
            );
            TenantEntity2.initModel(global.sequelize);
            
        }
        
        

        return global.sequelize;
    }

}

export { DBDriver, TenantEntity2 };

