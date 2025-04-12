'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Divider, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconFileInvoice } from '@tabler/icons-react';
import GenerateBankSlipForm from './_component/generate-bank-slip-form-component';
import { useLazyGetPayablesQuery } from './_store/payable.query';
import { Payable } from '@/app/models/payable.model';
import {
  CollectionQuery,
  EntityConfig,
  EntityList,
  entityViewMode,
  Order,
} from '@pms/entity';

export default function PayableListPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();

  // Component states
  const [check, setCheck] = useState(false);
  const [selectedPayable, setSelectedType] = useState<Payable>();
  const [viewMode, setViewMode] = useState<entityViewMode>('list');
  const [checkedItems, setCheckedItems] = useState<Payable[]>();
  const [opened, { open, close }] = useDisclosure(false);
  const [collection, setCollection] = useState<CollectionQuery>({
    skip: 0,
    top: 20,
    orderBy: [{ field: 'createdAt', direction: 'desc' }],
  });

  // RTK hooks
  const [getPayable, payables] = useLazyGetPayablesQuery();

  useEffect(() => {
    getPayable({ ...collection, includes: ['property', 'room'] });
  }, [collection, getPayable]);

  useEffect(() => {
    setSelectedType(
      payables?.data?.data?.find((item) => item?.id === `${params?.id}`),
    );
  }, [params?.id, payables?.data?.data]);

  useEffect(() => {
    setViewMode(params?.id !== undefined ? 'detail' : 'list');
  }, [params?.id]);

  const config: EntityConfig<Payable> = {
    primaryColumn: {
      key: 'Receiver Name',
      name: 'Receiver Name',
      render: (data: Payable) => `${data?.receiverName ?? ''}`,
    },
    rootUrl: '/payable',
    identity: 'id',
    visibleColumn: [
      {
        key: 'property',
        name: 'Property',
        render: (data: Payable) => `${data?.property?.description ?? ''}`,
      },
      {
        key: 'room',
        name: 'Room',
        render: (data: Payable) => `${data?.room?.description ?? ''}`,
      },
      {
        key: 'receiverName',
        name: 'Receiver Name',
        render: (data: Payable) => `${data?.receiverName ?? ''}`,
      },
      {
        key: 'receiverType',
        name: 'Receiver Type',
        render: (data: Payable) => `${data?.receiverType ?? ''}`,
      },
      {
        key: 'status',
        name: 'Status',
        render: (data: Payable) => `${data?.status ?? ''}`,
      },
      {
        key: 'createdAt',
        name: 'Registration Date',
        isDate: true,
      },
    ],
  };

  const data = payables?.data?.data;
  const onItemSelected = (data: any[]) => {
    setCheckedItems(data);
  };
  return (
    <div className="flex w-full">
      <EntityList
        parentStyle="w-full"
        viewMode={viewMode}
        check={check}
        detail={children}
        showArchived={false}
        showSelector={true}
        tableKey="payables"
        title={
          <div className="flex justify-between items-center content-center mt-1">
            <h1 className="font-semibold">Payables</h1>
            <Button
              leftSection={<IconFileInvoice size={16} color="gray" />}
              variant="default"
              className="text-gray-900"
              onClick={open}
              disabled={!checkedItems?.length}
            >
              Generate Bank Slip
            </Button>
          </div>
        }
        detailTitle={`${selectedPayable?.receiverName ?? ''}`}
        newButtonText="New"
        total={payables?.data?.count}
        collectionQuery={collection}
        itemsLoading={payables?.isLoading || payables?.isFetching}
        config={config}
        items={data}
        initialPage={1}
        defaultPageSize={collection.top}
        pageSize={[20, 30, 50, 100]}
        onShowSelector={(e) => setCheck(e)}
        onPaginationChange={(skip: number, top: number) => {
          const after = (skip - 1) * top;
          setCollection({ ...collection, skip: after, top: top });
        }}
        onSearch={(data: any) => {
          setCollection({
            ...collection,
            search: data || '',
            searchFrom: data ? ['name'] : [],
          });
        }}
        onFilterChange={(data: any) => {
          if (collection?.filter || data.length > 0) {
            // setCollection({ ...collection, filter: data });
          }
        }}
        onOrder={(data: Order) =>
          setCollection({ ...collection, orderBy: [data] })
        }
        onItemsSelected={onItemSelected}
      />
      <Modal opened={opened} onClose={close} title="Fill forms" size={'70%'}>
        <Divider />
        <GenerateBankSlipForm data={checkedItems} />
      </Modal>
    </div>
  );
}
