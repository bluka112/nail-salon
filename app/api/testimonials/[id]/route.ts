import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  
  const testimonial = await prisma.testimonial.findUnique({
    where: { id },
  });

  if (!testimonial) {
    return NextResponse.json(
      { success: false, message: "Testimonial not found", testimonial: null },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, testimonial });
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.testimonial.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { success: false, message: "Testimonial not found" },
      { status: 404 }
    );
  }

  const testimonial = await prisma.testimonial.update({
    where: { id },
    data: body,
  });

  return NextResponse.json({ 
    success: true, 
    message: "Testimonial updated successfully", 
    testimonial 
  });
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await prisma.testimonial.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { success: false, message: "Testimonial not found" },
      { status: 404 }
    );
  }

  await prisma.testimonial.delete({ where: { id } });

  return NextResponse.json({ 
    success: true, 
    message: "Testimonial deleted successfully" 
  });
};
