import { Model, DataTypes, Sequelize } from 'sequelize';

export class TenantEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof TenantEntity {
        return TenantEntity.init({
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "tenantid"
            },
            tenantName: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "tenantname"
            },
            tenantDescription: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "tenantdescription"
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
                field: "allowunlimitedrate"
            },
            allowUserSelfRegistration: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "allowuserselfregistration"
            },
            allowAnonymousUsers: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "allowanonymoususers"
            },
            allowSocialLogin: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "allowsociallogin"
            },
            verifyEmailOnSelfRegistration: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "verifyemailonselfregistration"
            },
            federatedAuthenticationConstraint: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "federatedauthenticationconstraint"
            },
            markForDelete: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "markfordelete"
            },
            tenantType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "tenanttype"
            },
            migrateLegacyUsers: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "migratelegacyusers"
            },
            allowLoginByPhoneNumber: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "allowloginbyphonenumber"
            },
            allowForgotPassword: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "allowforgotpassword"
            },
            defaultRateLimit: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true,
                field: "defaultratelimit"
            },
            defaultRateLimitPeriodMinutes: {
                type: DataTypes.INTEGER,
                primaryKey: false,
                allowNull: true,
                field: "defaultratelimitperiodminutes"
            }
        }, {
            sequelize,
            tableName: "tenant",
            modelName: "tenant",
            timestamps: false
        })
    }

}