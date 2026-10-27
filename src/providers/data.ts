import { createSimpleRestDataProvider } from "@refinedev/rest/simple-rest";
import { API_URL } from "./constants";

// Auth now travels as an httpOnly cookie (see providers/auth.ts) -- `credentials:
// "include"` is what makes ky/fetch actually send it cross-site, replacing the
// old beforeRequest hook that attached a Bearer header from localStorage.
export const { dataProvider, kyInstance } = createSimpleRestDataProvider({
  apiURL: API_URL,
  kyOptions: {
    credentials: "include",
  },
});
