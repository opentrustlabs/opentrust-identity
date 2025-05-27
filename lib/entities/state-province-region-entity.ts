import { Model, DataTypes, Sequelize } from 'sequelize';

export class StateProvinceRegionEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof StateProvinceRegionEntity {
        return StateProvinceRegionEntity.init({
            isoCountryCode: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "isocountrycode"
            },
            isoEntryCode: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: "isoentrycode"
            },
            isoEntryName: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "isoentryname"
            },
            isoSubsetType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                field: "isosubsettype"
            }
        }, {
            sequelize,
            tableName: "state_province_region",
            modelName: "stateProvinceRegion",
            timestamps: false
        })
    }

}