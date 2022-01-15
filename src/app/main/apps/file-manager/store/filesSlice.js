import {createSlice, createAsyncThunk, createEntityAdapter} from '@reduxjs/toolkit';
import axios from 'axios';
import {getAuth, onAuthStateChanged} from "firebase/auth";
import {getDatabase, onChildAdded, ref} from "firebase/database";
import * as uploader from '../../chat/Components/Uploader';

export const getFiles = createAsyncThunk('fileManagerApp/files/getFiles', async () => {
    const auth = getAuth();
    const db = getDatabase();
    let xData = [];
    await onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
            const commentsRef = ref(db, `files/${currentUser.uid}`);
            await onChildAdded(commentsRef, async (snapshot) => {
                console.log(snapshot.val());
                if (snapshot.exists()) {
                    for (const privateKey in snapshot.val()) {
                        const item = snapshot.val()[privateKey];
                        // await uploader.getDownloadURLforFiles(currentUser.uid, item.id);
                        xData.push(
                            {
                                ...item,
                                modified: calculate(item.modified),
                                opened: calculate(item.opened),
                                created: calculate(item.created),
                                key: privateKey,
                                preview: uploader.fileURL
                            }
                        );
                        // await uploader.clear();
                    }
                }
            });
        }
    });
    // /api/file-manager-app/files
    if (xData.length < 1) {
        await delay(2000);
    }
    console.log(xData);
    return xData;
});

const calculate = (da) => {
    const d = new Date(da);
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[d.getMonth()] + ' ' + d.getDate() + ' ' + d.getFullYear();
};

const delay = ms => new Promise(res => setTimeout(res, ms));

const filesAdapter = createEntityAdapter({});

export const {
    selectAll: selectFiles,
    selectEntities: selectFilesEntities,
    selectById: selectFileById,
} = filesAdapter.getSelectors((state) => state.fileManagerApp.files);

const filesSlice = createSlice({
    name: 'fileManagerApp/files',
    initialState: filesAdapter.getInitialState({
        selectedItemId: '1',
    }),
    reducers: {
        setSelectedItem: (state, action) => {
            state.selectedItemId = action.payload;
        },
    },
    extraReducers: {
        [getFiles.fulfilled]: filesAdapter.setAll,
    },
});

export const {setSelectedItem} = filesSlice.actions;

export default filesSlice.reducer;
