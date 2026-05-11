"use client";

import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import PromotionForm from "@/features/promotions/form";
import { promotionByIdQueryOptions } from "@/features/promotions/api";

type Props = { promotionId: string };

export default function PromotionViewPage({ promotionId }: Props) {
  if (promotionId === "new") {
    return <PromotionForm initialData={null} pageTitle="Create New Promotion" />;
  }

  return <EditPromotionView promotionId={promotionId} />;
}

function EditPromotionView({ promotionId }: { promotionId: string }) {
  const { data, isPending, isError } = useQuery(
    promotionByIdQueryOptions(promotionId),
  );

  if (isPending) return <div className="p-4">Loading...</div>;
  if (isError) return <div className="p-4">Failed to load promotion.</div>;
  if (!data?.promotion) notFound();

  return (
    <PromotionForm initialData={data.promotion} pageTitle="Edit Promotion" />
  );
}
