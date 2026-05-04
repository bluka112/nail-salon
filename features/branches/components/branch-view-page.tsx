"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import ProductForm from "./branch-form";
import { branchByIdOptions } from "../api/queries";
import { Branch } from "@/lib/generated/prisma/browser";

type TProductViewPageProps = {
  branchId: string;
};

export default function ProductViewPage({ branchId }: TProductViewPageProps) {
  if (branchId === "new") {
    return <ProductForm initialData={null} pageTitle="Create New Product" />;
  }

  return <EditProductView branchId={branchId} />;
}

function EditProductView({ branchId }: { branchId: string }) {
  const { data } = useSuspenseQuery(branchByIdOptions(branchId));

  if (!data?.success || !data?.branch) {
    notFound();
  }

  return (
    <ProductForm initialData={data.branch as Branch} pageTitle="Edit Branch" />
  );
}
