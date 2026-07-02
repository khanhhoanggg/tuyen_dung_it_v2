const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type AuthPayload = {
  fullName?: string;
  email: string;
  password: string;
};

// Kiểu trả về chung (có thể mở rộng sau)
type AuthResponse = {
  message?: string;
  user?: any;        // Bạn có thể thay bằng type User cụ thể
  token?: string;
  [key: string]: any;
};

export async function authRequest(
  path: "/api/auth/login" | "/api/auth/register", 
  payload: AuthPayload
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Giữ cookie/session
      body: JSON.stringify(payload),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok) {
      // Xử lý message có thể là string hoặc array
      const errorMessage = Array.isArray(data.message) 
        ? data.message.join(", ") 
        : data.message || "Không thể xử lý yêu cầu";

      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    // Xử lý lỗi mạng hoặc lỗi parse JSON
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Lỗi kết nối đến server. Vui lòng thử lại sau.");
  }
}