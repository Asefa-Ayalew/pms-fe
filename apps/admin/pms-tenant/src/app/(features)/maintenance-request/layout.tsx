"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useLazyGetMaintenanceRequestsQuery } from "./_store/maintenance-request.query";
import { CollectionQuery, EntityConfig, EntityList, entityViewMode, Order } from "@pms/entity";
import { MaintenanceRequest } from "../../models/maintenance-request.model";

export default function MaintenanceRequestListPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();

  // Component states
  const [check, setCheck] = useState(false);
  const [selectedMaintenanceRequest, setSelectedType] =
    useState<MaintenanceRequest>();
  const [viewMode, setViewMode] = useState<entityViewMode>("list");
  const [collection, setCollection] = useState<CollectionQuery>({
    skip: 0,
    top: 20,
    orderBy: [{ field: "createdAt", direction: "desc" }],
  });

  // RTK hooks
  const [getMaintenanceRequest, maintenanceRequests] =
    useLazyGetMaintenanceRequestsQuery();

  useEffect(() => {
    getMaintenanceRequest(collection);
  }, [collection, getMaintenanceRequest]);

  useEffect(() => {
    setSelectedType(
      maintenanceRequests?.data?.data?.find(
        (item) => item?.id === `${params?.id}`
      )
    );
  }, [params?.id, maintenanceRequests?.data?.data]);

  useEffect(() => {
    setViewMode(params?.id !== undefined ? "detail" : "list");
  }, [params?.id]);

  const config: EntityConfig<MaintenanceRequest> = {
    primaryColumn: {
      key: "Title",
      name: "Title",
      render: (data: MaintenanceRequest) => `${data?.title ?? ""}`,
    },
    rootUrl: "/maintenance-request",
    identity: "id",
    visibleColumn: [
      {
        key: "",
        name: "Title",
        render: (data: MaintenanceRequest) => `${data?.title ?? ""}`,
      },
      {
        key: "createdAt",
        name: "Registration Date",
        isDate: true,
      },
    ],
  };

  const data = maintenanceRequests?.data?.data;

  return (
    <div className="flex w-full">
      <EntityList
        parentStyle="w-full"
        viewMode={viewMode}
        check={check}
        detail={children}
        showArchived={false}
        showSelector={true}
        tableKey="maintenanceRequests"
        title="Maintenance Requests"
        detailTitle={`${selectedMaintenanceRequest?.title ?? ""}`}
        newButtonText="New"
        total={maintenanceRequests?.data?.count}
        collectionQuery={collection}
        itemsLoading={
          maintenanceRequests?.isLoading || maintenanceRequests?.isFetching
        }
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
