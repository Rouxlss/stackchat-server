const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const Messages = require("../models/messages.model");
const User = require("../models/user.model");
const { v4: uuidv4 } = require("uuid");
const { ObjectId } = require('mongoose').Types;

messagesCrtl = {};

const s3 = new aws.S3({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: process.env.S3_BUCKET_REGION,
});

const upload = (location, name) => {
    return multer({
        storage: multerS3({
            s3,
            contentType: multerS3.AUTO_CONTENT_TYPE,
            bucket: process.env.S3_BUCKET_NAME,
            metadata: (req, file, cb) => {
                cb(null, { fieldName: `${name}` });
            },
            key: (req, file, cb) => {
                cb(null, location);
            },
        }),
    });
};

const getMessagesHistory = async (senderId, receiverId) => {

    return await Messages.aggregate([
        {
            $match: {
                $or: [
                    {
                        $and: [
                            {
                                "users.sender": ObjectId(senderId),
                                "users.receiver": ObjectId(receiverId)
                            }
                        ]
                    },
                    {
                        $and: [
                            {
                                "users.receiver": ObjectId(senderId),
                                "users.sender": ObjectId(receiverId)
                            }
                        ]
                    },
                ]
            }
        },
        {
            $sort: {
                createdAt: 1,
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "users.sender",
                foreignField: "_id",
                as: "sender",
            }
        },
        { $unwind: "$sender" },
        {
            $project: {
                sender: "$sender.name",
                sender_id: "$sender._id",
                message: 1,
                type: 1,
                state: 1,
                createdAt: 1,
            }
        }
    ]);

}

messagesCrtl.sendMessage = async (req, res) => {
    try {

        let message = '';

        const img = new Date().getTime();
        const location = `users/${req.user_id}/multimedia/${img}`;
        // upload image
        const uploadImage = upload(location, img).single("multimedia");

        uploadImage(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    message: "Error uploading the file",
                    error: true,
                    err,
                });
            }

            const file = req.file;
            
            if (file) {

                let getType = req.file.mimetype.split("/")[1];

                console.log(getType);

                switch (getType) {
                    case "jpeg": case "jpg": case "png":
                        type = "image";
                        break;
                    case "mp4": case "3gp": case "avi":
                        type = "video";
                        break;
                    case "mp3": case "wav": case "ogg":
                        type = "audio";
                        break;
                    case "pdf":
                        type = "pdf";
                        break;
                    default:
                        type = "document";
                        break;
                }

                message = req.file.location;
            } else {

                type = "text";
                message = req.body.message;

                if (!message) {
                    return res.status(400).json({
                        message: "Message is required",
                        error: true,
                    });
                }

            }

            const { receiverId } = req.params;
            const senderId = req.user_id;


            if (!senderId) {
                return res.status(400).json({
                    message: "Sender id is required",
                    error: true,
                });
            }

            if (!receiverId) {
                return res.status(400).json({
                    message: "Receiver id is required",
                    error: true,
                });
            }

            const newMessage = await new Messages({
                users: { sender: senderId, receiver: receiverId },
                message,
                type,
            });

            await newMessage.save();

            const messagesHistory = await getMessagesHistory(senderId, receiverId);

            return res.status(200).json({
                message: "Message sent successfully",
                error: false,
                data: messagesHistory,
            });

        });

    } catch (error) {
        res.status(500).json({
            message: "Error processing the request: " + error.message,
            error: true,
        });
    }
};

messagesCrtl.getMessages = async (req, res) => {

    try {

        const senderId = req.user_id;
        const { receiverId } = req.params;

        console.log(req.params);

        const chatUser = await User.findById(receiverId);

        if (!senderId) {
            return res.status(400).json({
                message: "Sender id is required",
                error: true,
            });
        }

        if (!receiverId) {
            return res.status(400).json({
                message: "Receiver id is required",
                error: true,
            });
        }

        const messagesHistory = await getMessagesHistory(senderId, receiverId);

        return res.status(200).json({
            message: `Chat with ${chatUser.name}`,
            error: false,
            data: messagesHistory,
        });


    } catch (error) {
        res.status(500).json({
            message: "Error processing the request: " + error.message,
            error: true,
        });
    }
};

messagesCrtl.deleteMessage = async (req, res) => {

    try {

        const { messageId } = req.params;
        const senderId = req.user_id;
        const {receiverId, state} = req.params;
        const messagesHistory = await getMessagesHistory(senderId, receiverId);

        console.log(state);

        if (!messagesHistory) {
            return res.status(400).json({
                message: "Messages not found",
                error: true,
            });
        }

        if (!messageId || !state) {
            return res.status(400).json({
                message: "Required parameters are missing",
                error: true,
            });
        }

        const message = await Messages.findById(messageId);

        if (!message) {
            return res.status(400).json({
                message: "Message not found",
                error: true,
            });
        }

        if (message.users.sender.toString() !== senderId) {
            return res.status(400).json({
                message: "You are not the sender of this message",
                error: true,
            });
        }

        if (message.state != "deletedForMe" || message.state != "deletedForEveryone") {
            return res.status(400).json({
                message: "Invalid state",
                error: true,
            });
        }

        message.state = state;
        await message.save();

        return res.status(200).json({
            message: "Message deleted successfully",
            error: false,
        });

    } catch (error) {
        res.status(500).json({
            message: "Error processing the request: " + error.message,
            error: true,
        });
    }

};

messagesCrtl.getRecientChats = async (req, res) => {

    try {

        const senderId = req.user_id;

        if (!senderId) {
            return res.status(400).json({
                message: "Sender id is required",
                error: true,
            });
        }

        const chats = await Messages.aggregate([
            {
                $match: {
                    $and: [
                        { "users.sender":  ObjectId(senderId) },
                    ]
                }
            },
            {
                $group: {
                    _id: "$users.receiver",
                    lastMessage: { $last: "$$ROOT" },
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "receiver",
                }
            },
            { $unwind: "$receiver" },
            {
                $project: {
                    _id: "$receiver._id",
                    name: "$receiver.name",
                    profileImage: "$receiver.profilePicture",
                    lastMessage: {
                        message: "$lastMessage.message",
                        type: "$lastMessage.type",
                        state: "$lastMessage.state",
                        createdAt: "$lastMessage.createdAt",
                    },
                }
            },
            {
                $sort: {
                    "lastMessage.createdAt": -1
                }
            }
        ]);

        return res.status(200).json({
            message: "Recient chats",
            error: false,
            data: chats,
        });

    } catch (error) {
        res.status(500).json({
            message: "Error processing the request: " + error.message,
            error: true,
        });
    }


}

module.exports = messagesCrtl;
