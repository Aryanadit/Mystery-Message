import {Message} from "@/model/User"

// Messages from API always have _id
type MessageWithId = Message & {
    _id: string
}

export interface ApiResponse{
    success : boolean ,
    message : string , 
    isAcceptingMessages? : boolean,
    messages?: MessageWithId[] ,  // Updated to use MessageWithId
    questions?: string[] ,  // For AI suggestions
}