import dbConnect from '@/lib/dbConnect'
import UserModel from '@/model/User'
import {z} from 'zod'
import {usernameValidation} from '@/schema/signUpSchema'

const UsernameQuerySchema = z.object({
    username : usernameValidation
})

export async function GET(request : Request){
    await dbConnect()

    try {
        const {searchParams} = new URL(request.url)
        const queryParam = {
            username : searchParams.get("username")
        }
        const result = UsernameQuerySchema.safeParse(queryParam)

        //console.log("request : " , request)
        // console.log("SearchParams" , searchParams)
        // console.log("QueryParam " , queryParam )
        // console.log("Result after the safe parse : " , result)

        if( !result.success ){
            const usernameErrors = result.error.format().username?._error || [] 
            return Response.json({
                success : false , 
                message : usernameErrors.length > 0 ? 
                    usernameErrors.join(', ') : " invalid query parameters "
            },{ status : 400 })
        }

        const {username} = result.data

        const existingUsername = await UserModel.findOne({username , isVerified : true})

        if(existingUsername){
            return Response.json({
                success : false ,
                message : "Username is already taken"
            },{status : 400})
        }

        return Response.json({
            success : true,
            message : "Username is available"
        },{status : 200})

    } catch (error) {
        console.error("Error while validating a user " , error )
        return Response.json({
            success : false , 
            message : "Error checking the username"
        },{status : 500 })
    }
}