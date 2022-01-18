import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import {getAuth, onAuthStateChanged} from "firebase/auth";

export const getUserData = createAsyncThunk('chatPanel/user/getUserData', async () => {
  const auth = getAuth();
  let loggedInUser;
  await onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      loggedInUser = currentUser;
    } else {
      loggedInUser = null;
    }
  });
  const res = await axios.get('https://surge-bb99e-default-rtdb.firebaseio.com/users/.json');
  let data = {};
  const myUsers = await res.data;
  for (const key in myUsers) {
    if (key === loggedInUser.uid) {
      const myChats = [];
      const userChats = {...myUsers[key].chats};
      for (const roomKey in userChats) {
        const singLeChat = userChats[roomKey];
        let privateRoomID;
        if (singLeChat.useFirst) {
          privateRoomID = roomKey.concat(loggedInUser.uid);
        } else {
          privateRoomID = loggedInUser.uid.concat(roomKey);
        }
        // const tempChat = JSON.parse(JSON.stringify(singLeChat));
        const tme = singLeChat.time.substr(1, (singLeChat.time.length - 2));
        const bod = {
          chatId: privateRoomID,
          contactId: roomKey,
          lastMessageTime: tme,
          newMsg: singLeChat.newMsg,
          msgsCount: singLeChat.msgsCount,
          lastMessage: singLeChat.lastMessage,
          lastTime: tme
        };
        // Object.preventExtensions(bodyCopy);
        myChats.push(bod);
      }
      data = {
        avatar: loggedInUser.photoURL,
        chatList: myChats,
        id: loggedInUser.uid,
        mood: 'it\'s a status....not your diary...',
        name: loggedInUser.displayName,
        status: "online",
      };
    }
  }
  // const response = await axios.get('/api/chat/user');
  // const data = await response.data;
  // console.log(data);
  console.log(data);
  return data;
});

export const updateUserData = createAsyncThunk('chatPanel/user/updateUserData', async (newData) => {
  const response = await axios.post('/api/chat/user/data', newData);
  const data = await response.data;

  return data;
});

const userSlice = createSlice({
  name: 'chatPanel/user',
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

export const { updateUserChatList } = userSlice.actions;

export default userSlice.reducer;
