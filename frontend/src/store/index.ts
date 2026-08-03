import { configureStore } from "@reduxjs/toolkit";
import settingReducer from "./slices/settingSlice";
import adminReducer from "./slices/adminSlice";
import appReducer from "./slices/appSlice";
import userReducer from "./slices/userSlice";

export const store = configureStore({
    reducer: {
        settings: settingReducer,
        admin: adminReducer,
        app: appReducer,
        user: userReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
