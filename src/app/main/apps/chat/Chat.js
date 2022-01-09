import FuseScrollbars from '@fuse/core/FuseScrollbars';
import {styled} from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import InputBase from '@mui/material/InputBase';
import {selectContacts} from './store/contactsSlice';
import {sendMessage} from './store/chatSlice';
import {child, get, getDatabase, push, ref, set, update, increment } from "firebase/database";
import './Components/Chat.css';
import * as uploader from './Components/Uploader';

const StyledMessageRow = styled('div')(({theme}) => ({
    '&.contact': {
        '& .bubble': {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.getContrastText(theme.palette.background.paper),
            borderTopLeftRadius: 5,
            borderBottomLeftRadius: 5,
            borderTopRightRadius: 20,
            borderBottomRightRadius: 20,
            '& .time': {
                marginLeft: 12,
            },
        },
        '&.first-of-group': {
            '& .bubble': {
                borderTopLeftRadius: 20,
            },
        },
        '&.last-of-group': {
            '& .bubble': {
                borderBottomLeftRadius: 20,
            },
        },
    },
    '&.me': {
        paddingLeft: 40,

        '& .avatar': {
            order: 2,
            margin: '0 0 0 16px',
        },
        '& .bubble': {
            marginLeft: 'auto',
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            borderTopLeftRadius: 20,
            borderBottomLeftRadius: 20,
            borderTopRightRadius: 5,
            borderBottomRightRadius: 5,
            '& .time': {
                justifyContent: 'flex-end',
                right: 0,
                marginRight: 12,
            },
        },
        '&.first-of-group': {
            '& .bubble': {
                borderTopRightRadius: 20,
            },
        },

        '&.last-of-group': {
            '& .bubble': {
                borderBottomRightRadius: 20,
            },
        },
    },
    '&.contact + .me, &.me + .contact': {
        paddingTop: 20,
        marginTop: 20,
    },
    '&.first-of-group': {
        '& .bubble': {
            borderTopLeftRadius: 20,
            paddingTop: 13,
        },
    },
    '&.last-of-group': {
        '& .bubble': {
            borderBottomLeftRadius: 20,
            paddingBottom: 13,
            '& .time': {
                display: 'flex',
            },
        },
    },
}));

