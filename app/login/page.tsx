"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SiteShell } from "@/components/ui/site-shell";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <SiteShell>
      <Card className="mx-auto max-w-md space-y-4">
        <h1 className="font-serif text-4xl text-stone-800">Login</h1>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <Button
          onClick={async () => {
            const res = await signIn("credentials", {
              redirect: false,
              email,
              password,
            });
            if (!res?.error) router.push("/account");
          }}
        >
          Continue
        </Button>
      </Card>
    </SiteShell>
  );
}
