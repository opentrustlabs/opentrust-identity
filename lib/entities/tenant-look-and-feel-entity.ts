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
                type: DataTypes.BLOB,
                primaryKey: false,
                allowNull: true,
                field: "adminlogo"
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
                type: DataTypes.BLOB,
                primaryKey: false,
                allowNull: true,
                field: "authenticationlogo"
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