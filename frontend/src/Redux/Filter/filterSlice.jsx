import { createSlice } from '@reduxjs/toolkit';

 const initialState = {
   ageMin: '',
   ageMax: '',
   matchMin: '',
   matchtMax: '',
   location: '',
 };

 const filterSlice = createSlice({
   name: 'filter',
   initialState,
   reducers: {
     setFilters: (state, action) => {
      console.log("action.payload in filterslice",action.payload)
       return { ...state, ...action.payload }; // Merge existing state with payload
     },
     clearFilters: (state) => {
       return initialState; // Reset to initial state
     },
   },
 });

 export const { setFilters, clearFilters } = filterSlice.actions;
 export default filterSlice.reducer;