import {createSlice, createAsyncThunk, createEntityAdapter} from '@reduxjs/toolkit';
import axios from 'axios';
import { getAuth, deleteUser } from 'firebase/auth';
import {getUserData} from './userSlice';
import {getDatabase, ref, remove} from "firebase/database";
import {getTodos} from "../../todo/store/todosSlice";

export const getContacts = createAsyncThunk(
    'contactsApp/contacts/getContacts',
    async (routeParams, {getState}) => {
        routeParams = routeParams || getState().contactsApp.contacts.routeParams;
        const {user} = getState().auth;
        console.log(user);
        /*const response = await axios.get('/api/contacts-app/contacts', {
          params: routeParams,
        });*/
        const data = [];
        const response = await axios.get(`https://surge-bb99e-default-rtdb.firebaseio.com/users/.json`);
        const x = await response.data;
        for (const key in x) {
            const userT = x[key];
            let fName = '';
            let lName = '';
            console.log(userT);
            console.log(userT.role[0]);
            if (userT.data.displayName) {
                const words = userT.data.displayName.split(' ').filter(w => w !== '');
                fName = words[0];
                lName = words[1];
            }
            if (user.role[0] === 'super') {
                if (userT.role[0] === 'admin') {
                    if (user.data.email !== userT.data.email) {
                        const obj = {
                            address: '',
                            avatar: userT.data.photoURL,
                            company: null,
                            email: userT.data.email,
                            id: key,
                            jobTitle: null,
                            lastName: lName,
                            name: fName,
                            nickname: null,
                            notes: "",
                            phone: userT.data?.phone ? userT.data?.phone : 'No Contact'
                        }
                        data.push(obj);
                    }
                }
            }
        }
        console.log(data);
        console.log(routeParams);

        return {data, routeParams};
    }
);

export const addContact = createAsyncThunk(
    'contactsApp/contacts/addContact',
    async (contact, {dispatch, getState}) => {
        const response = await axios.post('/api/contacts-app/add-contact', {contact});
        const data = await response.data;

        dispatch(getContacts());

        return data;
    }
);

export const updateContact = createAsyncThunk(
    'contactsApp/contacts/updateContact',
    async (contact, {dispatch, getState}) => {
        const response = await axios.post('/api/contacts-app/update-contact', {contact});
        const data = await response.data;

        dispatch(getContacts());

        return data;
    }
);

export const removeContact = createAsyncThunk(
    'contactsApp/contacts/removeContact',
    async (contactId, {dispatch, getState}) => {
        await getAuth()
            .getUser(contactId)
            .then((userRecord) => {
                // See the UserRecord reference doc for the contents of userRecord.
                console.log(`Successfully fetched user data: ${userRecord.toJSON()}`);
            })
            .catch((error) => {
                console.log('Error fetching user data:', error);
            });
      /* await deleteUser(contactId)
            .then(async () => {
                console.log('Successfully deleted user');
                const db = getDatabase();
                await remove(ref(db, `users/${contactId}`))
                    .then(async () => {
                        await dispatch(getTodos());
                    });
            })
            .catch((error) => {
                console.log(error);
                console.log('Error deleting user:', error);
            });*/
        return contactId;
    }
);

export const removeContacts = createAsyncThunk(
    'contactsApp/contacts/removeContacts',
    async (contactIds, {dispatch, getState}) => {
        await axios.post('/api/contacts-app/remove-contacts', {contactIds});

        return contactIds;
    }
);

export const toggleStarredContact = createAsyncThunk(
    'contactsApp/contacts/toggleStarredContact',
    async (contactId, {dispatch, getState}) => {
        const response = await axios.post('/api/contacts-app/toggle-starred-contact', {contactId});
        const data = await response.data;

        dispatch(getUserData());

        dispatch(getContacts());

        return data;
    }
);

export const toggleStarredContacts = createAsyncThunk(
    'contactsApp/contacts/toggleStarredContacts',
    async (contactIds, {dispatch, getState}) => {
        const response = await axios.post('/api/contacts-app/toggle-starred-contacts', {contactIds});
        const data = await response.data;

        dispatch(getUserData());

        dispatch(getContacts());

        return data;
    }
);

export const setContactsStarred = createAsyncThunk(
    'contactsApp/contacts/setContactsStarred',
    async (contactIds, {dispatch, getState}) => {
        const response = await axios.post('/api/contacts-app/set-contacts-starred', {contactIds});
        const data = await response.data;

        dispatch(getUserData());

        dispatch(getContacts());

        return data;
    }
);

export const setContactsUnstarred = createAsyncThunk(
    'contactsApp/contacts/setContactsUnstarred',
    async (contactIds, {dispatch, getState}) => {
        const response = await axios.post('/api/contacts-app/set-contacts-unstarred', {contactIds});
        const data = await response.data;

        dispatch(getUserData());

        dispatch(getContacts());

        return data;
    }
);

const contactsAdapter = createEntityAdapter({});

export const {selectAll: selectContacts, selectById: selectContactsById} =
    contactsAdapter.getSelectors((state) => state.contactsApp.contacts);

const contactsSlice = createSlice({
    name: 'contactsApp/contacts',
    initialState: contactsAdapter.getInitialState({
        searchText: '',
        routeParams: {},
        contactDialog: {
            type: 'new',
            props: {
                open: false,
            },
            data: null,
        },
    }),
    reducers: {
        setContactsSearchText: {
            reducer: (state, action) => {
                state.searchText = action.payload;
            },
            prepare: (event) => ({payload: event.target.value || ''}),
        },
        openNewContactDialog: (state, action) => {
            state.contactDialog = {
                type: 'new',
                props: {
                    open: true,
                },
                data: null,
            };
        },
        closeNewContactDialog: (state, action) => {
            state.contactDialog = {
                type: 'new',
                props: {
                    open: false,
                },
                data: null,
            };
        },
        openEditContactDialog: (state, action) => {
            state.contactDialog = {
                type: 'edit',
                props: {
                    open: true,
                },
                data: action.payload,
            };
        },
        closeEditContactDialog: (state, action) => {
            state.contactDialog = {
                type: 'edit',
                props: {
                    open: false,
                },
                data: null,
            };
        },
    },
    extraReducers: {
        [updateContact.fulfilled]: contactsAdapter.upsertOne,
        [addContact.fulfilled]: contactsAdapter.addOne,
        [removeContacts.fulfilled]: (state, action) =>
            contactsAdapter.removeMany(state, action.payload),
        [removeContact.fulfilled]: (state, action) => contactsAdapter.removeOne(state, action.payload),
        [getContacts.fulfilled]: (state, action) => {
            const {data, routeParams} = action.payload;
            contactsAdapter.setAll(state, data);
            state.routeParams = routeParams;
            state.searchText = '';
        },
    },
});

export const {
    setContactsSearchText,
    openNewContactDialog,
    closeNewContactDialog,
    openEditContactDialog,
    closeEditContactDialog,
} = contactsSlice.actions;

export default contactsSlice.reducer;
