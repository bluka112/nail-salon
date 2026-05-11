import PageContainer from "@/components/layout/page-container";
import PromotionViewPage from "@/features/promotions/view-page";

export const metadata = { title: "Admin: Promotion" };

type Props = { params: Promise<{ promotionId: string }> };

export default async function Page({ params }: Props) {
  const { promotionId } = await params;
  return (
    <PageContainer>
      <div className="flex-1 space-y-4">
        <PromotionViewPage promotionId={promotionId} />
      </div>
    </PageContainer>
  );
}
