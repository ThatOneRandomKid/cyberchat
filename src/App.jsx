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
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import {
  Send,
  Users,
  LogOut,
  Sparkles,
  Crown,
  Lock,
  LogIn,
  Plus,
  Hash,
  ImageIcon,
  Trash2,
  UserCheck,
  UserX,
  Disc,
  Clock,
  Terminal,
  Flag,
  Palette,
  ShieldAlert,
  Upload,
  Ban,
  LogIn as JoinIcon,
  RotateCcw
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
  'from-rose-500 to-red-600',
  'from-indigo-500 to-purple-600',
  'from-fuchsia-500 to-rose-500',
  'from-lime-400 to-emerald-600',
  'from-sky-400 to-indigo-600'
];

const ROOM_BACKGROUND_PRESETS = [
  { label: 'Deep Cyber', value: 'bg-slate-950' },
  { label: 'Neon Void', value: 'bg-gradient-to-br from-purple-950 via-slate-950 to-indigo-950' },
  { label: 'Matrix Grid', value: 'bg-gradient-to-br from-emerald-950 via-slate-950 to-teal-950' },
  { label: 'Solar Flare', value: 'bg-gradient-to-br from-amber-950 via-slate-950 to-rose-950' }
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
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState(() => localStorage.getItem('hub_username') || '');
  const [userPassword, setUserPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('hub_isadmin') === 'true');
  const [userGradient, setUserGradient] = useState(ALL_COLOR_GRADIENTS[0]);
  const [isProfileSet, setIsProfileSet] = useState(() => localStorage.getItem('hub_isregistered') === 'true');

  const [activeSeconds, setActiveSeconds] = useState(() => {
    const saved = localStorage.getItem('hub_activeseconds');
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const userRank = (isAdmin ? 100 : 0) + Math.floor(activeSeconds / 300);
  const currentBadgeIcon = getRankIcon(userRank, isAdmin);

  const [roomId, setRoomId] = useState('');
  const [inRoom, setInRoom] = useState(false);
  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [showMediaModal, setShowMediaModal] = useState(false);
  
  // Explicit distinction between Join and Create inputs
  const [joinRoomInput, setJoinRoomInput] = useState('');
  const [createRoomInput, setCreateRoomInput] = useState('');
  const [customRoomInput, setCustomRoomInput] = useState('');

  const [activeDiscoMode, setActiveDiscoMode] = useState(false);
  const [activeMatrixMode, setActiveMatrixMode] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
  const [showRoomStyleModal, setShowRoomStyleModal] = useState(false);
  const [showReportDashboard, setShowReportDashboard] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);

  const [reportTargetUser, setReportTargetUser] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportScreenshotUrl, setReportScreenshotUrl] = useState('');
  const [banUserInput, setBanUserInput] = useState('');

  const [roomStyles, setRoomStyles] = useState(() => {
    const saved = localStorage.getItem('hub_room_styles');
    return saved ? JSON.parse(saved) : {};
  });

  const [reportsList, setReportsList] = useState([]);
  const [bannedList, setBannedList] = useState(() => {
    const saved = localStorage.getItem('hub_banned_users');
    return saved ? JSON.parse(saved) : {};
  });

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
    return saved ? JSON.parse(saved) : [];
  });

  const chatEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('hub_siderooms', JSON.stringify(sideRooms));
  }, [sideRooms]);

  useEffect(() => {
    localStorage.setItem('hub_room_creators', JSON.stringify(roomCreators));
  }, [roomCreators]);

  useEffect(() => {
    localStorage.setItem('hub_approved_rooms', JSON.stringify(approvedRooms));
  }, [approvedRooms]);

  useEffect(() => {
    localStorage.setItem('hub_room_styles', JSON.stringify(roomStyles));
  }, [roomStyles]);

  useEffect(() => {
    localStorage.setItem('hub_banned_users', JSON.stringify(bannedList));
  }, [bannedList]);

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

  useEffect(() => {
    if (!roomId) return;

    const currentRoomBans = bannedList[roomId] || [];
    if (currentRoomBans.includes(userName) && !isAdmin) {
      setIsBanned(true);
      setInRoom(false);
      return;
    }

    const roomMsgsKey = `hub_msg_sync_${roomId}`;
    const savedMsgs = localStorage.getItem(roomMsgsKey);
    setMessages(savedMsgs ? JSON.parse(savedMsgs) : []);

    const savedReports = localStorage.getItem(`hub_reports_sync_${roomId}`);
    if (savedReports) setReportsList(JSON.parse(savedReports));

    const handleStorageEvent = (e) => {
      if (e.key === `hub_msg_sync_${roomId}` && e.newValue) {
        setMessages(JSON.parse(e.newValue));
      }
      if (e.key === `hub_requests_sync_${roomId}` && e.newValue) {
        setJoinRequests(JSON.parse(e.newValue));
      }
      if (e.key === `hub_reports_sync_${roomId}` && e.newValue) {
        setReportsList(JSON.parse(e.newValue));
      }
      if (e.key === `hub_bans_sync_${roomId}`) {
        const updatedBans = e.newValue ? JSON.parse(e.newValue) : [];
        if (updatedBans.includes(userName) && !isAdmin) {
          setIsBanned(true);
          setInRoom(false);
        }
      }
      if (e.key === `hub_styles_sync` && e.newValue) {
        setRoomStyles(JSON.parse(e.newValue));
      }
      if (e.key === `hub_approval_user_${userName}_${roomId}`) {
        if (e.newValue === 'approved') {
          setIsWaitingForApproval(false);
          setInRoom(true);
          setApprovedRooms((prev) => [...prev, roomId]);
          if (!sideRooms.includes(roomId)) {
            setSideRooms((prev) => [...prev, roomId]);
          }
        } else if (e.newValue === 'denied') {
          setIsWaitingForApproval(false);
          alert(`❌ Creator denied your request to enter #${roomId}.`);
        }
      }
      if (e.key === `hub_disco_sync_${roomId}` && e.newValue === 'true') {
        setActiveDiscoMode(true);
        setTimeout(() => setActiveDiscoMode(false), 8000);
      }
      if (e.key === `hub_matrix_sync_${roomId}` && e.newValue === 'true') {
        setActiveMatrixMode(true);
        setTimeout(() => setActiveMatrixMode(false), 9000);
      }
    };

    const existingReqs = localStorage.getItem(`hub_requests_sync_${roomId}`);
    if (existingReqs) setJoinRequests(JSON.parse(existingReqs));

    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, [roomId, userName, sideRooms, bannedList, isAdmin]);

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

  // Clear All Local Storage Accounts & Rooms Utility
  const handleClearAllStorageAndRooms = () => {
    if (window.confirm("Are you sure you want to clear all cached accounts, rooms, and chat logs?")) {
      localStorage.clear();
      setSideRooms([]);
      setRoomCreators({});
      setApprovedRooms([]);
      setBannedList({});
      setRoomStyles({});
      setMessages([]);
      setIsProfileSet(false);
      setInRoom(false);
      setUserName('');
      setUserPassword('');
      alert("✅ All local rooms and cached accounts have been completely wiped.");
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setNameError('');

    const cleanName = userName.trim();
    if (!cleanName) return setNameError('Please enter a valid display name.');
    if (!userPassword.trim()) return setNameError('Password is required.');

    if (cleanName === 'LEO_') {
      if (userPassword !== 'password') return setNameError('Incorrect admin password for LEO_.');
      setIsAdmin(true);
      setUserGradient('from-amber-400 to-orange-600');
      localStorage.setItem('hub_isadmin', 'true');
    } else {
      setIsAdmin(false);
      localStorage.setItem('hub_isadmin', 'false');

      try {
        const userDocRef = doc(db, 'users', cleanName.toLowerCase());
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.password !== userPassword) {
            return setNameError('Incorrect password for this username!');
          }
          if (userData.gradient) setUserGradient(userData.gradient);
          if (userData.activeSeconds) setActiveSeconds(userData.activeSeconds);
        } else {
          const randomGrad = ALL_COLOR_GRADIENTS[Math.floor(Math.random() * ALL_COLOR_GRADIENTS.length)];
          setUserGradient(randomGrad);
          await setDoc(userDocRef, {
            username: cleanName,
            password: userPassword,
            gradient: randomGrad,
            activeSeconds: activeSeconds,
            createdAt: Date.now()
          });
        }
      } catch (err) {
        console.warn("Firestore Auth Fallback Active:", err);
      }
    }

    localStorage.setItem('hub_username', cleanName);
    localStorage.setItem('hub_isregistered', 'true');
    setIsProfileSet(true);

    const targetRoom = customRoomInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'cyber-lobby';
    handleJoinOrCreateRoom(targetRoom, false, cleanName);
  };

  const handleSignOut = () => {
    localStorage.removeItem('hub_username');
    localStorage.removeItem('hub_isregistered');
    localStorage.removeItem('hub_isadmin');
    setIsProfileSet(false);
    setInRoom(false);
    setIsWaitingForApproval(false);
    setIsBanned(false);
    setUserName('');
    setUserPassword('');
  };

  // Explicit Join vs Create Room Logic
  const handleJoinOrCreateRoom = (targetRoomId, isExplicitCreate = false, overrideUsername = userName) => {
    const cleaned = targetRoomId.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    if (!cleaned) return;

    let currentCreators = { ...roomCreators };

    if (isExplicitCreate || !currentCreators[cleaned]) {
      if (isExplicitCreate && currentCreators[cleaned] && currentCreators[cleaned] !== overrideUsername && !isAdmin) {
        alert(`❌ Room #${cleaned} already exists and belongs to @${currentCreators[cleaned]}. Try joining it instead.`);
        return;
      }
      currentCreators[cleaned] = overrideUsername;
      setRoomCreators(currentCreators);
      localStorage.setItem('hub_room_creators', JSON.stringify(currentCreators));
    }

    const currentRoomBans = bannedList[cleaned] || [];
    if (currentRoomBans.includes(overrideUsername) && !isAdmin) {
      setIsBanned(true);
      setRoomId(cleaned);
      return;
    }

    const creatorName = currentCreators[cleaned];
    const isCreator = creatorName === overrideUsername;
    const isAlreadyApproved = approvedRooms.includes(cleaned);

    if (!isCreator && !isAdmin && !isAlreadyApproved) {
      setRoomId(cleaned);
      setIsWaitingForApproval(true);

      const existingReqs = JSON.parse(localStorage.getItem(`hub_requests_sync_${cleaned}`) || '[]');
      if (!existingReqs.some(r => r.user === overrideUsername)) {
        const updatedReqs = [...existingReqs, { user: overrideUsername, time: new Date().toLocaleTimeString() }];
        localStorage.setItem(`hub_requests_sync_${cleaned}`, JSON.stringify(updatedReqs));
        window.dispatchEvent(new Event('storage'));
      }
      return;
    }

    setIsBanned(false);
    if (!sideRooms.includes(cleaned)) {
      setSideRooms((prev) => [...prev, cleaned]);
    }
    setRoomId(cleaned);
    setIsWaitingForApproval(false);
    setInRoom(true);
  };

  const handleSidebarJoinSubmit = (e) => {
    e.preventDefault();
    if (!joinRoomInput.trim()) return;
    handleJoinOrCreateRoom(joinRoomInput, false);
    setJoinRoomInput('');
  };

  const handleSidebarCreateSubmit = (e) => {
    e.preventDefault();
    if (!createRoomInput.trim()) return;
    handleJoinOrCreateRoom(createRoomInput, true);
    setCreateRoomInput('');
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

  const handleFileScreenshot = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setReportScreenshotUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReport = (e) => {
    e.preventDefault();
    if (!reportTargetUser.trim() || !reportReason.trim()) return;

    const newReport = {
      id: Date.now(),
      reportedBy: userName,
      targetUser: reportTargetUser.trim(),
      reason: reportReason.trim(),
      screenshot: reportScreenshotUrl.trim() || null,
      timestamp: new Date().toLocaleString(),
      status: 'pending'
    };

    const updated = [...reportsList, newReport];
    setReportsList(updated);
    localStorage.setItem(`hub_reports_sync_${roomId}`, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));

    alert(`✅ Report filed against @${reportTargetUser}. Sent to room owner & admin.`);
    setShowReportModal(false);
    setReportTargetUser('');
    setReportReason('');
    setReportScreenshotUrl('');
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
        userId: 'system_action',
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

  const handleUpdateRoomStyle = (backgroundValue, isCustomImage = false) => {
    const updatedStyles = {
      ...roomStyles,
      [roomId]: isCustomImage 
        ? { type: 'image', value: backgroundValue } 
        : { type: 'color', value: backgroundValue }
    };
    setRoomStyles(updatedStyles);
    localStorage.setItem('hub_styles_sync', JSON.stringify(updatedStyles));
    window.dispatchEvent(new Event('storage'));
    setShowRoomStyleModal(false);
  };

  const handleApproveUser = (targetUser) => {
    const updatedReqs = joinRequests.filter(r => r.user !== targetUser);
    setJoinRequests(updatedReqs);
    localStorage.setItem(`hub_requests_sync_${roomId}`, JSON.stringify(updatedReqs));
    localStorage.setItem(`hub_approval_user_${targetUser}_${roomId}`, 'approved');

    const systemMsg = {
      id: Date.now(),
      userId: 'system',
      userName: 'SYSTEM',
      text: `✅ Creator @${userName} approved @${targetUser} into #${roomId}!`,
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
    localStorage.setItem(`hub_approval_user_${targetUser}_${roomId}`, 'denied');
    window.dispatchEvent(new Event('storage'));
  };

  const triggerDiscoBall = () => {
    if (!isAdmin) return;
    setActiveDiscoMode(true);
    localStorage.setItem(`hub_disco_sync_${roomId}`, 'true');
    window.dispatchEvent(new Event('storage'));
    setTimeout(() => {
      setActiveDiscoMode(false);
      localStorage.setItem(`hub_disco_sync_${roomId}`, 'false');
    }, 8000);
  };

  const triggerMatrixRain = () => {
    if (!isAdmin) return;
    setActiveMatrixMode(true);
    localStorage.setItem(`hub_matrix_sync_${roomId}`, 'true');
    window.dispatchEvent(new Event('storage'));
    setTimeout(() => {
      setActiveMatrixMode(false);
      localStorage.setItem(`hub_matrix_sync_${roomId}`, 'false');
    }, 9000);
  };

  const handleAction = (actionType, targetUser, emoji) => {
    const actionMsg = {
      id: Date.now(),
      userId: 'system_action',
      userName: 'HUB_ACTION',
      text: `${userName} ${actionType} @${targetUser}! ${emoji}`,
      createdAt: Date.now()
    };
    const updatedMsgs = [...messages, actionMsg];
    setMessages(updatedMsgs);
    localStorage.setItem(`hub_msg_sync_${roomId}`, JSON.stringify(updatedMsgs));
    window.dispatchEvent(new Event('storage'));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if ((!inputMessage.trim() && !mediaUrlInput.trim()) || !roomId) return;

    const isCreator = roomCreators[roomId] === userName;

    const newMsg = {
      id: Date.now(),
      userId: user?.uid || userName,
      userName: userName,
      userIcon: currentBadgeIcon,
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
    window.dispatchEvent(new Event('storage'));

    setInputMessage('');
    setMediaUrlInput('');
    setShowMediaModal(false);
  };

  const isCurrentRoomCreator = roomCreators[roomId] === userName;
  const currentStyle = roomStyles[roomId] || { type: 'color', value: 'bg-slate-950' };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-mono overflow-hidden relative">

      {/* DISCO OVERLAY */}
      {activeDiscoMode && (
        <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-start bg-black/50 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/30 via-cyan-500/30 to-amber-500/30 animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-transparent to-pink-600/20 animate-spin" />
          <div className="w-1 bg-gradient-to-b from-slate-200 to-slate-500 h-28 animate-bounce" />
          <div className="relative w-36 h-36 bg-gradient-to-tr from-cyan-300 via-pink-300 to-amber-200 rounded-full shadow-[0_0_60px_rgba(6,182,212,0.8)] flex items-center justify-center animate-bounce border-4 border-white">
            <Disc className="w-24 h-24 text-slate-950 animate-spin" />
            <Sparkles className="w-12 h-12 text-amber-300 absolute animate-ping" />
          </div>
          <div className="mt-6 bg-slate-900/90 border-2 border-amber-400 px-8 py-3 rounded-full text-amber-300 font-black text-base tracking-widest shadow-2xl animate-bounce flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
            🪩 HIGH-ENERGY DISCO EVENT TRIGGERED BY LEO_ 🪩
          </div>
        </div>
      )}

      {/* MATRIX RAIN OVERLAY */}
      {activeMatrixMode && (
        <div className="fixed inset-0 z-50 pointer-events-none bg-black/95 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
          <div className="absolute inset-0 opacity-60 font-mono text-emerald-400 text-xs leading-none overflow-hidden select-none whitespace-pre">
            {`0101010101001010101010101010101010101010101010101010101010101\n` +
             `1010101010101010101010101010101010101010101010101010101010101\n` +
             `01010101010101010101010101010101010101010101010101010101010101\n`.repeat(25)}
          </div>
          <div className="z-10 bg-slate-900/90 border-2 border-emerald-400 p-8 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.4)] max-w-md animate-pulse">
            <Terminal className="w-16 h-16 text-emerald-400 mx-auto mb-3 animate-bounce" />
            <h3 className="text-2xl font-black text-emerald-400 tracking-wider mb-2">⚡ SYSTEM MATRIX OVERRIDE ⚡</h3>
            <p className="text-xs text-slate-300">Admin LEO_ injected live quantum code streams into grid node #{roomId}.</p>
          </div>
        </div>
      )}

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

      {/* REPORT SUBMISSION MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-black">
                <Flag className="w-5 h-5" /> File User Report
              </div>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Target Username</label>
                <input
                  type="text"
                  placeholder="e.g. bob"
                  value={reportTargetUser}
                  onChange={(e) => setReportTargetUser(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-rose-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Reason for Report</label>
                <textarea
                  placeholder="Describe the violation..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-rose-400 h-20 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Upload Screenshot</label>
                <div className="space-y-2">
                  <input
                    type="url"
                    placeholder="https://example.com/screenshot.png"
                    value={reportScreenshotUrl}
                    onChange={(e) => setReportScreenshotUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-rose-400"
                  />
                  <div className="flex items-center gap-2">
                    <label className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 px-3 rounded-xl border border-slate-700 cursor-pointer flex items-center justify-center gap-1.5 font-bold">
                      <Upload className="w-3.5 h-3.5 text-cyan-400" /> Choose File Screenshot
                      <input type="file" accept="image/*" onChange={handleFileScreenshot} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg transition"
              >
                Send Report to Admin
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ROOM STYLING MODAL */}
      {showRoomStyleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400 font-black">
                <Palette className="w-5 h-5" /> Customize Room Backdrop
              </div>
              <button onClick={() => setShowRoomStyleModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase text-slate-400">Color Presets</label>
              <div className="grid grid-cols-2 gap-2">
                {ROOM_BACKGROUND_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handleUpdateRoomStyle(preset.value, false)}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-400 text-xs font-bold text-slate-200 text-left transition"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Custom Background Image URL</label>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const imgUrl = e.target.elements.bgImg.value;
                  if (imgUrl.trim()) handleUpdateRoomStyle(imgUrl.trim(), true);
                }} className="space-y-2">
                  <input
                    name="bgImg"
                    type="url"
                    placeholder="https://example.com/wallpaper.jpeg"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl transition"
                  >
                    Apply Image Backdrop
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT REVIEW DASHBOARD */}
      {showReportDashboard && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-black">
                <ShieldAlert className="w-5 h-5" /> Room Audit & Reports ({reportsList.length})
              </div>
              <button onClick={() => setShowReportDashboard(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {reportsList.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No active reports filed for #{roomId}.</p>
              ) : (
                reportsList.map((rep) => (
                  <div key={rep.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Reported User: <strong className="text-rose-400">@{rep.targetUser}</strong></span>
                      <span>By: @{rep.reportedBy} ({rep.timestamp})</span>
                    </div>
                    <p className="text-slate-200 bg-slate-900 p-2.5 rounded-xl border border-slate-800/80">{rep.reason}</p>
                    {rep.screenshot && (
                      <div className="mt-2">
                        <span className="text-[10px] text-slate-400 block mb-1 font-bold">Attached Evidence:</span>
                        <img src={rep.screenshot} alt="Evidence screenshot" className="max-h-48 rounded-xl border border-slate-800 object-cover" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* WAITING FOR CREATOR APPROVAL SCREEN */}
      {isWaitingForApproval && (
        <div className="fixed inset-0 z-40 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mb-4 animate-pulse">
            <Clock className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Waiting for Permission...</h2>
          <p className="text-sm text-slate-400 max-w-sm mb-6">
            Room <span className="text-cyan-400 font-bold">#{roomId}</span> is private. Request sent to creator <span className="text-amber-400 font-bold">@{roomCreators[roomId]}</span>.
          </p>
          <button
            onClick={() => setIsWaitingForApproval(false)}
            className="bg-slate-900 border border-slate-700 text-slate-300 hover:text-white px-6 py-2.5 rounded-xl font-bold text-xs"
          >
            Cancel Request
          </button>
        </div>
      )}

      {/* LOGIN SCREEN */}
      {!isProfileSet || (!inRoom && !isWaitingForApproval && !isBanned) ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
          <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
            <div className="text-center mb-6">
              <Sparkles className="w-12 h-12 text-cyan-400 mx-auto mb-2 animate-pulse" />
              <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                CYBERHUB
              </h1>
              <p className="text-xs text-slate-400 mt-1">Global Cross-Device Authentication Sync</p>
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

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1 flex items-center justify-between">
                  <span>Account Password</span>
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                </label>
                <input
                  type="password"
                  placeholder="Enter or set your account password..."
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {nameError && <p className="text-xs text-rose-400 font-bold bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/30">{nameError}</p>}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Room Code</label>
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
                <LogIn className="w-5 h-5" /> Authenticate & Sync Profile
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex justify-center">
              <button
                onClick={handleClearAllStorageAndRooms}
                className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear My Local Cache
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* MAIN CHAT DASHBOARD */
        <div className="flex-1 flex flex-col h-screen">
          <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${userGradient} flex items-center justify-center text-xl shadow-md`}>
                {currentBadgeIcon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-slate-100">{userName}</h2>
                  <span className="text-[10px] bg-slate-800 text-cyan-300 border border-slate-700 px-2 py-0.5 rounded-full font-bold">
                    Rank {userRank}
                  </span>
                  {isAdmin && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-400" /> ADMIN
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400">Room: <span className="text-cyan-400 font-mono">#{roomId}</span></p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowReportModal(true)}
                className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 font-bold transition"
              >
                <Flag className="w-4 h-4 text-rose-400" /> <span>Report Node</span>
              </button>

              {(isCurrentRoomCreator || isAdmin) && (
                <>
                  <button
                    onClick={() => setShowBanModal(true)}
                    className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 font-bold transition"
                  >
                    <Ban className="w-4 h-4 text-rose-400" /> <span>Ban User</span>
                  </button>

                  <button
                    onClick={() => setShowRoomStyleModal(true)}
                    className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 font-bold transition"
                  >
                    <Palette className="w-4 h-4" /> <span>Room Style</span>
                  </button>

                  <button
                    onClick={() => setShowReportDashboard(true)}
                    className="bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-500/30 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 font-bold transition"
                  >
                    <ShieldAlert className="w-4 h-4" /> <span>Reports ({reportsList.length})</span>
                  </button>
                </>
              )}

              {isAdmin && (
                <>
                  <button
                    onClick={triggerDiscoBall}
                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 font-extrabold shadow-lg shadow-purple-500/30"
                  >
                    <Disc className="w-4 h-4 animate-spin" /> Disco FX
                  </button>
                  <button
                    onClick={triggerMatrixRain}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 font-extrabold shadow-lg shadow-emerald-500/30"
                  >
                    <Terminal className="w-4 h-4" /> Matrix FX
                  </button>
                  <button
                    onClick={handleClearAllStorageAndRooms}
                    className="bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-500/40 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 font-extrabold"
                    title="Purge all local storage and reset all rooms"
                  >
                    <RotateCcw className="w-4 h-4" /> Purge All Data
                  </button>
                </>
              )}

              <button
                onClick={handleSignOut}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 font-bold"
              >
                <LogOut className="w-4 h-4" /> <span>Sign Out</span>
              </button>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            {/* SIDEBAR ROOMS WITH EXPLICIT JOIN AND CREATE SECTIONS */}
            <aside className="w-64 bg-slate-900/80 border-r border-slate-800 p-4 flex flex-col gap-4">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>My Cyber Rooms</span>
              </div>

              {/* 1. Explicit JOIN EXISTING ROOM Form */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Join Room</label>
                <form onSubmit={handleSidebarJoinSubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Existing code..."
                    value={joinRoomInput}
                    onChange={(e) => setJoinRoomInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-2.5 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1 shrink-0"
                  >
                    <JoinIcon className="w-3.5 h-3.5" /> Join
                  </button>
                </form>
              </div>

              {/* 2. Explicit CREATE NEW ROOM Form */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Create New Room</label>
                <form onSubmit={handleSidebarCreateSubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New room name..."
                    value={createRoomInput}
                    onChange={(e) => setCreateRoomInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-purple-400"
                  />
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-500 text-white px-2.5 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create
                  </button>
                </form>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 border-t border-slate-800/80 pt-2">
                {sideRooms.map((r) => (
                  <div
                    key={r}
                    onClick={() => handleJoinOrCreateRoom(r, false)}
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

              {/* CREATOR APPROVAL PANEL */}
              {isCurrentRoomCreator && joinRequests.length > 0 && (
                <div className="pt-3 border-t border-slate-800 bg-amber-950/20 p-2 rounded-xl border border-amber-500/30">
                  <div className="text-[10px] text-amber-400 font-bold uppercase mb-2 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Pending Requests ({joinRequests.length})
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

            {/* MAIN MESSAGES FEED */}
            <main 
              className={`flex-1 flex flex-col p-4 overflow-hidden relative transition-all ${
                currentStyle.type === 'color' ? currentStyle.value : ''
              }`}
              style={
                currentStyle.type === 'image' 
                  ? { backgroundImage: `url(${currentStyle.value})`, backgroundSize: 'cover', backgroundPosition: 'center' } 
                  : {}
              }
            >
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 bg-slate-950/40 backdrop-blur-xs p-3 rounded-2xl">
                {messages.map((m) => {
                  const isMe = m.userName === userName;
                  const isAction = m.userId === 'system_action';
                  const isMsgAdmin = m.isAdmin || m.userName === 'LEO_';

                  if (isAction) {
                    return (
                      <div key={m.id} className="flex justify-center my-2">
                        <div className="bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs px-4 py-1.5 rounded-full font-bold shadow-lg">
                          {m.text}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={m.id} className={`flex gap-3 max-w-2xl ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${m.userGradient || 'from-slate-700 to-slate-800'} flex items-center justify-center text-base shrink-0 shadow`}>
                        {m.userIcon || (isMsgAdmin ? '👑' : '⭐')}
                      </div>
                      <div className={`space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`flex items-center gap-2 ${isMe ? 'justify-end' : ''}`}>
                          <span className={`text-xs font-bold ${isMsgAdmin ? 'text-amber-400 flex items-center gap-1' : 'text-slate-300'}`}>
                            {isMsgAdmin && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                            {m.userName}
                          </span>
                        </div>

                        <div className={`p-3.5 rounded-2xl text-sm ${
                          isMsgAdmin
                            ? 'bg-amber-950/40 border border-amber-500/50 text-amber-100 shadow-lg shadow-amber-500/10'
                            : isMe
                            ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-tr-none'
                            : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none'
                        }`}>
                          <p className="whitespace-pre-wrap break-words">{m.text}</p>
                          {m.mediaUrl && (
                            <img src={m.mediaUrl} alt="Shared media" className="mt-2 rounded-xl max-h-60 w-full object-cover border border-slate-800" />
                          )}
                        </div>

                        {!isMe && (
                          <div className="flex gap-2 text-[11px] font-extrabold text-slate-400 pt-1">
                            <button onClick={() => handleAction('slapped', m.userName, '✋')} className="hover:text-amber-400 transition">✋ Slap</button>
                            <button onClick={() => handleAction('blew a kiss to', m.userName, '😘')} className="hover:text-pink-400 transition">😘 Kiss</button>
                            <button onClick={() => handleAction('flexed on', m.userName, '💪')} className="hover:text-cyan-400 transition">💪 Flex</button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* INPUT BAR */}
              <form onSubmit={handleSendMessage} className="mt-3 flex gap-2 relative z-10">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-slate-900/90 border border-slate-800 focus:border-cyan-500 rounded-2xl px-4 py-3 text-slate-100 outline-none text-sm font-semibold backdrop-blur-md"
                />

                <button
                  type="button"
                  onClick={() => setShowMediaModal(!showMediaModal)}
                  className="p-3 bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-cyan-400 rounded-2xl backdrop-blur-md"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>

                <button
                  type="submit"
                  disabled={!inputMessage.trim() && !mediaUrlInput.trim()}
                  className="px-5 bg-gradient-to-r from-cyan-500 to-indigo-600 disabled:opacity-50 text-white font-extrabold rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
