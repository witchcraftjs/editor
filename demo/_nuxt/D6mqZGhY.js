import{a6 as p,a7 as w,v as m,p as x,B as h,as as R,T as C,m as K,c as T,a as q,Z as j,q as n,t as A,D,K as P,L as $,o as z}from"./ChiTXbtN.js";import{k as B}from"./B39yYSFt.js";import{u as F}from"./DB0SWIft.js";import{u as N}from"./0nEvwRti.js";import{a as E}from"./9cslYIr4.js";import{g as O}from"./CRo8hmbH.js";import"./Bk2TiR2_.js";const U=["id","aria-disabled","aria-readonly","tabindex","title"],W={class:"recorder--value before:content-vertical-holder truncate"},_=Object.assign({name:"LibRecorder",inheritAttrs:!1},{__name:"WRecorder",props:p({id:{type:String,required:!1,default:void 0},disabled:{type:Boolean,required:!1,default:!1},readonly:{type:Boolean,required:!1,default:!1},border:{type:Boolean,required:!1,default:!0},unstyle:{type:Boolean,required:!1,default:!1},label:{type:String,required:!1},recordingValue:{type:String,required:!1},recordingTitle:{type:String,required:!1,default:""},recorder:{type:null,required:!1,default:void 0},binders:{type:null,required:!1,default:void 0}},{recording:{type:Boolean,required:!1,default:!1},recordingModifiers:{},modelValue:{type:String,required:!0},modelModifiers:{}}),emits:p(["recorder:blur","recorder:click","focus:parent"],["update:recording","update:modelValue"]),setup(r,{emit:L}){const V=N(),u=L,I=O(),e=r,t=w(r,"recording",{type:Boolean,required:!1,default:!1}),c=w(r,"modelValue",{type:String,required:!0}),d=m(null),g=m(null),f=x(()=>!e.disabled&&!e.readonly),b=m(c.value);h([()=>e.binders,()=>e.binders],()=>{if(t.value)throw new Error("Component was not designed to allow swapping out of binders/recorders while recording")}),h(c,()=>{b.value=c.value});const M=F(e),i={};let s=!1;const v=()=>{if(s){if(s=!1,e.recorder)for(const a of B(i))d.value?.removeEventListener(a,i[a]),delete i[a];e.binders&&d.value&&e.binders.unbind(d.value)}},y=()=>{if(!e.recorder&&!e.binders)throw new Error("Record is true but no recorder or binders props was passed");if(e.recorder&&e.binders)throw new Error("Recording is true and was passed both a recorder and a binders prop. Both cannot be used at the same time.");if(s=!0,e.recorder)for(const a of B(e.recorder))d.value?.addEventListener(a,e.recorder[a],{passive:!1}),i[a]=e.recorder[a];e.binders&&d.value&&e.binders.bind(d.value)};R(()=>{if(!f.value){v(),t.value=!1;return}t.value?y():(e.recorder||e.binders)&&s&&(v(),u("focus:parent"))}),C(()=>{v()}),K(()=>{t.value&&y()});const S=a=>{f.value&&(e.recorder||e.binders)&&u("recorder:blur",a)},k=(a,o=!1)=>{if(f.value&&(t.value||d.value?.focus(),e.recorder||e.binders)){if(o)return;u("recorder:click",{event:a,indicator:g.value,input:d.value})}};return(a,o)=>(z(),T("div",D({id:r.id??n(I),class:n(E)(`recorder
			flex items-center
			gap-2
			px-2
			grow-[999999]
			focus-outline-no-offset
			rounded-sm
		`,r.border&&`
			border
			border-neutral-500
			focus:border-accent-500
		`,(r.disabled||r.readonly)&&`
			text-neutral-400
			dark:text-neutral-600
		`,(r.disabled||r.readonly)&&r.border&&`
			bg-neutral-50
			dark:bg-neutral-950
			border-neutral-400
			dark:border-neutral-600
		`,a.$attrs.class),"aria-disabled":r.disabled,"aria-readonly":r.readonly,tabindex:r.disabled?-1:0,title:t.value?r.recordingTitle:b.value,contenteditable:"false",ref_key:"recorderEl",ref:d},{...n(M),...a.$attrs,class:void 0},{onBlur:o[0]||(o[0]=l=>S(l)),onClick:o[1]||(o[1]=l=>k(l)),onKeydown:o[2]||(o[2]=P($(l=>k(l,!0),["prevent"]),["space"]))}),[q("div",{class:j(n(E)(`recorder--indicator
				inline-block
				bg-red-700
				rounded-full
				w-[1em]
				h-[1em]
				shrink-0
				hover:bg-red-500
			`,t.value&&`
				animate-blinkInf
				bg-red-500
			`,(r.disabled||r.readonly)&&`
				bg-neutral-500
			`)),ref_key:"recorderIndicatorEl",ref:g},null,2),q("div",W,A(t.value?r.recordingValue??n(V)("recorder.recording"):b.value),1)],16,U))}});export{_ as default};
