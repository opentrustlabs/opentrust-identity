import { Model, DataTypes, Sequelize } from "@sequelize/core";

class TenantAnonymousUserConfigurationEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof TenantAnonymousUserConfigurationEntity {
        return TenantAnonymousUserConfigurationEntity.init({
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "tenantid"
            },
            defaultcountrycode: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "defaultcountrycode"
            },
            defaultlanguagecode: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "defaultlanguagecode"
            },
            tokenttlseconds: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true,
                columnName: "tokenttlseconds"
            }
        },
        {            
            sequelize,
            tableName: "tenant_anonymous_user_configuration",
            modelName: "tenantAnonymousUserConfiguration",
            timestamps: false
            
        }
    );}
}

export default TenantAnonymousUserConfigurationEntity;