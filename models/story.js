const mongoose = require("mongoose");

const storySchema = mongoose.Schema(
    {
        imageUrl: {
            type: String,
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        viewers: {
            type: [mongoose.Schema.Types.ObjectId],
        },
    }
    , { timestamps: true }
);

const Story = mongoose.model('Story', storySchema);

exports.Story = Story;