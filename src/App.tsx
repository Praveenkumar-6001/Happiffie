import { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  BarChart3,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardList,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquareText,
  Search,
  Send,
  Sparkles,
  Star,
  Store,
  UserCheck,
  UserPlus,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { API_BASE_URL, api, clearSession, loadSession, saveSession } from './api';
import type {
  AdminDashboard,
  AuthSession,
  Booking,
  CreateBookingPayload,
  Invitation,
  Match,
  RegisterPayload,
  Requirement,
  RequirementForm,
  RequirementInsights,
  Review,
  Role,
  User,
  Vendor,
  VendorRegistrationPayload,
} from './types';

const defaultRequirement: RequirementForm = {
  eventType: 'wedding',
  city: 'Chennai',
  budget: 500000,
  guestCount: 500,
  theme: 'Traditional South Indian',
  eventDate: '2026-08-15',
  specialNotes: 'Temple theme decor with floral mandap and traditional ceremony setup.',
};

const eventTypes = [
  ['wedding', 'Wedding'],
  ['birthday', 'Birthday'],
  ['engagement', 'Engagement'],
  ['corporate_event', 'Corporate'],
  ['baby_shower', 'Baby Shower'],
  ['reception', 'Reception'],
] as const;

const roles: Array<{ id: Role; label: string; icon: typeof UserRound }> = [
  { id: 'customer', label: 'Customer', icon: UserRound },
  { id: 'vendor', label: 'Vendor', icon: Store },
  { id: 'admin', label: 'Admin', icon: LayoutDashboard },
];

type WorkflowStep = 'profile' | 'requirement' | 'matching' | 'invitation' | 'booking' | 'review';

const workflowSteps: Array<{ id: WorkflowStep; label: string; icon: typeof ClipboardList }> = [
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'requirement', label: 'Requirement', icon: ClipboardList },
  { id: 'matching', label: 'AI Matching', icon: Sparkles },
  { id: 'invitation', label: 'Invitation', icon: Send },
  { id: 'booking', label: 'Booking', icon: IndianRupee },
  { id: 'review', label: 'Review', icon: Star },
];

