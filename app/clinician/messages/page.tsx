"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { cn } from "@/lib/utils"
import { ClinicianSidebar } from "@/components/clinician-sidebar"
import {
    MessageSquare,
    Send,
    Search,
    Menu,
    Phone,
    Video,
    MoreVertical,
    Paperclip,
    Smile,
    ChevronLeft,
    Mic,
    MicOff,
    X,
    Minimize2,
    Maximize2,
    PhoneOff,
    Volume2,
    Home,
    Users,
    Calendar,
    Award,
    Settings,
} from "lucide-react"

interface Message {
    id: string
    sender: "clinician" | "patient"
    senderName: string
    content: string
    timestamp: Date
    read: boolean
    isAudio?: boolean
    attachment?: {
        name: string
        size: number
        type: string
    }
}

interface Conversation {
    id: string
    patientName: string
    patientId: string
    avatar: string
    lastMessage: string
    lastMessageTime: string
    unreadCount: number
    online: boolean
    urgency?: "low" | "medium" | "high"
}

const mockConversations: Conversation[] = [
    {
        id: "1",
        patientName: "Adebayo Ogundimu",
        patientId: "KLQ-2847",
        avatar: "AO",
        lastMessage: "Thank you doctor. I'll take the medication as prescribed.",
        lastMessageTime: "5m ago",
        unreadCount: 1,
        online: true,
        urgency: "medium",
    },
    {
        id: "2",
        patientName: "Chioma Eze",
        patientId: "KLQ-3921",
        avatar: "CE",
        lastMessage: "The chest pain is still there. Should I come in?",
        lastMessageTime: "12m ago",
        unreadCount: 2,
        online: true,
        urgency: "high",
    },
    {
        id: "3",
        patientName: "Ibrahim Musa",
        patientId: "KLQ-1573",
        avatar: "IM",
        lastMessage: "Feeling much better now. Thanks!",
        lastMessageTime: "2h ago",
        unreadCount: 0,
        online: false,
        urgency: "low",
    },
    {
        id: "4",
        patientName: "Funke Adeoye",
        patientId: "KLQ-4482",
        avatar: "FA",
        lastMessage: "Can I take the medication with food?",
        lastMessageTime: "1d ago",
        unreadCount: 0,
        online: true,
        urgency: "low",
    },
]

const mockMessages: Message[] = [
    {
        id: "1",
        sender: "patient",
        senderName: "Adebayo Ogundimu",
        content: "Good afternoon doctor. I wanted to ask about the medication you prescribed.",
        timestamp: new Date(Date.now() - 3600000),
        read: true,
    },
    {
        id: "2",
        sender: "clinician",
        senderName: "You",
        content: "Good afternoon Adebayo. How can I help you today?",
        timestamp: new Date(Date.now() - 3500000),
        read: true,
    },
    {
        id: "3",
        sender: "patient",
        senderName: "Adebayo Ogundimu",
        content: "The headache is better now, but I'm wondering if I can reduce the dosage?",
        timestamp: new Date(Date.now() - 3000000),
        read: true,
    },
    {
        id: "4",
        sender: "clinician",
        senderName: "You",
        content: "I'm glad the headache is improving. However, please continue with the prescribed dosage for the full duration. Reducing it too early might cause the symptoms to return. Complete the 5-day course and we can reassess during your follow-up appointment.",
        timestamp: new Date(Date.now() - 2500000),
        read: true,
    },
    {
        id: "5",
        sender: "patient",
        senderName: "Adebayo Ogundimu",
        content: "Thank you doctor. I'll take the medication as prescribed.",
        timestamp: new Date(Date.now() - 300000),
        read: false,
    },
]

