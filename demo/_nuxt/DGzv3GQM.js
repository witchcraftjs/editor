import{D as e,Ht as t,On as n,Qn as r,g as i,mt as a,nn as o,pn as s,qt as c,tr as l,un as u,v as d,vn as f}from"./CoKk4mC0.js";import{n as p}from"./M5icC9NJ.js";import{n as m}from"./CMAV9WAp.js";import{n as h}from"./DvNqsCwT2.js";import{t as g}from"./C9F7w7wr.js";import{n as _}from"./C7qDudK8.js";import{n as v}from"./B91J_PTq.js";function y(e){let t=()=>{},n=o((n,r)=>(t=r,{get(){return n(),`_`in e.value?e.value._:e.value},set(t){e.set(t)}})),r=o(t=>({get(){return t(),e.css},set(){throw Error(`Cannot set CSS directly.`)}})),i={notify:()=>{t()}};return e.addDep(i),s(()=>{e.removeDep(i)}),{instance:e,ref:n,css:r}}var b=Object.assign({name:`WMetamorphosisControl`},{__name:`WMetamorphosisControl`,props:{controlVar:{type:Object,required:!0},rootProps:{type:Object,required:!1}},setup(o){let{ref:s,css:b}=y(o.controlVar),x=i(()=>{let e=b.value.toLowerCase();for(let t of[`rgb`,`hsl`,`hwb`,`lch`,`oklch`,`lab`,`oklab`])if(e.startsWith(t))return t;return null}),S=i(()=>typeof s.value==`number`),C=i(()=>b.value.includes(`/`)),w=f(!1),T=i(()=>{let e=x.value;return(()=>{if(e===null)return{r:0,g:0,b:0,a:void 0};let t=s.value;if(e===`rgb`)return{r:Math.round(t.r??0),g:Math.round(t.g??0),b:Math.round(t.b??0),a:t.a};let n,r;e===`hsl`?(n=[t.h??0,t.s??0,t.l??0],r=t.a):e===`hwb`?(n=[t.h??0,t.w??0,t.b??0],r=t.a):e===`lch`||e===`oklch`?(n=[t.l??0,t.c??0,t.h??0],r=t.a):e===`lab`||e===`oklab`?(n=[t.l??0,t.a??0,t.b??0],r=t.A):(n=[0,0,0],r=void 0);let i=new g(e,n,r??1),a=i.srgb;return{r:Math.round((a[0]??0)*255),g:Math.round((a[1]??0)*255),b:Math.round((a[2]??0)*255),a:i.alpha}})()}),E=f({...T.value});function D(e){A(e),w.value=!1}function O(){w.value=!1}function k(){w.value=!1}function A(e){let t=x.value;if(t===`rgb`)s.value={r:e.r,g:e.g,b:e.b,a:e.a};else{let n=new g(`srgb`,[e.r/255,e.g/255,e.b/255],e.a??1).to(t).coords,r=[n[0]??0,n[1]??0,n[2]??0],i={};t===`hsl`?(i.h=r[0],i.s=r[1],i.l=r[2]):t===`hwb`?(i.h=r[0],i.w=r[1],i.b=r[2]):t===`lch`||t===`oklch`?(i.l=r[0],i.c=r[1],i.h=r[2]):(t===`lab`||t===`oklab`)&&(i.l=r[0],i.a=r[1],i.b=r[2]),e.a!==void 0&&(i[t===`lab`||t===`oklab`?`A`:`a`]=e.a),s.value=i}}return t(T,()=>{E.value={...T.value}}),(t,i)=>x.value===null?S.value?(a(),d(h,{key:1,modelValue:n(s),"onUpdate:modelValue":i[3]||=e=>u(s)?s.value=e:null},null,8,[`modelValue`])):(a(),d(m,{key:2,modelValue:n(s),"onUpdate:modelValue":i[4]||=e=>u(s)?s.value=e:null},null,8,[`modelValue`])):(a(),d(v,{key:0,"root-props":{class:`
				metamorphosis-control--popover-root
			`,...o.rootProps},"content-props":{onInteractOutside:k,class:`
					[&_.popover--content-inner]:p-0
					[&_.popover--content-inner]:border-0
					[&_.popover--content-inner]:overflow-none
				`},modelValue:w.value,"onUpdate:modelValue":i[2]||=e=>w.value=e},{button:c(()=>[e(p,{border:!1,class:r(`
					metamorphosis-control--button
					border-transparent
					border-2
					outline-hidden
					focus:border-accent-500
					active:border-accent-500
					hover:border-accent-500
					w-4
					h-4
					rounded-sm
					cursor-pointer
				`),style:l(`background:${n(b)}`),onClick:i[0]||=e=>w.value=!0},null,8,[`style`])]),popover:c(()=>[e(_,{"allow-alpha":C.value,border:!1,modelValue:E.value,"onUpdate:modelValue":i[1]||=e=>E.value=e,onSave:D,onCancel:O},{buttons:c(()=>[...i[5]||=[]]),_:1},8,[`allow-alpha`,`modelValue`])]),_:1},8,[`root-props`,`content-props`,`modelValue`]))}});export{b as default};