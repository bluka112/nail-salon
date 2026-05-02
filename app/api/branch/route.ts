import { Status } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async () => {
  const result = await prisma.branch.findMany({
    where: { status: Status.active },
  });

  return NextResponse.json(result);
};
export const POST = async (req: NextRequest) => {
  const { isAuthenticated } = await auth();
  if (!isAuthenticated) {
    return NextResponse.json({ message: "you are not authenticated" }, { status: 401 });
  }
  const body = await req.json();
  const result = await prisma.branch.create({ data: body });
  return NextResponse.json(result);
};
