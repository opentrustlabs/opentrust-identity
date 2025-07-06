import { LookaheadResult, ObjectSearchResults, SearchFilterInput, SearchFilterInputObjectType, SearchInput, ObjectSearchResultItem, RelSearchResults, RelSearchInput, RelSearchResultItem, SearchRelType, SearchResultType, LookaheadItem } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import { getOpenSearchClient } from "../data-sources/search";
import { Client } from "@opensearch-project/opensearch";
import { Search_Response } from "@opensearch-project/opensearch/api/index.js";
import { ALLOWED_OBJECT_SEARCH_SORT_FIELDS, ALLOWED_SEARCH_DIRECTIONS, AUTHENTICATION_GROUP_READ_SCOPE, AUTHORIZATION_GROUP_READ_SCOPE, CLIENT_READ_SCOPE, FEDERATED_OIDC_PROVIDER_READ_SCOPE, KEY_READ_SCOPE, MAX_SEARCH_PAGE, MAX_SEARCH_PAGE_SIZE, MIN_SEARCH_PAGE_SIZE, RATE_LIMIT_READ_SCOPE, SCOPE_READ_SCOPE, SEARCH_INDEX_OBJECT_SEARCH, SEARCH_INDEX_REL_SEARCH, TENANT_READ_ALL_SCOPE, TENANT_READ_SCOPE, USER_READ_SCOPE } from "@/utils/consts";
import { containsScope } from "@/utils/authz-utils";
import { GraphQLError } from "graphql";


// The opensearch javascript client api documentation and boolean query documentation: 
// 
// https://opensearch.org/docs/latest/clients/javascript/index
// https://opensearch.org/docs/latest/query-dsl/compound/bool/
// 

const MINIMUM_SCOPES_REQUIRED_FOR_SEARCH = [
    TENANT_READ_ALL_SCOPE, TENANT_READ_SCOPE, CLIENT_READ_SCOPE, USER_READ_SCOPE, 
    KEY_READ_SCOPE, AUTHORIZATION_GROUP_READ_SCOPE, AUTHENTICATION_GROUP_READ_SCOPE,
    FEDERATED_OIDC_PROVIDER_READ_SCOPE, SCOPE_READ_SCOPE, RATE_LIMIT_READ_SCOPE
]

const MAP_SEARCH_RESULT_TYPE_TO_SCOPE: Map<SearchResultType, string> = new Map([
    [SearchResultType.Tenant, TENANT_READ_SCOPE],
    [SearchResultType.Client, CLIENT_READ_SCOPE],
    [SearchResultType.User, USER_READ_SCOPE],
    [SearchResultType.Key, KEY_READ_SCOPE],
    [SearchResultType.AuthorizationGroup, AUTHORIZATION_GROUP_READ_SCOPE],
    [SearchResultType.AuthenticationGroup, AUTHENTICATION_GROUP_READ_SCOPE],
    [SearchResultType.OidcProvider, FEDERATED_OIDC_PROVIDER_READ_SCOPE],    
    [SearchResultType.AccessControl, SCOPE_READ_SCOPE],
    [SearchResultType.RateLimit, RATE_LIMIT_READ_SCOPE]
]);


const client: Client = getOpenSearchClient();

class SearchService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    public async search(searchInput: SearchInput): Promise<ObjectSearchResults> {


        const {isPermitted, errorMessage} = this.validatePermissions(searchInput.resultType || null);
        if(!isPermitted){
            throw new GraphQLError(errorMessage || "");
        }

        const searchResultsTypesToOmit: Array<SearchResultType> = this.getSearchTypesToOmit();
        
        // Make sure all of the search parameters are set to sensible values
        const page: number = searchInput.page;
        const perPage: number = searchInput.perPage;        
        const sortDirection = searchInput.sortDirection && ALLOWED_SEARCH_DIRECTIONS.includes(searchInput.sortDirection) ? searchInput.sortDirection : null;
        const sortField = searchInput.sortField && ALLOWED_OBJECT_SEARCH_SORT_FIELDS.includes(searchInput.sortField) ? searchInput.sortField : null;

