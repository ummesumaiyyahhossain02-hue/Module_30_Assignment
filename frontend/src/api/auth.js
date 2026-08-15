import client from "./client";

export function register(data) {
  return client.post("/auth/register/", data).then((res) => res.data);
}

export function login(username, password) {
  return client.post("/auth/login/", { username, password }).then((res) => res.data);
}

export function fetchMe() {
  return client.get("/auth/me/").then((res) => res.data);
}
