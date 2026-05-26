import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";
import {
  createNearbyService,
  normalizeLocation,
  normalizeNearbyExperiences,
  type LocationContext,
  type NearbyProvider,
  type WeatherProvider
} from "../src/nearby.js";
import { createMemoryRepositories } from "../src/repositories.js";
import { AppError } from "../src/shared.js";

function testApp() {
  return createApp(createMemoryRepositories());
}

async function authToken() {
  const app = testApp();
  const register = await request(app).post("/api/v1/auth/register").send({
    email: "nearby@example.com",
    name: "Nearby User",
    password: "password123"
  });
  return { app, token: register.body.data.token as string };
}

const location: LocationContext = {
  source: "manual",
  label: "Laureles",
  precision: "manual"
};

describe("nearby context service", () => {
  it("normalizes browser and manual location input without requiring exact UI coordinates", () => {
    expect(normalizeLocation({ source: "manual", label: "Medellin" })).toMatchObject({
      source: "manual",
      label: "Medellin",
      precision: "manual"
    });
    expect(normalizeLocation({ source: "browser", latitude: 6.2442, longitude: -75.5812 })).toMatchObject({
      source: "browser",
      label: "Zona 6.24, -75.58",
      precision: "coarse"
    });
  });

  it("normalizes nearby provider results with missing optional fields", () => {
    const [experience] = normalizeNearbyExperiences(location, [{ title: "Cafe demo" }]);

    expect(experience).toMatchObject({
      category: "activity",
      title: "Cafe demo",
      placeName: "Cafe demo",
      locationLabel: "Laureles",
      source: "sample-places"
    });
    expect(experience.mapUrl).toContain("google.com/maps");
  });

  it("caches weather and nearby calls by coarse location window", async () => {
    const weatherProvider: WeatherProvider = {
      getWeather: vi.fn(async () => ({
        condition: "Agradable",
        temperatureCelsius: 24,
        suitability: "outdoor" as const,
        summary: "Buen clima",
        source: "test",
        updatedAt: new Date().toISOString()
      }))
    };
    const nearbyProvider: NearbyProvider = {
      discover: vi.fn(async () => normalizeNearbyExperiences(location, [{ title: "Parque demo" }]))
    };
    const service = createNearbyService({ weatherProvider, nearbyProvider });

    await service.getWeather(location);
    await service.getWeather(location);
    await service.discoverNearby(location);
    await service.discoverNearby(location);

    expect(weatherProvider.getWeather).toHaveBeenCalledTimes(1);
    expect(nearbyProvider.discover).toHaveBeenCalledTimes(1);
  });

  it("surfaces provider errors as unavailable responses", async () => {
    const service = createNearbyService({
      weatherProvider: {
        getWeather: async () => {
          throw new AppError(503, "WEATHER_UNAVAILABLE", "Weather provider unavailable");
        }
      }
    });

    await expect(service.getWeather(location)).rejects.toMatchObject({ code: "WEATHER_UNAVAILABLE" });
  });
});

describe("nearby context api", () => {
  it("resolves manual location, weather, and nearby experiences through authenticated endpoints", async () => {
    const { app, token } = await authToken();

    const resolved = await request(app)
      .post("/api/v1/location/resolve")
      .set("Authorization", `Bearer ${token}`)
      .send({ source: "manual", label: "Laureles" });
    const weather = await request(app)
      .post("/api/v1/weather/summary")
      .set("Authorization", `Bearer ${token}`)
      .send({ location: resolved.body.data });
    const nearby = await request(app)
      .post("/api/v1/nearby/discover")
      .set("Authorization", `Bearer ${token}`)
      .send({ location: resolved.body.data, categories: ["cafe", "park"] });

    expect(resolved.status).toBe(200);
    expect(weather.body.data.summary).toBeTruthy();
    expect(nearby.body.data).toHaveLength(2);
    expect(nearby.body.data[0].mapUrl).toContain("google.com/maps");
    expect(nearby.body.data[0].placeName).toBeTruthy();
    expect(nearby.body.data[0].openingHours).toBeTruthy();
    expect(nearby.body.data[0].description).toBeTruthy();
  });

  it("requires auth for location-aware endpoints", async () => {
    const response = await request(testApp())
      .post("/api/v1/nearby/discover")
      .send({ location });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });
});