        searchInput.sortDirection = sortDirection;
        searchInput.sortField = sortField;
        if(page < 1 || page > MAX_SEARCH_PAGE){
            searchInput.page = 1;
        }
        if(perPage > MAX_SEARCH_PAGE_SIZE){
            searchInput.perPage = MAX_SEARCH_PAGE_SIZE;
        }
        if(perPage < MIN_SEARCH_PAGE_SIZE){
            searchInput.perPage = MIN_SEARCH_PAGE_SIZE;
        }
        
        
        // We have 2 scenarios to deal with.
        // 1.   The user belongs to the root tenant, in which case they can search the main object_search index
        // 2.   The user belongs to a non-root tenant, in which case they can only search the rel_search index
        // 
        // If the user needs to search the rel search index, we need to forward the search query to the
        // rel search method, then convert the rel search results to a valid array of object search results.
        if(this.oidcContext.portalUserProfile?.managementAccessTenantId !== this.oidcContext.rootTenant.tenantId){
            const relSearchInput: RelSearchInput =  {
                page: page,
                perPage: perPage,
                owningtenantid: this.oidcContext.portalUserProfile?.managementAccessTenantId || "",
                parentid: this.oidcContext.portalUserProfile?.managementAccessTenantId || "",
                term: searchInput.term,
                sortDirection: sortDirection,
                sortField: "childname",
                childtype: searchInput.resultType
            }
            const relSearchResults: RelSearchResults = await this._relSearch(relSearchInput, searchResultsTypesToOmit);
            
            const ids: Array<string> = relSearchResults.resultlist.map(
                (item: RelSearchResultItem) => item.childid
            )
            const items = await this._getObjectSearchByIds(ids);            
            const searchResults: ObjectSearchResults = {
                endtime: relSearchResults.endtime,
                page: page,
                perpage: perPage,
                starttime: relSearchResults.starttime,
                took: relSearchResults.took,
                total: relSearchResults.total,
                resultlist: items
            } 
            return searchResults;
        }

