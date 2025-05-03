'use client';

import { LoadingOverlay } from '@mantine/core';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useLazyGetUserQuery } from '../../user/_store/user.query';
import { useLazyGetExpenseTypeQuery } from '../_store/expense-type.query';
import { DetailsPage } from '@pms/entity';
import EmptyIcon from '../../../icons/empty-icon';

export default function ExpenseTypeDetailComponent() {
  const params = useParams();

  const [getUser, user] = useLazyGetUserQuery();
  const [getExpenseType, expenseType] = useLazyGetExpenseTypeQuery();

  const data = [
    {
      key: 'name',
      label: 'Name',
      value: `${expenseType?.data?.name ?? ''}`,
    },
    {
      key: 'code',
      label: 'Type Code',
      value: `${expenseType?.data?.code ?? ''}`,
    },
    {
      key: 'createdAt',
      label: 'Registration Date',
      value: `${expenseType?.data?.createdAt ?? ''}`,
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
    editUrl: `/expense-types/${params?.id}`,
    isProfile: false,
    title: `${expenseType?.data?.name ?? ''}`,
    widthClass: 'w-full',
  };

  useEffect(() => {
    getExpenseType({
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
      {expenseType?.isLoading || expenseType?.isFetching ? (
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
          isLoading={expenseType.isLoading || expenseType.isFetching}
        />
      )}
    </div>
  );
}
