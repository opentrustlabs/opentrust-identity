import { StateProvinceRegion } from "@/graphql/generated/graphql-types";


abstract class I18NDao {

    abstract getStateProvinceRegions(countryCode: string): Promise<Array<StateProvinceRegion>>;
    
}

export default I18NDao;