import { Client as SearchClient } from "@opensearch-project/opensearch";
import { SearchInput, SearchResultType, ObjectSearchResults, SearchFilterInput, SearchFilterInputObjectType, ObjectSearchResultItem, RelSearchInput, RelSearchResults, RelSearchResultItem, Tenant, Client, AuthorizationGroup, FederatedOidcProvider, SigningKey, User, Scope } from "@/graphql/generated/graphql-types";
import { CLIENT_TYPES_DISPLAY, FEDERATED_OIDC_PROVIDER_TYPES_DISPLAY, NAME_ORDER_EASTERN, NAME_ORDER_WESTERN, SCOPE_USE_DISPLAY, SEARCH_INDEX_OBJECT_SEARCH, SEARCH_INDEX_REL_SEARCH, SIGNING_KEY_STATUS_ACTIVE, TENANT_TYPES_DISPLAY } from "@/utils/consts";
import { Search_Response } from "@opensearch-project/opensearch/api/index.js";
import { getOpenSearchClient } from "../data-sources/search";

const searchClient: SearchClient = getOpenSearchClient();

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

        const searchResponse: Search_Response = await searchClient.search({
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

        const searchResponse: Search_Response = await searchClient.search({
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

    protected async indexTenant(tenant: Tenant, rootTenant: Tenant){
        const document: ObjectSearchResultItem = {
            name: tenant.tenantName,
            description: tenant.tenantDescription,
            objectid: tenant.tenantId,
            objecttype: SearchResultType.Tenant,
            owningtenantid: rootTenant.tenantId,
            email: "",
            enabled: tenant.enabled,
            owningclientid: "",
            subtype: TENANT_TYPES_DISPLAY.get(tenant.tenantType),
            subtypekey: tenant.tenantType
        }
        
        await searchClient.index({
            id: tenant.tenantId,
            index: SEARCH_INDEX_OBJECT_SEARCH,
            body: document
        });
    }

    protected async indexClient(client: Client) {
        const document: ObjectSearchResultItem = {
            name: client.clientName,
            description: client.clientDescription,
            objectid: client.clientId,
            objecttype: SearchResultType.Client,
            owningtenantid: client.tenantId,
            email: "",
            enabled: client.enabled,
            owningclientid: "",
            subtype: CLIENT_TYPES_DISPLAY.get(client.clientType),
            subtypekey: client.clientType
        }
        
        await searchClient.index({
            id: client.clientId,
            index: SEARCH_INDEX_OBJECT_SEARCH,
            body: document
        });

        const relSearch: RelSearchResultItem = {
            childid: client.clientId,
            childname: client.clientName,
            childtype: SearchResultType.Client,
            owningtenantid: client.tenantId,
            parentid: client.tenantId,
            parenttype: SearchResultType.Tenant,
            childdescription: client.clientDescription
        }
        await searchClient.index({
            id: `${client.tenantId}::${client.clientId}`,
            index: SEARCH_INDEX_REL_SEARCH,
            body: relSearch
        });	
    }

    protected async indexAuthorizationGroup(group: AuthorizationGroup){
        const document: ObjectSearchResultItem = {
            name: group.groupName,
            description: group.groupDescription,
            objectid: group.groupId,
            objecttype: SearchResultType.AuthorizationGroup,
            owningtenantid: group.tenantId,
            email: "",
            enabled: true,
            owningclientid: "",
            subtype: "",
            subtypekey: ""            
        }
        
        await searchClient.index({
            id: group.groupId,
            index: SEARCH_INDEX_OBJECT_SEARCH,
            body: document
        });

        const relSearch: RelSearchResultItem = {
            childid: group.groupId,
            childname: group.groupName,
            childtype: SearchResultType.AuthorizationGroup,
            owningtenantid: group.tenantId,
            parentid: group.tenantId,
            parenttype: SearchResultType.Tenant,
            childdescription: group.groupDescription
        }
        await searchClient.index({
            id: `${group.tenantId}::${group.groupId}`,
            index: SEARCH_INDEX_REL_SEARCH,
            body: relSearch
        });
    }

    protected async indexFederatedOIDCProvider(federatedOIDCProvider: FederatedOidcProvider){
        	const document: ObjectSearchResultItem = {
            name: federatedOIDCProvider.federatedOIDCProviderName,
            description: federatedOIDCProvider.federatedOIDCProviderDescription,
            objectid: federatedOIDCProvider.federatedOIDCProviderId,
            objecttype: SearchResultType.OidcProvider,
            owningtenantid: "",
            email: "",
            enabled: true,
            owningclientid: "",
            subtype: FEDERATED_OIDC_PROVIDER_TYPES_DISPLAY.get(federatedOIDCProvider.federatedOIDCProviderType),
            subtypekey: federatedOIDCProvider.federatedOIDCProviderType
        }
        
        await searchClient.index({
            id: federatedOIDCProvider.federatedOIDCProviderId,
            index: SEARCH_INDEX_OBJECT_SEARCH,
            body: document
        }); 
    }

    protected async indexSigningKey(key: SigningKey){
        const document: ObjectSearchResultItem = {
            name: key.keyName,
            description: key.keyUse,
            objectid: key.keyId,
            objecttype: SearchResultType.Key,
            owningtenantid: key.tenantId,
            email: "",
            enabled: key.status === SIGNING_KEY_STATUS_ACTIVE,
            owningclientid: "",
            subtype: key.keyType,
            subtypekey: key.keyType
        }        
        await searchClient.index({
            id: key.keyId,
            index: SEARCH_INDEX_OBJECT_SEARCH,
            body: document
        });   
        
        const relSearch: RelSearchResultItem = {
            childid: key.keyId,
            childname: key.keyName,
            childtype: SearchResultType.Key,
            owningtenantid: key.tenantId,
            parentid: key.tenantId,
            parenttype: SearchResultType.Tenant,
            childdescription: key.keyType
        }
        await searchClient.index({
            id: `${key.tenantId}::${key.keyId}`,
            index: SEARCH_INDEX_REL_SEARCH,
            body: relSearch
        });
    }

    protected async indexUser(user: User, owningTenantId: string, parentTenantId: string, authzGroup: AuthorizationGroup){        
        const document: ObjectSearchResultItem = {
            name: user.nameOrder === NAME_ORDER_WESTERN ? `${user.firstName} ${user.lastName}` : `${user.lastName} ${user.firstName}`,
            description: "",
            objectid: user.userId,
            objecttype: SearchResultType.User,
            owningtenantid: owningTenantId,
            email: user.email,
            enabled: user.enabled,
            owningclientid: "",
            subtype: "",
            subtypekey: ""
        }
        
        await searchClient.index({
            id: user.userId,
            index: SEARCH_INDEX_OBJECT_SEARCH,
            body: document
        });

        
        const relDocument: RelSearchResultItem = {
            childid: user.userId,
            childname: user.nameOrder === NAME_ORDER_WESTERN ? `${user.firstName} ${user.lastName}` : `${user.lastName} ${user.firstName}`,
            childtype: SearchResultType.User,
            owningtenantid: owningTenantId,
            parentid: parentTenantId,
            parenttype: SearchResultType.Tenant,
            childdescription: user.email
        }
        await searchClient.index({
            id: `${parentTenantId}::${user.userId}`,
            index: SEARCH_INDEX_REL_SEARCH,
            body: relDocument
        });

        const authzGroupUserRel: RelSearchResultItem = {
            childid: user.userId,
            childname: user.nameOrder === NAME_ORDER_EASTERN ? `${user.firstName} ${user.lastName}` : `${user.lastName} ${user.firstName}`,
            childtype: SearchResultType.User,
            owningtenantid: authzGroup.tenantId,
            parentid: authzGroup.groupId,
            parenttype: SearchResultType.AuthorizationGroup,
            childdescription: user.email
        }
        await searchClient.index({
            id: `${authzGroup.groupId}::${user.userId}`,
            index: SEARCH_INDEX_REL_SEARCH,
            body: authzGroupUserRel,
            refresh: "wait_for"
        });
    }

    protected async indexScope(scope: Scope, tenantId: string){
        const document: ObjectSearchResultItem = {
            name: scope.scopeName,
            description: scope.scopeDescription,
            objectid: scope.scopeId,
            objecttype: SearchResultType.AccessControl,
            owningtenantid: "",
            email: "",
            enabled: true,
            owningclientid: "",
            subtype: SCOPE_USE_DISPLAY.get(scope.scopeUse),
            subtypekey: scope.scopeUse
        }
        await searchClient.index({
            id: scope.scopeId,
            index: SEARCH_INDEX_OBJECT_SEARCH,
            body: document
        });

        const relSearchDocument: RelSearchResultItem = {
            childid: scope.scopeId,
            childname: scope.scopeName,
            childtype: SearchResultType.AccessControl,
            owningtenantid: tenantId,
            parentid: tenantId,
            parenttype: SearchResultType.Tenant,
            childdescription: scope.scopeDescription
        }; 
        await searchClient.index({
            id: `${tenantId}::${scope.scopeId}`,
            index: SEARCH_INDEX_REL_SEARCH,
            body: relSearchDocument
        });
        
    }


}

export default BaseSearchService;