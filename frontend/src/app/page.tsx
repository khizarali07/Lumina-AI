"use client";
import { useState, useRef, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [voiceView, setVoiceView] = useState("clone");
  const [voice, setVoice] = useState("omnivoice-hq");
  const [availableVoices, setAvailableVoices] = useState<string[]>([]);
  
  // Pipeline state
  const [isGenerating, setIsGenerating] = useState(false);
  const [pipelineStatus, setPipelineStatus] = useState<number>(0);
  const [topic, setTopic] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [previewAudioUrl, setPreviewAudioUrl] = useState("");
  const [targetDuration, setTargetDuration] = useState(30);

  const fetchVoices = async (newVoiceId?: string) => {
    try {
      const res = await fetch("http://localhost:8000/api/voices");
      const data = await res.json();
      if (data.voices && data.voices.length > 0) {
        setAvailableVoices(data.voices);
        if (newVoiceId && data.voices.includes(newVoiceId)) {
          setVoice(newVoiceId);
        } else if (!voice || voice === "omnivoice-hq") {
          setVoice(data.voices[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load voices", err);
    }
  };

  // Fetch available voices on load
  useEffect(() => {
    fetchVoices();
  }, []);

  // Clone Voice State
  const [cloneVoiceName, setCloneVoiceName] = useState("");
  const [cloneText, setCloneText] = useState("");
  const [cloneAudioFile, setCloneAudioFile] = useState<File | null>(null);
  const [clonePreviewAudioUrl, setClonePreviewAudioUrl] = useState("");

  // Design Voice State
  const [designVoiceName, setDesignVoiceName] = useState("");
  const [designText, setDesignText] = useState("");
  const [designGender, setDesignGender] = useState("female");
  const [designAge, setDesignAge] = useState("young");
  const [designPitch, setDesignPitch] = useState("medium");
  const [designAccent, setDesignAccent] = useState("neutral");
  const [designStyle, setDesignStyle] = useState("studio");
  const [designSpeed, setDesignSpeed] = useState(1.0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateVideo = async () => {
    if (!topic) {
      toast.error("Please enter a topic/script idea!");
      return;
    }
    setIsGenerating(true);
    setPipelineStatus(1);
    
    // Setup dummy pipeline progression
    const timers = [
      setTimeout(() => setPipelineStatus(2), 2000),
      setTimeout(() => setPipelineStatus(3), 6000),
      setTimeout(() => setPipelineStatus(4), 22000),
      setTimeout(() => setPipelineStatus(5), 35000)
    ];

    try {
      const res = await fetch("http://localhost:8000/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, voice_id: voice, visual_style: "sdxl-cinematic", subtitle_font: "montserrat-bold", target_duration: targetDuration })
      });
      const data = await res.json();
      if (data.success) {
        setVideoUrl(data.video_url);
        toast.success("Video generated successfully!");
        setPipelineStatus(6);
      } else {
        toast.error("Failed to generate video.");
        setPipelineStatus(0);
      }
    } catch (e) {
      toast.error("Error connecting to backend.");
      setPipelineStatus(0);
      timers.forEach(clearTimeout);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewClone = async () => {
    if (!cloneVoiceName || !cloneText) {
      toast.error("Please enter voice name and synthesis text.");
      return;
    }
    const loadToast = toast.loading("Generating preview...");
    try {
      const res = await fetch("http://localhost:8000/api/preview-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voice_name: cloneVoiceName,
          synthesis_text: cloneText,
          gender: "male",
          perceived_age: "young",
          vocal_pitch: "medium",
          accent: "neutral",
          acoustic_style_hint: "studio",
          synthesis_speed: 1.0
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Preview generated! Listen below.", { id: loadToast });
        setClonePreviewAudioUrl(`http://localhost:8000${data.preview_url}?t=${Date.now()}`);
      } else {
        toast.error("Failed to generate preview", { id: loadToast });
      }
    } catch (e) {
      toast.error("Error connecting to backend.", { id: loadToast });
    }
  };

  const handleCloneVoice = async () => {
    if (!cloneVoiceName || !cloneText || !cloneAudioFile) {
      toast.error("Please fill in all fields and upload reference audio.");
      return;
    }
    const formData = new FormData();
    formData.append("voice_name", cloneVoiceName);
    formData.append("synthesis_text", cloneText);
    formData.append("reference_audio", cloneAudioFile);

    const loadToast = toast.loading("Saving cloned voice...");
    try {
      const res = await fetch("http://localhost:8000/api/clone-voice", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message, { id: loadToast });
        fetchVoices(data.voice_id);
      } else {
        toast.error("Failed to save voice", { id: loadToast });
      }
    } catch (e) {
      toast.error("Error connecting to backend.", { id: loadToast });
    }
  };

  const handlePreviewVoice = async () => {
    if (!designVoiceName || !designText) {
      toast.error("Please enter voice name and synthesis text.");
      return;
    }
    const loadToast = toast.loading("Generating preview...");
    try {
      const res = await fetch("http://localhost:8000/api/preview-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voice_name: designVoiceName,
          synthesis_text: designText,
          gender: designGender,
          perceived_age: designAge,
          vocal_pitch: designPitch,
          accent: designAccent,
          acoustic_style_hint: designStyle,
          synthesis_speed: designSpeed
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Preview generated! Listen below.", { id: loadToast });
        setPreviewAudioUrl(`http://localhost:8000${data.preview_url}?t=${Date.now()}`);
      } else {
        toast.error("Failed to generate preview", { id: loadToast });
      }
    } catch (e) {
      toast.error("Error connecting to backend.", { id: loadToast });
    }
  };

  const handleDesignVoice = async () => {
    if (!designVoiceName || !designText) {
      toast.error("Please enter voice name and synthesis text.");
      return;
    }
    const loadToast = toast.loading("Saving voice...");
    try {
      const res = await fetch("http://localhost:8000/api/design-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voice_name: designVoiceName,
          synthesis_text: designText,
          gender: designGender,
          perceived_age: designAge,
          vocal_pitch: designPitch,
          accent: designAccent,
          acoustic_style_hint: designStyle,
          synthesis_speed: designSpeed
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message, { id: loadToast });
        fetchVoices(data.voice_id);
      } else {
        toast.error("Failed to save voice", { id: loadToast });
      }
    } catch (e) {
      toast.error("Error connecting to backend.", { id: loadToast });
    }
  };
  return (
    <div className="min-h-screen">
      <Toaster position="bottom-right" />
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-desktop h-20 bg-surface-container/60 dark:bg-surface-container/60 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="text-headline-md font-headline-md font-bold tracking-tighter text-primary dark:text-primary">
            Lumina AI
          </div>
          <ul className="hidden md:flex items-center gap-6">
            <li>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`${activeTab === 'dashboard' ? 'text-primary border-b-2 border-primary pb-1 opacity-80 scale-95 transition-all' : 'text-on-surface-variant hover:text-primary transition-colors duration-200'} font-bold text-label-caps font-label-caps`}
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('voices')}
                className={`${activeTab === 'voices' ? 'text-primary border-b-2 border-primary pb-1 opacity-80 scale-95 transition-all' : 'text-on-surface-variant hover:text-primary transition-colors duration-200'} font-bold text-label-caps font-label-caps`}
              >
                Voices
              </button>
            </li>
            <li>
              <button
                className="text-on-surface-variant font-medium text-label-caps font-label-caps hover:text-primary transition-colors duration-200"
              >
                Billing
              </button>
            </li>
          </ul>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-on-surface-variant hover:text-primary transition-colors duration-200">
            <span
              className="material-symbols-outlined text-[20px]"
              data-icon="notifications"
            >
              notifications
            </span>
          </button>
          <button className="text-label-caps font-label-caps text-on-surface-variant hover:text-primary transition-colors duration-200">
            Support
          </button>
          <div className="w-8 h-8 rounded-full bg-surface-variant overflow-hidden border border-outline-variant/30">
            <img
              alt="User profile settings"
              className="w-full h-full object-cover"
              data-alt="A close-up headshot of a professional individual against a neutral background. The lighting is soft and studio-quality, emphasizing a modern corporate aesthetic. The subject appears confident, fitting the sophisticated, technical brand personality of an automated video production SaaS environment."
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3OkZSkn6RLQBkroOPfWETKU07LVRzW8vDIqIPMmdotkkKeXtvUFYLxMgM9KatDcCsdxryvbBWW28S5z0BX0N5joWfIzN3imOrSxsyXj2x-EH2y74FKLV7JUqvBe_WcYlv0hrpjK4cLs3jzYGkXKn4ZAj764FR3Q9iX3uHrKbYTjPCbJV_IIrMFwStDJ9tHlwSOSsUuM3BqzrupUj09RTBiwEQU0-xDsjGN1469LOzduZw8VNmaCJT5GCSE1wdEACFN2RWcGpdKC8"
            />
          </div>
        </div>
      </nav>

      <main className="pt-[104px] pb-12 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        {activeTab === 'dashboard' && (
          <>
            <header className="mb-8">
              <h1 className="text-headline-lg font-headline-lg text-on-background mb-2">
                Faceless Video Generation
              </h1>
              <p className="text-body-lg font-body-lg text-on-surface-variant">
                Configure your pipeline to synthesize narrative-driven shorts.
              </p>
            </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="glass-panel rounded-xl p-6 border border-surface-container-highest">
              <label
                className="block text-body-sm font-body-sm font-semibold text-on-surface mb-2"
                htmlFor="script-topic"
              >
                Topic/Script Idea
              </label>
              <textarea
                className="w-full bg-surface-dim border border-outline-variant rounded-lg p-3 text-body-sm font-body-sm text-on-background focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant/50"
                id="script-topic"
                placeholder="e.g., Explain the concept of quantum entanglement using an analogy of two spinning coins..."
                rows={4}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="glass-panel rounded-xl p-6 border border-surface-container-highest grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-label-caps font-label-caps text-on-surface-variant mb-2">
                  Voice Selection
                </label>
                <select
                  className="w-full bg-surface-dim border border-outline-variant rounded-lg p-2.5 text-body-sm font-body-sm text-on-background focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none cursor-pointer focus:bg-surface-container-highest"
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                >
                  {availableVoices.length > 0 ? (
                    availableVoices.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No voices saved yet</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-label-caps font-label-caps text-on-surface-variant mb-2">
                  Visual Style
                </label>
                <select
                  className="w-full bg-surface-dim border border-outline-variant rounded-lg p-2.5 text-body-sm font-body-sm text-on-background focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none cursor-pointer focus:bg-surface-container-highest"
                  defaultValue="sdxl-cinematic"
                >
                  <option value="sdxl-cinematic">SDXL Cinematic</option>
                  <option value="midjourney-v6">MJv6 Photoreal</option>
                  <option value="anime-core">Anime Core</option>
                </select>
              </div>
              <div>
                <label className="block text-label-caps font-label-caps text-on-surface-variant mb-2">
                  Target Duration
                </label>
                <select
                  className="w-full bg-surface-dim border border-outline-variant rounded-lg p-2.5 text-body-sm font-body-sm text-on-background focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none cursor-pointer focus:bg-surface-container-highest"
                  value={targetDuration}
                  onChange={(e) => setTargetDuration(parseInt(e.target.value))}
                >
                  <option value={15}>15 Seconds</option>
                  <option value={30}>30 Seconds</option>
                  <option value={45}>45 Seconds</option>
                  <option value={60}>60 Seconds</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-label-caps font-label-caps text-on-surface-variant mb-2">
                  Subtitle Font
                </label>
                <select
                  className="w-full bg-surface-dim border border-outline-variant rounded-lg p-2.5 text-body-sm font-body-sm text-on-background focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none cursor-pointer focus:bg-surface-container-highest"
                  defaultValue="montserrat-bold"
                >
                  <option value="montserrat-bold">Montserrat Bold (Dynamic)</option>
                  <option value="bebas-neue">Bebas Neue (Impact)</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleGenerateVideo}
              disabled={isGenerating}
              className={`btn-primary w-full py-4 rounded-lg flex items-center justify-center gap-2 text-on-primary text-body-lg font-body-lg font-bold tracking-wide ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isGenerating ? (
                <span className="material-symbols-outlined animate-spin" data-icon="sync">sync</span>
              ) : (
                <span className="material-symbols-outlined" data-icon="play_circle">play_circle</span>
              )}
              {isGenerating ? 'Processing Pipeline...' : 'Generate Video Pipeline'}
            </button>

            <div className="glass-panel rounded-xl p-6 border border-surface-container-highest mt-2">
              <h3 className="text-headline-md font-headline-md text-on-background mb-6 flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-primary text-[24px]"
                  data-icon="timeline"
                >
                  timeline
                </span>
                Pipeline Status
              </h3>
              <div className="relative border-l border-outline-variant/30 ml-3 space-y-6 pb-2">
                <div className={`relative pl-6 ${pipelineStatus >= 1 ? '' : 'opacity-50'}`}>
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ${pipelineStatus >= 1 ? 'bg-secondary shadow-[0_0_10px_rgba(78,222,163,0.5)]' : 'bg-outline-variant'}`} />
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className={`text-body-sm font-body-sm font-semibold ${pipelineStatus >= 1 ? 'text-secondary' : 'text-on-surface-variant'}`}>
                        Generating Script (Qwen)
                      </h4>
                    </div>
                    {pipelineStatus > 1 && (
                      <span className="material-symbols-outlined text-secondary text-[20px]" data-icon="check_circle">check_circle</span>
                    )}
                    {pipelineStatus === 1 && (
                      <span className="material-symbols-outlined text-primary text-[20px] animate-spin" data-icon="sync">sync</span>
                    )}
                  </div>
                </div>

                <div className={`relative pl-6 ${pipelineStatus >= 2 ? '' : 'opacity-50'}`}>
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ${pipelineStatus >= 2 ? (pipelineStatus > 2 ? 'bg-secondary shadow-[0_0_10px_rgba(78,222,163,0.5)]' : 'bg-primary shadow-[0_0_10px_rgba(221,183,255,0.5)] flex items-center justify-center') : 'bg-outline-variant w-2 h-2 -left-[5px] top-1.5'}`}>
                    {pipelineStatus === 2 && <div className="w-2 h-2 rounded-full bg-surface-dim animate-pulse" />}
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className={`text-body-sm font-body-sm font-semibold ${pipelineStatus > 2 ? 'text-secondary' : (pipelineStatus === 2 ? 'text-primary' : 'text-on-surface-variant')}`}>
                        Synthesizing Voice (Omnivoice)
                      </h4>
                    </div>
                    {pipelineStatus > 2 && (
                      <span className="material-symbols-outlined text-secondary text-[20px]" data-icon="check_circle">check_circle</span>
                    )}
                    {pipelineStatus === 2 && (
                      <span className="material-symbols-outlined text-primary text-[20px] animate-spin" data-icon="sync">sync</span>
                    )}
                  </div>
                </div>

                <div className={`relative pl-6 ${pipelineStatus >= 3 ? '' : 'opacity-50'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full ${pipelineStatus >= 3 ? (pipelineStatus > 3 ? 'bg-secondary -left-[9px] shadow-[0_0_10px_rgba(78,222,163,0.5)]' : 'bg-primary -left-[9px] shadow-[0_0_10px_rgba(221,183,255,0.5)] flex items-center justify-center') : 'bg-outline-variant w-2 h-2 -left-[5px] top-1.5'}`}>
                    {pipelineStatus === 3 && <div className="w-2 h-2 rounded-full bg-surface-dim animate-pulse" />}
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className={`text-body-sm font-body-sm font-semibold ${pipelineStatus > 3 ? 'text-secondary' : (pipelineStatus === 3 ? 'text-primary' : 'text-on-surface-variant')}`}>
                        Creating Visuals (Stable Diffusion)
                      </h4>
                    </div>
                    {pipelineStatus > 3 && (
                      <span className="material-symbols-outlined text-secondary text-[20px]" data-icon="check_circle">check_circle</span>
                    )}
                    {pipelineStatus === 3 && (
                      <span className="material-symbols-outlined text-primary text-[20px] animate-spin" data-icon="sync">sync</span>
                    )}
                  </div>
                </div>

                <div className={`relative pl-6 ${pipelineStatus >= 4 ? '' : 'opacity-50'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full ${pipelineStatus >= 4 ? (pipelineStatus > 4 ? 'bg-secondary -left-[9px] shadow-[0_0_10px_rgba(78,222,163,0.5)]' : 'bg-primary -left-[9px] shadow-[0_0_10px_rgba(221,183,255,0.5)] flex items-center justify-center') : 'bg-outline-variant w-2 h-2 -left-[5px] top-1.5'}`}>
                     {pipelineStatus === 4 && <div className="w-2 h-2 rounded-full bg-surface-dim animate-pulse" />}
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className={`text-body-sm font-body-sm font-semibold ${pipelineStatus > 4 ? 'text-secondary' : (pipelineStatus === 4 ? 'text-primary' : 'text-on-surface-variant')}`}>
                        Transcribing (Whisper)
                      </h4>
                    </div>
                    {pipelineStatus > 4 && (
                      <span className="material-symbols-outlined text-secondary text-[20px]" data-icon="check_circle">check_circle</span>
                    )}
                    {pipelineStatus === 4 && (
                      <span className="material-symbols-outlined text-primary text-[20px] animate-spin" data-icon="sync">sync</span>
                    )}
                  </div>
                </div>

                <div className={`relative pl-6 ${pipelineStatus >= 5 ? '' : 'opacity-50'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full ${pipelineStatus >= 5 ? (pipelineStatus > 5 ? 'bg-secondary -left-[9px] shadow-[0_0_10px_rgba(78,222,163,0.5)]' : 'bg-primary -left-[9px] shadow-[0_0_10px_rgba(221,183,255,0.5)] flex items-center justify-center') : 'bg-outline-variant w-2 h-2 -left-[5px] top-1.5'}`}>
                     {pipelineStatus === 5 && <div className="w-2 h-2 rounded-full bg-surface-dim animate-pulse" />}
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className={`text-body-sm font-body-sm font-semibold ${pipelineStatus > 5 ? 'text-secondary' : (pipelineStatus === 5 ? 'text-primary' : 'text-on-surface-variant')}`}>
                        Rendering (FFmpeg)
                      </h4>
                    </div>
                    {pipelineStatus > 5 && (
                      <span className="material-symbols-outlined text-secondary text-[20px]" data-icon="check_circle">check_circle</span>
                    )}
                    {pipelineStatus === 5 && (
                      <span className="material-symbols-outlined text-primary text-[20px] animate-spin" data-icon="sync">sync</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="relative w-full aspect-[9/16] max-h-[600px] bg-surface-dim rounded-xl border border-surface-container-highest overflow-hidden shadow-lg flex flex-col items-center justify-center group mx-auto max-w-[340px]">
              <div className="absolute inset-0 opacity-[0.03] subtle-grid" />
              {videoUrl ? (
                <video 
                  src={`http://localhost:8000${videoUrl}`} 
                  controls 
                  autoPlay 
                  loop 
                  className="w-full h-full object-cover z-20 relative rounded-xl"
                />
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center backdrop-blur-md border border-primary/30 group-hover:bg-primary/40 transition-all duration-300 z-10">
                    <span className="material-symbols-outlined text-[32px] text-primary">play_arrow</span>
                  </div>
                  <div className="absolute bottom-4 left-0 w-full px-4 flex justify-between text-mono-code font-mono-code text-on-surface-variant opacity-60">
                    <span>00:00</span>
                    <span>00:00</span>
                  </div>
                </>
              )}
            </div>

            <div className="glass-panel rounded-xl p-6 border border-surface-container-highest">
              <h3 className="text-body-lg font-body-lg font-semibold text-on-background mb-4">
                Final Output Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-dim p-3 rounded-lg border border-outline-variant/30 flex flex-col items-center justify-center text-center">
                  <span className="text-label-caps font-label-caps text-on-surface-variant mb-1">
                    DURATION
                  </span>
                  <span className="text-body-lg font-body-lg font-bold text-on-surface">
                    ~00:45
                  </span>
                </div>
                <div className="bg-surface-dim p-3 rounded-lg border border-outline-variant/30 flex flex-col items-center justify-center text-center">
                  <span className="text-label-caps font-label-caps text-on-surface-variant mb-1">
                    RESOLUTION
                  </span>
                  <span className="text-body-lg font-body-lg font-bold text-on-surface">
                    1080x1920
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {videoUrl ? (
                <a 
                  href={`http://localhost:8000${videoUrl}`}
                  download="lumina_video.mp4"
                  target="_blank"
                  className="w-full py-3 rounded-lg border border-outline-variant text-on-background text-body-sm font-body-sm font-semibold hover:bg-surface-variant/50 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">download</span>
                  Download .mp4
                </a>
              ) : (
                <button disabled className="opacity-50 cursor-not-allowed w-full py-3 rounded-lg border border-outline-variant text-on-background text-body-sm font-body-sm font-semibold flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">download</span>
                  Download .mp4
                </button>
              )}
              <button className="btn-primary w-full py-3 rounded-lg flex items-center justify-center gap-2 text-on-primary text-body-sm font-body-sm font-semibold">
                <svg
                  className="w-5 h-5 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                Publish to YouTube Shorts
              </button>
            </div>
          </div>
        </div>
        </>
        )}

        {activeTab === 'voices' && (
          <>
            <header className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-headline-lg font-headline-lg text-on-background mb-2">
                  Voice Management
                </h1>
                <p className="text-body-lg font-body-lg text-on-surface-variant">
                  Clone your voice or design a brand new synthetic character.
                </p>
              </div>
              <div className="flex bg-surface-container-highest rounded-lg p-1">
                <button
                  onClick={() => setVoiceView('clone')}
                  className={`px-6 py-2 rounded-md text-label-caps font-label-caps font-bold transition-all ${voiceView === 'clone' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Clone Voice
                </button>
                <button
                  onClick={() => setVoiceView('design')}
                  className={`px-6 py-2 rounded-md text-label-caps font-label-caps font-bold transition-all ${voiceView === 'design' ? 'bg-[fuchsia] text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Design Voice
                </button>
              </div>
            </header>

            {voiceView === 'clone' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
                <div className="glass-panel rounded-xl p-6 border border-surface-container-highest flex flex-col gap-6">
                  <div>
                    <label className="block text-body-sm font-body-sm font-semibold text-on-surface mb-2">Voice Name</label>
                    <input 
                      type="text" 
                      value={cloneVoiceName}
                      onChange={(e) => setCloneVoiceName(e.target.value)}
                      placeholder="e.g. CEO Narrator"
                      className="w-full bg-surface-dim border border-outline-variant rounded-lg p-3 text-body-sm font-body-sm text-on-background focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-body-sm font-body-sm font-semibold text-on-surface mb-2">Synthesis Text</label>
                    <textarea 
                      value={cloneText}
                      onChange={(e) => setCloneText(e.target.value)}
                      placeholder="The text you want the cloned voice to say to test it..."
                      rows={3}
                      className="w-full bg-surface-dim border border-outline-variant rounded-lg p-3 text-body-sm font-body-sm text-on-background focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-body-sm font-body-sm font-semibold text-on-surface mb-2">Reference Audio</label>
                    <div 
                      className="border-2 border-dashed border-outline-variant rounded-xl p-8 flex flex-col items-center justify-center gap-4 hover:border-primary/50 transition-colors cursor-pointer bg-surface-dim/50"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="audio/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setCloneAudioFile(e.target.files[0]);
                          }
                        }}
                      />
                      <span className="material-symbols-outlined text-[48px] text-primary/70">upload_file</span>
                      <div className="text-center">
                        <p className="text-body-md font-body-md font-semibold text-on-surface">{cloneAudioFile ? cloneAudioFile.name : 'Click to upload audio'}</p>
                        <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">.wav or .mp3, max 10MB</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); /* implement record logic later */ }}
                        className="px-4 py-2 mt-2 rounded-full border border-primary text-primary text-label-caps font-label-caps hover:bg-primary/10 transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">mic</span>
                        Record Voice
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 mt-auto">
                    <div className="flex gap-4">
                      <button 
                        onClick={handlePreviewClone}
                        className="flex-1 py-4 rounded-lg flex items-center justify-center gap-2 text-on-surface text-body-lg font-body-lg font-bold tracking-wide bg-surface-variant hover:bg-outline-variant transition-colors"
                      >
                        <span className="material-symbols-outlined" data-icon="play_circle">play_circle</span>
                        Preview Voice
                      </button>
                      <button 
                        onClick={handleCloneVoice}
                        className="btn-primary flex-1 py-4 rounded-lg flex items-center justify-center gap-2 text-on-primary text-body-lg font-body-lg font-bold tracking-wide"
                      >
                        <span className="material-symbols-outlined" data-icon="save">save</span>
                        Save Voice
                      </button>
                    </div>
                    {clonePreviewAudioUrl && (
                      <div className="bg-surface-dim p-4 rounded-xl border border-primary/30 flex items-center gap-4">
                        <span className="text-body-sm font-semibold text-primary">Preview:</span>
                        <audio src={clonePreviewAudioUrl} controls autoPlay className="w-full h-10" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-6">
                  <div className="glass-panel rounded-xl p-8 border border-surface-container-highest min-h-[200px] flex items-center justify-center bg-surface-dim">
                     <div className="flex items-center gap-1 opacity-40">
                        {/* Fake Waveform */}
                        {[...Array(30)].map((_, i) => (
                           <div key={i} className="w-1.5 bg-primary rounded-full animate-pulse" style={{ height: `${Math.random() * 40 + 10}px`, animationDelay: `${i * 0.1}s` }} />
                        ))}
                     </div>
                  </div>

                  <div className="glass-panel rounded-xl p-6 border border-surface-container-highest">
                    <h3 className="text-body-lg font-body-lg font-semibold text-on-background mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary">verified</span>
                      Best Practices
                    </h3>
                    <ul className="space-y-3">
                      {['Clean Environment (No background noise)', 'Sufficient Length (30-60s)', 'Cross-Lingual Cloning Supported', 'Non-Verbal Emotions Supported'].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">check_circle</span>
                          <span className="text-body-sm font-body-sm text-on-surface-variant">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {voiceView === 'design' && (
              <div className="flex flex-col gap-6">
                <div className="glass-panel rounded-xl p-6 border border-surface-container-highest grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 flex gap-6">
                    <div className="flex-1">
                      <label className="block text-body-sm font-body-sm font-semibold text-on-surface mb-2">Voice Name</label>
                      <input 
                        type="text" 
                        value={designVoiceName}
                        onChange={(e) => setDesignVoiceName(e.target.value)}
                        placeholder="e.g. Friendly Assistant"
                        className="w-full bg-surface-dim border border-outline-variant rounded-lg p-3 text-body-sm font-body-sm text-on-background focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-body-sm font-body-sm font-semibold text-on-surface mb-2">Synthesis Text</label>
                    <textarea 
                      value={designText}
                      onChange={(e) => setDesignText(e.target.value)}
                      placeholder="Enter the text to preview your designed voice..."
                      rows={2}
                      className="w-full bg-surface-dim border border-outline-variant rounded-lg p-3 text-body-sm font-body-sm text-on-background focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                  </div>

                  {/* Grid Dropdowns */}
                  <div>
                    <label className="block text-label-caps font-label-caps text-on-surface-variant mb-2">Gender</label>
                    <select value={designGender} onChange={(e) => setDesignGender(e.target.value)} className="w-full bg-surface-dim border border-outline-variant rounded-lg p-2.5 text-body-sm font-body-sm text-on-background focus:border-primary">
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="androgynous">Androgynous</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-label-caps font-label-caps text-on-surface-variant mb-2">Perceived Age</label>
                    <select value={designAge} onChange={(e) => setDesignAge(e.target.value)} className="w-full bg-surface-dim border border-outline-variant rounded-lg p-2.5 text-body-sm font-body-sm text-on-background focus:border-primary">
                      <option value="young">Young Adult</option>
                      <option value="middle">Middle-Aged</option>
                      <option value="elderly">Elderly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-label-caps font-label-caps text-on-surface-variant mb-2">Vocal Pitch</label>
                    <select value={designPitch} onChange={(e) => setDesignPitch(e.target.value)} className="w-full bg-surface-dim border border-outline-variant rounded-lg p-2.5 text-body-sm font-body-sm text-on-background focus:border-primary">
                      <option value="low">Low / Deep</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-label-caps font-label-caps text-on-surface-variant mb-2">Accent</label>
                    <select value={designAccent} onChange={(e) => setDesignAccent(e.target.value)} className="w-full bg-surface-dim border border-outline-variant rounded-lg p-2.5 text-body-sm font-body-sm text-on-background focus:border-primary">
                      <option value="neutral">Neutral American</option>
                      <option value="british">British (RP)</option>
                      <option value="australian">Australian</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-label-caps font-label-caps text-on-surface-variant mb-2">Acoustic Style Hint</label>
                    <select value={designStyle} onChange={(e) => setDesignStyle(e.target.value)} className="w-full bg-surface-dim border border-outline-variant rounded-lg p-2.5 text-body-sm font-body-sm text-on-background focus:border-primary">
                      <option value="studio">Studio Narrative</option>
                      <option value="conversational">Casual Conversational</option>
                      <option value="news">News Broadcast</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 mt-2">
                     <div className="flex justify-between items-center mb-2">
                        <label className="text-label-caps font-label-caps text-on-surface-variant">Synthesis Speed</label>
                        <span className="text-body-sm text-on-surface font-mono-code">{designSpeed}x</span>
                     </div>
                     <input 
                        type="range" 
                        min="0.5" max="2.0" step="0.1" 
                        value={designSpeed} 
                        onChange={(e) => setDesignSpeed(parseFloat(e.target.value))}
                        className="w-full accent-primary" 
                     />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => { setDesignVoiceName(""); setDesignText(""); setPreviewAudioUrl(""); }}
                      className="px-6 py-4 rounded-lg border border-outline-variant text-on-background text-body-lg font-body-lg font-semibold hover:bg-surface-variant/50 transition-colors"
                    >
                      Reset
                    </button>
                    <button 
                      onClick={handlePreviewVoice}
                      className="flex-1 py-4 rounded-lg flex items-center justify-center gap-2 text-on-surface text-body-lg font-body-lg font-bold tracking-wide bg-surface-variant hover:bg-outline-variant transition-colors"
                    >
                      <span className="material-symbols-outlined" data-icon="play_circle">play_circle</span>
                      Preview Voice
                    </button>
                    <button 
                      onClick={handleDesignVoice}
                      className="btn-primary flex-1 py-4 rounded-lg flex items-center justify-center gap-2 text-on-primary text-body-lg font-body-lg font-bold tracking-wide bg-[fuchsia] hover:bg-[fuchsia]/90"
                    >
                      <span className="material-symbols-outlined" data-icon="save">save</span>
                      Save Voice
                    </button>
                  </div>
                  {previewAudioUrl && (
                    <div className="bg-surface-dim p-4 rounded-xl border border-primary/30 flex items-center gap-4">
                      <span className="text-body-sm font-semibold text-primary">Preview:</span>
                      <audio src={previewAudioUrl} controls autoPlay className="w-full h-10" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                   <div className="bg-surface-dim p-5 rounded-xl border border-outline-variant/30">
                      <h4 className="text-body-md font-bold text-on-surface mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">emoji_emotions</span>
                        Non-Verbal Emotions
                      </h4>
                      <p className="text-body-sm text-on-surface-variant">
                        Enhance realism by injecting tags like <code className="text-primary bg-primary/10 px-1 rounded">[laughter]</code>, <code className="text-primary bg-primary/10 px-1 rounded">[sigh]</code>, or <code className="text-primary bg-primary/10 px-1 rounded">[breath]</code> directly into your synthesis text.
                      </p>
                   </div>
                   <div className="bg-surface-dim p-5 rounded-xl border border-outline-variant/30">
                      <h4 className="text-body-md font-bold text-on-surface mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
                        Style Control
                      </h4>
                      <p className="text-body-sm text-on-surface-variant">
                        The acoustic style hint adjusts the model's latent prosody. For upbeat shorts, use 'Conversational'. For tutorials, 'Studio Narrative' works best.
                      </p>
                   </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
