import {z} from 'zod'

export const usernameValidation = z
    .string()
    .min(2,'Username must be of 2 characters')
    .max(20 , "Username must be less than 20 Characters")
    .regex( /^[a-zA-Z0-9_]+$/, 'username must not contain special characters ')

export const signUpSchema = z.object({
    username : usernameValidation,
    email : z.email({message : "Invalid email address"}),
    password : z.string().min(6,"password must atleast of 6 length")
})