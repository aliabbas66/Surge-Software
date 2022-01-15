import {createEntityAdapter, createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';

export const getProjects = createAsyncThunk(
    'projectDashboardApp/projects/getProjects',
    async (id) => {
        if (id) {
            const apiData = [];
            // http://nodejs-env.eba-7ha6i7ne.us-east-1.elasticbeanstalk.com/api/campaigns?id=act_231039647562725
            const url = `http://nodejs-env.eba-7ha6i7ne.us-east-1.elasticbeanstalk.com/api/campaigns?id=` + id;
            const response = await axios.get(url);
            for (let i = 0; i < response.data.length; i++) {
                apiData.push({
                    ...response.data[i],
                    id: Number(response.data[i].id)
                });
            }
            if (response.status === 200) {
                localStorage.setItem('marketing', id);
                return apiData;
            } else {
                alert('Something went wrong, Please disable any adblocker if exists or try later ');
                return [];
            }
        } else {
            const savedID = localStorage.getItem('marketing');
            if (savedID) {
                const apiData = [];
                // http://nodejs-env.eba-7ha6i7ne.us-east-1.elasticbeanstalk.com/api/campaigns?id=act_231039647562725
                const url = `http://nodejs-env.eba-7ha6i7ne.us-east-1.elasticbeanstalk.com/api/campaigns?id=` + savedID;
                const response = await axios.get(url);
                console.log(response);
                for (let i = 0; i < response.data.length; i++) {
                    apiData.push({
                        ...response.data[i],
                        id: Number(response.data[i].id)
                    });
                }
                if (response.status === 200) {
                    // localStorage.setItem('marketing', savedID);
                    return apiData;
                } else {
                    alert('Something went wrong, Please disable any adblocker if exists or try later ');
                    return [];
                }
            } else {
                return [];
            }
        }

    }
);

const projectsAdapter = createEntityAdapter({});

export const {
    selectAll: selectProjects,
    selectEntities: selectProjectsEntities,
    selectById: selectProjectById,
} = projectsAdapter.getSelectors((state) => state.projectDashboardApp.projects);

const projectsSlice = createSlice({
    name: 'projectDashboardApp/projects',
    initialState: projectsAdapter.getInitialState(),
    reducers: {},
    extraReducers: {
        [getProjects.fulfilled]: projectsAdapter.setAll,
    },
});

export default projectsSlice.reducer;
