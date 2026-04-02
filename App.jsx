import { useState, useEffect, useCallback, useRef } from "react";

const SUPABASE_URL = "https://cohgljjigfgoxdbvhkan.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvaGdsamppZ2Znb3hkYnZoa2FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNzAyOTAsImV4cCI6MjA5MDY0NjI5MH0.MBT88BUr9qfbUpY2l8dG-173lp_uROOuYoP7bSz5Xew";

const sbHeaders = {
  apikey: SUPABASE_ANON,
  Authorization: `Bearer ${SUPABASE_ANON}`,
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};

async function dbLoad() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/projects?id=eq.all`, { headers: sbHeaders });
  if (!res.ok) throw new Error("load failed");
  const rows = await res.json();
  return rows[0]?.data ?? null;
}

async function dbSave(data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/projects?id=eq.all`, {
    method: "PATCH",
    headers: sbHeaders,
    body: JSON.stringify({ data, updated_at: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error("save failed");
}

const CATEGORIES = {
  financial: { label: "Financial & Legal", color: "#D97706", bg: "#FEF3C7", icon: "⚖️" },
  home:      { label: "Home & Property",   color: "#059669", bg: "#D1FAE5", icon: "🏠" },
  dev:       { label: "Dev & Programming", color: "#4F46E5", bg: "#EDE9FE", icon: "💻" },
  personal:  { label: "Personal Goals",    color: "#DB2777", bg: "#FCE7F3", icon: "🎯" },
  wishlist:  { label: "Wishlist & Upgrades",color: "#7C3AED", bg: "#F5F3FF", icon: "✨" },
};

const STATUSES = {
  backlog:     { label: "Backlog",      color: "#6B7280" },
  planning:    { label: "Planning",     color: "#D97706" },
  "in-progress":{ label: "In Progress", color: "#4F46E5" },
  blocked:     { label: "Blocked",      color: "#DC2626" },
  complete:    { label: "Complete",     color: "#059669" },
};

const PRIORITIES = {
  low:      { label: "Low",      color: "#6B7280" },
  medium:   { label: "Medium",   color: "#D97706" },
  high:     { label: "High",     color: "#EA580C" },
  critical: { label: "Critical", color: "#DC2626" },
};

const HORIZONS = {
  "this-week":    { label: "This Week",    color: "#DC2626" },
  "this-month":   { label: "This Month",   color: "#D97706" },
  "this-quarter": { label: "This Quarter", color: "#4F46E5" },
  "this-year":    { label: "This Year",    color: "#059669" },
  "someday":      { label: "Someday",      color: "#6B7280" },
};

const DEFAULT_HORIZON = "this-quarter";

const SEED = [
  {
    id:"p1", title:"Mortgage Transition — Family to Parents", category:"financial",
    status:"in-progress", priority:"critical", horizon:"this-quarter",
    description:"Transition current co-mortgagors off the shared mortgage and bring parents in under a rental/co-ownership proposition.",
    stakeholders:[
      {name:"Wife",role:"Co-owner / Decision maker"},
      {name:"Current Family Member(s)",role:"Outgoing mortgagor"},
      {name:"Parents",role:"Incoming party / Rental proposition"},
      {name:"Mortgage Lender",role:"Financial institution"},
      {name:"Attorney / Conveyancer",role:"Legal advisor"},
    ],
    documents:[
      {name:"Current Mortgage Agreement",type:"Legal"},
      {name:"Rental Proposition Draft",type:"Proposal"},
      {name:"Property Valuation",type:"Financial"},
    ],
    tasks:[
      {id:"t1",title:"Get mortgage payoff/transfer terms from lender",done:false},
      {id:"t2",title:"Draft rental proposition for parents",done:false},
      {id:"t3",title:"Consult attorney on title/ownership transfer",done:false},
      {id:"t4",title:"Family conversation — outgoing party",done:false},
      {id:"t5",title:"Parents review & sign proposition",done:false},
    ],
    startDate:"2026-04-01", targetDate:"2026-09-01",
    notes:"High emotional and financial stakes. Keep communication documented.",
    tags:["mortgage","legal","family"],
  },
  {
    id:"p2", title:"Full Property Drainage Overhaul", category:"home",
    status:"planning", priority:"high", horizon:"this-quarter",
    description:"Fix drainage across the entire property — gutters, grading, downspouts, yard drainage.",
    stakeholders:[
      {name:"Wife",role:"Co-decision maker"},
      {name:"Drainage Contractor",role:"Vendor (TBD)"},
      {name:"Landscaper",role:"Grading & yard work"},
    ],
    documents:[
      {name:"Property Survey / Plot Plan",type:"Reference"},
      {name:"Contractor Quotes",type:"Financial"},
    ],
    tasks:[
      {id:"t1",title:"Walk property and document all problem areas",done:false},
      {id:"t2",title:"Get 3 contractor quotes",done:false},
      {id:"t3",title:"Prioritize by damage risk",done:false},
      {id:"t4",title:"Schedule phase 1 work",done:false},
    ],
    startDate:"2026-05-01", targetDate:"2026-10-01",
    notes:"Complete before fall rains. May need to phase by area.",
    tags:["drainage","yard","exterior"],
  },
  {
    id:"p3", title:"Personal Dev — Side Project Tracker", category:"dev",
    status:"in-progress", priority:"medium", horizon:"this-quarter",
    description:"Build and maintain personal dev projects, tools, and experiments.",
    stakeholders:[{name:"Self",role:"Developer / Owner"}],
    documents:[{name:"GitHub Repos",type:"Code"},{name:"Tech Stack Notes",type:"Reference"}],
    tasks:[
      {id:"t1",title:"Outline active dev projects",done:false},
      {id:"t2",title:"Set realistic milestones per project",done:false},
    ],
    startDate:"2026-04-01", targetDate:"2026-12-31",
    notes:"Keep scope realistic. Ship small, iterate.",
    tags:["programming","development"],
  },
  {
    id:"p4", title:"5-Year Personal Vision & Goals", category:"personal",
    status:"planning", priority:"high", horizon:"this-year",
    description:"Define and track long-term personal ambitions — financial independence, career direction, lifestyle.",
    stakeholders:[{name:"Self",role:"Primary"},{name:"Wife",role:"Partner / Shared goals"}],
    documents:[{name:"Vision Document",type:"Personal"},{name:"Financial Projection",type:"Financial"}],
    tasks:[
      {id:"t1",title:"Write 5-year vision narrative",done:false},
      {id:"t2",title:"Break into 1-year milestones",done:false},
      {id:"t3",title:"Align with wife on shared goals",done:false},
      {id:"t4",title:"Set monthly review cadence",done:false},
    ],
    startDate:"2026-04-01", targetDate:"2026-06-01",
    notes:"Don't skip this. Everything else flows from here.",
    tags:["vision","goals","long-term"],
  },
  {
    id:"p5", title:"House Upgrade Wishlist & Prioritization", category:"wishlist",
    status:"backlog", priority:"medium", horizon:"someday",
    description:"Running list of desired home improvements ranked by ROI, need, and budget.",
    stakeholders:[{name:"Self",role:"Owner"},{name:"Wife",role:"Co-owner"}],
    documents:[{name:"Wishlist Spreadsheet",type:"Planning"},{name:"Home Improvement Budget",type:"Financial"}],
    tasks:[
      {id:"t1",title:"Brain dump full wishlist",done:false},
      {id:"t2",title:"Score each item: need vs. want vs. ROI",done:false},
      {id:"t3",title:"Assign rough budget estimates",done:false},
    ],
    startDate:"2026-04-15", targetDate:"2026-05-15",
    notes:"Kitchen and primary bath are top wants.",
    tags:["upgrades","wishlist"],
  },
];

const uid = () => `p${Date.now()}`;
const tid = () => `t${Date.now()}`;

/* ── tiny components ── */
function Dot({ color }) {
  return <span style={{ width:8, height:8, borderRadius:"50%", background:color, display:"inline-block", flexShrink:0 }} />;
}

function Badge({ color, bg, children }) {
  return (
    <span style={{ background:bg||"#F3F4F6", color:color||"#374151", borderRadius:99,
      padding:"2px 9px", fontSize:11, fontWeight:600, whiteSpace:"nowrap" }}>
      {children}
    </span>
  );
}

function Progress({ tasks }) {
  if (!tasks?.length) return null;
  const done = tasks.filter(t=>t.done).length;
  const pct  = Math.round((done/tasks.length)*100);
  return (
    <div style={{ marginTop:8 }}>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#6B7280", marginBottom:3 }}>
        <span>{done}/{tasks.length} tasks</span><span>{pct}%</span>
      </div>
      <div style={{ height:4, background:"#E5E7EB", borderRadius:99, overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", background: pct===100?"#059669":"#4F46E5",
          borderRadius:99, transition:"width .4s" }} />
      </div>
    </div>
  );
}

function SyncPill({ status }) {
  const map = { synced:{c:"#059669",t:"✓ Synced"}, saving:{c:"#D97706",t:"↑ Saving…"},
                error:{c:"#DC2626",t:"✕ Error"}, loading:{c:"#9CA3AF",t:"Loading…"} };
  const {c,t} = map[status]||map.loading;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:c, fontWeight:600, fontFamily:"sans-serif" }}>
      <Dot color={c}/>{t}
    </div>
  );
}

