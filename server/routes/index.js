import { Router } from "express";
import userRoutes from './userRoutes.js'
import workspaceRoutes from "./workspaceRoutes.js"
import taskRoutes from './taskRoutes.js'
import chatRoutes from './chatRoutes.js'


const router = Router();

router.get("/", (req, res) => {
    res.send("API is running");
    }
);

router.use("/", userRoutes)
router.use('/', workspaceRoutes)
router.use('/', taskRoutes)
router.use('/', chatRoutes)


export default router;
