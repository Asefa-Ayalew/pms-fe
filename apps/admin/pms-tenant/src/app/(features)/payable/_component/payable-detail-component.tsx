'use client';

import { LoadingOverlay } from '@mantine/core';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useLazyGetUserQuery } from '../../user/_store/user.query';
import { useLazyGetPayableQuery } from '../_store/payable.query';
import { DetailsPage } from '@pms/entity';
import EmptyIcon from '../../../icons/empty-icon';

export default function PayableDetailComponent() {
  const params = useParams();

  const [getUser, user] = useLazyGetUserQuery();
  const [getPayable, payable] = useLazyGetPayableQuery();

  const data = [
    {
      key: 'tenant',
      label: 'Tenant',
      value: `${payable?.data?.tenant?.name ?? ''}`,
    },
    {
      key: 'property',
      label: 'Property',
      value: `${payable?.data?.property?.description ?? ''}`,
    },
    {
      key: 'room',
      label: 'Room',
      value: `${payable?.data?.room?.description ?? ''}`,
    },
    {
      key: 'receiverName',
      label: 'Receiver Name',
      value: `${payable?.data?.receiverName ?? ''}`,
    },
    {
      key: 'receiverAccount',
      label: 'Receiver Account',
      value: `${payable?.data?.receiverAccount ?? ''}`,
    },
    {
      key: 'bankName',
      label: 'Bank Name',
      value: `${payable?.data?.bankName ?? ''}`,
    },
    {
      key: 'receiverType',
      label: 'Receiver Type',
      value: `${payable?.data?.totalAmount ?? ''}`,
    },
    {
      key: 'finalAmount',
      label: 'Final Amount',
      value: `${payable?.data?.finalAmount ?? ''}`,
    },
    {
      key: 'totalDiscount',
      label: 'Ttal Discount',
      value: `${payable?.data?.totalDiscount ?? ''}`,
    },
    {
      key: 'totalTax',
      label: 'Total Tax',
      value: `${payable?.data?.totalTax ?? ''}`,
    },
    {
      key: 'payableType',
      label: 'Payable Type',
      value: `${payable?.data?.payableType ?? ''}`,
    },
    {
      key: 'remark',
      label: 'Remark',
      value: `${payable?.data?.remark ?? ''}`,
    },
    {
      key: 'status',
      label: 'Status',
      value: `${payable?.data?.status ?? ''}`,
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
    editUrl: `/payable/${params?.id}`,
    isProfile: false,
    title: `${payable?.data?.receiverName ?? ''}`,
    widthClass: 'w-full',
  };

  useEffect(() => {
    getPayable({
      id: `${params?.id}`,
      includes: ['room', 'tenant', 'property'],
    });
  }, [params?.id, getPayable]);

  return (
    <div className="w-full flex-col space-y-4 buser">
      {payable?.isLoading || payable?.isFetching ? (
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
          isLoading={payable.isLoading || payable.isFetching}
        />
      )}
    </div>
  );
}
