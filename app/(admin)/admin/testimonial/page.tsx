import Link from "next/link";
import PageContainer from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { testimonialInfoContent } from "@/config/infoconfig";
import { TestimonialTable } from "@/features/testimonials/table";

export const metadata = { title: "Admin: Testimonials" };

export default function Page() {
  return (
    <PageContainer
      pageTitle="Testimonials"
      pageDescription="Manage testimonials"
      infoContent={testimonialInfoContent}
      pageHeaderAction={
        <Link
          href="/admin/testimonial/new"
          className={cn(buttonVariants(), "text-xs md:text-sm")}
        >
          <Icons.add className="mr-2 h-4 w-4" /> Add New
        </Link>
      }
    >
      <TestimonialTable />
    </PageContainer>
  );
}
