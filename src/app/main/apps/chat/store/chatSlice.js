import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import {child, get, getDatabase, ref, push, set, onChildAdded} from 'firebase/database';
import {setSelectedContactId} from './contactsSlice';
import {closeMobileChatsSidebar} from './sidebarsSlice';
import {updateUserChatList} from './userSlice';

export const getChat = createAsyncThunk(
    'chatApp/chat/getChat',
    async ({contactId, isMobile, user}, {dispatch, getState}) => {
        const {id: userId} = getState().chatApp.user;
        const interlocutorUid = contactId;
        const userUid = user.id;
        let privateRoomID;
        let getmessages = [];
        const db = ref(getDatabase());
        await get(child(db, `users/${userUid}/chats/${interlocutorUid}`)).then(async (snapshot) => {
            if (snapshot.exists()) {
                const {useFirst} = snapshot.val();
                if (useFirst) {
                    privateRoomID = interlocutorUid.concat(userUid);
                } else {
                    privateRoomID = userUid.concat(interlocutorUid);
                }
            } else {
                privateRoomID = userUid.concat(interlocutorUid);
            }
            if (privateRoomID) {
                console.log(privateRoomID);
                getmessages = [];
                const dbAgain = getDatabase();
                const roomRef = ref(dbAgain, `rooms/${privateRoomID}`);
                await onChildAdded(roomRef, async (snapshotTwo) => {
                    if (snapshotTwo.exists()) {
                        const data = snapshotTwo.val();
                        const tme = data.time.substr(1, (data.time.length - 2));
                        console.log(tme);
                        const objct = {
                            who: data.sender,
                            message: data.msg,
                            time: new Date(tme)
                        };
                        getmessages.push(objct);
                        console.log(getmessages);
                        dispatch(setSelectedContactId(contactId));
                        dispatch(updateUserChatList([]));
                    } else {
                        getmessages = [];
                        console.log('No messages');
                    }
                });
            } else {
                getmessages = [];
            }
        }).catch((error) => {
            console.error(error);
        });
        /* const response = await axios.get('/api/chat/get-chat', {
              params: {
                  contactId,
                  userId,
              },
          });
          const {chat, userChatList} = await response.data;*/

        console.log(getmessages);
        const obj = {
            dialog: getmessages,
            id: privateRoomID
        };
        console.log(obj);
        dispatch(setSelectedContactId(contactId));
        dispatch(updateUserChatList([]));
        if (isMobile) {
            dispatch(closeMobileChatsSidebar());
        }
        return obj;
    }
);

export const sendMessage = createAsyncThunk(
    'chatApp/chat/sendMessage',
    async ({messageText, chatId, contactId, user}, {dispatch, getState}) => {
        const {id: userId} = getState().chatApp.user;
        const chat = getState().chatApp.chat;
        console.log(chat);
        const global = {
            db: ref(getDatabase()),
        };
        const interlocutorUid = contactId;
        const uid = userId;
        const db = getDatabase();
        console.log('Room id is: ' + chatId);
        if (chatId !== null) {
            const msgBody = {
                sender: uid,
                msg: messageText,
                to: interlocutorUid,
                msgType: 'msg',
                attachment: 'null',
                time: JSON.stringify(new Date())
            };
            push(ref(db, `rooms/${chatId}`), msgBody)
                .then(() => {
                    get(child(global.db, `users/${uid}/chats/${interlocutorUid}`)).then(async (snapshot) => {
                        if (!snapshot.exists()) {
                            set(ref(db, `users/${uid}/chats/${interlocutorUid}`), {
                                interlocutor: interlocutorUid,
                                newMsg: false,
                                useFirst: false
                            }).then(() => {
                                set(ref(db, `users/${interlocutorUid}/chats/${uid}`), {
                                    interlocutor: uid,
                                    newMsg: true,
                                    msgsCount: 1,
                                    useFirst: true // interlocutorUID first and then currentUserUID
                                }).then(() => {
                                    // msg sent
                                   /* const newMssge = {
                                        who: interlocutorUid,
                                        message: messageText,
                                        time: new Date()
                                    }
                                    return newMssge;*/
                                });
                            });
                        } else {
                            // msg sent
                           /* const newMssge = {
                                who: interlocutorUid,
                                message: messageText,
                                time: new Date()
                            }
                            return newMssge;*/
                        }
                    });
                })
                .catch((error) => {
                    console.log('Msg Sent Failed');
                });
        } else {
            alert('Techinical Error Found, please try restarting the page');
        }
        await dispatch(updateUserChatList([]));
        await dispatch(updateUserChatList(chat.dialog));
       /* const newMssge = {
            who: user.id,
            message: messageText,
            time: new Date()
        }
        return newMssge;*/
        // const response = await axios.post('/api/chat/send-message', {chatId, messageText, contactId});
        // const {message, userChatList} = await response.data;
        // dispatch(updateUserChatList(userChatList));
        // console.log(message);
        // return message;
    }
);

const chatSlice = createSlice({
    name: 'chatApp/chat',
    initialState: null,
    reducers: {
        removeChat: (state, action) => action.payload,
    },
    extraReducers: {
        [getChat.fulfilled]: (state, action) => action.payload,
        [sendMessage.fulfilled]: (state, action) => {
            state.dialog = [...state.dialog, action.payload];
        },
    },
});

export default chatSlice.reducer;
