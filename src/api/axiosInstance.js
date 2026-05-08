import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

const redirectToLogin = () => {
  localStorage.clear();
  window.location.href = "/login";
};

// Auto refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // skip retry for auth endpoints to avoid infinite loop
    const isAuthUrl = original.url?.includes("/auth/");
    if (error.response?.status === 401 && !original._retry && !isAuthUrl) {
      if (isRefreshing) {
        // queue other failed requests while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          })
          .catch((err) => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          "http://localhost:8080/api/auth/refresh",
          {},
          { withCredentials: true }
        );
        localStorage.setItem("accessToken", data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        processQueue(null, data.accessToken);
        return api(original);
      } catch {
        processQueue(new Error("Session expired"));
        redirectToLogin();
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
