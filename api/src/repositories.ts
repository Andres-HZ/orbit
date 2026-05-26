import { randomUUID } from "node:crypto";
import type { QueryResult } from "pg";
import { query } from "./db.js";

export type UserRecord = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PreferencesRecord = {
  userId: string;
  interests: string[];
  activityPreferences: string[];
  budgetStyle: string;
  socialStyle: string;
  favoriteCategories: string[];
};

export type UserRepository = {
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  create(input: { email: string; name: string; passwordHash: string }): Promise<UserRecord>;
};

export type PreferencesRepository = {
  findByUserId(userId: string): Promise<PreferencesRecord | null>;
  upsert(input: PreferencesRecord): Promise<PreferencesRecord>;
};

function mapUser(row: Record<string, unknown>): UserRecord {
  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    passwordHash: String(row.password_hash),
    onboardingCompleted: Boolean(row.onboarding_completed),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString()
  };
}

function mapPreferences(row: Record<string, unknown>): PreferencesRecord {
  return {
    userId: String(row.user_id),
    interests: row.interests as string[],
    activityPreferences: row.activity_preferences as string[],
    budgetStyle: String(row.budget_style),
    socialStyle: String(row.social_style),
    favoriteCategories: row.favorite_categories as string[]
  };
}

export const pgUsers: UserRepository = {
  async findByEmail(email) {
    const result = await query("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);
    return result.rowCount ? mapUser(result.rows[0] as Record<string, unknown>) : null;
  },
  async findById(id) {
    const result = await query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rowCount ? mapUser(result.rows[0] as Record<string, unknown>) : null;
  },
  async create(input) {
    const result = await query(
      `INSERT INTO users (email, name, password_hash)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [input.email.toLowerCase(), input.name, input.passwordHash]
    );
    return mapUser(result.rows[0] as Record<string, unknown>);
  }
};

export const pgPreferences: PreferencesRepository = {
  async findByUserId(userId) {
    const result = await query("SELECT * FROM user_preferences WHERE user_id = $1", [userId]);
    return result.rowCount ? mapPreferences(result.rows[0] as Record<string, unknown>) : null;
  },
  async upsert(input) {
    const result = await query(
      `INSERT INTO user_preferences
        (user_id, interests, activity_preferences, budget_style, social_style, favorite_categories)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) DO UPDATE SET
        interests = EXCLUDED.interests,
        activity_preferences = EXCLUDED.activity_preferences,
        budget_style = EXCLUDED.budget_style,
        social_style = EXCLUDED.social_style,
        favorite_categories = EXCLUDED.favorite_categories,
        updated_at = NOW()
       RETURNING *`,
      [
        input.userId,
        input.interests,
        input.activityPreferences,
        input.budgetStyle,
        input.socialStyle,
        input.favoriteCategories
      ]
    );
    await query("UPDATE users SET onboarding_completed = TRUE, updated_at = NOW() WHERE id = $1", [
      input.userId
    ]);
    return mapPreferences(result.rows[0] as Record<string, unknown>);
  }
};

export function createMemoryRepositories(): {
  users: UserRepository;
  preferences: PreferencesRepository;
} {
  const users = new Map<string, UserRecord>();
  const preferences = new Map<string, PreferencesRecord>();

  return {
    users: {
      async findByEmail(email) {
        return [...users.values()].find((user) => user.email === email.toLowerCase()) ?? null;
      },
      async findById(id) {
        return users.get(id) ?? null;
      },
      async create(input) {
        if ([...users.values()].some((user) => user.email === input.email.toLowerCase())) {
          const error = new Error("duplicate key value violates unique constraint");
          (error as Error & { code?: string }).code = "23505";
          throw error;
        }
        const now = new Date().toISOString();
        const user: UserRecord = {
          id: randomUUID(),
          email: input.email.toLowerCase(),
          name: input.name,
          passwordHash: input.passwordHash,
          onboardingCompleted: false,
          createdAt: now,
          updatedAt: now
        };
        users.set(user.id, user);
        return user;
      }
    },
    preferences: {
      async findByUserId(userId) {
        return preferences.get(userId) ?? null;
      },
      async upsert(input) {
        preferences.set(input.userId, input);
        const user = users.get(input.userId);
        if (user) {
          users.set(input.userId, {
            ...user,
            onboardingCompleted: true,
            updatedAt: new Date().toISOString()
          });
        }
        return input;
      }
    }
  };
}

export function isDuplicateKey(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "23505");
}

export type PgQueryResult = QueryResult;
