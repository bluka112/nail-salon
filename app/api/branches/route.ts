import { Status } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const page = searchParams.get("page") || 1;
  const limit = searchParams.get("limit") || 10;
  const search = searchParams.get("search") || "";
  const time = new Date().toISOString();
  
  try {
    const total = await prisma.branch.count();
    const result = await prisma.branch.findMany({
      where: {
        status: Status.active,
        name: { contains: search, mode: "insensitive" },
      },

      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });
    return NextResponse.json({
      success: true,
      time,
      message: "Success",
      total_branches: total,
      offset: (Number(page) - 1) * Number(limit),
      limit: Number(limit),
      branches: result,
    });
  } catch (e: unknown) {
    return NextResponse.json({
      success: false,
      time,
      message: JSON.stringify(e),
      total_branches: 0,
      offset: 0,
      limit: 0,
      branches: [],
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
  const result = await prisma.branch.create({ data: body });
  return NextResponse.json(result);
};
