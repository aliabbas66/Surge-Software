import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import withReducer from 'app/store/withReducer';
import _ from '@lodash';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import ProjectDashboardAppHeader from './ProjectDashboardAppHeader';
import ProjectDashboardAppSidebar from './ProjectDashboardAppSidebar';
import reducer from './store';
import { getWidgets, selectWidgets } from './store/widgetsSlice';
import { getProjects } from './store/projectsSlice';
import BudgetSummaryTab from './tabs/BudgetSummaryTab';
import HomeTab from './tabs/HomeTab';
import TeamMembersTab from './tabs/TeamMembersTab';
import './css/popup.css';

// import Popup from 'reactjs-popup';
// import 'reactjs-popup/dist/index.css';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-header': {
    minHeight: 160,
    height: 160,
    [theme.breakpoints.up('lg')]: {
      marginRight: 12,
      borderBottomRightRadius: 20,
    },
  },
  '& .FusePageSimple-toolbar': {
    minHeight: 56,
    height: 56,
    alignItems: 'flex-end',
  },
  '& .FusePageSimple-rightSidebar': {
    width: 288,
    border: 0,
    padding: '12px 0',
  },
  '& .FusePageSimple-content': {
    maxHeight: '100%',
    '& canvas': {
      maxHeight: '100%',
    },
  },
}));

function ProjectDashboardApp(props) {
  const [pageLoad, setPageLoad] = useState(!localStorage.getItem('marketing'));
  const [slectedInsight, setSlectedInsight] = useState(null);
  if (slectedInsight) {
    console.log(slectedInsight);
  }
  const ShowPopup = () => {
    if (pageLoad) {
      return (
        <div className="popup">
          <form className="popupForm">
            <p>To continue please enter your facebook id eg xxxxxxxxxxxxxxx.</p>
            <TextField id="outlined-basic" label="Facebook Id" variant="outlined" />
            <input
              type="button"
              id="submit"
              value="Submit"
              onClick={async () => {
                await dispatch(getProjects(document.getElementById('outlined-basic').value));
                setPageLoad(false);
              }}
            />
            <input type="button" id="submit" value="Cancel" onClick={() => setPageLoad(false)} />
          </form>
        </div>
      );
    }
  };

  const dispatch = useDispatch();
  const widgets = useSelector(selectWidgets);

  const pageLayout = useRef(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    dispatch(getWidgets());
  }, [dispatch]);

  function handleChangeTab(event, value) {
    setTabValue(value);
  }

  if (_.isEmpty(widgets)) {
    return null;
  }

  return (
    <Root
      header={<ProjectDashboardAppHeader set={setSlectedInsight} pageLayout={pageLayout} />}
      contentToolbar={
        <Tabs
          value={tabValue}
          onChange={handleChangeTab}
          indicatorColor="secondary"
          textColor="inherit"
          variant="scrollable"
          scrollButtons={false}
          className="w-full px-24 -mx-4 min-h-40"
          classes={{ indicator: 'flex justify-center bg-transparent w-full h-full' }}
          TabIndicatorProps={{
            children: (
              <Box
                sx={{ bgcolor: 'text.disabled' }}
                className="w-full h-full rounded-full opacity-20"
              />
            ),
          }}
        >
          <Tab
            className="text-14 font-semibold min-h-40 min-w-64 mx-4 px-12"
            disableRipple
            label="Facebook"
          />
          <Tab
            className="text-14 font-semibold min-h-40 min-w-64 mx-4 px-12"
            disableRipple
            label="Google"
          />
          <Tab
            className="text-14 font-semibold min-h-40 min-w-64 mx-4 px-12"
            disableRipple
            label="Budget"
          />
        </Tabs>
      }
      content={
        <div className="p-12 lg:ltr:pr-0 lg:rtl:pl-0">
          {tabValue === 0 && <HomeTab insight={slectedInsight} />}
          {tabValue === 1 && <BudgetSummaryTab />}
          {tabValue === 2 && <TeamMembersTab />}

          {ShowPopup()}
        </div>
      }
      rightSidebarContent={<ProjectDashboardAppSidebar />}
      ref={pageLayout}
    />
  );
}

export default withReducer('projectDashboardApp', reducer)(ProjectDashboardApp);
