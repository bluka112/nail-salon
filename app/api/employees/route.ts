import { Prisma } from "@/lib/generated/prisma/browser";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const page = searchParams.get("page") || 1;
  const limit = searchParams.get("limit") || 10;
  const search = searchParams.get("search") || "";
  const time = new Date().toISOString();
  const branch = searchParams.get("branch");
  const where: Prisma.EmployeeWhereInput = {
    ...(branch && { branchId: branch }),
    name: { contains: search, mode: "insensitive" },
  };
  try {
    const total = await prisma.employee.count({ where });
    const result = await prisma.employee.findMany({
      where,
      include: { branch: true },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });
    return NextResponse.json({
      success: true,
      time,
      message: "Success",
      total_employees: total,
      offset: (Number(page) - 1) * Number(limit),
      limit: Number(limit),
      employees: result,
    });
  } catch (e: unknown) {
    return NextResponse.json({
      success: false,
      time,
      message: JSON.stringify(e),
      total_employees: 0,
      offset: 0,
      limit: 0,
      employees: [],
    });
  }
};
export const POST = async (req: NextRequest) => {
  const { isAuthenticated } = await auth();
  if (!isAuthenticated) {
    return NextResponse.json(
      { message: "you are not authenticated" },
      { status: 401 },
    );
  }
  const body = await req.json();
  const { branchId, ...restBody } = body;
  const result = await prisma.employee.create({
    data: { ...restBody, branch: { connect: { id: branchId } } },
    include: { branch: true },
  });
  return NextResponse.json(result);
};
