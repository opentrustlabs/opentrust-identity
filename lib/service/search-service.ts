import { LookaheadResult, ObjectSearchResults, SearchFilterInput, SearchFilterInputObjectType, SearchInput, ObjectSearchResultItem, RelSearchResults, RelSearchInput, RelSearchResultItem, SearchRelType, SearchResultType } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import { getOpenSearchClient } from "../data-sources/search";
import { Client } from "@opensearch-project/opensearch";
import { Search_Response } from "@opensearch-project/opensearch/api/index.js";
import { ALLOWED_OBJECT_SEARCH_SORT_FIELDS, ALLOWED_SEARCH_DIRECTIONS, MAX_SEARCH_PAGE, MAX_SEARCH_PAGE_SIZE, MIN_SEARCH_PAGE_SIZE, SEARCH_INDEX_OBJECT_SEARCH, SEARCH_INDEX_REL_SEARCH } from "@/utils/consts";


// The opensearch javascript client api documentation and boolean query documentation: 
// 
// https://opensearch.org/docs/latest/clients/javascript/index
// https://opensearch.org/docs/latest/query-dsl/compound/bool/
// 

const client: Client = getOpenSearchClient();

class SearchService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    public async search(searchInput: SearchInput): Promise<ObjectSearchResults> {

        let page: number = searchInput.page;
        let perPage: number = searchInput.perPage;
        let searchTerm = searchInput.term;

        // Make sure all of the search parameters are set to sensible values
        const sortDirection = searchInput.sortDirection && ALLOWED_SEARCH_DIRECTIONS.includes(searchInput.sortDirection) ? searchInput.sortDirection : null;
        const sortField = searchInput.sortField && ALLOWED_OBJECT_SEARCH_SORT_FIELDS.includes(searchInput.sortField) ? searchInput.sortField : null;
        if(page < 1 || page > MAX_SEARCH_PAGE){
            page = 1;
        }
        if(perPage > MAX_SEARCH_PAGE_SIZE){
            perPage = MAX_SEARCH_PAGE_SIZE;
        }
        if(perPage < MIN_SEARCH_PAGE_SIZE){
            perPage = MIN_SEARCH_PAGE_SIZE;
        }

        // Start the timer
        const start = Date.now();

        // Default result list is am empty array
        let items: Array<ObjectSearchResultItem> = [];

        // Build the BOOLEAN query, both in cases where there is a search term and where
        // there is not. We will almost always need to some kind of filters, whether for
        // object type (tenant vs client vs user vs oidc provider vs ...) or for the
        // tenant in which the user resides.
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
            // Ignore the email fields if there is no search type. This will potentially match
            // too many records if search by an organization name.
            const fields: Array<string> = searchInput.resultType ? 
                    ["name^8", "description^4", "email^2", "name_as", "description_as", "email_as"] :
                    ["name^8", "description^4", "name_as", "description_as"]
            query.bool.must = {
                multi_match: {
                    query: searchTerm,
                    fields: fields
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

        // If there are filter terms, these should be added to the search query
        // with and OR clause, i.e., adding a boolean should query to the 
        // filter list.
        if(searchInput.filters && searchInput.filters.length > 0){
            query.bool.filter.push(
                {
                    bool: {
                        should: []
                    }
                }
            );

            searchInput.filters.forEach(
                (f: SearchFilterInput | null) => {
                    // Only supports OR queries by tenant id for the moment. 
                    if(f?.objectType === SearchFilterInputObjectType.TenantId){
                        query.bool.filter[query.bool.filter.length - 1].bool.should.push(
                            {
                                term: { owningtenantid: f.objectValue}
                            }
                        )
                    }
                }
            )         
        }
        
        const sortObj: any = {};
        if(sortDirection && sortField){
            sortObj[`${sortField}.raw`] = { order: sortDirection};
        }

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
            index: SEARCH_INDEX_OBJECT_SEARCH,
            body: searchBody
        });

        const end = Date.now();

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

        searchResponse.body.hits.hits.forEach(
            (hit: any) => {
                const source: any = hit._source;
                items.push(source);
            }
        );

        const searchResults: ObjectSearchResults = {
            endtime: end,
            page: page,
            perpage: perPage,
            starttime: start,
            took: end - start,
            total: total,
            resultlist: items
        }  

