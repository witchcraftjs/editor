import{C as q}from"./475SGCPX.js";import{u as N}from"./0nEvwRti.js";import{v as $}from"./DETW6UcW.js";import{a as U}from"./9cslYIr4.js";import D from"./Du8JU2h8.js";import F from"./BMt2QerX.js";import T from"./D3gjZ4x8.js";import{g as H}from"./CRo8hmbH.js";import{a6 as k,a1 as L,a7 as S,p as h,v as x,C as v,w as f,o as n,X as P,c as W,E as B,q as a,D as I,a as b,H as j,R as M,S as X,a2 as R,Z as z}from"./ChiTXbtN.js";import"./Bk2TiR2_.js";import"./BhoX2VZY.js";import"./DB0SWIft.js";import"./9KPRJcE2.js";import"./B9Vz3BzZ.js";import"./C2kFLJyf.js";import"./CD0Jx8XC.js";import"./66w8nu5J.js";import"./BnYT1Eep.js";import"./XcYfSkWd.js";import"./CQ5ND8ze.js";const Z={class:"color-input--swatch-wrapper flex w-full"},G={class:"color-input--popup-wrapper p-5"},p=`
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
`,fe=Object.assign({name:"LibColorInput"},{__name:"WColorInput",props:k({label:{type:String,required:!1},id:{type:String,required:!1},allowAlpha:{type:Boolean,required:!1,default:!0},border:{type:Boolean,required:!1,default:!0},copyTransform:{type:Function,required:!1,default:(l,d)=>d},stringPrecision:{type:Number,required:!1,default:3},customRepresentation:{type:Object,required:!1,default:void 0}},{modelValue:{type:Object,required:!1,default:()=>({r:0,g:0,b:0})},modelModifiers:{},tempValue:{type:null,required:!1,default:()=>{}},tempValueModifiers:{}}),emits:k(["save","cancel"],["update:modelValue","update:tempValue"]),setup(l,{emit:d}){const g=H(),w=N(),m=d;function E(){r.value=i.value,t.value=!1,e.value=void 0,m("save")}function O(){t.value=!1,e.value=void 0,m("cancel")}const y=L(),r=S(l,"modelValue",{type:Object,required:!1,default:()=>({r:0,g:0,b:0})}),e=S(l,"tempValue",{type:null,required:!1,default:()=>{}}),u=h(()=>new q("srgb",[r.value.r/255,r.value.g/255,r.value.b/255],r.value.a??1).toString()),V=h(()=>e.value?new q("srgb",[e.value.r/255,e.value.g/255,e.value.b/255],e.value.a??1).toString():""),i=x({...r.value}),t=x(!1),A=()=>{t.value&&(r.value=i.value),t.value=!t.value};return(C,o)=>(n(),v(T,{class:"color-input--popup",modelValue:t.value,"onUpdate:modelValue":o[2]||(o[2]=s=>t.value=s),onClose:o[3]||(o[3]=s=>{e.value=void 0,m("cancel")})},{button:f(({extractEl:s})=>[P((n(),v(D,I({id:l.id??a(g),class:a(U)(`
				p-0
				color-input--button
				flex flex-nowrap
				min-w-4
				overflow-hidden
				[&_.button--label]:items-stretch
				[&_.button--label]:gap-0
				after:hidden
			`,a(y).class),"aria-label":a(w)("color-input.aria-and-title-prefix")+u.value,title:a(w)("color-input.aria-and-title-prefix")+u.value},{...a(y),class:void 0},{onClick:A}),{label:f(()=>[b("div",Z,[j(C.$slots,"default",M(X({stringColor:u.value,classes:p})),()=>[b("div",{class:z(p),style:R(`background:${u.value}`)},null,4)]),e.value?j(C.$slots,"temp",M(I({key:0},{tempStringColor:V.value,classes:p})),()=>[b("div",{class:z(p),style:R(`background:${V.value}`)},null,4)]):B("",!0)])]),_:3},16,["id","class","aria-label","title"])),[[a($),s]])]),popup:f(({extractEl:s})=>[P((n(),W("div",G,[t.value?(n(),v(F,{key:0,id:l.id??a(g),"allow-alpha":l.allowAlpha,"custom-representation":l.customRepresentation,"string-precision":l.stringPrecision,modelValue:i.value,"onUpdate:modelValue":o[0]||(o[0]=c=>i.value=c),"temp-value":e.value,"onUpdate:tempValue":o[1]||(o[1]=c=>e.value=c),onSave:E,onCancel:O},null,8,["id","allow-alpha","custom-representation","string-precision","modelValue","temp-value"])):B("",!0)])),[[a($),s]])]),_:3},8,["modelValue"]))}});export{fe as default};
