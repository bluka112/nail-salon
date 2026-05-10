import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const page = Number(params.get("page") ?? 1);
  const limit = Number(params.get("limit") ?? 10);
  const search = params.get("search") ?? "";
  const status = params.get("status");

  const where: Prisma.BranchWhereInput = {
    ...(status && { status: status as "active" | "disabled" }),
    OR: [
      { name: { contains: search, mode: "insensitive" } },
      { location: { contains: search, mode: "insensitive" } },
    ],
  };

  const [total, branches] = await Promise.all([
    prisma.branch.count({ where }),
    prisma.branch.findMany({
      where,
      include: {
        employees: { where: { status: "active" } },
        _count: { select: { bookings: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    success: true,
    message: "Success",
    total,
    branches,
  });
};

export const POST = async (req: NextRequest) => {
  const { isAuthenticated } = await auth();
  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, message: "you are not authenticated", branch: null },
      { status: 401 },
    );
  }
  try {
    const body = await req.json();
    const branch = await prisma.branch.create({
      data: body,
      include: { employees: true },
    });

    return NextResponse.json({
      success: true,
      message: "Branch created successfully",
      branch,
    });
  } catch (error) {
    console.error("Error creating branch:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create branch", branch: null },
      { status: 500 },
    );
  }
};
