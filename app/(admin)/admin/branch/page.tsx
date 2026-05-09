import PageContainer from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { branchInfoContent } from "@/config/infoconfig";
import { BranchTable } from "@/features/branches/table";

export const metadata = { title: "Admin: Branches" };

export default function Page() {
  return (
    <PageContainer
      pageTitle="Branches"
      pageDescription="Manage branches"
      infoContent={branchInfoContent}
      pageHeaderAction={
        <Link
          href="/admin/branch/new"
          className={cn(buttonVariants(), "text-xs md:text-sm")}
        >
          <Icons.add className="mr-2 h-4 w-4" /> Add New
        </Link>
      }
    >
      <BranchTable />
    </PageContainer>
  );
}
