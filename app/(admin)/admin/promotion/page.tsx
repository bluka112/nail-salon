import Link from "next/link";
import PageContainer from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { promotionInfoContent } from "@/config/infoconfig";
import { PromotionTable } from "@/features/promotions/table";

export const metadata = { title: "Admin: Promotions" };

export default function Page() {
  return (
    <PageContainer
      pageTitle="Promotions"
      pageDescription="Manage promotions"
      infoContent={promotionInfoContent}
      pageHeaderAction={
        <Link
          href="/admin/promotion/new"
          className={cn(buttonVariants(), "text-xs md:text-sm")}
        >
          <Icons.add className="mr-2 h-4 w-4" /> Add New
        </Link>
      }
    >
      <PromotionTable />
    </PageContainer>
  );
}
