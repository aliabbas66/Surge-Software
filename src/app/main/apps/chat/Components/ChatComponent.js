import React from 'react';
import clsx from "clsx";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import Icon from "@mui/material/Icon";

const ChatComponent = (props) => {

    const chat = props.chat;
    if (chat && chat.dialog.length > 0) {
        return (
            <div className="flex flex-col pt-16 px-16 ltr:pl-56 rtl:pr-56 pb-40">
                {chat.dialog.map((item, i) => {
                    const contact =
                        item.who === user.id ? user : contacts.find((_contact) => _contact.id === item.who);

                    return (
                        <StyledMessageRow
                            key={item.time}
                            className={clsx(
                                'flex flex-col grow-0 shrink-0 items-start justify-end relative px-16 pb-4',
                                { me: item.who === user.id },
                                { contact: item.who !== user.id },
                                { 'first-of-group': isFirstMessageOfGroup(item, i) },
                                { 'last-of-group': isLastMessageOfGroup(item, i) },
                                i + 1 === chat.dialog.length && 'pb-96'
                            )}
                        >
                            {shouldShowContactAvatar(item, i) && (
                                <Avatar
                                    className="avatar absolute ltr:left-0 rtl:right-0 m-0 -mx-32"
                                    src={contact.avatar}
                                />
                            )}
                            <div className="bubble flex relative items-center justify-center p-12 max-w-full shadow">
                                <div className="leading-tight whitespace-pre-wrap">{item.message}</div>
                                <Typography
                                    className="time absolute hidden w-full text-11 mt-8 -mb-24 ltr:left-0 rtl:right-0 bottom-0 whitespace-nowrap"
                                    color="textSecondary"
                                >
                                    {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                                </Typography>
                            </div>
                        </StyledMessageRow>
                    );
                })}
            </div>
        )
    } else {
        return (
            <div className="flex flex-col flex-1">
                <div className="flex flex-col flex-1 items-center justify-center">
                    <Icon className="text-128" color="disabled">
                        chat
                    </Icon>
                </div>
                <Typography className="px-16 pb-24 text-center" color="textSecondary">
                    Start a conversation by typing your message below.
                </Typography>
            </div>
        )
    }
};