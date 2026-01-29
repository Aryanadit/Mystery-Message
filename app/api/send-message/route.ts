import dbConnect from '@/lib/dbConnect'
import UserModel from '@/model/User'
import {Message} from '@/model/User'

export async function POST( request : Request){
    await dbConnect()
    // later i need to make sure the logged in user should only be able to send message

    const {username , content} = await request.json()

    try {
        const user = await UserModel.findOne({username})

        if( !user ){
            return Response.json({
                success : false , 
                message : "User Not Found "
            },{status : 404 })
        }

        // is user accepting messages
        if( !user.isAcceptingMessages ){
            return Response.json({
                success : false , 
                message : "User Not Accepting Messages "
            },{status : 403 })
        }

        user.messages.push({
            content , 
            createdAt : new Date()
        })
        await user.save()

        return Response.json({
                success : true , 
                message : "Message Successfully Sent"
            },{status : 200 })

    } catch (error) {
        console.error("Error while sending message" , error)
        return Response.json({
                success : false , 
                message : "Something went wrong"
            },{status : 500 })
    }
}