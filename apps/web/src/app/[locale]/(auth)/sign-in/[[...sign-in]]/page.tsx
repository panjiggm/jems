"use client";

import { SignIn } from "@clerk/clerk-react";
import { useParams } from "next/navigation";

export default function SignInPage() {
  const params = useParams();
  const locale = params.locale;

  return (
    <div className="flex justify-center">
      <SignIn
        routing="path"
        path={`/${locale}/sign-in`}
        signUpUrl={`/${locale}/sign-up`}
        forceRedirectUrl={`/${locale}/dashboard`}
      />
    </div>
  );
}
