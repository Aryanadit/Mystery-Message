import {z} from 'zod'

export const messageSchema = z.object({
    content : z
            .string()
            .min(10 , "content must be of atleast 10 charecters")
            .max(300 , 'content must be less than 300 charecters ')
})