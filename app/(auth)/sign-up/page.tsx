"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useDebounceCallback } from "usehooks-ts"
import * as z from "zod"
import axios, { AxiosError } from "axios"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { signUpSchema } from "@/schema/signUpSchema"
import { ApiResponse } from "@/types/ApiResponse"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form"



const page = () => {
    const [username , setUsername] = useState('')
    const [usernameMessage , setUsernameMessage] = useState("")
    const [isCheckingUsername , setIsCheckingUsername] = useState(false)
    const [isSubmitting , setIsSubmitting] = useState(false)
    const debounced = useDebounceCallback(setUsername , 500)
    const router = useRouter()

    // zod implementation
    const signUpForm = useForm<z.infer<typeof signUpSchema>>({
        resolver : zodResolver(signUpSchema),
        defaultValues : {
            username : "",
            email : "",
            password : "",
        }
    })

    useEffect(()=>{
        console.log("checking the username as the useEffect is running ")
        const checkUsernameUnique = async () => {
            if(username){
                setIsCheckingUsername(true)
                setUsernameMessage("")
                try {
                    const response = await axios.get(`/api/check-username-unique?username=${username}`)
                    // console.log("app/auth/sign-in/page.tsx")
                    // console.log("Axios response" , response)
                    setUsernameMessage(response.data.message)
                    //setDebouncedUsername(debouncedUsername)
                } 
                catch (error) {
                    const axiosError = error as AxiosError<ApiResponse>
                    setUsernameMessage(axiosError.response?.data.message ?? 
                        "Error checking username ")
                }
                finally{
                    setIsCheckingUsername(false)
                }

            }
        }
        checkUsernameUnique()
    },[ username ])

    const onSubmit = async (data : z.infer<typeof signUpSchema>) => {
        setIsSubmitting(true)
        try {
            const response = await axios.post<ApiResponse>('/api/sign-up' , data )

            toast.success(`Account created : ${response.data.message}`, {
                position : "top-center",
            })

            setTimeout(() => {
                router.replace(`/verify/${data.username}`)
            }, 1000)

        } 
        catch (error) {
            const axiosError = error as AxiosError<ApiResponse>

            toast.error(`Signup failed : ${ axiosError.response?.data.message ??
                " Something went wrong. Please try again."}`, {
                position : "top-center",
            })
        }
        finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg border">
            <div className="text-center">
            <h1 className="text-4xl font-extrabold mb-2 gradient-text">
                Join Mystery Message
            </h1>
            <p className="text-muted-foreground">Sign up to start your anonymous journey</p>
            </div>

            <Form {...signUpForm}>
            <form 
                onSubmit={signUpForm.handleSubmit(onSubmit)} 
                className="space-y-4">
                    <FormField
                        control={signUpForm.control}
                        name="username"
                        render={({ field }) => (
                        <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="Username"
                                {...field}
                                onChange={(e) => {
                                    field.onChange(e)
                                    debounced(e.target.value)
                                }}
                        />
                    </FormControl>

                    {isCheckingUsername && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    )}

                    {usernameMessage && (
                        <p
                        className={`text-sm ${
                            usernameMessage
                            .toLowerCase()
                            .includes("available")
                            ? "text-primary"
                            : "text-destructive"
                        }`}
                        >
                        {usernameMessage}
                        </p>
                    )}

                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={signUpForm.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input type="email" placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={signUpForm.control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                        <Input type="password" placeholder="Password" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                    <Spinner data-icon="inline-start" />
                        Please wait
                    </>
                    
                ) : (
                    "Sign Up"
                )}
                </Button>
            </form>
            </Form>

            <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-primary underline">
                Sign in
            </Link>
            </p>
        </div>
        </div>
    )

    // return (
    //     <div className="flex justify-center items-center min-h-screen bg-gray-800">
    //         <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md" >
    //             <div className="text-center">
    //             <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
    //                 Welcome Back to Mystery Message
    //             </h1>
    //             <p className="mb-4">Sign in to continue your secret convoss....</p>
    //             </div>

    //             <form id="sign-in-form" onSubmit={signInForm.handleSubmit(onSubmit)}>
    //                 <Controller 
    //                     name="username" 
    //                     control={signInForm.control}
    //                     render={({field , fieldState }) => (
    //                         <div className ="space-y-1">
    //                             <Input
    //                                 {...field}
    //                                 placeholder="Username"
    //                                 onChange={ (e) => {
    //                                     field.onChange(e)
    //                                     debounced(e.currentTarget.value)
    //                                 } }
    //                             />

    //                             {isCheckingUsername && <Loader2
    //                             className='animate-spin' /> }


    //                             {usernameMessage && (
    //                                 <p className={`text-sm ${
    //                                     usernameMessage.toLowerCase().includes("available")
    //                                     ? "text-green-600" : "text-red-600" }`} >
    //                                         {usernameMessage}
    //                                 </p>
    //                             )}

    //                             {fieldState.error && (
    //                                 <p className="text-sm text-red-600">
    //                                     {fieldState.error.message}
    //                                 </p>
    //                             )}

    //                         </div>
    //                     )}
    //                     />

    //                 <Controller
    //                     name="email"
    //                     control={signInForm.control}
    //                     render={ ({field , fieldState }) => (
    //                         <div
    //                         //className='space-y-1'
    //                         >
    //                             <Input
    //                                 {...field}
    //                                 placeholder='Email'
    //                                 type="email"
    //                             />
    //                             {fieldState.error && (
    //                                 <p className="text-sm text-red-600">
    //                                     { fieldState.error.message}
    //                                 </p>
    //                             )}
    //                         </div>
    //                     ) }
    //                 />

    //                 <Controller
    //                     name='password'
    //                     control = {signInForm.control}
    //                     render={({field , fieldState })=>(
    //                         <div className='space-y-1'>
    //                             <Input
    //                             {...field}
    //                             placeholder='password'
    //                             type='password'
    //                         />
    //                         { fieldState.error && (
    //                             <p className='text-sm text-red-600'>
    //                                 {fieldState.error.message}
    //                             </p>
    //                         )}
    //                         </div>
    //                     )}
    //                 />



    //                     <Button
    //                         type="submit"
    //                         className="w-full"
    //                         disabled={isSubmitting}
    //                         >
    //                             {isSubmitting ? (
    //                                 <>
    //                                 <Loader2 className='mr-2 h-4 w-4 animate-spin'/> Please Wait
    //                                 </>
    //                             ) : "Sign Up"}
    //                     </Button>
    //             </form>
    //             <p className="mt-4 text-center text-sm text-muted-foreground">
    //                 Already have an account?{" "}
    //                 <Link
    //                     href="/sign-in"
    //                     className="font-medium text-primary underline"
    //                 >
    //                     Sign in
    //                 </Link>
    //             </p>

    //         </div>
    //     </div>
    // )
}

export default page

