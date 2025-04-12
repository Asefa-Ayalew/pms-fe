'use client';

import { LoadingOverlay } from '@mantine/core';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useLazyGetUserQuery } from '../../user/_store/user.query';
import { useLazyGetMaintenanceRequestQuery } from '../_store/maintenance-request.query';
import EmptyIcon from '@/app/icons/empty-icon';
import { DetailsPage } from '@pms/entity';

export default function MaintenanceRequestDetailComponent() {
  const params = useParams();

  const [getUser, user] = useLazyGetUserQuery();
  const [getMaintenanceRequest, maintenanceRequest] =
    useLazyGetMaintenanceRequestQuery();

  const data = [
    {
      key: 'name',
      label: 'Name',
      value: `${maintenanceRequest?.data?.title ?? ''}`,
    },
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
    editUrl: `/maintenance-requests/${params?.id}`,
    isProfile: false,
    title: `${maintenanceRequest?.data?.title ?? ''}`,
    widthClass: 'w-full',
  };

  useEffect(() => {
    getMaintenanceRequest({
      id: `${params?.id}`,
    });
  }, [params?.id]);

  return (
    <div className="w-full flex-col space-y-4 buser">
      {maintenanceRequest?.isLoading || maintenanceRequest?.isFetching ? (
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
          isLoading={
            maintenanceRequest.isLoading || maintenanceRequest.isFetching
          }
        />
      )}
    </div>
  );
}
