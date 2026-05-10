import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const page = Number(params.get("page") ?? 1);
  const limit = Number(params.get("limit") ?? 10);
  const search = params.get("search") ?? "";
  const status = params.get("status");
  const featured = params.get("featured");

  const where: Prisma.TestimonialWhereInput = {
    ...(status && { status: status as "active" | "disabled" }),
    ...(featured === "true" && { featured: true }),
    OR: [
      { name: { contains: search, mode: "insensitive" } },
      { comment: { contains: search, mode: "insensitive" } },
      { service: { contains: search, mode: "insensitive" } },
    ],
  };

  const [total, testimonials] = await Promise.all([
    prisma.testimonial.count({ where }),
    prisma.testimonial.findMany({
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
    testimonials,
  });
};

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    const testimonial = await prisma.testimonial.create({
      data: body,
    });

    return NextResponse.json({
      success: true,
      message: "Testimonial created successfully",
      testimonial,
    });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create testimonial",
        testimonial: null,
      },
      { status: 500 },
    );
  }
};
