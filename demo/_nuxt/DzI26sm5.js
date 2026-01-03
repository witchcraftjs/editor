import{V as E,A as H,c as y,o as h,a as g,a1 as M,p as I,v as K,m as z,T as F,E as v,H as S,C as O,R as $,D as C,q as u,b as k,w as P,Q as J,t as T,F as G,G as Q,K as U,L as W,S as N,Z as X}from"./ChiTXbtN.js";import{I as Y}from"./B6qcY32u.js";import{c as Z}from"./CD0Jx8XC.js";import{i as j}from"./BhoX2VZY.js";import{k as _}from"./B39yYSFt.js";import{a as R}from"./9cslYIr4.js";import B from"./66w8nu5J.js";import V from"./Du8JU2h8.js";function ee(t,e){let i="";for(let n=0;n<t.length;n++){const o=t[n];i+=o+(n<e.length?e[n]:"")}return i}function te(t){return t!==void 0}function ie(t,{tabs:e=!0,count:i=void 0}={}){let n=i;if(!te(n)){const a=e?/^[\t]*(?=[^\t])/gm:/^[ ]*(?=[^ ])/gm,l=t.match(a);if(l===null)return t;n=l.reduce((f,d)=>Math.min(f,d.length),1/0)}const o=n===1/0?"":n,s=new RegExp(`^${e?"\\t":" "}{0,${o}}`,"gm");return t.replace(s,"")}function ne(t){return t.replace(/(^\n*?(?=[^\n]|$))([\s\S]*?)(\n*?\s*?$)/,"$2")}function b(t,...e){return ie(ne(ee(t,e)))}function p(t,e=0,{first:i=!1}={}){const n=i?/(^|\n)/g:/\n/g,o="	".repeat(e),s=i?`$1${o}`:`
${o}`;return t.replace(n,s)}function q(t,e,i={}){const n=[...arguments[3]??[]];if(i.before){const s=e?e(t,n,"before"):t;i.save&&(t=s)}let o;if(Array.isArray(t)){const s=[];let a=0;for(const l of t){const f=[...n,a.toString()],d=typeof l=="object"&&l!==null?q(l,e,i,f):e?e(l,f):l;i.save&&d!==void 0&&s.push(d),a++}o=i.save?s:void 0}else if(t!==null){const s={};for(const a of _(t)){const l=[...n,a.toString()],f=t[a],d=typeof f=="object"&&f!==null?q(f,e,i,l):e?e(f,l):f;i.save&&d!==void 0&&(s[a]=d)}o=i.save?s:void 0}else if(t===null){const s=e?e(t,n):t;o=i.save?s:void 0}if(i.after){const s=e?e(o,n,"after"):o;i.save&&(o=s)}return o}function w(t,{oneline:e=!1,stringify:i=!1}={}){let n=t;return i&&(i===!0&&(i=o=>typeof o=="function"||typeof o=="symbol"?o.toString():o),n=q(t,(o,s)=>s.length===0?o:i(o),{save:!0,after:!0})),e?JSON.stringify(n,null,"|").replace(/\n\|*/g," "):JSON.stringify(n,null,"	")}function oe(t,e,i){t[e]=i}class D{timeout=5e3;debug=!1;id=0;queue;history;maxHistory=100;listeners=[];stringifier;constructor({timeout:e,stringifier:i,maxHistory:n}={}){this.queue=E([]),this.history=E([]),e&&(this.timeout=e),n&&(this.maxHistory=n),i&&(this.stringifier=i)}_checkEntry(e){if(e.cancellable!==void 0&&j(e.cancellable))throw new Error(b`Cancellable cannot be a blank string:
					${p(w(e),5)}
				`);if(!e.options.includes(e.default))throw new Error(b`Entry options does not include default option "${e.default}":
					${p(w(e),5)}
				`);if(e.cancellable){if(typeof e.cancellable=="string"&&!e.options.includes(e.cancellable))throw new Error(b`Entry options does not include cancellable option "${e.cancellable}":
						${p(w(e),6)}
					`)}else if(e.options.includes("Cancel"))throw new Error(b`You specified that the entry should not be cancellable, but the options include the "Cancel" option:
						${p(w(e),6)}
					`);if(e.timeout!==void 0&&!e.cancellable)throw new Error(b`Cannot timeout notification that is not cancellable:
					${p(w(e),5)}
					`);if(e.timeout!==void 0&&e.requiresAction)throw new Error(b`Cannot timeout notification that requires action:
					${p(w(e),5)}
					`);const i=e.dangerous.find(n=>!e.options.includes(n));if(e.dangerous!==void 0&&i)throw new Error(b`Dangerous options list contains an unknown option "${i}":
					${p(w(e),5)}
				`)}_createEntry(e){const i={requiresAction:!1,options:["Ok","Cancel"],default:"Ok",cancellable:e.cancellable,...e,component:e.component&&typeof e.component!="string"?H(e.component):void 0,dangerous:e.dangerous??[],timeout:e.timeout===!0?this.timeout:e.timeout!==void 0&&e.timeout!==!1?e.timeout:void 0};return(e.cancellable===!0||e.cancellable===void 0&&i.options?.includes("Cancel"))&&(i.cancellable="Cancel"),this._checkEntry(i),this.id++,i.id=this.id,i}async notify(e){const i=this._createEntry(e);i.promise=new Promise(n=>{i.resolve=n}),i.timeout!==void 0&&(i._timer={elapsedBeforePause:0},this.resume(i)),this.queue.push(i);for(const n of this.listeners)n(i,"added");return i.promise.then(n=>{i.resolution=n;for(const o of this.listeners)o(i,"resolved");if(this.history.push(i),this.history.length>this.maxHistory){this.history.splice(0,1);for(const o of this.listeners)o(i,"deleted")}return this.queue.splice(this.queue.indexOf(i),1),n})}pause(e){if(e.timeout===void 0)throw new Error(`Cannot pause notification with no timeout: ${e.id}`);if(e.isPaused)throw new Error(`Cannot pause notification that is already paused: ${e.id}`);e.isPaused=!0,clearTimeout(e._timer.id),e._timer.elapsedBeforePause+=Date.now()-e.startTime}resume(e){if(e.timeout===void 0)throw new Error(`Cannot resume notification with no timeout: ${e.id}`);e.isPaused=!1,e.startTime=Date.now();const i=e.timeout-e._timer.elapsedBeforePause;clearTimeout(e._timer.id),e._timer.id=setTimeout(()=>{e.resolve(e.cancellable)},i)}static resolveToDefault(e){e.resolve(e.default)}static dismiss(e){e.cancellable&&e.resolve(e.cancellable)}stringify(e){if(this.stringifier)return this.stringifier(e);let i="";return e.title&&(i+=`${e.title}
`),i+=`${e.message}
`,e.code&&(i+=`code:${e.code}
`),i}clear(){oe(this,"history",[])}}const se={style:{"vertical-align":"-0.125em",height:"1em",display:"inline-block",width:"auto"},viewBox:"0 0 448 512"};function ae(t,e){return h(),y("svg",se,[...e[0]||(e[0]=[g("path",{fill:"currentColor",d:"M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16h140.1l67.9 67.9V320c0 8.8-7.2 16-16 16m-192 48h192c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9l-67.8-67.9c-9-9-21.2-14.1-33.9-14.1H192c-35.3 0-64 28.7-64 64v256c0 35.3 28.7 64 64 64M64 128c-35.3 0-64 28.7-64 64v256c0 35.3 28.7 64 64 64h192c35.3 0 64-28.7 64-64v-32h-48v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16h32v-48z"},null,-1)])])}const le=H({name:"fa6-regular-copy",render:ae});function re(){const t=E({});function e(i,n){return t[i]=n,t[i]}return{slotVars:t,setSlotVar:e}}const ce=["data-id"],ue={class:"notification--header flex-reverse flex justify-between items-center"},fe={class:"actions flex"},de={class:"notification--footer flex items-end justify-between"},me={key:0,class:"code text-xs text-neutral-700 dark:text-neutral-300"},he={key:1,class:"notification--options flex flex-wrap justify-end gap-2"},ge=Object.assign({name:"LibNotification",inheritAttrs:!1},{__name:"WNotification",props:{notification:{type:null,required:!0},handler:{type:Object,required:!1,default:void 0}},emits:["pause","resume"],setup(t,{expose:e,emit:i}){const n=M(),{setSlotVar:o,slotVars:s}=re(),a=t,l=i,f=(c,r)=>c.dangerous.includes(r)?"danger":c.default===r?"primary":"secondary",d=I(()=>a.notification.options.map(c=>f(a.notification,c))),x=K(null),A=new AbortController;return z(()=>{x.value?.focus(),a.notification.timeout&&window.addEventListener("pointerdown",c=>{if(!(!c.target||!(c.target instanceof HTMLElement)))if(c.target===x.value||x.value?.contains(c.target)){if(a.notification.isPaused)return;l("pause",a.notification)}else l("resume",a.notification)},{signal:A.signal})}),F(()=>{A.abort()}),e({focus:()=>{x.value?.focus()}}),(c,r)=>t.notification?(h(),y("div",C({key:0,class:u(R)(`
		notification
		max-w-700px
		bg-neutral-50
		dark:bg-neutral-900
		text-fg
		dark:text-bg
		border
		border-neutral-400
		dark:border-neutral-700
		rounded-sm
		focus-outline
		flex
		flex-col
		gap-2
		p-1
		text-sm
		focus:border-accent-500
		focus-within:border-accent-500
	`,u(n).class)},{...u(n),class:void 0},{tabindex:"0","data-id":t.notification.id,ref_key:"notificationEl",ref:x,onKeydown:r[2]||(r[2]=U(W(m=>u(D).resolveToDefault(t.notification),["self"]),["enter"])),onPointerenter:r[3]||(r[3]=m=>t.notification.timeout&&!t.notification.isPaused&&l("pause",t.notification))}),[S(c.$slots,"top",{notification:t.notification}),g("div",ue,[t.notification.title?S(c.$slots,"title",$(C({key:0},u(o)("title",{title:t.notification.title,class:`
					notification--title
					focus-outline
					rounded-sm
					font-bold
				`,tabindex:0}))),()=>[g("div",$(N(u(s).title)),T(t.notification.title),17)]):v("",!0),r[4]||(r[4]=g("div",{class:"notification--spacer flex-1"},null,-1)),g("div",fe,[k(V,{border:!1,class:"notification--title-button notification--copy-button text-neutral-700 dark:text-neutral-300",onClick:r[0]||(r[0]=m=>u(Z)(t.handler?t.handler.stringify(t.notification):JSON.stringify(t.notification)))},{default:P(()=>[k(B,null,{default:P(()=>[k(u(le))]),_:1})]),_:1}),t.notification.cancellable?(h(),O(V,{key:0,class:"notification--title-button notification--cancel-button",border:!1,onClick:r[1]||(r[1]=m=>u(D).dismiss(t.notification))},{default:P(()=>[k(B,null,{default:P(()=>[k(u(Y))]),_:1})]),_:1})):v("",!0)])]),t.notification.message&&!t.notification.component?S(c.$slots,"message",$(C({key:0},u(o)("message",{class:`
				notification--message
				shrink-1
				overflow-auto
				whitespace-pre-wrap
				text-neutral-800
				dark:text-neutral-200
				mb-1
			`,message:t.notification.message,tabindex:0}))),()=>[g("div",$(N(u(s).message)),T(t.notification.message),17)]):v("",!0),t.notification.component?(h(),O(J(t.notification.component),$(C({key:1},{message:t.notification.message,messageClasses:`
					notification--message
					whitespace-pre-wrap
					text-neutral-800
					dark:text-neutral-200
					mb-1
				`,...t.notification.componentProps??{}})),null,16)):v("",!0),g("div",de,[t.notification.code?(h(),y("div",me," Code: "+T(t.notification.code),1)):v("",!0),r[5]||(r[5]=g("div",{class:"notification--footer-spacer flex-1 py-1"},null,-1)),t.notification.options?(h(),y("div",he,[(h(!0),y(G,null,Q(t.notification.options,(m,L)=>(h(),O(V,{label:m,class:X(u(R)(`
					notification--button
					notification--option-button
					px-2
				`,t.notification.default===m&&"notification--default")),color:d.value[L],key:m,onClick:ve=>t.notification.resolve(m)},null,8,["label","class","color","onClick"]))),128))])):v("",!0)])],16,ce)):v("",!0)}}),Pe=Object.freeze(Object.defineProperty({__proto__:null,default:ge},Symbol.toStringTag,{value:"Module"}));export{Pe as L,D as N,ge as _,b as c,p as i,q as w};
