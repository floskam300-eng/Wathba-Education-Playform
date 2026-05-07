import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight, Play, FileText, BookOpen, ChevronDown, ChevronRight,
  Video, Clock, CheckCircle2, AlertCircle, Download, Maximize2
} from 'lucide-react';
import api from '../../lib/api';

const API_BASE = '/api';

function isLocalFile(url) {
  return url && url.startsWith('/uploads/');
}

function getVideoSrc(url) {
  if (!url) return '';
  if (isLocalFile(url)) return `${API_BASE.replace('/api', '')}${url}`;
  return url;
}

function getPdfSrc(url) {
  if (!url) return '';
  if (isLocalFile(url)) return `${API_BASE.replace('/api', '')}${url}`;
  return url;
}

export default function CourseView() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeVideo, setActiveVideo] = useState(null);
  const [activePdf, setActivePdf] = useState(null);
  const [activeTab, setActiveTab] = useState('videos');

  const { data: courses = [] } = useQuery({
    queryKey: ['student-courses'],
    queryFn: () => api.get('/courses/student/my-courses').then(r => r.data),
  });

  const { data: content, isLoading } = useQuery({
    queryKey: ['course-content', courseId],
    queryFn: () => api.get(`/courses/${courseId}/content`).then(r => r.data),
    enabled: !!courseId,
  });

  const course = courses.find(c => String(c.id) === String(courseId));

  const videos = content?.videos || [];
  const pdfs = content?.pdfs || [];
  const exams = content?.exams || [];

  const currentVideo = activeVideo || videos[0] || null;
  const currentPdf = activePdf || pdfs[0] || null;

  return (
    <div className="space-y-0 -m-4 lg:-m-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/student/courses')}
            className="flex items-center gap-1.5 text-sm font-bold text-navy-600 hover:text-orange-500 transition-colors">
            <ArrowRight className="w-4 h-4" />
            <span>كورساتي</span>
          </button>
          <span className="text-gray-300">/</span>
          <h1 className="text-sm font-black text-gray-800 truncate">{course?.name || 'الكورس'}</h1>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)]">
        {/* Sidebar - content list */}
        <aside className="w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-l border-gray-200 flex flex-col flex-shrink-0 order-2 lg:order-1">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {[
              { key: 'videos', label: 'الفيديوهات', icon: Video, count: videos.length },
              { key: 'pdfs', label: 'الملفات', icon: FileText, count: pdfs.length },
              { key: 'exams', label: 'الاختبارات', icon: BookOpen, count: exams.length },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-bold transition-colors border-b-2 ${
                  activeTab === tab.key
                    ? 'text-orange-500 border-orange-500 bg-orange-50/50'
                    : 'text-gray-400 border-transparent hover:text-gray-600'
                }`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
                <span className={`text-[10px] rounded-full px-1.5 font-black ${activeTab === tab.key ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />)}
              </div>
            ) : activeTab === 'videos' ? (
              <div className="p-3 space-y-2">
                {videos.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Video className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">لا توجد فيديوهات بعد</p>
                  </div>
                ) : videos.map((v, i) => (
                  <button key={v.id} onClick={() => { setActiveVideo(v); setActiveTab('videos'); }}
                    className={`w-full text-right flex items-center gap-3 p-3 rounded-xl transition-all ${
                      currentVideo?.id === v.id && activeTab === 'videos'
                        ? 'bg-navy-600 text-white shadow-md'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      currentVideo?.id === v.id && activeTab === 'videos' ? 'bg-white/20' : 'bg-navy-100'
                    }`}>
                      <Play className={`w-4 h-4 ${currentVideo?.id === v.id && activeTab === 'videos' ? 'text-white' : 'text-navy-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{v.title}</p>
                      {v.duration_minutes > 0 && (
                        <p className={`text-xs flex items-center gap-1 mt-0.5 ${currentVideo?.id === v.id && activeTab === 'videos' ? 'text-white/70' : 'text-gray-400'}`}>
                          <Clock className="w-3 h-3" /> {v.duration_minutes} دقيقة
                        </p>
                      )}
                    </div>
                    <span className={`text-xs font-black w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      currentVideo?.id === v.id && activeTab === 'videos' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>{i + 1}</span>
                  </button>
                ))}
              </div>
            ) : activeTab === 'pdfs' ? (
              <div className="p-3 space-y-2">
                {pdfs.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">لا توجد ملفات بعد</p>
                  </div>
                ) : pdfs.map(p => (
                  <button key={p.id} onClick={() => { setActivePdf(p); setActiveTab('pdfs'); }}
                    className={`w-full text-right flex items-center gap-3 p-3 rounded-xl transition-all ${
                      activePdf?.id === p.id && activeTab === 'pdfs'
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      activePdf?.id === p.id && activeTab === 'pdfs' ? 'bg-white/20' : 'bg-orange-100'
                    }`}>
                      <FileText className={`w-4 h-4 ${activePdf?.id === p.id && activeTab === 'pdfs' ? 'text-white' : 'text-orange-600'}`} />
                    </div>
                    <p className="flex-1 font-bold text-sm text-right truncate">{p.title}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {exams.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">لا توجد اختبارات بعد</p>
                  </div>
                ) : exams.map(ex => (
                  <button key={ex.id} onClick={() => navigate('/student/exams')}
                    className="w-full text-right flex items-center gap-3 p-3 rounded-xl bg-purple-50 hover:bg-purple-100 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-purple-800 truncate">{ex.title}</p>
                      <p className="text-xs text-purple-500 mt-0.5">{ex.total_score} درجة · {ex.duration_minutes} دقيقة</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto order-1 lg:order-2 bg-gray-900">
          {activeTab === 'videos' ? (
            currentVideo ? (
              <div className="flex flex-col h-full">
                {isLocalFile(currentVideo.file_path_or_url) ? (
                  <video
                    key={currentVideo.id}
                    src={getVideoSrc(currentVideo.file_path_or_url)}
                    controls
                    className="w-full flex-1 bg-black max-h-[70vh]"
                    style={{ objectFit: 'contain' }}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-gray-900">
                    <div className="text-center text-white p-8">
                      <Play className="w-16 h-16 mx-auto mb-4 opacity-40" />
                      <p className="font-bold text-lg mb-2">{currentVideo.title}</p>
                      <p className="text-gray-400 text-sm mb-6">هذا الفيديو متاح عبر رابط خارجي</p>
                      <a href={currentVideo.file_path_or_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                        <Play className="w-4 h-4" /> مشاهدة الفيديو
                      </a>
                    </div>
                  </div>
                )}
                <div className="bg-gray-800 px-5 py-4">
                  <h2 className="text-white font-black text-base">{currentVideo.title}</h2>
                  {currentVideo.duration_minutes > 0 && (
                    <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {currentVideo.duration_minutes} دقيقة
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Video className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-gray-400 font-medium">اختر فيديو للمشاهدة</p>
                </div>
              </div>
            )
          ) : activeTab === 'pdfs' ? (
            <div className="flex flex-col h-full">
              {(activePdf || pdfs[0]) ? (
                <>
                  <div className="bg-gray-800 px-5 py-3 flex items-center justify-between">
                    <h2 className="text-white font-black text-sm truncate">{(activePdf || pdfs[0]).title}</h2>
                    <a href={getPdfSrc((activePdf || pdfs[0]).file_url)} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors flex-shrink-0">
                      <Download className="w-3.5 h-3.5" /> تحميل
                    </a>
                  </div>
                  <iframe
                    key={(activePdf || pdfs[0]).id}
                    src={getPdfSrc((activePdf || pdfs[0]).file_url)}
                    className="flex-1 w-full bg-white"
                    title={(activePdf || pdfs[0]).title}
                  />
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-gray-400 font-medium">اختر ملف للعرض</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400 p-8">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="font-bold text-white mb-2">الاختبارات</p>
                <p className="text-gray-400 text-sm mb-6">يمكنك الوصول إلى اختبارات هذا الكورس من صفحة الاختبارات</p>
                <button onClick={() => navigate('/student/exams')}
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                  <BookOpen className="w-4 h-4" /> الذهاب للاختبارات
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
