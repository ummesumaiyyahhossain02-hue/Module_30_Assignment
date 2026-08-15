import client from "./client";

export function listBills() {
  return client.get("/billing/").then((res) => res.data);
}

export function createBill(data) {
  return client.post("/billing/", data).then((res) => res.data);
}

export function updateBill(id, data) {
  return client.patch(`/billing/${id}/`, data).then((res) => res.data);
}

export function deleteBill(id) {
  return client.delete(`/billing/${id}/`);
}

export function markBillPaid(id) {
  return client.patch(`/billing/${id}/mark_paid/`, {}).then((res) => res.data);
}
