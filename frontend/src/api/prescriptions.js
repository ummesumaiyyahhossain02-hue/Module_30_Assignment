import client from "./client";

export function listPrescriptions() {
  return client.get("/prescriptions/").then((res) => res.data);
}

export function createPrescription(data) {
  return client.post("/prescriptions/", data).then((res) => res.data);
}

export function updatePrescription(id, data) {
  return client.put(`/prescriptions/${id}/`, data).then((res) => res.data);
}

export function deletePrescription(id) {
  return client.delete(`/prescriptions/${id}/`);
}
