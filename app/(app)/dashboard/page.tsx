'use client'

import { useState, useCallback, useEffect } from 'react'
import axios, { AxiosError } from 'axios'
import { useSession } from 'next-auth/react'
import { User } from 'next-auth'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, RefreshCcw } from 'lucide-react'

import { Message } from '@/model/User'
import { ApiResponse } from '@/types/ApiResponse'
import { acceptMessageSchema } from '@/schema/acceptMessageSchema'


import MessageCard from '@/components/MessageCard'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

// Messages from API always have _id
type MessageWithId = Message & {
    _id: string
}

const UserDashboard = () => {
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSwitchLoading, setIsSwitchLoading] = useState(false)

    const { data: session, status } = useSession()

    const form = useForm<z.infer<typeof acceptMessageSchema>>({
        resolver: zodResolver(acceptMessageSchema),
        defaultValues: {
            acceptMessages: false,
        },
    })

    const { register, watch, setValue } = form

    // watch: watches a value and we need to inject it somewhere
    const acceptMessages = watch('acceptMessages') ?? false

    const handleDeleteMessage = useCallback((messageId: string) => {
        setMessages((prevMessages) =>
            prevMessages.filter((message) => message._id !== messageId)
        )
    }, [])

    const fetchAcceptMessage = useCallback(async () => {
        setIsSwitchLoading(true)
        try {
            const response = await axios.get<ApiResponse>('/api/accept-messages')
            if (response.data.isAcceptingMessages !== undefined) {
                setValue('acceptMessages', response.data.isAcceptingMessages)
        } 
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast.error('Error', {
                description:
                    axiosError.response?.data.message ??
                    'Failed to fetch message settings',
                position: 'top-center',
            })
        } finally {
            setIsSwitchLoading(false)
        }
    }, [setValue])

    const fetchMessages = useCallback(
        async (refresh: boolean = false) => {
        setIsLoading(true)
            if (!refresh) {
        setIsSwitchLoading(true)
            }
        try {
            const response = await axios.get<ApiResponse>('/api/get-messages')
                setMessages(response.data.messages ?? [])

                if (refresh) {
                    toast.success('Refreshed Messages', {
                        description: 'Showing Latest Messages',
                        position: 'top-center',
                })
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
                toast.error('Error', {
                    description:
                        axiosError.response?.data.message ??
                        'Failed to fetch the messages',
            })
            } finally {
            setIsLoading(false)
            setIsSwitchLoading(false)
        }
        },
        []
    )

    useEffect(() => {
        if (!session || !session.user) return
        fetchMessages()
        fetchAcceptMessage()
    }, [session, status, fetchMessages, fetchAcceptMessage])

    // handle switch change
    const handleSwitchChange = async () => {
        const oldValue = acceptMessages
        const newValue = !acceptMessages
        setIsSwitchLoading(true)
        
        // Optimistically update UI
        setValue('acceptMessages', newValue)
        
        try {
            const response = await axios.post<ApiResponse>('/api/accept-messages', {
                acceptMessages: newValue,
            })

            if (response.data.success) {
                toast.success(response.data.message, {
                    position: 'top-center',
                })
            } else {
                // Revert on failure
                setValue('acceptMessages', oldValue)
                toast.error('Error', {
                    description: response.data.message ?? 'Action Failed',
            })
        }
        } catch (error) {
            // Revert on error
            setValue('acceptMessages', oldValue)
            const axiosError = error as AxiosError<ApiResponse>
            toast.error('Error', {
                description:
                    axiosError.response?.data.message ?? 'Action Failed',
            })
        } finally {
            setIsSwitchLoading(false)
    }
    }

    // Get username safely
    const username = (session?.user as User)?.username

    // Safe window access for SSR
    const getProfileUrl = () => {
        if (typeof window === 'undefined' || !username) return ''
        const baseUrl = `${window.location.protocol}//${window.location.host}`
        return `${baseUrl}/u/${username}`
    }

    const profileUrl = getProfileUrl()

    const copyToClipboard = () => {
        if (!profileUrl) {
            toast.error('Error', {
                description: 'Unable to copy URL',
                position: 'top-center',
            })
            return
        }
        navigator.clipboard.writeText(profileUrl)
        toast.success('URL Copied!', {
            description: 'Profile URL has been copied to clipboard.',
            position: 'top-center',
        })
    }

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!session || !session.user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div>Please Login</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4">
            <div className="mx-auto max-w-6xl">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold mb-2 gradient-text">
                        Your Dashboard
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Manage your anonymous messages
                    </p>
                </div>

                {/* Profile Link Section */}
                <div className="mb-6 p-6 bg-card rounded-lg shadow-md border">
                    <h2 className="text-lg font-semibold mb-3 text-foreground">Share Your Profile</h2>
                    <div className="flex flex-col sm:flex-row gap-2">
            <input
                type="text"
                value={profileUrl}
                disabled
                            className="flex-1 px-4 py-2 bg-muted border border-input rounded-md text-foreground disabled:opacity-70"
            />
                        <Button onClick={copyToClipboard} className="sm:w-auto">
                            Copy Link
                        </Button>
            </div>
        </div>

                {/* Accept Messages Toggle */}
                <div className="mb-6 p-6 bg-card rounded-lg shadow-md border">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold mb-1 text-foreground">Accept Messages</h3>
                            <p className="text-sm text-muted-foreground">
                                {acceptMessages 
                                    ? "You're receiving anonymous messages" 
                                    : "Messages are currently disabled"}
                            </p>
                        </div>
            <Switch
            {...register('acceptMessages')}
            checked={acceptMessages}
            onCheckedChange={handleSwitchChange}
            disabled={isSwitchLoading}
            />
                    </div>
        </div>

                {/* Messages Section */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-foreground">Your Messages</h2>
        <Button
            variant="outline"
            onClick={(e) => {
            e.preventDefault();
            fetchMessages(true);
            }}
                        disabled={isLoading}
        >
            {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" /> 
            ) : (
                            <RefreshCcw className="h-4 w-4 mr-2" />
            )}
                        Refresh
        </Button>
                </div>

                {/* Messages Grid */}
            {messages.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {messages.map((message) => (
                <MessageCard
                                key={message._id}
                message={message}
                onMessageDelete={handleDeleteMessage}
                />
                        ))}
                    </div>
            ) : (
                    <div className="p-12 text-center bg-card rounded-lg shadow-md border">
                        <p className="text-muted-foreground text-lg">No messages yet.</p>
                        <p className="text-muted-foreground text-sm mt-2">
                            Share your profile link to start receiving anonymous messages!
                        </p>
                    </div>
            )}
        </div>
        </div>
    );
}

export default UserDashboard;