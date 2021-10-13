const express = require("express");
const router = express.Router();


const {	requireSignin, isAuth, isAdmin } = require("../controllers/auth");

const { userById, read, update } = require("../controllers/user");

router.get("/secret/:userId", requireSignin, isAuth, isAdmin, (req, res) => {
	// respond with users information by userId
	res.json({
		user: req.profile
	});
});
router.get("/user/:userId", requireSignin, isAuth, read);
router.put("/user/:userId", requireSignin, isAuth, update);


// run middleware (controllers/user) userById
router.param("userId", userById);

module.exports = router;