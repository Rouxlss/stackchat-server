const { Router } = require("express");
const router = Router();

const {
    updateProfilePicture,
    getPersonalInformation,
    updatePersonalInformation,
} = require("../controllers/user.controller");

const {
    validateExistenceAccessHeader,
    validateSession,
    validateTokenAlive,
} = require("./../middlewares");

const access = [
    validateExistenceAccessHeader,
    validateSession,
    validateTokenAlive,
];

router
    .route("/personaInformation/:userId")
    .get(access, getPersonalInformation)
    .put(access, updatePersonalInformation);

router.route("/updateProfilePicture").post(access, updateProfilePicture);

module.exports = router;
