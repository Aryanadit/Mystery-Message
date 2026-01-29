import dbConnect from '@/lib/dbConnect'
import {auth} from '@/auth'
import UserModel from '@/model/User'

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ messageId: string }> }
){
    await dbConnect()
    try {
        const {messageId} = await params
        const session = await auth()

        if(!session || !session.user){
            return Response.json({
                success: false,
                message: "Not authenticated"
            }, {status: 401})
        }

        if( !messageId ){
            return Response.json({
                success: false,
                message: "Message ID is required"
            }, {status: 400})
        }

        const userId = session.user.id
        
        const user = await UserModel.findById(userId)

        if( !user ){
            return Response.json({
                success: false,
                message: "User not found"
            }, {status: 404})
        }

        const doesMessageExists = user.messages.some( 
            (message) => (message._id?.toString() === messageId )
        )

        if ( !doesMessageExists ){
            return Response.json({
                success: false,
                message: "Message not found"
            }, {status: 404})
        }

        user.messages = user.messages.filter(
            (message) => (message._id?.toString() !== messageId)
        )

        await user.save()

        return Response.json({
            success: true,
            message: "Message deleted successfully"
        }, {status: 200})
    } catch (error) {
        console.error("Failed to delete message", error)
        return Response.json({
            success: false,
            message: "Something went wrong"
        }, { status: 500 })
    }
}
