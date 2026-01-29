import {z} from 'zod'
import {verifySchema} from "@/schema/verifySchema"
import UserModel from '@/model/User'
import dbConnect from '@/lib/dbConnect'

const codeVerifySchema = verifySchema

export async function POST(request : Request){
    await dbConnect();

    try{
        const {email , code , username } = await request.json()
        const codeValidationResult = codeVerifySchema.safeParse({code})

        // console.log("email : " , email)
        // console.log("username : " , username)
        // console.log("code : " , code)
        // console.log("codeValidationResult : " , codeValidationResult)

        //Check if code format is correct 
        if( !codeValidationResult.success ){
            return Response.json({
                success : false ,
                message : "Wrong Verify Code Format"
            },{status : 400})
        }

        const correctFormatCode = codeValidationResult.data.code
        //console.log("correctFormatCode" , correctFormatCode)
        
        // check if the user exist
        const user = await UserModel.findOne({ username })

        if( !user ){
            return Response.json({
                success : false , 
                message : "User Not Found"
            },{status : 404})
        }

        if( user.isVerified ){
            return Response.json({
                success : false , 
                message : "Email is Already Verified "
            })
        }

        // check the verifyCodeExpiry is valid or not 
        if( user.verifyCodeExpiry < new Date() ){
            return Response.json({
                success : false , 
                message : "Verification code has Expired"
            },{status : 400 })
        }

        if( user.verifyCode !== correctFormatCode ){
            return Response.json({
                success : false , 
                message : "Verification Code does not Match"
            } , {status : 400})
        }

        user.isVerified =  true 
        await user.save()

        return Response.json({
            success : true , 
            message : "User is Verified Successfully "
        },{status : 200})

    }
    catch(error){
        return Response.json({
            success : false ,
            message : "Error while verifying code"
        },{status : 500 })
    }
}
