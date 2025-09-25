
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref:'User' , required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref:'User' , required: true },
    content: {type: String, required: true, maxlength: 1000},
    
},{ timestamps: true});
 
// bidirectional  indexing for faster retrieval 
messageSchema.index({ sender: 1 , recipient: 1 , createdAt: -1 });
messageSchema.index({ recipient: 1, sender: 1, createdAt: -1 }); 

// creates a structure in the database that follows above schema
export const Message = mongoose.model('Message',messageSchema);
