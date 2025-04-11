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
import { useLazyGetRoomsQuery } from './_store/room.query';
import { Room } from '@/app/models/room.model';

export default function Rooms({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();

  // Component states
  const [check, setCheck] = useState(false);
  const [selectedRoom, setSelectedType] = useState<Room>();
  const [viewMode, setViewMode] = useState<entityViewMode>('list');
  const [collection, setCollection] = useState<CollectionQuery>({
    skip: 0,
    top: 20,
    orderBy: [{ field: 'createdAt', direction: 'desc' }],
  });

  // RTK hooks
  const [getRoom, rooms] = useLazyGetRoomsQuery();

  useEffect(() => {
    getRoom(collection);
  }, [collection, getRoom]);

  useEffect(() => {
    setSelectedType(
      rooms?.data?.data?.find((item) => item?.id === `${params?.id}`),
    );
  }, [params?.id, rooms?.data?.data]);

  useEffect(() => {
    setViewMode(params?.id !== undefined ? 'detail' : 'list');
  }, [params?.id]);

  const config: EntityConfig<Room> = {
    primaryColumn: {
      key: 'Room',
      name: 'Room',
      render: (data: Room) => `${data?.description ?? ''}`,
    },
    rootUrl: '/room',
    identity: 'id',
    visibleColumn: [
      {
        key: 'description',
        name: 'Description',
        render: (data: Room) => `${data?.description ?? ''}`,
      },
      {
        key: 'Room Number',
        name: 'roomNumber',
        render: (data: Room) => `${data?.roomNumber ?? ''}`,
      },
      {
        key: 'Floor Number',
        name: 'Floor Number',
        render: (data: Room) => `${data?.floorNumber ?? ''}`,
      },
      {
        key: 'Size',
        name: 'Size',
        render: (data: Room) => `${data?.size ?? ''}`,
      },
      {
        key: 'createdAt',
        name: 'Registration Date',
        isDate: true,
      },
    ],
  };

  const data = rooms?.data?.data;

  return (
    <div className="flex w-full">
      <EntityList
        parentStyle="w-full"
        viewMode={viewMode}
        check={check}
        detail={children}
        showArchived={false}
        showSelector={true}
        tableKey="rooms"
        title="Rooms"
        detailTitle={`${selectedRoom?.description ?? ''}`}
        newButtonText="New"
        total={rooms?.data?.count}
        collectionQuery={collection}
        itemsLoading={rooms?.isLoading || rooms?.isFetching}
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
