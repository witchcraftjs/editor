import{a6 as y,p as v,a7 as x,c as s,E as g,F as p,G as h,D as w,q as a,o as d,K as V,Z as k,L as $,a as B,b as o,t as M,w as m}from"./ChiTXbtN.js";import{r as q}from"./DOfhXivz.js";import{I as A}from"./B6qcY32u.js";import{u as C}from"./CxzPWhlJ.js";import{c as I}from"./CD0Jx8XC.js";import{a as c}from"./9cslYIr4.js";import K from"./66w8nu5J.js";import S from"./Du8JU2h8.js";import"./B39yYSFt.js";import"./BhoX2VZY.js";import"./DB0SWIft.js";import"./CRo8hmbH.js";const D=["data-disabled","data-read-only","aria-label","tabindex"],E=["data-border","tabindex","onKeydown"],F={class:"multivalues--label truncate"},Q=Object.assign({name:"LibMultiValues",inheritAttrs:!1},{__name:"WMultiValues",props:y({label:{type:String,required:!1},disabled:{type:Boolean,required:!1,default:!1},readonly:{type:Boolean,required:!1,default:!1},border:{type:Boolean,required:!1,default:!0},unstyle:{type:Boolean,required:!1,default:!1}},{modelValue:{type:Array,default:()=>[]},modelModifiers:{}}),emits:["update:modelValue"],setup(e){const r=C(["item"]),i=e,n=v(()=>!i.disabled&&!i.readonly),l=x(e,"modelValue",{type:Array,default:()=>[]}),f=u=>{n.value&&q(l.value,u)};return(u,L)=>l.value&&l.value?.length>0?(d(),s("div",w({key:0,class:a(c)(`
		multivalues
		group
		flex
		flex-initial
		items-center
		justify-center
		gap-1
		overflow-x-scroll
		scrollbar-hidden
	`,a(r).attrs?.class),"data-disabled":e.disabled,"data-read-only":e.readonly,"aria-label":`Values for ${e.label}`,tabindex:e.disabled?-1:0},{...a(r).attrs,class:void 0}),[(d(!0),s(p,null,h(l.value,t=>(d(),s("div",{"data-border":e.border,class:k(a(c)(`
				multivalues--item
				flex-basis-0
				min-w-2
				flex
				max-w-fit
				flex-1
				items-center
				gap-0.5
				overflow-hidden
				px-1
				text-xs
				leading-none`,!(e.disabled||e.readonly)&&`
				group-focus:text-accent-500
				focus:text-accent-500`,e.border&&`
				rounded-sm
				border-neutral-400
				border
				focus:border-accent-400
			`,e.border&&(e.disabled||e.readonly)&&`
				border-neutral-200
				focus:border-neutral-200
				dark:border-neutral-800
				dark:focus:border-neutral-800
			`,a(r).itemAttrs?.class)),tabindex:n.value?0:void 0,key:t,onKeydown:V($(b=>a(I)(t.toString()),["ctrl","prevent"]),["c"])},[B("span",F,M(t),1),o(S,{class:"multivalues--remove-button !p-0 text-sm !leading-none","aria-label":`Remove ${t}`,border:!1,disabled:e.disabled||e.readonly,onClick:b=>f(t)},{default:m(()=>[o(K,null,{default:m(()=>[o(a(A))]),_:1})]),_:1},8,["aria-label","disabled","onClick"])],42,E))),128))],16,D)):g("",!0)}});export{Q as default};
