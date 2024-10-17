import axios from "axios";
axios.defaults.baseURL = "http://localhost:5000"


export async function SignupUser(data) {
    try {
        console.log(data);
        const response = await axios.post('/register', data, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        console.log('Response:', response.data);
        return response.data;

    } catch (error) {
        console.error('Error:', error);
        return { success: false, message: 'Error occurred' };
    }
}

export async function loginUser(data) {
    try {
        const response = await axios.post('/login', data, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        localStorage.setItem('userID', response.data.result._id)
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return { success: false, message: 'Error occurred' };
    }
}

export async function verifyEmail(token) {
    try {
        const response = await axios.get(`/verify-email?token=${token}`, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        localStorage.setItem('userID', response.data.user._id)
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return { success: false, message: 'Error occurred' };
    }

}

export async function getWorkspacewithUserRole() {
    try {
        let token = localStorage.getItem('token');

        if (!token) {
            return { success: false, message: 'No token found' };
        }
        const response = await axios.get('/workspaces/user', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${token}`,
            }
        });
        console.log('Response:', response.data.message);
        return response.data;
    } catch (error) {
        return { success: false, message: 'Error occurred' };
    }
}

export async function createWorkspace(data) {
    try {
        let token = localStorage.getItem('token');

        if (!token) {
            return { success: false, message: 'No token found' };
        }
        const response = await axios.post('/workspaces', data, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${token}`,

            }
        });
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return { success: false, message: 'Error occurred' };
    }

}

export async function getWorkSpaceWithID(id) {
    try {
        let token = localStorage.getItem('token');

        if (!token) {
            return { success: false, message: 'No token found' };
        }
        const response = await axios.get(`/workspaces/${id}`, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        console.log(response.data);

        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return { success: false, message: 'Error occurred' };
    }
}

export async function getTaskByWorkspace(id) {
    try {
        let token = localStorage.getItem('token');

        if (!token) {
            return { success: false, message: 'No token found' };
        }
        const response = await axios.get(`/tasks/workspace/${id}`, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        console.log(response.data.tasks);

        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return { success: false, message: 'Error occurred' };
    }
}

export async function invitesendtoteamLead(workspaceId, email) {
    try {
        let token = localStorage.getItem('token');

        if (!token) {
            return { success: false, message: 'No token found' };
        }

        const response = await axios.post(
            `/workspaces/${workspaceId}/invite-teamlead`,
            { email, workspaceId }, // Payload with the email
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${token}`, // Use Bearer token for authorization
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return { success: false, message: 'Error occurred' };
    }
}

export async function invitesendtoteamMember(workspaceId, email) {
    try {
        let token = localStorage.getItem('token');

        if (!token) {
            return { success: false, message: 'No token found' };
        }

        const response = await axios.post(
            `/workspaces/${workspaceId}/invite-members`,
            { email, workspaceId }, // Payload with the email
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${token}`, // Use Bearer token for authorization
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return { success: false, message: 'Error occurred' };
    }
}

export const useAcceptTeamLeadInvite = () => {
    const acceptInvite = async (token, teamLeadId) => {
        try {
            let UserToken = localStorage.getItem('token');

            if (!UserToken) {
                return { success: false, message: 'No token found' };
            }

            const response = await axios.post('/workspaces/accept-invite', {
                token,
                teamLeadId,
            },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${UserToken}`, // Use Bearer token for authorization
                    },
                });
            return response.data;
        } catch (error) {
            console.error('Error accepting invitation:', error);
            return { success: false, message: 'Failed to accept invitation' };
        }
    };

    return { acceptInvite };
};

export const useSendMemberInvitation = () => {
    const sendMemberInvitation = async (workspaceId, email) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return { success: false, message: 'No token found' };
            }

            const response = await axios.post(
                `/workspaces/${workspaceId}/invite-members`,
                { workspaceId, email },
                {
                    headers: {
                        Authorization: `${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error sending invitation:', error);
            return { success: false, message: 'Failed to send invitation' };
        }
    };

    return { sendMemberInvitation };
};

export const useAcceptTeamMemberInvite = () => {
    const acceptInvite = async (token, memberId) => {
        try {
            const UserToken = localStorage.getItem('token'); // Authorization token

            if (!UserToken) {
                return { success: false, message: 'No user token found' };
            }

            const response = await axios.post(
                '/workspaces/accept-member-invite',
                { token, memberId }, // Payload
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${UserToken}`, // Use Bearer token for authorization
                    },
                }
            );

            return response.data; // Return the response data from the backend
        } catch (error) {
            console.error('Error accepting member invitation:', error);
            return { success: false, message: 'Failed to accept invitation' };
        }
    };

    return { acceptInvite };
};

export async function createTask(data) {
    try {
        let token = localStorage.getItem('token');

        if (!token) {
            return { success: false, message: 'No token found' };
        }

        const response = await axios.post('/tasks', data, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${token}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error creating task:', error);
        return { success: false, message: 'Failed to create task.' };
    }
}

export const changeTaskStatus = async (taskId, newStatus) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return { success: false, message: 'No token found' };
        }

        const response = await axios.put(
            `/tasks/${taskId}/status`,
            { newStatus },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${token}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error changing task status:', error);
        return { success: false, message: 'Failed to change task status' };
    }
};

