import { randomUUID } from "node:crypto";
import { z } from "zod";
import { query } from "./db.js";
import { locationContextSchema, nearbyExperienceSchema, weatherContextSchema } from "./nearby.js";
import type { PreferencesRepository, PreferencesRecord } from "./repositories.js";
import { AppError } from "./shared.js";

export const planContextSchema = z.object({
  locale: z.enum(["es", "en"]).default("es"),
  location: z.string().min(2),
  budgetCents: z.number().int().min(0),
  availableMinutes: z.number().int().min(30).max(720),
  mood: z.string().min(1),
  energyLevel: z.enum(["low", "medium", "high"]),
  groupSize: z.number().int().min(1).max(20),
  indoorOutdoorPreference: z.enum(["indoor", "outdoor", "either"]),
  interests: z.array(z.string().min(1)).min(1),
  locationContext: locationContextSchema.optional(),
  weatherContext: weatherContextSchema.optional(),
  nearbyExperiences: z.array(nearbyExperienceSchema).optional()
});

export type PlanContext = z.infer<typeof planContextSchema>;
type PlanLocale = PlanContext["locale"];
type PlanMode = "manual" | "surprise";

export const surprisePlanSchema = z.object({
  locale: z.enum(["es", "en"]).default("es"),
  mood: z.string().min(1).optional(),
  location: z.string().min(2).optional(),
  budgetCents: z.number().int().min(0).optional(),
  availableMinutes: z.number().int().min(30).max(720).optional()
});

export type SurprisePlanInput = z.infer<typeof surprisePlanSchema>;

export type EnrichedPlanContext = PlanContext & {
  storedPreferences: PreferencesRecord | null;
};

export type PlanActivity = {
  order: number;
  title: string;
  category: string;
  estimatedCostCents: number;
  estimatedDurationMinutes: number;
  locationLabel: string;
  distanceLabel: string;
  mapUrl?: string;
  providerSource?: string;
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
  metadata?: {
    mode: PlanMode;
    defaultsApplied?: string[];
    contextSummary?: string[];
  };
  activities: PlanActivity[];
};

export type StoredPlan = {
  id: string;
  requestId: string;
  userId: string;
  source: PlanMode;
  context: PlanContext;
  enrichedContext: EnrichedPlanContext;
  result: PlanResult;
  createdAt: string;
};

export type PlanRepository = {
  create(input: {
    userId: string;
    context: PlanContext;
    enrichedContext: EnrichedPlanContext;
    result: PlanResult;
    source: PlanMode;
  }): Promise<StoredPlan>;
  findById(userId: string, planId: string): Promise<StoredPlan | null>;
};

function mapStoredPlan(row: Record<string, unknown>): StoredPlan {
  const result = row.result as PlanResult;
  return {
    id: String(row.id),
    requestId: String(row.request_id),
    userId: String(row.user_id),
    source: (row.source as PlanMode | undefined) ?? "manual",
    context: row.context as PlanContext,
    enrichedContext: row.enriched_context as EnrichedPlanContext,
    result: {
      ...result,
      id: String(row.id),
      requestId: String(row.request_id)
    },
    createdAt: new Date(String(row.created_at)).toISOString()
  };
}

export const pgPlans: PlanRepository = {
  async create(input) {
    const requestResult = await query(
      `INSERT INTO plan_requests (user_id, context, enriched_context, source)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        input.userId,
        JSON.stringify(input.context),
        JSON.stringify(input.enrichedContext),
        input.source
      ]
    );
    const request = requestResult.rows[0] as Record<string, unknown>;
    const resultWithIds = {
      ...input.result,
      requestId: String(request.id)
    };
    const result = await query(
      `INSERT INTO plan_results (request_id, user_id, result)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [request.id, input.userId, JSON.stringify(resultWithIds)]
    );

    return mapStoredPlan({
      ...(result.rows[0] as Record<string, unknown>),
      context: request.context,
      enriched_context: request.enriched_context,
      source: request.source
    });
  },
  async findById(userId, planId) {
    const result = await query(
      `SELECT pr.context, pr.enriched_context, pr.source, res.*
       FROM plan_results res
       JOIN plan_requests pr ON pr.id = res.request_id
       WHERE res.user_id = $1 AND res.id = $2`,
      [userId, planId]
    );

    return result.rowCount ? mapStoredPlan(result.rows[0] as Record<string, unknown>) : null;
  }
};

