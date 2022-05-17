const bcrypt = require("bcryptjs");
const { Schema, model } = require("mongoose");

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        country_code: {
            type: String,
            required: true,
        },
        number: {
            type: Number,
            required: true,
        },
        userNumber: {
            type: String,
            required: true,
        },
        account_status: {
            type: String,
            enum: ["active", "inactive"],
            default: "inactive",
        },
        profilePicture: {
            type: String,
            default: "",
        },
        information: {
            type: String,
            default: "Hey there i'm usign Stackchat!",
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// userSchema.methods.ecryptPassword = (password) => {
//     return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
// };

// userSchema.methods.validatePassword = function (password) {
//     return bcrypt.compare(password, this.password)
// };

module.exports = model("User", userSchema);
