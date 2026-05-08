import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight, CheckCircle, XCircle, Minus, Clock,
  FileText, Award, BarChart2
} from 'lucide-react';
import api from '../lib/api';

const OPTS = ['A', 'B', 'C', 'D'];
const optLabel = { A: 'أ', B: 'ب', C: 'ج', D: 'د' };

function optStyle(opt, studentAnswer, correctAnswer) {
  const isCorrect      = opt === correctAnswer;
  const isStudentChoice = opt === studentAnswer;
  if (isCorrect && isStudentChoice) return 'border-green-500 bg-green-50';
  if (isCorrect)                    return 'border-green-400 bg-green-50';
  if (isStudentChoice && !isCorrect)return 'border-red-400 bg-red-50';
  return 'border-gray-200 bg-white';
}

function optBadge(opt, studentAnswer, correctAnswer) {
  const isCorrect      = opt === correctAnswer;
  const isStudentChoice = opt === studentAnswer;
  if (isCorrect && isStudentChoice) return 'bg-green-500 text-white';
  if (isCorrect)                    return 'bg-green-400 text-white';
  if (isStudentChoice && !isCorrect)return 'bg-red-400 text-white';
  return 'bg-gray-100 text-gray-500';
}

function optTextColor(opt, studentAnswer, correctAnswer) {
  const isCorrect      = opt === correctAnswer;
  const isStudentChoice = opt === studentAnswer;
  if (isCorrect)                    return 'text-green-800 font-semibold';
  if (isStudentChoice && !isCorrect)return 'text-red-800 font-semibold';
  return 'text-gray-600';
}

function optIcon(opt, studentAnswer, correctAnswer) {
  const isCorrect      = opt === correctAnswer;
  const isStudentChoice = opt === studentAnswer;
  if (isCorrect && isStudentChoice) return <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />;
  if (isCorrect)                    return <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />;
  if (isStudentChoice && !isCorrect)return <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />;
  return null;
}