export function createMemoryPlanRepository(): PlanRepository {
  const plans = new Map<string, StoredPlan>();

  return {
    async create(input) {
      const id = randomUUID();
      const requestId = randomUUID();
      const createdAt = new Date().toISOString();
      const stored: StoredPlan = {
        id,
        requestId,
        userId: input.userId,
        source: input.source,
        context: input.context,
        enrichedContext: input.enrichedContext,
        result: {
          ...input.result,
          id,
          requestId
        },
        createdAt
      };
      plans.set(id, stored);
      return stored;
    },
    async findById(userId, planId) {
      const plan = plans.get(planId);
      return plan?.userId === userId ? plan : null;
    }
  };
}

export type AIService = {
  generatePlan(context: EnrichedPlanContext): Promise<PlanResult | null>;
};

export function createClaudeAIService(): AIService {
  return {
    async generatePlan(context) {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) return null;

      const language = context.locale === "es" ? "Spanish" : "English";
      const prompt = `Generate one JSON activity plan for Orbit in ${language}. Use this context: ${JSON.stringify(
        context
      )}. Return only JSON with title, summary, activities[]. Do not invent live web search results, addresses, or real-time availability.`;

      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model: process.env.AI_MODEL ?? "claude-sonnet-4-20250514",
            max_tokens: 900,
            messages: [{ role: "user", content: prompt }]
          })
        });
        if (!response.ok) return null;
        const data = (await response.json()) as {
          content?: Array<{ type: string; text?: string }>;
        };
        const text = data.content?.find((item) => item.type === "text")?.text;
        if (!text) return null;
        return normalizePlanResult(JSON.parse(text), context, "ai");
      } catch {
        return null;
      }
    }
  };
}

export function fallbackPlan(context: EnrichedPlanContext): PlanResult {
  const text = fallbackCopy(context.locale);
  const indoor = context.indoorOutdoorPreference === "indoor";
  const interest = context.interests[0] ?? context.storedPreferences?.interests[0] ?? "food";
  const location = context.location;
  const budget = Math.max(context.budgetCents, 0);
  const minutes = Math.max(context.availableMinutes, 30);
  const costParts = splitBudget(budget);
  const durationParts = splitDuration(minutes);
  const vibe = text.mood(context.mood);
  const nearby = context.nearbyExperiences ?? [];

  const activities: PlanActivity[] = [
    {
      order: 1,
      title: nearby[0]?.title ?? (indoor ? text.warmUpIndoor : text.warmUpOutdoor),
      category: text.category(nearby[0]?.category ?? interest),
      estimatedCostCents: costParts[0],
      estimatedDurationMinutes: durationParts[0],
      locationLabel: nearby[0]?.locationLabel ?? text.locationArea(location),
      distanceLabel: nearby[0]?.distanceLabel ?? text.nearby,
      mapUrl: nearby[0]?.mapUrl,
      providerSource: nearby[0]?.source,
      matchExplanation: text.warmUpReason(vibe)
    },
    {
      order: 2,
      title: nearby[1]?.title ?? (indoor ? text.mainIndoor : text.mainOutdoor),
      category: nearby[1]?.category
        ? text.category(nearby[1].category)
        : context.energyLevel === "high"
          ? text.category("active")
          : text.category("experience"),
      estimatedCostCents: costParts[1],
      estimatedDurationMinutes: durationParts[1],
      locationLabel: nearby[1]?.locationLabel ?? text.recommendedZone(location),
      distanceLabel: nearby[1]?.distanceLabel ?? text.localRange,
      mapUrl: nearby[1]?.mapUrl,
      providerSource: nearby[1]?.source,
      matchExplanation: text.mainReason(context.energyLevel, context.groupSize)
    },
    {
      order: 3,
      title: nearby[2]?.title ?? text.closingStop,
      category: text.category(nearby[2]?.category ?? "food"),
      estimatedCostCents: costParts[2],
      estimatedDurationMinutes: durationParts[2],
      locationLabel: nearby[2]?.locationLabel ?? text.locationNearby(location),
      distanceLabel: nearby[2]?.distanceLabel ?? text.shortTransfer,
      mapUrl: nearby[2]?.mapUrl,
      providerSource: nearby[2]?.source,
      matchExplanation: text.closingReason
    }
  ];

  return normalizePlanResult(
    {
      title: text.title(vibe, location),
      summary: text.summary(minutes, context.groupSize, text.category(interest)),
      activities
    },
    context,
    "fallback"
  );
}

