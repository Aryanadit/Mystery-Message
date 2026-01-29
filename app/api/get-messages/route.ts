import {auth} from "@/auth"
import UserModel from '@/model/User'
import dbConnect from '@/lib/dbConnect'
import mongoose from 'mongoose'

export async function GET(request : Request){

    await dbConnect()

    const session = await auth()
    if(!session || !session.user ){
        return Response.json({
            success : false , 
            message : "Not Authenticated"
        },{status : 401})
    }

    /* Since the session.user.id is a string and not a _id which is stored in the 
    mongoose it will cause errors in the MongoDB Aggregation Pipelines
    */

    const userId = new mongoose.Types.ObjectId(session.user.id)

    try {
        // remove the double DB call only here for the debug
        const doesUserExists = await UserModel.findById(userId)

        if ( !doesUserExists ){
            return Response.json({
                success : false , 
                message : "User Not Found"
            },{status : 404})
        }

        if( doesUserExists.messages.length === 0){
            return Response.json({
                success : true , 
                message : "No Messages yet",
                messages : []
            },{status : 200})
        }

        const user = await UserModel.aggregate([
            {$match : {_id : userId}},
            {$unwind : "$messages"},
            {$sort : {'messages.createdAt': -1 } },
            {$group : {_id : "$_id" , messages : {$push : '$messages'}}}
        ])

        if( !user || user.length === 0){
            return Response.json({
                success : false , 
                message : "User Not Found || Aggregation Error"
            },{status : 404})
        }

        // console.log("After the Aggregation Pipeline User :" , user)
        // console.log(user[0].messages)
        return Response.json({
                success : true ,
                message : "User Found",
                messages : user[0].messages
            },{status : 200})
    }
    catch (error) {
        console.error("Failed to get user message", error)
        return Response.json({
            success : false , 
            message : "Something went wrong"
        } , { status : 500 })
    }
}