import { Model, DataTypes, Sequelize } from "@sequelize/core";

class UserTenantRelEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof UserTenantRelEntity {
        return UserTenantRelEntity.init({
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "tenantid"
            },
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "userid"
            },
            relType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "reltype"
            },
            enabled: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
				columnName: "enabled"
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