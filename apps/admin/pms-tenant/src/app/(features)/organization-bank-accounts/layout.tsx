"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useLazyGetOrganizationBankAccountsQuery } from "./_store/organization-bank-account.query";
import { OrganizationBankAccount } from "@/app/models/organization-bank-account.model";
import { CollectionQuery, EntityConfig, EntityList, entityViewMode, Order } from "@pms/entity";
import { BankAccountType } from "@/app/enum/app.enum";

export default function OrganizationBankAccountListPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();

  // Component states
  const [check, setCheck] = useState(false);
  const [selectedOrganizationBankAccount, setSelectedType] = useState<OrganizationBankAccount>();
  const [viewMode, setViewMode] = useState<entityViewMode>("list");
  const [collection, setCollection] = useState<CollectionQuery>({
    skip: 0,
    top: 20,
    orderBy: [{ field: "createdAt", direction: "desc" }],
  });

  // RTK hooks
  const [getOrganizationBankAccount, organizationBankAccounts] = useLazyGetOrganizationBankAccountsQuery();

  const bankAccountTypeLabels: Record<BankAccountType, string> = {
    [BankAccountType.SAVINGS]: "Savings Account",
    [BankAccountType.CHECKING]: "Checking Account",
    [BankAccountType.BUSINESS]: "Business Account",
    [BankAccountType.JOINT]: "Joint Account",
  };

  useEffect(() => {
    getOrganizationBankAccount(collection);
  }, [collection, getOrganizationBankAccount]);

  useEffect(() => {
    setSelectedType(
      organizationBankAccounts?.data?.data?.find((item) => item?.id === `${params?.id}`)
    );
  }, [params?.id, organizationBankAccounts?.data?.data]);

  useEffect(() => {
    setViewMode(params?.id !== undefined ? "detail" : "list");
  }, [params?.id]);

  const config: EntityConfig<OrganizationBankAccount> = {
    primaryColumn: {
      key: "accountNumber",
      name: "Account Number",
      render: (data: OrganizationBankAccount) => `${data?.accountNumber ?? ""}`,
    },
    rootUrl: "/organization-bank-accounts",
    identity: "id",
    visibleColumn: [
      {
        key: "",
        name: "Account Number",
        render: (data: OrganizationBankAccount) => `${data?.accountNumber ?? ""}`,
      },
      {
        key: "bankName",
        name: "Bank Name",
      },
      {
        key: "bankCode",
        name: "Bank Code",
      },
      {
        key: "accountType",
        name: "Account Type",
        render: (data: OrganizationBankAccount) =>
          bankAccountTypeLabels[data?.accountType as BankAccountType] || "Unknown",
      },
      {
        key: "isActive",
        name: "Status",
        render: (data: OrganizationBankAccount) => `${data?.isActive ? "Active" : "Inactive"}`,
      },
      {
        key: "createdAt",
        name: "Registration Date",
        isDate: true,
      },
    ],
  };

  const data = organizationBankAccounts?.data?.data;

  return (
    <div className="flex w-full">
      <EntityList
        parentStyle="w-full"
        viewMode={viewMode}
        check={check}
        detail={children}
        showArchived={false}
        showSelector={true}
        tableKey="Bank Accounts"
        title="Bank Accounts"
        detailTitle={`${selectedOrganizationBankAccount?.accountNumber ?? ""}`}
        newButtonText="New"
        total={organizationBankAccounts?.data?.count}
        collectionQuery={collection}
        itemsLoading={organizationBankAccounts?.isLoading || organizationBankAccounts?.isFetching}
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
