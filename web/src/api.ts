export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: { code: string; message: string; details?: unknown } | null;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  onboardingCompleted: boolean;
};

export type Preferences = {
  interests: string[];
  activityPreferences: string[];
  budgetStyle: string;
  socialStyle: string;
  favoriteCategories: string[];
};

export type Profile = {
  user: AuthUser;
  preferences: Preferences | null;
  placeholders: Record<string, string>;
};

export type PlanContext = {
  locale: "es" | "en";
  location: string;
  budgetCents: number;
  availableMinutes: number;
  mood: string;
  energyLevel: "low" | "medium" | "high";
  groupSize: number;
  indoorOutdoorPreference: "indoor" | "outdoor" | "either";
  interests: string[];
};

export type PlanActivity = {
  order: number;
  title: string;
  category: string;
  estimatedCostCents: number;
  estimatedDurationMinutes: number;
  locationLabel: string;
  distanceLabel: string;
  matchExplanation: string;
};

export type PlanResult = {
  id?: string;
  requestId?: string;
  title: string;
  summary: string;
  totalEstimatedCostCents: number;
  totalEstimatedDurationMinutes: number;
  generatedAt: string;
  source: "ai" | "fallback";
  constraints: {
    withinBudget: boolean;
    withinTime: boolean;
  };
  activities: PlanActivity[];
};

export type StoredPlan = {
  id: string;
  requestId: string;
  userId: string;
  context: PlanContext;
  result: PlanResult;
  createdAt: string;
};

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const body = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "Orbit request failed");
  }
  return body.data;
}

export const api = {
  register(input: { email: string; name: string; password: string }) {
    return request<{ token: string; user: AuthUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },
  login(input: { email: string; password: string }) {
    return request<{ token: string; user: AuthUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },
  me(token: string) {
    return request<Profile>("/me", {}, token);
  },
  saveOnboarding(token: string, input: Preferences) {
    return request<Profile>(
      "/onboarding",
      {
        method: "POST",
        body: JSON.stringify(input)
      },
      token
    );
  },
  updatePreferences(token: string, input: Preferences) {
    return request<Profile>(
      "/profile/preferences",
      {
        method: "PUT",
        body: JSON.stringify(input)
      },
      token
    );
  },
  generatePlan(token: string, input: PlanContext) {
    return request<StoredPlan>(
      "/plans/generate",
      {
        method: "POST",
        body: JSON.stringify(input)
      },
      token
    );
  },
  getPlan(token: string, planId: string) {
    return request<StoredPlan>(`/plans/${planId}`, {}, token);
  }
};
