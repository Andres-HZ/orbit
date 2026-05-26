import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { AuthProvider } from "./auth";
import type { Profile } from "./api";
import { I18nProvider } from "./i18n";

const onboardedProfile: Profile = {
  user: {
    id: "user-1",
    email: "ana@example.com",
    name: "Ana Orbit",
    onboardingCompleted: true
  },
  preferences: {
    interests: ["food"],
    activityPreferences: ["calm"],
    budgetStyle: "low",
    socialStyle: "solo",
    favoriteCategories: ["cafes"]
  },
  placeholders: {
    activityHistory: "Activity history will appear after personalized plans are generated.",
    savedPlaces: "Saved places arrive with the personalization phase.",
    favoritePlans: "Favorite plans arrive with the personalization phase.",
    recommendationTuning: "Recommendation tuning arrives after learning signals exist."
  }
};

const notOnboardedProfile: Profile = {
  ...onboardedProfile,
  user: { ...onboardedProfile.user, onboardingCompleted: false },
  preferences: null
};

const storedPlan = {
  id: "plan-1",
  requestId: "request-1",
  userId: "user-1",
  source: "manual",
  context: {
    locale: "es",
    location: "Medellin",
    budgetCents: 120000,
    availableMinutes: 180,
    mood: "Cozy",
    energyLevel: "medium",
    groupSize: 2,
    indoorOutdoorPreference: "indoor",
    interests: ["food"]
  },
  result: {
    id: "plan-1",
    requestId: "request-1",
    title: "Plan tranquilo por Medellin",
    summary: "Un plan simple para hoy.",
    totalEstimatedCostCents: 90000,
    totalEstimatedDurationMinutes: 150,
    generatedAt: new Date().toISOString(),
    source: "fallback",
    constraints: { withinBudget: true, withinTime: true },
    activities: [
      {
        order: 1,
        title: "Café inicial y chequeo de mood",
        category: "comida",
        estimatedCostCents: 25000,
        estimatedDurationMinutes: 45,
        locationLabel: "Zona de Medellin",
        distanceLabel: "Cerca",
        mapUrl: "https://www.google.com/maps/search/cafe",
        providerSource: "sample-places",
        matchExplanation: "Encaja con tu mood tranquilo."
      }
    ]
  },
  createdAt: new Date().toISOString()
};

const surprisePlan = {
  ...storedPlan,
  id: "surprise-1",
  requestId: "surprise-request-1",
  source: "surprise",
  context: {
    ...storedPlan.context,
    mood: "Cozy",
    budgetCents: 8000000,
    availableMinutes: 150
  },
  result: {
    ...storedPlan.result,
    id: "surprise-1",
    requestId: "surprise-request-1",
    title: "Plan sorpresa por Medellin",
    summary: "Una ruta espontánea para hoy.",
    metadata: {
      mode: "surprise",
      defaultsApplied: ["budgetCents", "availableMinutes"],
      contextSummary: ["mood:Cozy"]
    }
  }
};

