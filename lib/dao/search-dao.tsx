import { AuthorizationGroup, Client, FederatedOidcProvider, ObjectSearchResultItem, ObjectSearchResults, RelSearchInput, RelSearchResults, Scope, SearchInput, SearchResultType, SigningKey, Tenant, User } from "@/graphql/generated/graphql-types";


abstract class SearchDao {

    abstract objectSearch(searchInput: SearchInput, searchResultsTypesToOmit: Array<SearchResultType>): Promise<ObjectSearchResults>;
    
    abstract relSearch(relSearchInput: RelSearchInput, searchResultsTypesToOmit: Array<SearchResultType>): Promise<RelSearchResults>;
    
    abstract getObjectSearchByIds(ids: Array<string>): Promise<Array<ObjectSearchResultItem>>;
    
    abstract updateObjectSearchIndex(tenant: Tenant, user: User): Promise<void>;

    abstract updateUserTenantRelSearchIndex(tenantId: string, user: User): Promise<void>;

    abstract updateSearchIndexUserDocuments(user: User): Promise<void>;

    abstract indexTenant(tenant: Tenant, rootTenant: Tenant): Promise<void>;

    abstract indexClient(client: Client): Promise<void>;

    abstract indexAuthorizationGroup(group: AuthorizationGroup): Promise<void>;

    abstract indexFederatedOIDCProvider(federatedOIDCProvider: FederatedOidcProvider): Promise<void>;

    abstract indexSigningKey(key: SigningKey): Promise<void>;

    abstract indexUser(user: User, owningTenantId: string, authzGroup: AuthorizationGroup | null): Promise<void>;

    abstract indexScope(scope: Scope, tenantId: string): Promise<void>;

    abstract removerUserFromTenant(tenantId: string, userId: string): Promise<void>;

}

export default SearchDao