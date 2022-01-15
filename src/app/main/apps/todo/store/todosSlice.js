import {createSlice, createAsyncThunk, createEntityAdapter} from '@reduxjs/toolkit';
import axios from 'axios';
import {getAuth, onAuthStateChanged} from "firebase/auth";
import {getDatabase, onChildAdded, push, ref, update, remove} from "firebase/database";
import {getFiles} from "../../file-manager/store/filesSlice";
import * as uploader from "../../chat/Components/Uploader";

export const getTodos = createAsyncThunk(
    'todoApp/todos/getTodos',
    async (routeParams, {getState}) => {
        routeParams = routeParams || getState().todoApp.todos.routeParams;
        routeParams = routeParams || getState().todoApp.todos.routeParams;
        const {user} = getState().auth;
        const data = [];
        const userID = user.uid;
        const response = await axios.get(`https://surge-bb99e-default-rtdb.firebaseio.com/todo/${userID}/.json`);
        const x = await response.data;
        for (const key in x) {
            const filterCase = routeParams[Object.keys(routeParams)[0]];
            switch (filterCase) {
                case 'all':
                    if (x[key].deleted === false) {
                        data.push({
                            ...x[key],
                            key,
                            id: key
                        });
                    }
                    break;
                case 'completed':
                    if (x[key].completed) {
                        data.push({
                            ...x[key],
                            key,
                            id: key
                        });
                    }
                    break;
                case 'starred':
                    if (x[key].starred) {
                        data.push({
                            ...x[key],
                            key,
                            id: key
                        });
                    }
                    break;
                case 'important':
                    if (x[key].important) {
                        data.push({
                            ...x[key],
                            key,
                            id: key
                        });
                    }
                    break;
                case 'deleted':
                    if (x[key].deleted) {
                        data.push({
                            ...x[key],
                            key,
                            id: key
                        });
                    }
                    break;
                case 'frontend':
                    if (x[key]?.labels?.length > 0) {
                        for (let i = 0; i< x[key]?.labels.length; i++) {
                            if (x[key]?.labels[i] === 1) {
                                data.push({
                                    ...x[key],
                                    key,
                                    id: key
                                });
                                i = x[key]?.labels.length;
                            }
                        }
                    }
                    break;
                case 'backend':
                    if (x[key]?.labels?.length > 0) {
                        for (let i = 0; i< x[key]?.labels.length; i++) {
                            if (x[key]?.labels[i] === 2) {
                                data.push({
                                    ...x[key],
                                    key,
                                    id: key
                                });
                                i = x[key]?.labels.length;
                            }
                        }
                    }
                    break;
                case 'api':
                    if (x[key]?.labels?.length > 0) {
                        for (let i = 0; i< x[key]?.labels.length; i++) {
                            if (x[key]?.labels[i] === 3) {
                                data.push({
                                    ...x[key],
                                    key,
                                    id: key
                                });
                                i = x[key]?.labels.length;
                            }
                        }
                    }
                    break;
                case 'issue':
                    if (x[key]?.labels?.length > 0) {
                        for (let i = 0; i< x[key]?.labels.length; i++) {
                            if (x[key]?.labels[i] === 4) {
                                data.push({
                                    ...x[key],
                                    key,
                                    id: key
                                });
                                i = x[key]?.labels.length;
                            }
                        }
                    }
                    break;
                case 'mobile':
                    if (x[key]?.labels?.length > 0) {
                        for (let i = 0; i< x[key]?.labels.length; i++) {
                            if (x[key]?.labels[i] === 5) {
                                data.push({
                                    ...x[key],
                                    key,
                                    id: key
                                });
                                i = x[key]?.labels.length;
                            }
                        }
                    }
                    break;
                case 'today':
                    const todoDate = new Date(x[key]?.startDate);
                    if (!Number.isNaN(todoDate?.getFullYear())) {
                        const todayDate = new Date();
                        if (
                            todoDate?.getFullYear() === todoDate?.getFullYear() &&
                            todoDate?.getDate() === todoDate?.getDate() &&
                            todoDate?.getMonth() === todoDate?.getMonth()
                        ) {
                            data.push({
                                ...x[key],
                                key,
                                id: key
                            });
                        }
                    }
                    break;
                default:
                // code block
            }
        }
        await delay(1000);
        return {data, routeParams};
    }
);