function renderApp(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <I18nProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </I18nProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("Orbit web foundation", () => {
  it("redirects protected routes to login", async () => {
    renderApp("/home");

    expect(await screen.findByRole("heading", { name: /bienvenido de nuevo/i })).toBeInTheDocument();
  });

  it("restores a valid session and renders home", async () => {
    localStorage.setItem("orbit.token", "valid-token");
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: onboardedProfile, error: null })
    } as Response);

    renderApp("/home");

    expect(await screen.findByText(/qué quieres hacer hoy/i)).toBeInTheDocument();
    expect(screen.getByText(/mood rápido/i)).toBeInTheDocument();
  });

  it("gates authenticated users without onboarding", async () => {
    localStorage.setItem("orbit.token", "valid-token");
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: notOnboardedProfile, error: null })
    } as Response);

    renderApp("/home");

    expect(await screen.findByRole("heading", { name: /cuéntanos tu vibra base/i })).toBeInTheDocument();
  });

  it("completes onboarding for a newly registered user without reloading", async () => {
    const onboardedAfterSave: Profile = {
      ...onboardedProfile,
      user: { ...onboardedProfile.user, onboardingCompleted: true }
    };
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/auth/register")) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: { token: "new-token", user: notOnboardedProfile.user },
            error: null
          })
        } as Response;
      }
      if (url.includes("/onboarding")) {
        return {
          ok: true,
          json: async () => ({ success: true, data: onboardedAfterSave, error: null })
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({ success: true, data: notOnboardedProfile, error: null })
      } as Response;
    });

    renderApp("/register");
    await userEvent.click(await screen.findByRole("button", { name: /crear cuenta/i }));
    await userEvent.click(await screen.findByRole("button", { name: /terminar onboarding/i }));

    expect(await screen.findByRole("heading", { name: /qué quieres hacer hoy/i })).toBeInTheDocument();
    const onboardingCall = vi.mocked(globalThis.fetch).mock.calls.find(([input]) =>
      String(input).includes("/onboarding")
    );
    expect(onboardingCall?.[1]?.method).toBe("POST");
  });

  it("renders profile placeholders for future features", async () => {
    localStorage.setItem("orbit.token", "valid-token");
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: onboardedProfile, error: null })
    } as Response);

    renderApp("/profile");

    expect(await screen.findByRole("heading", { name: /ana orbit/i })).toBeInTheDocument();
    expect(screen.getByText(/los lugares guardados llegan/i)).toBeInTheDocument();
  });

  it("renders profile preferences as icon selection controls", async () => {
    localStorage.setItem("orbit.token", "valid-token");
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: onboardedProfile, error: null })
    } as Response);

    renderApp("/profile");

    const food = await screen.findByRole("button", { name: /comida/i });
    const music = screen.getByRole("button", { name: /música/i });

    expect(food).toHaveAttribute("aria-pressed", "true");
    expect(music).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(music);

    expect(music).toHaveAttribute("aria-pressed", "true");
  });

  it("stores dashboard mood selection in client state", async () => {
    localStorage.setItem("orbit.token", "valid-token");
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: onboardedProfile, error: null })
    } as Response);

    renderApp("/home");
    await screen.findByText(/mood actual: curioso/i);
    await userEvent.click(screen.getByRole("button", { name: "Cómodo" }));

    await waitFor(() => expect(screen.getByText(/mood actual: cómodo/i)).toBeInTheDocument());
  });

  it("opens the plan context flow from the dashboard", async () => {
    localStorage.setItem("orbit.token", "valid-token");
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: onboardedProfile, error: null })
    } as Response);

    renderApp("/home");
    await userEvent.click(await screen.findByRole("button", { name: /empezar plan/i }));

    expect(await screen.findByRole("heading", { name: /diseñemos un plan/i })).toBeInTheDocument();
    expect(screen.getByText(/ubicación/i)).toBeInTheDocument();
  });

  it("shows plan context validation errors", async () => {
    localStorage.setItem("orbit.token", "valid-token");
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: onboardedProfile, error: null })
    } as Response);

    renderApp("/plans/new");
    const locationInput = await screen.findByDisplayValue("Medellin");
    await userEvent.clear(locationInput);
    await userEvent.click(screen.getByRole("button", { name: /generar plan/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/completa ubicación/i);
  });

  it("generates and renders plan results", async () => {
    localStorage.setItem("orbit.token", "valid-token");
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/plans/generate")) {
        return {
          ok: true,
          json: async () => ({ success: true, data: storedPlan, error: null })
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({ success: true, data: onboardedProfile, error: null })
      } as Response;
    });

    renderApp("/plans/new");
    await userEvent.click(await screen.findByRole("button", { name: /generar plan/i }));

    expect(await screen.findByRole("heading", { name: /plan tranquilo por medellin/i })).toBeInTheDocument();
    expect(screen.getByText(/encaja con tu mood tranquilo/i)).toBeInTheDocument();
    const generateCall = vi.mocked(globalThis.fetch).mock.calls.find(([input]) =>
      String(input).includes("/plans/generate")
    );
    expect(JSON.parse(String(generateCall?.[1]?.body))).toMatchObject({ locale: "es" });
  });

  it("loads manual location context with weather and nearby cards", async () => {
    localStorage.setItem("orbit.token", "valid-token");
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/location/resolve")) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: { source: "manual", label: "Laureles", precision: "manual" },
            error: null
          })
        } as Response;
      }
      if (url.includes("/weather/summary")) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: {
              condition: "Agradable",
              temperatureCelsius: 24,
              suitability: "outdoor",
              summary: "Buen clima para caminar.",
              source: "sample-weather",
              updatedAt: new Date().toISOString()
            },
            error: null
          })
        } as Response;
      }
      if (url.includes("/nearby/discover")) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: [
              {
                id: "nearby-1",
                category: "cafe",
                title: "Café tranquilo",
                placeName: "Café Nube",
                description: "Un lugar cómodo para conversar sin ruido.",
                locationLabel: "Café tranquilo, Laureles",
                address: "Carrera 70 #10",
                distanceLabel: "5 min",
                openingHours: "8:00 AM - 8:00 PM",
                rating: 4.7,
                popularityLabel: "Ideal para conversar",
                priceLabel: "$",
                tags: ["café", "tranquilo"],
                source: "sample-places",
                mapUrl: "https://www.google.com/maps/search/cafe"
              }
            ],
            error: null
          })
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({ success: true, data: onboardedProfile, error: null })
      } as Response;
    });

    renderApp("/home");
    const locationInput = await screen.findByDisplayValue("Medellin");
    await userEvent.clear(locationInput);
    await userEvent.type(locationInput, "Laureles");
    await userEvent.click(screen.getByRole("button", { name: /usar esta zona/i }));

    expect(await screen.findByText(/ubicación activa: laureles/i)).toBeInTheDocument();
    expect(screen.getByText(/24°C/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /café nube/i })).toBeInTheDocument();
    expect(screen.getByText(/un lugar cómodo para conversar/i)).toBeInTheDocument();
    expect(screen.getByText(/horario: 8:00 am - 8:00 pm/i)).toBeInTheDocument();
    expect(screen.getByText("tranquilo")).toBeInTheDocument();
  });

  it("shows manual fallback guidance when browser location is unavailable", async () => {
    localStorage.setItem("orbit.token", "valid-token");
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: onboardedProfile, error: null })
    } as Response);
    const originalGeolocation = navigator.geolocation;
    Object.defineProperty(navigator, "geolocation", { configurable: true, value: undefined });

    renderApp("/home");
    await userEvent.click(await screen.findByRole("button", { name: /usar mi ubicación/i }));

    expect(await screen.findByRole("status")).toHaveTextContent(/puedes escribir ciudad o barrio/i);
    Object.defineProperty(navigator, "geolocation", { configurable: true, value: originalGeolocation });
  });

  it("keeps dashboard actions usable when nearby provider fails", async () => {
    localStorage.setItem("orbit.token", "valid-token");
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/location/resolve")) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: { source: "manual", label: "Laureles", precision: "manual" },
            error: null
          })
        } as Response;
      }
      if (url.includes("/weather/summary")) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: {
              condition: "Agradable",
              temperatureCelsius: 24,
              suitability: "outdoor",
              summary: "Buen clima para caminar.",
              source: "sample-weather",
              updatedAt: new Date().toISOString()
            },
            error: null
          })
        } as Response;
      }
      if (url.includes("/nearby/discover")) {
        return {
          ok: false,
          json: async () => ({
            success: false,
            data: null,
            error: { code: "NEARBY_UNAVAILABLE", message: "Nearby no disponible" }
          })
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({ success: true, data: onboardedProfile, error: null })
      } as Response;
    });

    renderApp("/home");
    await userEvent.click(await screen.findByRole("button", { name: /usar esta zona/i }));

    expect(await screen.findByRole("status")).toHaveTextContent(/nearby no disponible/i);
    expect(screen.getByRole("button", { name: /empezar plan/i })).toBeEnabled();
  });

  it("sends nearby context into plan generation and renders map actions", async () => {
    localStorage.setItem("orbit.token", "valid-token");
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/location/resolve")) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: { source: "manual", label: "Laureles", precision: "manual" },
            error: null
          })
        } as Response;
      }
      if (url.includes("/weather/summary")) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: {
              condition: "Agradable",
              temperatureCelsius: 24,
              suitability: "outdoor",
              summary: "Buen clima para caminar.",
              source: "sample-weather",
              updatedAt: new Date().toISOString()
            },
            error: null
          })
        } as Response;
      }
      if (url.includes("/nearby/discover")) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: [
              {
                id: "nearby-1",
                category: "cafe",
                title: "Café tranquilo",
                placeName: "Café Nube",
                description: "Un lugar cómodo para conversar sin ruido.",
                locationLabel: "Café tranquilo, Laureles",
                address: "Carrera 70 #10",
                distanceLabel: "5 min",
                openingHours: "8:00 AM - 8:00 PM",
                rating: 4.7,
                popularityLabel: "Ideal para conversar",
                priceLabel: "$",
                tags: ["café", "tranquilo"],
                source: "sample-places",
                mapUrl: "https://www.google.com/maps/search/cafe"
              }
            ],
            error: null
          })
        } as Response;
      }
      if (url.includes("/plans/generate")) {
        return {
          ok: true,
          json: async () => ({ success: true, data: storedPlan, error: null })
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({ success: true, data: onboardedProfile, error: null })
      } as Response;
    });

    renderApp("/home");
    await userEvent.click(await screen.findByRole("button", { name: /usar esta zona/i }));
    await userEvent.click(screen.getByRole("button", { name: /empezar plan/i }));
    await userEvent.click(await screen.findByRole("button", { name: /generar plan/i }));

    expect(await screen.findByRole("heading", { name: /plan tranquilo por medellin/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /abrir mapa/i })).toHaveAttribute("href", storedPlan.result.activities[0].mapUrl);
    const generateCall = vi.mocked(globalThis.fetch).mock.calls.find(([input]) =>
      String(input).includes("/plans/generate")
    );
    expect(JSON.parse(String(generateCall?.[1]?.body))).toMatchObject({
      locale: "es",
      location: "Laureles",
      weatherContext: { condition: "Agradable" },
      nearbyExperiences: [{ title: "Café tranquilo" }]
    });
  });

  it("starts Surprise Me from the dashboard, shows loading, and renders surprise metadata", async () => {
    localStorage.setItem("orbit.token", "valid-token");
    let resolveSurprise!: (response: Response) => void;
    const pendingSurprise = new Promise<Response>((resolve) => {
      resolveSurprise = resolve;
    });
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/plans/surprise")) {
        return pendingSurprise;
      }
      return {
        ok: true,
        json: async () => ({ success: true, data: onboardedProfile, error: null })
      } as Response;
    });

    renderApp("/home");
    await userEvent.click(await screen.findByRole("button", { name: "Cómodo" }));
    await userEvent.click(screen.getByRole("button", { name: /^sorpréndeme$/i }));

    expect(await screen.findByRole("status")).toHaveTextContent(/mezclando tu mood/i);
    resolveSurprise({
      ok: true,
      json: async () => ({ success: true, data: surprisePlan, error: null })
    } as Response);
    expect(await screen.findByRole("heading", { name: /plan sorpresa por medellin/i })).toBeInTheDocument();
    expect(screen.getByText(/cómo lo improvisó orbit/i)).toBeInTheDocument();

    const surpriseCall = vi.mocked(globalThis.fetch).mock.calls.find(([input]) =>
      String(input).includes("/plans/surprise")
    );
    expect(JSON.parse(String(surpriseCall?.[1]?.body))).toMatchObject({ locale: "es", mood: "Cozy" });
  });

  it("allows retry from a recoverable Surprise Me error", async () => {
    localStorage.setItem("orbit.token", "valid-token");
    let surpriseAttempts = 0;
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/plans/surprise")) {
        surpriseAttempts += 1;
        if (surpriseAttempts === 1) {
          return {
            ok: false,
            json: async () => ({
              success: false,
              data: null,
              error: { code: "PLAN_GENERATION_FAILED", message: "Falló la sorpresa" }
            })
          } as Response;
        }
        return {
          ok: true,
          json: async () => ({ success: true, data: surprisePlan, error: null })
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({ success: true, data: onboardedProfile, error: null })
      } as Response;
    });

    renderApp("/home");
    await userEvent.click(await screen.findByRole("button", { name: /^sorpréndeme$/i }));

    expect(await screen.findByText(/no salió la sorpresa/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /sorpréndeme otra vez/i }));

    expect(await screen.findByRole("heading", { name: /plan sorpresa por medellin/i })).toBeInTheDocument();
    expect(surpriseAttempts).toBe(2);
  });

  it("allows retry from a surprise result", async () => {
    localStorage.setItem("orbit.token", "valid-token");
    const secondSurprise = {
      ...surprisePlan,
      id: "surprise-2",
      result: { ...surprisePlan.result, id: "surprise-2", title: "Segundo plan sorpresa" }
    };
    let surpriseAttempts = 0;
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/plans/surprise")) {
        surpriseAttempts += 1;
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: surpriseAttempts === 1 ? surprisePlan : secondSurprise,
            error: null
          })
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({ success: true, data: onboardedProfile, error: null })
      } as Response;
    });

    renderApp("/home");
    await userEvent.click(await screen.findByRole("button", { name: /^sorpréndeme$/i }));
    expect(await screen.findByRole("heading", { name: /plan sorpresa por medellin/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /sorpréndeme otra vez/i }));

    expect(await screen.findByRole("heading", { name: /segundo plan sorpresa/i })).toBeInTheDocument();
    expect(surpriseAttempts).toBe(2);
  });

  it("switches visible copy between Spanish and English", async () => {
    renderApp("/login");

    expect(await screen.findByRole("heading", { name: /bienvenido de nuevo/i })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /idioma/i }));

    expect(await screen.findByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(localStorage.getItem("orbit.locale")).toBe("en");
  });

  it("restores persisted English locale", async () => {
    localStorage.setItem("orbit.locale", "en");

    renderApp("/login");

    expect(await screen.findByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /language/i })).toBeInTheDocument();
  });
});
