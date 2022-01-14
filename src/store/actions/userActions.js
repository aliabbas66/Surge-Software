import { getDatabase, ref, child, get, onChildChanged } from 'firebase/database';

export const GET_USERS = 'GET_USERS';
let getusers = [];

export const getDate = (mounted) => {
    return async dispatch => {
        const db = ref(getDatabase());
        getusers = [];
        await get(child(db, `users`)).then((snapshot) => {
            if (snapshot.exists()) {
                for (const key in snapshot.val()) {
                    const user = snapshot.val()[key];
                    const currentUser = JSON.parse(localStorage.getItem('user'));
                    if (currentUser.email !== user.email) {
                        getusers.push(user);
                    }
                }
                return true;
            } else {
                console.log("No users available");
                return false;
            }
        }).catch((error) => {
            console.error(error);
            return false;
        });

        if (!mounted){
            dispatch({type: GET_USERS, getusers: getusers});
        }
    };
};