const delay = ms => new Promise(res => setTimeout(res, ms));

export const addTodo = createAsyncThunk(
    'todoApp/todos/addTodo',
    async (todo, {dispatch, getState}) => {
        const auth = getAuth();
        const db = getDatabase();
        await onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                await push(ref(db, `todo/${currentUser.uid}`), todo)
                    .then(async () => {
                        await dispatch(getTodos());
                    });
            }
        });
        return todo;
    }
);

export const updateTodo = createAsyncThunk(
    'todoApp/todos/updateTodo',
    async (todo, {dispatch, getState}) => {
        const auth = getAuth();
        const db = getDatabase();
        await onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                if (todo.labels === undefined || todo.labels === null) {
                    todo.labels = [];
                }
                await update(ref(db, `todo/${currentUser.uid}/${todo.key}`), todo)
                    .then(async () => {
                        await dispatch(getTodos());
                    });
            }
        });
        return todo;
    }
);

export const removeTodo = createAsyncThunk(
    'todoApp/todos/removeTodo',
    async (todo, {dispatch, getState}) => {
        const auth = getAuth();
        const db = getDatabase();
        await onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const x = {...todo};
                x.deleted = true
                await update(ref(db, `todo/${currentUser.uid}/${todo.key}`), x)
                    .then(async () => {
                        await dispatch(getTodos());
                    });
            }
        });
        return todo;
    }
);

const todosAdapter = createEntityAdapter({});

export const {selectAll: selectTodos, selectById: selectTodosById} = todosAdapter.getSelectors(
    (state) => state.todoApp.todos
);

const todosSlice = createSlice({
    name: 'todoApp/todos',
    initialState: todosAdapter.getInitialState({
        searchText: '',
        orderBy: '',
        orderDescending: false,
        routeParams: {},
        todoDialog: {
            type: 'new',
            props: {
                open: false,
            },
            data: null,
        },
    }),
    reducers: {
        setTodosSearchText: {
            reducer: (state, action) => {
                state.searchText = action.payload;
            },
            prepare: (event) => ({payload: event.target.value || ''}),
        },
        toggleOrderDescending: (state, action) => {
            state.orderDescending = !state.orderDescending;
        },
        changeOrder: (state, action) => {
            state.orderBy = action.payload;
        },
        openNewTodoDialog: (state, action) => {
            state.todoDialog = {
                type: 'new',
                props: {
                    open: true,
                },
                data: null,
            };
        },
        closeNewTodoDialog: (state, action) => {
            state.todoDialog = {
                type: 'new',
                props: {
                    open: false,
                },
                data: null,
            };
        },
        openEditTodoDialog: (state, action) => {
            state.todoDialog = {
                type: 'edit',
                props: {
                    open: true,
                },
                data: action.payload,
            };
        },
        closeEditTodoDialog: (state, action) => {
            state.todoDialog = {
                type: 'edit',
                props: {
                    open: false,
                },
                data: null,
            };
        },
    },
    extraReducers: {
        [updateTodo.fulfilled]: todosAdapter.upsertOne,
        [addTodo.fulfilled]: todosAdapter.addOne,
        [getTodos.fulfilled]: (state, action) => {
            const {data, routeParams} = action.payload;
            todosAdapter.setAll(state, data);
            state.routeParams = routeParams;
            state.searchText = '';
        },
    },
});

export const {
    setTodosSearchText,
    toggleOrderDescending,
    changeOrder,
    openNewTodoDialog,
    closeNewTodoDialog,
    openEditTodoDialog,
    closeEditTodoDialog,
} = todosSlice.actions;

export default todosSlice.reducer;
