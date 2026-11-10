import React, { useState, useEffect } from "react";
import { BookOpen, Video, ChevronRight, GraduationCap, Clock, AlertTriangle, Shield, CheckCircle2, Plus } from "lucide-react";
import { EducationContent, Profile } from "../types";

interface EducationSectionProps {
  educationList: EducationContent[];
  currentUser: Profile | null;
  onAddEducation: (formData: any) => Promise<boolean>;
}

export default function EducationSection({
  educationList,
  currentUser,
  onAddEducation
}: EducationSectionProps) {
  const [activeGroup, setActiveGroup] = useState<'Little Learners (4-7)' | 'Growing Up (8-12)' | 'Teens (13-17)'>('Little Learners (4-7)');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<EducationContent | null>(null);

  // persistent progress state
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("emora_learning_progress");
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });

  // Sync progress with backend on mount & user change
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch("/api/women/progress");
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.completedLessons)) {
            setCompletedLessons(data.completedLessons);
            localStorage.setItem("emora_learning_progress", JSON.stringify(data.completedLessons));
          }
        }
      } catch (err) {
        console.error("Failed to load lesson progress from backend", err);
      }
    };
    fetchProgress();
  }, [currentUser]);

  // Interactive session quiz state
  const [sessionQuizAnswers, setSessionQuizAnswers] = useState<Record<string, string>>({});
  const [sessionQuizFeedback, setSessionQuizFeedback] = useState<string | null>(null);
  const [sessionSuccess, setSessionSuccess] = useState<boolean>(false);

  // Sync progress to DB or localStorage
  const saveProgress = async (lessonId: string) => {
    if (!completedLessons.includes(lessonId)) {
      const next = [...completedLessons, lessonId];
      setCompletedLessons(next);
      localStorage.setItem("emora_learning_progress", JSON.stringify(next));

      try {
        await fetch("/api/women/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "lesson", id: lessonId, action: "complete" })
        });
      } catch (err) {
        console.error("Failed to save progress to backend:", err);
      }
    }
  };

  const removeProgress = async (lessonId: string) => {
    const next = completedLessons.filter(id => id !== lessonId);
    setCompletedLessons(next);
    localStorage.setItem("emora_learning_progress", JSON.stringify(next));

    try {
      await fetch("/api/women/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "lesson", id: lessonId, action: "incomplete" })
      });
    } catch (err) {
      console.error("Failed to remove progress from backend:", err);
    }
  };

  // Form states for new education lessons
  const [title, setTitle] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDuration, setVideoDuration] = useState("");
  const [ageGroup, setAgeGroup] = useState<'Little Learners (4-7)' | 'Growing Up (8-12)' | 'Teens (13-17)'>('Little Learners (4-7)');
  const [iconName, setIconName] = useState("Shield");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group content
  const filteredLessons = educationList.filter(item => item.age_group === activeGroup && item.is_active);
  const completedInActiveGroup = filteredLessons.filter(item => completedLessons.includes(item.id)).length;
  const totalInActiveGroup = filteredLessons.length;
  const progressPercent = totalInActiveGroup > 0 ? Math.round((completedInActiveGroup / totalInActiveGroup) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !bodyText) return;

    setIsSubmitting(true);
    // Convert regular watch urls into embeddable ones if applicable
    let embedUrl = videoUrl;
    if (videoUrl.includes("youtube.com/watch?v=")) {
      embedUrl = videoUrl.replace("youtube.com/watch?v=", "youtube.com/embed/");
    } else if (videoUrl.includes("youtu.be/")) {
      embedUrl = videoUrl.replace("youtu.be/", "youtube.com/embed/");
    }

    const success = await onAddEducation({
      title,
      age_group: ageGroup,
      body_text: bodyText,
      video_url: embedUrl,
      duration: videoDuration || "5:00",
      icon_name: iconName
    });

    setIsSubmitting(false);
    if (success) {
      setTitle("");
      setBodyText("");
      setVideoUrl("");
      setVideoDuration("");
      setShowAddModal(false);
    }
  };

  // Simulated Quiz for the active lesson session to test safety comprehension
  const handleCheckQuizAnswers = (lesson: EducationContent) => {
    const currentAns = sessionQuizAnswers[lesson.id];
    if (!currentAns) {
      setSessionQuizFeedback("Please select a safety option to confirm self defense awareness.");
      return;
    }

    if (currentAns === "yes_report" || currentAns === "yes_run" || currentAns === "safety_first") {
      setSessionQuizFeedback("Correct! You parsed the safety rule guidelines perfectly. Great job!");
      saveProgress(lesson.id);
      setSessionSuccess(true);
    } else {
      setSessionQuizFeedback("That's incomplete. Always prioritize rushing to safe environments, shouting, or alerting certified guards/parents immediately! Let's think and retry.");
    }
  };

  // -------------------------------------------------------------
  // 🚀 IMMERSIVE CLASSROOM SESSION: RENDERED AS NEW FULL PAGE VIEW
  // -------------------------------------------------------------
  if (selectedVideo) {
    const isCompleted = completedLessons.includes(selectedVideo.id);
    return (
      <div 
        className="w-full min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat transition-all animate-fade-in"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(20, 15, 45, 0.92) 0%, rgba(10, 11, 28, 0.97) 100%), url('/src/assets/images/education_classroom_bg_1780636918716.png')`,
          backgroundAttachment: 'scroll'
        }}
        id="immersive-classroom-page"
      >
        <div className="max-w-7xl mx-auto">
        {/* Navigation Breadcrumb back link */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => {
              setSelectedVideo(null);
              setSessionQuizFeedback(null);
              setSessionSuccess(false);
            }}
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-2 hover:text-white transition-all transition-colors"
          >
            ← Exit Classroom & Back to Course Hub
          </button>
          
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-450 uppercase">CURRENT SESSION:</span>
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded text-[10px] font-bold">
              {selectedVideo.age_group}
            </span>
          </div>
        </div>

        {/* Big session banner */}
        <div className="bg-gradient-to-r from-blue-950 to-indigo-950 border border-[#1e3a8a] rounded-2xl p-6 sm:p-8 mb-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider mb-1.5">
              <span className="w-2.5 h-2.5 bg-[#10b981] animate-ping rounded-full block"></span>
              Live Learning Studio Module
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-xl">
              {selectedVideo.title}
            </h1>
            <p className="text-slate-300 text-xs mt-1 max-w-xl">
              Pay close attention to safety tips, and complete our self protection interactive quiz below to record achievements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isCompleted ? (
              <span className="px-3.5 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-lg flex items-center gap-2 font-mono">
                <CheckCircle2 className="h-4.5 w-4.5 stroke-[2.5]" /> Completed & Saved
              </span>
            ) : (
              <span className="px-3.5 py-2 bg-[#0f1f3d] border border-slate-800 text-slate-400 text-xs font-bold rounded-lg flex items-center gap-2 font-mono">
                <Clock className="h-4.5 w-4.5" /> Learning In Progress...
              </span>
            )}
          </div>
        </div>

        {/* Master Video and Quiz Panel split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Iframe Video workspace on left */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="aspect-video w-full rounded-2xl overflow-hidden border border-[#1e3a8a] bg-black shadow-2xl relative">
              <iframe
                className="w-full h-full"
                src={selectedVideo.video_url}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>

            <div className="bg-[#0f1f3d] border border-slate-850 p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Lesson Instructions & Safe Actions:
                </h3>
                <span className="text-[10px] bg-slate-900 border border-slate-850 text-slate-400 font-mono px-2 py-0.5 rounded">
                  Duration: {selectedVideo.video_duration || "5:00 min"}
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-light">
                {selectedVideo.body_text}
              </p>

              <div className="p-4 bg-blue-900/10 border-l-4 border-[#1a56db] rounded-r-xl text-xs space-y-2 text-slate-300">
                <strong className="text-white block font-sans uppercase">Emora Safety Advocate Principles:</strong>
                <div>1. Shouting "DANGER / FIRE" works faster to get crowd actions than crying quietly.</div>
                <div>2. Never share your routes, private family timetables, or school keys with strangers.</div>
                <div>3. Alert older guardians or dial Emora SOS signals if followed.</div>
              </div>
            </div>
          </div>

          {/* Interactive Classroom Quiz on right */}
          <div className="lg:col-span-4 space-y-6">
            {/* Companion Dialogue Walk-through */}
            <div className="bg-[#0f1f3d] border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#10b981] uppercase block">
                  Interactive Cohort Commentary
                </span>
              </div>
              
              <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
                <div className="flex gap-2.5 items-start">
                  <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500 shrink-0 flex items-center justify-center text-sm">
                    👩‍🏫
                  </div>
                  <div className="bg-slate-900 rounded-xl p-2.5 border border-slate-800 text-xs text-slate-300 leading-normal">
                    <strong className="text-emerald-400 font-mono block mb-0.5 text-[10px]">Madame Bernadette (Teacher):</strong>
                    {selectedVideo.id === 'e1' && "The Safe Circle game is essential, class. A safe circle shouldn't be a secret from your parents. Have you written down your 5 safe people?"}
                    {selectedVideo.id === 'e2' && "Indeed. Remember: your body is a sacred temple that belongs to you alone. No adult should ever ask you to keep a boundary secret."}
                    {selectedVideo.id === 'e7' && "Under no circumstances should you accept gifts or sweets from strangers. Run immediately toward crowds."}
                    {selectedVideo.id === 'e8' && "Secrets that make you feel sad or uncomfortable must be shared with your trusted safe circle immediately."}
                    {selectedVideo.id === 'e3' && "Online profiles can be masked easily. Sali, tell us your rule for internet social platforms."}
                    {selectedVideo.id === 'e4' && "Speaking up is your greatest super power! Never feel guilty for reporting weird suggestions."}
                    {selectedVideo.id === 'e9' && "A buddy system ensures you are never isolated walking through Yaoundé or Douala streets."}
                    {selectedVideo.id === 'e10' && "Always keep emergency phone numbers memorized. In emergencies, stress overrides our memories, so practice regularly!"}
                    {selectedVideo.id === 'e5' && "A digital footprint stays online forever. If you send sensitive photos, they can be weaponized against your reputation."}
                    {selectedVideo.id === 'e6' && "Online grooming often starts with compliments, then small mobile money transactions, then demanding offline isolated meetings. Stay cautious!"}
                    {selectedVideo.id === 'e11' && "Screenshot cyberbullying and harassment instantly. Keep evidence intact, report it to school guardians, and block the harassers immediately."}
                    {selectedVideo.id === 'e12' && "Be careful of high school travel scholarships or remote modeling contracts advertised on random social handles. If they tell you to keep your travel secret or separate from parents, it is a human trafficking trap."}
                    {selectedVideo.id === 'e13' && "Your consent is critical. Shouting 'NO!' is a powerful tool to protect yourself and signal alert to the neighborhood."}
                    {selectedVideo.id === 'e14' && "If you get lost in open Douala markets, find a uniformed guard or shop official with an active company tag. Never follow someone who claims to know where we live."}
                    {!['e1','e2','e7','e8','e3','e4','e9','e10','e5','e6','e11','e12','e13','e14'].includes(selectedVideo.id) && "Through this lesson, we study how to hold boundaries and protect other students in Cameroon."}
                  </div>
                </div>

                <div className="flex gap-2.5 items-start">
                  <div className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-500 shrink-0 flex items-center justify-center text-sm">
                    🎒
                  </div>
                  <div className="bg-slate-900 rounded-xl p-2.5 border border-slate-800 text-xs text-slate-300 leading-normal">
                    <strong className="text-indigo-300 font-mono block mb-0.5 text-[10px]">Sali (Walk-Through Guide):</strong>
                    {selectedVideo.id === 'e1' && "I have Madame! My mom, my school health teacher Bernadette, my grandma, my uncle Jean, and our local block elder. It feels safe knowing they will believe me."}
                    {selectedVideo.id === 'e2' && "Exactly, Madame. I practice saying, 'No, this is my body!' whenever I feel uncomfortable. No secrets allowed!"}
                    {selectedVideo.id === 'e7' && "Even if they claim my mom sent them to carry me! Sali says: I will run to Madame Bernadette or the closest school guard."}
                    {selectedVideo.id === 'e8' && "If some secret makes my tummy feel tight or fuzzy, that is a bad secret. Sali will scream and tell Grandma."}
                    {selectedVideo.id === 'e3' && "For standard safety, Sali never posts my school badge, my real name, or where we live. If some user is persistent, I block them!"}
                    {selectedVideo.id === 'e4' && "My classmate thought she had to keep a secret, but I walked with her to Madame Beatrice's office to speak up."}
                    {selectedVideo.id === 'e9' && "Yes! Traveling to school with my three friends is fun and safe. We never take isolated alleys or dark bush cuts."}
                    {selectedVideo.id === 'e10' && "I wrote them down inside my notebook too. If my battery dies, I can ask safe helpers to call Grandma using their keypad."}
                    {selectedVideo.id === 'e5' && "This is so true! Some girls have been blackmailed. Students, let's keep our digital lives clear."}
                    {selectedVideo.id === 'e6' && "They try to buy your trust with empty gifts or mobile bundles. Sali never accepts funds from unverified online contacts!"}
                    {selectedVideo.id === 'e11' && "Yes! Do not reply to their insults. Reply with silence, snap the screen, and report them to the moderator!"}
                    {selectedVideo.id === 'e12' && "Grandma says: if an offer sounds too good to be true, it's definitely a trap. Sali will double check any internship coordinates before traveling."}
                    {selectedVideo.id === 'e13' && "Absolutely! Let's practice shouting NO in our class together. It gives us safe power."}
                    {selectedVideo.id === 'e14' && "I will stay in one spot right next to the bank's uniformed guard. Grandma taught me that the guard has a direct line to families."}
                    {!['e1','e2','e7','e8','e3','e4','e9','e10','e5','e6','e11','e12','e13','e14'].includes(selectedVideo.id) && "I learned that staying vigilant and keeping coordinates clear keeps us safe!"}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0f1f3d] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#10b981] uppercase block mb-1">
                Classroom Activities
              </span>
              <h3 className="text-base font-extrabold text-white">
                Interactive Quiz Check-In
              </h3>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Select the correct defensive action based on this video lesson:
              </p>

              <div className="space-y-2">
                <div 
                  onClick={() => {
                    setSessionQuizAnswers(prev => ({ ...prev, [selectedVideo.id]: "no_answer" }));
                    setSessionQuizFeedback(null);
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                    sessionQuizAnswers[selectedVideo.id] === "no_answer"
                      ? "bg-slate-900 border-red-500/50 text-slate-300"
                      : "bg-[#0a1628] border-slate-800 hover:border-slate-700 text-slate-400"
                  }`}
                >
                  <span className="font-bold block text-white mb-0.5">Option A</span>
                  Stay silent and follow the stranger inside their vehicle.
                </div>

                <div 
                  onClick={() => {
                    setSessionQuizAnswers(prev => ({ ...prev, [selectedVideo.id]: "yes_run" }));
                    setSessionQuizFeedback(null);
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                    sessionQuizAnswers[selectedVideo.id] === "yes_run"
                      ? "bg-emerald-950/20 border-emerald-500 text-emerald-300"
                      : "bg-[#0a1628] border-slate-800 hover:border-slate-700 text-slate-400"
                  }`}
                >
                  <span className="font-bold block text-[#10b981] mb-0.5">Option B</span>
                  Refuse instantly, scream loud to recruit nearby crowds, and run to public structures.
                </div>

                <div 
                  onClick={() => {
                    setSessionQuizAnswers(prev => ({ ...prev, [selectedVideo.id]: "not_sure" }));
                    setSessionQuizFeedback(null);
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                    sessionQuizAnswers[selectedVideo.id] === "not_sure"
                      ? "bg-slate-900 border-yellow-500/40 text-slate-300"
                      : "bg-[#0a1628] border-slate-800 hover:border-slate-700 text-slate-400"
                  }`}
                >
                  <span className="font-bold block text-yellow-400 mb-0.5">Option C</span>
                  Wait and try talking to convince them they are incorrect.
                </div>
              </div>

              <button
                onClick={() => handleCheckQuizAnswers(selectedVideo)}
                className="w-full py-2.5 bg-[#1a56db] hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow transition-colors"
              >
                Validate Safety Answer
              </button>

              {sessionQuizFeedback && (
                <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                  sessionSuccess 
                    ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300" 
                    : "bg-red-950/30 border-red-500/25 text-red-300"
                }`}>
                  {sessionQuizFeedback}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Manual Progress Management
              </h4>
              
              {isCompleted ? (
                <button
                  onClick={() => removeProgress(selectedVideo.id)}
                  className="w-full py-2 bg-slate-900 border border-red-500/30 hover:bg-red-950/30 text-red-400 rounded-lg text-xs font-semibold"
                >
                  Mark Lesson as Incomplete
                </button>
              ) : (
                <button
                  onClick={() => {
                    saveProgress(selectedVideo.id);
                    setSessionSuccess(true);
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark Lesson Complete & Earn Badge
                </button>
              )}

              <button
                onClick={() => {
                  setSelectedVideo(null);
                  setSessionQuizFeedback(null);
                  setSessionSuccess(false);
                }}
                className="w-full py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-medium"
              >
                Exit Live Classroom
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
    );
  }

  // -------------------------------------------------------------
  // 📚 STANDARD CLASSROOM DASHBOARD HUB VIEW
  // -------------------------------------------------------------
  return (
    <div 
      className="w-full min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat transition-all animate-fade-in"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(31, 16, 50, 0.90) 0%, rgba(13, 14, 38, 0.96) 100%), url('/src/assets/images/education_classroom_bg_1780636918716.png')`,
        backgroundAttachment: 'scroll'
      }}
      id="education-section-container"
    >
      <div className="max-w-7xl mx-auto">
      {/* Upper header block */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <span className="px-3.5 py-1 bg-[#1a56db]/20 text-[#10b981] rounded-full text-xs font-semibold tracking-wider uppercase inline-block mb-3 border border-[#1a56db]/30">
          STUDENT SAFETY ACADEMY
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4">
          Interactive Course Walk-Through
        </h1>
        <p className="text-[#cbd5e1] text-xs sm:text-sm leading-relaxed">
          Step-by-step protective rules and interactive lessons designed directly like a school classroom under teacher supervision. Select our customized Courses 1, 2, or 3 below to begin Sali's guided peer walkthrough!
        </p>

        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 inline-flex items-center px-4 py-2 bg-[#1a56db] hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow transition-all hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Safety Lesson / Video
          </button>
        )}
      </div>

      {/* Classroom Walk-Through Narrator Header Column */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-[#0a1628]/95 border border-indigo-500/25 p-5 rounded-2xl mb-8 flex flex-col md:flex-row items-center gap-5 shadow-lg max-w-5xl mx-auto">
        <div className="flex -space-x-3 shrink-0">
          <div className="w-12 h-12 rounded-full border-2 border-emerald-500 bg-emerald-950 text-white flex items-center justify-center font-bold text-xl relative shadow-md" title="Madame Bernadette (Primary Teacher)">
            👩‍🏫
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-950 rounded-full"></span>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500 bg-indigo-950 text-white flex items-center justify-center font-bold text-xl relative shadow-md" title="Sali (14, Student Guide)">
            🎒
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-indigo-400 border-2 border-slate-950 rounded-full"></span>
          </div>
        </div>
        
        <div className="space-y-1 text-center md:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 font-mono text-[9px] font-bold rounded uppercase border border-emerald-500/15">
              Primary Teacher: Madame Bernadette
            </span>
            <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 font-mono text-[9px] font-bold rounded uppercase border border-indigo-500/15">
              Female student leader: Sali
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans mt-1 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/45">
            {activeGroup === 'Little Learners (4-7)' && (
              <span><strong>Madame Bernadette:</strong> "Welcome to <strong>Course 1</strong>, girls! Sali and I will show our youngest children how to set up boundaries and safe circles." <br /><span className="block mt-1"><strong>Sali:</strong> "That's right! Tap Unit 1 to Unit 4 below to watch the tutorials and pass the quiz cards!"</span></span>
            )}
            {activeGroup === 'Growing Up (8-12)' && (
              <span><strong>Madame Bernadette:</strong> "Welcome to <strong>Course 2</strong>. These units prepare you for walking safely and browsing online internet spaces." <br /><span className="block mt-1"><strong>Sali:</strong> "This is where we become 'Smart Detectives'! Learn how to stay vigilant on commute shortcuts and gaming platforms."</span></span>
            )}
            {activeGroup === 'Teens (13-17)' && (
              <span><strong>Madame Bernadette:</strong> "Welcome to <strong>Course 3</strong>, young women. We address cyber-bullying protection, travel risk warnings, and scholarship traps." <br /><span className="block mt-1"><strong>Sali:</strong> "This is extremely important for us high schoolers. Let's complete the course syllabus together!"</span></span>
            )}
          </p>
        </div>
      </div>

      {/* Progress tracking dashboard dashboard panel */}
      <div className="max-w-xl mx-auto mb-10 bg-[#0f1f3d] p-5 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex justify-between items-center mb-1.5">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-400" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">
              {activeGroup === 'Little Learners (4-7)' ? "Course 1 Completion" : 
               activeGroup === 'Growing Up (8-12)' ? "Course 2 Completion" : 
               "Course 3 Completion"}
            </h3>
          </div>
          <span className="text-xs font-bold text-emerald-400 font-mono">
            {completedInActiveGroup} / {totalInActiveGroup} Units Mastered
          </span>
        </div>
        
        {/* Progress Bar overlay */}
        <div className="w-full bg-slate-950 rounded-full h-2 mb-2 overflow-hidden border border-slate-800">
          <div 
            className="bg-emerald-500 h-full transition-all duration-350" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <p className="text-[10px] text-slate-400 text-center leading-none">
          {progressPercent === 100 
            ? "👑 Success! Sali certifies your mastery over this entire course category!" 
            : `Complete all interactive quiz checks below to unlock this certificate. (${progressPercent}% achieved)`}
        </p>
      </div>

      {/* Mode Switches */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mb-10 max-w-xl mx-auto" id="age-group-tabs">
        {(['Little Learners (4-7)', 'Growing Up (8-12)', 'Teens (13-17)'] as const).map(group => (
          <button
            key={group}
            onClick={() => {
              setActiveGroup(group);
              setSelectedVideo(null);
            }}
            className={`w-full py-3 px-3 rounded-lg text-xs sm:text-sm font-semibold border transition-all duration-150 flex flex-col items-center justify-center ${
              activeGroup === group
                ? "bg-[#1a56db] border-[#1a56db] text-white shadow-md shadow-[#1a56db]/20"
                : "bg-[#0f1f3d] border-slate-700 text-slate-300 hover:border-slate-500"
            }`}
          >
            <span className="text-[10px] uppercase opacity-75 font-mono mb-0.5">
              {group === 'Little Learners (4-7)' ? "Course 1" : 
               group === 'Growing Up (8-12)' ? "Course 2" : 
               "Course 3"}
            </span>
            <span className="font-extrabold flex items-center">
              <GraduationCap className="h-3.5 w-3.5 mr-1" />
              {group === 'Little Learners (4-7)' ? "Early Safety" : 
               group === 'Growing Up (8-12)' ? "Smart Detectives" : 
               "Digital Literacy"}
            </span>
          </button>
        ))}
      </div>

      {/* Grid of lessons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="education-lessons-grid">
        {filteredLessons.map(lesson => {
          const isDone = completedLessons.includes(lesson.id);
          return (
            <div
              key={lesson.id}
              className="bg-[#0f1f3d] rounded-2xl border border-slate-800 hover:border-[#1a56db]/50 flex flex-col justify-between overflow-hidden hover:shadow-xl transition-all duration-200 group relative"
              id={`lesson-card-${lesson.id}`}
            >
              <div>
                {/* Visual Thumbnail */}
                <div className="relative aspect-video w-full bg-slate-950 overflow-hidden border-b border-slate-800">
                  <img
                    src={lesson.video_thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60'}
                    alt={lesson.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Category Pill Tag */}
                  <div className="absolute top-3 left-3 flex gap-1 items-center">
                    <span className="px-2 py-0.5 bg-[#0a1628]/85 backdrop-blur border border-slate-705 rounded-md text-[10px] font-mono tracking-wider font-semibold text-[#10b981] uppercase block">
                      {activeGroup === 'Little Learners (4-7)' ? "Course 1 · Unit " + lesson.order_index : 
                       activeGroup === 'Growing Up (8-12)' ? "Course 2 · Unit " + lesson.order_index : 
                       "Course 3 · Unit " + lesson.order_index}
                    </span>
                    
                    {isDone && (
                      <span className="px-2 py-0.5 bg-emerald-600 border border-emerald-400 text-slate-950 text-[10px] font-bold rounded-md uppercase tracking-wider block">
                        PASSED ✓
                      </span>
                    )}
                  </div>

                  {lesson.video_duration && (
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-slate-950/80 rounded font-mono text-[10px] text-white flex items-center border border-slate-800">
                      <Clock className="w-3 h-3 mr-1 text-[#10b981]" />
                      {lesson.video_duration}
                    </div>
                  )}

                  {/* Play Overlay Overlay */}
                  <div 
                    onClick={() => {
                      if (lesson.video_url) {
                        setSelectedVideo(lesson);
                      }
                    }}
                    className="absolute inset-0 bg-transparent hover:bg-slate-950/40 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <div className="p-3 bg-[#1a56db] hover:bg-blue-600 hover:scale-110 rounded-full text-white shadow-lg animate-pulse transition-transform shadow-blue-500/30">
                      <Video className="w-5 h-5 fill-white" />
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="p-1 px-[7px] bg-slate-850 border border-slate-800 text-slate-300 text-[10px] font-mono rounded font-semibold uppercase">
                      ID: {lesson.id}
                    </span>
                    
                    {isDone ? (
                      <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Quiz Cleared
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">Quiz Open</span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug group-hover:text-[#10b981] transition-colors font-sans font-medium">
                    Unit {lesson.order_index || 1}: {lesson.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                    {lesson.body_text}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-0">
                <button
                  onClick={() => {
                    if (lesson.video_url) {
                      setSelectedVideo(lesson);
                    }
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-[#1a56db] hover:text-white text-[#cbd5e1] rounded-lg text-xs font-semibold flex items-center justify-center border border-slate-755 transition-colors gap-1.5"
                >
                  <Video className="w-3.5 h-3.5 text-[#10b981]" />
                  Join Unit Classroom Walk-Through
                </button>
              </div>
            </div>
          );
        })}

        {filteredLessons.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 bg-[#0f1f3d] rounded-xl border border-dashed border-slate-800" id="education-empty-lessons">
            <BookOpen className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold">No educational lessons available for {activeGroup}.</p>
          </div>
        )}
      </div>

      {/* Admin Panel Modal to Inject Custom Lessons */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f1f3d] border border-[#1e3a8a] rounded-xl overflow-hidden shadow-2xl max-w-md w-full p-6 animate-scale-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Create Educational Video Lesson</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Target Age Group</label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value as any)}
                  className="w-full bg-[#0a1628] border border-slate-700 text-white rounded p-1.5 text-sm"
                >
                  <option value="Little Learners (4-7)">Little Learners (4-7)</option>
                  <option value="Growing Up (8-12)">Growing Up (8-12)</option>
                  <option value="Teens (13-17)">Teens (13-17)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Lesson Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Safe Stranger Rules"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0a1628] border border-slate-700 text-white rounded p-1.5 text-sm focus:border-[#1a56db]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Lesson Text / Instructions</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Explain safety strategies or rules clearly..."
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  className="w-full bg-[#0a1628] border border-slate-700 text-white rounded p-1.5 text-sm focus:border-[#1a56db]"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">YouTube Video Link</label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full bg-[#0a1628] border border-slate-700 text-white rounded p-1.5 text-sm focus:border-[#1a56db]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Video Duration (e.g., 4:32)</label>
                  <input
                    type="text"
                    placeholder="Duration"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(e.target.value)}
                    className="w-full bg-[#0a1628] border border-slate-700 text-white rounded p-1.5 text-sm focus:border-[#1a56db]"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-850 hover:bg-slate-750 text-[#cbd5e1] text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#1a56db] hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Save Lesson"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

// Light inline svg close icon to prevent imports error
function X(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
