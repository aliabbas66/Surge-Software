import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import format from 'date-fns/format';
import { Box } from '@mui/system';
import StatusIcon from './StatusIcon';

const StyledListItem = styled(ListItem)(({ theme, active }) => ({
  ...(active && {
    backgroundColor: theme.palette.background.paper,
  }),
}));

function ContactListItem(props) {
  // console.log('I m being updating');
  return (
    <StyledListItem
      button
      className="px-16 py-12 min-h-92"
      active={props.selectedContactId === props.contact.id ? 1 : 0}
      onClick={() => props.onContactClick(props.contact.id)}
    >
      <div className="relative">
        <div className="absolute right-0 bottom-0 -m-4 z-10">
          <StatusIcon status={props.contact.status} />
        </div>

        <Avatar src="https://i.ibb.co/yYJSYcc/profile.png" alt={props.contact.name}>
          {!props.contact.avatar || props.contact.avatar === '' ? props.contact.name : ''}
        </Avatar>
      </div>

      <ListItemText
        classes={{
          root: 'min-w-px px-16',
          primary: 'font-medium text-14',
          secondary: 'truncate',
        }}
        primary={props.contact.name}
        secondary={props.contact.lastMessage === '' ? 'file' : props.contact.lastMessage}
      />

      {props.contact.chatId && (
        <div className="flex flex-col justify-center items-end">
          {props.contact.lastMessageTime && (
            <Typography
              className="whitespace-nowrap mb-8 font-medium text-12"
              color="textSecondary"
            >
              {format(new Date(props.contact.lastTime), 'PP')}
            </Typography>
          )}
          {props.contact.newMsg ? (
            <Box
              sx={{
                backgroundColor: 'secondary.main',
                color: 'secondary.contrastText',
              }}
              className="flex items-center justify-center min-w-24 h-24 rounded-full font-medium text-12 text-center"
            >
              {props.contact.msgsCount}
            </Box>
          ) : null}
        </div>
      )}
    </StyledListItem>
  );
}

export default ContactListItem;
