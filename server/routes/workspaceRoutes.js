import * as workspaceRoutes from '../controllers/workspaceController.js'
import { verifyUser } from "../middlewares/verifyUser.js"
import express from 'express';
import { Router } from 'express';
const router = Router();

router.post('/workspaces',verifyUser ,workspaceRoutes.createWorkspace);
router.post('/workspaces/:workspaceId/invite-teamlead', verifyUser,workspaceRoutes.sendTeamLeadInvitation);
router.post('/workspaces/accept-invite',verifyUser ,workspaceRoutes.acceptTeamLeadInvitation);
router.post('/workspaces/:workspaceId/invite-members',verifyUser ,workspaceRoutes.sendMemberInvitation);
router.post('/workspaces/accept-member-invite',verifyUser ,workspaceRoutes.acceptMemberInvitation)
router.get('/workspaces/:workspaceId/infowithmembers',verifyUser ,workspaceRoutes.getWorkspaceInfoWithMembersAndTeamLead);
router.delete('/workspaces/:workspaceId/teamlead',verifyUser,workspaceRoutes.removeTeamLead);
router.delete('/workspaces/:workspaceId/members/:memberId',verifyUser ,workspaceRoutes.removeTeamMember);
router.delete('/workspaces/:workspaceId',verifyUser ,workspaceRoutes.deleteWorkspace);


export default router;