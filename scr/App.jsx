import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, Zap, Send, Crown, Lock, User, 
  Trash2, Flame, Heart, Hand, Volume2, Sparkles, Terminal
} from 'lucide-react';

export default function App() {
  const [username, setUsername] = useState('');
  const [badge, setBadge] = useState('Standard');
  const [roomCode, setRoomCode] = useState('cyber-lobby');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rank, setRank] = useState(1); // 1 = Standard, 100 = Admin

  const [messages, setMessages] = useState([
    { id: 1, user: 'CYBER_BOT', text: 'Welcome to CYBERHUB! Type a message or use interactions.', rank: 100, badge: '👑' },
    { id: 2, user: 'NeonRider', text: 'Hey everyone, glad to be here!', rank: 1, badge: '⭐' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isGlitched, setIsGlitched] = useState(false);

  // Auto admin detection for LEO_
  const handleLogin = (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    if (username.startsWith('LEO_')) {
      const pass = prompt('Admin Authorization required. Enter Password:');
      if (pass === 'password') {
        setRank(100);
        setBadge('Admin');
      } else {
        alert('Invalid Password! Logging in as Standard User.');
        setRank(1);
      }
    }
    setIsLoggedIn(true);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now(),
      user: username,
      text: inputText,
      rank: rank,
      badge: badge === 'Admin' ? '👑' : '⭐'
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
  };

  const handleInteraction = (type, targetUser) => {
    let actionText = '';
    if (type === 'slap') actionText = `✋ slapped @${targetUser}!`;
    if (type === 'kiss') actionText = `😘 blew a kiss to @${targetUser}!`;
    if (type === 'highfive') actionText = `🙏 gave a high-five to @${targetUser}!`;

    const interactionMsg = {
      id: Date.now(),
      user: 'SYSTEM',
      text: `${username} ${actionText}`,
      rank: 50,
      badge: '⚡'
    };
    setMessages((prev) => [...prev, interactionMsg]);
  };

  const triggerGlitchFX = () => {
    setIsGlitched(true);
    setTimeout(() => setIsGlitched(false), 3000);
  };

  const clearChat = () => {
    setMessages([]);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-cyan-400 flex items-center justify-center p-4 font-mono">
        <div className="max-w-md w-full bg-slate-900 border border-cyan-500/30 rounded-xl p-8 shadow-2xl shadow-cyan-500/10">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Zap className="w-10 h-10 text-cyan-400 animate-pulse" />
            <h1 className="text-3xl font-extrabold tracking-wider text-white">CYBERHUB</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs text-cyan-300 uppercase mb-2">Display Name</label>
              <input
                type="text"
                placeholder="e.g. LEO_Admin or CyberKnight"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-cyan-300 uppercase mb-2">Room Code</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
            >
              <span>ENTER CYBERHUB</span>
              <Terminal className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 font-mono flex flex-col ${isGlitched ? 'animate-bounce blur-xs' : ''}`}>
      {/* Header */}
      <header className="bg-slate-900 border-b border-cyan-500/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Zap className="w-6 h-6 text-cyan-400" />
          <span className="text-xl font-bold tracking-wider text-white">CYBERHUB</span>
          <span className="text-xs bg-slate-800 text-cyan-400 px-2.5 py-1 rounded-full border border-cyan-500/30">
            {roomCode}
          </span>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">User:</span>
            <span className="font-bold text-cyan-300">{username}</span>
            {rank >= 100 && <Crown className="w-4 h-4 text-amber-400 inline" />}
          </div>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded hover:bg-red-500/30 transition"
          >
            Leave
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Stream */}
        <main className="flex-1 flex flex-col p-6 overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{msg.badge}</span>
                    <span className={`font-bold ${msg.rank >= 100 ? 'text-amber-400' : 'text-cyan-300'}`}>
                      {msg.user}
                    </span>
                    {msg.rank >= 100 && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <p className="text-slate-200 text-sm leading-relaxed">{msg.text}</p>
                </div>

                {/* Account Interactions */}
                {msg.user !== username && msg.user !== 'SYSTEM' && (
                  <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => handleInteraction('slap', msg.user)}
                      title="Slap User"
                      className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-amber-400 transition"
                    >
                      ✋
                    </button>
                    <button
                      onClick={() => handleInteraction('kiss', msg.user)}
                      title="Blow Kiss"
                      className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-pink-400 transition"
                    >
                      😘
                    </button>
                    <button
                      onClick={() => handleInteraction('highfive', msg.user)}
                      title="High Five"
                      className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-400 transition"
                    >
                      🙏
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} className="mt-4 flex space-x-3">
            <input
              type="text"
              placeholder="Type your message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition"
            />
            <button
              type="submit"
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-3 rounded-lg font-bold transition flex items-center space-x-2"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </main>

        {/* Admin Tools Panel (Shown only if Rank >= 100) */}
        {rank >= 100 && (
          <aside className="w-72 bg-slate-900 border-l border-slate-800 p-6 flex flex-col space-y-6">
            <div className="flex items-center space-x-2 text-amber-400 border-b border-slate-800 pb-3">
              <ShieldAlert className="w-5 h-5" />
              <h2 className="font-bold text-sm uppercase tracking-wider">Admin Dashboard</h2>
            </div>

            <div className="space-y-3">
              <button
                onClick={clearChat}
                className="w-full bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Chat Log</span>
              </button>

              <button
                onClick={triggerGlitchFX}
                className="w-full bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Simulate Glitch FX</span>
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
