import{H as y,j as v,J as x,v as s,O as g,x as d,ah as h,ag as V,P as w,N as a,Q as c,a8 as k,V as B,aj as $,y as M,A as o,z as A,B as m,a0 as p,aF as q,aJ as C}from"./Cql2C_go.js";import{u as j}from"./Cv7Eaxfl.js";import{c as N}from"./CD0Jx8XC.js";import S from"./sdUFAksv.js";import"./2QWzZFR8.js";import"./DMGTKRWK.js";const F=["data-disabled","data-read-only","aria-label","tabindex"],I=["data-border","tabindex","onKeydown"],K={class:"multivalues--label truncate"},H=Object.assign({name:"LibMultiValues",inheritAttrs:!1},{__name:"WMultiValues",props:y({label:{type:String,required:!1},disabled:{type:Boolean,required:!1,default:!1},readonly:{type:Boolean,required:!1,default:!1},border:{type:Boolean,required:!1,default:!0},unstyle:{type:Boolean,required:!1,default:!1}},{modelValue:{type:Array,default:()=>[]},modelModifiers:{}}),emits:["update:modelValue"],setup(e){const r=j(["item"]),i=e,n=v(()=>!i.disabled&&!i.readonly),l=x(e,"modelValue",{type:Array,default:()=>[]}),f=u=>{n.value&&C(l.value,u)};return(u,z)=>l.value&&l.value?.length>0?(d(),s("div",w({key:0,class:a(c)(`
		multivalues
		group
		flex
		flex-initial
		items-center
		justify-center
		gap-1
		overflow-x-scroll
		scrollbar-hidden
	`,a(r).attrs?.class),"data-disabled":e.disabled,"data-read-only":e.readonly,"aria-label":`Values for ${e.label}`,tabindex:e.disabled?-1:0},{...a(r).attrs,class:void 0}),[(d(!0),s(h,null,V(l.value,t=>(d(),s("div",{"data-border":e.border,class:B(a(c)(`
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
			`,a(r).itemAttrs?.class)),tabindex:n.value?0:void 0,key:t,onKeydown:k($(b=>a(N)(t.toString()),["ctrl","prevent"]),["c"])},[M("span",K,A(t),1),o(S,{class:"multivalues--remove-button !p-0 text-sm !leading-none","aria-label":`Remove ${t}`,border:!1,disabled:e.disabled||e.readonly,onClick:b=>f(t)},{default:m(()=>[o(p,null,{default:m(()=>[o(a(q))]),_:1})]),_:1},8,["aria-label","disabled","onClick"])],42,I))),128))],16,F)):g("",!0)}});export{H as default};
