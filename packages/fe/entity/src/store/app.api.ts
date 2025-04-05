import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../utilities";

export const appApi = createApi({
  reducerPath: "appApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Users", "UserInfo", "Properties", "PropertyInfo", "Tenants", "TenantInfo", "Rooms", "Leases", "BankAccounts", "BankAccountInfo", "RevenueTypes", "RevenueTypeInfo", "DocumentTypes", "DocumentTypeInfo", "ExpenseTypes", "ExpenseTypeInfo", "", "OrganizationBankAccounts", "OrganizationBankAccountInfo", "Departments", "DepartmentInfo", "LeaseInfo", "Expenses", "ExpenseInfo", "InvoiceItems", "InvoiceItemInfo", "EmergencyContacts", "EmergencyContactInfo", "Payables", "PayableInfo", "Receivables", "ReceivableInfo", "MaintenanceRequests", "MaintenanceRequestInfo", "Faqs", "FaqInfo"],
  endpoints: () => ({}),
  });
