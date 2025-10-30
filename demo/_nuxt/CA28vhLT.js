import{H as k,J as p,r as m,j as S,Y as h,aL as R,e as j,o as C,v as K,x as P,y as q,V as z,N as n,Q as B,z as A,P as N,a8 as T,aj as $,aK as E}from"./Cql2C_go.js";import{u as D}from"./2QWzZFR8.js";import{u as F}from"./DJrPe1XC.js";import{g as H}from"./DMGTKRWK.js";import"./Bk2TiR2_.js";const J=["id","aria-disabled","aria-readonly","tabindex","title"],O={class:"recorder--value before:content-vertical-holder truncate"},X=Object.assign({name:"LibRecorder",inheritAttrs:!1},{__name:"WRecorder",props:k({id:{type:String,required:!1,default:void 0},disabled:{type:Boolean,required:!1,default:!1},readonly:{type:Boolean,required:!1,default:!1},border:{type:Boolean,required:!1,default:!0},unstyle:{type:Boolean,required:!1,default:!1},label:{type:String,required:!1},recordingValue:{type:String,required:!1},recordingTitle:{type:String,required:!1,default:""},recorder:{type:null,required:!1,default:void 0},binders:{type:null,required:!1,default:void 0}},{recording:{type:Boolean,required:!1,default:!1},recordingModifiers:{},modelValue:{type:String,required:!0},modelModifiers:{}}),emits:k(["recorder:blur","recorder:click","focus:parent"],["update:recording","update:modelValue"]),setup(r,{emit:L}){const V=F(),u=L,x=H(),e=r,t=p(r,"recording",{type:Boolean,required:!1,default:!1}),c=p(r,"modelValue",{type:String,required:!0}),d=m(null),g=m(null),f=S(()=>!e.disabled&&!e.readonly),b=m(c.value);h([()=>e.binders,()=>e.binders],()=>{if(t.value)throw new Error("Component was not designed to allow swapping out of binders/recorders while recording")}),h(c,()=>{b.value=c.value});const I=D(e),i={};let s=!1;const v=()=>{if(s){if(s=!1,e.recorder)for(const a of E(i))d.value?.removeEventListener(a,i[a]),delete i[a];e.binders&&d.value&&e.binders.unbind(d.value)}},y=()=>{if(!e.recorder&&!e.binders)throw new Error("Record is true but no recorder or binders props was passed");if(e.recorder&&e.binders)throw new Error("Recording is true and was passed both a recorder and a binders prop. Both cannot be used at the same time.");if(s=!0,e.recorder)for(const a of E(e.recorder))d.value?.addEventListener(a,e.recorder[a],{passive:!1}),i[a]=e.recorder[a];e.binders&&d.value&&e.binders.bind(d.value)};R(()=>{if(!f.value){v(),t.value=!1;return}t.value?y():(e.recorder||e.binders)&&s&&(v(),u("focus:parent"))}),j(()=>{v()}),C(()=>{t.value&&y()});const M=a=>{f.value&&(e.recorder||e.binders)&&u("recorder:blur",a)},w=(a,o=!1)=>{if(f.value&&(t.value||d.value?.focus(),e.recorder||e.binders)){if(o)return;u("recorder:click",{event:a,indicator:g.value,input:d.value})}};return(a,o)=>(P(),K("div",N({id:r.id??n(x),class:n(B)(`recorder
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
		`,a.$attrs.class),"aria-disabled":r.disabled,"aria-readonly":r.readonly,tabindex:r.disabled?-1:0,title:t.value?r.recordingTitle:b.value,contenteditable:"false",ref_key:"recorderEl",ref:d},{...n(I),...a.$attrs,class:void 0},{onBlur:o[0]||(o[0]=l=>M(l)),onClick:o[1]||(o[1]=l=>w(l)),onKeydown:o[2]||(o[2]=T($(l=>w(l,!0),["prevent"]),["space"]))}),[q("div",{class:z(n(B)(`recorder--indicator
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
			`)),ref_key:"recorderIndicatorEl",ref:g},null,2),q("div",O,A(t.value?r.recordingValue??n(V)("recorder.recording"):b.value),1)],16,J))}});export{X as default};
