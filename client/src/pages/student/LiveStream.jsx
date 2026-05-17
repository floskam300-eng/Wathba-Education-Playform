import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  Video, Mic, MicOff, VideoOff, Hand, MessageCircle,
  Users, X, Send, Radio, Clock, LogIn, LogOut,
  Volume2, VolumeX, Maximize, Settings, ChevronRight,
  Smile, AlertTriangle, CheckCircle, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_ACTIVE_STREAMS = [
  {
    id: 1,
    roomId: 'wathba-demo-live',
    teacherName: 'الأستاذ / أحمد محمد',
    title: 'مراجعة الجبر — الوحدة الثالثة',
    subject: 'رياضيات',
    stage: 'الصف الثاني الثانوي',
    startedAt: new Date(Date.now() - 18 * 60 * 1000),
    viewersCount: 27,
    live: true,
  },
];

const EMOJIS = ['👍', '❤️', '😮', '🎉', '🤔', '👏'];

const MOCK_CHAT = [
  { id: 1, sender: 'محمد علي', msg: 'أستاذ مش فاهم الجزء الأخير ممكن تعيده؟', ts: Date.now() - 300000, type: 'student' },
  { id: 2, sender: 'الأستاذ', msg: 'حبوب، هرجعه دلوقتي 👍', ts: Date.now() - 240000, type: 'teacher' },
  { id: 3, sender: 'ياسمين سمير', msg: 'شكراً أستاذ الشرح واضح جداً', ts: Date.now() - 180000, type: 'student' },
  { id: 4, sender: 'عمر فاروق', msg: 'ممكن تحل مثال تاني على نفس الأسلوب؟', ts: Date.now() - 60000, type: 'student' },
];

