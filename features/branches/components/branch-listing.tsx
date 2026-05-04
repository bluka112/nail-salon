import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams'; 
import { branchesQueryOptions } from '../api/queries';
import { BranchTable } from './branch-tables';

export default function BranchListingPage() {
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('name');
  const pageLimit = searchParamsCache.get('perPage');
  const sort = searchParamsCache.get('sort');

  const filters = {
    page,
    limit: pageLimit,
    ...(search && { search }),
    ...(sort && { sort })
  };

  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(branchesQueryOptions(filters));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BranchTable />
    </HydrationBoundary>
  );
}
