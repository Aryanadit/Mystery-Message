'use client'

import Link from 'next/link'
import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { MessageSquare, Shield, Sparkles, ArrowRight, Lock } from 'lucide-react'
import Autoplay from 'embla-carousel-autoplay'
import messages from '@/messages.json'

export default function page(){
  return(
    <>
    <main className="grow flex flex-col items-center justify-center px-4 md:px-24 py-12 bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="text-center mb-12 md:mb-16 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-primary/10 border border-primary/20 rounded-full">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">AI-Powered Suggestions</span>
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 gradient-text leading-tight">
          Dive into the World of Anonymous Feedback
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Mystery Message - Where your identity remains a secret. Share your thoughts, ask questions, and connect anonymously.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/sign-up">
            <Button size="lg" className="text-base px-8 py-6">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button size="lg" variant="outline" className="text-base px-8 py-6">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-6xl mb-12 md:mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 hover:border-primary/50 transition-all duration-200 hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">100% Anonymous</h3>
              <CardDescription className="text-base">
                Your identity stays completely hidden. Share your thoughts without fear.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all duration-200 hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">AI Suggestions</h3>
              <CardDescription className="text-base">
                Get AI-powered message suggestions to help you start meaningful conversations.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all duration-200 hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Easy to Use</h3>
              <CardDescription className="text-base">
                Simple, intuitive interface. Share your profile link and start receiving messages.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Example Messages Carousel */}
      <section className="w-full max-w-4xl mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 gradient-text">
            See What People Are Saying
          </h2>
          <p className="text-muted-foreground">
            Real anonymous messages from our community
          </p>
        </div>
        <Carousel
          plugins={[Autoplay({delay : 3000})]}
          className="w-full max-w-2xl mx-auto">
          <CarouselContent>
            {
              messages.map((message,index)=>(
                <CarouselItem key={index}>
                  <div className="p-2">
                    <Card className="border-2 hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Lock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-semibold text-muted-foreground">Anonymous</span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground">
                          {message.title}
                        </h3>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground leading-relaxed">{message.content}</p>
                        <p className="text-sm text-muted-foreground mt-4">{message.received}</p>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))
            }
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </section>

      {/* CTA Section */}
      <section className="w-full max-w-4xl text-center">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20 p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
            Ready to Start?
          </h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of users sharing anonymous messages. Create your profile in seconds.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="text-base px-8 py-6">
              Create Your Profile
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </Card>
      </section>
    </main>
    <footer className='text-center p-4 md:p-6 border-t bg-card/50 backdrop-blur-sm'>
      <p className="text-muted-foreground text-sm">
        © 2026 Mystery Message. All rights reserved
      </p>
    </footer>
    </>
  )
}

