import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, Zap, Send, Crown, User, 
  Trash2, Sparkles, Terminal, Radio, Volume2, VolumeX, 
  Plus, Hash, Smile, Lock, Unlock, Settings, Users, Star, 
  Eye, Shield, Copy, AlertTriangle, Key, Flame, RefreshCw,
  MessageSquare, Bell, Heart, ThumbsUp, Activity, Cpu, Database
} from 'lucide-react';

export default function App() {
  // ==========================================
  // 1. AUTHENTICATION & PROFILE STATES
  // ==========================================
  const [username, setUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [badge, setBadge] = useState('Standard ⭐ Badge');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rank, setRank] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [chatColor, setChatColor] = useState('text-slate-200');
  const [userBio, setUserBio] = useState('CyberHub Node Operator');
  const [avatarSeed, setAvatarSeed] = useState('CyberKnight');

  // ==========================================
  // 2. MULTI-ROOM NAVIGATION & SIDEBAR STATES
  // ==========================================
  const [activeRoom, setActiveRoom] = useState('cyber-lobby');
  const [rooms, setRooms] = useState([
    'cyber-lobby', 
    'vip-lounge', 
    'dev-vault', 
    'matrix-node', 
    'dark-web-sim',
    'admin-command',
    'general-chat'
  ]);
  const [newRoomInput, setNewRoomInput] = useState('');
  const [roomTopic, setRoomTopic] = useState('Main encrypted grid for general chat');

  // ==========================================
  // 3. INITIAL DATABASE STREAM DATA
  // ==========================================
  const [roomMessages, setRoomMessages] = useState({
    'cyber-lobby': [
      { 
        id: 101, 
        user: 'SYSTEM', 
        text: '⚡ Welcome to CYBERHUB Grid v4.0! All encrypted nodes operational.', 
        rank: 100, 
        badge: '🤖', 
        time: '12:00 PM', 
        color: 'text-cyan-300 font-bold',
        type: 'system'
      },
      { 
        id: 102, 
        user: 'LEO_Admin', 
        text: 'System core online. Type any room code in the left sidebar to build new channels dynamically.', 
        rank: 100, 
        badge: '👑', 
        time: '12:01 PM', 
        color: 'text-amber-400 font-bold',
        type: 'user'
      }
    ],
    'vip-lounge': [
      { 
        id: 201, 
        user: 'SYSTEM', 
        text: '🔒 VIP Clearance Zone unlocked. High-priority clearance required.', 
        rank: 100, 
        badge: '🛡️', 
        time: '12:00 PM', 
        color: 'text-purple-400 font-bold',
        type: 'system'
      }
    ],
    'dev-vault': [
      { 
        id: 301, 
        user: 'SYSTEM', 
        text: '🧪 Developer Sandbox loaded. Full telemetry active.', 
        rank: 100, 
        badge: '⚙️', 
        time: '12:00 PM', 
        color: 'text-emerald-400 font-bold',
        type: 'system'
      }
    ],
    'matrix-node': [
      { 
        id: 401, 
        user: 'SYSTEM', 
        text: '🕶️ Matrix stream connected. Ready for data injection.', 
        rank: 100, 
        badge: '🕶️', 
        time: '12:00 PM', 
        color: 'text-green-400 font-bold',
        type: 'system'
      }
    ],
    'dark-web-sim': [
      { 
        id: 501, 
        user: 'SYSTEM', 
        text: '⚠️ Simulated Dark Grid. Anonymity protocols engaged.', 
        rank: 100, 
        badge: '💀', 
        time: '12:00 PM', 
        color: 'text-red-400 font-bold',
        type: 'system'
      }
    ],
    'admin-command': [
      { 
        id: 601, 
        user: 'SYSTEM', 
        text: '👑 Command Center locked to Level 100 Admins.', 
        rank: 100, 
        badge: '👑', 
        time: '12:00 PM', 
        color: 'text-amber-400 font-bold',
        type: 'system'
      }
    ],
    'general-chat': [
      { 
        id: 701, 
        user: 'SYSTEM', 
        text: '💬 Open frequency channel for all active users.', 
        rank: 1, 
        badge: '💬', 
        time: '12:00 PM', 
        color: 'text-slate-300',
        type: 'system'
      }
    ]
  });

  // ==========================================
  // 4. INTERACTIVE & GLITCH CONTROL STATES
  // ==========================================
  const [inputText, setInputText] = useState('');
  const [isGlitched, setIsGlitched] = useState(false);
  const [matrixText, setMatrixText] = useState('');
  const [bannedUsers, setBannedUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeUsersList, setActiveUsersList] = useState(['LEO_Admin', 'CyberBot', 'Nexus_9', 'Voxel_Guy']);
  const [serverStatus, setServerStatus] = useState('ONLINE');
  const [pingMs, setPingMs] = useState(14);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const chatEndRef = useRef(null);

  const emojis = ['⚡', '🔥', '👑', '💀', '👽', '🚀', '🤖', '💥', '✨', '🎯', '🛡️', '💎', '🎮', '👾', '🔒', '👁️', '🌀', '🎉', '💻', '💡'];

  // ==========================================
  // 5. AUTO-SCROLL EFFECT
  // ==========================================
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages, activeRoom]);

  // Telemetry Ping Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setPingMs(Math.floor(Math.random() * 10) + 12);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // 6. AUDIO SYNTHESIZER ENGINE
  // ==========================================
  const playSound = (type = 'send') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'send') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'admin') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {
      // Browser audio restriction fallback
    }
  };

  // ==========================================
  // 7. LOGIN & ADMIN AUTHENTICATION
  // ==========================================
  const handleLogin = (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    if (username.startsWith('LEO_')) {
      if (adminPassword === 'password') {
        setRank(100);
        setBadge('👑 OVERLORD');
        setChatColor('text-amber-400 font-bold');
        playSound('admin');
      } else {
        alert('❌ ACCESS DENIED: Invalid Password for Admin ID. Entering as Standard User.');
        setRank(1);
        setBadge('Standard ⭐ Badge');
        setChatColor('text-slate-200');
        playSound('send');
      }
    } else {
      setRank(1);
      setBadge('Standard ⭐ Badge');
      setChatColor('text-slate-200');
      playSound('send');
    }

    const formattedRoom = activeRoom.toLowerCase().trim().replace(/\s+/g, '-') || 'cyber-lobby';
    if (!rooms.includes(formattedRoom)) {
      setRooms((prev) => [...prev, formattedRoom]);
      setRoomMessages((prev) => ({ ...prev, [formattedRoom]: [] }));
    }

    if (!activeUsersList.includes(username)) {
      setActiveUsersList((prev) => [...prev, username]);
    }

    setActiveRoom(formattedRoom);
    setIsLoggedIn(true);
  };

  // ==========================================
  // 8. SIDEBAR ROOM CREATION ENGINE
  // ==========================================
  const handleCreateRoom = (e) => {
    e.preventDefault();
    const formatted = newRoomInput.toLowerCase().trim().replace(/\s+/g, '-');
    if (!formatted) return;

    if (!rooms.includes(formatted)) {
      setRooms((prev) => [...prev, formatted]);
      setRoomMessages((prev) => ({ 
        ...prev, 
        [formatted]: [{
          id: Date.now(),
          user: 'SYSTEM',
          text: `📡 Hub channel #${formatted} established successfully.`,
          rank: 100,
          badge: '🌐',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          color: 'text-cyan-400 font-bold',
          type: 'system'
        }]
      }));
    }
    setActiveRoom(formatted);
    setNewRoomInput('');
    playSound('send');
  };

  // ==========================================
  // 9. MESSAGE TRANSMISSION ENGINE
  // ==========================================
  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (bannedUsers.includes(username)) {
      alert('🚫 Transmit Error: Account blocked by Level 100 Admin.');
      return;
    }

    const newMessage = {
      id: Date.now(),
      user: username,
      text: inputText,
      rank: rank,
      badge: rank >= 100 ? '👑' : '⭐',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      color: rank >= 100 ? chatColor : 'text-slate-200',
      type: 'user'
    };

    setRoomMessages((prev) => ({
      ...prev,
      [activeRoom]: [...(prev[activeRoom] || []), newMessage]
    }));
    setInputText('');
    playSound('send');
  };

  const addEmoji = (emoji) => {
    setInputText((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  // ==========================================
  // 10. INTERACTION ENGINE (Slap, Kiss, High-Five)
  // ==========================================
  const handleInteraction = (type, targetUser) => {
    if (bannedUsers.includes(username)) return;

    let actionText = '';
    if (type === 'slap') actionText = `✋ SLAPPED @${targetUser}!`;
    if (type === 'kiss') actionText = `😘 blew a kiss to @${targetUser}!`;
    if (type === 'highfive') actionText = `🙏 gave a high-five to @${targetUser}!`;
    if (type === 'hug') actionText = `🤗 hugged @${targetUser}!`;
    if (type === 'flex') actionText = `💪 flexed on @${targetUser}!`;

    const interactionMsg = {
      id: Date.now(),
      user: 'SYSTEM_EVENT',
      text: `${username} ${actionText}`,
      rank: 50,
      badge: '💥',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      color: 'text-cyan-400 font-semibold',
      type: 'event'
    };

    setRoomMessages((prev) => ({
      ...prev,
      [activeRoom]: [...(prev[activeRoom] || []), interactionMsg]
    }));
    playSound('send');
  };

  // ==========================================
  // 11. LEVEL 100 ADMIN COMMAND SUITE
  // ==========================================
  const triggerGlitchFX = () => {
    setIsGlitched(true);
    setMatrixText('⚠️ SYSTEM CORRUPTION INITIATED BY ADMIN OVERLORD ⚠️');
    playSound('admin');
    setTimeout(() => {
      setIsGlitched(false);
      setMatrixText('');
    }, 4500);
  };

  const clearChat = () => {
    setRoomMessages((prev) => ({
      ...prev,
      [activeRoom]: [{ 
        id: Date.now(), 
        user: 'SYSTEM', 
        text: '🧹 Feed purged by Level 100 Admin Overlord.', 
        rank: 100, 
        badge: '👑', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        color: 'text-red-400 font-bold',
        type: 'system'
      }]
    }));
    playSound('admin');
  };

  const banUser = (targetUser) => {
    if (targetUser === username) return alert("Security Lock: You cannot ban your own account!");
    setBannedUsers([...bannedUsers, targetUser]);
    setActiveUsersList((prev) => prev.filter((u) => u !== targetUser));
    alert(`🚫 Account ${targetUser} banned from all network streams.`);
    playSound('admin');
  };

  const broadcastNotice = () => {
    const notice = prompt('Enter Global Admin Announcement:');
    if (!notice) return;

    const globalMsg = {
      id: Date.now(),
      user: 'GLOBAL_ADMIN',
      text: `📢 ANNOUNCEMENT: ${notice}`,
      rank: 100,
      badge: '🚨',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      color: 'text-amber-300 font-black bg-amber-950/40 p-2 rounded-lg border border-amber-500/50',
      type: 'announcement'
    };

    setRoomMessages((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((r) => {
        updated[r] = [...(updated[r] || []), globalMsg];
      });
      return updated;
    });
    playSound('alert');
  };

  // ==========================================
  // 12. RENDER VIEW 1: LOGIN PORTAL
  // ==========================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-cyan-400 flex items-center justify-center p-4 font-mono">
        <div className="max-w-md w-full bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-8 shadow-2xl shadow-cyan-500/20">
          <div className="flex flex-col items-center justify-center mb-6">
            <Zap className="w-12 h-12 text-cyan-400 animate-pulse mb-2" />
            <h1 className="text-4xl font-black text-white tracking-wider">CYBERHUB</h1>
            <p className="text-xs text-slate-400 mt-2 text-center">Sign in to access your chat account & join rooms</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-cyan-300 uppercase mb-2">Username</label>
              <input
                type="text"
                placeholder="e.g. LEO_Admin or CyberKnight"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition"
                required
              />
            </div>

            {username.startsWith('LEO_') && (
              <div>
                <label className="block text-xs font-bold text-amber-400 uppercase mb-2 flex items-center space-x-1">
                  <Lock className="w-3.5 h-3.5 inline mr-1" /> Enter Admin Password for {username}
                </label>
                <input
                  type="password"
                  placeholder="Enter admin password..."
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-4 py-3 text-amber-300 focus:outline-none focus:border-amber-400 transition"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-cyan-300 uppercase mb-2">Avatar Badge</label>
              <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400 flex items-center justify-between">
                <span>{username.startsWith('LEO_') ? '👑 Overlord Rank 100 Badge' : 'Standard Star Badge'}</span>
                <span>{username.startsWith('LEO_') ? '👑' : '⭐'}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-cyan-300 uppercase mb-2">Room ID / Code</label>
              <input
                type="text"
                placeholder="e.g. cyber-lobby"
                value={activeRoom}
                onChange={(e) => setActiveRoom(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-4 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20 mt-4"
            >
              <Terminal className="w-5 h-5" />
              <span>Sign In / Enter Hub</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  const currentMessages = roomMessages[activeRoom] || [];

  // ==========================================
  // 13. RENDER VIEW 2: MAIN DASHBOARD
  // ==========================================
  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 font-mono flex flex-col ${isGlitched ? 'animate-ping blur-sm bg-red-950' : ''}`}>
      {matrixText && (
        <div className="bg-red-600 text-white font-black text-center py-2 animate-bounce tracking-widest text-sm uppercase z-50">
          {matrixText}
        </div>
      )}

      {/* Header Bar */}
      <header className="bg-slate-900 border-b border-cyan-500/30 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center space-x-4">
          <Zap className="w-7 h-7 text-cyan-400 animate-pulse" />
          <span className="text-2xl font-black text-white tracking-wider">CYBERHUB</span>
          <span className="text-xs bg-cyan-950 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/40 font-bold">
            #{activeRoom}
          </span>
          <span className="hidden md:flex items-center space-x-1 text-[11px] text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-500/30">
            <Activity className="w-3 h-3 animate-spin" />
            <span>{pingMs}ms</span>
          </span>
        </div>

        <div className="flex items-center space-x-4 text-sm">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)} 
            className="text-slate-400 hover:text-cyan-400 p-2 rounded-lg bg-slate-950 border border-slate-800 transition"
            title="Toggle Audio Synthesizer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>

          <div 
            onClick={() => setShowProfileModal(true)}
            className="cursor-pointer flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-cyan-500/50 transition"
          >
            <span className="text-xs text-slate-400">User:</span>
            <span className={`font-bold ${rank >= 100 ? 'text-amber-400' : 'text-cyan-300'}`}>{username}</span>
            {rank >= 100 && <Crown className="w-4 h-4 text-amber-400 inline" />}
          </div>

          <button
            onClick={() => setIsLoggedIn(false)}
            className="text-xs bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-2 rounded-xl hover:bg-red-500/20 font-bold transition"
          >
            Leave
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side Navigation Panel */}
        <aside className="w-64 bg-slate-900/80 border-r border-slate-800 p-4 flex flex-col space-y-4">
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Cyber Rooms</span>
          </div>

          {/* Create Room Form */}
          <form onSubmit={handleCreateRoom} className="flex space-x-2">
            <input
              type="text"
              placeholder="Build room code..."
              value={newRoomInput}
              onChange={(e) => setNewRoomInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="bg-cyan-500 text-slate-950 p-1.5 rounded-lg hover:bg-cyan-400 font-bold transition"
              title="Add Room to Sidebar"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* Room Selection List */}
          <div className="flex-1 overflow-y-auto space-y-1">
            {rooms.map((room) => (
              <button
                key={room}
                onClick={() => setActiveRoom(room)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition ${
                  activeRoom === room 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <Hash className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span className="truncate">{room}</span>
                </div>
                {roomMessages[room]?.length > 0 && (
                  <span className="text-[10px] bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                    {roomMessages[room].length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Network Active Nodes */}
          <div className="pt-3 border-t border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center justify-between">
              <span>Active Nodes</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {activeUsersList.map((usr) => (
                <div key={usr} className="flex items-center justify-between text-xs text-slate-300 py-0.5">
                  <div className="flex items-center space-x-2 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span className="truncate">{usr}</span>
                  </div>
                  {usr.startsWith('LEO_') && <Crown className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Center Live Chat Feed */}
        <main className="flex-1 flex flex-col p-6 overflow-hidden max-w-4xl mx-auto w-full">
          <div className="flex-1 overflow-y-auto space-y-4 pr-3">
            {currentMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600">
                <MessageSquare className="w-12 h-12 mb-2 opacity-30" />
                <p className="text-xs">No transmissions in #{activeRoom} yet. Send the first message!</p>
              </div>
            ) : (
              currentMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`p-4 rounded-xl border transition-all ${
                    msg.rank >= 100 
                      ? 'bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-500/5' 
                      : msg.type === 'event'
                      ? 'bg-cyan-950/10 border-cyan-500/30'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{msg.badge}</span>
                      <span className={`font-bold ${msg.rank >= 100 ? 'text-amber-400' : 'text-cyan-300'}`}>
                        {msg.user}
                      </span>
                      {msg.rank >= 100 && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40 font-black">
                          ADMIN OVERLORD
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500">{msg.time}</span>
                  </div>

                  <p className={`text-sm leading-relaxed ${msg.color || 'text-slate-200'}`}>{msg.text}</p>

                  {/* Interactive Buttons */}
                  {msg.user !== username && msg.user !== 'SYSTEM' && msg.user !== 'SYSTEM_EVENT' && msg.user !== 'GLOBAL_ADMIN' && (
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
                      <button onClick={() => handleInteraction('slap', msg.user)} className="hover:bg-slate-800 px-2 py-1 rounded text-amber-400 font-bold transition">✋ Slap</button>
                      <button onClick={() => handleInteraction('kiss', msg.user)} className="hover:bg-slate-800 px-2 py-1 rounded text-pink-400 font-bold transition">😘 Kiss</button>
                      <button onClick={() => handleInteraction('highfive', msg.user)} className="hover:bg-slate-800 px-2 py-1 rounded text-cyan-400 font-bold transition">🙏 High-Five</button>
                      <button onClick={() => handleInteraction('hug', msg.user)} className="hover:bg-slate-800 px-2 py-1 rounded text-emerald-400 font-bold transition">🤗 Hug</button>
                      <button onClick={() => handleInteraction('flex', msg.user)} className="hover:bg-slate-800 px-2 py-1 rounded text-purple-400 font-bold transition">💪 Flex</button>
                      
                      {rank >= 100 && (
                        <button onClick={() => banUser(msg.user)} className="text-red-400 hover:underline font-bold ml-auto">🚫 Ban Account</button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Emoji Dock */}
          {showEmojiPicker && (
            <div className="bg-slate-900 border border-slate-700 p-2 rounded-xl flex space-x-2 mb-2 overflow-x-auto shadow-2xl">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => addEmoji(emoji)}
                  className="text-xl hover:bg-slate-800 p-2 rounded-lg transition"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Message Input Form */}
          <form onSubmit={sendMessage} className="mt-4 flex space-x-3">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="bg-slate-900 border border-slate-700 text-slate-300 hover:text-white px-3 py-3 rounded-xl transition"
            >
              <Smile className="w-5 h-5" />
            </button>
            <input
              type="text"
              placeholder={`Transmit message to #${activeRoom}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition"
            />
            <button
              type="submit"
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-6 py-3 rounded-xl transition flex items-center space-x-2 shadow-lg shadow-cyan-500/20"
            >
              <span>Transmit</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </main>

        {/* Level 100 Admin Dashboard (Right Panel) */}
        {rank >= 100 && (
          <aside className="w-72 bg-slate-900 border-l border-slate-800 p-6 flex flex-col space-y-6">
            <div className="flex items-center space-x-2 text-amber-400 border-b border-slate-800 pb-3">
              <ShieldAlert className="w-5 h-5" />
              <h2 className="font-bold text-sm uppercase tracking-wider">Admin Control</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 uppercase mb-2">Message Accent</label>
                <select
                  value={chatColor}
                  onChange={(e) => setChatColor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="text-amber-400 font-bold">Gold Glow</option>
                  <option value="text-pink-400 font-bold">Neon Pink</option>
                  <option value="text-emerald-400 font-bold">Matrix Green</option>
                  <option value="text-cyan-300 font-bold">Cyan Glow</option>
                </select>
              </div>

              <button
                onClick={broadcastNotice}
                className="w-full bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2"
              >
                <Bell className="w-4 h-4" />
                <span>Global Alert</span>
              </button>

              <button
                onClick={clearChat}
                className="w-full bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Wipe Room Stream</span>
              </button>

              <button
                onClick={triggerGlitchFX}
                className="w-full bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Glitch Grid FX</span>
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
