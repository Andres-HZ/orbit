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
        matchExplanation: "Encaja con tu mood tranquilo."
      }
    ]
  },
  createdAt: new Date().toISOString()
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
