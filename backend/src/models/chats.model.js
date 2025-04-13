import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
  text: { type: String},
  file:{type:String},
  // seenCount:{type:Number,default:1}
},
{timestamps:true}
);

const chatSchema = new mongoose.Schema({
  chatName:{type:String,required:true},
  chatType:{type:String,required:true, enum:["private","group"]},
  chatPicUrl:{type:String},
  memberIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  ],
  messages: [messageSchema],
  unseenMessageCount: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId},
      count: { type: Number, default: 0 } // Number of unseen messages for this user
    }
  ]
//   lastMessage:{type:String},
},{timestamps:true});

const ChatModel = mongoose.model("Chats",chatSchema);
export default ChatModel;
