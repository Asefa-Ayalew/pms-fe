"use client";

import {
  ActionIcon,
  Container,
  Group,
  Tooltip
} from "@mantine/core";
import {
  IconRefresh
} from "@tabler/icons-react";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EntityToolbars } from "./entity-toolbar.model";
import { CollectionQuery } from "@/models/collection.model";
import { MantineReactTable } from "mantine-react-table";

interface TableDataProps<T> {
  dataTypes: {
    isError?: boolean;
    isLoading?: boolean;
    isFetching?: boolean;
  };
  getData: (params: CollectionQuery) => Promise<any>;
  data?: T[];
  count?: number;
  isSubData?: boolean;
}

interface EntityTableProps<T> {
  tableData: TableDataProps<T>;
  columns: any[];
  model?: any[];
  collection?: CollectionQuery;
  pageSize?: number;
  enableRowActions?: boolean;
  enableRowSelection?: boolean;
  enableMultiSelect?: boolean;
  tableDensity?: any;
  searchFrom?: string[];
  toolbarActions?: EntityToolbars[];
  headerLabel?: string;
  setSelectedRows?: (rows: T[]) => void;
  selectedRows?: T[];
  actionButtons?: Array<{
    component: any;
    componentStyles?: string;
    type?: string;
    path?: string;
    onClick?: () => void;
    routeWith?: string;
    icon?: any;
    iconStyles?: string;
    condition?: {
      field: string;
      operator: string;
      value: any;
    };
  }>;
}

