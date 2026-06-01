import{C as c}from"./475SGCPX.js";import{u as g}from"./0FXSfoKy.js";import{a as w}from"./D3iVoR1_.js";import C from"./CFl5zPZM.js";import{C as h,K as y,w as V,J as p,G as t,y as m,o as S,a as s,D as d,E as f,F as x,af as b,I as v,H as _}from"./weshC9XZ.js";import"./BuX2WBq9.js";import"./BhoX2VZY.js";const $={class:"color-input--swatch-wrapper flex w-full"},r=`
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
`,A={__name:"WColorSwatchButton",props:{id:{type:String,required:!1},tempValue:{type:null,required:!0},value:{type:Object,required:!0}},setup(l){const o=h(),n=g(),e=l,a=m(()=>new c("srgb",[e.value.r/255,e.value.g/255,e.value.b/255],e.value.a??1).toString()),i=m(()=>e.tempValue?new c("srgb",[e.tempValue.r/255,e.tempValue.g/255,e.tempValue.b/255],e.tempValue.a??1).toString():"");return(u,k)=>(S(),y(C,p({id:l.id,class:t(w)(`
		color-input--button
		p-0
		flex
		flex-nowrap
		min-w-4
		overflow-hidden
		[&_.button--label]:items-stretch
		[&_.button--label]:gap-0
		after:hidden
	`,t(o).class),"aria-label":t(n)("color-input.aria-and-title-prefix")+a.value,title:t(n)("color-input.aria-and-title-prefix")+a.value},{...t(o),class:void 0}),{label:V(()=>[s("div",$,[d(u.$slots,"default",f(x({stringColor:a.value,classes:r})),()=>[s("div",{class:v(r),style:b(`background:${a.value}`)},null,4)]),l.tempValue?d(u.$slots,"temp",f(p({key:0},{tempStringColor:i.value,classes:r})),()=>[s("div",{class:v(r),style:b(`background:${i.value}`)},null,4)]):_("",!0)])]),_:3},16,["id","class","aria-label","title"]))}};export{A as default};
