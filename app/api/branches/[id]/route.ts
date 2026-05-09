import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const unauthorized = () =>
  NextResponse.json(
    { success: false, message: "you are not authenticated", branch: null },
    { status: 401 },
  );

const notFound = () =>
  NextResponse.json(
    { success: false, message: "not found", branch: null },
    { status: 404 },
  );

export const GET = async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { isAuthenticated } = await auth();
  if (!isAuthenticated) return unauthorized();

  const { id } = await params;
  const branch = await prisma.branch.findUnique({ where: { id } });
  if (!branch) return notFound();

  return NextResponse.json({ success: true, message: "Success", branch });
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { isAuthenticated } = await auth();
  if (!isAuthenticated) return unauthorized();

  const { id } = await params;
  const existing = await prisma.branch.findUnique({ where: { id } });
  if (!existing) return notFound();

  const body = await req.json();
  const branch = await prisma.branch.update({
    where: { id },
    data: {
      ...body,
      ...(body.latitude !== undefined && { latitude: Number(body.latitude) }),
      ...(body.longitude !== undefined && { longitude: Number(body.longitude) }),
    },
  });

  return NextResponse.json({ success: true, message: "Updated", branch });
};

export const DELETE = async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { isAuthenticated } = await auth();
  if (!isAuthenticated) return unauthorized();

  const { id } = await params;
  const existing = await prisma.branch.findUnique({ where: { id } });
  if (!existing) return notFound();

  await prisma.branch.delete({ where: { id } });
  return NextResponse.json({
    success: true,
    message: "Deleted",
    branch: existing,
  });
};
