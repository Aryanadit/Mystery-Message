'use client'

import { toast } from 'sonner'
import { Loader2, Send, Sparkles, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form'

import { useParams } from "next/navigation"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {messageSchema} from '@/schema/messageSchema'

import {useState , useEffect} from 'react'
import axios ,{AxiosError} from 'axios'
import {ApiResponse} from '@/types/ApiResponse'


export default function UserProfilePage(){
    // get the username from the params
    const params = useParams<{username : string }>()
    const username = params.username

    const [isAcceptingMessages, setIsAcceptingMessages] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number | null>(null)

    // create the form
    const form = useForm<z.infer<typeof messageSchema>>({
        resolver : zodResolver(messageSchema),
        defaultValues : {
            content : "",
        }
    })

    // check if the user exists and  is accepting message or not

    useEffect(  () => {
        const checkUser =async () => {
            setIsLoading(true)
            try {
                const response = await axios.get(`/api/check-user/${username}`)
                setIsAcceptingMessages(response.data.isAcceptingMessages ?? false)
            }
            catch (error) {
                const axiosError = error as AxiosError<ApiResponse>
                toast.error(
                <>
                <p>"Error while Checking the User"</p>
                <p>${axiosError.response?.data.message}</p>
                </>,{
                    position : "top-center"
                })
            }
            finally{
                setIsLoading(false)
            }
        }
        if (username) checkUser()
    } 
    , [username])

    // Handle AI suggestions
    const handleGetSuggestions = async () => {
        if (!isAcceptingMessages) {
            toast.error("User is not accepting messages", {
                position: "top-center"
            })
            return
        }

        setIsLoadingSuggestions(true)
        setSuggestions([])
        setSelectedSuggestionIndex(null)
        
        // Clear the textarea first
        form.setValue('content', '')
        
        try {
            const response = await axios.post<ApiResponse>('/api/suggest-messages')

            if (!response.data.success || !response.data.questions) {
                throw new Error('Failed to fetch suggestions')
            }

            const questions = response.data.questions
            
            if (questions.length > 0) {
                setSuggestions(questions)
                toast.success("AI suggestions generated!", {
                    description: `Click on any suggestion to use it`,
                    position: "top-center"
                })
            } else {
                throw new Error('No suggestions received')
            }

        } catch (error) {
            console.error('Error fetching suggestions:', error)
            const axiosError = error as AxiosError<ApiResponse>
            toast.error("Failed to get AI suggestions", {
                description: axiosError.response?.data.message || "Please try again",
                position: "top-center"
            })
        } finally {
            setIsLoadingSuggestions(false)
        }
    }

    // Handle clicking on a suggestion
    const handleSelectSuggestion = (suggestion: string, index: number) => {
        form.setValue('content', suggestion)
        setSelectedSuggestionIndex(index)
        toast.success("Suggestion selected!", {
            description: "You can edit it before sending",
            position: "top-center"
        })
    }

    // onSubmit function implementation
    const onSubmit = async (data : z.infer<typeof messageSchema>) => {
        if (!isAcceptingMessages) {
            toast.error("This user is not accepting messages right now.")
            return
        }
        setIsSubmitting(true)
        try {
            const response = await axios.post('/api/send-message',{
                username : username ,
                content : data.content
            })

            toast.success(response.data.message,{
                position : 'top-center'
            })

            form.reset()
            setSuggestions([])
            setSelectedSuggestionIndex(null)
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast.error(
                axiosError.response?.data.message || "Failed to send message",
                { position: 'top-center' }
            )
        }
        finally{
            setIsSubmitting(false)
        }
    }
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-background via-background to-muted/20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!isAcceptingMessages) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-background via-background to-muted/20">
                <div className="text-center p-8 bg-card rounded-lg shadow-lg border max-w-md">
                    <h1 className="text-3xl font-bold mb-2 text-foreground">@{username}</h1>
                    <p className="text-muted-foreground">This user is not accepting messages right now.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 py-8 px-4">
            <div className="container mx-auto max-w-2xl">
                <div className="bg-card rounded-lg shadow-lg border p-6 md:p-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 gradient-text">
                        Send a message to @{username}
                    </h1>
                    <p className="text-muted-foreground mb-6">Your message will be anonymous</p>
                    
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="relative">
                                                <Textarea
                                                    placeholder="Type your anonymous message here..."
                                                    className="min-h-150px resize-none pr-10"
                                                    disabled={!isAcceptingMessages || isSubmitting}
                                                    {...field}
                                                />
                                                {isLoadingSuggestions && (
                                                    <div className="absolute top-3 right-3">
                                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                    </div>
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            {/* AI Suggestions Display */}
                            {suggestions.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        AI Suggestions
                                    </h3>
                                    <div className="flex flex-col gap-2">
                                        {suggestions.map((suggestion, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => handleSelectSuggestion(suggestion, index)}
                                                className={`text-left p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                                                    selectedSuggestionIndex === index
                                                        ? 'border-primary bg-primary/10 text-foreground'
                                                        : 'border-border bg-card hover:border-primary/50 hover:bg-accent/50'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="flex-1 text-sm text-foreground leading-snug">
                                                        {suggestion}
                                                    </p>
                                                    {selectedSuggestionIndex === index && (
                                                        <Check className="h-4 w-4 text-primary shrink-0" />
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleGetSuggestions}
                                    disabled={isLoadingSuggestions || !isAcceptingMessages}
                                    className="sm:w-auto"
                                >
                                    {isLoadingSuggestions ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            Get AI Suggestions
                                        </>
                                    )}
                                </Button>
                                
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={isSubmitting || !isAcceptingMessages}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Send Message
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}