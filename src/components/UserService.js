import {child, get, db, ref, getDatabase} from "firebase/database";
import {getAuth, signInWithEmailAndPassword} from "firebase/auth";


export let user = null;
export let currentUser = null;

export const getUser = async () => {
    const auth = getAuth();
    const currentuser = localStorage.getItem('user');
    if (currentuser) {
        user = JSON.parse(currentuser);
        await getCurrentUser();
        /*await signInWithEmailAndPassword(auth, user.email, user.seasion)
            .then(async (userCredential) => {
                const body = {
                    ...userCredential.user,
                    seasion: user.seasion
                }
                localStorage.setItem('user', JSON.stringify(body));
                await getCurrentUser();
            })
            .catch((error) => {
                console.log(error);
                // const errorCode = error.code;
                // const errorMessage = error.message;
            });*/
    } else {
       console.log('User Seasion Expired, Please login again');
    }
}

export const getCurrentUser = async () => {
    const db = ref(getDatabase());
    await get(child(db, `users/${user.uid}`)).then((snapshot) => {
        if (snapshot.exists()) {
            currentUser = snapshot.val();
        }
    }).catch((error) => {
        console.error(error);
        return false;
    });
}

// getUser();