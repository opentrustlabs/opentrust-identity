import { Model, DataTypes, Sequelize } from "@sequelize/core";

class TenantPasswordConfigEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof TenantPasswordConfigEntity {
        return TenantPasswordConfigEntity.init({
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "tenantid"
            },
            passwordHashingAlgorithm: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "passwordhashingalgorithm"
            },
            passwordMaxLength: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: false,
                columnName: "passwordmaxlength"
            },
            passwordMinLength: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: false,
                columnName: "passwordminlength"
            },
            requireLowerCase: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "requirelowercase"
            },
            requireNumbers: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "requirenumbers"
            },
            requireSpecialCharacters: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "requirespecialcharacters"
            },
            requireUpperCase: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "requireuppercase"
            },
            specialCharactersAllowed: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "specialcharactersallowed"
            },
            requireMfa: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "requiremfa"
            },
            mfaTypesRequired: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "mfatypesrequired"
            },
            maxRepeatingCharacterLength: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true,
                columnName: "maxrepeatingcharacterlength"
            },
            passwordRotationPeriodDays: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true,
                columnName: "passwordrotationperioddays"
            },
            passwordHistoryPeriod: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true,
                columnName: "passwordhistoryperiod"
            }
        }, {
            sequelize,
            tableName: "tenant_password_config",
            modelName: "tenantPasswordConfig",
            timestamps: false
        })
    }
}    
    

export default TenantPasswordConfigEntity;