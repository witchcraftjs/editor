import{C as x,p as k,K as c,w as f,T as b,r as B,o as u,c as C,J as H,G as i,a as s,D as h,t as g,H as p}from"./weshC9XZ.js";import{c as w}from"./krPynjdP.js";import{u as S}from"./B8YfHvdD.js";import{a as V}from"./D3iVoR1_.js";const q=["data-value","aria-valuenow","aria-valuemin","aria-valuemax","aria-label"],N={class:"progress-bar--label-wrapper relative flex-1 z-3","aria-hidden":"true"},O={class:"progress-bar--bottom-label text-black dark:text-white absolute inset-0 flex justify-center px-2"},W={class:"truncate"},z={class:"progress-bar--top-label pointer-events-none absolute inset-0 flex justify-center transition-all duration-500 text-white [clip-path:inset(0_calc(100%-var(--progress))_0_0)] px-2"},T={class:"truncate"},E=Object.assign({name:"WProgressBar",inheritAttrs:!1},{__name:"WProgressBar",props:{label:{type:String,required:!1},progress:{type:Number,required:!0},autohideOnComplete:{type:Number,required:!1,default:-1},keepSpaceWhenHidden:{type:Boolean,required:!1,default:!1},clamp:{type:Array,required:!1,default:()=>[0,100]}},setup(e){const m=x(),a=e,t=B("visible");let n=null;function v(l=!1,r){const d=a.progress>=100||a.progress<0;if(!(a.autohideOnComplete>-1&&d)){n=null,t.value="visible";return}const o=a.keepSpaceWhenHidden?"pseudo":"hidden";if(l)t.value=o,n=o;else if(n!==o){n=o;const y=setTimeout(()=>{t.value=o},a.autohideOnComplete);r||S(),r(()=>clearTimeout(y))}}return v(!0),k([()=>[a.progress,a.keepSpaceWhenHidden,a.autohideOnComplete]],(l,r,d)=>{v(!1,d)}),(l,r)=>(u(),c(b,null,{default:f(()=>[t.value!=="hidden"?(u(),C("div",H({key:0,class:i(V)(`
			progress-bar
			w-[200px]
			whitespace-nowrap
			overflow-x-scroll
			scrollbar-hidden
			rounded-sm
			flex
			relative
			text-sm
			min-w-[50px]
			after:shadow-inner
			after:shadow-black/50
			after:content-['']
			after:absolute
			after:inset-0
			after:pointer-events-none
			after:z-2
			after:transition-all
			before:content-['']
			before:shadow-inner
			before:shadow-black/50
			before:rounded-sm
			before:bg-bars-gradient
			before:animate-slideBgInf
			before:[background-size:15px_15px]
			before:absolute
			before:w-[var(--progress)]
			before:top-0 before:bottom-0 before:left-0
			before:transition-all
			before:z-1
			before:duration-500
		`,t.value==="pseudo"&&`
			after:opacity-0
			before:opacity-0
		`,i(m).class),"data-value":e.progress,role:"progressbar","aria-valuenow":i(w)(e.progress,e.clamp[0]??0,e.clamp[1]??100),"aria-valuemin":e.clamp[0]??0,"aria-valuemax":e.clamp[1]??100,"aria-label":e.label},{...i(m),class:void 0},{style:`--progress: ${i(w)(e.progress,e.clamp[0]??0,e.clamp[1]??100)}%;`}),[s("div",N,[r[0]||(r[0]=s("span",{class:"before:content-vertical-holder"},null,-1)),t.value==="visible"?(u(),c(b,{key:0},{default:f(()=>[h(l.$slots,"default",{},()=>[s("div",O,[s("div",W,g(e.label??""),1)])])]),_:3})):p("",!0),t.value==="visible"?(u(),c(b,{key:1},{default:f(()=>[h(l.$slots,"default",{},()=>[s("div",z,[s("div",T,g(e.label??""),1)])])]),_:3})):p("",!0)])],16,q)):p("",!0)]),_:3}))}});export{E as default};
