const { Friends } = require('../../models/friend')
const { Notification } = require('../../models/notification');
module.exports = async function notificationPost(name, from, pubsub) {

  const userToGetFriendsId = from;

  const friendsRelations = await Friends.find().or([{ user1: userToGetFriendsId }, { user2: userToGetFriendsId }]);

  const friendsIds = friendsRelations.map(friendsRelations => {
    return friendsRelations.user1.equals(userToGetFriendsId) ? friendsRelations.user2 : friendsRelations.user1;
  })

  friendsIds.forEach(async (user) => {
    const newNotification = new Notification({
      label: `${name} create post now`,
      from: from,
      to: user._id,
    });

    await newNotification.save();
    pubsub.publish(newNotification.to, {
      newNotification: newNotification,
    });

  });
}