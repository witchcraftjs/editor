import{A as q,B as S,C as T,l as V,c as v,D as $,a as r,E as k,J as b,G as s,H as c,b as g,w,K as C,M as j,t as p,O as I,P as M,Q as W,R as H,r as R,o as u,F as z,I as K,y as L}from"./weshC9XZ.js";import{I as F}from"./DUcbGZ4B.js";import{I as J}from"./DaCdVXTJ.js";import{c as G}from"./CD0Jx8XC.js";import{i as f,p as m,c as h,s as Q}from"./7FYZCAFd.js";import{i as X}from"./BhoX2VZY.js";import{a as O}from"./D3iVoR1_.js";import P from"./CFl5zPZM.js";import D from"./DcktFqIC.js";function Y(){const t=q({});function e(i,o){return t[i]=o,t[i]}return{slotVars:t,setSlotVar:e}}class A{timeout=5e3;debug=!1;id=0;queue;history;maxHistory=100;listeners=[];stringifier;constructor({timeout:e,stringifier:i,maxHistory:o}={}){this.queue=q([]),this.history=q([]),e&&(this.timeout=e),o&&(this.maxHistory=o),i&&(this.stringifier=i)}_checkEntry(e){if(e.cancellable!==void 0&&X(e.cancellable))throw new Error(h`Cancellable cannot be a blank string:
					${f(m(e),5)}
				`);if(!e.options.includes(e.default))throw new Error(h`Entry options does not include default option "${e.default}":
					${f(m(e),5)}
				`);if(e.cancellable){if(typeof e.cancellable=="string"&&!e.options.includes(e.cancellable))throw new Error(h`Entry options does not include cancellable option "${e.cancellable}":
						${f(m(e),6)}
					`)}else if(e.options.includes("Cancel"))throw new Error(h`You specified that the entry should not be cancellable, but the options include the "Cancel" option:
						${f(m(e),6)}
					`);if(e.timeout!==void 0&&e.requiresAction)throw new Error(h`Cannot timeout notification that requires action:
					${f(m(e),5)}
					`);const i=e.dangerous.find(o=>!e.options.includes(o));if(e.dangerous!==void 0&&i)throw new Error(h`Dangerous options list contains an unknown option "${i}":
					${f(m(e),5)}
				`)}_createEntry(e){const i={requiresAction:!1,options:["Ok","Cancel"],default:"Ok",...e,component:e.component&&typeof e.component!="string"?S(e.component):void 0,dangerous:e.dangerous??[],timeout:e.timeout===!0?this.timeout:e.timeout!==void 0&&e.timeout!==!1?e.timeout:void 0};return(e.cancellable===!0||e.cancellable===void 0&&i.options?.includes("Cancel"))&&(i.cancellable="Cancel"),this._checkEntry(i),this.id++,i.id=this.id,i}async notify(e){const i=this._createEntry(e);i.promise=new Promise(o=>{i.resolve=o}),i.timeout!==void 0&&(i._timer={elapsedBeforePause:0},this.resume(i)),this.queue.push(i);for(const o of this.listeners)o(i,"added");return i.promise.then(o=>{i.resolution=o;for(const d of this.listeners)d(i,"resolved");if(this.history.push(i),this.history.length>this.maxHistory){this.history.splice(0,1);for(const d of this.listeners)d(i,"deleted")}return this.queue.splice(this.queue.indexOf(i),1),o})}pause(e){if(e.timeout===void 0)throw new Error(`Cannot pause notification with no timeout: ${e.id}`);if(e.isPaused)throw new Error(`Cannot pause notification that is already paused: ${e.id}`);e.isPaused=!0,clearTimeout(e._timer.id),e._timer.elapsedBeforePause+=Date.now()-e.startTime}resume(e){if(e.timeout===void 0)throw new Error(`Cannot resume notification with no timeout: ${e.id}`);e.isPaused=!1,e.startTime=Date.now();const i=e.timeout-e._timer.elapsedBeforePause;clearTimeout(e._timer.id),e._timer.id=setTimeout(()=>{e.cancellable?e.resolve(e.cancellable):e.resolve(e.default)},i)}static resolveToDefault(e){e.resolve(e.default)}static dismiss(e){e.cancellable&&e.resolve(e.cancellable)}stringify(e){if(this.stringifier)return this.stringifier(e);let i="";return e.title&&(i+=`${e.title}
`),i+=`${e.message}
`,e.code&&(i+=`code:${e.code}
`),i}clear(){Q(this,"history",[])}}const U=["role","aria-labelledby","aria-describedby","data-id"],Z={class:"notification--header flex-reverse flex justify-between items-center"},_={class:"notification--actions flex"},ee=["id"],te={class:"notification--footer flex items-end justify-between"},ie={key:0,class:"code text-xs text-neutral-700 dark:text-neutral-300"},oe={key:1,class:"notification--options flex flex-wrap justify-end gap-2"},ne=Object.assign({name:"WNotification",inheritAttrs:!1},{__name:"WNotification",props:{notification:{type:null,required:!0},handler:{type:Object,required:!1,default:void 0}},setup(t,{expose:e}){const i=T(),{setSlotVar:o,slotVars:d}=Y(),x=t,B=(a,n)=>a.dangerous.includes(n)?"danger":a.default===n?"primary":"secondary",E=L(()=>x.notification.options.map(a=>B(x.notification,a))),y=R(null);return V(()=>{x.notification.requiresAction&&y.value?.focus()}),e({focus:()=>{y.value?.focus()}}),(a,n)=>t.notification?(u(),v("div",b({key:0,role:t.notification.requiresAction?"alertdialog":"status","aria-labelledby":t.notification.title?`title-${t.notification.id}`:void 0,"aria-describedby":t.notification.message?`msg-${t.notification.id}`:void 0,class:s(O)(`
		notification
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
	`,s(i).class,t.notification.notificationAttrs?.class)},{...s(i),...t.notification?.notificationAttrs??{},class:void 0},{tabindex:"0","data-id":t.notification.id,ref_key:"notificationEl",ref:y,onKeydown:n[2]||(n[2]=W(H(l=>s(A).resolveToDefault(t.notification),["self"]),["enter"]))}),[$(a.$slots,"top",{notification:t.notification}),r("div",Z,[t.notification.title?$(a.$slots,"title",k(b({key:0},s(o)("title",{id:`title-${t.notification.id}`,title:t.notification.title,class:`
					notification--title
					focus-outline
					rounded-sm
					font-bold
				`}))),()=>[r("div",k(z(s(d).title)),p(t.notification.title),17)]):c("",!0),n[3]||(n[3]=r("div",{class:"notification--spacer flex-1"},null,-1)),r("div",_,[g(P,{border:!1,"aria-label":"Copy notification content",class:"notification--title-button notification--copy-button text-neutral-700 dark:text-neutral-300",onClick:n[0]||(n[0]=l=>s(G)(t.handler?t.handler.stringify(t.notification):JSON.stringify(t.notification)))},{default:w(()=>[g(D,null,{default:w(()=>[g(s(F))]),_:1})]),_:1}),t.notification.cancellable?(u(),C(P,{key:0,"aria-label":"Dismiss notification",class:"notification--title-button notification--cancel-button",border:!1,onClick:n[1]||(n[1]=l=>s(A).dismiss(t.notification))},{default:w(()=>[g(D,null,{default:w(()=>[g(s(J))]),_:1})]),_:1})):c("",!0)])]),t.notification.message&&!t.notification.component?$(a.$slots,"message",k(b({key:0},s(o)("message",{class:`
				notification--message
				shrink-1
				overflow-auto
				whitespace-pre-wrap
				text-neutral-800
				dark:text-neutral-200
				mb-1
			`,message:t.notification.message}))),()=>[r("div",b(s(d).message,{id:`msg-${t.notification.id}`}),p(t.notification.message),17,ee)]):c("",!0),t.notification.component?(u(),C(j(t.notification.component),k(b({key:1},{notification:t.notification,message:t.notification.message,messageClasses:`
					notification--message
					whitespace-pre-wrap
					text-neutral-800
					dark:text-neutral-200
					mb-1
				`,...t.notification.componentProps??{}})),null,16)):c("",!0),r("div",te,[t.notification.code?(u(),v("div",ie," Code: "+p(t.notification.code),1)):c("",!0),n[4]||(n[4]=r("div",{class:"notification--footer-spacer flex-1 py-1"},null,-1)),t.notification.options?(u(),v("div",oe,[(u(!0),v(I,null,M(t.notification.options,(l,N)=>(u(),C(P,{label:l,class:K(s(O)(`
					notification--button
					notification--option-button
					px-2
				`,t.notification.default===l&&"notification--default")),color:E.value[N],key:l,onClick:se=>t.notification.resolve(l)},null,8,["label","class","color","onClick"]))),128))])):c("",!0)])],16,U)):c("",!0)}}),be=Object.freeze(Object.defineProperty({__proto__:null,default:ne},Symbol.toStringTag,{value:"Module"}));export{A as N,be as W,ne as _};
