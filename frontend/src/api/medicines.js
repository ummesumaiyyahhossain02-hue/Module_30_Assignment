import client from "./client";

export function listMedicines(search = "") {
  const params = search ? { search } : {};
  return client.get("/medicines/", { params }).then((res) => res.data);
}

export function createMedicine(data) {
  return client.post("/medicines/", data).then((res) => res.data);
}

export function updateMedicine(id, data) {
  return client.patch(`/medicines/${id}/`, data).then((res) => res.data);
}

export function deleteMedicine(id) {
  return client.delete(`/medicines/${id}/`);
}
