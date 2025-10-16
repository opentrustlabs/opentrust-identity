import { EntitySchema } from 'typeorm';

export const StateProvinceRegionEntity = new EntitySchema({


    columns: {
        isoCountryCode: {
            type: String,
            primary: true,
            name: "isocountrycode"
        },
        isoEntryCode: {
            type: String,
            primary: true,
            name: "isoentrycode"
        },
        isoEntryName: {
            type: String,
            primary: false,
            nullable: false,
            name: "isoentryname"
        },
        isoSubsetType: {
            type: String,
            primary: false,
            nullable: false,
            name: "isosubsettype"
        }
    },
    tableName: "state_province_region",
    name: "stateProvinceRegion",

});

export default StateProvinceRegionEntity;