const seed={
 vendors:[
  {id:'v1',name:'Noura Pantry',initial:'N',emoji:'🫙',rating:4.9,orders:328,city:'Ariana',story:'Small-batch pantry goods inspired by family recipes.',verified:true,categories:['Jams','Spreads','Pickles']},
  {id:'v2',name:'Leila Bakes Dry',initial:'L',emoji:'🥨',rating:4.8,orders:211,city:'Tunis',story:'Crisp rusks, crackers and shelf-stable treats baked weekly.',verified:true,categories:['Biscuits','Crackers']},
  {id:'v3',name:'Dar El Harissa',initial:'D',emoji:'🌶️',rating:4.9,orders:492,city:'La Marsa',story:'Traditional preserved flavors with transparent ingredients.',verified:true,categories:['Spices','Preserves']},
  {id:'v4',name:'Olive & Seed',initial:'O',emoji:'🫒',rating:4.7,orders:146,city:'Manouba',story:'Roasted seeds, flavored oils and pantry snacks.',verified:true,categories:['Snacks','Oils']}
 ],
 products:[
  {id:'p1',vendor:'v1',name:'Fig & walnut preserve',emoji:'🍯',category:'Jams',price:18.5,rating:4.9,reviews:76,shelf:'4 months',stock:14,allergens:'Walnut'},
  {id:'p2',vendor:'v3',name:'Smoked harissa jar',emoji:'🌶️',category:'Spices',price:14,rating:4.9,reviews:122,shelf:'6 months',stock:22,allergens:'None declared'},
  {id:'p3',vendor:'v2',name:'Orange blossom rusks',emoji:'🥨',category:'Biscuits',price:12.5,rating:4.8,reviews:51,shelf:'5 weeks',stock:19,allergens:'Gluten, sesame'},
  {id:'p4',vendor:'v4',name:'Za’atar roasted almonds',emoji:'🥜',category:'Snacks',price:16,rating:4.7,reviews:43,shelf:'8 weeks',stock:9,allergens:'Almond'},
  {id:'p5',vendor:'v1',name:'Lemon peel marmalade',emoji:'🍋',category:'Jams',price:15,rating:4.8,reviews:32,shelf:'4 months',stock:12,allergens:'None declared'},
  {id:'p6',vendor:'v3',name:'Dried herb blend',emoji:'🌿',category:'Spices',price:9.5,rating:4.9,reviews:64,shelf:'8 months',stock:30,allergens:'None declared'},
  {id:'p7',vendor:'v2',name:'Sesame date crisps',emoji:'🍪',category:'Biscuits',price:13.5,rating:4.7,reviews:28,shelf:'6 weeks',stock:16,allergens:'Sesame, gluten'},
  {id:'p8',vendor:'v4',name:'Rosemary olive oil',emoji:'🫒',category:'Oils',price:24,rating:4.8,reviews:39,shelf:'6 months',stock:7,allergens:'None declared'}
 ],
 orders:[
  {id:'PM-1048',items:['p1','p5'],total:39.5,status:'new',customer:'Meriem K.',address:'Ennasr 2, Ariana',time:'12:40'},
  {id:'PM-1047',items:['p1'],total:22.5,status:'ready',customer:'Youssef A.',address:'Menzah 6, Tunis',time:'11:25'},
  {id:'PM-1044',items:['p5','p1'],total:41,status:'delivering',customer:'Ines R.',address:'Lac 2, Tunis',time:'10:10'}
 ],
 jobs:[
  {id:'D-18',vendor:'Noura Pantry',pickup:'Ennasr 2',drop:'Menzah 6',km:4.8,pay:8.5,eta:'24 min'},
  {id:'D-21',vendor:'Dar El Harissa',pickup:'La Marsa',drop:'Lac 2',km:7.2,pay:11.2,eta:'31 min'},
  {id:'D-25',vendor:'Leila Bakes Dry',pickup:'Tunis Centre',drop:'Bardo',km:5.9,pay:9.4,eta:'28 min'}
 ]
};
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch{return d}};
const db={vendors:load('pm-vendors',seed.vendors),products:load('pm-products',seed.products),orders:load('pm-orders',seed.orders),jobs:load('pm-jobs',seed.jobs),cart:load('pm-cart',[]),myOrders:load('pm-myorders',[])};
const state={view:'marketplace',mode:'buyer',category:'All',query:'',vendorId:null,vendorTab:'overview',activeJob:null};
const app=document.getElementById('app');
const money=n=>Number(n).toFixed(2).replace('.00','')+' TND';
const vendorById=id=>db.vendors.find(v=>v.id===id);
const productById=id=>db.products.find(p=>p.id===id);
const save=()=>Object.entries({vendors:db.vendors,products:db.products,orders:db.orders,jobs:db.jobs,cart:db.cart,myorders:db.myOrders}).forEach(([k,v])=>localStorage.setItem('pm-'+k,JSON.stringify(v)));
function toast(msg){const el=document.getElementById('toast');el.textContent=msg;el.classList.add('show');clearTimeout(window.__t);window.__t=setTimeout(()=>el.classList.remove('show'),2200)}
function setNav(view){document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('is-active',b.dataset.nav===view))}
function updateCartCount(){document.getElementById('cartCount').textContent=db.cart.reduce((a,i)=>a+i.qty,0)}
