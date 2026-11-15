/* A rolagem controla a seleção; foco e entrada do mouse são ações explícitas. */
(()=>{
 const rows=[...document.querySelectorAll('.p-row')],media=document.getElementById('media'),cap=document.getElementById('cap'),count=document.getElementById('count'),list=document.getElementById('list');
 const desktop=matchMedia('(min-width:1001px)');let current=-1,frame=0,lastScroll=0,focusAt=-Infinity;
 const viewport=document.createElement('div');viewport.className='project-preview';media.prepend(viewport);
 const images=rows.map(row=>{const img=new Image();img.src=row.dataset.img;img.alt=row.querySelector('.m-img').alt;viewport.append(img);return img});
 // Mantém o enquadramento estável mesmo com descrições de tamanhos diferentes.
 let captionFrame=0,lastPanelWidth=0;
 function reserveCaptionSpace(){
   captionFrame=0;if(!desktop.matches)return;
   const width=cap.getBoundingClientRect().width;if(!width)return;
   const probe=cap.cloneNode(false);probe.removeAttribute('id');probe.setAttribute('aria-hidden','true');probe.inert=true;
   probe.style.cssText='position:absolute;visibility:hidden;pointer-events:none;inset:0 auto auto 0;width:'+width+'px;height:auto;min-height:0;';
   media.append(probe);let tallest=0;
   rows.forEach(row=>{probe.innerHTML=row.querySelector('.p-details').innerHTML;tallest=Math.max(tallest,probe.getBoundingClientRect().height)});
   probe.remove();media.style.setProperty('--caption-height',Math.ceil(tallest)+'px');
 }
 function scheduleCaption(){if(!captionFrame)captionFrame=requestAnimationFrame(reserveCaptionSpace)}
 new ResizeObserver(entries=>{const width=entries[0].contentRect.width;if(width!==lastPanelWidth){lastPanelWidth=width;scheduleCaption()}}).observe(media);
 document.fonts.ready.then(scheduleCaption);
 desktop.addEventListener('change',scheduleCaption);
 function activate(index){if(index===current)return;current=index;rows.forEach((r,i)=>r.classList.toggle('active',i===index));images.forEach((im,i)=>im.classList.toggle('on',i===index));list.classList.add('has-active');count.innerHTML='<span>'+String(index+1).padStart(2,'0')+'</span> / '+rows.length;cap.innerHTML=rows[index].querySelector('.p-details').innerHTML;document.body.style.setProperty('--project-color',rows[index].dataset.color);}
 function update(){frame=0;if(performance.now()-focusAt<1000)return;const anchor=innerHeight*(desktop.matches?.39:.45);let best=0,distance=Infinity;rows.forEach((row,i)=>{const r=row.getBoundingClientRect(),d=Math.abs(r.top+r.height/2-anchor);if(d<distance){best=i;distance=d}});activate(scrollY<30?0:best);}
 rows.forEach((row,i)=>{row.addEventListener('pointerenter',()=>{if(desktop.matches&&performance.now()-lastScroll>180)activate(i)});row.addEventListener('focusin',()=>{focusAt=performance.now();activate(i)});});
 addEventListener('wheel',()=>{focusAt=-Infinity},{passive:true});
 addEventListener('touchstart',()=>{focusAt=-Infinity},{passive:true});
 addEventListener('scroll',()=>{lastScroll=performance.now();if(!frame)frame=requestAnimationFrame(update)},{passive:true});addEventListener('resize',()=>{if(!frame)frame=requestAnimationFrame(update)});activate(0);
})();
