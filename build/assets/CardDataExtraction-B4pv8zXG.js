import{u as C,r as s,j as e,S as J,E as B,B as f,c as I,d as r}from"./index-BZrIClkH.js";const R=r.div`
  padding: 1rem;
`,$=r.p`
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.5;
`,Y=r.div`
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
`,q=r.p`
  font-weight: 500;
  color: #333;
  margin-bottom: 1rem;
  line-height: 1.4;
`,D=r.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`,b=r.button`
  flex: 1;
  min-width: 200px;
  padding: 1rem;
  background: ${n=>n.selected?n.optionType==="A"?"#e3f2fd":"#f3e5f5":"#ffffff"};
  border: 2px solid ${n=>n.selected?n.optionType==="A"?"#2196f3":"#9c27b0":"#dee2e6"};
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  line-height: 1.4;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    border-color: ${n=>n.optionType==="A"?"#2196f3":"#9c27b0"};
    background: ${n=>n.optionType==="A"?"#e3f2fd":"#f3e5f5"};
  }

  &::before {
    content: '${n=>n.optionType}';
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    width: 24px;
    height: 24px;
    background: ${n=>n.optionType==="A"?"#2196f3":"#9c27b0"};
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: bold;
    opacity: ${n=>n.selected?1:.3};
  }
`,G=r.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1.5rem;

  h4 {
    margin: 0 0 1rem 0;
    color: #495057;
  }

  ul {
    margin: 0;
    padding-left: 0;
    list-style: none;
  }

  li {
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: white;
    border-radius: 4px;
    border-left: 4px solid #dee2e6;
  }

  strong {
    display: block;
    margin-bottom: 0.25rem;
    color: #333;
  }
`,H=r.div`
  text-align: center;
  margin-top: 1.5rem;
`,z=r.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
  transition: background 0.2s ease;

  &:hover {
    background: #218838;
  }
`,N=r.div`
  text-align: center;
`,Q=r.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #e8f5e8;
  border-radius: 8px;

  h4 {
    color: #2d5a2d;
    margin-bottom: 1rem;
  }
`,P=r.p`
  font-style: italic;
  color: #2d5a2d;
  font-size: 1.1rem;
  line-height: 1.5;
  margin: 0;
`,L=r.div`
  h4 {
    color: #333;
    margin-bottom: 1rem;
  }

  p {
    color: #666;
    margin-bottom: 1.5rem;
  }
`,M=r.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`,F=r.button`
  padding: 1rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  line-height: 1.4;
  transition: all 0.2s ease;

  &:hover {
    background: #e9ecef;
    border-color: #adb5bd;
  }
`,U=r.div`
  p {
    margin-bottom: 0.5rem;
    text-align: left;
  }
`,W=r.textarea`
  width: 100%;
  min-height: 80px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  resize: vertical;
`,V=({onComplete:n})=>{const{canvasState:a,updateCanvasState:x}=C(),[c,y]=s.useState([]),[w,l]=s.useState(!0),[h,m]=s.useState(null),[i,j]=s.useState({}),[k,v]=s.useState(!1),[O,p]=s.useState([]);s.useEffect(()=>{const t=async()=>{try{l(!0);const o=await I.getEitherOrPrompts(a.selectedTopic||"");y(o),m(null)}catch(o){m(o),console.error("Error loading data extraction prompts:",o)}finally{l(!1)}};a.selectedTopic&&t()},[a.selectedTopic]);const u=(t,o,d)=>{j(A=>({...A,[t]:{choice:o,text:d,question:c[t].question}}))},S=()=>{Object.values(i),T(),v(!0)},T=async t=>{try{const d={"Self-Image":["Remind me to check in with my values before making decisions","Help me notice when I need to pause and practice self-compassion","Alert me to opportunities for celebrating small wins"],Money:["Help me pause and consider my true priorities before financial decisions","Remind me that my worth isn't measured by my bank account","Guide me to make choices from abundance rather than scarcity"],Relationships:["Help me communicate my needs with clarity and kindness","Remind me to maintain healthy boundaries while staying open to connection","Guide me to respond from love rather than fear in conflicts"]}[a.selectedTopic]||["Remind me to check in with my values before making decisions","Help me notice when I need to pause and breathe","Alert me to opportunities for self-compassion"];p(d)}catch{p(["Remind me to check in with my values before making decisions","Help me notice when I need to pause and breathe","Alert me to opportunities for self-compassion"])}},g=t=>{x({miningResults:{...a.miningResults,dataExtraction:{type:"dataExtraction",responses:i,extractedData:Object.values(i),thoughtThankYou:!0,newJob:t,timestamp:new Date().toISOString()}}}),n()},E=Object.keys(i).length===c.length;return w?e.jsx(J,{message:"Loading extraction prompts..."}):h?e.jsx(B,{title:"Error loading prompts",message:h.message,"aria-label":"Error loading prompts"}):k?e.jsx(f,{title:"Thank the Thought & Offer New Job",testId:"card-data-extraction-thankyou",showActions:!1,children:e.jsxs(N,{children:[e.jsxs(Q,{children:[e.jsx("h4",{children:"Thank the Thought (Genuinely)"}),e.jsx(P,{children:`"I see you were trying to help. You're not the enemy. You showed up when I needed some kind of safety."`})]}),e.jsxs(L,{children:[e.jsx("h4",{children:"Offer an Updated Job"}),e.jsx("p",{children:"Based on what we learned, here are some new roles this thought could play:"}),e.jsx(M,{children:O.map((t,o)=>e.jsx(F,{onClick:()=>g(t),"data-testid":`new-job-option-${o}`,children:t},o))}),e.jsxs(U,{children:[e.jsx("p",{children:"Or create your own:"}),e.jsx(W,{placeholder:"What new job would you like to offer this thought?",onBlur:t=>{t.target.value.trim()&&g(t.target.value.trim())},"data-testid":"custom-job-input"})]})]})]})}):e.jsx(f,{title:"Extract Core Data",testId:"card-data-extraction",showActions:!1,children:e.jsxs(R,{children:[e.jsx($,{children:"Answer these either/or questions to mine your thought for its core message:"}),e.jsx("div",{children:c.map((t,o)=>e.jsxs(Y,{children:[e.jsx(q,{children:t.question}),e.jsxs(D,{children:[e.jsx(b,{optionType:"A",selected:i[o]?.choice==="A",onClick:()=>u(o,"A",t.optionA),"data-testid":`extraction-option-${o}-a`,children:t.optionA}),e.jsx(b,{optionType:"B",selected:i[o]?.choice==="B",onClick:()=>u(o,"B",t.optionB),"data-testid":`extraction-option-${o}-b`,children:t.optionB})]})]},o))}),Object.keys(i).length>0&&e.jsxs(G,{children:[e.jsx("h4",{children:"Your Insights So Far:"}),e.jsx("ul",{children:Object.values(i).map((t,o)=>e.jsxs("li",{children:[e.jsx("strong",{children:"Q:"})," ",t.question,e.jsx("br",{}),e.jsx("strong",{children:"A:"})," ",t.text]},o))})]}),E&&e.jsx(H,{children:e.jsx(z,{onClick:S,"data-testid":"complete-data-extraction",children:"Thank the Thought & Continue"})})]})})};export{V as default};
//# sourceMappingURL=CardDataExtraction-B4pv8zXG.js.map
