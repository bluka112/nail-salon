import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const page = Number(params.get("page") ?? 1);
  const limit = Number(params.get("limit") ?? 20);
  const search = params.get("search") ?? "";
  const category = params.get("category");
  const status = params.get("status");
  const featured = params.get("featured");

  const where: Prisma.GalleryImageWhereInput = {
    ...(category && { category }),
    ...(status && { status: status as "active" | "disabled" }),
    ...(featured === "true" && { featured: true }),
    OR: [
      { title: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } },
    ],
  };

  const [total, images] = await Promise.all([
    prisma.galleryImage.count({ where }),
    prisma.galleryImage.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  return NextResponse.json({
    success: true,
    message: "Success",
    total,
    images,
  });
};

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    const image = await prisma.galleryImage.create({
      data: body,
    });

    return NextResponse.json({
      success: true,
      message: "Gallery image created successfully",
      image,
    });
  } catch (error) {
    console.error("Error creating gallery image:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create gallery image",
        image: null,
      },
      { status: 500 },
    );
  }
};
