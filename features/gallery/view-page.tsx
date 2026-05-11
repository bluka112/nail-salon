"use client";

import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import GalleryForm from "@/features/gallery/form";
import { galleryImageByIdQueryOptions } from "@/features/gallery/api";

type Props = { imageId: string };

export default function GalleryViewPage({ imageId }: Props) {
  if (imageId === "new") {
    return <GalleryForm initialData={null} pageTitle="Create New Image" />;
  }

  return <EditGalleryView imageId={imageId} />;
}

function EditGalleryView({ imageId }: { imageId: string }) {
  const { data, isPending, isError } = useQuery(
    galleryImageByIdQueryOptions(imageId),
  );

  if (isPending) return <div className="p-4">Loading...</div>;
  if (isError) return <div className="p-4">Failed to load gallery image.</div>;
  if (!data?.image) notFound();

  return <GalleryForm initialData={data.image} pageTitle="Edit Image" />;
}
