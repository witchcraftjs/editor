import{a6 as f,v as i,a7 as h,c as g,H as n,a as u,X as y,d as v,aH as x,D as o,q as e,t as B,o as q}from"./ChiTXbtN.js";import{u as w}from"./CxzPWhlJ.js";import{u as V}from"./XcYfSkWd.js";import{a as d}from"./9cslYIr4.js";import{g as A}from"./CRo8hmbH.js";import"./B39yYSFt.js";const M=["for"],$=["id","disabled"],N=Object.assign({name:"LibCheckbox",inheritAttrs:!1},{__name:"WCheckbox",props:f({id:{type:String,required:!1},label:{type:String,required:!1},disabled:{type:Boolean,required:!1,default:!1},readonly:{type:Boolean,required:!1,default:!1},border:{type:Boolean,required:!1,default:!0},unstyle:{type:Boolean,required:!1,default:!1}},{modelValue:{type:Boolean,default:!1},modelModifiers:{}}),emits:f(["submit"],["update:modelValue"]),setup(a){const t=w(["label","wrapper"]),r=A(),b=a,p=i(null),m=i(null),l=h(a,"modelValue",{type:Boolean,default:!1});return V(b.id??r,l),(s,c)=>(q(),g("div",o({class:e(d)(`
		checkbox--wrapper
		flex
		items-center
		gap-1
	`,e(t).wrapperAttrs?.class)},{...e(t).wrapperAttrs,class:void 0},{ref_key:"el",ref:p}),[n(s.$slots,"left"),u("label",o({class:e(d)(`
			checkbox--label
			flex
			items-center
			gap-1
		`,e(t).labelAttrs?.class)},{...e(t).labelAttrs,class:void 0},{for:a.id??e(r)}),[y(u("input",o({id:a.id??e(r),class:!s.$attrs.unstyle&&e(d)(`
				checkbox
				focus-outline-no-offset
				m-0
				p-[0.4em]
				bg-bg
				dark:bg-fg
				appearance-none
				border
				border-neutral-500
				focus:border-accent-600
				rounded-sm
				aspect-square
				relative
				checked:after:content
				checked:after:absolute
				checked:after:w-full
				checked:after:h-full
				checked:after:border-2
				checked:after:border-bg
				dark:checked:after:border-fg
				checked:after:rounded-sm
				checked:after:top-0
				checked:after:left-0
				checked:after:bg-accent-700
				disabled:border-neutral-500
				disabled:checked:after:bg-neutral-700
			`,!a.disabled&&"cursor-pointer",e(t).attrs.class),type:"checkbox",disabled:a.disabled,ref_key:"inputEl",ref:m,"onUpdate:modelValue":c[0]||(c[0]=k=>l.value=k)},{...e(t).attrs,class:void 0}),null,16,$),[[x,l.value]]),n(s.$slots,"default"),v(" "+B(a.label),1)],16,M)],16))}});export{N as default};
