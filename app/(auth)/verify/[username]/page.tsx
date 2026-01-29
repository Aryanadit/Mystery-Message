"use client"
import {useRouter , useParams} from 'next/navigation'
import { toast } from "sonner"
import {useForm} from 'react-hook-form'
import {verifySchema} from '@/schema/verifySchema'
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from 'zod'
import axios , {AxiosError} from 'axios'
import {ApiResponse} from '@/types/ApiResponse'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form"

const VerifyAccount = () => {
    const router = useRouter()
    const params = useParams<{username : string}>()
    
    const verifyForm = useForm<z.infer<typeof verifySchema>>({
        resolver : zodResolver(verifySchema),
        defaultValues : {
            code : ""
        }
    })

    const onSubmit = async (data : z.infer<typeof verifySchema>) => {
        try {
            const response = await axios.post('/api/verify-code',{
                username : params.username,
                code : data.code
            })

            console.log("username : " , response?.data.username)
            console.log("code : " , response?.data.code)

            toast.success("Success",{
                description : `${response.data.message}`,
                position : "top-center"
            })

            router.replace('/sign-in')
        }
        catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            console.error("path : app/auth/verify/page.tsx" , error)
            toast.error(`Signup failed : ${ axiosError.response?.data.message ??
                " Something went wrong. Please try again."}`, {
                position : "top-center",
            })
        }
    }
    return(
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
            <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg border" >
                <div className="text-center" > 
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-2 gradient-text">
                    Verify Your Account
                    </h1>
                    <p className="text-muted-foreground">Enter the Verification Code sent to your Email</p>
                </div>
            <Form {...verifyForm}>
                <form
                    onSubmit={verifyForm.handleSubmit(onSubmit)}
                    className="space-y-8">
                        <FormField
                        control={verifyForm.control}
                        name='code'
                        render={({field})=>(
                            <FormItem>
                                <FormLabel>Verification Code</FormLabel>
                                <FormControl>
                                    <Input
                                    placeholder='code'
                                    {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                        />
                        <Button type='submit' className="w-full"> Submit </Button>
                </form>
            </Form>
            </div>
        </div>
    )
}
export default VerifyAccount


