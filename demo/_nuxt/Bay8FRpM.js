import{$ as e,D as t,E as n,Ft as r,On as i,Qn as a,_ as o,et as s,mt as c,nr as l,qt as u,v as d,xt as f,y as p}from"./CoKk4mC0.js";import{t as m}from"./CTrY3BHI.js";import{n as h}from"./M5icC9NJ.js";import{a as g,i as _,n as v,r as y,t as b}from"./AMlnEFG_2.js";import{n as x,r as S,t as C}from"./BoV09L9U2.js";var w=Object.assign({name:`WPopup`,inheritAttrs:!1},{__name:`WPopup`,props:e({title:{type:String,required:!1},description:{type:String,required:!1},backdropClass:{type:String,required:!1},contentProps:{type:Object,required:!1},rootProps:{type:Object,required:!1},to:{type:String,required:!1,default:`#root`},unstyle:{type:Boolean,required:!1}},{modelValue:{type:Boolean,default:!1},modelModifiers:{}}),emits:[`update:modelValue`],setup(e){let w=r(e,`modelValue`,{type:Boolean,default:!1});return(r,T)=>(c(),d(i(g),s(e.rootProps,{open:w.value,"onUpdate:open":T[1]||=e=>w.value=e}),{default:u(()=>[r.$slots.button?(c(),d(i(C),{key:0,"as-child":``},{default:u(()=>[f(r.$slots,`button`)]),_:3})):p(``,!0),t(i(x),{to:e.to},{default:u(()=>[t(i(v),{"as-child":``},{default:u(()=>[f(r.$slots,`backdrop`,{class:`popup--backdrop absolute inset-0 bg-black/50`},()=>[T[2]||=o(`div`,{class:`popup--backdrop absolute inset-0 bg-black/50`},null,-1)])]),_:3}),t(i(_),s({...e.contentProps,class:void 0},{class:i(m)(`
					popup--content-wrapper
					z-100
					focus:outline-none
					fixed
					top-1/2
					left-1/2
					-translate-x-1/2
					-translate-y-1/2
					animate-contentShow
					max-w-[100dvw]
					max-h-[100dvh]
					overflow-auto
					scrollbar-hidden
				`,!e.unstyle&&`
					p-5
					bg-neutral-100
					dark:bg-neutral-800
					rounded-md
				`,e.contentProps?.class)}),{default:u(()=>[o(`div`,{class:a(i(m)(`
					popup--content-inner
					flex
					flex-col
					gap-3
				`))},[f(r.$slots,`popup`,{},()=>[f(r.$slots,`title`,{},()=>[e.title?(c(),d(i(b),{key:0,class:`text-lg font-bold`},{default:u(()=>[n(l(e.title),1)]),_:1})):p(``,!0)]),f(r.$slots,`description`,{},()=>[e.description?(c(),d(i(y),{key:0},{default:u(()=>[n(l(e.description),1)]),_:1})):p(``,!0)]),f(r.$slots,`extra`)]),t(i(S),{"as-child":``},{default:u(()=>[f(r.$slots,`close`,{},()=>[t(h,{class:`justify-self-end`,onClick:T[0]||=e=>w.value=!1},{default:u(()=>[...T[3]||=[n(` Close `,-1)]]),_:1})])]),_:3})],2)]),_:3},16,[`class`])]),_:3},8,[`to`])]),_:3},16,[`open`]))}});export{w as default};