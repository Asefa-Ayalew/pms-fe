'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  CollectionQuery,
  Order,
  EntityConfig,
  EntityList,
  entityViewMode,
} from '@pms/entity';
import { useLazyGetTenantsQuery } from './_store/tenant.query';
import { Tenant } from '@/app/models/tenant.model';

export default function TenantListPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();

  // Component states
  const [check, setCheck] = useState(false);
  const [selectedTenant, setSelectedType] = useState<Tenant>();
  const [viewMode, setViewMode] = useState<entityViewMode>('list');
  const [collection, setCollection] = useState<CollectionQuery>({
    skip: 0,
    top: 20,
    orderBy: [{ field: 'createdAt', direction: 'desc' }],
  });

  // RTK hooks
  const [getTenant, tenants] = useLazyGetTenantsQuery();

  useEffect(() => {
    getTenant(collection);
  }, [collection, getTenant]);

  useEffect(() => {
    setSelectedType(
      tenants?.data?.data?.find((item) => item?.id === `${params?.id}`),
    );
  }, [params?.id, tenants?.data?.data]);

  useEffect(() => {
    setViewMode(params?.id !== undefined ? 'detail' : 'list');
  }, [params?.id]);

  const config: EntityConfig<Tenant> = {
    primaryColumn: {
      key: 'Tenant',
      name: 'Tenant',
      render: (data: Tenant) => `${data?.name ?? ''}`,
    },
    rootUrl: '/tenants',
    identity: 'id',
    visibleColumn: [
      {
        key: 'name',
        name: 'Tenant Name',
        render: (data: Tenant) => `${data?.name ?? ''}`,
      },
      {
        key: 'shortCode',
        name: 'Short Code',
        render: (data: Tenant) => `${data?.shortCode ?? ''}`,
      },
      {
        key: 'tradeName',
        name: 'Trade Name',
        render: (data: Tenant) => `${data?.tradeName ?? ''}`,
      },
      {
        key: 'tin',
        name: 'TIN',
        render: (data: Tenant) => `${data?.tin ?? ''}`,
      },
      {
        key: 'industry',
        name: 'Industry',
        render: (data: Tenant) => `${data?.industry ?? ''}`,
      },
      {
        key: 'phoneNumber',
        name: 'Phone Number(s)',
        render: (data: Tenant) =>
          [data?.phoneNumber, ...(data?.secondaryPhoneNumbers || [])]
            .filter(Boolean)
            .join(', ') || 'N/A',
      },
      {
        key: 'email',
        name: 'Email Address(es)',
        render: (data: Tenant) =>
          [data?.email, ...(data?.secondaryEmails || [])]
            .filter(Boolean)
            .join(', ') || 'N/A',
      },
      {
        key: 'createdAt',
        name: 'Registration Date',
        isDate: true,
      },
    ],
  };

  const data = tenants?.data?.data;

  return (
    <div className="flex w-full">
      <EntityList
        parentStyle="w-full"
        viewMode={viewMode}
        check={check}
        detail={children}
        showArchived={false}
        showSelector={true}
        tableKey="tenants"
        title="Tenants"
        detailTitle={`${selectedTenant?.name ?? ''}`}
        newButtonText="New"
        total={tenants?.data?.count}
        collectionQuery={collection}
        itemsLoading={tenants?.isLoading || tenants?.isFetching}
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
