import { GraphQLClient } from 'graphql-request';
import {
  getSdk,
  Chain,
  Network,
  NetworkInput,
  SortDirection,
  TokenInput,
  TokenMarketsQueryInput,
  TokenMarketsFilterInput,
  TokenMarketSortKeySortInput,
  TokenMarketSortKey,
  TokensQueryInput,
  TokensQueryFilter,
  TokenSortKeySortInput,
  CollectionsQueryInput,
  CollectionSortKeySortInput,
  CollectionSortKey,
  TokenSortKey,
  AggregateStatsQueryVariables,
  AggregateAttributesQueryVariables,
} from './queries/queries-sdk';

// Export chain and network for API users
export { Chain as ZDKChain, Network as ZDKNetwork };

export type OverrideNetworksOption = NetworkInput | NetworkInput[]

export type OverridePaginationOptions = {
  limit?: number;
  offset?: number;
};

type Query<ArgsInput, SortInput> = ArgsInput & SortInput;

type TokenMarketsQueryArgs = {
  where: TokenMarketsQueryInput;
  filter?: TokenMarketsFilterInput;
  includeSalesHistory?: boolean;
};

type TokensQueryArgs = {
  where: TokensQueryInput;
  filter?: TokensQueryFilter;
};

type CollectionsQueryArgs = {
  where: CollectionsQueryInput;
};

export interface ListOptions<SortInput> {
  networks?: OverrideNetworksOption;
  pagination?: OverridePaginationOptions;
  sort?: SortInput;
  includeFullDetails?: boolean;
}

export interface AggregateOptions {
  networks?: OverrideNetworksOption;
}

export type TokenQueryList = TokenInput;

export class ZDK {
  endpoint: string;
  defaultNetworks: NetworkInput | NetworkInput[];
  defaultMaxPageSize: number = 200;

  public sdk: ReturnType<typeof getSdk>;

  constructor(endpoint: string, networks: NetworkInput | NetworkInput[]) {
    this.endpoint = endpoint;
    this.defaultNetworks = networks;
    this.sdk = getSdk(new GraphQLClient(this.endpoint));
  }

  // private fetch(url: string, options: any) {
  // return axios({url, ...options});
  // }

  private getNetworksOption = (networks?: OverrideNetworksOption) => {
    return {
      networks: networks ?? this.defaultNetworks
    };
  };

  private getPaginationOptions = ({ limit, offset }: OverridePaginationOptions = {}) => {
    return {
      pagination: {
        limit: limit || this.defaultMaxPageSize,
        offset: offset || 0,
      },
    };
  };

  public tokens = async ({
    where,
    filter,
    pagination,
    networks,
    sort,
    includeFullDetails = false,
  }: Query<TokensQueryArgs, ListOptions<TokenSortKeySortInput>>) =>
    this.sdk.tokens({
      where,
      filter,
      sort: {
        sortDirection: sort?.sortDirection || SortDirection.Asc,
        sortKey: sort?.sortKey || TokenSortKey.Transferred,
      },
      includeFullDetails,
      ...this.getPaginationOptions(pagination),
      ...this.getNetworksOption(networks),
    });

  public tokenMarkets = async ({
    where,
    filter,
    pagination,
    networks,
    sort,
    includeFullDetails = false,
    includeSalesHistory = false,
  }: Query<TokenMarketsQueryArgs, ListOptions<TokenMarketSortKeySortInput>>) =>
    this.sdk.tokenMarkets({
      where,
      filter,
      includeSalesHistory,
      includeFullDetails,
      sort: {
        sortDirection: sort?.sortDirection || SortDirection.Desc,
        sortKey: sort?.sortKey || TokenMarketSortKey.Minted,
      },
      ...this.getPaginationOptions(pagination),
      ...this.getNetworksOption(networks),
    });

  public collections = async ({
    where,
    pagination,
    networks,
    sort,
    includeFullDetails = false,
  }: Query<CollectionsQueryArgs, ListOptions<CollectionSortKeySortInput>>) =>
    this.sdk.collections({
      where,
      includeFullDetails,
      ...this.getPaginationOptions(pagination),
      ...this.getNetworksOption(networks),
      sort: {
        sortDirection: sort?.sortDirection || SortDirection.Desc,
        sortKey: sort?.sortKey || CollectionSortKey.Created,
      },
    });

  public aggregateStats = async ({
    where,
    networks,
    statType,
  }: AggregateStatsQueryVariables) =>
    this.sdk.aggregateStats({
      where,
      networks,
      statType,
    });

  public aggregateAttributes = async ({
    where,
    networks,
  }: AggregateAttributesQueryVariables) =>
    this.sdk.aggregateAttributes({ where, networks });
}
