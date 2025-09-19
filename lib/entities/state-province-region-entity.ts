import { Model, DataTypes, Sequelize } from "@sequelize/core";

export class StateProvinceRegionEntity extends Model {
    
    static initModel(sequelize: Sequelize): typeof StateProvinceRegionEntity {
        return StateProvinceRegionEntity.init({
            isoCountryCode: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "isocountrycode"
            },
            isoEntryCode: {
                type: DataTypes.STRING,
                primaryKey: true,
                columnName: "isoentrycode"
            },
            isoEntryName: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "isoentryname"
            },
            isoSubsetType: {
                type: DataTypes.STRING,
                primaryKey: false,
                allowNull: false,
                columnName: "isosubsettype"
            }
        }, {
            sequelize,
            tableName: "state_province_region",
            modelName: "stateProvinceRegion",
            timestamps: false
        })
    }

}