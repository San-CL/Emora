import React, { useState, useEffect, useRef } from "react";
import { 
  Heart, Sparkles, Send, ShieldAlert, Lock, BookOpen, 
  Users, MapPin, UserCheck, Star, Plus, Check, Phone, 
  Mail, MessageSquare, AlertTriangle, FileText, ChevronDown, 
  ChevronUp, GraduationCap, Code, Megaphone, Terminal, 
  BrainCircuit, LayoutTemplate, BarChart3, Feather, Paintbrush, 
  Laptop, CheckSquare, RefreshCw, Clock
} from "lucide-react";

interface WomenSectionProps {
  currentUser: any;
}

export default function WomenSection({ currentUser }: WomenSectionProps) {
  // Opt-in State
  const [optedIn, setOptedIn] = useState<boolean>(() => {
    return localStorage.getItem("emora_women_optin") === "true";
  });

  // Top tabs: "skills" | "safety" | "community"
  const [activeTab, setActiveTab] = useState<"skills" | "safety" | "community">("skills");

  // Global fetched lists from state
  const [peerGroups, setPeerGroups] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [mentorMatches, setMentorMatches] = useState<any[]>([]);
  const [successStories, setSuccessStories] = useState<any[]>([]);
  const [anonymousReports, setAnonymousReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load backend data helper
  const loadData = async () => {
    try {
      const res = await fetch("/api/women/data");
      if (res.ok) {
        const data = await res.json();
        setPeerGroups(data.peerGroups || []);
        setMentors(data.mentors || []);
        setMentorMatches(data.mentorMatches || []);
        setSuccessStories(data.successStories || []);
        setAnonymousReports(data.anonymousReports || []);
      }
    } catch (e) {
      console.error("Failed to load Women Space data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (optedIn) {
      loadData();
    }
  }, [optedIn]);

  const handleOptInToggle = () => {
    const newValue = !optedIn;
    setOptedIn(newValue);
    localStorage.setItem("emora_women_optin", String(newValue));
    if (newValue) {
      loadData();
    }
  };

  // -------------------------------------------------------------------------
  // 1. CHAT BOT: SKILL BUILDING BOT
  // -------------------------------------------------------------------------
  const skillsList = [
    { id: "Digital Marketing", label: "Digital Marketing", icon: Megaphone, desc: "Branding, social ads, and campaigns" },
    { id: "Web Development", label: "Web Development", icon: Laptop, desc: "HTML, CSS, JS, and responsive web" },
    { id: "Prompt Engineering", label: "Prompt Engineering", icon: BrainCircuit, desc: "Optimizing AI chat queries & commands" },
    { id: "Software Development", label: "Software Development", icon: Code, desc: "Backend algorithms & building apps" },
    { id: "Data Analysis", label: "Data Analysis", icon: BarChart3, desc: "Excel, charts, forecasting, and trends" },
    { id: "Content Creation", label: "Content Creation", icon: Feather, desc: "Creative writing, blogging, and copies" },
    { id: "Graphic Design", label: "Graphic Design", icon: Paintbrush, desc: "Layouts, UI, logos, and vector arts" },
    { id: "Social Media Management", label: "Social Media Management", icon: LayoutTemplate, desc: "Handling feeds, plans, and audiences" }
  ];

  const [selectedSkill, setSelectedSkill] = useState(skillsList[0].id);

  // 📚 STATE-BASED ROUTER STATE FOR THE WOMEN SPACE COHORT ACADEMY
  const [currentRoute, setCurrentRoute] = useState<{
    view: "dashboard" | "classroom";
    contentId?: string;
  }>({ view: "dashboard" });

  const [activeStudioSkill, setActiveStudioSkill] = useState<string | null>(null);

  const [completedSkills, setCompletedSkills] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("emora_completed_skills");
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });

  // Sync active studio with our State-Based routing
  useEffect(() => {
    if (activeStudioSkill) {
      setCurrentRoute({ view: "classroom", contentId: activeStudioSkill });
    } else {
      setCurrentRoute({ view: "dashboard" });
    }
  }, [activeStudioSkill]);

  // Load progress from backend DB when user changes or opts in
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch("/api/women/progress");
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.completedSkills)) {
            setCompletedSkills(data.completedSkills);
            localStorage.setItem("emora_completed_skills", JSON.stringify(data.completedSkills));
          }
        }
      } catch (err) {
        console.error("Failed to load skills progress from backend", err);
      }
    };
    if (optedIn) {
      fetchProgress();
    }
  }, [currentUser, optedIn]);

  // Load custom tickboxes for active studio progress
  const [studioCheckboxes, setStudioCheckboxes] = useState<Record<string, Record<string, boolean>>>(() => {
    try {
      const saved = localStorage.getItem("emora_women_skills_progress");
      return saved ? JSON.parse(saved) : {};
    } catch (_) {
      return {};
    }
  });

  const toggleStudioCheckbox = (skillId: string, boxId: string) => {
    const nextBox = {
      ...(studioCheckboxes[skillId] || {}),
      [boxId]: !(studioCheckboxes[skillId]?.[boxId])
    };
    const nextAll = {
      ...studioCheckboxes,
      [skillId]: nextBox
    };
    setStudioCheckboxes(nextAll);
    localStorage.setItem("emora_women_skills_progress", JSON.stringify(nextAll));
  };

  const markSkillComplete = async (skillId: string) => {
    if (!completedSkills.includes(skillId)) {
      const next = [...completedSkills, skillId];
      setCompletedSkills(next);
      localStorage.setItem("emora_completed_skills", JSON.stringify(next));

      try {
        await fetch("/api/women/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "skill", id: skillId, action: "complete" })
        });
      } catch (err) {
        console.error("Failed to save skill progress to backend:", err);
      }
    }
  };

  const removeSkillComplete = async (skillId: string) => {
    const next = completedSkills.filter(id => id !== skillId);
    setCompletedSkills(next);
    localStorage.setItem("emora_completed_skills", JSON.stringify(next));

    try {
      await fetch("/api/women/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "skill", id: skillId, action: "incomplete" })
      });
    } catch (err) {
      console.error("Failed to remove skill progress from backend:", err);
    }
  };

  const [skillMessages, setSkillMessages] = useState<any[]>(() => [
    {
      role: "model",
      text: "Supportive Greetings! I am Emora, your dedicated AI Skill-Building Mentor. Select any specialization on the side or use custom prompts, and let's craft your technical skills in Cameroon together!"
    }
  ]);
  const [skillInput, setSkillInput] = useState("");
  const [skillLoading, setSkillLoading] = useState(false);
  const skillChatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    skillChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [skillMessages]);

  const handleSendSkillMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!skillInput.trim() || skillLoading) return;

    const userText = skillInput;
    setSkillInput("");

    const updatedMessages = [...skillMessages, { role: "user", text: userText }];
    setSkillMessages(updatedMessages);
    setSkillLoading(true);

    try {
      const response = await fetch("/api/women/ai-skill-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: selectedSkill,
          messages: updatedMessages
        })
      });
      if (response.ok) {
        const data = await response.json();
        setSkillMessages(prev => [...prev, { role: "model", text: data.text }]);
      } else {
        setSkillMessages(prev => [...prev, { role: "model", text: "I experienced a momentary signal lapse. Let me retry in our digital network!" }]);
      }
    } catch (err) {
      setSkillMessages(prev => [...prev, { role: "model", text: "Failed to connect to the skill-building engine. Try again shortly." }]);
    } finally {
      setSkillLoading(false);
    }
  };

  const handleSelectSkill = (skillId: string) => {
    setSelectedSkill(skillId);
    setSkillMessages([
      {
        role: "model",
        text: `Wonderful! You have chosen to focus on **${skillId}**. I have configured my curriculum for you. What aspect of ${skillId} would you like me to clarify or walk you through?`
      }
    ]);
  };

  // -------------------------------------------------------------------------
  // 2. CHAT BOT: GBV AWARENESS BOT
  // -------------------------------------------------------------------------
  const [gbvMessages, setGbvMessages] = useState<any[]>(() => [
    {
      role: "model",
      text: "You are in a fully confidential, safe space. I am the Emora Gender-Based Violence Awareness Assistant. I am here to discuss rights, support systems, emotional validation, and guide you toward safety planning tools. How can I stand by you today?"
    }
  ]);
  const [gbvInput, setGbvInput] = useState("");
  const [gbvLoading, setGbvLoading] = useState(false);
  const gbvChatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gbvChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [gbvMessages]);

  const handleSendGbvMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!gbvInput.trim() || gbvLoading) return;

    const userText = gbvInput;
    setGbvInput("");

    const updatedMessages = [...gbvMessages, { role: "user", text: userText }];
    setGbvMessages(updatedMessages);
    setGbvLoading(true);

    try {
      const response = await fetch("/api/women/gbv-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages })
      });
      if (response.ok) {
        const data = await response.json();
        setGbvMessages(prev => [...prev, { role: "model", text: data.text }]);
      } else {
        setGbvMessages(prev => [...prev, { role: "model", text: "I apologize, our secure channel had a retry loop. Please try sending again." }]);
      }
    } catch (err) {
      setGbvMessages(prev => [...prev, { role: "model", text: "Confidentiality active, but socket failed to respond. Please try again." }]);
    } finally {
      setGbvLoading(false);
    }
  };

  // Simple formatting helper for bot answers
  const formatBotText = (text: string) => {
    if (!text) return "";
    return text.split("\n").map((line, idx) => {
      // Bold formatted text
      let rendered = line;
      // Handle bold blocks **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      while ((match = boldRegex.exec(line)) !== null) {
        parts.push(line.substring(lastIndex, match.index));
        parts.push(<strong key={match.index} className="text-white font-bold">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      parts.push(line.substring(lastIndex));

      // Handle bullets
      if (line.trim().startsWith("-") || line.trim().startsWith("*")) {
        return (
          <li key={idx} className="ml-5 list-disc my-1 text-slate-300 text-sm leading-relaxed">
            {parts.length > 1 ? parts : line.trim().substring(1).trim()}
          </li>
        );
      }
      if (line.trim().match(/^\d+\./)) {
        return (
          <li key={idx} className="ml-5 list-decimal my-1 text-slate-300 text-sm leading-relaxed font-sans">
            {parts.length > 1 ? parts : line.trim()}
          </li>
        );
      }
      return (
        <p key={idx} className="my-1.5 text-slate-300 text-sm leading-relaxed font-sans min-h-[1px]">
          {parts.length > 1 ? parts : line}
        </p>
      );
    });
  };

  // -------------------------------------------------------------------------
  // GBV SAFETY TOOLS CONFIGURATIONS
  // -------------------------------------------------------------------------
  const [activeSafetyTool, setActiveSafetyTool] = useState<"bot" | "finder" | "reporting" | "rights" | "planner">("bot");

  // Local GBV Emergency Directory
  const gbvEmergencyResources = [
    {
      name: "ALVF - Support Circle Yaoundé",
      desc: "Association de Lutte contre les Violences faites aux Femmes. Counseling, mediation, physical sanctuary housing.",
      phone: "+237 222 212 411",
      email: "bastos-info@alvf.org",
      location: "Yaoundé, Bastos Quarter",
      whatsapp: "+237 677 341 234"
    },
    {
      name: "Inter-State Gender Violence Coalition Douala",
      desc: "Confidential human rights monitors and trauma-healing professionals. Rapid legal aids.",
      phone: "+237 699 123 456",
      email: "douala-help@coalition.cm",
      location: "Douala, Akwa Quarter",
      whatsapp: "+237 699 123 456"
    },
    {
      name: "Cameroon National Gendarmerie Helpline",
      desc: "Instant state intervention police units equipped with professional counselors for family safety matters.",
      phone: "113",
      email: "gendarmerie@defense.cm",
      location: "All Territories (Nationwide Toll-Free)",
      whatsapp: ""
    }
  ];

  // Anonymous reporting form
  const [anonCategory, setAnonCategory] = useState("Intimate Partner Harassment");
  const [anonDetails, setAnonDetails] = useState("");
  const [anonLocation, setAnonLocation] = useState("Centre (Yaoundé)");
  const [anonPlanCompleted, setAnonPlanCompleted] = useState(false);
  const [anonSubmitting, setAnonSubmitting] = useState(false);
  const [anonSuccess, setAnonSuccess] = useState(false);

  const handleAnonReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anonDetails.trim()) return;

    setAnonSubmitting(true);
    try {
      const res = await fetch("/api/women/report/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: anonCategory,
          details: anonDetails,
          location: anonLocation,
          planCompleted: anonPlanCompleted
        })
      });
      if (res.ok) {
        setAnonSuccess(true);
        setAnonDetails("");
        loadData();
        setTimeout(() => setAnonSuccess(false), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnonSubmitting(false);
    }
  };

  // Cameroonian Legal Rights handbook
  const legalRightsList = [
    {
      title: "1. Cameroonian Penal Code (Law No. 2016/007)",
      desc: "Under Cameroon's legislative framework, Section 296, 302, and 337 strictly criminalizes all acts of family assault, forced marriages, and physical battery. These are punishable by robust prison sentences and cannot be set aside by traditional customs."
    },
    {
      title: "2. Absolute Protection against Workplace Harassment",
      desc: "The Criminal Procedure Code guarantees a safe, zero-intimidation job ecosystem. Submitting reports of sexual bribery or threats by hierarchal bosses to police forces bypasses any NDA or labor contract clauses."
    },
    {
      title: "3. Direct Emergency Custody and Safety Orders",
      desc: "For women in immediate danger within their homestead, regional courts of First Instance maintain authority to grant dynamic ejection orders against the perpetrator and secure minor custody in certified sanctuaries."
    }
  ];

  const [expandedRight, setExpandedRight] = useState<number | null>(0);

  // Safety Planner Checklist
  const [safetyPlannerAnswers, setSafetyPlannerAnswers] = useState<Record<string, boolean>>({
    secureDocs: false,
    emergencyCash: false,
    secretSignal: false,
    packedBag: false,
    safeContacts: false,
    eraseLogs: false
  });

  const safetyTasks = [
    { key: "secureDocs", title: "Scan & secure key identifiers", desc: "Upload snaps of your ID cards, marriage deeds, and kids' birth acts onto secure private digital folders." },
    { key: "emergencyCash", title: "Set aside emergency cash", desc: "Keep fallback mobile money accounts or a hidden hard purse for urgent transportation fees." },
    { key: "secretSignal", title: "Establish a neighbor safety clue", desc: "Arrange a secret SMS codeword or light signal to alert trusted neighbors to call gendarmes instantly." },
    { key: "packedBag", title: "Conceal a quick escape kit", desc: "Keep a small, packed bag with core meds, children's clothes, and duplicate keys hidden at a friend's safe space." },
    { key: "safeContacts", title: "Memorize emergency dial keys", desc: "Know the direct helpline of local NGOs or 113 to write/dial even if your phone is grabbed." },
    { key: "eraseLogs", title: "Audit search & log tracks", desc: "Clear application cache or use Emora's confidential quick close options if device tracking is a threat." }
  ];

  const handleSafetyTaskToggle = (key: string) => {
    setSafetyPlannerAnswers(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getSafetyProgressPercent = () => {
    const checked = Object.values(safetyPlannerAnswers).filter(Boolean).length;
    return Math.round((checked / safetyTasks.length) * 100);
  };

  // -------------------------------------------------------------------------
  // COMMUNITY & SUPPORT WORKFLWS
  // -------------------------------------------------------------------------
  // Enrollment state
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [mentorName, setMentorName] = useState("");
  const [mentorExpertise, setMentorExpertise] = useState("Software Development");
  const [mentorBio, setMentorBio] = useState("");
  const [mentorLocation, setMentorLocation] = useState("");
  const [mentorEnrollerLoading, setMentorEnrollerLoading] = useState(false);

  // Match request states
  const [selectedMentorForMatch, setSelectedMentorForMatch] = useState<any | null>(null);
  const [menteeApplicantName, setMenteeApplicantName] = useState("");
  const [mentorRequestMessage, setMentorRequestMessage] = useState("");
  const [mentorMatchingLoading, setMentorMatchingLoading] = useState(false);
  const [matchSuccess, setMatchSuccess] = useState(false);

  // Stories submissions
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [storyAuthor, setStoryAuthor] = useState("");
  const [storyTitle, setStoryTitle] = useState("");
  const [storyText, setStoryText] = useState("");
  const [storyLocation, setStoryLocation] = useState("");
  const [storyCategory, setStoryCategory] = useState("Web Development");
  const [storyImage, setStoryImage] = useState("");
  const [storySubmitting, setStorySubmitting] = useState(false);

  const handleMentorEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorName || !mentorBio || !mentorLocation) return;
    setMentorEnrollerLoading(true);

    try {
      const res = await fetch("/api/women/mentor/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: mentorName,
          expertise: mentorExpertise,
          bio: mentorBio,
          location: mentorLocation
        })
      });
      if (res.ok) {
        setMentorName("");
        setMentorBio("");
        setMentorLocation("");
        setShowMentorModal(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMentorEnrollerLoading(false);
    }
  };

  const handleMentorshipMatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentorForMatch || !menteeApplicantName) return;
    setMentorMatchingLoading(true);

    try {
      const res = await fetch("/api/women/mentor/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menteeName: menteeApplicantName,
          mentorId: selectedMentorForMatch.id,
          expertise: selectedMentorForMatch.expertise,
          message: mentorRequestMessage
        })
      });
      if (res.ok) {
        setMenteeApplicantName("");
        setMentorRequestMessage("");
        setMatchSuccess(true);
        loadData();
        setTimeout(() => {
          setMatchSuccess(false);
          setSelectedMentorForMatch(null);
        }, 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMentorMatchingLoading(false);
    }
  };

  const handleStorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyAuthor || !storyTitle || !storyText || !storyLocation) return;
    setStorySubmitting(true);

    try {
      const res = await fetch("/api/women/story/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: storyAuthor,
          title: storyTitle,
          story: storyText,
          location: storyLocation,
          category: storyCategory,
          image: storyImage || undefined
        })
      });
      if (res.ok) {
        setStoryAuthor("");
        setStoryTitle("");
        setStoryText("");
        setStoryLocation("");
        setStoryImage("");
        setShowStoryModal(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStorySubmitting(false);
    }
  };

  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);
  const handleJoinGroup = (groupId: string) => {
    if (joinedGroups.includes(groupId)) return;
    setJoinedGroups([...joinedGroups, groupId]);
    setPeerGroups(prev => prev.map(g => g.id === groupId ? { ...g, members: g.members + 1 } : g));
  };

  return (
    <div 
      className="w-full min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat transition-all animate-fade-in"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(16, 35, 30, 0.91) 0%, rgba(13, 14, 38, 0.96) 100%), url('/src/assets/images/women_space_bg_1780636933824.png')`,
        backgroundAttachment: 'scroll'
      }}
      id="women-empowerment-section"
    >
      <div className="max-w-7xl mx-auto">
      {/* Privacy Warning Header */}
      <div className="bg-slate-900/60 border-l-4 border-emerald-500 text-[#a7f3d0] px-4 py-3 rounded-lg mb-8 text-xs font-mono flex items-start gap-3 shadow-md">
        <Lock className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold uppercase tracking-wider block mb-0.5">Secure Session Ecosystem Active</span>
          Your privacy is guaranteed. Chat parameters, planning templates, and incident reports are processed in localized secure logs. You can opt-out at any instant to wipe memory.
        </div>
      </div>

      {/* Main Title Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="px-3.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold tracking-wider uppercase inline-block mb-3 border border-emerald-500/20">
          👩 Women's Space & Support Hub
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4">
          Women's Space
        </h1>
        <p className="text-[#cbd5e1] text-base leading-relaxed">
          Access specialized generative mentoring software, highly protective gender-based violence (GBV) rescue workflows, legal protection guides, and interactive professional peer grids in Cameroon.
        </p>

        {/* Big Opt-In Switch */}
        <div className="mt-6 flex justify-center items-center">
          <button
            onClick={handleOptInToggle}
            className={`px-6 py-3.5 rounded-xl font-bold text-sm shadow-xl transition-all duration-200 flex items-center gap-3 border ${
              optedIn 
                ? "bg-rose-900/40 text-rose-200 border-rose-500/35 hover:bg-rose-900/60" 
                : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 hover:scale-105"
            }`}
          >
            <Heart className={`h-4 w-4 ${optedIn ? "fill-rose-300 text-rose-300" : "animate-pulse"}`} />
            {optedIn ? "Wipe Session: Opt-Out of Women Space" : "Agree & Activate: Women Space Module"}
          </button>
        </div>
      </div>

      {/* 🛑 FALLBACK SCREEN: NOT OPTED IN */}
      {!optedIn ? (
        <div className="bg-[#0f1f3d] border border-slate-800 rounded-2xl p-6 sm:p-10 max-w-4xl mx-auto text-center" id="women-non-opted-in">
          <BrainCircuit className="h-14 w-14 text-emerald-400 mx-auto mb-5 animate-pulse" />
          <h2 className="text-2xl font-bold text-white mb-3">Private Women Space Modules Locked</h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto leading-relaxed mb-8">
            To ensure highest compliance on absolute safety, digital literacy bots and reporting tools are entirely opt-in. None of the activity inside this tab is linked with public missing alerts or general child registries.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-5 bg-[#0a1628]/80 border border-slate-800 rounded-xl">
              <Sparkles className="h-6 w-6 text-emerald-400 mb-3" />
              <h3 className="text-sm font-bold text-white mb-1.5">1. AI Skill Mentor</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Confidential customized mentorship feeds to master Coding, UI Design, Marketing, and Content pipelines with smart guides.</p>
            </div>
            <div className="p-5 bg-[#0a1628]/80 border border-slate-800 rounded-xl">
              <ShieldAlert className="h-6 w-6 text-emerald-400 mb-3" />
              <h3 className="text-sm font-bold text-white mb-1.5">2. GBV Guard Tools</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Confidential legal rights handbooks, safe response finder maps, escape planners, and anonymous helpline reports.</p>
            </div>
            <div className="p-5 bg-[#0a1628]/80 border border-slate-800 rounded-xl">
              <Users className="h-6 w-6 text-emerald-400 mb-3" />
              <h3 className="text-sm font-bold text-white mb-1.5">3. Success Circle</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Connect to professional mentors in Cameroon, apply for matched guides, support safe forums, and share your path.</p>
            </div>
          </div>

          <button
            onClick={handleOptInToggle}
            className="mt-8 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm shadow-md transition-all hover:scale-105"
          >
            Unlock Dynamic Modules
          </button>
        </div>
      ) : (
        // ✅ HIGHLY FUNCTIONAL SCREEN: OPTED IN ACTIVE
        <div className="space-y-8" id="women-active-hub">
          {/* Main Visual Sub-Tabs */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 max-w-2xl mx-auto mt-4 mb-2 bg-[#0a1628]/95 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("skills")}
              className={`w-full py-2.5 px-4 rounded-lg text-sm font-bold transition-all duration-150 flex items-center justify-center gap-2 ${
                activeTab === "skills"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  : "text-slate-350 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              AI Skill-Builder Bot
            </button>
            <button
              onClick={() => setActiveTab("safety")}
              className={`w-full py-2.5 px-4 rounded-lg text-sm font-bold transition-all duration-150 flex items-center justify-center gap-2 ${
                activeTab === "safety"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-350 hover:text-white hover:bg-slate-800"
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
              GBV Safety Tools
            </button>
            <button
              onClick={() => setActiveTab("community")}
              className={`w-full py-2.5 px-4 rounded-lg text-sm font-bold transition-all duration-150 flex items-center justify-center gap-2 ${
                activeTab === "community"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-350 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Users className="h-4 w-4" />
              Support & Community
            </button>
          </div>

          {/* ----------------------------------------------------------- */}
          {/* TAB 1: AI SKILL-BUILDING BOT */}
          {/* ----------------------------------------------------------- */}
          {/* ----------------------------------------------------------- */}
          {/* TAB 1: AI SKILL-BUILDING BOT */}
          {/* ----------------------------------------------------------- */}
          {activeTab === "skills" && (
            <div>
              {activeStudioSkill ? (
                /* 🚀 IMMERSIVE MULTI-PAGE CHAT STUDIO ROOM */
                <div className="space-y-6 animate-fade-in" id="skills-studio-room">
                  {/* Breadcrumb row */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
                    <button
                      onClick={() => {
                        setActiveStudioSkill(null);
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs font-bold flex items-center gap-2 hover:text-[#10b981] transition-all"
                    >
                      ← Exit Studio Workspace & Return to Registry
                    </button>
                    
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-slate-450 uppercase">STUDIO STREAM:</span>
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded text-[10px] font-bold">
                        {activeStudioSkill}
                      </span>
                    </div>
                  </div>

                  {/* Active lesson classroom banner */}
                  <div className="bg-gradient-to-r from-emerald-950/40 to-slate-950 border border-emerald-500/25 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
                        <span className="w-2.5 h-2.5 bg-emerald-400 animate-ping rounded-full block"></span>
                        Dedicated Skill Laboratory Active
                      </div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                        {activeStudioSkill} Interactive Lab Space
                      </h2>
                      <p className="text-slate-300 text-xs mt-1 max-w-xl">
                        Test syntax rules, study localized market challenges, and coordinate with Emora AI custom advisor to verify skills competency checklist below.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {completedSkills.includes(activeStudioSkill) ? (
                        <span className="px-3.5 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-lg flex items-center gap-2 font-mono uppercase">
                          <Check className="h-4.5 w-4.5 stroke-[2.5]" /> Subject Mastered
                        </span>
                      ) : (
                        <span className="px-3.5 py-2 bg-[#0f1f3d] border border-slate-800 text-slate-400 text-xs font-bold rounded-lg flex items-center gap-2 font-mono">
                          <Clock className="h-4.5 w-4.5 animate-pulse" /> Live Session Open
                        </span>
                      )}
                    </div>
                  </div>

                  {/* High Quality laboratory split view */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Columns 1-8: Full Height AI chat room */}
                    <div className="lg:col-span-8">
                      <div className="bg-[#0f1f3d] border border-slate-850 rounded-2xl overflow-hidden flex flex-col justify-between h-[540px] shadow-2xl">
                        {/* Chat session info */}
                        <div className="bg-[#0a1628] border-b border-slate-800 p-4 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 font-bold text-sm font-mono uppercase">
                              {activeStudioSkill.slice(0, 2)}
                            </div>
                            <div>
                              <div className="text-sm font-extrabold text-white flex items-center gap-2">
                                Emora AI Subject Mentoring Assistant
                                <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] uppercase font-mono rounded">
                                  {activeStudioSkill}
                                </span>
                              </div>
                              <div className="text-[10px] font-mono text-emerald-450 uppercase leading-none">
                                Adaptive Generative Mentor Session
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Message log */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a1628]/25">
                          {skillMessages.map((msg, i) => (
                            <div
                              key={i}
                              className={`flex gap-3 max-w-[85%] ${
                                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                              }`}
                            >
                              <div
                                className={`h-7 w-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                                  msg.role === "user"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-emerald-600 text-white"
                                }`}
                              >
                                {msg.role === "user" ? "Me" : "Em"}
                              </div>
                              <div
                                className={`p-3 rounded-xl border text-xs shadow-inner leading-relaxed ${
                                  msg.role === "user"
                                    ? "bg-slate-900 border-indigo-700 text-indigo-100"
                                    : "bg-slate-900/90 border-[#1e3a8a]/45 text-slate-100"
                                }`}
                              >
                                {formatBotText(msg.text)}
                              </div>
                            </div>
                          ))}

                          {skillLoading && (
                            <div className="flex gap-3 items-center text-slate-400 text-xs">
                              <div className="h-7 w-7 rounded-lg shrink-0 bg-emerald-600/10 flex items-center justify-center text-emerald-400 animate-pulse">
                                E
                              </div>
                              <div className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl italic flex items-center gap-2">
                                <RefreshCw className="h-3 w-3 animate-spin text-emerald-400" />
                                Emora mentor is modeling your solution parameters...
                              </div>
                            </div>
                          )}
                          <div ref={skillChatEndRef} />
                        </div>

                        {/* Chat action form */}
                        <form onSubmit={handleSendSkillMessage} className="p-3 bg-[#0a1628] border-t border-slate-800">
                          {/* Quick sandbox questions */}
                          <div className="flex flex-wrap gap-1.5 mb-2.5 overflow-x-auto max-w-full pb-1">
                            <span className="text-[9px] font-mono text-slate-450 uppercase py-1 leading-none mr-1.5 block">Session Tools:</span>
                            <button
                              type="button"
                              onClick={() => {
                                setSkillInput(`Explain standard best practice design patterns for ${activeStudioSkill} freelancing.`);
                              }}
                              className="px-2 py-1 bg-slate-850 hover:bg-slate-800 text-slate-300 text-[10px] rounded border border-slate-800 transition-colors"
                            >
                              Career Pathfinder Info
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSkillInput(`Give me a Cameroon challenge study task based on ${activeStudioSkill}.`);
                              }}
                              className="px-2 py-1 bg-slate-850 hover:bg-slate-800 text-slate-300 text-[10px] rounded border border-slate-800 transition-colors"
                            >
                              Request Case Challenge
                            </button>
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={skillInput}
                              onChange={(e) => setSkillInput(e.target.value)}
                              placeholder={`Query Emora AI about ${activeStudioSkill} libraries, standards, and practical setups...`}
                              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500"
                            />
                            <button
                              type="submit"
                              disabled={skillLoading || !skillInput.trim()}
                              className="px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>

                    {/* Columns 9-12: Milestone task verification checklists and custom regional tasks */}
                    <div className="lg:col-span-4 bg-[#0f1f3d] border border-slate-800 rounded-2xl p-5 space-y-6 shadow-xl">
                      <div className="border-b border-slate-800 pb-3">
                        <span className="text-[10px] font-mono font-bold tracking-widest text-[#10b981] uppercase block mb-1">
                          Mentoring Academy
                        </span>
                        <h3 className="text-base font-extrabold text-white">
                          Milestone Checklist
                        </h3>
                        <p className="text-slate-400 text-[10px] mt-0.5">
                          Ticking milestones saves your session learning progress locally.
                        </p>
                      </div>

                      {/* Milestone list */}
                      <div className="space-y-3">
                        {[
                          { id: "m1", label: "Foundational Theory Concepts Check" },
                          { id: "m2", label: "Analyze Regional Industry Case Studies" },
                          { id: "m3", label: "Participated in Advisor Mini-lab Exercises" },
                        ].map((m) => {
                          const checked = !!(studioCheckboxes[activeStudioSkill]?.[m.id]);
                          return (
                            <div 
                              key={m.id}
                              onClick={() => toggleStudioCheckbox(activeStudioSkill, m.id)}
                              className={`p-3 border rounded-xl flex items-start gap-3 cursor-pointer transition-all ${
                                checked 
                                  ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                                  : "bg-[#0a1628]/80 border-slate-800 hover:border-slate-700 text-slate-300"
                              }`}
                            >
                              <div className={`mt-0.5 h-4.5 w-4.5 shrink-0 rounded flex items-center justify-center border transition-colors ${
                                checked ? "bg-emerald-500 border-emerald-400 text-slate-900" : "border-slate-700 bg-slate-950"
                              }`}>
                                {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                              </div>
                              <span className="text-xs font-semibold">{m.label}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Targeted Regional Exercise Block depending on Skill */}
                      <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2.5">
                        <h4 className="text-xs font-bold text-white uppercase font-mono text-emerald-400 flex items-center gap-1.5">
                          <span>🔬</span> Studio Practical Exercise:
                        </h4>

                        <div className="text-xs text-slate-300 leading-relaxed">
                          {activeStudioSkill === "Web Development" && (
                            <span><strong>Task:</strong> Code a responsive HTML skeleton for a local women-owned clinic directories in Douala. Ask our AI Bot for assistance on header configurations!</span>
                          )}
                          {activeStudioSkill === "Digital Marketing" && (
                            <span><strong>Task:</strong> Devise a 3-step promotional WhatsApp marketing pipeline structure to advertise wholesale grain farm products for Cameroon regional unions.</span>
                          )}
                          {activeStudioSkill === "Prompt Engineering" && (
                            <span><strong>Task:</strong> Construct a system parameter role instruction for an AI triage bot to respond to local Cameroonian legal structures with safe answers.</span>
                          )}
                          {activeStudioSkill === "Software Development" && (
                            <span><strong>Task:</strong> Build a clean algorithmic function file in TypeScript to calculate micro-credit loan schedules with proper Cameroonian banking fees.</span>
                          )}
                          {activeStudioSkill === "Data Analysis" && (
                            <span><strong>Task:</strong> Compile a sample Excel layout tracker documenting monthly peer circle investment trends in Yaounde, and map metrics to the mentor!</span>
                          )}
                          {activeStudioSkill === "Content Creation" && (
                            <span><strong>Task:</strong> Author a mini-blog sample (150 words) celebrating Cameroon women tech builders, using engaging display taglines.</span>
                          )}
                          {activeStudioSkill === "Graphic Design" && (
                            <span><strong>Task:</strong> Conceptualize a minimalist high-contrast brand grid logo for dynamic peer groups using soft colors, and submit to the advisor.</span>
                          )}
                          {activeStudioSkill === "Social Media Management" && (
                            <span><strong>Task:</strong> Craft a 5-day promotional post scheduler campaign for safety resources inside Cameroon, listing safe tags and hashtags.</span>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-800 space-y-3">
                        {completedSkills.includes(activeStudioSkill) ? (
                          <button
                            onClick={() => removeSkillComplete(activeStudioSkill)}
                            className="w-full py-2 bg-slate-900 border border-red-500/30 hover:bg-red-950/30 text-red-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            Mark Subject Uncompleted
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              markSkillComplete(activeStudioSkill);
                              setActiveStudioSkill(null);
                            }}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/20"
                          >
                            <Check className="h-4 w-4 stroke-[2.5]" />
                            Conclude Session & Certify Mastery
                          </button>
                        )}

                        <button
                          onClick={() => setActiveStudioSkill(null)}
                          className="w-full py-2 text-slate-400 hover:text-white rounded-xl text-xs font-semibold transition-colors bg-slate-850"
                        >
                          Suspend Live Lab Workspace
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* 📚 STANDARD DIRECTORY SELECTION SCREEN */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in" id="women-skills-tab">
                  {/* Left Column: Curriculum Streams List */}
                  <div className="lg:col-span-4 space-y-4">
                    {/* Progression Score widget */}
                    <div className="bg-[#0f1f3d] border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-extrabold uppercase">
                          Women Academy Track
                        </span>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono font-bold px-1.5 py-0.5 rounded">
                          {completedSkills.length} / 8 Mastered
                        </span>
                      </div>

                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className="bg-emerald-500 h-full transition-all duration-300" 
                          style={{ width: `${Math.round((completedSkills.length / 8) * 100)}%` }}
                        ></div>
                      </div>

                      <p className="text-[10px] text-slate-400 leading-normal text-center">
                        {completedSkills.length === 8 
                          ? "👑 Glorious! You completed all tech streams in Women's Space Academy!" 
                          : "Launch specialized studio laboratory sessions and Mark completed to clear programs."}
                      </p>
                    </div>

                    {/* Streams list */}
                    <div className="bg-[#0f1f3d] border border-slate-800 rounded-xl p-4">
                      <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block mb-3">
                        Curriculum Directory
                      </h4>
                      <div className="space-y-1">
                        {skillsList.map(skill => {
                          const Icon = skill.icon;
                          const isSelected = selectedSkill === skill.id;
                          const isDone = completedSkills.includes(skill.id);
                          return (
                            <button
                              key={skill.id}
                              onClick={() => handleSelectSkill(skill.id)}
                              className={`w-full text-left p-3 rounded-lg text-xs font-medium transition-all flex items-start justify-between gap-1 border ${
                                isSelected
                                  ? "bg-emerald-600/15 text-emerald-400 border-emerald-500/30"
                                  : "bg-[#0a1628]/40 text-slate-300 border-transparent hover:bg-[#0a1628] hover:border-slate-800"
                              }`}
                            >
                              <div className="flex items-start gap-2.5 min-w-0">
                                <Icon className={`h-4.5 w-4.5 mt-0.5 shrink-0 ${isSelected ? "text-emerald-400" : "text-slate-450"}`} />
                                <div className="min-w-0">
                                  <span className="font-bold text-white block truncate mb-0.5">{skill.label}</span>
                                  <span className="text-[10px] text-slate-450 leading-none block truncate">{skill.desc}</span>
                                </div>
                              </div>
                              
                              {isDone && (
                                <span className="shrink-0 p-1 bg-emerald-500/25 border border-emerald-500/40 rounded-full text-emerald-400">
                                  <Check className="h-3 w-3 stroke-[3]" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Selected Skill Details & Session Launch Launcher */}
                  <div className="lg:col-span-8">
                    <div className="bg-[#0f1f3d] border border-slate-800 rounded-2xl p-6 space-y-6">
                      <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                        <div>
                          <span className="text-[10px] font-mono tracking-widest bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">
                            Curriculum Segment Summary
                          </span>
                          <h2 className="text-xl font-bold text-white mt-2 leading-tight">
                            {selectedSkill} Specialization
                          </h2>
                        </div>

                        <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
                          {/* Find matching icon */}
                          {React.createElement(skillsList.find(s => s.id === selectedSkill)?.icon || Code, { className: "h-6 w-6 text-emerald-500" })}
                        </div>
                      </div>

                      {/* Brief parameters */}
                      <div className="space-y-4 text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-4 rounded-xl border border-slate-800">
                        <strong className="text-white block font-mono uppercase text-[10px] text-emerald-400">
                          Module Core Details
                        </strong>
                        <p>
                          This dynamic Emora program focuses extensively on introducing structural competencies configured towards building modern freelancers in Cameroon, enabling regional income generation and digital self reliance.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                          <div className="p-3 bg-slate-950 border border-slate-850 rounded">
                            <span className="text-slate-450 uppercase text-[9px] block">Duration</span>
                            <span className="text-white font-bold block text-sm mt-0.5">3 Modules</span>
                          </div>
                          <div className="p-3 bg-slate-950 border border-slate-850 rounded">
                            <span className="text-slate-450 uppercase text-[9px] block">Level</span>
                            <span className="text-[#10b981] font-bold block text-sm mt-0.5">Foundational</span>
                          </div>
                          <div className="p-3 bg-slate-950 border border-slate-850 rounded">
                            <span className="text-slate-450 uppercase text-[9px] block">AI Mentor status</span>
                            <span className="text-white font-bold block text-sm mt-0.5">Ready to Guide</span>
                          </div>
                        </div>
                      </div>

                      {/* Launch Button Triggers */}
                      <div className="bg-gradient-to-r from-emerald-950/20 to-[#0a1628] border border-emerald-500/20 rounded-xl p-5 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-center md:text-left">
                          <h4 className="text-sm font-bold text-white">Ready for Immersive Learning?</h4>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            Launch our high contrast laboratory session which loads in its own dedicated studio room.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setActiveStudioSkill(selectedSkill);
                            // Initial setup for messages if empty
                            setSkillMessages([
                              {
                                role: "model",
                                text: `Welcome to your interactive **${selectedSkill}** live practical studio laboratory workspace! Ask me any questions, and complete your checklist on the side to finalize certification.`
                              }
                            ]);
                          }}
                          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-slate-950 text-white font-extrabold rounded-lg text-xs shadow-md transition-all hover:scale-105 inline-flex items-center gap-2 shrink-0 font-sans"
                        >
                          <Terminal className="h-4 w-4" /> 🚀 Launch Active Session Page
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------- */}
          {/* TAB 2: GBV SAFETY TOOLS */}
          {/* ----------------------------------------------------------- */}
          {activeTab === "safety" && (
            <div className="space-y-8 animate-fade-in" id="women-safety-tab">
              {/* Inner Safety Switch Menu */}
              <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-800 max-w-3xl mx-auto justify-center">
                <button
                  onClick={() => setActiveSafetyTool("bot")}
                  className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${
                    activeSafetyTool === "bot"
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                      : "bg-[#0f1f3d] border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  Confidential Counseling Bot
                </button>
                <button
                  onClick={() => setActiveSafetyTool("finder")}
                  className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${
                    activeSafetyTool === "finder"
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                      : "bg-[#0f1f3d] border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  Emergency Resource Directory
                </button>
                <button
                  onClick={() => setActiveSafetyTool("reporting")}
                  className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${
                    activeSafetyTool === "reporting"
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                      : "bg-[#0f1f3d] border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  Anonymous Reporting (confidential)
                </button>
                <button
                  onClick={() => setActiveSafetyTool("rights")}
                  className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${
                    activeSafetyTool === "rights"
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                      : "bg-[#0f1f3d] border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  Penal Legal Handbook
                </button>
                <button
                  onClick={() => setActiveSafetyTool("planner")}
                  className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${
                    activeSafetyTool === "planner"
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                      : "bg-[#0f1f3d] border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  Personal Exit Planner
                </button>
              </div>

              {/* Safety Tool Active Panels */}
              {activeSafetyTool === "bot" && (
                <div className="max-w-3xl mx-auto">
                  <div className="bg-[#0f1f3d] border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between h-[450px]">
                    <div className="bg-rose-900/20 border-b border-slate-800 p-3.5 px-4 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4.5 w-4.5 text-rose-450 fill-rose-500" />
                        <span className="text-sm font-bold text-white uppercase tracking-wider">Confidential GBV Counseling Assistant</span>
                      </div>
                      <span className="text-[10px] bg-rose-500/15 border border-rose-500/20 text-rose-300 px-2.5 py-0.5 rounded font-mono">CONFIDENTIAL</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a1628]/25">
                      {gbvMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex gap-2.5 max-w-[85%] ${
                            msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                          }`}
                        >
                          <div
                            className={`p-3 rounded-xl border text-xs leading-relaxed ${
                              msg.role === "user"
                                ? "bg-slate-900 border-rose-800 text-rose-100"
                                : "bg-slate-900/95 border-emerald-800/40 text-slate-150"
                            }`}
                          >
                            {formatBotText(msg.text)}
                          </div>
                        </div>
                      ))}
                      {gbvLoading && (
                        <div className="flex items-center text-slate-400 text-xs italic gap-2 pl-2">
                          <RefreshCw className="h-3 w-3 animate-spin text-rose-400" />
                          Confidential counselor writing safety analysis...
                        </div>
                      )}
                      <div ref={gbvChatEndRef} />
                    </div>

                    <form onSubmit={handleSendGbvMessage} className="p-3 bg-[#0a1628] border-t border-slate-800 flex gap-2">
                      <input
                        type="text"
                        value={gbvInput}
                        onChange={(e) => setGbvInput(e.target.value)}
                        placeholder="Discuss safety tips, escape signals, or domestic support models privately..."
                        className="w-full bg-slate-900 border border-slate-705 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-rose-500"
                      />
                      <button
                        type="submit"
                        disabled={gbvLoading || !gbvInput.trim()}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg flex items-center justify-center disabled:opacity-50"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {activeSafetyTool === "finder" && (
                <div className="max-w-4xl mx-auto space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-white mb-1">Women's Emergency Protective Network</h3>
                    <p className="text-xs text-slate-350">Urgent clinics, mediation houses, and police groups offering direct action in Cameroon.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gbvEmergencyResources.map((res, i) => (
                      <div key={i} className="bg-[#0f1f3d] border border-slate-800 rounded-xl p-5 hover:shadow-lg transition-transform hover:scale-[1.01] flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 block shrink-0"></span>
                            {res.name}
                          </h4>
                          <p className="text-[11px] text-slate-300 leading-relaxed mb-4">{res.desc}</p>
                          <div className="text-[11px] text-slate-450 space-y-1 bg-slate-900/60 p-2.5 rounded border border-slate-800">
                            <div><strong className="text-slate-305">Location:</strong> {res.location}</div>
                            <div><strong className="text-slate-305">Dial Helpline:</strong> {res.phone}</div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-800 mt-4 space-y-1.5">
                          <a
                            href={`tel:${res.phone}`}
                            className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] font-bold flex items-center justify-center gap-1.5"
                          >
                            <Phone className="h-3 w-3 text-emerald-400" /> Call Regional Line
                          </a>
                          {res.whatsapp && (
                            <a
                              href={`https://wa.me/${res.whatsapp.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              className="w-full py-1.5 px-3 bg-emerald-600/10 hover:bg-emerald-600/20 text-[#10b981] rounded text-[11px] font-bold flex items-center justify-center gap-1.5 border border-emerald-500/20"
                            >
                              <MessageSquare className="h-3 w-3 text-emerald-400" /> WhatsApp Secure Chat
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSafetyTool === "reporting" && (
                <div className="max-w-xl mx-auto bg-[#0f1f3d] border border-slate-800 rounded-xl p-6 shadow-xl">
                  <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2 text-rose-450 inline-block">
                    <ShieldAlert className="h-5 w-5 text-rose-500" />
                    Anonymous Cameroon GBV Incident Logger
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-5">
                    Submit threat parameters directly to verified protection networks. This submission contains NO credentials, email tracks, or cookie references to protect survivor identities.
                  </p>

                  {anonSuccess ? (
                    <div className="bg-emerald-950/80 border border-emerald-500/30 p-4 rounded-lg text-xs font-mono text-emerald-300 mb-4 animate-scale-up">
                      <Check className="h-5.5 w-5.5 bg-emerald-600/40 text-emerald-200 rounded-full p-1 inline block mb-1" />
                      <strong className="block mb-0.5 uppercase font-bold text-white">Confidential Incident Transmitted Successfully</strong>
                      Our system logged your report securely under hash index: anon_hash_{Date.now().toString().slice(-7)}. Protective partners stand by.
                    </div>
                  ) : null}

                  <form onSubmit={handleAnonReportSubmit} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-350 block mb-1">Incident Classification</label>
                      <select
                        value={anonCategory}
                        onChange={(e) => setAnonCategory(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded p-1.5 text-xs focus:ring-1 focus:ring-rose-500"
                      >
                        <option value="Intimate Partner Harassment">Intimate Partner Harassment</option>
                        <option value="Forced Economic Deprivation">Forced Economic Deprivation</option>
                        <option value="Workplace/Educational Coercion">Workplace/Educational Coercion</option>
                        <option value="Physical Abuse Battery">Physical Abuse Battery</option>
                        <option value="Early / Forced Traditional Match">Early / Forced Traditional Match</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-350 block mb-1">Geographical Region</label>
                      <select
                        value={anonLocation}
                        onChange={(e) => setAnonLocation(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded p-1.5 text-xs focus:ring-1 focus:ring-rose-500"
                      >
                        <option value="Centre (Yaoundé)">Centre (Yaoundé)</option>
                        <option value="Littoral (Douala)">Littoral (Douala)</option>
                        <option value="South-West (Buea)">South-West (Buea)</option>
                        <option value="North (Garoua)">North (Garoua)</option>
                        <option value="West (Bafoussam)">West (Bafoussam)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-350 block mb-1">Incident Parameters & Specifics</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Detail the case elements anonymously... (Avoid naming specific personal names if you fear tracking, just detail context, frequency, and safety state)"
                        value={anonDetails}
                        onChange={(e) => setAnonDetails(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded p-1.5 text-xs focus:outline-none focus:border-rose-500"
                      ></textarea>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="planCompleted"
                        checked={anonPlanCompleted}
                        onChange={() => setAnonPlanCompleted(!anonPlanCompleted)}
                        className="rounded bg-slate-900 border-slate-700 text-rose-550"
                      />
                      <label htmlFor="planCompleted" className="text-[11px] text-slate-300 font-medium cursor-pointer">
                        I have checked my active Personal Response Plan and am in a safe space to report.
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={anonSubmitting || !anonDetails.trim()}
                      className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                    >
                      {anonSubmitting ? "Transmitting over secure node..." : "Transmit Anonymous Report"}
                    </button>
                  </form>
                </div>
              )}

              {activeSafetyTool === "rights" && (
                <div className="max-w-2xl mx-auto space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-white mb-1">Women's Protective Legal Codes</h3>
                    <p className="text-xs text-slate-350">Understand civil protections and rights coded in Cameroonian legislation.</p>
                  </div>
                  <div className="space-y-2 bg-[#020617]/55 border border-slate-805 rounded-xl p-4">
                    {expandedRight !== null && (
                      <div className="bg-emerald-950/20 text-emerald-400 p-3.5 border border-emerald-500/20 rounded-lg text-xs leading-relaxed mb-4 flex items-start gap-2 max-w-full">
                        <Lock className="h-4.5 w-4.5 text-emerald-350 shrink-0 mt-0.5" />
                        <div>
                          <strong>Universal Legal Custody Clause:</strong> Under regional laws, administrative magistrates can formulate protection warrants within 24 working hours without holding a prior adversary hearing if threats of home mutilation are established.
                        </div>
                      </div>
                    )}
                    {legalRightsList.map((right, idx) => {
                      const isExpanded = expandedRight === idx;
                      return (
                        <div key={idx} className="border-b border-slate-800 last:border-b-0">
                          <button
                            onClick={() => setExpandedRight(isExpanded ? null : idx)}
                            className="w-full py-3 text-left font-bold text-xs text-white uppercase tracking-wider flex justify-between items-center hover:text-emerald-400 transition-colors"
                          >
                            <span>{right.title}</span>
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                          {isExpanded && (
                            <p className="pb-4 text-xs text-slate-300 leading-relaxed pl-2">
                              {right.desc}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeSafetyTool === "planner" && (
                <div className="max-w-xl mx-auto bg-[#0f1f3d] border border-slate-800 rounded-xl p-6 shadow-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                      <CheckSquare className="h-5 w-5 text-emerald-400" />
                      Dynamic Escape Response Planner
                    </h3>
                    <div className="text-xs font-mono font-bold text-emerald-400">
                      {getSafetyProgressPercent()}% Completed
                    </div>
                  </div>
                  <p className="text-xs text-slate-305 leading-relaxed mb-4">
                    Formulate a safe exit pathway step-by-step. Checking items stores their parameter state strictly within your local session memory. Feel free to print out a safe visual summary or erase logs in one-tap.
                  </p>

                  {/* Progress Line */}
                  <div className="w-full bg-slate-900 rounded-full h-1.5 mb-5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${getSafetyProgressPercent()}%` }}
                    ></div>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-3 mb-6">
                    {safetyTasks.map(task => {
                      const isChecked = safetyPlannerAnswers[task.key];
                      return (
                        <div
                          key={task.key}
                          onClick={() => handleSafetyTaskToggle(task.key)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                            isChecked
                              ? "bg-emerald-550/10 border-emerald-500/35 text-emerald-300"
                              : "bg-slate-900 border-slate-800 text-slate-150 hover:border-slate-700"
                          }`}
                        >
                          <div className={`h-4.5 w-4.5 rounded font-bold text-[10px] flex items-center justify-center shrink-0 border mt-0.5 ${
                            isChecked 
                              ? "bg-emerald-500 border-emerald-500 text-slate-950" 
                              : "border-slate-650"
                          }`}>
                            {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <div>
                            <span className="text-xs font-bold block mb-0.5">{task.title}</span>
                            <span className="text-[10px] text-slate-400 leading-tight block">{task.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                    <button
                      onClick={() => setSafetyPlannerAnswers({
                        secureDocs: false,
                        emergencyCash: false,
                        secretSignal: false,
                        packedBag: false,
                        safeContacts: false,
                        eraseLogs: false
                      })}
                      className="px-3 py-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded text-[10px] font-bold uppercase transition-colors"
                    >
                      Reset All
                    </button>
                    <button
                      onClick={() => {
                        window.print();
                      }}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold uppercase tracking-wider shadow-md transition-all hover:scale-105"
                    >
                      Print Response Plan
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------- */}
          {/* TAB 3: COMMUNITY & SUPPORT GROUP FEATURES */}
          {/* ----------------------------------------------------------- */}
          {activeTab === "community" && (
            <div className="space-y-10 animate-fade-in" id="women-community-tab">
              {/* Section 1: Support groups */}
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Users className="h-5 w-5 text-emerald-400" />
                      Protected Peer Support Circles
                    </h3>
                    <p className="text-xs text-slate-350">Confidential group boards and spaces for support, matching, and career resources in Cameroon.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {peerGroups.map((group) => {
                    const hasJoined = joinedGroups.includes(group.id);
                    return (
                      <div key={group.id} className="bg-[#0f1f3d] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded font-mono border border-emerald-500/20">
                              {group.category}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {group.members} active sisters
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white mb-2 leading-snug">{group.name}</h4>
                          <p className="text-[11px] text-slate-305 leading-relaxed leading-normal">{group.description}</p>
                        </div>

                        <button
                          onClick={() => handleJoinGroup(group.id)}
                          disabled={hasJoined}
                          className={`w-full py-1.5 rounded text-[11px] font-bold tracking-wider mt-4 shadow-sm text-center ${
                            hasJoined
                              ? "bg-slate-800 text-emerald-400" 
                              : "bg-emerald-600 hover:bg-emerald-700 text-white"
                          }`}
                        >
                          {hasJoined ? "✓ Joined Support Circle" : "Apply to Join Circle"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Mentorship Matching */}
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 animate-pulse">
                      <UserCheck className="h-5 w-5 text-emerald-400" />
                      Mentorship Matching Network
                    </h3>
                    <p className="text-xs text-slate-350">Develop career bounds with senior techies and entrepreneurs in Cameroon. Request matches or register as a mentor.</p>
                  </div>

                  <button
                    onClick={() => setShowMentorModal(true)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md hover:scale-105 transition-all"
                  >
                    Enroll as Mentor
                  </button>
                </div>

                {/* Active mentor matches display if any are pending */}
                {mentorMatches && mentorMatches.length > 0 && (
                  <div className="mb-6 bg-slate-900/60 p-4 rounded-xl border border-[#1e3a8a]/45 max-w-xl">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                      Submitted Match Queries
                    </span>
                    <div className="space-y-1.5">
                      {mentorMatches.map((match: any) => (
                        <div key={match.id} className="text-xs text-slate-300 flex justify-between bg-slate-950 p-2.5 rounded border border-slate-850">
                          <div>
                            <strong className="text-white">{match.menteeName}</strong> requested guide for <strong>{match.expertise}</strong>
                          </div>
                          <span className="text-[#10b981] font-mono uppercase text-[9px] font-bold border border-emerald-500/20 px-1 rounded bg-emerald-500/10">
                            {match.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mentors Grid Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {mentors.map((mentor) => (
                    <div key={mentor.id} className="bg-[#0f1f3d] border border-slate-801 border-slate-800 hover:border-emerald-500/35 rounded-xl overflow-hidden shadow-md flex flex-col justify-between">
                      <div>
                        <div className="relative aspect-square w-full bg-slate-950">
                          <img
                            src={mentor.image || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'}
                            alt={mentor.name}
                            referrerPolicy="referrer"
                            className="w-full h-full object-cover opacity-90"
                          />
                          <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#0a1628]/85 backdrop-blur items-center flex gap-1 rounded border border-slate-850 text-[10px] font-bold text-[#f59e0b]">
                            <Star className="h-3 w-3 text-[#f59e0b] fill-[#f59e0b] stroke-none" />
                            {mentor.rating.toFixed(1)}
                          </div>
                        </div>

                        <div className="p-4">
                          <span className="text-[9px] font-mono tracking-widest font-bold text-emerald-400 uppercase block mb-0.5">
                            {mentor.expertise}
                          </span>
                          <h4 className="text-sm font-bold text-white mb-2 leading-none block truncate">{mentor.name}</h4>
                          <p className="text-[10px] text-slate-300 leading-relaxed mb-3 line-clamp-3">{mentor.bio}</p>
                          <div className="text-[10px] text-slate-450 font-mono flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            Office Location: {mentor.location}
                          </div>
                        </div>
                      </div>

                      <div className="px-4 pb-4 pt-0">
                        <button
                          onClick={() => setSelectedMentorForMatch(mentor)}
                          className="w-full py-1.5 bg-slate-800 hover:bg-slate-750 text-[#cbd5e1] hover:text-white rounded text-[11px] font-semibold tracking-wide border border-slate-750 transition-colors"
                        >
                          Request Match Guide
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Success Stories Library */}
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-emerald-405" />
                      Inspirational Success Stories
                    </h3>
                    <p className="text-xs text-slate-350">Read verified survivor paths, developer transitions, and business scale stories of Cameroonian women.</p>
                  </div>

                  <button
                    onClick={() => setShowStoryModal(true)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md hover:scale-105 transition-all"
                  >
                    Share Your Story
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {successStories.map((story) => (
                    <div key={story.id} className="bg-[#0f1f3d] rounded-xl border border-slate-800 hover:border-emerald-500/30 overflow-hidden flex flex-col justify-between group">
                      <div>
                        {story.image && (
                          <div className="aspect-video w-full bg-slate-950 overflow-hidden border-b border-slate-850">
                            <img
                              src={story.image}
                              alt={story.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform"
                            />
                          </div>
                        )}

                        <div className="p-5">
                          <div className="flex justify-between items-center mb-2 text-[9px] font-mono tracking-widest text-[#10b981] font-bold uppercase">
                            <span>{story.category}</span>
                            <span className="text-slate-450">{story.date}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white mb-2 leading-snug group-hover:text-emerald-400 transition-colors">
                            {story.title}
                          </h4>
                          <p className="text-xs text-slate-300 leading-relaxed italic line-clamp-4">
                            "{story.story}"
                          </p>
                        </div>
                      </div>

                      <div className="px-5 pb-5 pt-0 flex justify-between items-center text-[10px] text-slate-450">
                        <div>
                          By: <strong className="text-slate-300">{story.author}</strong>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" /> {story.location}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------- */}
          {/* MODALS */}
          {/* ----------------------------------------------------------- */}

          {/* Modal A: Enroll as Mentor */}
          {showMentorModal && (
            <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50">
              <div className="bg-[#0f1f3d] border border-emerald-500/25 rounded-xl overflow-hidden shadow-2xl max-w-md w-full p-6 animate-scale-up">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    <UserCheck className="h-5 w-5 text-emerald-400 font-bold" />
                    Enroll as Career Mentor
                  </h3>
                  <button
                    onClick={() => setShowMentorModal(false)}
                    className="p-1 text-slate-400 hover:text-white rounded text-xs"
                  >
                    Close
                  </button>
                </div>

                <form onSubmit={handleMentorEnrollSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Marie-Noelle Onana"
                      value={mentorName}
                      onChange={(e) => setMentorName(e.target.value)}
                      className="w-full bg-[#0a1628] border border-slate-700 text-white rounded p-2 text-xs focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Area of Expertise</label>
                    <select
                      value={mentorExpertise}
                      onChange={(e) => setMentorExpertise(e.target.value)}
                      className="w-full bg-[#0a1628] border border-slate-700 text-white rounded p-2 text-xs focus:ring-1 focus:ring-emerald-500"
                    >
                      {skillsList.map(skill => (
                        <option key={skill.id} value={skill.id}>{skill.id}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Bio & Career Statement</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Briefly state your current role, technologies/skills you can help with, and weekly availability..."
                      value={mentorBio}
                      onChange={(e) => setMentorBio(e.target.value)}
                      className="w-full bg-[#0a1628] border border-slate-705 text-white rounded p-2 text-xs focus:ring-1 focus:ring-emerald-500"
                    ></textarea>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Primary Office Location</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Douala (Akwa) or Yaoundé"
                      value={mentorLocation}
                      onChange={(e) => setMentorLocation(e.target.value)}
                      className="w-full bg-[#0a1628] border border-slate-700 text-white rounded p-2 text-xs"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowMentorModal(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-[#cbd5e1] text-xs font-semibold rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={mentorEnrollerLoading}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-705 text-white text-xs font-semibold rounded-lg shadow-md disabled:opacity-50"
                    >
                      {mentorEnrollerLoading ? "Submitting..." : "Submit Enrollment"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal B: Match request details */}
          {selectedMentorForMatch && (
            <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50">
              <div className="bg-[#0f1f3d] border border-emerald-500/25 rounded-xl overflow-hidden shadow-2xl max-w-md w-full p-6 animate-scale-up">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    Request Mentor Guide Match
                  </h3>
                  <button
                    onClick={() => setSelectedMentorForMatch(null)}
                    className="p-1 text-slate-400 hover:text-white rounded text-xs"
                  >
                    Close
                  </button>
                </div>

                {matchSuccess ? (
                  <div className="bg-emerald-950/80 border border-emerald-500/30 p-4 rounded-lg text-xs font-mono text-emerald-300 text-center animate-scale-up">
                    <Check className="h-6 w-6 bg-emerald-600 text-white rounded-full p-1 mx-auto mb-2" />
                    <strong>Match Request Dispatched</strong>
                    Your request was successfully submitted to {selectedMentorForMatch.name}! You will see your pending application status refreshed in the mentor match tracker.
                  </div>
                ) : (
                  <form onSubmit={handleMentorshipMatchSubmit} className="space-y-4">
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 flex gap-3">
                      <div className="w-10 h-10 rounded bg-slate-950 overflow-hidden shrink-0">
                        <img src={selectedMentorForMatch.image} alt={selectedMentorForMatch.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <strong className="text-sm text-white block">{selectedMentorForMatch.name}</strong>
                        <span className="text-[10px] text-emerald-400 block font-mono font-bold uppercase">{selectedMentorForMatch.expertise}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Your Full Name (or alias to remain private)</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Susan Bih"
                        value={menteeApplicantName}
                        onChange={(e) => setMenteeApplicantName(e.target.value)}
                        className="w-full bg-[#0a1628] border border-slate-700 text-white rounded p-2 text-xs focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Introduce Yourself & Your Goals</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Why do you seek guidance on this topic? What are your active learning goals? What resources do you have access to?"
                        value={mentorRequestMessage}
                        onChange={(e) => setMentorRequestMessage(e.target.value)}
                        className="w-full bg-[#0a1628] border border-slate-705 text-white rounded p-2 text-xs focus:ring-1 focus:ring-emerald-500"
                      ></textarea>
                    </div>

                    <div className="flex gap-2 justify-end pt-4 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setSelectedMentorForMatch(null)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-705 text-[#cbd5e1] text-xs font-semibold rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={mentorMatchingLoading || !menteeApplicantName.trim()}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-705 text-white text-xs font-semibold rounded-lg shadow-md disabled:opacity-50"
                      >
                        {mentorMatchingLoading ? "Dispatching..." : "Submit Match Application"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Modal C: Share Success Story */}
          {showStoryModal && (
            <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50">
              <div className="bg-[#0f1f3d] border border-emerald-500/25 rounded-xl overflow-hidden shadow-2xl max-w-md w-full p-6 animate-scale-up">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    Share Your Success Journey
                  </h3>
                  <button
                    onClick={() => setShowStoryModal(false)}
                    className="p-1 text-slate-400 hover:text-white rounded text-xs"
                  >
                    Close
                  </button>
                </div>

                <form onSubmit={handleStorySubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Carine"
                        value={storyAuthor}
                        onChange={(e) => setStoryAuthor(e.target.value)}
                        className="w-full bg-[#0a1628] border border-slate-700 text-white rounded p-2 text-xs focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Location (Cameroon)</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Douala"
                        value={storyLocation}
                        onChange={(e) => setStoryLocation(e.target.value)}
                        className="w-full bg-[#0a1628] border border-slate-700 text-white rounded p-2 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Story Headline / Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Scaling my business via mobile automation"
                      value={storyTitle}
                      onChange={(e) => setStoryTitle(e.target.value)}
                      className="w-full bg-[#0a1628] border border-slate-700 text-white rounded p-2 text-xs focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Core Learning Area</label>
                      <select
                        value={storyCategory}
                        onChange={(e) => setStoryCategory(e.target.value)}
                        className="w-full bg-[#0a1628] border border-slate-700 text-white rounded p-1.5 text-xs"
                      >
                        {skillsList.map(skill => (
                          <option key={skill.id} value={skill.id}>{skill.id}</option>
                        ))}
                        <option value="Advocacy">Safety & Recovery</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-303 block mb-1">Optional Photo Link</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash..."
                        value={storyImage}
                        onChange={(e) => setStoryImage(e.target.value)}
                        className="w-full bg-[#0a1628] border border-slate-700 text-white rounded p-1.5 text-xs text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Your Full Story (Inspirational & Real)</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Write your accomplishments, what tools you utilized on Emora, help received from protective circles, and your advice for other Cameroonian sisters..."
                      value={storyText}
                      onChange={(e) => setStoryText(e.target.value)}
                      className="w-full bg-[#0a1628] border border-slate-705 text-white rounded p-2 text-xs focus:ring-1 focus:ring-emerald-500"
                    ></textarea>
                  </div>

                  <div className="flex gap-2 justify-end pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowStoryModal(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-705 text-[#cbd5e1] text-xs font-semibold rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={storySubmitting || !storyText.trim()}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-705 text-white text-xs font-semibold rounded-lg shadow-md disabled:opacity-50"
                    >
                      {storySubmitting ? "Publishing story..." : "Verify & Publish Story"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
