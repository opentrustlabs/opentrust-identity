import { OIDCContext } from "@/graphql/graphql-context";
import { DaoFactory } from "../data-sources/dao-factory";
import I18NDao from "../dao/i18n-dao";
import { StateProvinceRegion } from "@/graphql/generated/graphql-types";


const i18nDao: I18NDao = DaoFactory.getInstance().getI18NDao();

class I18NService {

    oidcContext: OIDCContext;
    
    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    public async getStateProvinceRegions(countryCode: string): Promise<Array<StateProvinceRegion>> {
        return i18nDao.getStateProvinceRegions(countryCode);
    }
}

export default I18NService;