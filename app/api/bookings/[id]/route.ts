import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      branch: true,
      employee: true,
      services: { include: { service: true } },
    },
  });

  if (!booking) {
    return NextResponse.json(
      { success: false, message: "Booking not found", booking: null },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, booking });
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  const body = await req.json();
  const { branchId, employeeId, services, ...restBody } = body;

  const existing = await prisma.booking.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { success: false, message: "Booking not found" },
      { status: 404 },
    );
  }

  // If services are being updated, recalculate totals
  const updateData: Record<string, unknown> = { ...restBody };

  if (services) {
    const serviceIds = services.map((s: { serviceId: string }) => s.serviceId);
    const serviceDetails = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
    });

    updateData.totalPrice = serviceDetails.reduce((sum, s) => sum + s.price, 0);
    updateData.totalDuration = serviceDetails.reduce(
      (sum, s) => sum + s.duration,
      0,
    );

    // Delete existing services and create new ones
    await prisma.bookingService.deleteMany({ where: { bookingId: id } });

    await prisma.bookingService.createMany({
      data: serviceDetails.map((s) => ({
        bookingId: id,
        serviceId: s.id,
        price: s.price,
        duration: s.duration,
      })),
    });
  }

  if (branchId) {
    updateData.branch = { connect: { id: branchId } };
  }

  if (employeeId) {
    updateData.employee = { connect: { id: employeeId } };
  } else if (employeeId === null) {
    updateData.employee = { disconnect: true };
  }

  const booking = await prisma.booking.update({
    where: { id },
    data: updateData,
    include: {
      branch: true,
      employee: true,
      services: { include: { service: true } },
    },
  });

  return NextResponse.json({
    success: true,
    message: "Booking updated successfully",
    booking,
  });
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;

  const existing = await prisma.booking.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { success: false, message: "Booking not found" },
      { status: 404 },
    );
  }

  await prisma.booking.delete({ where: { id } });

  return NextResponse.json({
    success: true,
    message: "Booking deleted successfully",
  });
};
