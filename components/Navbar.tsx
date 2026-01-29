'use client'
import Link from 'next/link'
import {useSession , signOut} from 'next-auth/react'
import { User } from 'next-auth'
import {Button} from '@/components/ui/button'


export default function Navbar(){

    // data is the key and is being renamed to session
    const {data : session , status } = useSession()
    if (status === "loading") return null
    //console.log("data : " , session )

    // all the session are stored in the User , and we cannot get that from the data (above)

    //const user : User = session?.user as User
    
    //console.log("Navbar , user : " , user)


    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
            <div className="container mx-auto px-4 md:px-6 py-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <Link href='/' className="text-xl md:text-2xl font-bold gradient-text">
                        Mystery Message
                    </Link>
                    <div className="flex items-center gap-4">
                        {
                            session ? (
                                <>
                                    <span className="text-sm text-muted-foreground hidden sm:inline">
                                        Welcome, <span className="font-semibold text-foreground">{session.user?.username}</span>
                                    </span>
                                    <Button
                                        onClick={() => signOut()}
                                        variant="outline"
                                        className="w-full md:w-auto"
                                    >
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <Link href='/sign-in'>
                                    <Button variant="default" className="w-full md:w-auto">
                                        Login
                                    </Button>
                                </Link>
                            )
                        }
                    </div>
                </div>
            </div>
        </nav>
    )
}