import mongoose from "mongoose";

const ChatRoomSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expertId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.models.ChatRoom || mongoose.model('ChatRoom', ChatRoomSchema);