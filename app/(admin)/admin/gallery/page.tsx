import Link from "next/link";
import PageContainer from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { galleryInfoContent } from "@/config/infoconfig";
import { GalleryTable } from "@/features/gallery/table";

export const metadata = { title: "Admin: Gallery" };

export default function Page() {
  return (
    <PageContainer
      pageTitle="Gallery"
      pageDescription="Manage gallery images"
      infoContent={galleryInfoContent}
      pageHeaderAction={
        <Link
          href="/admin/gallery/new"
          className={cn(buttonVariants(), "text-xs md:text-sm")}
        >
          <Icons.add className="mr-2 h-4 w-4" /> Add New
        </Link>
      }
    >
      <GalleryTable />
    </PageContainer>
  );
}
