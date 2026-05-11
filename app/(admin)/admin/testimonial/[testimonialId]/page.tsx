import PageContainer from "@/components/layout/page-container";
import TestimonialViewPage from "@/features/testimonials/view-page";

export const metadata = { title: "Admin: Testimonial" };

type Props = { params: Promise<{ testimonialId: string }> };

export default async function Page({ params }: Props) {
  const { testimonialId } = await params;
  return (
    <PageContainer>
      <div className="flex-1 space-y-4">
        <TestimonialViewPage testimonialId={testimonialId} />
      </div>
    </PageContainer>
  );
}
