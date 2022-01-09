import {createEntityAdapter, createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {getDatabase, ref, child, get, onChildChanged} from 'firebase/database';
import {getAuth, onAuthStateChanged} from 'firebase/auth';

export const getContacts = createAsyncThunk('chatApp/contacts/getContacts', async (params) => {
    // const response = await axios.get('/api/chat/contacts', { params });
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
    const users = [];
    const db = ref(getDatabase());
    const data = await get(child(db, `users`)).then((snapshot) => {
        if (snapshot.exists()) {
            for (const key in snapshot.val()) {
                const user = snapshot.val()[key];
                if (loggedInUser.email !== user.data.email) {
                    users.push({
                        id: key,
                        name: user.data.displayName ? user.data.displayName : 'No name',
                        avatar: user.data.photoURL,
                        status: 'online',
                        mood: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
                        unread: '2'
                    });
                }
            }
            console.log(users);
            return users;
        }
    }).catch((error) => {
        console.error(error);
        return [];
    });
    // console.log(data);
    return data;
});

const contactsAdapter = createEntityAdapter({});

export const {selectAll: selectContacts, selectById: selectContactById} =
    contactsAdapter.getSelectors((state) => state.chatApp.contacts);

const contactsSlice = createSlice({
    name: 'chatApp/contacts',
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
    },
});

export const {setSelectedContactId, removeSelectedContactId} = contactsSlice.actions;

export default contactsSlice.reducer;
