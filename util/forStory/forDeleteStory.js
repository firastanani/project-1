const { Story } = require("../../models/story");

module.exports = async function deleteOldDocument(jk) {
//   var dt = new Date(Date.now());
//   dt.setDate(dt.getDate() - (1));
var dt = new Date(Date.now());
dt.setSeconds(dt.getSeconds() - (60 * 60) );
  const afterDays = dt;
  await Story.deleteMany({ 'createdAt': { $lte: afterDays } , 'confirm' : false});

  setTimeout(async function() {
    await deleteOldDocument();
}, 5000);   };


