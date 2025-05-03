'use client';

import { LoadingOverlay } from '@mantine/core';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useLazyGetUserQuery } from '../../user/_store/user.query';
import { useLazyGetDepartmentQuery } from '../_store/department.query';
import { DetailsPage } from '@pms/entity';
import dateFormat from "dateformat";
import EmptyIcon from '../../../icons/empty-icon';

export default function DepartmentDetailComponent() {
  const params = useParams();

  const [getUser, user] = useLazyGetUserQuery();
  const [getDepartment, department] = useLazyGetDepartmentQuery();
  let description = department?.data?.description ?? '';

  if (description.length > 40) {
    description = description.substring(0, 40) + ' ...more';
  }
  const data = [
    {
      key: 'name',
      label: 'Department Name',
      value: `${department?.data?.name ?? ''}`,
    },
    // {
    //     key: "description",
    //     label: "Department Description",
    //     value: description
    // },
    {
      key: 'createdAt',
      label: 'Registration Date',
      value: dateFormat(department?.data?.createdAt, 'mmmm dd, yyyy'),
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
    editUrl: `/departments/${params?.id}`,
    isProfile: false,
    title: `${department?.data?.name ?? ''}`,
    widthClass: 'w-full',
  };

  useEffect(() => {
    getDepartment({
      id: `${params?.id}`,
    });
  }, [params?.id]);

  return (
    <div className="w-full flex-col space-y-4 buser">
      {department?.isLoading || department?.isFetching ? (
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
          description={department?.data?.description ?? ''}
          isLoading={department.isLoading || department.isFetching}
        />
      )}
    </div>
  );
}
