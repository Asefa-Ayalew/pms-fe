'use client';

import { LoadingOverlay } from '@mantine/core';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useLazyGetUserQuery } from '../../user/_store/user.query';
import { useLazyGetInvoiceItemQuery } from '../_store/invoice-item.query';
import { DetailsPage } from '@pms/entity';
import EmptyIcon from '../../../icons/empty-icon';

export default function InvoiceItemDetailComponent() {
  const params = useParams();

  const [getUser, user] = useLazyGetUserQuery();
  const [getInvoiceItem, invoiceItem] = useLazyGetInvoiceItemQuery();

  const data = [
    {
      key: 'name',
      label: 'Name',
      value: `${invoiceItem?.data?.chargeCode ?? ''}`,
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
    editUrl: `/invoice-item/${params?.id}`,
    isProfile: false,
    title: `${invoiceItem?.data?.chargeCode ?? ''}`,
    widthClass: 'w-full',
  };

  useEffect(() => {
    getInvoiceItem({
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
      {invoiceItem?.isLoading || invoiceItem?.isFetching ? (
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
          isLoading={invoiceItem.isLoading || invoiceItem.isFetching}
        />
      )}
    </div>
  );
}
