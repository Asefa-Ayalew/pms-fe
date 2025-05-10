'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button, Divider, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSend } from '@tabler/icons-react';
import PayableForm from './_component/payable-form-component';
import { useLazyGetExpensesQuery } from './_store/expense.query';
import {
  CollectionQuery,
  EntityConfig,
  EntityList,
  entityViewMode,
  Order,
} from '@pms/entity';
import { Expense } from '../../models/expense.model';

export default function ExpenseListPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();

  // Component states
  const [check, setCheck] = useState(false);
  const [selectedExpense, setSelectedType] = useState<Expense>();
  const [viewMode, setViewMode] = useState<entityViewMode>('list');
  const [checkedItems, setCheckedItems] = useState<Expense[]>();
  const [opened, { open, close }] = useDisclosure(false);
  const [collection, setCollection] = useState<CollectionQuery>({
    skip: 0,
    top: 20,
    orderBy: [{ field: 'createdAt', direction: 'desc' }],
  });

  // RTK hooks
  const [getExpense, expenses] = useLazyGetExpensesQuery();

  useEffect(() => {
    getExpense({
      ...collection,
      includes: ['property', 'room', 'expenseType'],
    });
  }, [collection, getExpense]);

  useEffect(() => {
    setSelectedType(
      expenses?.data?.data?.find((item) => item?.id === `${params?.id}`),
    );
  }, [params?.id, expenses?.data?.data]);

  useEffect(() => {
    setViewMode(params?.id !== undefined ? 'detail' : 'list');
  }, [params?.id]);

  const config: EntityConfig<Expense> = {
    primaryColumn: {
      key: 'chargeCode',
      name: 'Expense Name',
      render: (data: Expense) => `${data?.chargeCode ?? ''}`,
    },
    rootUrl: '/expense',
    identity: 'id',
    visibleColumn: [
      {
        key: '',
        name: 'Property',
        render: (data: Expense) => `${data?.property?.description ?? ''}`,
      },
      {
        key: '',
        name: 'Room',
        render: (data: Expense) => `${data?.room?.description ?? ''}`,
      },
      {
        key: '',
        name: 'Expense Type',
        render: (data: Expense) => `${data?.expenseType?.name ?? ''}`,
      },
      {
        key: 'sentToPayable',
        name: 'Send to Payable',
        isBoolean: true,
      },
      {
        key: 'status',
        name: 'Status',
      },
      {
        key: 'createdAt',
        name: 'Registration Date',
        isDate: true,
      },
    ],
  };
  const onItemSelected = (data: any[]) => {
    setCheckedItems(data);
  };

  const data = expenses?.data?.data;

  return (
    <div className="flex w-full">
      <EntityList
        parentStyle="w-full"
        viewMode={viewMode}
        check={check}
        detail={children}
        showArchived={false}
        showSelector={true}
        tableKey="expenses"
        title={
          <div className="flex justify-between items-center content-center mt-1">
            <h1 className="font-semibold">Expenses</h1>
            <Button
              leftSection={<IconSend size={16} color="gray" />}
              variant="default"
              className="text-gray-900"
              onClick={open}
              disabled={!checkedItems?.length}
            >
              Send to payable
            </Button>
          </div>
        }
        detailTitle={`${selectedExpense?.chargeCode ?? ''}`}
        newButtonText="New"
        total={expenses?.data?.count}
        collectionQuery={collection}
        itemsLoading={expenses?.isLoading || expenses?.isFetching}
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
        <PayableForm data={checkedItems} />
      </Modal>
    </div>
  );
}
