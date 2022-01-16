import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import {getAuth, onAuthStateChanged} from 'firebase/auth';
import {getDatabase, ref, child, get, onChildChanged} from 'firebase/database';

export let myChats = [];
export let myBackup = [];

export const getUserData = createAsyncThunk('chatApp/user/getUserData', async () => {
    // const response = await axios.get('/api/chat/user');
    // const data = await response.data;
    // console.log(data);
    /* chatList
    chatId: "1725a680b3249760ea21de52"
contactId: "5725a680b3249760ea21de52"
lastMessageTime: "2021-06-12T02:10:18.931Z"
     */
    const auth = getAuth();
    let loggedInUser;
    let asd;
    await onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
            loggedInUser = currentUser;
            // console.log(loggedInUser);
            const db = ref(getDatabase());
            await get(child(db, `users/${loggedInUser.uid}`)).then((snapshot) => {
                if (myChats.length > 0) {
                    myBackup = myChats;
                }
                myChats = [];
                if (snapshot.exists()) {
                    const userChats = {...snapshot.val().chats};
                    for (const key in userChats) {
                        const singLeChat = userChats[key];
                        // console.log(singLeChat);
                        let privateRoomID;
                        if (singLeChat.useFirst) {
                            privateRoomID = key.concat(loggedInUser.uid);
                        } else {
                            privateRoomID = loggedInUser.uid.concat(key);
                        }
                        // console.log(singLeChat);
                        const tempChat = JSON.parse(JSON.stringify(singLeChat));
                        const tme = tempChat.time.substr(1, (tempChat.time.length - 2));
                        const bod = {
                            chatId: privateRoomID,
                            contactId: key,
                            lastMessageTime: tme,
                            newMsg: tempChat.newMsg,
                            msgsCount: tempChat.msgsCount,
                            lastMessage: tempChat.lastMessage,
                            lastTime: tme
                        };
                        // Object.preventExtensions(bodyCopy);
                        myChats.push(bod);
                    }
                /*    console.log(myChats);
                    console.log(myBackup);
                    if (myBackup.length > 0) {
                        if (myChats.length > myBackup.length) {
                            const noti = document.getElementById('noti');
                            console.log(noti);
                            if (noti) {
                                noti.play();
                            }
                        } else if (myChats.length === myBackup.length) {
                            let isMatching = false;
                            for (let i = 0; i < myChats.length; i++) {
                                  if (
                                      myChats[i].newMsg === myBackup[i].newMsg &&
                                      myChats[i].msgsCount === myBackup[i].msgsCount
                                  ) {
                                      isMatching = true;
                                  } else {
                                      isMatching = false;
                                      i = myChats.length;
                                  }
                            }
                            console.log('Matching arrays: ' + isMatching);
                            if (isMatching === false) {
                                const noti = document.getElementById('noti');
                                console.log(noti);
                                if (noti) {
                                    noti.play();
                                }
                            }
                        }
                    }*/
                } else {
                    console.log("No data available");
                }
            }).catch((error) => {
                console.error(error);
            });
        } else {
            loggedInUser = null;
        }
    });
    let user = {};
    // console.log(loggedInUser);
    user = {
        avatar: loggedInUser.photoURL,
        chatList: myChats,
        id: loggedInUser.uid,
        mood: 'it\'s a status....not your diary...',
        name: loggedInUser.displayName,
        status: "online",
    }
    // console.log(user);
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
