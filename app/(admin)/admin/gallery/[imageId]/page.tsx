import PageContainer from "@/components/layout/page-container";
import GalleryViewPage from "@/features/gallery/view-page";

export const metadata = { title: "Admin: Gallery Image" };

type Props = { params: Promise<{ imageId: string }> };

export default async function Page({ params }: Props) {
  const { imageId } = await params;
  return (
    <PageContainer>
      <div className="flex-1 space-y-4">
        <GalleryViewPage imageId={imageId} />
      </div>
    </PageContainer>
  );
}
