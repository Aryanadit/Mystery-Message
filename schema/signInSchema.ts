import {z} from 'zod'

export const signInSchema = z.object({
    email : z.email({message : "Invalid email address"}),
    password : z.string().min(6,"password must atleast of 6 length")
})