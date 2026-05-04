import { Branch } from "@/lib/generated/prisma/browser";

export type BranchFilters = {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
};

export type BranchesResponse = {
  success: boolean;
  time: string;
  message: string;
  total_branches: number;
  offset: number;
  limit: number;
  branches: Branch[];
};

export type BranchByIdResponse = {
  success: boolean;
  time: string;
  message: string;
  branch: Branch;
};
