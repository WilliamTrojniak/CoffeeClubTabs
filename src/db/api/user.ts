'use server'

import { eq } from "drizzle-orm";
import { users } from "../schema/users";
import { db } from "./database";

// Create a user entry with a unique id
// Update user values if the user already exists
export async function createUser(id: string, name?: string, email?: string) {
  console.log(`Creating user with id ${id}...`);
  if (name || email) {
    await db.insert(users).values({id, name, email}).onConflictDoUpdate({target: users.id, set: {name: name, email: email}}).returning(); 
  } else {
    await db.insert(users).values({id, name, email}).onConflictDoNothing().returning();
  }
}

// Get user data for user with id
// Returns null if no user with id exists
export async function getUser(id: string) {
  const result = await db.select().from(users).where(eq(users.id, id));
  
  if (result.length === 0) return null;
  return result[0];
}
