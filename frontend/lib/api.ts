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
  rating?: number;
  internalNote?: string;
  tags: string[];
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

let refreshingPromise: Promise<string | null> | null = null;

async function tryRefreshToken(): Promise<string | null> {
  if (!refreshingPromise) {
    refreshingPromise = fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const json = await res.json();
        const newToken = json?.data?.accessToken as string | undefined;
        if (newToken) {
          localStorage.setItem(TOKEN_KEY, newToken);
          return newToken;
        }
        return null;
      })
      .catch(() => null)
      .finally(() => {
        refreshingPromise = null;
      });
  }
  return refreshingPromise;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  isRetry = false
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
    credentials: "include",
  });

  if (response.status === 401 && !isRetry && path !== "/api/auth/refresh") {
    const newToken = await tryRefreshToken();
    if (newToken) {
      return request<T>(path, options, true);
    }
    clearSession();
  }

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
export async function logout(): Promise<void> {
  try {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } finally {
    clearSession();
  }
}

export async function getMe(): Promise<User> {
  return request<User>("/api/auth/me");
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

// ---------- ATS/CRM: đánh giá + ghi chú nội bộ ----------

export type ApplicationAtsInput = {
  rating?: number;
  internalNote?: string;
  tags?: string[];
};

export async function updateApplicationAts(
  applicationId: string,
  payload: ApplicationAtsInput
): Promise<Application> {
  return request<Application>(`/api/applications/${applicationId}/ats`, {
    method: "PATCH",
    body: JSON.stringify(payload),
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
  const result = await request<SavedJob[]>("/api/job-activities/saved");
  return result || [];
}
// ---------- Candidate profile ----------

export type Experience = {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
};

export type Education = {
  school: string;
  major: string;
  startDate: string;
  endDate?: string;
};

export type CandidateProfile = {
  _id: string;
  user: string;
  avatarUrl?: string;
  phone?: string;
  headline?: string;
  bio?: string;
  skills: string[];
  experiences: Experience[];
  educations: Education[];
  cvUrl?: string;
  cvOriginalName?: string;
  cvUploadedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type CandidateProfileInput = {
  avatarUrl?: string;
  phone?: string;
  headline?: string;
  bio?: string;
  skills: string[];
  experiences: Experience[];
  educations: Education[];
};

export async function getMyCandidateProfile(): Promise<CandidateProfile | null> {
  return request<CandidateProfile | null>("/api/candidate-profile/me");
}

export async function updateMyCandidateProfile(
  payload: CandidateProfileInput
): Promise<CandidateProfile> {
  return request<CandidateProfile>("/api/candidate-profile/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function uploadMyCv(file: File): Promise<CandidateProfile> {
  const formData = new FormData();
  formData.append("cv", file);

  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api/candidate-profile/me/cv`, {
    method: "POST",
    headers,
    body: formData,
  });

  let data: ApiResponse<CandidateProfile>;
  try {
    data = await response.json();
  } catch {
    throw new Error("Không thể kết nối đến server. Vui lòng thử lại sau.");
  }

  if (!response.ok) {
    const errorMessage = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message || "Không thể upload CV";
    throw new Error(errorMessage);
  }

  return data.data as CandidateProfile;
}

// ---------- Candidate preference ----------

export type CandidatePreference = {
  _id: string;
  user: string;
  desiredSkills: string[];
  desiredLocations: string[];
  desiredLevel?: Job["level"];
  desiredType?: Job["type"];
  minSalary?: number;
  maxSalary?: number;
  isOpenToWork: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CandidatePreferenceInput = {
  desiredSkills: string[];
  desiredLocations: string[];
  desiredLevel?: Job["level"];
  desiredType?: Job["type"];
  minSalary?: number;
  maxSalary?: number;
  isOpenToWork: boolean;
};

export async function getMyCandidatePreference(): Promise<CandidatePreference | null> {
  return request<CandidatePreference | null>("/api/candidate-preference/me");
}

export async function updateMyCandidatePreference(
  payload: CandidatePreferenceInput
): Promise<CandidatePreference> {
  return request<CandidatePreference>("/api/candidate-preference/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
// ---------- Company profile ----------

export type CompanySize = "1-10" | "11-50" | "51-200" | "201-500" | "500+";

export type CompanyProfile = {
  _id: string;
  user: string;
  companyName: string;
  logoUrl?: string;
  website?: string;
  industry?: string;
  companySize?: CompanySize;
  description?: string;
  foundedYear?: number;
  createdAt: string;
  updatedAt: string;
};

export type CompanyProfileInput = {
  companyName: string;
  logoUrl?: string;
  website?: string;
  industry?: string;
  companySize?: CompanySize;
  description?: string;
  foundedYear?: number;
};

export async function getMyCompanyProfile(): Promise<CompanyProfile | null> {
  return request<CompanyProfile | null>("/api/company-profile/me");
}

export async function updateMyCompanyProfile(
  payload: CompanyProfileInput
): Promise<CompanyProfile> {
  return request<CompanyProfile>("/api/company-profile/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
// ---------- Vietnam locations (danh mục dùng chung) ----------

export type VietnamLocation = {
  _id: string;
  name: string;
  region: "Bac" | "Trung" | "Nam";
};

export async function listVietnamLocations(): Promise<VietnamLocation[]> {
  const result = await request<VietnamLocation[]>("/api/vietnam-locations");
  return result || [];
}

// ---------- Company locations ----------

export type CompanyLocation = {
  _id: string;
  companyProfile: string;
  vietnamLocation: VietnamLocation;
  addressDetail?: string;
  isHeadquarters: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CompanyLocationInput = {
  vietnamLocation: string;
  addressDetail?: string;
  isHeadquarters: boolean;
};

export async function listMyCompanyLocations(): Promise<CompanyLocation[]> {
  const result = await request<CompanyLocation[]>("/api/company-locations/mine");
  return result || [];
}

export async function addMyCompanyLocation(
  payload: CompanyLocationInput
): Promise<CompanyLocation> {
  return request<CompanyLocation>("/api/company-locations/mine", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteMyCompanyLocation(id: string): Promise<void> {
  await request<void>(`/api/company-locations/mine/${id}`, { method: "DELETE" });
}

// ---------- PHỎNG VẤN (INTERVIEWS) ----------
export type InterviewType = "onsite" | "online";

export type InterviewSchedule = {
  _id: string;
  job: Job | string;
  application: string;
  candidate: User | string;
  company: string;
  scheduledAt: string;
  durationMinutes: number;
  type: InterviewType;
  meetingLink?: string;
  address?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type InterviewInput = {
  scheduledAt: string;
  durationMinutes: number;
  type: InterviewType;
  meetingLink?: string;
  address?: string;
  note?: string;
};

export async function createInterview(
  applicationId: string,
  payload: InterviewInput
): Promise<InterviewSchedule> {
  return request<InterviewSchedule>(`/api/applications/${applicationId}/interviews`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listCompanyInterviews(): Promise<InterviewSchedule[]> {
  const result = await request<InterviewSchedule[]>("/api/interviews/company/mine");
  return result || [];
}

export async function listMyInterviews(): Promise<InterviewSchedule[]> {
  const result = await request<InterviewSchedule[]>("/api/interviews/mine");
  return result || [];
}

export async function updateInterview(
  id: string,
  payload: Partial<InterviewInput>
): Promise<InterviewSchedule> {
  return request<InterviewSchedule>(`/api/interviews/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// ---------- THƯ MỜI NHẬN VIỆC (OFFERS) ----------
export type OfferStatus = "draft" | "sent" | "accepted" | "declined" | "withdrawn";

export type Offer = {
  _id: string;
  job: Job | string;
  application: string;
  candidate: User | string;
  company: string;
  position: string;
  salary: string;
  startDate: string;
  content?: string;
  status: OfferStatus;
  candidateSignature?: string;
  signedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type OfferInput = {
  position: string;
  salary: string;
  startDate: string;
  content?: string;
  status: "draft" | "sent";
};

export async function createOffer(
  applicationId: string,
  payload: OfferInput
): Promise<Offer> {
  return request<Offer>(`/api/applications/${applicationId}/offers`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listCompanyOffers(): Promise<Offer[]> {
  const result = await request<Offer[]>("/api/offers/company/mine");
  return result || [];
}

export async function listMyOffers(): Promise<Offer[]> {
  const result = await request<Offer[]>("/api/offers/mine");
  return result || [];
}

export async function getOffer(id: string): Promise<Offer> {
  return request<Offer>(`/api/offers/${id}`);
}

export async function updateOffer(
  id: string,
  payload: Partial<OfferInput>
): Promise<Offer> {
  return request<Offer>(`/api/offers/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function sendOffer(id: string): Promise<Offer> {
  return request<Offer>(`/api/offers/${id}/send`, { method: "PATCH" });
}

export async function withdrawOffer(id: string): Promise<Offer> {
  return request<Offer>(`/api/offers/${id}/withdraw`, { method: "PATCH" });
}

export async function signOffer(
  id: string,
  candidateSignature: string
): Promise<Offer> {
  return request<Offer>(`/api/offers/${id}/sign`, {
    method: "PATCH",
    body: JSON.stringify({ candidateSignature }),
  });
}

export async function declineOffer(id: string): Promise<Offer> {
  return request<Offer>(`/api/offers/${id}/decline`, { method: "PATCH" });
}

// ---------- TIN NHẮN (MESSAGES) ----------
export type Message = {
  _id: string;
  application: string;
  job: string;
  sender: User | string;
  recipient: User | string;
  content: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type Conversation = {
  _id: string; // applicationId
  lastMessage: Message;
  unreadCount: number;
};

export async function sendMessage(
  applicationId: string,
  content: string
): Promise<Message> {
  return request<Message>(`/api/applications/${applicationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export async function getConversation(
  applicationId: string
): Promise<Message[]> {
  const result = await request<Message[]>(`/api/applications/${applicationId}/messages`);
  return result || [];
}

export async function listCompanyConversations(): Promise<Conversation[]> {
  const result = await request<Conversation[]>("/api/messages/company/conversations");
  return result || [];
}

// ---------- LỜI MỜI TUYỂN DỤNG (JOB INVITATIONS) ----------
export type InvitationStatus = "pending" | "accepted" | "declined";

export type JobInvitation = {
  _id: string;
  job: Job;
  invitedBy: string | User;
  candidate: string | User;
  message?: string;
  status: InvitationStatus;
  createdAt: string;
  updatedAt: string;
};

export async function inviteCandidate(
  jobId: string,
  candidateEmail: string,
  message?: string
): Promise<JobInvitation> {
  return request<JobInvitation>(`/api/jobs/${jobId}/invitations`, {
    method: "POST",
    body: JSON.stringify({ candidateEmail, message }),
  });
}

export async function listJobInvitations(jobId: string): Promise<JobInvitation[]> {
  const result = await request<JobInvitation[]>(`/api/jobs/${jobId}/invitations`);
  return result || [];
}

export async function listMyInvitations(): Promise<JobInvitation[]> {
  const result = await request<JobInvitation[]>("/api/invitations/mine");
  return result || [];
}

export async function respondToInvitation(
  id: string,
  status: "accepted" | "declined"
): Promise<JobInvitation> {
  return request<JobInvitation>(`/api/invitations/${id}/respond`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

// ---------- HỒ SƠ ỨNG VIÊN CHO CÔNG TY (COMPANY VIEWING PROFILE) ----------
export async function getCandidateProfile(userId: string): Promise<CandidateProfile | null> {
  return request<CandidateProfile | null>(`/api/candidate-profile/${userId}`);
}