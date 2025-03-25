import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

// Prisma client initialization
const prisma = new PrismaClient()

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!SIGNING_SECRET) {
    throw new Error('Error: Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env.local')
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET)

  // Get headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', { status: 400 })
  }

  // Get body
  const payload = await req.json()
  const body = JSON.stringify(payload)
  let evt: WebhookEvent

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error: Could not verify webhook:', err)
    return new Response('Error: Verification error', { status: 400 })
  }

  // Extract user data
  if (!('email_addresses' in evt.data)) {
    return new Response('Error: Unexpected webhook data format', { status: 400 })
  }
  const { id, email_addresses, first_name, last_name, image_url } = evt.data
  const eventType = evt.type

  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(id, {
          email: email_addresses[0]?.email_address,
          firstName: first_name ?? undefined,
          lastName: last_name ?? undefined,
          imageUrl: image_url ?? undefined
        })
        break
      
      case 'user.updated':
        await handleUserUpdated(id, {
          email: email_addresses[0]?.email_address,
          firstName: first_name ?? undefined,
          lastName: last_name ?? undefined,
          imageUrl: image_url ?? undefined
        })
        break
      
      case 'user.deleted':
        await handleUserDeleted(id)
        break
      
      default:
        console.log(`Unhandled event type ${eventType}`)
    }

    return new Response('Webhook received and processed', { status: 200 })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response('Error processing webhook', { status: 500 })
  } finally {
    // Ensure Prisma connection is closed
    await prisma.$disconnect()
  }
}

// User creation handler
async function handleUserCreated(clerkId: string, userData: {
  email?: string,
  firstName?: string,
  lastName?: string,
  imageUrl?: string
}) {
  try {
    await prisma.user.create({
      data: {
        clerkId,
        email: userData.email ?? '',
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.imageUrl
      }
    })
    console.log(`User created: ${clerkId}`)
  } catch (error) {
    console.error('Error creating user in database:', error)
    throw error
  }
}

// User update handler
async function handleUserUpdated(clerkId: string, userData: {
  email?: string,
  firstName?: string,
  lastName?: string,
  imageUrl?: string
}) {
  try {
    await prisma.user.update({
      where: { clerkId },
      data: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.imageUrl
      }
    })
    console.log(`User updated: ${clerkId}`)
  } catch (error) {
    console.error('Error updating user in database:', error)
    throw error
  }
}

// User deletion handler
async function handleUserDeleted(clerkId: string) {
  try {
    await prisma.user.delete({
      where: { clerkId }
    })
    console.log(`User deleted: ${clerkId}`)
  } catch (error) {
    console.error('Error deleting user from database:', error)
    throw error
  }
}