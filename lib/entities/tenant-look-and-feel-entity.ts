import { Model, DataTypes, Sequelize } from "@sequelize/core";

class TenantLookAndFeelEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof TenantLookAndFeelEntity {
        return TenantLookAndFeelEntity.init({
            tenantid: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "tenantid"
            },
            adminheaderbackgroundcolor: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "adminheaderbackgroundcolor"
            },
            adminheadertext: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "adminheadertext"
            },
            adminheadertextcolor: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "adminheadertextcolor"
            },            
            authenticationheaderbackgroundcolor: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "authenticationheaderbackgroundcolor"
            },
            authenticationheadertext: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "authenticationheadertext"
            },
            authenticationheadertextcolor: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "authenticationheadertextcolor"
            },
           
            authenticationlogouri: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "authenticationlogouri"
            },
            authenticationlogomimetype: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "authenticationlogomimetype"
            },            
             authenticationlogo: {
                type: DataTypes.BLOB("long"),
                primaryKey: false,
                allowNull: true,
                columnName: "authenticationlogo",
                // set(val: string | Buffer | null){
                //     console.log("val of authentication logo is: ")
                //     console.log(val);

                //     if(val === null || val === ""){
                //         console.log("checkpoint 1.1")
                //         this.setDataValue("authenticationlogo", null);
                //     }
                //     else if(typeof val === "string"){
                //         console.log("checkpoint 1.2")
                //         this.setDataValue("authenticationlogo", Buffer.from(val));
                //     }
                //     else{
                //         console.log("checkpoint 1.3")
                //         this.setDataValue("authenticationlogo", val);
                //     }
                // }
            }
        }, {
            sequelize,
            tableName: "tenant_look_and_feel",
            modelName: "tenantLookAndFeel",
            timestamps: false
        });
    }
}

export default TenantLookAndFeelEntity;