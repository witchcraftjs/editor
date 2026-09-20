import{$ as e,D as t,E as n,Ft as r,Nt as i,On as a,_ as o,b as s,et as c,mt as l,nr as u,qt as d,xt as f}from"./CoKk4mC0.js";import{t as p}from"./CTrY3BHI.js";import{t as m}from"./AEemqjXy.js";import{t as h}from"./nUUO6FLp.js";import{t as g}from"./DTDtm0zD.js";import{t as _}from"./COTi4dCR.js";import{n as v,t as y}from"./C34OzHwB2.js";var b=Object.assign({name:`WCheckbox`,inheritAttrs:!1},{__name:`WCheckbox`,props:e({disabled:{type:Boolean,required:!1},readonly:{type:Boolean,required:!1},border:{type:Boolean,required:!1,default:!0},unstyle:{type:Boolean,required:!1},id:{type:String,required:!1},label:{type:String,required:!1},labelAttrs:{type:Object,required:!1},wrapperAttrs:{type:Object,required:!1}},{modelValue:{type:null,default:!1},modelModifiers:{}}),emits:[`update:modelValue`],setup(e){let b=i(),x=e,S=r(e,`modelValue`,{type:null,default:!1}),C=g(x);return _(C,S),(r,i)=>(l(),s(`div`,c({class:a(p)(`
		checkbox--wrapper
		flex
		items-center
		gap-1
	`,(e.disabled||e.readonly)&&`
			cursor-not-allowed
			text-neutral-500
		`,e.wrapperAttrs?.class)},{...e.wrapperAttrs,class:void 0},{ref:`el`}),[f(r.$slots,`left`),o(`label`,c({class:a(p)(`
			checkbox--label
			flex
			items-center
			gap-1
		`,e.labelAttrs?.class)},{...e.labelAttrs,class:void 0}),[t(a(v),c({id:a(C),disabled:e.disabled||e.readonly,class:!e.unstyle&&a(p)(`
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
			`,a(b)?.class)},{...a(b),class:void 0},{modelValue:S.value,"onUpdate:modelValue":i[0]||=e=>S.value=e}),{default:d(()=>[t(a(y),{class:`checkbox--indicator`},{default:d(()=>[t(m,{class:`scale-110 mt-[2px] ml-[0.5px] [&_path]:stroke-3`},{default:d(()=>[t(a(h))]),_:1})]),_:1})]),_:1},16,[`id`,`disabled`,`class`,`modelValue`]),f(r.$slots,`default`),n(` `+u(e.label),1)],16)],16))}});export{b as default};