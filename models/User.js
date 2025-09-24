import mongoose, { mongo } from "mongoose";
 
const useSchema = new mongoose.Schema({
    _id:{type:String,required:true},
    name:{type:String,required:true},
    email: { type: String, required: true },
    imageUrl:{type:String,required:true,unique:true},
     cartItems:{type:Object,default:{}}
}, { minimize: false })  
const User = mongoose.model.user || mongoose.model('user', userschema)

export default User