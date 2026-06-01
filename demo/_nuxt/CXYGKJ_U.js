import{C as w,aa as p,c as f,O as V,P as A,J as B,G as n,H as $,ab as D,o as c,Q as I,R as M,I as q,a as C,t as K,b as v,w as x,r as g,y as R,x as O}from"./weshC9XZ.js";import{I as j}from"./DaCdVXTJ.js";import{c as E}from"./CD0Jx8XC.js";import{a as h}from"./D3iVoR1_.js";import F from"./CFl5zPZM.js";import L from"./DcktFqIC.js";import"./BhoX2VZY.js";function N(e,...d){for(const u of d){const r=e.indexOf(u);r>-1&&e.splice(r,1)}return e}const S=["data-disabled","data-read-only","aria-label"],W=["data-border","tabindex","onKeydown","onFocus"],H={class:"multivalues--label truncate"},U=Object.assign({name:"WMultiValues",inheritAttrs:!1},{__name:"WMultiValues",props:D({disabled:{type:Boolean,required:!1},readonly:{type:Boolean,required:!1},border:{type:Boolean,required:!1,default:!0},unstyle:{type:Boolean,required:!1},label:{type:String,required:!1},itemAttrs:{type:Object,required:!1}},{modelValue:{type:Array,default:()=>[]},modelModifiers:{}}),emits:["update:modelValue"],setup(e){const d=w(),u=e,r=R(()=>!u.disabled&&!u.readonly),t=p(e,"modelValue",{type:Array,default:()=>[]}),o=g([]),a=g(0);function m(l){r.value&&(N(t.value,l),t.value.length>0&&(a.value>=t.value.length&&(a.value=t.value.length-1),O(()=>{o.value[a.value]?.focus()})))}function k(l){if(u.disabled)return;const s=t.value.length;s!==0&&(l.key==="ArrowRight"?(a.value=(a.value+1)%s,o.value[a.value]?.focus(),l.preventDefault()):l.key==="ArrowLeft"?(a.value=(a.value-1+s)%s,o.value[a.value]?.focus(),l.preventDefault()):l.key==="Delete"||l.key==="Backspace"?r.value&&(m(t.value[a.value]),l.preventDefault()):l.key==="Home"?(a.value=0,o.value[a.value]?.focus(),l.preventDefault()):l.key==="End"&&(a.value=s-1,o.value[a.value]?.focus(),l.preventDefault()))}return(l,s)=>t.value&&t.value?.length>0?(c(),f("div",B({key:0,role:"list",class:n(h)(`
		multivalues
		group
		flex
		flex-initial
		items-center
		justify-center
		gap-1
		overflow-x-scroll
		scrollbar-hidden
	`,n(d)?.class),"data-disabled":e.disabled,"data-read-only":e.readonly,"aria-label":e.label?`Values for ${e.label}`:void 0},{...n(d),class:void 0},{onKeydown:k}),[(c(!0),f(V,null,A(t.value,(i,b)=>(c(),f("div",{role:"listitem","data-border":e.border,class:q(n(h)(`
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
				leading-none
				focus-outline
				outlined:outline-offset-0
			`,!(e.disabled||e.readonly)&&`
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
			`,e.itemAttrs?.class)),tabindex:r.value?a.value===b?0:-1:void 0,key:i,ref_for:!0,ref_key:"itemRefs",ref:o,onKeydown:I(M(y=>n(E)(i.toString()),["ctrl","prevent"]),["c"]),onFocus:y=>a.value=b},[C("span",H,K(i),1),v(F,{class:"multivalues--remove-button !p-0 text-sm !leading-none","aria-label":`Remove ${i}`,border:!1,disabled:e.disabled||e.readonly,tabindex:"-1",onClick:y=>m(i)},{default:x(()=>[v(L,null,{default:x(()=>[v(n(j))]),_:1})]),_:1},8,["aria-label","disabled","onClick"])],42,W))),128))],16,S)):$("",!0)}});export{U as default};
