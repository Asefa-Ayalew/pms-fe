"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button, Divider, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconSend } from "@tabler/icons-react";
import ReceivableForm from "./_component/receivable-form-component";
import { useLazyGetInvoiceItemsQuery } from "./_store/invoice-item.query";
import { InvoiceItem } from "@/app/models/invoice-item.model";
import { CollectionQuery, EntityConfig, EntityList, entityViewMode, Order } from "@pms/entity";

export default function InvoiceItemListPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();

  // Component states
  const [check, setCheck] = useState(false);
  const [selectedInvoiceItem, setSelectedType] = useState<InvoiceItem>();
  const [viewMode, setViewMode] = useState<entityViewMode>("list");
  const [opened, { open, close }] = useDisclosure(false);
  const [checkedItems, setCheckedItems] = useState<InvoiceItem[]>();
  const [collection, setCollection] = useState<CollectionQuery>({
    skip: 0,
    top: 20,
    orderBy: [{ field: "createdAt", direction: "desc" }],
  });

  // RTK hooks
  const [getInvoiceItems, { data: invoiceItems, isLoading, isFetching }] =
    useLazyGetInvoiceItemsQuery();

  useEffect(() => {
    getInvoiceItems({
      ...collection,
      includes: ["property", "room", "revenueType"],
    });
  }, [collection, getInvoiceItems]);

  useEffect(() => {
    setSelectedType(
      invoiceItems?.data?.find((item) => item?.id === `${params?.id}`)
    );
  }, [params?.id, invoiceItems?.data]);

  useEffect(() => {
    setViewMode(params?.id !== undefined ? "detail" : "list");
  }, [params?.id]);

  const config: EntityConfig<InvoiceItem> = {
    primaryColumn: {
      name: "Charge Code",
      key: "chargeCode",
      render: (data: InvoiceItem) => `${data?.chargeCode ?? ""}`,
    },
    rootUrl: "/invoice-item",
    identity: "id",
    visibleColumn: [
      {
        name: "Property",
        key: "",
        render: (data: InvoiceItem) => `${data?.property?.description ?? ""}`,
      },
      {
        name: "Room",
        key: "",
        render: (data: InvoiceItem) => `${data?.room?.description ?? ""}`,
      },
      {
        name: "InvoiceItem Type",
        key: "",
        render: (data: InvoiceItem) => `${data?.revenueType?.name ?? ""}`,
      },
      {
        name: "Sent to Receivable",
        key: "sentToReceivable",
        isBoolean: true,
      },
      {
        name: "Status",
        key: "status",
      },
      {
        name: "Registration Date",
        key: "createdAt",
        isDate: true,
      },
    ],
  };
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
        tableKey="invoiceItems"
        title={
          <div className="flex justify-between items-center content-center mt-1">
            <h1 className="font-semibold">Invoice Items</h1>
            <Button
              leftSection={<IconSend size={16} color="gray" />}
              variant="default"
              className="text-gray-900"
              onClick={open}
              disabled={!checkedItems?.length}
            >
              Send to Receivable
            </Button>
          </div>
        }
        detailTitle={`${selectedInvoiceItem?.chargeCode ?? ""}`}
        newButtonText="New"
        total={invoiceItems?.count}
        collectionQuery={collection}
        itemsLoading={invoiceItems?.isLoading || invoiceItems?.isFetching}
        config={config}
        items={invoiceItems?.data}
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
            search: data || "",
            searchFrom: data ? ["name"] : [],
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
      <Modal opened={opened} onClose={close} title="Fill forms" size={"70%"}>
        <Divider />
        <ReceivableForm data={checkedItems} />
      </Modal>
    </div>
  );
}
