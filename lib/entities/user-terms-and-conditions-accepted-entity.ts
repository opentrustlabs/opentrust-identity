import { Model, DataTypes, Sequelize } from "@sequelize/core";

class UserTermsAndConditionsAcceptedEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof UserTermsAndConditionsAcceptedEntity {
        return UserTermsAndConditionsAcceptedEntity.init({
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "userid"
            },
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: true,
                allowNull: false,
                columnName: "tenantid"
            },
            acceptedAtMs: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
                columnName: "acceptedatms"
            }
        }, 
        {
            sequelize,
            tableName: "user_terms_and_conditions_accepted",
            modelName: "userTermsAndConditionsAccepted",
            timestamps: false
        });
    }
}


export default UserTermsAndConditionsAcceptedEntity;