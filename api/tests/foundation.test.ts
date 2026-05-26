import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createMemoryRepositories } from "../src/repositories.js";

function testApp() {
  const repositories = createMemoryRepositories();
  return createApp(repositories);
}

const validPreferences = {
  interests: ["food", "music"],
  activityPreferences: ["calm", "indoor"],
  budgetStyle: "low",
  socialStyle: "couple",
  favoriteCategories: ["cafes", "movies"]
};

async function register(app = testApp()) {
  const response = await request(app).post("/api/v1/auth/register").send({
    email: "ana@example.com",
    name: "Ana Orbit",
    password: "password123"
  });
  return { app, token: response.body.data.token as string };
}

describe("orbit foundation api", () => {
  it("returns health status", async () => {
    const response = await request(testApp()).get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { status: "ok" },
      error: null
    });
  });

  it("registers users and rejects duplicate emails", async () => {
    const app = testApp();
    const first = await request(app).post("/api/v1/auth/register").send({
      email: "ana@example.com",
      name: "Ana Orbit",
      password: "password123"
    });
    const duplicate = await request(app).post("/api/v1/auth/register").send({
      email: "ana@example.com",
      name: "Ana Again",
      password: "password123"
    });

    expect(first.status).toBe(201);
    expect(first.body.data.user.email).toBe("ana@example.com");
    expect(first.body.data.token).toBeTruthy();
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe("EMAIL_EXISTS");
  });

  it("logs in users and hides invalid credential details", async () => {
    const { app } = await register();

    const login = await request(app).post("/api/v1/auth/login").send({
      email: "ana@example.com",
      password: "password123"
    });
    const invalid = await request(app).post("/api/v1/auth/login").send({
      email: "ana@example.com",
      password: "wrong"
    });

    expect(login.status).toBe(200);
    expect(login.body.data.token).toBeTruthy();
    expect(invalid.status).toBe(401);
    expect(invalid.body.error.message).toBe("Invalid email or password");
  });

  it("protects authenticated endpoints", async () => {
    const { app, token } = await register();

    const missing = await request(app).get("/api/v1/me");
    const valid = await request(app).get("/api/v1/me").set("Authorization", `Bearer ${token}`);

    expect(missing.status).toBe(401);
    expect(missing.body.error.code).toBe("UNAUTHORIZED");
    expect(valid.status).toBe(200);
    expect(valid.body.data.user.email).toBe("ana@example.com");
  });

  it("validates and completes onboarding preferences", async () => {
    const { app, token } = await register();

    const invalid = await request(app)
      .post("/api/v1/onboarding")
      .set("Authorization", `Bearer ${token}`)
      .send({ interests: [] });
    const complete = await request(app)
      .post("/api/v1/onboarding")
      .set("Authorization", `Bearer ${token}`)
      .send(validPreferences);

    expect(invalid.status).toBe(400);
    expect(complete.status).toBe(200);
    expect(complete.body.data.user.onboardingCompleted).toBe(true);
    expect(complete.body.data.preferences.budgetStyle).toBe("low");
  });

  it("loads and updates profile preferences", async () => {
    const { app, token } = await register();

    await request(app)
      .post("/api/v1/onboarding")
      .set("Authorization", `Bearer ${token}`)
      .send(validPreferences);

    const profile = await request(app).get("/api/v1/me").set("Authorization", `Bearer ${token}`);
    const updated = await request(app)
      .put("/api/v1/profile/preferences")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...validPreferences, budgetStyle: "medium" });

    expect(profile.body.data.placeholders.savedPlaces).toContain("Saved places");
    expect(updated.status).toBe(200);
    expect(updated.body.data.preferences.budgetStyle).toBe("medium");
  });
});
