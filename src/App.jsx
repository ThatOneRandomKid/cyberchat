import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import {
  Send,
  Volume2,
  VolumeX,
  Check,
  Users,
  MessageSquare,
  LogOut,
  Sparkles,
  Crown,
  Lock,
  Share2,
  LogIn,
  Plus,
  Hash,
  ImageIcon,
  Trash2,
  ShieldCheck,
  UserCheck,
  UserX
} from 'lucide-react';

// --- Firebase Config & Fallback ---
const firebaseConfig = typeof __firebase_config !== 'undefined'
  ? JSON.parse(__firebase_config)
  : {
      apiKey: "demo-api-key",
      authDomain: "demo-app.firebaseapp.com",
      projectId: "demo-app",
      storageBucket: "demo-app.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:demo"
    };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'cyber-hub-v1';

const AVATAR_COLORS = [
  'from-cyan-500 to-blue-600',
  'from-purple-500 to-pink-600',
  'from-emerald-400 to-teal-600',
  'from-amber-400 to-orange-600',
  'from-rose-500 to-red-600',
  'from-indigo-500 to-purple-600'
];

const AVATAR_ICONS = ['👑', '🤖', '⚡', '🔥', '💀', '👽', '🚀', '🎯'];

export default function App() {
  // Auth & Profile State
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState(() => localStorage.getItem('hub_username') || '');
  const [userPassword, setUserPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('hub_isadmin') === 'true');

  const [activeGlitchEffect, setActiveGlitchEffect] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  const [userIcon, setUserIcon] = useState(() => localStorage.getItem('hub_usericon') || (isAdmin ? '👑' : '⭐'));
  const [userGradient, setUserGradient] = useState(() => localStorage.getItem('hub_usergradient') || AVATAR_COLORS[0]);
  const [isProfileSet, setIsProfileSet] = useState(() => localStorage.getItem('hub_isregistered') === 'true');

  // Active seconds & rank
  const [activeSeconds, setActiveSeconds] = useState(() => {
    const saved = localStorage.getItem('hub_activeseconds');
    return saved ? parseInt(saved, 10) : 0;
  });
  const userRank = (isAdmin ? 100 : 0) + Math.floor(activeSeconds / 60);

  // Room & State
  const [roomId, setRoomId] = useState('');
  const [inRoom, setInRoom] = useState(false);
  const [messages, setMessages] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [customRoomInput, setCustomRoomInput] = useState('');
  
  // Room Metadata & Access Control
  const [roomCreators, setRoomCreators] = useState(() => {
    const saved = localStorage.getItem('hub_room_creators');
    return saved ? JSON.parse(saved) : {};
  });
  const [joinRequests, setJoinRequests] = useState([]);
  const [approvedRooms, setApprovedRooms] = useState(() => {
    const saved = localStorage.getItem('hub_approved_rooms');
    return saved ? JSON.parse(saved) : [];
  });

  const [sideRooms, setSideRooms] = useState(() => {
    const saved = localStorage.getItem('hub_siderooms');
    return saved ? JSON.parse(saved) : ['cyber-lobby', 'vip-lounge', 'dev-vault'];
  });
  const [newSidebarRoom, setNewSidebarRoom] = useState('');

  const chatEndRef = useRef(null);

  // Save state tracking to localStorage
  useEffect(() => {
    localStorage.setItem('hub_siderooms', JSON.stringify(sideRooms));
  }, [sideRooms]);

  useEffect(() => {
    localStorage.setItem('hub_room_creators', JSON.stringify(roomCreators));
  }, [roomCreators]);

  useEffect(() => {
    localStorage.setItem('hub_approved_rooms', JSON.stringify(approvedRooms));
  }, [approvedRooms]);

  // Auth Initialization
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        if (!auth.currentUser) {
          const localUid = 'user_' + Math.random().toString(36).substring(2, 9);
          setUser({ uid: localUid, isAnonymous: true });
        }
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Sync Messages and Actions across Browser Tabs via BroadcastChannel / LocalStorage
  useEffect(() => {
    if (!inRoom || !roomId) return;

    const handleStorageEvent = (e) => {
      if (e.key === `hub_msg_sync_${roomId}`) {
        if (e.newValue) {
          setMessages(JSON.parse(e.newValue));
        }
      }
      if (e.key === `hub_requests_sync_${roomId}`) {
        if (e.newValue) {
          setJoinRequests(JSON.parse(e.newValue));
        }
      }
      if (e.key === `hub_creators_sync`) {
        if (e.newValue) {
          setRoomCreators(JSON.parse(e.newValue));
        }
      }
    };

    // Load initial messages for room
    const existingMsgs = localStorage.getItem(`hub_msg_sync_${roomId}`);
    if (existingMsgs) {
      setMessages(JSON.parse(existingMsgs));
    } else {
      setMessages([]);
    }

    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, [inRoom, roomId]);

  // Heartbeat & Rank Timer
  useEffect(() => {
    if (!inRoom) return;
    const timer = setInterval(() => {
      setActiveSeconds((prev) => {
        const nextSec = prev + 1;
        localStorage.setItem('hub_activeseconds', nextSec.toString());
        return nextSec;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [inRoom]);

  // Scroll Chat to bottom
  useEffect(() => {
    if (inRoom) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, inRoom]);

  const handleSignIn = (e) => {
    e.preventDefault();
    setNameError('');

    const cleanName = userName.trim();
    if (!cleanName) {
      setNameError('Please enter a valid display name.');
      return;
    }

    if (cleanName === 'LEO_') {
      if (userPassword !== 'password') {
        setNameError('Incorrect admin password for LEO_.');
        return;
      }
      setIsAdmin(true);
      localStorage.setItem('hub_isadmin', 'true');
      setUserIcon('👑');
    } else {
      setIsAdmin(false);
      localStorage.setItem('hub_isadmin', 'false');
      setUserIcon('⭐');
    }

    localStorage.setItem('hub_username', cleanName);
    localStorage.setItem('hub_usergradient', userGradient);
    localStorage.setItem('hub_isregistered', 'true');
    setIsProfileSet(true);

    const targetRoom = customRoomInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'cyber-lobby';
    handleJoinRoom(targetRoom);
  };

  const handleSignOut = () => {
    localStorage.removeItem('hub_username');
    localStorage.removeItem('hub_isregistered');
    localStorage.removeItem('hub_isadmin');
    setIsProfileSet(false);
    setInRoom(false);
    setUserName('');
    setUserPassword('');
  };

  // Join Room with Creator Authorization
  const handleJoinRoom = (targetRoomId) => {
    const cleaned = targetRoomId.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    if (!cleaned) return;

    // Register creator if room doesn't exist
    let currentCreators = { ...roomCreators };
    if (!currentCreators[cleaned]) {
      currentCreators[cleaned] = userName;
      setRoomCreators(currentCreators);
      localStorage.setItem('hub_creators_sync', JSON.stringify(currentCreators));
    }

    const creatorName = currentCreators[cleaned];
    const isCreator = creatorName === userName;
    const isAlreadyApproved = approvedRooms.includes(cleaned);

    if (!isCreator && !isAdmin && !isAlreadyApproved) {
      // Send Join Request to Creator
      const existingReqs = JSON.parse(localStorage.getItem(`hub_requests_sync_${cleaned}`) || '[]');
      if (!existingReqs.some(r => r.user === userName)) {
        const updatedReqs = [...existingReqs, { user: userName, time: new Date().toLocaleTimeString() }];
        localStorage.setItem(`hub_requests_sync_${cleaned}`, JSON.stringify(updatedReqs));
        window.dispatchEvent(new Event('storage'));
      }
      alert(`⏳ Room #${cleaned} is private. Join request sent to creator (@${creatorName}). Please wait for approval!`);
      return;
    }

    setSideRooms((prev) => (!prev.includes(cleaned) ? [...prev, cleaned] : prev));
    setRoomId(cleaned);
    setInRoom(true);
  };

  const handleAddSidebarRoom = (e) => {
    e.preventDefault();
    const cleaned = newSidebarRoom.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    if (!cleaned) return;
    handleJoinRoom(cleaned);
    setNewSidebarRoom('');
  };

  const handleDeleteRoom = (roomToDelete, e) => {
    e.stopPropagation();
    const updated = sideRooms.filter((r) => r !== roomToDelete);
    setSideRooms(updated);
    if (roomId === roomToDelete) {
      if (updated.length > 0) {
        setRoomId(updated[0]);
      } else {
        setInRoom(false);
      }
    }
  };

  // Approval Engine for Creator
  const handleApproveUser = (targetUser) => {
    const updatedReqs = joinRequests.filter(r => r.user !== targetUser);
    setJoinRequests(updatedReqs);
    localStorage.setItem(`hub_requests_sync_${roomId}`, JSON.stringify(updatedReqs));

    // Notify approved user
    const updatedApproved = [...approvedRooms, roomId];
    setApprovedRooms(updatedApproved);

    // Add System Message
    const systemMsg = {
      id: Date.now(),
      userId: 'system',
      userName: 'SYSTEM',
      text: `✅ Creator @${userName} approved @${targetUser} into the room!`,
      createdAt: Date.now()
    };
    const updatedMsgs = [...messages, systemMsg];
    setMessages(updatedMsgs);
    localStorage.setItem(`hub_msg_sync_${roomId}`, JSON.stringify(updatedMsgs));
    window.dispatchEvent(new Event('storage'));
  };

  const handleDenyUser = (targetUser) => {
    const updatedReqs = joinRequests.filter(r => r.user !== targetUser);
    setJoinRequests(updatedReqs);
    localStorage.setItem(`hub_requests_sync_${roomId}`, JSON.stringify(updatedReqs));
    window.dispatchEvent(new Event('storage'));
  };

  // Send Message & Sync locally
  const handleSendMessage = (e) => {
    e.preventDefault();
    if ((!inputMessage.trim() && !mediaUrlInput.trim()) || !roomId) return;

    const isCreator = roomCreators[roomId] === userName;

    const newMsg = {
      id: Date.now(),
      userId: user?.uid || userName,
      userName: userName,
      userIcon: userIcon,
      userGradient: userGradient,
      rank: userRank,
      isAdmin: isAdmin,
      isCreator: isCreator,
      text: inputMessage.trim(),
      mediaUrl: mediaUrlInput.trim() || null,
      createdAt: Date.now()
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    localStorage.setItem(`hub_msg_sync_${roomId}`, JSON.stringify(updated));
    
    // Broadcast change
    window.dispatchEvent(new Event('storage'));

    setInputMessage('');
    setMediaUrlInput('');
    setShowMediaModal(false);
  };

  const handleCopyShareLink = () => {
    const shareableUrl = `${window.location.origin}${window.location.pathname}?room=${roomId || customRoomInput || 'cyber-lobby'}`;
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const isCurrentRoomCreator = roomCreators[roomId] === userName;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-mono overflow-hidden">
      {!isProfileSet || !inRoom ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
          <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
            <div className="text-center mb-6">
              <Sparkles className="w-12 h-12 text-cyan-400 mx-auto mb-2 animate-pulse" />
              <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                CYBERHUB
              </h1>
              <p className="text-xs text-slate-400 mt-1">Sign in & create or join private rooms</p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Username</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. steve or bob"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {userName.trim() === 'LEO_' && (
                <div>
                  <label className="block text-xs font-bold uppercase text-amber-400 mb-1">Admin Password</label>
                  <input
                    type="password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    className="w-full bg-amber-950/20 border border-amber-500/50 rounded-xl px-4 py-3 text-amber-200 outline-none"
                    required
                  />
                </div>
              )}

              {nameError && <p className="text-xs text-rose-400 font-bold">{nameError}</p>}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Room ID / Code</label>
                <input
                  type="text"
                  value={customRoomInput}
                  onChange={(e) => setCustomRoomInput(e.target.value)}
                  placeholder="e.g. test1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-extrabold rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" /> Enter Cyberhub Room
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-screen">
          {/* TOP BAR */}
          <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${userGradient} flex items-center justify-center text-xl shadow-md`}>
                {userIcon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-slate-100">{userName}</h2>
                  {isCurrentRoomCreator && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-amber-400" /> CREATOR
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400">Room: <span className="text-cyan-400 font-mono">#{roomId}</span></p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyShareLink}
                className="bg-slate-800 text-slate-200 border border-slate-700 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 font-bold"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-cyan-400" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>

              <button
                onClick={handleSignOut}
                className="bg-rose-950/40 text-rose-300 border border-rose-500/30 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 font-bold"
              >
                <LogOut className="w-4 h-4" /> <span>Sign Out</span>
              </button>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            {/* LEFT SIDEBAR */}
            <aside className="w-64 bg-slate-900/80 border-r border-slate-800 p-4 flex flex-col gap-4">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Cyber Rooms</span>
              </div>

              <form onSubmit={handleAddSidebarRoom} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New room..."
                  value={newSidebarRoom}
                  onChange={(e) => setNewSidebarRoom(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                />
                <button type="submit" className="bg-cyan-500 text-slate-950 p-1.5 rounded-xl font-bold">
                  <Plus className="w-4 h-4" />
                </button>
              </form>

              <div className="flex-1 overflow-y-auto space-y-1">
                {sideRooms.map((r) => (
                  <div
                    key={r}
                    onClick={() => handleJoinRoom(r)}
                    className={`group w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                      roomId === r ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Hash className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="truncate">{r}</span>
                    </div>
                    <button onClick={(e) => handleDeleteRoom(r, e)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Creator Pending Approval Requests Panel */}
              {isCurrentRoomCreator && joinRequests.length > 0 && (
                <div className="pt-3 border-t border-slate-800 bg-amber-950/20 p-2 rounded-xl border border-amber-500/30">
                  <div className="text-[10px] text-amber-400 font-bold uppercase mb-2 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Pending Approvals ({joinRequests.length})
                  </div>
                  <div className="space-y-2">
                    {joinRequests.map((req) => (
                      <div key={req.user} className="flex items-center justify-between text-xs bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                        <span className="font-bold text-slate-200 truncate">{req.user}</span>
                        <div className="flex gap-1">
                          <button onClick={() => handleApproveUser(req.user)} className="p-1 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/40">
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDenyUser(req.user)} className="p-1 bg-rose-500/20 text-rose-400 rounded hover:bg-rose-500/40">
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>

            {/* CHAT FEED */}
            <main className="flex-1 flex flex-col bg-slate-950 p-4 overflow-hidden relative">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {messages.map((m) => {
                  const isMe = m.userName === userName;
                  const isSystem = m.userId === 'system';
                  const isMsgCreator = m.isCreator || roomCreators[roomId] === m.userName;

                  if (isSystem) {
                    return (
                      <div key={m.id} className="flex justify-center my-2">
                        <div className="bg-slate-900 border border-slate-800 text-slate-300 text-xs px-4 py-1.5 rounded-full font-semibold">
                          {m.text}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={m.id} className={`flex gap-3 max-w-2xl ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${m.userGradient || 'from-slate-700 to-slate-800'} flex items-center justify-center text-base shrink-0`}>
                        {m.userIcon || '⭐'}
                      </div>
                      <div className={`space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`flex items-center gap-2 ${isMe ? 'justify-end' : ''}`}>
                          <span className={`text-xs font-bold ${isMsgCreator ? 'text-amber-400 flex items-center gap-1' : 'text-slate-300'}`}>
                            {isMsgCreator && <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />}
                            {m.userName}
                          </span>
                          {isMsgCreator && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded-full font-black">
                              CREATOR
                            </span>
                          )}
                        </div>

                        <div className={`p-3.5 rounded-2xl text-sm ${
                          isMsgCreator
                            ? 'bg-amber-950/30 border border-amber-500/40 text-amber-100 shadow-md shadow-amber-500/5'
                            : isMe
                            ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-tr-none'
                            : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none'
                        }`}>
                          <p className="whitespace-pre-wrap break-words">{m.text}</p>
                          {m.mediaUrl && (
                            <img src={m.mediaUrl} alt="Shared media" className="mt-2 rounded-xl max-h-60 w-full object-cover border border-slate-800" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* INPUT FORM */}
              <form onSubmit={handleSendMessage} className="mt-3 flex gap-2 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-2xl px-4 py-3 text-slate-100 outline-none text-sm font-semibold"
                />

                <button
                  type="button"
                  onClick={() => setShowMediaModal(!showMediaModal)}
                  className="p-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 rounded-2xl"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>

                <button
                  type="submit"
                  disabled={!inputMessage.trim() && !mediaUrlInput.trim()}
                  className="px-5 bg-gradient-to-r from-cyan-500 to-indigo-600 disabled:opacity-50 text-white font-extrabold rounded-2xl flex items-center justify-center"
                >
                  <Send className="w-5 h-5" />
                </button>

                {showMediaModal && (
                  <div className="absolute bottom-16 right-0 w-80 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-2xl space-y-2 z-40">
                    <h4 className="text-xs font-bold text-slate-300">Attach Image / Gif URL</h4>
                    <input
                      type="url"
                      placeholder="https://example.com/image.png"
                      value={mediaUrlInput}
                      onChange={(e) => setMediaUrlInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMediaModal(false)}
                      className="w-full py-1.5 bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl"
                    >
                      Attach Link
                    </button>
                  </div>
                )}
              </form>
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
