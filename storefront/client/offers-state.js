/** Shared promotion eligibility: no invented discounts or unavailable products. */
function activePromotion(store,now=Date.now()){
 const p=store.promotion;
 if(!p?.enabled||p.startsAt&&now<Date.parse(p.startsAt)||p.endsAt&&now>=Date.parse(p.endsAt))return null;
 const items=store.products.filter(item=>item.stock!==0&&typeof item.discountPrice==='number'&&item.discountPrice>=0&&item.discountPrice<item.price&&(!p.categories.length||p.categories.includes(item.category)));
 if(!items.length)return null;
 const percent=Math.max(...items.map(item=>Math.floor((1-item.discountPrice/item.price)*100+1e-7)));
 return {settings:p,items,percent,categories:[...new Set(items.map(item=>item.category))]};
}
