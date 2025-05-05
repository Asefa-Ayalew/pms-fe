'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useLazyGetReceivablesQuery } from './_store/receivable.query';
import {
  CollectionQuery,
  EntityConfig,
  EntityList,
  entityViewMode,
  Order,
} from '@pms/entity';
import { Receivable } from '../../models/receivable.model';

export default function ReceivableListPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();

  // Component states
  const [check, setCheck] = useState(false);
  const [selectedReceivable, setSelectedType] = useState<Receivable>();
  const [viewMode, setViewMode] = useState<entityViewMode>('list');
  const [collection, setCollection] = useState<CollectionQuery>({
    skip: 0,
    top: 20,
    orderBy: [{ field: 'createdAt', direction: 'desc' }],
  });

  // RTK hooks
  const [getReceivable, receivables] = useLazyGetReceivablesQuery();

  useEffect(() => {
    getReceivable(collection);
  }, [collection, getReceivable]);

  useEffect(() => {
    setSelectedType(
      receivables?.data?.data?.find((item) => item?.id === `${params?.id}`),
    );
  }, [params?.id, receivables?.data?.data]);

  useEffect(() => {
    setViewMode(params?.id !== undefined ? 'detail' : 'list');
  }, [params?.id]);

  const config: EntityConfig<Receivable> = {
    primaryColumn: {
      key: 'Receivable Name',
      name: 'Receivable Name',
      render: (data: Receivable) => `${data?.creditorName ?? ''}`,
    },
    rootUrl: '/receivable',
    identity: 'id',
    visibleColumn: [
      {
        key: '',
        name: 'Receivable Name',
        render: (data: Receivable) => `${data?.creditorName ?? ''}`,
      },
      {
        key: 'createdAt',
        name: 'Registration Date',
        isDate: true,
      },
    ],
  };

  const data = receivables?.data?.data;

  return (
    <div className="flex w-full">
      <EntityList
        parentStyle="w-full"
        viewMode={viewMode}
        check={check}
        detail={children}
        showArchived={false}
        showSelector={true}
        tableKey="receivables"
        title="Receivables"
        detailTitle={`${selectedReceivable?.creditorName ?? ''}`}
        newButtonText="New"
        total={receivables?.data?.count}
        collectionQuery={collection}
        itemsLoading={receivables?.isLoading || receivables?.isFetching}
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
