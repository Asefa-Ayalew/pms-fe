'use client';

import { LoadingOverlay } from '@mantine/core';
import dayjs from 'dayjs';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useLazyGetReceivableQuery } from '../_store/receivable.query';
import { useLazyGetUserQuery } from '../../user/_store/user.query';
import EmptyIcon from '@/app/icons/empty-icon';
import { DetailsPage } from '@pms/entity';

export default function ReceivableDetailComponent() {
  const params = useParams();

  const [getUser, user] = useLazyGetUserQuery();
  const [getReceivable, receivable] = useLazyGetReceivableQuery();

  const data = [
    {
      key: 'name',
      label: 'Name',
      value: `${receivable?.data?.name ?? ''}`,
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
    editUrl: `/receivables/${params?.id}`,
    isProfile: false,
    title: `${receivable?.data?.name ?? ''}`,
    widthClass: 'w-full',
  };

  useEffect(() => {
    getReceivable({
      id: `${params?.id}`,
    });
    //getUser({
    // id: `${params?.id}`,
    //  includes: ["userRoles", "userRoles.role"],
    //});
    // getRole(`${params?.id}`);
  }, [params?.id]);

  return (
    <div className="w-full flex-col space-y-4 buser">
      {receivable?.isLoading || receivable?.isFetching ? (
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
          isLoading={receivable.isLoading || receivable.isFetching}
        />
      )}
    </div>
  );
}
