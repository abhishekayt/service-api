import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type UserState = {
    _id: string;
    userId: string;
    name: string;
    email: string;
    mobile: string;
    image?: string;
    balance: number;
    createdAt: string;
    lastLogin: string;
};

const initialState: UserState = {
    _id: "",
    userId: "",
    name: "",
    email: "",
    mobile: "",
    balance: 0,
    createdAt: "",
    lastLogin: ""
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        updateUser: (state, action: PayloadAction<Partial<UserState>>) => {
            return { ...state, ...action.payload };
        },
        resetUser: () => initialState
    }
});

export const { updateUser, resetUser } = userSlice.actions;
export default userSlice.reducer;
