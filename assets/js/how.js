
(function(){
  document.querySelectorAll('.r10 .h10').forEach(function(h){setTimeout(function(){h.classList.add('show')},1000)});
  // model: everything is visible; hover, focus or tap only highlights a stage and its arc
  document.querySelectorAll('.r10 .s-model').forEach(function(s){
    function pick(c){s.querySelectorAll('.m10c').forEach(function(x){x.classList.toggle('on',x===c)});s.setAttribute('data-on',c.dataset.k)}
    s.querySelectorAll('.m10c').forEach(function(c){['mouseenter','focusin','click'].forEach(function(ev){c.addEventListener(ev,function(){if(!c.classList.contains('on'))pick(c)})})});
    s.querySelectorAll('.marc .ar').forEach(function(a){a.style.cursor='pointer';a.addEventListener('click',function(){pick(s.querySelector('.m10c.'+a.dataset.k))})});
  });
  // chips: one explanation open at a time; click elsewhere closes
  document.querySelectorAll('.r10 .cdet').forEach(function(d){d.addEventListener('toggle',function(){if(d.open){d.closest('.cl').querySelectorAll('.cdet[open]').forEach(function(o){if(o!==d)o.removeAttribute('open')})}})});
  document.addEventListener('click',function(e){document.querySelectorAll('.r10 .cdet[open]').forEach(function(d){if(!d.contains(e.target))d.removeAttribute('open')})});
  // footer photo grows as you arrive and shrinks as you leave, every time
  var els=document.querySelectorAll('.r10 .fph');
  if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){e.target.classList.toggle('in',e.isIntersecting)})},{threshold:0.45});els.forEach(function(el){io.observe(el)})}else els.forEach(function(el){el.classList.add('in')});

})();

/* Enterprise / Foundry: blueprint picker lights its modules; the other-world tag shows from ~62% of the page */
(function(){
  document.querySelectorAll('.sx-blue').forEach(function(s){
    var opts=s.querySelectorAll('.sx-opt'),cards=s.querySelectorAll('.sx-bp'),tiles=s.querySelectorAll('.sx-mt');
    function pick(o){var i=o.dataset.i,mods=(o.dataset.mods||'').split('|');
      opts.forEach(function(x){x.classList.toggle('on',x===o);x.setAttribute('aria-pressed',x===o?'true':'false')});
      cards.forEach(function(c){c.classList.toggle('on',c.dataset.i===i)});
      tiles.forEach(function(t){t.classList.toggle('lit',mods.indexOf(t.dataset.m)>-1)});}
    opts.forEach(function(o){o.addEventListener('click',function(){pick(o)})});
    if(opts[0])pick(opts[0]);
  });
  var tag=document.querySelector('.sx-other');
  if(tag){tag.hidden=false;
    var foot=document.querySelector('.ffoot');
    function upd(){var max=document.documentElement.scrollHeight-innerHeight;var p=max>0?scrollY/max:0;
      var nearFoot=foot&&foot.getBoundingClientRect().top<innerHeight*0.9;
      tag.classList.toggle('show',p>0.62&&!nearFoot)}
    addEventListener('scroll',upd,{passive:true});upd();}
})();
