import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";

const initialState = {
    messages: []
}
export const fetchMessages = createAsyncThunk('/messages/fetchMessage', async ({token, userId}) => {
    const {data} = await api.post('/api/message/get', {to_user_id: userId}, {
        headers: {Authorization: `Bearer ${token}`}

    })
    return data.success ? data : null
})

const messageSlice= createSlice({
    name: 'messages',
    initialState,
    reducers: {
        setMessages: (state, action)=>{
            state.messages = action.payload;
        },
        addMessages: (state, action)=>{
            state.messages = [...state.messages, action.payload]
        },
        resetMessages: (state)=>{
            state.messages = [];
        },
    },
    extraReducers: (builder)=>{
        builder.addCase(fetchMessages.fulfilled, (state, action)=>{
            if (action.payload) {
                state.messages = action.payload.messages
            }
        })
    }
})
export const {setMessages, addMessages, resetMessages} = messageSlice.actions;

export default messageSlice.reducer