import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Play, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  ArrowLeft, 
  Sparkles, 
  Code, 
  GitFork, 
  Check, 
  Copy, 
  FileDown, 
  AlertCircle, 
  Award, 
  Activity, 
  ChevronRight, 
  Plus, 
  Heart, 
  User, 
  Users, 
  Brain, 
  Trash2, 
  MessageSquare,
  HelpCircle,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { predefinedScenarios } from "./predefinedScenarios";
import { Scenario, ScenarioNode, Choice, EmotionType, NodeType } from "./types";

interface VoiceProfile {
  id: string;
  name: string;
  description: string;
  pitchMultiplier: number;
  rateMultiplier: number;
  gender: "female" | "male" | "neutral";
}

const VOICE_PROFILES: VoiceProfile[] = [
  {
    id: "melisa",
    name: "Melisa (Duyarlı & Terapötik - Tiz)",
    description: "Sıcak, empatik, oldukça ince (tiz) ve destekleyici bir kadın sesi tonu.",
    pitchMultiplier: 1.45,
    rateMultiplier: 0.90,
    gender: "female"
  },
  {
    id: "can",
    name: "Can (Sakin & Kalın/Pes)",
    description: "Kalın, tok, sakin, derin ve güven veren bir erkek sesi tonu.",
    pitchMultiplier: 0.65,
    rateMultiplier: 0.85,
    gender: "male"
  },
  {
    id: "selin",
    name: "Selin (Net & Bilgilendirici)",
    description: "Açık, anlaşılır, net, orta frekansta profesyonel bir eğitici sesi.",
    pitchMultiplier: 1.10,
    rateMultiplier: 1.05,
    gender: "female"
  },
  {
    id: "deniz",
    name: "Deniz (Çok Tiz & Hızlı)",
    description: "Çok hızlı, aşırı yüksek/tiz frekansta ve enerjik bir genç sesi.",
    pitchMultiplier: 1.85,
    rateMultiplier: 1.30,
    gender: "neutral"
  },
  {
    id: "ege",
    name: "Ege (Çok Derin & Bilge)",
    description: "Son derece yavaş, bilge, çok kalın ve akademik bir erkek sesi.",
    pitchMultiplier: 0.45,
    rateMultiplier: 0.70,
    gender: "male"
  }
];

