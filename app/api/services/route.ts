import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const page = Number(params.get("page") ?? 1);
  const limit = Number(params.get("limit") ?? 50);
  const search = params.get("search") ?? "";
  const category = params.get("category");
  const status = params.get("status");
  const popular = params.get("popular");

  const where: Prisma.ServiceWhereInput = {
    ...(category && { category: category as Prisma.EnumServiceCategoryFilter }),
    ...(status && { status: status as "active" | "disabled" }),
    ...(popular === "true" && { popular: true }),
    OR: [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ],
  };

  const [total, services] = await Promise.all([
    prisma.service.count({ where }),
    prisma.service.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ popular: "desc" }, { category: "asc" }, { name: "asc" }],
    }),
  ]);

  return NextResponse.json({
    success: true,
    message: "Success",
    total,
    services,
  });
};

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    const service = await prisma.service.create({
      data: body,
    });

    return NextResponse.json({
      success: true,
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create service", service: null },
      { status: 500 },
    );
  }
};
