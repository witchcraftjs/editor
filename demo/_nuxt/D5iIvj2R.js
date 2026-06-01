import{c as be}from"./DyCH_Usl.js";import{i as we}from"./B9Vz3BzZ.js";import{u as U}from"./B8YfHvdD.js";import{C as q}from"./475SGCPX.js";import{c as w}from"./krPynjdP.js";import{I as ye}from"./DUcbGZ4B.js";import{u as ke}from"./BsuyuGVv.js";import{u as $e}from"./0FXSfoKy.js";import{c as xe}from"./CD0Jx8XC.js";import{a as Se}from"./D3iVoR1_.js";import X from"./CFl5zPZM.js";import Ce from"./DcktFqIC.js";import Ae from"./Cooz8tHr.js";import{C as Re,aa as oe,r as V,l as Ve,p as Y,c as ne,a as g,af as L,I as k,G as d,H as qe,D as ie,ab as se,y as P,A as Ee,o as ce,b as S,w as M,d as ue,t as de}from"./weshC9XZ.js";import"./BuX2WBq9.js";import"./BhoX2VZY.js";import"./DE6-oaaM.js";function pe(t,v){try{const f=typeof t=="string"?new q(t):new q("srgb",[t.r/255,t.g/255,t.b/255],v?t.a:1),l=f.hsv;return!l||l[1]===void 0||l[2]===void 0?void 0:{h:w(l[0]??0,0,Number.MAX_SAFE_INTEGER),s:w(l[1],0,100),v:w(l[2],0,100),a:w(v?f.alpha:1,0,1)}}catch{return}}function W(t,v){try{const f=typeof t=="string"?new q(t):new q("hsv",[t.h,t.s,t.v],v?t.a:1),l=f.srgb;return!l||l[0]===void 0||l[1]===void 0||l[2]===void 0?void 0:{r:w(l[0]/1*255,0,255),g:w(l[1]/1*255,0,255),b:w(l[2]/1*255,0,255),a:w(v?f.alpha:1,0,1)}}catch{return}}function B(t,v){const f=t.toFixed(v);return Number.parseFloat(f).toString()}function Te(t,v,f){const l=B(t.r,f),$=B(t.g,f),s=B(t.b,f),C=t.a!==void 0?B(t.a,f):void 0;return v?`rgba(${l}, ${$}, ${s}, ${C})`:`rgb(${l}, ${$}, ${s})`}const Ke=["id","aria-label"],ze=["aria-description","aria-valuetext"],De=["aria-valuenow","aria-label","aria-description"],Ie=["aria-label","aria-valuenow","aria-description"],Le={class:"color-picker--footer flex w-full flex-1 gap-2"},Pe={class:"color-picker--preview-wrapper bg-transparency-squares relative aspect-square h-[calc(var(--slider-size)*3)] rounded-full shadow-xs"},Me={class:"color-picker--input-group flex flex-1 items-center gap-2"},Be={class:"color-picker--save-cancel-group flex w-full items-center justify-center gap-2"},fe=`
	slider
	no-touch-action
	h-4
	w-full
	relative
	flex
`,J=`
	handle
	h-[var(--slider-size)]
	w-[var(--slider-size)]
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
`,tr=Object.assign({name:"WColorPicker"},{__name:"WColorPicker",props:se({id:{type:String,required:!1},label:{type:String,required:!1},allowAlpha:{type:Boolean,required:!1,default:!0},stringPrecision:{type:Number,required:!1,default:3},customRepresentation:{type:Object,required:!1,default:void 0},border:{type:Boolean,required:!1,default:!0},copyTransform:{type:Function,required:!1,default:(t,v)=>v},valid:{type:Boolean,required:!1,default:!0}},{modelValue:{type:Object,required:!1,default:()=>({r:0,g:0,b:0})},modelModifiers:{},tempValue:{type:null,required:!1,default:()=>{}},tempValueModifiers:{}}),emits:se(["save","cancel"],["update:modelValue","update:tempValue"]),setup(t,{emit:v}){const f=Re(),l=$e(),$=v,s=t,C=ke(s),N=l("color-picker.aria.description"),E=oe(t,"modelValue",{type:Object,required:!1,default:()=>({r:0,g:0,b:0})}),y=oe(t,"tempValue",{type:null,required:!1,default:()=>{}}),T=V(null),K=V(null),A=V(null);let F=null,Q=null,Z=null;const H={hue:{el:K,xKey:"h",xSteps:360},alpha:{el:A,xSteps:1,xKey:"a"},all:{el:T,xSteps:100,ySteps:100,xKey:"s",yKey:"v"}},o=Ee({percent:{h:0,s:0,v:0,a:0},val:{h:0,s:0,v:0,a:0}}),_=P(()=>{const e=W(o.val,s.allowAlpha);return e||U(),e}),ee=P(()=>{const e=_.value;return e||U(),`rgba(${e.r}, ${e.g}, ${e.b}, ${e.a})`}),x=P(()=>s.customRepresentation?s.customRepresentation.fromHsvaToString({...o.val},s.allowAlpha):Te(_.value,s.allowAlpha,s.stringPrecision)),R=V(x.value);function ve(){R.value!==x.value&&(R.value=x.value)}function me(e,r){if(!F)return;const a=F,{height:n,width:m}=e;a.clearRect(0,0,m,n);const u=a.createLinearGradient(0,0,0,n);u.addColorStop(0,"white"),u.addColorStop(1,"black");const p=a.createLinearGradient(0,0,m,0);p.addColorStop(0,`hsla(${r} 100% 50% / 0)`),p.addColorStop(1,`hsla(${r} 100% 50% /1)`),a.fillStyle=u,a.fillRect(0,0,m,n),a.fillStyle=p,a.globalCompositeOperation="multiply",a.fillRect(0,0,m,n),a.globalCompositeOperation="source-over"}function re(e,r,a,n=360){if(!r)return;const{height:m,width:u}=e;r.clearRect(0,0,u,m);const p=we(a)?a.length-1:n,c=r.createLinearGradient(0,0,u,0);for(let i=0;i<p+1;i++){const b=a instanceof Function?a(i):a[i];b===void 0&&U(),c.addColorStop(i/p,b)}r.fillStyle=c,r.fillRect(0,0,u,m)}function ae(e,r,a=100,n=100,m=!1){const u=e/r,p=u*a,c=Math.round(p*n)/n,i=a===n?c:Math.round(u*100*n)/n,b={val:c,percent:i};return m&&(b.val=a-c),b}const z=V("");let D=!1;function j(e,r){requestAnimationFrame(()=>{if(r==="")return;const a=H[r]?.el.value;if(!a||!H[r])return;const{x:n,y:m,width:u,height:p}=a.getBoundingClientRect(),c=H[r];if(c.xKey!==void 0){let i=e.clientX-n;i=i<0?0:i>u?u:i;const b=ae(i,u,c.xSteps??100);o.percent[c.xKey]=b.percent,o.val[c.xKey]=b.val}if(c.yKey!==void 0){let i=e.clientY-m;i=i<0?0:i>p?p:i;const b=ae(i,p,c.ySteps??100,100,!0);o.percent[c.yKey]=b.percent,o.val[c.yKey]=b.val}})}const h={keydown:(e,r)=>{if(be(e.target),e.target?.getBoundingClientRect){if(["ArrowRight","ArrowLeft","ArrowUp","ArrowDown"].includes(e.key)){e.preventDefault();const{x:a,y:n,width:m,height:u}=e.target.getBoundingClientRect();let p=e.key==="ArrowRight"?1:e.key==="ArrowLeft"?-1:0,c=e.key==="ArrowUp"?-1:e.key==="ArrowDown"?1:0;e.shiftKey&&(p*=10),e.shiftKey&&(c*=10),j({clientX:a+m/2+p,clientY:n+u/2+c},r)}e.key==="Enter"&&(e.preventDefault(),le())}},pointerdown:(e,r)=>{const a=`#${C} .color-picker--${r}-handle`,n=document.querySelector(a);n instanceof HTMLElement&&n.focus(),!D&&(e.preventDefault(),z.value=r,D=!0,document.addEventListener("pointermove",h.pointermove),document.addEventListener("pointerup",h.pointerup),j(e,z.value))},pointerleave:e=>{D&&e.preventDefault()},pointermove:e=>{e.preventDefault(),j(e,z.value)},pointerup:e=>{e.preventDefault(),D=!1,z.value="",document.removeEventListener("pointermove",h.pointermove),document.removeEventListener("pointerup",h.pointerup)}};function O(e){if(A.value){const r=new q("hsv",[e.h,e.s,e.v],e.a).to("hsl"),a=r.clone();a.alpha=0;const n=r.clone();n.alpha=1,re(A.value,Z,[a.toString(),n.toString()])}re(K.value,Q,r=>`hsl(${r} 100% 50%)`),me(T.value,e.h)}function te(e){o.percent.h=Math.round(e.h/360*1e4)/100,o.percent.s=e.s,o.percent.v=100-e.v,o.percent.a=s.allowAlpha&&e.a!==void 0?e.a*100:1,o.val={...e,a:s.allowAlpha?e.a:1}}function I(e){const r=pe(e,s.allowAlpha);r&&(O(r),te(r))}function le(){const e=W(o.val,s.allowAlpha);e&&(E.value=e,y.value=void 0,$("save",e))}function ge(e){const r=e.target?.value,a=s.customRepresentation?.fromStringToHsva?s.customRepresentation.fromStringToHsva(r):pe(r,s.allowAlpha);a&&(O(a),te(a))}let G=!1;Ve(()=>{I(E.value),y.value!==void 0&&I(y.value);const e=document.querySelector(`#${C} .color-picker--all-handle`);e instanceof HTMLElement&&e.focus(),F=T.value?.getContext("2d")??null,Q=K.value?.getContext("2d")??null,Z=A.value?.getContext("2d")??null}),Y(E,()=>{I(E.value)}),Y(y,()=>{y.value!==void 0&&(G=!0,I(y.value),setTimeout(()=>{G=!1},0))}),Y(o,()=>{if(O(o.val),R.value=x.value,G)return;const e=W(o.val,s.allowAlpha);e&&(y.value=e)});const he=P(()=>o.percent.v<50||o.val.a===void 0||o.val.a<.5);return(e,r)=>(ce(),ne("div",{id:d(C),"aria-label":d(l)("color-picker.aria"),class:k(d(Se)(`color-picker
			[--slider-size:calc(var(--spacing)_*_4)]
			[--contrast-dark:var(--color-neutral-100)]
			[--contrast-light:var(--color-neutral-800)]
			[--fg:rgb(var(--contrast-dark))]
			[--bg:rgb(var(--contrast-light))]
			max-w-[300px]
			flex flex-col items-center justify-center
			bg-neutral-50
			dark:bg-neutral-800
			gap-3
			p-3
		`,he.value&&`
			[--fg:rgb(var(--contrast-light))]
			[--bg:rgb(var(--contrast-dark))]
		`,t.border&&`
			border
			rounded-sm
			border-neutral-300
			dark:border-neutral-900
			shadow-md
			shadow-black/30
		`,d(f)?.class))},[g("div",{class:k(`color-picker--all-picker
			no-touch-action
			w-full
			aspect-square
			relative
			flex
			rounded-sm
			focus:border-accent-500
		`),onPointerdown:r[1]||(r[1]=a=>h.pointerdown(a,"all")),onPointerleave:r[2]||(r[2]=a=>h.pointerleave(a))},[g("canvas",{class:"size-full shadow-xs shadow-black/50 rounded-sm",ref_key:"pickerEl",ref:T},null,512),g("div",{role:"slider","aria-description":d(N),"aria-valuetext":`${d(l)("color-picker.aria.saturation")}: ${o.percent.s}, ${d(l)("color-picker.aria.value")}: ${o.percent.v}`,class:k(`
					color-picker--all-handle
					${J}
					border-[var(--fg)]
					hover:shadow-black
					active:shadow-black
				`),tabindex:"0",style:L(`
					left: calc(${o.percent.s}% - var(--slider-size)/2);
					top: calc(${o.percent.v}% - var(--slider-size)/2);
					background: ${ee.value};
				`),onKeydown:r[0]||(r[0]=a=>h.keydown(a,"all"))},null,46,ze)],32),g("div",{class:k(`color-picker--hue-slider ${fe}`),onPointerdown:r[4]||(r[4]=a=>h.pointerdown(a,"hue"))},[g("canvas",{class:"size-full shadow-xs shadow-black/50 rounded-sm",ref_key:"hueSliderEl",ref:K},null,512),g("div",{role:"slider","aria-valuenow":`${o.percent.h}`,"aria-valuemin":0,"aria-valuemax":100,"aria-label":d(l)("color-picker.aria.hue"),"aria-description":d(N),tabindex:"0",class:k(`
				color-picker--hue-handle
				${J}
			`),style:L(`left: calc(${o.percent.h}% - var(--slider-size)/2)`),onKeydown:r[3]||(r[3]=a=>h.keydown(a,"hue"))},null,46,De)],34),t.allowAlpha?(ce(),ne("div",{key:0,class:k(`
			color-picker--alpha-slider
			${fe}
		`),onPointerdown:r[6]||(r[6]=a=>h.pointerdown(a,"alpha"))},[g("canvas",{class:"size-full shadow-xs shadow-black/50 rounded-sm bg-transparency-squares",ref_key:"alphaSliderEl",ref:A},null,512),g("div",{role:"slider","aria-label":d(l)("color-picker.aria.alpha-slider"),"aria-valuenow":`${o.percent.a}`,"aria-valuemin":0,"aria-valuemax":100,"aria-description":d(N),tabindex:"0",class:k(`color-picker--alpha-handle ${J}`),style:L(`left: calc(${o.percent.a}% - var(--slider-size)/2)`),onKeydown:r[5]||(r[5]=a=>h.keydown(a,"alpha"))},null,46,Ie)],34)):qe("",!0),g("div",Le,[g("div",Pe,[g("div",{class:"color-picker--footer--preview size-full rounded-full border-2 border-neutral-600 dark:border-neutral-300",style:L(`background: ${ee.value}`)},null,4)]),g("div",Me,[ie(e.$slots,"input",{},()=>[S(Ae,{valid:t.valid,class:"color-picker--input w-full","aria-label":t.label,modelValue:R.value,"onUpdate:modelValue":r[7]||(r[7]=a=>R.value=a),onInput:ge,onBlur:ve},null,8,["valid","aria-label","modelValue"]),S(X,{class:"color-picker--copy-button","aria-label":d(l)("copy"),onClick:r[8]||(r[8]=a=>d(xe)(t.copyTransform?.(o.val,x.value)??x.value))},{default:M(()=>[S(Ce,null,{default:M(()=>[S(d(ye))]),_:1})]),_:1},8,["aria-label"])])])]),ie(e.$slots,"buttons",{},()=>[g("div",Be,[S(X,{class:"color-picker--save-button",onClick:r[9]||(r[9]=a=>le())},{default:M(()=>[ue(de(d(l)("save")),1)]),_:1}),S(X,{class:"color-picker--cancel-button",onClick:r[10]||(r[10]=a=>$("cancel"))},{default:M(()=>[ue(de(d(l)("cancel")),1)]),_:1})])])],10,Ke))}});export{tr as default};
