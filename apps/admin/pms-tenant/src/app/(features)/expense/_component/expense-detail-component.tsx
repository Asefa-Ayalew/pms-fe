'use client';

import { LoadingOverlay } from '@mantine/core';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useLazyGetUserQuery } from '../../user/_store/user.query';
import { useLazyGetExpenseQuery } from '../_store/expense.query';
import { DetailsPage } from '@pms/entity';
import EmptyIcon from '../../../icons/empty-icon';

export default function ExpenseDetailComponent() {
  const params = useParams();

  const [getUser, user] = useLazyGetUserQuery();
  const [getExpense, { data: expense, isLoading, isFetching }] =
    useLazyGetExpenseQuery();

  const data = [
    {
      key: 'property',
      label: 'Property',
      value: `${expense?.property?.description ?? ''}`,
    },
    {
      key: 'room',
      label: 'Room',
      value: `${expense?.room?.description ?? ''}`,
    },
    {
      key: 'payable',
      label: 'Payable',
      value: `${expense?.payable?.receiverName ?? ''}`,
    },
    {
      key: 'expenseType',
      label: 'Expense Type',
      value: `${expense?.expenseType?.name ?? ''}`,
    },
    {
      key: 'chargeCode',
      label: 'Charge Code',
      value: `${expense?.chargeCode}`,
    },
    {
      key: 'numUnits',
      label: 'Number of Units',
      value: `${expense?.numUnits}`,
    },
    {
      key: 'unitPrice',
      label: 'Unit Price',
      value: `${expense?.unitPrice}`,
    },
    {
      key: 'totalAmount',
      label: 'Total Amount',
      value: `${expense?.totalAmount}`,
    },
    {
      key: 'finalAmount',
      label: 'Final Amount',
      value: `${expense?.finalAmount}`,
    },
    {
      key: 'totalDiscount',
      label: 'Total Discount',
      value: `${expense?.totalDiscount}`,
    },
    {
      key: 'discountPercent',
      label: 'Discount Percent',
      value: `${expense?.discountPercent}`,
    },
    {
      key: 'taxable',
      label: 'Taxable',
      value: `${expense?.taxable}`,
    },
    {
      key: 'totalTax',
      label: 'Total Tax',
      value: `${expense?.totalTax}`,
    },
    {
      key: 'sendToPayable',
      label: 'Send To Payable',
      value: `${expense?.sentToPayable}`,
    },
    {
      key: 'posted',
      label: 'Posted?',
      value: `${expense?.posted}`,
    },
    {
      key: 'remark',
      label: 'Remark',
      value: `${expense?.remark}`,
    },
    {
      key: 'createdAt',
      label: 'Registration Date',
      value: `${expense?.createdAt}`,
      isDate: true,
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
    editUrl: `/expense/${params?.id}`,
    isProfile: false,
    title: `${expense?.chargeCode ?? ''}`,
    widthClass: 'w-full',
  };

  useEffect(() => {
    getExpense({
      id: `${params?.id}`,
      includes: ['property', 'room', 'payable', 'expenseType'],
    });
  }, [params?.id, getExpense]);

  return (
    <div className="w-full flex-col space-y-4 buser">
      {isLoading || isFetching ? (
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
          isLoading={isLoading || isFetching}
        />
      )}
    </div>
  );
}
