// app/api/user/route.ts (Next.js App Router)
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Get the authenticated user's ID
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the user from Clerk
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get the primary email
    const email = user.emailAddresses.find(
      email => email.id === user.primaryEmailAddressId
    )?.emailAddress;
    
    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 400 });
    }
    
    // Check if the user already exists in your database
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    
    if (existingUser) {
      // Update the existing user
      await prisma.user.update({
        where: { clerkId: userId },
        data: {
          email: email,
          profile: {
            upsert: {
              create: {
                firstName: user.firstName,
                lastName: user.lastName,
                // You can add more fields as needed
              },
              update: {
                firstName: user.firstName,
                lastName: user.lastName,
                // Update more fields as needed
              },
            },
          },
        },
      });
      
      return NextResponse.json({ status: 'updated' });
    } else {
      // Create a new user
      await prisma.user.create({
        data: {
          clerkId: userId,
          email: email,
          profile: {
            create: {
              firstName: user.firstName,
              lastName: user.lastName,
              // Add more fields as needed
            },
          },
        },
      });
      
      return NextResponse.json({ status: 'created' });
    }
  } catch (error) {
    console.error('Error saving user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}