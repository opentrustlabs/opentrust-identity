import { StateProvinceRegion } from "@/graphql/generated/graphql-types";
import I18NDao from "../../i18n-dao";
import CassandraDriver from "@/lib/data-sources/cassandra";


class CassandraI18NDao extends I18NDao {

    public async getStateProvinceRegions(countryCode: string): Promise<Array<StateProvinceRegion>> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("state_province_region");
        const results = await mapper.find({
            isoCountryCode: countryCode
        });
        return results.toArray();        
    }

}

export default CassandraI18NDao;