import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  
  const branch = await prisma.branch.findUnique({
    where: { id },
    include: { 
      employees: { where: { status: "active" } },
      _count: { select: { bookings: true } }
    },
  });

  if (!branch) {
    return NextResponse.json(
      { success: false, message: "Branch not found", branch: null },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, branch });
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.branch.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { success: false, message: "Branch not found" },
      { status: 404 }
    );
  }

  const branch = await prisma.branch.update({
    where: { id },
    data: body,
    include: { employees: true },
  });

  return NextResponse.json({ 
    success: true, 
    message: "Branch updated successfully", 
    branch 
  });
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await prisma.branch.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { success: false, message: "Branch not found" },
      { status: 404 }
    );
  }

  await prisma.branch.delete({ where: { id } });

  return NextResponse.json({ 
    success: true, 
    message: "Branch deleted successfully" 
  });
};
