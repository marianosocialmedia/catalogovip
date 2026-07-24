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

function renderProducts(){
  const products=window.PRODUCTS||[];
  productList.innerHTML=products.map((product,index)=>`
    <article class="product">
      <div class="product-panel">
        <div class="product-visual">
          <div class="product-glow accent-${escapeHTML(product.accent)}"></div>
          <div class="product-ring"></div>
          <div class="product-image-wrap">
            <img class="product-image" src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" loading="lazy">
            <div class="placeholder">
              <strong>${escapeHTML(product.name.split(' ')[0])}</strong>
              <span>${escapeHTML(product.image)}</span>
            </div>
          </div>
        </div>
        <div class="product-info">
          <span class="product-index">${String(index+1).padStart(2,'0')} / ${String(products.length).padStart(2,'0')}</span>
          <p class="product-category">${escapeHTML(product.category)}</p>
          <h3 class="product-title">${escapeHTML(product.name)}</h3>
          <div class="rating-row">
            <span class="stars">★★★★★</span>
            <strong class="rating">${escapeHTML(product.rating)}</strong>
            <span class="reviews">(${escapeHTML(product.reviews)})</span>
          </div>
          <div class="price-row">
            <strong class="price">${escapeHTML(product.price)}</strong>
            <span class="old-price">${escapeHTML(product.oldPrice)}</span>
          </div>
          <p class="installment">${escapeHTML(product.installment)}</p>
          <p class="description">${escapeHTML(product.description)}</p>
          <div class="chips">
            <span class="chip">ENVIO SEGURO</span>
            <span class="chip">ATENDIMENTO PREMIUM</span>
            <span class="chip">ESTOQUE LIMITADO</span>
          </div>
        </div>
      </div>
    </article>
  `).join('');

  document.querySelectorAll('.product-image').forEach(image=>{
    const placeholder=image.nextElementSibling;
    image.addEventListener('load',()=>placeholder.hidden=true);
    image.addEventListener('error',()=>{image.hidden=true;placeholder.hidden=false;});
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

  const hero=document.querySelector('.hero');
  const heroRect=hero.getBoundingClientRect();
  const raw=clamp((-heroRect.top)/(window.innerHeight*.62),0,1);
  const eased=raw*raw*(3-2*raw);
  const start=112.8;
  const end=65;
  const current=start-(start-end)*eased;
  weightNumber.textContent=formatWeight(current);
  weightFill.style.width=`${eased*100}%`;
  weightMarker.style.left=`${eased*100}%`;

  document.querySelectorAll('.product').forEach(section=>{
    const progress=sectionProgress(section);
    const centered=clamp((progress-.16)/.68,0,1);
    const easedProduct=centered*centered*(3-2*centered);
    const image=section.querySelector('.product-image-wrap');
    const ring=section.querySelector('.product-ring');
    const glow=section.querySelector('.product-glow');
    image.style.transform=`rotateY(${-44+easedProduct*88}deg) rotateX(${8-Math.sin(easedProduct*Math.PI)*13}deg) scale(${.93+Math.sin(easedProduct*Math.PI)*.09})`;
    ring.style.transform=`rotateX(70deg) rotateZ(${easedProduct*46}deg)`;
    glow.style.opacity=String(.22+Math.sin(easedProduct*Math.PI)*.42);
  });
}

renderProducts();
window.addEventListener('scroll',update,{passive:true});
window.addEventListener('resize',update);
update();
