import PageContainer from "@/components/layout/page-container";
import ServiceViewPage from "@/features/services/view-page";

export const metadata = { title: "Admin: Service" };

type Props = { params: Promise<{ serviceId: string }> };

export default async function Page({ params }: Props) {
  const { serviceId } = await params;
  return (
    <PageContainer>
      <div className="flex-1 space-y-4">
        <ServiceViewPage serviceId={serviceId} />
      </div>
    </PageContainer>
  );
}
