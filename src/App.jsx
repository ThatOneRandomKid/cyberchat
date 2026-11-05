import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import {
  Send, Users, LogOut, Sparkles, Crown, Lock, LogIn, Plus, Hash,
  ImageIcon, Trash2, UserCheck, UserX, Disc, Clock, Terminal, Flag, Palette, ShieldAlert, Ban
} from 'lucide-react';

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

const ALL_COLOR_GRADIENTS = [
  'from-cyan-500 to-blue-600',
  'from-purple-500 to-pink-600',
  'from-emerald-400 to-teal-600',
  'from-amber-400 to-orange-600',
  'from-rose-500 to-red-600'
];

const getRankIcon = (rank, isAdmin) => {
  if (isAdmin) return '👑';
  if (rank >= 50) return '💎';
  if (rank >= 20) return '🚀';
  if (rank >= 10) return '🔥';
  if (rank >= 5) return '⚡';
  return '⭐';
};

export default function App() {
  const [userName, setUserName] = useState(() => localStorage.getItem('hub_username') || '');
  const [userPassword, setUserPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('hub_isadmin') === 'true');
  const [isProfileSet, setIsProfileSet] = useState(() => localStorage.getItem('hub_isregistered') === 'true');

  const [userGradient] = useState(() => localStorage.getItem('hub_usergradient') || ALL_COLOR_GRADIENTS[0]);

  const [activeSeconds, setActiveSeconds] = useState(() => {
    const saved = localStorage.getItem('hub_activeseconds');
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const userRank = (isAdmin ? 100 : 0) + Math.floor(activeSeconds / 300);
  const currentBadgeIcon = getRankIcon(userRank, isAdmin);

  const [roomId, setRoomId] = useState('');
  const [inRoom, setInRoom] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [customRoomInput, setCustomRoomInput] = useState('');
  const [banUserInput, setBanUserInput] = useState('');
  const [showBanModal, setShowBanModal] = useState(false);

  const [bannedList, setBannedList] = useState(() => {
    const saved = localStorage.getItem('hub_banned_users');
    return saved ? JSON.parse(saved) : {};
  });

  const [roomCreators, setRoomCreators] = useState(() => {
    const saved = localStorage.getItem('hub_room_creators');
    return saved ? JSON.parse(saved) : {};
  });

  const [sideRooms, setSideRooms] = useState(() => {
    const saved = localStorage.getItem('hub_siderooms');
    return saved ? JSON.parse(saved) : [];
  });
  const [newSidebarRoom, setNewSidebarRoom] = useState('');

  const chatEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('hub_siderooms', JSON.stringify(sideRooms));
  }, [sideRooms]);

  useEffect(() => {
    localStorage.setItem('hub_room_creators', JSON.stringify(roomCreators));
  }, [roomCreators]);

  useEffect(() => {
    localStorage.setItem('hub_banned_users', JSON.stringify(bannedList));
  }, [bannedList]);

  useEffect(() => {
    if (!roomId || !inRoom) return;

    // Check Ban Status
    const currentRoomBans = bannedList[roomId] || [];
    if (currentRoomBans.includes(userName) && !isAdmin) {
      setIsBanned(true);
      setInRoom(false);
      return;
    }

    const roomMsgsKey = `hub_msg_sync_${roomId}`;
    const savedMsgs = localStorage.getItem(roomMsgsKey);
    setMessages(savedMsgs ? JSON.parse(savedMsgs) : []);

    const handleStorageEvent = (e) => {
      if (e.key === roomMsgsKey && e.newValue) {
        setMessages(JSON.parse(e.newValue));
      }
      if (e.key === `hub_bans_sync_${roomId}`) {
        const updatedBans = e.newValue ? JSON.parse(e.newValue) : [];
        if (updatedBans.includes(userName) && !isAdmin) {
          setIsBanned(true);
          setInRoom(false);
        }
      }
    };
    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, [roomId, inRoom, userName, bannedList, isAdmin]);

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

  useEffect(() => {
    if (inRoom) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, inRoom]);

  const handleSignIn = (e) => {
    e.preventDefault();
    setNameError('');
    const cleanName = userName.trim();
    if (!cleanName) return setNameError('Please enter a display name.');
    if (!userPassword.trim()) return setNameError('Password is required.');

    if (cleanName === 'LEO_') {
      if (userPassword !== 'password') return setNameError('Incorrect admin password.');
      setIsAdmin(true);
      localStorage.setItem('hub_isadmin', 'true');
    } else {
      setIsAdmin(false);
      localStorage.setItem('hub_isadmin', 'false');
    }

    localStorage.setItem('hub_username', cleanName);
    localStorage.setItem('hub_isregistered', 'true');
    setIsProfileSet(true);

    const targetRoom = customRoomInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'cyber-lobby';
    handleJoinRoom(targetRoom, cleanName);
  };

  const handleJoinRoom = (targetRoomId, overrideUsername = userName) => {
    const cleaned = targetRoomId.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    if (!cleaned) return;

    let currentCreators = { ...roomCreators };
    if (!currentCreators[cleaned]) {
      currentCreators[cleaned] = overrideUsername;
      setRoomCreators(currentCreators);
    }

    const currentRoomBans = bannedList[cleaned] || [];
    if (currentRoomBans.includes(overrideUsername) && !isAdmin) {
      setIsBanned(true);
      setRoomId(cleaned);
      return;
    }

    setIsBanned(false);
    if (!sideRooms.includes(cleaned)) setSideRooms((prev) => [...prev, cleaned]);
    setRoomId(cleaned);
    setInRoom(true);
  };

  const handleBanUserSubmit = (e) => {
    e.preventDefault();
    const target = banUserInput.trim();
    if (!target) return;

    const currentRoomBans = bannedList[roomId] || [];
    if (!currentRoomBans.includes(target)) {
      const updatedBans = [...currentRoomBans, target];
      const updatedList = { ...bannedList, [roomId]: updatedBans };
      setBannedList(updatedList);
      localStorage.setItem(`hub_bans_sync_${roomId}`, JSON.stringify(updatedBans));
      window.dispatchEvent(new Event('storage'));

      const banMsg = {
        id: Date.now(),
        userName: 'SYSTEM',
        text: `🚫 @${target} was banned from #${roomId} by room authority.`,
        createdAt: Date.now()
      };
      const updatedMsgs = [...messages, banMsg];
      setMessages(updatedMsgs);
      localStorage.setItem(`hub_msg_sync_${roomId}`, JSON.stringify(updatedMsgs));
    }

    alert(`🚫 User @${target} has been banned from #${roomId}.`);
    setBanUserInput('');
    setShowBanModal(false);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !roomId) return;

    const newMsg = {
      id: Date.now(),
      userName: userName,
      userIcon: currentBadgeIcon,
      userGradient: userGradient,
      isAdmin: isAdmin,
      text: inputMessage.trim(),
      createdAt: Date.now()
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    localStorage.setItem(`hub_msg_sync_${roomId}`, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    setInputMessage('');
  };

  const isCurrentRoomCreator = roomCreators[roomId] === userName;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-mono">
      {/* BANNED NOTICE SCREEN */}
      {isBanned && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mb-4">
            <Ban className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-2xl font-black text-rose-400 mb-2">Access Banned</h2>
          <p className="text-xs text-slate-400 max-w-sm mb-6">
            You have been banned from entering room <span className="text-white font-bold">#{roomId}</span> by the room creator or admin.
          </p>
          <button
            onClick={() => { setIsBanned(false); setIsProfileSet(false); }}
            className="bg-slate-900 border border-slate-700 text-slate-200 px-6 py-2.5 rounded-xl font-bold text-xs"
          >
            Return to Login
          </button>
        </div>
      )}

      {/* BAN USER MODAL */}
      {showBanModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-black">
                <Ban className="w-5 h-5" /> Ban User from #{roomId}
              </div>
              <button onClick={() => setShowBanModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>
            <form onSubmit={handleBanUserSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Target username to ban..."
                value={banUserInput}
                onChange={(e) => setBanUserInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-rose-400"
                required
              />
              <button type="submit" className="w-full py-3 bg-rose-600 text-white font-black text-xs rounded-xl">
                Confirm Ban
              </button>
            </form>
          </div>
        </div>
      )}

      {!isProfileSet || (!inRoom && !isBanned) ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
            <h1 className="text-3xl font-black text-cyan-400 text-center mb-4">CYBERHUB</h1>
            <form onSubmit={handleSignIn} className="space-y-4">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Username..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white"
                required
              />
              <input
                type="password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                placeholder="Account password..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white"
                required
              />
              {nameError && <p className="text-xs text-rose-400">{nameError}</p>}
              <input
                type="text"
                value={customRoomInput}
                onChange={(e) => setCustomRoomInput(e.target.value)}
                placeholder="Room code (e.g. test1)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white"
              />
              <button type="submit" className="w-full py-3 bg-cyan-500 text-slate-950 font-black rounded-xl">
                Enter Cyberhub
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-screen">
          <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">{currentBadgeIcon}</span>
              <div>
                <h2 className="font-bold">{userName} {isAdmin && '👑'}</h2>
                <p className="text-xs text-cyan-400">#{roomId}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {(isCurrentRoomCreator || isAdmin) && (
                <button onClick={() => setShowBanModal(true)} className="bg-rose-950/40 text-rose-300 border border-rose-500/30 text-xs px-3 py-2 rounded-xl font-bold flex items-center gap-1">
                  <Ban className="w-3.5 h-3.5" /> Ban User
                </button>
              )}
              <button onClick={() => { setIsProfileSet(false); setInRoom(false); }} className="text-xs text-rose-400">
                Sign Out
              </button>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            <aside className="w-64 bg-slate-900/80 border-r border-slate-800 p-4">
              <p className="text-xs font-bold text-cyan-400 mb-2">MY ROOMS</p>
              {sideRooms.map((r) => (
                <div key={r} onClick={() => handleJoinRoom(r)} className={`p-2 rounded text-xs cursor-pointer ${roomId === r ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'}`}>
                  #{r}
                </div>
              ))}
            </aside>

            <main className="flex-1 flex flex-col bg-slate-950 p-4">
              <div className="flex-1 overflow-y-auto space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 max-w-xl">
                    <span className="text-xs font-bold text-slate-300">{m.userIcon} {m.userName}: </span>
                    <span className="text-sm">{m.text}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type message..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white"
                />
                <button type="submit" className="px-5 bg-cyan-500 text-slate-950 font-bold rounded-xl">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
