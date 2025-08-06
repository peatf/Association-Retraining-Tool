import{u as v,r as a,j as t,S as A,E as B,B as y,d as C}from"./main-ChZ8bRsW.js";import{c as w}from"./ContentSearchService-DqsTnI7q.js";const m=C.button`
  padding: 0.5rem 1rem;
  margin: 0 0.5rem;
  background-color: ${o=>o.selected?"#e0e0e0":"#f0f0f0"};
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #e0e0e0;
  }
`,D=({onComplete:o})=>{const{canvasState:n,updateCanvasState:u}=v(),[x,g]=a.useState([]),[h,i]=a.useState(!0),[d,j]=a.useState(null),[r,S]=a.useState({});a.useEffect(()=>{const e=async()=>{try{i(!0);const s=await w.getMiningPrompts(n.selectedTopic||"","dataExtraction");g(s),i(!1)}catch(s){j(s),i(!1)}};n.selectedTopic&&e()},[n.selectedTopic]);const l=(e,s)=>{S({...r,[e]:s})},f=()=>{u({miningResults:{...n.miningResults,dataExtraction:{answers:r,timestamp:new Date().toISOString()}}}),o()};if(h)return t.jsx(A,{message:"Loading prompts...","aria-label":"Loading prompts"});if(d)return t.jsx(B,{title:"Error loading prompts",message:d.message,"aria-label":"Error loading prompts"});const p=Object.values(r).reduce((e,s)=>(e[s]=(e[s]||0)+1,e),{});return t.jsx(y,{title:"Data Extraction",onComplete:f,completionText:"Continue",onActivate:()=>{},testId:"data-extraction-card",onSkip:()=>{},"aria-describedby":"data-extraction-description","aria-label":"Data Extraction",children:t.jsxs("div",{style:{padding:"1rem"},children:[x.map((e,s)=>{const c=e.split(" or ");if(c.length===2){const E=c[0].replace("A: ",""),b=c[1].replace("B: ","");return t.jsxs("div",{style:{marginBottom:"1rem"},children:[t.jsx("p",{children:e}),t.jsxs("div",{children:[t.jsx(m,{selected:r[e]==="A",onClick:()=>l(e,"A"),children:E}),t.jsx(m,{selected:r[e]==="B",onClick:()=>l(e,"B"),children:b})]})]},s)}return t.jsx("p",{children:e},s)}),t.jsxs("div",{style:{marginTop:"2rem",textAlign:"center"},children:[t.jsx("h4",{children:"Summary"}),t.jsxs("p",{children:["A answers: ",p.A||0]}),t.jsxs("p",{children:["B answers: ",p.B||0]})]})]})})};export{D as default};
//# sourceMappingURL=CardDataExtraction-DGIASBhN.js.map
