import { Status } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const page = Number(params.get("page") ?? 1);
  const limit = Number(params.get("limit") ?? 10);
  const search = params.get("search") ?? "";

  const where = {
    status: Status.active,
    name: { contains: search, mode: "insensitive" as const },
  };

  const [total, branches] = await Promise.all([
    prisma.branch.count({ where }),
    prisma.branch.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
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

  const body = await req.json();
  const branch = await prisma.branch.create({
    data: {
      ...body,
      latitude: Number(body.latitude),
      longitude: Number(body.longitude),
    },
  });

  return NextResponse.json({ success: true, message: "Created", branch });
};
