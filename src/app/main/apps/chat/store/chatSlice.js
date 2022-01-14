import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import {child, get, getDatabase, ref, push, set, onChildAdded, update} from 'firebase/database';
import {cloneDeep} from 'lodash'
import {setSelectedContactId} from './contactsSlice';
import {closeMobileChatsSidebar} from './sidebarsSlice';
import {updateUserChatList} from './userSlice';

export let getmessages = [];
export let backup = [];

export const getChat = createAsyncThunk(
    'chatApp/chat/getChat',
    async ({contactId, isMobile}, {dispatch, getState}) => {
        dispatch(setSelectedContactId(contactId));
        dispatch(updateUserChatList([]));
        getmessages = [];
        const {id: userId} = getState().chatApp.user;
        const interlocutorUid = contactId;
        const userUid = userId;
        let privateRoomID = interlocutorUid.concat(userUid);
        updateViewMsg(interlocutorUid, false, userUid)
        if (privateRoomID) {
            // console.log(privateRoomID);
            const dbAgain = getDatabase();
            const roomRef = ref(dbAgain, `rooms/${privateRoomID}`);
            const dbRef = ref(getDatabase());
            await get(child(dbRef, `rooms/${privateRoomID}`)).then((snapshot) => {
                if (snapshot.exists()) {
                    getmessages = [];
                    for (const key in snapshot.val()) {
                        const data = snapshot.val()[key];
                        const tme = data.time.substr(1, (data.time.length - 2));
                        const objct = {
                            who: data.sender,
                            message: data.msg,
                            time: new Date(tme),
                            msgType: data.msgType,
                            attachment: data.attachment
                        };
                        getmessages.push(objct)
                    }
                } else {
                    console.log("No data available");
                }
            }).catch((error) => {
                console.error(error);
            });
            const obj = {
                dialog: getmessages,
                id: privateRoomID
            };
            // console.log(obj);
            dispatch(setSelectedContactId(contactId));
            dispatch(updateUserChatList([]));
            if (isMobile) {
                dispatch(closeMobileChatsSidebar());
            }
            // getmessages = [];'
            if (backup.length > 0) {
                if (getmessages.length > backup.length) {
                    backup = getmessages;
                    const lstMsg = getmessages[getmessages.length - 1];
                    if (lstMsg.who === contactId) {
                        const noti = document.getElementById('noti');
                        if (noti) {
                            noti.play();
                        }
                    }
                }
            } else {
                backup = getmessages;
            }
            return obj;
        }
        /*    await onChildAdded(roomRef, async (snapshotTwo) => {
                if (snapshotTwo.exists()) {
                    const data = {...snapshotTwo.val()};
                    const tme = data.time.substr(1, (data.time.length - 2));
                    console.log(data);
                    const objct = {
                        who: data.sender,
                        message: data.msg,
                        time: new Date(tme),
                        msgType: data.msgType,
                        attachment: data.attachment
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
        // getmessages = [];
        return obj;*/
    }
);

const updateViewMsg = async (interlocutorUid, msgCondition, userID) => {
    const dbRef = ref(getDatabase());
    const db = getDatabase();
    await get(child(dbRef, `users/${userID}/chats/${interlocutorUid}`)).then(async (snapshot) => {
        if (snapshot.exists()) {
            const msg = snapshot.val();
            await update(ref(db, `users/${userID}/chats/${interlocutorUid}`), {
                interlocutor: msg.interlocutor,
                newMsg: msgCondition,
                msgsCount: 0,
                useFirst: msg.useFirst,
                lastMessage: msg.lastMessage,
                time: msg.time
            })
                .then(() => {
                    // console.log('New msg inform sent');
                })
                .catch((error) => {
                    console.log(error);
                });
        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error(error);
    });
    /* const db = getDatabase();
     update(ref(db, `users/${userService.user.uid}/chats/${interlocutorUid}`), {
         newMsg: msgCondition,
         msgsCount: 0
     })
         .then(() => {
             // console.log('New msg inform sent');
         })
         .catch((error) => {
             console.log(error);
         });*/
};

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