import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import { createAuthService, loginSchema, registerSchema, verifyToken } from "./auth.js";
import {
  contextLocationRequestSchema,
  createNearbyService,
  locationResolveSchema,
  nearbyRequestSchema,
  type NearbyService
} from "./nearby.js";
import {
  createMemoryPlanRepository,
  createPlanService,
  pgPlans,
  planContextSchema,
  surprisePlanSchema,
  type PlanRepository
} from "./plans.js";
import { createProfileService, preferencesSchema } from "./profile.js";
import { pgPreferences, pgUsers, type PreferencesRepository, type UserRepository } from "./repositories.js";
import { AppError, asyncHandler, errorHandler, ok, requestLogger, validate } from "./shared.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export type AppDependencies = {
  users?: UserRepository;
  preferences?: PreferencesRepository;
  plans?: PlanRepository;
  nearby?: NearbyService;
};

export function createApp(dependencies: AppDependencies = {}) {
  const users = dependencies.users ?? pgUsers;
  const preferences = dependencies.preferences ?? pgPreferences;
  const plans =
    dependencies.plans ??
    (dependencies.users || dependencies.preferences ? createMemoryPlanRepository() : pgPlans);
  const auth = createAuthService(users);
  const profile = createProfileService(users, preferences);
  const planService = createPlanService(preferences, plans);
  const nearby = dependencies.nearby ?? createNearbyService();
  const app = express();

  function requireAuth(req: Request, _res: Response, next: NextFunction) {
    const header = req.header("authorization");
    const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
    if (!token) {
      next(new AppError(401, "UNAUTHORIZED", "Authentication required"));
      return;
    }
    const payload = verifyToken(token);
    req.userId = payload.sub;
    next();
  }

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  const router = express.Router();

  router.get("/health", (_req, res) => {
    res.json(ok({ status: "ok" }));
  });

  router.post(
    "/auth/register",
    asyncHandler(async (req, res) => {
      const payload = validate(registerSchema, req.body);
      res.status(201).json(ok(await auth.register(payload)));
    })
  );

  router.post(
    "/auth/login",
    asyncHandler(async (req, res) => {
      const payload = validate(loginSchema, req.body);
      res.json(ok(await auth.login(payload)));
    })
  );

  router.get(
    "/me",
    requireAuth,
    asyncHandler(async (req, res) => {
      res.json(ok(await profile.getProfile(req.userId!)));
    })
  );

  router.get(
    "/onboarding",
    requireAuth,
    asyncHandler(async (req, res) => {
      res.json(ok(await profile.getProfile(req.userId!)));
    })
  );

  router.post(
    "/onboarding",
    requireAuth,
    asyncHandler(async (req, res) => {
      const payload = validate(preferencesSchema, req.body);
      res.json(ok(await profile.savePreferences(req.userId!, payload)));
    })
  );

  router.put(
    "/profile/preferences",
    requireAuth,
    asyncHandler(async (req, res) => {
      const payload = validate(preferencesSchema, req.body);
      res.json(ok(await profile.savePreferences(req.userId!, payload)));
    })
  );

  router.post(
    "/location/resolve",
    requireAuth,
    asyncHandler(async (req, res) => {
      const payload = validate(locationResolveSchema, req.body);
      res.json(ok(nearby.resolveLocation(payload)));
    })
  );

  router.post(
    "/weather/summary",
    requireAuth,
    asyncHandler(async (req, res) => {
      const payload = validate(contextLocationRequestSchema, req.body);
      res.json(ok(await nearby.getWeather(payload.location)));
    })
  );

  router.post(
    "/nearby/discover",
    requireAuth,
    asyncHandler(async (req, res) => {
      const payload = validate(nearbyRequestSchema, req.body);
      res.json(ok(await nearby.discoverNearby(payload.location, payload.categories)));
    })
  );

  router.post(
    "/plans/generate",
    requireAuth,
    asyncHandler(async (req, res) => {
      const payload = validate(planContextSchema, req.body);
      const plan = await planService.generate(req.userId!, payload);
      res.status(201).json(ok(plan));
    })
  );

  router.post(
    "/plans/surprise",
    requireAuth,
    asyncHandler(async (req, res) => {
      const payload = validate(surprisePlanSchema, req.body);
      const plan = await planService.generateSurprise(req.userId!, payload);
      res.status(201).json(ok(plan));
    })
  );

  router.get(
    "/plans/:planId",
    requireAuth,
    asyncHandler(async (req, res) => {
      const plan = await planService.findById(req.userId!, String(req.params.planId));
      res.json(ok(plan));
    })
  );

  app.use("/api/v1", router);
  app.use(errorHandler);

  return app;
}
