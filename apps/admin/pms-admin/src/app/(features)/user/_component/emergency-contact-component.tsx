'use client';
import React, { JSX } from 'react';
import { EntityList, CollectionQuery, Order, EntityConfig } from '@pms/entity';
import { Card, Divider, Modal } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  useDeleteEmergencyContactMutation,
  useLazyGetUserQuery,
} from '../_store/emergency-contact.query';
import EmergencyContactForm from './emergency-contact-form';
import {
  EmergencyContact,
  UserContactType,
} from '@/app/models/emergency-contact.model';
// import ReasonForm from './reason-form-component';

export default function EmergencyContactsComponent() {
  const [modals, setModals] = useState({
    new: false,
    edit: false,
    view: false,
    archive: false,
  });

  const defaultEmergencyContactValue: EmergencyContact = {
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    email: '',
    userId: '',
    contactType: UserContactType.EMERGENCY,
    address: {
      country: '',
      city: '',
      subcity: '',
      woreda: '',
      kebele: '',
    },
  };
  const params = useParams();
  const searchParams = useSearchParams();
  const [selectedEmergencyContact, setSelectedEmergencyContact] =
    useState<EmergencyContact>(defaultEmergencyContactValue);
  const [popoverOpened, setPopoverOpened] = useState<string | undefined>(
    undefined,
  );

  const [deleteEmergencyContact, { isLoading: deleting }] =
    useDeleteEmergencyContactMutation();
  const [getUser, user] = useLazyGetUserQuery();

  const [collection, setCollection] = useState<CollectionQuery>({
    skip: 0,
    top: 20,
    filter: [[{ field: 'userId', value: params.id, operator: '=' }]],
    orderBy: [{ field: 'createdAt', direction: 'desc' }],
  });
  useEffect(() => {
    getUser({
      id: `${params?.id}`,
      includes: ['userRoles', 'userRoles.role', 'userContacts'],
    });
  }, [params?.id]);
  const contacts = user?.data?.userContacts;
  console.log('This is the contacts', contacts);

  const config: EntityConfig<EmergencyContact> = {
    primaryColumn: {
      key: 'name',
      name: 'Contact Name',
      render: (data: EmergencyContact) => {
        const fullName = [data?.firstName, data?.middleName, data?.lastName]
          .filter((name) => name && name.trim() !== '') // Remove empty strings
          .join(' ');

        return fullName || 'N/A';
      },
    },
    rootUrl: '/user',
    identity: 'id',
    showDetail: false,
    visibleColumn: [
      { name: 'First Name', key: 'firstName' },
      { name: 'Middle Name', key: 'middleName' },
      { name: 'Last Name', key: 'lastName' },
      { name: 'Email', key: 'email' },
      { name: 'Phone', key: 'phone' },
      { name: 'Contact Type', key: 'contactType' },
      { name: 'Registration Date', key: 'createdAt', isDate: true },
    ],
    filter: [
      [
        {
          name: 'With Archived',
          field: 'withArchived',
          value: true,
        },
      ],
    ],
    newAction: () => openModal('new'),
    actions: [
      { label: 'Show More', icon: 'IconEye', key: 'showMore', type: 'primary' },
      {
        label: 'Edit',
        icon: 'IconEdit',
        key: 'edit',
        type: 'primary',
        divider: true,
      },
      { label: 'Delete', icon: 'IconTrash', key: 'delete', type: 'danger' },
    ],
  };

  const onSearch = (data: string) => {
    setCollection((prev) => ({
      ...prev,
      search: data || '',
    }));
  };

  // useEffect(() => {
  //     getEmergencyContacts(collection);
  // }, [collection, getEmergencyContacts]);

  const openModal = (type: keyof typeof modals, room?: EmergencyContact) => {
    setSelectedEmergencyContact(room ?? defaultEmergencyContactValue);
    setModals((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const closeModal = (type: string) => {
    setModals((prev) => ({ ...prev, [type]: false }));
    setSelectedEmergencyContact(defaultEmergencyContactValue);
  };

  const onDelete = async (id: string) => {
    try {
      await deleteEmergencyContact(id).unwrap();
      notifications.show({
        title: 'Success',
        message: 'Successfully Deleted',
        color: 'green',
      });
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Not Successfully Deleted',
        color: 'red',
      });
    }
  };
  const handleAction = (action: { key: string }, data?: EmergencyContact) => {
    switch (action.key) {
      case 'showMore':
        openModal('view', data);
        break;
      case 'edit':
        openModal('edit', data);
        break;
      case 'delete':
        openModal('archive', data);
        break;
      default:
        console.warn('Unknown action:', action);
    }
  };
  const handleNewModal = () => {
    openModal('new');
  };
  const renderModal = (
    type: keyof typeof modals,
    title: string,
    size: string,
    content: JSX.Element,
  ) => (
    <Modal
      opened={modals[type]}
      onClose={() => closeModal(type)}
      title={title}
      centered
      size={size}
    >
      <Divider />
      {content}
    </Modal>
  );

  return (
    <Card shadow="sm" padding="sm">
      <EntityList
        viewMode="list"
        parentStyle="w-full"
        showArchived={false}
        showSelector={true}
        tableKey="contacts"
        title=""
        newButtonText="New"
        total={contacts?.length}
        collectionQuery={collection}
        config={config}
        items={contacts}
        showNewButton={false}
        showNewModal={true}
        initialPage={1}
        defaultPageSize={collection.top}
        pageSize={[20, 30, 50, 100]}
        onPaginationChange={(skip: number, top: number) => {
          const after = (skip - 1) * top;
          setCollection({ ...collection, skip: after, top: top });
        }}
        onSearch={(data: any) => {
          setCollection({
            ...collection,
            search: data || '',
            searchFrom: data ? ['firstName', 'middleName', 'lastName'] : [],
          });
        }}
        onFilterChange={(data: any) => {
          if (data.length > 0) {
            setCollection({ ...collection, withArchived: true });
          } else {
            setCollection({ ...collection, withArchived: false });
          }
        }}
        onOrder={(data: Order) =>
          setCollection({ ...collection, orderBy: [data] })
        }
        handleAction={handleAction}
        handleNewModal={handleNewModal}
      />

      {renderModal(
        'new',
        'Create Emergency Contact',
        '50%',
        <EmergencyContactForm
          editMode="new"
          onClose={() => closeModal('new')}
        />,
      )}
      {renderModal(
        'edit',
        'Edit Emergency Contact',
        '50%',
        <EmergencyContactForm
          editMode="detail"
          onClose={() => closeModal('edit')}
          data={selectedEmergencyContact}
        />,
      )}
      {renderModal(
        'view',
        'View Emergency Contact',
        '50%',
        <EmergencyContactForm
          editMode="view"
          onClose={() => closeModal('view')}
          data={selectedEmergencyContact}
        />,
      )}
      {/* {renderModal(
        'archive',
        'Reason',
        '50%',
        <ReasonForm
          id={selectedEmergencyContact?.id ?? ''}
          onClose={() => closeModal('archive')}
        />,
      )} */}
    </Card>
  );
}
