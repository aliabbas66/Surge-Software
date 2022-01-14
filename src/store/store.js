/*import { configureStore } from '@reduxjs/toolkit'
import
export default configureStore({
    reducer: {}
}) */
import React from 'react';
import {createStore, combineReducers, applyMiddleware} from 'redux';
import Thunk from 'redux-thunk';

import userReducer from '../store/reducers/usersReduers';
import messagesReducer from '../store/reducers/messageReducers';

const rootReducer = combineReducers({
    users : userReducer,
    messages : messagesReducer,
});

const store = createStore(rootReducer, applyMiddleware(Thunk));
export default store;
