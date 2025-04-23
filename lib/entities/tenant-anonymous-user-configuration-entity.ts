import { Model, DataTypes, Sequelize } from 'sequelize';

class TenantAnonymousUserConfigurationEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof TenantAnonymousUserConfigurationEntity {
        return TenantAnonymousUserConfigurationEntity.init({
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "tenantid"
            },
            defaultcountrycode: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "defaultcountrycode"
            },
            defaultlangugecode: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "defaultlangugecode"
            },
            tokenttlseconds: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true
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