"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { ChatProvider } from "@/lib/chat-store";
import { AnimatedSphere } from "@/components/landing/animated-sphere";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/signin");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-40 h-40 opacity-70">
          <AnimatedSphere />
        </div>
      </main>
    );
  }

  return <ChatProvider>{children}</ChatProvider>;
}
