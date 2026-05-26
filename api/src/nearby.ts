import { createHash } from "node:crypto";
import { z } from "zod";
import { AppError } from "./shared.js";

const cacheWindowMs = Number(process.env.CONTEXT_CACHE_WINDOW_MS ?? 15 * 60 * 1000);

export const locationContextSchema = z.object({
  source: z.enum(["browser", "manual"]),
  label: z.string().min(2),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  precision: z.enum(["exact", "coarse", "manual"]).default("manual")
});

export const locationResolveSchema = z.object({
  source: z.enum(["browser", "manual"]),
  label: z.string().min(2).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional()
});

export const weatherContextSchema = z.object({
  condition: z.string(),
  temperatureCelsius: z.number(),
  suitability: z.enum(["indoor", "outdoor", "either"]),
  summary: z.string(),
  source: z.string(),
  updatedAt: z.string()
});

export const nearbyExperienceSchema = z.object({
  id: z.string(),
  category: z.enum(["restaurant", "cafe", "event", "park", "nightlife", "activity"]),
  title: z.string(),
  placeName: z.string().optional(),
  description: z.string().optional(),
  locationLabel: z.string(),
  address: z.string().optional(),
  distanceLabel: z.string().optional(),
  openingHours: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  popularityLabel: z.string().optional(),
  priceLabel: z.string().optional(),
  tags: z.array(z.string()).optional(),
  source: z.string(),
  mapUrl: z.string().url().optional()
});

export const contextLocationRequestSchema = z.object({
  location: locationContextSchema
});

export const nearbyRequestSchema = contextLocationRequestSchema.extend({
  categories: z.array(nearbyExperienceSchema.shape.category).optional()
});

export type LocationContext = z.infer<typeof locationContextSchema>;
export type LocationResolveInput = z.infer<typeof locationResolveSchema>;
export type WeatherContext = z.infer<typeof weatherContextSchema>;
export type NearbyExperience = z.infer<typeof nearbyExperienceSchema>;
export type NearbyCategory = NearbyExperience["category"];

type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

type ContextCache = {
  weather: Map<string, CacheEntry<WeatherContext>>;
  nearby: Map<string, CacheEntry<NearbyExperience[]>>;
};

export type WeatherProvider = {
  getWeather(location: LocationContext): Promise<WeatherContext>;
};

export type NearbyProvider = {
  discover(location: LocationContext, categories?: NearbyCategory[]): Promise<NearbyExperience[]>;
};

export type NearbyService = {
  resolveLocation(input: LocationResolveInput): LocationContext;
  getWeather(location: LocationContext): Promise<WeatherContext>;
  discoverNearby(location: LocationContext, categories?: NearbyCategory[]): Promise<NearbyExperience[]>;
};

function coarseLocationKey(location: LocationContext) {
  if (location.latitude !== undefined && location.longitude !== undefined) {
    return `${Math.round(location.latitude * 10) / 10},${Math.round(location.longitude * 10) / 10}`;
  }
  return location.label.trim().toLowerCase();
}

function cacheBucket(now = Date.now()) {
  return Math.floor(now / cacheWindowMs);
}

function cacheGet<T>(cache: Map<string, CacheEntry<T>>, key: string) {
  const entry = cache.get(key);
  if (!entry || entry.expiresAt < Date.now()) return null;
  return entry.value;
}

function cacheSet<T>(cache: Map<string, CacheEntry<T>>, key: string, value: T) {
  cache.set(key, { value, expiresAt: Date.now() + cacheWindowMs });
}

function stableNumber(seed: string, min: number, max: number) {
  const hash = createHash("sha1").update(seed).digest("hex");
  const value = Number.parseInt(hash.slice(0, 8), 16) / 0xffffffff;
  return Math.round(min + value * (max - min));
}

