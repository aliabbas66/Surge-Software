import {getStorage, uploadBytes, ref, getDownloadURL} from "firebase/storage";

export let fileURL = null;
export let fileType = 'msg';
export let isUploading = false;

export const clear = () => {
    fileURL = null;
    fileType = 'msg';
};

export const imageUploader = async (imgData, type) => {
    const apiKey = `3931381c497294266cd8b1ef5f2639de`;
    /*
     email: gijeca6632@wwdee.com
     username: gijeca6632
     pass: Hammad6264.
     */
    if (imgData) {
        isUploading = true;
        const form = new FormData();
        form.append('image', imgData);
        const url = 'https://api.imgbb.com/1/upload?key=' + apiKey;
        const rawResponse = await fetch(url, {
            method: 'POST',
            body: form
        });
        const res = await rawResponse.json();
        if (res['status'] === 200) {
            fileURL = res['data'].display_url;
            fileType = type;
        } else {
            fileType = 'msg';
        }
        isUploading = false;
    }
};

export const fileUploaderOnFirebase = async (file, type) => {
    if (file) {
        isUploading = true;
        const storage = getStorage();
        const fileID = type + '/' + makeid(20) + file.name;
        const storageRef = ref(storage,  fileID);
        await uploadBytes(storageRef, file).then(async (snapshot) => {
            await getDownloadURL(ref(storage, fileID))
                .then((url) => {
                    fileURL = url;
                    fileType = type;
                    isUploading = false;
                })
                .catch((error) => {
                    console.log(error);
                    fileURL = null;
                    fileType = 'msg';
                    isUploading = false;
                });
        });
    }
};

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