'use client';

import { LoadingOverlay } from '@mantine/core';
import dayjs from 'dayjs';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useLazyGetUserQuery } from '../../../user/_store/user.query';
import { useLazyGetLeaseQuery } from '../../_store/lease.query';
import { DetailsPage } from '@pms/entity';
import EmptyIcon from '../../../../icons/empty-icon';

export default function LeaseDetailComponent() {
  const params = useParams();

  const [getUser, user] = useLazyGetUserQuery();
  const [getLease, lease] = useLazyGetLeaseQuery();

  const data = [
    {
      key: 'tenant',
      label: 'Tenant',
      value: `${lease?.data?.tenant?.name}`,
    },
    {
      key: 'contractor',
      label: 'Contractor',
      value: `${lease?.data?.contractor?.name}`,
    },
    {
      key: 'room',
      label: 'Room',
      value: `${lease?.data?.room?.description}`,
    },
    {
      key: 'monthlyRent',
      label: 'Monthly Rent',
      value: `${lease?.data?.monthlyRent ?? ''}`,
    },
    {
      key: 'startDate',
      label: 'Start Date',
      value: lease?.data?.startDate
        ? dayjs(lease?.data?.startDate).format('DD-MMM-YYYY')
        : '',
    },
    {
      key: 'endDate',
      label: 'End Date',
      value: lease?.data?.startDate
        ? dayjs(lease?.data?.startDate).format('DD-MMM-YYYY')
        : '',
    },
    {
      key: 'timestamp',
      label: 'Registration Date',
      value: lease?.data?.createdAt
        ? dayjs(lease?.data?.createdAt).format('DD-MMM-YYYY')
        : '',
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
    editUrl: `/lease/${params?.id}`,
    isProfile: false,
    title: `${lease?.data?.monthlyRent ?? ''}`,
    widthClass: 'w-full',
  };

  useEffect(() => {
    getLease({
      id: `${params?.id}`,
      includes: ['room', 'tenant', 'contractor'],
    });
    //getUser({
    // id: `${params?.id}`,
    //  includes: ["userRoles", "userRoles.role"],
    //});
    // getRole(`${params?.id}`);
  }, [params?.id]);

  return (
    <div className="w-full flex-col space-y-4 buser">
      {lease?.isLoading || lease?.isFetching ? (
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
          isLoading={lease.isLoading || lease.isFetching}
        />
      )}
    </div>
  );
}
