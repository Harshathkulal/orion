import { db } from "@/db/db";
import { users, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { currentUser, auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import cuid from "cuid";

export default async function AuthCallbackPage() {
  try {
    // Get the authenticated user
    const user = await currentUser();
    const { sessionId } = await auth();

    if (!user?.id || !user.emailAddresses[0]?.emailAddress) {
      return redirect("/login");
    }

    const email = user.emailAddresses[0].emailAddress;

    const existingUser = (
      await db.select().from(users).where(eq(users.clerkId, user.id))
    )[0];

    let userId: string;

    if (!existingUser) {
      const newId = cuid();
      await db.insert(users).values({
        id: newId,
        clerkId: user.id,
        email,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        profileImageUrl: user.imageUrl ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      userId = newId;
    } else {
      userId = existingUser.id;
    }

    // Save session entry
    await db.insert(sessions).values({
      id: cuid(),
      userId,
      clerkSessionId: sessionId ?? null,
    });

    return redirect("/");
  } catch (error) {
    console.error("Auth callback error:", error);
    return redirect("/login?error=callback");
  }
}
