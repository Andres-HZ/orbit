import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { AppError } from "./shared.js";
import { isDuplicateKey, type UserRecord, type UserRepository } from "./repositories.js";

const jwtSecret = process.env.JWT_SECRET ?? "dev-only-orbit-secret";
const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? "1h";

export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  onboardingCompleted: boolean;
};

export type AuthResult = {
  token: string;
  user: AuthUser;
};

export function toAuthUser(user: UserRecord): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    onboardingCompleted: user.onboardingCompleted
  };
}

export function signToken(user: UserRecord) {
  return jwt.sign({ sub: user.id, email: user.email }, jwtSecret, {
    expiresIn: jwtExpiresIn
  } as jwt.SignOptions);
}

export function verifyToken(token: string): { sub: string; email: string } {
  try {
    return jwt.verify(token, jwtSecret) as { sub: string; email: string };
  } catch {
    throw new AppError(401, "UNAUTHORIZED", "Invalid or expired token");
  }
}

export function createAuthService(users: UserRepository) {
  return {
    async register(input: z.infer<typeof registerSchema>): Promise<AuthResult> {
      const existing = await users.findByEmail(input.email);
      if (existing) {
        throw new AppError(409, "EMAIL_EXISTS", "Email is already registered");
      }

      const passwordHash = await bcrypt.hash(input.password, 12);
      try {
        const user = await users.create({ ...input, passwordHash });
        return { token: signToken(user), user: toAuthUser(user) };
      } catch (error) {
        if (isDuplicateKey(error)) {
          throw new AppError(409, "EMAIL_EXISTS", "Email is already registered");
        }
        throw error;
      }
    },
    async login(input: z.infer<typeof loginSchema>): Promise<AuthResult> {
      const user = await users.findByEmail(input.email);
      const validPassword = user ? await bcrypt.compare(input.password, user.passwordHash) : false;

      if (!user || !validPassword) {
        throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
      }

      return { token: signToken(user), user: toAuthUser(user) };
    }
  };
}
