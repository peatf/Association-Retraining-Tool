import{u as v,r as l,j as e,B as C,d as r}from"./index-BZrIClkH.js";const j=r.div`
  padding: 1rem;
`,y=r.div`
  margin-bottom: 1.5rem;
  text-align: center;
`,S=r.div`
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  margin-top: 0.5rem;
  overflow: hidden;
`,w=r.div`
  height: 100%;
  background: #3498db;
  width: ${c=>c.width}%;
  transition: width 0.3s ease;
`,k=r.div`
  margin-bottom: 2rem;
`,R=r.h4`
  color: #333;
  margin-bottom: 0.5rem;
`,z=r.p`
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
`,P=r.div`
  margin: 1rem 0;
`,I=r.input`
  width: 100%;
  margin: 0.5rem 0;
`,A=r.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #666;
`,D=r.div`
  margin: 1rem 0;
`,T=r.textarea`
  width: 100%;
  min-height: 80px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`,E=r.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  margin: 1rem 0;
`,N=r.button`
  padding: 0.75rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;

  &:hover {
    background: #e9ecef;
    border-color: #adb5bd;
  }
`,O=r.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;

  h5 {
    margin: 0 0 0.5rem 0;
    color: #495057;
  }

  ul {
    margin: 0;
    padding-left: 1.5rem;
  }

  li {
    margin-bottom: 0.25rem;
    color: #6c757d;
  }
`,p=r.button`
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s ease;

  &:hover {
    background: #2980b9;
  }

  &:disabled {
    background: #adb5bd;
    cursor: not-allowed;
  }
`,K=({onComplete:c})=>{const{canvasState:m,updateCanvasState:g}=v(),[t,x]=l.useState(1),[n,h]=l.useState({initialCharge:5,observerShiftComplete:!1,thirdPersonReword:"",distractionActivity:"",finalCharge:5}),[B,$]=l.useState(!1),[L,M]=l.useState(null),b=[{id:1,title:"Name the Thought, Feel the Charge",instruction:"Rate the emotional intensity of this thought (1-10):",component:"slider"},{id:2,title:"Observer Shift",instruction:"Either say out loud to yourself or in your mind the thought in a voice that sounds monotone",component:"instruction"},{id:3,title:"Third-Person Reword",instruction:"If this were a line in a novel describing someone else, how would the narrator phrase it?",component:"text",placeholder:"She is having the thought that people won't take her seriously..."},{id:4,title:"Distract with Mildness",instruction:"Choose a gentle distraction activity:",component:"select",options:["Describe the room you're in","Name colors around you","Describe the texture of your shirt","Count your breaths to 10","Pet your cat/dog","Other mindful activity"]},{id:5,title:"Recheck the Charge",instruction:"What number is it now? Even a drop from 7 to 5 means you've reclaimed energetic control:",component:"slider"}],a=(i,o)=>{const u={1:"initialCharge",2:"observerShiftComplete",3:"thirdPersonReword",4:"distractionActivity",5:"finalCharge"}[i],d={...n,[u]:o};if(h(d),i<5)x(i+1);else{const f=d.initialCharge-o;g({miningResults:{...m.miningResults,neutralize:{type:"neutralize",steps:d,chargeReduction:f,timestamp:new Date().toISOString()}}}),c()}},s=b[t-1];return e.jsx(C,{title:"Neutralize the Voice",onActivate:()=>{},testId:"card-neutralize",onSkip:()=>{},"aria-describedby":"neutralize-description","aria-label":"Neutralize the Voice",showActions:!1,children:e.jsxs(j,{children:[e.jsxs(y,{children:[e.jsxs("span",{children:["Step ",t," of 5"]}),e.jsx(S,{children:e.jsx(w,{width:t/5*100})})]}),e.jsxs(k,{children:[e.jsx(R,{children:s.title}),e.jsx(z,{children:s.instruction}),s.component==="slider"&&e.jsxs(P,{children:[e.jsx(I,{type:"range",min:"1",max:"10",value:n[t===1?"initialCharge":"finalCharge"],onChange:i=>{const o=parseInt(i.target.value),u=t===1?"initialCharge":"finalCharge";h(d=>({...d,[u]:o}))},onMouseUp:i=>a(t,parseInt(i.target.value)),onTouchEnd:i=>a(t,parseInt(i.target.value)),"data-testid":`neutralize-step-${t}-slider`}),e.jsxs(A,{children:[e.jsx("span",{children:"1 - Calm"}),e.jsx("span",{children:"10 - Overwhelming"})]}),e.jsxs("div",{style:{textAlign:"center",marginTop:"0.5rem",color:"#666"},children:["Current value: ",n[t===1?"initialCharge":"finalCharge"]]})]}),s.component==="text"&&e.jsxs(D,{children:[e.jsx(T,{placeholder:s.placeholder,value:n.thirdPersonReword,onChange:i=>h(o=>({...o,thirdPersonReword:i.target.value})),"data-testid":`neutralize-step-${t}-text`}),e.jsx(p,{onClick:()=>a(t,n.thirdPersonReword),disabled:!n.thirdPersonReword.trim(),children:"Continue"})]}),s.component==="instruction"&&e.jsxs("div",{style:{margin:"1rem 0"},children:[e.jsx("div",{style:{background:"#f8f9fa",padding:"1rem",borderRadius:"4px",marginBottom:"1rem",borderLeft:"4px solid #3498db"},children:e.jsx("p",{style:{margin:0,fontStyle:"italic"},children:'Have the user prepend the phrase "My mind just produced the thought..." (in a monotone) and speak/hear it once more.'})}),e.jsx(p,{onClick:()=>a(t,!0),children:"I've Done This Step"})]}),s.component==="select"&&e.jsx(E,{children:s.options?.map((i,o)=>e.jsx(N,{onClick:()=>a(t,i),"data-testid":`neutralize-step-${t}-option-${o}`,children:i},o))})]}),t>1&&e.jsxs(O,{children:[e.jsx("h5",{children:"Progress so far:"}),e.jsxs("ul",{children:[t>1&&e.jsxs("li",{children:["Initial charge: ",n.initialCharge,"/10"]}),t>2&&e.jsx("li",{children:"Observer shift: Completed"}),t>3&&e.jsxs("li",{children:['Third-person reword: "',n.thirdPersonReword,'"']}),t>4&&e.jsxs("li",{children:["Distraction: ",n.distractionActivity]})]})]})]})})};export{K as default};
//# sourceMappingURL=CardNeutralize-9_unIFHj.js.map