function fallbackCopy(locale: PlanLocale) {
  const categories: Record<string, string> =
    locale === "es"
      ? {
      activity: "actividad",
      active: "activo",
          coffee: "café",
          culture: "cultura",
      event: "evento",
          experience: "experiencia",
          food: "comida",
          music: "música",
      nature: "naturaleza",
      nightlife: "vida nocturna",
      park: "parque",
      restaurant: "restaurante"
        }
      : {
          activity: "activity",
          active: "active",
          coffee: "coffee",
          culture: "culture",
          event: "event",
          experience: "experience",
          food: "food",
          music: "music",
          nature: "nature",
          nightlife: "nightlife",
          park: "park",
          restaurant: "restaurant"
        };

  const moods: Record<string, string> =
    locale === "es"
      ? { Curious: "curioso", Cozy: "tranquilo", Active: "activo", Romantic: "romántico" }
      : { Curious: "curious", Cozy: "cozy", Active: "active", Romantic: "romantic" };

  if (locale === "es") {
    return {
      warmUpIndoor: "Café inicial y chequeo de mood",
      warmUpOutdoor: "Caminata corta para descubrir la zona",
      mainIndoor: "Experiencia principal bajo techo",
      mainOutdoor: "Experiencia principal al aire libre",
      closingStop: "Cierre simple y flexible",
      nearby: "Cerca",
      localRange: "Dentro del rango local",
      shortTransfer: "Traslado corto",
      closingReason: "Cierra con una opción flexible para que el plan siga dentro de tu tiempo y presupuesto.",
      category: (value: string) => categories[value] ?? value,
      mood: (value: string) => moods[value] ?? value.toLowerCase(),
      locationArea: (value: string) => `Zona de ${value}`,
      locationNearby: (value: string) => `Cerca de ${value}`,
      recommendedZone: (value: string) => `Zona recomendada de ${value}`,
      warmUpReason: (vibe: string) =>
        `Empieza suave para un mood ${vibe} y mantiene el plan fácil de seguir.`,
      mainReason: (energy: string, groupSize: number) =>
        `Encaja con energía ${energy}, ${groupSize} persona(s) y tus preferencias guardadas.`,
      title: (vibe: string, location: string) => `Plan ${vibe} por ${location}`,
      summary: (minutes: number, groupSize: number, interest: string) =>
        `Un plan de ${minutes} minutos para ${groupSize} persona(s) que balancea ${interest}, presupuesto y energía.`
    };
  }

  return {
    warmUpIndoor: "Warm-up coffee and mood check",
    warmUpOutdoor: "Short neighborhood discovery walk",
    mainIndoor: "Main indoor experience",
    mainOutdoor: "Main outdoor experience",
    closingStop: "Simple closing stop",
    nearby: "Nearby",
    localRange: "Within local range",
    shortTransfer: "Short transfer",
    closingReason: "Ends with a flexible option so the plan still fits your time and budget.",
    category: (value: string) => categories[value] ?? value,
    mood: (value: string) => moods[value] ?? value.toLowerCase(),
    locationArea: (value: string) => `${value} area`,
    locationNearby: (value: string) => `${value} nearby`,
    recommendedZone: (value: string) => `${value} recommended zone`,
    warmUpReason: (vibe: string) =>
      `Starts easy for a ${vibe} mood and keeps the plan low-friction.`,
    mainReason: (energy: string, groupSize: number) =>
      `Matches ${energy} energy, ${groupSize} person(s), and your saved preferences.`,
    title: (vibe: string, location: string) => `${vibe} plan around ${location}`,
    summary: (minutes: number, groupSize: number, interest: string) =>
      `A ${minutes}-minute plan for ${groupSize} that balances ${interest}, budget, and energy.`
  };
}

