'use client'

import {X} from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import {Button} from '@/components/ui/button'
import {toast} from 'sonner'
import {Message} from '@/model/User'
import axios ,{AxiosError}from 'axios'
import {ApiResponse} from '@/types/ApiResponse'

// Message from API always has _id (MongoDB subdocuments)
type MessageWithId = Message & {
    _id: string  // Required when coming from API
}

type MessageCardProp = {
    message : Message , 
    onMessageDelete : (messageId : string) => void 
}

export default function MessageCard({message , onMessageDelete} : MessageCardProp){

    const handleDeleteConfirm = async () => {
        try {
            // _id is guaranteed to exist from API, but add safety check
            const messageId = message._id
            
            if( messageId ){ 
                const response = await axios.delete<ApiResponse>(
                `/api/delete-message/${messageId}` )

                toast.success("Message deleted", {
                    description: response.data.message,
                    position : 'top-center'
                })

                // Notify parent to update UI
                onMessageDelete(messageId)

            }
            else{
                toast.error("Failed to get Message Id ", {
                    position : 'top-center'
                })
            }
        } 
        catch (error) {
            const axiosError = error as AxiosError<ApiResponse>

            toast.error("Failed to delete message", {
                description:
                axiosError.response?.data.message ??
                "Something went wrong. Please try again.",
            })
        }
    }
    const formattedDate = new Date(message.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })

    return (
        <Card className="hover:shadow-lg transition-shadow duration-200 border-border">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold text-foreground">
                            Anonymous Message
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground mt-1">
                            {formattedDate}
                        </CardDescription>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button 
                                variant="destructive" 
                                size="icon"
                                className="shrink-0 hover:scale-110 transition-transform"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Delete Message?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete this message from your
                                    dashboard.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                    onClick={handleDeleteConfirm}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {message.content}
                </p>
            </CardContent>
        </Card>
    )
}