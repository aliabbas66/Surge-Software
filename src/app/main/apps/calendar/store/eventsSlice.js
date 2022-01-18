import { createEntityAdapter, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import {getDatabase, onChildAdded, push, ref, update, remove} from 'firebase/database';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import formatISO from 'date-fns/formatISO';
import {getTodos} from "../../todo/store/todosSlice";

export const dateFormat = 'YYYY-MM-DDTHH:mm:ss.sssZ';
export let dat = [];

export const getEvents = createAsyncThunk('calendarApp/events/getEvents', async () => {
  let currentUser = null;
  const auth = await getAuth();
  await onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
    } else {
      currentUser = null;
    }
  });
  dat = [];
  const res = await axios.get(`https://surge-bb99e-default-rtdb.firebaseio.com/todo/${currentUser.uid}/.json`);
  const x = await res.data;
  for (const key in x) {
    if (x[key].deleted === false) {
      const obj = {
        allDay: true,
        end: x[key].dueDate,
        id: key,
        start: x[key].startDate,
        title: x[key].title,
        extendedProps: {
          desc: x[key].notes
        }
      };
      dat.push(obj);
    }
  }
  console.log(dat);
  return dat;
});

export const addEvent = createAsyncThunk(
  'calendarApp/events/addEvent',
  async (newEvent, { dispatch }) => {
    const obj = {
      completed: false,
      deleted: false,
      dueDate: newEvent.end,
      important: false,
      notes: newEvent?.extendedProps?.desc,
      starred: false,
      startDate: newEvent.start,
      title: newEvent.title
    };
    const auth = getAuth();
    const db = getDatabase();
    await onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await push(ref(db, `todo/${currentUser.uid}`), obj)
            .then(async () => {
              await dispatch(getEvents());
            });
      }
    });
    const response = await axios.post('/api/calendar-app/add-event', {
      newEvent,
    });
    const data = await response.data;
    return data;
  }
);

export const updateEvent = createAsyncThunk(
  'calendarApp/events/updateEvent',
  async (event, { dispatch }) => {
    const obj = {
      completed: false,
      deleted: false,
      dueDate: event.end,
      important: false,
      notes: event?.extendedProps?.desc,
      starred: false,
      startDate: event.start,
      title: event.title
    };
    const auth = getAuth();
    const db = getDatabase();
    await onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await update(ref(db, `todo/${currentUser.uid}/${event.id}`), obj)
            .then(async () => {
              await dispatch(getEvents());
            });
      }
    });
    const response = await axios.post('/api/calendar-app/update-event', { event });
    const data = await response.data;
    return data;
  }
);

export const removeEvent = createAsyncThunk(
  'calendarApp/events/remove-event',
  async (eventId, { dispatch }) => {
    const todo = dat.find(obj => obj.id === eventId);
    const auth = getAuth();
    const db = getDatabase();
    await onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const x = {
          completed: false,
          deleted: true,
          dueDate: todo.end,
          important: false,
          notes: todo?.extendedProps?.desc,
          starred: false,
          startDate: todo.start,
          title: todo.title
        };
        await update(ref(db, `todo/${currentUser.uid}/${eventId}`), x)
            .then(async () => {
              await dispatch(getEvents());
            });
      }
    });
    return eventId;
  }
);

const eventsAdapter = createEntityAdapter({});

export const {
  selectAll: selectEvents,
  selectIds: selectEventIds,
  selectById: selectEventById,
} = eventsAdapter.getSelectors((state) => state.calendarApp.events);

const eventsSlice = createSlice({
  name: 'calendarApp/events',
  initialState: eventsAdapter.getInitialState({
    eventDialog: {
      type: 'new',
      props: {
        open: false,
      },
      data: null,
    },
  }),
  reducers: {
    openNewEventDialog: {
      prepare: (event) => {
        const payload = {
          type: 'new',
          props: {
            open: true,
          },
          data: {
            start: formatISO(event.start),
            end: formatISO(event.end),
          },
        };
        return { payload };
      },
      reducer: (state, action) => {
        state.eventDialog = action.payload;
      },
    },
    openEditEventDialog: {
      prepare: (event) => {
        const payload = {
          type: 'edit',
          props: {
            open: true,
          },
          data: {
            ...event,
            start: formatISO(event.start),
            end: formatISO(event.end),
          },
        };
        return { payload };
      },
      reducer: (state, action) => {
        state.eventDialog = action.payload;
      },
    },
    closeNewEventDialog: (state, action) => {
      state.eventDialog = {
        type: 'new',
        props: {
          open: false,
        },
        data: null,
      };
    },
    closeEditEventDialog: (state, action) => {
      state.eventDialog = {
        type: 'edit',
        props: {
          open: false,
        },
        data: null,
      };
    },
  },
  extraReducers: {
    [getEvents.fulfilled]: eventsAdapter.setAll,
    [addEvent.fulfilled]: eventsAdapter.addOne,
    [updateEvent.fulfilled]: eventsAdapter.upsertOne,
    [removeEvent.fulfilled]: eventsAdapter.removeOne,
  },
});

export const {
  openNewEventDialog,
  closeNewEventDialog,
  openEditEventDialog,
  closeEditEventDialog,
} = eventsSlice.actions;

export default eventsSlice.reducer;
