import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'teamLead', 'teamMember'], required: true },
    workspaces: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' }],
    createdAt: { type: Date, default: Date.now },
    verified: { type: Boolean },
    // New field to store the time spent each day
    timeSpentPerDay: [
        {
            date: { type: Date, required: true }, // The date for the time spent
            startTime: { type: Date, required: true }, // Start time of the task or session
            endTime: { type: Date }, // End time of the task or session (optional if the session is ongoing)
            timeSpent: { type: Number, default: 0 } // Time spent in seconds or minutes (you can choose the unit)
        }
    ]
});

const User = mongoose.model("User", userSchema);

export default User;
