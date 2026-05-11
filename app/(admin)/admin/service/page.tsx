import Link from "next/link";
import PageContainer from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { serviceInfoContent } from "@/config/infoconfig";
import { ServiceTable } from "@/features/services/table";

export const metadata = { title: "Admin: Services" };

export default function Page() {
  return (
    <PageContainer
      pageTitle="Services"
      pageDescription="Manage services"
      infoContent={serviceInfoContent}
      pageHeaderAction={
        <Link
          href="/admin/service/new"
          className={cn(buttonVariants(), "text-xs md:text-sm")}
        >
          <Icons.add className="mr-2 h-4 w-4" /> Add New
        </Link>
      }
    >
      <ServiceTable />
    </PageContainer>
  );
}
