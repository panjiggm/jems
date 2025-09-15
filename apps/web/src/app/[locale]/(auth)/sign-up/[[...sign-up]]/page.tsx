"use client";

import { SignUp } from "@clerk/clerk-react";
import { useParams } from "next/navigation";

export default function SignUpPage() {
  const params = useParams();
  const locale = params.locale;

  return (
    <div className="flex justify-center">
      <SignUp
        routing="path"
        path={`/${locale}/sign-up`}
        signInUrl={`/${locale}/sign-in`}
        forceRedirectUrl={`/${locale}/dashboard`}
      />
    </div>
  );
}
