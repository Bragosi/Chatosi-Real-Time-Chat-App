export function formatMessageTime(date){
    return new Date(date).toLocaleTimeString("en-Us", {
        hour : "2-digit",
        minute : "2-digit",
        hour12 : false
    })
}
/**
 * Sends a notification 
 * This is used when you recieve a message
 * @param string {*} notifMessage 
 */
export function sendNotificatons(notifMessage) {
    if (Notification.permission === "granted") {
        const notif = new Notification(notifMessage);
        notif.onclick = () => window.focus();
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                const notif = new Notification(notifMessage);
                notif.onclick = () => window.focus();
            }
        });
    }
}