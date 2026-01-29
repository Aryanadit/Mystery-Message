import {auth} from "@/auth"
import UserModel from '@/model/User'
import dbConnect from '@/lib/dbConnect'

export async function POST(request: Request) {
    await dbConnect()

    try {
        const session = await auth()
        if (!session?.user?.id) {
        return Response.json(
            { success: false, message: "Not authenticated" },
            { status: 401 }
        )
        }

        const { acceptMessages } = await request.json()

        if (typeof acceptMessages !== "boolean") {
        return Response.json(
            { success: false, message: "Invalid payload" },
            { status: 400 }
        )
        }

        const user = await UserModel.findByIdAndUpdate(
        session.user.id,
        { isAcceptingMessages: acceptMessages },
        { new: true }
        )

        if (!user) {
        return Response.json(
            { success: false, message: "User not found" },
            { status: 404 }
        )
        }

        return Response.json(
        {
            success: true,
            message: "Message settings updated",
            isAcceptingMessages: user.isAcceptingMessages,
        },
        { status: 200 }
        )
    } catch (error) {
        console.error("Accept message error:", error)
        return Response.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
        )
    }
}


export async function GET (request : Request){
    await dbConnect()

    try{
        const session = await auth()
        if(!session){
            return Response.json({
                success : false , 
                message : "session not found"
            },{status : 401})
        }

        const userId = session?.user?.id

        if( !userId ){
            return Response.json({
                success : false , 
                message : "No User Found , Login Again"
            },{status : 404})
        }
        
        const user = await UserModel.findById(userId)

        if( !user ){
            return Response.json({
                success : false , 
                message : "No user found , please Sign In"
            },{status : 404})
        }

        return Response.json({
                success : true , 
                message : `User is ${user.isAcceptingMessages ? "" : "not "}accepting messages`,
                isAcceptingMessages : user.isAcceptingMessages,
            },{status : 200})
            
    }
    catch(error){
        console.error("Failed to get user status to accept message", error)
        return Response.json({
            success : false , 
            message : "Something went wrong"
        } , { status : 500 })
    }
}