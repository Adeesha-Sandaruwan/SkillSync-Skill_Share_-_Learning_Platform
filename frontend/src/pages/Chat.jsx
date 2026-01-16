import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/useAuth';
import api from '../services/api';
import Navbar from '../components/Navbar';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import EmojiPicker from 'emoji-picker-react';
import { format } from 'date-fns';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

const Chat = () => {
    const { user } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [uploading, setUploading] = useState(false);

    // UI States
    const [contextMenu, setContextMenu] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const clientRef = useRef(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // --- SOCKET & DATA ---
    useEffect(() => {
        if (user) {
            api.get(`/users/${user.id}/following`).then(res => setContacts(res.data)).catch(console.error);
        }
    }, [user]);

    useEffect(() => {
        if (!user || clientRef.current) return;
        const socket = new SockJS('http://localhost:8080/ws');
        const client = Stomp.over(socket);
        client.debug = null;

        client.connect({}, () => {
            setIsConnected(true);
            clientRef.current = client;

            // 1. Listen for Messages
            client.subscribe(`/user/${user.id}/queue/messages`, (payload) => {
                const received = JSON.parse(payload.body);
                setMessages(prev => {
                    const existsIndex = prev.findIndex(m => m.id === received.id);
                    if (existsIndex !== -1) {
                        const updated = [...prev];
                        updated[existsIndex] = received;
                        return updated;
                    }
                    return [...prev, received];
                });
                scrollToBottom();
            });

            // 2. Listen for Read Receipts
            client.subscribe(`/user/${user.id}/queue/read-receipt`, (payload) => {
                const readerId = parseInt(payload.body);
                if (activeChat?.id === readerId) {
                    setMessages(prev => prev.map(m =>
                        (m.senderId === user.id) ? { ...m, status: 'READ', isRead: true } : m
                    ));
                }
            });

        }, console.error);

        return () => {
            if (clientRef.current) clientRef.current.disconnect();
            clientRef.current = null;
        };
    }, [user, activeChat]);

    // --- ACTIONS ---
    const loadChat = async (contact) => {
        setActiveChat(contact);
        try {
            const res = await api.get(`/messages/${user.id}/${contact.id}`);
            setMessages(res.data);
            scrollToBottom();

            // Mark as Read Logic
            if (clientRef.current && isConnected) {
                clientRef.current.send("/app/chat.read", {}, JSON.stringify({
                    senderId: contact.id,
                    recipientId: user.id
                }));
            }
            // 🔥 FIRE EVENT TO UPDATE NAVBAR BADGE 🔥
            window.dispatchEvent(new Event('messages-read'));

        } catch (error) {
            console.error(error);
        }
    };

    const sendMessage = () => {
        if (!newMessage.trim() || !clientRef.current || !activeChat) return;

        if (editingMessage) {
            clientRef.current.send("/app/chat.edit", {}, JSON.stringify({
                id: editingMessage.id,
                content: newMessage
            }));
            setEditingMessage(null);
        } else {
            const chatMessage = {
                senderId: user.id,
                recipientId: activeChat.id,
                content: newMessage,
                type: 'TEXT',
                timestamp: new Date()
            };
            clientRef.current.send("/app/chat", {}, JSON.stringify(chatMessage));
        }
        setNewMessage("");
        setShowEmoji(false);
    };

    const handleDelete = (msgId) => {
        if (!clientRef.current) return;
        clientRef.current.send("/app/chat.delete", {}, JSON.stringify({ id: msgId }));
        setContextMenu(null);
    };

    const handleEditStart = (msg) => {
        setEditingMessage(msg);
        setNewMessage(msg.content);
        setContextMenu(null);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await api.post('/chat/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            const chatMessage = {
                senderId: user.id,
                recipientId: activeChat.id,
                content: res.data,
                type: 'IMAGE',
                timestamp: new Date()
            };
            clientRef.current.send("/app/chat", {}, JSON.stringify(chatMessage));
        } catch (error) {
            alert("Upload failed");
        } finally {
            setUploading(false);
            if(fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // --- UI HELPERS ---
    const scrollToBottom = () => setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    const handleContextMenu = (e, msg) => {
        e.preventDefault();
        if (msg.senderId !== user.id || msg.isDeleted) return;

        let x = e.clientX;
        let y = e.clientY;
        if (x + 150 > window.innerWidth) x -= 150;

        setContextMenu({ x, y, message: msg });
    };

    useEffect(() => {
        const closeMenu = () => setContextMenu(null);
        document.addEventListener("click", closeMenu);
        return () => document.removeEventListener("click", closeMenu);
    }, []);

    const images = messages
        .filter(m => m.type === 'IMAGE' && !m.isDeleted)
        .map(m => ({ src: m.content }));

    const formatLastSeen = (dateString) => {
        if(!dateString) return "Offline";
        const date = new Date(dateString);
        return "Last seen " + format(date, 'h:mm a');
    };

    const onEmojiClick = (emojiData) => {
        setNewMessage(prev => prev + emojiData.emoji);
    };

    return (
        <div className="h-screen bg-[#F0F2F5] flex flex-col">
            <Navbar />

            <div className="flex-1 max-w-7xl mx-auto w-full p-0 md:p-4 flex gap-4 h-[calc(100vh-64px)] relative">

                {/* CONTACTS SIDEBAR */}
                <div className={`w-full md:w-1/3 lg:w-1/4 bg-white md:rounded-2xl shadow-sm border-r md:border border-slate-200 overflow-hidden flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-slate-100 bg-white z-10 flex justify-between items-center">
                        <h2 className="font-bold text-slate-800 text-xl">Chats</h2>
                        <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {contacts.map(contact => (
                            <div key={contact.id} onClick={() => loadChat(contact)} className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 border-b border-slate-50 ${activeChat?.id === contact.id ? 'bg-indigo-50' : ''}`}>
                                <div className="relative">
                                    <img src={contact.avatarUrl || `https://ui-avatars.com/api/?name=${contact.username}`} className="w-12 h-12 rounded-full object-cover border" />
                                    {contact.online && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-slate-700 text-sm truncate">{contact.username}</h3>
                                    <p className="text-xs text-slate-400">{contact.online ? 'Online' : 'Offline'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CHAT AREA */}
                <div className={`w-full md:w-2/3 lg:w-3/4 bg-white md:rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden relative ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
                    {activeChat ? (
                        <>
                            {/* HEADER */}
                            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-4 bg-white z-20 shadow-sm">
                                <button onClick={() => setActiveChat(null)} className="md:hidden p-2 -ml-2 text-slate-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <img src={activeChat.avatarUrl} className="w-10 h-10 rounded-full object-cover" />
                                <div>
                                    <h3 className="font-bold text-slate-800">{activeChat.username}</h3>
                                    <span className="text-xs text-slate-500">{activeChat.online ? 'Active now' : formatLastSeen(activeChat.lastSeen)}</span>
                                </div>
                            </div>

                            {/* MESSAGES */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#efeae2] bg-opacity-30" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                                {messages.map((msg, index) => {
                                    const isMe = msg.senderId === user.id;
                                    const isSystem = msg.isDeleted || msg.type === 'SYSTEM';

                                    return (
                                        <div
                                            key={index}
                                            className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
                                            onContextMenu={(e) => handleContextMenu(e, msg)}
                                        >
                                            <div className={`relative max-w-[80%] md:max-w-[60%] px-4 py-2 shadow-sm rounded-2xl ${
                                                isSystem ? 'bg-gray-100 text-gray-500 border border-gray-200 italic text-center text-xs py-1 px-3 rounded-full mx-auto mb-2' :
                                                    isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white text-slate-800 rounded-tl-sm'
                                            }`}>

                                                {/* Content */}
                                                {msg.isDeleted ? (
                                                    <span>🚫 This message was deleted</span>
                                                ) : msg.type === 'IMAGE' ? (
                                                    <img
                                                        src={msg.content}
                                                        className="rounded-lg max-h-64 w-full object-cover cursor-pointer hover:opacity-95"
                                                        onClick={() => {
                                                            const imgIndex = images.findIndex(i => i.src === msg.content);
                                                            setLightboxIndex(imgIndex);
                                                            setLightboxOpen(true);
                                                        }}
                                                    />
                                                ) : (
                                                    <p className="text-[15px] whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                                )}

                                                {/* Meta */}
                                                {!isSystem && (
                                                    <div className={`text-[9px] mt-1 flex justify-end items-center gap-1 opacity-70`}>
                                                        {msg.isEdited && <span>(edited)</span>}
                                                        <span>{msg.timestamp ? format(new Date(msg.timestamp), 'h:mm a') : '...'}</span>

                                                        {/* Read Status (Ticks) */}
                                                        {isMe && (
                                                            <span className="text-[14px] font-bold ml-1">
                                                                {(msg.status === 'READ' || msg.isRead) ?
                                                                    <span className="text-blue-300">✓✓</span> :
                                                                    msg.status === 'DELIVERED' ? '✓✓' : '✓'}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* INPUT */}
                            <div className="p-3 bg-white border-t border-slate-100 flex items-end gap-2 relative">
                                {editingMessage && (
                                    <div className="absolute -top-10 left-0 right-0 bg-indigo-50 px-4 py-2 text-xs flex justify-between items-center text-indigo-700 border-t border-indigo-100">
                                        <span>Editing message...</span>
                                        <button onClick={() => { setEditingMessage(null); setNewMessage(""); }} className="font-bold hover:underline">Cancel</button>
                                    </div>
                                )}

                                {showEmoji && (
                                    <div className="absolute bottom-20 left-4 z-50 shadow-2xl rounded-2xl">
                                        <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
                                    </div>
                                )}

                                <div className="flex gap-1 mb-1">
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                                    <button onClick={() => fileInputRef.current.click()} className="p-3 text-slate-400 hover:text-indigo-600 rounded-full transition-all active:scale-95">📎</button>
                                    <button onClick={() => setShowEmoji(!showEmoji)} className="p-3 text-slate-400 hover:text-yellow-500 rounded-full transition-all active:scale-95">☺</button>
                                </div>

                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
                                    placeholder={editingMessage ? "Edit message..." : "Type a message..."}
                                    className="flex-1 bg-slate-100 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none max-h-32"
                                    rows="1"
                                />
                                <button onClick={sendMessage} disabled={!newMessage.trim() && !uploading} className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                                    {editingMessage ? '✓' : '➤'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                            <div className="text-6xl mb-4">💬</div>
                            <p>Select a contact to start messaging</p>
                        </div>
                    )}
                </div>

                {/* CONTEXT MENU */}
                {contextMenu && (
                    <div
                        className="fixed bg-white shadow-xl rounded-lg border border-slate-100 py-1 z-50 min-w-[150px] animate-in fade-in zoom-in-95 duration-100"
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                    >
                        <button onClick={() => handleEditStart(contextMenu.message)} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                            ✏️ Edit
                        </button>
                        <button onClick={() => handleDelete(contextMenu.message.id)} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                            🗑️ Delete
                        </button>
                    </div>
                )}

                {/* LIGHTBOX */}
                <Lightbox
                    open={lightboxOpen}
                    close={() => setLightboxOpen(false)}
                    index={lightboxIndex}
                    slides={images}
                />
            </div>
        </div>
    );
};

export default Chat;