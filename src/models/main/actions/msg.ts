export const sendMessage = (payload: string) => ({ type: "MESSAGE_SEND", payload });
export const sendMessageEdit = (payload: string) => ({ type: "MESSAGE_SEND_EDIT", payload });
export const editMessagePrev = () => ({ type: "MESSAGE_EDIT_PREV" });
export const editMessageNext = () => ({ type: "MESSAGE_EDIT_NEXT" });
export const editMessageDiscard = () => ({ type: "MESSAGE_DISCARD_EDIT" });