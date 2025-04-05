'use client';

import { useEffect, useState } from 'react';

import {
  EntityList,
  EntityConfig,
  entityViewMode,
  CollectionQuery,
  Order,
} from '@pms/entity';
import { useParams } from 'next/navigation';
import { useLazyGetPropertiesQuery } from './_store/property.query';
import { Property } from '@/app/models/property.model';

export default function PropertyListPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();

  // Component states
  const [check, setCheck] = useState(false);
  const [selectedProperty, setSelectedType] = useState<Property>();
  const [viewMode, setViewMode] = useState<entityViewMode>('list');
  const [collection, setCollection] = useState<CollectionQuery>({
    skip: 0,
    top: 20,
    orderBy: [{ field: 'createdAt', direction: 'desc' }],
  });

  // RTK hooks
  const [getProperties, properties] = useLazyGetPropertiesQuery();

  useEffect(() => {
    getProperties(collection);
  }, [collection, getProperties]);

  useEffect(() => {
    setSelectedType(
      properties?.data?.data?.find((item) => item?.id === `${params?.id}`),
    );
  }, [params?.id, properties?.data?.data]);

  useEffect(() => {
    setViewMode(params?.id !== undefined ? 'detail' : 'list');
  }, [params?.id]);

  const config: EntityConfig<Property> = {
    primaryColumn: {
      key: 'Description',
      name: 'Description',
      render: (data: Property) => `${data?.description ?? ''}`,
    },
    rootUrl: '/property',
    identity: 'id',
    visibleColumn: [
      { name: 'Description', key: 'description' },
      { name: 'Size', key: 'size' },
      { name: 'Is Furnished', key: 'isFurnished', isBoolean: true },
      { name: 'Number of Rooms', key: 'numberOfRooms', isNumber: true },
      { name: 'Registration Date', key: 'createdAt', isDate: true },
    ],
    filter: [
      [
        {
          name: 'With Archived',
          field: 'withArchived',
          value: true,
        },
      ],
    ],
  };

  const data = properties?.data?.data;

  return (
    <div className="flex w-full">
      <EntityList
        parentStyle="w-full"
        viewMode={viewMode}
        check={check}
        detail={children}
        showArchived={false}
        showSelector={true}
        tableKey="properties"
        title="Property Names"
        detailTitle={`${selectedProperty?.description ?? ''}`}
        newButtonText="New Property"
        total={properties?.data?.count}
        collectionQuery={collection}
        itemsLoading={properties?.isLoading || properties?.isFetching}
        config={config}
        items={data}
        initialPage={1}
        defaultPageSize={collection.top}
        pageSize={[20, 30, 50, 100]}
        onShowSelector={(e: any) => setCheck(e)}
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
          if (data.length > 0) {
            setCollection({ ...collection, withArchived: true });
          } else {
            setCollection({ ...collection, withArchived: false });
          }
        }}
        onOrder={(data: Order) =>
          setCollection({ ...collection, orderBy: [data] })
        }
      />
    </div>
  );
}