function Chat(props) {
    const dispatch = useDispatch();
    const contacts = useSelector(selectContacts);
    const selectedContactId = useSelector(({chatApp}) => chatApp.contacts.selectedContactId);
    const chat = useSelector(({chatApp}) => chatApp.chat);
    // console.log(chat);

    const user = useSelector(({chatApp}) => chatApp.user);

    const chatRef = useRef(null);
    const [messageText, setMessageText] = useState('');

    const [moment, setMoment] = useState(1);

    useEffect(() => {
        if (chat) {
            scrollToBottom();
        }
    }, [chat]);

    useEffect(() => {
        setTimeout(() => {
            setMoment(2);
        }, 1000);
    });

    function scrollToBottom() {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }

    function shouldShowContactAvatar(item, i) {
        return (
            item.who === selectedContactId &&
            ((chat.dialog[i + 1] && chat.dialog[i + 1].who !== selectedContactId) || !chat.dialog[i + 1])
        );
    }

    function isFirstMessageOfGroup(item, i) {
        return i === 0 || (chat.dialog[i - 1] && chat.dialog[i - 1].who !== item.who);
    }

    function isLastMessageOfGroup(item, i) {
        return (
            i === chat.dialog.length - 1 || (chat.dialog[i + 1] && chat.dialog[i + 1].who !== item.who)
        );
    }

    function onInputChange(ev) {
        setMessageText(ev.target.value);
    }

    const pickAnFile = () => {
        if (uploader.isUploading === false) {
            document.getElementById('pick').value = null;
            document.getElementById('pick').click();
        } else {
            alert('There is already some files being upload, please wait...');
        }
    };

    const readURL = async (event) => {
        const file = event.target.files[0];
        const type = file.type.split('/')[0];
        if (type === 'image') {
            await uploader.imageUploader(file, type);
        } else {
            await uploader.fileUploaderOnFirebase(file, type);
        }
        if (uploader.fileURL !== null) {
            console.log(uploader.fileURL);
        } else {
            alert('Something Went Wrong');
        }
    };

    const updateInterlocutorUser = async (interlocutorUid, msgCondition, currentUserUID, lstMsg, tme) => {
        const dbRef = ref(getDatabase());
        const db = getDatabase();
        await get(child(dbRef, `users/${interlocutorUid}/chats/${currentUserUID}`)).then(async (snapshot) => {
            if (snapshot.exists()) {
                const msg = snapshot.val();
                await update(ref(db, `users/${interlocutorUid}/chats/${currentUserUID}`),  {
                    interlocutor: msg.interlocutor,
                    newMsg: msgCondition,
                    msgsCount: increment(1),
                    useFirst: msg.useFirst,
                    lastMessage: lstMsg,
                    time: tme
                })
                    .then(() => {
                        // console.log('New msg inform sent');
                       updateViewMsg(interlocutorUid, false, currentUserUID, lstMsg, tme);
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            }
        });
    };

    const updateViewMsg = async (interlocutorUid, msgCondition, userID, lstMsg, tme) => {
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
                    lastMessage: lstMsg,
                    time: tme
                })
                    .then(() => {
                        console.log('New Inform');
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
    };

    function onMessageSubmit(ev) {
        ev.preventDefault();
        if (messageText === '' && uploader.fileType === 'msg') {
            return;
        }

        const global = {
            db: ref(getDatabase()),
        };
        const interlocutorUid = selectedContactId;
        const uid = user.id;
        const db = getDatabase();
        console.log('Room id is: ' + chat.id);
        if (chat.id !== null) {
            if (uploader.isUploading === false) {
                let msgBody;
                if (uploader.fileType !== 'msg') {
                    msgBody = {
                        sender: uid,
                        msg: messageText,
                        to: interlocutorUid,
                        msgType: uploader.fileType,
                        attachment: uploader.fileURL,
                        time: JSON.stringify(new Date())
                    };
                } else {
                    msgBody = {
                        sender: uid,
                        msg: messageText,
                        to: interlocutorUid,
                        msgType: 'msg',
                        attachment: 'null',
                        time: JSON.stringify(new Date())
                    };
                }
                push(ref(db, `rooms/${chat.id}`), msgBody)
                    .then(() => {
                        get(child(global.db, `users/${uid}/chats/${interlocutorUid}`)).then(async (snapshot) => {
                            if (!snapshot.exists()) {
                                set(ref(db, `users/${uid}/chats/${interlocutorUid}`), {
                                    interlocutor: interlocutorUid,
                                    newMsg: false,
                                    useFirst: false,
                                    lastMessage: uploader.fileType === 'msg' ? messageText : 'file',
                                    time: msgBody.time
                                }).then(() => {
                                    set(ref(db, `users/${interlocutorUid}/chats/${uid}`), {
                                        interlocutor: uid,
                                        newMsg: true,
                                        msgsCount: 1,
                                        useFirst: true, // interlocutorUID first and then currentUserUID
                                        lastMessage: uploader.fileType === 'msg' ? messageText : 'file',
                                        time: msgBody.time
                                    }).then(() => {
                                        // msg sent
                                        setMessageText('');
                                        uploader.clear();
                                    });
                                });
                            } else {
                                setMessageText('');
                                uploader.clear();
                                const ls = uploader.fileType === 'msg' ? messageText : 'file';
                                // interlocutorUid, msgCondition, currentUserUID, lstMsg, tme
                                updateInterlocutorUser(interlocutorUid, true, uid, ls, msgBody.time);
                            }
                        });
                    })
                    .catch((error) => {
                        console.log('Msg Sent Failed');
                    });
            } else {
                alert('Your File is being upload, please patient');
            }
        } else {
            alert('Techinical Error Found, please try restarting the page');
        }

        /*dispatch(
            sendMessage({
                messageText,
                chatId: chat.id,
                contactId: selectedContactId,
                user
            })
        ).then(() => {
            setMessageText('');
        });*/
    }


    return (
        <div className={clsx('flex flex-col relative', props.className)}>
            <FuseScrollbars ref={chatRef} className="flex flex-1 flex-col overflow-y-auto">
                {chat && chat.dialog.length > 0 ? (
                    <div className="flex flex-col pt-16 px-16 ltr:pl-56 rtl:pr-56 pb-40">
                        {chat.dialog.map((item, i) => {
                            if (item !== null) {
                                const contact =
                                    item?.who === user.id ? user : contacts.find((_contact) => _contact.id === item?.who);
                                return (
                                    <StyledMessageRow
                                        key={item?.time}
                                        className={clsx(
                                            'flex flex-col grow-0 shrink-0 items-start justify-end relative px-16 pb-4',
                                            {me: item?.who === user.id},
                                            {contact: item?.who !== user.id},
                                            {'first-of-group': isFirstMessageOfGroup(item, i)},
                                            {'last-of-group': isLastMessageOfGroup(item, i)},
                                            i + 1 === chat.dialog.length && 'pb-96'
                                        )}
                                    >
                                        {shouldShowContactAvatar(item, i) && (
                                            <Avatar
                                                className="avatar absolute ltr:left-0 rtl:right-0 m-0 -mx-32"
                                                src={contact.avatar}
                                            />
                                        )}
                                        <div
                                            className="bubble flex relative items-center justify-center p-12 max-w-full shadow">
                                            <div className="leading-tight whitespace-pre-wrap">
                                                {item?.msgType === 'msg' ? item?.message : ''}
                                                {item?.msgType === 'image' ? <img src={item?.attachment} /> : ''}
                                                {item?.msgType !== 'image' && item?.msgType !== 'msg' ? <img src="https://i.ibb.co/Q9rtzLs/ha.jpg" /> : ''}
                                            </div>
                                            <Typography
                                                className="time absolute hidden w-full text-11 mt-8 -mb-24 ltr:left-0 rtl:right-0 bottom-0 whitespace-nowrap"
                                                color="textSecondary"
                                            >
                                                {formatDistanceToNow(new Date(item?.time), {addSuffix: true})}
                                            </Typography>
                                        </div>
                                    </StyledMessageRow>
                                );
                            }
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col flex-1">
                        <div className="flex flex-col flex-1 items-center justify-center">
                            <Icon className="text-128" color="disabled">
                                chat
                            </Icon>
                        </div>
                        <Typography className="px-16 pb-24 text-center" color="textSecondary">
                            Start a conversation by typing your message below.
                        </Typography>
                    </div>
                )}
            </FuseScrollbars>
            {chat && (
                <form onSubmit={onMessageSubmit} className="absolute bottom-0 right-0 left-0 py-16 px-8">
                    <Paper className="flex items-center relative rounded-24 shadow">
                        <InputBase
                            autoFocus={false}
                            id="message-input"
                            className="flex-1 flex grow shrink-0 mx-16 ltr:mr-48 rtl:ml-48 my-8"
                            placeholder="Type your message"
                            onChange={onInputChange}
                            value={messageText}
                        />
                        <input name="file" onChange={readURL} type="file"
                               id="pick"/>
                        <IconButton
                            className="pickup absolute ltr:right-0 rtl:left-0 top-0"
                            onClick={pickAnFile}
                            size="large"
                        >
                            <AttachFileIcon color="action">
                                Pick
                            </AttachFileIcon>
                        </IconButton>
                        <IconButton
                            className="absolute ltr:right-0 rtl:left-0 top-0"
                            type="submit"
                            size="large"
                        >
                            <Icon className="text-24" color="action">
                                send
                            </Icon>
                        </IconButton>
                    </Paper>
                </form>
            )}
        </div>
    );
}

export default Chat;
