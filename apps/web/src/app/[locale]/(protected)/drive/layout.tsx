"use client";

import React from "react";
import { DriveStats } from "./_components/drive-stats";

export default function DriveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-muted/30 min-h-screen">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold">Drive</h1>
              <p className="text-sm text-muted-foreground">
                Manage all your media files
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12">
        {/* Main Content */}
        <div className="flex-1 min-w-0 lg:col-span-10 order-2 lg:order-1">
          <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
            {children}
          </div>
        </div>

        {/* Right Sidebar - Stats */}
        <div className="w-full lg:col-span-2 bg-card border-t border-border lg:border-t-0 lg:border-l order-1 lg:order-2">
          <div className="lg:sticky lg:top-14">
            <DriveStats />
          </div>
        </div>
      </div>
    </div>
  );
}
