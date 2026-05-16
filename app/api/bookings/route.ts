import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const bookingStatuses = new Set([
  "pending",
  "confirmed",
  "completed",
  "cancelled",
]);

type BookingRequestBody = {
  customerName?: unknown;
  customerEmail?: unknown;
  customerPhone?: unknown;
  date?: unknown;
  time?: unknown;
  notes?: unknown;
  status?: unknown;
  branchId?: unknown;
  employeeId?: unknown;
  services?: unknown;
};

function badRequest(message: string) {
  return NextResponse.json(
    { success: false, message, booking: null },
    { status: 400 },
  );
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseBookingDate(value: unknown) {
  if (typeof value !== "string" && !(value instanceof Date)) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const page = Number(params.get("page") ?? 1);
  const limit = Number(params.get("limit") ?? 10);
  const search = params.get("search") ?? "";
  const branchId = params.get("branchId");
  const employeeId = params.get("employeeId");
  const status = params.get("status");
  const date = params.get("date");

  const where: Prisma.BookingWhereInput = {
    ...(branchId && { branchId }),
    ...(employeeId && { employeeId }),
    ...(status && { status: status as Prisma.EnumBookingStatusFilter }),
    ...(date && {
      date: {
        gte: new Date(date),
        lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
      },
    }),
    OR: [
      { customerName: { contains: search, mode: "insensitive" } },
      { customerEmail: { contains: search, mode: "insensitive" } },
      { customerPhone: { contains: search, mode: "insensitive" } },
    ],
  };

  const [total, bookings] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      include: {
        branch: true,
        employee: true,
        services: { include: { service: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ date: "desc" }, { time: "asc" }],
    }),
  ]);

  return NextResponse.json({
    success: true,
    message: "Success",
    total,
    bookings,
  });
};

export const POST = async (req: NextRequest) => {
  try {
    const body = (await req.json()) as BookingRequestBody;
    const customerName = getString(body.customerName);
    const customerEmail = getString(body.customerEmail);
    const customerPhone = getString(body.customerPhone);
    const time = getString(body.time);
    const branchId = getString(body.branchId);
    const employeeId = getString(body.employeeId);
    const notes = getString(body.notes);
    const status = getString(body.status) || "pending";
    const date = parseBookingDate(body.date);

    if (!customerName) return badRequest("customerName is required");
    if (!customerEmail) return badRequest("customerEmail is required");
    if (!customerPhone) return badRequest("customerPhone is required");
    if (!branchId) return badRequest("branchId is required");
    if (!date) return badRequest("date must be a valid date");
    if (!/^\d{2}:\d{2}$/.test(time)) {
      return badRequest("time must use HH:mm format");
    }
    if (!bookingStatuses.has(status)) {
      return badRequest("status is invalid");
    }
    if (!Array.isArray(body.services) || body.services.length === 0) {
      return badRequest("At least one service is required");
    }

    const serviceIds = [
      ...new Set(
        body.services.map((service) =>
          typeof service === "object" && service !== null
            ? getString((service as { serviceId?: unknown }).serviceId)
            : "",
        ),
      ),
    ].filter(Boolean);

    if (serviceIds.length === 0) {
      return badRequest("Each service must include a serviceId");
    }

    const [branch, employee, serviceDetails] = await Promise.all([
      prisma.branch.findUnique({ where: { id: branchId } }),
      employeeId
        ? prisma.employee.findFirst({
            where: { id: employeeId, branchId, status: "active" },
          })
        : Promise.resolve(null),
      prisma.service.findMany({
        where: { id: { in: serviceIds }, status: "active" },
      }),
    ]);

    if (!branch) return badRequest("Branch not found");
    if (employeeId && !employee) {
      return badRequest("Employee not found for selected branch");
    }

    if (serviceDetails.length !== serviceIds.length) {
      const foundIds = new Set(serviceDetails.map((service) => service.id));
      const missingIds = serviceIds.filter((id) => !foundIds.has(id));
      return badRequest(`Service not found or inactive: ${missingIds.join(", ")}`);
    }

    const totalPrice = serviceDetails.reduce((sum, s) => sum + s.price, 0);
    const totalDuration = serviceDetails.reduce(
      (sum, s) => sum + s.duration,
      0,
    );

    const booking = await prisma.booking.create({
      data: {
        customerName,
        customerEmail,
        customerPhone,
        date,
        time,
        notes: notes || null,
        status: status as "pending" | "confirmed" | "completed" | "cancelled",
        totalPrice,
        totalDuration,
        branch: { connect: { id: branchId } },
        ...(employeeId && { employee: { connect: { id: employeeId } } }),
        services: {
          create: serviceDetails.map((s) => ({
            service: { connect: { id: s.id } },
            price: s.price,
            duration: s.duration,
          })),
        },
      },
      include: {
        branch: true,
        employee: true,
        services: { include: { service: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create booking", booking: null },
      { status: 500 },
    );
  }
};
