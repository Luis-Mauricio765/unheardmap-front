import api from "./client";

export async function login({ username, password }) {
  const { data } = await api.post("/api/auth/login", { username, password });
  return data; // { token }
}

export async function register({ username, email, password }) {
  const { data } = await api.post("/api/auth/register", { username, email, password });
  return data; // { token }
}
