import {getAuth, onAuthStateChanged} from "firebase/auth";
const auth = getAuth();

export const saveMyFiles = async () => {
    await onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
            console.log(currentUser);
        }
    });
};