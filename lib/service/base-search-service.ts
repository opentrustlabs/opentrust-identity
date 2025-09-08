import { Client } from "@opensearch-project/opensearch";
import { SearchInput, SearchResultType, ObjectSearchResults, SearchFilterInput, SearchFilterInputObjectType, ObjectSearchResultItem, RelSearchInput, RelSearchResults, RelSearchResultItem } from "@/graphql/generated/graphql-types";
import { SEARCH_INDEX_OBJECT_SEARCH, SEARCH_INDEX_REL_SEARCH } from "@/utils/consts";
import { Search_Response } from "@opensearch-project/opensearch/api/index.js";
import { getOpenSearchClient } from "../data-sources/search";

const client: Client = getOpenSearchClient();

class BaseSearchService {

    protected async _objectSearch(searchInput: SearchInput, searchResultsTypesToOmit: Array<SearchResultType>): Promise<ObjectSearchResults> {
        // Build the BOOLEAN query, both in cases where there is a search term and where
        // there is not. We will almost always need to some kind of filters, whether for
        // object type (tenant vs client vs user vs oidc provider vs ...) or for the
        // tenant in which the user resides.

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {
            bool: {
                must: {},
                filter: []
            }
        }
        if (!searchInput.term || searchInput.term.length < 3) {
            query.bool.must = {
                match_all: {}
            }
        }
        else {
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

        if (searchInput.resultType) {
            query.bool.filter.push(
                {
                    term: { objecttype: searchInput.resultType }

                }
            );
        }

        // If there are filter terms, these should be added to the search query
        // with and OR clause, i.e., adding a boolean should query to the 
        // filter list.
        if (searchInput.filters && searchInput.filters.length > 0) {
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
                    if (f?.objectType === SearchFilterInputObjectType.TenantId) {
                        query.bool.filter[query.bool.filter.length - 1].bool.should.push(
                            {
                                term: { owningtenantid: f.objectValue }
                            }
                        );
                    }
                }
            );
        }
        if (searchResultsTypesToOmit.length > 0) {
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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sortObj: any = {};
        if (searchInput.sortDirection && searchInput.sortField) {
            sortObj[`${searchInput.sortField}.raw`] = { order: searchInput.sortDirection };
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        const items: Array<ObjectSearchResultItem> = [];

        const searchResponse: Search_Response = await client.search({
            index: SEARCH_INDEX_OBJECT_SEARCH,
            body: searchBody
        });

        const end = Date.now();

        let total: number = 0;
        const totalValueOf = searchResponse.body.hits.total?.valueOf();
        if (totalValueOf) {
            if (typeof totalValueOf === "number") {
                total = totalValueOf;
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                total = (totalValueOf as any).value;
            }
        }

        searchResponse.body.hits.hits.forEach(
            //eslint-disable-next-line  @typescript-eslint/no-explicit-any
            (hit: any) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    protected async _relSearch(relSearchInput: RelSearchInput, searchResultsTypesToOmit: Array<SearchResultType>): Promise<RelSearchResults> {

        // Start the timer
        const start = Date.now();

        // Default result list is am empty array
        const items: Array<RelSearchResultItem> = [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {
            bool: {
                must: {},
                filter: [],
                should: []
            }
        }
        if (!relSearchInput.term || relSearchInput.term.length < 3) {
            query.bool.must = {
                match_all: {}
            }
        }
        else {
            query.bool.must = {
                multi_match: {
                    query: relSearchInput.term,
                    fields: ["childname^8", "childname_as"]
                }
            }
        }

        if (relSearchInput.owningtenantid) {
            query.bool.filter.push({
                term: { owningtenantid: relSearchInput.owningtenantid }
            });
        }
        // If there are both child ids and a parent id, we want to perform
        // a should query with both values with a minimum should match of 2
        // Otherwise, just filter by the parent id
        if (relSearchInput.parentid) {
            if (relSearchInput.childids) {
                query.bool.should.push({
                    term: { parentid: relSearchInput.parentid }
                });
            }
            else {
                query.bool.filter.push({
                    term: { parentid: relSearchInput.parentid }
                });
            }
        }
        if (relSearchInput.childid) {
            query.bool.filter.push({
                term: { childid: relSearchInput.childid }
            });
        }
        else if (relSearchInput.childids) {
            const ids: Array<string> = relSearchInput.childids as Array<string>;
            ids.forEach(
                (id: string) => {
                    query.bool.should.push({
                        term: { childid: id }
                    });
                }
            );
            query.bool.minimum_should_match = 2;
        }

        if (relSearchInput.childtype) {
            query.bool.filter.push({
                term: { childtype: relSearchInput.childtype }
            });
        }

        if (searchResultsTypesToOmit.length > 0) {
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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sortObj: any = {};
        if (relSearchInput.sortDirection && relSearchInput.sortField) {
            sortObj[`${relSearchInput.sortField}.raw`] = { order: relSearchInput.sortDirection };
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        if (totalValueOf) {
            if (typeof totalValueOf === "number") {
                total = totalValueOf;
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                total = (totalValueOf as any).value;
            }
        }

        searchResponse.body.hits.hits.forEach(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (hit: any) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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


}

export default BaseSearchService;