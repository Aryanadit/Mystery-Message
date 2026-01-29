import mongoose ,{ Schema , Model , Document } from 'mongoose'
//including the Document as we r using the ts for type safety

export interface Message {
    _id?: string  // MongoDB subdocuments have _id, serialized as string in JSON
    content : string ,
    createdAt : Date
}
// if it was only a string then 
// const MessageSchema : string = new Schema({})
// this is for custom schema
const MessageSchema = new Schema<Message>({
    //Mongoose String
    //TypeScript string
    content : {
        type : String,
        required : true
    },
    createdAt : {
        type : Date , 
        required : true,
        default : Date.now

    }
})

export interface User{
    username : string , 
    email : string , 
    password : string , 
    verifyCode : string , 
    verifyCodeExpiry : Date ,
    isVerified : boolean ,
    isAcceptingMessages : boolean ,
    messages : Message[]
}

const UserSchema = new Schema<User>({
    username:{
        type : String , 
        required : [true, "Username is required"] ,
        trim : true , 
        unique : true
    },
    email : {
        type : String ,
        required : [true , "Email is required "],
        unique : true,
        match: [
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "Please use a valid email"
        ]

    },
    password : {
        type : String ,
        required : [true , "Password is required "],
    },
    verifyCode : {
        type : String ,
        required : [true , "Verify Code is required "],
    },
    verifyCodeExpiry : {
        type : Date ,
        required : [true , "Verify Code Expiry is required "],
    },
    isVerified : {
        type : Boolean ,
        default : false ,
    },
    isAcceptingMessages : {
        type : Boolean ,
        default : true ,
    },
    messages : [ MessageSchema ]

})

const UserModel: Model<User> = mongoose.models.User || mongoose.model<User>("User", UserSchema)

export default UserModel