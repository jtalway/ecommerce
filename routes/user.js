const express = require("express");
const router = express.Router();


const {	requireSignin, isAuth, isAdmin } = require("../controllers/auth");

const { userById, read, update, purchaseHistory, listUsers } = require("../controllers/user");

router.get("/user/:userId", requireSignin, isAuth, read);
router.put("/user/:userId", requireSignin, isAuth, update);
router.get("/orders/by/user/:userId", requireSignin, isAuth, purchaseHistory);
router.get("/user/list/:userId", requireSignin, isAuth, isAdmin, listUsers);

// run middleware (controllers/user) userById
router.param("userId", userById);

module.exports = router;