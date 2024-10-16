import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'teamLead', 'teamMember'], required: true },
    workspaces: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' }],
    createdAt: { type: Date, default: Date.now },
    verified:{type: Boolean}
});


const User = mongoose.model("User", userSchema);

export default User;