import { LookaheadResult, SearchFilterInput, SearchFilterInputObjectType, SearchInput, SearchResultItem, SearchResults, SearchResultType } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import { getOpenSearchClient } from "../data-sources/search";
import { Client } from "@opensearch-project/opensearch";
import { Search_Response } from "@opensearch-project/opensearch/api/index.js";
import { ALLOWED_OBJECT_SEARCH_SORT_FIELDS, ALLOWED_SEARCH_DIRECTIONS, MAX_SEARCH_PAGE, MAX_SEARCH_PAGE_SIZE, MIN_SEARCH_PAGE_SIZE } from "@/utils/consts";


const lastnames = ["Smith", "Jones", "Hayek", "Peterson", "Pederson", "Hannsson"];
const firstNames = ["Adam", "Bob", "Casey", "David", "Edward", "Fred", "Gary"];


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
        const sortDirection = searchInput.sortDirection && ALLOWED_SEARCH_DIRECTIONS.includes(searchInput.sortDirection) ? searchInput.sortDirection : "asc";
        const sortField = searchInput.sortField && ALLOWED_OBJECT_SEARCH_SORT_FIELDS.includes(searchInput.sortField) ? searchInput.sortField : "name";
        
        if(page < 1 || page > MAX_SEARCH_PAGE){
            page = 1;
        }
        if(perPage > MAX_SEARCH_PAGE_SIZE){
            perPage = MAX_SEARCH_PAGE_SIZE;
        }
        if(perPage < MIN_SEARCH_PAGE_SIZE){
            perPage = MIN_SEARCH_PAGE_SIZE;
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

        let query: any = {
            bool: {
                must: {},
                filter: []
            }
        }
        if(!searchTerm || searchTerm.length < 3){
            query.bool.must = {
                match_all: {}
            }
        }
        else{
            query.bool.must = {
                multi_match: {
                    query: searchTerm,
                    fields: ["name^8", "description^4", "email^2", "name_as", "description_as", "email_as"]
                }
            }
        }

        if(searchInput.resultType){
            query.bool.filter.push(
                {
                    term: { objecttype: searchInput.resultType }

                }
            );
        }

        if(searchInput.filters && searchInput.filters.length > 0){            
            const f: SearchFilterInput | null = searchInput.filters[0];
            if(f?.objectType === SearchFilterInputObjectType.TenantId){
                query.bool.filter.push(
                    {
                        term: { owningtenantid: f.objectValue}
                    }
                )
            }            
        }
        
        const sortObj: any = {};
        sortObj[`${sortField}.raw`] = { order: sortDirection};

        const searchBody: any = {
            from: (page - 1) * perPage,
            size: perPage,
            query: query,
            sort: [sortObj],
            highlight: {
                fields: {
                    name: {},
                    description: {},
                    email: {}
                }
            }
        }

        const searchResponse: Search_Response = await client.search({
            index: "object_search",
            body: searchBody
        });

        let total: number = 0;
        const totalValueOf = searchResponse.body.hits.total?.valueOf();
        if(totalValueOf){
            if(typeof totalValueOf === "number"){
                total = totalValueOf;
            }
            else{
                total = (totalValueOf as any).value;
            }
        }
        console.log(totalValueOf);

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
        );

        const end = Date.now();
        searchResults.resultList = items;
        searchResults.endTime = end;
        searchResults.took = end - start;
        searchResults.total = total;

        return searchResults;        
    }

    public async lookahead(term: string): Promise<Array<LookaheadResult>> {


        return Promise.resolve([]);
    }
}

export default SearchService;