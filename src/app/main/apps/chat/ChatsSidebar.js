import FuseScrollbars from '@fuse/core/FuseScrollbars';
import FuseUtils from '@fuse/utils';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import {useTheme} from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import {motion} from 'framer-motion';
import {useEffect, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import ContactListItem from './ContactListItem';
import StatusIcon from './StatusIcon';
import {getChat} from './store/chatSlice';
import {selectContacts} from './store/contactsSlice';
import {openUserSidebar} from './store/sidebarsSlice';
import {myBackup, myChats, updateUserData} from './store/userSlice';
import './Components/Chat.css';

export let filteredChatList = [];
export let interVAL = null;

const statusArr = [
    {
        title: 'Online',
        value: 'online',
    },
    {
        title: 'Away',
        value: 'away',
    },
    {
        title: 'Do not disturb',
        value: 'do-not-disturb',
    },
    {
        title: 'Offline',
        value: 'offline',
    },
];

function ChatsSidebar(props) {
    const dispatch = useDispatch();
    const contacts = useSelector(selectContacts);
    const user = useSelector(({chatApp}) => chatApp.user);
    // console.log(user);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

    const [searchText, setSearchText] = useState('');
    const [statusMenuEl, setStatusMenuEl] = useState(null);
    const [moreMenuEl, setMoreMenuEl] = useState(null);
    const [moment, setMoment] = useState(0);
    const [cha, setCha] = useState([]);

    useEffect(() => {
        setTimeout(() => {
            if (moment < 5) {
                setMoment((moment) => moment + 1);
            }
        }, 2000);
    });

    function handleMoreMenuClick(event) {
        setMoreMenuEl(event.currentTarget);
    }

    function handleMoreMenuClose(event) {
        setMoreMenuEl(null);
    }

    function handleStatusMenuClick(event) {
        event.preventDefault();
        event.stopPropagation();
        setStatusMenuEl(event.currentTarget);
    }

    function handleStatusSelect(event, status) {
        event.preventDefault();
        event.stopPropagation();
        dispatch(
            updateUserData({
                ...user,
                status,
            })
        );
        setStatusMenuEl(null);
    }

    function getFilteredArray(arr, _searchText) {
        if (_searchText.length === 0) {
            return arr;
        }
        return FuseUtils.filterArrayByString(arr, _searchText);
    }

    const chatListContacts =
        contacts.length > 0 && user && user.chatList
            ? user.chatList.map((_chat) => ({
                ..._chat,
                ...contacts.find((_contact) => _contact.id === _chat.contactId),
            }))
            : [];
    const filteredContacts = []; // getFilteredArray([...contacts], searchText);
    const x = getFilteredArray([...chatListContacts], searchText);
    // console.log(x);
    // console.log(filteredChatList);
    if (filteredChatList.length > 0) {
        if (x.length > filteredChatList.length) {
            filteredChatList = x;
            const noti = document.getElementById('noti');
            // console.log(noti);
            if (noti) {
                noti.play();
            }
        }
        if (x.length === filteredChatList.length) {
            let isMatching = false;
            for (let i = 0; i < x.length; i++) {
                if (
                    filteredChatList[i].newMsg === x[i].newMsg &&
                    filteredChatList[i].msgsCount === x[i].msgsCount
                ) {
                    isMatching = true;
                } else {
                    isMatching = false;
                    i = myChats.length;
                }
            }
            filteredChatList = x;
            if (isMatching === false) {
                const noti = document.getElementById('noti');
                if (noti) {
                    noti.play();
                }
            }
        }
        if (cha.length === 0) {
            setCha(filteredChatList);
        }
    } else {
        if (x.length > 0) {
            filteredChatList = x;
            console.log('Getting Users from here');
        } else {
            filteredChatList = cha;
        }
    }

    const container = {
        show: {
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const item = {
        hidden: {opacity: 0, y: 20},
        show: {opacity: 1, y: 0},
    };

    function handleStatusClose(event) {
        event.preventDefault();
        event.stopPropagation();
        setStatusMenuEl(null);
    }

      const fetchRealTime = (contactId, isMobile) => {
         if (interVAL) {
             clearInterval(interVAL);
             interVAL = null;
         }
         interVAL = setInterval(() => {
             dispatch(getChat({contactId, isMobile}))
          }, 2000);
          // clearInterval(interval)
      };

    function handleSearchText(event) {
        setSearchText(event.target.value);
        filteredChatList = getFilteredArray([...chatListContacts], event.target.value);
    }

    return (
        <div className="flex flex-col flex-auto h-full">

            <AppBar position="static" color="default" elevation={0}>
                <Toolbar className="flex justify-between items-center px-4">
                    {user && (
                        <div
                            className="relative w-40 h-40 p-0 mx-12 cursor-pointer"
                            onClick={() => dispatch(openUserSidebar())}
                            onKeyDown={() => dispatch(openUserSidebar())}
                            role="button"
                            tabIndex={0}
                        >
                            <Avatar src={user.avatar} alt={user.name} className="w-40 h-40">
                                {!user.avatar || user.avatar === '' ? user.name[0] : ''}
                            </Avatar>
                            <div
                                className="absolute right-0 bottom-0 -m-4 z-10 cursor-pointer"
                                aria-owns={statusMenuEl ? 'switch-menu' : null}
                                aria-haspopup="true"
                                onClick={handleStatusMenuClick}
                                onKeyDown={handleStatusMenuClick}
                                role="button"
                                tabIndex={0}
                            >
                                <StatusIcon status={user.status}/>
                            </div>

                            <Menu
                                id="status-switch"
                                anchorEl={statusMenuEl}
                                open={Boolean(statusMenuEl)}
                                onClose={handleStatusClose}
                            >
                                {statusArr.map((status) => (
                                    <MenuItem
                                        onClick={(ev) => handleStatusSelect(ev, status.value)}
                                        key={status.value}
                                    >
                                        <ListItemIcon className="min-w-40">
                                            <StatusIcon status={status.value}/>
                                        </ListItemIcon>
                                        <ListItemText primary={status.title}/>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </div>
                    )}

                    <div>
                        <IconButton
                            aria-owns={moreMenuEl ? 'chats-more-menu' : null}
                            aria-haspopup="true"
                            onClick={handleMoreMenuClick}
                            size="large"
                        >
                            <Icon>more_vert</Icon>
                        </IconButton>
                        <Menu
                            id="chats-more-menu"
                            anchorEl={moreMenuEl}
                            open={Boolean(moreMenuEl)}
                            onClose={handleMoreMenuClose}
                        >
                            <MenuItem onClick={handleMoreMenuClose}>Profile</MenuItem>
                            <MenuItem onClick={handleMoreMenuClose}>Logout</MenuItem>
                        </Menu>
                    </div>
                </Toolbar>
                {useMemo(
                    () => (
                        <Toolbar className="px-16">
                            <Paper className="flex p-4 items-center w-full px-8 py-4 shadow">
                                <Icon color="action">search</Icon>
                                <Input
                                    placeholder="Search or start new chat"
                                    className="flex flex-1 px-8"
                                    disableUnderline
                                    fullWidth
                                    value={searchText}
                                    inputProps={{
                                        'aria-label': 'Search',
                                    }}
                                    onChange={handleSearchText}
                                />
                            </Paper>
                        </Toolbar>
                    ),
                    [searchText]
                )}
            </AppBar>

            <FuseScrollbars className="overflow-y-auto flex-1">
                <List className="w-full">
                    <audio id="noti" controls>
                        <source
                            src="https://firebasestorage.googleapis.com/v0/b/surge-bb99e.appspot.com/o/notification.mp3?alt=media&token=e21fed8d-7af9-49fa-af31-f0615616d172"
                            type="audio/ogg"/>
                        <source
                            src="https://firebasestorage.googleapis.com/v0/b/surge-bb99e.appspot.com/o/notification.mp3?alt=media&token=e21fed8d-7af9-49fa-af31-f0615616d172"
                            type="audio/mpeg"/>
                    </audio>
                    <motion.div
                        className="flex flex-col shrink-0"
                        variants={container}
                        initial="hidden"
                        animate="show"
                    >
                        {filteredChatList.length > 0 && (
                            <motion.div variants={item}>
                                <Typography className="font-medium text-20 px-16 py-24" color="secondary">
                                    Chats
                                </Typography>
                            </motion.div>
                        )}

                        {filteredChatList.map((contact, index) => (
                            <motion.div variants={item} key={`chatUserWithFirebaseIndex${index}`}>
                                <ContactListItem
                                    contact={contact} /* dispatch(getChat({contactId, isMobile})) */
                                    onContactClick={(contactId) => fetchRealTime(contactId, isMobile)}
                                />
                            </motion.div>
                        ))}

                        {filteredContacts.length > 0 && (
                            <motion.div variants={item}>
                                <Typography className="font-medium text-20 px-16 py-24" color="secondary">
                                    Contacts
                                </Typography>
                            </motion.div>
                        )}

                        {filteredContacts.map((contact) => (
                            <motion.div variants={item} key={contact.id}>
                                <ContactListItem
                                    contact={contact} /* dispatch(getChat({contactId, isMobile})) */
                                    onContactClick={(contactId) => fetchRealTime(contactId, isMobile)}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                    {/*{useMemo(() => {



          }, [contacts, user, searchText, dispatch, isMobile])}*/}
                </List>
            </FuseScrollbars>
        </div>
    );
}

export default ChatsSidebar;