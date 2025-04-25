import { Model, DataTypes, Sequelize } from 'sequelize';

class TenantPasswordConfigEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof TenantPasswordConfigEntity {
        return TenantPasswordConfigEntity.init({
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "tenantid"
            },
            passwordHashingAlgorithm: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "passwordhashingalgorithm"
            },
            passwordMaxLength: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: false,
                field: "passwordmaxlength"
            },
            passwordMinLength: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: false,
                field: "passwordminlength"
            },
            requireLowerCase: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "requirelowercase"
            },
            requireNumbers: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "requirenumbers"
            },
            requireSpecialCharacters: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "requirespecialcharacters"
            },
            requireUpperCase: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "requireuppercase"
            },
            specialCharactersAllowed: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "specialcharactersallowed"
            },
            allowMfa: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "allowmfa"
            },
            mfaTypesAllowed: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "mfatypesallowed"
            },
            requireMfa: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "requiremfa"
            },
            mfaTypesRequired: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "mfatypesrequired"
            },
            maxRepeatingCharacterLength: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true,
                field: "maxrepeatingcharacterlength"
            },
            passwordRotationPeriodDays: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true,
                field: "passwordrotationperioddays"
            },
            passwordHistoryPeriod: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true,
                field: "passwordhistoryperiod"
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