const EntityTable = (props: EntityTableProps<any>) => {
  
  const compare = useMemo(() => (
    a: any,
    b: any,
    dbData: {
      field: string;
      direction: number;
    }[]
  ) => {
    for (const data of dbData) {
      if (a[data.field] < b[data.field]) {
        return data.direction;
      }
      if (a[data.field] > b[data.field]) {
        return -data.direction;
      }
    }
    return 0;
  }, []);

  const [columnFilters, setColumnFilters] = useState<any>([]);
  const [columnFilterFns, setColumnFilterFns] = useState<any>(
    Object.fromEntries(props.columns.map((col) => [col.accessorKey ?? '', "contains"]))
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [touchedGlobal, setTouchedGlobal] = useState(false);
  const [touchedColFilters, setTouchedColFilters] = useState(false);
  const [sorting, setSorting] = useState<any>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<any>({});
  const [pagination, setPagination] = useState<any>({
    pageIndex: 0,
    pageSize: props.pageSize ?? 15,
  });

  // Memoize collection state
  const [collection, setCollection] = useState<CollectionQuery>(() => ({
    skip: 0,
    top: props.pageSize ?? 15,
    ...props.collection,
  }));

  // Memoize data fetching function
  const fetchData = useCallback(async (params: CollectionQuery) => {
    try {
      const response = await props.tableData.getData(params);
      const newData = props.tableData.isSubData
        ? response?.data?.data.slice(
            pagination.pageIndex * pagination.pageSize,
            (pagination.pageIndex + 1) * pagination.pageSize
          )
        : response?.data?.data ?? [];
      setTableData(newData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [pagination.pageIndex, pagination.pageSize]);

  // Handle selection changes
  useEffect(() => {
    if (!props.setSelectedRows || !tableData.length) return;
    if (props.enableMultiSelect || props.enableRowSelection) {
      const selectedData = Object.entries(selectedRows)
        .filter(([_, selected]) => selected)
        .map(([key]) => tableData[parseInt(key)])
        .filter(Boolean);
      
      if (JSON.stringify(selectedData) !== JSON.stringify(props.selectedRows)) {
        props.setSelectedRows(selectedData);
      }
    }
  }, [selectedRows, tableData, props.setSelectedRows]);

  // Handle global filter changes
  useEffect(() => {
    const isGlobalFilterEmpty = !globalFilter;
    const shouldUpdate = touchedGlobal !== !isGlobalFilterEmpty;
    
    if (!shouldUpdate) return;
    setTouchedGlobal(!isGlobalFilterEmpty);
    
    const searchData = isGlobalFilterEmpty
      ? { search: "", searchFrom: [] }
      : { search: globalFilter, searchFrom: props.searchFrom };

    const params = {
      ...collection,
      ...props.collection,
      ...searchData,
    };

    fetchData(params);
  }, [globalFilter, collection, props.collection, props.searchFrom]);

  // Handle column filter changes
  useEffect(() => {
    const isColFilterEmpty = columnFilters.length === 0;
    const shouldUpdate = touchedColFilters !== !isColFilterEmpty;
    
    if (!shouldUpdate) return;
    setTouchedColFilters(!isColFilterEmpty);
    
    const searchData = isColFilterEmpty
      ? { filter: [] }
      : {
          filter: columnFilters.map((filter) => [{
            field: filter.id,
            value: filter.value,
            operator: "like",
          }]),
        };

    const params = {
      ...collection,
      ...props.collection,
      ...searchData,
    };

    fetchData(params);
  }, [columnFilters, collection, props.collection]);

  // Handle pagination changes
  useEffect(() => {
    const newParams = {
      ...collection,
      ...props.collection,
      skip: pagination.pageIndex * pagination.pageSize,
      top: pagination.pageSize,
    };

    if (props.tableData.isSubData && props.tableData.data) {
      const start = pagination.pageIndex * pagination.pageSize;
      const end = start + pagination.pageSize;
      setTableData(props.tableData.data.slice(start, end));
    } else {
      fetchData(newParams);
    }
  }, [pagination.pageIndex, pagination.pageSize, props.collection]);

  // Initial data fetch
  useEffect(() => {
    const initialParams = props.collection 
      ? { ...collection, ...props.collection } 
      : collection;
    
    fetchData(initialParams);
  }, []);

  // Handle sorting changes
  useEffect(() => {
    if (!sorting.length) return;

    if (props.tableData.isSubData) {
      const sortedData = _.cloneDeep(tableData).sort((a, b) => {
        const parsedSorting = sorting.map((s) => ({
          field: s.id,
          direction: s.desc ? -1 : 1,
        }));
        return compare(a, b, parsedSorting);
      });
      setTableData(sortedData);
    } else {
      const orderBy = sorting.map((s) => ({
        field: s.id,
        direction: s.desc ? "desc" : "asc",
      }));
      
      fetchData({
        ...collection,
        ...props.collection,
        orderBy: orderBy.map((o) => ({
          field: o.field,
          direction: o.direction as "asc" | "desc",
        })),
      });
    }
  }, [sorting, props.tableData.isSubData, collection, props.collection, compare, fetchData]);

  // Memoize table configuration
  const tableConfig = useMemo<any>(() => ({
    columns: props.columns,
    data: tableData,
    enableColumnFilterModes: true,
    columnFilterModeOptions: ["contains", "startsWith", "endsWith"],
    initialState: { 
      showColumnFilters: false, 
      density: (props.tableDensity ?? 'md') as any 
    },
    enableColumnResizing: true,
    layoutMode: 'grid',
    enableRowActions: props.enableRowActions,
    enableRowSelection: props.enableRowSelection ?? false,
    enableMultiRowSelection: props.enableMultiSelect ?? false,
    positionActionsColumn: "last",
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    renderRowActions: props.actionButtons ? ({ row }) => (
      <Group gap={4}>
        {props.actionButtons?.map((action, index) => {
          const ActionComponent = action.component;
          return (
            <ActionComponent
              key={index}
              className={action.componentStyles}
              onClick={action.onClick}
            >
              {action.icon && <action.icon className={action.iconStyles} />}
            </ActionComponent>
          );
        })}
      </Group>
    ) : undefined,
    mantineToolbarAlertBannerProps: props.tableData.dataTypes?.isError
      ? {
          color: "red",
          children: "Error loading data",
        }
      : undefined,
    onColumnFilterFnsChange: setColumnFilterFns,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setSelectedRows,
    rowCount: props.tableData?.count ?? 0,
    state: {
      columnFilterFns,
      columnFilters,
      globalFilter,
      isLoading: props.tableData.dataTypes?.isLoading,
      pagination,
      showAlertBanner: props.tableData.dataTypes?.isError,
      showProgressBars: props.tableData.dataTypes?.isFetching,
      sorting,
      showSkeletons: props.tableData.dataTypes?.isLoading,
      rowSelection: selectedRows,
    },
    mantineTableBodyRowProps: ({ row }: { row: any }) => ({
      onClick: (e) => {
        if (props.enableRowSelection || props.enableMultiSelect) {
          e.stopPropagation();
          row.toggleSelected(!row.getIsSelected());
        }
      },
      sx: { cursor: props.enableRowSelection || props.enableMultiSelect ? 'pointer' : 'default' },
    }),
    renderTopToolbarCustomActions: () => (
      <Group style={{ width: "100%", alignItems: "start", justifyContent: "start" }} key="group">
        <Tooltip label="Refresh Data">
          <ActionIcon onClick={() => fetchData(collection)}>
            <IconRefresh />
          </ActionIcon>
        </Tooltip>

        <div className="flex flex-row gap-2">
          {props.toolbarActions?.map((action, index) => (
            <div 
              key={index} 
              className={action.isCentered ? "self-center" : "self-start w-96"}
            >
              {action.component}
            </div>
          ))}
        </div>
      </Group>
    ),
  }), [
    props.columns,
    tableData,
    props.tableDensity,
    props.enableRowActions,
    props.enableRowSelection,
    props.enableMultiSelect,
    props.tableData.dataTypes,
    props.tableData.count,
    props.toolbarActions,
    columnFilterFns,
    columnFilters,
    globalFilter,
    pagination,
    sorting,
    selectedRows,
    collection,
    fetchData
  ]);

  const table = tableConfig;

  return (
    <>
      {props.headerLabel && (
        <Container my={20} className="bg-white p-5 shadow-md rounded flex justify-center">
          <h1 className="text-3xl font-bold text-primary-500 uppercase">
            {props.headerLabel}
          </h1>
        </Container>
      )}
      <div className="my-5">
        <MantineReactTable table={table} />
      </div>
    </>
  );
};

export default EntityTable;

