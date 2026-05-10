import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
    const { branchId, employeeId, services, ...rest } = await req.json();

    // Calculate total price and duration from services
    const serviceIds = services.map((s: { serviceId: string }) => s.serviceId);
    const serviceDetails = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
    });

    const totalPrice = serviceDetails.reduce((sum, s) => sum + s.price, 0);
    const totalDuration = serviceDetails.reduce(
      (sum, s) => sum + s.duration,
      0,
    );

    const booking = await prisma.booking.create({
      data: {
        ...rest,
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
