import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  isRegistered: boolean('is_registered').notNull().default(false)
});

export const session = pgTable("session", {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' })
});

export const account = pgTable("account", {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable("verification", {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at')
});

export const events = pgTable("events", {
  id: text('id').primaryKey(),
  organiserId: text('organiser_id').references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  isTokenGated: boolean('is_token_gated').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  participantsCount: text('participants_count').notNull().default('0'),
  location: text('location'),
});

export const eventParticipants = pgTable('event_participants', {
  id: text('id').primaryKey(),
  eventId: text('event_id').references(() => events.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  isRegistered: boolean('is_registered').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const checkIn = pgTable("check_in", {
  id: text('id').primaryKey(),
  eventId: text('event_id').references(() => events.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  checkInTime: timestamp('check_in_time').notNull(),
});

export const nftPasses = pgTable('nft_passes', {
  id: text('id').primaryKey(),
  eventId: text('event_id').references(() => events.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  mintTXHash: text('mint_tx_hash').notNull(),
  tokenId: text('token_id').notNull(),
  claimed: boolean('claimed').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const walletDetails = pgTable('wallet_details', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  publicKey: text('public_key').notNull(),
  solBalance: integer('sol_balance').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
