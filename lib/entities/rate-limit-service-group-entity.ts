import { Model, DataTypes, Sequelize } from 'sequelize';

class RateLimitServiceGroupEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof RateLimitServiceGroupEntity {
        return RateLimitServiceGroupEntity.init({
            servicegroupid: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "servicegroupid"
            },
            servicegroupname: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "servicegroupname"
            },
            servicegroupdescription: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: true,
                field: "servicegroupdescription"
            },
            markForDelete: {
                type: DataTypes.BOOLEAN,
                primaryKey: false,
                allowNull: false,
                field: "markfordelete"
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