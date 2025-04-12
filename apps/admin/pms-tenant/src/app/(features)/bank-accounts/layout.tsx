"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  useLazyGetBankAccountsQuery,
  useLazyGetTenantQuery,
} from "./_store/bank-account.query";
import { CollectionQuery, EntityConfig, EntityList, entityViewMode, Order } from "@pms/entity";
import { BankAccount, OwnerType } from "@/app/models/bank-account.model";

export default function BankAccountListPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();

  // Component states
  const [getTenant, tenant] = useLazyGetTenantQuery();
  const [tenantMap, setTenantMap] = useState<Record<string, string>>({});
  const [check, setCheck] = useState(false);
  const [selectedBankAccount, setSelectedType] = useState<BankAccount>();
  const [viewMode, setViewMode] = useState<entityViewMode>("list");
  const [collection, setCollection] = useState<CollectionQuery>({
    skip: 0,
    top: 20,
    orderBy: [{ field: "createdAt", direction: "desc" }],
  });

  // RTK hooks
  const [getBankAccount, bankAccounts] = useLazyGetBankAccountsQuery();

  useEffect(() => {
    getBankAccount(collection);
  }, [collection, getBankAccount]);

  useEffect(() => {
    setSelectedType(
      bankAccounts?.data?.data?.find((item) => item?.id === `${params?.id}`)
    );
  }, [params?.id, bankAccounts?.data?.data]);

  useEffect(() => {
    setViewMode(params?.id !== undefined ? "detail" : "list");
  }, [params?.id]);

  // Fetch tenant names by tenantId
  useEffect(() => {
    if (bankAccounts?.data?.data && bankAccounts?.data?.data?.length > 0) {
      const tenantIds = Array.from(
        new Set(bankAccounts.data.data.map((account) => account.tenantId))
      );

      tenantIds.forEach(async (tenantId) => {
        if (tenantId && !tenantMap[tenantId]) {
          const tenantResponse = await getTenant({ id: tenantId }).unwrap();
          setTenantMap((prev) => ({ ...prev, [tenantId]: tenantResponse.name }));
        }
      });
    }
  }, [bankAccounts?.data?.data, getTenant]);

  // Entity configuration with tenant name
  const config: EntityConfig<BankAccount> = {
    primaryColumn: {
      key: "ownerName",
      name: "Owner Name",
      render: (data: BankAccount) => `${data?.ownerName ?? ""}`,
    },
    rootUrl: "/bank-accounts",
    identity: "id",
    visibleColumn: [
      {
        key: "ownerName",
        name: "Owner Name",
        render: (data: BankAccount) => `${data?.ownerName ?? ""}`,
      },
      {
        key: "accountNumber",
        name: "Account Number",
      },
      {
        key: "bankCode",
        name: "Bank Code",
      },
      {
        key: "bankName",
        name: "Bank Name",
      },
      {
        key: "ownerType",
        name: "Owner Type",
        render: (data: BankAccount) => {
          const ownerTypeLabels: Record<OwnerType, string> = {
            [OwnerType.INDIVIDUAL]: "Individual",
            [OwnerType.GOVERNMENTAL]: "Governmental",
            [OwnerType.COMPANY]: "Company",
            [OwnerType.ORGANIZATION]: "Organization",
          };
          return ownerTypeLabels[data?.ownerType as OwnerType] ?? "Unknown";
        },
      },
      {
        key: "createdAt",
        name: "Registration Date",
        isDate: true,
      },

    ],
  };

  const data = bankAccounts?.data?.data;

  return (
    <div className="flex w-full">
      <EntityList
        parentStyle="w-full"
        viewMode={viewMode}
        check={check}
        detail={children}
        showArchived={false}
        showSelector={true}
        tableKey="bankAccounts"
        title="Bank Accounts"
        detailTitle={`${selectedBankAccount?.ownerName ?? ""}`}
        newButtonText="New"
        total={bankAccounts?.data?.count}
        collectionQuery={collection}
        itemsLoading={bankAccounts?.isLoading || bankAccounts?.isFetching}
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
