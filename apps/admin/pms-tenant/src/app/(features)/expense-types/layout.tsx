'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useLazyGetExpenseTypesQuery } from './_store/expense-type.query';
import {
  CollectionQuery,
  EntityConfig,
  EntityList,
  entityViewMode,
  Order,
} from '@pms/entity';
import { ExpenseType } from '@/app/models/expense-type.model';

export default function ExpenseTypeListPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();

  // Component states
  const [check, setCheck] = useState(false);
  const [selectedExpenseType, setSelectedType] = useState<ExpenseType>();
  const [viewMode, setViewMode] = useState<entityViewMode>('list');
  const [collection, setCollection] = useState<CollectionQuery>({
    skip: 0,
    top: 20,
    orderBy: [{ field: 'createdAt', direction: 'desc' }],
  });

  // RTK hooks
  const [getExpenseType, expenseTypes] = useLazyGetExpenseTypesQuery();

  useEffect(() => {
    getExpenseType(collection);
  }, [collection, getExpenseType]);

  useEffect(() => {
    setSelectedType(
      expenseTypes?.data?.data?.find((item) => item?.id === `${params?.id}`),
    );
  }, [params?.id, expenseTypes?.data?.data]);

  useEffect(() => {
    setViewMode(params?.id !== undefined ? 'detail' : 'list');
  }, [params?.id]);

  const config: EntityConfig<ExpenseType> = {
    primaryColumn: {
      key: 'ExpenseTypeTitle',
      name: 'Expense Type Title',
      render: (data: ExpenseType) => `${data?.name ?? ''}`,
    },
    rootUrl: '/expense-types',
    identity: 'id',
    visibleColumn: [
      {
        key: '',
        name: 'Expense Type Title',
        render: (data: ExpenseType) => `${data?.name ?? ''}`,
      },
      {
        key: 'code',
        name: 'Expense Type Code',
        render: (data: ExpenseType) => `${data?.code ?? ''}`,
      },
      {
        key: 'createdAt',
        name: 'Registration Date',
        isDate: true,
      },
    ],
  };

  const data = expenseTypes?.data?.data;

  return (
    <div className="flex w-full">
      <EntityList
        parentStyle="w-full"
        viewMode={viewMode}
        check={check}
        detail={children}
        showArchived={false}
        showSelector={true}
        tableKey="expenseTypes"
        title="ExpenseType Names"
        detailTitle={`${selectedExpenseType?.name ?? ''}`}
        newButtonText="New"
        total={expenseTypes?.data?.count}
        collectionQuery={collection}
        itemsLoading={expenseTypes?.isLoading || expenseTypes?.isFetching}
        config={config}
        items={data}
        initialPage={1}
        defaultPageSize={collection.top}
        pageSize={[20, 30, 50, 100]}
        onShowSelector={(e) => setCheck(e)}
        onPaginationChange={(skip: number, top: number) => {
          const after = (skip - 1) * top;
          setCollection({ ...collection, skip: after, top: top });
        }}
        onSearch={(data: any) => {
          setCollection({
            ...collection,
            search: data || '',
            searchFrom: data ? ['name'] : [],
          });
        }}
        onFilterChange={(data: any) => {
          if (collection?.filter || data.length > 0) {
            // setCollection({ ...collection, filter: data });
          }
        }}
        onOrder={(data: Order) =>
          setCollection({ ...collection, orderBy: [data] })
        }
      />
    </div>
  );
}
