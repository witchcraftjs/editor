import{A as E,c as n,o as r,a as o,v as I,ay as W,B as q,p as V,E as u,Z as A,q as e,H as B,t as m,D as R,F as Q,G as Y,L as _,b as p,w as k}from"./ChiTXbtN.js";import{I as ee}from"./B6qcY32u.js";import{u as te}from"./CxzPWhlJ.js";import{u as le}from"./0nEvwRti.js";import{a as x}from"./9cslYIr4.js";import C from"./66w8nu5J.js";import ie from"./Du8JU2h8.js";import{g as se}from"./CRo8hmbH.js";import"./B39yYSFt.js";import"./Bk2TiR2_.js";import"./BhoX2VZY.js";import"./DB0SWIft.js";const ae={style:{"vertical-align":"-0.125em",height:"1em",display:"inline-block",width:"auto"},viewBox:"0 0 384 512"};function ne(t,d){return r(),n("svg",ae,[...d[0]||(d[0]=[o("path",{fill:"currentColor",d:"M320 464c8.8 0 16-7.2 16-16V160h-80c-17.7 0-32-14.3-32-32V48H64c-8.8 0-16 7.2-16 16v384c0 8.8 7.2 16 16 16zM0 64C0 28.7 28.7 0 64 0h165.5c17 0 33.3 6.7 45.3 18.7l90.5 90.5c12 12 18.7 28.3 18.7 45.3V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64z"},null,-1)])])}const re=E({name:"fa6-regular-file",render:ne}),oe={style:{"vertical-align":"-0.125em",height:"1em",display:"inline-block",width:"auto"},viewBox:"0 0 448 512"};function ce(t,d){return r(),n("svg",oe,[...d[0]||(d[0]=[o("path",{fill:"currentColor",d:"M246.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l73.4-73.4V320c0 17.7 14.3 32 32 32s32-14.3 32-32V109.3l73.4 73.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-128-128zM64 352c0-17.7-14.3-32-32-32S0 334.3 0 352v64c0 53 43 96 96 96h256c53 0 96-43 96-96v-64c0-17.7-14.3-32-32-32s-32 14.3-32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32z"},null,-1)])])}const fe=E({name:"fa6-solid-arrow-up-from-bracket",render:ce}),ue=["for"],de={class:"text-ellipsis overflow-hidden shrink-1 hidden @min-[15ch]:block"},me={key:1,class:"file-input--label-count"},pe={key:2,class:"file-input--label-name text-ellipsis overflow-hidden shrink-9999 hidden @3xs:block"},he={key:3,class:"file-input--label-name text-ellipsis overflow-hidden shrink-9999 @3xs:hidden"},ve={key:0,class:"file-input--formats-label flex-col items-center text-sm max-w-full hidden @min-[15ch]:flex"},ge={class:"text-ellipsis overflow-hidden max-w-full"},xe={class:"file-input--formats-list overflow-hidden text-ellipsis max-w-full"},we=["id","accept","multiple"],be={class:"flex flex-initial basis-full justify-start items-center max-w-full gap-2 px-1"},ye=["title"],ke={class:"file-input--preview flex flex-initial basis-full justify-center"},$e={key:0,class:"file-input--preview-image bg-transparency-squares flex h-[80px] flex-wrap items-center justify-center"},Fe=["src"],je={key:1,class:"file-input--preview-no-image flex h-[80px] flex-1 basis-full flex-wrap items-center justify-center"},Ie={name:"LibFileInput"},Ve=Object.assign(Ie,{name:"LibFileInput",inheritAttrs:!1},{props:{id:{type:String,required:!1},multiple:{type:Boolean,required:!1,default:!1},formats:{type:Array,required:!1,default:()=>["image/*",".jpeg",".jpg",".png"]},compact:{type:Boolean,required:!1,default:!1}},emits:["input","errors"],setup(t,{expose:d,emit:H}){const v=le(),h=I(null),s=W([]),c=W([]),$=I(!1),w=I(!1);function D(){h.value.value="",s.splice(0,s.length)}q(s,()=>{T("input",s.map(l=>l.file),D)}),q(c,()=>{c.length>0&&($.value=!0,setTimeout(()=>{$.value=!1},500),T("errors",[...c]),c.splice(0,c.length))});const g=te(["wrapper","input","previews"]),T=H,L=se(),b=t,O=V(()=>b.formats?.filter(l=>!l.startsWith("."))??[]),F=V(()=>b.formats?.filter(l=>l.startsWith("."))??[]),U=l=>URL.createObjectURL(l),N=l=>{const a=s.indexOf(l);s.splice(a,1)},P=V(()=>F.value.join(", "));function G(l){if("dataTransfer"in l&&l.dataTransfer&&l.dataTransfer.files&&l.dataTransfer.files.length>0)return h.value.files=l.dataTransfer.files,l.preventDefault(),w.value=!1,M(h.value.files)}async function X(l){if(l.preventDefault(),h.value.files)return M(h.value.files)}function M(l){const a=[];for(const i of l){const j=i.type.startsWith("image"),Z=b.formats.length===0,z=O.value.find(f=>f.endsWith("/*")?i.type.startsWith(f.slice(0,-2)):f===i.type)!==void 0,S=F.value.find(f=>i.name.endsWith(f))!==void 0;if(!Z&&(!z||!S)){const f=i.name.match(/.*(\..*)/)?.[1]??"Unknown",J=i.type===""?"":` (${i.type})`,K=`File type ${f}${J} is not allowed. Allowed file types are: ${P.value}.`,y=new Error(K);y.file=i,y.isValidExtension=S,y.isValidMimeType=z,a.push(y);continue}a.length>0||s.find(f=>f.file===i)||(b.multiple||s.length<1?s.push({file:i,isImg:j}):s.splice(0,s.length,{file:i,isImg:j}))}if(a.length>0)return c.splice(0,c.length,...a),!1;c.length>0&&c.splice(0,c.length)}return d({clearFiles:D}),(l,a)=>(r(),n("div",R({class:e(x)(`
		file-input
		justify-center
		border-2
		border-dashed
		border-accent-500/80
		focus-outline-within
		transition-[border-color,box-shadow]
		ease-out
		hover:bg-accent-500/10
		outlined-focus-within
	`,t.compact&&"rounded-sm",!t.compact&&`
			flex
			w-full
			flex-col
			items-stretch
			gap-2
			rounded-xl
			p-2
		`,e(c).length>0&&$.value&&"border-danger-400",w.value&&"bg-accent-500/10",e(g).wrapperAttrs.class)},{...e(g).wrapperAttrs,class:void 0},{onDrop:G,onDragover:a[1]||(a[1]=_(i=>w.value=!0,["prevent"])),onDragleave:a[2]||(a[2]=i=>w.value=!1)}),[o("div",{class:A(e(x)(`
			file-input--wrapper
			relative
			justify-center
			@container
		`,t.compact&&"flex gap-2",!t.compact&&`
				file-input
				flex
				flex-col
				items-center
			`))},[o("label",{for:t.id??e(L),class:A(e(x)(`
				file-input--label
				pointer-events-none
				flex
				gap-1
				items-center
				justify-center
				whitespace-nowrap
				max-w-full
			`))},[t.compact||t.multiple||e(s).length===0?B(l.$slots,"icon",{key:0},()=>[p(C,null,{default:k(()=>[p(e(fe))]),_:1})]):u("",!0),B(l.$slots,"label",{},()=>[o("div",de,m(t.compact?t.multiple?e(v)("file-input.compact-choose-file-plural"):e(v)("file-input.compact-choose-file"):t.multiple?e(v)("file-input.non-compact-choose-file-plural"):e(v)("file-input.non-compact-choose-file")),1)]),t.compact&&t.multiple?(r(),n("div",me,m(` (${e(s).length})`),1)):u("",!0),t.compact&&!t.multiple&&e(s).length>0?(r(),n("div",pe,m(` (${e(s)[0]?.file.name})`),1)):u("",!0),t.compact&&!t.multiple&&e(s).length>0?(r(),n("div",he,m(" (...)"))):u("",!0)],10,ue),!t.compact&&t.formats?.length>0?(r(),n("label",ve,[B(l.$slots,"formats",{},()=>[o("div",ge,m(e(v)("file-input.accepted-formats"))+":",1)]),o("div",xe,m(F.value.join(", ")),1)])):u("",!0),o("input",R({id:t.id??e(L),class:e(x)(`
				file-input--input
				absolute
				inset-[calc(var(--spacing)*-2)]
				cursor-pointer
				z-0
				text-[0]
				opacity-0
			`,e(g).inputAttrs?.class),type:"file",accept:t.formats.join(", "),multiple:t.multiple,ref_key:"el",ref:h},{...e(g).inputAttrs,class:void 0},{onInput:X,onClick:a[0]||(a[0]=i=>i.target.value=null)}),null,16,we)],2),!t.compact&&e(s).length>0?(r(),n("div",{key:0,class:A(e(x)(`file-input--previews
			flex items-stretch justify-center gap-4 flex-wrap
			`,t.multiple&&`
				w-full
			`,e(g).previewsAttrs?.class))},[(r(!0),n(Q,null,Y(e(s),i=>(r(),n("div",{class:"file-input--preview-wrapper z-1 relative flex min-w-0 max-w-[150px] flex-initial flex-col items-center gap-1 p-1 rounded-sm border border-neutral-300 dark:border-neutral-800 shadow-md shadow-neutral-800/30 bg-neutral-100 dark:bg-neutral-900 [&:hover_.file-input--remove-button]:opacity-100",key:i.file.name},[o("div",be,[p(ie,{border:!1,class:"file-input--remove-button rounded-full p-0","aria-label":`Remove file ${i.file.name}`,onClick:j=>N(i)},{default:k(()=>[p(C,null,{default:k(()=>[p(e(ee))]),_:1})]),_:1},8,["aria-label","onClick"]),o("div",{class:"file-input--preview-filename min-w-0 flex-1 basis-0 truncate break-all rounded-sm text-sm",title:i.file.name},m(i.file.name),9,ye)]),o("div",ke,[i.isImg?(r(),n("div",$e,[o("img",{class:"max-h-full w-auto",src:U(i.file)},null,8,Fe)])):u("",!0),i.isImg?u("",!0):(r(),n("div",je,[p(C,null,{default:k(()=>[p(e(re),{class:"text-4xl opacity-50"})]),_:1})]))])]))),128))],2)):u("",!0)],16))}}),Ee=Object.assign(Ve,{__name:"WFileInput"});export{Ee as default};
