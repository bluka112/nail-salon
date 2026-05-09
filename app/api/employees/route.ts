import { Prisma } from "@/lib/generated/prisma/browser";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const page = Number(params.get("page") ?? 1);
  const limit = Number(params.get("limit") ?? 10);
  const search = params.get("search") ?? "";
  const branchId = params.get("branchId");

  const where: Prisma.EmployeeWhereInput = {
    ...(branchId && { branchId }),
    name: { contains: search, mode: "insensitive" },
  };

  const [total, employees] = await Promise.all([
    prisma.employee.count({ where }),
    prisma.employee.findMany({
      where,
      include: { branch: true },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({
    success: true,
    message: "Success",
    total,
    employees,
  });
};

export const POST = async (req: NextRequest) => {
  const { isAuthenticated } = await auth();
  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, message: "you are not authenticated", employee: null },
      { status: 401 },
    );
  }

  const { branchId, ...rest } = await req.json();
  const employee = await prisma.employee.create({
    data: { ...rest, branch: { connect: { id: branchId } } },
    include: { branch: true },
  });

  return NextResponse.json({ success: true, message: "Created", employee });
};
