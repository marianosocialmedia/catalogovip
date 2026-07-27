const clamp=(value,min,max)=>Math.min(Math.max(value,min),max);
const formatWeight=value=>value.toFixed(1).replace('.',',');

const progressBar=document.getElementById('progressBar');
const weightNumber=document.getElementById('weightNumber');
const weightFill=document.getElementById('weightFill');
const weightMarker=document.getElementById('weightMarker');
const productList=document.getElementById('productList');

function escapeHTML(value=''){
  return String(value).replace(/[&<>"']/g,char=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  })[char]);
}

function renderProducts(productsInput){
  const products=Array.isArray(productsInput) && productsInput.length
    ? productsInput
    : (window.PRODUCTS||window.PRODUCTS_FALLBACK||[]);

  productList.innerHTML=products.map((product,index)=>`
    <article class="catalog-card" data-product="${index}">
      <div class="catalog-card-media">
        <div class="catalog-card-aura accent-${escapeHTML(product.accent)}"></div>

        <div class="catalog-card-topline">
          <span class="catalog-badge">${escapeHTML(product.badge||'SELEÇÃO')}</span>
          <span class="catalog-position">${String(index+1).padStart(2,'0')}</span>
        </div>

        <div class="catalog-product-image">
          <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" loading="lazy">
          <div class="catalog-placeholder">
            <strong>${escapeHTML(product.name)}</strong>
            <span>adicione a imagem em</span>
            <code>${escapeHTML(product.image)}</code>
          </div>
        </div>

        <div class="catalog-reflection" aria-hidden="true"></div>
      </div>

      <div class="catalog-card-body">
        <div class="catalog-meta-line">
          <span>${escapeHTML(product.category)}</span>
          <span class="catalog-stock"><i></i>${escapeHTML(product.availability||'Disponível')}</span>
        </div>

        <h3>${escapeHTML(product.name)}</h3>

        <div class="catalog-specs">
          <span>${escapeHTML(product.presentation)}</span>
          <span>${escapeHTML(product.specification)}</span>
        </div>

        <div class="catalog-rating">
          <span class="stars">★★★★★</span>
          <strong>${escapeHTML(product.rating)}</strong>
          <span>(${escapeHTML(product.reviews)})</span>
        </div>

        <p class="catalog-description">${escapeHTML(product.description)}</p>

        <div class="catalog-price-block">
          <span class="catalog-old-price">${escapeHTML(product.oldPrice)}</span>
          <strong class="catalog-price">${escapeHTML(product.price)}</strong>
          <span class="catalog-installment">${escapeHTML(product.installment)}</span>
        </div>

        <a class="catalog-action catalog-buy" href="#" data-product-name="${escapeHTML(product.name)}" data-product-presentation="${escapeHTML(product.presentation)}"
           data-product-specification="${escapeHTML(product.specification)}"
           data-product-price="${escapeHTML(product.price)}">
          <span>Saber mais</span>
          <i aria-hidden="true">↗</i>
        </a>
      </div>
    </article>
  `).join('');

  document.querySelectorAll('.catalog-product-image img').forEach(image=>{
    const placeholder=image.nextElementSibling;

    image.addEventListener('load',()=>{
      image.hidden=false;
      placeholder.hidden=true;
    });

    image.addEventListener('error',()=>{
      image.hidden=true;
      placeholder.hidden=false;
    });
  });
}

function sectionProgress(element){
  const rect=element.getBoundingClientRect();
  const scrollable=Math.max(element.offsetHeight-window.innerHeight,1);
  return clamp(-rect.top/scrollable,0,1);
}

function update(){
  const maxScroll=Math.max(document.documentElement.scrollHeight-window.innerHeight,1);
  progressBar.style.width=`${(window.scrollY/maxScroll)*100}%`;

  const scaleSection=document.querySelector('.products-zone');
  const scaleRect=scaleSection.getBoundingClientRect();
  const raw=clamp((window.innerHeight-scaleRect.top)/(window.innerHeight+scaleSection.offsetHeight*.55),0,1);
  const eased=raw*raw*(3-2*raw);
  const start=112.8;
  const end=60;
  const current=start-(start-end)*eased;
  weightNumber.textContent=formatWeight(current);
  const remaining=(1-eased)*100;
  weightFill.style.width=`${remaining}%`;
  weightMarker.style.left=`${remaining}%`;
}





/* ==========================================================
   CARREGAMENTO DIRETO DOS PRODUTOS
   Funciona no desktop e no mobile sem depender de products.txt.
   Aceita window.PRODUCTS e window.PRODUCTS_FALLBACK.
   ========================================================== */

function activateProductCards(){
  const revealObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },{threshold:.08});

  document.querySelectorAll(".catalog-card").forEach(card=>{
    revealObserver.observe(card);

    if(window.matchMedia("(hover:hover) and (pointer:fine)").matches){
      card.addEventListener("pointermove",event=>{
        const bounds=card.getBoundingClientRect();
        const x=(event.clientX-bounds.left)/bounds.width-.5;
        const y=(event.clientY-bounds.top)/bounds.height-.5;
        card.style.setProperty("--tilt-x",`${x*5}deg`);
        card.style.setProperty("--tilt-y",`${y*-4}deg`);
        card.style.setProperty("--light-x",`${(x+.5)*100}%`);
        card.style.setProperty("--light-y",`${(y+.5)*100}%`);
      });

      card.addEventListener("pointerleave",()=>{
        card.style.setProperty("--tilt-x","0deg");
        card.style.setProperty("--tilt-y","0deg");
        card.style.setProperty("--light-x","50%");
        card.style.setProperty("--light-y","30%");
      });
    }
  });
}

