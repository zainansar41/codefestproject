import { Router } from "express";
import userRoutes from './userRoutes.js'
import workspaceRoutes from "./workspaceRoutes.js"


const router = Router();

router.get("/", (req, res) => {
    res.send("API is running");
    }
);

router.use("/", userRoutes)
router.use('/', workspaceRoutes)



export default router;
