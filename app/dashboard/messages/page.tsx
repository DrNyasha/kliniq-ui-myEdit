"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { PatientSidebar } from "@/components/patient-sidebar"
import {
    MessageSquare,
    Send,
    Search,
    Bell,
    Menu,
    Phone,
    Video,
    MoreVertical,
    Paperclip,
    Smile,
    ChevronLeft,
} from "lucide-react"

interface Message {
    id: string
    sender: "user" | "clinician"
    senderName: string
    content: string
    timestamp: Date
    read: boolean
}

interface Conversation {
    id: string
    clinicianName: string
    clinicianRole: string
    avatar: string
    lastMessage: string
    lastMessageTime: string
    unreadCount: number
    online: boolean
}

const mockConversations: Conversation[] = [
    {
        id: "1",
        clinicianName: "Dr. Oluwaseun Adeyemi",
        clinicianRole: "General Medicine",
        avatar: "OA",
        lastMessage: "Your test results look normal. Continue with the medication.",
        lastMessageTime: "2m ago",
        unreadCount: 2,
        online: true,
    },
    {
        id: "2",
        clinicianName: "Nurse Amaka",
        clinicianRole: "Triage Nurse",
        avatar: "NA",
        lastMessage: "I've forwarded your query to the doctor.",
        lastMessageTime: "1h ago",
        unreadCount: 0,
        online: true,
    },
    {
        id: "3",
        clinicianName: "Dr. Amara Obi",
        clinicianRole: "Cardiology",
        avatar: "AO",
        lastMessage: "Please schedule a follow-up next week.",
        lastMessageTime: "3h ago",
        unreadCount: 1,
        online: false,
    },
]

const mockMessages: Message[] = [
    {
        id: "1",
        sender: "clinician",
        senderName: "Dr. Oluwaseun Adeyemi",
        content: "Good morning! How are you feeling today?",
        timestamp: new Date(Date.now() - 3600000),
        read: true,
    },
    {
        id: "2",
        sender: "user",
        senderName: "You",
        content: "Better than yesterday. The headache has reduced.",
        timestamp: new Date(Date.now() - 3000000),
        read: true,
    },
    {
        id: "3",
        sender: "clinician",
        senderName: "Dr. Oluwaseun Adeyemi",
        content: "That's great to hear! Continue with the medication as prescribed. Are you taking it after meals?",
        timestamp: new Date(Date.now() - 2400000),
        read: true,
    },
    {
        id: "4",
        sender: "user",
        senderName: "You",
        content: "Yes, after breakfast and dinner as you instructed.",
        timestamp: new Date(Date.now() - 1800000),
        read: true,
    },
    {
        id: "5",
        sender: "clinician",
        senderName: "Dr. Oluwaseun Adeyemi",
        content: "Your test results look normal. Continue with the medication.",
        timestamp: new Date(Date.now() - 120000),
        read: false,
    },
]

export default function MessagesPage() {
    const [mounted, setMounted] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [selectedConversation, setSelectedConversation] = useState<string | null>("1")
    const [messageInput, setMessageInput] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [showMobileChat, setShowMobileChat] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const filteredConversations = mockConversations.filter((conv) =>
        conv.clinicianName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleSendMessage = () => {
        if (!messageInput.trim()) return
        setMessageInput("")
    }

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-background flex max-w-full overflow-x-hidden">
            <PatientSidebar activePath="/dashboard/messages" sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="flex-1 flex flex-col min-h-screen max-w-full">
                <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-secondary transition-colors">
                                <Menu className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">Messages</h1>
                                <p className="text-sm text-muted-foreground">Chat with your healthcare providers</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="relative p-2 rounded-xl hover:bg-secondary transition-colors">
                                <Bell className="w-5 h-5 text-muted-foreground" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                            </button>
                            <div className="hidden md:block">
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex max-w-full overflow-x-hidden">
                    {/* Conversations List */}
                    <div className={cn(
                        "w-full md:w-80 lg:w-96 max-w-full md:border-r border-border/50 flex flex-col bg-card/50",
                        showMobileChat && "hidden md:flex"
                    )}>
                        <div className="p-4 border-b border-border/50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-background/50 border-border/50 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {filteredConversations.map((conv) => (
                                <motion.button
                                    key={conv.id}
                                    onClick={() => {
                                        setSelectedConversation(conv.id)
                                        setShowMobileChat(true)
                                    }}
                                    whileHover={{ x: 4 }}
                                    className={cn(
                                        "w-full max-w-full p-4 flex items-start gap-3 border-b border-border/50 transition-colors overflow-hidden",
                                        selectedConversation === conv.id
                                            ? "bg-primary/10 border-l-4 border-l-primary"
                                            : "hover:bg-secondary/30"
                                    )}
                                >
                                    <div className="relative flex-shrink-0">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-semibold">
                                            {conv.avatar}
                                        </div>
                                        {conv.online && (
                                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 text-left overflow-hidden">
                                        <div className="flex items-center justify-between mb-1 gap-2">
                                            <h3 className="font-semibold text-foreground truncate flex-1">{conv.clinicianName}</h3>
                                            <span className="text-xs text-muted-foreground flex-shrink-0">{conv.lastMessageTime}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-1 truncate">{conv.clinicianRole}</p>
                                        <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                                    </div>
                                    {conv.unreadCount > 0 && (
                                        <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0">
                                            {conv.unreadCount}
                                        </div>
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Chat Area */}
                    {selectedConversation && (
                        <div className={cn(
                            "flex-1 flex flex-col",
                            !showMobileChat && "hidden md:flex"
                        )}>
                            <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setShowMobileChat(false)}
                                            className="md:hidden p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
                                            OA
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground">Dr. Oluwaseun Adeyemi</h3>
                                            <p className="text-xs text-green-500 flex items-center gap-1">
                                                <span className="w-2 h-2 bg-green-500 rounded-full" />
                                                Online
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 rounded-xl hover:bg-secondary transition-colors">
                                            <Phone className="w-5 h-5 text-muted-foreground" />
                                        </button>
                                        <button className="p-2 rounded-xl hover:bg-secondary transition-colors">
                                            <Video className="w-5 h-5 text-muted-foreground" />
                                        </button>
                                        <button className="p-2 rounded-xl hover:bg-secondary transition-colors">
                                            <MoreVertical className="w-5 h-5 text-muted-foreground" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {mockMessages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}
                                    >
                                        <div
                                            className={cn(
                                                "max-w-[70%] p-4 rounded-2xl",
                                                message.sender === "user"
                                                    ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-br-md"
                                                    : "bg-secondary/50 text-foreground rounded-bl-md"
                                            )}
                                        >
                                            <p className="text-sm leading-relaxed">{message.content}</p>
                                            <p
                                                className={cn(
                                                    "text-xs mt-2",
                                                    message.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                                                )}
                                            >
                                                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="p-4 border-t border-border/50 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
                                <div className="flex items-center gap-3">
                                    <button className="p-2 rounded-xl hover:bg-secondary transition-colors">
                                        <Paperclip className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                    <button className="p-2 rounded-xl hover:bg-secondary transition-colors">
                                        <Smile className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                    <div className="flex-1">
                                        <Input
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                            placeholder="Type a message..."
                                            className="h-12 bg-background/50 border-border/50 rounded-xl"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleSendMessage}
                                        className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 p-0"
                                    >
                                        <Send className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
