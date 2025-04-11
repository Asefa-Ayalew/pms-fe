'use client';
import { DetailsPage } from '@pms/entity';
import { LoadingOverlay } from '@mantine/core';
import { useParams } from 'next/navigation';
import { getCurrentSession } from '@pms/auth';
import { useEffect, useState } from 'react';
import EmptyIcon from '@/app/icons/empty-icon';
import { useGetRoomQuery, useLazyGetRoomQuery } from '../../_store/room.query';

export default function RoomDetailComponent() {
  const params = useParams();
  const [user, setUser] = useState<any>(null);

  const [getRoom, { data: room }] = useLazyGetRoomQuery();
  useEffect(() => {
    getRoom({ id: `${params?.id}`, includes: ['property', 'tenant'] });
  }, [params.id, getRoom]);

  const data = [
    { key: 'tenant', label: 'Tenant', value: room?.tenant?.name ?? 'N/A' },
    { key: 'property', label: 'Property', value: room?.property?.description ?? 'N/A' },
    { key: 'description', label: 'Description', value: room?.description ?? 'N/A' },
    { key: 'floorNumber', label: 'Floor Number', value: room?.floorNumber ?? 'N/A' },
    { key: 'roomNumber', label: 'Room Number', value: room?.roomNumber ?? 'N/A' },
    { key: 'size', label: 'Size', value: room?.size ?? 'N/A' },
    { key: 'type', label: 'Type', value: room?.type ?? 'N/A' },
    { key: 'amenities', label: 'Amenities', value: room?.amenities ?? 'N/A' },
   
  ];

  const profileData = {
    image: '',
    name: `${user?.data?.firstName ?? ''} ${user?.data?.middleName ?? ''} ${user?.data?.lastName ?? ''}`,
    type: '',
    address: '',
    phone: '',
    email: '',
    isVerified: false,
  };

  const config = {
    editUrl: `/rooms/${params?.id}`,
    isProfile: false,
    title: `${room?.description}`,
    widthClass: 'w-full',
  };

  useEffect(() => {
    const fetchSession = async () => {
      const session = (await getCurrentSession()) || {};
      setUser(session);
    };

    fetchSession();
  }, []);

  return (
    <div className="w-full flex-col space-y-4 buser">
      {user?.profile?.isLoading || user?.profile?.isFetching ? (
        <div className="relative flex items-center justify-center">
          <LoadingOverlay
            visible={true}
            zIndex={1000}
            overlayProps={{ radius: 'sm', blur: 2 }}
          />
          <EmptyIcon />
        </div>
      ) : (
        <DetailsPage
          dataSource={[{ title: 'Basic Information', source: data }]}
          profileData={profileData}
          config={config}
          isLoading={user?.profile.isLoading || user?.profile.isFetching}
        />
      )}
    </div>
  );
}
