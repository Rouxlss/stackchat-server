const { Schema, model } = require("mongoose");

const messagesSchema = new Schema(
    {
        users: {
            sender: { type: Schema.Types.ObjectId, ref: "User" },
            receiver: { type: Schema.Types.ObjectId, ref: "User" },
        },
        message: String,
        state: {
            type: String,
            enum: ["sent", "delivered", "read", "deletedForMe", "deletedForEveryone"],
            default: "sent",
        },
        type: {
            type: String,
            enum: ["text", "image", "video", "audio", "pdf", "document"],
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = model("Messages", messagesSchema);
