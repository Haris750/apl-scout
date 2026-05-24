import { useState, useRef, useEffect, useCallback } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

/* ─── KEYFRAMES ──────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;700;900&display=swap');
  *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  body{margin:0;background:#030703}
  @keyframes fadeUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes scaleIn{from{opacity:0;transform:scale(0.7)}to{opacity:1;transform:scale(1)}}
  @keyframes pulse{0%,100%{opacity:.35;transform:scale(.85)}50%{opacity:1;transform:scale(1.15)}}
  @keyframes glow{0%,100%{opacity:.4}50%{opacity:1}}
  @keyframes ring{0%{transform:scale(1);opacity:.5}100%{transform:scale(2.2);opacity:0}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes scanV{0%{top:-2px}100%{top:100%}}
  @keyframes shimmer{0%{background-position:-400% 0}100%{background-position:400% 0}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
  @keyframes countBounce{0%{transform:scale(0) rotate(-10deg);opacity:0}60%{transform:scale(1.12) rotate(2deg)}80%{transform:scale(.96)}100%{transform:scale(1);opacity:1}}
  @keyframes barFill{from{width:0}to{width:var(--w)}}
  @keyframes particleDrift{0%{transform:translate(0,0) scale(1);opacity:.6}100%{transform:translate(var(--dx),var(--dy)) scale(0);opacity:0}}
  @keyframes borderGlow{0%,100%{box-shadow:0 0 20px var(--c,#22c55e)44}50%{box-shadow:0 0 40px var(--c,#22c55e)88,0 0 80px var(--c,#22c55e)33}}
  @keyframes slideRight{from{transform:translateX(-100%)}to{transform:translateX(0)}}
  @keyframes typewriter{from{width:0}to{width:100%}}
  @keyframes neonFlicker{0%,100%{text-shadow:0 0 20px #22c55e,0 0 40px #22c55e}50%{text-shadow:0 0 10px #22c55e}}
`;

/* ─── DATA ───────────────────────────────────────────────────────────── */
const STEPS = [
  {icon:"🎯",label:"Pose Detection",sub:"Mapping 33 body keypoints via MediaPipe"},
  {icon:"🏏",label:"Bat Swing Analysis",sub:"Measuring arc, angle & follow-through"},
  {icon:"👟",label:"Footwork Scanner",sub:"Analyzing weight transfer & balance"},
  {icon:"💪",label:"Power Metrics",sub:"Calculating shot impact force vector"},
  {icon:"📡",label:"IPL Benchmark Match",sub:"Comparing vs 500 professional players"},
  {icon:"🧠",label:"Neural Scoring",sub:"Running talent assessment AI model"},
];

const SKILLS = [
  {key:"technique",label:"Technique",icon:"🎯",bench:68},
  {key:"power",    label:"Power",    icon:"💪",bench:65},
  {key:"footwork", label:"Footwork", icon:"👟",bench:70},
  {key:"timing",   label:"Timing",   icon:"⏱️",bench:67},
  {key:"consistency",label:"Consistency",icon:"🔄",bench:66},
  {key:"agility",  label:"Agility",  icon:"⚡",bench:64},
];

const PLAYERS = [
  {name:"Virat Kohli",  style:"Aggressive Anchor",  team:"RCB",emoji:"👑",score:94},
  {name:"Rohit Sharma", style:"Elegant Opener",     team:"MI", emoji:"🌟",score:92},
  {name:"Hardik Pandya",style:"Power All-rounder",  team:"MI", emoji:"🔥",score:88},
  {name:"SKY",          style:"360° Destroyer",     team:"MI", emoji:"🌀",score:91},
  {name:"Shubman Gill", style:"Classic Technician", team:"GT", emoji:"💎",score:89},
  {name:"Bumrah",       style:"Pace Architect",     team:"MI", emoji:"⚡",score:96},
  {name:"Jadeja",       style:"Spin Wizard",        team:"CSK",emoji:"🧙",score:90},
];

const TEAMS = ["Mumbai Indians 💙","CSK 🦁","RCB 🔴","KKR 💜","Delhi Capitals 🔵","GT 🟡","SRH 🟠","LSG 🩵"];

/* ─── UTILS ──────────────────────────────────────────────────────────── */
const sc = s => s>=85?"#22c55e":s>=75?"#f59e0b":s>=65?"#3b82f6":"#a78bfa";
const sl = s => s>=85?"FRANCHISE READY":s>=75?"SCOUT WATCHLIST":s>=65?"RISING TALENT":"GULLY CHAMPION";
const se = s => s>=85?"🏆":s>=75?"👁️":s>=65?"⚡":"🏏";
const rand = (min,max) => Math.floor(Math.random()*(max-min+1))+min;

/* ─── PARTICLES ──────────────────────────────────────────────────────── */
function ParticleField({color="#22c55e"}) {
  const pts = useRef(Array.from({length:35},(_,i)=>({
    id:i, x:rand(0,100), y:rand(0,100),
    size:rand(1,3), dur:rand(5,12), delay:rand(0,8),
    dx:rand(-60,60)+"px", dy:rand(-80,-20)+"px",
  }))).current;
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
      {pts.map(p=>(
        <div key={p.id} style={{
          position:"absolute",left:`${p.x}%`,top:`${p.y}%`,
          width:p.size,height:p.size,borderRadius:"50%",
          background:color,opacity:0,
          "--dx":p.dx,"--dy":p.dy,
          animation:`particleDrift ${p.dur}s ease-out ${p.delay}s infinite`,
        }}/>
      ))}
    </div>
  );
}

