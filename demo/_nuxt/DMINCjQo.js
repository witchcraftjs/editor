import{H as q,I as A,J as S,j as $,K as k,r as x,L as v,x as p,B as f,M as h,N as l,v as E,O as P,P as B,Q as T,y as b,R as I,S as j,T as F,U as M,V as R}from"./C3NUVL-0.js";import{u as L}from"./ayP27OTm.js";import D from"./g0bzUm99.js";import H from"./DbsUeH43.js";import J from"./BF2bzjQV.js";import{g as K}from"./CUphBgkF.js";import"./Bk2TiR2_.js";import"./7IwD4oGN.js";import"./ieQVpvjz.js";import"./CD0Jx8XC.js";import"./DZE3QS8u.js";import"./BvF-ywXt.js";import"./CQ5ND8ze.js";const N={directiveName:"extract-root-el",mounted(e,{value:r}){r(e)},unmounted(e,{value:r}){r(null)},getSSRProps(){return{}}},Q={class:"color-input--swatch-wrapper flex w-full"},W={class:"color-input--popup-wrapper p-5"},d=`
	color-input--swatch
	after:content-vertical-holder
	min-w-4
	flex-1
	relative
	before:content-['']
	before:absolute
	before:inset-0
	before:bg-transparency-squares
	before:z-[-1]
`,ne=Object.assign({name:"LibColorInput"},{__name:"WColorInput",props:q({label:{type:String,required:!1},id:{type:String,required:!1},allowAlpha:{type:Boolean,required:!1,default:!0},border:{type:Boolean,required:!1,default:!0},copyTransform:{type:Function,required:!1,default:(e,r)=>r},stringPrecision:{type:Number,required:!1,default:3},customRepresentation:{type:Object,required:!1,default:void 0}},{modelValue:{type:Object,required:!1,default:()=>({r:0,g:0,b:0})},modelModifiers:{},tempValue:{type:null,required:!1,default:()=>{}},tempValueModifiers:{}}),emits:q(["save","cancel"],["update:modelValue","update:tempValue"]),setup(e,{emit:r}){const g=K(),w=L(),c=r;function O(){s.value=i.value,t.value=!1,a.value=void 0,c("save")}function z(){t.value=!1,a.value=void 0,c("cancel")}const y=A(),s=S(e,"modelValue",{type:Object,required:!1,default:()=>({r:0,g:0,b:0})}),a=S(e,"tempValue",{type:null,required:!1,default:()=>{}}),n=$(()=>new k("srgb",[s.value.r/255,s.value.g/255,s.value.b/255],s.value.a??1).toString()),V=$(()=>a.value?new k("srgb",[a.value.r/255,a.value.g/255,a.value.b/255],a.value.a??1).toString():""),i=x({...s.value}),t=x(!1),U=()=>{t.value&&(s.value=i.value),t.value=!t.value};return(C,o)=>(p(),v(J,{class:"color-input--popup",modelValue:t.value,"onUpdate:modelValue":o[2]||(o[2]=u=>t.value=u),onClose:o[3]||(o[3]=u=>{a.value=void 0,c("cancel")})},{button:f(({extractEl:u})=>[h((p(),v(D,B({id:e.id??l(g),class:l(T)(`
				p-0
				color-input--button
				flex flex-nowrap
				min-w-4
				overflow-hidden
				[&_.button--label]:items-stretch
				[&_.button--label]:gap-0
				after:hidden
			`,l(y).class),"aria-label":l(w)("color-input.aria-and-title-prefix")+n.value,title:l(w)("color-input.aria-and-title-prefix")+n.value},{...l(y),class:void 0},{onClick:U}),{label:f(()=>[b("div",Q,[I(C.$slots,"default",j(F({stringColor:n.value,classes:d})),()=>[b("div",{class:R(d),style:M(`background:${n.value}`)},null,4)]),a.value?I(C.$slots,"temp",j(B({key:0},{tempStringColor:V.value,classes:d})),()=>[b("div",{class:R(d),style:M(`background:${V.value}`)},null,4)]):P("",!0)])]),_:3},16,["id","class","aria-label","title"])),[[l(N),u]])]),popup:f(({extractEl:u})=>[h((p(),E("div",W,[t.value?(p(),v(H,{key:0,id:e.id??l(g),"allow-alpha":e.allowAlpha,"custom-representation":e.customRepresentation,"string-precision":e.stringPrecision,modelValue:i.value,"onUpdate:modelValue":o[0]||(o[0]=m=>i.value=m),"temp-value":a.value,"onUpdate:tempValue":o[1]||(o[1]=m=>a.value=m),onSave:O,onCancel:z},null,8,["id","allow-alpha","custom-representation","string-precision","modelValue","temp-value"])):P("",!0)])),[[l(N),u]])]),_:3},8,["modelValue"]))}});export{ne as default};
