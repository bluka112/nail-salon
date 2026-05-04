import PageContainer from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { searchParamsCache } from "@/lib/searchparams";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { SearchParams } from "nuqs/server";
import { branchInfoContent } from "@/config/infoconfig";
import BranchListingPage from "@/features/branches/components/branch-listing";

export const metadata = {
  title: "Admin: Products",
};

type pageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: pageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

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
      <BranchListingPage />
    </PageContainer>
  );
}
