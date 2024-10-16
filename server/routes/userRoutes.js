import * as userController from "../controllers/userController.js"
import { verifyUser } from "../middlewares/verifyUser.js"


import express from 'express';
import { Router } from 'express';
const router = Router();


router.post('/register', userController.registerUser)
router.post('/login', userController.loginUser)
router.get('/verify-email', userController.verifyEmail)


export default router;