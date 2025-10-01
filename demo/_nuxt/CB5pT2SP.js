import{H as y,aQ as v,j as x,K as g,v as r,Q as h,x as d,ao as V,an as w,T as k,O as a,U as c,af as $,$ as B,aq as M,a7 as q,y as A,A as n,z as C,B as f,a6 as S,aR as K,S as j,aY as I}from"#entry";const N=["data-disabled","data-read-only","aria-label","tabindex"],z=["data-border","tabindex","onKeydown"],D={class:"multivalues--label truncate"},L=Object.assign({name:"LibMultiValues",inheritAttrs:!1},{__name:"WMultiValues",props:y({label:{type:String,required:!1},disabled:{type:Boolean,required:!1,default:!1},readonly:{type:Boolean,required:!1,default:!1},border:{type:Boolean,required:!1,default:!0},unstyle:{type:Boolean,required:!1,default:!1}},{modelValue:{type:Array,default:()=>[]},modelModifiers:{}}),emits:["update:modelValue"],setup(e){const s=v(["item"]),o=e,i=x(()=>!o.disabled&&!o.readonly),l=g(e,"modelValue",{type:Array,default:()=>[]}),b=u=>{i.value&&I(l.value,u)};return(u,E)=>l.value&&l.value?.length>0?(d(),r("div",k({key:0,class:a(c)(`
		multivalues
		group
		flex
		flex-initial
		items-center
		justify-center
		gap-1
		overflow-x-scroll
		scrollbar-hidden
	`,a(s).attrs?.class),"data-disabled":e.disabled,"data-read-only":e.readonly,"aria-label":`Values for ${e.label}`,tabindex:e.disabled?-1:0},{...a(s).attrs,class:void 0}),[(d(!0),r(V,null,w(l.value,t=>(d(),r("div",{"data-border":e.border,class:B(a(c)(`
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
			`,a(s).itemAttrs?.class)),tabindex:i.value?0:void 0,key:t,onKeydown:$(M(m=>a(q)(t.toString()),["ctrl","prevent"]),["c"])},[A("span",D,C(t),1),n(j,{class:"multivalues--remove-button !p-0 text-sm !leading-none","aria-label":`Remove ${t}`,border:!1,disabled:e.disabled||e.readonly,onClick:m=>b(t)},{default:f(()=>[n(S,null,{default:f(()=>[n(a(K))]),_:1})]),_:1},8,["aria-label","disabled","onClick"])],42,z))),128))],16,N)):h("",!0)}});export{L as default};
