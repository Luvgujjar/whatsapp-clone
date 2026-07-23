"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, MoreVertical, MessageSquare, Paperclip, 
  Smile, Mic, Send, Check, CheckCheck, User, 
  Phone, Video, ArrowLeft, Camera, Save, Trash2,
  Plus, Shield, ShieldAlert, UserMinus, UserPlus, LogOut,
  CircleDashed, X, Settings, Eye, ChevronUp, ChevronDown,
  Moon, Sun, Image as ImageIcon, CornerUpLeft
} from 'lucide-react';

export default function WhatsAppClone() {
  const [currentUser, setCurrentUser] = useState('');
  const [password, setPassword] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [authMode, setAuthMode] = useState('signin');
  const [authError, setAuthError] = useState('');
  const [isLogged, setIsLogged] = useState(false);
  
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [wallpapers, setWallpapers] = useState({});
  const customWallpaperRef = useRef(null);

  const [replyingTo, setReplyingTo] = useState(null);
  const [typists, setTypists] = useState([]);
  const lastTypingPing = useRef(0);

  const [activeTab, setActiveTab] = useState('chats');
  const [statuses, setStatuses] = useState([]);
  const [viewingStatusUser, setViewingStatusUser] = useState(null);
  const [viewingStatusIndex, setViewingStatusIndex] = useState(0);
  const [statusProgress, setStatusProgress] = useState(0);
  const statusUploadRef = useRef(null);
  
  const [isUploadingStatus, setIsUploadingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');

  const [showStatusPrivacy, setShowStatusPrivacy] = useState(false);
  const [hiddenUsers, setHiddenUsers] = useState([]);
  const [statusViewers, setStatusViewers] = useState([]);
  const [showViewersList, setShowViewersList] = useState(false);

  const [newChatPrompt, setNewChatPrompt] = useState(false);
  const [newChatError, setNewChatError] = useState('');
  const [newChatTargets, setNewChatTargets] = useState('');
  const [groupSubject, setGroupSubject] = useState('');
  
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const attachmentRef = useRef(null);
  const emojis = ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🥸','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔','🫣','🤭','🫢','🤫','🤥','😶','🫠','😐','🫤','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕','🤑','🤠','😈','👿','👹','👺','💀','☠️','👻','👽','🤖','💩','🔥','✨','⭐','🌟','💯','❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','👍','👎','👏','🙌','👌','✌️','🤞','🤟','🤘','👋','🤝','🙏','💪','👀','🎉','🎊','🎁','🏆','🥇','🚀','🌈','⚡','☀️','🌙','⭐','🍕','🍔','🍟','🍎','🍉','🍇','🍓','☕','🍺','⚽','🏀','🎮','🎧','📱','💻','⌚','📷','🎥','🚗','✈️','🚆','🏠','🌍'];
  
  const [showProfile, setShowProfile] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false); 
  const [userProfile, setUserProfile] = useState({ displayName: '', photo: '' });
  const [editName, setEditName] = useState('');
  const fileInputRef = useRef(null);
  
  const [editGroupName, setEditGroupName] = useState('');
  const groupPhotoRef = useRef(null);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [newParticipant, setNewParticipant] = useState('');

  const [contactProfiles, setContactProfiles] = useState({});
  const fetchingProfiles = useRef(new Set());

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const isCancelledRef = useRef(false);

  const lastSyncRef = useRef(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedDark = localStorage.getItem('whatsapp_dark') === 'true';
    setIsDarkMode(savedDark);
    if (savedDark) document.documentElement.classList.add('dark');
    
    const savedWallpapers = JSON.parse(localStorage.getItem('whatsapp_wallpapers') || '{}');
    setWallpapers(savedWallpapers);
  }, []);

  const toggleDarkMode = () => {
    const newDark = !isDarkMode;
    setIsDarkMode(newDark);
    localStorage.setItem('whatsapp_dark', newDark);
    if (newDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleCustomWallpaperUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      const newWallpapers = { ...wallpapers, [activeChat]: base64 };
      setWallpapers(newWallpapers);
      localStorage.setItem('whatsapp_wallpapers', JSON.stringify(newWallpapers));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages, activeChat]);

  const groupedStatuses = React.useMemo(() => {
    const map = {};
    statuses.forEach(s => {
      if (!map[s.username]) map[s.username] = [];
      map[s.username].push(s);
    });
    return map;
  }, [statuses]);

  useEffect(() => {
    if (!viewingStatusUser) {
      setShowViewersList(false);
      return;
    }
    
    const userStatuses = groupedStatuses[viewingStatusUser] || [];
    const currentStatus = userStatuses[viewingStatusIndex];
    
    if (!currentStatus) return;

    if (viewingStatusUser !== currentUser) {
       fetch('/api/statuses/views', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ statusId: currentStatus.id, viewer: currentUser })
       }).catch(()=>{});
    } else {
       fetch(`/api/statuses/views?statusId=${currentStatus.id}&_t=${Date.now()}`, { cache: 'no-store' })
         .then(r => r.ok ? r.json() : [])
         .then(data => setStatusViewers(data || []))
         .catch(()=>{});
    }

    if (showViewersList) return;

    const timer = setInterval(() => {
      setStatusProgress(prev => {
        if (prev >= 100) {
           if (viewingStatusIndex < userStatuses.length - 1) {
             setViewingStatusIndex(idx => idx + 1);
             return 0; 
           } else {
             setViewingStatusUser(null); 
             return 0;
           }
        }
        return prev + 2; 
      });
    }, 100);
    
    return () => clearInterval(timer);
  }, [viewingStatusUser, viewingStatusIndex, statuses, showViewersList, groupedStatuses, currentUser]);

  const handlePrevStatus = () => {
    if (viewingStatusIndex > 0) {
      setViewingStatusIndex(idx => idx - 1);
      setStatusProgress(0);
    } else {
      setStatusProgress(0);
    }
  };

  const handleNextStatus = () => {
    const userStatuses = groupedStatuses[viewingStatusUser] || [];
    if (viewingStatusIndex < userStatuses.length - 1) {
      setViewingStatusIndex(idx => idx + 1);
      setStatusProgress(0);
    } else {
      setViewingStatusUser(null); 
      setStatusProgress(0);
    }
  };

  useEffect(() => {
    if (!activeChat || !currentUser || messages.length === 0) return;

    const unreadMsgs = messages.filter(m =>
      m.sender !== currentUser &&
      m.status !== 'read' &&
      (activeChat.startsWith('#group_') ? m.receiver === activeChat : m.sender === activeChat)
    );

    if (unreadMsgs.length > 0) {
      setMessages(prev => prev.map(m =>
        unreadMsgs.find(u => u.id === m.id) ? { ...m, status: 'read' } : m
      ));

      fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentUser, activeChat })
      }).catch(err => console.error(err));
    }
  }, [activeChat, messages, currentUser]);

  const isOnline = (lastSeen) => {
    if (!lastSeen) return false;
    return (Date.now() - lastSeen) < 15000; 
  };

  useEffect(() => {
    if (isLogged) {
      fetch(`/api/profile?username=${encodeURIComponent(currentUser)}&_t=${Date.now()}`, { cache: 'no-store' })
        .then(async res => {
           if (!res.ok) throw new Error(); 
           const data = await res.json();
           setUserProfile({
             displayName: data.display_name || currentUser,
             photo: data.profile_photo || ''
           });
           setEditName(data.display_name || currentUser);
        }).catch(()=>{});

      fetch(`/api/statuses/privacy?username=${encodeURIComponent(currentUser)}&_t=${Date.now()}`, { cache: 'no-store' })
        .then(r => r.ok ? r.json() : { hiddenUsers: [] })
        .then(d => setHiddenUsers(d.hiddenUsers || []))
        .catch(()=>{});
    }
  }, [isLogged, currentUser]);

  const handleLogout = () => {
    setIsLogged(false);
    setCurrentUser('');
    setPassword('');
    setMessages([]);
    setActiveChat(null);
    setShowMenu(false);
    setShowProfile(false);
    setShowContactInfo(false);
    setContactProfiles({});
    setActiveTab('chats');
    lastSyncRef.current = 0; 
  };

  useEffect(() => {
    if (!isLogged) return;
    let isMounted = true;

    const poll = async () => {
      try {
        const syncRes = await fetch(`/api/sync?user=${encodeURIComponent(currentUser)}&after=${lastSyncRef.current}&_t=${Date.now()}`, { cache: 'no-store' });
        
        if (activeChat && isMounted) {
            fetch(`/api/profile?username=${encodeURIComponent(activeChat)}&_t=${Date.now()}`, { cache: 'no-store' })
              .then(async r => { if (!r.ok) throw new Error(); return r.json(); })
              .then(data => {
                  if (isMounted && !data.error) {
                      setContactProfiles(prev => ({
                          ...prev,
                          [activeChat]: {
                              displayName: data.display_name || data.name || activeChat,
                              photo: data.profile_photo || '',
                              contact: data.contact || '',
                              lastSeen: data.last_seen || 0,
                              isGroup: data.isGroup || false,
                              groupMembers: data.groupMembers || []
                          }
                      }));
                  }
              }).catch(() => {});
        }

        if (isMounted) {
           fetch(`/api/statuses?viewer=${encodeURIComponent(currentUser)}&_t=${Date.now()}`, { cache: 'no-store' })
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(data => setStatuses(data))
            .catch(()=>{});
        }

        if (activeChat && isMounted) {
           fetch(`/api/typing?chat_id=${encodeURIComponent(activeChat)}&user=${encodeURIComponent(currentUser)}&_t=${Date.now()}`, { cache: 'no-store' })
             .then(r => r.json())
             .then(data => { if (isMounted) setTypists(data.typists || []); })
             .catch(()=>{});
        } else if (isMounted) {
           setTypists([]);
        }

        if (!syncRes.ok && syncRes.status !== 204) throw new Error('Server error');
        if (!isMounted || syncRes.status === 204) return;

        const newMsgs = await syncRes.json();
        if (newMsgs && newMsgs.length > 0) {
          const maxTimestamp = Math.max(...newMsgs.map(m => Number(m.updated_at || m.timestamp)));
          if (maxTimestamp > lastSyncRef.current) {
             lastSyncRef.current = maxTimestamp;
          }
          
          setMessages(prev => {
            const map = new Map(prev.map(m => [m.id, m]));
            newMsgs.forEach(m => map.set(m.id, m));
            return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
          });
        }
      } catch (err) {}
    };

    poll();
    const intervalId = setInterval(poll, 2000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [isLogged, currentUser, activeChat]);

  const saveStatusPrivacy = async () => {
    try {
      await fetch('/api/statuses/privacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, hiddenUsers })
      });
      setShowStatusPrivacy(false);
    } catch(e) { console.error(e); }
  };

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

  const handleStatusUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = file.type.startsWith('video/') ? 1 * 1024 * 1024 : 2 * 1024 * 1024; 
    if (file.size > maxSize) {
      setStatusError(`File is too large. ${file.type.startsWith('video/') ? 'Videos must be under 1MB.' : 'Images must be under 2MB.'}`);
      setTimeout(() => setStatusError(''), 5000);
      e.target.value = '';
      return;
    }

    setIsUploadingStatus(true);
    setStatusError('');

    if (file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onloadend = async (event) => {
            const base64 = event.target.result;
            try {
              const res = await fetch('/api/statuses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: currentUser, content: base64, type: 'video' })
              });
              if(res.ok) {
                const data = await res.json();
                if(data.id) setStatuses(prev => [...prev, data]);
              } else {
                const errData = await res.json().catch(()=>({}));
                setStatusError(`Video Error: ${errData.error || 'Server error'}`);
                setTimeout(() => setStatusError(''), 5000);
              }
            } catch(err) {
              setStatusError('Network error during video upload.');
              setTimeout(() => setStatusError(''), 4000);
            } finally {
              setIsUploadingStatus(false);
            }
        };
        reader.readAsDataURL(file);
        e.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onloadend = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_DIMENSION = 800;
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_DIMENSION) {
           height *= MAX_DIMENSION / width;
           width = MAX_DIMENSION;
        } else if (height > MAX_DIMENSION) {
           width *= MAX_DIMENSION / height;
           height = MAX_DIMENSION;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
        
        try {
          const res = await fetch('/api/statuses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser, content: compressedBase64, type: 'image' })
          });
          if(res.ok) {
            const data = await res.json();
            if(data.id) setStatuses(prev => [...prev, data]);
          } else {
             const errData = await res.json().catch(()=>({}));
             setStatusError(`Upload failed: ${errData.error || 'Server error'}`);
             setTimeout(() => setStatusError(''), 5000);
          }
        } catch(err) {
          setStatusError('Network error during upload.');
          setTimeout(() => setStatusError(''), 4000);
        } finally {
          setIsUploadingStatus(false);
        }
      };
      
      img.onerror = () => {
         setStatusError('Invalid image format.');
         setIsUploadingStatus(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeleteStatus = async (statusId) => {
    try {
      await fetch('/api/statuses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: statusId, username: currentUser })
      });
      setStatuses(prev => prev.filter(s => s.id !== statusId));
      setShowViewersList(false);
      
      const remainingMyStatuses = statuses.filter(s => s.username === currentUser && s.id !== statusId);
      if (remainingMyStatuses.length === 0) {
         setViewingStatusUser(null);
      } else if (viewingStatusIndex >= remainingMyStatuses.length) {
         setViewingStatusIndex(remainingMyStatuses.length - 1);
         setStatusProgress(0);
      }
    } catch(err) { console.error(err); }
  };

  const saveProfile = async (dataToSave) => {
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, ...dataToSave })
      });
    } catch (err) {}
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeChat) return;
    const textToSend = inputText.trim();
    
    const currentReply = replyingTo;
    
    setInputText('');
    setShowEmojis(false);
    setReplyingTo(null);
    sendPayload(textToSend, 'text', null, currentReply?.sender, currentReply?.text);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat) return;
    
    const currentReply = replyingTo;
    setReplyingTo(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      const fileType = file.type.startsWith('image/') ? 'image' : 'document';
      sendPayload(file.name, fileType, base64, currentReply?.sender, currentReply?.text);
    };
    reader.readAsDataURL(file);
    e.target.value = ''; 
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      isCancelledRef.current = false;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop()); 
        if (isCancelledRef.current) return; 
        
        const currentReply = replyingTo;
        setReplyingTo(null);

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          sendPayload('Voice Message', 'audio', reader.result, currentReply?.sender, currentReply?.text);
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err) {
      alert("Microphone access denied.");
    }
  };

  const stopRecording = (send = true) => {
    isCancelledRef.current = !send;
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const sendPayload = async (text, type, media, replyToSender = null, replyToText = null) => {
    const optimisticMsg = {
      id: `temp_${Date.now()}`,
      sender: currentUser,
      receiver: activeChat,
      text: text,
      type: type,
      media: media,
      reply_to_sender: replyToSender,
      reply_to_text: replyToText,
      timestamp: Date.now(),
      updated_at: Date.now(),
      status: 'sending',
      pending: true,
      is_deleted: 0,
      reactions: "{}"
    };
    
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: currentUser, receiver: activeChat, text, type, media, replyToSender, replyToText })
      });
      if (res.ok) {
         const savedMsg = await res.json();
         // If a reaction happened locally while the request was in flight, preserve it
         setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? { ...savedMsg, reactions: m.reactions !== "{}" ? m.reactions : savedMsg.reactions } : m));
      }
    } catch (error) {}
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, is_deleted: 1, text: '🚫 This message was deleted', media: null, type: 'deleted', updated_at: Date.now() } : m));
      await fetch('/api/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: msgId, sender: currentUser })
      });
    } catch (e) { console.error(e); }
  };

  const handleReaction = async (msgId, emoji) => {
     let newReactionsString = "{}";

     setMessages(prev => prev.map(m => {
        if (m.id === msgId) {
           let parsed = {};
           try { 
               if (typeof m.reactions === 'string' && m.reactions.trim() !== '') {
                   parsed = JSON.parse(m.reactions); 
               } else if (typeof m.reactions === 'object' && m.reactions !== null) {
                   parsed = { ...m.reactions };
               }
           } catch(e) {}
           
           if (parsed[currentUser] === emoji) delete parsed[currentUser];
           else parsed[currentUser] = emoji;
           
           newReactionsString = JSON.stringify(parsed);
           return { ...m, reactions: newReactionsString, updated_at: Date.now() };
        }
        return m;
     }));

     await fetch(`/api/messages/react`, {
       method: 'POST',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify({ id: msgId, newReactions: newReactionsString })
     }).catch(()=>{});
  };

  const parseReactions = (reactionsData) => {
     try {
       let obj = {};
       if (typeof reactionsData === 'string' && reactionsData.trim() !== '') {
           obj = JSON.parse(reactionsData);
       } else if (typeof reactionsData === 'object' && reactionsData !== null) {
           obj = reactionsData;
       }
       
       const counts = {};
       let total = 0;
       for (const [user, emoji] of Object.entries(obj)) {
          counts[emoji] = (counts[emoji] || 0) + 1;
          total++;
       }
       return { counts, total };
     } catch(e) {
       return { counts: {}, total: 0 };
     }
  };

  const conversations = React.useMemo(() => {
    const chatMap = new Map();

    messages.forEach(msg => {
      const contact = msg.receiver.startsWith('#group_') ? msg.receiver : (msg.sender === currentUser ? msg.receiver : msg.sender);
      const isUnread = msg.sender !== currentUser && msg.status !== 'read';
      const existing = chatMap.get(contact);

      if (!existing) {
        chatMap.set(contact, { ...msg, unreadCount: isUnread ? 1 : 0 });
      } else {
        const updatedUnreadCount = existing.unreadCount + (isUnread ? 1 : 0);
        if (msg.timestamp > existing.timestamp) {
          chatMap.set(contact, { ...msg, unreadCount: updatedUnreadCount });
        } else {
          chatMap.set(contact, { ...existing, unreadCount: updatedUnreadCount });
        }
      }
    });

    let chatList = Array.from(chatMap.entries()).map(([contact, msg]) => {
      let preview = msg.is_deleted ? '🚫 This message was deleted' : msg.text;
      if (!msg.is_deleted) {
        if (msg.type === 'audio') preview = '🎤 Voice Message';
        if (msg.type === 'image') preview = '📷 Image';
      }
      
      return {
        contact,
        lastMessage: preview,
        timestamp: msg.timestamp,
        isMyLast: msg.sender === currentUser,
        status: msg.status,
        unreadCount: msg.unreadCount,
        isDeleted: msg.is_deleted
      };
    });

    chatList.sort((a, b) => b.timestamp - a.timestamp);
    if (searchQuery) {
      chatList = chatList.filter(c => {
          const profileName = contactProfiles[c.contact]?.displayName?.toLowerCase() || '';
          const contactId = c.contact.toLowerCase();
          return profileName.includes(searchQuery.toLowerCase()) || contactId.includes(searchQuery.toLowerCase());
      });
    }
    return chatList;
  }, [messages, currentUser, searchQuery, contactProfiles]);

  const activeChatMessages = React.useMemo(() => {
    if (!activeChat) return [];
    return messages.filter(m => {
      if (activeChat.startsWith('#group_')) return m.receiver === activeChat;
      return (m.sender === currentUser && m.receiver === activeChat) || (m.sender === activeChat && m.receiver === currentUser);
    });
  }, [messages, activeChat, currentUser]);

  const knownContacts = React.useMemo(() => {
    const contacts = new Set();
    messages.forEach(msg => {
      if (msg.sender !== currentUser && !msg.sender.startsWith('#group_')) contacts.add(msg.sender);
      if (msg.receiver !== currentUser && !msg.receiver.startsWith('#group_')) contacts.add(msg.receiver);
    });
    return Array.from(contacts);
  }, [messages, currentUser]);

  useEffect(() => {
    if (!isLogged) return;
    
    const fetchContactProfile = (contact) => {
      if (!contact || contactProfiles[contact] || fetchingProfiles.current.has(contact)) return;
      fetchingProfiles.current.add(contact);
      
      fetch(`/api/profile?username=${encodeURIComponent(contact)}&_t=${Date.now()}`, { cache: 'no-store' })
        .then(async res => { if (!res.ok) throw new Error(await res.text()); return res.json(); })
        .then(data => {
          if (!data.error) {
            setContactProfiles(prev => ({
              ...prev,
              [contact]: {
                displayName: data.display_name || data.name || contact,
                photo: data.profile_photo || '',
                contact: data.contact || '',
                lastSeen: data.last_seen || 0,
                isGroup: data.isGroup || false,
                groupMembers: data.groupMembers || []
              }
            }));
          }
        })
        .catch(err => console.error("Profile Fetch Error", err))
        .finally(() => {
          fetchingProfiles.current.delete(contact);
        });
    };

    if (conversations) conversations.forEach(c => fetchContactProfile(c.contact));
    Object.keys(groupedStatuses).forEach(u => fetchContactProfile(u));
  }, [conversations, groupedStatuses, isLogged]);

  const handleSuggestionClick = (suggestion) => {
     const parts = newChatTargets.split(',');
     parts.pop(); 
     parts.push(suggestion);
     setNewChatTargets(parts.join(', ') + ', ');
  };

  const handleNewChat = async (e) => {
    e.preventDefault();
    setNewChatError('');
    
    const targets = newChatTargets.split(',').map(s => s.trim().toLowerCase()).filter(s => s && s !== currentUser);
    if (targets.length === 0) return;

    if (targets.length === 1 && !newChatTargets.includes(',')) {
      try {
        const res = await fetch(`/api/profile?username=${encodeURIComponent(targets[0])}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        
        if (data.username) {
          setActiveChat(targets[0]);
          setShowContactInfo(false);
          setNewChatPrompt(false);
          setNewChatTargets('');
          
          setContactProfiles(prev => ({
            ...prev,
            [targets[0]]: {
              displayName: data.display_name || targets[0],
              photo: data.profile_photo || '',
              contact: data.contact || '',
              lastSeen: data.last_seen || 0,
              isGroup: false,
              groupMembers: []
            }
          }));
        } else {
          setNewChatError('User not found. Check the username.');
        }
      } catch (err) { setNewChatError('Error verifying user.'); }
    } else {
      try {
        const finalGroupName = groupSubject.trim() || `${userProfile.displayName || currentUser}'s Group`;
        const res = await fetch('/api/groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: finalGroupName, createdBy: currentUser, members: [currentUser, ...targets] })
        });
        
        if (!res.ok) {
           const errData = await res.json().catch(()=>({}));
           throw new Error(errData.error || "Server error creating group.");
        }
        
        const data = await res.json();
        if (data.id) {
          setContactProfiles(prev => ({
            ...prev,
            [data.id]: {
              displayName: data.name,
              photo: '',
              contact: `Group Members: ${data.members.join(', ')}`,
              lastSeen: Date.now(),
              isGroup: true,
              groupMembers: data.members.map(m => ({ username: m, display_name: m, role: m === currentUser ? 'admin' : 'member' }))
            }
          }));

          setActiveChat(data.id);
          setShowContactInfo(false);
          setNewChatPrompt(false);
          setNewChatTargets('');
          setGroupSubject('');
        } else { 
          setNewChatError('Failed to create group.'); 
        }
      } catch (err) { 
        setNewChatError(err.message || 'Failed to create group.'); 
      }
    }
  };

  const handleDeleteChat = async () => {
    if (activeChat.startsWith('#group_')) {
      await fetch(`/api/groups/members?groupId=${encodeURIComponent(activeChat)}&username=${encodeURIComponent(currentUser)}&actionBy=${encodeURIComponent(currentUser)}`, { method: 'DELETE' });
      setMessages(prev => prev.filter(m => m.receiver !== activeChat));
    } else {
      await fetch('/api/messages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user1: currentUser, user2: activeChat })
      });
      setMessages(prev => prev.filter(m => !((m.sender === currentUser && m.receiver === activeChat) || (m.sender === activeChat && m.receiver === currentUser))));
    }
    setActiveChat(null);
    setShowContactInfo(false);
  };

  const handleGroupAction = async (targetUser, action) => {
    if (action === 'remove') {
       await fetch(`/api/groups/members?groupId=${encodeURIComponent(activeChat)}&username=${encodeURIComponent(targetUser)}&actionBy=${encodeURIComponent(currentUser)}`, { method: 'DELETE' });
    } else {
       await fetch('/api/groups/members', {
         method: 'PUT',
         headers: {'Content-Type': 'application/json'},
         body: JSON.stringify({ groupId: activeChat, username: targetUser, role: action, updatedBy: currentUser })
       });
    }
    fetchingProfiles.current.delete(activeChat); 
  };

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    if (!newParticipant.trim()) return;
    await fetch('/api/groups/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId: activeChat, username: newParticipant.trim(), addedBy: currentUser })
    });
    setNewParticipant('');
    setShowAddParticipant(false);
    fetchingProfiles.current.delete(activeChat);
  };

  const handleGroupPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        await fetch('/api/groups', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ groupId: activeChat, profile_photo: base64String, updatedBy: currentUser })
        });
        setContactProfiles(prev => ({ ...prev, [activeChat]: { ...prev[activeChat], photo: base64String } }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveGroupName = async () => {
    if (!editGroupName.trim()) return;
    await fetch('/api/groups', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId: activeChat, name: editGroupName, updatedBy: currentUser })
    });
    setContactProfiles(prev => ({ ...prev, [activeChat]: { ...prev[activeChat], displayName: editGroupName } }));
    setEditGroupName('');
  };

  if (!isLogged) {
    const handleAuth = async (e) => {
      e.preventDefault();
      setAuthError('');
      
      const endpoint = authMode === 'signup' ? '/api/auth/register' : '/api/auth/login';
      const payload = authMode === 'signup' ? { username: currentUser.trim(), password: password.trim(), contact: emailOrPhone.trim() } : { username: currentUser.trim(), password: password.trim() };

      try {
        const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          setAuthError('Server crash! Check your .env.local file and Database connection.');
          return;
        }

        const data = await res.json();
        if (res.ok) setIsLogged(true);
        else setAuthError(data.error || 'Authentication failed');
      } catch (err) { setAuthError('Network error. Please try again.'); }
    };

    return (
      <div className={`min-h-screen flex items-center justify-center bg-[#f0f2f5] dark:bg-[#111b21] font-sans p-4 ${isDarkMode ? 'dark' : ''}`}>
        <div className="absolute top-4 right-4">
          <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors">
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
        <div className="bg-white dark:bg-[#202c33] p-8 rounded-xl shadow-lg w-full max-w-md border dark:border-[#222d34]">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="text-[#25D366] mb-4"><MessageSquare size={56} /></div>
            <h1 className="text-2xl font-medium text-[#111b21] dark:text-[#e9edef]">{authMode === 'signin' ? 'Sign in to WhatsApp' : 'Create an account'}</h1>
          </div>
          {authError && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-lg text-sm text-center">{authError}</div>}
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#41525d] dark:text-[#8696a0] mb-1">Username</label>
              <input type="text" autoFocus className="w-full p-3 bg-[#f0f2f5] dark:bg-[#2a3942] border border-transparent text-[#111b21] dark:text-[#e9edef] rounded-lg focus:outline-none focus:bg-white dark:focus:bg-[#202c33] focus:border-[#00a884] dark:focus:border-[#00a884]" value={currentUser} onChange={e => setCurrentUser(e.target.value.toLowerCase())} required />
            </div>
            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-[#41525d] dark:text-[#8696a0] mb-1">Email or Phone</label>
                <input type="text" className="w-full p-3 bg-[#f0f2f5] dark:bg-[#2a3942] border border-transparent text-[#111b21] dark:text-[#e9edef] rounded-lg focus:outline-none focus:bg-white dark:focus:bg-[#202c33] focus:border-[#00a884]" value={emailOrPhone} onChange={e => setEmailOrPhone(e.target.value)} required />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-[#41525d] dark:text-[#8696a0] mb-1">Password</label>
              <input type="password" className="w-full p-3 bg-[#f0f2f5] dark:bg-[#2a3942] border border-transparent text-[#111b21] dark:text-[#e9edef] rounded-lg focus:outline-none focus:bg-white dark:focus:bg-[#202c33] focus:border-[#00a884]" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="w-full bg-[#00a884] hover:bg-[#017561] text-white p-3 rounded-lg font-medium transition-colors mt-6">{authMode === 'signin' ? 'Sign In' : 'Sign Up'}</button>
          </form>
          <div className="mt-6 text-center text-sm text-[#54656f] dark:text-[#8696a0]">
            {authMode === 'signin' ? <p>Don't have an account? <button type="button" onClick={() => { setAuthMode('signup'); setPassword(''); setEmailOrPhone(''); setAuthError(''); }} className="text-[#00a884] font-medium hover:underline">Sign up</button></p> : <p>Already have an account? <button type="button" onClick={() => { setAuthMode('signin'); setPassword(''); setAuthError(''); }} className="text-[#00a884] font-medium hover:underline">Sign in</button></p>}
          </div>
        </div>
      </div>
    );
  }

  const activeProfile = activeChat ? contactProfiles[activeChat] : null;
  const isGroup = activeChat?.startsWith('#group_');
  
  // FIXED: Case-insensitive Admin role matching
  const myRole = isGroup ? activeProfile?.groupMembers?.find(m => m.username?.toLowerCase() === currentUser?.toLowerCase())?.role : null;
  const isAdmin = myRole === 'admin';
  
  const currentTypingWord = newChatTargets.split(',').pop().trim();
  const suggestions = currentTypingWord ? knownContacts.filter(c => c.toLowerCase().includes(currentTypingWord.toLowerCase()) && c !== currentUser) : [];
  const myStatuses = groupedStatuses[currentUser] || [];

  return (
    <div className={`flex h-screen w-full bg-[#d1d7db] dark:bg-[#0a1014] font-sans overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex w-full h-full max-w-[1600px] mx-auto md:py-4 md:px-4 shadow-xl">
        <div className="flex w-full h-full bg-white dark:bg-[#111b21] md:rounded-lg overflow-hidden shadow-sm relative border dark:border-[#222d34]">
          
          {/* Sidebar */}
          <div className={`flex flex-col w-full md:w-[350px] lg:w-[400px] border-r border-[#e9edef] dark:border-[#222d34] transition-all duration-300 ${activeChat || viewingStatusUser ? 'hidden md:flex' : 'flex'} relative overflow-hidden`}>
            
            {/* Profile Drawer */}
            <div className={`absolute inset-0 bg-[#f0f2f5] dark:bg-[#111b21] z-50 flex flex-col transition-transform duration-300 ease-in-out ${showProfile ? 'translate-x-0' : '-translate-x-full'}`}>
              <div className="h-[108px] bg-[#008069] flex items-end pb-4 px-6 text-white gap-6 shrink-0 shadow-sm">
                <button onClick={() => setShowProfile(false)} className="hover:bg-black/10 p-1 rounded-full transition-colors"><ArrowLeft size={24} /></button>
                <h1 className="text-[19px] font-medium">Profile</h1>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="flex justify-center py-7">
                  <div className="relative group cursor-pointer w-48 h-48 rounded-full overflow-hidden bg-[#dfe5e7] dark:bg-[#202c33] flex items-center justify-center text-white shadow-sm" onClick={() => fileInputRef.current?.click()}>
                    {userProfile.photo ? <img src={userProfile.photo} className="w-full h-full object-cover" /> : <User size={80} className="text-[#a6b0b5] dark:text-[#8696a0]" />}
                    <div className="absolute inset-0 bg-black/50 hidden group-hover:flex flex-col items-center justify-center text-white text-sm text-center transition-all"><Camera size={24} className="mb-2" /><span className="w-24 leading-tight uppercase font-medium">Change Photo</span></div>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </div>
                <div className="bg-white dark:bg-[#202c33] px-7 py-3 mb-4 shadow-sm">
                  <p className="text-[#008069] text-[14px] mb-4">Your name</p>
                  <div className="flex justify-between items-center border-b border-[#008069] pb-2">
                    <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full focus:outline-none text-[#111b21] dark:text-[#e9edef] bg-transparent" />
                    <button onClick={() => { saveProfile({ display_name: editName }); setUserProfile(prev => ({...prev, displayName: editName})); }} className="p-1 hover:bg-gray-100 dark:hover:bg-[#2a3942] rounded-full"><Save size={20} className="text-[#8696a0]" /></button>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-[#202c33] px-7 py-4 shadow-sm border-t border-[#e9edef] dark:border-[#222d34] cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2a3942] transition-colors flex items-center justify-between" onClick={toggleDarkMode}>
                   <div className="flex items-center gap-4 text-[#111b21] dark:text-[#e9edef]">
                     {isDarkMode ? <Moon size={24} className="text-[#8696a0]"/> : <Sun size={24} className="text-[#8696a0]"/>}
                     <span className="text-lg">Dark Theme</span>
                   </div>
                   <div className={`w-10 h-5 rounded-full relative transition-colors ${isDarkMode ? 'bg-[#00a884]' : 'bg-gray-300'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isDarkMode ? 'left-[22px]' : 'left-1'}`}></div>
                   </div>
                </div>
              </div>
            </div>

            {/* Privacy Drawer */}
            <div className={`absolute inset-0 bg-[#f0f2f5] dark:bg-[#111b21] z-50 flex flex-col transition-transform duration-300 ease-in-out ${showStatusPrivacy ? 'translate-x-0' : '-translate-x-full'}`}>
              <div className="h-[108px] bg-[#008069] flex items-end pb-4 px-6 text-white gap-6 shrink-0 shadow-sm">
                <button onClick={() => setShowStatusPrivacy(false)} className="hover:bg-black/10 p-1 rounded-full transition-colors"><ArrowLeft size={24} /></button>
                <h1 className="text-[19px] font-medium">Status Privacy</h1>
              </div>
              <div className="flex-1 overflow-y-auto bg-white dark:bg-[#202c33] p-6">
                <p className="text-[#667781] dark:text-[#8696a0] text-sm mb-6">Hide my status updates from specific contacts:</p>
                {knownContacts.length === 0 ? (
                  <p className="text-[#a6b0b5] dark:text-[#8696a0] text-sm text-center">No contacts yet. Start chatting first!</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {knownContacts.map(contact => (
                      <label key={contact} className="flex items-center gap-4 cursor-pointer p-2 hover:bg-[#f5f6f6] dark:hover:bg-[#2a3942] rounded-lg">
                        <input type="checkbox" checked={hiddenUsers.includes(contact)} onChange={(e) => setHiddenUsers(prev => e.target.checked ? [...prev, contact] : prev.filter(u => u !== contact))} className="w-5 h-5 accent-[#00a884] rounded border-gray-300" />
                        <div className="w-10 h-10 bg-[#dfe5e7] dark:bg-[#6a7175] rounded-full overflow-hidden flex-shrink-0">
                           {contactProfiles[contact]?.photo ? <img src={contactProfiles[contact].photo} className="w-full h-full object-cover"/> : <User className="text-white w-full h-full p-2"/>}
                        </div>
                        <span className="text-[#111b21] dark:text-[#e9edef] font-medium">{contactProfiles[contact]?.displayName || contact}</span>
                      </label>
                    ))}
                    <button onClick={saveStatusPrivacy} className="w-full bg-[#00a884] hover:bg-[#017561] text-white p-3 rounded-lg font-medium transition-colors mt-4 shadow-sm">Save Settings</button>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Navigation */}
            <div className="h-[60px] bg-[#f0f2f5] dark:bg-[#202c33] flex items-center justify-between px-4 flex-shrink-0 border-b dark:border-[#222d34]">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowProfile(true)}>
                <div className="w-10 h-10 bg-[#dfe5e7] dark:bg-[#6a7175] rounded-full flex items-center justify-center text-white overflow-hidden hover:opacity-80 transition-opacity">
                  {userProfile.photo ? <img src={userProfile.photo} className="w-full h-full object-cover" /> : <User size={24} className="text-[#a6b0b5] dark:text-white" />}
                </div>
              </div>
              <div className="flex items-center gap-2 text-[#54656f] dark:text-[#aebac1]">
                <button onClick={() => { setActiveTab(activeTab === 'chats' ? 'status' : 'chats'); setNewChatPrompt(false); }} className={`p-2 rounded-full transition-colors ${activeTab === 'status' ? 'bg-[#d9d9d9] dark:bg-[#374248] text-[#111b21] dark:text-white' : 'hover:bg-[#d9d9d9] dark:hover:bg-[#374248]'}`}><CircleDashed size={20} /></button>
                <button onClick={() => { setNewChatPrompt(!newChatPrompt); setNewChatError(''); setActiveTab('chats'); }} className={`p-2 rounded-full transition-colors ${newChatPrompt ? 'bg-[#d9d9d9] dark:bg-[#374248]' : 'hover:bg-[#d9d9d9] dark:hover:bg-[#374248]'}`}><Plus size={20} /></button>
                <div className="relative">
                  <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-full hover:bg-[#d9d9d9] dark:hover:bg-[#374248] transition-colors"><MoreVertical size={20} /></button>
                  {showMenu && (
                    <div className="absolute right-0 top-10 bg-white dark:bg-[#2a3942] shadow-lg rounded-md py-2 w-40 z-50 border border-[#e9edef] dark:border-[#222d34]">
                      <button onClick={() => { setShowMenu(false); setShowProfile(true); }} className="w-full text-left px-4 py-2 text-sm text-[#41525d] dark:text-[#d1d7db] hover:bg-[#f5f6f6] dark:hover:bg-[#202c33]">Profile</button>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-[#41525d] dark:text-[#d1d7db] hover:bg-[#f5f6f6] dark:hover:bg-[#202c33]">Log out</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Start New Chat / Group Box */}
            {newChatPrompt && activeTab === 'chats' && (
              <div className="bg-white dark:bg-[#111b21] p-3 border-b border-[#e9edef] dark:border-[#222d34] relative z-20">
                 <form onSubmit={handleNewChat} className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input value={newChatTargets} onChange={e => setNewChatTargets(e.target.value)} placeholder="Names (comma separated for groups)" className="flex-1 bg-[#f0f2f5] dark:bg-[#202c33] text-[#41525d] dark:text-[#d1d7db] px-3 py-2 rounded-lg text-sm focus:outline-none" autoFocus />
                      <button type="submit" className="bg-[#00a884] text-white px-4 py-2 rounded-lg text-sm font-medium">Chat</button>
                    </div>
                    {newChatTargets.includes(',') && <input value={groupSubject} onChange={e => setGroupSubject(e.target.value)} placeholder="Group Subject (Optional)" className="w-full bg-[#f0f2f5] dark:bg-[#202c33] text-[#41525d] dark:text-[#d1d7db] px-3 py-2 rounded-lg text-sm focus:outline-none mt-1" />}
                    {newChatError && <span className="text-red-500 text-xs ml-1 font-medium">{newChatError}</span>}
                 </form>
                 {suggestions.length > 0 && (
                   <div className="absolute top-[50px] left-3 right-3 bg-white dark:bg-[#2a3942] border border-[#e9edef] dark:border-[#222d34] shadow-lg rounded-lg max-h-48 overflow-y-auto">
                     {suggestions.map(s => (
                       <div key={s} onClick={() => handleSuggestionClick(s)} className="px-4 py-2 hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] cursor-pointer text-sm text-[#111b21] dark:text-[#e9edef] flex items-center gap-2"><User size={16} className="text-[#8696a0]"/> {s}</div>
                     ))}
                   </div>
                 )}
              </div>
            )}

            {}
            {activeTab === 'status' ? (
              <div className="flex-1 overflow-y-auto bg-white dark:bg-[#111b21] flex flex-col">
                <div className="flex justify-between items-center px-4 py-3 bg-white dark:bg-[#111b21] border-b border-[#e9edef] dark:border-[#222d34]">
                   <h2 className="text-[#111b21] dark:text-[#e9edef] font-medium text-lg">Status</h2>
                   <button onClick={() => setShowStatusPrivacy(true)} title="Privacy Settings" className="text-[#54656f] dark:text-[#aebac1] p-2 hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] rounded-full transition-colors"><Settings size={20}/></button>
                </div>
                
                {statusError && (
                  <div className="mx-4 mt-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm p-2 rounded border border-red-100 dark:border-red-900 text-center shadow-sm">
                    {statusError}
                  </div>
                )}

                <div className="flex items-center px-4 py-3 cursor-pointer hover:bg-[#f5f6f6] dark:hover:bg-[#202c33]">
                  <div 
                    className={`relative w-12 h-12 rounded-full mr-3 flex items-center justify-center flex-shrink-0 ${myStatuses.length > 0 ? 'border-[3px] border-[#00a884] p-0.5' : ''}`}
                    onClick={(e) => {
                       e.stopPropagation();
                       if (isUploadingStatus) return; 
                       if(myStatuses.length > 0) {
                         setViewingStatusUser(currentUser);
                         setViewingStatusIndex(0);
                         setStatusProgress(0);
                         setShowViewersList(false);
                       } else {
                         statusUploadRef.current?.click();
                       }
                    }}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden bg-[#dfe5e7] dark:bg-[#6a7175] flex items-center justify-center relative">
                       {userProfile.photo ? <img src={userProfile.photo} className="w-full h-full object-cover"/> : <User size={24} className="text-white" />}
                       {isUploadingStatus && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                             <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                       )}
                    </div>
                    <div className="absolute bottom-0 right-[-2px] bg-[#00a884] rounded-full p-0.5 border-2 border-white dark:border-[#111b21] shadow-sm" onClick={(e) => { e.stopPropagation(); statusUploadRef.current?.click(); }}>
                      <Plus size={14} className="text-white font-bold" />
                    </div>
                  </div>
                  <div className="flex-1 border-b border-[#f2f2f2] dark:border-[#222d34] pb-3 pt-1" onClick={() => statusUploadRef.current?.click()}>
                    <h3 className="text-[#111b21] dark:text-[#e9edef] font-medium text-[16px]">My status</h3>
                    <p className="text-[#667781] dark:text-[#8696a0] text-[13px]">{isUploadingStatus ? 'Uploading...' : myStatuses.length > 0 ? 'Click avatar to view, text to add' : 'Tap to add status update'}</p>
                  </div>
                </div>
                <input type="file" accept="image/*,video/*" className="hidden" ref={statusUploadRef} onChange={handleStatusUpload} />

                <div className="px-5 py-3 text-[#008069] text-[14px] bg-white dark:bg-[#111b21]">RECENT UPDATES</div>
                {Object.keys(groupedStatuses).filter(u => u !== currentUser).length === 0 && <div className="px-5 py-2 text-[#667781] dark:text-[#8696a0] text-sm">No recent updates</div>}
                
                {Object.keys(groupedStatuses).filter(u => u !== currentUser).map(u => (
                  <div key={u} className="flex items-center px-4 py-3 cursor-pointer hover:bg-[#f5f6f6] dark:hover:bg-[#202c33]" onClick={() => { setViewingStatusUser(u); setViewingStatusIndex(0); setStatusProgress(0); setShowViewersList(false); setActiveChat(null); }}>
                    <div className="relative w-12 h-12 rounded-full mr-3 p-0.5 border-2 border-[#00a884] flex-shrink-0">
                       <div className="w-full h-full rounded-full overflow-hidden bg-[#dfe5e7] dark:bg-[#6a7175] flex items-center justify-center">
                         {contactProfiles[u]?.photo ? <img src={contactProfiles[u].photo} className="w-full h-full object-cover"/> : <User size={24} className="text-white"/>}
                       </div>
                    </div>
                    <div className="flex-1 border-b border-[#f2f2f2] dark:border-[#222d34] pb-3 pt-1">
                      <h3 className="text-[#111b21] dark:text-[#e9edef] font-normal text-[16px]">{contactProfiles[u]?.displayName || u}</h3>
                      <p className="text-[#667781] dark:text-[#8696a0] text-[13px]">{new Date(groupedStatuses[u][groupedStatuses[u].length - 1].timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="p-2 border-b border-[#e9edef] dark:border-[#222d34] bg-white dark:bg-[#111b21]">
                  <div className="bg-[#f0f2f5] dark:bg-[#202c33] rounded-lg flex items-center px-3 h-9">
                    <Search size={18} className="text-[#54656f] dark:text-[#8696a0]" />
                    <input type="text" placeholder="Search or start new chat" className="bg-transparent border-none focus:outline-none ml-4 text-sm w-full text-[#41525d] dark:text-[#d1d7db] placeholder-[#54656f] dark:placeholder-[#8696a0]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-white dark:bg-[#111b21]">
                  {conversations.length === 0 ? (
                    <div className="text-center p-6 text-[#54656f] dark:text-[#8696a0] text-sm">No conversations yet. Click the + icon to start a chat.</div>
                  ) : (
                    conversations.map((chat) => (
                      <div key={chat.contact} onClick={() => { setActiveChat(chat.contact); setShowContactInfo(false); setViewingStatusUser(null); }} className={`flex items-center px-3 py-2.5 cursor-pointer hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] transition-colors ${activeChat === chat.contact ? 'bg-[#f0f2f5] dark:bg-[#2a3942]' : ''}`}>
                        <div className="w-12 h-12 bg-[#dfe5e7] dark:bg-[#6a7175] rounded-full flex items-center justify-center text-white mr-3 flex-shrink-0 overflow-hidden relative">
                          {contactProfiles[chat.contact]?.photo ? <img src={contactProfiles[chat.contact].photo} alt="Profile" className="w-full h-full object-cover" /> : <span className="font-semibold text-lg text-[#a6b0b5] dark:text-white">{contactProfiles[chat.contact]?.displayName ? contactProfiles[chat.contact].displayName.charAt(0).toUpperCase() : chat.contact.charAt(0).toUpperCase()}</span>}
                        </div>
                        <div className="flex-1 min-w-0 border-b border-[#f2f2f2] dark:border-[#222d34] pb-2 pt-1">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <span className="font-normal text-base text-[#111b21] dark:text-[#e9edef] truncate flex items-center gap-1.5">
                              {contactProfiles[chat.contact]?.displayName || chat.contact}
                              {!chat.contact.startsWith('#group_') && isOnline(contactProfiles[chat.contact]?.lastSeen) && <span className="w-2 h-2 bg-[#25D366] rounded-full shadow-sm"></span>}
                            </span>
                            <span className={`text-xs ${chat.unreadCount > 0 ? 'text-[#25D366] font-medium' : 'text-[#667781] dark:text-[#8696a0]'}`}>{new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-[#667781] dark:text-[#8696a0] w-full">
                            <div className="flex items-center truncate">
                              {chat.isMyLast && !chat.isDeleted && <span className="mr-1 flex-shrink-0">{chat.status === 'read' ? <CheckCheck size={14} className="text-[#53bdeb]" /> : chat.status === 'delivered' ? <CheckCheck size={14} className="text-[#8696a0]" /> : <Check size={14} className="text-[#8696a0]" />}</span>}
                              <span className={`truncate ${chat.isDeleted ? 'italic text-sm' : ''}`}>{chat.lastMessage}</span>
                            </div>
                            {chat.unreadCount > 0 && <div className="bg-[#25D366] text-white text-[11px] font-bold px-1.5 py-0.5 min-w-[20px] h-[20px] rounded-full flex items-center justify-center shadow-sm ml-2 flex-shrink-0">{chat.unreadCount}</div>}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          {}
          <div className={`flex-col flex-1 bg-[#efeae2] dark:bg-[#0b141a] relative overflow-hidden ${!activeChat && !viewingStatusUser ? 'hidden md:flex' : 'flex'}`}>
            
            {/* Status Viewer Wrapper */}
            {viewingStatusUser ? (() => {
              const currentStatus = groupedStatuses[viewingStatusUser][viewingStatusIndex];
              return (
              <div className="flex-1 bg-[#0b141a] relative flex flex-col justify-center items-center">
                 
                 {/* Invisible Navigation Zones */}
                 <div className="absolute inset-0 z-40 flex">
                   <div className="w-1/3 h-full cursor-pointer" onClick={(e) => { e.stopPropagation(); handlePrevStatus(); }}></div>
                   <div className="w-2/3 h-full cursor-pointer" onClick={(e) => { e.stopPropagation(); handleNextStatus(); }}></div>
                 </div>

                 {/* Progress Bars */}
                 <div className="absolute top-4 left-4 right-4 flex gap-1 z-50 pointer-events-none">
                   {groupedStatuses[viewingStatusUser].map((s, i) => (
                     <div key={i} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                       <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: i < viewingStatusIndex ? '100%' : i === viewingStatusIndex ? `${statusProgress}%` : '0%' }}></div>
                     </div>
                   ))}
                 </div>

                 {/* Viewer Header */}
                 <div className="absolute top-8 left-4 right-4 flex justify-between items-center z-50 bg-black/30 p-2 rounded-xl backdrop-blur-md border border-white/10">
                   <div className="flex items-center gap-3">
                      <button onClick={() => { setViewingStatusUser(null); setShowViewersList(false); }} className="text-white md:hidden hover:bg-white/20 p-2 rounded-full transition-colors"><ArrowLeft/></button>
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-[#dfe5e7] border border-white/50">
                         {contactProfiles[viewingStatusUser]?.photo ? <img src={contactProfiles[viewingStatusUser].photo} className="w-full h-full object-cover"/> : <User className="text-[#a6b0b5] w-full h-full p-2 bg-white"/>}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-medium text-[16px] drop-shadow-md">{contactProfiles[viewingStatusUser]?.displayName || viewingStatusUser}</span>
                        <span className="text-white/80 text-[13px] drop-shadow-md">{new Date(currentStatus.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-1">
                     {viewingStatusUser === currentUser && (
                       <button onClick={() => handleDeleteStatus(currentStatus.id)} title="Delete Status" className="text-white hover:text-red-500 hover:bg-white/20 p-2.5 rounded-full transition-colors"><Trash2 size={20}/></button>
                     )}
                     <button onClick={() => { setViewingStatusUser(null); setShowViewersList(false); }} title="Close Viewer" className="text-white hover:bg-white/20 p-2.5 rounded-full transition-colors"><X size={24}/></button>
                   </div>
                 </div>

                 {/* Media Output */}
                 <div className="w-full h-full flex items-center justify-center p-4 pt-24 pb-12 z-0 pointer-events-none">
                    {currentStatus.type === 'video' ? (
                       <video src={currentStatus.content} autoPlay muted playsInline className="max-w-full max-h-full object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]" />
                    ) : (
                       <img src={currentStatus.content} alt="Status" className="max-w-full max-h-full object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]" />
                    )}
                 </div>

                 {/* Viewers Bottom Drawer */}
                 {viewingStatusUser === currentUser && (
                   <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center z-50">
                     <button 
                       onClick={(e) => { e.stopPropagation(); setShowViewersList(!showViewersList); }}
                       className="flex flex-col items-center text-white/80 hover:text-white p-4 w-full bg-gradient-to-t from-black/80 to-transparent transition-colors"
                     >
                       {showViewersList ? <ChevronDown size={24}/> : <ChevronUp size={24}/>}
                       <div className="flex items-center gap-2 mt-1 font-medium"><Eye size={20}/> {statusViewers.length}</div>
                     </button>
                     
                     {showViewersList && (
                       <div className="bg-[#111b21] w-full md:w-[400px] md:mb-4 md:rounded-xl h-[50vh] flex flex-col overflow-hidden shadow-2xl border border-[#222d34]" onClick={e => e.stopPropagation()}>
                         <div className="p-4 border-b border-[#222d34] flex justify-between items-center bg-[#202c33]">
                            <h3 className="text-white font-medium text-lg">Viewed by {statusViewers.length}</h3>
                            <button onClick={() => setShowViewersList(false)} className="text-[#aebac1] hover:text-white"><X size={20}/></button>
                         </div>
                         <div className="flex-1 overflow-y-auto p-2">
                            {statusViewers.length === 0 ? (
                              <p className="text-[#8696a0] text-center mt-10">No views yet</p>
                            ) : (
                              statusViewers.map(v => (
                                <div key={v.viewer_username} className="flex items-center gap-3 p-3 hover:bg-[#202c33] rounded-lg cursor-pointer">
                                  <div className="w-12 h-12 bg-[#6a7175] rounded-full overflow-hidden flex-shrink-0">
                                     {v.profile_photo ? <img src={v.profile_photo} className="w-full h-full object-cover"/> : <User className="text-white w-full h-full p-2.5"/>}
                                  </div>
                                  <div className="flex-1 border-b border-[#222d34] pb-2">
                                     <p className="text-[#e9edef] text-base">{v.display_name || v.viewer_username}</p>
                                     <p className="text-[#8696a0] text-sm">{new Date(v.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                  </div>
                                </div>
                              ))
                            )}
                         </div>
                       </div>
                     )}
                   </div>
                 )}
              </div>
            )})() : !activeChat ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#f0f2f5] dark:bg-[#222d34] border-l border-[#e9edef] dark:border-[#222d34]">
                <h2 className="text-[32px] text-[#41525d] dark:text-[#e9edef] font-light mb-4">WhatsApp Web Clone</h2>
                <p className="text-sm text-[#667781] dark:text-[#8696a0] max-w-md">Send and receive messages without keeping your phone online.</p>
              </div>
            ) : (
              <>
                <div className="h-[60px] bg-[#f0f2f5] dark:bg-[#202c33] flex items-center justify-between px-4 z-10 sticky top-0 border-l border-[#e9edef] dark:border-[#222d34]">
                  <div className="flex items-center gap-1">
                    <button className="md:hidden text-[#54656f] dark:text-[#aebac1] mr-1" onClick={() => setActiveChat(null)}><ArrowLeft size={24} /></button>
                    <div className="flex items-center gap-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 p-1 rounded-lg transition-colors" onClick={() => setShowContactInfo(true)}>
                      <div className="w-10 h-10 bg-[#dfe5e7] dark:bg-[#6a7175] rounded-full flex items-center justify-center text-white overflow-hidden flex-shrink-0">
                        {contactProfiles[activeChat]?.photo ? <img src={contactProfiles[activeChat].photo} alt="Profile" className="w-full h-full object-cover" /> : <span className="font-semibold text-[#a6b0b5] dark:text-white">{contactProfiles[activeChat]?.displayName ? contactProfiles[activeChat].displayName.charAt(0).toUpperCase() : activeChat.charAt(0).toUpperCase()}</span>}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-normal text-[#111b21] dark:text-[#e9edef]">{contactProfiles[activeChat]?.displayName || activeChat}</h2>
                          {!isGroup && isOnline(contactProfiles[activeChat]?.lastSeen) && <div className="w-2.5 h-2.5 bg-[#25D366] rounded-full shadow-sm border border-[#f0f2f5] dark:border-[#202c33]"></div>}
                        </div>
                        <p className="text-xs text-[#667781] dark:text-[#8696a0] mt-0.5 truncate max-w-[250px]">
                           {typists.length > 0 
                             ? <span className="text-[#00a884] font-medium">{isGroup ? `${typists.join(', ')} is typing...` : 'typing...'}</span> 
                             : (isGroup ? 'Group Chat' : (isOnline(contactProfiles[activeChat]?.lastSeen) ? 'Online' : 'Offline'))
                           }
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 text-[#54656f] dark:text-[#aebac1] mr-2">
                    <Video size={22} className="cursor-pointer hover:text-[#41525d] dark:hover:text-[#e9edef] transition-colors" />
                    <Phone size={20} className="cursor-pointer hover:text-[#41525d] dark:hover:text-[#e9edef] transition-colors" />
                  </div>
                </div>

                {}
                <div className="flex-1 overflow-y-auto p-4 md:px-[6%] lg:px-[9%] py-6 z-0 transition-colors" style={{backgroundImage: wallpapers[activeChat] ? `url(${wallpapers[activeChat]})` : 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: wallpapers[activeChat] ? 'cover' : 'contain', backgroundPosition: 'center', backgroundRepeat: wallpapers[activeChat] ? 'no-repeat' : 'repeat', opacity: isDarkMode && !wallpapers[activeChat] ? 0.3 : 1}}>
                  {activeChatMessages.map((msg, i) => {
                    const isMe = msg.sender === currentUser;
                    const isFirstInGroup = i === 0 || activeChatMessages[i-1].sender !== msg.sender;

                    if (msg.type === 'system') {
                      return (
                        <div key={msg.id} className="flex justify-center my-2 w-full">
                           <div className="bg-[#fff5c4] dark:bg-[#182229] text-[#54656f] dark:text-[#8696a0] text-[12.5px] px-3 py-1.5 rounded-lg shadow-sm font-medium text-center max-w-[85%] border dark:border-[#222d34]">{msg.text}</div>
                        </div>
                      );
                    }

                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1 group`}>
                        <div className={`relative max-w-[85%] md:max-w-[70%] rounded-lg px-2.5 pt-1.5 pb-2 shadow-sm ${isMe ? 'bg-[#d9fdd3] dark:bg-[#005c4b]' : 'bg-white dark:bg-[#202c33]'} ${isFirstInGroup && isMe ? 'rounded-tr-none' : ''} ${isFirstInGroup && !isMe ? 'rounded-tl-none' : ''} ${isFirstInGroup ? 'mt-2' : ''}`}>
                          <div className="flex flex-col">
                            {isGroup && !isMe && isFirstInGroup && <span className="text-xs font-bold text-[#e57373] mb-1">{contactProfiles[msg.sender]?.displayName || msg.sender}</span>}
                            
                            {/* Quoted Message Box */}
                            {msg.reply_to_text && (
                               <div className={`mb-1 p-2 rounded bg-black/5 dark:bg-black/20 border-l-4 ${isMe ? 'border-[#028b6d]' : 'border-[#00a884]'}`}>
                                  <p className={`text-xs font-semibold ${isMe ? 'text-[#028b6d]' : 'text-[#00a884]'}`}>{msg.reply_to_sender}</p>
                                  <p className="text-sm text-[#54656f] dark:text-[#aebac1] truncate max-w-[200px]">{msg.reply_to_text}</p>
                               </div>
                            )}

                            {msg.type === 'image' && msg.media && <img src={msg.media} alt="attachment" className="max-w-[250px] md:max-w-[300px] rounded-md mb-1 cursor-pointer object-cover" />}
                            {msg.type === 'document' && msg.media && <div className="flex items-center bg-black/5 p-2 rounded-md mb-1 w-48 truncate"><Paperclip size={16} className="mr-2 flex-shrink-0 text-[#667781]" /><a href={msg.media} download={msg.text} className="text-[#008069] font-medium underline text-sm truncate">{msg.text}</a></div>}
                            {msg.type === 'audio' && msg.media && <div className="flex items-center gap-2 mb-1 min-w-[200px]"><Mic size={20} className={isMe ? 'text-[#00a884]' : 'text-[#8696a0]'} /><audio controls src={msg.media} className="w-full h-8" /></div>}
                            
                            {/* Main Message Text */}
                            {(!msg.type || msg.type === 'text' || msg.type === 'deleted') && <span className={`text-[14.2px] leading-[19px] ${msg.is_deleted ? 'text-[#667781] dark:text-[#8696a0] italic' : 'text-[#111b21] dark:text-[#e9edef]'} whitespace-pre-wrap break-words pr-8`}>{msg.text}</span>}
                            
                            <div className={`flex items-center justify-end gap-1 float-right self-end ${msg.type === 'audio' ? 'mt-1' : 'mt-[-10px]'}`}>
                               <span className="text-[10px] text-[#667781] dark:text-[#8696a0] pt-1">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                               {isMe && <span className="pt-1">{msg.status === 'read' ? <CheckCheck size={13} className="text-[#53bdeb]" /> : msg.status === 'delivered' ? <CheckCheck size={13} className="text-[#8696a0]" /> : <Check size={13} className="text-[#667781]" />}</span>}
                            </div>
                          </div>

                          {/* Reactions Display Bottom */}
                          {msg.reactions && msg.reactions !== '{}' && (() => {
                             const { counts, total } = parseReactions(msg.reactions);
                             if (total === 0) return null;
                             return (
                                <div className={`flex items-center gap-1 absolute bottom-[-10px] ${isMe ? 'right-2' : 'left-2'} bg-white dark:bg-[#2a3942] rounded-full px-1.5 py-0.5 text-[11px] shadow-sm border border-gray-100 dark:border-[#222d34] z-10 cursor-pointer`}>
                                   {Object.keys(counts).map(em => <span key={em}>{em}</span>)}
                                   <span className="text-gray-500 font-medium">{total > 1 ? total : ''}</span>
                                </div>
                             );
                          })()}

                          {/* Hover Actions (Reactions locked if message is pending to prevent race conditions) */}
                          <div className={`absolute top-1 ${isMe ? 'left-[-90px]' : 'right-[-60px]'} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/80 dark:bg-[#111b21]/80 backdrop-blur rounded p-1 shadow-sm z-20`}>
                             {!msg.is_deleted && !msg.pending && (
                                <div className="relative group/react pb-2 -mb-2">
                                   <button className="p-1 hover:text-[#00a884] text-[#8696a0] transition-colors"><Smile size={16}/></button>
                                   
                                   <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-1 hidden group-hover/react:flex z-50">
                                      <div className="bg-white dark:bg-[#2a3942] rounded-full shadow-lg p-1.5 border border-gray-100 dark:border-[#222d34] flex gap-1">
                                         {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(em => (
                                            <button key={em} onClick={(e) => { e.stopPropagation(); handleReaction(msg.id, em); }} className="hover:scale-125 transition-transform text-lg leading-none">{em}</button>
                                         ))}
                                      </div>
                                   </div>
                                </div>
                             )}
                             {!msg.is_deleted && <button onClick={() => setReplyingTo(msg)} className="p-1 hover:text-[#00a884] text-[#8696a0] transition-colors"><CornerUpLeft size={16}/></button>}
                             {isMe && !msg.is_deleted && <button onClick={() => handleDeleteMessage(msg.id)} className="p-1 hover:text-red-500 text-[#8696a0] transition-colors"><Trash2 size={16}/></button>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Bouncing Typing Indicator */}
                  {typists.length > 0 && (
                     <div className="flex justify-start mb-1 mt-2">
                       <div className="relative rounded-lg px-3 py-2.5 shadow-sm bg-white dark:bg-[#202c33] rounded-tl-none flex items-center gap-1.5 w-fit h-[36px]">
                         <svg viewBox="0 0 8 13" width="8" height="13" className="absolute top-0 left-[-8px] text-white dark:text-[#202c33] fill-current">
                           <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z" transform="matrix(-1 0 0 1 8 0)"></path>
                         </svg>
                         <span className="w-1.5 h-1.5 bg-[#8696a0] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                         <span className="w-1.5 h-1.5 bg-[#8696a0] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                         <span className="w-1.5 h-1.5 bg-[#8696a0] rounded-full animate-bounce"></span>
                       </div>
                     </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {}
                <div className="bg-[#f0f2f5] dark:bg-[#202c33] z-10 border-l border-[#e9edef] dark:border-[#222d34] relative flex flex-col">
                  {showEmojis && (
                    <div className="absolute bottom-[70px] left-4 bg-white dark:bg-[#2a3942] shadow-xl rounded-lg p-3 w-[280px] max-h-[300px] overflow-y-auto border border-[#e9edef] dark:border-[#222d34] grid grid-cols-6 gap-2 z-50">
                      {emojis.map(e => <button key={e} type="button" className="text-xl hover:bg-gray-100 dark:hover:bg-[#202c33] rounded p-1 transition-colors" onClick={() => setInputText(prev => prev + e)}>{e}</button>)}
                    </div>
                  )}
                  
                  {/* Quoted Message Preview Box */}
                  {replyingTo && (
                    <div className="mx-4 mt-2 p-2 bg-black/5 dark:bg-black/20 rounded border-l-4 border-[#00a884] flex items-center justify-between">
                       <div className="flex-1 truncate">
                          <p className="text-[#00a884] font-medium text-sm">{replyingTo.sender === currentUser ? 'You' : replyingTo.sender}</p>
                          <p className="text-[#54656f] dark:text-[#aebac1] text-sm truncate">{replyingTo.text}</p>
                       </div>
                       <button onClick={() => setReplyingTo(null)} className="p-2 text-[#8696a0] hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"><X size={18}/></button>
                    </div>
                  )}

                  <div className="min-h-[62px] px-4 py-2 flex items-end gap-3">
                    <div className="flex items-center gap-3 text-[#54656f] dark:text-[#aebac1] pb-2">
                      <div className="relative group/emojipicker pb-2 -mb-2 cursor-pointer">
                        <button type="button" onClick={() => setShowEmojis(!showEmojis)}><Smile size={24} className="hover:text-[#41525d] dark:hover:text-[#e9edef] transition-colors" /></button>
                      </div>
                      <button type="button" onClick={() => attachmentRef.current?.click()}><Paperclip size={24} className="cursor-pointer hover:text-[#41525d] dark:hover:text-[#e9edef] transition-colors" /></button>
                      <input type="file" ref={attachmentRef} onChange={handleFileUpload} className="hidden" />
                    </div>
                    {isRecording ? (
                      <div className="flex-1 flex items-center justify-between bg-white dark:bg-[#2a3942] rounded-lg px-4 py-2.5 h-[44px] mb-[2px] border border-transparent dark:border-[#222d34] shadow-sm">
                        <div className="flex items-center gap-3"><div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div><span className="text-[#41525d] dark:text-[#d1d7db] font-medium tracking-wider">{formatTime(recordingTime)}</span></div>
                        <button type="button" onClick={() => stopRecording(false)} className="text-[#8696a0] hover:text-red-500 transition-colors flex items-center gap-1 text-sm font-medium"><Trash2 size={18} /> Cancel</button>
                      </div>
                    ) : (
                      <form onSubmit={handleSendMessage} className="flex-1 flex items-end bg-white dark:bg-[#2a3942] rounded-lg overflow-hidden border border-transparent dark:border-[#222d34]">
                        <textarea 
                          value={inputText} 
                          onChange={(e) => {
                             setInputText(e.target.value);
                             if (e.target.value.trim() !== '' && activeChat) {
                                if (Date.now() - lastTypingPing.current > 1500) {
                                  lastTypingPing.current = Date.now();
                                  fetch('/api/typing', { 
                                    method: 'POST', 
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ username: currentUser, chat_id: activeChat })
                                  }).catch(()=>{});
                                }
                             }
                          }} 
                          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }} 
                          placeholder="Type a message" 
                          className="w-full max-h-32 px-4 py-2.5 bg-transparent resize-none focus:outline-none text-[#41525d] dark:text-[#d1d7db] text-sm md:text-base leading-snug" 
                          rows={1}
                        />
                      </form>
                    )}
                    <div className="text-[#54656f] dark:text-[#aebac1] pb-1.5 flex-shrink-0">
                      {isRecording ? <button onClick={() => stopRecording(true)} className="p-2 rounded-full hover:bg-[#d9d9d9] dark:hover:bg-[#374248] transition-colors text-[#00a884]"><Send size={24} /></button> : inputText.trim() ? <button onClick={handleSendMessage} className="p-2 rounded-full hover:bg-[#d9d9d9] dark:hover:bg-[#374248] transition-colors text-[#54656f] dark:text-[#aebac1]"><Send size={24} /></button> : <button onClick={startRecording} className="p-2 rounded-full hover:bg-[#d9d9d9] dark:hover:bg-[#374248] transition-colors text-[#54656f] dark:text-[#aebac1]"><Mic size={24} /></button>}
                    </div>
                  </div>
                </div>
                
                {}
                <div className={`absolute top-0 right-0 h-full w-full md:w-[350px] lg:w-[400px] bg-[#f0f2f5] dark:bg-[#111b21] z-50 transition-transform duration-300 ease-in-out border-l border-[#e9edef] dark:border-[#222d34] shadow-2xl flex flex-col ${showContactInfo ? 'translate-x-0' : 'translate-x-full'}`}>
                  <div className="h-[60px] bg-[#f0f2f5] dark:bg-[#202c33] flex items-center px-6 text-[#54656f] dark:text-[#aebac1] gap-6 shrink-0 border-b border-[#e9edef] dark:border-[#222d34]">
                    <button onClick={() => setShowContactInfo(false)} className="hover:bg-black/10 p-1 rounded-full transition-colors"><ArrowLeft size={24} /></button>
                    <h1 className="text-[16px] font-medium text-[#111b21] dark:text-[#e9edef]">{isGroup ? 'Group info' : 'Contact info'}</h1>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto pb-8">
                    <div className="bg-white dark:bg-[#202c33] flex flex-col items-center py-8 shadow-sm mb-2 px-4 text-center relative group border-b dark:border-[#222d34]">
                      <div className="w-48 h-48 rounded-full overflow-hidden bg-[#dfe5e7] dark:bg-[#6a7175] flex items-center justify-center text-white mb-4 shadow-md relative">
                        {activeProfile?.photo ? <img src={activeProfile.photo} alt="Profile" className="w-full h-full object-cover" /> : <User size={80} className="text-[#a6b0b5] dark:text-[#8696a0]" />}
                        {isAdmin && (
                          <div className="absolute inset-0 bg-black/50 hidden group-hover:flex flex-col items-center justify-center cursor-pointer transition-all" onClick={() => groupPhotoRef.current?.click()}>
                            <Camera size={32} /><span className="text-sm mt-1">Change</span>
                          </div>
                        )}
                      </div>
                      <input type="file" ref={groupPhotoRef} className="hidden" accept="image/*" onChange={handleGroupPhotoUpload} />
                      
                      <div className="flex items-center gap-2">
                        <input value={editGroupName !== '' ? editGroupName : (activeProfile?.displayName || activeChat)} onChange={e => setEditGroupName(e.target.value)} disabled={!isAdmin} className={`text-2xl font-normal text-[#111b21] dark:text-[#e9edef] mb-1 text-center bg-transparent ${isAdmin ? 'border-b border-[#00a884] focus:outline-none' : ''}`} />
                        {isAdmin && editGroupName && <button onClick={saveGroupName} className="text-[#00a884] hover:bg-gray-100 dark:hover:bg-[#2a3942] p-1 rounded-full"><Check size={20}/></button>}
                      </div>
                      <p className="text-[#667781] dark:text-[#8696a0] text-lg">{isGroup ? `Group · ${activeProfile?.groupMembers?.length || 0} participants` : (activeProfile?.contact || '~')}</p>
                    </div>

                    {!isGroup && (
                      <div className="bg-white dark:bg-[#202c33] px-6 py-4 shadow-sm mb-2 border-b dark:border-[#222d34]">
                          <p className="text-[#667781] dark:text-[#8696a0] text-sm mb-2">About and phone number</p>
                          <p className="text-[#111b21] dark:text-[#e9edef] text-base">{activeProfile?.contact || 'No contact info provided.'}</p>
                      </div>
                    )}
                    
                    <div className="bg-white dark:bg-[#202c33] px-6 py-4 shadow-sm mb-2 border-b dark:border-[#222d34] cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2a3942] transition-colors flex items-center justify-between" onClick={() => customWallpaperRef.current?.click()}>
                        <div className="flex items-center gap-4 text-[#111b21] dark:text-[#e9edef]">
                           <ImageIcon size={24} className="text-[#8696a0]"/>
                           <span className="text-base font-normal">Wallpaper</span>
                        </div>
                        {wallpapers[activeChat] && (
                           <button onClick={(e) => { e.stopPropagation(); const newW = {...wallpapers}; delete newW[activeChat]; setWallpapers(newW); localStorage.setItem('whatsapp_wallpapers', JSON.stringify(newW)); }} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded-full text-sm">Remove</button>
                        )}
                        <input type="file" ref={customWallpaperRef} accept="image/*" className="hidden" onChange={handleCustomWallpaperUpload}/>
                    </div>

                    {isGroup && (
                      <div className="bg-white dark:bg-[#202c33] shadow-sm mb-2 pt-4 pb-2 border-b dark:border-[#222d34]">
                        <div className="flex items-center justify-between px-6 mb-3">
                           <p className="text-[#667781] dark:text-[#8696a0] text-sm font-medium">{activeProfile?.groupMembers?.length || 0} participants</p>
                           {isAdmin && (
                              <button onClick={() => setShowAddParticipant(!showAddParticipant)} className="text-[#00a884] text-sm font-medium flex items-center gap-1 hover:underline">
                                <UserPlus size={16}/> Add
                              </button>
                           )}
                        </div>
                        {showAddParticipant && isAdmin && (
                          <form onSubmit={handleAddParticipant} className="px-6 mb-4 flex gap-2">
                             <input value={newParticipant} onChange={e => setNewParticipant(e.target.value)} placeholder="Username" className="flex-1 bg-[#f0f2f5] dark:bg-[#2a3942] text-[#e9edef] px-3 py-2 rounded-lg text-sm focus:outline-none" />
                             <button type="submit" className="bg-[#00a884] text-white px-3 py-2 rounded-lg text-sm font-medium">Add</button>
                          </form>
                        )}
                        {activeProfile?.groupMembers?.map(member => (
                          <div key={member.username} className="flex items-center justify-between px-6 py-3 hover:bg-[#f5f6f6] dark:hover:bg-[#2a3942] transition-colors group">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#dfe5e7] dark:bg-[#6a7175] rounded-full overflow-hidden">
                                {member.profile_photo ? <img src={member.profile_photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white bg-[#a6b0b5] dark:bg-[#8696a0] font-medium uppercase">{member.display_name?.charAt(0) || member.username.charAt(0)}</div>}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[#111b21] dark:text-[#e9edef]">{member.username === currentUser ? 'You' : (member.display_name || member.username)}</span>
                                {member.role === 'admin' && <span className="text-xs text-[#00a884] border border-[#00a884] rounded px-1 w-fit mt-0.5">Admin</span>}
                              </div>
                            </div>
                            {isAdmin && member.username !== currentUser && (
                              <div className="hidden group-hover:flex gap-2">
                                {member.role !== 'admin' ? <button onClick={() => handleGroupAction(member.username, 'admin')} title="Make Admin" className="p-1.5 text-gray-500 hover:text-[#00a884] bg-gray-100 dark:bg-[#111b21] rounded-full"><Shield size={16} /></button> : <button onClick={() => handleGroupAction(member.username, 'member')} title="Remove Admin" className="p-1.5 text-gray-500 hover:text-orange-500 bg-gray-100 dark:bg-[#111b21] rounded-full"><ShieldAlert size={16} /></button>}
                                <button onClick={() => handleGroupAction(member.username, 'remove')} title="Remove User" className="p-1.5 text-gray-500 hover:text-red-500 bg-gray-100 dark:bg-[#111b21] rounded-full"><UserMinus size={16} /></button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <button onClick={handleDeleteChat} className="text-[#ea0038] hover:bg-[#f5f6f6] dark:hover:bg-[#2a3942] flex items-center gap-4 w-full px-6 py-4 bg-white dark:bg-[#202c33] shadow-sm mt-4 transition-colors font-medium border-y dark:border-[#222d34]">
                      <LogOut size={20} className="text-[#ea0038]" />
                      {isGroup ? 'Exit Group' : 'Delete Chat'}
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