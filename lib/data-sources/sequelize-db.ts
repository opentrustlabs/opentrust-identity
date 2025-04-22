import { Dialect, Sequelize } from "sequelize";
import { TenantEntity2 } from "../entities/tenant-entity-2";
import ContactEntity2 from "../entities/contact-entity-2";

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
    RDB_DIALECT
} = process.env;


declare global {
    var sequelize: Sequelize | undefined;
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
            
            let dialect: Dialect | null = null; 
            
            if(RDB_DIALECT === "postgres"){
                dialect = "postgres";
            } 
            else if(RDB_DIALECT === "mysql"){
                dialect = "mysql";
            } 
            else if(RDB_DIALECT === "mssql"){
                dialect = "mssql";
            }
            else if(RDB_DIALECT === "oracle"){
                dialect = "oracle"
            }

            if(dialect === null){
                throw new Error("ERROR_MUST_PROVIDE_VALID_DIALECT_FOR_RELATION_DATABASE_CONNECTION");
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
            ContactEntity2.initModel(global.sequelize);
        } 

        return global.sequelize;
    }

}

export { DBDriver, TenantEntity2, ContactEntity2 };

