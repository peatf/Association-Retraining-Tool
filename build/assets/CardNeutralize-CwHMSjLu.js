import{u as f,r as s,j as t,S as x,E as b,B as j,d as z}from"./main-ChZ8bRsW.js";import{c as E}from"./ContentSearchService-DqsTnI7q.js";const P=z.button`
  display: block;
  width: 100%;
  padding: 1rem;
  margin-bottom: 0.5rem;
  text-align: left;
  background-color: ${a=>a.selected?"#e0e0e0":"#f0f0f0"};
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #e0e0e0;
  }
`,T=({onComplete:a})=>{const{canvasState:o,updateCanvasState:l}=f(),[d,p]=s.useState([]),[u,n]=s.useState(!0),[i,m]=s.useState(null),[c,h]=s.useState(null);s.useEffect(()=>{const e=async()=>{try{n(!0);const r=await E.getMiningPrompts(o.selectedTopic||"","neutralize");p(r),n(!1)}catch(r){m(r),n(!1)}};o.selectedTopic&&e()},[o.selectedTopic]);const g=e=>{h(e)},S=()=>{l({miningResults:{...o.miningResults,neutralize:{prompt:c,timestamp:new Date().toISOString()}}}),a()};return u?t.jsx(x,{message:"Loading prompts..."}):i?t.jsx(b,{title:"Error loading prompts",message:i.message,"aria-label":"Error loading prompts"}):t.jsx(j,{title:"Neutralize the Thought",onComplete:S,completionText:"Continue",onActivate:()=>{},testId:"neutralize-card",onSkip:()=>{},"aria-describedby":"neutralize-description","aria-label":"Neutralize the Thought",children:t.jsxs("div",{style:{padding:"1rem"},children:[t.jsx("p",{children:"Select a prompt to help neutralize the thought:"}),t.jsx("div",{children:d.map((e,r)=>t.jsx(P,{selected:c===e,onClick:()=>g(e),children:e},r))})]})})};export{T as default};
//# sourceMappingURL=CardNeutralize-CwHMSjLu.js.map
