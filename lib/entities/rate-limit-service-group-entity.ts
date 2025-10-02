import { Model, DataTypes, Sequelize } from "@sequelize/core";

class RateLimitServiceGroupEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof RateLimitServiceGroupEntity {
        return RateLimitServiceGroupEntity.init({
            servicegroupid: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "servicegroupid"
            },
            servicegroupname: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "servicegroupname"
            },
            servicegroupdescription: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                columnName: "servicegroupdescription"
            },
            markForDelete: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                columnName: "markfordelete"
            }
        }, 
		{
            sequelize,
            tableName: "rate_limit_service_group",
            modelName: "rateLimitServiceGroup",
            timestamps: false
        });
    }
}

export default RateLimitServiceGroupEntity;