"use client";

import { useState } from "react";
import { FloatingButton } from "./floating-button";
import { IdeaForm } from "./idea-form";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { LightbulbIcon } from "lucide-react";

export function GlobalContentIdeaInput() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <>
      <FloatingButton onClick={() => setIsOpen(!isOpen)} isOpen={isOpen} />

      {/* Form Panel */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-40 w-full max-w-md transition-all duration-300 ease-in-out",
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none",
        )}
      >
        <Card className="shadow-xl border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <LightbulbIcon className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">New Content Idea</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <IdeaForm onSuccess={handleSuccess} onCancel={handleCancel} />
          </CardContent>
        </Card>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

