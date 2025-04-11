'use client';
import { DetailsPage } from '@pms/entity';
import { LoadingOverlay } from '@mantine/core';
import { useParams } from 'next/navigation';
import { getCurrentSession } from '@pms/auth';
import { useEffect, useState } from 'react';
import EmptyIcon from '@/app/icons/empty-icon';
import { useLazyGetTenantQuery } from '../_store/tenant.query';

export default function TenantDetailComponent() {
  const params = useParams();

  const [user, setUser] = useState<any>(null);
  const [getTenant, { data: tenant}] = useLazyGetTenantQuery();

  useEffect(()=>{
    getTenant({id: `${params?.id}`})
  }, [getTenant, params?.id])

  const data = [
    { key: 'name', label: 'Name', value: tenant?.name ?? 'N/A' },
    { key: 'tradeName', label: 'Trade Name', value: tenant?.tradeName ?? 'N/A' },
    { key: 'shortCode', label: 'Short Code', value: tenant?.shortCode ?? 'N/A' },
    { key: 'email', label: 'email', value: tenant?.email ?? 'N/A' },
    { key: 'secondaryEmails', label: 'Secondary Emails', value: tenant?.secondaryEmails ?? 'N/A' },
    { key: 'phoneNumber', label: 'Phone Number', value: tenant?.phoneNumber ?? 'N/A' },
    { key: 'secondaryPhoneNumber', label: 'Secondary Phone Numbers', value: tenant?.secondaryPhoneNumbers ?? 'N/A' },
    { key: 'tin', label: 'TIN', value: tenant?.tin ?? 'N/A' },
    { key: 'createdAt', label: 'Registration Date', value: tenant?.createdAt ?? 'N/A' },
   
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
