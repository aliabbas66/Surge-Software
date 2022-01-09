import { Avatar, FormControl, Grid, InputAdornment, OutlinedInput } from '@mui/material';
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { isAuthenticated } from '../auth/auth'
import { Navbar } from '../Navbar/Navbar';
import { EditOutlined, SearchOutlined, SlidersOutlined } from '@ant-design/icons';
import { NavLink } from 'react-router-dom';
import Tab from '@mui/material/Tab';
import TabContext from '@material-ui/lab/TabContext';
import TabList from '@material-ui/lab/TabList';
import TabPanel from '@material-ui/lab/TabPanel';


export const ChatLayout = (props) => {
  const user = isAuthenticated();
  const [users, setUsers] = useState([]);
  const [value, setValue] = React.useState('1');
  const [userValue, setUserValue] = React.useState('4');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const handleUserChange = (event, newValue) => {
    setUserValue(newValue);
  };

  useEffect(() => {
    getAllUsers();
    return () => {

    }
  }, []);


  const getAllUsers = async () => {
    await axios.get('/api/users/get').then(res => {
      const filteringUsers = res.data.filter(filUser => filUser._id !== user._id);
      setUsers(filteringUsers);
      console.log(users);
    })
  }

  return (
    <div className='admin'>
      <Navbar />
      {
        props.usersSide ?
          <>
            <div>
              <TabContext value={value}>
                <Grid container spacing={2}>
                  <Grid item xs={2}>
                    <TabList className='left-most-tabs' orientation='vertical' style={{ marginTop: '23px' }} onChange={handleChange} aria-label="lab API tabs example">
                      <Tab label="All Conversations" value="1" />
                      <Tab label="Assigned to you" value="2" />
                    </TabList>
                  </Grid>
                  <Grid item xs={10}>
                    <TabPanel value="1">
                      <Grid container spacing={2}>
                        <Grid item xs={3}>
                          <div className='sidebar'>
                            <div className='header'>
                              <div className='all-conversation'>
                                All Conversations
                              </div>
                              <div className='filter'>
                                <select defaultValue='Newest'>
                                  <option value="Newest">Newest</option>
                                  <option value="Oldest">Oldest</option>
                                  <option value="All">All</option>
                                </select>
                              </div>
                            </div>
                            <div className='search-container'>
                              <FormControl variant="outlined">
                                <OutlinedInput
                                  id="outlined-adornment-weight"
                                  startAdornment={<InputAdornment position="start"><SearchOutlined /></InputAdornment>}
                                  aria-describedby="outlined-weight-helper-text"
                                  inputProps={{
                                    'aria-label': 'weight',
                                  }}
                                />
                              </FormControl>
                              <div>
                                <SlidersOutlined />
                              </div>
                              <div className='edit'>
                                <EditOutlined />
                              </div>

                            </div>
                            <div className = 'user-names-cont'>
                            <TabContext value={userValue}>
                                <TabList onChange = {handleUserChange} aria-label="lab API tabs example">
                                  <Tab label="Open" value="4" />
                                  <Tab label="Closed" value="5" />
                                </TabList>
                              <TabPanel value="4">
                            <div>
                              {
                                users.map(user => {
                                  return (
                                    <NavLink activeClassName='active' to={'/chat/' + user._id} className='user-container'>
                                      <Avatar sx={{ background: 'rgb(255, 87, 34)' }}>{user.fullName ? user.fullName.charAt(0) : 'X'}</Avatar>
                                      <h3>{user.fullName}</h3>
                                    </NavLink>

                                  )
                                })
                              }
                            </div>
                            </TabPanel>
                            <TabPanel value="5">Item Two</TabPanel>
                            </TabContext>
                            </div>
                          </div>
                        </Grid>
                        <Grid className='chat-box' item xs={9}>
                          {props.children}
                        </Grid>
                      </Grid>
                    </TabPanel>
                    <Grid item xs={9}>
                      <TabPanel value="2">No Content</TabPanel>
                    </Grid>
                  </Grid>

                </Grid>
              </TabContext>
            </div>
          </>

          :
          props.children
      }

    </div >
  )
}
