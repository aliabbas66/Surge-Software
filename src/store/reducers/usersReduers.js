import {GET_USERS} from '../actions/userActions';

const initialState = {
    Dates: [],
};

export default (state = initialState, action) => {

    switch (action.type) {
        case GET_USERS:
            const getusers = action.getusers;
            return {
                Dates: getusers,
            };
    }

    return state;
};
