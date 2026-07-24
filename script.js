const clamp=(n,min,max)=>Math.min(Math.max(n,min),max);

function formatWeight(value){
  return value.toFixed(1).replace(".",",");
}
const progressBar=document.getElementById("progressBar");
const productsRoot=document.getElementById("produtos");

function esc(value=""){
  return String(value).replace(/[&<>"']/g,m=>({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"
  }[m]));
}

function renderProducts(){
  const products=window.PRODUCTS||[];
  productsRoot.innerHTML=products.map((p,i)=>{
    const reverse=i%2===1?"reverse":"";
    return `
      <article class="product" data-product="${i}">
        <div class="product-panel ${reverse}">
          <div class="product-copy">
            <span class="product-index">${String(i+1).padStart(2,"0")} / ${String(products.length).padStart(2,"0")}</span>
            <p class="product-kicker">${esc(p.subtitle)}</p>
            <h3>${esc(p.name)}</h3>
            <p class="product-price">${esc(p.price)}</p>
            <p class="product-installment">${esc(p.installment||"")}</p>
            <p class="product-note">${esc(p.note)}</p>
            <span class="product-tag">SELEÇÃO MONJAROS</span>
          </div>

          <div class="product-visual">
            <div class="product-glow accent-${esc(p.accent)}"></div>
            <div class="product-stage-ring"></div>
            <div class="product-img-wrap">
              <img class="product-img" src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">
              <div class="image-placeholder">
                <strong>${esc(p.name.split(" ")[0])}</strong>
                <span>${esc(p.image)}</span>
              </div>
            </div>
          </div>

          <div class="product-scroll-label">
            <span>Role para girar</span><i></i>
          </div>
        </div>
      </article>`;
  }).join("");

  document.querySelectorAll(".product-img").forEach(img=>{
    const placeholder=img.nextElementSibling;
    img.addEventListener("load",()=>placeholder.style.display="none");
    img.addEventListener("error",()=>{
      img.style.display="none";
      placeholder.style.display="flex";
    });
  });
}
renderProducts();

function sectionProgress(el){
  const r=el.getBoundingClientRect();
  return clamp(-r.top/Math.max(el.offsetHeight-innerHeight,1),0,1);
}

function update(){
  const doc=document.documentElement;
  progressBar.style.width=`${scrollY/Math.max(doc.scrollHeight-innerHeight,1)*100}%`;

  const device=document.querySelector(".device-frame");
  const hero=document.querySelector(".hero");
  if(device && hero){
    const p=sectionProgress(hero);
    device.style.transform=`translate(-50%,-50%) rotateX(${58-p*17}deg) rotateZ(${-4+p*5}deg) scale(${1+p*.05})`;

    // Contagem visual sincronizada exclusivamente com a rolagem do hero.
    const startWeight=112.8;
    const endWeight=84.6;
    const smooth=0.5-0.5*Math.cos(Math.PI*p);
    const currentWeight=startWeight-(startWeight-endWeight)*smooth;
    const weightNumber=document.getElementById("weightNumber");
    const weightTrackFill=document.getElementById("weightTrackFill");
    const weightMarker=document.getElementById("weightMarker");

    if(weightNumber) weightNumber.textContent=formatWeight(currentWeight);
    if(weightTrackFill) weightTrackFill.style.width=`${smooth*100}%`;
    if(weightMarker) weightMarker.style.left=`${smooth*100}%`;
  }

  document.querySelectorAll(".product").forEach(section=>{
    const p=sectionProgress(section);
    const wrap=section.querySelector(".product-img-wrap");
    const glow=section.querySelector(".product-glow");
    const ring=section.querySelector(".product-stage-ring");
    const copy=section.querySelector(".product-copy");

    // Durante a área sticky, a rolagem "trava" o painel e usa o avanço para girar o produto.
    const eased=0.5-0.5*Math.cos(Math.PI*p);
    const rotation=-34 + eased*68;
    const tilt=8-Math.sin(eased*Math.PI)*12;
    const scale=.92+Math.sin(eased*Math.PI)*.1;
    const floatY=Math.sin(eased*Math.PI*2)*-10;

    if(wrap){
      wrap.style.transform=
        `rotateY(${rotation}deg) rotateX(${tilt}deg) translateY(${floatY}px) scale(${scale})`;
    }
    if(glow){
      glow.style.transform=`scale(${.84+Math.sin(eased*Math.PI)*.22})`;
      glow.style.opacity=String(.22+Math.sin(eased*Math.PI)*.42);
    }
    if(ring){
      ring.style.transform=`rotateX(70deg) rotateZ(${eased*38}deg) scale(${.96+Math.sin(eased*Math.PI)*.05})`;
    }
    if(copy){
      copy.style.transform=`translateY(${(eased-.5)*-14}px)`;
      copy.style.opacity=String(.68+Math.sin(eased*Math.PI)*.32);
    }
  });
}
addEventListener("scroll",update,{passive:true});
addEventListener("resize",update);
update();

const cursor=document.getElementById("cursorGlow");
addEventListener("pointermove",e=>{
  cursor.style.left=e.clientX+"px";
  cursor.style.top=e.clientY+"px";
},{passive:true});

const drawer=document.getElementById("drawer");
const setDrawer=open=>{
  drawer.classList.toggle("open",open);
  drawer.setAttribute("aria-hidden",String(!open));
  document.body.style.overflow=open?"hidden":"";
};
document.getElementById("menuBtn").addEventListener("click",()=>setDrawer(true));
document.getElementById("closeDrawer").addEventListener("click",()=>setDrawer(false));
drawer.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>setDrawer(false)));
