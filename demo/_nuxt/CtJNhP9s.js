import{H as k,I as M,K as h,r as g,j as R,a2 as q,aT as C,aU as T,e as j,o as K,v as U,x as $,y as B,$ as z,O as o,U as p,z as A,T as O,af as P,aq as D,R as F,aS as E}from"./CqkgKk0K.js";const H=["id","aria-disabled","aria-readonly","tabindex","title"],N={class:"recorder--value before:content-vertical-holder truncate"},G=Object.assign({name:"LibRecorder",inheritAttrs:!1},{__name:"WRecorder",props:k({id:{type:String,required:!1,default:void 0},disabled:{type:Boolean,required:!1,default:!1},readonly:{type:Boolean,required:!1,default:!1},border:{type:Boolean,required:!1,default:!0},unstyle:{type:Boolean,required:!1,default:!1},label:{type:String,required:!1},recordingValue:{type:String,required:!1},recordingTitle:{type:String,required:!1,default:""},recorder:{type:null,required:!1,default:void 0},binders:{type:null,required:!1,default:void 0}},{recording:{type:Boolean,required:!1,default:!1},recordingModifiers:{},modelValue:{type:String,required:!0},modelModifiers:{}}),emits:k(["recorder:blur","recorder:click","focus:parent"],["update:recording","update:modelValue"]),setup(r,{emit:I}){const L=M(),u=I,S=F(),e=r,l=h(r,"recording",{type:Boolean,required:!1,default:!1}),c=h(r,"modelValue",{type:String,required:!0}),d=g(null),y=g(null),f=R(()=>!e.disabled&&!e.readonly),b=g(c.value);q([()=>e.binders,()=>e.binders],()=>{if(l.value)throw new Error("Component was not designed to allow swapping out of binders/recorders while recording")}),q(c,()=>{b.value=c.value});const V=C(e),i={};let s=!1;const v=()=>{if(s){if(s=!1,e.recorder)for(const a of E(i))d.value?.removeEventListener(a,i[a]),delete i[a];e.binders&&d.value&&e.binders.unbind(d.value)}},m=()=>{if(!e.recorder&&!e.binders)throw new Error("Record is true but no recorder or binders props was passed");if(e.recorder&&e.binders)throw new Error("Recording is true and was passed both a recorder and a binders prop. Both cannot be used at the same time.");if(s=!0,e.recorder)for(const a of E(e.recorder))d.value?.addEventListener(a,e.recorder[a],{passive:!1}),i[a]=e.recorder[a];e.binders&&d.value&&e.binders.bind(d.value)};T(()=>{if(!f.value){v(),l.value=!1;return}l.value?m():(e.recorder||e.binders)&&s&&(v(),u("focus:parent"))}),j(()=>{v()}),K(()=>{l.value&&m()});const x=a=>{f.value&&(e.recorder||e.binders)&&u("recorder:blur",a)},w=(a,t=!1)=>{if(f.value&&(l.value||d.value?.focus(),e.recorder||e.binders)){if(t)return;u("recorder:click",{event:a,indicator:y.value,input:d.value})}};return(a,t)=>($(),U("div",O({id:r.id??o(S),class:o(p)(`recorder
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
		`,a.$attrs.class),"aria-disabled":r.disabled,"aria-readonly":r.readonly,tabindex:r.disabled?-1:0,title:l.value?r.recordingTitle:b.value,contenteditable:"false",ref_key:"recorderEl",ref:d},{...o(V),...a.$attrs,class:void 0},{onBlur:t[0]||(t[0]=n=>x(n)),onClick:t[1]||(t[1]=n=>w(n)),onKeydown:t[2]||(t[2]=P(D(n=>w(n,!0),["prevent"]),["space"]))}),[B("div",{class:z(o(p)(`recorder--indicator
				inline-block
				bg-red-700
				rounded-full
				w-[1em]
				h-[1em]
				shrink-0
				hover:bg-red-500
			`,l.value&&`
				animate-blinkInf
				bg-red-500
			`,(r.disabled||r.readonly)&&`
				bg-neutral-500
			`)),ref_key:"recorderIndicatorEl",ref:y},null,2),B("div",N,A(l.value?r.recordingValue??o(L)("recorder.recording"):b.value),1)],16,H))}});export{G as default};