function splitBudget(budgetCents: number): [number, number, number] {
  if (budgetCents <= 0) return [0, 0, 0];
  return [
    Math.floor(budgetCents * 0.25),
    Math.floor(budgetCents * 0.45),
    budgetCents - Math.floor(budgetCents * 0.25) - Math.floor(budgetCents * 0.45)
  ];
}

function splitDuration(minutes: number): [number, number, number] {
  const first = Math.max(15, Math.floor(minutes * 0.22));
  const second = Math.max(15, Math.floor(minutes * 0.55));
  return [first, second, Math.max(0, minutes - first - second)];
}

export function normalizePlanResult(
  raw: Partial<PlanResult>,
  context: PlanContext,
  source: "ai" | "fallback",
  metadata?: PlanResult["metadata"]
): PlanResult {
  const text = context.locale === "es"
    ? {
        activity: "Actividad",
        experience: "experiencia",
        nearby: "Cerca",
        explanation: "Encaja con tu contexto actual de planificación.",
        title: `Plan por ${context.location}`,
        summary: "Un plan personalizado de Orbit."
      }
    : {
        activity: "Activity",
        experience: "experience",
        nearby: "Nearby",
        explanation: "Matches your current planning context.",
        title: `Plan around ${context.location}`,
        summary: "A personalized Orbit plan."
      };
  const activities = (raw.activities ?? []).map((activity, index) => ({
    order: index + 1,
    title: activity.title || `${text.activity} ${index + 1}`,
    category: activity.category || text.experience,
    estimatedCostCents: Math.max(0, Math.floor(activity.estimatedCostCents ?? 0)),
    estimatedDurationMinutes: Math.max(0, Math.floor(activity.estimatedDurationMinutes ?? 0)),
    locationLabel: activity.locationLabel || context.location,
    distanceLabel: activity.distanceLabel || text.nearby,
    mapUrl: activity.mapUrl,
    providerSource: activity.providerSource,
    matchExplanation: activity.matchExplanation || text.explanation
  }));

  const totalCost = activities.reduce((sum, activity) => sum + activity.estimatedCostCents, 0);
  const totalDuration = activities.reduce(
    (sum, activity) => sum + activity.estimatedDurationMinutes,
    0
  );

  return {
    title: raw.title || text.title,
    summary: raw.summary || text.summary,
    totalEstimatedCostCents: totalCost,
    totalEstimatedDurationMinutes: totalDuration,
    generatedAt: new Date().toISOString(),
    source,
    constraints: {
      withinBudget: totalCost <= context.budgetCents,
      withinTime: totalDuration <= context.availableMinutes
    },
    metadata: metadata ?? raw.metadata,
    activities
  };
}

function budgetDefaultCents(preferences: PreferencesRecord | null) {
  if (preferences?.budgetStyle === "premium") return 25000000;
  if (preferences?.budgetStyle === "medium") return 15000000;
  return 8000000;
}

function groupSizeDefault(preferences: PreferencesRecord | null) {
  if (preferences?.socialStyle === "couple") return 2;
  if (preferences?.socialStyle === "friends" || preferences?.socialStyle === "family") return 4;
  return 1;
}

