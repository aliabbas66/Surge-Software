import React from 'react';
import {Button, Container, Row, Col, Image, Dropdown, Nav, Tabs, Tab, Form} from 'react-bootstrap';
import {RiMessage2Line} from "react-icons/ri";
import '../../css/frontend.css';
import {MdMessage, MdAttachFile} from "react-icons/md";
import logo from '../../img/logo.png';
import {createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword} from "firebase/auth";
import {getDatabase, ref, child, get, set, push} from "firebase/database";
import bcrypt from 'bcryptjs';
import MyComponent from "react-fullpage-custom-loader";
import SimpleLight from "../../theme/SimpleLight";
import * as uploader from "../../components/Uploader";
import {useNavigate} from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';
import * as msgsAction from "../../store/actions/messageActions";

export let adminEmail = '39plcwyl0lwncn9@gmail.com';
export let admin: any = {};
export let room = null;
export let fetchMsgs = false;
export let usrMsg: any = '';

const Frontend = props => {

    const dispatch = useDispatch();
    const allMsgs = useSelector(state => state.messages.Messages);
    console.log(allMsgs);

    const [isLoading, setIsLoading] = React.useState(false);
    const [usrRom, setUsrRom] = React.useState(null);

    const auth = getAuth();
    const navigate = useNavigate();
    const database = getDatabase();

    React.useEffect(async () => {
        let mounted = false;
        const isLogin = localStorage.getItem('user');
        if (isLogin) {
            const usr = JSON.parse(isLogin);
            await loginAgain(usr.email, usr.seasion);
        }
        await checkUserLogin(false);
        // await dispatch(userAction.getDate(false));
        return (
            mounted = true
        );
    }, []);

    const loginAgain = async (email, seasion) => {
        setIsLoading(true);
        await signInWithEmailAndPassword(auth, email, seasion)
            .then((userCredential) => {
                const body = {
                    ...userCredential.user,
                    seasion: seasion
                }
                localStorage.setItem('user', JSON.stringify(body));
                setIsLoading(false);
            })
            .catch((error) => {
                setIsLoading(false);
                console.log(error);
                if (error.code === 'auth/user-not-found') {
                    localStorage.clear();
                    alert('Seasion Expired, please login again');
                }
                // const errorCode = error.code;
                // const errorMessage = error.message;

            });
    };

    const userSeasion = async (email, seasion) => {
        await signInWithEmailAndPassword(auth, email, seasion)
            .then(async (userCredential) => {
                const body = {
                    ...userCredential.user,
                    seasion: seasion
                }
                localStorage.setItem('user', JSON.stringify(body));
                // setIsLoading(false);
                await checkUserLogin(true);
            })
            .catch((error) => {
                setIsLoading(false);
                console.log(error);
                if (error.code === 'auth/user-not-found') {
                    localStorage.clear();
                    alert('Seasion Expired, please login again');
                }
                // const errorCode = error.code;
                // const errorMessage = error.message;

            });
    };

    const dismissLoader = async () => {
        const isLogin = localStorage.getItem('user');
        const con1 = document.getElementById('con1');
        const con2 = document.getElementById('con2');
        if (isLogin) {
            const usr = JSON.parse(isLogin);
            if (con1) {
                con1.classList.add('none');
            }
            if (con2) {
                con2.classList.remove('none');
            }
            await fetchAdmin(false, usr);
        } else {
            if (con1) {
                con1.classList.remove('none');
            }
            if (con2) {
                con2.classList.add('none');
            }
        }
    };

    const checkUserLogin = async (snd) => {
        const isLogin = localStorage.getItem('user');
        const con1 = document.getElementById('con1');
        const con2 = document.getElementById('con2');
        if (isLogin) {
            const usr = JSON.parse(isLogin);
            if (con1) {
                con1.classList.add('none');
            }
            if (con2) {
                con2.classList.remove('none');
            }
            await fetchAdmin(snd, usr);
        } else {
            setIsLoading(false);
            if (con1) {
                con1.classList.remove('none');
            }
            if (con2) {
                con2.classList.add('none');
            }
        }
    };

    const fetchAdmin = async (shouldSndMsg, usr) => {
        const dbRef = ref(getDatabase());
        await get(child(dbRef, `users`)).then((snapshot) => {
            if (snapshot.exists()) {
                for (const key in snapshot.val()) {
                    const user = snapshot.val()[key];
                    if (user.email === adminEmail) {
                        admin = user;
                        let privateRoomID;
                        if (shouldSndMsg) {
                            privateRoomID = usr.uid.concat(admin.uid);
                            sendAMsg(privateRoomID, shouldSndMsg, usr);
                        } else {
                            if (fetchMsgs === false) {
                                fetchMsgs = true;
                                chatWithUser(admin, usr, true);
                            }
                            setIsLoading(false);
                        }
                    }
                }
            } else {
                setIsLoading(false);
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        })
    };

    const calculateAndSnd = async () => {
        usrMsg = document.getElementById('types').value;
        const isLogin = localStorage.getItem('user');
        if (isLogin) {
            const usr = JSON.parse(isLogin);
            console.log(room);
            console.log(usrMsg);
            if (
                usr &&
                room !== null
            ) {
                await sendAMsg(room, false, usr);
            } {
                console.log(room);
                console.log(usr);
            }
        }
    };

    const chatWithUser = async (interlocutorUser, currentUser, skip, shouldClear = false) => {
        dispatch(msgsAction.shouldClear());
        let privateRoomID;
        const db = ref(getDatabase());
        const interlocutorUid = interlocutorUser.uid;
        await get(child(db, `users/${currentUser.uid}/chats/${interlocutorUid}`)).then((snapshot) => {
            if (snapshot.exists()) {
                const useFirst = snapshot.val().useFirst;
                if (useFirst) {
                    privateRoomID = interlocutorUid.concat(currentUser.uid);
                } else {
                    privateRoomID = currentUser.uid.concat(interlocutorUid);
                }
            } else {
                privateRoomID = currentUser.uid.concat(interlocutorUid);
            }
            room =  privateRoomID;
            dispatch(msgsAction.getDate(privateRoomID, currentUser.uid, skip));
        }).catch((error) => {
            console.error(error);
        });
    }

    const sendAMsg = (userRoomID, shouldSndMsg, currentUser) => {
        const interlocutorUser = admin;
        if (Object.keys(interlocutorUser).length > 0) {
            const userMsg = usrMsg;
            if (
                userMsg ||
                uploader.fileType !== 'msg'
            ) {
                if (uploader.isUploading === false) {
                    const interlocutorUid = interlocutorUser.uid;
                    const uid = currentUser.uid;
                    const db = getDatabase();
                    const dbTwo = ref(getDatabase());
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
                                get(child(dbTwo, `users/${uid}/chats/${interlocutorUid}`)).then((snapshot) => {
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
                                                uploader.clear();
                                                // Done
                                                if (shouldSndMsg) {
                                                    setIsLoading(false);
                                                    dismissLoader();
                                                } else {
                                                    document.getElementById('types').value = '';
                                                }
                                                // chatWithUser(interlocutorUser);
                                                // realTimeUpdate();
                                            });
                                        });
                                    } else {
                                        uploader.clear();
                                        // Connection is already added with this user
                                        if (shouldSndMsg) {
                                            setIsLoading(false);
                                            dismissLoader();
                                        } else {
                                            document.getElementById('types').value = '';
                                        }
                                    }
                                });
                            })
                            .catch((error) => {
                                console.log(error);
                                if (shouldSndMsg) {
                                    setIsLoading(false);
                                }
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

    const toggleChatNow = (id) => {
        document.getElementById(id).classList.toggle('none');
    };

    const validateEmail = (email) => {
        const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        if (email.match(validRegex)) {
            return true;
        } else {
            return false;
        }
    }

    const onCreateUser = async () => {
        const email = document.getElementById('email').value;
        const pass = document.getElementById('pass').value;
        const nam = document.getElementById('name').value;
        const msg = document.getElementById('msg').value;
        if (validateEmail(email)) {
            const usrName = email.split('@')[0];
            console.log(usrName);
            if (pass.length > 5) {
                if (
                    nam && msg
                ) {
                    setIsLoading(true);
                    const hashedPassword = bcrypt.hashSync(pass, '$2a$10$CwTycUXWue0Thq9StjUM0u');
                    await createUserWithEmailAndPassword(auth, email, hashedPassword)
                        .then(async (userCredential) => {
                            // await dismissLoader();
                            await set(ref(database, 'users/' + userCredential.user.uid), {
                                seasion: hashedPassword,
                                email: email,
                                username: usrName,
                                uid: userCredential.user.uid,
                                name: nam
                            }).then(async () => {
                                usrMsg = msg;
                                await userSeasion(email, hashedPassword);
                            });
                        })
                        .catch((error) => {
                            setIsLoading(false);
                            console.log(error);
                            // const errorCode = error.code;
                            // const errorMessage = error.message;
                        });
                } else {
                    alert('Something is missing, please check')
                }
            } else {
                alert('Password should be 6 characters long');
            }
        } else {
            alert('Please enter a valid email address');
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

    return (
        <div className="App">
            {isLoading ? <MyComponent customLoader={<SimpleLight/>}/> : <Container className="hundred">
                <Row className="hundred">
                    <Col className="hundred">
                        <div className="chatBoxes">
                            <div className="chat" id="chatDiv">
                                <div className="chatHeader">
                                    <RiMessage2Line className="messageDots"/>
                                    <h5 className="text">We'll text you</h5>
                                </div>
                                <div className="chatContent">
                                    <div className="content1" id="con1">
                                        <div className="left">
                                            <div className="ourTeam">
                                                <p className="team">Enter your information, and our team will text you
                                                    shortly.</p>
                                            </div>
                                        </div>
                                        <div className="right">
                                            <Form className="chatForm">
                                                <Form.Group className="mb-3 forms">{/*  controlId="formBasicEmail" */}
                                                    <Form.Label className="labels">Name<sup>*</sup></Form.Label>
                                                    <Form.Control id="name" type="text" className="chat-input"/>

                                                    <Form.Label className="labels"> Email
                                                        Address <sup>*</sup></Form.Label>
                                                    <Form.Control id="email" type="email" className="chat-input"/>

                                                    <Form.Label className="labels"> Password <sup>*</sup></Form.Label>
                                                    <Form.Control id="pass" type="password" className="chat-input"/>

                                                    <Form.Label className="labels">Message<sup>*</sup></Form.Label>
                                                    <Form.Control id="msg" type="text" className="chat-input"/>

                                                    <div className="circle">

                                                    </div>

                                                </Form.Group>

                                                <p className="bySubmittind">By submitting, you authorize Tampa Furniture
                                                    Outlet to send text messages with offers & other information,
                                                    possibly using automated technology, to the number you provided.
                                                    Message/data rates apply. Consent is not a condition of
                                                    purchase.</p>

                                                <Button variant="primary" onClick={onCreateUser} type="button"
                                                        className="chat-button">
                                                    Send
                                                </Button>

                                            </Form>
                                        </div>
                                    </div>

                                    <div className="content2" id="con2">
                                        <div className="chatBox2">
                                        {
                                            allMsgs.map((msg, i) => {
                                                return (
                                                    <div key={msg.msg + i}
                                                         className={msg.isCurrentUser ? 'rightys' : 'leftys'}>
                                                        <div
                                                            className={msg.isCurrentUser ? 'right2' : 'left2'}>
                                                            <div className="images">
                                                                <Image src={logo} thumbnail={true}
                                                                       className="logos"/>
                                                            </div>
                                                            {msg.isCurrentUser ? <h6> You </h6> :
                                                                <h6> {msg.senderName} </h6>}
                                                            {/*<span>10:24</span>*/}
                                                        </div>
                                                        {msg.msgType === 'msg' ?
                                                            <p className="message"> {msg.msg} <span>10:24</span> </p> : ''}
                                                        {msg.msgType !== 'msg' && msg.msgType !== 'image' ?
                                                            <div className="imageWithTime"><Image

                                                                src="https://i.ibb.co/Q9rtzLs/ha.jpg"
                                                                className={msg.isCurrentUser ? 'chatImage rightImage' : ' chatImage leftImage'}/> <span className="imageTime">10:24 PM</span></div> : ''}
                                                        {msg.msgType === 'image' ?
                                                            <div className="imageWithTime"><Image src={msg.attachment}
                                                                        className={msg.isCurrentUser ? 'chatImage rightImage' : ' chatImage leftImage'}/><span className="imageTime">10:24 AM</span></div> : ''}

                                                    </div>
                                                )
                                            })
                                        }
                                        </div>
                                        <div className="typeHeres">
                                            <input className="none" name="file" onChange={readURL} type="file"
                                                   id="pick"/>
                                            <input className="typess" placeholder="Start typing here"
                                                   type="text" id="types" name="types"/>
                                            <div className="sendButtons">
                                                <button type="submit" className="sends" onClick={calculateAndSnd}>Send
                                                </button>
                                                <MdAttachFile onClick={pickAnFile} className="black"/>
                                            </div>
                                        </div>

                                    </div>

                                </div>

                                <div className="chatFooter">
                                    <Image src={logo} thumbnail={true}
                                           className="logoss"/>
                                    <a className="use" href="https://www.podium.com/acceptable-use-policy/">use is
                                        subject to terms</a>
                                </div>

                            </div>

                            <div className="chatNow" onClick={() => toggleChatNow('chatDiv')}>
                                <MdMessage className="mdMessages"/>
                            </div>

                        </div>
                    </Col>
                </Row>
            </Container>}
        </div>
    );
}

export default Frontend;
