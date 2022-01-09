import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import {getAuth, onAuthStateChanged} from 'firebase/auth';

export const getUserData = createAsyncThunk('chatApp/user/getUserData', async () => {
    // const response = await axios.get('/api/chat/user');
    // const data = await response.data;
    const auth = getAuth();
    let loggedInUser;
    await onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
            loggedInUser = currentUser;
        } else {
            loggedInUser = null;
        }
    });
    console.log(loggedInUser);
    let user = {};
    user = {
        avatar: loggedInUser.photoURL,
        chatList: [],
        id: loggedInUser.uid,
        mood: 'it\'s a status....not your diary...',
        name: loggedInUser.displayName,
        status: "online",
    }
    return user;
});

export const updateUserData = createAsyncThunk('chatApp/user/updateUserData', async (newData) => {
    const response = await axios.post('/api/chat/user/data', newData);
    const data = await response.data;

    return data;
});

const userSlice = createSlice({
    name: 'chatApp/user',
    initialState: null,
    reducers: {
        updateUserChatList: (state, action) => {
            state.chatList = action.payload;
        },
    },
    extraReducers: {
        [getUserData.fulfilled]: (state, action) => action.payload,
        [updateUserData.fulfilled]: (state, action) => action.payload,
    },
});

export const {updateUserChatList} = userSlice.actions;

export default userSlice.reducer;
