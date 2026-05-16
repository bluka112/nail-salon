import { prisma } from "@/lib/prisma";
import type { BookingStatus, ServiceCategory } from "@/lib/generated/prisma/client";

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });

const serviceCategoryLabels: Record<ServiceCategory, string> = {
  manicure: "Manicure",
  pedicure: "Pedicure",
  gel_acrylic: "Gel & Acrylic",
  nail_art: "Nail Art",
  spa: "Spa",
  additional: "Additional",
};

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export async function getOverviewSummary() {
  const today = startOfToday();
  const monthStart = startOfMonth(today);

  const [
    revenue,
    monthRevenue,
    upcomingBookings,
    monthBookings,
    activeServices,
    activeEmployees,
    activeBranches,
    uniqueCustomers,
  ] = await Promise.all([
    prisma.booking.aggregate({
      where: { status: "completed" },
      _sum: { totalPrice: true },
    }),
    prisma.booking.aggregate({
      where: {
        status: "completed",
        date: { gte: monthStart },
      },
      _sum: { totalPrice: true },
    }),
    prisma.booking.count({
      where: {
        status: { in: ["pending", "confirmed"] },
        date: { gte: today },
      },
    }),
    prisma.booking.count({
      where: {
        date: { gte: monthStart },
        status: { not: "cancelled" },
      },
    }),
    prisma.service.count({ where: { status: "active" } }),
    prisma.employee.count({ where: { status: "active" } }),
    prisma.branch.count({ where: { status: "active" } }),
    prisma.booking.groupBy({ by: ["customerEmail"] }),
  ]);

  return {
    totalRevenue: revenue._sum.totalPrice ?? 0,
    monthRevenue: monthRevenue._sum.totalPrice ?? 0,
    upcomingBookings,
    monthBookings,
    activeServices,
    activeEmployees,
    activeBranches,
    uniqueCustomers: uniqueCustomers.length,
  };
}

export async function getMonthlyBookingStats() {
  const start = startOfMonth(addMonths(new Date(), -5));
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = addMonths(start, index);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      month: monthFormatter.format(date),
      bookings: 0,
      revenue: 0,
    };
  });
  const monthMap = new Map(months.map((month) => [month.key, month]));

  const bookings = await prisma.booking.findMany({
    where: {
      date: { gte: start },
      status: { not: "cancelled" },
    },
    select: {
      date: true,
      status: true,
      totalPrice: true,
    },
  });

  for (const booking of bookings) {
    const key = `${booking.date.getFullYear()}-${booking.date.getMonth()}`;
    const month = monthMap.get(key);
    if (!month) continue;

    month.bookings += 1;
    if (booking.status === "completed") {
      month.revenue += booking.totalPrice;
    }
  }

  return months;
}

export async function getBookingStatusStats() {
  const statusLabels: Record<BookingStatus, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  const statuses: BookingStatus[] = [
    "pending",
    "confirmed",
    "completed",
    "cancelled",
  ];
  const rows = await prisma.booking.groupBy({
    by: ["status"],
    _count: { status: true },
  });
  const countByStatus = new Map(
    rows.map((row) => [row.status, row._count.status]),
  );

  return statuses.map((status, index) => ({
    status,
    label: statusLabels[status],
    count: countByStatus.get(status) ?? 0,
    fill: `var(--chart-${index + 1})`,
  }));
}

export async function getServiceCategoryStats() {
  const categories: ServiceCategory[] = [
    "manicure",
    "pedicure",
    "gel_acrylic",
    "nail_art",
    "spa",
    "additional",
  ];
  const rows = await prisma.service.groupBy({
    by: ["category"],
    where: { status: "active" },
    _count: { category: true },
  });
  const countByCategory = new Map(
    rows.map((row) => [row.category, row._count.category]),
  );

  return categories.map((category, index) => ({
    category,
    label: serviceCategoryLabels[category],
    count: countByCategory.get(category) ?? 0,
    fill: `var(--chart-${(index % 5) + 1})`,
  }));
}

export async function getRecentBookings() {
  const bookings = await prisma.booking.findMany({
    where: { status: { not: "cancelled" } },
    orderBy: [{ createdAt: "desc" }],
    take: 5,
    select: {
      customerName: true,
      customerEmail: true,
      totalPrice: true,
      status: true,
      createdAt: true,
    },
  });

  return bookings.map((booking) => ({
    name: booking.customerName,
    email: booking.customerEmail,
    fallback: initials(booking.customerName),
    amount: booking.totalPrice,
    status: booking.status,
    createdAt: booking.createdAt,
  }));
}
