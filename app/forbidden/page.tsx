import { ForbiddenAccountMessage } from "./sign-out-action";

export const metadata = {
  title: "Forbidden | Elegance",
};

export default function ForbiddenPage() {
  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-6 py-12">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <p className="text-muted-foreground text-sm font-medium">403</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Access denied
        </h1>
        <ForbiddenAccountMessage />
      </div>
    </main>
  );
}
