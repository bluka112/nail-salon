import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const page = Number(params.get("page") ?? 1);
  const limit = Number(params.get("limit") ?? 10);
  const search = params.get("search") ?? "";
  const status = params.get("status");
  const active = params.get("active");

  const now = new Date();

  const where: Prisma.PromotionWhereInput = {
    ...(status && { status: status as "active" | "disabled" }),
    ...(active === "true" && {
      validFrom: { lte: now },
      validUntil: { gte: now },
      status: "active",
    }),
    OR: [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
    ],
  };

  const [total, promotions] = await Promise.all([
    prisma.promotion.count({ where }),
    prisma.promotion.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ validUntil: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  return NextResponse.json({
    success: true,
    message: "Success",
    total,
    promotions,
  });
};

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    const promotion = await prisma.promotion.create({
      data: {
        ...body,
        validFrom: new Date(body.validFrom),
        validUntil: new Date(body.validUntil),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Promotion created successfully",
      promotion,
    });
  } catch (error) {
    console.error("Error creating promotion:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create promotion",
        promotion: null,
      },
      { status: 500 },
    );
  }
};
