const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// ---------- Kiểu dữ liệu dùng chung ----------

export type Role = "candidate" | "company" | "admin";

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
};

export type Job = {
  _id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  level: "Intern" | "Fresher" | "Junior" | "Middle" | "Senior" | "Lead";
  type: "Onsite" | "Hybrid" | "Remote";
  summary: string;
  skills: string[];
  responsibilities: string[];
  requirements: string[];
  status: "open" | "closed";
  postedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type ApplicationStatus = "new" | "interviewing" | "offered" | "rejected";

export type Application = {
  _id: string;
  job: Job;
  candidate: string | User;
  status: ApplicationStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
};

export type SavedJob = {
  _id: string;
  job: Job;
  candidate: string;
  createdAt: string;
};

type ApiResponse<T> = {
  code: string;
  message: string | string[];
  data?: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

// ---------- Quản lý token đăng nhập ----------

const TOKEN_KEY = "devjobs_token";
const USER_KEY = "devjobs_user";

export function saveSession(token: string, user: User) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ---------- Hàm gọi API dùng chung ----------

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  let data: ApiResponse<T>;
  try {
    data = await response.json();
  } catch {
    throw new Error("Không thể kết nối đến server. Vui lòng thử lại sau.");
  }

  if (!response.ok) {
    const errorMessage = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message || "Không thể xử lý yêu cầu";
    throw new Error(errorMessage);
  }

  return data.data as T;
}

// ---------- Auth ----------

type AuthPayload = {
  fullName?: string;
  email: string;
  password: string;
  role?: Role;
};

type LoginResult = {
  accessToken: string;
  user: User;
};

export async function login(payload: {
  email: string;
  password: string;
}): Promise<LoginResult> {
  const result = await request<LoginResult>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  saveSession(result.accessToken, result.user);
  return result;
}

export async function register(payload: AuthPayload): Promise<User> {
  return request<User>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMe(): Promise<User> {
  return request<User>("/api/auth/me");
}

export function logout() {
  clearSession();
}

// ---------- Jobs ----------

export type JobQuery = {
  q?: string;
  location?: string;
  skill?: string;
  level?: string;
  type?: string;
  page?: number;
  limit?: number;
};

export async function listJobs(
  query: JobQuery = {}
): Promise<{ jobs: Job[]; meta?: ApiResponse<Job[]>["meta"] }> {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}/api/jobs?${params.toString()}`, {
    headers,
  });
  const data: ApiResponse<Job[]> = await response.json();

  if (!response.ok) {
    const errorMessage = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message || "Không thể tải danh sách việc làm";
    throw new Error(errorMessage);
  }

  return { jobs: data.data || [], meta: data.meta };
}

export async function getJob(id: string): Promise<Job> {
  return request<Job>(`/api/jobs/${id}`);
}

export async function getMyJobs(): Promise<Job[]> {
  const result = await request<Job[]>("/api/jobs/mine/list");
  return result || [];
}

export type JobInput = {
  title: string;
  company: string;
  location: string;
  salary: string;
  level: Job["level"];
  type: Job["type"];
  summary: string;
  skills: string[];
  responsibilities: string[];
  requirements: string[];
  status?: Job["status"];
};

export async function createJob(payload: JobInput): Promise<Job> {
  return request<Job>("/api/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateJob(
  id: string,
  payload: Partial<JobInput>
): Promise<Job> {
  return request<Job>(`/api/jobs/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteJob(id: string): Promise<void> {
  await request<void>(`/api/jobs/${id}`, { method: "DELETE" });
}

// ---------- Applications ----------

export async function applyToJob(
  jobId: string,
  message?: string
): Promise<Application> {
  return request<Application>(`/api/jobs/${jobId}/apply`, {
    method: "POST",
    body: JSON.stringify({ message: message || "" }),
  });
}

export async function getJobApplications(
  jobId: string
): Promise<Application[]> {
  const result = await request<Application[]>(
    `/api/jobs/${jobId}/applications`
  );
  return result || [];
}

export async function getMyApplications(): Promise<Application[]> {
  const result = await request<Application[]>("/api/applications/me");
  return result || [];
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus
): Promise<Application> {
  return request<Application>(`/api/applications/${applicationId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export type CompanyStats = {
  totalJobs: number;
  new: number;
  interviewing: number;
  offered: number;
  rejected: number;
};

export async function getCompanyStats(): Promise<CompanyStats> {
  return request<CompanyStats>("/api/applications/stats");
}

// ---------- Saved jobs ----------

export async function saveJob(jobId: string): Promise<SavedJob> {
  return request<SavedJob>(`/api/jobs/${jobId}/save`, { method: "POST" });
}

export async function unsaveJob(jobId: string): Promise<void> {
  await request<void>(`/api/jobs/${jobId}/save`, { method: "DELETE" });
}

export async function listSavedJobs(): Promise<SavedJob[]> {
  const result = await request<SavedJob[]>("/api/saved-jobs");
  return result || [];
}