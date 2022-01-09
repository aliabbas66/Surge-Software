import React, { useEffect } from 'react'
import { isAuthenticated } from '../../../components/auth/auth';
import { ChatLayout } from '../../../components/chat/ChatLayout';


export const Chat = (props) => {
 
    useEffect(() => {
        !isAuthenticated() && props.history.push('/login');
        return () => {
            
        }
    }, []);

    useEffect(() => {
        if (window.location.href.includes('confirm-email')) {
            return true;
        }
        else if (isAuthenticated().verification == false) {
            props.history.push('/verify-email');
        } else {
            return true;
        }

        return () => {

        }
    }, []);
  
    return (
        <ChatLayout usersSide>
           <h1 style = {{textAlign: 'center'}}>Click on any user to see your chat with him here!</h1>
        </ChatLayout>
    )
}
