import client from "./client";

export function listPatients() {
  return client.get("/patients/").then((res) => res.data);
}

export function createPatient(data) {
  return client.post("/patients/", data).then((res) => res.data);
}

export function updatePatient(id, data) {
  return client.patch(`/patients/${id}/`, data).then((res) => res.data);
}

export function deletePatient(id) {
  return client.delete(`/patients/${id}/`);
}
