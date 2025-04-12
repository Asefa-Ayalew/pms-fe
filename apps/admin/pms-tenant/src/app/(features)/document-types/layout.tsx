"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useLazyGetDocumentTypesQuery } from "./_store/document-type.query";
import { CollectionQuery, EntityConfig, EntityList, entityViewMode, Order } from "@pms/entity";
import { DocumentType } from "@/app/models/document-type.model";

export default function DocumentTypeListPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();

  // Component states
  const [check, setCheck] = useState(false);
  const [selectedDocumentType, setSelectedType] = useState<DocumentType>();
  const [viewMode, setViewMode] = useState<entityViewMode>("list");
  const [collection, setCollection] = useState<CollectionQuery>({
    skip: 0,
    top: 20,
    orderBy: [{ field: "createdAt", direction: "desc" }],
  });

  // RTK hooks
  const [getDocumentType, documentTypes] = useLazyGetDocumentTypesQuery();

  useEffect(() => {
    getDocumentType(collection);
  }, [collection, getDocumentType]);

  useEffect(() => {
    setSelectedType(
      documentTypes?.data?.data?.find((item) => item?.id === `${params?.id}`)
    );
  }, [params?.id, documentTypes?.data?.data]);

  useEffect(() => {
    setViewMode(params?.id !== undefined ? "detail" : "list");
  }, [params?.id]);

  const config: EntityConfig<DocumentType> = {
    primaryColumn: {
      key: "DocumentType",
      name: "Document Type Title",
      render: (data: DocumentType) => `${data?.name ?? ""}`,
    },
    rootUrl: "/document-types",
    identity: "id",
    visibleColumn: [
      {
        key: "",
        name: "Document Type Title",
        render: (data: DocumentType) => `${data?.name ?? ""}`,
      },
      {
        key: "createdAt",
        name: "Registration Date",
        isDate: true,
      },
    ],
  };

  const data = documentTypes?.data?.data;

  return (
    <div className="flex w-full">
      <EntityList
        parentStyle="w-full"
        viewMode={viewMode}
        check={check}
        detail={children}
        showArchived={false}
        showSelector={true}
        tableKey="documentTypes"
        title="Document Type Lists"
        detailTitle={`${selectedDocumentType?.name ?? ""}`}
        newButtonText="New"
        total={documentTypes?.data?.count}
        collectionQuery={collection}
        itemsLoading={documentTypes?.isLoading || documentTypes?.isFetching}
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
      />
    </div>
  );
}
