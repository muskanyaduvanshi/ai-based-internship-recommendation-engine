
import type { Student, Internship, Interaction, Recruiter, Job, Application } from '../types';
// mockData is only ever used as the ONE-TIME seed for a brand new browser.
// Once localStorage has been initialized, it is the single source of truth.
import {
  students as seedStudents,
  internships as seedInternships,
  interactions as seedInteractions,
  recruiters as seedRecruiters,
  jobs as seedJobs,
  applications as seedApplications,
} from '../data/mockData';

// Simulates a network delay so existing loading states keep working exactly as before.
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const hasLocalStorage = typeof window !== 'undefined' && !!window.localStorage;

const KEYS = {
  students: 'pmis_students',
  internships: 'pmis_internships',
  interactions: 'pmis_interactions',
  recruiters: 'pmis_recruiters',
  jobs: 'pmis_jobs',
  applications: 'pmis_applications',
  initialized: 'pmis_initialized',
  session: 'pmis_session',
} as const;

// --- Low-level, guarded localStorage helpers -------------------------------
// Every read/write is wrapped in try/catch. If localStorage is unavailable
// (private browsing, quota exceeded, disabled by the user, etc.) the app
// falls back to the in-memory `fallback` value for that call instead of
// crashing, and logs a warning so it's easy to diagnose.

function readCollection<T>(key: string, fallback: T[]): T[] {
  if (!hasLocalStorage) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T[];
  } catch (e) {
    console.error(`[storage] Failed to read "${key}" from localStorage. Using fallback data.`, e);
    return fallback;
  }
}

function writeCollection<T>(key: string, data: T[]): void {
  if (!hasLocalStorage) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`[storage] Failed to write "${key}" to localStorage. This change will not persist across refreshes.`, e);
  }
}

/**
 * Seeds localStorage from data/mockData.ts the FIRST time the app ever runs
 * in a given browser. On every later launch this is a no-op, so localStorage
 * (not mockData.ts) is always the source of truth once it exists -- newly
 * registered students/recruiters, new jobs, and new applications are never
 * clobbered by this.
 */
function ensureInitialized(): void {
  if (!hasLocalStorage) return;
  try {
    if (window.localStorage.getItem(KEYS.initialized) === 'true') return;
    writeCollection(KEYS.students, seedStudents);
    writeCollection(KEYS.internships, seedInternships);
    writeCollection(KEYS.interactions, seedInteractions);
    writeCollection(KEYS.recruiters, seedRecruiters);
    writeCollection(KEYS.jobs, seedJobs);
    writeCollection(KEYS.applications, seedApplications);
    window.localStorage.setItem(KEYS.initialized, 'true');
  } catch (e) {
    console.error('[storage] Failed to initialize localStorage seed data.', e);
  }
}
ensureInitialized();

const nextId = <T,>(items: T[], idOf: (item: T) => number): number =>
  items.length ? Math.max(...items.map(idOf)) + 1 : 1;

// --- Student API Functions ---------------------------------------------

export const fetchStudents = async (): Promise<Student[]> => {
  await sleep(500);
  return readCollection<Student>(KEYS.students, seedStudents);
};

export const fetchInternships = async (): Promise<Internship[]> => {
  await sleep(500);
  return readCollection<Internship>(KEYS.internships, seedInternships);
};

export const fetchInteractions = async (): Promise<Interaction[]> => {
  await sleep(500);
  return readCollection<Interaction>(KEYS.interactions, seedInteractions);
};

// Replaces the whole interactions collection. Interactions (views/applications
// from the student side) don't have per-record endpoints in this app, so the
// caller computes the next full array and hands it off to be persisted.
export const saveInteractions = async (allInteractions: Interaction[]): Promise<void> => {
  writeCollection(KEYS.interactions, allInteractions);
};

export const createStudent = async (userData: { name: string; email: string }): Promise<Student> => {
  await sleep(700);
  const existing = readCollection<Student>(KEYS.students, seedStudents);
  if (existing.some(s => s.email.toLowerCase() === userData.email.toLowerCase())) {
    throw new Error('An account with this email already exists. Please log in instead.');
  }
  const newStudent: Student = {
    student_id: nextId(existing, s => s.student_id),
    name: userData.name,
    email: userData.email,
    skills: [],
    interests: [],
    academic_score: null,
    past_internship_views: [],
    resumeText: '',
    softSkills: [],
    skillProficiencies: [],
    location: null,
    education: [],
    achievements: [],
    certificates: [],
  };
  writeCollection(KEYS.students, [...existing, newStudent]);
  return newStudent;
};

