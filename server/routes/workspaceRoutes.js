import * as workspaceRoutes from '../controllers/workspaceController.js'
import { verifyUser } from "../middlewares/verifyUser.js"
import express from 'express';
import { Router } from 'express';
const router = Router();

router.post('/workspaces', workspaceRoutes.createWorkspace);
router.post('/workspaces/:workspaceId/invite-teamlead', workspaceRoutes.sendTeamLeadInvitation);
router.post('/workspaces/accept-invite', workspaceRoutes.acceptTeamLeadInvitation);
router.post('/workspaces/:workspaceId/invite-members', workspaceRoutes.sendMemberInvitation);
router.post('/workspaces/accept-member-invite', workspaceRoutes.acceptMemberInvitation)
router.get('/workspaces/:workspaceId/infowithmembers', workspaceRoutes.getWorkspaceInfoWithMembersAndTeamLead);
router.delete('/workspaces/:workspaceId/teamlead',workspaceRoutes.removeTeamLead);
router.delete('/workspaces/:workspaceId/members/:memberId', workspaceRoutes.removeTeamMember);
router.delete('/workspaces/:workspaceId', workspaceRoutes.deleteWorkspace);


export default router;