import {getDatabase, child, get, ref, onChildAdded} from 'firebase/database';
import * as chat from '../../components/ChatService';
import * as uploader from "../../components/Uploader";

export const GET_MESSAGE = 'GET_MESSAGE';
export const SHOULD_CLEAR = 'SHOULD_CLEAR';
let getmessages = [];

export const getDate = (roomID = null, currentUser, skip) => {
    return async dispatch => {
        if (roomID) {
            console.log(roomID);
            getmessages = [];
            const db = getDatabase();
            const roomRef = ref(db, `rooms/${roomID}`);
            await onChildAdded(roomRef, async (snapshot) => {
                if (snapshot.exists()) {
                    getmessages = [];
                    const data = snapshot.val();
                    let senderPromiss = chat.getChattersName(data.sender);
                    let toPromiss = chat.getChattersName(data.to);
                    let sndrName;
                    let recieverName;
                    await senderPromiss.then(nam => {
                        sndrName = nam;
                    })
                    await toPromiss.then(nam => {
                        recieverName = nam;
                    })
                    /*  getmessages.push({
                          sender: data.sender,
                          msg: data.msg,
                          to: data.to,
                          isCurrentUser: currentUser === data.sender,
                          senderName: sndrName,
                          toName: recieverName,
                          msgType: data.msgType,
                          attachment: data.attachment
                      });*/
                    // console.log(getmessages);
                    const body = {
                        sender: data.sender,
                        msg: data.msg,
                        to: data.to,
                        isCurrentUser: currentUser === data.sender,
                        senderName: sndrName,
                        toName: recieverName,
                        msgType: data.msgType,
                        attachment: data.attachment
                    }
                    console.log(body);
                    if (skip === true) {
                        dispatch({type: GET_MESSAGE, getmessages: body});
                    } else {
                        const selPrivateRom = document.getElementById('privateRom').innerHTML;
                        if (
                            selPrivateRom === roomID
                        ) {
                            dispatch({type: GET_MESSAGE, getmessages: body});
                        }
                        const msgBox = document.getElementById('msgBox');
                        if (msgBox) {//
                            msgBox.scrollTop = msgBox.scrollHeight;
                        }
                    }
                } else {
                    getmessages = [];
                    console.log('No messages');
                }
            });
        } else {
            getmessages = [];
        }
    };
};

export const shouldClear = () => {
    return async dispatch => {
        dispatch({type: SHOULD_CLEAR, clear: []});
    }
}