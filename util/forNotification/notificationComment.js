

const {Notification} = require('../../models/notification')
module.exports = async function notificationComment(name , from , author , pubsub) {

    const newNotification = new Notification({
      label: `${name} create comment on your post`,
      from: from,
      to: `${author}`,
    });
    await newNotification.save();

    pubsub.publish(newNotification.to, {
      newNotification: newNotification,
    });
    
}
