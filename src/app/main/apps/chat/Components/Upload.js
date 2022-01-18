import {ref, push, getDatabase} from "firebase/database";
import { getFiles } from '../../file-manager/store/filesSlice';

export const upload = async (currentUser, type, obj) => {
    const db = getDatabase();
    await push(ref(db, `files/${currentUser.uid}/${type}`), obj)
        .then(async () => {
            console.log('Uploaded');
        });
};