function energyDefault(preferences: PreferencesRecord | null): PlanContext["energyLevel"] {
  if (preferences?.activityPreferences.includes("active")) return "high";
  if (preferences?.activityPreferences.includes("calm")) return "low";
  return "medium";
}

function settingDefault(preferences: PreferencesRecord | null): PlanContext["indoorOutdoorPreference"] {
  if (preferences?.activityPreferences.includes("outdoor")) return "outdoor";
  if (preferences?.activityPreferences.includes("indoor")) return "indoor";
  return "either";
}

function deriveSurpriseContext(
  input: SurprisePlanInput,
  storedPreferences: PreferencesRecord | null
): { context: PlanContext; defaultsApplied: string[]; contextSummary: string[] } {
  const defaultsApplied: string[] = [];
  const interests = storedPreferences?.interests.length
    ? storedPreferences.interests
    : storedPreferences?.favoriteCategories.length
      ? storedPreferences.favoriteCategories
      : ["food"];

  if (!input.location) defaultsApplied.push("location");
  if (!input.mood) defaultsApplied.push("mood");
  if (input.budgetCents === undefined) defaultsApplied.push("budgetCents");
  if (input.availableMinutes === undefined) defaultsApplied.push("availableMinutes");

  const context: PlanContext = {
    locale: input.locale,
    location: input.location?.trim() || "Medellin",
    budgetCents: input.budgetCents ?? budgetDefaultCents(storedPreferences),
    availableMinutes: input.availableMinutes ?? 150,
    mood: input.mood ?? "Curious",
    energyLevel: energyDefault(storedPreferences),
    groupSize: groupSizeDefault(storedPreferences),
    indoorOutdoorPreference: settingDefault(storedPreferences),
    interests,
    locationContext: input.location
      ? undefined
      : {
          source: "manual",
          label: "Medellin",
          precision: "manual"
        }
  };

  return {
    context,
    defaultsApplied,
    contextSummary: [
      `mood:${context.mood}`,
      `budget:${context.budgetCents}`,
      `duration:${context.availableMinutes}`,
      `interests:${context.interests.join(",")}`
    ]
  };
}

export function createPlanService(
  preferences: PreferencesRepository,
  plans: PlanRepository,
  aiService: AIService = createClaudeAIService()
) {
  return {
    async generate(userId: string, context: PlanContext) {
      const storedPreferences = await preferences.findByUserId(userId);
      const enrichedContext: EnrichedPlanContext = {
        ...context,
        storedPreferences
      };
      const aiPlan = await aiService.generatePlan(enrichedContext);
      const result = aiPlan ?? fallbackPlan(enrichedContext);

      if (!result.activities.length) {
        throw new AppError(500, "PLAN_GENERATION_FAILED", "Could not generate a plan");
      }

      return plans.create({
        userId,
        context,
        enrichedContext,
        result: {
          ...result,
          metadata: {
            mode: "manual",
            ...result.metadata
          }
        },
        source: "manual"
      });
    },
    async generateSurprise(userId: string, input: SurprisePlanInput) {
      const storedPreferences = await preferences.findByUserId(userId);
      const { context, defaultsApplied, contextSummary } = deriveSurpriseContext(input, storedPreferences);
      const enrichedContext: EnrichedPlanContext = {
        ...context,
        storedPreferences
      };
      const aiPlan = await aiService.generatePlan(enrichedContext);
      const baseResult = aiPlan ?? fallbackPlan(enrichedContext);
      const result: PlanResult = {
        ...baseResult,
        metadata: {
          mode: "surprise",
          defaultsApplied,
          contextSummary
        }
      };

      if (!result.activities.length) {
        throw new AppError(500, "PLAN_GENERATION_FAILED", "Could not generate a plan");
      }

      return plans.create({
        userId,
        context,
        enrichedContext,
        result,
        source: "surprise"
      });
    },
    async findById(userId: string, planId: string) {
      const plan = await plans.findById(userId, planId);
      if (!plan) throw new AppError(404, "PLAN_NOT_FOUND", "Plan not found");
      return plan;
    }
  };
}
