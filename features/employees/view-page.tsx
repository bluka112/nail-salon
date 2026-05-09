// Dispatcher for `/admin/employee/[employeeId]`: when employeeId === "new" we
// render the form blank; otherwise we fetch the employee and pass it as
// initialData. Loading / error / 404 are handled here so the form itself
// never has to know about async state.
"use client";

import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import EmployeeForm from "@/features/employees/form";
import { employeeByIdQueryOptions } from "@/features/employees/api";

type Props = { employeeId: string };

export default function EmployeeViewPage({ employeeId }: Props) {
  if (employeeId === "new") {
    return <EmployeeForm initialData={null} pageTitle="Create New Employee" />;
  }

  return <EditEmployeeView employeeId={employeeId} />;
}

function EditEmployeeView({ employeeId }: { employeeId: string }) {
  const { data, isPending, isError } = useQuery(
    employeeByIdQueryOptions(employeeId),
  );

  if (isPending) return <div className="p-4">Loading...</div>;
  if (isError) return <div className="p-4">Failed to load employee.</div>;
  if (!data?.employee) notFound();

  return <EmployeeForm initialData={data.employee} pageTitle="Edit Employee" />;
}