export function App() {
  const [session, setSession] = useState<AuthSession | null>(() => loadSession());
  const [activeStep, setActiveStep] = useState<WorkflowStep>('profile');
  const [avatar, setAvatar] = useState<string>(() => localStorage.getItem('happiffie_avatar') ?? '');
  const [requirement, setRequirement] = useState<RequirementForm>(defaultRequirement);
  const [freeText, setFreeText] = useState(
    'Need a traditional South Indian wedding in Chennai for 500 guests on 2026-08-15. Budget is 500000. Prefer temple theme decor.',
  );
  const [insights, setInsights] = useState<RequirementInsights | null>(null);
  const [savedRequirements, setSavedRequirements] = useState<Requirement[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [admin, setAdmin] = useState<AdminDashboard | null>(null);
  const [activeRequirementId, setActiveRequirementId] = useState('req_wedding_1');
  const [loading, setLoading] = useState<string | null>(null);
  const [notice, setNotice] = useState(`Connects to backend at ${API_BASE_URL}`);
  const role = session?.role ?? 'customer';

  useEffect(() => {
    if (session) {
      void refreshSharedData();
    }
  }, [session?.accessToken]);

  const vendorMap = useMemo(() => new Map(vendors.map((vendor) => [vendor.id, vendor])), [vendors]);

  async function runAction(label: string, action: () => Promise<void>) {
    setLoading(label);
    setNotice('');
    try {
      await action();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Request failed');
    } finally {
      setLoading(null);
    }
  }

  async function handleLogin(email: string, password: string) {
    await runAction('Signing in', async () => {
      const nextSession = await api.login({ email, password });
      saveSession(nextSession);
      setSession(nextSession);
      setNotice(`Signed in as ${nextSession.role}.`);
    });
  }

  async function handleRegister(payload: RegisterPayload, vendorPayload?: VendorRegistrationPayload) {
    await runAction('Creating account', async () => {
      const nextSession = await api.register(payload);
      if (payload.role === 'vendor' && vendorPayload) {
        const vendor = await api.createVendor(nextSession.userId, vendorPayload);
        setVendors((current) => [vendor, ...current]);
        setNotice('Vendor registration submitted. Admin approval is required before vendor login.');
        return;
      }
      saveSession(nextSession);
      setSession(nextSession);
      setNotice(`Registered and signed in as ${nextSession.role}.`);
    });
  }

  function handleLogout() {
    clearSession();
    setSession(null);
    setActiveStep('profile');
    setSavedRequirements([]);
    setMatches([]);
    setUsers([]);
    setInvitations([]);
    setBookings([]);
    setReviews([]);
    setAdmin(null);
    setNotice('Signed out.');
  }

  function handleAvatarChange(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result ?? '');
      setAvatar(value);
      localStorage.setItem('happiffie_avatar', value);
    };
    reader.readAsDataURL(file);
  }

  async function refreshSharedData() {
    await runAction('Loading workspace', async () => {
      const [requirementsData, vendorsData, invitationData, bookingData, reviewData, adminData] = await Promise.all([
        api.listRequirements(),
        api.listVendors(),
        api.listInvitations(),
        api.listBookings(),
        api.listReviews(),
        api.adminDashboard(),
      ]);
      const usersData = role === 'admin' ? await api.listUsers() : [];
      setSavedRequirements(requirementsData);
      setUsers(usersData);
      setVendors(vendorsData);
      setInvitations(invitationData);
      setBookings(bookingData);
      setReviews(reviewData);
      setAdmin(adminData);
      if (requirementsData[0]?.id) {
        setActiveRequirementId(requirementsData[0].id);
        setMatches(await api.listMatches(requirementsData[0].id));
      }
    });
  }

  async function analyzeText() {
    await runAction('Analyzing requirement', async () => {
      const data = await api.analyzeRequirement(freeText);
      setInsights(data);
      setRequirement({
        eventType: data.eventType,
        city: titleCase(data.city),
        budget: data.budget,
        guestCount: data.guestCount,
        theme: titleCase(data.theme),
        eventDate: data.eventDate,
        specialNotes: data.notes.join(' '),
      });
      setNotice('AI extracted the event details into the requirement form.');
    });
  }

  async function createRequirement() {
    await runAction('Saving requirement', async () => {
      const created = await api.createRequirement(requirement);
      setSavedRequirements((current) => [created, ...current]);
      setActiveRequirementId(created.id);
      const ranked = await api.listMatches(created.id);
      setMatches(ranked);
      setNotice('Requirement saved and vendor recommendations refreshed.');
    });
  }

  async function loadMatches(requirementId: string) {
    await runAction('Ranking vendors', async () => {
      setActiveRequirementId(requirementId);
      setMatches(await api.listMatches(requirementId));
    });
  }

  async function sendInvitation(vendorId: string) {
    await runAction('Sending invitation', async () => {
      const invitation = await api.sendInvitation(vendorId, activeRequirementId);
      setInvitations((current) => [invitation, ...current]);
      setNotice('Invitation sent to vendor.');
    });
  }

  async function respondInvitation(id: string, status: 'accepted' | 'rejected') {
    await runAction('Updating invitation', async () => {
      const updated = await api.respondInvitation(id, status, status === 'accepted' ? 275000 : undefined, 'Vendor response updated from frontend.');
      setInvitations((current) => current.map((item) => (item.id === id ? updated : item)));
      setNotice(`Invitation ${status}.`);
    });
  }

  async function confirmPayment(id: string) {
    await runAction('Confirming payment', async () => {
      const updated = await api.confirmPayment(id);
      setBookings((current) => current.map((item) => (item.id === id ? updated : item)));
    });
  }

  async function completeBooking(id: string) {
    await runAction('Completing booking', async () => {
      const updated = await api.completeBooking(id);
      setBookings((current) => current.map((item) => (item.id === id ? updated : item)));
    });
  }

  async function createBooking(payload: CreateBookingPayload) {
    await runAction('Creating booking', async () => {
      const booking = await api.createBooking(payload);
      setBookings((current) => [booking, ...current]);
      setNotice('Booking created. Complete payment to confirm the vendor.');
    });
  }

  async function createReview(payload: Omit<Review, 'id'>) {
    await runAction('Submitting review', async () => {
      const review = await api.createReview(payload);
      setReviews((current) => [review, ...current]);
      setNotice('Review submitted for the completed booking.');
    });
  }

  async function approveVendor(id: string) {
    await runAction('Approving vendor', async () => {
      const updated = await api.updateVendorStatus(id, 'active');
      setVendors((current) => current.map((vendor) => (vendor.id === id ? updated : vendor)));
      setNotice(`${updated.businessName} approved for vendor login.`);
    });
  }

  if (!session) {
    return <AuthPage loading={loading} notice={notice} onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">H</div>
          <div>
            <strong>Happiffie</strong>
            <span>Celebration marketplace</span>
          </div>
        </div>

        <div className="session-card">
          <label className="avatar-upload">
            {avatar ? <img src={avatar} alt="Profile" /> : <span>{session.email.slice(0, 2).toUpperCase()}</span>}
            <input type="file" accept="image/*" onChange={(event) => handleAvatarChange(event.target.files?.[0])} />
          </label>
          <span>Signed in</span>
          <strong>{session.email}</strong>
          <small>{titleCase(session.role)} access</small>
        </div>

        <div className="current-role-card" aria-label="Current access">
          {(() => {
            const currentRole = roles.find((item) => item.id === role) ?? roles[0];
            const Icon = currentRole.icon;
            return (
              <>
                <Icon size={18} />
                <span>{currentRole.label} Panel</span>
              </>
            );
          })()}
        </div>

        <button className="secondary-button full-width" onClick={handleLogout}>
          <LogOut size={17} />
          Logout
        </button>

        <div className="flow-list">
          {workflowSteps.map((step) => (
            <FlowStep
              key={step.id}
              icon={step.icon}
              text={step.label}
              active={activeStep === step.id}
              complete={
                step.id === 'requirement'
                  ? savedRequirements.length > 0
                  : step.id === 'matching'
                    ? matches.length > 0
                    : step.id === 'invitation'
                      ? invitations.length > 0
                      : step.id === 'booking'
                        ? bookings.length > 0
                        : reviews.length > 0
              }
              onClick={() => setActiveStep(step.id)}
            />
          ))}
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Backend integrated React workspace</p>
            <h1>{role === 'customer' ? 'Customer event planning' : role === 'vendor' ? 'Vendor operations' : 'Admin monitoring'}</h1>
          </div>
          <div className="topbar-actions">
            <div className="topbar-kpis" aria-label="Workspace summary">
              <span>{savedRequirements.length} requirements</span>
              <span>{vendors.length} vendors</span>
              <span>{bookings.length} bookings</span>
            </div>
            <button className="secondary-button" onClick={() => void refreshSharedData()} disabled={Boolean(loading)}>
              <Search size={17} />
              Refresh API
            </button>
          </div>
        </header>

        {notice ? <div className="notice">{notice}</div> : null}
        {loading ? <div className="loading-bar">{loading}</div> : null}

        {role === 'customer' ? (
          <CustomerPanel
            requirement={requirement}
            setRequirement={setRequirement}
            freeText={freeText}
            setFreeText={setFreeText}
            insights={insights}
            matches={matches}
            vendorMap={vendorMap}
            savedRequirements={savedRequirements}
            activeRequirementId={activeRequirementId}
            onAnalyze={analyzeText}
            onCreate={createRequirement}
            onLoadMatches={loadMatches}
            onInvite={sendInvitation}
            onBook={createBooking}
            onConfirmPayment={confirmPayment}
            onReview={createReview}
            bookings={bookings}
            reviews={reviews}
            session={session}
            activeStep={activeStep}
            avatar={avatar}
          />
        ) : null}

        {role === 'vendor' ? (
          <VendorPanel
            invitations={invitations}
            vendorMap={vendorMap}
            onRespond={respondInvitation}
            bookings={bookings}
            vendors={vendors}
            session={session}
            activeStep={activeStep}
          />
        ) : null}

        {role === 'admin' ? (
          <AdminPanel
            admin={admin}
            users={users}
            requirements={savedRequirements}
            vendors={vendors}
            invitations={invitations}
            bookings={bookings}
            reviews={reviews}
            onConfirmPayment={confirmPayment}
            onCompleteBooking={completeBooking}
            activeStep={activeStep}
            onApproveVendor={approveVendor}
          />
        ) : null}
      </section>
    </main>
  );
}

