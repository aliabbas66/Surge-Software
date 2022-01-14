import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import {useDispatch, useSelector} from 'react-redux';
import { selectFileById, getFiles } from './store/filesSlice';
import {getDatabase, onChildAdded, ref, remove} from "firebase/database";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import {useState, useEffect} from "react";

function DetailSidebarHeader(props) {
  const dispatch = useDispatch();
  const selectedItem = useSelector((state) =>
    selectFileById(state, state.fileManagerApp.files.selectedItemId)
  );

  if (!selectedItem) {
    return null;
  }

  const onDeleteItem = async () => {
    const db = getDatabase();
    const auth = getAuth();
    await onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
       await remove(ref(db, `files/${currentUser.uid}/${selectedItem.type}/${selectedItem.key}`)).then(async () => {
         await dispatch(getFiles());
         props.pageLayout.current.toggleRightSidebar()
       }).catch(err => {
         alert('Something Went Wrong');
       });
      }
    });

  };

  return (
    <div className="flex flex-col justify-between h-full p-4 sm:p-12">
      <div className="toolbar flex align-center justify-end">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.2 } }}>
          <IconButton size="large" onClick={onDeleteItem}>
            <Icon>delete</Icon>
          </IconButton>
        </motion.div>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.2 } }}>
          <IconButton size="large">
            <Icon>cloud_download</Icon>
          </IconButton>
        </motion.div>
        <IconButton size="large">
          <Icon>more_vert</Icon>
        </IconButton>
      </div>

      <div className="p-12">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.2 } }}>
          <Typography variant="subtitle1" className="mb-8 font-semibold">
            {selectedItem.name}
          </Typography>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.3 } }}>
          <Typography variant="caption" className="font-medium">
            <span>Edited</span>
            <span>: {selectedItem.modified}</span>
          </Typography>
        </motion.div>
      </div>
    </div>
  );
}

export default DetailSidebarHeader;
