import dbConnect from '@/lib/dbConnect'
import UserModel from '@/model/User'

export async function GET(
    request : Request,
    {params} : { params : Promise<{username : string }>}
){
    await dbConnect()

    const {username} = await params
    console.log("Username : " , username )

    if( !username ){
        return Response.json({
            success : false ,
            message : "username not found"
        },{status : 400 })
    }

    const user = await UserModel.findOne({ username : username })

    if( !user ){
        return Response.json({
            success : false ,
            message : "user not found"
        },{status : 404 })
    }

    return Response.json({
        success : true ,
        message : "User Found",
        isAcceptingMessages : user.isAcceptingMessages
    },{status : 200})
}