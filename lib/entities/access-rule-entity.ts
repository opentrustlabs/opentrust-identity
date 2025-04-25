import { Model, DataTypes, Sequelize } from 'sequelize';

class AccessRuleEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof AccessRuleEntity {
        return AccessRuleEntity.init({
            accessRuleId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "accessruleid"
            },
            accessRuleName: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "accessrulename"
            },
            scopeAccessRuleSchemaId: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "scopeconstraintschemaid"
            },
            accessRuleDefinition: {
                type: DataTypes.BLOB,
                primaryKey: false,
                allowNull: false,
				field: "accessruledefinition"
            }
        }, 
		{
            sequelize,
            tableName: "access_rule",
            modelName: "accessRule",
            timestamps: false
        });
    }
}


export default AccessRuleEntity;