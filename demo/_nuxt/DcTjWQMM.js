import{a as f,C as p,I as h}from"./5erz-FxU.js";import{u as k}from"./BsuyuGVv.js";import{u as x}from"./DE6-oaaM.js";import{a as l}from"./D3iVoR1_.js";import y from"./DcktFqIC.js";import{C as w,aa as g,c as V,D as u,a as q,b as t,w as r,J as d,G as a,d as B,t as A,ab as C,o as v}from"./weshC9XZ.js";import"./C5KsR5Pl.js";import"./M4G4lci2.js";import"./De61VJgk.js";import"./CHIgUVhi.js";import"./CvEN40D3.js";import"./C-40lZ0Y.js";import"./FUKBWQwh.js";import"./Ct4QWkAj.js";import"./Ce8jfSj_.js";const L=Object.assign({name:"WCheckbox",inheritAttrs:!1},{__name:"WCheckbox",props:C({disabled:{type:Boolean,required:!1},readonly:{type:Boolean,required:!1},border:{type:Boolean,required:!1,default:!0},unstyle:{type:Boolean,required:!1},id:{type:String,required:!1},label:{type:String,required:!1},labelAttrs:{type:Object,required:!1},wrapperAttrs:{type:Object,required:!1}},{modelValue:{type:[Boolean,String],default:!1},modelModifiers:{}}),emits:["update:modelValue"],setup(e){const o=w(),m=e,s=g(e,"modelValue",{type:[Boolean,String],default:!1}),c=k(m);return x(c,s),(i,n)=>(v(),V("div",d({class:a(l)(`
		checkbox--wrapper
		flex
		items-center
		gap-1
	`,(e.disabled||e.readonly)&&`
			cursor-not-allowed
			text-neutral-500
		`,e.wrapperAttrs?.class)},{...e.wrapperAttrs,class:void 0},{ref:"el"}),[u(i.$slots,"left"),q("label",d({class:a(l)(`
			checkbox--label
			flex
			items-center
			gap-1
		`,e.labelAttrs?.class)},{...e.labelAttrs,class:void 0}),[t(a(f),d({id:a(c),disabled:e.disabled||e.readonly,class:!e.unstyle&&a(l)(`
				checkbox
				flex
				items-center
				justify-center
				focus-outline-no-offset
				m-0
				h-[1.2em]
				w-[1.2em]
				aspect-square
				bg-neutral-500/10
				text-white
				dark:text-white
				border
				border-neutral-500
				data-[state=checked]:border-accent-800/50
				data-[state=checked]:bg-accent-500
				data-[state=checked]:shadow-2xs
				data-[state=checked]:shadow-black/20
				data-[state=unchecked]:inset-shadow-2xs
				data-[state=unchecked]:inset-shadow-black/20
				focus:border-accent-600
				rounded-sm
				relative
				transition-colors
				dark:disabled:bg-neutral-800
				cursor-pointer
				disabled:text-neutral-500
				disabled:bg-neutral-500/50
				disabled:cursor-not-allowed
				disabled:data-[state=checked]:border-neutral-500
			`,a(o)?.class)},{...a(o),class:void 0},{modelValue:s.value,"onUpdate:modelValue":n[0]||(n[0]=b=>s.value=b)}),{default:r(()=>[t(a(p),{class:"checkbox--indicator"},{default:r(()=>[t(y,{class:"scale-110 mt-[2px] ml-[0.5px] [&_path]:stroke-3"},{default:r(()=>[t(a(h))]),_:1})]),_:1})]),_:1},16,["id","disabled","class","modelValue"]),u(i.$slots,"default"),B(" "+A(e.label),1)],16)],16))}});export{L as default};
