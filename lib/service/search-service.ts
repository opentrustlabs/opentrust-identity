import { LookaheadResult, SearchInput, SearchResultItem, SearchResults, SearchResultType } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import { randomUUID } from 'crypto'; 
import { getOpenSearchClient } from "../data-sources/search";
import { Client } from "@opensearch-project/opensearch";
import { Search_Response } from "@opensearch-project/opensearch/api/index.js";


const lastnames = ["Smith", "Jones", "Hayek", "Peterson", "Pederson", "Hannsson"];
const firstNames = ["Adam", "Bob", "Casey", "David", "Edward", "Fred", "Gary"];

const MAX_PAGE_SIZE=500;
const MIN_PAGE_SIZE=10;
const MAX_PAGE=1000

const client: Client = getOpenSearchClient();

class SearchService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    public async search(searchInput: SearchInput): Promise<SearchResults> {

        let page: number = searchInput.page;
        let perPage: number = searchInput.perPage;
        let searchTerm = searchInput.term;
        const sortDirection = searchInput.sortDirection ? searchInput.sortDirection : "asc";
        const sortField = searchInput.sortField ? searchInput.sortField : "name";
        
        if(page < 1 || page > MAX_PAGE){
            page = 1;
        }
        if(perPage > MAX_PAGE_SIZE){
            perPage = MAX_PAGE_SIZE;
        }
        if(perPage < MIN_PAGE_SIZE){
            perPage = MIN_PAGE_SIZE;
        }

        const start = Date.now();

        const searchResults: SearchResults = {
            endTime: 0,
            page: page,
            perPage: perPage,
            startTime: start,
            took: 0,
            total: 0,
            resultList: []
        }   

        let items: Array<SearchResultItem> = [];

        if(searchInput.resultType === SearchResultType.User){
            
            for(let i = 0; i < perPage; i++){
                items.push({
                    objectId: randomUUID().toString(),
                    name: searchTerm && searchTerm.length >= 3 ? `Fred ${lastnames[(i + page) % lastnames.length]}` : `${firstNames[ (i + page)  % firstNames.length]} ${lastnames[(i + page) % lastnames.length]}`,
                    description: "",
                    enabled: true,
                    objectType: SearchResultType.User
                })
            }
        }
        if(searchInput.resultType === SearchResultType.Tenant){

            // if(!searchTerm){

            // }
            console.log("will do es query")
            const query: any = {
                from: (page - 1) * perPage,
                size: perPage,
                query: {
                    match_all: {

                    }
                },
                sort: [{
                    "name.raw": {
                        order: sortDirection
                    }
                }]
            }

            const searchResponse: Search_Response = await client.search({
                index: "object_search",
                body: query
            })
            console.log(searchResponse.statusCode);

            console.log(JSON.stringify(searchResponse.body));

            //return response.body.hits.hits.map((hit: any) => hit._source as MyDocument);
            const total = searchResponse.body.hits.total?.valueOf();
            if(typeof total === "number"){

            }
            else{
                // total.value
            }
            console.log(total);

            items = searchResponse.body.hits.hits.map(
                (hit: any) => {
                    const source: any = hit._source;
                    console.log(hit)
                    const item: SearchResultItem = {
                        name: source.name,
                        description: source.description,
                        email: source.email,
                        objectId: source.objectid,
                        objectType: source.objecttype,
                        enabled: source.enabled,
                        owningClientId: source.owningclientid,
                        owningTenantId: source.owningtenantid,
                        subType: source.subtype,
                        subTypeKey: source.subtypekey
                    }
                    return item;
                }
            )

        }

        const end = Date.now();
        searchResults.resultList = items;
        searchResults.endTime = end;
        searchResults.took = end - start;
        searchResults.total = 3478;

        return searchResults;

        
    }

    public async lookahead(term: string): Promise<Array<LookaheadResult>> {


        return Promise.resolve([]);
    }
}

export default SearchService;