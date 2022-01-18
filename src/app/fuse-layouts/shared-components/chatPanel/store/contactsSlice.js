import { createEntityAdapter, createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import axios from 'axios';
import { closeChatPanel } from './stateSlice';
import {getAuth, onAuthStateChanged} from "firebase/auth";
import {child, get, getDatabase, ref} from "firebase/database";

export const getContacts = createAsyncThunk('chatPanel/contacts/getContacts', async (params) => {
 /* const auth = getAuth();
  let loggedInUser;
  await onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      loggedInUser = currentUser;
    } else {
      loggedInUser = null;
    }
  });
  const users = [];
  const db = ref(getDatabase());
  const data = await get(child(db, `users`)).then((snapshot) => {
    if (snapshot.exists()) {
      for (const key in snapshot.val()) {
        const user = snapshot.val()[key];
        console.log(loggedInUser.email);
        console.log(user);
        if (loggedInUser.email !== user.data.email) {
          console.log(user);
          users.push({
            id: key,
            name: user.data.displayName ? user.data.displayName : 'No name',
            avatar: user.data.photoURL,
            email: user.data.email,
            status: 'online',
            mood: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
            unread: '2'
          });
        }
      }
      // console.log(users);
      return users;
    }
  }).catch((error) => {
    console.error(error);
    return [];
  });
  console.log(data);*/
  const auth = getAuth();
  let loggedInUser;
  await onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      loggedInUser = currentUser;
    } else {
      loggedInUser = null;
    }
  });
  // const response = await axios.get('/api/chat/contacts', { params });
  // const data = await response.data;
  const res = await axios.get('https://surge-bb99e-default-rtdb.firebaseio.com/users/.json');
  const data = []
  const myUsers = await res.data;
  for (const key in myUsers) {
     if (key !== loggedInUser.uid) {
        const user = myUsers[key];
       data.push({
          id: key,
          name: user.data.displayName ? user.data.displayName : 'No name',
          avatar: user.data.photoURL,
          email: user.data.email,
          status: 'online',
          mood: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
          unread: '2'
        });
     }
  }
  console.log(data);
  return data;
});

const contactsAdapter = createEntityAdapter({});

export const { selectAll: selectContacts, selectById: selectContactById } =
  contactsAdapter.getSelectors((state) => state.chatPanel.contacts);

const contactsSlice = createSlice({
  name: 'chatPanel/contacts',
  initialState: contactsAdapter.getInitialState({
    selectedContactId: null,
  }),
  reducers: {
    setSelectedContactId: (state, action) => {
      state.selectedContactId = action.payload;
    },
    removeSelectedContactId: (state, action) => {
      state.selectedContactId = null;
    },
  },
  extraReducers: {
    [getContacts.fulfilled]: contactsAdapter.setAll,
    [closeChatPanel]: (state, action) => {
      state.selectedContactId = null;
    },
  },
});

export const { setSelectedContactId, removeSelectedContactId } = contactsSlice.actions;

export default contactsSlice.reducer;
