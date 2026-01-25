type AuthContext = {
  auth: {
    getUserIdentity: () => Promise<Record<string, unknown> | null>;
  };
};

export const getClerkId = async (ctx: AuthContext) => {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    throw new Error("Not authenticated");
  }
  const clerkId = identity["user_id"];
  if (typeof clerkId !== "string" || clerkId.length === 0) {
    throw new Error("Missing Clerk user id");
  }
  return clerkId;
};
