

const {Notification} = require('../../models/notification')
module.exports = async function notificationReaction(lable , from , author , pubsub) {

    const newNotification = new Notification({
      label: lable,
      from: from,
      to: `${author}`,
    });
    await newNotification.save();

    pubsub.publish(newNotification.to, {
      newNotification: newNotification,
    });
    
}
