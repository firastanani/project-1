const { Notification } = require("../../models/notification");

module.exports = async function deleteOldDocument() {
//   var dt = new Date(Date.now());
//   dt.setDate(dt.getDate() - 1);

var dt = new Date(Date.now());
dt.setSeconds(dt.getSeconds() -  (60 * 60));
  const afterDays = dt;
  
  await Notification.deleteMany({ 'createdAt': { $lte: afterDays }});

  setTimeout(async function() {
    await deleteOldDocument();
}, 5000);   };


