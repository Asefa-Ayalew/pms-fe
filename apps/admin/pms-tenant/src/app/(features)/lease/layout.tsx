"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useLazyGetLeasesQuery } from "./_store/lease.query";
import { Lease } from "@/app/models/lease.model";
import { CollectionQuery, EntityConfig, EntityList, entityViewMode, Order } from "@pms/entity";

export default function LeaseListPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();

  // Component states
  const [check, setCheck] = useState(false);
  const [selectedLease, setSelectedType] = useState<Lease>();
  const [viewMode, setViewMode] = useState<entityViewMode>("list");
  const [collection, setCollection] = useState<CollectionQuery>({
    skip: 0,
    top: 20,
    orderBy: [{ field: "createdAt", direction: "desc" }],
  });

  // RTK hooks
  const [getLeases, leases] = useLazyGetLeasesQuery();

  useEffect(() => {
    getLeases({ ...collection, includes: ["room", "tenant", "contractor"] });
  }, [collection, getLeases]);

  useEffect(() => {
    setSelectedType(
      leases?.data?.data?.find((item) => item?.id === `${params?.id}`)
    );
  }, [params?.id, leases?.data?.data]);

  useEffect(() => {
    setViewMode(params?.id !== undefined ? "detail" : "list");
  }, [params?.id]);

  const config: EntityConfig<Lease> = {
    primaryColumn: {
      key: "monthlyRent",
      name: "Monthly Rent",
      render: (data: Lease) => `${data?.monthlyRent ?? ""}`,
    },
    rootUrl: "/lease",
    identity: "id",
    visibleColumn: [
      { name: "Tenant", key: ["tenant", "name"] },
      { name: "Contractor", key: ["contractor", "name"] },
      { name: "Room", key: ["room", "description"] },
      {
        key: "monthlyRent",
        name: "Monthly Rent",
        render: (data: Lease) => `${data?.monthlyRent ?? ""}`,
      },
      {
        key: "startDate",
        name: "Start Date",
        isDate: true,
      },
      {
        key: "endDate",
        name: "End Date",
        isDate: true,
      },
      {
        key: "createdAt",
        name: "Registration Date",
        isDate: true,
      },
    ],
  };

  const data = leases?.data?.data;

  return (
    <div className="flex w-full">
      <EntityList
        parentStyle="w-full"
        viewMode={viewMode}
        check={check}
        detail={children}
        showArchived={false}
        showSelector={true}
        tableKey="leases"
        title="Leases"
        detailTitle={`${selectedLease?.monthlyRent ?? "New Lease"}`}
        newButtonText="New"
        total={leases?.data?.count}
        collectionQuery={collection}
        itemsLoading={leases?.isLoading || leases?.isFetching}
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
