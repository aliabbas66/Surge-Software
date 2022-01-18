import FusePageSimple from '@fuse/core/FusePageSimple';
import Fab from '@mui/material/Fab';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import withReducer from 'app/store/withReducer';
import {motion} from 'framer-motion';
import {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {styled} from '@mui/material/styles';
import Breadcrumb from './Breadcrumb';
import DetailSidebarContent from './DetailSidebarContent';
import DetailSidebarHeader from './DetailSidebarHeader';
import FileList from './FileList';
import MainSidebarContent from './MainSidebarContent';
import MainSidebarHeader from './MainSidebarHeader';
import reducer from './store';
import {selectFileById, getFiles} from './store/filesSlice';
import * as uploader from '../chat/Components/Uploader';
import * as upload from '../chat/Components/Upload';
import '../chat/Components/Chat.css';

import {getAuth, onAuthStateChanged} from "firebase/auth";
import Paper from "@mui/material/Paper";
import Input from "@mui/material/Input";
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from "firebase/storage";


const Root = styled(FusePageSimple)(({theme}) => ({
    '& .FusePageSimple-header': {
        minHeight: 96,
        height: 96,
        [theme.breakpoints.up('sm')]: {
            minHeight: 160,
            height: 160,
        },
    },
    '& .FusePageSimple-sidebarHeader': {
        minHeight: 96,
        height: 96,
        [theme.breakpoints.up('sm')]: {
            minHeight: 160,
            height: 160,
        },
    },
    '& .FusePageSimple-rightSidebar': {
        width: 320,
    },
}));

function FileManagerApp() {
    const [files, setFiles] = useState([]);
    console.log(files);
    const [isActive, setIsActive] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [percentage, setPercentage] = useState('0%');
    const [open, setOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [shouldCLick, setShouldClick] = useState(false);
    const dispatch = useDispatch();
    const selectedItem = useSelector((state) =>
        selectFileById(state, state.fileManagerApp.files.selectedItemId)
    );

    const pageLayout = useRef(null);

    useEffect(() => {
        dispatch(getFiles());
    }, [dispatch]);

    const pickAnFile = () => {
        if (files.length < 12) {
            if (uploader.isUploading === false) {
                document.getElementById('pick').value = null;
                document.getElementById('pick').click();
            } else {
                alert('There is already some files being upload, please wait...');
            }
        } else {
            alert('You can\'t send more then 12 files at once');
        }
    };

    const onAddFile = () => {
        setShouldClick(true);
    }


    const handleClose = () => {
        setOpen(false);
    }

    const handleSave = async (allFiles) => {
        for (let i = 0; i < allFiles.length; i++) {
            readURL(allFiles[i])
        }
        await setOpen(false);
    }

    const handleOpen = () => {
        setOpen(true);
    }

    const makeid = (length) => {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    }

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const bytesToSize = (bytes) => {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }

    const readURL = async (event) => {
        const auth = getAuth();
        await onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const fil = event.target.files;
                for (let i = 0; i < fil.length; i++) {
                    const file = fil[i];
                    if (file) {
                        const type = file.type.split('/')[0];
                        privateFileUploaderOnFirebase(file, type, currentUser, i, fil.length);
                    }
                }
            }
        });
        /*  const auth = getAuth();
          await onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
              console.log(currentUser);
              setIsActive(true);

              const file = event?.target?.files[0] ? event?.target?.files[0] : event;
              if (file) {
                const type = file.type.split('/')[0];
                await uploader.privateFileUploaderOnFirebase(file, type, currentUser.uid);
                if (uploader.fileURL !== null) {
                  const body = {
                    id: uploader.uploadedfileID,
                    name: file.name,
                    type: type ? type : 'text',
                    owner: currentUser.providerData[0].displayName,
                    size: bytesToSize(file.size),
                    modified: file.lastModified,
                    opened: new Date().getTime(),
                    created: new Date().getTime(),
                    extention: file.type.split('/')[1] ? file.type.split('/')[1] : 'text',
                    location: 'My Files > ' + capitalizeFirstLetter(type),
                    offline: false,
                    preview: uploader.fileURL,
                  };
                  await setFiles(oldArray => [...oldArray, body]);
                  setIsActive(false);
                } else {
                  alert('Something Went Wrong');
                  setIsActive(false);
                }
              }
            }
          });*/
    };

    const privateFileUploaderOnFirebase = async (file, type, currentUser, i, totalFiles) => {
        if (file) {
            setIsUploading(true);
            const storage = getStorage();
            const fileID = type + '/' + makeid(20) + file.name;
            return new Promise((resolve, reject) => {
                const storageRef = ref(storage, currentUser.uid + '/' + fileID);
                const uploadTask = uploadBytesResumable(storageRef, file);
                uploadTask.on('state_changed',
                    (snapshot) => {
                        // Observe state change events such as progress, pause, and resume
                        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                        setPercentage(((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(2));
                        // console.log('Upload is ' + percentage + '% done');
                        /*   switch (snapshot.state) {
                               case 'paused':
                                   console.log('Upload is paused');
                                   break;
                               case 'running':
                                   console.log('Upload is running');
                                   break;
                           }*/
                    },
                    (error) => {
                        setIsUploading(false);
                        // Handle unsuccessful uploads
                    },
                    () => {
                        // Handle successful uploads on complete
                        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                            if ((i + 1) === totalFiles) {
                                setIsUploading(false);
                            }
                            const body = {
                                id: fileID,
                                name: file.name,
                                type: type ? type : 'text',
                                owner: currentUser.providerData[0].displayName,
                                size: bytesToSize(file.size),
                                modified: file.lastModified,
                                opened: new Date().getTime(),
                                created: new Date().getTime(),
                                extention: file.type.split('/')[1] ? file.type.split('/')[1] : 'text',
                                location: 'My Files > ' + capitalizeFirstLetter(type),
                                offline: false,
                                preview: downloadURL,
                            };
                            console.log(body);
                            await upload.upload(currentUser, type, body);
                            await dispatch(getFiles());
                            // await setFiles(oldArray => [...oldArray, body]);
                            // console.log(files);
                        });
                    }
                );
            });
        }
    };


    function handleSearchText(event) {
        setSearchText(event.target.value);
        // filteredChatList = getFilteredArray([...chatListContacts], event.target.value);
    }

    return (
        <Root
            header={
                <div className="flex flex-col flex-1 p-8 sm:p-12 relative">
                    <div className="flex items-center justify-between">
                        <IconButton
                            onClick={(ev) => {
                                pageLayout.current.toggleLeftSidebar();
                            }}
                            aria-label="open left sidebar"
                            size="large"
                        >
                            <Icon>menu</Icon>
                        </IconButton>
                        <motion.div initial={{scale: 0}} animate={{scale: 1, transition: {delay: 0.2}}}>
                            <Paper className="flex p-4 items-center w-full px-8 py-4 shadow">
                                <Icon color="action">search</Icon>
                                <Input
                                    placeholder="Search"
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
                            {/* <input type="search" />
              <IconButton aria-label="search" size="large">
                <Icon>search</Icon>
              </IconButton>*/}
                        </motion.div>
                    </div>
                    <div className="flex flex-1 items-end">
                        <Fab
                            component={motion.div}
                            initial={{scale: 0}}
                            animate={{scale: 1, transition: {delay: 0.6}}}
                            color="secondary"
                            aria-label="add"
                            className="absolute bottom-0 ltr:left-0 rtl:right-0 mx-16 -mb-28 z-999"
                            onClick={pickAnFile}
                        >
                            <Icon>add</Icon>
                            <input name="file" onChange={readURL} type="file"
                                   id="pick" multiple/>
                        </Fab>
                        <motion.div
                            initial={{opacity: 0}}
                            animate={{opacity: 1, transition: {delay: 0.6}}}
                        >
                            {selectedItem && (
                                <Breadcrumb
                                    selected={selectedItem}
                                    className="flex flex-1 ltr:pl-72 rtl:pr-72 pb-12 text-16 sm:text-24 font-semibold"
                                />
                            )}
                        </motion.div>
                    </div>
                </div>
            }
            content={<FileList iS={isUploading} per={percentage} pageLayout={pageLayout} data={files} set={setFiles}
                               search={searchText}/>}
            leftSidebarVariant="temporary"
            leftSidebarHeader={<MainSidebarHeader/>}
            leftSidebarContent={<MainSidebarContent/>}
            rightSidebarHeader={<DetailSidebarHeader pageLayout={pageLayout}/>}
            rightSidebarContent={<DetailSidebarContent/>}
            ref={pageLayout}
            innerScroll
        />
    );
}

export default withReducer('fileManagerApp', reducer)(FileManagerApp);
