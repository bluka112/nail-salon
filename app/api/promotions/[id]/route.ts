import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  
  const promotion = await prisma.promotion.findUnique({
    where: { id },
  });

  if (!promotion) {
    return NextResponse.json(
      { success: false, message: "Promotion not found", promotion: null },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, promotion });
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.promotion.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { success: false, message: "Promotion not found" },
      { status: 404 }
    );
  }

  const updateData = {
    ...body,
    ...(body.validFrom && { validFrom: new Date(body.validFrom) }),
    ...(body.validUntil && { validUntil: new Date(body.validUntil) }),
  };

  const promotion = await prisma.promotion.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ 
    success: true, 
    message: "Promotion updated successfully", 
    promotion 
  });
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await prisma.promotion.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { success: false, message: "Promotion not found" },
      { status: 404 }
    );
  }

  await prisma.promotion.delete({ where: { id } });

  return NextResponse.json({ 
    success: true, 
    message: "Promotion deleted successfully" 
  });
};
