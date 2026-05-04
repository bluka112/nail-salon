import { Prisma } from "@/lib/generated/prisma/browser";
import { BranchByIdResponse, BranchesResponse, BranchFilters } from "./types";
import axios from "axios";

export async function getBranches(
  filters: BranchFilters,
): Promise<BranchesResponse> {
  const response = await axios.get("/api/branches", { params: filters });
  const data = response.data;
  return data;
}

export async function getBranchById(id: string): Promise<BranchByIdResponse> {
  const response = await axios.get(`/api/branches/${id}`);
  const data = response.data;
  return data;
}

export async function createBranch(data: Prisma.BranchCreateInput) {
  const response = await axios.post("/api/branches", {
    ...data,
    longitude: Number(data.longitude),
    latitude: Number(data.latitude),
  });
  const resData = response.data;
  return resData;
}

export async function updateBranch(id: string, data: Prisma.BranchUpdateInput) {
  const response = await axios.patch(`/api/branches/${id}`, data);
  const resData = response.data;
  return resData;
}

export async function deleteBranch(id: string) {
  const response = await axios.delete(`/api/branches/${id}`);
  const resData = response.data;
  return resData;
}
