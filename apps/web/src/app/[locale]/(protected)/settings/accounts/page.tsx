"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SocialMediaIcon } from "../../dashboard/_components/social-media-icon";
import { Loader2, Link2, Unlink } from "lucide-react";

type Platform = "tiktok" | "instagram" | "facebook" | "youtube";

const platformConfig: Record<
  Platform,
  { name: string; iconClassName: string }
> = {
  tiktok: {
    name: "TikTok",
    iconClassName: "bg-black/10 dark:bg-white/10",
  },
  instagram: {
    name: "Instagram",
    iconClassName: "bg-gradient-to-br from-purple-500/10 to-pink-500/10",
  },
  facebook: {
    name: "Facebook",
    iconClassName: "bg-blue-500/10",
  },
  youtube: {
    name: "YouTube",
    iconClassName: "bg-red-500/10",
  },
};

export default function SettingsAccountsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = params.locale as string;

  // Fetch platform availability and connected accounts
  const platformAvailability = useQuery(
    api.queries.socialMediaAccounts.getPlatformAvailability,
  );
  const accounts = useQuery(api.queries.socialMediaAccounts.list);
  const disconnectMutation = useMutation(
    api.mutations.socialMediaAccounts.disconnect,
  );
  const [disconnectingAccountId, setDisconnectingAccountId] = useState<
    Id<"socialMediaAccounts"> | null
  >(null);

  // Handle URL query parameters for success/error messages
  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    const accountId = searchParams.get("account");

    if (success === "tiktok") {
      toast.success("TikTok account connected successfully!");
      // Clear the query params
      router.replace(`/${locale}/settings/accounts`);
    }

    if (error) {
      const errorMessages: Record<string, string> = {
        no_code: "Authorization code not received",
        no_state: "State parameter missing",
        invalid_state: "Invalid state parameter. Please try again.",
        no_account: "Account not found",
      };

      const errorMessage =
        errorMessages[error] || decodeURIComponent(error);
      toast.error(`Connection failed: ${errorMessage}`);
      // Clear the query params
      router.replace(`/${locale}/settings/accounts`);
    }
  }, [searchParams, router, locale]);

  // Create a map of platform to account
  const accountsByPlatform = useMemo(() => {
    const map: Record<string, typeof accounts[0]> = {};
    accounts?.forEach((account) => {
      map[account.platform] = account;
    });
    return map;
  }, [accounts]);

  // Handle connect button click
  const handleConnect = (platform: Platform) => {
    if (platform === "tiktok") {
      // Redirect to OAuth initiation route
      window.location.href = "/api/oauth/tiktok";
    } else {
      toast.info(`${platformConfig[platform].name} integration coming soon`);
    }
  };

  // Handle disconnect
  const handleDisconnect = async (accountId: Id<"socialMediaAccounts">) => {
    try {
      setDisconnectingAccountId(accountId);
      await disconnectMutation({ accountId });
      toast.success("Account disconnected successfully");
    } catch (error: any) {
      toast.error(`Failed to disconnect: ${error.message}`);
    } finally {
      setDisconnectingAccountId(null);
    }
  };

  const isLoading = platformAvailability === undefined || accounts === undefined;

  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto size-full max-w-4xl flex-1 px-4 py-6 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Connected Accounts</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your social media account connections
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array(4)
              .fill(0)
              .map((_, index) => (
                <Card key={index} className="shadow-none">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-md" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <div className="space-y-4">
            {(Object.keys(platformConfig) as Platform[]).map((platform) => {
              const config = platformConfig[platform];
              const isAvailable = platformAvailability?.[platform] ?? false;
              const account = accountsByPlatform[platform];
              const isConnected = account?.isConnected ?? false;

              return (
                <Card key={platform} className="shadow-none">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar
                          className={`size-12 rounded-md ${config.iconClassName}`}
                        >
                          <AvatarFallback className="rounded-md">
                            <SocialMediaIcon
                              platform={platform}
                              width={24}
                              height={24}
                            />
                          </AvatarFallback>
                          {account?.profileImageUrl && (
                            <AvatarImage
                              src={account.profileImageUrl}
                              alt={config.name}
                            />
                          )}
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{config.name}</h3>
                            {isConnected ? (
                              <Badge className="bg-green-500/10 text-green-600 dark:text-green-500 text-[11px]">
                                Connected
                              </Badge>
                            ) : isAvailable ? (
                              <Badge className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 text-[11px]">
                                Available
                              </Badge>
                            ) : (
                              <Badge className="bg-muted text-muted-foreground text-[11px]">
                                Coming Soon
                              </Badge>
                            )}
                          </div>
                          {isConnected && account?.displayName && (
                            <p className="text-muted-foreground text-sm mt-1">
                              {account.displayName}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isConnected ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisconnect(account._id)}
                            disabled={disconnectingAccountId === account._id}
                          >
                            {disconnectingAccountId === account._id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Unlink className="h-4 w-4 mr-2" />
                            )}
                            Disconnect
                          </Button>
                        ) : isAvailable ? (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleConnect(platform)}
                          >
                            <Link2 className="h-4 w-4 mr-2" />
                            Connect
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

