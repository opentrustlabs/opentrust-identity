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
        const page: number = searchInput.page;
        const perPage: number = searchInput.perPage;
        const searchTerm = searchInput.term;


        const items: Array<SearchResultItem> = [];
        for(let i = 0; i < perPage; i++){
            items.push({
                objectId: `page ${page + 1} -> row ${i + 1}`,
                name: searchTerm && searchTerm.length >= 3 ? `Fred ${lastnames[(i + page) % lastnames.length]}` : `${firstNames[ (i + page)  % firstNames.length]} ${lastnames[(i + page) % lastnames.length]}`,
                description: "",
                enabled: true,
                objectType: SearchResultType.User
            })
        }
        const now = Date.now();

        const searchResults: SearchResults = {
            endTime: now + 45,
            page: 1,
            perPage: 30,
            startTime: now,
            took: 45,
            total: searchTerm && searchTerm.length > 3 ? 234 : 3456,
            resultList: items
        }

        return searchResults;
    }

    public async lookahead(term: string): Promise<Array<LookaheadResult>> {


        return Promise.resolve([]);
    }
}

export default SearchService;