"use client";
import { Card, Divider, Modal } from "@mantine/core";
import { useParams, useSearchParams } from "next/navigation";
import { JSX, useEffect, useState } from "react";
import {
  useLazyGetLeasesQuery,
  useRemoveDocumentMutation,
} from "../../_store/lease.query";
import LeaseDocumentForm from "./lease-document-form.component";
import { LeaseDocument } from "@/app/models/lease.model";
import { leaseDocumentDefaultValues } from "@/app/schemas/lease-schema";
import { CollectionQuery, EntityConfig, EntityList, Order } from "@pms/entity";

export default function LeaseDocumentsComponent(props: {
  mode: "view" | "edit";
}) {
  const [modals, setModals] = useState({
    new: false,
    edit: false,
    view: false,
    archive: false,
  });

  const params = useParams();
  const searchParams = useSearchParams();
  const [selectedLeaseDocument, setSelectedLeaseDocument] =
    useState<LeaseDocument>(leaseDocumentDefaultValues);
  const [popoverOpened, setPopoverOpened] = useState<string | undefined>(
    undefined
  );

  const [getLeaseDocuments, { data: leaseDocuments, isLoading }] =
    useLazyGetLeasesQuery();
  const [deleteLeaseDocument, { isLoading: deleting }] =
    useRemoveDocumentMutation();

  const [collection, setCollection] = useState<CollectionQuery>({
    skip: 0,
    top: 20,
    filter: [[{ field: "propertyId", value: params.id, operator: "=" }]],
    orderBy: [{ field: "createdAt", direction: "desc" }],
  });

  const config: EntityConfig<LeaseDocument> = {
    primaryColumn: {
      key: "Description",
      name: "Description",
      render: (data: LeaseDocument) => `${data?.description ?? ""}`,
    },
    rootUrl: "/lease",
    identity: "id",
    showDetail: false,
    visibleColumn: [
      { name: "Description", key: "description" },
      { name: "Registration Date", key: "createdAt", isDate: true },
    ],
    filter: [
      [
        {
          name: "With Archived",
          field: "withArchived",
          value: true,
        },
      ],
    ],
    newAction: () => openModal("new"),
    actions: [
      { label: "Show More", icon: "IconEye", key: "showMore", type: "primary" },
      {
        label: "Edit",
        icon: "IconEdit",
        key: "edit",
        type: "primary",
        divider: true,
      },
      { label: "Delete", icon: "IconTrash", key: "delete", type: "danger" },
    ],
  };
  const onSearch = (data: string) => {
    setCollection((prev) => ({
      ...prev,
      search: data || "",
    }));
  };

  useEffect(() => {
    getLeaseDocuments(collection);
  }, [collection, getLeaseDocuments]);

  const openModal = (
    type: keyof typeof modals,
    leaseDocument?: LeaseDocument
  ) => {
    setSelectedLeaseDocument(leaseDocument ?? leaseDocumentDefaultValues);
    setModals((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const closeModal = (type: string) => {
    setModals((prev) => ({ ...prev, [type]: false }));
    setSelectedLeaseDocument(leaseDocumentDefaultValues);
  };

  const handleAction = (action: { key: string }, data?: LeaseDocument) => {
    switch (action.key) {
      case "showMore":
        openModal("view", data);
        break;
      case "edit":
        openModal("edit", data);
        break;
      case "delete":
        openModal("archive", data);
        break;
      default:
        console.warn("Unknown action:", action);
    }
  };
  const handleNewModal = () => {
    openModal("new");
  };
  const renderModal = (
    type: keyof typeof modals,
    title: string,
    size: string,
    content: JSX.Element
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
        showSelector={props.mode === "edit"}
        tableKey="documents"
        title="Documents"
        total={leaseDocuments?.count}
        collectionQuery={collection}
        itemsLoading={isLoading}
        config={config}
        items={leaseDocuments?.data}
        showNewButton={false}
        showNewModal={props.mode === "edit"}
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
            search: data || "",
            searchFrom: data ? ["name"] : [],
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
        "new",
        "Create Lease Document",
        "60%",
        <LeaseDocumentForm editMode="new" onClose={() => closeModal("new")} />
      )}
      {renderModal(
        "edit",
        "Edit Lease Document",
        "60%",
        <LeaseDocumentForm
          editMode="detail"
          onClose={() => closeModal("edit")}
          data={selectedLeaseDocument}
        />
      )}
      {renderModal(
        "view",
        "View Lease Document",
        "60%",
        <LeaseDocumentForm
          editMode="view"
          onClose={() => closeModal("view")}
          data={selectedLeaseDocument}
        />
      )}
      {/* {renderModal(
        "archive",
        "Reason",
        "50%",
        <ReasonForm
          id={selectedLeaseDocument?.id ?? ""}
          onClose={() => closeModal("archive")}
        />
      )} */}
    </Card>
  );
}