function AuthPage(props: {
  loading: string | null;
  notice: string;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (payload: RegisterPayload, vendorPayload?: VendorRegistrationPayload) => Promise<void>;
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('ananya.customer@happiffie.test');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Ananya Raman');
  const [phone, setPhone] = useState('+919876543210');
  const [role, setRole] = useState<Role>('customer');
  const [businessName, setBusinessName] = useState('Temple Bloom Decor');
  const [description, setDescription] = useState('Traditional South Indian wedding decorators with floral mandap expertise.');
  const [services, setServices] = useState('decorator, flower_designer, event_planner');
  const [cities, setCities] = useState('chennai, kanchipuram');
  const [specializations, setSpecializations] = useState('traditional south indian, temple theme, wedding');
  const [priceMin, setPriceMin] = useState(150000);
  const [priceMax, setPriceMax] = useState(600000);
  const [availableDates, setAvailableDates] = useState('2026-08-15, 2026-09-01');

  const submit = () => {
    if (mode === 'login') {
      void props.onLogin(email, password);
      return;
    }

    const vendorPayload =
      role === 'vendor'
        ? {
            businessName,
            experience: 5,
            rating: 4.5,
            responseRate: 90,
            verified: false,
            description,
            services: toList(services),
            specializations: toList(specializations),
            cities: toList(cities),
            travelRadius: 80,
            priceMin,
            priceMax,
            portfolio: [],
            availableDates: toList(availableDates),
          }
        : undefined;

    void props.onRegister({ name, phone, email, password, role }, vendorPayload);
  };

  const demoLogin = (nextRole: Role, nextEmail: string) => {
    setRole(nextRole);
    setEmail(nextEmail);
    setName(nextRole === 'admin' ? 'Happiffie Admin' : nextRole === 'vendor' ? 'Temple Bloom Manager' : 'Ananya Raman');
    if (nextRole === 'vendor') {
      setMode('register');
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-hero">
        <div className="brand-block auth-brand">
          <div className="brand-mark">H</div>
          <div>
            <strong>Happiffie</strong>
            <span>AI celebration marketplace</span>
          </div>
        </div>
        <h1>Plan events with role-based marketplace workflows.</h1>
        <div className="hero-metrics" aria-label="Platform workflow">
          <span><strong>10</strong> ranked vendors</span>
          <span><strong>AI</strong> requirement extraction</span>
          <span><strong>3</strong> dashboards</span>
        </div>
        <div className="auth-flow">
          <FlowStep icon={ClipboardList} text="Create Requirement" active />
          <FlowStep icon={Sparkles} text="AI Match Vendors" active />
          <FlowStep icon={Send} text="Invite & Book" active />
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
            <Mail size={17} />
            Login
          </button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
            <UserPlus size={17} />
            Register
          </button>
        </div>

        <div className="demo-logins">
          <button onClick={() => demoLogin('customer', 'ananya.customer@happiffie.test')}>Customer</button>
          <button onClick={() => demoLogin('vendor', 'temple.bloom@happiffie.test')}>Vendor</button>
          <button onClick={() => demoLogin('admin', 'admin@happiffie.test')}>Admin</button>
        </div>

        {mode === 'register' ? (
          <div className="form-grid one-column">
            <TextInput label="Name" value={name} onChange={setName} />
            <TextInput label="Phone" value={phone} onChange={setPhone} />
            <label>
              Role
              <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
                <option value="customer">Customer</option>
                <option value="vendor">Vendor</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            {role === 'vendor' ? (
              <>
                <TextInput label="Business name" value={businessName} onChange={setBusinessName} />
                <label>
                  Vendor description
                  <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} />
                </label>
                <TextInput label="Services" value={services} onChange={setServices} />
                <TextInput label="Service cities" value={cities} onChange={setCities} />
                <TextInput label="Specializations" value={specializations} onChange={setSpecializations} />
                <NumberInput label="Minimum price" value={priceMin} onChange={setPriceMin} />
                <NumberInput label="Maximum price" value={priceMax} onChange={setPriceMax} />
                <TextInput label="Available dates" value={availableDates} onChange={setAvailableDates} />
              </>
            ) : null}
          </div>
        ) : null}

        <div className="form-grid one-column">
          <TextInput label="Email" value={email} onChange={setEmail} />
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
        </div>

        {props.notice ? <div className="notice">{props.notice}</div> : null}
        {props.loading ? <div className="loading-bar">{props.loading}</div> : null}

        <button className="primary-button auth-submit" onClick={submit} disabled={Boolean(props.loading)}>
          {mode === 'login' ? 'Login & Continue' : 'Create Account'}
        </button>
      </section>
    </main>
  );
}

function CustomerPanel(props: {
  requirement: RequirementForm;
  setRequirement: (value: RequirementForm) => void;
  freeText: string;
  setFreeText: (value: string) => void;
  insights: RequirementInsights | null;
  matches: Match[];
  vendorMap: Map<string, Vendor>;
  savedRequirements: Requirement[];
  activeRequirementId: string;
  onAnalyze: () => Promise<void>;
  onCreate: () => Promise<void>;
  onLoadMatches: (id: string) => Promise<void>;
  onInvite: (vendorId: string) => Promise<void>;
  onBook: (payload: CreateBookingPayload) => Promise<void>;
  onConfirmPayment: (id: string) => Promise<void>;
  onReview: (payload: Omit<Review, 'id'>) => Promise<void>;
  bookings: Booking[];
  reviews: Review[];
  session: AuthSession;
  activeStep: WorkflowStep;
  avatar: string;
}) {
  const update = <K extends keyof RequirementForm>(key: K, value: RequirementForm[K]) => {
    props.setRequirement({ ...props.requirement, [key]: value });
  };
  const topMatch = props.matches[0];
  const customerBookings = props.bookings.filter((booking) => booking.userId === props.session.userId || booking.userId === 'usr_customer_1');
  const latestBooking = customerBookings[0];

  return (
    <div className="panel-grid customer-grid">
      {props.activeStep === 'profile' ? <section className="work-section profile-section">
        <SectionHeader icon={UserCheck} title="Customer profile" action="My flow" />
        <div className="profile-summary">
          {props.avatar ? <img className="profile-image" src={props.avatar} alt="Customer profile" /> : <div className="brand-mark wide">CU</div>}
          <div>
            <h2>{props.session.email}</h2>
            <p>Customer workspace for event requirements, AI recommendations, vendor invitations, quotes, bookings, and reviews.</p>
          </div>
        </div>
        <div className="process-strip">
          <span>Create event</span>
          <span>Review matches</span>
          <span>Invite vendor</span>
          <span>Book after quote</span>
        </div>
      </section> : null}

      {props.activeStep === 'matching' ? <section className="work-section wide-section">
        <SectionHeader icon={Sparkles} title="AI requirement capture" action="Step 1" />
        <textarea value={props.freeText} onChange={(event) => props.setFreeText(event.target.value)} rows={5} />
        <div className="button-row">
          <button className="primary-button" onClick={() => void props.onAnalyze()}>
            <Sparkles size={18} />
            Analyze Text
          </button>
        </div>
        {props.insights ? (
          <div className="insight-band">
            {props.insights.notes.map((note) => (
              <span key={note}>{note}</span>
            ))}
          </div>
        ) : null}
      </section> : null}

      {props.activeStep === 'requirement' ? <section className="work-section wide-section">
        <SectionHeader icon={ClipboardList} title="Event requirement" action="Step 2" />
        <div className="form-grid">
          <label>
            Event type
            <select value={props.requirement.eventType} onChange={(event) => update('eventType', event.target.value as RequirementForm['eventType'])}>
              {eventTypes.map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <TextInput label="City" value={props.requirement.city} onChange={(value) => update('city', value)} />
          <NumberInput label="Budget" value={props.requirement.budget} onChange={(value) => update('budget', value)} />
          <NumberInput label="Guests" value={props.requirement.guestCount} onChange={(value) => update('guestCount', value)} />
          <TextInput label="Theme" value={props.requirement.theme} onChange={(value) => update('theme', value)} />
          <label>
            Event date
            <input type="date" value={props.requirement.eventDate} onChange={(event) => update('eventDate', event.target.value)} />
          </label>
        </div>
        <label>
          Special notes
          <textarea value={props.requirement.specialNotes} onChange={(event) => update('specialNotes', event.target.value)} rows={3} />
        </label>
        <div className="button-row">
          <button className="primary-button" onClick={() => void props.onCreate()}>
            <Check size={18} />
            Save & Match Vendors
          </button>
        </div>
      </section> : null}

      {props.activeStep === 'requirement' ? <section className="work-section saved-section wide-section">
        <SectionHeader icon={CalendarDays} title="Requirements" action="Saved" />
        <div className="compact-list">
          {props.savedRequirements.map((item) => (
            <button
              className={`list-button ${props.activeRequirementId === item.id ? 'active' : ''}`}
              key={item.id}
              onClick={() => void props.onLoadMatches(item.id)}
            >
              <span>{titleCase(item.eventType.replace('_', ' '))}</span>
              <small>{titleCase(item.city)} - {item.eventDate}</small>
            </button>
          ))}
        </div>
      </section> : null}

      {props.activeStep === 'matching' ? <section className="work-section recommendation-section wide-section">
        <SectionHeader icon={BadgeCheck} title="Recommended vendors" action="Top ranked" />
        <div className="recommendation-list">
          {props.matches.map((match) => {
            const vendor = props.vendorMap.get(match.vendorId);
            return (
              <article className="vendor-row" key={match.vendorId}>
                <div className="rank-badge">#{match.rank}</div>
                <div className="vendor-main">
                  <div className="vendor-title">
                    <strong>{vendor?.businessName ?? match.vendorId}</strong>
                    <span>{match.score}% match</span>
                  </div>
                  <p>{match.reason}</p>
                  <div className="vendor-meta">
                    <span><Star size={14} /> {vendor?.rating ?? '-'} rating</span>
                    <span><UsersRound size={14} /> {vendor?.experience ?? '-'} yrs</span>
                    <span><MessageSquareText size={14} /> {vendor?.responseRate ?? '-'}% response</span>
                  </div>
                </div>
                <button className="secondary-button" onClick={() => void props.onInvite(match.vendorId)}>
                  <Send size={17} />
                  Invite
                </button>
              </article>
            );
          })}
        </div>
      </section> : null}

      {props.activeStep === 'invitation' ? <section className="work-section wide-section">
        <SectionHeader icon={Send} title="Invitation status" action="Step 3" />
        <div className="compact-list">
          {props.matches.map((match) => {
            const vendor = props.vendorMap.get(match.vendorId);
            return (
              <div className="booking-control" key={match.vendorId}>
                <div>
                  <strong>{vendor?.businessName ?? match.vendorId}</strong>
                  <small>{match.reason}</small>
                </div>
                <button className="secondary-button" onClick={() => void props.onInvite(match.vendorId)}>
                  Invite
                </button>
              </div>
            );
          })}
        </div>
      </section> : null}

      {props.activeStep === 'booking' ? <section className="work-section wide-section">
        <SectionHeader icon={IndianRupee} title="Booking and billing" action="Step 4" />
        <div className="form-grid">
          <TextInput label="Billing name" value="Ananya Raman" onChange={() => undefined} />
          <TextInput label="Billing email" value={props.session.email} onChange={() => undefined} />
          <TextInput label="Billing phone" value="+919876543210" onChange={() => undefined} />
          <label>
            Payment method
            <select defaultValue="upi">
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="netbanking">Net Banking</option>
            </select>
          </label>
        </div>
        <div className="button-row">
          <button
            className="primary-button"
            disabled={!topMatch}
            onClick={() =>
              topMatch
                ? void props.onBook({
                    vendorId: topMatch.vendorId,
                    userId: props.session.userId,
                    requirementId: props.activeRequirementId,
                    amount: props.vendorMap.get(topMatch.vendorId)?.priceMin ?? 250000,
                    paymentMethod: 'upi',
                    billingName: 'Ananya Raman',
                    billingEmail: props.session.email,
                    billingPhone: '+919876543210',
                  })
                : undefined
            }
          >
            <IndianRupee size={18} />
            Book Top Vendor
          </button>
          {latestBooking ? (
            <button className="secondary-button" onClick={() => void props.onConfirmPayment(latestBooking.id)}>
              Confirm Payment
            </button>
          ) : null}
        </div>
        <div className="compact-list spaced-list">
          {customerBookings.map((booking) => (
            <div className="status-row" key={booking.id}>
              <span>{props.vendorMap.get(booking.vendorId)?.businessName ?? booking.vendorId}</span>
              <strong>Rs {booking.amount.toLocaleString('en-IN')}</strong>
              <small>{titleCase(booking.paymentStatus)} - {titleCase(booking.bookingStatus.replace('_', ' '))}</small>
            </div>
          ))}
        </div>
      </section> : null}

      {props.activeStep === 'review' ? <section className="work-section wide-section">
        <SectionHeader icon={Star} title="Review vendor" action="Step 5" />
        <p className="muted-copy">Submit a review after the booking is confirmed or completed.</p>
        <div className="button-row">
          {latestBooking ? (
            <button
              className="secondary-button"
              onClick={() =>
                void props.onReview({
                  bookingId: latestBooking.id,
                  userId: props.session.userId,
                  vendorId: latestBooking.vendorId,
                  rating: 5,
                  review: 'Smooth planning experience and clear quotation.',
                })
              }
            >
              <Star size={17} />
              Submit 5 Star Review
            </button>
          ) : null}
        </div>
        <div className="compact-list spaced-list">
          {props.reviews
            .filter((review) => review.userId === props.session.userId || review.userId === 'usr_customer_1')
            .map((review) => (
              <div className="status-row" key={review.id}>
                <span>{props.vendorMap.get(review.vendorId)?.businessName ?? review.vendorId}</span>
                <strong>{review.rating}/5</strong>
                <small>{review.review}</small>
              </div>
            ))}
        </div>
      </section> : null}
    </div>
  );
}

function VendorPanel(props: {
  invitations: Invitation[];
  vendorMap: Map<string, Vendor>;
  bookings: Booking[];
  vendors: Vendor[];
  session: AuthSession;
  activeStep: WorkflowStep;
  onRespond: (id: string, status: 'accepted' | 'rejected') => Promise<void>;
}) {
  const activeVendor =
    props.vendors.find((vendor) => (props.session.email.includes('golden') ? vendor.id === 'ven_photo_1' : vendor.id === 'ven_decor_1')) ??
    props.vendors[0];
  const vendorInvitations = props.invitations.filter((invitation) => !activeVendor || invitation.vendorId === activeVendor.id);
  const vendorBookings = props.bookings.filter((booking) => !activeVendor || booking.vendorId === activeVendor.id);

  return (
    <div className="panel-grid vendor-grid">
      {props.activeStep === 'profile' ? <section className="work-section profile-section">
        <SectionHeader icon={Store} title="Vendor profile" action={titleCase(activeVendor?.status ?? 'active')} />
        <div className="profile-summary">
          <div className="brand-mark wide">{activeVendor?.businessName.split(' ').map((part) => part[0]).join('').slice(0, 2) ?? 'VN'}</div>
          <div>
            <h2>{activeVendor?.businessName ?? 'Vendor workspace'}</h2>
            <p>{activeVendor?.description ?? 'Manage invitations, quotes, availability, and confirmed bookings.'}</p>
          </div>
        </div>
        <div className="metric-grid">
          <Metric label="Rating" value={String(activeVendor?.rating ?? '-')} />
          <Metric label="Response" value={`${activeVendor?.responseRate ?? '-'}%`} />
          <Metric label="Experience" value={`${activeVendor?.experience ?? '-'} yrs`} />
          <Metric label="Status" value={activeVendor?.verified ? 'Verified' : 'Pending'} />
        </div>
      </section> : null}

      {props.activeStep === 'matching' ? <section className="work-section wide-section">
        <SectionHeader icon={CalendarDays} title="Availability and services" action="Vendor only" />
        <div className="process-strip">
          {(activeVendor?.services ?? []).map((service) => (
            <span key={service}>{titleCase(service.replace('_', ' '))}</span>
          ))}
        </div>
        <div className="compact-list spaced-list">
          {(activeVendor?.availableDates ?? []).map((date) => (
            <div className="status-row" key={date}>
              <span>{date}</span>
              <strong>Available</strong>
              <small>{activeVendor?.cities.map(titleCase).join(', ')}</small>
            </div>
          ))}
        </div>
      </section> : null}

      {props.activeStep === 'invitation' ? <section className="work-section wide-section">
        <SectionHeader icon={Send} title="Invitations" action="Respond" />
        <div className="invitation-list">
          {vendorInvitations.map((invitation) => {
            const vendor = props.vendorMap.get(invitation.vendorId);
            return (
              <article className="invitation-row" key={invitation.id}>
                <div>
                  <strong>{vendor?.businessName ?? invitation.vendorId}</strong>
                  <p>{invitation.requirementId} - {titleCase(invitation.status)}</p>
                </div>
                <div className="button-row tight">
                  <button className="accept-button" onClick={() => void props.onRespond(invitation.id, 'accepted')}>
                    <Check size={16} />
                  </button>
                  <button className="reject-button" onClick={() => void props.onRespond(invitation.id, 'rejected')}>
                    <X size={16} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section> : null}

      {props.activeStep === 'booking' ? <section className="work-section wide-section">
        <SectionHeader icon={IndianRupee} title="Booking pipeline" action="Quotes" />
        <div className="compact-list">
          {vendorBookings.map((booking) => (
            <div className="status-row" key={booking.id}>
              <span>{booking.id}</span>
              <strong>Rs {booking.amount.toLocaleString('en-IN')}</strong>
              <small>{titleCase(booking.bookingStatus.replace('_', ' '))}</small>
            </div>
          ))}
        </div>
      </section> : null}

      {props.activeStep === 'review' ? <section className="work-section wide-section">
        <SectionHeader icon={Star} title="Vendor reviews" action="Feedback" />
        <p className="muted-copy">Reviews submitted by customers will appear here for this vendor.</p>
      </section> : null}
    </div>
  );
}

function AdminPanel(props: {
  admin: AdminDashboard | null;
  users: User[];
  requirements: Requirement[];
  vendors: Vendor[];
  invitations: Invitation[];
  bookings: Booking[];
  reviews: Review[];
  onConfirmPayment: (id: string) => Promise<void>;
  onCompleteBooking: (id: string) => Promise<void>;
  activeStep: WorkflowStep;
  onApproveVendor: (id: string) => Promise<void>;
}) {
  const customers = props.users.filter((user) => user.role === 'customer');
  const vendorUsers = props.users.filter((user) => user.role === 'vendor');
  const reachoutStats = [
    { label: 'Sent', value: props.invitations.length },
    { label: 'Viewed', value: props.invitations.filter((item) => item.status === 'viewed').length },
    { label: 'Accepted', value: props.invitations.filter((item) => item.status === 'accepted').length },
    { label: 'Rejected', value: props.invitations.filter((item) => item.status === 'rejected').length },
  ];

  return (
    <div className="panel-grid admin-grid">
      {props.activeStep === 'profile' ? <section className="work-section metrics-section profile-section">
        <SectionHeader icon={BarChart3} title="Admin profile" action="Platform access" />
        <div className="profile-summary">
          <div className="brand-mark wide">AD</div>
          <div>
            <h2>Happiffie Admin</h2>
            <p>Admin workspace for approving vendors, monitoring customers, reachouts, bookings, billing, payments, and reviews.</p>
          </div>
        </div>
        <div className="metric-grid">
          <Metric label="Users" value={String(props.admin?.totalUsers ?? 0)} />
          <Metric label="Vendors" value={String(props.admin?.totalVendors ?? 0)} />
          <Metric label="Requirements" value={String(props.admin?.activeRequirements ?? 0)} />
          <Metric label="AI acceptance" value={`${Math.round((props.admin?.aiAcceptanceRate ?? 0) * 100)}%`} />
        </div>
      </section> : null}

      {props.activeStep === 'requirement' ? <section className="work-section wide-section">
        <SectionHeader icon={UsersRound} title="Customers" action={`${customers.length} records`} />
        <div className="compact-list">
          {customers.map((customer) => (
            <div className="status-row" key={customer.id}>
              <span>{customer.name}</span>
              <strong>{customer.phone ?? '-'}</strong>
              <small>{customer.email}</small>
            </div>
          ))}
        </div>
      </section> : null}

      {props.activeStep === 'matching' ? <section className="work-section wide-section">
        <SectionHeader icon={Store} title="Vendors" action={`${props.vendors.length} profiles`} />
        <div className="compact-list">
          {props.vendors.map((vendor) => (
            <div className="booking-control" key={vendor.id}>
              <div>
                <strong>{vendor.businessName}</strong>
                <small>{vendorUsers.find((user) => user.id === vendor.userId)?.email ?? 'Vendor account'}</small>
                <small>{vendor.rating} rating - {titleCase(vendor.status)}</small>
              </div>
              {vendor.status === 'pending' ? (
                <button className="secondary-button" onClick={() => void props.onApproveVendor(vendor.id)}>
                  Approve
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </section> : null}

      {props.activeStep === 'invitation' ? <section className="work-section wide-section">
        <SectionHeader icon={Send} title="Reachout procedure" action="Invitations" />
        <div className="metric-grid">
          {reachoutStats.map((item) => (
            <Metric key={item.label} label={item.label} value={String(item.value)} />
          ))}
        </div>
        <div className="compact-list spaced-list">
          {props.invitations.map((invitation) => (
            <div className="status-row" key={invitation.id}>
              <span>{invitation.requirementId}</span>
              <strong>{titleCase(invitation.status)}</strong>
              <small>{props.vendors.find((vendor) => vendor.id === invitation.vendorId)?.businessName ?? invitation.vendorId}</small>
            </div>
          ))}
        </div>
      </section> : null}

      {props.activeStep === 'matching' ? <section className="work-section wide-section">
        <SectionHeader icon={ClipboardList} title="Requirements queue" action="Demand" />
        <div className="compact-list">
          {props.requirements.map((requirement) => (
            <div className="status-row" key={requirement.id}>
              <span>{titleCase(requirement.eventType.replace('_', ' '))}</span>
              <strong>{titleCase(requirement.city)}</strong>
              <small>{requirement.guestCount} guests</small>
            </div>
          ))}
        </div>
      </section> : null}

      {props.activeStep === 'booking' ? <section className="work-section wide-section">
        <SectionHeader icon={IndianRupee} title="Booking control" action="Payments" />
        <div className="compact-list">
          {props.bookings.map((booking) => (
            <div className="booking-control" key={booking.id}>
              <div>
                <strong>{booking.id}</strong>
                <small>
                  {props.vendors.find((vendor) => vendor.id === booking.vendorId)?.businessName ?? booking.vendorId} - {booking.paymentMethod ?? 'upi'} -{' '}
                  {titleCase(booking.paymentStatus)} - {titleCase(booking.bookingStatus.replace('_', ' '))}
                </small>
                <small>{booking.billingName ?? 'Billing name not set'} - {booking.billingPhone ?? 'Phone not set'}</small>
              </div>
              <div className="button-row tight">
                <button className="secondary-button" onClick={() => void props.onConfirmPayment(booking.id)}>
                  Pay
                </button>
                <button className="secondary-button" onClick={() => void props.onCompleteBooking(booking.id)}>
                  Done
                </button>
              </div>
            </div>
          ))}
        </div>
      </section> : null}

      {props.activeStep === 'review' ? <section className="work-section wide-section">
        <SectionHeader icon={Star} title="Reviews" action={`${props.reviews.length} records`} />
        <div className="compact-list">
          {props.reviews.map((review) => (
            <div className="status-row" key={review.id}>
              <span>{props.vendors.find((vendor) => vendor.id === review.vendorId)?.businessName ?? review.vendorId}</span>
              <strong>{review.rating}/5</strong>
              <small>{review.review ?? 'No review text'}</small>
            </div>
          ))}
        </div>
      </section> : null}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, action }: { icon: typeof Sparkles; title: string; action: string }) {
  return (
    <div className="section-header">
      <div>
        <Icon size={19} />
        <h2>{title}</h2>
      </div>
      <span>{action}</span>
    </div>
  );
}

function FlowStep({
  icon: Icon,
  text,
  active,
  complete,
  onClick,
}: {
  icon: typeof ClipboardList;
  text: string;
  active?: boolean;
  complete?: boolean;
  onClick?: () => void;
}) {
  return (
    <button className={`flow-step ${active ? 'active' : ''} ${complete ? 'complete' : ''}`} onClick={onClick}>
      <Icon size={17} />
      <span>{text}</span>
      <ChevronRight size={15} />
    </button>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label>
      {label}
      <input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function titleCase(value: string) {
  return value
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function toList(value: string) {
  return value
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
}
