'use server'

import { eq } from "drizzle-orm";
import { users } from "../schema/users";
import { db } from "./database";
import { cache } from "react";
import 'server-only'

// Create a user entry with a unique id
// Update user values if the user already exists
export async function createUser(id: string, name?: string, email?: string) {
  if (name || email) {
    console.log(`Updating user with id ${id}...`);
    await db.insert(users).values({id, name, email}).onConflictDoUpdate({target: users.id, set: {name: name, email: email}}).returning(); 
  } else {
    console.log(`Creating user with id ${id}...`);
    await db.insert(users).values({id, name, email}).onConflictDoNothing().returning();
  }
}

// Get user data for user with id
// Returns null if no user with id exists
export const getUser = cache(async (id: string) => {
  const result = await db.select().from(users).where(eq(users.id, id));
  
  if (result.length === 0) return null;
  return result[0];
});
