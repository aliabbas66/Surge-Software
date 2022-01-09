import { FileAddOutlined, SendOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react'
import io from "socket.io-client";
import { isAuthenticated } from '../../../components/auth/auth';
import { ChatLayout } from '../../../components/chat/ChatLayout';
import Avatar from '@mui/material/Avatar';
import './Admin.css';
import { Button, FormControl, Grid, InputAdornment, OutlinedInput } from '@mui/material';
import fileDownload from 'js-file-download';


let socket;
export const ChatBody = (props) => {
  const receiver = props.match.params.id;
  const user = isAuthenticated();
  const [chatMessage, setChatMessage] = useState("");
  const [getMessage, setGetMessage] = useState([]);
  const [file, setFile] = useState('');
  const [onlineMessage, setOnlineMessage] = useState('');
  const [receiverHeader, setReceiverHeader] = useState({});
  const [loading, setLoading] = useState(false);

  let ENDPOINT;
  if (process.env.NODE_ENV === 'production') {
    ENDPOINT = "https://mychatapp786.herokuapp.com/"; // The url of the domain on which you are hosting your backend in production mode
  }
  else {
    ENDPOINT = "http://localhost:8000";    // The url of the backend server in developement mode
  }


  const onChange = e => {
    setChatMessage(e.target.value);
  };


  const getSpecificUserChat = async () => {
    await axios.post(`/api/chats/ind-chat`, { userId: user._id, receiverId: receiver }, {
      headers: {
        authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(res => {
      if (res.status === 200) {
        setGetMessage(res.data.result);
      }
      else {
        setGetMessage('');
      }
    })
  }


  const getUserById = async () => {
    await axios.get(`/api/users/get/${receiver}`).then(res => {
      setReceiverHeader(res.data);
    })
  }

  const scrolltobottom = async() => {
    var myDiv = document.getElementById("myDiv");
    myDiv && myDiv.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'start'});;
  }



  useEffect(() => {
    socket = io(ENDPOINT)
    socket.emit("join", { userId: user._id, username: user.username }, () => {

    });

    socket.emit('Get Online Status', { receiver });

    socket.on("Outputting Online Status", online => {
      setOnlineMessage(online);
    });

    socket.on("Output Chat Message", messageFromBackend => {
      setGetMessage(messageFromBackend);
      scrolltobottom();
    });

    return () => {
      // socket.disconnect();
    }
  }, [ENDPOINT]);

  const submitChatHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    let type = "Text";
    chatMessage &&
      await socket.emit("Input Chat Message", {
        message: chatMessage,
        userId: user._id,
        username: user.username,
        receiver: receiver,
        nowTime: moment().format("dddd, MMMM Do YYYY, h:mm:ss a"),
        type
      });
    setChatMessage("");
    scrolltobottom();
    setLoading(false);

  }

  function noScroll() {
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    // closeForm();
    getSpecificUserChat();
    getUserById();
    scrolltobottom();
    socket.emit('Get Online Status', { receiver });
    socket.on("Outputting Online Status", online => {
      setOnlineMessage(online);
    });

    noScroll();

    return () => {

    }
  }, [receiver]);

  const handleImageChange = (e) => {
    setFile(
      e.target.files[0]

    )
  }
  const UploadImage = () => {
    setLoading(true);
    let data = new FormData();
    data.append('file', file);
    let type = "VideoOrImage"
    axios.post('/api/chats/upload-image', data, {
      headers: {
        authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(res => {
      if (res.status === 200) {
        socket.emit("Input Chat Message", {
          message: res.data.url,
          cloudinary_id: res.data.id,
          userId: user._id,
          username: user.username,
          receiver: receiver,
          nowTime: moment().format("dddd, MMMM Do YYYY, h:mm:ss a"),
          type
        });

        setFile('');
        setLoading(false);
      }
    });
  }

  const handleDownload = (url, filename) => {
    axios.get(url, {
      responseType: 'blob',
    })
      .then((res) => {
        fileDownload(res && res.data, filename);
        document.location.reload();
      })
  }

  return (
    <ChatLayout usersSide>
      <div className='admin-chat-body' style={{ position: 'relative' }}>
        <div style={{ position: 'relative' }}>
          <div className='header-avatar'>
            <div className='name-container'>
              <div>
                <Avatar sx={{ background: 'rgb(255, 87, 34)' }}>{receiverHeader.fullName ? receiverHeader.fullName.charAt(0) : 'X'}</Avatar>
              </div>
              <div>
                <h4 className='name'>{receiverHeader.fullName}</h4>
                <p className='online'>{onlineMessage}</p>
              </div>
            </div>
            <div className='info-container'>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <div>Name:</div>
                </Grid>
                <Grid item xs={8}>
                  <div>{receiverHeader.fullName}</div>
                </Grid>
                <Grid item xs={4}>
                  <div>Email:</div>
                </Grid>
                <Grid item xs={8}>
                  <div>{receiverHeader.email}</div>
                </Grid>
                <Grid item xs={4}>
                  <div>Phone:</div>
                </Grid>
                <Grid item xs={8}>
                  <div>{receiverHeader.phone}</div>
                </Grid>
              </Grid>
            </div>
          </div>
        </div>

        <div>
          <div style={{ overflowX: 'hidden', marginTop: '0px', height: '62vh', overflowY: 'auto' }}>
            {
              getMessage && getMessage.map(chat => {
                return (
                  <>
                    <div className='message-container'>
                      {
                        chat.sender._id !== user._id &&
                        <button className='receiver each'>
                          <div className='d-flex'>
                            <Avatar sx={{ background: 'rgb(255, 87, 34)' }}>{receiverHeader.fullName ? receiverHeader.fullName.charAt(0) : 'X'}</Avatar>
                            <div>
                              <p className='time '>{moment(chat.timeOfSending, 'dddd, MMMM Do YYYY, h:mm:ss a').fromNow()}</p>
                              {
                                chat.message.substring(0, 6) === "http:/" ?
                                  chat.message.substring(chat.message.length - 3, chat.message.length) === "mp4" ?
                                    <video style={{ width: '100%' }} src={chat.message} controls alt='video' type="video/mp4" />
                                    :
                                    chat.message.substring(chat.message.length - 3, chat.message.length) === "png" ||
                                      chat.message.substring(chat.message.length - 3, chat.message.length) === "jpg" ||
                                      chat.message.substring(chat.message.length - 3, chat.message.length) === "jpeg"
                                      ?
                                      <img src={chat.message} alt='image' style={{ width: '100%' }} />
                                      :
                                      <div key={chat._id} style={{ cursor: 'pointer', wordBreak: 'break-word' }} onClick={() => {
                                        handleDownload(chat.message, chat.message)
                                      }}>{chat.message}</div>
                                  :
                                  <p className='message'>{chat.message}</p>
                              }
                            </div>
                          </div>
                        </button>
                      }
                      {
                        chat.sender._id === user._id &&
                        <button className='sender each'>
                          <div className='d-flex'>
                            <Avatar sx={{ background: 'rgb(255, 87, 34)' }}>{chat.sender.fullName ? chat.sender.fullName.charAt(0) : 'X'}</Avatar>
                            <div>
                              <p className='time '>{moment(chat.timeOfSending, 'dddd, MMMM Do YYYY, h:mm:ss a').fromNow()}</p>
                              <div>
                                {
                                  chat.message.substring(0, 6) === "http:/" ?
                                    chat.message.substring(chat.message.length - 3, chat.message.length) === "mp4" ?
                                      <video style={{ width: '100%' }} src={chat.message} controls alt='video' type="video/mp4" />
                                      :
                                      chat.message.substring(chat.message.length - 3, chat.message.length) === "png" ||
                                        chat.message.substring(chat.message.length - 3, chat.message.length) === "jpg" ||
                                        chat.message.substring(chat.message.length - 3, chat.message.length) === "jpeg"
                                        ?
                                        <img src={chat.message} alt='image' style={{ width: '100%' }} />
                                        :
                                        <div key={chat._id} style={{ cursor: 'pointer', wordBreak: 'break-word' }} onClick={() => {
                                          handleDownload(chat.message, chat.message)
                                        }}>{chat.message}</div>
                                    :
                                    <p className='message' id = 'message'>{chat.message}</p>
                                }
                              </div>
                            </div>
                          </div>
                        </button>

                      }
                     
                    </div>
                  </>
                )
              })
            }
              <div id='myDiv'>
              </div>
            {
              file &&
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '23px', marginBottom: '10px' }}>
                {
                  loading ?
                    <div style={{ textAlign: 'center', paddingBottom: '10px' }}><p>Loading...</p></div>
                    :
                    <>
                      <p style={{ textAlign: 'center', wordBreak: 'break-word' }}>{file.name}</p>
                      <img className="profileImage" style={{ maxWidth: '60%' }} src={file !== '' ? URL.createObjectURL(file) : ''} alt=""></img>
                      <Button onClick={UploadImage}><SendOutlined /></Button>
                    </>
                }
              </div>
            }
          </div>
          <div style={{ position: 'fixed', bottom: '0px', width: '80%' }}>
            <div className='input-container'>
              <FormControl sx={{ m: 1, width: '100%', borderWidth: '2px' }} variant="outlined">
                <OutlinedInput
                  style={{ borderRadius: '32px' }}
                  id="outlined-adornment-weight"
                  value={chatMessage}
                  onChange={onChange}
                  placeholder='Message'
                  endAdornment={<InputAdornment position="end">
                    <div className='mt-3 upload' style={{ width: '30px' }}>
                      <label className='pl-3 pt-2'>
                        <i class="fas fa-paperclip"></i>
                        <span className='pl-4'>
                          <FileAddOutlined />
                        </span>
                        <input type="file" name='files' multiple style={{ visibility: "hidden", height: '10px' }} onChange={handleImageChange} />
                      </label>
                    </div>
                    <SendOutlined onClick={submitChatHandler} /></InputAdornment>}
                  aria-describedby="outlined-weight-helper-text"
                  inputProps={{
                    'aria-label': 'weight',
                  }}
                />
              </FormControl>
            </div>

          </div>

        </div>
      </div>
    </ChatLayout>

  )
}
