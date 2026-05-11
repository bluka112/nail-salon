// Dispatcher for `/admin/service/[serviceId]`: when serviceId === "new" we
// render the form blank; otherwise we fetch the service and pass it as
// initialData.
"use client";

import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import ServiceForm from "@/features/services/form";
import { serviceByIdQueryOptions } from "@/features/services/api";

type Props = { serviceId: string };

export default function ServiceViewPage({ serviceId }: Props) {
  if (serviceId === "new") {
    return <ServiceForm initialData={null} pageTitle="Create New Service" />;
  }

  return <EditServiceView serviceId={serviceId} />;
}

function EditServiceView({ serviceId }: { serviceId: string }) {
  const { data, isPending, isError } = useQuery(
    serviceByIdQueryOptions(serviceId),
  );

  if (isPending) return <div className="p-4">Loading...</div>;
  if (isError) return <div className="p-4">Failed to load service.</div>;
  if (!data?.service) notFound();

  return <ServiceForm initialData={data.service} pageTitle="Edit Service" />;
}
