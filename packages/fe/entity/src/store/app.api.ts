import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../utilities";

export const appApi = createApi({
  reducerPath: "appApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Users","UserInfo"],
  endpoints: () => ({}),
  });
