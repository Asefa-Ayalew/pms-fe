"use client";

import { useEffect, useState } from "react";

import { Role } from "@/src/models/role.model";
import EntityList from "@/src/shared/entity/entity-list";
import { CollectionQuery, Order } from "@/src/shared/models/collection.model";
import {
  EntityConfig,
  entityViewMode,
} from "@/src/shared/models/entity-config.model";
import { useParams } from "next/navigation";
import { useLazyGetRolesQuery } from "./_store/role.query";

export default function RoleListPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();

  //Component states
  const [check, setCheck] = useState(false);
  const [selectedRole, setSelectedType] = useState<Role>();
  const [viewMode, setViewMode] = useState<entityViewMode>("list");
  const [collection, setCollection] = useState<CollectionQuery>({
    skip: 0,
    top: 20,
    orderBy: [{ field: "createdAt", direction: "desc" }],
  });

  //Rtk hooks
  const [getRole, role] = useLazyGetRolesQuery();

  useEffect(() => {
    // dispatch(getFacilitys(collection));
    getRole(collection);
  }, [collection]);

  useEffect(() => {
    setSelectedType(
      role?.data?.data?.find((role) => role?.id === `${params?.id}`)
    );
  });

  useEffect(() => {
    if (params?.id !== undefined) {
      setViewMode("detail");
    } else {
      setViewMode("list");
    }
  }, [setViewMode, params]);

  const config: EntityConfig<Role> = {
    primaryColumn: { key: "name", name: "Role Name" },
    rootUrl: "/role",
    identity: "id",
    visibleColumn: [
      { key: "roleName", name: "Role Name" },
      { key: "key", name: "Key" },
      { key: "description", name: "Description" },
      { key: "createdAt", name: "Created At", isDate: true },
    ],
  };

  const data = role?.data?.data;
  return (
    <div className="flex w-full">
      <EntityList
        parentStyle="w-full"
        viewMode={viewMode}
        check={check}
        detail={children}
        showArchived={false}
        showSelector={false}
        tableKey="roles"
        title={"Role"}
        detailTitle={selectedRole?.roleName ?? ""}
        newButtonText="New Role"
        showNewButton={false}
        total={role?.data?.count}
        collectionQuery={collection}
        itemsLoading={role?.isLoading || role?.isFetching}
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
          if (data === "") {
            setCollection({
              ...collection,
              search: "",
              searchFrom: [],
            });
          } else {
            setCollection({
              ...collection,
              search: data,
              searchFrom: ["name", "code"],
            });
          }
        }}
        onFilterChange={(data: any) => {
          if (collection?.filter || data.length > 0) {
            setCollection({ ...collection, filter: data });
          }
        }}
        onOrder={(data: Order) =>
          setCollection({ ...collection, orderBy: [data] })
        }
      />
    </div>
  );
}
