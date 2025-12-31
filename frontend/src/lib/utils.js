export function formatMessageTime(date){
    return new Date(date).toLocaleTimeString("en-Us", {
        hour : "2-digit",
        minute : "2-digit",
        hour12 : false
    })
}
/**
 * Truncates text over 50 chars 
 * @param string {*} text 
 */
export function truncateLongText(text){
    return text.length > 50 ? text.slice(49) + "..." : text;
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