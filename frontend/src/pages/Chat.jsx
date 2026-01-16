import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/useAuth';
import api from '../services/api';
import Navbar from '../components/Navbar';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const Chat = () => {
    const { user } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isConnected, setIsConnected] = useState(false);

    // Use useRef for the client to prevent re-render loops & crash on cleanup
    const clientRef = useRef(null);
    const messagesEndRef = useRef(null);

    // 1. Load Contacts
    useEffect(() => {
        if (user) {
            api.get(`/users/${user.id}/following`)
                .then(res => setContacts(res.data))
                .catch(err => console.error("Failed to load contacts", err));
        }
    }, [user]);

    // 2. Connect to WebSocket (Fixed Logic)
    useEffect(() => {
        if (!user) return;

        // Prevent creating multiple connections
        if (clientRef.current) return;

        const socket = new SockJS('http://localhost:8080/ws');
        const client = Stomp.over(socket);
        client.debug = null; // Disable debug logs for cleaner console

        client.connect({}, () => {
            setIsConnected(true);
            clientRef.current = client; // Store connected client in Ref

            // Subscribe to my personal queue
            client.subscribe(`/user/${user.id}/queue/messages`, (payload) => {
                const receivedMessage = JSON.parse(payload.body);
                setMessages(prev => [...prev, receivedMessage]);
                scrollToBottom();
            });
        }, (error) => {
            console.error("WebSocket Error:", error);
            setIsConnected(false);
        });

        // Cleanup on Unmount
        return () => {
            if (clientRef.current && clientRef.current.connected) {
                try {
                    clientRef.current.disconnect();
                } catch (e) {
                    console.warn("Failed to disconnect cleanly", e);
                }
            }
            clientRef.current = null;
            setIsConnected(false);
        };
    }, [user]);

    // 3. Scroll to bottom
    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    // 4. Load Chat History
    const loadChat = async (contact) => {
        setActiveChat(contact);
        try {
            const res = await api.get(`/messages/${user.id}/${contact.id}`);
            setMessages(res.data);
            scrollToBottom();
        } catch (error) {
            console.error("Failed to load messages", error);
        }
    };

    // 5. Send Message (Using Ref)
    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !clientRef.current || !activeChat) return;

        const chatMessage = {
            senderId: user.id,
            recipientId: activeChat.id,
            content: newMessage,
            timestamp: new Date()
        };

        try {
            clientRef.current.send("/app/chat", {}, JSON.stringify(chatMessage));
            // Optimistic UI update
            setMessages(prev => [...prev, chatMessage]);
            setNewMessage("");
            scrollToBottom();
        } catch (error) {
            console.error("Failed to send message", error);
            alert("Connection lost. Please refresh.");
        }
    };

    return (
        <div className="h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <div className="flex-1 max-w-7xl mx-auto w-full p-4 flex gap-4 h-[calc(100vh-64px)]">

                {/* --- SIDEBAR (Contacts) --- */}
                <div className={`w-full md:w-1/3 lg:w-1/4 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h2 className="font-bold text-slate-800 text-lg">Messages</h2>
                        <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? "Online" : "Offline"}></span>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {contacts.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-sm text-slate-400 mb-2">No contacts found.</p>
                                <p className="text-xs text-indigo-500 font-bold">Follow people to chat!</p>
                            </div>
                        ) : (
                            contacts.map(contact => (
                                <div
                                    key={contact.id}
                                    onClick={() => loadChat(contact)}
                                    className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${activeChat?.id === contact.id ? 'bg-indigo-50 border-r-4 border-indigo-500' : ''}`}
                                >
                                    <div className="relative">
                                        <img src={contact.avatarUrl || `https://ui-avatars.com/api/?name=${contact.username}`} className="w-10 h-10 rounded-full object-cover" alt={contact.username} />
                                        {/* Status Indicator (Mocked as online for now) */}
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-700 text-sm">{contact.username}</h3>
                                        <p className="text-xs text-slate-400">Tap to chat</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* --- CHAT AREA --- */}
                <div className={`w-full md:w-2/3 lg:w-3/4 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
                    {activeChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-white z-10 shadow-sm">
                                <button onClick={() => setActiveChat(null)} className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600">
                                    ←
                                </button>
                                <img src={activeChat.avatarUrl || `https://ui-avatars.com/api/?name=${activeChat.username}`} className="w-10 h-10 rounded-full object-cover" alt="Chat" />
                                <div>
                                    <h3 className="font-bold text-slate-800">{activeChat.username}</h3>
                                    <span className="text-xs text-green-500 font-medium">● Online</span>
                                </div>
                            </div>

                            {/* Messages List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                                {messages.length === 0 && (
                                    <div className="text-center py-10 text-slate-400 text-sm">
                                        Say "Hello" to start the conversation! 👋
                                    </div>
                                )}
                                {messages.map((msg, index) => {
                                    const isMe = msg.senderId === user.id;
                                    return (
                                        <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                                                isMe
                                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                                    : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                                            }`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <form onSubmit={sendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || !isConnected}
                                    className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <svg className="w-5 h-5 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-5xl shadow-inner">💬</div>
                            <h3 className="text-xl font-bold text-slate-400 mb-2">Your Messages</h3>
                            <p className="font-medium text-slate-400 text-sm">Select a contact to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;