function Card({ project, onClick }) {
  const cat = CATEGORIES[project.category];
  const st  = STATUSES[project.status];
  const pr  = PRIORITIES[project.priority];
  const hz  = HORIZONS[project.horizon || DEFAULT_HORIZON];
  return (
    <div onClick={onClick}
      style={{ background:"#fff", border:"1px solid #E5E7EB", borderLeft:`4px solid ${cat.color}`,
        borderRadius:12, padding:"13px 15px", cursor:"pointer", marginBottom:10,
        transition:"box-shadow .18s, transform .15s" }}
      onMouseEnter={e=>{ e.currentTarget.style.boxShadow="0 4px 18px rgba(0,0,0,0.10)"; e.currentTarget.style.transform="translateY(-1px)"; }}
      onMouseLeave={e=>{ e.currentTarget.style.boxShadow="none"; e.currentTarget.style.transform="none"; }}>
      <div style={{ display:"flex", justifyContent:"space-between", gap:8 }}>
        <div style={{ fontWeight:700, fontSize:14, color:"#111827", lineHeight:1.3, flex:1 }}>{project.title}</div>
        <div style={{ display:"flex", gap:5, alignItems:"flex-start", flexShrink:0 }}>
          <Badge color={pr.color} bg={`${pr.color}18`}>{pr.label}</Badge>
          <Badge color={hz.color} bg={`${hz.color}18`}>{hz.label}</Badge>
        </div>
      </div>
      <div style={{ display:"flex", gap:6, marginTop:7, flexWrap:"wrap" }}>
        <Badge color={cat.color} bg={cat.bg}>{cat.icon} {cat.label}</Badge>
        <Badge color={st.color}  bg={`${st.color}18`}>● {st.label}</Badge>
      </div>
      {project.description && (
        <p style={{ fontSize:12, color:"#6B7280", margin:"7px 0 0", lineHeight:1.5,
          display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
          {project.description}
        </p>
      )}
      <Progress tasks={project.tasks}/>
      {project.stakeholders?.length>0 && (
        <div style={{ fontSize:11, color:"#9CA3AF", marginTop:7 }}>
          👤 {project.stakeholders.map(s=>s.name).join(", ")}
        </div>
      )}
    </div>
  );
}

function KanbanCol({ status, projects, onCard }) {
  const s = STATUSES[status];
  return (
    <div style={{ minWidth:255, flex:1, background:"#F9FAFB", borderRadius:12, padding:"11px 11px 14px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:11 }}>
        <Dot color={s.color}/>
        <span style={{ fontWeight:700, fontSize:13, color:"#374151" }}>{s.label}</span>
        <span style={{ marginLeft:"auto", background:"#E5E7EB", borderRadius:99, padding:"1px 8px",
          fontSize:12, fontWeight:600, color:"#6B7280" }}>{projects.length}</span>
      </div>
      {projects.length===0 && <div style={{ fontSize:12, color:"#D1D5DB", textAlign:"center", padding:"18px 0" }}>Empty</div>}
      {projects.map(p=><Card key={p.id} project={p} onClick={()=>onCard(p)}/>)}
    </div>
  );
}

function GanttRow({ project, minDate, totalDays }) {
  const cat   = CATEGORIES[project.category];
  const start = new Date(project.startDate||"2026-04-01");
  const end   = new Date(project.targetDate||"2026-12-31");
  const left  = Math.max(0,(start-minDate)/(864e5)/totalDays)*100;
  const width = Math.min(Math.max(1,(end-start)/(864e5)/totalDays)*100, 100-left);
  const todayOff = ((new Date()-minDate)/(864e5)/totalDays)*100;
  return (
    <div style={{ marginBottom:13 }}>
      <div style={{ fontSize:12, fontWeight:600, color:"#374151", marginBottom:3, fontFamily:"sans-serif" }}>{project.title}</div>
      <div style={{ position:"relative", height:26, background:"#F3F4F6", borderRadius:6 }}>
        <div style={{ position:"absolute", left:`${left}%`, width:`${width}%`, top:3, height:20,
          background:cat.color, borderRadius:5, opacity:.85, display:"flex", alignItems:"center",
          padding:"0 7px", overflow:"hidden", minWidth:20 }}>
          <span style={{ color:"#fff", fontSize:10, fontWeight:700, whiteSpace:"nowrap" }}>{project.title}</span>
        </div>
        {todayOff>=0&&todayOff<=100&&(
          <div style={{ position:"absolute", left:`${todayOff}%`, top:0, bottom:0, width:2,
            background:"#EF4444", zIndex:2, borderRadius:1 }}/>
        )}
      </div>
    </div>
  );
}

/* ── modal ── */
function Modal({ project, onClose, onSave, onDelete }) {
  const [e, setE] = useState({...project, horizon: project.horizon || DEFAULT_HORIZON});
  const [tab, setTab] = useState("overview");
  const [ns, setNs] = useState({name:"",role:""});
  const [nd, setNd] = useState({name:"",type:""});
  const [nt, setNt] = useState("");
  const [ng, setNg] = useState("");

  const inp = { padding:"7px 10px", border:"1px solid #D1D5DB", borderRadius:7, fontSize:13,
    width:"100%", boxSizing:"border-box", outline:"none" };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:100,
      display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={ev=>ev.target===ev.currentTarget&&onClose()}>
      <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:680,
        maxHeight:"90vh", overflow:"hidden", display:"flex", flexDirection:"column",
        boxShadow:"0 25px 60px rgba(0,0,0,0.25)" }}>

        {/* header */}
        <div style={{ padding:"20px 24px 0", borderBottom:"1px solid #F3F4F6" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:11 }}>
            <input value={e.title} onChange={ev=>setE(d=>({...d,title:ev.target.value}))}
              style={{ fontWeight:800, fontSize:18, border:"none", outline:"none", color:"#111827",
                flex:1, marginRight:8, background:"transparent" }}/>
            <button onClick={onClose} style={{ border:"none", background:"none", fontSize:22, cursor:"pointer", color:"#9CA3AF" }}>×</button>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:11 }}>
            {[["category",CATEGORIES],["status",STATUSES],["priority",PRIORITIES],["horizon",HORIZONS]].map(([field,opts])=>(
              <select key={field} value={e[field]} onChange={ev=>setE(d=>({...d,[field]:ev.target.value}))}
                style={{ ...inp, width:"auto", background:"#fff", cursor:"pointer" }}>
                {Object.entries(opts).map(([k,v])=><option key={k} value={k}>{v.icon||""} {v.label}</option>)}
              </select>
            ))}
          </div>
          <div style={{ display:"flex" }}>
            {["overview","tasks","stakeholders","documents"].map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                style={{ padding:"7px 15px", border:"none", background:"none", cursor:"pointer",
                  fontWeight:tab===t?700:500, fontSize:13, color:tab===t?"#4F46E5":"#6B7280",
                  borderBottom:tab===t?"2px solid #4F46E5":"2px solid transparent",
                  textTransform:"capitalize" }}>{t}</button>
            ))}
          </div>
        </div>

        {/* body */}
        <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>
          {tab==="overview" && (
            <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#6B7280", display:"block", marginBottom:4 }}>DESCRIPTION</label>
                <textarea value={e.description} rows={4} onChange={ev=>setE(d=>({...d,description:ev.target.value}))}
                  style={{ ...inp, resize:"vertical" }}/>
              </div>
              <div style={{ display:"flex", gap:11 }}>
                {[["startDate","START DATE"],["targetDate","TARGET DATE"]].map(([f,l])=>(
                  <div key={f} style={{ flex:1 }}>
                    <label style={{ fontSize:11, fontWeight:700, color:"#6B7280", display:"block", marginBottom:4 }}>{l}</label>
                    <input type="date" value={e[f]||""} onChange={ev=>setE(d=>({...d,[f]:ev.target.value}))} style={inp}/>
                  </div>
                ))}
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#6B7280", display:"block", marginBottom:4 }}>NOTES</label>
                <textarea value={e.notes||""} rows={3} onChange={ev=>setE(d=>({...d,notes:ev.target.value}))}
                  style={{ ...inp, resize:"vertical" }}/>
              </div>
              <Progress tasks={e.tasks||[]}/>
            </div>
          )}

          {tab==="tasks" && (
            <div>
              {(()=>{
                const tasks = e.tasks||[];
                const hasGroups = tasks.some(t=>t.group);
                const taskRow = (task) => (
                  <div key={task.id} style={{ display:"flex", alignItems:"center", gap:9,
                    padding:"8px 0", borderBottom:"1px solid #F3F4F6" }}>
                    <input type="checkbox" checked={task.done} onChange={()=>setE(d=>({...d,tasks:d.tasks.map(t=>t.id===task.id?{...t,done:!t.done}:t)}))}
                      style={{ width:16, height:16, cursor:"pointer", accentColor:"#4F46E5" }}/>
                    <span style={{ flex:1, fontSize:13, color:task.done?"#9CA3AF":"#111827",
                      textDecoration:task.done?"line-through":"none" }}>{task.title}</span>
                    <button onClick={()=>setE(d=>({...d,tasks:d.tasks.filter(t=>t.id!==task.id)}))}
                      style={{ border:"none", background:"none", color:"#D1D5DB", cursor:"pointer", fontSize:17 }}>×</button>
                  </div>
                );
                if (!hasGroups) return tasks.map(taskRow);
                const groups = [];
                const seen = new Set();
                if (tasks.some(t=>!t.group)) { groups.push(""); seen.add(""); }
                tasks.forEach(t=>{ if(t.group&&!seen.has(t.group)){ seen.add(t.group); groups.push(t.group); } });
                return groups.map((g,gi)=>(
                  <div key={g||"__general__"}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:gi===0?0:16, marginBottom:4 }}>
                      <span style={{ fontSize:11, fontWeight:700, color:"#6B7280", letterSpacing:"0.08em",
                        textTransform:"uppercase", whiteSpace:"nowrap" }}>{g||"General"}</span>
                      <div style={{ flex:1, height:1, background:"#E5E7EB" }}/>
                    </div>
                    {tasks.filter(t=>(t.group||"")===g).map(taskRow)}
                  </div>
                ));
              })()}
              {(()=>{ const addTask=()=>{ if(!nt.trim())return; const g=ng.trim(); setE(d=>({...d,tasks:[...(d.tasks||[]),{id:tid(),title:nt.trim(),done:false,...(g?{group:g}:{})}]})); setNt(""); }; return (
              <div style={{ display:"flex", gap:8, marginTop:13 }}>
                <input placeholder="Group (optional)" value={ng} onChange={ev=>setNg(ev.target.value)}
                  style={{ ...inp, width:130, flexShrink:0 }}/>
                <input placeholder="Add a task…" value={nt} onChange={ev=>setNt(ev.target.value)}
                  onKeyDown={ev=>{ if(ev.key==="Enter") addTask(); }}
                  style={{ ...inp, flex:1 }}/>
                <button onClick={addTask}
                  style={{ padding:"7px 14px", background:"#4F46E5", color:"#fff", border:"none", borderRadius:7, cursor:"pointer", fontWeight:700 }}>Add</button>
              </div>
              ); })()}
            </div>
          )}

          {tab==="stakeholders" && (
            <div>
              {(e.stakeholders||[]).map((s,i)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", gap:9, padding:"9px 0", borderBottom:"1px solid #F3F4F6" }}>
                  <div style={{ width:34, height:34, borderRadius:"50%", background:"#EDE9FE",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontWeight:700, color:"#4F46E5", fontSize:14, flexShrink:0 }}>{s.name[0]}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:13 }}>{s.name}</div>
                    <div style={{ fontSize:12, color:"#6B7280" }}>{s.role}</div>
                  </div>
                  <button onClick={()=>setE(d=>({...d,stakeholders:d.stakeholders.filter((_,j)=>j!==i)}))}
                    style={{ border:"none", background:"none", color:"#D1D5DB", cursor:"pointer", fontSize:17 }}>×</button>
                </div>
              ))}
              <div style={{ display:"flex", gap:8, marginTop:13, flexWrap:"wrap" }}>
                <input placeholder="Name" value={ns.name} onChange={ev=>setNs(d=>({...d,name:ev.target.value}))}
                  style={{ ...inp, flex:1, minWidth:120 }}/>
                <input placeholder="Role" value={ns.role} onChange={ev=>setNs(d=>({...d,role:ev.target.value}))}
                  style={{ ...inp, flex:1, minWidth:120 }}/>
                <button onClick={()=>{ if(!ns.name.trim())return; setE(d=>({...d,stakeholders:[...(d.stakeholders||[]),{...ns}]})); setNs({name:"",role:""}); }}
                  style={{ padding:"7px 14px", background:"#4F46E5", color:"#fff", border:"none", borderRadius:7, cursor:"pointer", fontWeight:700 }}>Add</button>
              </div>
            </div>
          )}

          {tab==="documents" && (
            <div>
              {(e.documents||[]).map((doc,i)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", gap:9, padding:"9px 0", borderBottom:"1px solid #F3F4F6" }}>
                  <span style={{ fontSize:20 }}>📄</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:13 }}>{doc.name}</div>
                    <div style={{ fontSize:12, color:"#6B7280" }}>{doc.type}</div>
                  </div>
                  <button onClick={()=>setE(d=>({...d,documents:d.documents.filter((_,j)=>j!==i)}))}
                    style={{ border:"none", background:"none", color:"#D1D5DB", cursor:"pointer", fontSize:17 }}>×</button>
                </div>
              ))}
              <div style={{ display:"flex", gap:8, marginTop:13, flexWrap:"wrap" }}>
                <input placeholder="Document name" value={nd.name} onChange={ev=>setNd(d=>({...d,name:ev.target.value}))}
                  style={{ ...inp, flex:2, minWidth:130 }}/>
                <input placeholder="Type (Legal, Financial…)" value={nd.type} onChange={ev=>setNd(d=>({...d,type:ev.target.value}))}
                  style={{ ...inp, flex:1, minWidth:100 }}/>
                <button onClick={()=>{ if(!nd.name.trim())return; setE(d=>({...d,documents:[...(d.documents||[]),{...nd}]})); setNd({name:"",type:""}); }}
                  style={{ padding:"7px 14px", background:"#4F46E5", color:"#fff", border:"none", borderRadius:7, cursor:"pointer", fontWeight:700 }}>Add</button>
              </div>
            </div>
          )}
        </div>

        {/* footer */}
        <div style={{ padding:"15px 24px", borderTop:"1px solid #F3F4F6", display:"flex", justifyContent:"space-between", gap:10 }}>
          <button onClick={()=>onDelete(project.id)}
            style={{ padding:"8px 16px", background:"#FEE2E2", color:"#DC2626", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13 }}>Delete</button>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={onClose}
              style={{ padding:"8px 16px", background:"#F3F4F6", color:"#374151", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13 }}>Cancel</button>
            <button onClick={()=>onSave(e)}
              style={{ padding:"8px 20px", background:"#4F46E5", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:13 }}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewModal({ onClose, onAdd }) {
  const [f, setF] = useState({ title:"", category:"home", status:"backlog", priority:"medium",
    horizon:DEFAULT_HORIZON,
    description:"", startDate:"", targetDate:"", notes:"", tasks:[], stakeholders:[], documents:[], tags:[] });
  const inp = { padding:"8px 11px", border:"1px solid #D1D5DB", borderRadius:7, fontSize:13,
    width:"100%", boxSizing:"border-box", outline:"none" };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:100,
      display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={ev=>ev.target===ev.currentTarget&&onClose()}>
      <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:500,
        padding:28, boxShadow:"0 25px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ fontWeight:800, fontSize:18, marginBottom:18 }}>New Project</div>
        <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
          <input placeholder="Title *" value={f.title} onChange={ev=>setF(d=>({...d,title:ev.target.value}))} style={inp}/>
          <textarea placeholder="Description" value={f.description} rows={3}
            onChange={ev=>setF(d=>({...d,description:ev.target.value}))} style={{ ...inp, resize:"vertical" }}/>
          <div style={{ display:"flex", gap:9 }}>
            {[["category",CATEGORIES],["status",STATUSES],["priority",PRIORITIES],["horizon",HORIZONS]].map(([field,opts])=>(
              <select key={field} value={f[field]} onChange={ev=>setF(d=>({...d,[field]:ev.target.value}))}
                style={{ ...inp, background:"#fff", cursor:"pointer" }}>
                {Object.entries(opts).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </select>
            ))}
          </div>
          <div style={{ display:"flex", gap:9 }}>
            {[["startDate","Start"],["targetDate","Target"]].map(([field,label])=>(
              <div key={field} style={{ flex:1 }}>
                <label style={{ fontSize:11, fontWeight:600, color:"#6B7280", display:"block", marginBottom:3 }}>{label.toUpperCase()}</label>
                <input type="date" value={f[field]} onChange={ev=>setF(d=>({...d,[field]:ev.target.value}))} style={inp}/>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:18 }}>
          <button onClick={onClose}
            style={{ padding:"8px 16px", background:"#F3F4F6", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, color:"#374151" }}>Cancel</button>
          <button onClick={()=>{ if(f.title.trim()){ onAdd({...f, id:uid()}); onClose(); } }}
            style={{ padding:"8px 20px", background:"#4F46E5", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontWeight:700 }}>Create</button>
        </div>
      </div>
    </div>
  );
}

/* ── horizon filter bar ── */
function HorizonFilter({ value, onChange }) {
  const items = [
    { key:"all",           label:"All" },
    { key:"this-week",     label:"This Week" },
    { key:"this-month",    label:"This Month" },
    { key:"this-quarter",  label:"This Quarter" },
    { key:"this-year",     label:"This Year" },
    { key:"someday",       label:"Someday" },
  ];
  return (
    <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:18 }}>
      {items.map(item => {
        const hz = HORIZONS[item.key];
        const active = value === item.key;
        const color = hz ? hz.color : "#4F46E5";
        return (
          <button key={item.key} onClick={()=>onChange(item.key)}
            style={{ padding:"5px 13px", borderRadius:99, border:"1px solid",
              borderColor:active ? color : "#D1D5DB",
              background:active ? color : "#fff",
              color:active ? "#fff" : "#374151",
              cursor:"pointer", fontSize:12, fontWeight:600, fontFamily:"sans-serif",
              transition:"all .15s" }}>
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── focus view ── */
function FocusView({ projects, onTaskToggle }) {
  const urgent = projects.filter(p => p.horizon==="this-week" || p.horizon==="this-month");

  if (!urgent.length) {
    return (
      <div style={{ textAlign:"center", padding:"60px 20px", color:"#6B7280" }}>
        <div style={{ fontSize:40, marginBottom:12 }}>◎</div>
        <div style={{ fontWeight:700, fontSize:18, color:"#374151", marginBottom:8 }}>Nothing urgent right now.</div>
        <div style={{ fontSize:14 }}>No projects are marked This Week or This Month.</div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontWeight:900, fontSize:23, margin:"0 0 6px", letterSpacing:"-0.5px" }}>Focus</h1>
      <p style={{ color:"#6B7280", fontSize:14, margin:"0 0 22px" }}>Your next actions — this week &amp; this month only.</p>
      <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
        {urgent.map(p => {
          const cat = CATEGORIES[p.category];
          const pr  = PRIORITIES[p.priority];
          const hz  = HORIZONS[p.horizon || DEFAULT_HORIZON];
          const nextTask = (p.tasks||[]).find(t=>!t.done);
          const allDone  = (p.tasks||[]).length > 0 && !(p.tasks||[]).find(t=>!t.done);
          return (
            <div key={p.id} style={{ background:"#fff", border:"1px solid #E5E7EB",
              borderLeft:`4px solid ${cat.color}`, borderRadius:12, padding:"16px 18px",
              boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                <span style={{ fontSize:20 }}>{cat.icon}</span>
                <div style={{ flex:1, fontWeight:700, fontSize:15, color:"#111827" }}>{p.title}</div>
                <Badge color={pr.color} bg={`${pr.color}18`}>{pr.label}</Badge>
                <Badge color={hz.color} bg={`${hz.color}18`}>{hz.label}</Badge>
              </div>
              {allDone ? (
                <div style={{ display:"flex", alignItems:"center", gap:7, color:"#059669",
                  fontWeight:700, fontSize:13 }}>
                  <span style={{ fontSize:16 }}>✓</span> All done
                </div>
              ) : nextTask ? (
                <div style={{ display:"flex", alignItems:"center", gap:9,
                  padding:"9px 12px", background:"#F9FAFB", borderRadius:8 }}>
                  <input type="checkbox" checked={nextTask.done}
                    onChange={()=>onTaskToggle(p.id, nextTask.id)}
                    style={{ width:16, height:16, cursor:"pointer", accentColor:"#4F46E5", flexShrink:0 }}/>
                  <span style={{ fontSize:13, color:"#111827" }}>{nextTask.title}</span>
                </div>
              ) : (
                <div style={{ fontSize:13, color:"#9CA3AF", fontStyle:"italic" }}>No tasks added.</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── main app ── */
export default function App() {
  const [projects, setProjects] = useState([]);
  const [view, setView]         = useState("dashboard");
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew]   = useState(false);
  const [filterCat, setFilter]  = useState("all");
  const [filterHorizon, setFilterHorizon] = useState("all");
  const [sync, setSync]         = useState("loading");
  const timer = useRef(null);

  /* load */
  useEffect(()=>{
    (async()=>{
      try {
        const data = await dbLoad();
        setProjects(data && data.length ? data : SEED);
        if (!data || !data.length) await dbSave(SEED);
        setSync("synced");
      } catch(err) {
        console.error(err);
        setProjects(SEED);
        setSync("error");
      }
    })();
  },[]);

  /* poll every 15s so hosted app stays in sync */
  useEffect(()=>{
    const id = setInterval(async()=>{
      try { const d = await dbLoad(); if(d) setProjects(d); } catch(_){}
    }, 15000);
    return ()=>clearInterval(id);
  },[]);

  const commit = useCallback((ps)=>{
    setProjects(ps);
    setSync("saving");
    clearTimeout(timer.current);
    timer.current = setTimeout(async()=>{
      try { await dbSave(ps); setSync("synced"); }
      catch(e){ console.error(e); setSync("error"); }
    }, 700);
  },[]);

  const handleSave   = p  => { commit(projects.map(x=>x.id===p.id?p:x)); setSelected(null); };
  const handleDelete = id => { commit(projects.filter(x=>x.id!==id)); setSelected(null); };
  const handleAdd    = p  => commit([...projects, p]);
  const handleTaskToggle = (projectId, taskId) => {
    const updated = projects.map(p =>
      p.id !== projectId ? p :
      { ...p, tasks: (p.tasks||[]).map(t => t.id===taskId ? {...t, done:!t.done} : t) }
    );
    commit(updated);
  };

  const filtered = projects
    .filter(p => filterCat==="all"    || p.category===filterCat)
    .filter(p => filterHorizon==="all" || (p.horizon||DEFAULT_HORIZON)===filterHorizon);

  const stats = {
    total:      projects.length,
    inProgress: projects.filter(p=>p.status==="in-progress").length,
    critical:   projects.filter(p=>p.priority==="critical").length,
    complete:   projects.filter(p=>p.status==="complete").length,
  };

  const allDates = projects.flatMap(p=>[p.startDate,p.targetDate].filter(Boolean).map(d=>new Date(d)));
  const minDate  = allDates.length ? new Date(Math.min(...allDates)) : new Date("2026-04-01");
  const maxDate  = allDates.length ? new Date(Math.max(...allDates)) : new Date("2026-12-31");
  const totalDays = Math.max(1,(maxDate-minDate)/864e5);

  const navItems = [
    {id:"dashboard", icon:"◈", label:"Dashboard"},
    {id:"kanban",    icon:"⊞", label:"Kanban"},
    {id:"timeline",  icon:"▬", label:"Timeline"},
    {id:"list",      icon:"≡", label:"All Projects"},
    {id:"focus",     icon:"◎", label:"Focus"},
  ];

  if (sync==="loading") return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
      height:"100vh", flexDirection:"column", gap:12, fontFamily:"sans-serif", color:"#6B7280" }}>
      <div style={{ fontSize:36 }}>◈</div>
      <div style={{ fontWeight:600 }}>Loading your projects…</div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#F8F7F4", fontFamily:"Georgia, Palatino, serif", color:"#111827" }}>

      {/* nav */}
      <div style={{ background:"#1E1B4B", padding:"0 22px", display:"flex", alignItems:"center",
        height:56, position:"sticky", top:0, zIndex:50, gap:0 }}>
        <div style={{ fontWeight:900, fontSize:17, color:"#fff", letterSpacing:"-0.5px", marginRight:28 }}>◈ Project Hub</div>
        <div style={{ display:"flex", gap:2, flex:1 }}>
          {navItems.map(n=>(
            <button key={n.id} onClick={()=>setView(n.id)}
              style={{ padding:"8px 13px", border:"none",
                background:view===n.id?"rgba(255,255,255,0.15)":"none",
                color:view===n.id?"#fff":"rgba(255,255,255,0.6)",
                cursor:"pointer", borderRadius:7, fontSize:13,
                fontWeight:view===n.id?700:500,
                display:"flex", alignItems:"center", gap:5 }}>
              {n.icon} {n.label}
            </button>
          ))}
        </div>
        <SyncPill status={sync}/>
        <button onClick={()=>setShowNew(true)}
          style={{ background:"#4F46E5", color:"#fff", border:"none", borderRadius:8,
            padding:"8px 15px", cursor:"pointer", fontWeight:700, fontSize:13, marginLeft:14 }}>
          + New Project
        </button>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"26px 18px" }}>

        {/* dashboard */}
        {view==="dashboard" && (
          <div>
            <h1 style={{ fontWeight:900, fontSize:25, margin:"0 0 5px", letterSpacing:"-0.5px" }}>Your Command Center</h1>
            <p style={{ color:"#6B7280", fontSize:14, margin:"0 0 18px" }}>Track everything — home, finances, goals, and code.</p>
            <HorizonFilter value={filterHorizon} onChange={setFilterHorizon}/>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))", gap:13, marginBottom:30 }}>
              {[
                {label:"Total",      value:stats.total,      color:"#4F46E5", bg:"#EDE9FE"},
                {label:"In Progress",value:stats.inProgress, color:"#D97706", bg:"#FEF3C7"},
                {label:"Critical",   value:stats.critical,   color:"#DC2626", bg:"#FEE2E2"},
                {label:"Complete",   value:stats.complete,   color:"#059669", bg:"#D1FAE5"},
              ].map(s=>(
                <div key={s.label} style={{ background:s.bg, borderRadius:12, padding:"16px 18px" }}>
                  <div style={{ fontSize:30, fontWeight:900, color:s.color, lineHeight:1 }}>{s.value}</div>
                  <div style={{ fontSize:13, color:s.color, fontWeight:600, marginTop:4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {Object.entries(CATEGORIES).map(([key,cat])=>{
              const ps = projects
                .filter(p=>p.category===key)
                .filter(p=>filterHorizon==="all"||(p.horizon||DEFAULT_HORIZON)===filterHorizon);
              if (!ps.length) return null;
              return (
                <div key={key} style={{ marginBottom:26 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:11 }}>
                    <span style={{ fontSize:17 }}>{cat.icon}</span>
                    <h2 style={{ fontWeight:800, fontSize:15, margin:0, color:cat.color }}>{cat.label}</h2>
                    <span style={{ fontSize:12, color:"#9CA3AF" }}>({ps.length})</span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(275px,1fr))", gap:11 }}>
                    {ps.map(p=><Card key={p.id} project={p} onClick={()=>setSelected(p)}/>)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* kanban */}
        {view==="kanban" && (
          <div>
            <h1 style={{ fontWeight:900, fontSize:23, margin:"0 0 18px", letterSpacing:"-0.5px" }}>Kanban Board</h1>
            <div style={{ overflowX:"auto" }}>
              <div style={{ display:"flex", gap:13, minWidth:880, alignItems:"flex-start" }}>
                {Object.keys(STATUSES).map(s=>(
                  <KanbanCol key={s} status={s} projects={projects.filter(p=>p.status===s)} onCard={setSelected}/>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* timeline */}
        {view==="timeline" && (
          <div>
            <h1 style={{ fontWeight:900, fontSize:23, margin:"0 0 6px", letterSpacing:"-0.5px" }}>Timeline</h1>
            <p style={{ color:"#6B7280", fontSize:13, margin:"0 0 18px" }}>
              <span style={{ display:"inline-block", width:11, height:11, background:"#EF4444",
                borderRadius:2, marginRight:5, verticalAlign:"middle" }}/> Red = today
            </p>
            <div style={{ background:"#fff", borderRadius:14, padding:"18px 22px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ position:"relative", height:22, marginBottom:9 }}>
                {Array.from({length:12},(_,i)=>{
                  const d=new Date(minDate); d.setMonth(d.getMonth()+i);
                  const off=((d-minDate)/864e5/totalDays)*100;
                  if(off>100) return null;
                  return <span key={i} style={{ position:"absolute", left:`${off}%`, fontSize:11, color:"#9CA3AF", fontFamily:"sans-serif" }}>{d.toLocaleString("default",{month:"short"})}</span>;
                })}
              </div>
              {projects.filter(p=>p.startDate&&p.targetDate).map(p=>(
                <GanttRow key={p.id} project={p} minDate={minDate} totalDays={totalDays}/>
              ))}
            </div>
          </div>
        )}

        {/* list */}
        {view==="list" && (
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:13, flexWrap:"wrap", gap:10 }}>
              <h1 style={{ fontWeight:900, fontSize:23, margin:0 }}>All Projects</h1>
              <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                <button onClick={()=>setFilter("all")}
                  style={{ padding:"5px 13px", borderRadius:99, border:"1px solid",
                    borderColor:filterCat==="all"?"#4F46E5":"#D1D5DB",
                    background:filterCat==="all"?"#4F46E5":"#fff",
                    color:filterCat==="all"?"#fff":"#374151",
                    cursor:"pointer", fontSize:12, fontWeight:600, fontFamily:"sans-serif" }}>All</button>
                {Object.entries(CATEGORIES).map(([k,v])=>(
                  <button key={k} onClick={()=>setFilter(k)}
                    style={{ padding:"5px 13px", borderRadius:99, border:"1px solid",
                      borderColor:filterCat===k?v.color:"#D1D5DB",
                      background:filterCat===k?v.bg:"#fff",
                      color:filterCat===k?v.color:"#374151",
                      cursor:"pointer", fontSize:12, fontWeight:600, fontFamily:"sans-serif" }}>
                    {v.icon} {v.label}
                  </button>
                ))}
              </div>
            </div>
            <HorizonFilter value={filterHorizon} onChange={setFilterHorizon}/>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(295px,1fr))", gap:13 }}>
              {filtered.map(p=><Card key={p.id} project={p} onClick={()=>setSelected(p)}/>)}
            </div>
          </div>
        )}

        {/* focus */}
        {view==="focus" && (
          <FocusView projects={projects} onTaskToggle={handleTaskToggle}/>
        )}
      </div>

      {selected && <Modal project={selected} onClose={()=>setSelected(null)} onSave={handleSave} onDelete={handleDelete}/>}
      {showNew  && <NewModal onClose={()=>setShowNew(false)} onAdd={handleAdd}/>}
    </div>
  );
}
