import PageContainer from "@/components/layout/page-container";
import EmployeeViewPage from "@/features/employees/view-page";

export const metadata = { title: "Admin: Employee" };

type Props = { params: Promise<{ employeeId: string }> };

export default async function Page({ params }: Props) {
  const { employeeId } = await params;
  return (
    <PageContainer>
      <div className="flex-1 space-y-4">
        <EmployeeViewPage employeeId={employeeId} />
      </div>
    </PageContainer>
  );
}