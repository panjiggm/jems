export function missingEnvVariableUrl(envVarName: string, whereToGet: string) {
  const deployment = deploymentName();
  if (!deployment) return `Missing ${envVarName} in environment variables.`;
  return (
    `\n  Missing ${envVarName} in environment variables.\n\n` +
    `  Get it from ${whereToGet} .\n  Paste it on the Convex dashboard:\n` +
    `  https://dashboard.convex.dev/d/${deployment}/settings?var=${envVarName}`
  );
}

export function deploymentName() {
  const url = process.env.CONVEX_CLOUD_URL;
  if (!url) return undefined;
  const regex = new RegExp("https://(.+).convex.cloud");
  return regex.exec(url)?.[1];
}

// Project Activities Helper Functions
export interface ActivityLogParams {
  userId: string;
  projectId: string;
  entityType: "project" | "content" | "task";
  entityId: string;
  action:
    | "created"
    | "updated"
    | "deleted"
    | "status_changed"
    | "assigned"
    | "completed"
    | "scheduled"
    | "published";
  description?: string;
  metadata?: any;
}

export function createActivityDescription(
  entityType: string,
  action: string,
  entityTitle?: string,
  metadata?: any,
): string {
  const entity = entityType.charAt(0).toUpperCase() + entityType.slice(1);
  const title = entityTitle ? `"${entityTitle}"` : "";

  switch (action) {
    case "created":
      return `${entity} ${title} was created`;
    case "updated":
      return `${entity} ${title} was updated`;
    case "deleted":
      return `${entity} ${title} was deleted`;
    case "status_changed":
      return `${entity} ${title} status changed from "${metadata?.oldValue}" to "${metadata?.newValue}"`;
    case "assigned":
      return `${entity} ${title} was assigned`;
    case "completed":
      return `${entity} ${title} was completed`;
    case "scheduled":
      return `${entity} ${title} was scheduled for ${metadata?.scheduledAt || "later"}`;
    case "published":
      return `${entity} ${title} was published`;
    default:
      return `${entity} ${title} was ${action}`;
  }
}
