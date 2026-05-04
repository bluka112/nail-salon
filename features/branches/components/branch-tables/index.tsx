'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { useSuspenseQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { getSortingStateParser } from '@/lib/parsers';
import { columns } from './columns';
import { branchesQueryOptions } from '../../api/queries';

const columnIds = columns.map((c) => c.id).filter(Boolean) as string[];

export function BranchTable() {
  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    name: parseAsString,
    sort: getSortingStateParser(columnIds).withDefault([])
  });

  const filters = {
    page: params.page,
    limit: params.perPage,
    ...(params.name && { search: params.name }),
    ...(params.sort.length > 0 && { sort: JSON.stringify(params.sort) })
  };

  const { data } = useSuspenseQuery(branchesQueryOptions(filters));

  const pageCount = Math.ceil(data.total_branches / params.perPage);

  const { table } = useDataTable({
    data: data.branches,
    columns,
    pageCount, 
    shallow: true,
    debounceMs: 500,
    initialState: {
      columnPinning: { right: ['actions'] }
    }
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
