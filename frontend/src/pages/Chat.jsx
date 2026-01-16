import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/useAuth';
import api from '../services/api';
import Navbar from '../components/Navbar';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import EmojiPicker from 'emoji-picker-react';
import { format } from 'date-fns';

const Chat = () => {
    const { user } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [uploading, setUploading] = useState(false);

    const clientRef = useRef(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const emojiContainerRef = useRef(null);

    // 1. Load Contacts
    useEffect(() => {
        if (user) {
            api.get(`/users/${user.id}/following`)
                .then(res => setContacts(res.data))
                .catch(err => console.error("Failed to load contacts", err));
        }
    }, [user]);

    // 2. WebSocket Connection
    useEffect(() => {
        if (!user || clientRef.current) return;

        const socket = new SockJS('http://localhost:8080/ws');
        const client = Stomp.over(socket);
        client.debug = null;

        client.connect({}, () => {
            setIsConnected(true);
            clientRef.current = client;

            client.subscribe(`/user/${user.id}/queue/messages`, (payload) => {
                const receivedMessage = JSON.parse(payload.body);
                // The server echoes the message back. We ONLY add it here.
                setMessages(prev => {
                    // Prevent duplicate if server sends retry
                    if (prev.some(m => m.id === receivedMessage.id)) return prev;
                    return [...prev, receivedMessage];
                });
                scrollToBottom();
            });
        }, (err) => console.error("Socket error", err));

        return () => {
            if (clientRef.current) clientRef.current.disconnect();
            clientRef.current = null;
        };
    }, [user]);

    // Close Emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiContainerRef.current && !emojiContainerRef.current.contains(event.target)) {
                setShowEmoji(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    const loadChat = async (contact) => {
        setActiveChat(contact);
        try {
            const res = await api.get(`/messages/${user.id}/${contact.id}`);
            setMessages(res.data);
            scrollToBottom();
        } catch (error) {
            console.error(error);
        }
    };

    const sendMessage = (content, type = 'TEXT') => {
        if (!content || !clientRef.current || !activeChat) return;

        const chatMessage = {
            senderId: user.id,
            recipientId: activeChat.id,
            content: content,
            type: type,
            timestamp: new Date() // Server will overwrite, but good for local logic if needed
        };

        clientRef.current.send("/app/chat", {}, JSON.stringify(chatMessage));

        // FIXED: Do NOT manually add the message to state here.
        // We wait for the WebSocket subscription to receive the echo.

        setNewMessage("");
        setShowEmoji(false);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await api.post('/api/chat/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Send the URL as an IMAGE message
            sendMessage(res.data, 'IMAGE');
        } catch (error) {
            console.error("Upload Error:", error);
            alert("Failed to upload image. Check console for details.");
        } finally {
            setUploading(false);
            // Clear input so same file can be selected again
            if(fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const formatLastSeen = (dateString) => {
        if(!dateString) return "Offline";
        const date = new Date(dateString);
        return "Last seen " + format(date, 'h:mm a');
    };

    const onEmojiClick = (emojiData) => {
        setNewMessage(prev => prev + emojiData.emoji);
    };

    // --- ICONS ---
    const PaperclipIcon = () => (
        <svg className="w-6 h-6 transform rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
    );

    const EmojiIcon = () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    );

    const SendIcon = () => (
        <svg className="w-5 h-5 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
    );

    return (
        <div className="h-screen bg-[#F0F2F5] flex flex-col">
            <Navbar />

            <div className="flex-1 max-w-7xl mx-auto w-full p-2 md:p-4 flex gap-4 h-[calc(100vh-64px)]">

                {/* --- CONTACTS SIDEBAR --- */}
                <div className={`w-full md:w-1/3 lg:w-1/4 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-slate-100 bg-white z-10">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="font-bold text-slate-800 text-xl">Chats</h2>
                            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} title={isConnected ? "Server Connected" : "Disconnected"}></span>
                        </div>
                        <input type="text" placeholder="Search chats..." className="w-full bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-700 placeholder:text-slate-400" />
                    </div>

                    <div className="overflow-y-auto flex-1">
                        {contacts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
                                <div className="text-4xl mb-3 opacity-50">👥</div>
                                <p className="text-sm">You haven't followed anyone yet.</p>
                            </div>
                        ) : (
                            contacts.map(contact => (
                                <div key={contact.id} onClick={() => loadChat(contact)} className={`p-4 flex items-center gap-3 cursor-pointer transition-all duration-200 border-l-4 ${activeChat?.id === contact.id ? 'bg-indigo-50 border-indigo-600' : 'bg-white border-transparent hover:bg-slate-50'}`}>
                                    <div className="relative">
                                        <img src={contact.avatarUrl || `https://ui-avatars.com/api/?name=${contact.username}`} className="w-12 h-12 rounded-full object-cover border border-slate-100" alt={contact.username} />
                                        {contact.online && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h3 className={`text-sm font-bold truncate ${activeChat?.id === contact.id ? 'text-indigo-900' : 'text-slate-700'}`}>{contact.username}</h3>
                                            <span className="text-[10px] text-slate-400">{contact.online ? 'Now' : ''}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 truncate">
                                            {contact.online ? <span className="text-green-600 font-medium">Online</span> : formatLastSeen(contact.lastSeen)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* --- CHAT AREA --- */}
                <div className={`w-full md:w-2/3 lg:w-3/4 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden relative ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
                    {activeChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-4 bg-white z-20 shadow-sm">
                                <button onClick={() => setActiveChat(null)} className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600 active:scale-95 transition-transform">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <div className="relative">
                                    <img src={activeChat.avatarUrl || `https://ui-avatars.com/api/?name=${activeChat.username}`} className="w-10 h-10 rounded-full object-cover border border-slate-100" alt="Active" />
                                    {activeChat.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></span>}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-base">{activeChat.username}</h3>
                                    <span className={`text-xs font-medium flex items-center gap-1 ${activeChat.online ? 'text-green-600' : 'text-slate-400'}`}>
                                        {activeChat.online ? (
                                            <><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span> Active now</>
                                        ) : formatLastSeen(activeChat.lastSeen)}
                                    </span>
                                </div>
                            </div>

                            {/* Messages Stream */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#efeae2] bg-opacity-30 relative" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                                {messages.length === 0 && (
                                    <div className="flex flex-col items-center justify-center mt-20 opacity-60">
                                        <img src={activeChat.avatarUrl} className="w-20 h-20 rounded-full mb-4 grayscale" />
                                        <p className="text-slate-500 text-sm">Start a conversation with {activeChat.username}</p>
                                    </div>
                                )}

                                {messages.map((msg, index) => {
                                    const isMe = msg.senderId === user.id;
                                    return (
                                        <div key={index} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                            <div className={`relative max-w-[75%] md:max-w-[60%] px-4 py-2 shadow-sm ${
                                                isMe
                                                    ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm'
                                                    : 'bg-white text-slate-800 border border-slate-100 rounded-2xl rounded-tl-sm'
                                            }`}>
                                                {msg.type === 'IMAGE' ? (
                                                    <div className="mb-1">
                                                        <img src={msg.content} alt="Sent" className="rounded-lg max-h-64 object-cover w-full cursor-pointer hover:opacity-95 transition-opacity" onClick={() => window.open(msg.content, '_blank')} />
                                                    </div>
                                                ) : (
                                                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                                )}

                                                <div className={`text-[10px] mt-1 text-right font-medium ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                                                    {msg.timestamp ? format(new Date(msg.timestamp), 'h:mm a') : 'Sending...'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-3 bg-white border-t border-slate-100 flex items-end gap-2 relative">

                                {/* Emoji Picker Popover */}
                                {showEmoji && (
                                    <div ref={emojiContainerRef} className="absolute bottom-20 left-4 z-50 shadow-2xl rounded-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
                                        <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} searchDisabled={false} skinTonesDisabled />
                                    </div>
                                )}

                                <div className="flex gap-1 mb-1">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current.click()}
                                        className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all active:scale-95"
                                        title="Attach Image"
                                    >
                                        <PaperclipIcon />
                                    </button>
                                    <button
                                        onClick={() => setShowEmoji(!showEmoji)}
                                        className={`p-3 rounded-full transition-all active:scale-95 ${showEmoji ? 'text-yellow-500 bg-yellow-50' : 'text-slate-400 hover:text-yellow-500 hover:bg-yellow-50'}`}
                                        title="Add Emoji"
                                    >
                                        <EmojiIcon />
                                    </button>
                                </div>

                                <div className="flex-1 bg-slate-100 rounded-2xl flex items-center border border-transparent focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if(e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                sendMessage(newMessage, 'TEXT');
                                            }
                                        }}
                                        placeholder="Type a message..."
                                        className="w-full bg-transparent border-none px-4 py-3 text-sm focus:ring-0 outline-none resize-none max-h-32 text-slate-700 placeholder:text-slate-400"
                                        rows="1"
                                        style={{ minHeight: '44px' }}
                                    />
                                </div>

                                <button
                                    onClick={(e) => { e.preventDefault(); sendMessage(newMessage, 'TEXT'); }}
                                    disabled={!newMessage.trim() && !uploading}
                                    className={`p-3 rounded-full mb-1 shadow-lg transition-all duration-200 active:scale-95 flex items-center justify-center
                                        ${(!newMessage.trim() && !uploading)
                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/30'
                                    }`}
                                >
                                    {uploading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <SendIcon />
                                    )}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-300 bg-slate-50/50">
                            <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <div className="text-6xl text-indigo-200">💬</div>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-700 mb-2">Welcome to SkillSync Chat</h3>
                            <p className="text-slate-500 max-w-sm text-center leading-relaxed">
                                Select a contact from the sidebar to start a real-time conversation.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;