import {
    IconGauge,
    IconUser,
    IconBriefcase,
    IconSettings,
    IconTools,
    IconPhone,
    IconCode,
    IconCup,
  } from "@tabler/icons-react";
  
  export const appConfig = [
    { label: "Dashboard", icon: IconGauge, link: "/dashboard" },
    { label: "Profile", icon: IconUser, link: "/profile" },
    { label: "Users", icon: IconCup, link: "/users" },
    { label: "Projects", icon: IconBriefcase, link:"/projects"},
    { label: "List With Detail", icon: IconTools, link: "/list-with-detail" },
    { label: "Entity List", icon: IconTools, link: "/entity-list" },
    {
      label: "Skills",
      icon: IconCode,
      links: [
        { label: "Technical Skills", link: "/skills/technical" },
        { label: "Soft Skills", link: "/skills/soft" },
      ],
    },
    { label: "Services", icon: IconTools, link: "/services" },
    {
      label: "Contacts",
      icon: IconPhone,
      links: [
        { label: "Contact Requests", link: "/contact/requests" },
        { label: "Manage Social Links", link: "/contact/socials" },
      ],
    },
    {
      label: "Settings",
      icon: IconSettings,
      links: [
        { label: "Account Settings", link: "/settings/account" },
        { label: "Theme Customization", link: "/settings/theme" },
        { label: "Privacy & Security", link: "/settings/privacy" },
      ],
    },
  ];
  