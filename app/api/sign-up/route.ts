import dbConnect from '@/lib/dbConnect'
import UserModel from '@/model/User'
import bcrypt from 'bcryptjs'
import { sendVerificationEmail } from '@/helpers/sendVerificationEmail'

export async function POST(request: Request) {
    await dbConnect()

    try {
        const { username, email, password } = await request.json()

        // Check if user exists by username
        const existingUserVerifiedByUsername = await UserModel.findOne({
        username,
        isVerified: true,
        })

        if (existingUserVerifiedByUsername) {
        return Response.json(
            {
            success: false,
            message: 'Username is Already Taken',
            },
            { status: 400 }
        )
        }

        // Check if user exists by email
        const existingUserByEmail = await UserModel.findOne({ email })

        // Generate OTP
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

        if (existingUserByEmail) {
        // If the user is already verified
        if (existingUserByEmail.isVerified) {
            return Response.json(
            {
                success: false,
                message: 'User already Exists with this email',
            },
            { status: 400 }
            )
        }

        // If the user is not verified
        const hashedPassword = await bcrypt.hash(password, 10)

        existingUserByEmail.password = hashedPassword
        existingUserByEmail.verifyCode = verifyCode
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)

        await existingUserByEmail.save()
        } else {
        // New user
        const hashedPassword = await bcrypt.hash(password, 10)

        const expiryDate = new Date()
        expiryDate.setHours(expiryDate.getHours() + 1)

        const newUser = new UserModel({
            username,
            email,
            password: hashedPassword,
            verifyCode,
            verifyCodeExpiry: expiryDate,
            isVerified: false,
            isAcceptingMessage: true,
            messages: [],
        })
        await newUser.save()
        // OTP verification is pending
        }

        // Send verification email
        const emailResponse = await sendVerificationEmail(
        email,
        username,
        verifyCode
        )

        // Unsuccessful email verification
        if (!emailResponse.success) {
        return Response.json(
            {
            success: false,
            message: emailResponse.message,
            },
            { status: 500 }
        )
        }

        // Successful registration
        return Response.json(
        {
            success: true,
            message: 'User successfully registered. Please verify your email',
        },
        { status: 201 }
        )
    } catch (error) {
        // Terminal log
        console.error('Error registering user', error)

        // Frontend response
        return Response.json(
        {
            success: false,
            message: 'Error registering user',
        },
        { status: 500 }
        )
    }
}
