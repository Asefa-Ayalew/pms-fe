'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useLazyGetRoleQuery } from '../_store/role.query';

import { LoadingOverlay, Tabs } from '@mantine/core';
import EmptyIcon from '@/app/icons/empty-icon';
import { DetailsPage } from '@pms/entity';

export default function RoleDetailComponent() {
  const params = useParams();

  const [getRole, role] = useLazyGetRoleQuery();

  const data = [
    {
      key: '1',
      label: 'Name',
      value: role?.data?.name ?? '',
    },

    {
      key: '5',
      label: 'Key',
      value: role?.data?.key ?? '',
    },
    {
      key: '6',
      label: 'Description',
      value: role?.data?.description ?? '',
    },
  ];

  const profileData = {
    image: '',
    name: `${role?.data?.name}:''}`,
    type: '',
    address: '',
    phone: '',
    email: '',
    isVerified: false,
  };
  const config = {
    editUrl: `/role/${params?.id}`,
    isProfile: false,
    title: `${role?.data?.name}`,
    widthClass: 'w-full',
    hideEditButton: true,
  };

  useEffect(() => {
    getRole(`${params?.id}`);
  }, [params?.id]);
  return (
    <div className="w-full flex-col space-y-4 border">
      <Tabs defaultValue="detail">
        <Tabs.List>
          <Tabs.Tab value="detail">Basic Detail</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="detail">
          {role?.isLoading || role?.isFetching ? (
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
              isLoading={role.isLoading || role.isFetching}
            />
          )}
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