export default function ClinicianMessagesPage() {
    const [mounted, setMounted] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [selectedConversation, setSelectedConversation] = useState<string>("")
    const [messages, setMessages] = useState(mockMessages)
    const [messageInput, setMessageInput] = useState("")
    const [isRecording, setIsRecording] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [showPhoneCall, setShowPhoneCall] = useState(false)
    const [showVideoCall, setShowVideoCall] = useState(false)
    const [showTranscript, setShowTranscript] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const textInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const selectedConv = mockConversations.find((c) => c.id === selectedConversation)

    const filteredConversations = mockConversations.filter((conv) =>
        conv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.patientId.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleSendMessage = () => {
        if (!messageInput.trim() && !selectedFile) return

        const newMessage: Message = {
            id: Date.now().toString(),
            sender: "clinician",
            senderName: "You",
            content: selectedFile ? `📎 ${selectedFile.name}` : messageInput,
            timestamp: new Date(),
            read: true,
            attachment: selectedFile
                ? {
                    name: selectedFile.name,
                    size: selectedFile.size,
                    type: selectedFile.type,
                }
                : undefined,
        }

        setMessages([...messages, newMessage])
        setMessageInput("")
        setSelectedFile(null)
    }

    const handleVoiceRecord = () => {
        if (!isRecording) {
            setIsRecording(true)
        } else {
            setIsRecording(false)
            const audioMessage: Message = {
                id: Date.now().toString(),
                sender: "clinician",
                senderName: "You",
                content: "🎤 Voice message",
                timestamp: new Date(),
                read: true,
                isAudio: true,
            }
            setMessages([...messages, audioMessage])
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
        }
    }

    const urgencyStyles = {
        low: "border-l-green-500",
        medium: "border-l-amber-500",
        high: "border-l-red-500 bg-red-500/5",
    }

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-background flex">
            <ClinicianSidebar activePath="/clinician/messages" sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 sm:px-6 py-4 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-xl hover:bg-secondary transition-colors"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">Messages</h1>
                                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                                    Communicate with your patients
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <NotificationsDropdown />
                            <div className="hidden md:block">
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* Conversations List */}
                    <div className={cn(
                        "w-full sm:w-80 lg:w-96 border-r border-border/50 flex flex-col bg-card/30 overflow-hidden",
                        selectedConversation && "hidden sm:flex"
                    )}>
                        <div className="p-4 border-b border-border/50 shrink-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search patients..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-background/50 border-border/50"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {filteredConversations.map((conv) => (
                                <motion.button
                                    key={conv.id}
                                    onClick={() => setSelectedConversation(conv.id)}
                                    className={cn(
                                        "w-full p-4 flex items-start gap-3 hover:bg-secondary/50 transition-colors border-l-4 text-left",
                                        selectedConversation === conv.id
                                            ? "bg-secondary border-l-primary"
                                            : "border-l-transparent",
                                        conv.urgency && urgencyStyles[conv.urgency]
                                    )}
                                >
                                    <div className="relative shrink-0">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-bold">
                                            {conv.avatar}
                                        </div>
                                        {conv.online && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <h3 className="font-semibold text-foreground truncate">{conv.patientName}</h3>
                                            {conv.unreadCount > 0 && (
                                                <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium shrink-0">
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-1">{conv.patientId}</p>
                                        <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{conv.lastMessageTime}</p>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Chat Area */}
                    {selectedConv && (
                        <div className={cn(
                            "flex-1 flex flex-col overflow-hidden",
                            !selectedConversation && "hidden sm:flex"
                        )}>
                            {/* Chat Header */}
                            <div className="px-4 sm:px-6 py-4 border-b border-border/50 flex items-center justify-between shrink-0 bg-card/30">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setSelectedConversation("")}
                                        className="sm:hidden p-2 rounded-xl hover:bg-secondary transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-bold">
                                        {selectedConv.avatar}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">{selectedConv.patientName}</h3>
                                        <p className="text-xs text-muted-foreground">{selectedConv.patientId}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowPhoneCall(true)}
                                        className="p-2 rounded-xl hover:bg-secondary transition-colors"
                                    >
                                        <Phone className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                    <button
                                        onClick={() => setShowVideoCall(true)}
                                        className="p-2 rounded-xl hover:bg-secondary transition-colors"
                                    >
                                        <Video className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                    <button className="p-2 rounded-xl hover:bg-secondary transition-colors">
                                        <MoreVertical className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn(
                                            "flex gap-3",
                                            msg.sender === "clinician" ? "flex-row-reverse" : "flex-row"
                                        )}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xs font-bold shrink-0">
                                            {msg.sender === "clinician" ? "Y" : selectedConv.avatar}
                                        </div>
                                        <div
                                            className={cn(
                                                "max-w-[70%] rounded-2xl px-4 py-3",
                                                msg.sender === "clinician"
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-secondary text-foreground"
                                            )}
                                        >
                                            {msg.isAudio ? (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <button className="p-2 rounded-full bg-background/20 hover:bg-background/30 transition-colors">
                                                            <Volume2 className="w-4 h-4" />
                                                        </button>
                                                        <div className="flex-1 h-1 bg-background/20 rounded-full">
                                                            <div className="w-1/3 h-full bg-current rounded-full" />
                                                        </div>
                                                        <span className="text-xs opacity-70">0:15</span>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            setShowTranscript(showTranscript === msg.id ? null : msg.id)
                                                        }
                                                        className="text-xs opacity-70 hover:opacity-100 transition-opacity"
                                                    >
                                                        {showTranscript === msg.id ? "Hide" : "Show"} transcript
                                                    </button>
                                                    {showTranscript === msg.id && (
                                                        <p className="text-sm opacity-90 mt-2 pt-2 border-t border-current/20">
                                                            This is a sample transcript of the voice message...
                                                        </p>
                                                    )}
                                                </div>
                                            ) : msg.attachment ? (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-background/10">
                                                        <Paperclip className="w-4 h-4" />
                                                        <span className="text-sm truncate">{msg.attachment.name}</span>
                                                    </div>
                                                    <p className="text-sm">{msg.content}</p>
                                                </div>
                                            ) : (
                                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                            )}
                                            <p
                                                className={cn(
                                                    "text-xs mt-2 opacity-70",
                                                    msg.sender === "clinician" ? "text-right" : "text-left"
                                                )}
                                            >
                                                {msg.timestamp.toLocaleTimeString("en-US", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 border-t border-border/50 bg-card/30 shrink-0">
                                {selectedFile && (
                                    <div className="mb-3 flex items-center gap-2 p-2 rounded-xl bg-secondary">
                                        <Paperclip className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm text-foreground flex-1 truncate">{selectedFile.name}</span>
                                        <button
                                            onClick={() => setSelectedFile(null)}
                                            className="p-1 rounded-lg hover:bg-background transition-colors"
                                        >
                                            <X className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2 rounded-xl hover:bg-secondary transition-colors"
                                    >
                                        <Paperclip className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                    <Input
                                        ref={textInputRef}
                                        placeholder="Type a message..."
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                                        className="flex-1 bg-background/50 border-border/50"
                                    />
                                    <button
                                        onClick={() => textInputRef.current?.focus()}
                                        className="p-2 rounded-xl hover:bg-secondary transition-colors"
                                    >
                                        <Smile className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                    <button
                                        onClick={handleVoiceRecord}
                                        className={cn(
                                            "p-2 rounded-xl transition-all",
                                            isRecording
                                                ? "bg-red-500 text-white animate-pulse"
                                                : "hover:bg-secondary text-muted-foreground"
                                        )}
                                    >
                                        {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                    </button>
                                    <Button onClick={handleSendMessage} className="rounded-xl">
                                        <Send className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Phone Call Modal */}
            <AnimatePresence>
                {showPhoneCall && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowPhoneCall(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gradient-to-br from-primary to-accent p-8 rounded-3xl max-w-sm w-full text-center text-white"
                        >
                            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
                                {selectedConv?.avatar}
                            </div>
                            <h3 className="text-2xl font-bold mb-2">{selectedConv?.patientName}</h3>
                            <p className="text-white/80 mb-8">Calling...</p>
                            <button
                                onClick={() => setShowPhoneCall(false)}
                                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center mx-auto"
                            >
                                <PhoneOff className="w-8 h-8" />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Video Call Modal */}
            <AnimatePresence>
                {showVideoCall && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black z-50"
                        onClick={() => setShowVideoCall(false)}
                    >
                        <div className="relative w-full h-full flex items-center justify-center">
                            <div className="text-center text-white">
                                <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6 text-4xl font-bold">
                                    {selectedConv?.avatar}
                                </div>
                                <h3 className="text-3xl font-bold mb-2">{selectedConv?.patientName}</h3>
                                <p className="text-white/80 mb-12">Connecting...</p>
                            </div>
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
                                <button className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center">
                                    <Mic className="w-6 h-6 text-white" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setShowVideoCall(false)
                                    }}
                                    className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center"
                                >
                                    <PhoneOff className="w-8 h-8 text-white" />
                                </button>
                                <button className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center">
                                    <Video className="w-6 h-6 text-white" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
