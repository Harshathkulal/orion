// app/auth/callback/page.tsx
import { db } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AuthCallbackPage() {
  try {
    // Get the authenticated user
    const user = await currentUser();

    if (!user?.id || !user.emailAddresses[0]?.emailAddress) {
      console.log("No user ID or email found, redirecting to login");
      return redirect("/login");
    }

    // if user exists in your database
    const existingUser = await db.user.findUnique({
      where: {
        clerkId: user.id,
      },
    });

    // Create new user
    if (!existingUser) {
      console.log("Creating new user in database");
      try {
        await db.user.create({
          data: {
            clerkId: user.id,
            email: user.emailAddresses[0].emailAddress,
            firstName: user.firstName ?? null,
            lastName: user.lastName ?? null,
            profileImageUrl: user.externalAccounts[0].imageUrl ?? null,
          },
        });
        console.log("User created successfully");
      } catch (dbError) {
        console.error("Database error:", dbError);
        // function to handle specific database errors
        return redirect("/login?error=database");
      }
    } else {
      console.log("User already exists in database");
    }

    // Redirect to home page after successful processing
    return redirect("/");
  } catch (error) {
    console.error("Error in auth callback:", error);
    return redirect("/login?error=callback");
  }
}
