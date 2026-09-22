import{S as ut}from"./index-DlwcV0AT.js";function Me(l){return l===null?!0:typeof l=="number"?Number.isFinite(l):typeof l=="string"||typeof l=="boolean"}function xt(l){return JSON.stringify(l)}function mt(l){const d=l.trim();if(!d)return{ok:!1,error:"Enter a JSON string, number, boolean, or null."};let b;try{b=JSON.parse(d)}catch{return{ok:!1,error:"Enter a valid JSON string, number, boolean, or null."}}return Me(b)?{ok:!0,value:b}:{ok:!1,error:"Only primitive values can be edited inline."}}function bt(l,d,b){if(d.length===0)return{ok:!1,error:"Choose a value inside the state tree."};const y=yt(l,d);return y.exists?Me(y.value)?{ok:!0,data:$e(l,d,b)}:{ok:!1,error:"Only primitive values can be edited inline."}:{ok:!1,error:"State path does not exist."}}function yt(l,d){let b=l;for(const y of d){if(!At(b,y))return{exists:!1};b=b[y]}return{exists:!0,value:b}}function At(l,d){return Array.isArray(l)?typeof d=="number"&&Number.isInteger(d)&&d>=0&&d<l.length:l===null||typeof l!="object"?!1:Object.prototype.hasOwnProperty.call(l,String(d))}function $e(l,d,b){const[y,...x]=d;if(y===void 0)return b;const k=Array.isArray(l)?[...l]:{...l};return k[y]=$e(l[y],x,b),k}let le=null,Y=null,q=null,H=new Map,I=null,R=null,U=null,se=null;const vt=".ph-inspect-highlight, .ph-inspect-highlight-hover, .ph-inspect-selected",Ct=["ph-inspect-highlight","ph-inspect-highlight-hover","ph-inspect-selected"];function _e(){for(const l of H.values())l.unsubscribe();H.clear()}function et(){document.querySelectorAll(vt).forEach(l=>{l.classList.remove(...Ct)}),document.querySelectorAll(".ph-inspect-label").forEach(l=>{l.remove()})}function wt(l){document.querySelectorAll(".ph-inspect-highlight-hover").forEach(d=>{d.classList.remove("ph-inspect-highlight-hover")}),l||document.querySelectorAll(".ph-inspect-highlight").forEach(d=>{d.classList.remove("ph-inspect-highlight")})}const Ve="data:image/png;base64,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",Je={inspect:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>',minimize:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="6" y1="12" x2="18" y2="12"/></svg>'},kt={"can-move":"#4a9a8a","can-spin":"#5b8db8","can-toggle":"#c4724e","can-grow":"#d4b85c","can-duplicate":"#8a6abf","can-mirror":"#4a9a8a","can-play":"#3d3833","can-hover":"#5b8db8"},Et="#8a8279",jt=`
#playhtml-dev-root {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 100000;
  font-family: 'Atkinson Hyperlegible', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 12px;
  line-height: 1.4;
  color: #3d3833;
  pointer-events: none;
}
#playhtml-dev-root * {
  box-sizing: border-box;
}
.ph-trigger {
  pointer-events: auto;
  position: fixed;
  bottom: 16px;
  right: 0;
  width: 120px;
  height: 48px;
  background: linear-gradient(135deg, #f0e9dd 0%, #e8e0d4 40%, #d8d0c4 100%);
  border: 3px solid;
  border-color: #f5f0e8 #7a7269 #6b6560 #ede6da;
  border-right: none;
  padding: 4px 6px;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  z-index: 100000;
  box-shadow: -2px 0 4px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08), 0 -2px 6px rgba(0,0,0,0.1);
}
.ph-trigger:hover {
  background: linear-gradient(135deg, #f8f2e8 0%, #f0e9dd 40%, #e0d8cc 100%);
  box-shadow: -2px 0 6px rgba(0,0,0,0.16), 0 2px 6px rgba(0,0,0,0.12), 0 -3px 8px rgba(0,0,0,0.14);
}
.ph-trigger img {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  filter: drop-shadow(0 0 4px #5b8db8);
}
.ph-trigger-grip {
  display: flex;
  flex-direction: row;
  gap: 3px;
  align-items: center;
  flex: 1;
  justify-content: center;
}
.ph-trigger-grip span {
  display: block;
  width: 2px;
  height: 16px;
  background: linear-gradient(180deg, #f5f0e8 0%, #8a8279 50%, #6b6560 100%);
}
.ph-bar {
  pointer-events: auto;
  display: none;
  flex-direction: row;
  background: #e8e0d4;
  border-left: 3px solid #3d3833;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 400px;
}
.ph-bar.ph-open {
  display: flex;
}
.ph-bar-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}
.ph-bar-main {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.ph-toolbar {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: linear-gradient(180deg, #ede6da 0%, #d4cfc7 100%);
  border-bottom: 1px solid #8a8279;
  flex-shrink: 0;
}
.ph-toolbar .ph-logo-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
}
.ph-toolbar .ph-logo-btn img {
  width: 22px;
  height: 22px;
  filter: drop-shadow(0 0 4px #5b8db8);
}
.ph-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: #e8e0d4;
  border: 2px solid;
  border-color: #f5f0e8 #8a8279 #8a8279 #f5f0e8;
  cursor: pointer;
  color: #3d3833;
  padding: 0;
}
.ph-btn:hover {
  background: #f5f0e8;
}
.ph-btn.ph-active {
  border-color: #8a8279 #f5f0e8 #f5f0e8 #8a8279;
  background: #d4cfc7;
}
.ph-btn svg {
  width: 16px;
  height: 16px;
}
.ph-data {
  flex: 1;
  padding: 6px 10px;
  overflow-y: auto;
  background: #f5f0e8;
  font-size: 12px;
}
.ph-data::-webkit-scrollbar {
  width: 4px;
}
.ph-data::-webkit-scrollbar-thumb {
  background: #d4cfc7;
}
.ph-reset-btn {
  font-family: 'Atkinson Hyperlegible', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #c4724e;
  cursor: pointer;
  background: #e8e0d4;
  border: 2px solid;
  border-color: #f5f0e8 #8a8279 #8a8279 #f5f0e8;
  padding: 2px 8px;
}
.ph-reset-btn:hover {
  background: #f5f0e8;
}
.ph-reset-btn:active {
  border-color: #8a8279 #f5f0e8 #f5f0e8 #8a8279;
  background: #d4cfc7;
}
.ph-tree-item {
  padding: 3px 0 3px 14px;
  border-left: 1px solid #d4cfc7;
  font-family: 'Martian Mono', 'SF Mono', monospace;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}
.ph-tree-item:hover {
  background: #faf7f2;
}
.ph-tree-toggle {
  color: #8a8279;
  font-size: 10px;
  width: 10px;
  flex-shrink: 0;
  text-align: center;
  user-select: none;
}
.ph-tree-key {
  color: #4a9a8a;
}
.ph-tree-value {
  color: #c4724e;
}
.ph-tree-badge {
  font-family: 'Atkinson Hyperlegible', sans-serif;
  font-size: 9px;
  padding: 1px 5px;
  font-weight: 700;
  text-transform: uppercase;
  color: #faf7f2;
  letter-spacing: 0.3px;
  flex-shrink: 0;
}
.ph-tree-el-name {
  font-family: 'Atkinson Hyperlegible', sans-serif;
  font-size: 12px;
}
.ph-tree-reset {
  font-family: 'Atkinson Hyperlegible', sans-serif;
  font-size: 10px;
  color: #c4724e;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
  background: none;
  border: none;
  padding: 0;
  margin-left: 4px;
}
.ph-tree-item:hover > .ph-tree-reset {
  opacity: 1;
}
.ph-tree-children {
  display: none;
  margin-left: 14px;
  padding-left: 6px;
  border-left: 1px solid #d4cfc7;
}
.ph-tree-children.ph-expanded {
  display: block;
}
.ph-tree-child {
  padding: 2px 0 2px 28px;
  font-family: 'Martian Mono', 'SF Mono', monospace;
  font-size: 11px;
  border-left: 1px solid #d4cfc7;
  margin-left: 14px;
}
.ph-resize-handle {
  width: 6px;
  cursor: ew-resize;
  background: #d4cfc7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-right: 1px solid #8a8279;
}
.ph-resize-handle::after {
  content: '';
  width: 2px;
  height: 40px;
  background: #8a8279;
  opacity: 0.5;
}
.ph-status {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 10px;
  background: #d4cfc7;
  border-bottom: 1px solid #8a8279;
  font-family: 'Martian Mono', 'SF Mono', monospace;
  font-size: 11px;
  color: #6b6560;
  flex-shrink: 0;
}
.ph-status-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ph-status .ph-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}
.ph-status .ph-dot.ph-connected {
  background: #4a9a8a;
}
.ph-status .ph-dot.ph-disconnected {
  background: #c4724e;
}
.ph-status .ph-sep {
  color: #b0a99e;
}
.ph-minimize-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 20px;
  background: #e8e0d4;
  border: 2px solid;
  border-color: #f5f0e8 #8a8279 #8a8279 #f5f0e8;
  cursor: pointer;
  color: #3d3833;
  padding: 0;
  margin-left: auto;
}
.ph-minimize-btn:hover {
  background: #f5f0e8;
}
.ph-minimize-btn:active {
  border-color: #8a8279 #f5f0e8 #f5f0e8 #8a8279;
  background: #d4cfc7;
}
.ph-minimize-btn svg {
  width: 12px;
  height: 12px;
}
.ph-status-field {
  position: relative;
  border: 1px solid #8a8279;
  padding: 2px 8px 2px 8px;
  margin: -2px 0;
  display: inline-flex;
  align-items: center;
}
.ph-status-field-label {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  background: #d4cfc7;
  padding: 0 4px;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 700;
  color: #4a9a8a;
  line-height: 1;
  white-space: nowrap;
}
.ph-json-string { color: #c4724e; }
.ph-json-number { color: #5b8db8; }
.ph-json-boolean { color: #d4b85c; }
.ph-json-null { color: #8a8279; font-style: italic; }
.ph-json-bracket { color: #8a8279; }
.ph-json-count { color: #8a8279; font-size: 10px; margin: 0 2px; }
.ph-json-leaf-value {
  border: 1px solid transparent;
  background: transparent;
  padding: 0 2px;
  margin: 0;
  font: inherit;
  cursor: text;
}
.ph-json-leaf-value:hover,
.ph-json-leaf-value:focus {
  background: #faf7f2;
  border-color: #d4cfc7;
  outline: none;
}
.ph-json-leaf-value:disabled {
  cursor: default;
}
.ph-json-edit-wrap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.ph-json-edit-input {
  width: 12ch;
  min-width: 6ch;
  max-width: 24ch;
  border: 1px solid #4a9a8a;
  background: #faf7f2;
  color: #3d3833;
  font: inherit;
  padding: 1px 3px;
}
.ph-json-edit-error {
  color: #c4724e;
  font-family: 'Atkinson Hyperlegible', sans-serif;
  font-size: 10px;
}
.ph-json-row {
  padding: 2px 0 2px 4px;
  font-family: 'Martian Mono', 'SF Mono', monospace;
  font-size: 11px;
}
.ph-json-expandable {
  cursor: pointer;
  user-select: none;
}
.ph-json-expandable:hover {
  background: #faf7f2;
}
.ph-json-toggle {
  color: #8a8279;
  font-size: 8px;
  margin-right: 4px;
  display: inline-block;
  width: 10px;
}
.ph-json-nested {
  display: block;
  margin-left: 14px;
  padding-left: 6px;
  border-left: 1px solid #d4cfc7;
}
.ph-json-nested.ph-collapsed {
  display: none;
}
.ph-search-bar {
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
  align-items: center;
}
.ph-search-input {
  width: 180px;
  padding: 3px 8px;
  font-family: 'Martian Mono', 'SF Mono', monospace;
  font-size: 11px;
  color: #3d3833;
  background: #faf7f2;
  border: 2px solid;
  border-color: #8a8279 #f5f0e8 #f5f0e8 #8a8279;
  outline: none;
}
.ph-search-input::placeholder {
  color: #b0a99e;
}
.ph-search-input:focus {
  border-color: #4a9a8a #d4cfc7 #d4cfc7 #4a9a8a;
}
.ph-tag-filter {
  padding: 3px 6px;
  font-family: 'Atkinson Hyperlegible', sans-serif;
  font-size: 11px;
  color: #3d3833;
  background: #e8e0d4;
  border: 2px solid;
  border-color: #f5f0e8 #8a8279 #8a8279 #f5f0e8;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  padding-right: 18px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238a8279'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 5px center;
}
.ph-tag-filter:hover {
  background-color: #f5f0e8;
}
.ph-empty {
  text-align: center;
  padding: 20px;
  color: #8a8279;
  font-size: 12px;
  font-family: 'Atkinson Hyperlegible', sans-serif;
}
.ph-duplicate-warning {
  margin: 0 0 8px 0;
  padding: 8px 10px;
  background: #fff0ec;
  border: 2px solid #c4724e;
  box-shadow: inset 3px 0 0 #c4724e;
  color: #3d3833;
}
.ph-duplicate-warning-title {
  font-family: 'Atkinson Hyperlegible', sans-serif;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: #9f3f2a;
}
.ph-duplicate-warning-message {
  margin-top: 3px;
  font-size: 11px;
  color: #6b352b;
}
.ph-duplicate-warning-list {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-family: 'Martian Mono', 'SF Mono', monospace;
  font-size: 11px;
}
.ph-duplicate-warning-item {
  display: flex;
  gap: 6px;
  align-items: center;
}
.ph-inspect-highlight {
  outline: 2px dashed #4a9a8a;
  outline-offset: 2px;
  position: relative;
}
.ph-inspect-highlight-hover {
  outline-color: #c4724e;
  box-shadow: 0 0 0 4px rgba(196, 114, 78, 0.15);
}
.ph-inspect-selected {
  outline: 2px solid #c4724e;
  outline-offset: 2px;
}
.ph-inspect-label {
  position: absolute;
  top: -18px;
  left: 0;
  background: #4a9a8a;
  color: #faf7f2;
  font-family: 'Martian Mono', monospace;
  font-size: 10px;
  padding: 2px 8px;
  pointer-events: none;
  z-index: 99999;
  white-space: nowrap;
}
@keyframes ph-flash {
  0% { outline: 3px solid #d4b85c; outline-offset: 2px; }
  100% { outline: 3px solid transparent; outline-offset: 2px; }
}
.ph-flash {
  animation: ph-flash 0.8s ease-out;
}
.ph-tabs {
  display: flex;
  gap: 0;
  background: linear-gradient(180deg, #ede6da 0%, #d4cfc7 100%);
  border-bottom: 1px solid #8a8279;
  flex-shrink: 0;
}
.ph-tab {
  font-family: 'Atkinson Hyperlegible', sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6b6560;
  background: transparent;
  border: none;
  border-right: 1px solid #b0a99e;
  padding: 6px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}
.ph-tab:hover {
  background: #f5f0e8;
  color: #3d3833;
}
.ph-tab.ph-tab-active {
  background: #f5f0e8;
  color: #3d3833;
  box-shadow: inset 0 -2px 0 #4a9a8a;
}
.ph-tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 14px;
  padding: 0 4px;
  font-family: 'Martian Mono', monospace;
  font-size: 9px;
  font-weight: 700;
  border-radius: 0;
  color: #faf7f2;
}
.ph-tab-badge.ph-badge-error { background: #c4724e; }
.ph-tab-badge.ph-badge-warn { background: #d4b85c; color: #3d3833; }
.ph-tab-badge.ph-badge-info { background: #5b8db8; }
.ph-console {
  flex: 1;
  overflow-y: auto;
  background: #faf7f2;
  font-family: 'Martian Mono', 'SF Mono', monospace;
  font-size: 11px;
  padding: 4px 0;
}
.ph-console::-webkit-scrollbar { width: 4px; }
.ph-console::-webkit-scrollbar-thumb { background: #d4cfc7; }
.ph-console-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 3px 8px;
  border-bottom: 1px solid #ede6da;
  white-space: pre-wrap;
  word-break: break-word;
}
.ph-console-row.ph-log-error { background: rgba(196, 114, 78, 0.08); }
.ph-console-row.ph-log-warn { background: rgba(212, 184, 92, 0.08); }
.ph-console-time {
  color: #b0a99e;
  font-size: 10px;
  flex-shrink: 0;
}
.ph-console-level {
  flex-shrink: 0;
  width: 12px;
  text-align: center;
  font-weight: 700;
}
.ph-console-level.ph-log-error { color: #c4724e; }
.ph-console-level.ph-log-warn { color: #d4b85c; }
.ph-console-level.ph-log-info { color: #5b8db8; }
.ph-console-level.ph-log-log { color: #8a8279; }
.ph-console-msg { flex: 1; min-width: 0; }
.ph-console-empty {
  padding: 20px;
  text-align: center;
  color: #8a8279;
  font-family: 'Atkinson Hyperlegible', sans-serif;
  font-size: 12px;
}
`;function We(l){const d=[];for(const b of l){const y=new Map;document.querySelectorAll(`[${b}]`).forEach(x=>{if(!(x instanceof HTMLElement)||!x.id)return;const k=y.get(x.id)??[];k.push(x),y.set(x.id,k)}),y.forEach((x,k)=>{x.length<2||d.push({tagType:b,elementId:k,elements:x})})}return d}function n(l,d,b){const y=document.createElement(l);return d&&(y.className=d),b&&Object.entries(b).forEach(([x,k])=>y.setAttribute(x,k)),y}function zt(l,d){Mt();const b=document.getElementById("playhtml-dev-root");b&&b.remove(),_e();const y=document.createElement("style");y.textContent=jt,document.head.appendChild(y);let x=!1,k=null,N=null;const T=n("div");T.id="playhtml-dev-root",Y=T;const Z=n("div","ph-trigger"),tt=n("img",void 0,{src:Ve,alt:"playhtml"});Z.appendChild(tt);const Be=n("div","ph-trigger-grip");for(let e=0;e<4;e++)Be.appendChild(document.createElement("span"));Z.appendChild(Be);const E=n("div","ph-bar"),ze=n("div","ph-resize-handle"),X=n("div","ph-bar-content"),K=n("div","ph-toolbar"),Le=n("div","ph-logo-btn"),nt=n("img",void 0,{src:Ve,alt:"playhtml"});Le.appendChild(nt),K.appendChild(Le);const j=n("button","ph-btn");j.innerHTML=Je.inspect,j.title="Inspect",j.style.width="26px",j.style.height="22px",K.appendChild(j);const Se=n("div");Se.style.flex="1",K.appendChild(Se);const J=n("button","ph-minimize-btn");J.innerHTML=Je.minimize,J.title="Minimize",K.appendChild(J),X.appendChild(K);const de=n("div","ph-status"),M=n("div","ph-status-row"),ot=n("span","ph-dot ph-connected");M.appendChild(ot),M.appendChild(document.createTextNode("connected"));const Ie=n("span","ph-sep");Ie.textContent="·",M.appendChild(Ie);const Ne=document.createTextNode("");M.appendChild(Ne);const Te=n("span","ph-sep");Te.textContent="·",M.appendChild(Te);const De=document.createTextNode("");M.appendChild(De);const ce=n("span","ph-sep");ce.textContent="·",M.appendChild(ce);const he=n("span");M.appendChild(he),de.appendChild(M);const W=n("div","ph-status-row");let fe;try{fe=decodeURIComponent(l.roomId)}catch{fe=l.roomId}const ge=n("span","ph-status-field"),Ye=n("span","ph-status-field-label");Ye.textContent="room",ge.appendChild(Ye),ge.appendChild(document.createTextNode(fe)),W.appendChild(ge);const He=n("span","ph-sep");He.textContent="·",W.appendChild(He);const ue=n("span","ph-status-field"),Re=n("span","ph-status-field-label");Re.textContent="host",ue.appendChild(Re),ue.appendChild(document.createTextNode(l.host)),W.appendChild(ue),de.appendChild(W);function P(){let e=1;try{const r=l.cursorClient?.getProvider();r&&(e=r.awareness.getStates().size)}catch{}Ne.textContent=`${e} client${e!==1?"s":""}`;let t=0;const p=new Set;d.forEach((r,c)=>{t+=r.size,p.add(c)}),De.textContent=`${t} element${t!==1?"s":""}`;const a=We(p).length;ce.style.display=a>0?"":"none",he.style.display=a>0?"":"none",he.textContent=a>0?`${a} conflict${a!==1?"s":""}`:""}P(),X.appendChild(de);const xe=n("div","ph-tabs"),G=n("button","ph-tab ph-tab-active");G.textContent="Data",xe.appendChild(G);const F=n("button","ph-tab");F.textContent="Console";const B=n("span","ph-tab-badge");B.style.display="none",F.appendChild(B),xe.appendChild(F),X.appendChild(xe);const me=n("div","ph-bar-main"),v=n("div","ph-data"),z=n("div","ph-console");z.style.display="none",me.appendChild(v),me.appendChild(z),X.appendChild(me);function be(e){ee=e,e==="data"?(G.classList.add("ph-tab-active"),F.classList.remove("ph-tab-active"),v.style.display="",z.style.display="none",Ce(),P(),L()):(G.classList.remove("ph-tab-active"),F.classList.add("ph-tab-active"),v.style.display="none",z.style.display="",$=0,_=0,ye=0,Ue(),Ze())}G.addEventListener("click",()=>be("data")),F.addEventListener("click",()=>be("console"));function Ue(){const e=$+_+ye;if(e===0){B.style.display="none";return}B.style.display="",B.textContent=String(e),B.classList.remove("ph-badge-error","ph-badge-warn","ph-badge-info"),$>0?B.classList.add("ph-badge-error"):_>0?B.classList.add("ph-badge-warn"):B.classList.add("ph-badge-info")}function Ze(){if(z.innerHTML="",Q.length===0){const e=n("div","ph-console-empty");e.textContent="No console output yet.",z.appendChild(e);return}for(const e of Q){const t=n("div",`ph-console-row ph-log-${e.level}`),p=n("span","ph-console-time"),a=new Date(e.timestamp);p.textContent=a.toLocaleTimeString([],{hour12:!1});const r=n("span",`ph-console-level ph-log-${e.level}`);r.textContent=e.level==="error"?"✕":e.level==="warn"?"!":e.level==="info"?"i":"·";const c=n("span","ph-console-msg");c.textContent=e.parts.join(" ")+(e.source?`  @ ${e.source}`:""),t.appendChild(p),t.appendChild(r),t.appendChild(c),z.appendChild(t)}z.scrollTop=z.scrollHeight}const Q=[],it=500;let $=0,_=0,ye=0,ee="data",Ae=!1,ve=!1;function at(){ve||(ve=!0,queueMicrotask(()=>{ve=!1,!(Y!==T||!E.classList.contains("ph-open")||ee!=="data")&&(P(),L())}))}function Ce(){const e=new Set;d.forEach((t,p)=>{t.forEach((a,r)=>{const c=`${p}:${r}`;e.add(c);const C=H.get(c);C?.handler!==a&&(C?.unsubscribe(),H.delete(c),typeof a.onDataUpdate=="function"&&H.set(c,{handler:a,unsubscribe:a.onDataUpdate(at)}))})});for(const[t,p]of H)e.has(t)||(p.unsubscribe(),H.delete(t))}function Fe(e){if(e instanceof Error)return e.stack||`${e.name}: ${e.message}`;if(typeof e=="string")return e;if(e===null)return"null";if(e===void 0)return"undefined";try{return JSON.stringify(e)}catch{return String(e)}}function we(e){Q.push(e),Q.length>it&&Q.shift(),(ee!=="console"||!E.classList.contains("ph-open"))&&(e.level==="error"?$+=1:e.level==="warn"?_+=1:ye+=1),e.level==="error"&&!Ae&&E.classList.contains("ph-open")&&(Ae=!0,be("console")),Ue(),ee==="console"&&Ze()}I||(I={log:console.log.bind(console),info:console.info.bind(console),warn:console.warn.bind(console),error:console.error.bind(console)});const rt=I;["log","info","warn","error"].forEach(e=>{console[e]=(...t)=>{rt[e](...t),we({level:e,timestamp:Date.now(),parts:t.map(Fe)})}}),R&&window.removeEventListener("error",R),U&&window.removeEventListener("unhandledrejection",U),R=e=>{we({level:"error",timestamp:Date.now(),parts:[e.message||String(e.error)],source:e.filename?`${e.filename}:${e.lineno}:${e.colno}`:void 0})},U=e=>{we({level:"error",timestamp:Date.now(),parts:["Unhandled Promise rejection: "+Fe(e.reason)]})},window.addEventListener("error",R),window.addEventListener("unhandledrejection",U),E.appendChild(ze),E.appendChild(X),T.appendChild(Z),T.appendChild(E),document.body.appendChild(T);function O(e,t){if(t===void 0)return;const p=n("span","ph-tree-key");p.textContent=t+": ",e.appendChild(p)}function te(e,t,p,a,r,c,C){const g=n("div","ph-json-row");O(g,c);const o=n("button",`${a} ph-json-leaf-value`);if(o.type="button",o.textContent=r,r.endsWith('..."')&&(o.title=String(t)),g.appendChild(o),!C){o.disabled=!0,e.appendChild(g);return}o.onclick=s=>{s.stopPropagation(),o.replaceWith(Oe(t,p,a,C))},e.appendChild(g)}function Oe(e,t,p,a){const r=n("span","ph-json-edit-wrap"),c=n("input","ph-json-edit-input"),C=n("span","ph-json-edit-error");c.value=xt(e),c.setAttribute("aria-label","Edit state value"),r.appendChild(c);function g(){const i=n("button",`${p} ph-json-leaf-value`);i.type="button",i.textContent=typeof e=="string"?e.length>80?`"${e.substring(0,80)}..."`:`"${e}"`:String(e),i.onclick=h=>{h.stopPropagation(),i.replaceWith(Oe(e,t,p,a))},r.replaceWith(i)}function o(i){C.textContent=i,C.parentElement||r.appendChild(C)}function s(){const i=mt(c.value);if(!i.ok){o(i.error);return}const h=a(t,i.value);if(!h.ok){o(h.error);return}requestAnimationFrame(()=>L())}return c.onclick=i=>i.stopPropagation(),c.onkeydown=i=>{i.key==="Enter"?(i.preventDefault(),s()):i.key==="Escape"&&(i.preventDefault(),g())},requestAnimationFrame(()=>{c.focus(),c.select()}),r}function ne(e,t,p,a,r,c){if(t===null){te(e,t,a,"ph-json-null","null",r,c);return}if(t===void 0){const g=n("div","ph-json-row");O(g,r);const o=n("span","ph-json-null");o.textContent="undefined",g.appendChild(o),e.appendChild(g);return}if(typeof t=="string"){te(e,t,a,"ph-json-string",t.length>80?`"${t.substring(0,80)}..."`:`"${t}"`,r,c);return}if(typeof t=="number"){if(!Me(t)){const g=n("div","ph-json-row");O(g,r);const o=n("span","ph-json-number");o.textContent=String(t),g.appendChild(o),e.appendChild(g);return}te(e,t,a,"ph-json-number",String(t),r,c);return}if(typeof t=="boolean"){te(e,t,a,"ph-json-boolean",String(t),r,c);return}if(Array.isArray(t)){const g=n("div","ph-json-row ph-json-expandable"),o=n("span","ph-json-toggle"),s=n("div","ph-json-nested"),i=t.length<=5&&p<=2;o.textContent=i?"▼":"▶",i||s.classList.add("ph-collapsed"),r!==void 0&&O(g,r),g.appendChild(o);const h=n("span","ph-json-bracket");h.textContent="[",g.appendChild(h);const u=n("span","ph-json-count");u.textContent=String(t.length),g.appendChild(u);const f=n("span","ph-json-bracket");f.textContent="]",g.appendChild(f),g.onclick=m=>{m.stopPropagation();const A=s.classList.toggle("ph-collapsed");o.textContent=A?"▶":"▼"};for(let m=0;m<t.length;m++)ne(s,t[m],p+1,[...a,m],String(m),c);e.appendChild(g),e.appendChild(s);return}if(typeof t=="object"){const g=Object.keys(t),o=n("div","ph-json-row ph-json-expandable"),s=n("span","ph-json-toggle"),i=n("div","ph-json-nested"),h=g.length<=5&&p<=2;s.textContent=h?"▼":"▶",h||i.classList.add("ph-collapsed"),r!==void 0&&O(o,r),o.appendChild(s);const u=n("span","ph-json-bracket");u.textContent="{",o.appendChild(u);const f=n("span","ph-json-count");f.textContent=String(g.length),o.appendChild(f);const m=n("span","ph-json-bracket");m.textContent="}",o.appendChild(m),o.onclick=A=>{A.stopPropagation();const ae=i.classList.toggle("ph-collapsed");s.textContent=ae?"▶":"▼"};for(const A of g)ne(i,t[A],p+1,[...a,A],A,c);e.appendChild(o),e.appendChild(i);return}const C=n("div","ph-json-row");O(C,r),C.appendChild(document.createTextNode(String(t))),e.appendChild(C)}function pt(e,t,p,a){if(t==null){const r=n("span","ph-json-null");r.textContent=String(t),e.appendChild(r)}else if(typeof t=="object"&&!Array.isArray(t))for(const[r,c]of Object.entries(t))ne(e,c,p,[r],r,a);else ne(e,t,p,[],void 0,a)}let D="",V="";function L(){wt(x),v.innerHTML="";const e=n("div","ph-search-bar"),t=n("input","ph-search-input");t.type="text",t.placeholder="Search by element ID...",t.value=D;let p;t.oninput=()=>{D=t.value,clearTimeout(p),p=setTimeout(()=>L(),150)},e.appendChild(t);const a=new Set;d.forEach((o,s)=>a.add(s));const r=We(a);if(a.size>1){const o=n("select","ph-tag-filter"),s=document.createElement("option");s.value="",s.textContent="All types",o.appendChild(s),a.forEach(i=>{const h=document.createElement("option");h.value=i,h.textContent=i,o.appendChild(h)}),o.value=V,o.onchange=()=>{V=o.value,L()},e.appendChild(o)}const c=n("button","ph-reset-btn");if(c.textContent="Reset All",c.onclick=()=>{window.confirm("Reset all playhtml element data?")&&(d.forEach(o=>{o.forEach(s=>{s.setData(s.defaultData)})}),L())},e.appendChild(c),v.appendChild(e),r.length>0){const o=n("div","ph-duplicate-warning"),s=n("div","ph-duplicate-warning-title");s.textContent="Error: Duplicate playhtml IDs",o.appendChild(s);const i=n("div","ph-duplicate-warning-message");i.textContent="These elements share synced data and later duplicates are ignored.",o.appendChild(i);const h=n("div","ph-duplicate-warning-list");for(const u of r){const f=n("div","ph-duplicate-warning-item"),m=n("span","ph-tree-badge");m.textContent=u.tagType,m.style.background="#c4724e";const A=n("span");A.textContent=`#${u.elementId} (${u.elements.length})`,f.appendChild(m),f.appendChild(A),h.appendChild(f)}o.appendChild(h),v.insertBefore(o,e)}requestAnimationFrame(()=>{D&&(t.focus(),t.setSelectionRange(D.length,D.length))});let C=!1;if(d.forEach(o=>{o.size>0&&(C=!0)}),C){let o=0;if(d.forEach((s,i)=>{V&&i!==V||s.forEach((h,u)=>{if(D&&!u.toLowerCase().includes(D.toLowerCase()))return;o++;const f=n("div","ph-tree-item");f.setAttribute("data-element-id",u),f.setAttribute("data-tag-type",i);const m=n("span","ph-tree-toggle");m.textContent="▶";const A=n("span","ph-tree-badge");A.textContent=i,A.style.background=kt[i]||Et;const ae=n("span","ph-tree-el-name");ae.textContent=`#${u}`;const je=n("button","ph-tree-reset");je.textContent="reset",je.onclick=w=>{w.stopPropagation(),h.setData(h.defaultData),L()},f.onmouseenter=()=>{const w=document.getElementById(u);w&&w.classList.add("ph-inspect-highlight","ph-inspect-highlight-hover")},f.onmouseleave=()=>{const w=document.getElementById(u);w&&w.classList.remove("ph-inspect-highlight","ph-inspect-highlight-hover")},f.appendChild(m),f.appendChild(A),f.appendChild(ae),f.appendChild(je);const re=n("div","ph-tree-children");pt(re,h.data,0,(w,pe)=>{const S=bt(h.data,w,pe);return S.ok?(h.setData(S.data),{ok:!0}):S});function Qe(){const w=re.classList.toggle("ph-expanded");m.textContent=w?"▼":"▶"}m.onclick=w=>{w.stopPropagation(),Qe()},f.onclick=w=>{const pe=w.target;if(pe.closest(".ph-tree-toggle")||pe.closest(".ph-tree-reset"))return;const S=document.getElementById(u);S&&(S.scrollIntoView({behavior:"smooth",block:"center"}),S.classList.add("ph-flash"),S.addEventListener("animationend",()=>S.classList.remove("ph-flash"),{once:!0})),re.classList.contains("ph-expanded")||Qe()},v.appendChild(f),v.appendChild(re)})}),o===0&&(D||V)){const s=n("div","ph-empty");s.textContent="No elements match the current filter.",v.appendChild(s)}}else{const o=n("div","ph-empty");o.textContent="No playhtml elements found.",v.appendChild(o)}if(r.length>0){const o=document.createElement("hr");o.style.border="none",o.style.borderTop="1px solid #d4cfc7",o.style.margin="6px 0",v.appendChild(o);const s=n("div","ph-data-header");s.textContent="Duplicate IDs",s.style.fontSize="10px",v.appendChild(s);for(const i of r){const h=n("div","ph-tree-item"),u=n("span","ph-tree-badge");u.textContent=i.tagType,u.style.background="#c4724e";const f=n("span","ph-tree-el-name");f.textContent=`#${i.elementId} (${i.elements.length})`,f.title="Multiple elements with this ID share the same capability tag.",f.onclick=m=>{m.stopPropagation();for(const A of i.elements)A.classList.add("ph-flash"),A.addEventListener("animationend",()=>A.classList.remove("ph-flash"),{once:!0});i.elements[0]?.scrollIntoView({behavior:"smooth",block:"center"})},h.appendChild(u),h.appendChild(f),v.appendChild(h)}}const g=ut();if(g.length>0){const o=document.createElement("hr");o.style.border="none",o.style.borderTop="1px solid #d4cfc7",o.style.margin="6px 0",v.appendChild(o);const s=n("div","ph-data-header");s.textContent="Shared Elements",s.style.fontSize="10px",v.appendChild(s);for(const i of g){const h=n("div","ph-tree-item"),u=n("span","ph-tree-badge");i.type==="source"?(u.textContent="SRC",u.style.background="#4a9a8a"):(u.textContent="REF",u.style.background="#5b8db8");const f=n("span","ph-tree-el-name");f.textContent=`#${i.elementId}`,f.title=i.dataSource,f.onclick=m=>{m.stopPropagation(),i.element.scrollIntoView({behavior:"smooth",block:"center"}),i.element.classList.add("ph-flash"),i.element.addEventListener("animationend",()=>i.element.classList.remove("ph-flash"),{once:!0})},h.appendChild(u),h.appendChild(f),v.appendChild(h)}}}let oe=400,ie=240;const lt=document.body.style.marginRight,st=document.body.style.marginBottom;function qe(){return T.dataset.position==="bottom"?"bottom":"right"}function dt(){Z.style.display="none",E.classList.add("ph-open"),qe()==="bottom"?document.body.style.marginBottom=`${ie}px`:document.body.style.marginRight=`${oe}px`,Ce(),P(),L()}function ct(){Z.style.display="",E.classList.remove("ph-open"),document.body.style.marginRight=lt,document.body.style.marginBottom=st,Ae=!1,x&&(x=!1,j.classList.remove("ph-active"),Ee())}let ke=0;d.forEach(e=>{ke+=e.size});function Xe(){Ce();let e=0;d.forEach(t=>{e+=t.size}),e!==ke&&(ke=e,E.classList.contains("ph-open")&&(P(),L()))}const Ke=new MutationObserver(e=>{for(const t of e)if(T.contains(t.target))return;Xe()});Ke.observe(document.documentElement,{childList:!0,subtree:!0}),q!==null&&window.clearInterval(q),q=window.setInterval(Xe,250),le=Ke,Z.addEventListener("click",()=>dt()),J.onclick=()=>ct(),ze.addEventListener("mousedown",e=>{e.preventDefault();const t=qe(),p=r=>{t==="bottom"?(ie=Math.max(120,Math.min(window.innerHeight-100,window.innerHeight-r.clientY)),E.style.height=`${ie}px`,document.body.style.marginBottom=`${ie}px`):(oe=Math.max(280,Math.min(700,window.innerWidth-r.clientX)),E.style.width=`${oe}px`,document.body.style.marginRight=`${oe}px`)},a=()=>{document.removeEventListener("mousemove",p),document.removeEventListener("mouseup",a)};document.addEventListener("mousemove",p),document.addEventListener("mouseup",a)});function ht(e){let t=null;return d.forEach((p,a)=>{p.has(e)&&(t={tagType:a,handler:p.get(e)})}),t}function ft(e){const t=v.querySelector(`.ph-tree-item[data-element-id="${e}"]`);if(!t)return;t.scrollIntoView({behavior:"smooth",block:"nearest"});const p=t.nextElementSibling;if(p&&p.classList.contains("ph-tree-children")){p.classList.add("ph-expanded");const a=t.querySelector(".ph-tree-toggle");a&&(a.textContent="▼")}}function gt(){document.querySelectorAll("[class*='__playhtml-']").forEach(e=>{const t=e;t.classList.add("ph-inspect-highlight");const p=t.id;if(p){const a=n("div","ph-inspect-label");a.textContent=`#${p}`,t.appendChild(a)}})}function Ee(){et(),N=null}j.onclick=()=>{x=!x,j.classList.toggle("ph-active",x),x?gt():Ee()};const Pe=e=>{if(!x)return;const t=e.target.closest("[class*='__playhtml-']");t&&t!==N?(N&&N.classList.remove("ph-inspect-highlight-hover"),N=t,t.classList.add("ph-inspect-highlight-hover")):t||N&&(N.classList.remove("ph-inspect-highlight-hover"),N=null)};document.addEventListener("mousemove",Pe);const Ge=e=>{if(!x)return;const t=document.getElementById("playhtml-dev-root");if(t&&t.contains(e.target))return;const p=e.target.closest("[class*='__playhtml-']");if(p){e.preventDefault(),e.stopPropagation(),document.querySelectorAll(".ph-inspect-selected").forEach(c=>c.classList.remove("ph-inspect-selected")),p.classList.add("ph-inspect-selected");const a=p.id;k=a||null;const r=a?ht(a):null;r&&console.log(`[playhtml inspect] ${r.tagType} #${k}`,r.handler.data),a&&ft(a)}};document.addEventListener("click",Ge,!0),se=()=>{x=!1,j.classList.remove("ph-active"),document.removeEventListener("mousemove",Pe),document.removeEventListener("click",Ge,!0),Ee()}}function Mt(){se?(se(),se=null):et(),I&&(console.log=I.log,console.info=I.info,console.warn=I.warn,console.error=I.error,I=null),R&&(window.removeEventListener("error",R),R=null),U&&(window.removeEventListener("unhandledrejection",U),U=null),le&&(le.disconnect(),le=null),q!==null&&(window.clearInterval(q),q=null),_e(),Y&&Y.parentElement&&(Y.parentElement.removeChild(Y),Y=null)}export{We as listDuplicatePlayElements,ut as listSharedElements,zt as setupDevUI,Mt as teardownDevUI};
