import{i as e}from"./Dnea9d-F.js";import{$ as t,D as n,E as r,Ft as i,Ht as a,Nt as o,On as s,Qn as c,_ as l,b as u,ct as ee,g as d,gn as te,mt as ne,nr as re,qt as f,tr as p,vn as m,xt as h,y as ie}from"./CoKk4mC0.js";import{t as g}from"./CTrY3BHI.js";import{t as ae}from"./adLheOrI.js";import{n as _}from"./M5icC9NJ.js";import{t as oe}from"./AEemqjXy.js";import{t as se}from"./DTDtm0zD.js";import{n as ce}from"./CMAV9WAp.js";import{t as v}from"./DZhkxGZv.js";import{t as y}from"./C9F7w7wr.js";import{t as le}from"./DLNmc5u_.js";import{t as ue}from"./BOwmyn0k.js";import{t as de}from"./7pH3781W.js";import{t as b}from"./Dsx2eH-Y.js";import{t as fe}from"./Cvjjtm5s.js";function x(e,t){try{let n=typeof e==`string`?new y(e):new y(`srgb`,[e.r/255,e.g/255,e.b/255],t?e.a:1),r=n.hsv;return!r||r[1]===void 0||r[2]===void 0?void 0:{h:b(r[0]??0,0,2**53-1),s:b(r[1],0,100),v:b(r[2],0,100),a:b(t?n.alpha:1,0,1)}}catch{return}}function S(e,t){try{let n=typeof e==`string`?new y(e):new y(`hsv`,[e.h,e.s,e.v],t?e.a:1),r=n.srgb;return!r||r[0]===void 0||r[1]===void 0||r[2]===void 0?void 0:{r:b(r[0]/1*255,0,255),g:b(r[1]/1*255,0,255),b:b(r[2]/1*255,0,255),a:b(t?n.alpha:1,0,1)}}catch{return}}function C(e,t){let n=e.toFixed(t);return Number.parseFloat(n).toString()}function pe(e,t,n){let r=C(e.r,n),i=C(e.g,n),a=C(e.b,n),o=e.a===void 0?void 0:C(e.a,n);return t?`rgba(${r}, ${i}, ${a}, ${o})`:`rgb(${r}, ${i}, ${a})`}var w=e({default:()=>D}),me=[`id`,`aria-label`],he=[`aria-description`,`aria-valuetext`],ge=[`aria-valuenow`,`aria-label`,`aria-description`],_e=[`aria-label`,`aria-valuenow`,`aria-description`],ve={class:`color-picker--footer flex w-full flex-1 gap-2`},ye={class:`color-picker--preview-wrapper bg-transparency-squares relative aspect-square h-[calc(var(--slider-size,var(--_slider-size))*3)] rounded-full shadow-xs`},be={class:`color-picker--input-group flex flex-1 items-center gap-2`},xe={class:`color-picker--save-cancel-group flex w-full items-center justify-center gap-2`},T=`
	slider
	no-touch-action
	h-4
	w-full
	relative
	flex
`,E=`
	handle
	h-[var(--slider-size,var(--_slider-size))]
	w-[var(--slider-size,var(--_slider-size))]
	shadow-xs
	shadow-black/50
	border-2 border-neutral-700
	rounded-full
	absolute
	cursor-pointer
	outline-hidden
	focus:border-accent-500
	active:border-accent-500
	hover:border-accent-500
`,D=Object.assign({name:`WColorPicker`},{__name:`WColorPicker`,props:t({id:{type:String,required:!1},label:{type:String,required:!1},allowAlpha:{type:Boolean,required:!1,default:!0},stringPrecision:{type:Number,required:!1,default:3},customRepresentation:{type:Object,required:!1,default:void 0},border:{type:Boolean,required:!1,default:!0},copyTransform:{type:Function,required:!1,default:(e,t)=>t},valid:{type:Boolean,required:!1,default:!0}},{modelValue:{type:Object,required:!1,default:()=>({r:0,g:0,b:0})},modelModifiers:{},tempValue:{type:null,required:!1,default:()=>void 0},tempValueModifiers:{}}),emits:t([`save`,`cancel`],[`update:modelValue`,`update:tempValue`]),setup(e,{emit:t}){let b=o(),C=ae(),w=t,D=e,O=se(D),k=C(`color-picker.aria.description`),A=i(e,`modelValue`,{type:Object,required:!1,default:()=>({r:0,g:0,b:0})}),j=i(e,`tempValue`,{type:null,required:!1,default:()=>void 0}),M=m(null),N=m(null),P=m(null),F=null,I=null,L=null,R={hue:{el:N,xKey:`h`,xSteps:360},alpha:{el:P,xSteps:1,xKey:`a`},all:{el:M,xSteps:100,ySteps:100,xKey:`s`,yKey:`v`}},z=te({percent:{h:0,s:0,v:0,a:0},val:{h:0,s:0,v:0,a:0}}),B=d(()=>{let e=S(z.val,D.allowAlpha);return e||v(),e}),V=d(()=>{let e=B.value;return e||v(),`rgba(${e.r}, ${e.g}, ${e.b}, ${e.a})`}),H=d(()=>D.customRepresentation?D.customRepresentation.fromHsvaToString({...z.val},D.allowAlpha):pe(B.value,D.allowAlpha,D.stringPrecision)),U=m(H.value);function Se(){U.value!==H.value&&(U.value=H.value)}function Ce(e,t){if(!F)return;let n=F,{height:r,width:i}=e;n.clearRect(0,0,i,r);let a=n.createLinearGradient(0,0,0,r);a.addColorStop(0,`white`),a.addColorStop(1,`black`);let o=n.createLinearGradient(0,0,i,0);o.addColorStop(0,`hsla(${t} 100% 50% / 0)`),o.addColorStop(1,`hsla(${t} 100% 50% /1)`),n.fillStyle=a,n.fillRect(0,0,i,r),n.fillStyle=o,n.globalCompositeOperation=`multiply`,n.fillRect(0,0,i,r),n.globalCompositeOperation=`source-over`}function W(e,t,n,r=360){if(!t)return;let{height:i,width:a}=e;t.clearRect(0,0,a,i);let o=de(n)?n.length-1:r,s=t.createLinearGradient(0,0,a,0);for(let e=0;e<o+1;e++){let t=n instanceof Function?n(e):n[e];t===void 0&&v(),s.addColorStop(e/o,t)}t.fillStyle=s,t.fillRect(0,0,a,i)}function G(e,t,n=100,r=100,i=!1){let a=e/t,o=a*n,s=Math.round(o*r)/r,c={val:s,percent:n===r?s:Math.round(a*100*r)/r};return i&&(c.val=n-s),c}let K=m(``),q=!1;function J(e,t){requestAnimationFrame(()=>{if(t===``)return;let n=R[t]?.el.value;if(!n||!R[t])return;let{x:r,y:i,width:a,height:o}=n.getBoundingClientRect(),s=R[t];if(s.xKey!==void 0){let t=e.clientX-r;t=t<0?0:t>a?a:t;let n=G(t,a,s.xSteps??100);z.percent[s.xKey]=n.percent,z.val[s.xKey]=n.val}if(s.yKey!==void 0){let t=e.clientY-i;t=t<0?0:t>o?o:t;let n=G(t,o,s.ySteps??100,100,!0);z.percent[s.yKey]=n.percent,z.val[s.yKey]=n.val}})}let Y={keydown:(e,t)=>{if(le(e.target),e.target?.getBoundingClientRect){if([`ArrowRight`,`ArrowLeft`,`ArrowUp`,`ArrowDown`].includes(e.key)){e.preventDefault();let{x:n,y:r,width:i,height:a}=e.target.getBoundingClientRect(),o=e.key===`ArrowRight`?1:e.key===`ArrowLeft`?-1:0,s=e.key===`ArrowUp`?-1:+(e.key===`ArrowDown`);e.shiftKey&&(o*=10),e.shiftKey&&(s*=10),J({clientX:n+i/2+o,clientY:r+a/2+s},t)}e.key===`Enter`&&(e.preventDefault(),Q())}},pointerdown:(e,t)=>{let n=`#${O} .color-picker--${t}-handle`,r=document.querySelector(n);r instanceof HTMLElement&&r.focus(),!q&&(e.preventDefault(),K.value=t,q=!0,document.addEventListener(`pointermove`,Y.pointermove),document.addEventListener(`pointerup`,Y.pointerup),J(e,K.value))},pointerleave:e=>{q&&e.preventDefault()},pointermove:e=>{e.preventDefault(),J(e,K.value)},pointerup:e=>{e.preventDefault(),q=!1,K.value=``,document.removeEventListener(`pointermove`,Y.pointermove),document.removeEventListener(`pointerup`,Y.pointerup)}};function X(e){if(P.value){let t=new y(`hsv`,[e.h,e.s,e.v],e.a).to(`hsl`),n=t.clone();n.alpha=0;let r=t.clone();r.alpha=1,W(P.value,L,[n.toString(),r.toString()])}W(N.value,I,e=>`hsl(${e} 100% 50%)`),Ce(M.value,e.h)}function we(e){z.percent.h=Math.round(e.h/360*1e4)/100,z.percent.s=e.s,z.percent.v=100-e.v,z.percent.a=D.allowAlpha?e.a===void 0?1:e.a*100:1,z.val={...e,a:D.allowAlpha?e.a:1}}function Z(e){let t=x(e,D.allowAlpha);t&&(X(t),we(t))}function Q(){let e=S(z.val,D.allowAlpha);e&&(A.value=e,j.value=void 0,w(`save`,e))}function Te(e){let t=e.target?.value,n=D.customRepresentation?.fromStringToHsva?D.customRepresentation.fromStringToHsva(t):x(t,D.allowAlpha);n&&(X(n),we(n))}let $=!1;ee(()=>{Z(A.value),j.value!==void 0&&Z(j.value);let e=document.querySelector(`#${O} .color-picker--all-handle`);e instanceof HTMLElement&&e.focus(),F=M.value?.getContext(`2d`)??null,I=N.value?.getContext(`2d`)??null,L=P.value?.getContext(`2d`)??null}),a(A,()=>{Z(A.value)}),a(j,()=>{j.value!==void 0&&($=!0,Z(j.value),setTimeout(()=>{$=!1},0))}),a(z,()=>{if(X(z.val),U.value=H.value,$)return;let e=S(z.val,D.allowAlpha);e&&(j.value=e)});let Ee=d(()=>z.percent.v<50||z.val.a===void 0||z.val.a<.5);return(t,i)=>(ne(),u(`div`,{id:s(O),"aria-label":s(C)(`color-picker.aria`),class:c(s(g)(`color-picker
			[--_slider-size:calc(var(--spacing)_*_4)]
			[--_contrast-dark:var(--color-neutral-100)]
			[--_contrast-light:var(--color-neutral-800)]
			[--_fg:rgb(var(--_contrast-dark))]
			[--_bg:rgb(var(--_contrast-light))]
			[--slider-size:calc(var(--spacing)_*_4)]
			[--contrast-dark:var(--color-neutral-100)]
			[--contrast-light:var(--color-neutral-800)]
			[--fg:rgb(var(--contrast-dark,var(--_contrast-dark)))]
			[--bg:rgb(var(--contrast-light,var(--_contrast-light)))]
			max-w-[300px]
			flex flex-col items-center justify-center
			bg-neutral-50
			dark:bg-neutral-800
			gap-3
			p-3
		`,Ee.value&&`
			[--fg:rgb(var(--contrast-light,var(--_contrast-light)))]
			[--bg:rgb(var(--contrast-dark,var(--_contrast-dark)))]
			[--_fg:rgb(var(--_contrast-light))]
			[--_bg:rgb(var(--_contrast-dark))]
		`,e.border&&`
			border
			rounded-sm
			border-neutral-300
			dark:border-neutral-900
			shadow-md
			shadow-black/30
		`,s(b)?.class))},[l(`div`,{class:c(`color-picker--all-picker
			no-touch-action
			w-full
			aspect-square
			relative
			flex
			rounded-sm
			focus:border-accent-500
		`),onPointerdown:i[1]||=e=>Y.pointerdown(e,`all`),onPointerleave:i[2]||=e=>Y.pointerleave(e)},[l(`canvas`,{class:`size-full shadow-xs shadow-black/50 rounded-sm`,ref_key:`pickerEl`,ref:M},null,512),l(`div`,{role:`slider`,"aria-description":s(k),"aria-valuetext":`${s(C)(`color-picker.aria.saturation`)}: ${z.percent.s}, ${s(C)(`color-picker.aria.value`)}: ${z.percent.v}`,class:c(s(g)(`
					color-picker--all-handle
					${E}
					border-[var(--fg,var(--_fg))]
					hover:shadow-black
					active:shadow-black
				`)),tabindex:`0`,style:p(`
					left: calc(${z.percent.s}% - var(--slider-size,var(--_slider-size))/2);
					top: calc(${z.percent.v}% - var(--slider-size,var(--_slider-size))/2);
					background: ${V.value};
				`),onKeydown:i[0]||=e=>Y.keydown(e,`all`)},null,46,he)],32),l(`div`,{class:c(`color-picker--hue-slider ${T}`),onPointerdown:i[4]||=e=>Y.pointerdown(e,`hue`)},[l(`canvas`,{class:`size-full shadow-xs shadow-black/50 rounded-sm`,ref_key:`hueSliderEl`,ref:N},null,512),l(`div`,{role:`slider`,"aria-valuenow":`${z.percent.h}`,"aria-valuemin":0,"aria-valuemax":100,"aria-label":s(C)(`color-picker.aria.hue`),"aria-description":s(k),tabindex:`0`,class:c(`
				color-picker--hue-handle
				${E}
			`),style:p(`left: calc(${z.percent.h}% - var(--slider-size,var(--_slider-size))/2)`),onKeydown:i[3]||=e=>Y.keydown(e,`hue`)},null,46,ge)],34),e.allowAlpha?(ne(),u(`div`,{key:0,class:c(`
			color-picker--alpha-slider
			${T}
		`),onPointerdown:i[6]||=e=>Y.pointerdown(e,`alpha`)},[l(`canvas`,{class:`size-full shadow-xs shadow-black/50 rounded-sm bg-transparency-squares`,ref_key:`alphaSliderEl`,ref:P},null,512),l(`div`,{role:`slider`,"aria-label":s(C)(`color-picker.aria.alpha-slider`),"aria-valuenow":`${z.percent.a}`,"aria-valuemin":0,"aria-valuemax":100,"aria-description":s(k),tabindex:`0`,class:c(`color-picker--alpha-handle ${E}`),style:p(`left: calc(${z.percent.a}% - var(--slider-size,var(--_slider-size))/2)`),onKeydown:i[5]||=e=>Y.keydown(e,`alpha`)},null,46,_e)],34)):ie(``,!0),l(`div`,ve,[l(`div`,ye,[l(`div`,{class:`color-picker--footer--preview size-full rounded-full border-2 border-neutral-600 dark:border-neutral-300`,style:p(`background: ${V.value}`)},null,4)]),l(`div`,be,[h(t.$slots,`input`,{},()=>[n(ce,{valid:e.valid,class:`color-picker--input w-full`,"aria-label":e.label,modelValue:U.value,"onUpdate:modelValue":i[7]||=e=>U.value=e,onInput:Te,onBlur:Se},null,8,[`valid`,`aria-label`,`modelValue`]),n(_,{class:`color-picker--copy-button`,"aria-label":s(C)(`copy`),onClick:i[8]||=t=>s(ue)(e.copyTransform?.(z.val,H.value)??H.value)},{default:f(()=>[n(oe,null,{default:f(()=>[n(s(fe))]),_:1})]),_:1},8,[`aria-label`])])])]),h(t.$slots,`buttons`,{},()=>[l(`div`,xe,[n(_,{class:`color-picker--save-button`,onClick:i[9]||=e=>Q()},{default:f(()=>[r(re(s(C)(`save`)),1)]),_:1}),n(_,{class:`color-picker--cancel-button`,onClick:i[10]||=e=>w(`cancel`)},{default:f(()=>[r(re(s(C)(`cancel`)),1)]),_:1})])])],10,me))}});export{D as n,w as t};