import * as taskController from '../controllers/taskController.js'
import { verifyUser } from '../middlewares/verifyUser.js'

import express from 'express';
import { Router } from 'express';
const router = Router();


router.post('/tasks', verifyUser,taskController.createTask);
router.put('/tasks/:taskId',verifyUser, taskController.editTask);
router.delete('/tasks/:taskId',verifyUser ,taskController.deleteTask);
router.get('/tasks/workspace/:workspaceId', verifyUser, taskController.getTasksByWorkspace);
router.get('/tasks/workspace/:workspaceId/status/:status',verifyUser, taskController.getTasksByWorkspaceAndStatus);
router.put('/tasks/:taskId/assign',verifyUser ,taskController.assignTaskToUsers);
router.delete('/tasks/:taskId/users/:userId',verifyUser ,taskController.removeUserFromTask);
router.put('/tasks/:taskId/start',verifyUser ,taskController.startTask);
router.put('/tasks/:taskId/stop',verifyUser ,taskController.startTask);
router.put('/tasks/:taskId/status',verifyUser ,taskController.changeTaskStatus);

export default router;