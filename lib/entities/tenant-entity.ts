import { Model, DataTypes, Sequelize } from "@sequelize/core";;

export class TenantEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof TenantEntity {
        return TenantEntity.init({
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "tenantid"
            },
            tenantName: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "tenantname"
            },
            tenantDescription: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "tenantdescription"
            },
            enabled: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false
            },
            allowUnlimitedRate: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "allowunlimitedrate"
            },
            allowUserSelfRegistration: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "allowuserselfregistration"
            },
            allowAnonymousUsers: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "allowanonymoususers"
            },
            allowSocialLogin: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "allowsociallogin"
            },
            verifyEmailOnSelfRegistration: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "verifyemailonselfregistration"
            },
            federatedAuthenticationConstraint: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "federatedauthenticationconstraint"
            },
            markForDelete: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "markfordelete"
            },
            tenantType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "tenanttype"
            },
            migrateLegacyUsers: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "migratelegacyusers"
            },
            allowLoginByPhoneNumber: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "allowloginbyphonenumber"
            },
            allowForgotPassword: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "allowforgotpassword"
            },
            defaultRateLimit: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true,
                columnName: "defaultratelimit"
            },
            defaultRateLimitPeriodMinutes: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true,
                columnName: "defaultratelimitperiodminutes"
            },
            registrationRequireCaptcha: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "registrationrequirecaptcha"
            },
            registrationRequireTermsAndConditions: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "registrationrequiretermsandconditions"
            },
            termsAndConditionsUri: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "termsandconditionsuri"
            }
        }, {
            sequelize,
            tableName: "tenant",
            modelName: "tenant",
            timestamps: false
        })
    }

}