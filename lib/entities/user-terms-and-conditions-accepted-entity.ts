import { Model, DataTypes, Sequelize } from 'sequelize';

class UserTermsAndConditionsAcceptedEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof UserTermsAndConditionsAcceptedEntity {
        return UserTermsAndConditionsAcceptedEntity.init({
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "userid"
            },
            tenantId: {
                type: DataTypes.STRING,
                primaryKey: true,
                allowNull: false,
                field: "tenantid"
            },
            acceptedAtMs: {
                type: DataTypes.BIGINT,
                primaryKey: false,
                allowNull: false,
                field: "acceptedatms"
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