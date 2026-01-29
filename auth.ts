import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/dbConnect'
import UserModel from '@/model/User'

export const { handlers , signIn , signOut ,  auth } = NextAuth({
    secret: process.env.AUTH_SECRET,
    providers: [
        Credentials({
            name : "Credentials",
            credentials : {
                email : {
                    label : 'Email',
                    type : 'email',
                },
                password : {
                    label : 'Password',
                    type : "password",
                }
            },
            async authorize(credentials){
                try { 
                // console.log("auth.ts - authorize() called")
                // console.log("RAW credentials object:", credentials)
                if (
                    !credentials ||
                    typeof credentials.email !== "string" ||
                    typeof credentials.password !== "string"
                ) {
                    console.log(" Error in the credentials ")
                    return null
                }

                // after checking we can say that they are not unknown so we can just confirm they 
                // are string as typescripts accepts string || unknown
                const email = credentials.email as string
                const password = credentials.password as string
                // console.log("email : " , email )
                // console.log("password : " , password )

                await dbConnect()

                // check if the user exist
                const existingUser =  await UserModel.findOne({ email, })
                
                // if does not exist
                if( !existingUser ) return null

                 // if exist an not verified
                if (!existingUser.isVerified) return null

                const isPasswordCorrect = await bcrypt.compare( password , existingUser.password )

                if (!isPasswordCorrect) return null

                // if exist and verified
                return {
                    id: existingUser._id.toString(), 
                    username: existingUser.username,
                    isVerified: existingUser.isVerified,
                    isAcceptingMessages: existingUser.isAcceptingMessages,
                }
                } catch (error) {
                    console.log("Authorize error : " , error )
                    return null
                }
            }
        })
    ],
    session: {
        strategy: "jwt", 
    },
    callbacks: {

        // user : this is the user that i get from the authorize function
        async jwt({ token, user }) {
        if (user) {
            token.id = user.id
            token.username = user.username
            token.isVerified = user.isVerified
            token.isAcceptingMessages = user.isAcceptingMessages
        }
        return token
        },
        async session({ session, token }) {
        if (session.user) {
            session.user.id = token.id as string
            session.user.username = token.username as string
            session.user.isVerified = token.isVerified as boolean
            session.user.isAcceptingMessages = token.isAcceptingMessages as boolean
        }
        return session
        },
    },
})