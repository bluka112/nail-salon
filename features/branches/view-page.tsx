// Dispatcher for `/admin/branch/[branchId]`: when branchId === "new" we
// render the form blank; otherwise we fetch the branch and pass it as
// initialData. Loading / error / 404 are handled here so the form itself
// never has to know about async state.

"use client";

import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import BranchForm from "@/features/branches/form";
import { branchByIdQueryOptions } from "@/features/branches/api";

type Props = { branchId: string };

export default function BranchViewPage({ branchId }: Props) {
  if (branchId === "new") {
    return <BranchForm initialData={null} pageTitle="Create New Branch" />;
  }

  return <EditBranchView branchId={branchId} />;
}

function EditBranchView({ branchId }: { branchId: string }) {
  const { data, isPending, isError } = useQuery(
    branchByIdQueryOptions(branchId),
  );

  if (isPending) return <div className="p-4">Loading...</div>;
  if (isError) return <div className="p-4">Failed to load branch.</div>;
  if (!data?.branch) notFound();

  return <BranchForm initialData={data.branch} pageTitle="Edit Branch" />;
}
