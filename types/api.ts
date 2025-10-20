import type { Link } from "@/types/link";

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  error: true;
  message: string;
};

export type LinksCounts = { all?: number; active?: number; expired?: number };

export type LinksListPaginated = {
  items: Link[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  counts?: LinksCounts;
};

export type LinksList = Link[] | LinksListPaginated;
