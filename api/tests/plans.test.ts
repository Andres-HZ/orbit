import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createMemoryRepositories } from "../src/repositories.js";

function testApp() {
  return createApp(createMemoryRepositories());
}

const preferences = {
  interests: ["food", "music"],
  activityPreferences: ["calm", "indoor"],
  budgetStyle: "low",
  socialStyle: "couple",
  favoriteCategories: ["cafes", "movies"]
};

const planContext = {
  locale: "es",
  location: "Medellin",
  budgetCents: 120000,
  availableMinutes: 180,
  mood: "Cozy",
  energyLevel: "medium",
  groupSize: 2,
  indoorOutdoorPreference: "indoor",
  interests: ["food", "culture"]
};

async function onboardedUser() {
  const app = testApp();
  const register = await request(app).post("/api/v1/auth/register").send({
    email: "planner@example.com",
    name: "Planner User",
    password: "password123"
  });
  const token = register.body.data.token as string;
  await request(app).post("/api/v1/onboarding").set("Authorization", `Bearer ${token}`).send(preferences);
  return { app, token };
}

describe("plan generator api", () => {
  it("generates and persists a fallback plan from valid context", async () => {
    const { app, token } = await onboardedUser();

    const response = await request(app)
      .post("/api/v1/plans/generate")
      .set("Authorization", `Bearer ${token}`)
      .send(planContext);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.result.activities.length).toBeGreaterThan(0);
    expect(response.body.data.result.source).toBe("fallback");
    expect(response.body.data.result.title).toContain("Plan tranquilo por Medellin");
    expect(response.body.data.result.activities[0].matchExplanation).toContain("Empieza suave");
    expect(response.body.data.result.constraints.withinBudget).toBe(true);
    expect(response.body.data.result.constraints.withinTime).toBe(true);
    expect(response.body.data.enrichedContext.storedPreferences.interests).toContain("food");
  });

  it("rejects missing required planning context", async () => {
    const { app, token } = await onboardedUser();

    const response = await request(app)
      .post("/api/v1/plans/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({ location: "Medellin" });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("reads a generated plan by id", async () => {
    const { app, token } = await onboardedUser();
    const generated = await request(app)
      .post("/api/v1/plans/generate")
      .set("Authorization", `Bearer ${token}`)
      .send(planContext);

    const response = await request(app)
      .get(`/api/v1/plans/${generated.body.data.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(generated.body.data.id);
    expect(response.body.data.result.title).toContain("Plan tranquilo");
  });

  it("keeps generated plan inside budget and time constraints", async () => {
    const { app, token } = await onboardedUser();
    const response = await request(app)
      .post("/api/v1/plans/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...planContext, budgetCents: 30000, availableMinutes: 90 });

    expect(response.body.data.result.totalEstimatedCostCents).toBeLessThanOrEqual(30000);
    expect(response.body.data.result.totalEstimatedDurationMinutes).toBeLessThanOrEqual(90);
  });

  it("requires authentication for plan generation", async () => {
    const response = await request(testApp()).post("/api/v1/plans/generate").send(planContext);

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });
});
