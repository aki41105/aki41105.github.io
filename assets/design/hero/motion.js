// Original procedural animation for BETWEEN. No third-party assets or code.
const hero = document.querySelector(".hero");
const canvas = document.querySelector(".visual__signals");
const buttons = [...document.querySelectorAll(".scene-nav__item")];
const toggle = document.querySelector(".motion-toggle");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const scenes = [
  ["FLOW", "小さな変化が、関係の流れをつくる。"],
  ["PARTICLES", "ひとつひとつの振る舞いが、響き合う。"],
  ["CONTOURS", "見えなかったつながりが、輪郭を持つ。"],
];
let clock=0, last=0, frame=0, selected=-1, paused=reduced.matches;
let visible=true, gl, program, uniforms;
let pointer=[0,0], target=[0,0];
const vertex=`
attribute vec2 position;
void main(){gl_Position=vec4(position,0.0,1.0);}
`;
const fragment=`
precision highp float;
uniform vec2 resolution;
uniform vec2 pointer;
uniform float time;
const float PI=3.14159265359;
float field(vec2 p,float t){
  p+=vec2(0.13*sin(p.y*2.7+t),0.16*cos(p.x*2.4-t));
  return sin(p.x*2.9+p.y*1.8+1.4*sin(p.y*1.6-t))*0.58
    +cos(p.y*3.6-p.x*1.25+1.25*cos(p.x*1.7+t))*0.42;
}
void main(){
  vec2 uv=gl_FragCoord.xy/resolution;
  vec2 aspect=vec2(resolution.x/resolution.y,1.0)*2.15;
  vec2 p=(uv-0.5)*aspect+pointer*0.09;
  float t=time*2.0*PI/24.0;
  vec2 drift=vec2(cos(t),sin(t))*0.45;
  float f=field(p+drift,t);
  float ridge=exp(-abs(f)*6.2);
  float silk=pow(0.5+0.5*sin(f*24.0+t*2.0),7.0);
  vec3 base=vec3(0.012,0.035,0.067);
  vec3 hue=mix(vec3(0.12,0.38,0.85),vec3(0.24,0.91,0.79),0.5+0.5*sin(p.x*1.1+t));
  vec3 flow=base+hue*(ridge*0.62+silk*ridge*0.58);
  flow+=vec3(0.82,0.94,0.84)*pow(ridge,7.0)*0.6;
  float cell=7.0;
  vec2 grid=floor(gl_FragCoord.xy/cell)*cell+cell*0.5;
  vec2 gp=(grid/resolution-0.5)*aspect+pointer*0.09;
  float energy=exp(-abs(field(gp+drift,t))*2.4);
  float d=length(mod(gl_FragCoord.xy,cell)-cell*0.5);
  float dotShape=1.0-smoothstep(cell*(0.10+energy*0.30),cell*(0.14+energy*0.30),d);
  vec3 dots=base+hue*dotShape*(energy+0.1);
  dots+=vec3(0.94,0.64,0.32)*dotShape*pow(energy,12.0)*0.7;
  float contour=1.0-smoothstep(0.025,0.085,abs(sin(f*25.0)));
  vec3 lines=base+hue*contour*(0.25+ridge*0.8)+hue*ridge*0.1;
  float s=mod(time/8.0,3.0);
  float blend=smoothstep(0.66,1.0,fract(s));
  vec3 color=s<1.0?mix(flow,dots,blend):(s<2.0?mix(dots,lines,blend):mix(lines,flow,blend));
  color*=0.65+0.35*(1.0-smoothstep(0.25,1.0,length((uv-0.5)*vec2(1.0,0.8))));
  gl_FragColor=vec4(color,1.0);
}
`;
function compile(type,source){
  const shader=gl.createShader(type);
  gl.shaderSource(shader,source);gl.compileShader(shader);
  if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader));
  return shader;
}
function initRenderer(){
  try{
    gl=canvas.getContext("webgl",{alpha:false,antialias:false,powerPreference:"low-power"});
    if(!gl)throw new Error("WebGL unavailable");
    program=gl.createProgram();
    gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));
    gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const position=gl.getAttribLocation(program,"position");
    gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    uniforms=Object.fromEntries(["resolution","pointer","time"].map(k=>[k,gl.getUniformLocation(program,k)]));
    hero.dataset.renderer="webgl";canvas.hidden=false;resize();
  }catch(error){
    canvas.hidden=true;gl=null;hero.dataset.renderer="fallback";
    console.warn("Static hero fallback:",error.message);
  }
}
function resize(){
  if(!gl)return;
  const scale=Math.min(devicePixelRatio||1,1.25,1600/hero.clientWidth);
  canvas.width=Math.round(hero.clientWidth*scale);
  canvas.height=Math.round(hero.clientHeight*scale);
  gl.viewport(0,0,canvas.width,canvas.height);render();
}
function render(){
  if(!gl)return;
  gl.uniform2f(uniforms.resolution,canvas.width,canvas.height);
  gl.uniform2f(uniforms.pointer,pointer[0],pointer[1]);
  gl.uniform1f(uniforms.time,clock);gl.drawArrays(gl.TRIANGLES,0,6);
}
function updateScene(){
  const index=Math.floor(clock/8)%3;
  hero.style.setProperty("--progress",String((clock%8)/8));
  if(index===selected)return;
  selected=index;hero.dataset.scene=String(index);
  document.querySelector(".field-note__number").textContent="0"+(index+1)+" / 03";
  document.querySelector(".field-note__label").textContent=scenes[index][0];
  document.querySelector(".field-note__copy").textContent=scenes[index][1];
  buttons.forEach((b,i)=>{
    b.setAttribute("aria-pressed",String(i===index));
    b.classList.toggle("is-active",i===index);
  });
}
function tick(now){
  frame=0;
  if(paused||document.hidden||!visible)return;
  if(last&&now-last<32){frame=requestAnimationFrame(tick);return;}
  if(last)clock=(clock+Math.min((now-last)/1000,0.1))%24;
  last=now;pointer=pointer.map((v,i)=>v+(target[i]-v)*0.07);
  updateScene();render();frame=requestAnimationFrame(tick);
}
function schedule(){
  cancelAnimationFrame(frame);frame=0;last=0;
  hero.classList.toggle("is-paused",paused);
  toggle.setAttribute("aria-pressed",String(paused));
  toggle.setAttribute("aria-label",paused?"背景の動きを再生":"背景の動きを一時停止");
  document.querySelector(".motion-toggle__label").textContent=paused?"再生":"一時停止";
  document.querySelector(".motion-toggle__icon").textContent=paused?"▶":"Ⅱ";
  if(!paused&&!document.hidden&&visible)frame=requestAnimationFrame(tick);
}
buttons.forEach((button,index)=>button.addEventListener("click",()=>{
  clock=index*8;updateScene();render();
}));
toggle.addEventListener("click",()=>{paused=!paused;schedule();});
reduced.addEventListener("change",()=>{
  paused=reduced.matches;pointer=[0,0];target=[0,0];schedule();render();
});
document.addEventListener("visibilitychange",schedule);
new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;schedule();}).observe(hero);
new ResizeObserver(resize).observe(hero);
hero.addEventListener("pointermove",event=>{
  if(paused||reduced.matches||event.pointerType==="touch")return;
  const r=hero.getBoundingClientRect();
  target=[(event.clientX-r.left)/r.width-0.5,0.5-(event.clientY-r.top)/r.height];
});
hero.addEventListener("pointerleave",()=>{target=[0,0];});
canvas.addEventListener("webglcontextlost",event=>{
  event.preventDefault();gl=null;canvas.hidden=true;hero.dataset.renderer="fallback";
});
canvas.addEventListener("webglcontextrestored",initRenderer);
initRenderer();updateScene();schedule();
