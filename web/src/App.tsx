import { useEffect, useState, type FormEvent, type ReactElement } from "react";
import {
  CalendarHeart,
  CloudSun,
  Compass,
  Clock3,
  Dumbbell,
  Film,
  Heart,
  Home as HomeIcon,
  Landmark,
  LockKeyhole,
  MapPin,
  Music,
  PartyPopper,
  PenLine,
  Rocket,
  Save,
  Sparkles,
  TreePine,
  Utensils,
  UserPlus,
  UserRound,
  UsersRound,
  Wallet,
  Zap
} from "lucide-react";
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { api, type PlanContext, type Preferences, type StoredPlan } from "./api";
import { useAuth } from "./auth";
import {
  AppShell,
  Button,
  Card,
  EmptyState,
  Input,
  LanguageToggle,
  LoadingState,
  PageShell,
  SectionTitle
} from "./components";
import { useI18n } from "./i18n";

const defaultPreferences: Preferences = {
  interests: ["food", "music"],
  activityPreferences: ["calm", "indoor"],
  budgetStyle: "low",
  socialStyle: "solo",
  favoriteCategories: ["cafes", "parks"]
};

const defaultPlanContext: PlanContext = {
  locale: "es",
  location: "Medellin",
  budgetCents: 12000000,
  availableMinutes: 180,
  mood: "Cozy",
  energyLevel: "medium",
  groupSize: 2,
  indoorOutdoorPreference: "indoor",
  interests: ["food", "culture"]
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(cents / 100);
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${minutes} min`;
  if (!rest) return `${hours} h`;
  return `${hours} h ${rest} min`;
}

type PreferenceOption = {
  value: string;
  label: string;
  icon: ReactElement;
};

function preferenceOptions(t: ReturnType<typeof useI18n>["t"]) {
  return {
    interests: [
      { value: "food", label: t.onboarding.options.food, icon: <Utensils /> },
      { value: "music", label: t.onboarding.options.music, icon: <Music /> },
      { value: "nature", label: t.onboarding.options.nature, icon: <TreePine /> },
      { value: "culture", label: t.onboarding.options.culture, icon: <Landmark /> }
    ],
    activityPreferences: [
      { value: "calm", label: t.onboarding.options.calm, icon: <Sparkles /> },
      { value: "indoor", label: t.onboarding.options.indoor, icon: <HomeIcon /> },
      { value: "outdoor", label: t.onboarding.options.outdoor, icon: <TreePine /> },
      { value: "active", label: t.onboarding.options.active, icon: <Dumbbell /> }
    ],
    budgetStyle: [
      { value: "low", label: t.onboarding.options.low, icon: <Sparkles /> },
      { value: "medium", label: t.onboarding.options.medium, icon: <Compass /> },
      { value: "premium", label: t.onboarding.options.premium, icon: <Rocket /> }
    ],
    socialStyle: [
      { value: "solo", label: t.onboarding.options.solo, icon: <UserRound /> },
      { value: "couple", label: t.onboarding.options.couple, icon: <Heart /> },
      { value: "friends", label: t.onboarding.options.friends, icon: <PartyPopper /> },
      { value: "family", label: t.onboarding.options.family, icon: <CalendarHeart /> }
    ],
    favoriteCategories: [
      { value: "cafes", label: t.onboarding.options.cafes, icon: <Sparkles /> },
      { value: "parks", label: t.onboarding.options.parks, icon: <TreePine /> },
      { value: "movies", label: t.onboarding.options.movies, icon: <Film /> },
      { value: "restaurants", label: t.onboarding.options.restaurants, icon: <Utensils /> }
    ]
  } satisfies Record<keyof Preferences, PreferenceOption[]>;
}

function planOptions(t: ReturnType<typeof useI18n>["t"]) {
  return {
    energy: [
      { value: "low", label: t.plans.options.low, icon: <Sparkles /> },
      { value: "medium", label: t.plans.options.medium, icon: <Zap /> },
      { value: "high", label: t.plans.options.high, icon: <Dumbbell /> }
    ],
    setting: [
      { value: "indoor", label: t.plans.options.indoor, icon: <HomeIcon /> },
      { value: "outdoor", label: t.plans.options.outdoor, icon: <TreePine /> },
      { value: "either", label: t.plans.options.either, icon: <Compass /> }
    ],
    interests: [
      { value: "food", label: t.plans.options.food, icon: <Utensils /> },
      { value: "culture", label: t.plans.options.culture, icon: <Landmark /> },
      { value: "nature", label: t.plans.options.nature, icon: <TreePine /> },
      { value: "music", label: t.plans.options.music, icon: <Music /> },
      { value: "coffee", label: t.plans.options.coffee, icon: <Sparkles /> }
    ]
  };
}

function PreferenceSelector({
  title,
  helper,
  options,
  value,
  onChange,
  multiple
}: {
  title: string;
  helper: string;
  options: PreferenceOption[];
  value: string | string[];
  onChange: (next: string | string[]) => void;
  multiple: boolean;
}) {
  const selectedValues = Array.isArray(value) ? value : [value];

  function toggle(optionValue: string) {
    if (!multiple) {
      onChange(optionValue);
      return;
    }

    const nextValues = selectedValues.includes(optionValue)
      ? selectedValues.filter((item) => item !== optionValue)
      : [...selectedValues, optionValue];
    onChange(nextValues);
  }

  return (
    <div className="preference-field" role="group" aria-label={title}>
      <div className="preference-field-header">
        <strong>{title}</strong>
        <p>{helper}</p>
      </div>
      <div className="preference-options">
        {options.map((option) => {
          const selected = selectedValues.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              className={`preference-option ${selected ? "selected" : ""}`}
              aria-pressed={selected}
              onClick={() => toggle(option.value)}
            >
              <span className="preference-icon">{option.icon}</span>
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactElement }) {
  const auth = useAuth();
  const location = useLocation();
  const { t } = useI18n();
  if (auth.loading) return <LoadingState label={t.loading.restoring} />;
  if (!auth.token) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

function OnboardingGate({ children }: { children: ReactElement }) {
  const { user } = useAuth();
  if (user && !user.onboardingCompleted) return <Navigate to="/onboarding" replace />;
  return children;
}

function AuthCard({ mode }: { mode: "login" | "register" }) {
  const auth = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("Ana Orbit");
  const [email, setEmail] = useState("ana@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      if (mode === "register") await auth.register(name, email, password);
      else await auth.login(email, password);
      const target = (location.state as { from?: string } | null)?.from ?? "/home";
      navigate(target, { replace: true });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : t.auth.authFailed);
    }
  }

  return (
    <PageShell>
      <section className="hero banner-hero">
        <div>
          <p className="eyebrow">{t.auth.eyebrow}</p>
          <h1>{t.auth.headline}</h1>
          <p className="hero-subtitle">{t.auth.subtitle}</p>
        </div>
        <LanguageToggle />
      </section>
      <Card className="auth-card">
        <SectionTitle icon={mode === "register" ? <UserPlus /> : <LockKeyhole />}>
          {mode === "register" ? t.auth.registerTitle : t.auth.loginTitle}
        </SectionTitle>
        <form onSubmit={submit} className="form">
          {mode === "register" && (
            <label>
              {t.auth.name}
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </label>
          )}
          <label>
            {t.auth.email}
            <Input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            {t.auth.password}
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error && <p role="alert" className="error">{error}</p>}
          <Button icon={mode === "register" ? <UserPlus size={18} /> : <LockKeyhole size={18} />}>
            {mode === "register" ? t.auth.createAccount : t.auth.login}
          </Button>
        </form>
        <p className="switch-auth">
          {mode === "register" ? t.auth.alreadyExploring : t.auth.newHere}{" "}
          <a href={mode === "register" ? "/login" : "/register"}>
            {mode === "register" ? t.auth.login : t.auth.createAccount}
          </a>
        </p>
      </Card>
    </PageShell>
  );
}

function OnboardingPage() {
  const auth = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [error, setError] = useState("");
  const options = preferenceOptions(t);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!auth.token) return;
    setError("");
    try {
      const profile = await api.saveOnboarding(auth.token, preferences);
      auth.setProfile(profile);
      navigate("/home", { replace: true });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : t.onboarding.saveError);
    }
  }

  return (
    <AppShell onLogout={auth.logout}>
      <Card>
        <p className="eyebrow">{t.onboarding.eyebrow}</p>
        <h1>{t.onboarding.headline}</h1>
        <form className="form" onSubmit={submit}>
          <PreferenceSelector
            title={t.onboarding.interests}
            helper={t.onboarding.chooseMany}
            options={options.interests}
            value={preferences.interests}
            multiple
            onChange={(next) => setPreferences((current) => ({ ...current, interests: next as string[] }))}
          />
          <PreferenceSelector
            title={t.onboarding.activityPreferences}
            helper={t.onboarding.chooseMany}
            options={options.activityPreferences}
            value={preferences.activityPreferences}
            multiple
            onChange={(next) =>
              setPreferences((current) => ({ ...current, activityPreferences: next as string[] }))
            }
          />
          <PreferenceSelector
            title={t.onboarding.budgetStyle}
            helper={t.onboarding.chooseOne}
            options={options.budgetStyle}
            value={preferences.budgetStyle}
            multiple={false}
            onChange={(next) => setPreferences((current) => ({ ...current, budgetStyle: next as string }))}
          />
          <PreferenceSelector
            title={t.onboarding.socialStyle}
            helper={t.onboarding.chooseOne}
            options={options.socialStyle}
            value={preferences.socialStyle}
            multiple={false}
            onChange={(next) => setPreferences((current) => ({ ...current, socialStyle: next as string }))}
          />
          <PreferenceSelector
            title={t.onboarding.favoriteCategories}
            helper={t.onboarding.chooseMany}
            options={options.favoriteCategories}
            value={preferences.favoriteCategories}
            multiple
            onChange={(next) =>
              setPreferences((current) => ({ ...current, favoriteCategories: next as string[] }))
            }
          />
          {error && <p role="alert" className="error">{error}</p>}
          <Button icon={<Sparkles size={18} />}>{t.onboarding.finish}</Button>
        </form>
      </Card>
    </AppShell>
  );
}

function HomePage() {
  const auth = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [mood, setMood] = useState("Curious");
  const [unavailable, setUnavailable] = useState("");
  const moods = ["Curious", "Cozy", "Active", "Romantic"];

  return (
    <AppShell onLogout={auth.logout}>
      <section className="hero dashboard-hero">
        <p className="eyebrow">{t.home.eyebrow}</p>
        <h1>{t.home.headline}</h1>
        <p className="hero-subtitle">{t.home.subtitle}</p>
      </section>
      <div className="grid">
        <Card>
          <SectionTitle icon={<Heart />}>{t.home.quickMood}</SectionTitle>
          <div className="chip-row" aria-label={t.home.moodSelector}>
            {moods.map((item) => (
              <button
                key={item}
                className={`chip ${mood === item ? "active" : ""}`}
                onClick={() => setMood(item)}
              >
                {t.home.moods[item as keyof typeof t.home.moods]}
              </button>
            ))}
          </div>
          <p className="muted">
            {t.home.currentMood}: {t.home.moods[mood as keyof typeof t.home.moods]}
          </p>
        </Card>
        <Card>
          <SectionTitle icon={<Compass />}>{t.home.recommendedPlans}</SectionTitle>
          <EmptyState
            icon={<Rocket size={18} />}
            title={t.home.comingNext}
            body={t.home.smartRecommendations}
          />
          <Button
            icon={<Compass size={18} />}
            onClick={() => navigate("/plans/new", { state: { mood } })}
          >
            {t.home.startPlanning}
          </Button>
        </Card>
        <Card>
          <SectionTitle icon={<PartyPopper />}>{t.home.surpriseMe}</SectionTitle>
          <p>{t.home.surpriseBody}</p>
          <Button
            icon={<Sparkles size={18} />}
            onClick={() => setUnavailable(t.home.surpriseUnavailable)}
          >
            {t.home.surpriseMe}
          </Button>
        </Card>
        <Card>
          <SectionTitle icon={<CloudSun />}>{t.home.weather}</SectionTitle>
          <EmptyState
            icon={<CloudSun size={18} />}
            title={t.home.weatherPlaceholder}
            body={t.home.weatherBody}
          />
        </Card>
        <Card>
          <SectionTitle icon={<MapPin />}>{t.home.nearby}</SectionTitle>
          <EmptyState icon={<MapPin size={18} />} title={t.home.nearbyPlaceholder} body={t.home.nearbyBody} />
        </Card>
      </div>
      {unavailable && <p role="status" className="toast">{unavailable}</p>}
    </AppShell>
  );
}

function PlanBuilderPage() {
  const auth = useAuth();
  const { locale, t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const initialMood = (location.state as { mood?: string } | null)?.mood ?? defaultPlanContext.mood;
  const [context, setContext] = useState<PlanContext>({
    ...defaultPlanContext,
    mood: initialMood
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const options = planOptions(t);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!auth.token) return;

    if (!context.location || context.budgetCents < 0 || context.availableMinutes < 30 || !context.interests.length) {
      setError(t.plans.validationError);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const plan = await api.generatePlan(auth.token, { ...context, locale });
      navigate(`/plans/${plan.id}`, { state: { plan } });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : t.plans.loadError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell onLogout={auth.logout}>
      <section className="hero dashboard-hero">
        <p className="eyebrow">{t.plans.eyebrow}</p>
        <h1>{t.plans.headline}</h1>
        <p className="hero-subtitle">{t.plans.subtitle}</p>
      </section>
      <Card>
        <form className="form plan-form" onSubmit={submit}>
          <label>
            {t.plans.location}
            <Input
              value={context.location}
              placeholder={t.plans.locationPlaceholder}
              onChange={(event) =>
                setContext((current) => ({ ...current, location: event.target.value }))
              }
            />
          </label>
          <div className="plan-number-grid">
            <label>
              <span className="label-with-icon">
                <Wallet size={16} /> {t.plans.budget}
              </span>
              <Input
                type="number"
                min={0}
                step={10000}
                value={Math.round(context.budgetCents / 100)}
                onChange={(event) =>
                  setContext((current) => ({
                    ...current,
                    budgetCents: Number(event.target.value) * 100
                  }))
                }
              />
            </label>
            <label>
              <span className="label-with-icon">
                <Clock3 size={16} /> {t.plans.time}
              </span>
              <Input
                type="number"
                min={30}
                step={15}
                value={context.availableMinutes}
                onChange={(event) =>
                  setContext((current) => ({
                    ...current,
                    availableMinutes: Number(event.target.value)
                  }))
                }
              />
            </label>
            <label>
              <span className="label-with-icon">
                <UsersRound size={16} /> {t.plans.groupSize}
              </span>
              <Input
                type="number"
                min={1}
                max={20}
                value={context.groupSize}
                onChange={(event) =>
                  setContext((current) => ({ ...current, groupSize: Number(event.target.value) }))
                }
              />
            </label>
          </div>
          <PreferenceSelector
            title={t.home.quickMood}
            helper={t.onboarding.chooseOne}
            options={["Curious", "Cozy", "Active", "Romantic"].map((mood) => ({
              value: mood,
              label: t.home.moods[mood as keyof typeof t.home.moods],
              icon: <Heart />
            }))}
            value={context.mood}
            multiple={false}
            onChange={(next) => setContext((current) => ({ ...current, mood: next as string }))}
          />
          <PreferenceSelector
            title={t.plans.energy}
            helper={t.onboarding.chooseOne}
            options={options.energy}
            value={context.energyLevel}
            multiple={false}
            onChange={(next) =>
              setContext((current) => ({
                ...current,
                energyLevel: next as PlanContext["energyLevel"]
              }))
            }
          />
          <PreferenceSelector
            title={t.plans.indoorOutdoor}
            helper={t.onboarding.chooseOne}
            options={options.setting}
            value={context.indoorOutdoorPreference}
            multiple={false}
            onChange={(next) =>
              setContext((current) => ({
                ...current,
                indoorOutdoorPreference: next as PlanContext["indoorOutdoorPreference"]
              }))
            }
          />
          <PreferenceSelector
            title={t.plans.interests}
            helper={t.onboarding.chooseMany}
            options={options.interests}
            value={context.interests}
            multiple
            onChange={(next) =>
              setContext((current) => ({ ...current, interests: next as string[] }))
            }
          />
          {error && <p role="alert" className="error">{error}</p>}
          <Button icon={<Sparkles size={18} />} disabled={loading}>
            {loading ? t.plans.generating : t.plans.generate}
          </Button>
        </form>
      </Card>
    </AppShell>
  );
}

function PlanResultPage() {
  const auth = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { planId } = useParams();
  const routeState = useLocation().state as { plan?: StoredPlan } | null;
  const [plan, setPlan] = useState<StoredPlan | null>(routeState?.plan ?? null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadPlan() {
      if (plan || !auth.token || !planId) return;
      try {
        const nextPlan = await api.getPlan(auth.token, planId);
        if (active) setPlan(nextPlan);
      } catch {
        if (active) setError(t.plans.loadError);
      }
    }
    loadPlan();
    return () => {
      active = false;
    };
  }, [auth.token, plan, planId, t.plans.loadError]);

  if (error) {
    return (
      <AppShell onLogout={auth.logout}>
        <Card>
          <EmptyState title={t.plans.loadError} body={error} />
          <Button icon={<Rocket size={18} />} onClick={() => navigate("/plans/new")}>
            {t.plans.retry}
          </Button>
        </Card>
      </AppShell>
    );
  }

  if (!plan) return <LoadingState label={t.plans.generating} />;

  return (
    <AppShell onLogout={auth.logout}>
      <section className="hero dashboard-hero">
        <p className="eyebrow">{t.plans.resultEyebrow}</p>
        <h1>{plan.result.title}</h1>
        <p className="hero-subtitle">{plan.result.summary}</p>
      </section>
      <div className="plan-summary">
        <Card>
          <SectionTitle icon={<Wallet />}>{t.plans.totalCost}</SectionTitle>
          <p className="metric">{formatCurrency(plan.result.totalEstimatedCostCents)}</p>
        </Card>
        <Card>
          <SectionTitle icon={<Clock3 />}>{t.plans.totalTime}</SectionTitle>
          <p className="metric">{formatDuration(plan.result.totalEstimatedDurationMinutes)}</p>
        </Card>
        <Card>
          <SectionTitle icon={<Sparkles />}>{t.plans.source}</SectionTitle>
          <p className="metric">{plan.result.source}</p>
          <p className="muted">{t.plans.constraintsOk}</p>
        </Card>
      </div>
      <div className="plan-activities">
        {plan.result.activities.map((activity) => (
          <Card key={`${activity.order}-${activity.title}`} className="activity-card">
            <span className="activity-order">{activity.order}</span>
            <div>
              <p className="eyebrow">{activity.category}</p>
              <h2>{activity.title}</h2>
              <p className="muted">
                {formatCurrency(activity.estimatedCostCents)} ·{" "}
                {formatDuration(activity.estimatedDurationMinutes)} · {activity.locationLabel} ·{" "}
                {activity.distanceLabel}
              </p>
              <EmptyState title={t.plans.why} body={activity.matchExplanation} />
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}

function ProfilePage() {
  const auth = useAuth();
  const { t } = useI18n();
  const [preferences, setPreferences] = useState<Preferences>(
    auth.profile?.preferences ?? defaultPreferences
  );
  const [status, setStatus] = useState("");
  const options = preferenceOptions(t);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!auth.token) return;
    const profile = await api.updatePreferences(auth.token, preferences);
    auth.setProfile(profile);
    setStatus(t.profile.saved);
  }

  return (
    <AppShell onLogout={auth.logout}>
      <Card>
        <p className="eyebrow">{t.profile.eyebrow}</p>
        <h1>{auth.user?.name}</h1>
        <p className="muted">{auth.user?.email}</p>
        <form className="form" onSubmit={submit}>
          <PreferenceSelector
            title={t.onboarding.interests}
            helper={t.onboarding.chooseMany}
            options={options.interests}
            value={preferences.interests}
            multiple
            onChange={(next) => setPreferences((current) => ({ ...current, interests: next as string[] }))}
          />
          <PreferenceSelector
            title={t.onboarding.activityPreferences}
            helper={t.onboarding.chooseMany}
            options={options.activityPreferences}
            value={preferences.activityPreferences}
            multiple
            onChange={(next) =>
              setPreferences((current) => ({ ...current, activityPreferences: next as string[] }))
            }
          />
          <PreferenceSelector
            title={t.onboarding.budgetStyle}
            helper={t.onboarding.chooseOne}
            options={options.budgetStyle}
            value={preferences.budgetStyle}
            multiple={false}
            onChange={(next) => setPreferences((current) => ({ ...current, budgetStyle: next as string }))}
          />
          <PreferenceSelector
            title={t.onboarding.socialStyle}
            helper={t.onboarding.chooseOne}
            options={options.socialStyle}
            value={preferences.socialStyle}
            multiple={false}
            onChange={(next) => setPreferences((current) => ({ ...current, socialStyle: next as string }))}
          />
          <PreferenceSelector
            title={t.onboarding.favoriteCategories}
            helper={t.onboarding.chooseMany}
            options={options.favoriteCategories}
            value={preferences.favoriteCategories}
            multiple
            onChange={(next) =>
              setPreferences((current) => ({ ...current, favoriteCategories: next as string[] }))
            }
          />
          <Button icon={<Save size={18} />}>{t.profile.save}</Button>
          {status && <p role="status" className="success">{status}</p>}
        </form>
      </Card>
      <div className="grid">
        {Object.keys(auth.profile?.placeholders ?? t.profile.placeholders).map((key) => (
          <Card key={key}>
            <EmptyState
              icon={key === "activityHistory" ? <CalendarHeart size={18} /> : <PenLine size={18} />}
              title={t.profile.placeholders[key as keyof typeof t.profile.placeholders]}
              body={t.profile.placeholderBodies[key as keyof typeof t.profile.placeholderBodies]}
            />
          </Card>
        ))}
      </div>
    </AppShell>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/login" element={<AuthCard mode="login" />} />
      <Route path="/register" element={<AuthCard mode="register" />} />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <OnboardingGate>
              <HomePage />
            </OnboardingGate>
          </ProtectedRoute>
        }
      />
      <Route
        path="/plans/new"
        element={
          <ProtectedRoute>
            <OnboardingGate>
              <PlanBuilderPage />
            </OnboardingGate>
          </ProtectedRoute>
        }
      />
      <Route
        path="/plans/:planId"
        element={
          <ProtectedRoute>
            <OnboardingGate>
              <PlanResultPage />
            </OnboardingGate>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <OnboardingGate>
              <ProfilePage />
            </OnboardingGate>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
