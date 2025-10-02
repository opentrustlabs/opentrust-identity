import { StateProvinceRegion } from "@/graphql/generated/graphql-types";
import I18NDao from "../../i18n-dao";
import DBDriver from "@/lib/data-sources/sequelize-db";
import { StateProvinceRegionEntity } from "@/lib/entities/state-province-region-entity";



class DBI18NDao extends I18NDao {


    public async getStateProvinceRegions(countryCode: string): Promise<Array<StateProvinceRegion>> {
        const arr: Array<StateProvinceRegionEntity> = await (await DBDriver.getInstance().getStateProvinceRegionEntity()).findAll({
            where: {
                isoCountryCode: countryCode
            }, 
            order: [
                ["isoEntryName", "ASC"]
            ]
        });
        return arr.map(
            (e: StateProvinceRegionEntity) => e.dataValues
        )
    }

}

export default DBI18NDao;