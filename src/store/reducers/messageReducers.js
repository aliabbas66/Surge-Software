import {GET_MESSAGE, SHOULD_CLEAR} from '../actions/messageActions';

const initialState = {
    Messages: [],
    allMsgs: [],
};

export default (state = initialState, action) => {

    switch (action.type) {
        case GET_MESSAGE:
            // const getmessages = action.getmessages;
            // console.log(action.getmessages);
            return {
                ...state,
                Messages: state.Messages.concat(action.getmessages)
            };
        case SHOULD_CLEAR:
            return {
                Messages: []
            };
    }

    return state;
};
