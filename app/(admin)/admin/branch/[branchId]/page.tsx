import PageContainer from "@/components/layout/page-container";
import BranchViewPage from "@/features/branches/view-page";

export const metadata = { title: "Admin: Branch" };

type Props = { params: Promise<{ branchId: string }> };

export default async function Page({ params }: Props) {
  const { branchId } = await params;
  return (
    <PageContainer>
      <div className="flex-1 space-y-4">
        <BranchViewPage branchId={branchId} />
      </div>
    </PageContainer>
  );
}
