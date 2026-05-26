import { z } from "zod";
import { AppError } from "./shared.js";
import type { PreferencesRecord, PreferencesRepository, UserRepository } from "./repositories.js";
import { toAuthUser } from "./auth.js";

export const preferencesSchema = z.object({
  interests: z.array(z.string().min(1)).min(1),
  activityPreferences: z.array(z.string().min(1)).min(1),
  budgetStyle: z.string().min(1),
  socialStyle: z.string().min(1),
  favoriteCategories: z.array(z.string().min(1)).min(1)
});

export type ProfileResult = {
  user: ReturnType<typeof toAuthUser>;
  preferences: Omit<PreferencesRecord, "userId"> | null;
  placeholders: {
    activityHistory: string;
    savedPlaces: string;
    favoritePlans: string;
    recommendationTuning: string;
  };
};

const placeholders = {
  activityHistory: "Activity history will appear after personalized plans are generated.",
  savedPlaces: "Saved places arrive with the personalization phase.",
  favoritePlans: "Favorite plans arrive with the personalization phase.",
  recommendationTuning: "Recommendation tuning arrives after learning signals exist."
};

function publicPreferences(record: PreferencesRecord | null) {
  if (!record) return null;
  return {
    interests: record.interests,
    activityPreferences: record.activityPreferences,
    budgetStyle: record.budgetStyle,
    socialStyle: record.socialStyle,
    favoriteCategories: record.favoriteCategories
  };
}

export function createProfileService(users: UserRepository, preferences: PreferencesRepository) {
  return {
    async getProfile(userId: string): Promise<ProfileResult> {
      const user = await users.findById(userId);
      if (!user) throw new AppError(404, "USER_NOT_FOUND", "User not found");
      const storedPreferences = await preferences.findByUserId(userId);
      return {
        user: toAuthUser(user),
        preferences: publicPreferences(storedPreferences),
        placeholders
      };
    },
    async savePreferences(userId: string, input: z.infer<typeof preferencesSchema>) {
      await preferences.upsert({ userId, ...input });
      return this.getProfile(userId);
    }
  };
}
