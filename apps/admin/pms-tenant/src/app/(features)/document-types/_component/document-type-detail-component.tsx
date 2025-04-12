'use client';

import { LoadingOverlay } from '@mantine/core';
import dateFormat from 'dateformat';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useLazyGetUserQuery } from '../../user/_store/user.query';
import { useLazyGetDocumentTypeQuery } from '../_store/document-type.query';
import EmptyIcon from '@/app/icons/empty-icon';
import { DetailsPage } from '@pms/entity';

export default function DocumentTypeDetailComponent() {
  const params = useParams();

  const [getUser, user] = useLazyGetUserQuery();
  const [getDocumentType, documentType] = useLazyGetDocumentTypeQuery();

  const data = [
    {
      key: 'name',
      label: 'Name',
      value: `${documentType?.data?.name ?? ''}`,
    },
    {
      key: 'isMandatory',
      label: 'Requirement',
      value: documentType?.data?.isMandatory ? 'Mandatory' : 'Optional',
    },
    {
      key: 'isExpiration',
      label: 'Expiration',
      value: documentType?.data?.hasExpirationDate
        ? 'With Expiration Date'
        : 'No Expiration',
    },
    {
      key: 'createdAt',
      label: 'Registration Date',
      value: dateFormat(documentType?.data?.createdAt, 'mmmm dd, yyyy'),
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
    editUrl: `/document-types/${params?.id}`,
    isProfile: false,
    title: `${documentType?.data?.name ?? ''}`,
    widthClass: 'w-full',
  };

  useEffect(() => {
    getDocumentType({
      id: `${params?.id}`,
    });
  }, [params?.id]);

  return (
    <div className="w-full flex-col space-y-4 buser">
      {documentType?.isLoading || documentType?.isFetching ? (
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
          isLoading={documentType.isLoading || documentType.isFetching}
        />
      )}
    </div>
  );
}
