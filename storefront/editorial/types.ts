export interface Product {id:number;name:string;category:string;price:number;discountPrice?:number|null;featured?:boolean;showReviews?:boolean;rating?:number;reviewCount?:number;soldCount?:number;stock?:number|null;image:string;images?:string[];description:string;colors:string[];badge:string;type:string}
export interface StoreData {brand:string;currency:string;products:Product[];texts:Record<string,string>}
declare global {interface Window {STORE_DATA:StoreData;formViewProduct?:(id:number)=>void}}
