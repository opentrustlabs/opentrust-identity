import { StateProvinceRegion } from "@/graphql/generated/graphql-types";
import I18NDao from "../../i18n-dao";
import RDBDriver from "@/lib/data-sources/rdb";

class DBI18NDao extends I18NDao {


    public async getStateProvinceRegions(countryCode: string): Promise<Array<StateProvinceRegion>> {
        const stateProvinceRegionRepo = await RDBDriver.getInstance().getStateProvinceRegionRepository();
        const arr = await stateProvinceRegionRepo.find({
            where: {
                isoCountryCode: countryCode
            },
            order: {
                isoEntryName: "ASC"
            }
        });
        return arr;
    }
}

export default DBI18NDao;