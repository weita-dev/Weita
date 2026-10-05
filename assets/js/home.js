/* WeiTA Home: hero strands, rotating headline word, held "How WeiTA works" line, diagonal split, swipe row. */
(function(){
  'use strict';
  var mq=function(q){return window.matchMedia?window.matchMedia(q):{matches:false,addEventListener:function(){}}};
  var reduce=mq('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Hero strands canvas (ported from the 23 Sep build, brand palette) ---------- */
  (function(){
    var hero=document.querySelector('.hm-hero'),canvas=hero&&hero.querySelector('.hm-canvas');
    if(!canvas||!canvas.getContext)return;
    var ctx=canvas.getContext('2d'),strands=[],COUNT=220,BAND_START=0.15,BAND_END=0.85;
    var running=!document.hidden,visible=true,raf=0;
    var TERRA=[200,109,81],SAND=[243,192,150],STONE=[130,123,117];
    var initialH=hero.getBoundingClientRect().height||600;
    for(var i=0;i<COUNT;i++){
      var k=Math.random(),col=k<0.62?TERRA:(k<0.85?STONE:SAND);
      strands.push({isLeft:i%2===0,
        offsetY:BAND_START*initialH+Math.random()*(BAND_END-BAND_START)*initialH-initialH/2,
        amp:15+Math.random()*55,phase:Math.random()*Math.PI*2,speed:0.08+Math.random()*0.32,
        width:0.35+Math.random()*1.1,
        alpha:(col===SAND?0.12:0.025)+Math.random()*(col===SAND?0.2:0.13),
        col:col,dot:i%3===0?TERRA:SAND});
    }
    function rgba(c,a){return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')'}
    function resize(){
      var r=hero.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
      canvas.width=Math.max(1,Math.round(r.width*dpr));canvas.height=Math.max(1,Math.round(r.height*dpr));
      ctx.setTransform(dpr,0,0,dpr,0,0);
      strands.forEach(function(s){s.offsetY=BAND_START*r.height+Math.random()*(BAND_END-BAND_START)*r.height-r.height/2});
      if(reduce||!raf)frame(0);
    }
    function frame(t){
      var r=hero.getBoundingClientRect(),w=r.width,h=r.height,cx=w/2,cy=h/2;
      ctx.clearRect(0,0,w,h);
      var glow=ctx.createRadialGradient(cx,cy,0,cx,cy,180);
      glow.addColorStop(0,rgba(TERRA,.30));glow.addColorStop(0.4,rgba(SAND,.16));glow.addColorStop(1,rgba(TERRA,0));
      ctx.fillStyle=glow;ctx.beginPath();ctx.arc(cx,cy,180,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=rgba(TERRA,1);ctx.beginPath();ctx.arc(cx,cy,5.5,0,Math.PI*2);ctx.fill();
      strands.forEach(function(s){
        var start=s.isLeft?0:w,end=cx,steps=50;
        ctx.beginPath();
        for(var i=0;i<=steps;i++){var p=i/steps,x=start+(end-start)*p,f=Math.pow(1-p,1.8),
          y=cy+s.offsetY*f+Math.sin(p*8+s.phase+t*s.speed)*s.amp*f;if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y)}
        ctx.strokeStyle=rgba(s.col,s.alpha);ctx.lineWidth=s.width;ctx.stroke();
        var pp=(t*s.speed*0.3+s.phase*0.1)%1,px=start+(end-start)*pp,pf=Math.pow(1-pp,1.8),
          py=cy+s.offsetY*pf+Math.sin(pp*8+s.phase+t*s.speed)*s.amp*pf;
        ctx.fillStyle=rgba(s.dot,.75);ctx.beginPath();ctx.arc(px,py,1.3,0,Math.PI*2);ctx.fill();
      });
    }
    function loop(ts){if(!running||!visible){raf=0;return}frame(ts*0.001);raf=requestAnimationFrame(loop)}
    function start(){if(reduce)return;running=true;if(!raf)raf=requestAnimationFrame(loop)}
    function stop(){running=false;if(raf){cancelAnimationFrame(raf);raf=0}}
    resize();
    window.addEventListener('resize',resize,{passive:true});
    document.addEventListener('visibilitychange',function(){if(document.hidden)stop();else start()});
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(e){visible=e[0].isIntersecting;if(visible)start();else stop()},{threshold:0.05}).observe(hero);
    }else start();
    if(reduce)frame(0);
  })();

  /* ---------- Rotating headline word (static "capability" when motion is reduced) ---------- */
  (function(){
    var words=document.querySelectorAll('.hm-rot .hm-rw');
    if(words.length<2||reduce)return;
    var i=0,rot=words[0].parentNode;
    function fit(){rot.style.width=words[i].getBoundingClientRect().width+'px'}
    fit();addEventListener('resize',fit);
    setInterval(function(){words[i].classList.remove('on');i=(i+1)%words.length;words[i].classList.add('on');fit()},2600);
  })();

  /* ---------- How WeiTA works: held line (desktop), stacked list on phones ---------- */
  (function(){
    var w3=document.getElementById('w3')||document.querySelector('.w3');
    if(!w3)return;
    var stops=w3.querySelectorAll('.w3-stop'),panels=w3.querySelectorAll('.w3-st'),
        fill=w3.querySelector('.fill'),count=w3.querySelector('#w3-count'),
        phone=mq('(max-width: 760px)'),N=stops.length,STATES=panels.length||N+1,cur=-1;
    function set(i){
      if(i===cur)return;cur=i;
      stops.forEach(function(s,j){s.classList.toggle('on',j<=i);if(j===i)s.setAttribute('aria-current','step');else s.removeAttribute('aria-current')});
      panels.forEach(function(p,j){p.classList.toggle('on',j===i)});
      if(count)count.textContent=i<N?'Stage '+(i+1)+' of '+N:'All three stages';
    }
    function prog(){var r=w3.getBoundingClientRect(),total=w3.offsetHeight-window.innerHeight;return Math.min(1,Math.max(0,-r.top/Math.max(1,total)))}
    function onScroll(){
      if(phone.matches)return;
      var p=prog(),seg=(STATES-1)/STATES;
      if(fill)fill.style.width=(Math.min(1,p/seg)*100)+'%';
      set(Math.min(STATES-1,Math.floor(p*STATES)));
    }
    stops.forEach(function(s,j){s.addEventListener('click',function(){
      if(phone.matches)return;
      var total=w3.offsetHeight-window.innerHeight,top=w3.getBoundingClientRect().top+window.scrollY;
      window.scrollTo({top:top+total*((j+0.35)/STATES),behavior:reduce?'auto':'smooth'});
    })});
    var skip=w3.querySelector('.skip');
    if(skip)skip.addEventListener('click',function(e){var t=document.querySelector(skip.getAttribute('href'));if(!t)return;e.preventDefault();t.scrollIntoView({behavior:reduce?'auto':'smooth'});if(!t.hasAttribute('tabindex'))t.setAttribute('tabindex','-1');t.focus({preventScroll:true})});
    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('resize',onScroll);
    set(0);onScroll();
  })();

  /* ---------- Solutions: diagonal split (pointer on desktop, tap on phones) ---------- */
  (function(){
    var so2=document.getElementById('so2');
    if(!so2)return;
    var phone=mq('(max-width: 640px)'),sides=so2.querySelectorAll('.so2-p');
    function open(side){so2.setAttribute('data-on',side);if(!phone.matches)so2.style.setProperty('--cut',side==='ent'?'64%':'36%')}
    function rest(){if(phone.matches){open(so2.getAttribute('data-on')||'ent')}else{so2.removeAttribute('data-on');so2.style.removeProperty('--cut')}}
    sides.forEach(function(p){
      p.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse'&&!phone.matches)open(p.dataset.side)});
      p.addEventListener('click',function(e){
        if(so2.getAttribute('data-on')!==p.dataset.side&&phone.matches){e.preventDefault();open(p.dataset.side)}
      });
      p.addEventListener('focusin',function(){open(p.dataset.side)});
    });
    so2.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse')rest()});
    so2.addEventListener('focusout',function(e){if(!so2.contains(e.relatedTarget))rest()});
    if(phone.addEventListener)phone.addEventListener('change',function(){so2.style.removeProperty('--cut');so2.removeAttribute('data-on');rest()});
    rest();
  })();

  /* ---------- Research & Insights: swipe row (arrows + mouse drag) ---------- */
  (function(){
    var row=document.querySelector('.hm-ins .r3-row');
    if(!row)return;
    function step(){var c=row.querySelector('.card-a');return c?c.getBoundingClientRect().width+18:320}
    document.querySelectorAll('.hm-ins .hm-arr').forEach(function(b){
      b.addEventListener('click',function(){row.scrollBy({left:step()*(+b.dataset.dir),behavior:reduce?'auto':'smooth'})});
    });
    var down=false,sx=0,sl=0,moved=false;
    row.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;down=true;moved=false;sx=e.clientX;sl=row.scrollLeft});
    window.addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx;if(Math.abs(dx)>5){moved=true;row.classList.add('drag')}if(moved)row.scrollLeft=sl-dx});
    window.addEventListener('pointerup',function(){if(!down)return;down=false;row.classList.remove('drag')});
    row.addEventListener('click',function(e){if(moved){e.preventDefault();moved=false}},true);
    row.addEventListener('dragstart',function(e){e.preventDefault()});
  })();
})();
