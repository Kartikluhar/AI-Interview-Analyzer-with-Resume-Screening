import API from "./api";

export const signupUser = async (data) => {
  return API.post("/auth/signup/", data);
};

export const loginUser = async (data) => {
  return API.post("/auth/login/", data);
};

export const logoutUser = async (refresh) => {
  return API.post("/auth/logout/", {
    refresh,
  });
};