// Persists an edited/AI-updated student profile (used by profile edits and
// resume-analysis results).
export const updateStudent = async (updatedStudent: Student): Promise<Student> => {
  await sleep(300);
  const existing = readCollection<Student>(KEYS.students, seedStudents);
  const idx = existing.findIndex(s => s.student_id === updatedStudent.student_id);
  if (idx === -1) {
    throw new Error('Student not found');
  }
  const next = [...existing];
  next[idx] = updatedStudent;
  writeCollection(KEYS.students, next);
  return updatedStudent;
};

// --- Recruiter API Functions ---------------------------------------------

export const fetchRecruiters = async (): Promise<Recruiter[]> => {
  await sleep(500);
  return readCollection<Recruiter>(KEYS.recruiters, seedRecruiters);
};

export const fetchJobs = async (): Promise<Job[]> => {
  await sleep(500);
  return readCollection<Job>(KEYS.jobs, seedJobs);
};

export const fetchApplications = async (): Promise<Application[]> => {
  await sleep(500);
  return readCollection<Application>(KEYS.applications, seedApplications);
};

export const postJob = async (jobData: Omit<Job, 'job_id' | 'postedDate' | 'isActive'>): Promise<Job> => {
  await sleep(700);
  const existing = readCollection<Job>(KEYS.jobs, seedJobs);
  const newJob: Job = {
    ...jobData,
    job_id: nextId(existing, j => j.job_id),
    postedDate: new Date().toISOString(),
    isActive: true,
  };
  writeCollection(KEYS.jobs, [...existing, newJob]);
  return newJob;
};

export const createApplication = async (app: Application): Promise<Application> => {
  await sleep(400);
  const existing = readCollection<Application>(KEYS.applications, seedApplications);
  writeCollection(KEYS.applications, [...existing, app]);
  return app;
};

export const updateApplicationStatus = async (applicationId: number, status: Application['status']): Promise<Application> => {
  await sleep(400);
  const existing = readCollection<Application>(KEYS.applications, seedApplications);
  const appIndex = existing.findIndex(app => app.application_id === applicationId);
  if (appIndex === -1) {
    throw new Error('Application not found');
  }
  const next = [...existing];
  next[appIndex] = { ...next[appIndex], status };
  writeCollection(KEYS.applications, next);
  return { ...next[appIndex] };
};

export const createRecruiter = async (userData: { name: string; email: string; company: string }): Promise<Recruiter> => {
  await sleep(700);
  const existing = readCollection<Recruiter>(KEYS.recruiters, seedRecruiters);
  if (existing.some(r => r.email.toLowerCase() === userData.email.toLowerCase())) {
    throw new Error('An account with this email already exists. Please log in instead.');
  }
  const newRecruiter: Recruiter = {
    recruiter_id: nextId(existing, r => r.recruiter_id),
    name: userData.name,
    email: userData.email,
    company: userData.company,
  };
  writeCollection(KEYS.recruiters, [...existing, newRecruiter]);
  return newRecruiter;
};

// --- Session persistence ---------------------------------------------------
// Tracks who is currently logged in (student or recruiter) so a page refresh
// or browser restart can restore the session automatically. Logging out only
// ever clears this key -- it never touches the stored accounts/data above.

export type Session = { type: 'student'; id: number } | { type: 'recruiter'; id: number };

export const getSession = (): Session | null => {
  if (!hasLocalStorage) return null;
  try {
    const raw = window.localStorage.getItem(KEYS.session);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch (e) {
    console.error('[storage] Failed to read session.', e);
    return null;
  }
};

export const setSession = (session: Session): void => {
  if (!hasLocalStorage) return;
  try {
    window.localStorage.setItem(KEYS.session, JSON.stringify(session));
  } catch (e) {
    console.error('[storage] Failed to persist session.', e);
  }
};

export const clearSession = (): void => {
  if (!hasLocalStorage) return;
  try {
    window.localStorage.removeItem(KEYS.session);
  } catch (e) {
    console.error('[storage] Failed to clear session.', e);
  }
};
