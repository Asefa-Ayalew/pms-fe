'use client';

import { LoadingOverlay, Tabs } from '@mantine/core';
import dayjs from 'dayjs';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useLazyGetUserQuery } from '../_store/user.query';
import EmergencyContactsComponent from './emergency-contact-component';
import UserRolesComponent from './user-roles-component';
import EmptyIcon from '@/app/icons/empty-icon';
import { DetailsPage } from '@pms/entity';

export default function UserDetailComponent() {
  const params = useParams();

  const [getUser, user] = useLazyGetUserQuery();
  // const [getRole, role] = useLazyGetRoleQuery();

  const data = [
    {
      key: 'name',
      label: 'Name',
      value: `${user?.data?.firstName ?? ''} ${user?.data?.middleName ?? ''} ${
        user?.data?.lastName ?? ''
      }`,
    },
    {
      key: 'userNumber',
      label: 'Employee Number',
      value: user?.data?.employeeNumber ?? '',
    },
    {
      key: 'phone',
      label: 'Phone',
      value: user?.data?.phone ?? '',
    },
    {
      key: 'email',
      label: 'Email',
      value: user?.data?.email ?? '',
    },
    {
      key: 'startDate',
      label: 'Employment Date',
      value: user?.data?.startDate
        ? dayjs(user?.data?.startDate).format('DD-MMM-YYYY')
        : '',
    },
    {
      key: 'tin',
      label: 'TIN',
      value: user?.data?.tin ?? '',
    },

    // {
    //   key: "roles",
    //   label: "Roles",
    //   value: user?.data?.userRoles?.map((item: any) => item?.role?.roleName).join(", ") ?? "",
    // },
  ];

  const profileData = {
    image: '',
    name: `${user?.data?.firstName ?? ''} ${user?.data?.middleName ?? ''} ${
      user?.data?.lastName ?? ''
    }`,
    type: '',
    address: '',
    phone: '',
    email: '',
    isVerified: false,
  };
  const config = {
    editUrl: `/user/${params?.id}`,
    isProfile: false,
    title: `${user?.data?.firstName ?? ''} ${user?.data?.middleName ?? ''} ${
      user?.data?.lastName ?? ''
    }`,
    widthClass: 'w-full',
  };

  useEffect(() => {
    getUser({
      id: `${params?.id}`,
      includes: ['userRoles', 'userContacts'],
    });
  }, [params?.id]);

  return (
    <Tabs defaultValue="detail" className="w-full">
      <Tabs.List className="gap-8 my-2">
        <Tabs.Tab value="detail">Detail</Tabs.Tab>
        <Tabs.Tab value="emergency">Emergency Contact</Tabs.Tab>
        <Tabs.Tab value="roles">Roles</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="detail">
        <div className="w-full flex-col space-y-4 buser">
          {user?.isLoading || user?.isFetching ? (
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
              isLoading={user.isLoading || user.isFetching}
            />
          )}
        </div>
      </Tabs.Panel>

      <Tabs.Panel value="emergency">
        <EmergencyContactsComponent />
      </Tabs.Panel>
      <Tabs.Panel value="roles">
        <UserRolesComponent />
      </Tabs.Panel>
    </Tabs>
  );
}