function mapUrl(location: LocationContext, query: string) {
  if (location.latitude !== undefined && location.longitude !== undefined) {
    return `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${location.latitude},${location.longitude},14z`;
  }
  return `https://www.google.com/maps/search/${encodeURIComponent(`${query} ${location.label}`)}`;
}

function locationLabelFromCoordinates(input: LocationResolveInput) {
  if (input.label) return input.label.trim();
  if (input.latitude !== undefined && input.longitude !== undefined) {
    return `Zona ${input.latitude.toFixed(2)}, ${input.longitude.toFixed(2)}`;
  }
  throw new AppError(400, "LOCATION_REQUIRED", "Location label or coordinates are required");
}

export function normalizeLocation(input: LocationResolveInput): LocationContext {
  const hasCoordinates = input.latitude !== undefined && input.longitude !== undefined;
  return {
    source: input.source,
    label: locationLabelFromCoordinates(input),
    latitude: input.latitude,
    longitude: input.longitude,
    precision: input.source === "browser" && hasCoordinates ? "coarse" : "manual"
  };
}

export function createSampleWeatherProvider(): WeatherProvider {
  return {
    async getWeather(location) {
      if (process.env.WEATHER_PROVIDER === "disabled") {
        throw new AppError(503, "WEATHER_UNAVAILABLE", "Weather provider unavailable");
      }
      const temperatureCelsius = stableNumber(`${location.label}:temp`, 18, 29);
      const rainy = stableNumber(`${location.label}:rain`, 0, 10) > 6;
      const suitability = rainy ? "indoor" : temperatureCelsius > 26 ? "either" : "outdoor";
      const condition = rainy ? "Lluvia ligera" : temperatureCelsius > 26 ? "Cálido" : "Agradable";
      return {
        condition,
        temperatureCelsius,
        suitability,
        summary:
          suitability === "indoor"
            ? "Mejor priorizar planes bajo techo por el clima."
            : "Buen clima para mezclar exteriores y paradas flexibles.",
        source: process.env.WEATHER_PROVIDER ?? "sample-weather",
        updatedAt: new Date().toISOString()
      };
    }
  };
}

const sampleNearby: Array<Omit<NearbyExperience, "id" | "locationLabel" | "source" | "mapUrl">> = [
  {
    category: "restaurant",
    title: "Cena casual con sabor local",
    placeName: "Mesa Local",
    description: "Restaurante de barrio con platos para compartir y ambiente cómodo para arrancar la noche.",
    address: "Calle principal de la zona",
    distanceLabel: "8 min",
    openingHours: "12:00 PM - 10:00 PM",
    rating: 4.6,
    popularityLabel: "Muy visitado",
    priceLabel: "$$",
    tags: ["comida local", "para compartir", "casual"]
  },
  {
    category: "cafe",
    title: "Café tranquilo para conversar",
    placeName: "Café Nube",
    description: "Café cómodo para bajar el ritmo, conversar o esperar antes de la siguiente parada.",
    address: "Zona café y coworking",
    distanceLabel: "5 min",
    openingHours: "8:00 AM - 8:00 PM",
    rating: 4.7,
    popularityLabel: "Ideal para conversar",
    priceLabel: "$",
    tags: ["café", "tranquilo", "postre"]
  },
  {
    category: "park",
    title: "Caminata suave al aire libre",
    placeName: "Parque Central",
    description: "Espacio abierto para caminar, tomar aire y ajustar el plan sin presión.",
    address: "Corredor verde cercano",
    distanceLabel: "12 min",
    openingHours: "Abierto 24 horas",
    rating: 4.4,
    popularityLabel: "Popular en la tarde",
    priceLabel: "Gratis",
    tags: ["aire libre", "caminar", "relajado"]
  },
  {
    category: "event",
    title: "Parada cultural de agenda local",
    placeName: "Casa Cultural",
    description: "Espacio con programación rotativa: exposiciones pequeñas, música o encuentros comunitarios.",
    address: "Distrito cultural cercano",
    distanceLabel: "15 min",
    openingHours: "4:00 PM - 9:00 PM",
    rating: 4.3,
    popularityLabel: "Tendencia hoy",
    priceLabel: "$",
    tags: ["cultura", "agenda", "curioso"]
  },
  {
    category: "nightlife",
    title: "Coctel o música con ambiente relajado",
    placeName: "Bar Violeta",
    description: "Bar de baja fricción para cerrar el plan con música suave y buena iluminación.",
    address: "Zona nocturna segura",
    distanceLabel: "10 min",
    openingHours: "6:00 PM - 1:00 AM",
    rating: 4.5,
    popularityLabel: "Buena vibra nocturna",
    priceLabel: "$$",
    tags: ["música", "cocteles", "noche"]
  },
  {
    category: "activity",
    title: "Experiencia activa flexible",
    placeName: "Orbit Activo",
    description: "Actividad ligera que se puede adaptar al clima, energía y tiempo disponible.",
    address: "Punto de encuentro cercano",
    distanceLabel: "14 min",
    openingHours: "10:00 AM - 7:00 PM",
    rating: 4.2,
    popularityLabel: "Plan espontáneo",
    priceLabel: "$$",
    tags: ["activo", "flexible", "grupo"]
  }
];

