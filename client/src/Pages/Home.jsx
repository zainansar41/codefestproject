import React from 'react'

export default function Home() {
    return (
        <div className="bg-white text-black min-h-screen">
            {/* Header */}
            <header className="bg-black text-white p-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold">Codefest Hackathon</h1>
                    <p className="text-xl mt-2">Collaborative Team Workspace with Role-Based Functionality</p>
                </div>
            </header>

            {/* Overview Section */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-3xl font-bold">Objective</h2>
                    <p className="mt-4 text-lg">
                        Participants are tasked with developing a team collaboration platform where users have different roles
                        (admin, team lead, team member) and interact within workspaces. The platform tracks task progress, working
                        hours, and facilitates communication within teams.
                    </p>
                </div>
            </section>

            {/* Key Functionalities Section */}
            <section className="py-12 bg-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-3xl font-bold">Key Functionalities</h2>
                    <ul className="mt-4 space-y-6">
                        <li className="text-lg">
                            <strong>Authentication & Authorization (15 Marks):</strong> Users can securely sign up, log in, and have
                            role-based access control.
                        </li>
                        <li className="text-lg">
                            <strong>Workspace Management (20 Marks):</strong> Admins create workspaces, assign team leads, and manage
                            team members.
                        </li>
                        <li className="text-lg">
                            <strong>Task Management (20 Marks):</strong> Team leads assign tasks, and members have a clear task list
                            categorized by status.
                        </li>
                        <li className="text-lg">
                            <strong>Time Tracking (20 Marks):</strong> Task timer and daily work hours tracking for both members and
                            leads.
                        </li>
                        <li className="text-lg">
                            <strong>Communication Feature (10 Marks):</strong> Chat functionality for team discussions within workspaces.
                        </li>
                        <li className="text-lg">
                            <strong>Dashboard & Analytics (15 Marks):</strong> Admins and team leads can view team performance, time logs,
                            and task progress.
                        </li>
                    </ul>
                </div>
            </section>
    

            {/* Footer */}
            <footer className="bg-black text-white py-6">
                <div className="max-w-7xl mx-auto text-center">
                    <p>&copy; 2024 Codefest Hackathon. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
