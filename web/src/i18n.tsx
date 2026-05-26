import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Locale = "es" | "en";

const localeKey = "orbit.locale";

export const copy = {
  es: {
    nav: {
      home: "Inicio",
      profile: "Perfil",
      logout: "Salir",
      language: "Idioma",
      switchTo: "English"
    },
    loading: {
      default: "Cargando Orbit...",
      restoring: "Restaurando tu sesión de Orbit..."
    },
    auth: {
      eyebrow: "Planes con IA",
      headline: "¿Qué hacemos hoy?",
      subtitle:
        "Orbit convierte tu mood, presupuesto, tiempo y estilo en próximos pasos hermosos.",
      registerTitle: "Crea tu Orbit",
      loginTitle: "Bienvenido de nuevo",
      name: "Nombre",
      email: "Correo",
      password: "Contraseña",
      createAccount: "Crear cuenta",
      login: "Entrar",
      alreadyExploring: "¿Ya estás explorando?",
      newHere: "¿Nuevo por aquí?",
      authFailed: "No pudimos iniciar sesión"
    },
    onboarding: {
      eyebrow: "Personaliza Orbit",
      headline: "Cuéntanos tu vibra base",
      interests: "Intereses",
      activityPreferences: "Preferencias de actividad",
      budgetStyle: "Estilo de presupuesto",
      socialStyle: "Estilo social",
      favoriteCategories: "Categorías favoritas",
      chooseMany: "Puedes elegir varias opciones",
      chooseOne: "Elige una opción",
      selected: "seleccionado",
      finish: "Terminar onboarding",
      saveError: "No pudimos guardar el onboarding",
      options: {
        food: "Comida",
        music: "Música",
        nature: "Naturaleza",
        culture: "Cultura",
        calm: "Calmado",
        indoor: "Interior",
        outdoor: "Exterior",
        active: "Activo",
        low: "Bajo",
        medium: "Medio",
        premium: "Premium",
        solo: "Solo",
        couple: "Pareja",
        friends: "Amigos",
        family: "Familia",
        cafes: "Cafés",
        parks: "Parques",
        movies: "Cine",
        restaurants: "Restaurantes"
      }
    },
    home: {
      eyebrow: "Hoy",
      headline: "¿Qué quieres hacer hoy?",
      subtitle: "Elige un mood y deja que Orbit prepare la siguiente ruta.",
      quickMood: "Mood rápido",
      moodSelector: "Selector de mood",
      currentMood: "Mood actual",
      recommendedPlans: "Planes recomendados",
      comingNext: "Próximamente",
      smartRecommendations: "Las recomendaciones inteligentes llegan en la propuesta 2.",
      startPlanning: "Empezar plan",
      planUnavailable: "La generación de planes empieza en smart-plan-generator.",
      location: "Ubicación para hoy",
      locationBody: "Activa ubicación o escribe una zona para cargar clima y experiencias cercanas.",
      activeLocation: "Ubicación activa",
      locationPlaceholder: "Medellín, Laureles, El Poblado...",
      useManualLocation: "Usar esta zona",
      useBrowserLocation: "Usar mi ubicación",
      locationLoading: "Cargando contexto...",
      locationManualHint: "No pudimos usar tu ubicación. Puedes escribir ciudad o barrio manualmente.",
      locationError: "No pudimos resolver la ubicación.",
      contextUnavailable: "El contexto cercano no está disponible ahora.",
      surpriseMe: "Sorpréndeme",
      surpriseBody: "Un toque y Orbit arma algo espontáneo con tu mood y preferencias.",
      surpriseLoadingTitle: "Orbit está mezclando tu mood...",
      surpriseLoadingBody: "Buscando una ruta flexible sin hacerte llenar el formulario.",
      surpriseLoadingAction: "Preparando sorpresa...",
      surpriseRetry: "Sorpréndeme otra vez",
      surpriseErrorTitle: "No salió la sorpresa",
      surpriseError: "No pudimos generar un plan sorpresa.",
      weather: "Clima",
      weatherPlaceholder: "Clima pendiente",
      weatherBody: "Carga una ubicación para ver clima útil para planear.",
      suitability: "Mejor para",
      nearby: "Tendencias cerca",
      openingHours: "Horario",
      nearbyPlaceholder: "Lugares pendientes",
      nearbyBody: "Carga una ubicación para ver restaurantes, cafés, parques y eventos cercanos.",
      nearbyCategories: {
        restaurant: "Restaurante",
        cafe: "Café",
        event: "Evento",
        park: "Parque",
        nightlife: "Noche",
        activity: "Actividad"
      },
      moods: {
        Curious: "Curioso",
        Cozy: "Cómodo",
        Active: "Activo",
        Romantic: "Romántico"
      }
    },
    plans: {
      eyebrow: "Generador inteligente",
      headline: "Diseñemos un plan para hoy",
      subtitle: "Cuéntale a Orbit el contexto y generaremos actividades ordenadas.",
      location: "Ubicación",
      locationPlaceholder: "Medellín, Laureles, El Poblado...",
      budget: "Presupuesto",
      time: "Tiempo disponible",
      groupSize: "Personas",
      energy: "Energía",
      indoorOutdoor: "Ambiente",
      interests: "Intereses del plan",
      generate: "Generar plan",
      generating: "Orbit está generando opciones...",
      retry: "Intentar de nuevo",
      resultEyebrow: "Plan generado",
      surpriseResultEyebrow: "Plan sorpresa",
      totalCost: "Costo estimado",
      totalTime: "Duración estimada",
      why: "Por qué encaja contigo",
      source: "Fuente",
      constraintsOk: "Dentro de tu presupuesto y tiempo",
      openMap: "Abrir mapa",
      surpriseContextTitle: "Cómo lo improvisó Orbit",
      surpriseContextBody: "Usamos tu mood, preferencias guardadas y defaults seguros:",
      surpriseDefaults: "Defaults aplicados",
      validationError: "Completa ubicación, presupuesto, tiempo e intereses para generar un plan.",
      loadError: "No pudimos cargar el plan.",
      options: {
        low: "Baja",
        medium: "Media",
        high: "Alta",
        indoor: "Interior",
        outdoor: "Exterior",
        either: "Cualquiera",
        food: "Comida",
        culture: "Cultura",
        nature: "Naturaleza",
        music: "Música",
        coffee: "Café"
      }
    },
    profile: {
      eyebrow: "Perfil",
      save: "Guardar perfil",
      saved: "Preferencias guardadas",
      placeholders: {
        activityHistory: "Historial de actividad",
        savedPlaces: "Lugares guardados",
        favoritePlans: "Planes favoritos",
        recommendationTuning: "Ajuste de recomendaciones"
      },
      placeholderBodies: {
        activityHistory: "El historial aparecerá cuando generes planes personalizados.",
        savedPlaces: "Los lugares guardados llegan con la fase de personalización.",
        favoritePlans: "Los planes favoritos llegan con la fase de personalización.",
        recommendationTuning:
          "El ajuste de recomendaciones llega cuando existan señales de aprendizaje."
      }
    }
  },
  en: {
    nav: {
      home: "Home",
      profile: "Profile",
      logout: "Logout",
      language: "Language",
      switchTo: "Español"
    },
    loading: {
      default: "Loading Orbit...",
      restoring: "Restoring your Orbit session..."
    },
    auth: {
      eyebrow: "AI-powered plans",
      headline: "What should we do today?",
      subtitle: "Orbit turns your mood, budget, time, and style into beautiful next steps.",
      registerTitle: "Create your Orbit",
      loginTitle: "Welcome back",
      name: "Name",
      email: "Email",
      password: "Password",
      createAccount: "Create account",
      login: "Login",
      alreadyExploring: "Already exploring?",
      newHere: "New here?",
      authFailed: "Auth failed"
    },
    onboarding: {
      eyebrow: "Personalize Orbit",
      headline: "Tell us your default vibe",
      interests: "Interests",
      activityPreferences: "Activity preferences",
      budgetStyle: "Budget style",
      socialStyle: "Social style",
      favoriteCategories: "Favorite categories",
      chooseMany: "You can choose multiple options",
      chooseOne: "Choose one option",
      selected: "selected",
      finish: "Finish onboarding",
      saveError: "Could not save onboarding",
      options: {
        food: "Food",
        music: "Music",
        nature: "Nature",
        culture: "Culture",
        calm: "Calm",
        indoor: "Indoor",
        outdoor: "Outdoor",
        active: "Active",
        low: "Low",
        medium: "Medium",
        premium: "Premium",
        solo: "Solo",
        couple: "Couple",
        friends: "Friends",
        family: "Family",
        cafes: "Cafes",
        parks: "Parks",
        movies: "Movies",
        restaurants: "Restaurants"
      }
    },
    home: {
      eyebrow: "Today",
      headline: "What do you want to do today?",
      subtitle: "Pick a mood and let Orbit prepare the next feature path.",
      quickMood: "Quick mood",
      moodSelector: "Mood selector",
      currentMood: "Current mood",
      recommendedPlans: "Recommended plans",
      comingNext: "Coming next",
      smartRecommendations: "Smart recommendations arrive in proposal 2.",
      startPlanning: "Start planning",
      planUnavailable: "Plan generation starts in smart-plan-generator.",
      location: "Today's location",
      locationBody: "Enable location or type an area to load weather and nearby experiences.",
      activeLocation: "Active location",
      locationPlaceholder: "Medellin, Laureles, El Poblado...",
      useManualLocation: "Use this area",
      useBrowserLocation: "Use my location",
      locationLoading: "Loading context...",
      locationManualHint: "We could not use your location. You can type a city or neighborhood manually.",
      locationError: "We could not resolve the location.",
      contextUnavailable: "Nearby context is unavailable right now.",
      surpriseMe: "Surprise Me",
      surpriseBody: "One tap and Orbit builds something spontaneous from your mood and preferences.",
      surpriseLoadingTitle: "Orbit is mixing your mood...",
      surpriseLoadingBody: "Finding a flexible route without making you fill the full form.",
      surpriseLoadingAction: "Preparing surprise...",
      surpriseRetry: "Surprise me again",
      surpriseErrorTitle: "The surprise missed",
      surpriseError: "We could not generate a surprise plan.",
      weather: "Weather",
      weatherPlaceholder: "Weather placeholder",
      weatherBody: "Load a location to see planning-friendly weather.",
      suitability: "Best for",
      nearby: "Trending nearby",
      openingHours: "Hours",
      nearbyPlaceholder: "Nearby placeholder",
      nearbyBody: "Load a location to see nearby restaurants, cafes, parks, and events.",
      nearbyCategories: {
        restaurant: "Restaurant",
        cafe: "Cafe",
        event: "Event",
        park: "Park",
        nightlife: "Nightlife",
        activity: "Activity"
      },
      moods: {
        Curious: "Curious",
        Cozy: "Cozy",
        Active: "Active",
        Romantic: "Romantic"
      }
    },
    plans: {
      eyebrow: "Smart generator",
      headline: "Let's design a plan for today",
      subtitle: "Tell Orbit the context and we will generate ordered activities.",
      location: "Location",
      locationPlaceholder: "Medellin, Laureles, El Poblado...",
      budget: "Budget",
      time: "Available time",
      groupSize: "People",
      energy: "Energy",
      indoorOutdoor: "Setting",
      interests: "Plan interests",
      generate: "Generate plan",
      generating: "Orbit is generating options...",
      retry: "Try again",
      resultEyebrow: "Generated plan",
      surpriseResultEyebrow: "Surprise plan",
      totalCost: "Estimated cost",
      totalTime: "Estimated duration",
      why: "Why this matches you",
      source: "Source",
      constraintsOk: "Inside your budget and time",
      openMap: "Open map",
      surpriseContextTitle: "How Orbit improvised it",
      surpriseContextBody: "We used your mood, saved preferences, and safe defaults:",
      surpriseDefaults: "Defaults applied",
      validationError: "Complete location, budget, time, and interests to generate a plan.",
      loadError: "We could not load the plan.",
      options: {
        low: "Low",
        medium: "Medium",
        high: "High",
        indoor: "Indoor",
        outdoor: "Outdoor",
        either: "Either",
        food: "Food",
        culture: "Culture",
        nature: "Nature",
        music: "Music",
        coffee: "Coffee"
      }
    },
    profile: {
      eyebrow: "Profile",
      save: "Save profile",
      saved: "Preferences saved",
      placeholders: {
        activityHistory: "Activity history",
        savedPlaces: "Saved places",
        favoritePlans: "Favorite plans",
        recommendationTuning: "Recommendation tuning"
      },
      placeholderBodies: {
        activityHistory: "Activity history will appear after personalized plans are generated.",
        savedPlaces: "Saved places arrive with the personalization phase.",
        favoritePlans: "Favorite plans arrive with the personalization phase.",
        recommendationTuning: "Recommendation tuning arrives after learning signals exist."
      }
    }
  }
} as const;

type I18nContextValue = {
  locale: Locale;
  t: (typeof copy)[Locale];
  toggleLocale: () => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readInitialLocale(): Locale {
  return localStorage.getItem(localeKey) === "en" ? "en" : "es";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(readInitialLocale);

  function toggleLocale() {
    setLocale((current) => {
      const next = current === "es" ? "en" : "es";
      localStorage.setItem(localeKey, next);
      return next;
    });
  }

  const value = useMemo(
    () => ({
      locale,
      t: copy[locale],
      toggleLocale
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside I18nProvider");
  return value;
}
