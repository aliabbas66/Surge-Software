import React from 'react';
import {Container, Row, Col, Image, Tabs, Tab} from 'react-bootstrap';
import {BsSearch, BsFillCameraFill,} from "react-icons/bs";
import {BiSend,} from "react-icons/bi";
import {AiOutlineDashboard, AiOutlineCheck} from "react-icons/ai";
import {FaTelegramPlane} from "react-icons/fa";
import {MdPayment} from "react-icons/md";
import {GiTorch} from "react-icons/gi";
import {RiQuestionMark} from "react-icons/ri";
import logo from '../../logo.svg';
import profile from '../../img/profile.png';
import '../../css/Dashboard.css';
import DashNavbar from '../../components/navbar';
import {getDatabase, ref, child, get, set, push, update, increment } from 'firebase/database';
import * as chat from '../../components/ChatService';
import * as uploader from '../../components/Uploader';
import * as userService from '../../components/UserService';
import {useSelector, useDispatch} from 'react-redux';
import * as userAction from '../../store/actions/userActions';
import * as msgsAction from '../../store/actions/messageActions';
import { getAuth } from "firebase/auth";

export let otherUser = {};
export let subscripton: any;

const Dashboard = props => {

    const [interlocutorUser, setInterlocutorUser] = React.useState({});
    const [userRoomID, setRoomID] = React.useState(null);

    const dispatch = useDispatch();
    const allUsers = useSelector(state => state.users.Dates);
    let allMsgs = useSelector(state => state.messages.Messages);
    //
    const global = {
        user: {},
        db: ref(getDatabase()),
        users: [],
        msgs: [],
        interlocutorUser: {},
        roomId: null
    };

    React.useEffect(async () => {
        let mounted = false;
        await userService.getUser();
        const auth = await getAuth();
        const user = auth.currentUser;
        console.log(user);
        await dispatch(userAction.getDate(false));
        setTimeout(() => {
            const interval = setInterval(async () => {
                await handleEverything();
            }, 5000);
        }, 2000);
        return (
            mounted = true
        );
    }, []);

    const handleEverything = async () => {
        await userService.getUser();
        let userRoomID;
        for (const key in userService.currentUser.chats) {
            const chat = userService.currentUser.chats[key];
            const useFirst = chat.useFirst;
            if (chat.newMsg === true) {
                const notifi = document.getElementById('notifi' + key);
                const notification = document.getElementById('notification' + key);
                if (notifi && notification) {
                    notifi.classList.remove('notifi');
                    notification.innerHTML = chat.msgsCount;
                    if (Object.keys(otherUser).length > 0) {
                        updateViewMsg(otherUser.uid, false);
                    }
                }
            } else {
                const notifi = document.getElementById('notifi' + key);
                const notification = document.getElementById('notification' + key);
                if (notifi && notification) {
                    notifi.classList.add('notifi');
                    notification.innerHTML = '0';
                }
            }
            if (useFirst) {
                userRoomID = key.concat(userService.user.uid);
            } else {
                userRoomID = userService.user.uid.concat(key);
            }
            await fetchRealtime(userRoomID);
        }
    };

    const [key, setKey] = React.useState('home');

    const chatWithUser = (interlocutorUser, shouldClear = false) => {
        if (shouldClear) {
            console.log('clearing messages...');
            dispatch(msgsAction.shouldClear());
        }
        otherUser = interlocutorUser;
        updateViewMsg(interlocutorUser.uid, false);
        setInterlocutorUser(interlocutorUser);
        global.interlocutorUser = interlocutorUser;
        const interlocutorUid = interlocutorUser.uid;
        const uid = userService.user.uid;
        let privateRoomID;
        get(child(global.db, `users/${uid}/chats/${interlocutorUid}`)).then((snapshot) => {
            if (snapshot.exists()) {
                const useFirst = snapshot.val().useFirst;
                if (useFirst) {
                    privateRoomID = interlocutorUid.concat(uid);
                } else {
                    privateRoomID = uid.concat(interlocutorUid);
                }
            } else {
                privateRoomID = uid.concat(interlocutorUid);
            }
            setRoomID(privateRoomID);
            document.getElementById('privateRom').innerHTML = privateRoomID;
            dispatch(msgsAction.getDate(privateRoomID, userService.user.uid, interlocutorUser.uid));
        }).catch((error) => {
            console.error(error);
        });
    }

    const sendAMsg = () => {
        if (Object.keys(interlocutorUser).length > 0) {
            const userMsg = document.getElementById('types').value;
            if (
                userMsg ||
                uploader.fileType !== 'msg'
            ) {
                if (uploader.isUploading === false) {
                    const interlocutorUid = interlocutorUser.uid;
                    const uid = userService.user.uid;
                    const db = getDatabase();
                    console.log('Room id is: ' + userRoomID);
                    if (userRoomID !== null) {
                        const msgBody = {
                            sender: uid,
                            msg: userMsg,
                            to: interlocutorUid,
                            msgType: uploader.fileType,
                            attachment: uploader.fileType !== 'msg' ? uploader.fileURL : null
                        };
                        push(ref(db, `rooms/${userRoomID}`), msgBody)
                            .then(() => {
                                get(child(global.db, `users/${uid}/chats/${interlocutorUid}`)).then((snapshot) => {
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
                                                // Done
                                                document.getElementById('types').value = '';
                                                // chatWithUser(interlocutorUser);
                                               // realTimeUpdate();
                                            });
                                        });
                                    } else {
                                        // Connection is already added with this user
                                        document.getElementById('types').value = '';
                                        updateInterlocutorUser(interlocutorUser.uid, true);
                                        // chatWithUser(interlocutorUser);
                                      //  realTimeUpdate();
                                    }
                                });
                            })
                            .catch((error) => {
                                console.log('Msg Sent Failed');
                            });
                    } else {
                        alert('Techinical Error Found, please try restarting the page');
                    }
                } else {
                    alert('Your file is being uploaded, please wait...');
                }
            } else {
                alert('Can\'t send an empty msg ')
            }
        } else {
            alert('Please select any user to send a msg')
        }
    };

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

    const openFile = async (url) => {
        window.open(url, '_blank');
    };

    const fetchRealtime = async (roomID) => {
        // msg.msgType !== 'msg' && msg.msgType !== 'image'
        let getmessages = [];
        await get(child(global.db, `rooms/${roomID}`)).then(async (snapshot) => {
            if (snapshot.exists()) {
                getmessages = [];
                const data = snapshot.val();
                for (const key in data) {
                    getmessages.push(data[key]);
                }
                let lastMsgPreview;
                const lastMsg = getmessages[getmessages.length - 1];
                if (lastMsg.msgType === 'msg') {
                    lastMsgPreview = lastMsg.msg;
                } else if (lastMsg.msgType === 'image') {
                    lastMsgPreview = 'Image file';
                } else if (lastMsg.msgType !== 'msg' && lastMsg.msgType !== 'image') {
                    lastMsgPreview = 'file';
                }
                let to;
                if (lastMsg.to === userService.user.uid) {
                    // he sent msg
                    to = document.getElementById(lastMsg.sender);
                    const tick = document.getElementById('sent' + lastMsg.sender);
                    if (tick) {
                        tick.classList.add('notifi');
                    }
                } else {
                    // We reieved a msg
                    to = document.getElementById(lastMsg.to);
                    const tick = document.getElementById('sent' + lastMsg.to);
                    if (tick) {
                        tick.classList.remove('notifi');
                    }
                }
                if (to) {
                    /* if (lastMsg.sender === userService.user.uid) {
                         document.getElementById('sent' + lastMsg.to).classList.add('notifi');
                     }*/
                    to.innerHTML = lastMsgPreview
                }
            } else {
                getmessages = [];
                // No Room Detected
            }
        }).catch((error) => {
            console.error(error);
        });
    };

    const updateViewMsg = async (interlocutorUid, msgCondition) => {
        const dbRef = ref(getDatabase());
        const db = getDatabase();
        await get(child(dbRef, `users/${userService.user.uid}/chats/${interlocutorUid}`)).then(async (snapshot) => {
            if (snapshot.exists()) {
                /*
                 interlocutor: "hq0LXBlepHgjD9pAfKfqz3Al6Rl2"
                  msgsCount: 1
                   newMsg: true
                   useFirst: false
                * */
                const msg = snapshot.val();
                await update(ref(db, `users/${userService.user.uid}/chats/${interlocutorUid}`), {
                    interlocutor: msg.interlocutor,
                    newMsg: msgCondition,
                    msgsCount: 0,
                    useFirst: msg.useFirst
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

    const updateInterlocutorUser = async (interlocutorUid, msgCondition) => {
        const dbRef = ref(getDatabase());
        const db = getDatabase();
        await get(child(dbRef, `users/${interlocutorUid}/chats/${userService.user.uid}`)).then(async (snapshot) => {
            if (snapshot.exists()) {
                const msg = snapshot.val();
                await update(ref(db, `users/${interlocutorUid}/chats/${userService.user.uid}`),  {
                    interlocutor: msg.interlocutor,
                    newMsg: msgCondition,
                    msgsCount: increment(1),
                    useFirst: msg.useFirst
                })
                    .then(() => {
                        // console.log('New msg inform sent');
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            }
        });
    };

    return (
        <div className="App">
            <DashNavbar/>

            <Container fluid className="full">
                <Row className="sidebars flex-columns">
                    <Col xs sm={3} lg={2} className="sidePadding">
                        <div className="sidebar d-flex justify-content-betweens">
                            <AiOutlineDashboard className="white"/>
                            <h6 className="white navItem">Dashboard</h6>
                        </div>
                        <div className="sidebar d-flex active-navItem">
                            <FaTelegramPlane className="white"/>
                            <h6 className="white navItem">Messaging</h6>
                        </div>
                        <div className="sidebar d-flex">
                            <MdPayment className="white"/>
                            <h6 className="white navItem">Payments</h6>
                        </div>
                        <div className="sidebar d-flex">
                            <GiTorch className="white"/>
                            <h6 className="white navItem">Markeeting</h6>
                        </div>
                    </Col>

                    <Col xs sm={9} lg={10} className="tabs pt-2">

                        <Tabs
                            id="controlled-tab-example"
                            activeKey={key}
                            onSelect={(k) => setKey(k)}
                            className="mb-2 tab-nav"
                        >
                            <Tab eventKey="home" title="All Conversation" className="white itemss">
                                <div className="bg-white pt-3 pb-2 hundred">
                                    <Container className="hundred">
                                        <Row className="hundred">
                                            <Col xs lg={4} className="contactSidebar hundred">
                                                <div className="bi-search">
                                                    <form action="/action_page.php">
                                                        <BsSearch/>
                                                        <input className="search" type="text"
                                                               placeholder="Find contacts" id="search"
                                                               name="search"/>
                                                    </form>
                                                </div>
                                                <div className="seeContact" id="userContacts">
                                                    {
                                                        allUsers.map((user, index) => {
                                                            return (
                                                                <div key={index} className="contacts"
                                                                     onClick={() => chatWithUser(user, true)}>
                                                                    <div className="contactUserImage">
                                                                        <Image src={profile} thumbnail={true}
                                                                               className="logos"/>
                                                                        <h1>.</h1>
                                                                    </div>
                                                                    <div className="userDetail">
                                                                        <h6 className="mb-0"> {user.name} </h6>

                                                                        <p className="lastMessage"><AiOutlineCheck
                                                                            id={'sent' + user.uid}
                                                                            className="black notifi"/> <span
                                                                            id={user.uid}> Start Convertions...</span>
                                                                        </p>
                                                                    </div>
                                                                    <div className="number notifi"
                                                                         id={'notifi' + user.uid}>
                                                                        <span id={'notification' + user.uid}> 0 </span>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })
                                                    }

                                                </div>
                                            </Col>
                                            <Col xs lg={8} className="hundred">
                                                <div className="chatBox">
                                                     <p className="notifi" id="privateRom"></p>
                                                    <div id="msgBox" className="scrolls">

                                                        {
                                                            allMsgs.map((msg, i) => {
                                                                return (
                                                                    <div key={msg.msg + i}
                                                                         className={msg.isCurrentUser ? 'righty' : 'lefty'}>
                                                                        <div
                                                                            className={msg.isCurrentUser ? 'right' : 'left'}>
                                                                            <div className="images">
                                                                                <Image src={logo} thumbnail={true}
                                                                                       className="logos"/>
                                                                            </div>
                                                                            {msg.isCurrentUser ? <h6> You </h6> :
                                                                                <h6> {msg.senderName} </h6>}
                                                                            <span>10:24</span>
                                                                        </div>
                                                                        {msg.msgType === 'msg' ?
                                                                            <p className="message"> {msg.msg} </p> : ''}
                                                                        {msg.msgType !== 'msg' && msg.msgType !== 'image' ?
                                                                            <Image
                                                                                onClick={() => openFile(msg.attachment)}
                                                                                src="https://i.ibb.co/Q9rtzLs/ha.jpg"
                                                                                className={msg.isCurrentUser ? 'chatImage rightImage' : ' chatImage leftImage'}/> : ''}
                                                                        {msg.msgType === 'image' ?
                                                                            <Image src={msg.attachment}
                                                                                   className={msg.isCurrentUser ? 'chatImage rightImage' : ' chatImage leftImage'}/> : ''}

                                                                    </div>
                                                                )
                                                            })
                                                        }

                                                    </div>

                                                    {/* <div className="righty">
                                                      { msg.isCurrentUser ? <h6> { getChattersName(msg.sender) } </h6> : <h6> { getChattersName(msg.to) } </h6> }
                                                            <div className="right">
                                                                <div className="images">
                                                                    <Image src={logo} thumbnail={true}
                                                                           className="logos"/>
                                                                </div>
                                                                <h6 id="">Franscsa Metts</h6>
                                                                <span>10:24</span>
                                                            </div>
                                                            <p className="message">It is long estalished fact a reader
                                                                will be distracted
                                                                by the readable content of</p>
                                                        </div>*/}

                                                    <div className="typeHere">
                                                        <input className="types" placeholder="Start typing here"
                                                               type="text" id="types" name="types"/>
                                                        <div className="sendButton">

                                                            <BsFillCameraFill onClick={pickAnFile} className="black"/>

                                                            <BiSend onClick={sendAMsg} className="black send"/>

                                                            {/*<button type="submit" className="send"
                                                                        onClick={sendAMsg}>Send
                                                                </button>*/}
                                                            {/*<button type="submit" className="send"
                                                                        onClick={pickAnFile}> Pick
                                                                </button>*/}
                                                            <input name="file" onChange={readURL} type="file"
                                                                   id="pick"/>
                                                        </div>
                                                    </div>

                                                </div>
                                            </Col>
                                        </Row>
                                    </Container>
                                </div>

                            </Tab>
                            <Tab eventKey="profile" title="Assigned to You" className="white itemss">
                                <h1 className="bg-danger">Tab 2</h1>
                            </Tab>
                            <Tab eventKey="General" title="General" className="white itemss">
                                <h1 className="bg-danger">Tab 3</h1>
                            </Tab>
                            <Tab eventKey="Leads" title="Leads" className="white itemss">
                                <h1 className="bg-danger">Tab 3</h1>
                            </Tab>
                            <Tab eventKey="Ok" title="Ok" className="white itemss">
                                <h1 className="bg-danger">Tab 3</h1>
                            </Tab>
                            <Tab eventKey="Reviews" title="Reviews" className="white itemss">
                                <h1 className="bg-danger">Tab 3</h1>
                            </Tab>
                        </Tabs>

                        <Container style={{padding: 0,}}>
                            <Row>
                                <Col className="d-flex justify-content-end">
                                    <div className="help">
                                        <RiQuestionMark className="white"/>
                                    </div>
                                </Col>
                            </Row>
                        </Container>

                    </Col>
                </Row>
            </Container>


        </div>
    );


}

export default Dashboard;