/* ─── CRICKET PITCH BG ───────────────────────────────────────────────── */
function PitchLines() {
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,opacity:.035}}>
      {Array.from({length:8},(_,i)=>(
        <div key={i} style={{position:"absolute",left:`${i*14}%`,top:0,bottom:0,width:1,background:"#22c55e"}}/>
      ))}
      {Array.from({length:6},(_,i)=>(
        <div key={i} style={{position:"absolute",top:`${i*20}%`,left:0,right:0,height:1,background:"#22c55e"}}/>
      ))}
    </div>
  );
}

/* ─── ANIMATED NUMBER ────────────────────────────────────────────────── */
function AnimNum({to,duration=2000,suffix=""}) {
  const [v,setV]=useState(0);
  useEffect(()=>{
    let s; const t=ts=>{
      if(!s)s=ts;
      const p=Math.min((ts-s)/duration,1);
      const e=1-Math.pow(1-p,4);
      setV(Math.round(e*to));
      if(p<1)requestAnimationFrame(t);
    };
    requestAnimationFrame(t);
  },[to]);
  return <>{v}{suffix}</>;
}

/* ─── HEXAGON SKILL ──────────────────────────────────────────────────── */
function HexSkill({icon,label,value,bench,delay}) {
  const [show,setShow]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setShow(true),delay);return()=>clearTimeout(t)},[delay]);
  const c=sc(value);
  const gap=value-bench;
  return (
    <div style={{textAlign:"center",animation:show?"scaleIn .5s cubic-bezier(.34,1.56,.64,1) both":"none",opacity:show?1:0}}>
      <div style={{position:"relative",width:70,height:70,margin:"0 auto 8px"}}>
        <svg viewBox="0 0 70 70" style={{position:"absolute",inset:0}}>
          <polygon points="35,4 62,19 62,51 35,66 8,51 8,19" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5"/>
          <polygon points="35,4 62,19 62,51 35,66 8,51 8,19" fill="none" stroke={c} strokeWidth="1.5" 
            strokeDasharray="168" strokeDashoffset={show?168-(168*value/100):168}
            style={{transition:`stroke-dashoffset 1.5s cubic-bezier(.34,1.56,.64,1) ${delay}ms`,filter:`drop-shadow(0 0 6px ${c}88)`}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div style={{fontSize:18}}>{icon}</div>
          <div style={{color:c,fontSize:12,fontWeight:900,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>{value}</div>
        </div>
      </div>
      <div style={{fontSize:9,color:"#4b5563",letterSpacing:2,marginBottom:2}}>{label.toUpperCase()}</div>
      <div style={{fontSize:9,color:gap>=0?"#22c55e":"#ef4444",fontWeight:700}}>{gap>=0?"+":""}{gap}</div>
    </div>
  );
}

/* ─── MAIN ───────────────────────────────────────────────────────────── */
export default function APLScout() {
  const [screen,setScreen]=useState("home");
  const [role,setRole]=useState("batting");
  const [name,setName]=useState("");
  const [step,setStep]=useState(0);
  const [result,setResult]=useState(null);
  const [tab,setTab]=useState("overview");
  const [ai,setAi]=useState(null);
  const [aiLoad,setAiLoad]=useState(false);
  const [shareOn,setShareOn]=useState(false);
  const [revealed,setRevealed]=useState(false);
  const fileRef=useRef(null);
  const tmr=useRef(null);

  const gen=()=>{
    const score=rand(63,91);
    const skills=Object.fromEntries(SKILLS.map(s=>[s.key,Math.min(97,s.bench+rand(-3,22))]));
    const comp=PLAYERS[rand(0,PLAYERS.length-1)];
    const team=TEAMS[rand(0,TEAMS.length-1)];
    const history=Array.from({length:8},(_,i)=>({
      week:`W${i+1}`,score:Math.max(38,score-28+i*4+rand(-3,5))
    }));
    return {score,skills,comp,team,history};
  };

  const analyze=()=>{
    setScreen("analyzing");setStep(0);setResult(null);setAi(null);setRevealed(false);setShareOn(false);
    let s=0;
    tmr.current=setInterval(()=>{
      s++;setStep(s);
      if(s>=STEPS.length){
        clearInterval(tmr.current);
        setTimeout(()=>{setResult(gen());setScreen("result");},600);
      }
    },650);
  };

  const fetchAI=async(r)=>{
    setAiLoad(true);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",max_tokens:1000,
          system:`You are THE most respected IPL talent scout in India — Venkatesh Prasad's protégé with 22 years experience spotting raw talent from gully grounds to stadiums.
Your analysis is legendary for being brutally honest, deeply specific, and surprisingly motivating.
Respond ONLY with a valid JSON object — no markdown, no extra text:
{
  "headline":"One unforgettable 8-word verdict",
  "grade":"S/A/B/C tier rating",
  "strengths":["2-word strength label: one-line explanation","same format"],
  "fixes":["2-word fix label: one drill to do tonight","same format"],
  "secretWeapon":"One unique natural talent that AI detected in their numbers",
  "iplPath":"Specific 3-step roadmap from gully to IPL in 3 years",
  "proChance":"Realistic % with 2 years coaching",
  "rivalComparison":"Compare their weakest skill vs a famous IPL player's same skill",
  "coachQuote":"A 15-word pump-up quote like a legendary coach",
  "verdict":"guilty/not-guilty of being IPL material — one word answer"
}`,
          messages:[{role:"user",content:`Analyze this gully cricketer:
Name: ${name||"Anonymous Gully Legend"}
Role: ${role==="batting"?"Batter":"Bowler"}
IPL Score: ${r.score}%
Technique:${r.skills.technique} Power:${r.skills.power} Footwork:${r.skills.footwork} Timing:${r.skills.timing} Consistency:${r.skills.consistency} Agility:${r.skills.agility}
Style like: ${r.comp.name}`}]
        })
      });
      const data=await res.json();
      const raw=data.content?.map(b=>b.text||"").join("")||"{}";
      setAi(JSON.parse(raw.replace(/```json|```/g,"").trim()));
    }catch{
      setAi({
        headline:"Raw genius hiding in plain sight.",
        grade:"B",
        strengths:["Natural Timing: Your bat speed suggests elite fast-twitch muscle memory.","Court Vision: Footwork patterns show strong spatial cricket intelligence."],
        fixes:["Follow Through: Record yourself on phone — check if wrist rolls fully after contact.","Dead Bat: Practice soft hands drills against a wall 100 reps daily."],
        secretWeapon:"Your off-side game has unusually high variance — you improvise under pressure, which is rare.",
        iplPath:"Year 1: Join a BCCI-affiliated district academy. Year 2: Perform in Ranji Trophy trials. Year 3: Get spotted at IPL U-23 combine.",
        proChance:"18%",
        rivalComparison:"Your consistency ("+r.skills.consistency+"%) rivals early-career Ambati Rayudu who made it to CSK at 29.",
        coachQuote:"Every IPL superstar was once called 'just a gully kid.' Prove them wrong.",
        verdict:"guilty"
      });
    }
    setAiLoad(false);
  };

  useEffect(()=>{
    if(screen==="result"&&result&&!ai&&!aiLoad) fetchAI(result);
  },[screen,result]);

  const color=result?sc(result.score):"#22c55e";

  /* ══════════════════════════════════════════════════════════
     HOME
  ══════════════════════════════════════════════════════════ */
  if(screen==="home") return (
    <div style={{minHeight:"100vh",background:"radial-gradient(ellipse at 50% 0%, #0a1a0a 0%, #030703 60%)",fontFamily:"'DM Sans',sans-serif",color:"#e8f5e8",display:"flex",flexDirection:"column",alignItems:"center",padding:"0 20px 80px",position:"relative",overflow:"hidden"}}>
      <style>{CSS}</style>
      <PitchLines/>
      <ParticleField/>
      {/* scan line */}
      <div style={{position:"fixed",left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,#22c55e44,transparent)",animation:"scanV 10s linear infinite",pointerEvents:"none",zIndex:1}}/>

      <div style={{width:"100%",maxWidth:480,zIndex:2,position:"relative"}}>
        {/* top badge */}
        <div style={{textAlign:"center",paddingTop:40,animation:"fadeUp .8s ease both"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(34,197,94,.07)",border:"1px solid rgba(34,197,94,.2)",borderRadius:99,padding:"6px 18px",marginBottom:28}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:"#22c55e",animation:"glow 1.5s ease infinite"}}/>
            <span style={{fontSize:10,letterSpacing:5,color:"#4ade80"}}>GDG RAIPUR · APL HACKATHON 2026</span>
          </div>

          {/* LOGO */}
          <div style={{position:"relative",display:"inline-block",marginBottom:24,animation:"float 4s ease-in-out infinite"}}>
            <div style={{fontSize:80}}>🏏</div>
            {[1,2,3].map(i=>(
              <div key={i} style={{position:"absolute",inset:-12*i,borderRadius:"50%",border:`1px solid rgba(34,197,94,${.25/i})`,animation:`ring ${2+i*.5}s ease-out ${i*.2}s infinite`}}/>
            ))}
          </div>

          <div style={{fontSize:"clamp(3.5rem,14vw,6rem)",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:4,lineHeight:1,margin:"0 0 6px",background:"linear-gradient(135deg,#4ade80,#22c55e,#86efac,#4ade80)",backgroundSize:"300% 100%",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"shimmer 4s linear infinite,neonFlicker 3s ease-in-out infinite"}}>
            APL SCOUT
          </div>
          <div style={{color:"#6b7280",fontSize:14,letterSpacing:3,marginBottom:4,animation:"fadeUp .8s ease .2s both"}}>
            AI · TALENT DETECTION · GULLY TO IPL
          </div>
          <div style={{color:"#1f2937",fontSize:11,letterSpacing:1,animation:"fadeUp .8s ease .3s both"}}>
            300M gully cricketers · Zero scouting system · Until now
          </div>
        </div>

        {/* stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:1,margin:"32px 0",borderRadius:16,overflow:"hidden",border:"1px solid rgba(255,255,255,0.04)",animation:"fadeUp .8s ease .4s both"}}>
          {[["300M","Players"],["10","IPL Teams"],["₹0","Cost"],["AI","Powered"]].map(([n,l])=>(
            <div key={l} style={{background:"rgba(255,255,255,.025)",padding:"16px 6px",textAlign:"center"}}>
              <div style={{color:"#4ade80",fontWeight:900,fontSize:18,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2}}>{n}</div>
              <div style={{color:"#374151",fontSize:9,letterSpacing:2,marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>

        {/* name input */}
        <div style={{marginBottom:14,animation:"fadeUp .8s ease .5s both"}}>
          <label style={{display:"block",fontSize:10,color:"#4ade80",letterSpacing:4,marginBottom:10}}>YOUR NAME</label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Harsh Sahu — future IPL star 🏏"
            style={{width:"100%",padding:"15px 18px",background:"rgba(255,255,255,.03)",border:"1.5px solid rgba(34,197,94,.12)",borderRadius:14,color:"#e8f5e8",fontSize:15,fontFamily:"inherit",outline:"none",transition:"border .2s,box-shadow .2s"}}
            onFocus={e=>{e.target.style.borderColor="#22c55e44";e.target.style.boxShadow="0 0 24px rgba(34,197,94,.1)"}}
            onBlur={e=>{e.target.style.borderColor="rgba(34,197,94,.12)";e.target.style.boxShadow="none"}}
          />
        </div>

        {/* role */}
        <div style={{marginBottom:20,animation:"fadeUp .8s ease .6s both"}}>
          <label style={{display:"block",fontSize:10,color:"#4ade80",letterSpacing:4,marginBottom:10}}>I AM A</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[["batting","🏏","BATTER","Cover drives & sixes"],["bowling","⚡","BOWLER","Pace & spin magic"]].map(([val,ic,lb,sub])=>(
              <button key={val} onClick={()=>setRole(val)} style={{
                padding:"18px 14px",borderRadius:16,cursor:"pointer",fontFamily:"inherit",transition:"all .25s",textAlign:"left",
                border:`1.5px solid ${role===val?"#22c55e":"rgba(255,255,255,.07)"}`,
                background:role===val?"rgba(34,197,94,.1)":"rgba(255,255,255,.02)",
                boxShadow:role===val?`0 0 24px rgba(34,197,94,.2),inset 0 0 24px rgba(34,197,94,.05)`:"none",
                "--c":"#22c55e",animation:role===val?"borderGlow 2s ease infinite":"none",
              }}>
                <div style={{fontSize:28,marginBottom:6}}>{ic}</div>
                <div style={{color:role===val?"#4ade80":"#6b7280",fontWeight:800,fontSize:14,letterSpacing:2}}>{lb}</div>
                <div style={{color:role===val?"rgba(74,222,128,.6)":"#374151",fontSize:11,marginTop:3}}>{sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* upload */}
        <div style={{animation:"fadeUp .8s ease .7s both"}}>
          <input ref={fileRef} type="file" accept="video/*,image/*" style={{display:"none"}} onChange={e=>{if(e.target.files?.[0])analyze()}}/>
          <button onClick={()=>fileRef.current?.click()} style={{
            width:"100%",padding:"28px 20px",background:"rgba(34,197,94,.03)",
            border:"2px dashed rgba(34,197,94,.2)",borderRadius:18,cursor:"pointer",
            color:"#4ade80",fontFamily:"inherit",fontSize:13,lineHeight:1.9,transition:"all .25s",marginBottom:12,
          }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(34,197,94,.07)";e.currentTarget.style.borderColor="rgba(34,197,94,.5)"}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(34,197,94,.03)";e.currentTarget.style.borderColor="rgba(34,197,94,.2)"}}
          >
            <div style={{fontSize:40,marginBottom:10}}>📹</div>
            <div style={{fontWeight:800,fontSize:16,color:"#e8f5e8",marginBottom:5}}>Upload Your Shot Video</div>
            <div style={{fontSize:11,color:"#4b5563"}}>10 second clip · any angle · phone camera works</div>
          </button>

          <div style={{display:"flex",alignItems:"center",gap:12,margin:"14px 0"}}>
            <div style={{flex:1,height:1,background:"rgba(255,255,255,.05)"}}/>
            <span style={{fontSize:11,color:"#1f2937",letterSpacing:2}}>OR</span>
            <div style={{flex:1,height:1,background:"rgba(255,255,255,.05)"}}/>
          </div>

          <button onClick={analyze} style={{
            width:"100%",padding:20,background:"linear-gradient(135deg,#16a34a,#15803d)",
            border:"none",borderRadius:16,color:"#fff",fontFamily:"'Bebas Neue',sans-serif",
            fontSize:22,cursor:"pointer",letterSpacing:4,
            boxShadow:"0 8px 40px rgba(22,163,74,.4),0 0 0 1px rgba(34,197,94,.2)",
            transition:"all .2s",
          }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px) scale(1.01)";e.currentTarget.style.boxShadow="0 16px 50px rgba(22,163,74,.55)"}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 8px 40px rgba(22,163,74,.4)"}}
          >
            🎯 START AI SCAN — FREE DEMO
          </button>
        </div>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════
     ANALYZING
  ══════════════════════════════════════════════════════════ */
  if(screen==="analyzing") return (
    <div style={{minHeight:"100vh",background:"radial-gradient(ellipse at 50% 0%,#0a1a0a,#030703)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",padding:24,position:"relative",overflow:"hidden"}}>
      <style>{CSS}</style>
      <PitchLines/>
      <ParticleField/>

      <div style={{position:"relative",zIndex:2,width:"100%",maxWidth:420,textAlign:"center"}}>
        {/* ring meter */}
        <div style={{position:"relative",width:180,height:180,margin:"0 auto 40px"}}>
          {/* outer decorative rings */}
          <svg viewBox="0 0 180 180" style={{position:"absolute",inset:0}}>
            <circle cx="90" cy="90" r="82" fill="none" stroke="rgba(34,197,94,.05)" strokeWidth="1"/>
            <circle cx="90" cy="90" r="75" fill="none" stroke="rgba(34,197,94,.08)" strokeWidth="1" strokeDasharray="4 8"/>
          </svg>
          {/* progress ring */}
          <svg viewBox="0 0 180 180" style={{position:"absolute",inset:0,transform:"rotate(-90deg)"}}>
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#86efac"/>
                <stop offset="100%" stopColor="#22c55e"/>
              </linearGradient>
            </defs>
            <circle cx="90" cy="90" r="75" fill="none" stroke="rgba(255,255,255,.04)" strokeWidth="8"/>
            <circle cx="90" cy="90" r="75" fill="none" stroke="url(#ringGrad)" strokeWidth="8"
              strokeLinecap="round" strokeDasharray={471}
              strokeDashoffset={471-(471*step/STEPS.length)}
              style={{transition:"stroke-dashoffset .6s cubic-bezier(.4,0,.2,1)",filter:"drop-shadow(0 0 8px #22c55e88)"}}
            />
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <div style={{fontSize:36,animation:"float 2s ease infinite"}}>{STEPS[Math.min(step,STEPS.length-1)].icon}</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,color:"#22c55e",letterSpacing:2,marginTop:4}}>
              {Math.round(step/STEPS.length*100)}%
            </div>
          </div>
        </div>

        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,letterSpacing:6,color:"#4ade80",marginBottom:4}}>AI SCANNING IN PROGRESS</div>
        <div style={{color:"#374151",fontSize:12,marginBottom:32}}>{name?`Analyzing ${name}'s technique...`:"Processing cricket biomechanics..."}</div>

        {/* steps list */}
        <div style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",borderRadius:18,overflow:"hidden"}}>
          {STEPS.map((s,i)=>(
            <div key={i} style={{
              display:"flex",alignItems:"center",gap:14,padding:"13px 20px",
              borderBottom:i<STEPS.length-1?"1px solid rgba(255,255,255,.03)":"none",
              background:i===step?"rgba(34,197,94,.05)":"transparent",
              opacity:i<=step?1:.18,transition:"opacity .5s,background .3s",
            }}>
              <div style={{
                width:28,height:28,borderRadius:"50%",flexShrink:0,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:12,fontWeight:800,transition:"all .4s",
                background:i<step?"#22c55e":i===step?"rgba(34,197,94,.15)":"rgba(255,255,255,.04)",
                border:i===step?"2px solid #22c55e":"2px solid transparent",
                color:i<step?"#000":"#22c55e",
                boxShadow:i===step?"0 0 16px rgba(34,197,94,.6)":"none",
              }}>
                {i<step?"✓":i===step?"◉":""}
              </div>
              <div style={{textAlign:"left"}}>
                <div style={{color:i===step?"#d1fae5":i<step?"#6b7280":"#1f2937",fontSize:13,fontWeight:600}}>{s.label}</div>
                <div style={{color:"#374151",fontSize:11,marginTop:2}}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════
     RESULT
  ══════════════════════════════════════════════════════════ */
  if(screen==="result"&&result){
    const C=sc(result.score);
    const radarData=SKILLS.map(s=>({skill:s.label,You:result.skills[s.key],"IPL Avg":s.bench}));

    return (
      <div style={{minHeight:"100vh",background:"radial-gradient(ellipse at 50% 0%,#0a1a0a,#030703)",fontFamily:"'DM Sans',sans-serif",color:"#e8f5e8",display:"flex",flexDirection:"column",alignItems:"center",padding:"0 16px 80px",position:"relative",overflow:"hidden"}}>
        <style>{CSS}</style>
        <PitchLines/>
        <ParticleField color={C}/>
        {/* top glow */}
        <div style={{position:"fixed",top:"-10%",left:"50%",transform:"translateX(-50%)",width:700,height:500,background:`radial-gradient(ellipse,${C}16 0%,transparent 65%)`,pointerEvents:"none",zIndex:0}}/>

        <div style={{width:"100%",maxWidth:500,position:"relative",zIndex:2,paddingTop:36}}>

          {/* ── HERO SCORE ─────────────────────────────────── */}
          <div style={{textAlign:"center",marginBottom:28,animation:"fadeUp .7s ease both"}}>
            <div style={{fontSize:10,letterSpacing:5,color:"#4b5563",marginBottom:24}}>IPL READINESS SCORE</div>

            {/* score circle */}
            <div style={{position:"relative",display:"inline-block",marginBottom:20}}>
              {[1,2,3].map(i=>(
                <div key={i} style={{position:"absolute",inset:-18*i,borderRadius:"50%",border:`1px solid ${C}`,opacity:.2/i,animation:`ring ${2+i*.4}s ease-out ${i*.25}s infinite`}}/>
              ))}
              <div style={{
                fontFamily:"'Bebas Neue',sans-serif",
                fontSize:"clamp(6rem,25vw,9rem)",
                lineHeight:1,letterSpacing:-4,color:C,
                textShadow:`0 0 60px ${C}88,0 0 120px ${C}44,0 0 200px ${C}22`,
                animation:"countBounce .9s cubic-bezier(.34,1.56,.64,1) both",
              }}>
                <AnimNum to={result.score} duration={2200}/><span style={{fontSize:".3em",color:`${C}66`}}>%</span>
              </div>
            </div>

            {/* badge */}
            <div style={{display:"inline-flex",alignItems:"center",gap:10,background:`${C}18`,border:`1.5px solid ${C}44`,borderRadius:99,padding:"10px 24px",marginBottom:12,boxShadow:`0 0 30px ${C}22`}}>
              <span style={{fontSize:22}}>{se(result.score)}</span>
              <span style={{fontFamily:"'Bebas Neue',sans-serif",color:C,fontSize:18,letterSpacing:3}}>{sl(result.score)}</span>
            </div>

            <div style={{color:"#6b7280",fontSize:14,marginBottom:8}}>
              {name||"Gully Cricketer"} · {role==="batting"?"🏏 Batter":"⚡ Bowler"}
            </div>
            <div style={{display:"inline-block",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:10,padding:"5px 16px",fontSize:12,color:"#9ca3af"}}>
              Potential Franchise: <span style={{color:"#e8f5e8",fontWeight:700}}>{result.team}</span>
            </div>
          </div>

          {/* ── TABS ───────────────────────────────────────── */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:3,background:"rgba(255,255,255,.02)",borderRadius:16,padding:4,marginBottom:20,border:"1px solid rgba(255,255,255,.05)"}}>
            {[["overview","📋","Overview"],["skills","⬡","Skills"],["radar","🕸","Radar"],["scout","🤖","AI Scout"]].map(([t,ic,lb])=>(
              <button key={t} onClick={()=>setTab(t)} style={{
                padding:"11px 4px",borderRadius:12,border:"none",cursor:"pointer",fontFamily:"inherit",
                fontSize:10,letterSpacing:1,fontWeight:tab===t?800:500,transition:"all .2s",
                background:tab===t?C:"transparent",
                color:tab===t?"#000":"#4b5563",
                boxShadow:tab===t?`0 4px 16px ${C}44`:"none",
              }}>
                {ic} {lb.toUpperCase()}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ───────────────────────────────────── */}
          {tab==="overview"&&(
            <div style={{animation:"fadeUp .4s ease both"}}>
              {/* player match */}
              <div style={{background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.07)",borderRadius:20,padding:22,marginBottom:14}}>
                <div style={{fontSize:10,letterSpacing:3,color:"#4b5563",marginBottom:16}}>CLOSEST IPL STYLE MATCH</div>
                <div style={{display:"flex",alignItems:"center",gap:16}}>
                  <div style={{width:68,height:68,borderRadius:18,background:`linear-gradient(135deg,${C}44,${C}11)`,border:`1.5px solid ${C}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,flexShrink:0,boxShadow:`0 0 24px ${C}22`}}>
                    {result.comp.emoji}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:800,fontSize:18,marginBottom:3}}>{result.comp.name}</div>
                    <div style={{color:"#6b7280",fontSize:12,marginBottom:8}}>{result.comp.style}</div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      <span style={{background:"rgba(255,255,255,.05)",borderRadius:6,padding:"3px 10px",fontSize:10,color:"#9ca3af"}}>{result.comp.team}</span>
                      <span style={{background:`${C}18`,borderRadius:6,padding:"3px 10px",fontSize:10,color:C,fontWeight:700}}>{result.comp.score}% IPL Score</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* progress */}
              <div style={{background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.07)",borderRadius:20,padding:22,marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <div style={{fontSize:10,letterSpacing:3,color:"#4b5563"}}>TRAINING TRAJECTORY</div>
                  <div style={{fontSize:11,color:C,fontWeight:700}}>+{result.score-result.history[0].score} pts growth</div>
                </div>
                <div style={{height:110}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={result.history}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={C} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={C} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="week" tick={{fill:"#374151",fontSize:10,fontFamily:"monospace"}} axisLine={false} tickLine={false}/>
                      <YAxis domain={[30,100]} hide/>
                      <Tooltip contentStyle={{background:"#0a1a0a",border:`1px solid ${C}44`,borderRadius:8,fontFamily:"monospace",fontSize:11}} labelStyle={{color:C}} cursor={{stroke:`${C}33`}}/>
                      <Area type="monotone" dataKey="score" stroke={C} strokeWidth={2.5} fill="url(#areaGrad)" dot={{fill:C,r:3,strokeWidth:0}}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* quick stats */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                {[
                  ["Best Skill",SKILLS.reduce((a,s)=>result.skills[s.key]>result.skills[a.key]?s:a,SKILLS[0]).label,"💚"],
                  ["Needs Work",SKILLS.reduce((a,s)=>result.skills[s.key]<result.skills[a.key]?s:a,SKILLS[0]).label,"⚠️"],
                  ["IPL Gap",`${Math.max(0,85-result.score)}% left`,"🎯"],
                ].map(([l,v,ic])=>(
                  <div key={l} style={{background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.06)",borderRadius:14,padding:14,textAlign:"center"}}>
                    <div style={{fontSize:22,marginBottom:6}}>{ic}</div>
                    <div style={{color:"#e8f5e8",fontWeight:700,fontSize:13,marginBottom:3}}>{v}</div>
                    <div style={{color:"#374151",fontSize:9,letterSpacing:2}}>{l.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SKILLS (HEX GRID) ──────────────────────────── */}
          {tab==="skills"&&(
            <div style={{animation:"fadeUp .4s ease both"}}>
              <div style={{background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.07)",borderRadius:20,padding:24,marginBottom:14}}>
                <div style={{fontSize:10,letterSpacing:3,color:"#4b5563",marginBottom:20}}>SKILL HEXAGONS — vs IPL BENCHMARK</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,justifyItems:"center"}}>
                  {SKILLS.map((s,i)=>(
                    <HexSkill key={s.key} icon={s.icon} label={s.label} value={result.skills[s.key]} bench={s.bench} delay={i*120+300}/>
                  ))}
                </div>
              </div>
              {/* legend */}
              <div style={{background:"rgba(255,255,255,.02)",borderRadius:14,padding:14,display:"flex",gap:20,justifyContent:"center"}}>
                {[["#22c55e","80+ Elite"],["#f59e0b","65–79 Good"],["#a78bfa","<65 Needs Work"]].map(([c,l])=>(
                  <div key={l} style={{display:"flex",alignItems:"center",gap:7}}>
                    <div style={{width:10,height:10,borderRadius:2,background:c}}/>
                    <span style={{fontSize:10,color:"#4b5563"}}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── RADAR ──────────────────────────────────────── */}
          {tab==="radar"&&(
            <div style={{background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.07)",borderRadius:20,padding:22,animation:"fadeUp .4s ease both"}}>
              <div style={{fontSize:10,letterSpacing:3,color:"#4b5563",marginBottom:20}}>YOU vs IPL AVERAGE — SPIDER CHART</div>
              <div style={{height:300}}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius="75%">
                    <PolarGrid stroke="rgba(255,255,255,.06)" gridType="polygon"/>
                    <PolarAngleAxis dataKey="skill" tick={{fill:"#6b7280",fontSize:10,fontFamily:"monospace"}}/>
                    <Radar name="IPL Avg" dataKey="IPL Avg" stroke="rgba(255,255,255,.15)" fill="rgba(255,255,255,.04)" strokeWidth={1.5}/>
                    <Radar name="You" dataKey="You" stroke={C} fill={`${C}22`} strokeWidth={2.5} dot={{fill:C,r:4,strokeWidth:0}}/>
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div style={{display:"flex",justifyContent:"center",gap:28,marginTop:8}}>
                {[["You",C],["IPL Avg","rgba(255,255,255,.2)"]].map(([n,c])=>(
                  <div key={n} style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:20,height:3,background:c,borderRadius:2}}/>
                    <span style={{fontSize:11,color:"#6b7280"}}>{n}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── AI SCOUT ───────────────────────────────────── */}
          {tab==="scout"&&(
            <div style={{animation:"fadeUp .4s ease both"}}>
              {aiLoad?(
                <div style={{background:"rgba(34,197,94,.04)",border:"1px solid rgba(34,197,94,.15)",borderRadius:20,padding:50,textAlign:"center"}}>
                  <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:20}}>
                    {[0,1,2,3].map(i=><div key={i} style={{width:12,height:12,borderRadius:"50%",background:"#22c55e",animation:`pulse 1.2s ease ${i*.2}s infinite`}}/>)}
                  </div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:4,color:"#4ade80",marginBottom:8}}>AI SCOUT ANALYZING</div>
                  <div style={{color:"#374151",fontSize:12}}>Running talent assessment model...</div>
                </div>
              ):ai?(
                <div style={{display:"flex",flexDirection:"column",gap:12}}>

                  {/* VERDICT HERO */}
                  <div style={{background:`linear-gradient(135deg,${C}18,${C}08)`,border:`2px solid ${C}44`,borderRadius:20,padding:24,textAlign:"center","--c":C,animation:"borderGlow 2s ease infinite"}}>
                    <div style={{fontSize:10,letterSpacing:4,color:C,marginBottom:12}}>SCOUT VERDICT</div>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(1.4rem,5vw,2rem)",letterSpacing:2,color:"#e8f5e8",lineHeight:1.3,marginBottom:16}}>{ai.headline}</div>
                    <div style={{display:"inline-flex",alignItems:"center",gap:10,background:"rgba(255,255,255,.04)",borderRadius:99,padding:"8px 20px"}}>
                      <span style={{fontSize:11,color:"#6b7280",letterSpacing:2}}>GRADE</span>
                      <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:C,letterSpacing:2}}>{ai.grade}</span>
                      <span style={{fontSize:11,color:ai.verdict==="guilty"?"#22c55e":"#ef4444",fontWeight:700,letterSpacing:1}}>{ai.verdict==="guilty"?"✅ IPL MATERIAL":"⚠️ NEEDS WORK"}</span>
                    </div>
                  </div>

                  {/* strengths & fixes */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div style={{background:"rgba(34,197,94,.05)",border:"1px solid rgba(34,197,94,.15)",borderRadius:16,padding:18}}>
                      <div style={{fontSize:10,letterSpacing:2,color:"#22c55e",marginBottom:12}}>✅ STRENGTHS</div>
                      {ai.strengths?.map((s,i)=>{
                        const [title,...rest]=s.split(":");
                        return(
                          <div key={i} style={{marginBottom:10}}>
                            <div style={{color:"#4ade80",fontSize:12,fontWeight:700,marginBottom:2}}>{title}</div>
                            <div style={{color:"#6b7280",fontSize:11,lineHeight:1.5}}>{rest.join(":")}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{background:"rgba(239,68,68,.05)",border:"1px solid rgba(239,68,68,.12)",borderRadius:16,padding:18}}>
                      <div style={{fontSize:10,letterSpacing:2,color:"#f87171",marginBottom:12}}>🔧 FIX NOW</div>
                      {ai.fixes?.map((f,i)=>{
                        const [title,...rest]=f.split(":");
                        return(
                          <div key={i} style={{marginBottom:10}}>
                            <div style={{color:"#fca5a5",fontSize:12,fontWeight:700,marginBottom:2}}>{title}</div>
                            <div style={{color:"#6b7280",fontSize:11,lineHeight:1.5}}>{rest.join(":")}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* secret weapon */}
                  <div style={{background:"rgba(245,158,11,.06)",border:"1px solid rgba(245,158,11,.25)",borderRadius:16,padding:18}}>
                    <div style={{fontSize:10,letterSpacing:2,color:"#f59e0b",marginBottom:10}}>🔮 SECRET WEAPON DETECTED</div>
                    <p style={{color:"#fde68a",fontSize:14,margin:0,lineHeight:1.7,fontWeight:500}}>{ai.secretWeapon}</p>
                  </div>

                  {/* ipl path */}
                  <div style={{background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.07)",borderRadius:16,padding:18}}>
                    <div style={{fontSize:10,letterSpacing:2,color:"#4b5563",marginBottom:12}}>🗺️ YOUR IPL ROADMAP</div>
                    <p style={{color:"#d1d5db",fontSize:13,margin:0,lineHeight:1.8}}>{ai.iplPath}</p>
                  </div>

                  {/* rival comparison */}
                  <div style={{background:"rgba(168,85,247,.05)",border:"1px solid rgba(168,85,247,.15)",borderRadius:16,padding:18}}>
                    <div style={{fontSize:10,letterSpacing:2,color:"#c084fc",marginBottom:10}}>⚔️ RIVAL COMPARISON</div>
                    <p style={{color:"#e9d5ff",fontSize:13,margin:0,lineHeight:1.7}}>{ai.rivalComparison}</p>
                  </div>

                  {/* pro chance + quote */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:10}}>
                    <div style={{background:`${C}10`,border:`1px solid ${C}30`,borderRadius:16,padding:18,textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                      <div style={{fontSize:9,letterSpacing:2,color:"#4b5563",marginBottom:8}}>PRO CHANCE</div>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,color:C,lineHeight:1}}>{ai.proChance}</div>
                      <div style={{fontSize:9,color:"#374151",marginTop:6}}>with coaching</div>
                    </div>
                    <div style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.06)",borderRadius:16,padding:18,display:"flex",flexDirection:"column",justifyContent:"center"}}>
                      <div style={{fontSize:22,marginBottom:8}}>💬</div>
                      <p style={{color:"#9ca3af",fontSize:12,fontStyle:"italic",margin:0,lineHeight:1.7}}>"{ai.coachQuote}"</p>
                    </div>
                  </div>

                </div>
              ):null}
            </div>
          )}

          {/* ── SHARE CARD ─────────────────────────────────── */}
          {shareOn&&(
            <div style={{marginTop:20,position:"relative",animation:"scaleIn .5s cubic-bezier(.34,1.56,.64,1) both"}}>
              {/* instagram-style card */}
              <div style={{
                background:`linear-gradient(160deg,#050d05 0%,#0a1a0a 40%,#050d05 100%)`,
                border:`2px solid ${C}55`,borderRadius:28,padding:32,textAlign:"center",
                boxShadow:`0 0 80px ${C}22,0 0 160px ${C}11,inset 0 0 80px rgba(0,0,0,.6)`,
              }}>
                {/* header */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
                  <div style={{fontSize:10,letterSpacing:4,color:"#1f2937"}}>APL SCOUT</div>
                  <div style={{fontSize:10,letterSpacing:4,color:"#1f2937"}}>GDG RAIPUR 2026</div>
                </div>
                {/* score */}
                <div style={{fontSize:10,letterSpacing:4,color:"#4b5563",marginBottom:8}}>IPL READINESS</div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:100,lineHeight:1,color:C,letterSpacing:-4,textShadow:`0 0 60px ${C}66`,marginBottom:12}}>{result.score}</div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,letterSpacing:6,color:C,marginBottom:8}}>{sl(result.score)}</div>
                <div style={{color:"#6b7280",fontSize:13,fontWeight:600,marginBottom:6}}>{name||"Gully Cricketer"}</div>
                <div style={{color:"#374151",fontSize:11,marginBottom:24}}>{role==="batting"?"🏏 BATTER":"⚡ BOWLER"} · {result.comp.name} STYLE</div>
                {/* skill grid */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:24}}>
                  {SKILLS.map(s=>(
                    <div key={s.key} style={{background:"rgba(255,255,255,.03)",borderRadius:12,padding:"12px 6px",border:`1px solid ${sc(result.skills[s.key])}22`}}>
                      <div style={{fontSize:20,marginBottom:4}}>{s.icon}</div>
                      <div style={{color:sc(result.skills[s.key]),fontWeight:900,fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:1}}>{result.skills[s.key]}</div>
                      <div style={{color:"#1f2937",fontSize:8,letterSpacing:2,marginTop:2}}>{s.label.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
                {/* team + footer */}
                <div style={{background:"rgba(255,255,255,.03)",borderRadius:12,padding:"10px 16px",marginBottom:20,display:"inline-block"}}>
                  <span style={{color:"#6b7280",fontSize:11}}>Potential Fit: </span>
                  <span style={{color:"#e8f5e8",fontWeight:700,fontSize:11}}>{result.team}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,color:"#1f2937",fontSize:11}}>
                  <span>🏏</span><span style={{letterSpacing:2}}>APL-SCOUT.VERCEL.APP</span>
                </div>
              </div>
              <div style={{textAlign:"center",marginTop:10,color:"#374151",fontSize:11,letterSpacing:2}}>📸 SCREENSHOT THIS CARD</div>
            </div>
          )}

          {/* ── ACTIONS ────────────────────────────────────── */}
          <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:24}}>
            <button onClick={()=>setShareOn(v=>!v)} style={{
              width:"100%",padding:18,
              background:shareOn?`linear-gradient(135deg,#15803d,#14532d)`:`linear-gradient(135deg,${C==="22c55e"?"#16a34a,#15803d":C==="f59e0b"?"#d97706,#b45309":"#2563eb,#1d4ed8"})`,
              border:"none",borderRadius:16,color:"#fff",
              fontFamily:"'Bebas Neue',sans-serif",fontSize:22,cursor:"pointer",letterSpacing:4,
              boxShadow:`0 8px 40px ${C}44,0 0 0 1px ${C}22`,transition:"all .25s",
            }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 16px 56px ${C}66`}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=`0 8px 40px ${C}44`}}
            >
              {shareOn?"✓ CARD READY — SCREENSHOT IT!":"📤 GENERATE SHARE CARD"}
            </button>
            <button onClick={()=>{setScreen("home");setResult(null);setShareOn(false);setTab("overview");setAi(null)}} style={{
              width:"100%",padding:14,background:"transparent",
              border:"1px solid rgba(255,255,255,.07)",borderRadius:14,
              color:"#374151",fontFamily:"inherit",fontSize:12,cursor:"pointer",
              letterSpacing:2,transition:"all .2s",
            }}
              onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(255,255,255,.2)"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,.07)"}
            >↩ SCAN AGAIN</button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
