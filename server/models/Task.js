import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
    deadline: { type: Date },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
    createdAt: { type: Date, default: Date.now },
    startTime: {type: Date},
    endTime:{type: Date},
    timeSpent:{type: Number}

});


const Task = mongoose.model("Task", taskSchema);

export default Task;