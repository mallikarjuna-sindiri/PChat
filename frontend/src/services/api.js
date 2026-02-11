export const API_URL = import.meta.env.VITE_API_URL;

export const apiFetch = async (path, options = {}) => {
  const { token, headers, ...rest } = options;
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    ...rest
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || "Request failed");
  }
  return response.json();
};
