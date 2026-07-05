const API_PREFIX = "/api";
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

  return fetch(`${API_PREFIX}${path}`, {
    ...options,
    headers,
    body,
    credentials: "include",
  });
}

async function parse(response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
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
