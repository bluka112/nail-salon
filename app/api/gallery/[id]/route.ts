import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  
  const image = await prisma.galleryImage.findUnique({
    where: { id },
  });

  if (!image) {
    return NextResponse.json(
      { success: false, message: "Gallery image not found", image: null },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, image });
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.galleryImage.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { success: false, message: "Gallery image not found" },
      { status: 404 }
    );
  }

  const image = await prisma.galleryImage.update({
    where: { id },
    data: body,
  });

  return NextResponse.json({ 
    success: true, 
    message: "Gallery image updated successfully", 
    image 
  });
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const existing = await prisma.galleryImage.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { success: false, message: "Gallery image not found" },
      { status: 404 }
    );
  }

  await prisma.galleryImage.delete({ where: { id } });

  return NextResponse.json({ 
    success: true, 
    message: "Gallery image deleted successfully" 
  });
};
