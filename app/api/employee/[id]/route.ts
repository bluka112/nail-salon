import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { isAuthenticated } = await auth();
  if (!isAuthenticated) {
    return NextResponse.json({ message: "you are not authenticated" });
  }
  const { id } = await params;
  const find = await prisma.employee.findUnique({ where: { id } });
  if (find == null) {
    return NextResponse.json({ message: "not found" });
  }
  await prisma.employee.delete({ where: { id } });
  return NextResponse.json(find);
};
export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { isAuthenticated } = await auth();
  if (!isAuthenticated) {
    return NextResponse.json({ message: "you are not authenticated" });
  }
  const { id } = await params;
  const find = await prisma.employee.findUnique({ where: { id } });
  if (find == null) {
    return NextResponse.json({ message: "not found" });
  }
  return NextResponse.json(find);
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { isAuthenticated } = await auth();
  if (!isAuthenticated) {
    return NextResponse.json({ message: "you are not authenticated" });
  }
  const { id } = await params;
  const body = await req.json();
  const find = await prisma.employee.findUnique({ where: { id } });
  if (find == null) {
    return NextResponse.json({ message: "not found" });
  }
  const result = await prisma.employee.update({
    where: { id },
    data: { ...body, branch: { connect: { id: body.branch } } },
  });
  return NextResponse.json(result);
};
