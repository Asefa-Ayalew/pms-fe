'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLazyGetRevenueTypesQuery } from './_store/revenue-type.query';
import { CollectionQuery, EntityConfig, EntityList, entityViewMode, Order } from '@pms/entity';
import { RevenueType } from '../../models/revenue-type.model';

export default function RevenueTypeListPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();

  // Component states
  const [check, setCheck] = useState(false);
  const [selectedRevenueType, setSelectedType] = useState<RevenueType>();
  const [viewMode, setViewMode] = useState<entityViewMode>('list');
  const [collection, setCollection] = useState<CollectionQuery>({
    skip: 0,
    top: 20,
    orderBy: [{ field: 'createdAt', direction: 'desc' }],
  });

  // RTK hooks
  const [getRevenueType, revenueTypes] = useLazyGetRevenueTypesQuery();

  useEffect(() => {
    getRevenueType(collection);
  }, [collection, getRevenueType]);

  useEffect(() => {
    setSelectedType(
      revenueTypes?.data?.data?.find((item) => item?.id === `${params?.id}`),
    );
  }, [params?.id, revenueTypes?.data?.data]);

  useEffect(() => {
    setViewMode(params?.id !== undefined ? 'detail' : 'list');
  }, [params?.id]);

  const config: EntityConfig<RevenueType> = {
    primaryColumn: {
      key: 'revenueTypeName',
      name: 'RevenueType Name',
      render: (data: RevenueType) => `${data?.name ?? ''}`,
    },
    rootUrl: '/revenue-types',
    identity: 'id',
    visibleColumn: [
      {
        key: 'name',
        name: 'RevenueType Name',
        render: (data: RevenueType) => `${data?.name ?? ''}`,
      },
      {
        key: 'code',
        name: 'Revenue Type Code',
        render: (data: RevenueType) => `${data?.code ?? ''}`,
      },
      {
        key: 'createdAt',
        name: 'Registration Date',
        isDate: true,
      },
    ],
  };

  const data = revenueTypes?.data?.data;

  return (
    <div className="flex w-full">
      <EntityList
        parentStyle="w-full"
        viewMode={viewMode}
        check={check}
        detail={children}
        showArchived={false}
        showSelector={true}
        tableKey="revenueTypes"
        title="RevenueType Names"
        detailTitle={`${selectedRevenueType?.name ?? ''}`}
        newButtonText="New"
        total={revenueTypes?.data?.count}
        collectionQuery={collection}
        itemsLoading={revenueTypes?.isLoading || revenueTypes?.isFetching}
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
