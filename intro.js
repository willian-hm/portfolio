/* Abertura progressiva: uma vez por sessão, com movimento reduzido e saída por Escape. */
(()=>{
 const root=document.documentElement;if(!root.classList.contains('intro-pending'))return;
 const target=document.querySelector('.profile .img-frame');if(!target){root.classList.remove('intro-pending');return;}
 const layer=document.createElement('div');layer.id='welcome-intro';layer.innerHTML='<div class="welcome-copy" aria-hidden="true"><span class="welcome-label">UM POUCO SOBRE MIM</span><p><span id="welcome-typed"></span><span class="welcome-caret">|</span></p></div><img class="welcome-photo" src="assets/willian.jpeg" alt="">';
 layer.setAttribute('role','dialog');layer.setAttribute('aria-label','Apresentação de Willian Moreira');layer.setAttribute('aria-modal','true');document.body.append(layer);
 const blocked=[...document.body.children].filter(el=>el!==layer&&['SCRIPT','STYLE'].indexOf(el.tagName)<0&&!el.inert);blocked.forEach(el=>{el.inert=true;el.setAttribute('data-intro-inert','')});
 const photo=layer.querySelector('img'),typed=layer.querySelector('#welcome-typed');let ended=false;
 const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 function finish(){if(ended)return;ended=true;clearTimeout(window.introFailsafe);root.classList.remove('intro-pending');root.classList.add('intro-complete');blocked.forEach(el=>{el.inert=false;el.removeAttribute('data-intro-inert')});layer.remove();try{sessionStorage.setItem('intro-seen','1')}catch(e){}document.removeEventListener('keydown',escape);window.removeEventListener('resize',finish);if(document.activeElement===document.body)document.querySelector('.logo')?.focus({preventScroll:true});}
 function escape(e){if(e.key==='Escape')finish()}
 layer.tabIndex=-1;layer.focus({preventScroll:true});document.addEventListener('keydown',escape);window.addEventListener('resize',finish);
 (async()=>{try{
 await delay(180);
 let index=0;
 for(const word of ['Prazer,','meu','nome','é…']){
   const group=document.createElement('span');group.className='welcome-word';typed.append(group);
   for(const character of word){if(ended)return;const letter=document.createElement('span');letter.className='welcome-letter';letter.style.setProperty('--letter',index++);letter.textContent=character;group.append(letter);await delay(character===','?160:52)}
   typed.append(document.createTextNode(' '));
 }
 if(ended)return;
 await delay(220);
 layer.classList.add('name-ready');
 typed.replaceChildren();index=0;
 for(const word of ['Willian','Moreira.']){
   const group=document.createElement('span');group.className='welcome-word';typed.append(group);
   for(const character of word){if(ended)return;const letter=document.createElement('span');letter.className='welcome-letter';letter.style.setProperty('--letter',index++);letter.textContent=character;group.append(letter);await delay(58)}
   typed.append(document.createTextNode(' '));
 }
 await delay(500);if(ended)return;
 layer.classList.add('portrait-ready');
 if(ended)return;photo.classList.add('arrived');await delay(800);if(ended)return;
 await Promise.race([document.fonts.ready,delay(500)]);const end=target.getBoundingClientRect(),start=photo.getBoundingClientRect();layer.classList.add('departing');
 const movement=photo.animate([{left:start.left+'px',top:start.top+'px',width:start.width+'px',height:start.height+'px',borderRadius:'36px'},{left:end.left+'px',top:end.top+'px',width:end.width+'px',height:end.height+'px',borderRadius:'22px'}],{duration:1050,easing:'cubic-bezier(.22,.8,.3,1)',fill:'forwards'});
 await movement.finished;if(!ended)finish();
 }catch(e){finish()}})();
})();
