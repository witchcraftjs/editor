import{Nt as e,On as t,Qn as n,_ as r,er as i,et as a,g as o,mt as s,qt as c,tr as l,v as u,xt as d,y as f,z as p}from"./CoKk4mC0.js";import{t as m}from"./CTrY3BHI.js";import{t as h}from"./adLheOrI.js";import{n as g}from"./M5icC9NJ.js";import{t as _}from"./C9F7w7wr.js";var v={class:`color-input--swatch-wrapper flex w-full`},y=`
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
`,b={__name:`WColorSwatchButton`,props:{id:{type:String,required:!1},tempValue:{type:null,required:!0},value:{type:Object,required:!0}},setup(b){let x=e(),S=h(),C=b,w=o(()=>new _(`srgb`,[C.value.r/255,C.value.g/255,C.value.b/255],C.value.a??1).toString()),T=o(()=>C.tempValue?new _(`srgb`,[C.tempValue.r/255,C.tempValue.g/255,C.tempValue.b/255],C.tempValue.a??1).toString():``);return(e,o)=>(s(),u(g,a({id:b.id,class:t(m)(`
		color-input--button
		p-0
		flex
		flex-nowrap
		min-w-4
		overflow-hidden
		[&_.button--label]:items-stretch
		[&_.button--label]:gap-0
		after:hidden
	`,t(x).class),"aria-label":t(S)(`color-input.aria-and-title-prefix`)+w.value,title:t(S)(`color-input.aria-and-title-prefix`)+w.value},{...t(x),class:void 0}),{label:c(()=>[r(`div`,v,[d(e.$slots,`default`,i(p({stringColor:w.value,classes:y})),()=>[r(`div`,{class:n(y),style:l(`background:${w.value}`)},null,4)]),b.tempValue?d(e.$slots,`temp`,i(p({tempStringColor:T.value,classes:y})),()=>[r(`div`,{class:n(y),style:l(`background:${T.value}`)},null,4)],void 0,0):f(``,!0)])]),_:3},16,[`id`,`class`,`aria-label`,`title`]))}};export{b as default};