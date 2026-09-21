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
function renderDriver(){
  let jobs=readyOrders().filter(function(o){return !(state.activeRoute||[]).includes(o.id);});
  if(driverFilter==='pay')jobs.sort(function(a,b){return driverPay(b)-driverPay(a);});
  if(driverFilter==='near')jobs.sort(function(a,b){return haversine({lat:36.849,lng:10.184},vendor(a.vendorId))-haversine({lat:36.849,lng:10.184},vendor(b.vendorId));});
  if(driverFilter==='best')jobs.sort(function(a,b){return (driverPay(b)/Math.max(1,haversine(vendor(b.vendorId),b)))-(driverPay(a)/Math.max(1,haversine(vendor(a.vendorId),a));});

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
