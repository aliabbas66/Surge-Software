import FuseScrollbars from '@fuse/core/FuseScrollbars';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useDispatch, useSelector } from 'react-redux';
import { selectContacts } from './store/contactsSlice';
import { closeContactSidebar } from './store/sidebarsSlice';

function ContactSidebar(props) {
  const dispatch = useDispatch();
  const contacts = useSelector(selectContacts);
  const selectedContactId = useSelector(({ chatApp }) => chatApp.contacts.selectedContactId);

  // console.log(contacts);
  const contact = contacts.find((_contact) => _contact.id === selectedContactId);
  console.log(contact);

  if (!contact) {
    return null;
  }

  return (
    <div className="flex flex-col flex-auto h-full">
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar className="flex justify-between items-center px-4">
          <Typography className="px-12" color="inherit" variant="subtitle1">
            Contact Info
          </Typography>
          <IconButton onClick={() => dispatch(closeContactSidebar())} color="inherit" size="large">
            <Icon>close</Icon>
          </IconButton>
        </Toolbar>

        <Toolbar className="flex flex-col justify-center items-center p-24">
          <Avatar src="https://i.ibb.co/yYJSYcc/profile.png" alt={contact.name} className="w-96 h-96">
            {!contact.avatar || contact.avatar === '' ? contact.name[0] : ''}
          </Avatar>
          <Typography color="inherit" className="mt-16" variant="h6">
            {contact.name}
          </Typography>
        </Toolbar>
      </AppBar>

      <FuseScrollbars className="overflow-y-auto flex-1 p-24">
        <TextField
          label="Name"
          className="w-full"
          variant="outlined"
          value={contact.name}
          margin="normal"
          disabled
          multiline
        />
        <TextField
          label="Email"
          className="w-full"
          variant="outlined"
          value={contact.email}
          margin="normal"
          disabled
          multiline
        />
        <TextField
            label="Last Seeb"
            className="w-full"
            variant="outlined"
            value={contact.status}
            margin="normal"
            disabled
            multiline
        />
      </FuseScrollbars>
    </div>
  );
}

export default ContactSidebar;
