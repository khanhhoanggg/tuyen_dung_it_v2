const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type AuthPayload = {
  fullName?: string;
  email: string;
  password: string;
};

export async function authRequest(path: "/api/auth/login" | "/api/auth/register", payload: AuthPayload) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const message = Array.isArray(data.message) ? data.message.join(", ") : data.message;
    throw new Error(message || "Khong the xu ly yeu cau");
  }

  return data;
}