        return searchResults;        
    }
    

    public async relSearch(relSearchInput: RelSearchInput): Promise<RelSearchResults> {
        let page: number = relSearchInput.page;
        let perPage: number = relSearchInput.perPage;
        let searchTerm = relSearchInput.term;

        // Make sure all of the search parameters are set to sensible values
        const sortDirection = relSearchInput.sortDirection && ALLOWED_SEARCH_DIRECTIONS.includes(relSearchInput.sortDirection) ? relSearchInput.sortDirection : "asc";
        const sortField = relSearchInput.sortField && ALLOWED_OBJECT_SEARCH_SORT_FIELDS.includes(relSearchInput.sortField) ? relSearchInput.sortField : "childname";        
        if(page < 1 || page > MAX_SEARCH_PAGE){
            page = 1;
        }
        if(perPage > MAX_SEARCH_PAGE_SIZE){
            perPage = MAX_SEARCH_PAGE_SIZE;
        }
        if(perPage < MIN_SEARCH_PAGE_SIZE){
            perPage = MIN_SEARCH_PAGE_SIZE;
        }

        // Start the timer
        const start = Date.now();

        // Default result list is am empty array
        let items: Array<RelSearchResultItem> = [];

        let query: any = {
            bool: {
                must: {},
                filter: [],
                should: []
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
                    fields: ["childname^8", "childname_as"]
                }
            }
        }

        if(relSearchInput.owningtenantid){
            query.bool.filter.push({
                term: {owningtenantid: relSearchInput.owningtenantid}
            });
        }
        if(relSearchInput.parentid){
            if(relSearchInput.childids){
                query.bool.should.push({
                    term: {parentid: relSearchInput.parentid}
                });
            }
            else{
                query.bool.filter.push({
                    term: {parentid: relSearchInput.parentid}
                });
            }
        }
        if(relSearchInput.childid){
            query.bool.filter.push({
                term: {childid: relSearchInput.childid}
            });
        }
        else if(relSearchInput.childids){
            const ids: Array<string> = relSearchInput.childids as Array<string>;
            ids.forEach(
                (id: string) => {
                    query.bool.should.push({
                        term: {childid: id}
                    });
                }
            );
            query.bool.minimum_should_match = 2;
        }

        if(relSearchInput.childtype){
            query.bool.filter.push({
                term: {childtype: relSearchInput.childtype}
            });
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
                    childname: {},
                    childdescription: {}
                }
            }
        }

        const searchResponse: Search_Response = await client.search({
            index: SEARCH_INDEX_REL_SEARCH,
            body: searchBody
        });

        const end = Date.now();

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

        searchResponse.body.hits.hits.forEach(
            (hit: any) => {
                const source: any = hit._source;
                return items.push(source);
            }
        );        

        const searchResults: RelSearchResults = {
            endtime: end,
            page: page,
            perpage: perPage,
            starttime: start,
            took: end - start,
            total: total,
            resultlist: items
        }  

        return searchResults;   

    }

    public async lookahead(term: string): Promise<Array<LookaheadResult>> {
        /*
            __typename?: 'LookaheadResult';
            category: Scalars['String']['output'];
            resultList?: Maybe<Array<Maybe<LookaheadItem>>>;

              __typename?: 'LookaheadItem';
              displayValue: Scalars['String']['output'];
              id: Scalars['String']['output'];
              matchingString?: Maybe<Scalars['String']['output']>;

        */
        const retVal: Array<LookaheadResult> = [
            {
                category: SearchResultType.Tenant,
                resultList: [
                    {
                        displayValue: "Bioreliance",
                        id: "3847389283489234"
                    },
                    {
                        displayValue: "Pfizer",
                        id: "3847389283489235"
                    },
                    {
                        displayValue: "Amgen",
                        id: "3847389283489236"
                    },
                    {
                        displayValue: "Lowes",
                        id: "3847389283489237"
                    }
                ]
            },
            {
                category: SearchResultType.Client,
                resultList: [
                    {
                        displayValue: "Bioreliance",
                        id: "3847389283489238"
                    },
                    {
                        displayValue: "Pfizer",
                        id: "3847389283489239"
                    }
                ]
            },
            {
                category: SearchResultType.AuthorizationGroup,
                    resultList: [
                        {
                            displayValue: "US Users",
                            id: "3847389283489214"
                        },
                        {
                            displayValue: "EU Users",
                            id: "3847389283489224"
                        },
                        {
                            displayValue: "Project management team - US",
                            id: "3847389283489244"
                        }
                    ]
            }
        ]

        return Promise.resolve(retVal);
    }
}

export default SearchService;