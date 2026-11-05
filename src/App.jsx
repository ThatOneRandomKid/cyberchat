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
  Trash2
} from 'lucide-react';

// --- Firebase Config & App Initialization ---
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

// Preset Avatars & Color Gradients
const AVATAR_COLORS = [
  'from-cyan-500 to-blue-600',
  'from-purple-500 to-pink-600',
  'from-emerald-400 to-teal-600',
  'from-amber-400 to-orange-600',
  'from-rose-500 to-red-600',
  'from-indigo-500 to-purple-600'
];

const AVATAR_ICONS = ['👑', '🤖', '⚡', '🔥', '💀', '👽', '🚀', '🎯'];

// Sound FX Synthesizer Generator
const playSoundEffect = (type, soundEnabled) => {
  if (!soundEnabled) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'send') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'receive') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(392.00, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    }
  } catch (e) {
    console.error("Audio error:", e);
  }
};

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

  // Time & Rank Tracking
  const [activeSeconds, setActiveSeconds] = useState(() => {
    const saved = localStorage.getItem('hub_activeseconds');
    return saved ? parseInt(saved, 10) : 0;
  });
  const userRank = (isAdmin ? 100 : 0) + Math.floor(activeSeconds / 60);

  // Room State
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
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  // Dynamic Rooms Sidebar List
  const [sideRooms, setSideRooms] = useState(() => {
    const saved = localStorage.getItem('hub_siderooms');
    return saved ? JSON.parse(saved) : ['cyber-lobby', 'vip-lounge', 'dev-vault'];
  });
  const [newSidebarRoom, setNewSidebarRoom] = useState('');

  const chatEndRef = useRef(null);
  const prevMessagesLength = useRef(0);

  // Save side rooms to local storage whenever modified
  useEffect(() => {
    localStorage.setItem('hub_siderooms', JSON.stringify(sideRooms));
  }, [sideRooms]);

  // Initialize Firebase Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.warn("Firebase Auth fallback enabled:", err);
        if (!auth.currentUser) {
          const localUid = 'user_' + Math.random().toString(36).substring(2, 9);
          setUser({ uid: localUid, isAnonymous: true });
        }
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, []);

  // Parse URL room param
  useEffect(() => {
    try {
      const getRoomFromURL = () => {
        const searchParams = new URLSearchParams(window.location.search);
        let room = searchParams.get('room');
        if (!room && window.location.hash) {
          const hashStr = window.location.hash.split('?')[1] || window.location.hash.replace(/^#\/?/, '');
          const hashParams = new URLSearchParams(hashStr);
          room = hashParams.get('room');
        }
        return room;
      };

      const roomParam = getRoomFromURL();
      if (roomParam) {
        const cleanedRoom = roomParam.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
        setRoomId(cleanedRoom);
        setCustomRoomInput(cleanedRoom);
      }
    } catch (e) {
      console.warn("Error parsing URL room parameter:", e);
    }
  }, []);

  // Timer Heartbeat
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

  // Scroll chat
  useEffect(() => {
    if (inRoom) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, inRoom]);

  // Realtime Global Room Listener (Top-level Collection for all users entering the same room code)
  useEffect(() => {
    if (!user || !inRoom || !roomId) return;

    const userDocRef = doc(db, 'rooms', roomId, 'users', user.uid);
    const unsubscribeUserDoc = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.kicked) {
          setInRoom(false);
          alert("You have been kicked from the room by an Admin.");
        }
        if (data.glitchActive) {
          setActiveGlitchEffect(data.glitchType || 'matrix');
        } else {
          setActiveGlitchEffect(null);
        }
        if (data.isMuted !== undefined) {
          setIsMuted(data.isMuted);
        }
      }
    });

    // Realtime shared messages listener
    const messagesRef = collection(db, 'rooms', roomId, 'messages');
    const unsubscribeMessages = onSnapshot(
      messagesRef,
      (snapshot) => {
        const loadedMessages = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

        if (loadedMessages.length > prevMessagesLength.current && prevMessagesLength.current > 0) {
          const lastMsg = loadedMessages[loadedMessages.length - 1];
          if (lastMsg.userId !== user.uid) {
            playSoundEffect('receive', soundEnabled);
          }
        }
        prevMessagesLength.current = loadedMessages.length;
        setMessages(loadedMessages);
      },
      (error) => console.error("Firestore message sub error:", error)
    );

    // Online Presence
    const registerPresence = async () => {
      await setDoc(userDocRef, {
        uid: user.uid,
        name: userName || 'Anonymous',
        icon: userIcon,
        gradient: userGradient,
        rank: userRank,
        isAdmin: isAdmin,
        lastActive: Date.now()
      });
    };

    registerPresence();
    const heartbeatInterval = setInterval(registerPresence, 15000);

    const usersCollectionRef = collection(db, 'rooms', roomId, 'users');
    const unsubscribeUsers = onSnapshot(
      usersCollectionRef,
      (snapshot) => {
        const now = Date.now();
        const activeList = snapshot.docs
          .map(doc => doc.data())
          .filter(u => now - (u.lastActive || 0) < 60000);
        setActiveUsers(activeList);
      },
      (error) => console.error("Presence sync error:", error)
    );

    return () => {
      unsubscribeUserDoc();
      unsubscribeMessages();
      unsubscribeUsers();
      clearInterval(heartbeatInterval);
      deleteDoc(userDocRef).catch(() => {});
    };
  }, [user, inRoom, roomId, soundEnabled, userName, userIcon, userGradient, userRank, isAdmin]);

  // Sign In Handler
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
      localStorage.setItem('hub_usericon', '👑');
    } else {
      setIsAdmin(false);
      localStorage.setItem('hub_isadmin', 'false');
      setUserIcon('⭐');
      localStorage.setItem('hub_usericon', '⭐');
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

  // Join Room & Add to Sidebar
  const handleJoinRoom = (targetRoomId) => {
    const cleaned = targetRoomId.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    if (!cleaned) return;
    
    setSideRooms((prev) => {
      if (!prev.includes(cleaned)) {
        return [...prev, cleaned];
      }
      return prev;
    });
    
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

  // Delete Room from Sidebar
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

  // Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (isMuted) {
      alert("You are currently muted by an Admin.");
      return;
    }
    if ((!inputMessage.trim() && !mediaUrlInput.trim()) || !user || !roomId) return;

    try {
      const messagesRef = collection(db, 'rooms', roomId, 'messages');
      await addDoc(messagesRef, {
        userId: user.uid,
        userName: userName,
        userIcon: userIcon,
        userGradient: userGradient,
        rank: userRank,
        isAdmin: isAdmin,
        text: inputMessage.trim(),
        mediaUrl: mediaUrlInput.trim() || null,
        createdAt: Date.now()
      });

      setInputMessage('');
      setMediaUrlInput('');
      setShowMediaModal(false);
      playSoundEffect('send', soundEnabled);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleCopyShareLink = () => {
    const shareableUrl = `${window.location.origin}${window.location.pathname}?room=${roomId || customRoomInput || 'cyber-lobby'}`;
    try {
      navigator.clipboard.writeText(shareableUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = shareableUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      });
    } catch (e) {
      console.warn("Clipboard fallback used:", e);
    }
  };

  // Admin Actions
  const handleKickUser = async (targetUid, targetName) => {
    if (!isAdmin) return;
    try {
      const targetRef = doc(db, 'rooms', roomId, 'users', targetUid);
      await updateDoc(targetRef, { kicked: true });
     
      const messagesRef = collection(db, 'rooms', roomId, 'messages');
      await addDoc(messagesRef, {
        userId: 'system',
        userName: 'SYSTEM',
        userIcon: '🤖',
        text: ` ${userName} kicked ${targetName} from the room.`,
        createdAt: Date.now()
      });
    } catch (err) {
      console.error("Error kicking user:", err);
    }
  };

  const handleToggleMute = async (targetUid, currentMuteState, targetName) => {
    if (!isAdmin) return;
    try {
      const targetRef = doc(db, 'rooms', roomId, 'users', targetUid);
      await updateDoc(targetRef, { isMuted: !currentMuteState });
     
      const messagesRef = collection(db, 'rooms', roomId, 'messages');
      await addDoc(messagesRef, {
        userId: 'system',
        userName: 'SYSTEM',
        userIcon: '🤖',
        text: ` ${userName} ${!currentMuteState ? 'muted' : 'unmuted'} ${targetName}.`,
        createdAt: Date.now()
      });
    } catch (err) {
      console.error("Error toggling mute:", err);
    }
  };

  const handleTriggerFakeGlitch = async (targetUid, targetName, glitchType = 'matrix') => {
    if (!isAdmin) return;
    try {
      const targetRef = doc(db, 'rooms', roomId, 'users', targetUid);
      await updateDoc(targetRef, {
        glitchActive: true,
        glitchType: glitchType
      });

      const messagesRef = collection(db, 'rooms', roomId, 'messages');
      await addDoc(messagesRef, {
        userId: 'system',
        userName: 'SYSTEM',
        userIcon: '🤖',
        text: ` LEO_ triggered a fake glitch simulation on ${targetName}'s screen! `,
        createdAt: Date.now()
      });

      setTimeout(async () => {
        try {
          await updateDoc(targetRef, { glitchActive: false });
        } catch (e) {}
      }, 8000);
    } catch (err) {
      console.error("Error triggering glitch:", err);
    }
  };

  const handleSendInteraction = async (targetName, actionType, emoji) => {
    try {
      const messagesRef = collection(db, 'rooms', roomId, 'messages');
      await addDoc(messagesRef, {
        userId: user.uid,
        userName: userName,
        userIcon,
        userGradient,
        rank: userRank,
        isAdmin: isAdmin,
        text: `${userName} ${actionType} ${targetName}! ${emoji}`,
        createdAt: Date.now()
      });
      playSoundEffect('send', soundEnabled);
    } catch (err) {
      console.error("Error sending interaction:", err);
    }
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-mono overflow-hidden relative ${
      activeGlitchEffect ? 'animate-bounce border-4 border-red-500' : ''
    }`}>

      {/* FAKE GLITCH VISUAL OVERLAY */}
      {activeGlitchEffect && (
        <div className="fixed inset-0 z-50 pointer-events-auto bg-black/80 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md animate-pulse">
          <div className="text-red-500 text-6xl font-mono font-extrabold tracking-widest mb-4 animate-ping">
            SYSTEM_GLITCH_OVERRIDE
          </div>
          <div className="text-green-400 font-mono text-sm max-w-lg space-y-2 bg-slate-900/90 border border-green-500/50 p-6 rounded-2xl shadow-2xl">
            <p className="text-xl font-bold text-amber-400"> HARMLESS FAKE GLITCH ACTIVATED BY LEO_ </p>
            <p className="text-xs text-slate-300">Your account is safe! This is a visual troll effect triggered by the room Admin.</p>
            <div className="h-24 overflow-hidden text-[10px] text-green-500/70 font-mono text-left bg-black/50 p-2 rounded">
              01001100 01000101 01001111 01011111 01000001 01000100 01001101 01001001 01001110
              ERR_FAKE_CORRUPTION_DETECTED... SCANNING MATRIX MEMORY...
              NO REAL DATA AFFECTED. CLEARING VIRTUAL SIMULATION...
            </div>
            <button
              onClick={() => setActiveGlitchEffect(null)}
              className="mt-4 bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-6 py-2 rounded-xl border border-red-400 shadow-lg"
            >
              Clear Glitch FX Now
            </button>
          </div>
        </div>
      )}

      {/* LOGIN PORTAL */}
      {!isProfileSet || !inRoom ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 relative overflow-y-auto">
          <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-xl relative">
            <button
              onClick={handleCopyShareLink}
              className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold transition"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              {copiedLink ? 'Copied!' : 'Copy Page Link'}
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/20">
                <Sparkles className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
                CYBERHUB
              </h1>
              <p className="text-xs text-slate-400 mt-1">Sign in to access your chat account & join rooms</p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => {
                    setUserName(e.target.value);
                    setNameError('');
                  }}
                  placeholder="CyberKnight99"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 outline-none text-sm font-semibold transition"
                  required
                />
              </div>

              {userName.trim() === 'LEO_' && (
                <div className="animate-fadeIn">
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> Admin Password for LEO_
                  </label>
                  <input
                    type="password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder="Enter admin password..."
                    className="w-full bg-amber-950/20 border border-amber-500/50 focus:border-amber-400 rounded-xl px-4 py-3 text-amber-200 placeholder-amber-700 outline-none text-sm font-semibold transition"
                    required
                  />
                </div>
              )}

              {nameError && (
                <p className="text-xs text-rose-400 font-bold bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/30">
                  {nameError}
                </p>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Avatar Badge ({userName.trim() === 'LEO_' ? 'Admin Custom' : 'Standard Star Badge'})
                </label>
                {userName.trim() === 'LEO_' ? (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {AVATAR_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setUserIcon(icon)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition shrink-0 ${
                          userIcon === icon ? 'bg-cyan-500 border-2 border-white scale-110' : 'bg-slate-800 hover:bg-slate-700'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center gap-2">
                    <span className="text-lg">⭐</span> Standard users receive the default star badge.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Color Energy
                </label>
                <div className="flex gap-2">
                  {AVATAR_COLORS.map((grad) => (
                    <button
                      key={grad}
                      type="button"
                      onClick={() => setUserGradient(grad)}
                      className={`h-8 flex-1 rounded-xl bg-gradient-to-r ${grad} transition ${
                        userGradient === grad ? 'ring-2 ring-white scale-105' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Room ID / Code
                </label>
                <input
                  type="text"
                  value={customRoomInput}
                  onChange={(e) => setCustomRoomInput(e.target.value)}
                  placeholder="e.g. cyber-lobby"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 outline-none text-sm font-semibold transition"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition"
              >
                <LogIn className="w-5 h-5" /> Sign In / Enter Hub
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* MAIN CHAT APPLICATION */
        <div className="flex-1 flex flex-col h-screen">
          {/* HEADER BAR */}
          <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${userGradient} flex items-center justify-center text-xl shadow-md relative`}>
                {userIcon}
                {isAdmin && <Crown className="w-3.5 h-3.5 text-amber-400 absolute -top-1 -right-1" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-slate-100">{userName}</h2>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
                    Rank {userRank}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Room: <span className="text-cyan-400 font-mono">#{roomId}</span></p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyShareLink}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 font-bold transition"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-cyan-400" />}
                <span className="hidden sm:inline">{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
              </button>

              <button
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                className="md:hidden p-2 bg-slate-800 text-slate-300 rounded-xl border border-slate-700"
              >
                <Users className="w-4 h-4" />
              </button>

              <button
                onClick={handleSignOut}
                className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 font-bold transition"
              >
                <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            {/* LEFT ROOM NAVIGATION SIDEBAR */}
            <aside className="hidden md:flex w-64 bg-slate-900/80 border-r border-slate-800 p-4 flex-col gap-4">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Cyber Rooms</span>
              </div>

              <form onSubmit={handleAddSidebarRoom} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New room code..."
                  value={newSidebarRoom}
                  onChange={(e) => setNewSidebarRoom(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  className="bg-cyan-500 text-slate-950 p-1.5 rounded-xl hover:bg-cyan-400 font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>

              <div className="flex-1 overflow-y-auto space-y-1">
                {sideRooms.map((r) => (
                  <div
                    key={r}
                    onClick={() => handleJoinRoom(r)}
                    className={`group w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      roomId === r
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Hash className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="truncate">{r}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteRoom(r, e)}
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-400 transition p-1"
                      title="Delete room"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-rose-400" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">Online Members</div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {activeUsers.map((u) => (
                    <div key={u.uid} className="flex items-center justify-between text-xs text-slate-300">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="truncate">{u.name}</span>
                      </div>
                      {isAdmin && u.uid !== user?.uid && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleToggleMute(u.uid, u.isMuted, u.name)}
                            className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded hover:bg-amber-500/40"
                          >
                            {u.isMuted ? 'Unmute' : 'Mute'}
                          </button>
                          <button
                            onClick={() => handleKickUser(u.uid, u.name)}
                            className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded hover:bg-rose-500/40"
                          >
                            Kick
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* MESSAGES FEED */}
            <main className="flex-1 flex flex-col bg-slate-950 p-4 overflow-hidden relative">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
                    <MessageSquare className="w-12 h-12 text-slate-700" />
                    <p className="text-sm font-semibold">No messages yet in #{roomId}. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.userId === user?.uid;
                    const isSystem = m.userId === 'system';
                    const isMsgAdmin = m.isAdmin || m.userName === 'LEO_';

                    if (isSystem) {
                      return (
                        <div key={m.id} className="flex justify-center my-2">
                          <div className="bg-slate-900/80 border border-slate-800 text-slate-300 text-xs px-4 py-1.5 rounded-full font-semibold">
                            {m.text}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={m.id} className={`flex gap-3 max-w-2xl ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${m.userGradient || 'from-slate-700 to-slate-800'} flex items-center justify-center text-base shrink-0 shadow`}>
                          {m.userIcon || '⭐'}
                        </div>
                        <div className={`space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`flex items-center gap-2 ${isMe ? 'justify-end' : ''}`}>
                            <span className={`text-xs font-bold ${isMsgAdmin ? 'text-amber-400 flex items-center gap-1' : 'text-slate-300'}`}>
                              {isMsgAdmin && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                              {m.userName}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              isMsgAdmin
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-cyan-400'
                            }`}>
                              R{m.rank || (isMsgAdmin ? 100 : 0)}
                            </span>
                          </div>

                          {/* Message Bubble Styling */}
                          <div className={`p-3.5 rounded-2xl text-sm ${
                            isMsgAdmin
                              ? 'bg-amber-950/40 border border-amber-500/50 text-amber-200 shadow-lg shadow-amber-500/10'
                              : isMe
                              ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-tr-none'
                              : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none'
                          }`}>
                            <p className="whitespace-pre-wrap break-words">{m.text}</p>
                            {m.mediaUrl && (
                              <img
                                src={m.mediaUrl}
                                alt="Shared media"
                                className="mt-2 rounded-xl max-h-60 w-full object-cover border border-slate-800"
                              />
                            )}
                          </div>

                          {!isMe && (
                            <div className="flex gap-2 text-[10px] text-slate-400 pt-1">
                              <button onClick={() => handleSendInteraction(m.userName, 'slapped', '✋')} className="hover:text-amber-400 font-bold">✋ Slap</button>
                              <button onClick={() => handleSendInteraction(m.userName, 'kissed', '😘')} className="hover:text-pink-400 font-bold">😘 Kiss</button>
                              <button onClick={() => handleSendInteraction(m.userName, 'high-fived', '🙏')} className="hover:text-cyan-400 font-bold">🙏 High-Five</button>
                              {isAdmin && (
                                <button onClick={() => handleTriggerFakeGlitch(m.userId, m.userName)} className="hover:text-red-400 font-bold">⚠️ Fake Glitch</button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* INPUT FORM */}
              <form onSubmit={handleSendMessage} className="mt-3 flex gap-2 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={isMuted ? "You are muted by Admin..." : "Type your message..."}
                  disabled={isMuted}
                  className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-2xl px-4 py-3 text-slate-100 placeholder-slate-500 outline-none text-sm font-semibold transition disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={() => setShowMediaModal(!showMediaModal)}
                  className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-cyan-400 rounded-2xl transition"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>

                <button
                  type="submit"
                  disabled={isMuted || (!inputMessage.trim() && !mediaUrlInput.trim())}
                  className="px-5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-lg shadow-cyan-500/20 flex items-center justify-center transition"
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