function fmtTime(date) {
  return new Date(date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

function fmtElapsed(startedAt) {
  const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000);
  if (diff < 60) return `${diff} دقيقة`;
  return `${Math.floor(diff / 60)} ساعة ${diff % 60} دقيقة`;
}

function EmojiReaction({ emoji, count }) {
  return (
    <div className="absolute bottom-16 left-4 animate-bounce pointer-events-none z-30 flex items-center gap-1 bg-black/60 rounded-full px-3 py-1.5">
      <span className="text-lg">{emoji}</span>
      <span className="text-white text-xs font-bold">{count}</span>
    </div>
  );
}

function StreamLobby({ stream, onJoin, dark }) {
  const elapsed = fmtElapsed(stream.startedAt);

  return (
    <div className={`rounded-2xl border overflow-hidden ${dark ? 'bg-[var(--dk-surface)] border-[var(--dk-border)]' : 'bg-white border-gray-100 shadow-sm'}`}>
      <div className="relative bg-gradient-to-br from-navy-700 to-indigo-900 p-8 text-center">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #f97316 0%, transparent 60%)' }} />
        <span className="inline-flex items-center gap-1.5 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full animate-pulse mb-4">
          <Radio className="w-3.5 h-3.5" /> مباشر الآن
        </span>
        <h3 className="text-white font-black text-xl mb-1">{stream.title}</h3>
        <p className="text-navy-200 text-sm mb-4">{stream.teacherName}</p>
        <div className="flex items-center justify-center gap-4 text-xs font-bold text-navy-300 mb-6">
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-orange-400" /> {stream.viewersCount} مشاهد</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-orange-400" /> منذ {elapsed}</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-orange-400 rounded-full" />
            {stream.subject}
          </span>
        </div>
        <button
          onClick={() => onJoin(stream)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-black px-8 py-3 rounded-xl flex items-center gap-2 mx-auto transition-all shadow-lg shadow-orange-500/30 hover:scale-105"
        >
          <LogIn className="w-5 h-5" />
          انضم للبث الآن
        </button>
      </div>
      <div className={`px-6 py-3 flex items-center justify-center gap-2 text-xs font-bold ${dark ? 'text-[var(--dk-text-2)]' : 'text-gray-400'}`}>
        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg">{stream.stage}</span>
      </div>
    </div>
  );
}

export default function StudentLiveStream() {
  const { dark } = useTheme();
  const [joinedStream, setJoinedStream] = useState(null);
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [chatMsg, setChatMsg] = useState('');
  const [chatMessages, setChatMessages] = useState(MOCK_CHAT);
  const [activeEmoji, setActiveEmoji] = useState(null);
  const [emojiCount, setEmojiCount] = useState(0);
  const [handQueue, setHandQueue] = useState(['محمد علي', 'سارة أحمد']);
  const [viewersCount, setViewersCount] = useState(27);
  const [elapsed, setElapsed] = useState('18 دقيقة');
  const [muted, setMuted] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleJoin = (stream) => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setJoinedStream(stream);
      setViewersCount(v => v + 1);
      toast.success('🎓 انضممت للبث!');
    }, 1800);
  };

  const handleLeave = () => {
    setJoinedStream(null);
    setHandRaised(false);
    setMicOn(false);
    setCamOn(false);
    setViewersCount(v => Math.max(0, v - 1));
    toast('غادرت البث', { icon: '👋' });
  };

  const handleSendMsg = () => {
    if (!chatMsg.trim()) return;
    setChatMessages(prev => [...prev, {
      id: Date.now(), sender: 'أنا', msg: chatMsg.trim(),
      ts: Date.now(), type: 'me',
    }]);
    setChatMsg('');
  };

  const handleHandRaise = () => {
    const next = !handRaised;
    setHandRaised(next);
    if (next) {
      toast('✋ طلبت الكلام، انتظر إذن الأستاذ', { duration: 3000 });
    } else {
      toast('نزّلت يدك', { icon: '👇', duration: 2000 });
    }
  };

  const sendEmoji = (emoji) => {
    setActiveEmoji(emoji);
    setEmojiCount(c => c + 1);
    setTimeout(() => setActiveEmoji(null), 2500);
  };

  const cardClass = dark
    ? 'bg-[var(--dk-surface)] border-[var(--dk-border)]'
    : 'bg-white border-gray-100 shadow-sm';

  if (connecting) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4" dir="rtl">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
        <p className={`text-lg font-black ${dark ? 'text-[var(--dk-text)]' : 'text-navy-700'}`}>
          جاري الاتصال بالبث...
        </p>
        <p className={`text-sm ${dark ? 'text-[var(--dk-text-2)]' : 'text-gray-400'}`}>
          انتظر لحظة
        </p>
      </div>
    );
  }

  if (joinedStream) {
    return (
      <div className="flex flex-col h-full" dir="rtl" style={{ height: 'calc(100vh - 57px)' }}>
        <div className="flex items-center justify-between px-4 py-2 border-b flex-shrink-0"
          style={dark ? { backgroundColor: 'var(--dk-surface)', borderColor: 'var(--dk-border)' } : { backgroundColor: '#fff', borderColor: '#e5e7eb' }}>
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex items-center gap-1 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-full animate-pulse flex-shrink-0">
              <Radio className="w-3 h-3" /> مباشر
            </span>
            <span className={`text-sm font-black truncate ${dark ? 'text-[var(--dk-text)]' : 'text-navy-800'}`}>
              {joinedStream.title}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-xs font-bold hidden sm:flex items-center gap-1 ${dark ? 'text-[var(--dk-text-2)]' : 'text-gray-400'}`}>
              <Users className="w-3.5 h-3.5" /> {viewersCount}
            </span>
            <button
              onClick={() => setShowChat(v => !v)}
              className={`p-1.5 rounded-lg transition-colors ${dark ? 'text-[var(--dk-text-2)] hover:bg-[var(--dk-elevated)]' : 'text-gray-500 hover:bg-gray-100'}`}
              title={showChat ? 'أخفِ الدردشة' : 'أظهر الدردشة'}
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            <button
              onClick={handleLeave}
              className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">مغادرة</span>
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 relative bg-gray-950 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center z-10">
                  <div className="w-24 h-24 rounded-full bg-navy-600 flex items-center justify-center text-white text-4xl font-black mx-auto mb-3 ring-4 ring-orange-500 ring-offset-4 ring-offset-gray-950">
                    أ
                  </div>
                  <p className="text-white font-black text-lg">أحمد محمد</p>
                  <p className="text-gray-400 text-sm mt-1">جارٍ البث المباشر...</p>
                </div>
              </div>

              <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                <span className="flex items-center gap-1 bg-black/70 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  <Clock className="w-3 h-3 text-orange-400" /> {elapsed}
                </span>
              </div>

              {activeEmoji && <EmojiReaction emoji={activeEmoji} count={emojiCount} />}

              {handRaised && (
                <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-yellow-500/90 text-white text-xs font-black px-3 py-1.5 rounded-full animate-pulse">
                  <Hand className="w-3.5 h-3.5" /> يدك مرفوعة
                </div>
              )}

              {handQueue.length > 0 && (
                <div className="absolute bottom-28 right-3 z-20">
                  <div className="bg-black/70 rounded-xl px-3 py-2">
                    <p className="text-xs text-white font-bold mb-1.5 flex items-center gap-1">
                      <Hand className="w-3 h-3 text-yellow-400" /> طابور رفع اليد
                    </p>
                    {handQueue.map((name, i) => (
                      <p key={i} className="text-xs text-gray-300 font-bold">{i + 1}. {name}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={dark ? { backgroundColor: 'var(--dk-elevated)' } : { backgroundColor: '#1e293b' }}>
              <div className="flex items-center gap-2">
                {EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => sendEmoji(emoji)}
                    className="text-xl hover:scale-125 transition-transform"
                    title="أرسل تفاعل"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleHandRaise}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-black transition-all ${
                    handRaised
                      ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  title={handRaised ? 'نزّل يدك' : 'ارفع يدك'}
                >
                  <Hand className="w-4 h-4" />
                  <span className="hidden sm:inline">{handRaised ? 'نزّل يدك' : 'ارفع يد'}</span>
                </button>

                <button
                  onClick={() => setMicOn(v => !v)}
                  className={`p-2.5 rounded-xl transition-all ${micOn ? 'bg-orange-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                  title={micOn ? 'أوقف الميكروفون' : 'شغّل الميكروفون'}
                >
                  {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setCamOn(v => !v)}
                  className={`p-2.5 rounded-xl transition-all ${camOn ? 'bg-orange-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                  title={camOn ? 'أوقف الكاميرا' : 'شغّل الكاميرا'}
                >
                  {camOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setMuted(v => !v)}
                  className={`p-2.5 rounded-xl transition-all ${muted ? 'bg-red-500/40 text-red-300' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                  title={muted ? 'فكّ الكتم' : 'اكتم الصوت'}
                >
                  {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {showChat && (
            <div className={`w-72 flex-shrink-0 flex flex-col border-r ${dark ? 'bg-[var(--dk-surface)] border-[var(--dk-border)]' : 'bg-gray-50 border-gray-200'}`}>
              <div className={`flex items-center justify-between px-4 py-3 border-b flex-shrink-0 ${dark ? 'border-[var(--dk-border)]' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2">
                  <MessageCircle className={`w-4 h-4 ${dark ? 'text-amber-400' : 'text-orange-500'}`} />
                  <span className={`text-sm font-black ${dark ? 'text-[var(--dk-text)]' : 'text-navy-700'}`}>دردشة البث</span>
                </div>
                <span className={`text-xs font-bold ${dark ? 'text-[var(--dk-text-2)]' : 'text-gray-400'}`}>
                  {chatMessages.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                {chatMessages.map(msg => (
                  <div key={msg.id} className={`flex flex-col gap-0.5 ${msg.type === 'me' ? 'items-end' : 'items-start'}`}>
                    <span className={`text-xs font-black ${
                      msg.type === 'teacher' ? 'text-orange-500' :
                      msg.type === 'me' ? (dark ? 'text-amber-400' : 'text-blue-600') :
                      dark ? 'text-[var(--dk-text-2)]' : 'text-gray-500'
                    }`}>
                      {msg.type === 'teacher' && '🎓 '}{msg.sender}
                    </span>
                    <div className={`px-3 py-2 rounded-xl text-sm max-w-[90%] ${
                      msg.type === 'teacher'
                        ? 'bg-orange-500 text-white'
                        : msg.type === 'me'
                          ? dark ? 'bg-amber-500/20 text-[var(--dk-text)]' : 'bg-blue-500 text-white'
                          : dark ? 'bg-[var(--dk-elevated)] text-[var(--dk-text)]' : 'bg-white text-navy-700 shadow-sm'
                    }`}>
                      {msg.msg}
                    </div>
                    <span className={`text-[10px] ${dark ? 'text-[var(--dk-text-2)]' : 'text-gray-300'}`}>
                      {fmtTime(msg.ts)}
                    </span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className={`flex items-center gap-2 px-3 py-3 border-t flex-shrink-0 ${dark ? 'border-[var(--dk-border)]' : 'border-gray-200'}`}>
                <input
                  className="input-field flex-1 text-sm py-2"
                  placeholder="اكتب تعليقاً..."
                  value={chatMsg}
                  onChange={e => setChatMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMsg()}
                  maxLength={200}
                />
                <button
                  onClick={handleSendMsg}
                  disabled={!chatMsg.trim()}
                  className="p-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6" dir="rtl">
      <div>
        <h1 className={`text-2xl font-black ${dark ? 'text-[var(--dk-text)]' : 'text-navy-800'}`}>
          البث المباشر 🔴
        </h1>
        <p className={`text-sm mt-0.5 ${dark ? 'text-[var(--dk-text-2)]' : 'text-gray-500'}`}>
          انضم للجلسات التعليمية المباشرة مع أستاذك
        </p>
      </div>

      {MOCK_ACTIVE_STREAMS.length > 0 ? (
        <div>
          <p className={`text-sm font-black mb-3 flex items-center gap-2 ${dark ? 'text-[var(--dk-text-2)]' : 'text-gray-500'}`}>
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block" />
            الجلسات المتاحة الآن
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_ACTIVE_STREAMS.map(stream => (
              <StreamLobby key={stream.id} stream={stream} onJoin={handleJoin} dark={dark} />
            ))}
          </div>
        </div>
      ) : (
        <div className={`rounded-2xl border p-12 text-center ${cardClass}`}>
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Radio className={`w-8 h-8 ${dark ? 'text-[var(--dk-text-2)]' : 'text-gray-400'}`} />
          </div>
          <p className={`text-lg font-black mb-1 ${dark ? 'text-[var(--dk-text-2)]' : 'text-gray-500'}`}>
            لا يوجد بث مباشر الآن
          </p>
          <p className={`text-sm ${dark ? 'text-[var(--dk-text-2)]' : 'text-gray-400'}`}>
            هيظهر هنا لما الأستاذ يبدأ جلسة مباشرة
          </p>
        </div>
      )}

      <div className={`rounded-2xl border p-5 ${cardClass}`}>
        <h2 className={`text-sm font-black mb-3 ${dark ? 'text-[var(--dk-text)]' : 'text-navy-700'}`}>
          إرشادات قبل الدخول
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: Mic, text: 'اضبط الميكروفون والسماعات قبل الدخول', color: 'text-green-500 bg-green-50' },
            { icon: Hand, text: 'ارفع يدك لو عاوز تتكلم مع الأستاذ', color: 'text-yellow-500 bg-yellow-50' },
            { icon: MessageCircle, text: 'استخدم الدردشة للأسئلة الكتابية', color: 'text-blue-500 bg-blue-50' },
            { icon: AlertTriangle, text: 'تسجيل البث ممنوع إلا بإذن الأستاذ', color: 'text-red-500 bg-red-50' },
          ].map(({ icon: Icon, text, color }) => (
            <div key={text} className="flex items-center gap-3">
              <span className={`p-2 rounded-xl flex-shrink-0 ${color}`}>
                <Icon className="w-4 h-4" />
              </span>
              <p className={`text-sm font-bold ${dark ? 'text-[var(--dk-text-2)]' : 'text-gray-600'}`}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
