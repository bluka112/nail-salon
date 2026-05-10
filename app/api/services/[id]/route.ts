import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  
  const service = await prisma.service.findUnique({
    where: { id },
  });

  if (!service) {
    return NextResponse.json(
      { success: false, message: "Service not found", service: null },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, service });
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { success: false, message: "Service not found" },
      { status: 404 }
    );
  }

  const service = await prisma.service.update({
    where: { id },
    data: body,
  });

  return NextResponse.json({ 
    success: true, 
    message: "Service updated successfully", 
    service 
  });
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { success: false, message: "Service not found" },
      { status: 404 }
    );
  }

  await prisma.service.delete({ where: { id } });

  return NextResponse.json({ 
    success: true, 
    message: "Service deleted successfully" 
  });
};
