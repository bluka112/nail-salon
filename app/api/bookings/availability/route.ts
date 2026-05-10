import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const branchId = params.get("branchId");
  const employeeId = params.get("employeeId");
  const date = params.get("date");
  const duration = Number(params.get("duration") ?? 60);

  if (!branchId || !date) {
    return NextResponse.json(
      { success: false, message: "branchId and date are required" },
      { status: 400 }
    );
  }

  // Get branch opening hours
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: { openingTime: true, closingTime: true },
  });

  if (!branch) {
    return NextResponse.json(
      { success: false, message: "Branch not found" },
      { status: 404 }
    );
  }

  // Get existing bookings for the date
  const existingBookings = await prisma.booking.findMany({
    where: {
      branchId,
      ...(employeeId && { employeeId }),
      date: {
        gte: new Date(date),
        lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
      },
      status: { in: ["pending", "confirmed"] },
    },
    select: { time: true, totalDuration: true, employeeId: true },
  });

  // Generate time slots (30-minute intervals)
  const openingHour = parseInt(branch.openingTime.split(":")[0]);
  const closingHour = parseInt(branch.closingTime.split(":")[0]);
  const slots: { time: string; available: boolean }[] = [];

  for (let hour = openingHour; hour < closingHour; hour++) {
    for (const minute of [0, 30]) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      const slotStart = hour * 60 + minute;
      const slotEnd = slotStart + duration;

      // Check if slot conflicts with existing bookings
      const isAvailable = !existingBookings.some((booking) => {
        const bookingStart =
          parseInt(booking.time.split(":")[0]) * 60 +
          parseInt(booking.time.split(":")[1]);
        const bookingEnd = bookingStart + booking.totalDuration;

        // Check for overlap
        return slotStart < bookingEnd && slotEnd > bookingStart;
      });

      // Don't include slots that would extend past closing time
      if (slotEnd <= closingHour * 60) {
        slots.push({ time: timeString, available: isAvailable });
      }
    }
  }

  return NextResponse.json({
    success: true,
    date,
    branchId,
    employeeId,
    slots,
  });
};
