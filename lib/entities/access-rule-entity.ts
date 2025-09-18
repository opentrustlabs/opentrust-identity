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
                type: DataTypes.BLOB("long"),
                primaryKey: false,
                allowNull: false,
				field: "accessruledefinition",
                set(val: string | Buffer | null){
                    if(val === null || val === ""){
                        this.setDataValue("accessRuleDefinition", null);
                    }
                    else if(typeof val === "string"){
                        this.setDataValue("accessRuleDefinition", Buffer.from(val, "utf-8"));
                    }
                    else{
                        this.setDataValue("accessRuleDefinition", val);
                    }
                }
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