import { LookaheadResult, SearchInput, SearchResultItem, SearchResults, SearchResultType } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import { randomUUID } from 'crypto'; 


const lastnames = ["Smith", "Jones", "Hayek", "Peterson", "Pederson", "Hannsson"];
const firstNames = ["Adam", "Bob", "Casey", "David", "Edward", "Fred", "Gary"];


class SearchService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    public async search(searchInput: SearchInput): Promise<SearchResults> {

        if(searchInput.resultType === SearchResultType.Client){

        }

        const items: Array<SearchResultItem> = [];
        for(let i = 0; i < 25; i++){
            items.push({
                id: randomUUID().toString(),
                name: `${firstNames[i % firstNames.length]} ${lastnames[i % lastnames.length]}`,
                description: "",
                enabled: true,
                resultType: SearchResultType.User
            })
        }
        const now = Date.now();

        const searchResults: SearchResults = {
            endTime: now + 45,
            page: 1,
            perPage: 30,
            startTime: now,
            took: 45,
            total: 25,
            resultList: items
        }

        return searchResults;
    }

    public async lookahead(term: string): Promise<Array<LookaheadResult>> {


        return Promise.resolve([]);
    }
}

export default SearchService;