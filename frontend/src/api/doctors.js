import client from "./client";

export function listDoctors(params = {}) {
  return client.get("/doctors/", { params }).then((res) => res.data);
}

export function createDoctor(data) {
  return client.post("/doctors/", data).then((res) => res.data);
}

export function updateDoctor(id, data) {
  return client.patch(`/doctors/${id}/`, data).then((res) => res.data);
}

export function deleteDoctor(id) {
  return client.delete(`/doctors/${id}/`);
}

export function setDoctorAvailability(id, isAvailable) {
  return client
    .patch(`/doctors/${id}/set_availability/`, { is_available: isAvailable })
    .then((res) => res.data);
}
