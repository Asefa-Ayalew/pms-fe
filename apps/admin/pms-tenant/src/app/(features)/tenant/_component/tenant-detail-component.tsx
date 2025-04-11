'use client';
import { DetailsPage } from '@pms/entity';
import { LoadingOverlay } from '@mantine/core';
import { useParams } from 'next/navigation';
import EmptyIcon from '@/app/icons/empty-icon';
import { getCurrentSession } from '@pms/auth';
import { useEffect, useState } from 'react';

export default function TenantDetailComponent() {
  const params = useParams();

  const [user, setUser] = useState<any>(null);

  const data = [
    {
      key: 'name',
      label: 'Name',
      value: user?.profile?.data?.name ?? 'N/A',
    },
    {
      key: 'tradeName',
      label: 'Trade Name',
      value: user?.profile?.data?.tradeName ?? 'N/A',
    },
    {
      key: 'tin',
      label: 'Taxpayer ID Number',
      value: user?.profile?.data?.tin ?? 'N/A',
    },
    {
      key: 'phoneNumber',
      label: 'Phone Number',
      value:
        [
          user?.profile?.data?.phoneNumber,
          ...(user?.profile?.data?.secondaryPhoneNumbers || []),
        ]
          .filter(Boolean)
          .join(', ') || 'N/A',
    },
    {
      key: 'email',
      label: 'Email Address',
      value:
        [
          user?.profile?.data?.email,
          ...(user?.profile?.data?.secondaryEmails || []),
        ]
          .filter(Boolean)
          .join(', ') || 'N/A',
    },
    {
      key: 'industry',
      label: 'Industry',
      value: user?.profile?.data?.industry ?? 'N/A',
    },
    {
      key: 'createdAt',
      label: 'Registered On',
      value: user?.profile?.data?.createdAt
        ? new Date(user?.profile.data.createdAt).toLocaleString()
        : 'N/A',
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
    editUrl: `/tenants/${params?.id}`,
    isProfile: false,
    title: `${user?.profile?.data?.name ?? ''}`,
    widthClass: 'w-full',
  };

  useEffect(() => {
    const fetchSession = async () => {
      const session = await getCurrentSession() || {};
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
