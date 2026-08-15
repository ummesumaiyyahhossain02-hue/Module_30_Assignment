import client from "./client";

export function listDepartments() {
  return client.get("/departments/").then((res) => res.data);
}

export function createDepartment(data) {
  return client.post("/departments/", data).then((res) => res.data);
}

export function updateDepartment(id, data) {
  return client.patch(`/departments/${id}/`, data).then((res) => res.data);
}

export function deleteDepartment(id) {
  return client.delete(`/departments/${id}/`);
}
