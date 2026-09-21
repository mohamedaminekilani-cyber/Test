const STORAGE_KEY='pantrymade_state_v1';
const seed={
  vendors:[
    {id:'v1',name:'Noura Pantry',initials:'NP',emoji:'🫙',category:'Traditional pantry',area:'La Marsa',rating:4.9,reviews:184,eta:'25–35 min',bio:'Small-batch Tunisian pantry staples made from family recipes with clear ingredients and shelf-life labels.',cover:'🌿'},
    {id:'v2',name:'Date & Grain',initials:'DG',emoji:'🌾',category:'Bakes & bites',area:'Ariana',rating:4.8,reviews:126,eta:'30–40 min',bio:'Naturally sweet date bites, granola and crisp baked goods for everyday snacking.',cover:'🍪'},
    {id:'v3',name:'Pepper House',initials:'PH',emoji:'🌶️',category:'Spreads & spice',area:'Le Bardo',rating:4.9,reviews:211,eta:'35–45 min',bio:'Bold shelf-stable pepper pastes and spice blends made in micro batches.',cover:'🔥'},
    {id:'v4',name:'Sunday Jar',initials:'SJ',emoji:'🍊',category:'Jams & preserves',area:'Carthage',rating:4.7,reviews:92,eta:'25–35 min',bio:'Seasonal fruit preserves, marmalades and gift jars with low-waste packaging.',cover:'🍯'}
  ],
  products:[
    {id:'p1',vendorId:'v1',name:'Roasted Bsissa Blend',category:'Grains',price:18.5,unit:'350 g',emoji:'🥣',shelf:'90 days',stock:14,allergens:'Sesame, wheat',badge:'Best seller'},
    {id:'p2',vendorId:'v1',name:'Olive & Herb Tapenade',category:'Spreads',price:16,unit:'220 g',emoji:'🫒',shelf:'45 days',stock:8,allergens:'None listed',badge:'Small batch'},
    {id:'p3',vendorId:'v2',name:'Date Sesame Bites',category:'Snacks',price:14,unit:'12 pcs',emoji:'🍪',shelf:'30 days',stock:23,allergens:'Sesame',badge:'No refined sugar'},
    {id:'p4',vendorId:'v2',name:'Orange Almond Granola',category:'Breakfast',price:22,unit:'400 g',emoji:'🥜',shelf:'60 days',stock:17,allergens:'Almonds, oats',badge:'Popular'},
    {id:'p5',vendorId:'v3',name:'Smoked Harissa Jar',category:'Spreads',price:12.5,unit:'180 g',emoji:'🌶️',shelf:'120 days',stock:31,allergens:'None listed',badge:'Hot'},
    {id:'p6',vendorId:'v3',name:'Tabil Spice Blend',category:'Spices',price:9.5,unit:'90 g',emoji:'🧂',shelf:'180 days',stock:42,allergens:'None listed',badge:'Pantry staple'},
    {id:'p7',vendorId:'v4',name:'Bitter Orange Marmalade',category:'Preserves',price:15.5,unit:'250 g',emoji:'🍊',shelf:'120 days',stock:11,allergens:'None listed',badge:'Seasonal'},
    {id:'p8',vendorId:'v4',name:'Fig & Rose Preserve',category:'Preserves',price:17,unit:'250 g',emoji:'🫐',shelf:'120 days',stock:5,allergens:'None listed',badge:'Low stock'}
  ],
  orders:[
    {id:'PM-1048',customer:'Maya B.',vendorId:'v1',items:[{productId:'p1',qty:1},{productId:'p2',qty:2}],total:55.5,status:'preparing',address:'Lac 1, Tunis',fee:5.5,created:'Today, 10:42'},
    {id:'PM-1047',customer:'Youssef K.',vendorId:'v1',items:[{productId:'p1',qty:2}],total:42,status:'ready',address:'Mutuelleville, Tunis',fee:6.5,created:'Today, 09:55'},
    {id:'PM-1046',customer:'Ines M.',vendorId:'v3',items:[{productId:'p5',qty:1},{productId:'p6',qty:1}],total:27,status:'delivered',address:'Centre Urbain Nord',fee:5.5,created:'Yesterday, 18:20'}
  ],
  cart:[],
  favorites:[],
  activeDelivery:'',
  location:'Ariana'
};
function loadState(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
    if(!saved)return JSON.parse(JSON.stringify(seed));
    return Object.assign(JSON.parse(JSON.stringify(seed)),saved);
  }catch(e){return JSON.parse(JSON.stringify(seed))}
}
let state=loadState();
let currentView='marketplace';
let currentMode='buyer';
let selectedCategory='All';
let currentSearch='';
let selectedStore='v1';
let vendorTab='overview';
const app=document.getElementById('app');
const scrim=document.getElementById('scrim');
const cartDrawer=document.getElementById('cartDrawer');
const modeDrawer=document.getElementById('modeDrawer');
const cartContents=document.getElementById('cartContents');
const modalWrap=document.getElementById('modalWrap');
const modal=document.getElementById('modal');
const toast=document.getElementById('toast');
const money=n=>Number(n).toFixed(2).replace('.00','')+' DT';
const vendor=id=>state.vendors.find(x=>x.id===id);
const product=id=>state.products.find(x=>x.id===id);
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function cartCount(){return state.cart.reduce((s,i)=>s+i.qty,0)}
function cartSubtotal(){return state.cart.reduce((s,i)=>{const item=product(i.productId);return s+(item?item.price*i.qty:0)},0)}
function deliveryFee(){
  if(!state.cart.length)return 0;
  const vendors=new Set(state.cart.map(i=>product(i.productId)?.vendorId).filter(Boolean));
  const subtotal=cartSubtotal();
  return subtotal>=60?0:4.5*Math.max(1,vendors.size);
}
function updateHeader(){
  document.getElementById('cartCount').textContent=cartCount();
  document.getElementById('locationText').textContent=state.location;
  document.querySelectorAll('[data-nav]').forEach(btn=>btn.classList.toggle('is-active',btn.dataset.nav===currentView&&currentMode==='buyer'));
  document.querySelectorAll('[data-mode]').forEach(btn=>btn.classList.toggle('is-active',btn.dataset.mode===currentMode));
}
function showToast(message){toast.textContent=message;toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove('show'),2400)}
function openDrawer(which){
  cartDrawer.classList.toggle('is-open',which==='cart');
  modeDrawer.classList.toggle('is-open',which==='mode');
  scrim.classList.add('is-on');
  if(which==='cart')renderCart();
}
function closeDrawers(){cartDrawer.classList.remove('is-open');modeDrawer.classList.remove('is-open');scrim.classList.remove('is-on')}
function openModal(html){modal.innerHTML=html;modalWrap.classList.add('is-open');modalWrap.setAttribute('aria-hidden','false')}
function closeModal(){modalWrap.classList.remove('is-open');modalWrap.setAttribute('aria-hidden','true')}
function statusLabel(status){return ({new:'New',preparing:'Preparing',ready:'Ready for courier',delivering:'Out for delivery',delivered:'Delivered'})[status]||status}
function statusClass(status){return status==='delivering'?'delivering':status}
function productCard(p){
  const maker=vendor(p.vendorId);
  const fav=state.favorites.includes(p.id);
  return '<article class="product-card"><div class="product-media"><span class="badge">'+p.badge+'</span><button class="heart" onclick="toggleFavorite(\''+p.id+'\');event.stopPropagation()">'+(fav?'♥':'♡')+'</button><div class="food-art">'+p.emoji+'</div></div><div class="product-body"><button class="vendor-line" style="border:0;background:none;padding:0;cursor:pointer" onclick="openStore(\''+maker.id+'\')"><span class="verified">●</span>'+maker.name+'</button><h3>'+p.name+'</h3><div class="product-meta"><span>'+p.unit+'</span><span>'+p.shelf+'</span></div><div class="price-row"><span class="price">'+money(p.price)+'</span><button class="add-btn" onclick="addToCart(\''+p.id+'\')">+</button></div></div></article>';
}
function storeCard(v){
  return '<article class="store-card" onclick="openStore(\''+v.id+'\')"><div class="store-cover">'+v.cover+'</div><div class="store-avatar">'+v.initials+'</div><h3>'+v.name+'</h3><small>'+v.category+'</small><div class="store-stats"><span>★ '+v.rating+' ('+v.reviews+')</span><span>'+v.area+'</span><span>'+v.eta+'</span></div></article>';
}
function renderMarketplace(){
  const categories=['All',...new Set(state.products.map(p=>p.category))];
  let products=state.products.filter(p=>selectedCategory==='All'||p.category===selectedCategory);
  if(currentSearch){
    products=products.filter(p=>{
      const maker=vendor(p.vendorId);
      return [p.name,p.category,p.allergens,maker?.name,maker?.category].join(' ').toLowerCase().includes(currentSearch.toLowerCase());
    });
  }
  app.innerHTML='<div class="page"><section class="hero"><div class="hero-main"><span class="hero-kicker">● Local makers · shelf-stable food</span><h1>Good food, made close to home.</h1><p>Shop small-batch pantry food from verified home makers, combine products from multiple stores, and hand the delivery to a local courier.</p><div class="hero-actions"><button class="secondary-btn" onclick="scrollToProducts()">Shop the pantry</button><button class="primary-btn" onclick="switchMode(\'vendor\')">Start selling</button></div></div><div class="hero-side"><div class="hero-tile"><span class="tile-icon">🫙</span><div><strong>Meet Noura Pantry</strong><p>Traditional blends and preserves, prepared in small batches.</p></div></div><div class="hero-tile dark"><span class="tile-icon">🛵</span><div><strong>One easy delivery</strong><p>Mix several makers in your cart. Delivery is free from 60 DT.</p></div></div></div></section><section class="section"><div class="section-head"><div><h2>Shop by pantry</h2><p>Browse food designed for safe ambient or shelf-stable storage.</p></div></div><div class="chips">'+categories.map(c=>'<button class="chip '+(selectedCategory===c?'is-active':'')+'" onclick="selectCategory(\''+c+'\')">'+c+'</button>').join('')+'</div></section><section class="section"><div class="section-head"><div><h2>Popular right now</h2><p>'+products.length+' products from local home makers.</p></div><button class="ghost-btn" onclick="openSearch()">Search marketplace</button></div><div class="product-grid" id="productGrid">'+(products.length?products.map(productCard).join(''):'<div class="empty-state" style="grid-column:1/-1"><span>⌕</span><h3>No pantry finds</h3><p>Try a different search or category.</p></div>')+'</div></section><section class="section"><div class="section-head"><div><h2>Local stores</h2><p>Every maker has a storefront, rating and product catalogue.</p></div><button class="ghost-btn" onclick="navigate(\'stores\')">View all stores</button></div><div class="store-grid">'+state.vendors.slice(0,3).map(storeCard).join('')+'</div></section><div class="trust-strip"><div class="trust-item"><span>✓</span><div><strong>Verified makers</strong><small>Identity and kitchen profile</small></div></div><div class="trust-item"><span>🏷</span><div><strong>Clear labels</strong><small>Ingredients and shelf life</small></div></div><div class="trust-item"><span>📦</span><div><strong>Batch ready</strong><small>Traceable inventory</small></div></div><div class="trust-item"><span>↗</span><div><strong>Courier handoff</strong><small>Pickup to doorstep workflow</small></div></div></div><div class="info-banner"><span>ⓘ</span><span><strong>Marketplace safety model:</strong> production launch should enforce the home-food categories, permits, ingredient/allergen labels, taxes and delivery rules required by the seller’s jurisdiction.</span></div></div>';
}
function renderStores(){
  app.innerHTML='<div class="page"><div class="section-head"><div><p class="eyebrow">Multi-vendor marketplace</p><h2>Home maker stores</h2><p>Explore a store, its ratings and every active pantry listing.</p></div></div><div class="store-grid">'+state.vendors.map(storeCard).join('')+'</div></div>';
}
function openStore(id){selectedStore=id;currentView='store';currentMode='buyer';closeDrawers();render()}
function renderStore(){
  const v=vendor(selectedStore)||state.vendors[0];
  const list=state.products.filter(p=>p.vendorId===v.id);
  app.innerHTML='<div class="page"><section class="store-hero"><div class="store-avatar">'+v.initials+'</div><div><p class="eyebrow" style="color:#bcd2c4">Verified home maker</p><h1>'+v.name+'</h1><p>'+v.bio+'</p><div class="store-stats"><span>★ '+v.rating+' ('+v.reviews+')</span><span>'+v.area+'</span><span>'+v.eta+'</span></div></div><button class="primary-btn" onclick="showToast(\'Following '+v.name+'\')">♡ Follow</button></section><div class="info-banner"><span>'+v.emoji+'</span><span>All listings show pack size, shelf life, stock and allergen information. Production builds should add batch IDs and compliance documents.</span></div><section class="section"><div class="section-head"><div><h2>From this kitchen</h2><p>'+list.length+' shelf-stable products available.</p></div><button class="ghost-btn" onclick="navigate(\'stores\')">All stores</button></div><div class="product-grid">'+list.map(productCard).join('')+'</div></section></div>';
}
function renderOrders(){
  const list=state.orders.slice(0,8);
  app.innerHTML='<div class="page"><div class="section-head"><div><p class="eyebrow">Buyer account</p><h2>My orders</h2><p>Follow preparation, courier pickup and delivery.</p></div></div><div class="panel">'+list.map(o=>{const maker=vendor(o.vendorId);return '<div class="catalog-row"><div class="catalog-thumb">'+maker.emoji+'</div><div><strong>'+o.id+' · '+maker.name+'</strong><div class="product-meta" style="margin:4px 0 0"><span>'+o.created+'</span><span>'+o.items.reduce((s,i)=>s+i.qty,0)+' item(s)</span><span>'+o.address+'</span></div></div><span class="status-pill '+statusClass(o.status)+'">'+statusLabel(o.status)+'</span><strong class="hide-mobile">'+money(o.total)+'</strong></div>'}).join('')+'</div></div>';
}
function selectCategory(c){selectedCategory=c;render()}
function scrollToProducts(){document.getElementById('productGrid')?.scrollIntoView({behavior:'smooth'})}
function toggleFavorite(id){state.favorites=state.favorites.includes(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id];save();render()}
function addToCart(id){
  const item=state.cart.find(i=>i.productId===id);
  if(item)item.qty++;else state.cart.push({productId:id,qty:1});
  save();updateHeader();renderCart();showToast(product(id).name+' added to basket');
}
function changeQty(id,delta){
  const item=state.cart.find(i=>i.productId===id);if(!item)return;
  item.qty+=delta;if(item.qty<=0)state.cart=state.cart.filter(i=>i.productId!==id);
  save();updateHeader();renderCart();
}
function renderCart(){
  if(!state.cart.length){cartContents.innerHTML='<div class="empty-state"><span>🧺</span><h3>Your basket is empty</h3><p>Add pantry food from one or several local makers.</p><button class="primary-btn" onclick="closeDrawers();navigate(\'marketplace\')">Explore marketplace</button></div>';return}
  const subtotal=cartSubtotal(),fee=deliveryFee();
  cartContents.innerHTML=state.cart.map(i=>{const p=product(i.productId),maker=vendor(p.vendorId);return '<div class="cart-item"><div class="cart-thumb">'+p.emoji+'</div><div><h4>'+p.name+'</h4><small>'+maker.name+'</small><div class="qty"><button onclick="changeQty(\''+p.id+'\',-1)">−</button><b>'+i.qty+'</b><button onclick="changeQty(\''+p.id+'\',1)">+</button></div></div><strong>'+money(p.price*i.qty)+'</strong></div>'}).join('')+'<div class="cart-summary"><div class="summary-line"><span>Subtotal</span><strong>'+money(subtotal)+'</strong></div><div class="summary-line"><span>Delivery</span><strong>'+(fee?money(fee):'Free')+'</strong></div><div class="summary-line total"><span>Total</span><span>'+money(subtotal+fee)+'</span></div><button class="primary-btn checkout-btn" onclick="openCheckout()">Continue to checkout</button></div>';
}
function openCheckout(){
  closeDrawers();
  const total=cartSubtotal()+deliveryFee();
  openModal('<p class="eyebrow">Secure checkout</p><h2>Delivery details</h2><p>Demo checkout uses cash on delivery. A production build can connect a card/mobile-wallet provider and seller payouts.</p><div class="form-grid"><div class="field"><label>Name</label><input id="checkoutName" value="Salma"></div><div class="field"><label>Phone</label><input id="checkoutPhone" placeholder="+216 …"></div><div class="field full"><label>Delivery address</label><input id="checkoutAddress" value="'+state.location+', Tunisia"></div><div class="field full"><label>Delivery note</label><textarea id="checkoutNote" placeholder="Floor, landmark, gate code…"></textarea></div></div><div class="cart-summary"><div class="summary-line"><span>Payment</span><strong>Cash on delivery</strong></div><div class="summary-line total"><span>Total</span><span>'+money(total)+'</span></div></div><div class="modal-actions"><button class="ghost-btn" onclick="closeModal()">Cancel</button><button class="primary-btn" onclick="placeOrder()">Place order</button></div>');
}
function placeOrder(){
  const address=document.getElementById('checkoutAddress').value.trim();if(!address){showToast('Add a delivery address');return}
  const name=document.getElementById('checkoutName').value.trim()||'Guest';
  const grouped={};state.cart.forEach(i=>{const p=product(i.productId);if(p)(grouped[p.vendorId]??=[]).push(i)});
  Object.entries(grouped).forEach(([vendorId,items],idx)=>{
    const subtotal=items.reduce((s,i)=>s+product(i.productId).price*i.qty,0);
    const fee=subtotal>=60?0:5.5;
    state.orders.unshift({id:'PM-'+(1050+state.orders.length+idx),customer:name,vendorId,items,total:subtotal+fee,status:'new',address,fee,created:'Just now'});
  });
  state.cart=[];save();updateHeader();
  openModal('<div style="text-align:center;padding:20px"><div style="font-size:58px">✓</div><h2>Order placed</h2><p>Your home maker can now accept and prepare it. The courier app will see the order once it is marked ready.</p><div class="modal-actions" style="justify-content:center"><button class="primary-btn" onclick="closeModal();navigate(\'orders\')">Track my order</button></div></div>');
}
function openSearch(){
  openModal('<p class="eyebrow">Marketplace search</p><h2>Find pantry food</h2><div class="search-panel"><input id="searchInput" placeholder="Harissa, granola, Noura…" value="'+currentSearch.replace(/"/g,'&quot;')+'"><button class="primary-btn" onclick="applySearch()">Search</button></div><p>Search products, categories, allergens and maker names.</p><div class="modal-actions"><button class="ghost-btn" onclick="clearSearch()">Clear search</button><button class="ghost-btn" onclick="closeModal()">Cancel</button></div>');
  setTimeout(()=>document.getElementById('searchInput')?.focus(),40);
}
function applySearch(){currentSearch=document.getElementById('searchInput').value.trim();selectedCategory='All';currentView='marketplace';closeModal();render()}
function clearSearch(){currentSearch='';closeModal();render()}
function openLocation(){
  openModal('<p class="eyebrow">Delivery zone</p><h2>Choose your area</h2><div class="field"><label>Current delivery area</label><select id="locationSelect"><option>Ariana</option><option>Tunis</option><option>La Marsa</option><option>Carthage</option><option>Le Bardo</option></select></div><p>Production delivery zones should be validated from real addresses and courier coverage.</p><div class="modal-actions"><button class="ghost-btn" onclick="closeModal()">Cancel</button><button class="primary-btn" onclick="saveLocation()">Use this area</button></div>');
  document.getElementById('locationSelect').value=state.location;
}
function saveLocation(){state.location=document.getElementById('locationSelect').value;save();updateHeader();closeModal();showToast('Delivering to '+state.location)}
function renderVendor(){
  const orders=state.orders.filter(o=>o.vendorId==='v1');
  const products=state.products.filter(p=>p.vendorId==='v1');
  let content='';
  if(vendorTab==='overview'){
    content='<div class="metric-grid"><div class="metric"><small>Revenue</small><strong>286.5 DT</strong><div class="trend">↑ 12% this week</div></div><div class="metric"><small>Orders</small><strong>'+(orders.length+7)+'</strong><div class="trend">3 need attention</div></div><div class="metric"><small>Products</small><strong>'+products.length+'</strong><div class="trend">'+products.filter(p=>p.stock<8).length+' low stock</div></div><div class="metric"><small>Store rating</small><strong>4.9</strong><div class="trend">184 reviews</div></div></div><div class="panel"><div class="panel-head"><h3>Recent orders</h3><button class="mini-btn" onclick="vendorTab=\'orders\';render()">View all</button></div>'+vendorOrdersTable(orders.slice(0,5))+'</div>';
  }else if(vendorTab==='products'){
    content='<div class="panel"><div class="panel-head"><h3>Products & inventory</h3><button class="primary-btn" onclick="openAddProduct()">+ New product</button></div>'+products.map(p=>'<div class="catalog-row"><div class="catalog-thumb">'+p.emoji+'</div><div><strong>'+p.name+'</strong><div class="product-meta" style="margin:4px 0 0"><span>'+p.category+'</span><span>'+p.unit+'</span><span>'+p.shelf+'</span></div></div><strong>'+money(p.price)+'</strong><div class="hide-mobile"><span class="status-pill '+(p.stock<8?'new':'ready')+'">'+p.stock+' in stock</span> <button class="mini-btn" onclick="restock(\''+p.id+'\')">+5</button></div></div>').join('')+'</div>';
  }else{
    content='<div class="panel"><div class="panel-head"><h3>All seller orders</h3></div>'+vendorOrdersTable(orders)+'</div>';
  }
  app.innerHTML='<div class="page"><div class="dashboard-shell"><aside class="side-panel"><h2>Seller studio</h2><div class="side-nav"><button class="'+(vendorTab==='overview'?'is-active':'')+'" onclick="vendorTab=\'overview\';render()">Overview</button><button class="'+(vendorTab==='products'?'is-active':'')+'" onclick="vendorTab=\'products\';render()">Products</button><button class="'+(vendorTab==='orders'?'is-active':'')+'" onclick="vendorTab=\'orders\';render()">Orders</button><button onclick="switchMode(\'buyer\');openStore(\'v1\')">View storefront</button></div><div class="side-note">Noura Pantry · verified seller<br>Demo changes persist in this browser.</div></aside><section class="workspace"><div class="workspace-head"><div><p class="eyebrow">Noura Pantry</p><h1>Seller studio</h1><p>Manage your store, stock and incoming orders.</p></div><button class="primary-btn" onclick="openAddProduct()">+ Add product</button></div>'+content+'</section></div></div>';
}
function vendorOrdersTable(orders){
  return '<table class="order-table"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Action</th></tr></thead><tbody>'+orders.map(o=>'<tr><td><strong>'+o.id+'</strong></td><td>'+o.customer+'</td><td>'+money(o.total)+'</td><td><span class="status-pill '+statusClass(o.status)+'">'+statusLabel(o.status)+'</span></td><td>'+vendorOrderAction(o)+'</td></tr>').join('')+'</tbody></table>';
}
function vendorOrderAction(o){
  if(o.status==='new')return '<button class="mini-btn" onclick="advanceVendorOrder(\''+o.id+'\')">Accept</button>';
  if(o.status==='preparing')return '<button class="mini-btn" onclick="advanceVendorOrder(\''+o.id+'\')">Mark ready</button>';
  return '<span class="product-meta">'+(o.status==='ready'?'Await courier':'View')+'</span>';
}
function advanceVendorOrder(id){const o=state.orders.find(x=>x.id===id);if(!o)return;if(o.status==='new')o.status='preparing';else if(o.status==='preparing')o.status='ready';save();showToast(o.id+' · '+statusLabel(o.status));render()}
function restock(id){const p=product(id);if(!p)return;p.stock+=5;save();showToast(p.name+' restocked');render()}
function openAddProduct(){
  openModal('<p class="eyebrow">Noura Pantry</p><h2>Add a shelf-stable product</h2><div class="form-grid"><div class="field"><label>Product name</label><input id="npName" placeholder="Dried mint blend"></div><div class="field"><label>Category</label><select id="npCategory"><option>Spices</option><option>Grains</option><option>Snacks</option><option>Preserves</option><option>Spreads</option></select></div><div class="field"><label>Price (DT)</label><input id="npPrice" type="number" value="12"></div><div class="field"><label>Pack size</label><input id="npUnit" value="150 g"></div><div class="field"><label>Stock</label><input id="npStock" type="number" value="10"></div><div class="field"><label>Shelf life</label><input id="npShelf" value="90 days"></div><div class="field full"><label>Allergens</label><input id="npAllergens" placeholder="None listed / sesame / nuts…"></div></div><div class="modal-actions"><button class="ghost-btn" onclick="closeModal()">Cancel</button><button class="primary-btn" onclick="saveNewProduct()">Publish product</button></div>');
}
function saveNewProduct(){
  const name=document.getElementById('npName').value.trim();if(!name){showToast('Give the product a name');return}
  state.products.push({id:'p'+Date.now(),vendorId:'v1',name,category:document.getElementById('npCategory').value,price:Number(document.getElementById('npPrice').value)||0,unit:document.getElementById('npUnit').value||'150 g',emoji:'🫙',shelf:document.getElementById('npShelf').value||'90 days',stock:Number(document.getElementById('npStock').value)||0,allergens:document.getElementById('npAllergens').value||'None listed',badge:'New'});
  save();closeModal();vendorTab='products';showToast(name+' published');render();
}

/* ===== PantryMade Pro runtime helpers ===== */
var marketSort='popular';
var deliverySlot='ASAP · 25–45 min';
var driverFilter='best';
var selectedDriverJobs=[];
var routeMap=null;
var routeLayer=null;
var routeMarkers=[];
var routeMetrics={km:0,min:0};

function upgradeData(){
  var vendorMeta={
    v1:{lat:36.8665,lng:10.1647,hours:'08:00–18:00',license:'Verified',response:'6 min',minimum:15,deliveryRadius:10,commission:12,fulfilment:98},
    v2:{lat:36.8065,lng:10.1815,hours:'09:00–19:00',license:'Verified',response:'8 min',minimum:12,deliveryRadius:12,commission:12,fulfilment:97},
    v3:{lat:36.8782,lng:10.3247,hours:'10:00–20:00',license:'Verified',response:'4 min',minimum:10,deliveryRadius:14,commission:12,fulfilment:99},
    v4:{lat:36.8531,lng:10.3233,hours:'08:30–17:30',license:'Verified',response:'11 min',minimum:15,deliveryRadius:11,commission:12,fulfilment:96}
  };
  state.vendors.forEach(function(x){
    Object.assign(x,vendorMeta[x.id]||{});
    if(!x.reviewCount)x.reviewCount=x.reviews||80;
    if(!x.fulfilment)x.fulfilment=97;
  });
  var moreVendors=[
    {id:'v5',name:'Dar Zrir',initials:'DZ',emoji:'🌰',category:'Seeds & sweets',area:'Tunis Centre',rating:4.9,reviews:163,reviewCount:163,eta:'20–30 min',bio:'Roasted seeds, nut mixes and compact Tunisian sweets packed for gifting.',cover:'🌰',lat:36.8065,lng:10.1815,hours:'09:00–18:30',license:'Verified',response:'5 min',minimum:15,deliveryRadius:9,commission:12,fulfilment:99},
    {id:'v6',name:'Citrus & Sun',initials:'CS',emoji:'🍋',category:'Citrus pantry',area:'Sidi Bou Said',rating:4.8,reviews:107,reviewCount:107,eta:'30–40 min',bio:'Bright citrus preserves, candied peel and herbal infusions.',cover:'☀️',lat:36.8687,lng:10.3417,hours:'08:00–17:00',license:'Verified',response:'9 min',minimum:18,deliveryRadius:13,commission:13,fulfilment:96},
    {id:'v7',name:'The Crunch Kitchen',initials:'CK',emoji:'🥨',category:'Crackers & snacks',area:'El Menzah',rating:4.7,reviews:89,reviewCount:89,eta:'20–30 min',bio:'Savory baked crackers and travel-friendly pantry snacks.',cover:'🥨',lat:36.8395,lng:10.1700,hours:'10:00–21:00',license:'Verified',response:'7 min',minimum:12,deliveryRadius:10,commission:12,fulfilment:95},
    {id:'v8',name:'Olive Yard',initials:'OY',emoji:'🫒',category:'Olives & oils',area:'Le Bardo',rating:4.9,reviews:244,reviewCount:244,eta:'25–35 min',bio:'Seasoned olives, infused oils and tapenades in reusable jars.',cover:'🫒',lat:36.8090,lng:10.1405,hours:'08:30–19:30',license:'Verified',response:'3 min',minimum:20,deliveryRadius:15,commission:11,fulfilment:99}
  ];
  moreVendors.forEach(function(x){if(!state.vendors.some(function(v){return v.id===x.id;}))state.vendors.push(x);});

  var moreProducts=[
    {id:'p9',vendorId:'v5',name:'Pistachio Zrir Jar',category:'Sweets',price:28,unit:'250 g',emoji:'🌰',shelf:'60 days',stock:12,allergens:'Pistachio, sesame',badge:'Premium',tags:['Giftable','Protein']},
    {id:'p10',vendorId:'v5',name:'Roasted Seed Mix',category:'Snacks',price:13.5,unit:'220 g',emoji:'🌻',shelf:'90 days',stock:25,allergens:'Seeds',badge:'Crunchy',tags:['Vegan','Travel']},
    {id:'p11',vendorId:'v6',name:'Candied Lemon Peel',category:'Preserves',price:11,unit:'180 g',emoji:'🍋',shelf:'120 days',stock:18,allergens:'None listed',badge:'Bright',tags:['Vegan','Giftable']},
    {id:'p12',vendorId:'v6',name:'Citrus Herbal Infusion',category:'Drinks',price:16,unit:'20 bags',emoji:'🍵',shelf:'180 days',stock:32,allergens:'None listed',badge:'Caffeine free',tags:['Tea','Vegan']},
    {id:'p13',vendorId:'v7',name:'Rosemary Sesame Crackers',category:'Snacks',price:10.5,unit:'200 g',emoji:'🥨',shelf:'45 days',stock:41,allergens:'Gluten, sesame',badge:'Fresh batch',tags:['Savory']},
    {id:'p14',vendorId:'v7',name:'Harissa Crisp Sticks',category:'Snacks',price:12,unit:'180 g',emoji:'🥖',shelf:'45 days',stock:21,allergens:'Gluten',badge:'Spicy',tags:['Spicy']},
    {id:'p15',vendorId:'v8',name:'Lemon Thyme Olive Oil',category:'Oils',price:26,unit:'300 ml',emoji:'🫒',shelf:'180 days',stock:16,allergens:'None listed',badge:'Cold infused',tags:['Vegan']},
    {id:'p16',vendorId:'v8',name:'Chili Green Olives',category:'Preserves',price:14.5,unit:'300 g',emoji:'🫒',shelf:'90 days',stock:28,allergens:'None listed',badge:'Popular',tags:['Spicy','Vegan']},
    {id:'p17',vendorId:'v1',name:'Carob & Sesame Bsissa',category:'Grains',price:20,unit:'400 g',emoji:'🥣',shelf:'120 days',stock:9,allergens:'Sesame, wheat',badge:'New recipe',tags:['Breakfast']},
    {id:'p18',vendorId:'v2',name:'Date Cocoa Granola',category:'Breakfast',price:23,unit:'400 g',emoji:'🍫',shelf:'60 days',stock:15,allergens:'Oats, almonds',badge:'Kids love it',tags:['Breakfast']},
    {id:'p19',vendorId:'v3',name:'Mild Harissa Paste',category:'Spreads',price:12,unit:'180 g',emoji:'🌶️',shelf:'120 days',stock:26,allergens:'None listed',badge:'Mild',tags:['Vegan']},
    {id:'p20',vendorId:'v4',name:'Apricot Vanilla Preserve',category:'Preserves',price:16,unit:'250 g',emoji:'🍑',shelf:'120 days',stock:14,allergens:'None listed',badge:'Seasonal',tags:['Giftable']}
  ];
  state.products.forEach(function(x,idx){
    if(!x.tags)x.tags=[x.category];
    if(!x.rating)x.rating=4.7+(idx%3)*0.1;
    if(!x.reviews)x.reviews=28+idx*9;
    if(!x.ingredients)x.ingredients='Prepared in small batches with clearly labeled pantry ingredients.';
  });
  moreProducts.forEach(function(x){
    x.rating=x.rating||4.8;x.reviews=x.reviews||30;
    x.ingredients=x.ingredients||'Small-batch pantry ingredients with full label details.';
    if(!state.products.some(function(p){return p.id===x.id;}))state.products.push(x);
  });

  var extraOrders=[
    {id:'PM-1053',customer:'Amira S.',phone:'+216 20 440 812',vendorId:'v1',items:[{productId:'p1',qty:2},{productId:'p17',qty:1}],total:63,status:'new',address:'El Menzah 5, Tunis',lat:36.8368,lng:10.1758,fee:5.5,created:'4 min ago',payment:'Card · paid',notes:'No plastic bag please',priority:'normal',prepMinutes:25,channel:'Marketplace'},
    {id:'PM-1052',customer:'Walid G.',phone:'+216 26 731 442',vendorId:'v1',items:[{productId:'p2',qty:2}],total:37.5,status:'new',address:'Ennasr 2, Ariana',lat:36.8669,lng:10.1699,fee:5.5,created:'9 min ago',payment:'Cash',notes:'Call on arrival',priority:'high',prepMinutes:20,channel:'Marketplace'},
    {id:'PM-1051',customer:'Sara K.',phone:'+216 22 519 330',vendorId:'v1',items:[{productId:'p1',qty:1}],total:24,status:'preparing',address:'Centre Urbain Nord',lat:36.8490,lng:10.1905,fee:5.5,created:'22 min ago',payment:'Card · paid',notes:'Reception desk',priority:'normal',prepMinutes:15,channel:'Marketplace'},
    {id:'PM-1050',customer:'Fares M.',phone:'+216 55 801 204',vendorId:'v1',items:[{productId:'p17',qty:2}],total:45.5,status:'ready',address:'Lac 2, Tunis',lat:36.8465,lng:10.2743,fee:6.5,created:'38 min ago',payment:'Cash',notes:'Apartment 12',priority:'normal',prepMinutes:25,channel:'Marketplace'},
    {id:'PM-1049',customer:'Rim H.',phone:'+216 98 336 101',vendorId:'v3',items:[{productId:'p5',qty:2},{productId:'p6',qty:1}],total:40,status:'ready',address:'Carthage Byrsa',lat:36.8534,lng:10.3230,fee:7.5,created:'41 min ago',payment:'Card · paid',notes:'Blue gate',priority:'high',prepMinutes:20,channel:'Marketplace'},
    {id:'PM-1045',customer:'Nadia J.',phone:'+216 29 511 601',vendorId:'v4',items:[{productId:'p7',qty:1},{productId:'p20',qty:2}],total:53,status:'ready',address:'La Marsa Plage',lat:36.8870,lng:10.3250,fee:7.5,created:'48 min ago',payment:'Card · paid',notes:'Leave with concierge',priority:'normal',prepMinutes:30,channel:'Marketplace'},
    {id:'PM-1043',customer:'Omar R.',phone:'+216 24 011 783',vendorId:'v8',items:[{productId:'p15',qty:1},{productId:'p16',qty:2}],total:60.5,status:'ready',address:'Mutuelleville, Tunis',lat:36.8351,lng:10.1859,fee:6.5,created:'52 min ago',payment:'Cash',notes:'Ring twice',priority:'normal',prepMinutes:20,channel:'Marketplace'},
    {id:'PM-1042',customer:'Yosra D.',phone:'+216 21 882 733',vendorId:'v5',items:[{productId:'p9',qty:1}],total:33.5,status:'delivered',address:'Bab Bhar, Tunis',lat:36.8008,lng:10.1800,fee:5.5,created:'Yesterday',payment:'Card · paid',notes:'',priority:'normal',prepMinutes:20,channel:'Marketplace'}
  ];
  extraOrders.forEach(function(x){if(!state.orders.some(function(o){return o.id===x.id;}))state.orders.push(x);});
  var oldCoords={'PM-1048':[36.8480,10.1870],'PM-1047':[36.8391,10.1622],'PM-1046':[36.8450,10.1950]};
  state.orders.forEach(function(o){
    if(!o.phone)o.phone='+216 20 000 000';
    if(!o.payment)o.payment='Card · paid';
    if(!o.notes)o.notes='No special note';
    if(!o.priority)o.priority='normal';
    if(!o.prepMinutes)o.prepMinutes=25;
    if(!o.channel)o.channel='Marketplace';
    if((!o.lat||!o.lng)&&oldCoords[o.id]){o.lat=oldCoords[o.id][0];o.lng=oldCoords[o.id][1];}
  });
  if(!state.activeRoute)state.activeRoute=[];
  if(!state.routeStops)state.routeStops=[];
  if(typeof state.routeProgress!=='number')state.routeProgress=0;
  if(!state.storeSettings)state.storeSettings={autoAccept:false,pauseStore:false,lowStockAlerts:true,prepBuffer:10,deliveryHandoff:true};
  state.proVersion=4;
  save();
}

function statusLabel(status){
  return ({new:'New',accepted:'Accepted',preparing:'Preparing',ready:'Ready for courier',driver_assigned:'Driver assigned',delivering:'Out for delivery',delivered:'Delivered',rejected:'Rejected'})[status]||status;
}
function statusClass(status){
  if(status==='driver_assigned'||status==='delivering')return 'delivering';
  if(status==='accepted'||status==='preparing')return 'ready';
  return status;
}
function orderStage(status){
  var map={new:0,accepted:1,preparing:1,ready:2,driver_assigned:3,delivering:3,delivered:4,rejected:0};
  return map[status]||0;
}
function orderItemCount(o){return (o.items||[]).reduce(function(s,i){return s+(i.qty||1);},0);}
function orderItemNames(o){
  return (o.items||[]).map(function(i){var p=product(i.productId);return (i.qty||1)+'× '+(p?p.name:'Item');}).join(', ');
}
function productCard(p){
  var maker=vendor(p.vendorId),fav=state.favorites.includes(p.id);
  return '<article class="product-card" onclick="openProductDetail(\''+p.id+'\')">'+
    '<div class="product-media"><span class="badge">'+p.badge+'</span>'+
    '<button class="heart" onclick="event.stopPropagation();toggleFavorite(\''+p.id+'\')">'+(fav?'♥':'♡')+'</button>'+
    '<div class="food-art">'+p.emoji+'</div></div>'+
    '<div class="product-body"><button class="vendor-line" style="border:0;background:none;padding:0;cursor:pointer" onclick="event.stopPropagation();openStore(\''+maker.id+'\')"><span class="verified">●</span>'+maker.name+' · ★ '+p.rating.toFixed(1)+'</button>'+
    '<h3>'+p.name+'</h3><div class="product-tags">'+(p.tags||[p.category]).slice(0,3).map(function(t){return '<span class="tag-mini">'+t+'</span>';}).join('')+'</div>'+
    '<div class="product-meta"><span>'+p.unit+'</span><span>'+p.shelf+'</span><span>'+p.stock+' left</span></div>'+
    '<div class="price-row"><span class="price">'+money(p.price)+'</span><button class="add-btn" onclick="event.stopPropagation();addToCart(\''+p.id+'\')">+</button></div></div></article>';
}
function storeCard(v){
  return '<article class="store-card" onclick="openStore(\''+v.id+'\')">'+
    '<div class="store-cover">'+v.cover+'</div><div class="store-avatar">'+v.initials+'</div><h3>'+v.name+'</h3>'+
    '<small>'+v.category+' · '+v.hours+'</small><div class="store-stats"><span>★ '+v.rating+' ('+v.reviewCount+')</span><span>'+v.area+'</span><span>'+v.eta+'</span></div>'+
    '<div class="store-health"><span>'+v.fulfilment+'% fulfil</span><span>'+v.response+' reply</span><span>'+v.minimum+' DT min</span></div></article>';
}
function openProductDetail(id){
  var p=product(id),maker=vendor(p.vendorId);
  openModal('<div style="text-align:center;font-size:64px">'+p.emoji+'</div><p class="eyebrow">'+maker.name+'</p><h2>'+p.name+'</h2><p>'+p.ingredients+'</p>'+
    '<div class="detail-grid"><div class="detail-box"><b>Pack & price</b><span>'+p.unit+' · '+money(p.price)+'</span></div><div class="detail-box"><b>Shelf life</b><span>'+p.shelf+'</span></div>'+
    '<div class="detail-box"><b>Allergens</b><span>'+p.allergens+'</span></div><div class="detail-box"><b>Stock</b><span>'+p.stock+' units available</span></div></div>'+
    '<div class="product-tags">'+(p.tags||[]).map(function(t){return '<span class="tag-mini">'+t+'</span>';}).join('')+'</div>'+
    '<p>★ '+p.rating.toFixed(1)+' from '+p.reviews+' reviews · Maker fulfilment '+maker.fulfilment+'%</p>'+
    '<div class="modal-actions"><button class="ghost-btn" onclick="closeModal();openStore(\''+maker.id+'\')">Visit store</button><button class="primary-btn" onclick="addToCart(\''+p.id+'\');closeModal()">Add to basket · '+money(p.price)+'</button></div>');
}
function setMarketSort(v){marketSort=v;render();}
function setDeliverySlot(v){deliverySlot=v;render();}
function renderMarketplace(){
  var categories=['All'].concat(Array.from(new Set(state.products.map(function(p){return p.category;}))));
  var list=state.products.filter(function(p){return selectedCategory==='All'||p.category===selectedCategory;});
  if(currentSearch){
    list=list.filter(function(p){
      var m=vendor(p.vendorId);
      return [p.name,p.category,p.allergens,(p.tags||[]).join(' '),m.name,m.category].join(' ').toLowerCase().includes(currentSearch.toLowerCase());
    });
  }
  if(marketSort==='price')list.sort(function(a,b){return a.price-b.price;});
  if(marketSort==='rating')list.sort(function(a,b){return b.rating-a.rating;});
  if(marketSort==='popular')list.sort(function(a,b){return (b.reviews||0)-(a.reviews||0);});
  var slots=['ASAP · 25–45 min','18:00–19:00','19:00–20:00','Tomorrow 10–12'];
  app.innerHTML='<div class="page">'+
    '<section class="hero"><div class="hero-main"><span class="hero-kicker">● '+state.vendors.length+' verified makers · '+state.products.length+' pantry items</span>'+
    '<h1>Homemade pantry food, organized like a real marketplace.</h1><p>Shop across independent home kitchens, schedule delivery, follow each seller order separately, and let one courier route multiple pickups efficiently.</p>'+
    '<div class="hero-actions"><button class="secondary-btn" onclick="scrollToProducts()">Browse '+state.products.length+' items</button><button class="primary-btn" onclick="switchMode(\'vendor\')">Open seller studio</button></div></div>'+
    '<div class="hero-side"><div class="hero-tile"><span class="tile-icon">📦</span><div><strong>Multi-store checkout</strong><p>One basket, separate maker tickets, one delivery experience.</p></div></div>'+
    '<div class="hero-tile dark"><span class="tile-icon">🗺️</span><div><strong>Smart courier routes</strong><p>Batch-ready orders can be sequenced and mapped automatically.</p></div></div></div></section>'+
    '<section class="section"><div class="quick-grid"><div class="quick-card"><span>✓</span><div><strong>Verified maker profiles</strong><small>Store hours, response time, fulfilment and product labels.</small></div></div>'+
    '<div class="quick-card"><span>🧾</span><div><strong>Detailed order tickets</strong><small>Notes, payment, prep time and customer contact.</small></div></div>'+
    '<div class="quick-card"><span>🛵</span><div><strong>Batch delivery</strong><small>Drivers can group compatible pickups and drops.</small></div></div>'+
    '<div class="quick-card"><span>📍</span><div><strong>Mapped coverage</strong><small>Tunis-area demo coordinates with road routing.</small></div></div></div></section>'+
    '<section class="section"><div class="section-head"><div><h2>Delivery window</h2><p>Choose when the basket should arrive.</p></div></div><div class="delivery-strip">'+slots.map(function(s){return '<button class="delivery-slot '+(deliverySlot===s?'is-active':'')+'" onclick="setDeliverySlot(\''+s+'\')"><b>'+s+'</b><small>'+(s.indexOf('ASAP')===0?'Fastest available':'Reserve this window')+'</small></button>';}).join('')+'</div></section>'+
    '<section class="section"><div class="section-head"><div><h2>Shop the pantry</h2><p>Search, filter and compare independent makers.</p></div></div>'+
    '<div class="market-toolbar"><input value="'+currentSearch.replace(/"/g,'&quot;')+'" oninput="currentSearch=this.value;render()" placeholder="Search harissa, granola, vegan, maker…">'+
    '<select onchange="selectedCategory=this.value;render()">'+categories.map(function(c){return '<option '+(selectedCategory===c?'selected':'')+'>'+c+'</option>';}).join('')+'</select>'+
    '<select onchange="setMarketSort(this.value)"><option value="popular" '+(marketSort==='popular'?'selected':'')+'>Most popular</option><option value="rating" '+(marketSort==='rating'?'selected':'')+'>Top rated</option><option value="price" '+(marketSort==='price'?'selected':'')+'>Lowest price</option></select></div>'+
    '<div class="product-grid" id="productGrid">'+(list.length?list.map(productCard).join(''):'<div class="empty-state" style="grid-column:1/-1"><span>⌕</span><h3>No matches</h3><p>Try another search or category.</p></div>')+'</div></section>'+
    '<section class="section"><div class="section-head"><div><h2>Featured home kitchens</h2><p>Operational quality is visible before you order.</p></div><button class="ghost-btn" onclick="navigate(\'stores\')">All '+state.vendors.length+' stores</button></div>'+
    '<div class="store-grid">'+state.vendors.slice(0,6).map(storeCard).join('')+'</div></section>'+
    '<div class="info-banner"><span>ⓘ</span><span><strong>Demo operations:</strong> products, orders, payments and routes are simulated in-browser. Production launch requires a backend, identity/compliance checks and locally valid home-food rules.</span></div></div>';
}
function renderStores(){
  app.innerHTML='<div class="page"><div class="section-head"><div><p class="eyebrow">Multi-vendor marketplace</p><h2>'+state.vendors.length+' independent stores</h2><p>Compare ratings, fulfilment, opening hours, minimums and delivery estimates.</p></div></div><div class="store-grid">'+state.vendors.map(storeCard).join('')+'</div></div>';
}
function renderStore(){
  var v=vendor(selectedStore)||state.vendors[0];
  var list=state.products.filter(function(p){return p.vendorId===v.id;});
  app.innerHTML='<div class="page"><section class="store-hero"><div class="store-avatar">'+v.initials+'</div><div><p class="eyebrow" style="color:#bcd2c4">'+v.license+' home maker</p><h1>'+v.name+'</h1><p>'+v.bio+'</p>'+
    '<div class="store-stats"><span>★ '+v.rating+' ('+v.reviewCount+')</span><span>'+v.area+'</span><span>'+v.eta+'</span><span>'+v.hours+'</span></div></div><button class="primary-btn" onclick="showToast(\'Following '+v.name+'\')">♡ Follow</button></section>'+
    '<div class="quick-grid" style="margin-top:14px"><div class="quick-card"><span>⚡</span><div><strong>'+v.response+' response</strong><small>Typical seller response time.</small></div></div>'+
    '<div class="quick-card"><span>✓</span><div><strong>'+v.fulfilment+'% fulfilment</strong><small>Orders completed successfully.</small></div></div><div class="quick-card"><span>🧺</span><div><strong>'+v.minimum+' DT minimum</strong><small>Minimum store subtotal.</small></div></div>'+
    '<div class="quick-card"><span>📍</span><div><strong>'+v.deliveryRadius+' km coverage</strong><small>Demo service radius.</small></div></div></div>'+
    '<section class="section"><div class="section-head"><div><h2>From this kitchen</h2><p>'+list.length+' active products.</p></div></div><div class="product-grid">'+list.map(productCard).join('')+'</div></section></div>';
}
function timelineHtml(o){
  var labels=['Order placed','Seller preparing','Ready for courier','Out for delivery','Delivered'],stage=orderStage(o.status);
  return '<div class="timeline">'+labels.map(function(x,i){return '<div class="timeline-row '+(i<=stage?'done':'')+'"><span class="timeline-dot"></span><div><b>'+x+'</b><small>'+(i<stage?'Completed':i===stage?'Current stage':'Pending')+'</small></div></div>';}).join('')+'</div>';
}
function renderOrders(){
  var sorted=state.orders.slice().sort(function(a,b){return orderStage(b.status)-orderStage(a.status);});
  app.innerHTML='<div class="page"><div class="section-head"><div><p class="eyebrow">Buyer account</p><h2>Orders & live fulfilment</h2><p>Each maker ticket advances independently before courier consolidation.</p></div></div>'+
    '<div class="order-card-grid">'+sorted.map(function(o){
      var maker=vendor(o.vendorId),stage=orderStage(o.status);
      return '<article class="order-card"><div class="order-card-top"><div><p class="eyebrow">'+o.id+' · '+o.created+'</p><h3>'+maker.emoji+' '+maker.name+'</h3></div><span class="status-pill '+statusClass(o.status)+'">'+statusLabel(o.status)+'</span></div>'+
        '<div class="order-items">'+(o.items||[]).map(function(i){var p=product(i.productId);return '<div class="order-item-line"><span>'+(i.qty||1)+'× '+(p?p.name:'Item')+'</span><b>'+(p?money(p.price*(i.qty||1)):'')+'</b></div>';}).join('')+'</div>'+
        '<div class="order-progress">'+[0,1,2,3,4].map(function(i){return '<span class="progress-step '+(i<=stage?'done':'')+'"></span>';}).join('')+'</div>'+
        '<div class="product-meta"><span>'+o.payment+'</span><span>'+o.address+'</span><span>'+money(o.total)+'</span></div>'+
        '<div class="order-actions"><button class="ghost-btn" onclick="openBuyerOrder(\''+o.id+'\')">Order details</button>'+(o.status==='delivered'?'<button class="primary-btn" onclick="reorder(\''+o.id+'\')">Reorder</button>':'<button class="primary-btn" onclick="showToast(\'Support thread opened\')">Message</button>')+'</div></article>';
    }).join('')+'</div></div>';
}
function openBuyerOrder(id){
  var o=state.orders.find(function(x){return x.id===id;}),m=vendor(o.vendorId);
  openModal('<p class="eyebrow">'+o.id+'</p><h2>'+m.name+' order</h2><p>'+orderItemNames(o)+'</p>'+timelineHtml(o)+
    '<div class="detail-grid"><div class="detail-box"><b>Delivery</b><span>'+o.address+'</span></div><div class="detail-box"><b>Payment</b><span>'+o.payment+'</span></div><div class="detail-box"><b>Customer note</b><span>'+o.notes+'</span></div><div class="detail-box"><b>Total</b><span>'+money(o.total)+'</span></div></div>'+
    '<div class="modal-actions"><button class="ghost-btn" onclick="showToast(\'Support thread opened\')">Contact support</button><button class="primary-btn" onclick="closeModal()">Done</button></div>');
}
function reorder(id){
  var o=state.orders.find(function(x){return x.id===id;});
  (o.items||[]).forEach(function(i){var existing=state.cart.find(function(c){return c.productId===i.productId;});if(existing)existing.qty+=i.qty||1;else state.cart.push({productId:i.productId,qty:i.qty||1});});
  save();updateHeader();showToast('Order added back to basket');openDrawer('cart');
}

function sellerMetrics(){
  var mine=state.orders.filter(function(o){return o.vendorId==='v1';});
  var revenue=mine.filter(function(o){return o.status!=='rejected';}).reduce(function(s,o){return s+o.total;},0);
  return {mine:mine,revenue:revenue,newCount:mine.filter(function(o){return o.status==='new';}).length,ready:mine.filter(function(o){return o.status==='ready';}).length};
}
function renderVendor(){
  var m=sellerMetrics(),products=state.products.filter(function(p){return p.vendorId==='v1';}),content='';
  if(vendorTab==='overview'){
    content='<div class="metric-grid"><div class="metric"><small>Gross sales</small><strong>'+money(m.revenue)+'</strong><div class="trend">↑ 18% vs last week</div></div>'+
      '<div class="metric"><small>New orders</small><strong>'+m.newCount+'</strong><div class="trend">Accept within 10 minutes</div></div><div class="metric"><small>Ready handoffs</small><strong>'+m.ready+'</strong><div class="trend">Courier queue</div></div>'+
      '<div class="metric"><small>Avg. prep</small><strong>22 min</strong><div class="trend">↓ 3 min this week</div></div></div>'+
      '<div class="ops-grid"><div class="panel"><div class="panel-head"><h3>Live order board</h3><button class="mini-btn" onclick="vendorTab=\'orders\';render()">Open full board</button></div>'+sellerKanban(m.mine)+'</div>'+
      '<div><div class="panel"><div class="panel-head"><h3>Attention</h3></div><div class="alert-list"><div class="alert-row"><span>⚠️</span><div><b>'+products.filter(function(p){return p.stock<10;}).length+' low-stock items</b><small>Restock before the evening peak.</small></div></div>'+
      '<div class="alert-row"><span>⏱️</span><div><b>'+m.newCount+' orders need acceptance</b><small>Fast acceptance improves store ranking.</small></div></div><div class="alert-row"><span>🛵</span><div><b>'+m.ready+' bags awaiting courier</b><small>All labels and seals should be ready.</small></div></div></div></div></div></div>';
  }else if(vendorTab==='orders'){
    content='<div class="panel"><div class="panel-head"><div><h3>Order taking & fulfilment</h3><small class="muted">Accept with prep time, reject with reason, inspect notes, then hand off.</small></div></div>'+sellerKanban(m.mine)+'</div>';
  }else if(vendorTab==='products'){
    content='<div class="panel"><div class="panel-head"><div><h3>Catalogue & inventory</h3><small class="muted">Stock, shelf life and listing health.</small></div><button class="primary-btn" onclick="openAddProduct()">+ New product</button></div>'+
      products.map(function(p){return '<div class="catalog-row"><div class="catalog-thumb">'+p.emoji+'</div><div><strong>'+p.name+'</strong><div class="product-meta" style="margin:4px 0 0"><span>'+p.category+'</span><span>'+p.unit+'</span><span>'+p.shelf+'</span><span>'+p.allergens+'</span></div></div><strong>'+money(p.price)+'</strong><div class="hide-mobile"><span class="status-pill '+(p.stock<10?'new':'ready')+'">'+p.stock+' stock</span> <button class="mini-btn" onclick="restock(\''+p.id+'\')">+5</button></div></div>';}).join('')+'</div>';
  }else if(vendorTab==='analytics'){
    content=renderSellerAnalytics(m.mine,products);
  }else{
    content=renderSellerSettings();
  }
  app.innerHTML='<div class="page"><div class="dashboard-shell wide"><aside class="side-panel"><h2>Seller studio</h2><div class="side-nav">'+
    '<button class="'+(vendorTab==='overview'?'is-active':'')+'" onclick="vendorTab=\'overview\';render()">Overview</button>'+
    '<button class="'+(vendorTab==='orders'?'is-active':'')+'" onclick="vendorTab=\'orders\';render()">Orders <span class="count">'+m.newCount+'</span></button>'+
    '<button class="'+(vendorTab==='products'?'is-active':'')+'" onclick="vendorTab=\'products\';render()">Products</button>'+
    '<button class="'+(vendorTab==='analytics'?'is-active':'')+'" onclick="vendorTab=\'analytics\';render()">Analytics</button>'+
    '<button class="'+(vendorTab==='settings'?'is-active':'')+'" onclick="vendorTab=\'settings\';render()">Store settings</button>'+
    '<button onclick="switchMode(\'buyer\');openStore(\'v1\')">View storefront ↗</button></div><div class="side-note">Noura Pantry · '+(state.storeSettings.pauseStore?'store paused':'accepting orders')+'<br>Changes persist in this demo browser.</div></aside>'+
    '<section class="workspace"><div class="workspace-head"><div><p class="eyebrow">Noura Pantry · operations</p><h1>'+({overview:'Today at a glance',orders:'Order board',products:'Catalogue',analytics:'Performance',settings:'Store controls'})[vendorTab]+'</h1><p>Seller tools for taking orders, preparation and handoff.</p></div><button class="primary-btn" onclick="openAddProduct()">+ Add product</button></div>'+content+'</section></div></div>';
}
function sellerKanban(orders){
  var cols=[['new','New'],['preparing','Preparing'],['ready','Ready'],['delivered','Completed']];
  return '<div class="kanban">'+cols.map(function(col){
    var list=orders.filter(function(o){return col[0]==='preparing'?(o.status==='accepted'||o.status==='preparing'):col[0]==='delivered'?(o.status==='delivered'||o.status==='delivering'||o.status==='driver_assigned'):o.status===col[0];});
    return '<section class="kanban-col"><div class="kanban-head"><b>'+col[1]+'</b><span>'+list.length+'</span></div>'+list.map(sellerTicket).join('')+(list.length?'':'<p class="tiny muted">Nothing here.</p>')+'</section>';
  }).join('')+'</div>';
}
function sellerTicket(o){
  return '<article class="order-ticket"><div class="ticket-head"><strong>'+o.id+(o.priority==='high'?' · ⚡':'')+'</strong><span class="ticket-time">'+o.created+'</span></div>'+
    '<div class="ticket-customer"><b>'+o.customer+'</b> · '+o.payment+'</div><div class="ticket-items">'+orderItemNames(o)+'</div>'+
    '<div class="ticket-footer"><strong>'+money(o.total)+'</strong><div class="ticket-actions"><button onclick="openSellerOrder(\''+o.id+'\')">Details</button>'+sellerTicketActions(o)+'</div></div></article>';
}
function sellerTicketActions(o){
  if(o.status==='new')return '<button class="accept-btn" onclick="quickAcceptOrder(\''+o.id+'\',25)">Accept</button>';
  if(o.status==='accepted'||o.status==='preparing')return '<button class="ready-btn" onclick="markOrderReady(\''+o.id+'\')">Ready</button>';
  return '';
}
function openSellerOrder(id){
  var o=state.orders.find(function(x){return x.id===id;});
  var controls='';
  if(o.status==='new'){
    controls='<h3 style="margin-top:18px">Take this order</h3><p>Choose a realistic prep promise.</p><div class="order-actions">'+
      '<button class="primary-btn" onclick="quickAcceptOrder(\''+o.id+'\',15);closeModal()">Accept · 15 min</button>'+
      '<button class="primary-btn" onclick="quickAcceptOrder(\''+o.id+'\',25);closeModal()">Accept · 25 min</button>'+
      '<button class="primary-btn" onclick="quickAcceptOrder(\''+o.id+'\',40);closeModal()">Accept · 40 min</button>'+
      '<button class="ghost-btn" onclick="rejectOrderPrompt(\''+o.id+'\')">Reject order</button></div>';
  }else if(o.status==='accepted'||o.status==='preparing'){
    controls='<div class="modal-actions"><button class="primary-btn" onclick="markOrderReady(\''+o.id+'\');closeModal()">Packed & ready for courier</button></div>';
  }else controls='<div class="modal-actions"><button class="primary-btn" onclick="closeModal()">Done</button></div>';
  openModal('<p class="eyebrow">'+o.id+' · '+o.channel+'</p><h2>'+o.customer+'</h2><p>'+orderItemNames(o)+'</p><div class="detail-grid">'+
    '<div class="detail-box"><b>Payment</b><span>'+o.payment+'</span></div><div class="detail-box"><b>Customer phone</b><span>'+o.phone+'</span></div>'+
    '<div class="detail-box"><b>Delivery</b><span>'+o.address+'</span></div><div class="detail-box"><b>Note</b><span>'+o.notes+'</span></div></div>'+controls);
}
function quickAcceptOrder(id,mins){var o=state.orders.find(function(x){return x.id===id;});if(!o)return;o.status='preparing';o.prepMinutes=mins;o.acceptedAt='Just now';save();showToast(o.id+' accepted · '+mins+' min prep');render();}
function markOrderReady(id){var o=state.orders.find(function(x){return x.id===id;});if(!o)return;o.status='ready';save();showToast(o.id+' is ready for courier');render();}
function rejectOrderPrompt(id){
  openModal('<p class="eyebrow">'+id+'</p><h2>Reject order?</h2><p>Select a reason. In production this would notify the buyer and trigger refund logic.</p>'+
    '<div class="field"><label>Reason</label><select id="rejectReason"><option>Item unavailable</option><option>Kitchen capacity reached</option><option>Outside operating hours</option><option>Unable to meet requested window</option></select></div>'+
    '<div class="modal-actions"><button class="ghost-btn" onclick="closeModal()">Cancel</button><button class="primary-btn" onclick="rejectOrder(\''+id+'\')">Confirm rejection</button></div>');
}
function rejectOrder(id){var o=state.orders.find(function(x){return x.id===id;});o.status='rejected';o.rejectReason=document.getElementById('rejectReason').value;save();closeModal();showToast(id+' rejected');render();}
function renderSellerAnalytics(orders,products){
  var vals=[42,58,50,72,66,88,81],top=products.slice().sort(function(a,b){return b.reviews-a.reviews;}).slice(0,4);
  return '<div class="analytics-grid"><div class="chart-card"><div class="panel-head"><div><h3>7-day sales</h3><small class="muted">Gross order value</small></div><strong>+18%</strong></div>'+
    '<div class="bars">'+vals.map(function(v,i){return '<div class="bar-wrap"><div class="bar" style="height:'+v+'%"></div><small>'+['M','T','W','T','F','S','S'][i]+'</small></div>';}).join('')+'</div></div>'+
    '<div class="chart-card"><h3>Top products</h3><div class="breakdown">'+top.map(function(p,i){var val=95-i*17;return '<div class="break-row"><span>'+p.emoji+' '+p.name+'</span><b>'+p.reviews+'</b><div class="break-track"><div class="break-fill" style="width:'+val+'%"></div></div></div>';}).join('')+'</div></div></div>'+
    '<div class="metric-grid" style="margin-top:14px"><div class="metric"><small>Acceptance</small><strong>97%</strong><div class="trend">Target ≥95%</div></div><div class="metric"><small>On-time ready</small><strong>94%</strong><div class="trend">+3 pts</div></div>'+
    '<div class="metric"><small>Repeat buyers</small><strong>41%</strong><div class="trend">Strong retention</div></div><div class="metric"><small>Avg basket</small><strong>34 DT</strong><div class="trend">+2.5 DT</div></div></div>';
}
function toggleStoreSetting(key){state.storeSettings[key]=!state.storeSettings[key];save();render();}
function renderSellerSettings(){
  var s=state.storeSettings;
  return '<div class="settings-grid"><div class="setting-card"><h4>Pause storefront</h4><p>Temporarily stop taking new marketplace orders without hiding your store.</p><div class="setting-row"><b>'+(s.pauseStore?'Paused':'Open')+'</b><button class="toggle '+(s.pauseStore?'on':'')+'" onclick="toggleStoreSetting(\'pauseStore\')"></button></div></div>'+
    '<div class="setting-card"><h4>Auto-accept</h4><p>Automatically accept eligible orders using your standard preparation promise.</p><div class="setting-row"><b>'+(s.autoAccept?'Enabled':'Manual')+'</b><button class="toggle '+(s.autoAccept?'on':'')+'" onclick="toggleStoreSetting(\'autoAccept\')"></button></div></div>'+
    '<div class="setting-card"><h4>Low-stock alerts</h4><p>Highlight listings below 10 units and surface replenishment reminders.</p><div class="setting-row"><b>'+(s.lowStockAlerts?'On':'Off')+'</b><button class="toggle '+(s.lowStockAlerts?'on':'')+'" onclick="toggleStoreSetting(\'lowStockAlerts\')"></button></div></div>'+
    '<div class="setting-card"><h4>Courier handoff</h4><p>Show packed orders immediately in the courier marketplace when marked ready.</p><div class="setting-row"><b>'+(s.deliveryHandoff?'Automatic':'Manual')+'</b><button class="toggle '+(s.deliveryHandoff?'on':'')+'" onclick="toggleStoreSetting(\'deliveryHandoff\')"></button></div></div></div>'+
    '<div class="panel"><div class="panel-head"><h3>Store profile</h3></div><div class="detail-grid"><div class="detail-box"><b>Opening hours</b><span>08:00–18:00</span></div><div class="detail-box"><b>Delivery radius</b><span>10 km</span></div><div class="detail-box"><b>Minimum order</b><span>15 DT</span></div><div class="detail-box"><b>Marketplace commission</b><span>12%</span></div></div></div>';
}

function haversine(a,b){
  var R=6371,dLat=(b.lat-a.lat)*Math.PI/180,dLng=(b.lng-a.lng)*Math.PI/180;
  var q=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)*Math.sin(dLng/2);
  return R*2*Math.atan2(Math.sqrt(q),Math.sqrt(1-q));
}
function readyOrders(){return state.orders.filter(function(o){return o.status==='ready'&&o.lat&&o.lng;});}
function driverPay(o){
  var m=vendor(o.vendorId),km=haversine({lat:m.lat,lng:m.lng},{lat:o.lat,lng:o.lng});
  return Math.round((4.5+km*.72+(o.priority==='high'?1.5:0))*10)/10;
}
function toggleDriverJob(id){
  if(selectedDriverJobs.includes(id))selectedDriverJobs=selectedDriverJobs.filter(function(x){return x!==id;});else selectedDriverJobs.push(id);
  renderDriver();
}
function setDriverFilter(v){driverFilter=v;renderDriver();}
function driverJobPro(o){
  var m=vendor(o.vendorId),pay=driverPay(o),km=haversine({lat:m.lat,lng:m.lng},{lat:o.lat,lng:o.lng}),sel=selectedDriverJobs.includes(o.id);
  return '<article class="delivery-job '+(sel?'selected':'')+'"><div class="delivery-job-head"><div><p class="eyebrow">'+o.id+(o.priority==='high'?' · priority':'')+'</p><h4>'+m.name+' → '+o.customer+'</h4></div><span class="pay-chip">'+money(pay)+'</span></div>'+
    '<div class="job-facts"><span>'+km.toFixed(1)+' km direct</span><span>'+orderItemCount(o)+' bag items</span><span>'+o.payment+'</span><span>'+o.prepMinutes+' min prep</span></div>'+
    '<div class="job-route-mini"><div>● <b>'+m.area+'</b> · pickup at '+m.name+'</div><div>● <b>'+o.address+'</b> · '+o.notes+'</div></div>'+
    '<div class="job-bottom"><button class="ghost-btn" onclick="previewSingleRoute(\''+o.id+'\')">Map</button><button class="'+(sel?'primary-btn':'ghost-btn')+'" onclick="toggleDriverJob(\''+o.id+'\')">'+(sel?'Selected ✓':'Select')+'</button><button class="primary-btn" onclick="acceptDriverJobs([\''+o.id+'\'])">Take order</button></div></article>';
}
function buildStops(ids){
  var stops=[];
  ids.forEach(function(id){
    var o=state.orders.find(function(x){return x.id===id;}),m=o&&vendor(o.vendorId);
    if(!o||!m)return;
    stops.push({key:id+'-p',orderId:id,type:'pickup',lat:m.lat,lng:m.lng,title:m.name,sub:m.area});
    stops.push({key:id+'-d',orderId:id,type:'drop',lat:o.lat,lng:o.lng,title:o.customer,sub:o.address});
  });
  return stops;
}
function optimizeStops(stops){
  var start={lat:36.8490,lng:10.1840},remaining=stops.slice(),picked={},ordered=[],cur=start;
  while(remaining.length){
    var valid=remaining.filter(function(s){return s.type==='pickup'||picked[s.orderId];});
    var best=valid[0],bestD=Infinity;
    valid.forEach(function(s){var d=haversine(cur,s);if(d<bestD){best=s;bestD=d;}});
    ordered.push(best);cur=best;if(best.type==='pickup')picked[best.orderId]=true;
    remaining.splice(remaining.indexOf(best),1);
  }
  return ordered;
}
function acceptDriverJobs(ids){
  if(state.activeRoute&&state.activeRoute.length){showToast('Finish the active route first');return;}
  state.activeRoute=ids.slice();state.routeStops=optimizeStops(buildStops(ids));state.routeProgress=0;
  ids.forEach(function(id){var o=state.orders.find(function(x){return x.id===id;});if(o)o.status='driver_assigned';});
  selectedDriverJobs=[];save();showToast(ids.length+' order'+(ids.length>1?'s':'')+' added to route');renderDriver();
}
function acceptSelectedJobs(){if(!selectedDriverJobs.length){showToast('Select at least one order');return;}acceptDriverJobs(selectedDriverJobs);}
function previewSelectedRoute(){
  var ids=selectedDriverJobs.length?selectedDriverJobs:readyOrders().slice(0,3).map(function(o){return o.id;});
  if(!ids.length){showToast('No ready orders to route');return;}
  drawRouteOnMap(optimizeStops(buildStops(ids)),false);
}
function previewSingleRoute(id){drawRouteOnMap(optimizeStops(buildStops([id])),false);}
function activeStopsRemaining(){return (state.routeStops||[]).slice(state.routeProgress||0);}
function confirmNextStop(){
  var stops=state.routeStops||[],idx=state.routeProgress||0;if(idx>=stops.length)return;
  var s=stops[idx],o=state.orders.find(function(x){return x.id===s.orderId;});
  if(s.type==='pickup'){o.status='delivering';showToast('Pickup confirmed · '+s.title);}else{o.status='delivered';showToast('Delivered to '+s.title);}
  state.routeProgress=idx+1;
  if(state.routeProgress>=stops.length){state.activeRoute=[];state.routeStops=[];state.routeProgress=0;showToast('Route completed · great work');}
  save();renderDriver();
}
function routeStopsHtml(stops){
  return '<div class="stop-list">'+stops.map(function(s,i){return '<div class="stop-card '+(s.type==='drop'?'drop':'')+'"><span class="stop-index">'+(i+1)+'</span><div><b>'+(s.type==='pickup'?'Pickup · ':'Drop · ')+s.title+'</b><small>'+s.sub+'</small></div><span>'+s.orderId+'</span></div>';}).join('')+'</div>';
}
function renderDriver(){
  let jobs=readyOrders().filter(function(o){return !(state.activeRoute||[]).includes(o.id);});
  if(driverFilter==='pay')jobs.sort(function(a,b){return driverPay(b)-driverPay(a);});
  if(driverFilter==='near')jobs.sort(function(a,b){return haversine({lat:36.849,lng:10.184},vendor(a.vendorId))-haversine({lat:36.849,lng:10.184},vendor(b.vendorId));});
  if(driverFilter==='best')jobs.sort(function(a,b){return (driverPay(b)/Math.max(1,haversine(vendor(b.vendorId),b)))-(driverPay(a)/Math.max(1,haversine(vendor(a.vendorId),a)));});

  const active=(state.activeRoute||[]).length>0;
  const remaining=activeStopsRemaining();
  const selectedPay=selectedDriverJobs.reduce(function(s,id){
    const o=state.orders.find(function(x){return x.id===id;});
    return s+(o?driverPay(o):0);
  },0);

  let side='';
  if(active){
    const next=remaining[0];
    side='<section class="driver-card">'+
      '<p class="eyebrow">Active batch · '+state.activeRoute.length+' orders</p>'+
      '<h3>Next stop</h3>'+
      (next?'<p><b>'+(next.type==='pickup'?'Pickup':'Drop-off')+' · '+next.title+'</b><br><span class="muted tiny">'+next.sub+'</span></p>':'')+
      '<button class="primary-btn" style="width:100%" onclick="confirmNextStop()">Confirm '+(next&&next.type==='pickup'?'pickup':'delivery')+'</button>'+
      routeStopsHtml(remaining)+
      '</section>';
  }else{
    side='<section class="driver-card">'+
      '<p class="eyebrow">Available work</p>'+
      '<h3>Choose delivery jobs</h3>'+
      '<div class="job-filter">'+
        '<button class="'+(driverFilter==='best'?'is-active':'')+'" onclick="setDriverFilter(\'best\')">Best value</button>'+
        '<button class="'+(driverFilter==='near'?'is-active':'')+'" onclick="setDriverFilter(\'near\')">Nearest pickup</button>'+
        '<button class="'+(driverFilter==='pay'?'is-active':'')+'" onclick="setDriverFilter(\'pay\')">Highest pay</button>'+
      '</div>'+
      (jobs.length?jobs.map(driverJobPro).join(''):'<div class="empty-state"><span>✓</span><h3>No ready jobs</h3><p>New courier jobs appear as sellers mark orders ready.</p></div>')+
      '</section>';
  }

  side+='<section class="driver-card">'+
    '<h3>Driver tools</h3>'+
    '<div class="detail-grid">'+
      '<button class="ghost-btn" onclick="showToast(\'Support chat opened\')">Support</button>'+
      '<button class="ghost-btn" onclick="showToast(\'Safety center opened\')">Safety</button>'+
      '<button class="ghost-btn" onclick="showToast(\'Earnings detail opened\')">Earnings</button>'+
      '<button class="ghost-btn" onclick="showToast(\'Availability updated\')">Availability</button>'+
    '</div>'+
  '</section>';

  const batchBar=(!active&&selectedDriverJobs.length)?
    '<div class="batch-bar">'+
      '<div><b>'+selectedDriverJobs.length+' selected · '+money(selectedPay)+'</b><small>Build one pickup/drop route</small></div>'+
      '<button class="ghost-btn" style="color:white;border-color:#ffffff40" onclick="selectedDriverJobs=[];renderDriver()">Clear</button>'+
      '<button class="primary-btn" onclick="previewSelectedRoute()">Optimize route</button>'+
      '<button class="primary-btn" onclick="acceptSelectedJobs()">Accept batch</button>'+
    '</div>':'';

  app.innerHTML=
    '<div class="page driver-page pro">'+
      '<div class="driver-top">'+
        '<div><p class="eyebrow">PantryMade Courier · Tunis zone</p>'+
        '<h1>'+(active?'Active optimized route':'Delivery marketplace')+'</h1>'+
        '<p class="muted">'+(active?'Complete stops in sequence with pickup-before-drop constraints.':'Select one order or build a multi-order batch.')+'</p></div>'+
        '<span class="online-toggle">● Online · scooter</span>'+
      '</div>'+
      '<div class="driver-stats">'+
        '<div class="driver-stat"><strong>38.5 DT</strong><small>Today’s earnings</small></div>'+
        '<div class="driver-stat"><strong>'+jobs.length+'</strong><small>Ready jobs</small></div>'+
        '<div class="driver-stat"><strong>4.96 ★</strong><small>Driver rating</small></div>'+
      '</div>'+
      '<div class="driver-layout">'+
        '<section class="map-shell">'+
          '<div class="map-toolbar">'+
            '<button class="map-pill accent" onclick="previewSelectedRoute()">Optimize preview</button>'+
            '<span class="map-pill">Road routing · OSRM</span>'+
            '<span class="map-pill">Tunis demo zone</span>'+
          '</div>'+
          '<div id="courierMap" class="real-map"></div>'+
          '<div class="route-summary">'+
            '<div><strong id="routeKm">—</strong><small>route distance</small></div>'+
            '<div><strong id="routeMin">—</strong><small>estimated drive</small></div>'+
            '<div><strong>'+(active?remaining.length:selectedDriverJobs.length*2)+'</strong><small>remaining stops</small></div>'+
          '</div>'+
        '</section>'+
        '<aside class="driver-side">'+side+'</aside>'+
      '</div>'+
      batchBar+
    '</div>';
  setTimeout(initDriverMap,0);
}
function initDriverMap(){
  const el=document.getElementById('courierMap');if(!el||typeof L==='undefined')return;
  if(routeMap){try{routeMap.remove();}catch(e){}routeMap=null;}
  routeMap=L.map('courierMap',{zoomControl:false}).setView([36.849,10.205],11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(routeMap);
  L.control.zoom({position:'bottomright'}).addTo(routeMap);
  const courier=L.circleMarker([36.849,10.184],{radius:9,color:'#fff',weight:3,fillColor:'#214d3a',fillOpacity:1}).addTo(routeMap);
  courier.bindPopup('<div class="map-order-popup"><b>You</b>Courier starting point</div>');
  readyOrders().forEach(function(o){const m=vendor(o.vendorId);L.circleMarker([m.lat,m.lng],{radius:7,color:'#fff',weight:2,fillColor:'#214d3a',fillOpacity:1}).addTo(routeMap).bindPopup('<div class="map-order-popup"><b>Pickup · '+m.name+'</b>'+o.id+'</div>');L.circleMarker([o.lat,o.lng],{radius:7,color:'#fff',weight:2,fillColor:'#e97e45',fillOpacity:1}).addTo(routeMap).bindPopup('<div class="map-order-popup"><b>Drop · '+o.customer+'</b>'+o.address+'</div>');});
  const stops=(state.activeRoute||[]).length?activeStopsRemaining():(selectedDriverJobs.length?optimizeStops(buildStops(selectedDriverJobs)):[]);
  if(stops.length)drawRouteOnMap(stops,true);
}
async function drawRouteOnMap(stops,keepView){
  if(!routeMap||!stops.length)return;
  if(routeLayer){try{routeMap.removeLayer(routeLayer);}catch(e){}}
  routeMarkers.forEach(function(x){try{routeMap.removeLayer(x);}catch(e){}});routeMarkers=[];
  const pts=[{lat:36.849,lng:10.184}].concat(stops);
  stops.forEach(function(s,i){const marker=L.marker([s.lat,s.lng]).addTo(routeMap).bindPopup('<div class="map-order-popup"><b>'+(i+1)+'. '+(s.type==='pickup'?'Pickup':'Drop')+'</b>'+s.title+'<br>'+s.sub+'</div>');routeMarkers.push(marker);});
  const coords=pts.map(function(p){return p.lng+','+p.lat;}).join(';');
  try{
    const res=await fetch('https://router.project-osrm.org/route/v1/driving/'+coords+'?overview=full&geometries=geojson');
    const data=await res.json();
    if(data.code==='Ok'&&data.routes&&data.routes[0]){
      const route=data.routes[0];routeLayer=L.geoJSON(route.geometry,{style:{color:'#214d3a',weight:5,opacity:.82}}).addTo(routeMap);
      routeMetrics.km=route.distance/1000;routeMetrics.min=route.duration/60;
    }else throw new Error('No route');
  }catch(e){
    routeLayer=L.polyline(pts.map(function(p){return [p.lat,p.lng];}),{color:'#214d3a',weight:4,dashArray:'8 8'}).addTo(routeMap);
    routeMetrics.km=0;for(let i=1;i<pts.length;i++)routeMetrics.km+=haversine(pts[i-1],pts[i]);routeMetrics.min=routeMetrics.km/28*60;
  }
  const kmEl=document.getElementById('routeKm'),minEl=document.getElementById('routeMin');
  if(kmEl)kmEl.textContent=routeMetrics.km.toFixed(1)+' km';if(minEl)minEl.textContent=Math.round(routeMetrics.min)+' min';
  try{routeMap.fitBounds(routeLayer.getBounds(),{padding:[35,35]});}catch(e){}
}

function renderAdmin(){
  const active=state.orders.filter(function(o){return !['delivered','rejected'].includes(o.status);});
  const gmv=state.orders.reduce(function(s,o){return s+(o.status==='rejected'?0:o.total);},0);
  const ready=state.orders.filter(function(o){return o.status==='ready';}).length;
  const incidents=[{t:'Late handoff',d:'PM-1045 has been ready for 18 minutes.',risk:'med'},{t:'Low inventory',d:'Fig & Rose Preserve has 5 units remaining.',risk:'low'},{t:'Priority delivery',d:'PM-1049 requested priority handling.',risk:'med'}];
  app.innerHTML='<div class="page admin-page"><section class="admin-hero"><div><p class="eyebrow" style="color:#9db1a5">Marketplace operations</p><h1>PantryMade control room</h1><p>Monitor marketplace health, vendors, fulfilment and delivery load.</p></div><span class="online-toggle">● Systems healthy</span></section><div class="metric-grid" style="margin-top:15px"><div class="metric"><small>Demo GMV</small><strong>'+money(gmv)+'</strong><div class="trend">Across '+state.orders.length+' orders</div></div><div class="metric"><small>Active orders</small><strong>'+active.length+'</strong><div class="trend">'+ready+' waiting for courier</div></div><div class="metric"><small>Verified vendors</small><strong>'+state.vendors.length+'</strong><div class="trend">100% demo verification</div></div><div class="metric"><small>Delivery SLA</small><strong>92%</strong><div class="trend">Within target window</div></div></div><div class="admin-grid"><section class="panel"><div class="panel-head"><div><h3>Vendor network</h3><small class="muted">Quality, fulfilment and marketplace commission.</small></div></div><div class="admin-list">'+state.vendors.map(function(v){return '<div class="vendor-review"><div class="avatar">'+v.initials+'</div><div><b>'+v.name+'</b><div class="product-meta" style="margin:4px 0 0"><span>'+v.area+'</span><span>★ '+v.rating+'</span><span>'+v.fulfilment+'% fulfil</span><span>'+v.commission+'% fee</span></div></div><span class="risk-chip risk-low">Verified</span></div>';}).join('')+'</div></section><aside><section class="panel"><div class="panel-head"><h3>Operations alerts</h3></div>'+incidents.map(function(x){return '<div class="incident"><b>'+x.t+'</b><small>'+x.d+'</small></div>';}).join('')+'</section><section class="panel"><div class="panel-head"><h3>Order state</h3></div><div class="breakdown">'+['new','preparing','ready','driver_assigned','delivering','delivered'].map(function(s){const n=state.orders.filter(function(o){return o.status===s;}).length,pct=Math.min(100,n/Math.max(1,state.orders.length)*100);return '<div class="break-row"><span>'+statusLabel(s)+'</span><b>'+n+'</b><div class="break-track"><div class="break-fill" style="width:'+pct+'%"></div></div></div>';}).join('')+'</div></section></aside></div></div>';
}
function switchMode(mode){
  currentMode=mode;closeDrawers();
  if(mode==='buyer')currentView='marketplace';
  render();window.scrollTo({top:0,behavior:'smooth'});
}
function render(){
  updateHeader();
  if(currentMode==='vendor')renderVendor();
  else if(currentMode==='driver')renderDriver();
  else if(currentMode==='admin')renderAdmin();
  else if(currentView==='stores')renderStores();
  else if(currentView==='orders')renderOrders();
  else if(currentView==='store')renderStore();
  else renderMarketplace();
  updateHeader();
}
upgradeData();

render();
