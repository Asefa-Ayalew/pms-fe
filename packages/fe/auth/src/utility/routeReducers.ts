import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";

export interface TabRouteState {
  routeName: string | null;
}

export const tabRouteSlice: Slice<TabRouteState> = createSlice({
  name: "tabRoute", 
  initialState: {
    routeName: "detail",  
  } as TabRouteState,  
  reducers: {
    setRoute: (state: TabRouteState, action: PayloadAction<string | null>) => {
      state.routeName = action.payload;  
    },
  },
});

export const { setRoute } = tabRouteSlice.actions;
export default tabRouteSlice.reducer;
