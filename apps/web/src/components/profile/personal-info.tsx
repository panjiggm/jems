"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PersonalInfo() {
  const profile = useQuery(api.queries.profile.getProfile);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Personal Info</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update your personal information and contact details
        </p>
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            type="text"
            defaultValue={profile?.full_name || ""}
            placeholder="Enter your full name"
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            defaultValue={profile?.phone || ""}
            placeholder="+62 812 3456 7890"
          />
        </div>

        {/* Avatar URL */}
        <div className="space-y-2">
          <Label htmlFor="avatar_url">Avatar URL</Label>
          <Input
            id="avatar_url"
            type="url"
            defaultValue={profile?.avatar_url || ""}
            placeholder="https://example.com/avatar.jpg"
          />
          <p className="text-xs text-muted-foreground">
            Enter a URL for your profile picture
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button>Save Changes</Button>
        <Button variant="outline">Cancel</Button>
      </div>
    </div>
  );
}