function loadProductsDirectly(){
  const products=Array.isArray(window.PRODUCTS) && window.PRODUCTS.length
    ? window.PRODUCTS
    : (Array.isArray(window.PRODUCTS_FALLBACK) ? window.PRODUCTS_FALLBACK : []);

  renderProducts(products);

  requestAnimationFrame(()=>{
    activateProductCards();
    update();
  });
}

if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded",loadProductsDirectly,{once:true});
}else{
  loadProductsDirectly();
}

window.addEventListener('scroll',update,{passive:true});
window.addEventListener('resize',update);
update();



const cfg=window.SITE_CONFIG||{},num=String(cfg.whatsapp||"").replace(/\D/g,""),prefix=cfg.whatsappMessagePrefix||"Olá! Quero saber mais sobre";
function openWA(name,presentation,specification,price){
  if(!num)return;

  const details=[
    name,
    presentation,
    specification,
    price
  ].filter(Boolean).join(" — ");

  const message=`${prefix}: ${details}. Pode me passar mais informações?`;
  const url=`https://wa.me/${num}?text=${encodeURIComponent(message)}`;

  setTimeout(()=>{
    window.open(url,"_blank","noopener,noreferrer");
  },140);
}
document.addEventListener("click",e=>{
  const b=e.target.closest(".catalog-buy");
  if(b){
    e.preventDefault();
    openWA(
      b.dataset.productName,
      b.dataset.productPresentation,
      b.dataset.productSpecification,
      b.dataset.productPrice
    );
  }const g=e.target.closest("[data-general-whatsapp]");if(g){e.preventDefault();if(num)window.open(`https://wa.me/${num}?text=${encodeURIComponent("Olá! Quero falar com o atendimento Sheila.")}`,"_blank","noopener,noreferrer")}});


/* ==========================================================
   SONS PREMIUM — Web Audio API, sem arquivos externos
   ========================================================== */
const soundToggle=document.querySelector(".sound-toggle");
let soundEnabled=true;
let audioContext=null;
let audioReady=false;

function ensureAudio(){
  if(!audioContext){
    const AudioCtor=window.AudioContext||window.webkitAudioContext;
    if(!AudioCtor) return null;
    audioContext=new AudioCtor();
  }
  if(audioContext.state==="suspended"){
    audioContext.resume().catch(()=>{});
  }
  audioReady=true;
  return audioContext;
}

function createTone({frequency=880,duration=.18,volume=.055,type="sine",delay=0,slideTo=null}={}){
  if(!soundEnabled) return;
  const ctx=ensureAudio();
  if(!ctx || ctx.state!=="running") return;

  const start=ctx.currentTime+delay;
  const oscillator=ctx.createOscillator();
  const gain=ctx.createGain();

  oscillator.type=type;
  oscillator.frequency.setValueAtTime(frequency,start);
  if(slideTo){
    oscillator.frequency.exponentialRampToValueAtTime(slideTo,start+duration);
  }

  gain.gain.setValueAtTime(.0001,start);
  gain.gain.exponentialRampToValueAtTime(volume,start+.018);
  gain.gain.exponentialRampToValueAtTime(.0001,start+duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start+duration+.03);
}

function playProductChime(){
  if(!audioReady || !soundEnabled) return;
  createTone({frequency:660,duration:.22,volume:.035,type:"sine"});
  createTone({frequency:990,duration:.28,volume:.028,type:"sine",delay:.06});
  createTone({frequency:1320,duration:.18,volume:.018,type:"triangle",delay:.11});
}

function playBuyClick(){
  if(!soundEnabled) return;
  ensureAudio();
  createTone({frequency:420,duration:.10,volume:.045,type:"sine",slideTo:620});
  createTone({frequency:840,duration:.15,volume:.025,type:"triangle",delay:.045,slideTo:1080});
}

["pointerdown","touchstart","keydown"].forEach(eventName=>{
  window.addEventListener(eventName,ensureAudio,{once:true,passive:true});
});

if(soundToggle){
  soundToggle.addEventListener("click",()=>{
    ensureAudio();
    soundEnabled=!soundEnabled;
    soundToggle.setAttribute("aria-pressed",String(soundEnabled));
    soundToggle.classList.toggle("is-muted",!soundEnabled);
    if(soundEnabled){
      createTone({frequency:720,duration:.12,volume:.028,type:"sine",slideTo:940});
    }
  });
}

const productSoundObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting && entry.intersectionRatio>=.58 && !entry.target.dataset.soundPlayed){
      entry.target.dataset.soundPlayed="true";
      playProductChime();
    }

    if(!entry.isIntersecting && entry.intersectionRatio<.08){
      delete entry.target.dataset.soundPlayed;
    }
  });
},{threshold:[0,.08,.58,.82]});

document.querySelectorAll(".catalog-card").forEach(card=>productSoundObserver.observe(card));

document.addEventListener("click",event=>{
  const buy=event.target.closest(".catalog-buy");
  if(buy){
    playBuyClick();
  }
},true);
