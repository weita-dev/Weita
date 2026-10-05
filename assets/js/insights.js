/* WeiTA Research & Insights: "More from WeiTA" slider (arrows + dots). Copied from the locked layout; guarded. */
(function(){
  try{
    document.querySelectorAll('.slwrap').forEach(function(w){
      var row=w.querySelector('.srow'),l=w.querySelector('.edge.l'),r=w.querySelector('.edge.r'),dots=w.querySelector('.dotsrow');
      if(!row)return;
      function pages(){return Math.max(1,Math.ceil((row.scrollWidth-row.clientWidth)/Math.max(1,row.clientWidth))+1)}
      function draw(){
        var n=pages(),cur=Math.round(row.scrollLeft/Math.max(1,row.clientWidth));
        if(dots){dots.innerHTML='';for(var i=0;i<n;i++){var d=document.createElement('i');if(i===Math.min(cur,n-1))d.className='on';dots.appendChild(d)}}
        if(l)l.disabled=row.scrollLeft<5;
        if(r)r.disabled=row.scrollLeft+row.clientWidth>=row.scrollWidth-5;
        var fits=row.scrollWidth<=row.clientWidth+4;
        w.querySelectorAll('.hint,.edge,.dotsrow').forEach(function(x){x.style.display=fits?'none':''});
      }
      if(l)l.addEventListener('click',function(){row.scrollBy({left:-row.clientWidth*0.9})});
      if(r)r.addEventListener('click',function(){row.scrollBy({left:row.clientWidth*0.9})});
      row.addEventListener('scroll',draw,{passive:true});addEventListener('resize',draw);draw();
    });
  }catch(e){}
})();
