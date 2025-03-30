import tabRouteReducer from "../utility/routeReducers";
import authReducer from "../components/auth/auth-slice";
import entityListReducer from "../utility/entity-list-slice";
import { configureStore } from "@reduxjs/toolkit";
import { appApi } from "./app.api";

export const store = configureStore({
  reducer: {
    [appApi.reducerPath]: appApi.reducer,
    authReducer,
    entityListReducer,
    tabRouteReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([appApi.middleware]),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
