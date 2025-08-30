import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios.js";
import {toast} from 'react-hot-toast'

const initialState = {
    value: null,
  loading: false,
  error: null
}
export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (token, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/user/data', {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log("fetchUser response:", data)   // 👈 DEBUG

      if (data.success) return data.user
      return rejectWithValue(data.message)
    } catch (err) {
      console.error("fetchUser error:", err)     // 👈 DEBUG
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

export const updateUser = createAsyncThunk('user/update', async ({userData, token}) => {
    const {data} = await api.post('/api/user/update',userData, {
        headers: {Authorization: `Bearer ${token}`},
        "Content-Type": "multipart/form-data",
    })
    if(data.success){
        toast.success(data.message)
        return data.user
    }else{
        toast.error(data.message)
        return null
    }
})

const userSlice= createSlice({
    name: 'user',
    initialState,
    reducers: {

    },
    extraReducers: (builder)=>{
        builder.addCase(fetchUser.pending, (state) => {
    state.loading = true
    state.error = null
  })
  .addCase(fetchUser.fulfilled, (state, action) => {
    state.loading = false
    state.value = action.payload
  })
  .addCase(fetchUser.rejected, (state, action) => {
    state.loading = false
    state.error = action.payload || 'Failed to fetch user'
  }).addCase(updateUser.fulfilled, (state, action)=>{
            state.value = action.payload
        })
    }
})

export default userSlice.reducer