export default function ExamReviewPage() {
  const { resultId } = useParams();
  const navigate     = useNavigate();
  const { user }     = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['exam-review', resultId],
    queryFn: () => api.get(`/exams/results/${resultId}/review`).then(r => r.data),
    enabled: !!resultId,
  });

  const { result, questions = [] } = data || {};

  const passed       = result && result.score >= result.pass_score;
  const pct          = result ? Math.round((result.score / result.total_score) * 100) : 0;
  const correctCount = questions.filter(q => q.is_correct).length;
  const wrongCount   = questions.filter(q => !q.is_correct && q.student_answer).length;
  const skippedCount = questions.filter(q => !q.student_answer).length;

  const goBack = () => navigate(-1);

  return (
    <div className="min-h-screen bg-gray-50 font-cairo" dir="rtl">

      {/* ── Top bar ── */}
      <div className={`sticky top-0 z-30 border-b shadow-sm ${passed ? 'bg-green-700' : 'bg-red-700'}`}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button onClick={goBack}
            className="flex items-center gap-2 text-white/90 hover:text-white text-sm font-bold transition-colors">
            <ArrowRight className="w-4 h-4" />
            رجوع
          </button>
          <h1 className="text-white font-black text-base truncate flex-1 text-center">
            {isLoading ? 'تحميل…' : (result?.exam_title || 'مراجعة الاختبار')}
          </h1>
          <div className="text-white font-black text-lg w-16 text-left">
            {result ? `${result.score}/${result.total_score}` : ''}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            <div className="h-28 bg-white rounded-2xl animate-pulse" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-52 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
            <XCircle className="w-14 h-14 text-red-300 mx-auto mb-3" />
            <p className="text-gray-700 font-bold text-lg">تعذّر تحميل المراجعة</p>
            <p className="text-gray-400 text-sm mt-1 mb-4">تحقق من الاتصال أو حاول مجدداً</p>
            <button onClick={goBack} className="btn-primary px-6 py-2">رجوع</button>
          </div>
        )}

        {/* Content */}
        {!isLoading && !isError && result && (
          <>
            {/* ── Summary card ── */}
            <div className={`rounded-2xl border-2 p-5 shadow-sm ${passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  {result.student_name && user?.role !== 'student' && (
                    <p className="text-sm text-gray-500 font-medium mb-1">الطالب: <span className="font-bold text-gray-800">{result.student_name}</span></p>
                  )}
                  <div className="flex items-center gap-3">
                    <span className={`text-4xl font-black ${passed ? 'text-green-700' : 'text-red-600'}`}>
                      {result.score}
                      <span className="text-lg text-gray-400 font-semibold">/{result.total_score}</span>
                    </span>
                    <span className={`text-sm font-black px-3 py-1 rounded-full ${passed ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-700'}`}>
                      {passed ? '✓ ناجح' : '✗ راسب'}
                    </span>
                  </div>
                  <div className="mt-3 h-2.5 w-64 max-w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-2.5 rounded-full ${passed ? 'bg-green-500' : 'bg-red-400'}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-1">{pct}% من الدرجة الكاملة</p>
                </div>

                <div className="flex flex-wrap gap-3 text-sm font-bold">
                  <div className="flex flex-col items-center gap-1 bg-green-100 rounded-xl px-4 py-3 min-w-[64px]">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 text-lg font-black">{correctCount}</span>
                    <span className="text-green-700 text-xs">صحيح</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 bg-red-100 rounded-xl px-4 py-3 min-w-[64px]">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-700 text-lg font-black">{wrongCount}</span>
                    <span className="text-red-600 text-xs">خاطئ</span>
                  </div>
                  {skippedCount > 0 && (
                    <div className="flex flex-col items-center gap-1 bg-gray-100 rounded-xl px-4 py-3 min-w-[64px]">
                      <Minus className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600 text-lg font-black">{skippedCount}</span>
                      <span className="text-gray-500 text-xs">متروك</span>
                    </div>
                  )}
                  {result.points_earned > 0 && (
                    <div className="flex flex-col items-center gap-1 bg-orange-100 rounded-xl px-4 py-3 min-w-[64px]">
                      <Award className="w-5 h-5 text-orange-500" />
                      <span className="text-orange-700 text-lg font-black">+{result.points_earned}</span>
                      <span className="text-orange-600 text-xs">نقطة</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Legend ── */}
            <div className="flex flex-wrap gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 text-green-800 rounded-full">
                <CheckCircle className="w-3.5 h-3.5 text-green-600" /> إجابة صحيحة
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-red-800 rounded-full">
                <XCircle className="w-3.5 h-3.5 text-red-500" /> إجابتك الخاطئة
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-full">
                <Minus className="w-3.5 h-3.5 text-gray-400" /> لم تُجَب
              </span>
            </div>

            {/* ── Questions ── */}
            <div className="space-y-5">
              {questions.map((q, qi) => {
                const studentAns = q.student_answer;
                const correctAns = q.correct_answer;
                const answered   = !!studentAns;

                return (
                  <div key={q.id} className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden ${
                    !answered       ? 'border-gray-200'
                    : q.is_correct  ? 'border-green-300'
                    :                  'border-red-300'
                  }`}>
                    {/* Question header */}
                    <div className={`px-5 py-3 flex items-center gap-3 border-b ${
                      !answered       ? 'bg-gray-50 border-gray-100'
                      : q.is_correct  ? 'bg-green-50 border-green-100'
                      :                  'bg-red-50 border-red-100'
                    }`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black text-white shadow-sm ${
                        !answered ? 'bg-gray-400' : q.is_correct ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {qi + 1}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <span className="text-gray-500">{q.points} نقطة</span>
                        {!answered && (
                          <span className="flex items-center gap-1 text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" /> لم تُجَب
                          </span>
                        )}
                        {answered && q.is_correct && (
                          <span className="flex items-center gap-1 text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" /> صحيحة ✓
                          </span>
                        )}
                        {answered && !q.is_correct && (
                          <span className="flex items-center gap-1 text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3" /> خاطئة ✗
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Question body */}
                    <div className="px-5 py-4">
                      <p className="font-bold text-navy-700 text-base leading-relaxed mb-1">{q.question_text}</p>
                      {q.question_image_url && (
                        <img src={q.question_image_url} alt="" className="mt-2 mb-3 max-w-sm rounded-xl border border-gray-200" />
                      )}

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
                        {OPTS.map(opt => {
                          const text = q[`option_${opt.toLowerCase()}`];
                          if (!text) return null;
                          return (
                            <div key={opt}
                              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${optStyle(opt, studentAns, correctAns)}`}>
                              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${optBadge(opt, studentAns, correctAns)}`}>
                                {optLabel[opt]}
                              </span>
                              <span className={`text-sm flex-1 leading-snug ${optTextColor(opt, studentAns, correctAns)}`}>
                                {text}
                              </span>
                              {optIcon(opt, studentAns, correctAns)}
                            </div>
                          );
                        })}
                      </div>

                      {/* Correction note */}
                      {answered && !q.is_correct && (
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5">
                          <span className="flex items-center gap-1.5 text-red-700">
                            <XCircle className="w-3.5 h-3.5" />
                            اخترت: <strong>{optLabel[studentAns]} — {q[`option_${studentAns?.toLowerCase()}`] || studentAns}</strong>
                          </span>
                          <span className="flex items-center gap-1.5 text-green-800">
                            <CheckCircle className="w-3.5 h-3.5" />
                            الصحيح: <strong>{optLabel[correctAns]} — {q[`option_${correctAns?.toLowerCase()}`] || correctAns}</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Bottom CTA ── */}
            <div className="flex justify-center py-4">
              <button onClick={goBack}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-navy-500 hover:bg-navy-600 text-white font-bold transition-colors shadow-md">
                <ArrowRight className="w-5 h-5" />
                العودة للخلف
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
