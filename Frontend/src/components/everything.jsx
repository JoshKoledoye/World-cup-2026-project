import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { UserButton, useUser } from "@clerk/react";
import trivia from "./trivia";
const MATCH_ENGINE_ENDPOINT = "https://worldcup26.ir/get/games";

function AuthControls() {
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    return <UserButton afterSignOutUrl="/" />;
  }

  return (
    <>
      <Link
        to="/sign-in"
        className="font-label-caps text-label-caps text-on-primary-container opacity-80 hover:opacity-100 hover:text-secondary-fixed-dim transition-colors duration-200 pb-1"
      >
        Login
      </Link>
      <Link
        to="/sign-up"
        className="font-label-caps text-label-caps bg-tertiary-fixed text-on-tertiary-fixed px-3 py-2 hover:bg-tertiary-fixed-dim transition-colors duration-200"
      >
        Sign Up
      </Link>
    </>
  );
}

export default function Everything() {
  // --- STATE SYSTEM INITIALIZATION ---
  const [currentView, setCurrentView] = useState("home");
  const [fixtures, setFixtures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncPercentage, setSyncPercentage] = useState(98.0);
  const canvasRef = useRef(null);

  // 1. DATA STREAM INTEGRATION HOOK
  const fetchLiveWorldCupData = async () => {
    try {
      const response = await fetch(MATCH_ENGINE_ENDPOINT, { method: "GET" });
      if (!response.ok)
        throw new Error("Public match server communication failure.");

      const rawData = await response.json();
      const currentGames = rawData.games || [];
      console.log("🌐 DATABASE MATCH FEED SYNCED:", currentGames);
      setFixtures(currentGames);
      setIsLoading(false);
    } catch (error) {
      console.error("Match synchronization data streaming dropped:", error);
      setIsLoading(false);
    }
  };

  // 2. TIMERS & LIFECYCLE EFFECT LOOP
  useEffect(() => {
    fetchLiveWorldCupData();
    const dataInterval = setInterval(fetchLiveWorldCupData, 60000);

    const syncInterval = setInterval(() => {
      setSyncPercentage(97 + Math.random() * 2);
    }, 3000);

    return () => {
      clearInterval(dataInterval);
      clearInterval(syncInterval);
    };
  }, []);

  // 3. SHADER ENGINE EMBEDDED CONTEXT HOOK (Fixed: re-initializes when coming back Home)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function syncSize() {
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
    }
    syncSize();

    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return;

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;
    const fs = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
varying vec2 v_texCoord;

