import{W as y,aI as V,aW as r,aX as c,aY as u,aZ as D,I as A,j as L,r as z,o as F,v as g,O as m,x as h,R as p,y as d,S as v,P as w,N as a,A as b,L as E,B as x,a0 as O,a_ as I,aF as M,z as $,ah as R,ag as H,a8 as W,aj as K,Q as q,T as N,V as X}from"./Cql2C_go.js";import{c as Y}from"./CD0Jx8XC.js";import C from"./sdUFAksv.js";function J(){const i=y({});function e(t,o){return i[t]=o,i[t]}return{slotVars:i,setSlotVar:e}}class S{timeout=5e3;debug=!1;id=0;queue;history;maxHistory=100;listeners=[];stringifier;constructor({timeout:e,stringifier:t,maxHistory:o}={}){this.queue=y([]),this.history=y([]),e&&(this.timeout=e),o&&(this.maxHistory=o),t&&(this.stringifier=t)}_checkEntry(e){if(e.cancellable!==void 0&&V(e.cancellable))throw new Error(u`Cancellable cannot be a blank string:
					${r(c(e),5)}
				`);if(!e.options.includes(e.default))throw new Error(u`Entry options does not include default option "${e.default}":
					${r(c(e),5)}
				`);if(e.cancellable){if(typeof e.cancellable=="string"&&!e.options.includes(e.cancellable))throw new Error(u`Entry options does not include cancellable option "${e.cancellable}":
						${r(c(e),6)}
					`)}else if(e.options.includes("Cancel"))throw new Error(u`You specified that the entry should not be cancellable, but the options include the "Cancel" option:
						${r(c(e),6)}
					`);if(e.timeout!==void 0&&!e.cancellable)throw new Error(u`Cannot timeout notification that is not cancellable:
					${r(c(e),5)}
					`);if(e.timeout!==void 0&&e.requiresAction)throw new Error(u`Cannot timeout notification that requires action:
					${r(c(e),5)}
					`);const t=e.dangerous.find(o=>!e.options.includes(o));if(e.dangerous!==void 0&&t)throw new Error(u`Dangerous options list contains an unknown option "${t}":
					${r(c(e),5)}
				`)}_createEntry(e){const t={requiresAction:!1,options:["Ok","Cancel"],default:"Ok",cancellable:e.cancellable,...e,dangerous:e.dangerous??[],timeout:e.timeout===!0?this.timeout:e.timeout!==void 0&&e.timeout!==!1?e.timeout:void 0};return(e.cancellable===!0||e.cancellable===void 0&&t.options?.includes("Cancel"))&&(t.cancellable="Cancel"),this._checkEntry(t),this.id++,t.id=this.id,t}async notify(e){const t=this._createEntry(e);t.promise=new Promise(o=>{t.resolve=o}),t.timeout!==void 0&&(t._timer={elapsedBeforePause:0},this.resume(t)),this.queue.push(t);for(const o of this.listeners)o(t,"added");return t.promise.then(o=>{t.resolution=o;for(const f of this.listeners)f(t,"resolved");if(this.history.push(t),this.history.length>this.maxHistory){this.history.splice(0,1);for(const f of this.listeners)f(t,"deleted")}return this.queue.splice(this.queue.indexOf(t),1),o})}pause(e){if(e.timeout===void 0)throw new Error(`Cannot pause notification with no timeout: ${e.id}`);if(e.isPaused)throw new Error(`Cannot pause notification that is already paused: ${e.id}`);e.isPaused=!0,clearTimeout(e._timer.id),e._timer.elapsedBeforePause+=Date.now()-e.startTime}resume(e){if(e.timeout===void 0)throw new Error(`Cannot resume notification with no timeout: ${e.id}`);e.isPaused=!1,e.startTime=Date.now();const t=e.timeout-e._timer.elapsedBeforePause;clearTimeout(e._timer.id),e._timer.id=setTimeout(()=>{e.resolve(e.cancellable)},t)}static resolveToDefault(e){e.resolve(e.default)}static dismiss(e){e.cancellable&&e.resolve(e.cancellable)}stringify(e){if(this.stringifier)return this.stringifier(e);let t="";return e.title&&(t+=`${e.title}
`),t+=`${e.message}
`,e.code&&(t+=`code:${e.code}
`),t}clear(){D(this,"history",[])}}const Q={class:"notification--header flex-reverse flex justify-between items-center"},Z={class:"actions flex"},G={class:"notification--footer flex items-end justify-between"},U={key:0,class:"code text-xs text-neutral-700 dark:text-neutral-300"},_={key:1,class:"notification--options flex flex-wrap justify-end gap-2"},ee=Object.assign({name:"LibNotification",inheritAttrs:!1},{__name:"WNotification",props:{notification:{type:null,required:!0},handler:{type:Object,required:!1,default:void 0}},setup(i,{expose:e}){const t=A(),{setSlotVar:o,slotVars:f}=J(),P=i,j=(n,s)=>n.default===s?"primary":n.dangerous.includes(s)?"danger":"secondary",B=L(()=>P.notification.options.map(n=>j(P.notification,n))),k=z(null);return F(()=>{k.value?.focus()}),e({focus:()=>{k.value?.focus()}}),(n,s)=>i.notification?(h(),g("div",w({key:0,class:a(q)(`
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
	`,a(t).class)},{...a(t),class:void 0},{tabindex:"0",ref_key:"notificationEl",ref:k,onKeydown:s[2]||(s[2]=W(K(l=>a(S).resolveToDefault(i.notification),["self"]),["enter"]))}),[p(n.$slots,"top",{notification:i.notification}),d("div",Q,[i.notification.title?p(n.$slots,"title",v(w({key:0},a(o)("title",{title:i.notification.title,class:`
					notification--title
					focus-outline
					rounded-sm
					font-bold
				`,tabindex:0}))),()=>[d("div",v(N(a(f).title)),$(i.notification.title),17)]):m("",!0),s[3]||(s[3]=d("div",{class:"notification--spacer flex-1"},null,-1)),d("div",Z,[b(C,{border:!1,class:"notification--title-button notification--copy-button text-neutral-700 dark:text-neutral-300",onClick:s[0]||(s[0]=l=>a(Y)(i.handler?i.handler.stringify(i.notification):JSON.stringify(i.notification)))},{default:x(()=>[b(O,null,{default:x(()=>[b(a(I))]),_:1})]),_:1}),i.notification.cancellable?(h(),E(C,{key:0,class:"notification--title-button notification--cancel-button",border:!1,onClick:s[1]||(s[1]=l=>a(S).dismiss(i.notification))},{default:x(()=>[b(O,null,{default:x(()=>[b(a(M))]),_:1})]),_:1})):m("",!0)])]),i.notification.message?p(n.$slots,"message",v(w({key:0},a(o)("message",{class:`
				notification--message
				whitespace-pre-wrap
				text-neutral-800
				dark:text-neutral-200
				mb-1
			`,message:i.notification.message,tabindex:0}))),()=>[d("div",v(N(a(f).message)),$(i.notification.message),17)]):m("",!0),d("div",G,[i.notification.code?(h(),g("div",U," Code: "+$(i.notification.code),1)):m("",!0),s[4]||(s[4]=d("div",{class:"notification--footer-spacer flex-1 py-1"},null,-1)),i.notification.options?(h(),g("div",_,[(h(!0),g(R,null,H(i.notification.options,(l,T)=>(h(),E(C,{label:l,class:X(a(q)(`
					notification--button
					notification--option-button
					px-2
				`,i.notification.default===l&&"notification--default")),color:B.value[T],key:l,onClick:te=>i.notification.resolve(l)},null,8,["label","class","color","onClick"]))),128))])):m("",!0)])],16)):m("",!0)}}),ae=Object.freeze(Object.defineProperty({__proto__:null,default:ee},Symbol.toStringTag,{value:"Module"}));export{ae as L,S as N,ee as _};