export default function App() {
  // State definitions
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeScenarioIndex, setActiveScenarioIndex] = useState<number>(0);
  const [currentNodeId, setCurrentNodeId] = useState<string>("START");
  const [history, setHistory] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"simulator" | "visualizer" | "ai-generator" | "json-editor">("simulator");
  
  // Audio state
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState<boolean>(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");
  const [selectedProfileId, setSelectedProfileId] = useState<string>("melisa");
  const [onlyTurkishVoices, setOnlyTurkishVoices] = useState<boolean>(true);

  // Filter voices based on language selection
  const filteredVoices = useMemo(() => {
    if (onlyTurkishVoices) {
      const trVoices = voices.filter(v => v.lang.toLowerCase().includes("tr"));
      return trVoices.length > 0 ? trVoices : voices;
    }
    return voices;
  }, [voices, onlyTurkishVoices]);
  
  // Custom voice manual adjustment states
  const [customPitch, setCustomPitch] = useState<number>(1.0);
  const [customRate, setCustomRate] = useState<number>(1.0);
  const [customVolume, setCustomVolume] = useState<number>(1.0);
  
  // JSON Editor state
  const [jsonInput, setJsonInput] = useState<string>("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // AI Generator state
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [aiGenerating, setAiGenerating] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);

  // Audio synthesis ref to allow canceling
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load scenarios from predefined list + localStorage on boot
  useEffect(() => {
    const saved = localStorage.getItem("custom_therapeutic_scenarios");
    let parsedSaved: Scenario[] = [];
    if (saved) {
      try {
        parsedSaved = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved custom scenarios:", e);
      }
    }
    const allScenarios = [...predefinedScenarios, ...parsedSaved];
    setScenarios(allScenarios);
    
    // Check if Gemini API key is configured on server
    fetch("/api/config")
      .then(res => res.json())
      .then(data => {
        setHasApiKey(data.hasApiKey);
      })
      .catch(() => {
        setHasApiKey(false);
      });
  }, []);

  // Initialize browser speech synthesis and load available voices
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        const allVoices = window.speechSynthesis.getVoices();
        // Keep all voices in the state
        setVoices(allVoices);
        
        const trVoices = allVoices.filter(v => v.lang.toLowerCase().includes("tr"));
        if (trVoices.length > 0) {
          setSelectedVoiceName(prev => prev || trVoices[0].name);
        } else if (allVoices.length > 0) {
          setSelectedVoiceName(prev => prev || allVoices[0].name);
        }
      };
      
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Sync JSON editor input whenever the active scenario changes
  useEffect(() => {
    if (scenarios[activeScenarioIndex]) {
      setJsonInput(JSON.stringify(scenarios[activeScenarioIndex], null, 2));
      setJsonError(null);
    }
  }, [activeScenarioIndex, scenarios]);

  const activeScenario = scenarios[activeScenarioIndex];
  const currentNode = activeScenario?.nodes.find(n => n.id === currentNodeId) || activeScenario?.nodes[0];

  // Stop sound if tab changes or node changes
  useEffect(() => {
    stopVoice();
  }, [currentNodeId, activeScenarioIndex, activeTab]);

  // Auto-play audio when node changes
  useEffect(() => {
    if (autoPlayAudio && currentNode && activeTab === "simulator") {
      const timer = setTimeout(() => {
        playVoice();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentNodeId, activeScenarioIndex]);

  // Handle Speech Synthesis
  const playVoice = () => {
    if (!synthRef.current || !currentNode) return;
    
    synthRef.current.cancel(); // Cancel any current speech
    
    // Clean text from bracketed stage directions e.g. [Öfkeyle söyler]
    const textToSpeak = currentNode.text.replace(/\[.*?\]/g, "").trim();
    if (!textToSpeak) return;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "tr-TR";

    // Set voice from voices list if selected
    if (selectedVoiceName && voices.length > 0) {
      const activeVoice = voices.find(v => v.name === selectedVoiceName);
      if (activeVoice) {
        utterance.voice = activeVoice;
      }
    }

    // Adjust rate and pitch dynamically based on speaker role and emotion (ElevenLabs simulation)
    const speaker = currentNode.speaker.toLowerCase();
    const emotion = currentNode.emotion;

    let basePitch = 1.0;
    let baseRate = 0.95;

    if (speaker.includes("anlatıcı") || speaker.includes("dış ses")) {
      // Deeper, professional, slightly slower narrator voice
      basePitch = 0.9;
      baseRate = 0.85;
    } else if (speaker.includes("sağlık profesyoneli") || speaker.includes("hekim") || speaker.includes("hemşire") || speaker.includes("doktor")) {
      // Reassuring, clear tone for healthcare professional
      basePitch = 1.05;
      baseRate = 0.95;
    } else {
      // Patient or Relative (highly emotional!)
      switch (emotion) {
        case "angry":
          basePitch = 1.15;
          baseRate = 1.2; // Speak faster and higher pitch when angry
          break;
        case "fearful":
        case "worried":
          basePitch = 1.2;
          baseRate = 1.05; // High-pitched, nervous rate
          break;
        case "sad":
          basePitch = 0.85;
          baseRate = 0.75; // Slower, lower pitch for sadness
          break;
        case "empathetic":
        case "reassuring":
          basePitch = 1.0;
          baseRate = 0.85; // Calmer and softer
          break;
        default:
          basePitch = 1.0;
          baseRate = 0.9;
      }
    }

    // Apply voice profile multipliers
    const activeProfile = VOICE_PROFILES.find(p => p.id === selectedProfileId);
    if (activeProfile) {
      basePitch *= activeProfile.pitchMultiplier;
      baseRate *= activeProfile.rateMultiplier;
    }

    // Apply custom sliders multipliers
    basePitch *= customPitch;
    baseRate *= customRate;

    // Clamp values to valid speech synthesis bounds
    utterance.pitch = Math.max(0.5, Math.min(2.0, basePitch));
    utterance.rate = Math.max(0.5, Math.min(2.0, baseRate));
    utterance.volume = customVolume;

    utterance.onstart = () => setAudioPlaying(true);
    utterance.onend = () => setAudioPlaying(false);
    utterance.onerror = () => setAudioPlaying(false);

    currentUtteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const testVoiceSettings = () => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    const testText = "Merhaba! Seçtiğiniz ses profili, ses perdesi ve konuşma hızı ayarları şu anda başarıyla uygulandı.";
    const utterance = new SpeechSynthesisUtterance(testText);
    utterance.lang = "tr-TR";

    if (selectedVoiceName && voices.length > 0) {
      const activeVoice = voices.find(v => v.name === selectedVoiceName);
      if (activeVoice) {
        utterance.voice = activeVoice;
      }
    }

    let basePitch = 1.0;
    let baseRate = 0.95;

    const activeProfile = VOICE_PROFILES.find(p => p.id === selectedProfileId);
    if (activeProfile) {
      basePitch *= activeProfile.pitchMultiplier;
      baseRate *= activeProfile.rateMultiplier;
    }

    basePitch *= customPitch;
    baseRate *= customRate;

    utterance.pitch = Math.max(0.5, Math.min(2.0, basePitch));
    utterance.rate = Math.max(0.5, Math.min(2.0, baseRate));
    utterance.volume = customVolume;

    utterance.onstart = () => setAudioPlaying(true);
    utterance.onend = () => setAudioPlaying(false);
    utterance.onerror = () => setAudioPlaying(false);

    currentUtteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const stopVoice = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setAudioPlaying(false);
  };

  // Navigating nodes
  const handleChoiceSelect = (nextNodeId: string) => {
    setHistory([...history, currentNodeId]);
    setCurrentNodeId(nextNodeId);
  };

  const handleGoBack = () => {
    if (history.length > 0) {
      const prevId = history[history.length - 1];
      setCurrentNodeId(prevId);
      setHistory(history.slice(0, -1));
    }
  };

  const handleRestart = () => {
    setCurrentNodeId("START");
    setHistory([]);
  };

  // Delete custom scenario
  const handleDeleteScenario = (indexToDelete: number) => {
    const isPredefined = indexToDelete < predefinedScenarios.length;
    if (isPredefined) {
      alert("Hazır gelen varsayılan senaryoları silemezsiniz.");
      return;
    }
    
    if (confirm("Bu senaryoyu silmek istediğinize emin misiniz?")) {
      const saved = localStorage.getItem("custom_therapeutic_scenarios");
      let parsedSaved: Scenario[] = [];
      if (saved) {
        parsedSaved = JSON.parse(saved);
      }
      
      const indexInSaved = indexToDelete - predefinedScenarios.length;
      parsedSaved.splice(indexInSaved, 1);
      
      localStorage.setItem("custom_therapeutic_scenarios", JSON.stringify(parsedSaved));
      
      const newAllScenarios = [...predefinedScenarios, ...parsedSaved];
      setScenarios(newAllScenarios);
      setActiveScenarioIndex(0);
      setCurrentNodeId("START");
      setHistory([]);
    }
  };

  // Live validation of raw JSON input
  const handleJsonChange = (val: string) => {
    setJsonInput(val);
    try {
      const parsed = JSON.parse(val);
      
      // Basic structure validation
      if (!parsed.scenario_title || !parsed.nodes || !Array.isArray(parsed.nodes)) {
        setJsonError("Eksik alan: 'scenario_title' ve 'nodes' dizisi zorunludur.");
        return;
      }
      
      for (let i = 0; i < parsed.nodes.length; i++) {
        const n = parsed.nodes[i];
        if (!n.id || !n.speaker || !n.text || !n.emotion || !n.node_type) {
          setJsonError(`Düğüm #${i + 1} eksik alan içeriyor (id, speaker, text, emotion, node_type zorunludur).`);
          return;
        }
      }
      
      setJsonError(null);
    } catch (e: any) {
      setJsonError(`Geçersiz JSON formatı: ${e.message}`);
    }
  };

  // Save the edited JSON back into the scenario lists
  const handleSaveJson = () => {
    if (jsonError) {
      alert("Lütfen kaydetmeden önce JSON hatalarını düzeltin.");
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput) as Scenario;
      const isPredefined = activeScenarioIndex < predefinedScenarios.length;

      const saved = localStorage.getItem("custom_therapeutic_scenarios");
      let parsedSaved: Scenario[] = [];
      if (saved) {
        parsedSaved = JSON.parse(saved);
      }

      if (isPredefined) {
        // Since we can't overwrite code predefinedScenarios directly, we save it as a NEW custom scenario or edit clone
        const newTitle = `${parsed.scenario_title} (Özelleştirilmiş)`;
        parsed.scenario_title = newTitle;
        parsedSaved.push(parsed);
        localStorage.setItem("custom_therapeutic_scenarios", JSON.stringify(parsedSaved));
        
        const updated = [...predefinedScenarios, ...parsedSaved];
        setScenarios(updated);
        setActiveScenarioIndex(updated.length - 1);
        alert("Hazır senaryo düzenlendi ve 'Özelleştirilmiş' olarak yeni bir özel senaryo olarak kaydedildi!");
      } else {
        // Edit existing custom scenario
        const indexInSaved = activeScenarioIndex - predefinedScenarios.length;
        parsedSaved[indexInSaved] = parsed;
        localStorage.setItem("custom_therapeutic_scenarios", JSON.stringify(parsedSaved));
        
        const updated = [...predefinedScenarios, ...parsedSaved];
        setScenarios(updated);
        alert("Senaryo başarıyla güncellendi!");
      }
      
      setCurrentNodeId("START");
      setHistory([]);
    } catch (e: any) {
      alert(`Hata oluştu: ${e.message}`);
    }
  };

  // Create a brand new empty custom scenario template
  const handleCreateEmptyScenario = () => {
    const empty: Scenario = {
      scenario_title: "Yeni Terapötik Senaryo",
      target_audience: "Sağlık Bilimleri Öğrencileri",
      nodes: [
        {
          id: "START",
          speaker: "Anlatıcı",
          text: "Senaryonun başlangıç betimlemesini buraya yazın. ElevenLabs sesine tam uyumludur...",
          emotion: "neutral",
          node_type: "intro",
          choices: [
            {
              text: "Empatik Seçenek: Hastanın durumunu anlayışla karşıla.",
              next_node_id: "EMPATIK_1"
            },
            {
              text: "Görev Odaklı Seçenek: Direkt işleme geç.",
              next_node_id: "SON_MEKANIK"
            }
          ]
        },
        {
          id: "EMPATIK_1",
          speaker: "Hasta",
          text: "Çok korkuyorum, bana ne yapacaksınız? Acıyacak mı?",
          emotion: "worried",
          node_type: "choice_point",
          choices: [
            {
              text: "Reassuring: 'Korkmanızı çok iyi anlıyorum. İşlemin her anında yanınızda olacağım.'",
              next_node_id: "SON_BAŞARILI"
            }
          ]
        },
        {
          id: "SON_BAŞARILI",
          speaker: "Anlatıcı",
          text: "Mükemmel! Hastanın anksiyetesini başarıyla dindirdiniz.",
          emotion: "reassuring",
          node_type: "end_node",
          score_impact: "Yüksek Başarı (+8/8)",
          choices: []
        },
        {
          id: "SON_MEKANIK",
          speaker: "Anlatıcı",
          text: "Hasta işlemleri mekanik olarak kabul etti ama içi çok rahat değil.",
          emotion: "sad",
          node_type: "end_node",
          score_impact: "Orta Başarı (4/8)",
          choices: []
        }
      ]
    };

    const saved = localStorage.getItem("custom_therapeutic_scenarios");
    let parsedSaved: Scenario[] = [];
    if (saved) {
      parsedSaved = JSON.parse(saved);
    }
    parsedSaved.push(empty);
    localStorage.setItem("custom_therapeutic_scenarios", JSON.stringify(parsedSaved));

    const updated = [...predefinedScenarios, ...parsedSaved];
    setScenarios(updated);
    setActiveScenarioIndex(updated.length - 1);
    setCurrentNodeId("START");
    setHistory([]);
    setActiveTab("json-editor");
  };

  // One-click clipboard copy
  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonInput);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // JSON Downloader
  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonInput);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    
    const filename = `${activeScenario.scenario_title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_scenario.json`;
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Generate Scenario via server-side Gemini API
  const handleGenerateScenario = async () => {
    if (!aiPrompt.trim()) return;
    
    setAiGenerating(true);
    setAiError(null);

    try {
      const response = await fetch("/api/generate-scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.details || "Senaryo üretimi başarısız oldu.");
      }

      // Save generated scenario directly in local storage
      const saved = localStorage.getItem("custom_therapeutic_scenarios");
      let parsedSaved: Scenario[] = [];
      if (saved) {
        parsedSaved = JSON.parse(saved);
      }
      parsedSaved.push(data);
      localStorage.setItem("custom_therapeutic_scenarios", JSON.stringify(parsedSaved));

      const updated = [...predefinedScenarios, ...parsedSaved];
      setScenarios(updated);
      setActiveScenarioIndex(updated.length - 1);
      setCurrentNodeId("START");
      setHistory([]);
      
      setAiPrompt("");
      setActiveTab("simulator");
      alert(`"${data.scenario_title}" başarıyla üretildi ve simülatöre yüklendi!`);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Bilinmeyen bir yapay zeka hatası meydana geldi.");
    } finally {
      setAiGenerating(false);
    }
  };

  // Helpers for UI display
  const getEmotionEmoji = (emo: EmotionType) => {
    switch (emo) {
      case "neutral": return "😐";
      case "empathetic": return "🫂";
      case "fearful": return "😨";
      case "angry": return "😠";
      case "defensive": return "🛡️";
      case "cheerful": return "😊";
      case "worried": return "🥺";
      case "sad": return "😢";
      case "reassuring": return "🩺";
      default: return "💬";
    }
  };

  const getEmotionLabelTr = (emo: EmotionType) => {
    switch (emo) {
      case "neutral": return "Nötr";
      case "empathetic": return "Empatik";
      case "fearful": return "Korkmuş";
      case "angry": return "Öfkeli";
      case "defensive": return "Savunmacı";
      case "cheerful": return "Neşeli";
      case "worried": return "Kaygılı/Endişeli";
      case "sad": return "Üzgün";
      case "reassuring": return "Güven Verici";
      default: return emo;
    }
  };

  const getSpeakerStyle = (speaker: string) => {
    const sp = speaker.toLowerCase();
    if (sp.includes("anlatıcı") || sp.includes("dış ses")) {
      return {
        bg: "bg-slate-900/60",
        border: "border-slate-800",
        text: "text-slate-100",
        badge: "bg-slate-800 text-slate-300 border-slate-700",
        gradient: "from-slate-800 to-slate-900"
      };
    } else if (sp.includes("sağlık profesyoneli") || sp.includes("hekim") || sp.includes("hemşire") || sp.includes("doktor")) {
      return {
        bg: "bg-emerald-950/25",
        border: "border-emerald-500/20",
        text: "text-emerald-100",
        badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
        gradient: "from-emerald-600/80 to-teal-700/80"
      };
    } else {
      // Patient / Relative
      return {
        bg: "bg-rose-950/20",
        border: "border-rose-500/20",
        text: "text-rose-100",
        badge: "bg-rose-500/10 text-rose-300 border-rose-500/20",
        gradient: "from-rose-600/80 to-orange-600/80"
      };
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 flex flex-col">
      {/* Premium Header */}
      <header className="bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 py-4 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg shadow-indigo-500/15">
            <Heart className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-display font-bold tracking-tight text-white">
              Terapötik İletişim Simülatörü
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              ElevenLabs & Branched Dialogue Architect v1.2
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 border border-slate-850 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "simulator" 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Play className="w-4 h-4 text-indigo-400 group-hover:text-white" />
            Simülatör Oyna
          </button>
          
          <button
            onClick={() => setActiveTab("visualizer")}
            className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "visualizer" 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <GitFork className="w-4 h-4 text-indigo-400 group-hover:text-white" />
            Diyalog Ağacı
          </button>

          <button
            onClick={() => setActiveTab("ai-generator")}
            className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "ai-generator" 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400 group-hover:text-white" />
            Yapay Zeka ile Üret
          </button>

          <button
            onClick={() => setActiveTab("json-editor")}
            className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "json-editor" 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Code className="w-4 h-4 text-indigo-400 group-hover:text-white" />
            Saf JSON Editörü
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-6">
        
        {/* Sidebar: Scenario Selector & Metadata */}
        <aside className="w-full md:w-80 shrink-0 flex flex-col gap-5">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                <h3 className="text-xs font-display font-bold uppercase tracking-widest text-indigo-400">
                  Senaryo Seçici
                </h3>
              </div>
              <button
                onClick={handleCreateEmptyScenario}
                title="Sıfırdan Senaryo Oluştur"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors border border-slate-800"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {scenarios.map((sc, index) => (
                <div key={index} className="group relative">
                  <button
                    onClick={() => {
                      setActiveScenarioIndex(index);
                      setCurrentNodeId("START");
                      setHistory([]);
                    }}
                    className={`w-full text-left px-3.5 py-3 rounded-2xl border text-sm font-medium transition-all flex flex-col gap-1 pr-10 ${
                      activeScenarioIndex === index
                        ? "bg-indigo-500/10 border-indigo-500/50 text-white ring-2 ring-indigo-500/10"
                        : "bg-slate-950/40 border-slate-850 hover:bg-slate-800/50 text-slate-300 hover:text-white"
                    }`}
                  >
                    <span className="truncate block font-semibold leading-tight">
                      {sc.scenario_title || "Başlıksız Senaryo"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal truncate block uppercase tracking-wider">
                      {index < predefinedScenarios.length ? "Hazır Şablon" : "Özel Senaryo / AI"}
                    </span>
                  </button>

                  {index >= predefinedScenarios.length && (
                    <button
                      onClick={() => handleDeleteScenario(index)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Senaryoyu Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Active Scenario Insights */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-display font-bold uppercase tracking-widest text-slate-500">
              Klinik Kimlik & Hedef Kitle
            </h3>
            
            <div>
              <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-widest">SENARYO BAŞLIĞI</span>
              <p className="font-display font-bold text-white text-md mt-0.5 leading-tight">
                {activeScenario?.scenario_title}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-widest">HEDEF ÖĞRENCİ KİTLESİ</span>
              <p className="text-sm text-slate-300 mt-1">
                {activeScenario?.target_audience}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-widest mb-2">İLETİŞİM MODU REHBERİ</span>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/5 px-2.5 py-1.5 rounded-xl border border-emerald-500/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  Mod 1: Empatik & Açık Uçlu
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-amber-400 bg-amber-500/5 px-2.5 py-1.5 rounded-xl border border-amber-500/10">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  Mod 2: Görev Odaklı & Mekanik
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-rose-400 bg-rose-500/5 px-2.5 py-1.5 rounded-xl border border-rose-500/10">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  Mod 3: Yanlış Güvence / Kaçınan
                </div>
              </div>
            </div>
          </div>

          {/* ElevenLabs Ses Motoru Kontrolleri */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Volume2 className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-display font-bold uppercase tracking-widest text-indigo-400">
                  Ses Motoru & Özelleştirme
                </h3>
              </div>
            </div>
            
            {/* Voice Profile Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 block font-bold uppercase tracking-widest">
                AKTİF AI KARAKTERİ
              </label>
              <select
                value={selectedProfileId}
                onChange={(e) => {
                  setSelectedProfileId(e.target.value);
                  stopVoice();
                }}
                className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer"
              >
                {VOICE_PROFILES.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.name}
                  </option>
                ))}
              </select>
              <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-850">
                <p className="text-[11px] text-slate-400 leading-normal">
                  {VOICE_PROFILES.find(p => p.id === selectedProfileId)?.description}
                </p>
              </div>
            </div>

            {/* Advanced Multipliers Fine-Tuning */}
            <div className="space-y-3 pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  GELİŞMİŞ SES AYARLARI
                </label>
                <button
                  onClick={() => {
                    setCustomPitch(1.0);
                    setCustomRate(1.0);
                    setCustomVolume(1.0);
                  }}
                  className="text-[9px] text-indigo-400 hover:text-indigo-300 underline"
                >
                  Sıfırla
                </button>
              </div>

              {/* Pitch Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Ekstra Ses Perdesi (Pitch)</span>
                  <span className="font-mono text-indigo-400 font-bold">{customPitch.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={customPitch}
                  onChange={(e) => {
                    setCustomPitch(parseFloat(e.target.value));
                    stopVoice();
                  }}
                  className="w-full accent-indigo-500 bg-slate-950 h-1 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>Pes (0.5x)</span>
                  <span>Normal (1.0x)</span>
                  <span>Tiz (2.0x)</span>
                </div>
              </div>

              {/* Rate / Speed Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Konuşma Hızı (Speed/Rate)</span>
                  <span className="font-mono text-indigo-400 font-bold">{customRate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={customRate}
                  onChange={(e) => {
                    setCustomRate(parseFloat(e.target.value));
                    stopVoice();
                  }}
                  className="w-full accent-indigo-500 bg-slate-950 h-1 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>Yavaş (0.5x)</span>
                  <span>Normal (1.0x)</span>
                  <span>Hızlı (2.0x)</span>
                </div>
              </div>

              {/* Volume Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Ses Seviyesi (Volume)</span>
                  <span className="font-mono text-indigo-400 font-bold">{Math.round(customVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={customVolume}
                  onChange={(e) => {
                    setCustomVolume(parseFloat(e.target.value));
                    stopVoice();
                  }}
                  className="w-full accent-indigo-500 bg-slate-950 h-1 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Interactive Test Voice Button */}
              <button
                onClick={testVoiceSettings}
                className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl py-2 px-3 text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Seçili Sesi Test Et (Dinle)
              </button>
            </div>

            {/* Browser Speech Voice Selector (If multiple system voices exist) */}
            {voices.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-slate-500 block font-bold uppercase tracking-widest">
                    SES MOTORU (SİSTEM)
                  </label>
                  
                  {/* Language filter toggle */}
                  <label className="flex items-center gap-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={onlyTurkishVoices}
                      onChange={(e) => {
                        setOnlyTurkishVoices(e.target.checked);
                        stopVoice();
                      }}
                      className="rounded border-slate-800 bg-slate-950 text-indigo-500 focus:ring-0 focus:ring-offset-0 w-3 h-3 cursor-pointer"
                    />
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Sadece Türkçe</span>
                  </label>
                </div>

                <select
                  value={selectedVoiceName}
                  onChange={(e) => {
                    setSelectedVoiceName(e.target.value);
                    stopVoice();
                  }}
                  className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer"
                >
                  {filteredVoices.map((v, idx) => (
                    <option key={idx} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>

                <div className="bg-slate-950/30 p-2 rounded-xl border border-slate-850/50 space-y-1">
                  <p className="text-[10px] text-slate-400 leading-normal">
                    {onlyTurkishVoices ? (
                      <span>
                        <strong>Yerel TTS Sınırı:</strong> Cihazınızda genellikle tek bir Türkçe ses motoru yüklüdür. Bu yüzden profiller benzer tınlayabilir. 
                        Diğer dillerdeki (İngilizce, Fransızca, Japonca vb.) tamamen farklı ve gerçekçi hazır sesleri görmek için yukarıdaki <strong>"Sadece Türkçe"</strong> filtresini kapatabilirsiniz!
                      </span>
                    ) : (
                      <span>
                        <strong>Tüm Hazır Sesler Açık:</strong> Şu an cihazınızdaki tüm dillerin hazır sesleri listeleniyor. Yabancı dildeki sesler Türkçe kelimeleri sempatik bir aksanla seslendirecektir.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Content Panel */}
        <section className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            
            {/* 1. SIMULATOR PLAY TAB */}
            {activeTab === "simulator" && (
              <motion.div
                key="simulator-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 flex-1 flex flex-col justify-between"
              >
                {/* Simulator Card Container */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden flex-1 flex flex-col justify-between min-h-[500px]">
                  
                  {/* Card Header Status */}
                  <div className="bg-slate-950/60 border-b border-slate-850 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                      <span className="text-xs text-slate-400 font-mono uppercase tracking-widest font-bold">
                        AŞAMA: {currentNodeId}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {history.length > 0 && (
                        <button
                          onClick={handleGoBack}
                          className="px-3 py-1.5 bg-slate-800/40 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border border-slate-850"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          Geri Git
                        </button>
                      )}
                      
                      <button
                        onClick={handleRestart}
                        className="px-3 py-1.5 bg-slate-800/40 hover:bg-rose-950/30 text-rose-400 hover:text-rose-300 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border border-slate-850"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Sıfırla
                      </button>
                    </div>
                  </div>

                  {/* Character Arena & Statement */}
                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-center items-center gap-6">
                    {currentNode ? (
                      <div className="w-full max-w-2xl space-y-6">
                        
                        {/* Dynamic Speaker Avatar & Brand Info */}
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          
                          {/* Circle Avatar representation of speaker gradient background */}
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getSpeakerStyle(currentNode.speaker).gradient} shadow-lg flex items-center justify-center text-white text-3xl font-bold border-2 border-slate-800`}>
                            {getEmotionEmoji(currentNode.emotion)}
                          </div>

                          <div className="text-center sm:text-left space-y-1">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getSpeakerStyle(currentNode.speaker).badge}`}>
                              {currentNode.speaker}
                            </span>
                            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-2 gap-y-1 mt-1 text-xs text-slate-500">
                              <span className="font-bold tracking-wider uppercase text-[10px]">
                                ElevenLabs Duygusu:
                              </span>
                              <span className="font-mono bg-slate-950 text-indigo-400 px-1.5 py-0.5 rounded text-[10px] border border-slate-850">
                                {currentNode.emotion} ({getEmotionLabelTr(currentNode.emotion)})
                              </span>
                              <span className="font-bold tracking-wider uppercase text-[10px] sm:ml-2">
                                Ses Karakteri:
                              </span>
                              <span className="font-mono bg-slate-950 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] border border-slate-850">
                                {VOICE_PROFILES.find(p => p.id === selectedProfileId)?.name}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Speech Bubble text display */}
                        <div className={`p-6 md:p-8 rounded-3xl border ${getSpeakerStyle(currentNode.speaker).border} bg-slate-950/40 shadow-sm relative`}>
                          
                          {/* Tail for bubble on desktop */}
                          <div className={`hidden sm:block absolute left-7 -top-2 w-4 h-4 bg-slate-950 transform rotate-45 border-l border-t ${getSpeakerStyle(currentNode.speaker).border}`} />

                          <p className="text-slate-200 text-lg md:text-xl font-serif italic leading-relaxed select-text">
                            "{currentNode.text}"
                          </p>

                          {/* ElevenLabs Sound Player UI Widget */}
                          <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={audioPlaying ? stopVoice : playVoice}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                                  audioPlaying 
                                    ? "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20" 
                                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                }`}
                              >
                                {audioPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                {audioPlaying ? "Sesi Durdur" : "Sesli Dinle (ElevenLabs)"}
                              </button>

                              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-400 select-none">
                                <input 
                                  type="checkbox"
                                  checked={autoPlayAudio}
                                  onChange={(e) => setAutoPlayAudio(e.target.checked)}
                                  className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                                />
                                Otomatik Oyna
                              </label>
                            </div>

                            {/* CSS Soundwave Animation graphic */}
                            <div className="flex items-end gap-1 px-1 bg-slate-950/80 border border-slate-850 rounded-xl h-8 items-center justify-center w-20">
                              <span className={`w-1 rounded-full bg-indigo-500/80 ${audioPlaying ? "animate-wave" : "h-1"}`} style={{ animationDelay: "0.1s" }} />
                              <span className={`w-1 rounded-full bg-indigo-500/80 ${audioPlaying ? "animate-wave" : "h-1"}`} style={{ animationDelay: "0.4s" }} />
                              <span className={`w-1 rounded-full bg-indigo-500 ${audioPlaying ? "animate-wave" : "h-2"}`} style={{ animationDelay: "0.2s" }} />
                              <span className={`w-1 rounded-full bg-indigo-500/80 ${audioPlaying ? "animate-wave" : "h-1"}`} style={{ animationDelay: "0.6s" }} />
                              <span className={`w-1 rounded-full bg-indigo-500/80 ${audioPlaying ? "animate-wave" : "h-1"}`} style={{ animationDelay: "0.3s" }} />
                            </div>
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-60" />
                        <p>Senaryo düğümü bulunamadı.</p>
                      </div>
                    )}
                  </div>

                  {/* Choice Buttons or End-Of-Simulation Screen */}
                  <div className="p-6 md:p-8 bg-slate-950/60 border-t border-slate-850">
                    {currentNode && currentNode.node_type !== "end_node" ? (
                      <div className="space-y-4 max-w-3xl mx-auto">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-center sm:text-left">
                          Bir iletişim seçeneği belirleyin:
                        </span>
                        
                        <div className="grid grid-cols-1 gap-3">
                          {currentNode.choices && currentNode.choices.map((choice, idx) => {
                            // Assign tag color depending on position
                            const colors = [
                              "hover:border-indigo-500/50 hover:bg-indigo-500/5 border-slate-850 text-slate-200",
                              "hover:border-amber-500/50 hover:bg-amber-50/5 border-slate-850 text-slate-200",
                              "hover:border-rose-500/50 hover:bg-rose-50/5 border-slate-850 text-slate-200"
                            ];
                            const badgeColors = [
                              "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20",
                              "bg-amber-500/10 text-amber-300 border border-amber-500/20",
                              "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                            ];
                            const labels = ["A", "B", "C"];
                            
                            return (
                              <button
                                key={idx}
                                onClick={() => handleChoiceSelect(choice.next_node_id)}
                                className={`w-full text-left px-5 py-4 rounded-2xl border bg-slate-900/40 font-medium text-sm transition-all shadow-sm hover:shadow hover:scale-[1.005] flex items-start gap-4 cursor-pointer ${colors[idx % colors.length]}`}
                              >
                                <span className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs ${badgeColors[idx % badgeColors.length]}`}>
                                  {labels[idx % labels.length]}
                                </span>
                                <span className="leading-relaxed flex-1">
                                  {choice.text}
                                </span>
                                <ChevronRight className="w-4 h-4 text-slate-500 shrink-0 ml-auto self-center" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      // End Node layout
                      <div className="max-w-xl mx-auto text-center py-6 space-y-6">
                        <div className="inline-flex p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                          <Award className="w-12 h-12 animate-bounce" />
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="text-2xl font-display font-bold text-white tracking-tight">
                            Simülasyon Tamamlandı!
                          </h4>
                          {currentNode?.score_impact && (
                            <div className="inline-block px-4 py-2 bg-emerald-500/10 text-emerald-400 text-sm font-bold font-mono rounded-xl border border-emerald-500/25">
                              Kazanılan Skor: {currentNode.score_impact}
                            </div>
                          )}
                        </div>

                        <div className="p-5 bg-slate-950/50 border border-slate-850 rounded-2xl text-sm text-slate-300 leading-relaxed text-left space-y-3">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                            KLİNİK DOKTRİN DEĞERLENDİRMESİ:
                          </span>
                          <p className="leading-relaxed font-sans">{currentNode?.text}</p>
                        </div>

                        <button
                          onClick={handleRestart}
                          className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
                        >
                          <RotateCcw className="w-5 h-5" />
                          Simülasyonu Yeniden Başlat
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            )}

            {/* 2. DIAGRAM VISUALIZER TAB */}
            {activeTab === "visualizer" && (
              <motion.div
                key="visualizer-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div>
                    <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                      <GitFork className="w-5 h-5 text-indigo-400" />
                      Terapötik Dallanma Diyagramı
                    </h2>
                    <p className="text-xs text-slate-400">
                      Bu senaryodaki tüm diyalog düğümlerini, konuşmacıları, ElevenLabs duygularını ve bağlantılı yolları görselleştirin.
                    </p>
                  </div>
                </div>

                {/* Grid of Nodes in Dialogue Tree */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeScenario?.nodes.map((node) => {
                    const style = getSpeakerStyle(node.speaker);
                    return (
                      <div 
                        key={node.id} 
                        className={`border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all hover:shadow-lg ${
                          currentNodeId === node.id 
                            ? "border-indigo-500 bg-indigo-500/5 ring-2 ring-indigo-500/20" 
                            : "border-slate-850 bg-slate-950/45"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold bg-slate-900 text-slate-300 px-2.5 py-0.5 rounded-lg border border-slate-800">
                              ID: {node.id}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              node.node_type === "end_node" 
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                                : node.node_type === "intro" 
                                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                                  : "bg-slate-800 text-slate-300 border border-slate-750"
                            }`}>
                              {node.node_type}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-white">{node.speaker}</span>
                            <span className="text-[11px] text-slate-400">({getEmotionLabelTr(node.emotion)})</span>
                          </div>

                          <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed italic">
                            "{node.text}"
                          </p>
                        </div>

                        {/* Node connections */}
                        {node.choices && node.choices.length > 0 && (
                          <div className="pt-2.5 border-t border-slate-800 space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Dallanma Yolları:</span>
                            <div className="space-y-1">
                              {node.choices.map((ch, cidx) => (
                                <button
                                  key={cidx}
                                  onClick={() => {
                                    setCurrentNodeId(ch.next_node_id);
                                    setActiveTab("simulator");
                                  }}
                                  className="w-full text-left text-[11px] text-slate-400 hover:text-indigo-400 hover:bg-slate-900 p-1.5 rounded-lg transition-colors flex items-center justify-between"
                                >
                                  <span className="truncate max-w-[80%]">→ {ch.text}</span>
                                  <span className="font-mono bg-slate-900 text-[9px] px-1 rounded-md shrink-0 border border-slate-800">{ch.next_node_id}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {node.node_type === "end_node" && (
                          <div className="pt-2 bg-rose-950/20 p-2.5 rounded-xl border border-rose-900/40">
                            <span className="text-[10px] font-bold text-rose-400 block uppercase tracking-wider">Nihai Son Skor Etkisi:</span>
                            <span className="text-xs font-mono font-bold text-rose-300 block mt-0.5">{node.score_impact || "Nötr (0/8)"}</span>
                          </div>
                        )}

                        <div className="pt-2 flex justify-end border-t border-slate-850/50 mt-1">
                          <button
                            onClick={() => {
                              setCurrentNodeId(node.id);
                              setActiveTab("simulator");
                            }}
                            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                          >
                            Bu Düğümden Oyna
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* 3. AI SCENARIO GENERATOR TAB */}
            {activeTab === "ai-generator" && (
              <motion.div
                key="ai-generator-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6"
              >
                <div>
                  <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                    Klinik İletişim Uzmanı Yapay Zeka Jeneratörü
                  </h2>
                  <p className="text-xs text-slate-400">
                    Saniyeler içinde, çoklu sonlu, tamamen dallanan ve ElevenLabs ses motoruna tam uyumlu psikolojik terapötik iletişim senaryoları tasarlayın.
                  </p>
                </div>

                {/* API Key configuration hint */}
                {!hasApiKey && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 text-amber-300">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
                    <div className="text-xs space-y-2 leading-relaxed">
                      <p className="font-bold text-white">Yapay Zeka API Anahtarı Algılanamadı</p>
                      
                      <div className="space-y-1">
                        <p className="font-semibold text-amber-200">Nereye eklemelisiniz?</p>
                        <ul className="list-disc list-inside space-y-1 opacity-90">
                          <li><strong>AI Studio'da:</strong> Sağ üstteki <strong>Settings &gt; Secrets</strong> menüsüne <code>GEMINI_API_KEY</code> olarak ekleyin.</li>
                          <li><strong>Vercel'de:</strong> Project Settings &gt; <strong>Environment Variables</strong> kısmına <code>GEMINI_API_KEY</code> olarak ekleyin ve ardından <strong>Re-deploy</strong> yapın.</li>
                        </ul>
                      </div>

                      <p className="pt-1 text-amber-400/80 italic">
                        Not: Anahtarı ekledikten sonra sayfayı yenilemeyi unutmayın. Hazır şablonlar ve manuel editör her zaman kullanılabilir durumdadır.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
                      Senaryonun Teması veya Hasta Tanımı:
                    </label>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Örn: Kemoterapiyi reddeden onkoloji hastasıyla iletişim, veya çocuğunun aşısından korkan kaygılı bir anneyle görüşme..."
                      rows={4}
                      disabled={aiGenerating || !hasApiKey}
                      className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all disabled:opacity-50 font-sans"
                    />
                  </div>

                  {/* Suggestion templates */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-widest">Hızlı Şablon Önerileri:</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Ameliyat öncesi anksiyeteli, panik halindeki çocuk hasta ve ebeveyni ile iletişim",
                        "Tedavisini aksatan ve diyetine uymayan, savunmacı tip-2 diyabet hastası ile görüşme",
                        "Gebelik teşhisi almış ama istemeyen genç ve korkmuş bir hasta ile danışmanlık",
                        "Yoğun bakımda yakınını yeni kaybetmiş, hekimleri ihmalkarlıkla suçlayan öfkeli hasta yakını"
                      ].map((sug, sidx) => (
                        <button
                          key={sidx}
                          type="button"
                          disabled={aiGenerating || !hasApiKey}
                          onClick={() => setAiPrompt(sug)}
                          className="px-3 py-1.5 bg-slate-950/50 hover:bg-slate-800/80 disabled:opacity-50 text-slate-300 rounded-xl text-xs font-medium border border-slate-800 transition-all text-left cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={handleGenerateScenario}
                      disabled={aiGenerating || !aiPrompt.trim() || !hasApiKey}
                      className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {aiGenerating ? (
                        <>
                          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Yapay Zeka Ağacı Dallandırıyor...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Yapay Zeka ile Senaryo Ağacı Üret
                        </>
                      )}
                    </button>
                  </div>

                  {aiError && (
                    <div className="bg-rose-950/20 border border-rose-900/40 rounded-2xl p-4 text-xs text-rose-400 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                      <p>{aiError}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 4. RAW JSON EDITOR TAB */}
            {activeTab === "json-editor" && (
              <motion.div
                key="json-editor-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6 flex-1 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  
                  {/* Title & Top copy bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                    <div>
                      <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                        <Code className="w-5 h-5 text-indigo-400" />
                        Saf, Geçerli JSON Çıktısı (ElevenLabs Uyumlu)
                      </h2>
                      <p className="text-xs text-slate-400">
                        Aşağıdaki JSON ağacı, ElevenLabs ses analizörü ile tamamen uyumludur. Doğrudan kopyalayabilir, indirebilir veya düzenleyip kaydedebilirsiniz.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyJson}
                        className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        {copySuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        {copySuccess ? "Kopyalandı!" : "Tek Tıkla Kopyala"}
                      </button>

                      <button
                        onClick={handleDownloadJson}
                        className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileDown className="w-4 h-4" />
                        İndir (.json)
                      </button>
                    </div>
                  </div>

                  {/* Schema Validation States */}
                  {jsonError ? (
                    <div className="bg-rose-950/20 border border-rose-900/40 text-rose-400 rounded-2xl p-4 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <p className="font-medium">JSON Şema Hatası: {jsonError}</p>
                    </div>
                  ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl p-4 text-xs flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                      <p className="font-medium">JSON Yapısı Geçerli ve ElevenLabs Şemasına Tam Uyumludur!</p>
                    </div>
                  )}

                  {/* Textarea Editor */}
                  <div className="relative">
                    <textarea
                      value={jsonInput}
                      onChange={(e) => handleJsonChange(e.target.value)}
                      rows={20}
                      className="w-full bg-slate-950 text-indigo-400 font-mono text-xs rounded-2xl p-5 border border-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    
                    <span className="absolute bottom-4 right-4 text-[10px] text-slate-500 font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      UTF-8 | Turkish Compatibility
                    </span>
                  </div>

                </div>

                <div className="pt-5 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    İstediğiniz zaman bir senaryo JSON yapısı yapıştırarak simülatörde anında deneyimleyebilirsiniz.
                  </div>
                  
                  <button
                    onClick={handleSaveJson}
                    disabled={!!jsonError}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Değişiklikleri Kaydet & Simülatöre Yükle
                  </button>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </section>

      </main>

      {/* Footer Branding */}
      <footer className="bg-slate-950 border-t border-slate-900 mt-12 py-6 px-6 text-center text-xs text-slate-500">
        <p>© 2026 Terapötik İletişim Simülatörü. Klinik İletişim Psikolojisi ve Sağlıkta Öğretim Tasarımı Akademisi.</p>
        <p className="mt-1 font-mono text-[10px]">Tüm veriler tarayıcı önbelleğinde durumsal olarak saklanır. ElevenLabs ses entegrasyonu simüle edilmiştir.</p>
      </footer>
    </div>
  );
}
