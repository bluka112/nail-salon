import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import PageContainer from "@/components/layout/page-container";
import ProductViewPage from "@/features/branches/components/branch-view-page";
import { branchByIdOptions } from "@/features/branches/api/queries";
export const metadata = {
  title: "Admin: Product",
};

type PageProps = { params: Promise<{ branchId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  const queryClient = getQueryClient();

  if (params.branchId !== "new") {
    void queryClient.prefetchQuery(branchByIdOptions(params.branchId));
  }

  return (
    <PageContainer>
      <div className="flex-1 space-y-4">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <ProductViewPage branchId={params.branchId} />
        </HydrationBoundary>
      </div>
    </PageContainer>
  );
}
