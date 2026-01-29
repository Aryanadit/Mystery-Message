"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { signIn } from "next-auth/react"
import { signInSchema } from "@/schema/signInSchema"

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
    const [isSubmitting , setIsSubmitting] = useState(false)
    const router = useRouter()

    // zod implementation
    const signInForm = useForm<z.infer<typeof signInSchema>>({
        resolver : zodResolver(signInSchema),
        defaultValues : {
            email : "",
            password : "",
        }
    })

    const onSubmit = async (data : z.infer<typeof signInSchema>) => {
        try {
            setIsSubmitting(true)
            const result = await signIn('credentials', {
                email : data.email , 
                password : data.password,
                redirect : false
            })

            if ( !result || result.error) {
                toast.error(
                <>
                    <p>Invalid credentials</p>
                    <p>Please check your email and password.</p>
                </>,
                {
                    position: "top-center",
                }
                )
                return
            }

            //console.log("sign-in/page Result : " , result )
            toast.success("Welcome Back",{
                position : "top-center"
            })
            router.replace('/dashboard')
        } catch (error) {
            console.error("Sign in error:", error)
            toast.error("Something went wrong", {
                description: "Please try again later.",
            })
        }
        finally{
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg border">
            <div className="text-center">
            <h1 className="text-4xl font-extrabold mb-2 gradient-text">
                Welcome Back
            </h1>
            <p className="text-muted-foreground">Sign in to continue your secret conversations</p>
            </div>

            <Form {...signInForm}>
            <form 
                onSubmit={signInForm.handleSubmit(onSubmit)}
                className="space-y-4">
                <FormField
                control={signInForm.control}
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
                control={signInForm.control}
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
                    "Sign In"
                )}
                </Button>
            </form>
            </Form>
        </div>
        </div>
    )}

export default page

