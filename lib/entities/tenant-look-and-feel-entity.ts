import { Model, DataTypes, Sequelize } from 'sequelize';

class TenantLookAndFeelEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof TenantLookAndFeelEntity {
        return TenantLookAndFeelEntity.init({
            tenantid: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "tenantid"
            },
            adminheaderbackgroundcolor: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "adminheaderbackgroundcolor"
            },
            adminheadertext: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "adminheadertext"
            },
            adminheadertextcolor: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "adminheadertextcolor"
            },
            adminlogo: {
                type: DataTypes.BLOB("long"),
                primaryKey: false,
                allowNull: true,
                field: "adminlogo",
                // set(val: string | Buffer | null){
                //     console.log("val of admin logo is: ")
                //     console.log(val);
                    
                //     if(val === null || val === ""){
                //         console.log("checkpoint 2.1")
                //         this.setDataValue("adminlogo", null);
                //     }
                //     else if(typeof val === "string"){
                //         console.log("checkpoint 2.2")
                //         this.setDataValue("adminlogo", Buffer.from(val));
                //     }
                //     else{
                //         console.log("checkpoint 1.3")
                //         this.setDataValue("adminlogo", val);
                //     }
                // }
            },
            authenticationheaderbackgroundcolor: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "authenticationheaderbackgroundcolor"
            },
            authenticationheadertext: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "authenticationheadertext"
            },
            authenticationheadertextcolor: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "authenticationheadertextcolor"
            },
            authenticationlogo: {
                type: DataTypes.BLOB("long"),
                primaryKey: false,
                allowNull: true,
                field: "authenticationlogo",
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
            },
            authenticationlogouri: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "authenticationlogouri"
            },
            authenticationlogomimetype: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "authenticationlogomimetype"
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