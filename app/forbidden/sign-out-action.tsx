"use client";

import { SignOutButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function ForbiddenAccountMessage() {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  return (
    <>
      <p className="text-muted-foreground mt-3 text-sm">
        {email
          ? `Your email (${email}) is not allowed in the admin list.`
          : "Your email is not allowed in the admin list."}
      </p>
      <SignOutButton redirectUrl="/auth/sign-in">
        <Button className="mt-6">Log out</Button>
      </SignOutButton>
    </>
  );
}
