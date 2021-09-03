const express = require('express');
const router = express.Router();

const {join} = require('path');

router.get("/photo/:photoUrl", async (req, res, next) => {

    const photoUrl = req.params.photoUrl;

    var options = {
        root: join(__dirname, "../public/images")
    };

    res.sendFile(photoUrl, options, function (err) {
        if (err) {
            console.log(err.message);
            res.status(err.status).end();
        }
    });
});

module.exports = router;