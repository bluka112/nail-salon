import { NavGroup } from "@/types";

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/admin/overview",
        icon: "dashboard",
        isActive: false,
        shortcut: ["d", "d"],
        items: [],
      },
      {
        title: "Branch",
        url: "/admin/branch",
        icon: "building",
        isActive: false,
        shortcut: ["p", "p"],
        items: [],
      },
      {
        title: "Employee",
        url: "/admin/employee",
        icon: "user",
        isActive: false,
        shortcut: ["p", "p"],
        items: [],
      },
      {
        title: "Service",
        url: "/admin/service",
        icon: "product",
        isActive: false,
        shortcut: ["s", "s"],
        items: [],
      },
      {
        title: "Testimonial",
        url: "/admin/testimonial",
        icon: "chat",
        isActive: false,
        shortcut: ["t", "t"],
        items: [],
      },
      {
        title: "Gallery",
        url: "/admin/gallery",
        icon: "galleryVerticalEnd",
        isActive: false,
        shortcut: ["g", "g"],
        items: [],
      },
      {
        title: "Promotion",
        url: "/admin/promotion",
        icon: "badgeCheck",
        isActive: false,
        shortcut: ["m", "m"],
        items: [],
      },
    ],
  },
];