        else{
            return this._objectSearch(searchInput, searchResultsTypesToOmit);
        }
    }
    

    public async relSearch(relSearchInput: RelSearchInput): Promise<RelSearchResults> {

        const {isPermitted, errorMessage} = this.validatePermissions(relSearchInput.childtype || null);
        if(!isPermitted){
            throw new GraphQLError(errorMessage || "");
        }

        const searchResultsTypesToOmit: Array<SearchResultType> = this.getSearchTypesToOmit();

        const page: number = relSearchInput.page;
        const perPage: number = relSearchInput.perPage;        

        // Make sure all of the search parameters are set to sensible values
        const sortDirection = relSearchInput.sortDirection && ALLOWED_SEARCH_DIRECTIONS.includes(relSearchInput.sortDirection) ? relSearchInput.sortDirection : "asc";
        const sortField = relSearchInput.sortField && ALLOWED_OBJECT_SEARCH_SORT_FIELDS.includes(relSearchInput.sortField) ? relSearchInput.sortField : "childname";        
        if(page < 1 || page > MAX_SEARCH_PAGE){
            relSearchInput.page = 1;
        }
        if(perPage > MAX_SEARCH_PAGE_SIZE){
            relSearchInput.perPage = MAX_SEARCH_PAGE_SIZE;
        }
        if(perPage < MIN_SEARCH_PAGE_SIZE){
            relSearchInput.perPage = MIN_SEARCH_PAGE_SIZE;
        }
        relSearchInput.sortDirection = sortDirection;
        relSearchInput.sortField = sortField;        

        return this._relSearch(relSearchInput, searchResultsTypesToOmit);          

    }

    public async lookahead(term: string): Promise<Array<LookaheadResult>> {
   
       // For now, we'll just re-use the search function for lookahead
        const searchInput: SearchInput = {
            page: 1,
            perPage: 10,
            term: term
        }
        const searchResults: ObjectSearchResults = await this.search(searchInput);
        const retVal: Array<LookaheadResult> = [];
        if(searchResults.total > 0){
            const map: Map<SearchResultType, Array<LookaheadItem>> = new Map();
            searchResults.resultlist.forEach(
                (item: ObjectSearchResultItem) => {
                    let arr: Array<LookaheadItem> | undefined = map.get(item.objecttype);
                    if(!arr){
                        arr = [];
                        map.set(item.objecttype, arr);
                    }
                    const lookaheadItem: LookaheadItem = {
                        displayValue: item.name,
                        id: item.objectid,
                        matchingString: ""
                    }
                    arr.push(lookaheadItem);
                }
            );
            map.forEach(
                (arr: Array<LookaheadItem>, objectType: SearchResultType) => {
                    const lookaheadResult: LookaheadResult = {
                        category: objectType,
                        resultList: arr
                    };
                    retVal.push(lookaheadResult);
                }
            )
        }


        return Promise.resolve(retVal);
    }

    protected async _getObjectSearchByIds(ids: Array<string>): Promise<Array<ObjectSearchResultItem>>{

        let query: any = {
            ids: {
                values: ids
            }
        }
        const searchBody: any = {
            from: 0,
            size: ids.length,
            query: query            
        }
        // Start the timer
        const start = Date.now();

        // Default result list is am empty array
        let items: Array<ObjectSearchResultItem> = [];

        const searchResponse: Search_Response = await client.search({
            index: SEARCH_INDEX_OBJECT_SEARCH,
            body: searchBody
        });

        searchResponse.body.hits.hits.forEach(
            (hit: any) => {
                const source: any = hit._source;
                items.push(source);
            }
        );
        return items;

    }

    protected async _objectSearch(searchInput: SearchInput, searchResultsTypesToOmit: Array<SearchResultType>): Promise<ObjectSearchResults>{
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
        if(!searchInput.term || searchInput.term.length < 3){
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
                    query: searchInput.term,
                    fields: fields,
                    operator: "and"
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
                        should: [],
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
                        );
                    }
                }
            );
        }
        if(searchResultsTypesToOmit.length > 0){
            query.bool.filter.push(
                {
                    bool: {
                        must_not: []
                    }
                }
            );
            searchResultsTypesToOmit.forEach(
                (t: SearchResultType) => {
                    query.bool.filter[query.bool.filter.length - 1].bool.must_not.push(
                        {
                            match: { objecttype: t.valueOf() }
                        }
                    );
                }
            );
        }
        
        const sortObj: any = {};
        if(searchInput.sortDirection && searchInput.sortField){
            sortObj[`${searchInput.sortField}.raw`] = { order: searchInput.sortDirection};
        }

        const searchBody: any = {
            from: (searchInput.page - 1) * searchInput.perPage,
            size: searchInput.perPage,
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
        // Start the timer
        const start = Date.now();

        // Default result list is am empty array
        let items: Array<ObjectSearchResultItem> = [];

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
            page: searchInput.page,
            perpage: searchInput.perPage,
            starttime: start,
            took: end - start,
            total: total,
            resultlist: items
        }  

        return searchResults;        
    }
    
    protected validatePermissions(resultType: SearchResultType | null): {isPermitted: boolean, errorMessage: string | null} {

        if(!containsScope(MINIMUM_SCOPES_REQUIRED_FOR_SEARCH, this.oidcContext.portalUserProfile?.scope || [])){
            //throw new GraphQLError("ERROR_NO_PERMISSIONS_FOR_SEARCH");
            return {isPermitted: false, errorMessage: "ERROR_NO_PERMISSIONS_FOR_SEARCH"};
        }
        // If the user specified a particular type of object to return, do they have the permission
        // to view those types of objects
        if( !(resultType === undefined || resultType === null ) ){
            const requiredScope: string | undefined = MAP_SEARCH_RESULT_TYPE_TO_SCOPE.get(resultType);
            if(requiredScope === undefined){
                //throw new GraphQLError("ERROR_NO_VALID_PERMISSIONS_FOR_SEARCH");
                return {isPermitted: false, errorMessage: "ERROR_NO_VALID_PERMISSIONS_FOR_SEARCH"};
            }
            else{
                const b: boolean = containsScope([requiredScope, TENANT_READ_ALL_SCOPE], this.oidcContext.portalUserProfile?.scope || []);
                if(!b){
                    //throw new GraphQLError("ERROR_NO_PERMISSION");
                    return {isPermitted: false, errorMessage: "ERROR_NO_PERMISSION"};
                }
            }
        }
        return {isPermitted: true, errorMessage: null}
    }


    protected async _relSearch(relSearchInput: RelSearchInput, searchResultsTypesToOmit: Array<SearchResultType>): Promise<RelSearchResults> {

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
        if(!relSearchInput.term || relSearchInput.term.length < 3){
            query.bool.must = {
                match_all: {}
            }
        }
        else{
            query.bool.must = {
                multi_match: {
                    query: relSearchInput.term,
                    fields: ["childname^8", "childname_as"]
                }
            }
        }

        if(relSearchInput.owningtenantid){
            query.bool.filter.push({
                term: {owningtenantid: relSearchInput.owningtenantid}
            });
        }
        // If there are both child ids and a parent id, we want to perform
        // a should query with both values with a minimum should match of 2
        // Otherwise, just filter by the parent id
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

        if(searchResultsTypesToOmit.length > 0){
            query.bool.filter.push(
                {
                    bool: {
                        must_not: []
                    }
                }
            );
            searchResultsTypesToOmit.forEach(
                (t: SearchResultType) => {
                    query.bool.filter[query.bool.filter.length - 1].bool.must_not.push(
                        {
                            match: { objecttype: t.valueOf() }
                        }
                    );
                }
            );
        }
        
        console.log(JSON.stringify(query));

        const sortObj: any = {};
        sortObj[`${relSearchInput.sortField}.raw`] = { order: relSearchInput.sortDirection};

        const searchBody: any = {
            from: (relSearchInput.page - 1) * relSearchInput.perPage,
            size: relSearchInput.perPage,
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
            page: relSearchInput.page,
            perpage: relSearchInput.perPage,
            starttime: start,
            took: end - start,
            total: total,
            resultlist: items
        }  

        return searchResults; 

    }

    protected getSearchTypesToOmit(): Array<SearchResultType> {
        const searchResultsTypesToOmit: Array<SearchResultType> = [];
        if(!containsScope(TENANT_READ_ALL_SCOPE, this.oidcContext.portalUserProfile?.scope || [])){            
            // the user is doing a look ahead or other type of search which has no object type
            // which search types do we need to remove from the list based on the user's scopes?
            MAP_SEARCH_RESULT_TYPE_TO_SCOPE.forEach(
                (value: string, key: SearchResultType) => {
                    if(!containsScope(value, this.oidcContext.portalUserProfile?.scope || [])){
                        searchResultsTypesToOmit.push(key);
                    }
                }
            );  
        }
        return searchResultsTypesToOmit;
    }
}

export default SearchService;