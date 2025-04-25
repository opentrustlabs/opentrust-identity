import { Model, DataTypes, Sequelize } from 'sequelize';

class UserTenantRelEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof UserTenantRelEntity {
        return UserTenantRelEntity.init({
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "tenantid"
            },
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "userid"
            },
            relType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "reltype"
            },
            enabled: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
				field: "enabled"
            }
        }, 
		{
            sequelize,
            tableName: "user_tenant_rel",
            modelName: "userTenantRel",
            timestamps: false
        });
    }
}


export default UserTenantRelEntity;