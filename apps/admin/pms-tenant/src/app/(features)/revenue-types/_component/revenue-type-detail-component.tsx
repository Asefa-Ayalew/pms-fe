'use client';

import { LoadingOverlay } from '@mantine/core';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useLazyGetUserQuery } from '../../user/_store/user.query';
import { useLazyGetRevenueTypeQuery } from '../_store/revenue-type.query';
import { DetailsPage } from '@pms/entity';
import EmptyIcon from '../../../icons/empty-icon';

export default function RevenueTypeDetailComponent() {
  const params = useParams();

  const [getUser, user] = useLazyGetUserQuery();
  const [getRevenueType, revenueType] = useLazyGetRevenueTypeQuery();

  const data = [
    {
      key: 'name',
      label: 'Type Name',
      value: `${revenueType?.data?.name ?? ''}`,
    },
    {
      key: 'code',
      label: 'Type Code',
      value: `${revenueType?.data?.code ?? ''}`,
    },
    {
      key: 'isActivate',
      label: 'Activated?',
      value: `${revenueType?.data?.isActive ?? ''}`,
    },
    {
      key: 'createdAt',
      label: 'Registration Date',
      value: `${revenueType?.data?.createdAt ?? ''}`,
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
    editUrl: `/revenue-types/${params?.id}`,
    isProfile: false,
    title: `${revenueType?.data?.name ?? ''}`,
    widthClass: 'w-full',
  };

  useEffect(() => {
    getRevenueType({
      id: `${params?.id}`,
    });
  }, [params?.id]);

  return (
    <div className="w-full flex-col space-y-4 buser">
      {revenueType?.isLoading || revenueType?.isFetching ? (
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
          isLoading={revenueType.isLoading || revenueType.isFetching}
        />
      )}
    </div>
  );
}
