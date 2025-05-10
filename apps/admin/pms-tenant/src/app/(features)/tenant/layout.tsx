"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";

import  {
  CustomToolbarAction,
  EntityList,
  TableBehaviorConfig,
  TableStyleConfig,
} from "@pms/entity";

import { Button, TextInput } from "@mantine/core";
import {
  IconAdjustments,
  IconDownload,
  IconRefreshDot,
  IconUserPlus,
} from "@tabler/icons-react";
import { useLazyGetTenantsQuery } from "./_store/tenant.query";
import { EntityConfig, entityViewMode } from "@pms/entity";
import { Tenant } from "../../models/tenant.model";

export default function TenantListPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const isInitialRender = useRef(true);

  const [getTenants, { data: tenantData, isLoading, error }] =
    useLazyGetTenantsQuery();

  useEffect(() => {
    if (isInitialRender.current) {
      getTenants({ skip: 0, top: 20 });
      isInitialRender.current = false;
    }
  }, [getTenants]);

  const config = useMemo<EntityConfig<Tenant>>(
    () => ({
      primaryColumn: {
        key: "name",
        name: "Tenant",
        render: (data: Tenant) => `${data?.name ?? ""}`,
      },
      rootUrl: "/tenant",
      detailUrl: "detail",
      identity: "id",
      visibleColumn: [
        {
          key: "name",
          name: "Tenant Name",
          render: (data: Tenant) => `${data?.name ?? ""}`,
        },
        {
          key: "shortCode",
          name: "Short Code",
          render: (data: Tenant) => `${data?.shortCode ?? ""}`,
        },
        {
          key: "tradeName",
          name: "Trade Name",
          render: (data: Tenant) => `${data?.tradeName ?? ""}`,
        },
        {
          key: "tin",
          name: "TIN",
          render: (data: Tenant) => `${data?.tin ?? ""}`,
        },
        {
          key: "industry",
          name: "Industry",
          render: (data: Tenant) => `${data?.industry ?? ""}`,
        },
        {
          key: "phoneNumber",
          name: "Phone Number(s)",
          render: (data: Tenant) =>
            [data?.phoneNumber, ...(data?.secondaryPhoneNumbers || [])]
              .filter(Boolean)
              .join(", ") || "N/A",
        },
        {
          key: "email",
          name: "Email Address(es)",
          render: (data: Tenant) =>
            [data?.email, ...(data?.secondaryEmails || [])]
              .filter(Boolean)
              .join(", ") || "N/A",
        },
        {
          key: "createdAt",
          name: "Registration Date",
          isDate: true,
        },
      ],
      showDetail: true,
      hasActions: false,
    }),
    []
  );

  const viewMode: entityViewMode = params?.id !== undefined ? "detail" : "list";

  const styleConfig: TableStyleConfig = useMemo(
    () => ({
      primaryColor: "blue",
      dangerColor: "red",
      fontSize: "sm",
      density: "xs",
      shadowLevel: "xs",
      borderColor: "border-gray-200",
      rowHoverColor: "var(--mantine-color-blue-50)",
    }),
    []
  );

  const behaviorConfig: TableBehaviorConfig = useMemo(
    () => ({
      enableColumnFilters: true,
      enableGlobalFilter: true,
      enableColumnResizing: true,
      enableFullScreenToggle: true,
      enableDensityToggle: true,
      enableColumnOrdering: true,
      enablePagination: true,
      enableMultiSort: true,
      enableMultiRowSelection: true,
      manualFiltering: true,
      manualPagination: true,
      manualSorting: true,
      paginationDisplayMode: "default",
      positionPagination: "bottom",
      positionActionsColumn: "last",
      enableHiding: true,
    }),
    []
  );

  const handlePaginationChange = useCallback(
    (pageIndex: number, pageSize: number) => {
      getTenants({ skip: (pageIndex - 1) * pageSize, top: pageSize });
    },
    [getTenants]
  );

  const customActions: CustomToolbarAction[] = useMemo(
    () => [
      {
        key: "refresh",
        label: "Refresh Tenants",
        icon: <IconRefreshDot size={18} />,
        color: "blue",
        onClick: () => getTenants({ skip: 0, top: 20 }),
        tooltip: "Refresh tenant data",
        position: "top",
        order: 1,
      },
      {
        key: "add-tenant",
        label: "Add Tenant",
        icon: <IconUserPlus size={18} />,
        color: "green",
        onClick: () => console.log("Add tenant clicked"),
        tooltip: "Add a new tenant",
        position: "top",
        order: 2,
      },
      {
        key: "export-tenant",
        label: "Export",
        icon: <IconDownload size={18} />,
        color: "cyan",
        onClick: () => console.log("Export clicked"),
        tooltip: "Export tenant data",
        position: "bottom",
        variant: "subtle",
        order: 1,
      },
      {
        key: "settings",
        label: "Settings",
        icon: <IconAdjustments size={18} />,
        color: "gray",
        onClick: () => console.log("Settings clicked"),
        tooltip: "Table settings",
        position: "bottom",
        variant: "subtle",
        order: 2,
      },
    ],
    [getTenants]
  );

  const renderCustomLeftToolbar = useCallback(() => {
    return (
      <div className="flex items-center gap-2">
        <Button
          leftSection={<IconUserPlus size={16} />}
          size="sm"
          color="green"
        >
          Add New Tenant
        </Button>

        <TextInput placeholder="Search tenants..." size="sm" className="w-64" />
      </div>
    );
  }, []);

  return (
    <EntityList
      title="Tenants"
      config={config}
      viewMode={viewMode}
      detail={children}
      defaultPageSize={20}
      pageSizeOptions={[10, 20, 30, 50, 100]}
      _showTotal={true}
      tableKey="tenants"
      dataLoadMode="static"
      items={tenantData?.data || []}
      total={tenantData?.count || 0}
      itemsLoading={isLoading}
      styleConfig={styleConfig}
      behaviorConfig={behaviorConfig}
      errorText={
        error ? "Failed to load tenants. Please try again." : undefined
      }
      noDataText="No tenants found"
      customActions={customActions}
      onPaginationChange={handlePaginationChange}
      // renderCustomLeftToolbar={renderCustomLeftToolbar}
    />
  );
}
