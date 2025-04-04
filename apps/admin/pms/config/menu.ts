import { MenuItem } from "@pms/core";
import { IconGauge, IconBuildingEstate, IconMoneybag, IconReportMoney, IconSocial, IconCurrency, IconCalendar, IconUser, IconAlertHexagon, IconAdjustments, IconLock,} from '@tabler/icons-react'


export const Menu: MenuItem[] = [
  { label: "Dashboard", icon: IconGauge, link: "/dashboard" },
  {
    label: "Properties",
    icon: IconBuildingEstate,
    links: [
      { label: "Tenants", link: "/tenants" },
      { label: "Properties", link: "/property" },
      { label: "Leases", link: "/lease" },
    ],
  },
  {
    label: "Bank Accounts",
    icon: IconMoneybag,
    links: [
      { label: "Organizational", link: "/organization-bank-accounts" },
      { label: "Individual", link: "/bank-accounts" },
    ],
  },
  {
    label: "Finances",
    icon: IconReportMoney,
    links: [
      { label: "Expenses", link: "/expense" },
      { label: "Invoice Items", link: "/invoice-item" },
      { label: "Payables", link: "/payable" },
      { label: "Receivables", link: "/receivable" },
      { label: "Expense Types", link: "/expense-types" },
      { label: "Revenue Types", link: "/revenue-types" },
    ],
  },
  {
    label: "Interactions",
    icon: IconSocial,
    links: [
      {
        label: "FAQs",
        link: "/faqs",
      },
      {
        label: "Feed Backs",
        link: "/feed-backs",
      },
      {
        label: "Testimonials",
        link: "/testimonials",
      },
    ],
  },
  {
    label: "User Management",
    icon: IconUser,
    links: [
      { label: "Users", link: "/user" },
      { label: "Roles", link: "/roles" },
      { label: "Departments", link: "/departments" },
    ],
  },
  {
    label: "Maintenance",
    icon: IconAlertHexagon,
    links: [
      { label: "Maintenance Requests", link: "/maintenance-request" },
      { label: "Maintenance Types", link: "/maintenance-types" },
      { label: "Maintenance Schedules", link: "/maintenance-schedules" },
    ],
  },
  {
    label: "Settings",
    icon: IconAdjustments,
    links: [{ label: "Document Type", link: "/document-types" }],
  },
  {
    label: "Securities",
    icon: IconLock,
    links: [{ label: "Change password", link: "/password-change" }],
  },
];
