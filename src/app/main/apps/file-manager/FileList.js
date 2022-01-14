import Hidden from '@mui/material/Hidden';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import {useDispatch, useSelector} from 'react-redux';
import {motion} from 'framer-motion';
import {setSelectedItem, selectFiles, getFiles} from './store/filesSlice';
import StyledIcon from './StyledIcon';
import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import './FIleManager.css';
import {getDatabase, push, ref} from "firebase/database";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import {useEffect, useState} from "react";
import FuseUtils from "../../../../@fuse/utils";
import {filteredChatList} from "../chat/ChatsSidebar";


function FileList(props) {
    const dispatch = useDispatch();
    let files = useSelector(selectFiles);
    const [mount, setMoment] = useState(0);
    const selectedItemId = useSelector(({fileManagerApp}) => fileManagerApp.files.selectedItemId);



    useEffect(() => {
        setTimeout(() => {
            if (files.length < 1) {
                setMoment((old) => 1 + old);
            }
        }, 1000);
    });

    const uploadMyFiles = async () => {
        const auth = getAuth();
        console.log(props.data);
        const db = getDatabase();
        await onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                for (let i = 0; i < props.data.length; i++) {
                    await push(ref(db, `files/${currentUser.uid}/${props.data[i].type}`), props.data[i])
                        .then(async () => {
                            await props.set([])
                            await dispatch(getFiles());
                        });
                }
            }
        });
    };

    const getFilteredArray = (arr, _searchText) => {
        return arr.filter(item => {
            return item.name.toLowerCase().indexOf(_searchText.toLowerCase()) > -1;
        });
    }

    if (props.search !== '') {
        files = getFilteredArray([...files], props.search);
    }

    return (
        <motion.div
            initial={{y: 50, opacity: 0.8}}
            animate={{y: 0, opacity: 1, transition: {delay: 0.3}}} className="relative"
        >
            <Table className="simple borderless">
                <TableHead>
                    <TableRow>
                        <TableCell className="max-w-64 w-64 p-0 text-center"> </TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell className="hidden sm:table-cell">Type</TableCell>
                        <TableCell className="hidden sm:table-cell">Owner</TableCell>
                        <TableCell className="text-center hidden sm:table-cell">Size</TableCell>
                        <TableCell className="hidden sm:table-cell">Modified</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {files.map((item) => {
                        return (
                            <TableRow
                                key={item.id}
                                hover
                                onClick={(event) => dispatch(setSelectedItem(item.id))}
                                selected={item.id === selectedItemId}
                                className="cursor-pointer h-64"
                            >
                                <TableCell className="max-w-64 w-64 p-0 text-center">
                                    <StyledIcon type={item.type}/>
                                </TableCell>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell className="hidden sm:table-cell">{item.type}</TableCell>
                                <TableCell className="hidden sm:table-cell">{item.owner}</TableCell>
                                <TableCell className="text-center hidden sm:table-cell">
                                    {item.size === '' ? '-' : item.size}
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">{item.modified}</TableCell>
                                <Hidden lgUp>
                                    <TableCell>
                                        <IconButton
                                            onClick={(ev) => props.pageLayout.current.toggleRightSidebar()}
                                            aria-label="open right sidebar"
                                            size="large"
                                        >
                                            <Icon>info</Icon>
                                        </IconButton>
                                    </TableCell>
                                </Hidden>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            {
                props?.data?.length > 0 ?
                    <div className="uploadBox">
                        <div className="uploadPalent">
                            {
                                props.data.map((file, index) => {
                                    return (

                                        <div key={'uploadedFile' + index} className="uploadFiles">
                                            <div className="uploadeCLose">
                                                <CloseIcon color="action">
                                                    Close
                                                </CloseIcon>
                                            </div>

                                            <div className="fileName">
                                                <h6 className="uploadFileName">{file.name}</h6>
                                                <h6 className="maxSize"> {file.size} </h6>
                                            </div>

                                            <div className="deleteFile">
                                                <DeleteForeverIcon color="action"
                                                                   onClick={() => props.set(props.data.filter(item => item.preview !== file.preview))}>
                                                    Delete
                                                </DeleteForeverIcon>
                                            </div>

                                        </div>

                                    )
                                })
                            }
                        </div>
                        <div className="uploasSend">
                            <button type="button" onClick={uploadMyFiles} className="sendBtn"> Upload </button>
                        </div>

                    </div>

                    : null
            }

        </motion.div>
    );
}

export default FileList;