void main() {
    vec2 uv = v_texCoord;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= u_resolution.x / u_resolution.y;

    float t = u_time * 0.4;
    float wave = sin(p.x * 3.0 + t + sin(p.y * 2.0 - t)) * 0.5 + 0.5;
    float wave2 = sin(p.y * 4.0 - t * 1.5 + cos(p.x * 2.0 + t)) * 0.5 + 0.5;
    
    vec3 fifaNavy = vec3(0.0, 0.302, 0.596);
    vec3 pulseGreen = vec3(0.745, 0.953, 0.173);
    vec3 pulsePurple = vec3(0.42, 0.13, 0.66);
    vec3 pulseRed = vec3(0.9, 0.1, 0.2);
    
    vec3 color = mix(fifaNavy, pulsePurple, wave * 0.3);
    color = mix(color, pulseGreen, wave2 * 0.2);
    
    float highlight = smoothstep(0.4, 0.6, sin(length(p) * 2.0 - t * 2.0) * 0.5 + 0.5);
    color = mix(color, pulseRed, highlight * 0.1);
    
    float grid = (step(0.98, fract(uv.x * 20.0)) + step(0.98, fract(uv.y * 20.0))) * 0.05;
    color += grid;

    gl_FragColor = vec4(color, 1.0);
}`;

    function cs(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    let animationFrameId;
    function render(t) {
      if (typeof ResizeObserver === "undefined") syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    }
    render(0);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [currentView]); // Re-runs layout setup cleanly when returning home

  // 4. LIVE TELEMETRY REDUCER PARSERS
  const calculateTournamentStats = () => {
    let totalGoals = 0;
    let totalCleanSheets = 0;
    let matchesPlayedCount = 0;

    fixtures.forEach((match) => {
      const homeScore =
        match.home_score !== undefined ? parseInt(match.home_score) : null;
      const awayScore =
        match.away_score !== undefined ? parseInt(match.away_score) : null;
      const elapsed = (match.time_elapsed || "notstarted").toLowerCase();

      if (
        homeScore !== null &&
        awayScore !== null &&
        elapsed !== "notstarted"
      ) {
        totalGoals += homeScore + awayScore;
        matchesPlayedCount++;

        if (homeScore === 0) totalCleanSheets++;
        if (awayScore === 0) totalCleanSheets++;
      }
    });

    const calculatedAttendance = matchesPlayedCount * 48250;
    let attendanceDisplay = "1.2M";
    if (calculatedAttendance >= 1000000) {
      attendanceDisplay = `${(calculatedAttendance / 1000000).toFixed(1)}M`;
    } else if (calculatedAttendance > 0) {
      attendanceDisplay = `${Math.floor(calculatedAttendance / 1000)}K`;
    }

    return {
      goals: totalGoals > 0 ? totalGoals : "42",
      attendance: attendanceDisplay,
      cleanSheets: totalCleanSheets > 0 ? totalCleanSheets : "14",
    };
  };

  const getFeaturedMatch = () => {
    if (!fixtures || fixtures.length === 0) return null;
    const liveMatch = fixtures.find((item) => {
      const status = (item.time_elapsed || "notstarted").toLowerCase();
      const isFinished = (item.finished || "FALSE").toUpperCase() === "TRUE";
      return status !== "notstarted" && !isFinished;
    });
    return liveMatch || null;
  };

  const stats = calculateTournamentStats();
  const featured = getFeaturedMatch();

  // 5. HERO SCORECARD STATE PARSING
  const completedFixtures = fixtures
    ? fixtures.filter((f) => (f.finished || "FALSE").toUpperCase() === "TRUE")
    : [];

  const liveFixtures = fixtures
    ? fixtures.filter(
        (f) =>
          f.time_elapsed &&
          f.time_elapsed.toLowerCase() !== "notstarted" &&
          (f.finished || "FALSE").toUpperCase() !== "TRUE",
      )
    : [];

  const activeFeatured =
    featured ||
    liveFixtures[0] ||
    completedFixtures[completedFixtures.length - 1] ||
    (fixtures ? fixtures[0] : null);

  const heroHomeName =
    activeFeatured?.home_team_name_en ||
    activeFeatured?.home_team_label ||
    "TBD";
  const heroAwayName =
    activeFeatured?.away_team_name_en ||
    activeFeatured?.away_team_label ||
    "TBD";
  const heroHomeScore =
    activeFeatured?.home_score !== undefined
      ? parseInt(activeFeatured.home_score)
      : 0;
  const heroAwayScore =
    activeFeatured?.away_score !== undefined
      ? parseInt(activeFeatured.away_score)
      : 0;
  const heroElapsedStatus = (
    activeFeatured?.time_elapsed || "notstarted"
  ).toLowerCase();
  const heroIsFinished =
    (activeFeatured?.finished || "FALSE").toUpperCase() === "TRUE";

  let heroCenterLabel = `'${heroElapsedStatus}`;
  if (heroIsFinished) heroCenterLabel = "FINAL";
  if (heroElapsedStatus === "notstarted") heroCenterLabel = "UPCOMING";

  const heroHomeCode = heroHomeName
    .replace(/[^a-zA-Z]/g, "")
    .substring(0, 3)
    .toUpperCase();
  const heroAwayCode = heroAwayName
    .replace(/[^a-zA-Z]/g, "")
    .substring(0, 3)
    .toUpperCase();
  const heroHomeLogo = `https://ui-avatars.com/api/?name=${heroHomeCode}&background=1d2432&color=fff&size=128&bold=true`;
  const heroAwayLogo = `https://ui-avatars.com/api/?name=${heroAwayCode}&background=1d2432&color=fff&size=128&bold=true`;

  const marqueeItems =
    liveFixtures.length > 0 ? liveFixtures : completedFixtures.slice(-5);

  return (
    <>
      {/* INTRO SPLASH LOADER */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-primary flex flex-col justify-center items-center gap-6 transition-all duration-500">
          <div className="relative flex items-center justify-center w-32 h-32">
            <video
              src="/trionda.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-contain mix-blend-screen"
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <h2 className="font-display-lg text-title-md text-on-primary uppercase tracking-[0.2em]">
              TriOnda26
            </h2>
            <p className="font-label-caps text-[10px] text-on-primary-container tracking-widest animate-pulse">
              Setting up the defensive wall...
            </p>
          </div>
        </div>
      )}

      {/* MATCH TICKER MARQUEE */}
      <div
        className="w-full bg-primary py-2 overflow-hidden border-b border-outline-variant z-50 relative"
        data-purpose="match-ticker"
      >
        {/* Dynamic CSS injected here to guarantee smooth custom ticker scrolling */}
        <style>{`
          @keyframes marqueeScroll {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-50%, 0, 0); }
          }
          .ticker-scroll {
            display: inline-flex;
            animation: marqueeScroll 30s linear infinite;
          }
          .ticker-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>
        
        <div className="flex whitespace-nowrap ticker-scroll items-center gap-10">
          {marqueeItems.length > 0 ? (
            [...marqueeItems, ...marqueeItems].map((item, idx) => {
              const homeName =
                item.home_team_name_en || item.home_team_label || "TBD";
              const awayName =
                item.away_team_name_en || item.away_team_label || "TBD";
              const homeScore =
                item.home_score !== undefined ? parseInt(item.home_score) : 0;
              const awayScore =
                item.away_score !== undefined ? parseInt(item.away_score) : 0;

              const elapsedStatus = (
                item.time_elapsed || "notstarted"
              ).toLowerCase();
              const isFinished =
                (item.finished || "FALSE").toUpperCase() === "TRUE";
              const isLive = elapsedStatus !== "notstarted" && !isFinished;

              let statusLabel = elapsedStatus.toUpperCase();
              let statusClass = "bg-on-primary-container text-primary";

              if (isLive) {
                statusLabel = "LIVE";
                statusClass = "bg-error text-white";
              } else if (isFinished) {
                statusLabel = "FINAL";
              } else if (elapsedStatus === "notstarted") {
                statusLabel = "UPCOMING";
              }

              return (
                <div key={idx} className="flex items-center gap-4 px-4">
                  <span
                    className={`${statusClass} font-label-caps text-label-caps px-2 py-0.5 rounded-sm`}
                  >
                    {statusLabel}
                  </span>
                  <span className="text-on-primary font-label-caps text-label-caps uppercase">
                    {homeName} {homeScore} - {awayScore} {awayName}
                  </span>
                  {isLive && (
                    <span className="text-tertiary-fixed font-label-caps text-label-caps">
                      '{elapsedStatus}
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-on-primary/60 font-label-caps text-label-caps px-6 uppercase tracking-wider">
              No Tournament Matches Found
            </div>
          )}
        </div>
      </div>

      {/* TOP NAVIGATION SYSTEM */}
      <nav
        className="bg-primary flex flex-col sm:flex-row justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 mx-auto sticky top-0 z-40 shadow-md border-b border-outline-variant gap-4 sm:gap-0"
        data-purpose="main-navigation"
      >
        <div className="flex items-center justify-between w-full sm:w-auto">
          <h1 className="font-display-lg text-headline-lg tracking-tighter text-on-primary">
            TriOnda 26
          </h1>
        </div>

        {/* RESPONSIVE MENU LINKS - Visible everywhere */}
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 w-full sm:w-auto">
          <button
            onClick={() => setCurrentView("home")}
            className={`font-label-caps text-label-caps transition-colors duration-200 pb-1 ${
              currentView === "home"
                ? "text-tertiary-fixed border-b-2 border-tertiary-fixed font-bold"
                : "text-on-primary-container opacity-80 hover:opacity-100 hover:text-secondary-fixed-dim"
            }`}
          >
            Home
          </button>

          <button
            onClick={() => setCurrentView("stats")}
            className={`font-label-caps text-label-caps transition-colors duration-200 pb-1 ${
              currentView === "stats"
                ? "text-tertiary-fixed border-b-2 border-tertiary-fixed font-bold"
                : "text-on-primary-container opacity-80 hover:opacity-100 hover:text-secondary-fixed-dim"
            }`}
          >
            Stats
          </button>

          <button
            onClick={() => setCurrentView("events")}
            className={`font-label-caps text-label-caps transition-colors duration-200 pb-1 ${
              currentView === "events"
                ? "text-tertiary-fixed border-b-2 border-tertiary-fixed font-bold"
                : "text-on-primary-container opacity-80 hover:opacity-100 hover:text-secondary-fixed-dim"
            }`}
          >
            Events and Polls
          </button>

          <button
            onClick={() => setCurrentView("trivia")}
            className={`font-label-caps text-label-caps transition-colors duration-200 pb-1 ${
              currentView === "trivia"
                ? "text-tertiary-fixed border-b-2 border-tertiary-fixed font-bold"
                : "text-on-primary-container opacity-80 hover:opacity-100 hover:text-secondary-fixed-dim"
            }`}
          >
            Trivia
          </button>

          <AuthControls />
        </div>
      </nav>

      {/* ─── CENTRALISED ROUTING ENVIRONMENT ─── */}
      <main className="relative z-10 mx-auto w-full">
        {/* VIEW 1: HOME PLATFORM */}
        {currentView === "home" && (
          <>
            {/* BACKGROUND SHADER SHIELD HERO SECTION */}
            <header className="relative w-full min-h-[950px] lg:h-[921px] overflow-hidden flex items-center bg-primary py-12 lg:py-0">
              <div
                className="absolute inset-0 w-full h-full opacity-60"
                style={{ display: "block" }}
              >
                <canvas
                  ref={canvasRef}
                  id="shader-canvas-ANIMATION_20"
                  style={{ display: "block", width: "100%", height: "100%" }}
                ></canvas>
              </div>
              <div className="relative z-10 w-full px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="flex flex-col gap-6">
                  <div>
                    <span className="bg-secondary text-on-secondary font-label-caps text-label-caps px-4 py-1 rounded-full mb-4 inline-block tracking-widest uppercase">
                      MATCH OF THE DAY
                    </span>
                    <h2 className="font-display-lg text-headline-lg-mobile md:text-display-lg text-on-primary leading-tight">
                      THE WORLD CUP... FOR GEEKS
                    </h2>
                  </div>
                  <p className="font-body-lg text-on-primary-container max-w-xl">
                    Experience the world cup like never before! follow real time
                    stats and updates, and participate in voting contests
                  </p>
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="relative flex items-center gap-3 bg-white/5 backdrop-blur-md px-6 py-4 border border-white/10">
                      <div
                        className="w-12 h-12"
                        id="animated-svg-ANIMATION_21"
                        style={{ display: "block" }}
                      >
                        <svg
                          viewBox="0 0 200 200"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <defs>
                            <linearGradient
                              id="grad1"
                              x1="0%"
                              x2="100%"
                              y1="0%"
                              y2="100%"
                            >
                              <stop
                                offset="0%"
                                style={{ stopColor: "#bef32c", stopOpacity: 1 }}
                              ></stop>
                              <stop
                                offset="100%"
                                style={{ stopColor: "#004d98", stopOpacity: 1 }}
                              ></stop>
                            </linearGradient>
                          </defs>
                          <path
                            d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
                            fill="none"
                            stroke="url(#grad1)"
                            strokeWidth="2"
                          >
                            <animateTransform
                              attributeName="transform"
                              dur="10s"
                              from="0 100 100"
                              repeatCount="indefinite"
                              to="360 100 100"
                              type="rotate"
                            ></animateTransform>
                          </path>
                          <path
                            d="M 100, 100 m -60, 0 a 60,60 0 1,0 120,0 a 60,60 0 1,0 -120,0"
                            fill="none"
                            stroke="#bef32c"
                            strokeDasharray="10, 5"
                            strokeWidth="1"
                          >
                            <animateTransform
                              attributeName="transform"
                              dur="15s"
                              from="360 100 100"
                              repeatCount="indefinite"
                              to="0 100 100"
                              type="rotate"
                            ></animateTransform>
                          </path>
                          <circle cx="100" cy="100" fill="#bef32c" r="10">
                            <animate
                              attributeName="r"
                              dur="2s"
                              repeatCount="indefinite"
                              values="8;12;8"
                            ></animate>
                            <animate
                              attributeName="opacity"
                              dur="2s"
                              repeatCount="indefinite"
                              values="0.5;1;0.5"
                            ></animate>
                          </circle>
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-on-primary font-label-caps text-[10px] opacity-60">
                          LIVE TRACKING
                        </span>
                        <span
                          className="text-tertiary-fixed font-label-caps text-label-caps"
                          id="sync-text"
                        >
                          {syncPercentage.toFixed(1)}% SYNCED
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* MATCH OF THE DAY HERO BLOCK - Fixed visibility on small/mobile layouts */}
                <div
                  className="flex justify-center lg:justify-end w-full"
                  data-purpose="match-of-the-day-hero"
                >
                  <div className="glass-card p-6 md:p-xl flex flex-col items-center gap-6 md:gap-8 w-full max-w-md mx-auto">
                    <div className="flex justify-between items-center w-full gap-2">
                      <div className="flex flex-col items-center gap-3 flex-1 min-w-0">
                        <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-primary border-4 border-secondary overflow-hidden shadow-2xl flex items-center justify-center shrink-0">
                          <img
                            id="hero-home-flag"
                            alt={`${heroHomeName} Crest`}
                            className="w-full h-full object-cover"
                            src={
                              fixtures.length > 0
                                ? heroHomeLogo
                                : "https://lh3.googleusercontent.com/aida-public/AB6AXuAOq5DIOIaelrrpOVKkqDqThaibYsPbK4SmrxW6zRIJSPh3OntOgF_qLZLVRjBdJjv4rq86vrLIW70j5K7OU6DLH-8dXMoI_sQNFlNh_oa_shE1OEyUQYJqIQCxdJZUpcgaSC91mM5ioQCQLHqeQyVKuN7FTtDL6EQbIXUqXdYsbu2fQKrTGzQfCpXJ7beY3O2MZGw_0Ly4QqEwfjNzK7odL_kG4CdKEkPl_hR9t8QrxUwWuyMSm2-ODkMmCcp7eCUn7qRyZipSwMA"
                            }
                          />
                        </div>
                        <span
                          id="hero-home-name"
                          className="font-display-lg text-title-md md:text-headline-lg text-on-primary max-w-full truncate block text-center"
                        >
                          {fixtures.length > 0 ? heroHomeName : "USA"}
                        </span>
                      </div>

                      <div className="flex flex-col items-center shrink-0 px-2">
                        <span
                          id="hero-score"
                          className="font-display-lg text-headline-lg md:text-display-lg text-tertiary-fixed whitespace-nowrap"
                        >
                          {fixtures.length > 0
                            ? `${heroHomeScore} - ${heroAwayScore}`
                            : "2 - 1"}
                        </span>
                        <span
                          id="hero-status"
                          className="text-on-primary-container font-label-caps text-label-caps tracking-widest text-[10px] md:text-xs"
                        >
                          {fixtures.length > 0 ? heroCenterLabel : "'74"}
                        </span>
                      </div>

                      <div className="flex flex-col items-center gap-3 flex-1 min-w-0">
                        <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-primary border-4 border-on-primary-container overflow-hidden shadow-2xl flex items-center justify-center shrink-0">
                          <img
                            id="hero-away-flag"
                            alt={`${heroAwayName} Crest`}
                            className="w-full h-full object-cover"
                            src={
                              fixtures.length > 0
                                ? heroAwayLogo
                                : "https://lh3.googleusercontent.com/aida-public/AB6AXuDjNy1DO6QRbV0-qN4JlXKMfJO3bL7wsvx-51Ddjz88O6ZRC5UESPVjuVmLoIvi_dbjpf5KwxGk7eWj9iNscLCxZSXEupG6NTcSsTmIxs-QkE3NbSAbSsyzSmvbAHIdNccKT6uwVmcRIr9Nyk9N1Bq_tzzA1UNumIlpkYZ9G8qXTWHEmx6xBFuFt_ouZpsaRf8C-cFDt3aMC2Pd7WcykwT60d9kolbaIrcWLk9v4uiH7LREOlc9ta0E-4Ni1PbkL4owt58R5osqhA4"
                            }
                          />
                        </div>
                        <span
                          id="hero-away-name"
                          className="font-display-lg text-title-md md:text-headline-lg text-on-primary max-w-full truncate block text-center"
                        >
                          {fixtures.length > 0 ? heroAwayName : "MEX"}
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-1 bg-white/10 relative">
                      <div
                        className="absolute left-0 top-0 h-full bg-tertiary-fixed transition-all duration-1000"
                        style={{ width: "50%" }}
                      ></div>
                    </div>
                    <div className="flex justify-between w-full text-on-primary-container font-label-caps text-[9px] md:text-[10px]"></div>
                  </div>
                </div>
              </div>
            </header>

            {/* CORE TOURNAMENT DASHBOARD BENTO BOX GRID */}
            <main
              className="w-full px-margin-mobile md:px-margin-desktop py-xl"
              data-purpose="bento-grid-dashboard"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
                <section
                  className="md:col-span-8 bg-surface-container border border-outline-variant p-md relative overflow-hidden group"
                  data-purpose="trivia-card"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-secondary"></div>
                  <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-4">
                        <span
                          className="material-symbols-outlined text-secondary"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          lightbulb
                        </span>
                        <span className="font-label-caps text-label-caps text-secondary font-bold">
                          DID YOU KNOW?
                        </span>
                      </div>
                      <h3 className="font-headline-lg text-headline-lg text-primary mb-4 leading-tight">
                        The 2026 World Cup will feature 104 matches across 16
                        host cities.
                      </h3>
                      <p className="font-body-md text-on-surface-variant mb-6">
                        Test your knowledge and climb the global leaderboard.
                        Earn exclusive digital collectibles by answering daily
                        tournament trivia.
                      </p>
                      <button
                        onClick={() => setCurrentView("trivia")}
                        className="border-2 border-primary text-primary font-label-caps text-label-caps px-6 py-2.5 hover:bg-primary hover:text-white transition-all duration-200"
                      >
                        PLAY DAILY TRIVIA
                      </button>
                    </div>
                    <div className="w-full md:w-1/3 aspect-square bg-surface-bright rounded-lg overflow-hidden border border-outline-variant relative">
                      <img
                        alt="Stadium Architecture"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCm9UAw5KYhZcEUDNAgZqRkKUTyzBpVHmAKAQy8ICGBcuAknerjDessURxaTkODjIrBZZgcZ6GCdWmv-MN_yyXd8jQ94MVUZO2R8igo_fqHxAVY2z4AyetOd6D-QDoLQjZLquznagOln2bidGa3yVvE5_VSToWvFnfbs6ax3a-Q5Vmfcz_wsFDbYf9soPMyd4GiTkJLNtPPYcMxnQp9htiKUP2774G2wbWpIr9gitvTWvILLgW_W41iK54bERgwLufo6BR9lV5zxt4"
                      />
                    </div>
                  </div>
                </section>

                <section
                  className="md:col-span-4 bg-primary text-on-primary p-md flex flex-col justify-between border border-primary-fixed-dim/20 relative overflow-hidden"
                  data-purpose="stats-overview"
                >
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-tertiary-fixed/10 rounded-full blur-3xl"></div>
                  <div className="relative z-10">
                    <span className="font-label-caps text-[10px] tracking-[0.2em] opacity-60 block mb-6">
                      LIVE TOURNAMENT STATS
                    </span>
                    <div className="space-y-8">
                      <div className="flex justify-between items-end border-b border-white/10 pb-4">
                        <span className="font-body-md opacity-80">
                          Goals Scored
                        </span>
                        <span
                          id="stats-goals"
                          className="font-display-lg text-headline-lg text-tertiary-fixed"
                        >
                          {stats.goals}
                        </span>
                      </div>
                      <div className="flex justify-between items-end border-b border-white/10 pb-4">
                        <span className="font-body-md opacity-80">
                          Attendance
                        </span>
                        <span
                          id="stats-attendance"
                          className="font-display-lg text-headline-lg"
                        >
                          {stats.attendance}
                        </span>
                      </div>
                      <div className="flex justify-between items-end border-b border-white/10 pb-4">
                        <span className="font-body-md opacity-80">
                          Clean Sheets
                        </span>
                        <span
                          id="stats-cleansheets"
                          className="font-display-lg text-headline-lg text-secondary-fixed"
                        >
                          {stats.cleanSheets}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentView("stats")}
                    className="w-full mt-8 flex items-center justify-center gap-2 font-label-caps text-label-caps text-tertiary-fixed hover:underline"
                  >
                    VIEW ALL INSIGHTS
                    <span className="material-symbols-outlined text-sm">
                      open_in_new
                    </span>
                  </button>
                </section>

                {/* TEAM OF THE WEEK (TACTICAL MATRIX MAP) */}
                <section
                  className="md:col-span-12 mt-lg"
                  data-purpose="team-of-the-week"
                >
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <span className="font-label-caps text-label-caps text-secondary font-bold tracking-widest">
                        PERFORMANCE TRACKER
                      </span>
                      <h3 className="font-headline-lg text-headline-lg text-primary">
                        TEAM OF THE WEEK
                      </h3>
                    </div>
                    <div className="hidden md:flex gap-2">
                      <button className="w-10 h-10 border border-outline-variant flex items-center justify-center hover:bg-surface-container transition-colors">
                        <span className="material-symbols-outlined">
                          chevron_left
                        </span>
                      </button>
                      <button className="w-10 h-10 border border-outline-variant flex items-center justify-center bg-primary text-white">
                        <span className="material-symbols-outlined">
                          chevron_right
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="relative w-full aspect-[16/9] bg-primary overflow-hidden border border-outline-variant/30 rounded-lg shadow-2xl">
                    <img
                      alt="Tactical Pitch"
                      className="absolute inset-0 w-full h-full object-cover opacity-80"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmc-8I0cwEQBs3hCElcC_cbgQ0m6CqzxdQHMmZrqH6iCsr0ZFDIcAr48KdZF_qJ9JJFxLrAdlmlB3WfkLYsQC7_0uXeu1roYCfJbKEzXwmgZpb20S6Ha_7EDCYjtIYSCp_VaClMnZcXwQt0XjI8NIyqQ4vM81GQjRvbN74uxzVw1ETByiv5ZQrvPt9yxxuOQHQoLNpsX4HgZaBXNbP-3QB5cX8Bz54fWShU4RzNXE5nFPc47mxRVHFj1KzJE5ydDgvXWioGuSszHw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/40 via-transparent to-primary/40"></div>
                    <div className="relative h-full w-full grid grid-cols-4 items-center px-12">
                      <div className="flex justify-center">
                        <div className="glass-card p-2 rounded-sm border border-tertiary-fixed/30 w-24 text-center">
                          <div className="w-16 h-16 mx-auto mb-2 bg-surface-container rounded-full overflow-hidden border border-outline-variant">
                            <img
                              alt="Alisson"
                              className="w-full h-full object-cover grayscale"
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCA6FFny5bgJLfzxjMpXX9kLuQ2DSpRkBCbVD5haCLGoOp9coyirVKpZ6Tv1MfxUPN69v7F2QooWQ4ehyNLcukAcv6xrWDpu8FkkOhCbBPfQARLs64_-wTjcnyT8_1Yy4UX3KHf8zFfHS8LLtTinws-x37FNLr54LEJs2ebmGoQrRItmHeZ7vLVAcjk6TSeD1ObPUaFYbCp-JBfPxzRIJN967AWCbjas7BC_5IqBc06_DQVtuYIXCm32mr-zbT8HZQNZtl2oiNObBc"
                            />
                          </div>
                          <div className="text-[10px] font-label-caps text-tertiary-fixed">
                            GK
                          </div>
                          <div className="text-[10px] font-bold text-white truncate">
                            ALISSON
                          </div>
                          <div className="text-[10px] text-secondary">8.9</div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-around h-full py-8">
                        <div className="glass-card p-2 rounded-sm border border-white/10 w-24 text-center">
                          <div className="text-[10px] font-label-caps text-on-primary-container">
                            DEF
                          </div>
                          <div className="text-[10px] font-bold text-white">
                            VAN DIJK
                          </div>
                          <div className="text-[10px] text-secondary">8.7</div>
                        </div>
                        <div className="glass-card p-2 rounded-sm border border-white/10 w-24 text-center">
                          <div className="text-[10px] font-label-caps text-on-primary-container">
                            DEF
                          </div>
                          <div className="text-[10px] font-bold text-white">
                            MARQUINHOS
                          </div>
                          <div className="text-[10px] text-secondary">8.5</div>
                        </div>
                        <div className="glass-card p-2 rounded-sm border border-white/10 w-24 text-center">
                          <div className="text-[10px] font-label-caps text-on-primary-container">
                            DEF
                          </div>
                          <div className="text-[10px] font-bold text-white">
                            DAVIES
                          </div>
                          <div className="text-[10px] text-secondary">8.8</div>
                        </div>
                        <div className="glass-card p-2 rounded-sm border border-white/10 w-24 text-center">
                          <div className="text-[10px] font-label-caps text-on-primary-container">
                            DEF
                          </div>
                          <div className="text-[10px] font-bold text-white">
                            HAKIMI
                          </div>
                          <div className="text-[10px] text-secondary">8.6</div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-center gap-16 h-full">
                        <div className="glass-card p-2 rounded-sm border border-white/10 w-24 text-center">
                          <div className="text-[10px] font-label-caps text-on-primary-container">
                            MID
                          </div>
                          <div className="text-[10px] font-bold text-white">
                            DE BRUYNE
                          </div>
                          <div className="text-[10px] text-secondary">9.1</div>
                        </div>
                        <div className="glass-card p-2 rounded-sm border border-white/10 w-24 text-center">
                          <div className="text-[10px] font-label-caps text-on-primary-container">
                            MID
                          </div>
                          <div className="text-[10px] font-bold text-white">
                            RODRI
                          </div>
                          <div className="text-[10px] text-secondary">9.0</div>
                        </div>
                        <div className="glass-card p-2 rounded-sm border border-white/10 w-24 text-center">
                          <div className="text-[10px] font-label-caps text-on-primary-container">
                            MID
                          </div>
                          <div className="text-[10px] font-bold text-white">
                            BELLINGHAM
                          </div>
                          <div className="text-[10px] text-secondary">8.8</div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-center gap-16 h-full">
                        <div className="glass-card p-2 rounded-sm border border-tertiary-fixed/30 w-24 text-center">
                          <div className="w-16 h-16 mx-auto mb-2 bg-surface-container rounded-full overflow-hidden border border-outline-variant">
                            <img
                              alt="Mbappé"
                              className="w-full h-full object-cover"
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8oOjWgYwkzdVEev2IK10j_SXn4QYGnxA8wZ2SRtNvtrvowabR-7RttsQQW1s-AefSOim-hyJNgWxB8Wkt-tvNYmd_svBgeCvps23QjkphpchHlkMhp89qEJrAYK7yquBqdymjqGP0jCQqwimVKn9WzQ9_pB1ovRCsjeXcr_DWkH2k-kx6D5hO89_Xtiq7DNYiE3MtIh3r3KivhUYr2V1y4La_apy2jWqYZV1qCe-wKjjVgJI1OcDAuQG_Pa0Ppl0cXhbA9HK0M5g"
                            />
                          </div>
                          <div className="text-[10px] font-label-caps text-tertiary-fixed">
                            FWD
                          </div>
                          <div className="text-[10px] font-bold text-white">
                            MBAPPÉ
                          </div>
                          <div className="text-[10px] text-secondary">9.2</div>
                        </div>
                        <div className="glass-card p-2 rounded-sm border border-white/10 w-24 text-center">
                          <div className="text-[10px] font-label-caps text-on-primary-container">
                            FWD
                          </div>
                          <div className="text-[10px] font-bold text-white">
                            HAALAND
                          </div>
                          <div className="text-[10px] text-secondary">9.3</div>
                        </div>
                        <div className="glass-card p-2 rounded-sm border border-white/10 w-24 text-center">
                          <div className="text-[10px] font-label-caps text-on-primary-container">
                            FWD
                          </div>
                          <div className="text-[10px] font-bold text-white">
                            VINÍCIUS JR
                          </div>
                          <div className="text-[10px] text-secondary">9.0</div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 flex items-center gap-4 bg-primary/80 backdrop-blur-md px-4 py-2 border border-white/10">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-label-caps text-on-primary-container uppercase">
                          Tactical View
                        </span>
                        <span className="text-[10px] font-label-caps text-tertiary-fixed">
                          4-3-3 ATTACK
                        </span>
                      </div>
                      <div className="w-px h-6 bg-white/20"></div>
                      <span className="material-symbols-outlined text-white text-sm">
                        analytics
                      </span>
                    </div>
                  </div>
                </section>
              </div>
            </main>
          </>
        )}

        {/* VIEW 2: REAL-TIME TOURNAMENT STATS */}
        {currentView === "stats" && (
          <div
            className="text-white p-8 animate-fade-in max-w-7xl mx-auto min-h-[50vh]"
            data-backend-target="stats-view"
          >
            <h2 className="text-title-md font-display-lg text-on-primary uppercase tracking-wider mb-4">
              LIVE TOURNAMENT STATS
            </h2>
            <p className="text-body-md text-on-primary-container opacity-70">
              [Backend Hook: Dynamic Match Analytics, Player Leaderboards, and
              Group Stage Standings Engine]
            </p>
          </div>
        )}

        {/* VIEW 3: LIVE FAN EVENTS & POLLS */}
        {currentView === "events" && (
          <div
            className="text-white p-8 animate-fade-in max-w-7xl mx-auto min-h-[50vh]"
            data-backend-target="events-view"
          >
            <h2 className="text-title-md font-display-lg text-on-primary uppercase tracking-wider mb-4">
              Fan Engagement Zone
            </h2>
            <p className="text-body-md text-on-primary-container opacity-70">
              [Backend Hook: Interactive Live Poll Submission, Global Fan Event
              Feeds, and User Voting Submissions]
            </p>
          </div>
        )}

        {/* VIEW 4: TRIVIA GAME ENGINE */}
        {currentView === "trivia" && (
          <div className="flex justify-center items-center py-12 px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto min-h-[60vh] animate-fade-in">
            {React.createElement(trivia)}
          </div>
        )}
      </main>

      {/* FOOTER BAR */}
      <footer
        className="bg-primary-container dark:bg-black w-full px-margin-mobile md:px-margin-desktop py-lg flex flex-col md:flex-row justify-between items-center gap-md border-t border-outline-variant"
        data-purpose="site-footer"
      >
        <div className="flex flex-row items-center gap-sm">
          <img
            src="/trionda.png"
            alt="WC26"
            title="WC26"
            className="w-32 h-32 object-cover rounded-[3vh]"
          />
          <img
            src="/JK.png"
            alt="@JoshKoledoye"
            title="@JoshKoledoye"
            className="w-auto h-20 object-cover rounded-[3vh]"
          />
        </div>
        <div className="flex flex-col gap-4 items-center md:items-start">
          <h1 className="font-display-lg text-headline-lg text-on-primary-fixed uppercase">
            TriOnda 26
          </h1>
          <p className="font-body-md text-on-primary-fixed-variant text-center md:text-left max-w-sm">
            ©2026 TriOnda (This is a fan project, it does not hold any official
            ties with FIFA whatsoever)
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          <a
            className="font-label-caps text-label-caps text-on-primary-fixed-variant hover:text-tertiary transition-colors duration-200"
            href="#"
          ></a>
          <a
            className="font-label-caps text-label-caps text-on-primary-fixed-variant hover:text-tertiary transition-colors duration-200"
            href="#"
          ></a>
          <a
            className="font-label-caps text-label-caps text-on-primary-fixed-variant hover:text-tertiary transition-colors duration-200"
            href="https://www.youtube.com"
          >
            Contact US
          </a>
        </div>
      </footer>
    </>
  );
}
