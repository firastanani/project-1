
const { Notification } = require("../../models/notification");

const sendNotRequsetFriend = async (name, from, to, pubsub) => {
  const newNotification = new Notification({
    label: `${name}  send to you request frined now`,
    from: from,
    to: `${to}`,
  });
  await newNotification.save();
  pubsub.publish(newNotification.to, {
    newNotification: newNotification,
  });
};

exports.sendNotRequsetFriend = sendNotRequsetFriend;

const acceptNotRequestFriend = async (name, from, to, pubsub) => {
  const newNotification = new Notification({
    label: `${name}  accpet request frined now`,
    from: from,
    to: `${to}`,
  });
  await newNotification.save();
  pubsub.publish(newNotification.to, {
    newNotification: newNotification,
  });
};

exports.acceptNotRequestFriend = acceptNotRequestFriend;
