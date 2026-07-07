function resolveApiPrefix(value) {
  const configured = value?.trim().replace(/\/+$/, "");
  if (!configured) return "/api";
  return configured.endsWith("/api") ? configured : `${configured}/api`;
}

const API_PREFIX = resolveApiPrefix(import.meta.env?.VITE_API_URL);
let accessToken = localStorage.getItem("lms_access_token") || "";

export class ApiError extends Error {
  constructor(status, data) {
    super(data?.message || "Có lỗi xảy ra");
    this.status = status;
    this.data = data;
  }
}

export function setAccessToken(token) {
  accessToken = token || "";
  if (accessToken) localStorage.setItem("lms_access_token", accessToken);
  else localStorage.removeItem("lms_access_token");
}

export function hasAccessToken() {
  return Boolean(accessToken);
}

async function send(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  let body = options.body;
  if (body !== undefined && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(body);
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 20_000);

  try {
    return await fetch(`${API_PREFIX}${path}`, {
      ...options,
      headers,
      body,
      credentials: "include",
      signal: options.signal || controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new ApiError(408, {
        message: "Backend phản hồi quá lâu. Vui lòng thử lại.",
      });
    }
    throw new ApiError(0, {
      message:
        "Không thể kết nối tới backend. Hãy kiểm tra URL API, CORS và trạng thái server.",
    });
  } finally {
    window.clearTimeout(timeout);
  }
}

async function parse(response) {
  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      const preview = text.replace(/\s+/g, " ").trim().slice(0, 120);
      const missingApi = response.status === 404 && /NOT_FOUND|The page could not/i.test(text);
      throw new ApiError(response.status || 502, {
        message: missingApi
          ? "Không tìm thấy backend API. Hãy cấu hình VITE_API_URL trên môi trường deploy."
          : `Backend trả về dữ liệu không phải JSON${preview ? `: ${preview}` : "."}`,
        responseType: response.headers.get("content-type") || "unknown",
      });
    }
  }

  if (!response.ok) throw new ApiError(response.status, data);
  return data;
}

export async function api(path, options = {}, retry = true) {
  const response = await send(path, options);

  if (
    response.status === 401 &&
    retry &&
    !path.startsWith("/auth/login") &&
    !path.startsWith("/auth/refresh")
  ) {
    try {
      const refreshed = await parse(
        await send("/auth/refresh", { method: "POST", body: {} }),
      );
      setAccessToken(refreshed.accessToken);
      return api(path, options, false);
    } catch {
      setAccessToken("");
    }
  }

  return parse(response);
}
