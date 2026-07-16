"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, MoreVertical, MessageSquare, Paperclip, 
  Smile, Mic, Send, Check, CheckCheck, User, 
  Phone, Video, ArrowLeft, Camera, Save
} from 'lucide-react';

export default function WhatsAppClone() {
  const [currentUser, setCurrentUser] = useState('');
  const [password, setPassword] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  const [authError, setAuthError] = useState(''); // NEW: Track authentication errors
  const [isLogged, setIsLogged] = useState(false);
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newChatPrompt, setNewChatPrompt] = useState(false);
  
  // NEW: Menu, Emojis, and File States
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const attachmentRef = useRef(null);
  const emojis = ['😀','😂','🥺','😍','🙏','👍','🔥','❤️','🎉','✨','😭','😊','🥰','😎','🤔','🙌'];
  
  // NEW: Profile States
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState({ displayName: '', photo: '' });
  const [editName, setEditName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const fileInputRef = useRef(null);

  // NEW: Store contact profiles so we can see other users' photos
  const [contactProfiles, setContactProfiles] = useState({});
  const fetchingProfiles = useRef(new Set());

  const lastSyncRef = useRef(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages, activeChat]);

  // NEW: Fetch Profile Data on Login
  useEffect(() => {
    if (isLogged) {
      fetch(`/api/profile?username=${currentUser}`)
        .then(res => res.json())
        .then(data => {
          setUserProfile({
            displayName: data.display_name || currentUser,
            photo: data.profile_photo || ''
          });
          setEditName(data.display_name || currentUser);
        })
        .catch(err => console.error("Failed to load profile", err));
    }
  }, [isLogged, currentUser]);

  // NEW: Handle Photo Upload (Convert to Base64)
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setUserProfile(prev => ({ ...prev, photo: base64String }));
        saveProfile({ profile_photo: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  // NEW: Save Profile to API
  const saveProfile = async (dataToSave) => {
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser,
          ...dataToSave
        })
      });
    } catch (err) {
      console.error("Failed to save profile", err);
    }
  };

  // NEW: Handle Logout
  const handleLogout = () => {
    setIsLogged(false);
    setCurrentUser('');
    setPassword('');
    setMessages([]);
    setActiveChat(null);
    setShowMenu(false);
    setShowProfile(false);
    setContactProfiles({});
    lastSyncRef.current = 0; // FIX: Reset the sync timer so we fetch history on next login
  };

  // --- HTTP POLLING ENGINE ---
  useEffect(() => {
    if (!isLogged) return;
    let isMounted = true;

    const poll = async () => {
      try {
        const res = await fetch(`/api/sync?user=${currentUser}&after=${lastSyncRef.current}`);
        if (!isMounted || res.status === 204) return;

        const newMsgs = await res.json();
        if (newMsgs && newMsgs.length > 0) {
          const maxTimestamp = Math.max(...newMsgs.map(m => m.timestamp));
          lastSyncRef.current = maxTimestamp;
          
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const uniqueNew = newMsgs.filter(m => !existingIds.has(m.id));
            return [...prev, ...uniqueNew].sort((a, b) => a.timestamp - b.timestamp);
          });
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    };

    poll();
    const intervalId = setInterval(poll, 2000); // 2-second polling
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [isLogged, currentUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    const textToSend = inputText.trim();
    setInputText('');
    setShowEmojis(false); // Close emojis on send

    // Optimistic UI Update - Fixed Template Literal
    const optimisticMsg = {
      id: `temp_${Date.now()}`,
      sender: currentUser,
      receiver: activeChat,
      text: textToSend,
      type: 'text',
      media: null,
      timestamp: Date.now(),
      status: 'sending',
      pending: true
    };
    
    setMessages(prev => [...prev, optimisticMsg]);
    lastSyncRef.current = optimisticMsg.timestamp;

    // HTTP POST Request
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: currentUser,
          receiver: activeChat,
          text: textToSend,
          type: 'text',
          media: null
        })
      });
      
      const savedMsg = await res.json();
      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? savedMsg : m));
    } catch (error) {
      console.error("Failed to send", error);
    }
  };

  // NEW: Handle File Upload (Images and Docs)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat) return;
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      const fileType = file.type.startsWith('image/') ? 'image' : 'document';
      
      const optimisticMsg = {
        id: `temp_${Date.now()}`,
        sender: currentUser,
        receiver: activeChat,
        text: file.name,
        type: fileType,
        media: base64,
        timestamp: Date.now(),
        status: 'sending',
        pending: true
      };
      
      setMessages(prev => [...prev, optimisticMsg]);
      lastSyncRef.current = optimisticMsg.timestamp;

      try {
        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: currentUser,
            receiver: activeChat,
            text: file.name,
            type: fileType,
            media: base64
          })
        });
        const savedMsg = await res.json();
        setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? savedMsg : m));
      } catch (error) {
        console.error("Failed to upload file", error);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input so you can upload the same file again if needed
  };

  const conversations = React.useMemo(() => {
    const chatMap = new Map();
    messages.forEach(msg => {
      const contact = msg.sender === currentUser ? msg.receiver : msg.sender;
      const existing = chatMap.get(contact);
      if (!existing || msg.timestamp > existing.timestamp) {
        chatMap.set(contact, { ...msg });
      }
    });

    let chatList = Array.from(chatMap.entries()).map(([contact, msg]) => ({
      contact,
      lastMessage: msg.text,
      timestamp: msg.timestamp,
      isMyLast: msg.sender === currentUser,
      status: msg.status
    }));

    chatList.sort((a, b) => b.timestamp - a.timestamp);
    if (searchQuery) {
      chatList = chatList.filter(c => c.contact.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return chatList;
  }, [messages, currentUser, searchQuery]);

  const activeChatMessages = React.useMemo(() => {
    if (!activeChat) return [];
    return messages.filter(m => 
      (m.sender === currentUser && m.receiver === activeChat) ||
      (m.sender === activeChat && m.receiver === currentUser)
    );
  }, [messages, activeChat, currentUser]);

  // NEW: Dynamically fetch profiles of contacts in our conversations
  useEffect(() => {
    if (!isLogged) return;
    
    const fetchContactProfile = (contact) => {
      // If we already have it, or are currently fetching it, skip
      if (!contact || contactProfiles[contact] || fetchingProfiles.current.has(contact)) return;
      
      fetchingProfiles.current.add(contact);
      fetch(`/api/profile?username=${contact}`)
        .then(res => res.json())
        .then(data => {
          setContactProfiles(prev => ({
            ...prev,
            [contact]: {
              displayName: data.display_name || contact,
              photo: data.profile_photo || ''
            }
          }));
        })
        .catch(err => console.error(`Failed to fetch profile for ${contact}`, err));
    };

    // Fetch for all users in the chat list
    if (conversations) {
      conversations.forEach(c => fetchContactProfile(c.contact));
    }
    // Fetch for the active chat (in case we just searched them up)
    if (activeChat) fetchContactProfile(activeChat);
  }, [conversations, activeChat, isLogged]);

  if (!isLogged) {
    const handleAuth = async (e) => {
      e.preventDefault();
      setAuthError(''); // Clear previous errors
      
      const endpoint = authMode === 'signup' ? '/api/auth/register' : '/api/auth/login';
      const payload = authMode === 'signup' 
        ? { username: currentUser.trim(), password: password.trim(), contact: emailOrPhone.trim() }
        : { username: currentUser.trim(), password: password.trim() };

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
          setIsLogged(true);
        } else {
          setAuthError(data.error || 'Authentication failed');
        }
      } catch (err) {
        setAuthError('Network error. Please try again.');
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] font-sans p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="text-[#25D366] mb-4">
              <MessageSquare size={56} />
            </div>
            <h1 className="text-2xl font-medium text-[#111b21]">
              {authMode === 'signin' ? 'Sign in to WhatsApp' : 'Create an account'}
            </h1>
            <p className="text-[#667781] text-sm mt-2 text-center">
              {authMode === 'signin' 
                ? 'Enter your credentials to access your chats.' 
                : 'Join to start sending messages to your friends.'}
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#41525d] mb-1">Username</label>
              <input
                type="text"
                autoFocus
                placeholder="e.g. john_doe"
                className="w-full p-3 bg-[#f0f2f5] border border-transparent text-[#41525d] rounded-lg focus:outline-none focus:bg-white focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] transition-all"
                value={currentUser}
                onChange={e => setCurrentUser(e.target.value.toLowerCase())}
                required
              />
            </div>

            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-[#41525d] mb-1">Email or Phone Number</label>
                <input
                  type="text"
                  placeholder="name@example.com or +1234567890"
                  className="w-full p-3 bg-[#f0f2f5] border border-transparent text-[#41525d] rounded-lg focus:outline-none focus:bg-white focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] transition-all"
                  value={emailOrPhone}
                  onChange={e => setEmailOrPhone(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#41525d] mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full p-3 bg-[#f0f2f5] border border-transparent text-[#41525d] rounded-lg focus:outline-none focus:bg-white focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] transition-all"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#00a884] hover:bg-[#017561] text-white p-3 rounded-lg font-medium transition-colors mt-6 shadow-sm"
            >
              {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[#54656f]">
            {authMode === 'signin' ? (
              <p>
                Don't have an account?{' '}
                <button 
                  type="button"
                  onClick={() => { setAuthMode('signup'); setPassword(''); setEmailOrPhone(''); setAuthError(''); }} 
                  className="text-[#00a884] font-medium hover:underline focus:outline-none"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button 
                  type="button"
                  onClick={() => { setAuthMode('signin'); setPassword(''); setAuthError(''); }} 
                  className="text-[#00a884] font-medium hover:underline focus:outline-none"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#d1d7db] font-sans overflow-hidden">
      <div className="flex w-full h-full max-w-[1600px] mx-auto md:py-4 md:px-4 shadow-xl">
        <div className="flex w-full h-full bg-white md:rounded-lg overflow-hidden shadow-sm">
          
          {/* LEFT SIDEBAR */}
          <div className={`flex flex-col w-full md:w-[350px] lg:w-[400px] border-r border-[#e9edef] transition-all duration-300 ${activeChat ? 'hidden md:flex' : 'flex'} relative overflow-hidden`}>
            
            {/* NEW: PROFILE DRAWER (Overlays the sidebar) */}
            <div className={`absolute inset-0 bg-[#f0f2f5] z-50 flex flex-col transition-transform duration-300 ease-in-out ${showProfile ? 'translate-x-0' : '-translate-x-full'}`}>
              <div className="h-[108px] bg-[#008069] flex items-end pb-4 px-6 text-white gap-6 shrink-0 shadow-sm">
                <button onClick={() => setShowProfile(false)} className="hover:bg-black/10 p-1 rounded-full transition-colors">
                  <ArrowLeft size={24} />
                </button>
                <h1 className="text-[19px] font-medium">Profile</h1>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <div className="flex justify-center py-7">
                  <div className="relative group cursor-pointer w-48 h-48 rounded-full overflow-hidden bg-[#dfe5e7] flex items-center justify-center text-white" onClick={() => fileInputRef.current?.click()}>
                    {userProfile.photo ? (
                      <img src={userProfile.photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={80} className="text-[#a6b0b5]" />
                    )}
                    <div className="absolute inset-0 bg-black/50 hidden group-hover:flex flex-col items-center justify-center text-white text-sm text-center transition-all">
                      <Camera size={24} className="mb-2" />
                      <span className="w-24 leading-tight uppercase font-medium">Change Profile Photo</span>
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </div>

                <div className="bg-white px-7 py-3 mb-4 shadow-sm">
                  <p className="text-[#008069] text-[14px] mb-4">Your name</p>
                  <div className="flex justify-between items-center border-b border-[#008069] pb-2">
                    <input 
                      value={editName} 
                      onChange={e => setEditName(e.target.value)} 
                      className="w-full focus:outline-none text-[#111b21] bg-transparent" 
                    />
                    <button 
                      onClick={() => { 
                        saveProfile({ display_name: editName }); 
                        setUserProfile(prev => ({...prev, displayName: editName})); 
                      }}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <Save size={20} className="text-[#8696a0]" />
                    </button>
                  </div>
                  <p className="text-[#667781] text-[13px] mt-4">This is not your username or pin. This name will be visible to your WhatsApp contacts.</p>
                </div>

                <div className="bg-white px-7 py-3 shadow-sm">
                  <p className="text-[#008069] text-[14px] mb-4">Update Password</p>
                  <div className="flex justify-between items-center border-b border-[#e9edef] focus-within:border-[#008069] pb-2 transition-colors">
                    <input 
                      type="password" 
                      placeholder="Enter new password" 
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)} 
                      className="w-full focus:outline-none text-[#111b21] bg-transparent placeholder:text-[#8696a0]" 
                    />
                    <button 
                      onClick={() => { 
                        if(newPassword) { 
                          saveProfile({ password: newPassword }); 
                          setNewPassword(''); 
                          alert('Password updated successfully');
                        } 
                      }}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <Save size={20} className="text-[#8696a0]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-[60px] bg-[#f0f2f5] flex items-center justify-between px-4 flex-shrink-0">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowProfile(true)}>
                <div className="w-10 h-10 bg-[#dfe5e7] rounded-full flex items-center justify-center text-white overflow-hidden hover:opacity-80 transition-opacity">
                  {userProfile.photo ? (
                    <img src={userProfile.photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} className="text-[#a6b0b5]" />
                  )}
                </div>
                <span className="font-semibold text-[#111b21]">{userProfile.displayName || currentUser}</span>
              </div>
              <div className="flex items-center gap-3 text-[#54656f]">
                <button onClick={() => setNewChatPrompt(!newChatPrompt)} className="p-2 rounded-full hover:bg-[#d9d9d9] transition-colors">
                  <Search size={20} />
                </button>
                <div className="relative">
                  <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-full hover:bg-[#d9d9d9] transition-colors">
                    <MoreVertical size={20} />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 top-10 bg-white shadow-lg rounded-md py-2 w-40 z-50 border border-[#e9edef]">
                      <button onClick={() => { setShowMenu(false); setShowProfile(true); }} className="w-full text-left px-4 py-2 text-sm text-[#41525d] hover:bg-[#f5f6f6]">Profile</button>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-[#41525d] hover:bg-[#f5f6f6]">Log out</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {newChatPrompt && (
              <div className="bg-white p-3 border-b border-[#e9edef]">
                 <form onSubmit={(e) => { 
                    e.preventDefault(); 
                    const target = e.target.elements.contact.value.toLowerCase().trim();
                    if(target && target !== currentUser) {
                      setActiveChat(target);
                      setNewChatPrompt(false);
                    }
                 }} className="flex gap-2">
                    <input name="contact" placeholder="Enter username..." className="flex-1 bg-[#f0f2f5] text-[#41525d] px-3 py-2 rounded-lg text-sm focus:outline-none" autoFocus />
                    <button type="submit" className="bg-[#00a884] text-white px-4 py-2 rounded-lg text-sm font-medium">Chat</button>
                 </form>
              </div>
            )}

            <div className="p-2 border-b border-[#e9edef] bg-white">
              <div className="bg-[#f0f2f5] rounded-lg flex items-center px-3 h-9">
                <Search size={18} className="text-[#54656f]" />
                <input 
                  type="text" 
                  placeholder="Search or start new chat"
                  className="bg-transparent border-none focus:outline-none ml-4 text-sm w-full text-[#41525d] placeholder-[#54656f]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white">
              {conversations.length === 0 ? (
                <div className="text-center p-6 text-[#54656f] text-sm">
                  No conversations yet. Click the message icon to start a chat.
                </div>
              ) : (
                conversations.map((chat) => (
                  <div 
                    key={chat.contact}
                    onClick={() => setActiveChat(chat.contact)}
                    className={`flex items-center px-3 py-2.5 cursor-pointer hover:bg-[#f5f6f6] transition-colors ${activeChat === chat.contact ? 'bg-[#f0f2f5]' : ''}`}
                  >
                    <div className="w-12 h-12 bg-[#dfe5e7] rounded-full flex items-center justify-center text-white mr-3 flex-shrink-0 overflow-hidden">
                      {contactProfiles[chat.contact]?.photo ? (
                        <img src={contactProfiles[chat.contact].photo} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-semibold text-lg text-[#a6b0b5]">{chat.contact.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 border-b border-[#f2f2f2] pb-2 pt-1">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="font-normal text-base text-[#111b21] truncate">
                          {contactProfiles[chat.contact]?.displayName || chat.contact}
                        </span>
                        <span className="text-xs text-[#667781]">
                          {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-[#667781]">
                        {chat.isMyLast && (
                           <span className="mr-1">
                             {chat.status === 'sent' ? <Check size={14} className="text-[#8696a0]" /> : <CheckCheck size={14} className="text-[#53bdeb]" />}
                           </span>
                        )}
                        <span className="truncate">{chat.lastMessage}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT CHAT AREA */}
          <div className={`flex-col flex-1 bg-[#efeae2] relative ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
            {!activeChat ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#f0f2f5] border-l border-[#e9edef]">
                <h2 className="text-[32px] text-[#41525d] font-light mb-4">WhatsApp Web Clone</h2>
                <p className="text-sm text-[#667781] max-w-md">
                  Send and receive messages without keeping your phone online. <br/>
                  Built with Next.js, SQLite & REST Polling.
                </p>
              </div>
            ) : (
              <>
                <div className="h-[60px] bg-[#f0f2f5] flex items-center justify-between px-4 z-10 sticky top-0 border-l border-[#e9edef]">
                  <div className="flex items-center gap-3">
                    <button className="md:hidden text-[#54656f]" onClick={() => setActiveChat(null)}>
                      <ArrowLeft size={24} />
                    </button>
                    <div className="w-10 h-10 bg-[#dfe5e7] rounded-full flex items-center justify-center text-white overflow-hidden">
                      {contactProfiles[activeChat]?.photo ? (
                        <img src={contactProfiles[activeChat].photo} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-semibold text-[#a6b0b5]">{activeChat.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <h2 className="font-normal text-[#111b21]">
                        {contactProfiles[activeChat]?.displayName || activeChat}
                      </h2>
                    </div>
                  </div>
                </div>

                <div 
                  className="flex-1 overflow-y-auto p-4 md:px-[6%] lg:px-[9%] py-6 z-0" 
                  style={{
                    backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'repeat',
                    opacity: 0.8
                  }}
                >
                  {activeChatMessages.map((msg, i) => {
                    const isMe = msg.sender === currentUser;
                    const isFirstInGroup = i === 0 || activeChatMessages[i-1].sender !== msg.sender;

                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
                        <div className={`relative max-w-[85%] md:max-w-[70%] rounded-lg px-2.5 pt-1.5 pb-2 shadow-sm
                          ${isMe ? 'bg-[#d9fdd3]' : 'bg-white'}
                          ${isFirstInGroup && isMe ? 'rounded-tr-none' : ''}
                          ${isFirstInGroup && !isMe ? 'rounded-tl-none' : ''}
                          ${isFirstInGroup ? 'mt-2' : ''}
                        `}>
                          <div className="flex flex-col">
                            
                            {/* Render Attached Images */}
                            {msg.type === 'image' && msg.media && (
                              <img src={msg.media} alt="attachment" className="max-w-[250px] md:max-w-[300px] rounded-md mb-1 cursor-pointer object-cover" />
                            )}
                            
                            {/* Render Attached Documents */}
                            {msg.type === 'document' && msg.media && (
                               <div className="flex items-center bg-black/5 p-2 rounded-md mb-1 w-48 truncate">
                                 <Paperclip size={16} className="mr-2 flex-shrink-0 text-[#667781]" />
                                 <a href={msg.media} download={msg.text} className="text-[#008069] font-medium underline text-sm truncate">{msg.text}</a>
                               </div>
                            )}

                            {/* Render Standard Text */}
                            {(!msg.type || msg.type === 'text') && (
                              <span className="text-[14.2px] leading-[19px] text-[#111b21] whitespace-pre-wrap break-words pr-8">
                                {msg.text}
                              </span>
                            )}
                            
                            <div className="flex items-center justify-end gap-1 mt-[-10px] float-right self-end">
                               <span className="text-[10px] text-[#667781] pt-1">
                                 {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </span>
                               {isMe && (
                                 <span className="pt-1">
                                   {msg.status === 'sent' && <Check size={13} className="text-[#667781]" />}
                                   {msg.status === 'delivered' && <CheckCheck size={13} className="text-[#53bdeb]" />}
                                 </span>
                               )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="min-h-[62px] bg-[#f0f2f5] px-4 py-2 flex items-end gap-3 z-10 border-l border-[#e9edef] relative">
                  
                  {/* NEW: Emoji Picker Popover */}
                  {showEmojis && (
                    <div className="absolute bottom-[70px] left-4 bg-white shadow-xl rounded-lg p-3 w-[280px] border border-[#e9edef] grid grid-cols-6 gap-2 z-50">
                      {emojis.map(e => (
                        <button key={e} type="button" className="text-xl hover:bg-gray-100 rounded p-1 transition-colors" onClick={() => {
                          setInputText(prev => prev + e);
                        }}>
                          {e}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-[#54656f] pb-2">
                    <button type="button" onClick={() => setShowEmojis(!showEmojis)}>
                      <Smile size={24} className="cursor-pointer hover:text-[#41525d] transition-colors" />
                    </button>
                    <button type="button" onClick={() => attachmentRef.current?.click()}>
                      <Paperclip size={24} className="cursor-pointer hover:text-[#41525d] transition-colors" />
                    </button>
                    {/* Hidden File Input */}
                    <input type="file" ref={attachmentRef} onChange={handleFileUpload} className="hidden" />
                  </div>
                  
                  <form onSubmit={handleSendMessage} className="flex-1 flex items-end bg-white rounded-lg overflow-hidden border border-transparent">
                    <textarea 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder="Type a message"
                      className="w-full max-h-32 px-4 py-2.5 bg-transparent resize-none focus:outline-none text-[#41525d] text-sm md:text-base leading-snug"
                      rows={1}
                    />
                  </form>
                  <div className="text-[#54656f] pb-1.5 flex-shrink-0">
                    <button onClick={handleSendMessage} className="p-2 rounded-full hover:bg-[#d9d9d9] transition-colors text-[#54656f]">
                      <Send size={24} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}