export function normalizeNearbyExperiences(
  location: LocationContext,
  rawExperiences: Partial<NearbyExperience>[]
): NearbyExperience[] {
  return rawExperiences.map((experience, index) => {
    const category = experience.category ?? "activity";
    const title = experience.title?.trim() || `Experiencia cercana ${index + 1}`;
    return {
      id: experience.id || `${coarseLocationKey(location)}-${category}-${index}`,
      category,
      title,
      placeName: experience.placeName || title,
      description: experience.description,
      locationLabel: experience.locationLabel || location.label,
      address: experience.address,
      distanceLabel: experience.distanceLabel,
      openingHours: experience.openingHours,
      rating: experience.rating,
      popularityLabel: experience.popularityLabel,
      priceLabel: experience.priceLabel,
      tags: experience.tags,
      source: experience.source || process.env.PLACES_PROVIDER || "sample-places",
      mapUrl: experience.mapUrl || mapUrl(location, title)
    };
  });
}

export function createSampleNearbyProvider(): NearbyProvider {
  return {
    async discover(location, categories) {
      if (process.env.PLACES_PROVIDER === "disabled") {
        throw new AppError(503, "NEARBY_UNAVAILABLE", "Nearby provider unavailable");
      }
      const allowed = new Set(categories ?? sampleNearby.map((item) => item.category));
      return normalizeNearbyExperiences(
        location,
        sampleNearby.filter((item) => allowed.has(item.category)).map((item) => ({
          ...item,
          locationLabel: `${item.title}, ${location.label}`
        }))
      );
    }
  };
}

export function createNearbyService({
  weatherProvider = createSampleWeatherProvider(),
  nearbyProvider = createSampleNearbyProvider(),
  cache = { weather: new Map(), nearby: new Map() }
}: {
  weatherProvider?: WeatherProvider;
  nearbyProvider?: NearbyProvider;
  cache?: ContextCache;
} = {}): NearbyService {
  return {
    resolveLocation: normalizeLocation,
    async getWeather(location) {
      const key = `${coarseLocationKey(location)}:${cacheBucket()}`;
      const cached = cacheGet(cache.weather, key);
      if (cached) return cached;
      const weather = await weatherProvider.getWeather(location);
      cacheSet(cache.weather, key, weather);
      return weather;
    },
    async discoverNearby(location, categories) {
      const key = `${coarseLocationKey(location)}:${(categories ?? []).join(",")}:${cacheBucket()}`;
      const cached = cacheGet(cache.nearby, key);
      if (cached) return cached;
      const nearby = await nearbyProvider.discover(location, categories);
      cacheSet(cache.nearby, key, nearby);
      return nearby;
    }
  };
}
