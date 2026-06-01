import{d as y,D as k,a as D,b as v,c as $}from"./DjyHujoM.js";import{D as P,a as C,b as V}from"./LN_02ivl.js";import{a as m}from"./D3iVoR1_.js";import w from"./CFl5zPZM.js";import{aa as S,K as i,w as a,J as c,G as e,ab as q,o as d,D as s,H as u,b as r,a as g,I as x,d as p,t as b}from"./weshC9XZ.js";import"./DqNJVvha.js";import"./CHIgUVhi.js";import"./C5KsR5Pl.js";import"./M4G4lci2.js";import"./De61VJgk.js";import"./Dhv9TLvP.js";import"./JpF96Mwm.js";import"./FUKBWQwh.js";import"./BhoX2VZY.js";const K=Object.assign({name:"WPopup",inheritAttrs:!1},{__name:"WPopup",props:q({title:{type:String,required:!1},description:{type:String,required:!1},backdropClass:{type:String,required:!1},contentProps:{type:Object,required:!1},rootProps:{type:Object,required:!1},to:{type:String,required:!1,default:"#root"}},{modelValue:{type:Boolean,default:!1},modelModifiers:{}}),emits:["update:modelValue"],setup(t){const n=S(t,"modelValue",{type:Boolean,default:!1});return(o,l)=>(d(),i(e(y),c(t.rootProps,{open:n.value,"onUpdate:open":l[1]||(l[1]=f=>n.value=f)}),{default:a(()=>[o.$slots.button?(d(),i(e(P),{key:0,"as-child":""},{default:a(()=>[s(o.$slots,"button")]),_:3})):u("",!0),r(e(C),{to:t.to},{default:a(()=>[r(e(k),{"as-child":""},{default:a(()=>[s(o.$slots,"backdrop",{class:"popup--backdrop absolute inset-0 bg-black/50"},()=>[l[2]||(l[2]=g("div",{class:"popup--backdrop absolute inset-0 bg-black/50"},null,-1))])]),_:3}),r(e(D),c({...t.contentProps,class:void 0},{class:e(m)(`
				popup--content
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
				p-5
			`,t.contentProps?.class)}),{default:a(()=>[g("div",{class:x(e(m)(`
					popup--content-inner
					flex
					flex-col
					bg-neutral-100
					dark:bg-neutral-800
					rounded-md
					flex
					flex-col
					gap-3
					p-2
				`))},[s(o.$slots,"popup",{},()=>[s(o.$slots,"title",{},()=>[t.title?(d(),i(e(v),{key:0,class:"text-lg font-bold"},{default:a(()=>[p(b(t.title),1)]),_:1})):u("",!0)]),s(o.$slots,"description",{},()=>[t.description?(d(),i(e($),{key:0},{default:a(()=>[p(b(t.description),1)]),_:1})):u("",!0)]),s(o.$slots,"extra")]),r(e(V),{"as-child":""},{default:a(()=>[s(o.$slots,"close",{},()=>[r(w,{class:"justify-self-end",onClick:l[0]||(l[0]=f=>n.value=!1)},{default:a(()=>[...l[3]||(l[3]=[p(" Close ",-1)])]),_:1})])]),_:3})],2)]),_:3},16,["class"])]),_:3},8,["to"])]),_:3},16,["open"]))}});export{K as default};
