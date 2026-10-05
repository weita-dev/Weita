/* WeiTA Privacy Notice: choice cards jump to their part, clear of the sticky site header. Guarded. */
(function(){
  try{
    var ch=document.querySelector('.chooser');
    if(!ch)return;
    ch.addEventListener('click',function(e){
      var a=e.target.closest&&e.target.closest('a[href^="#"]');
      if(!a)return;
      var t=document.getElementById(a.getAttribute('href').slice(1));
      if(!t)return;
      e.preventDefault();
      var h=document.querySelector('.site-header'),off=(h?h.getBoundingClientRect().height:0)+16;
      var smooth=!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
      window.scrollTo({top:t.getBoundingClientRect().top+window.pageYOffset-off,behavior:smooth?'smooth':'auto'});
      if(history.replaceState)history.replaceState(null,'','#'+t.id);
      t.setAttribute('tabindex','-1');t.focus({preventScroll:true});
    });
  }catch(e){}
})();
