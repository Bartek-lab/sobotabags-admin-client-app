import { createSimpleRestDataProvider } from "@refinedev/rest/simple-rest";
import { API_URL } from "./constants";
import { TOKEN_KEY } from "./auth";

// The simple-rest provider's buildHeaders only reads params.meta.headers --
// `getAuthHeader` in its default options is not actually wired into any
// request path in this version of @refinedev/rest (checked the installed
// source directly). Attaching the token via a ky beforeRequest hook is the
// mechanism that's actually used for every call.
export const { dataProvider, kyInstance } = createSimpleRestDataProvider({
  apiURL: API_URL,
  kyOptions: {
    hooks: {
      beforeRequest: [
        (request) => {
          const token = localStorage.getItem(TOKEN_KEY);
          if (token) {
            request.headers.set("Authorization", `Bearer ${token}`);
          }
        },
      ],
    },
  },
});
