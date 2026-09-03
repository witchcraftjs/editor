import{i as e}from"./Dnea9d-F.js";import{D as t,Nt as n,On as r,Qn as i,_ as a,b as o,bt as s,ct as c,er as l,et as u,fn as d,g as f,gn as p,mt as m,nr as h,o as g,qt as _,v,vn as y,wt as b,xt as x,y as S,z as C}from"./CoKk4mC0.js";import{C as w,w as T}from"./Dsg1-q_D.js";import{t as E}from"./CTrY3BHI.js";import{t as D}from"./B7O-pKmD.js";import{n as O}from"./M5icC9NJ.js";import{t as k}from"./AEemqjXy.js";import{t as A}from"./Cwp5f918.js";import{t as j}from"./DLNmc5u_.js";import{t as M}from"./BOwmyn0k.js";import{t as N}from"./Cvjjtm5s.js";import{a as P,i as F,n as I,t as L}from"./C1YyWCmw.js";function R(){let e=p({});function t(t,n){return e[t]=n,e[t]}return{slotVars:e,setSlotVar:t}}var z=class{timeout=5e3;debug=!1;id=0;queue;history;maxHistory=100;listeners=[];stringifier;constructor({timeout:e,stringifier:t,maxHistory:n}={}){this.queue=p([]),this.history=p([]),e&&(this.timeout=e),n&&(this.maxHistory=n),t&&(this.stringifier=t)}_checkEntry(e){if(e.cancellable!==void 0&&D(e.cancellable))throw Error(P`Cancellable cannot be a blank string:
					${F(I(e),5)}
				`);if(!e.options.includes(e.default))throw Error(P`Entry options does not include default option "${e.default}":
					${F(I(e),5)}
				`);if(e.cancellable){if(typeof e.cancellable==`string`&&!e.options.includes(e.cancellable))throw Error(P`Entry options does not include cancellable option "${e.cancellable}":
						${F(I(e),6)}
					`)}else if(e.options.includes(`Cancel`))throw Error(P`You specified that the entry should not be cancellable, but the options include the "Cancel" option:
						${F(I(e),6)}
					`);if(e.timeout!==void 0&&e.requiresAction)throw Error(P`Cannot timeout notification that requires action:
					${F(I(e),5)}
					`);let t=e.dangerous.find(t=>!e.options.includes(t));if(e.dangerous!==void 0&&t)throw Error(P`Dangerous options list contains an unknown option "${t}":
					${F(I(e),5)}
				`)}_createEntry(e){let t={requiresAction:!1,options:[`Ok`,`Cancel`],default:`Ok`,...e,component:e.component&&typeof e.component!=`string`?d(e.component):void 0,dangerous:e.dangerous??[],timeout:e.timeout===!0?this.timeout:e.timeout!==void 0&&e.timeout!==!1?e.timeout:void 0};return(e.cancellable===!0||e.cancellable===void 0&&t.options?.includes(`Cancel`))&&(t.cancellable=`Cancel`),this._checkEntry(t),j(t),this.id++,t.id=this.id,t}async notify(e){let t=this._createEntry(e);t.promise=new Promise(e=>{t.resolve=e}),t.timeout!==void 0&&(t._timer={elapsedBeforePause:0},this.resume(t)),this.queue.push(t);for(let e of this.listeners)e(t,`added`);return t.promise.then(e=>{t.resolution=e;for(let e of this.listeners)e(t,`resolved`);if(this.history.push(t),this.history.length>this.maxHistory){this.history.splice(0,1);for(let e of this.listeners)e(t,`deleted`)}return this.queue.splice(this.queue.indexOf(t),1),e})}pause(e){if(e.timeout===void 0)throw Error(`Cannot pause notification with no timeout: ${e.id}`);if(e.isPaused)throw Error(`Cannot pause notification that is already paused: ${e.id}`);e.isPaused=!0,clearTimeout(e._timer.id),e._timer.elapsedBeforePause+=Date.now()-e.startTime}resume(e){if(e.timeout===void 0)throw Error(`Cannot resume notification with no timeout: ${e.id}`);e.isPaused=!1,e.startTime=Date.now();let t=e.timeout-e._timer.elapsedBeforePause;clearTimeout(e._timer.id),e._timer.id=setTimeout(()=>{e.cancellable?e.resolve(e.cancellable):e.resolve(e.default)},t)}static resolveToDefault(e){e.resolve(e.default)}static dismiss(e){e.cancellable&&e.resolve(e.cancellable)}stringify(e){if(this.stringifier)return this.stringifier(e);let t=``;return e.title&&(t+=`${e.title}
`),t+=`${e.message}
`,e.code&&(t+=`code:${e.code}
`),t}clear(){L(this,`history`,[])}},B=e({default:()=>J}),V=[`role`,`aria-labelledby`,`aria-describedby`,`data-id`],H={class:`notification--header flex-reverse flex justify-between items-center`},U={class:`notification--actions flex`},W=[`id`],G={class:`notification--footer flex items-end justify-between`},K={key:0,class:`code text-xs text-neutral-700 dark:text-neutral-300`},q={key:1,class:`notification--options flex flex-wrap justify-end gap-2`},J=Object.assign({name:`WNotification`,inheritAttrs:!1},{__name:`WNotification`,props:{notification:{type:null,required:!0},handler:{type:Object,required:!1,default:void 0}},setup(e,{expose:d}){let p=n(),{setSlotVar:D,slotVars:j}=R(),P=e,F=(e,t)=>e.dangerous.includes(t)?`danger`:e.default===t?`primary`:`secondary`,I=f(()=>P.notification.options.map(e=>F(P.notification,e))),L=y(null);return c(()=>{P.notification.requiresAction&&L.value?.focus()}),d({focus:()=>{L.value?.focus()}}),(n,c)=>e.notification?(m(),o(`div`,u({key:0,role:e.notification.requiresAction?`alertdialog`:`status`,"aria-labelledby":e.notification.title?`title-${e.notification.id}`:void 0,"aria-describedby":e.notification.message?`msg-${e.notification.id}`:void 0,class:r(E)(`
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
	`,r(p).class,e.notification.notificationAttrs?.class)},{...r(p),...e.notification?.notificationAttrs??{},class:void 0},{tabindex:`0`,"data-id":e.notification.id,ref_key:`notificationEl`,ref:L,onKeydown:c[2]||=w(T(t=>r(z).resolveToDefault(e.notification),[`self`]),[`enter`])}),[x(n.$slots,`top`,{notification:e.notification}),a(`div`,H,[e.notification.title?x(n.$slots,`title`,l(C(r(D)(`title`,{id:`title-${e.notification.id}`,title:e.notification.title,class:`
					notification--title
					focus-outline
					rounded-sm
					font-bold
				`}))),()=>[a(`div`,l(C(r(j).title)),h(e.notification.title),17)],void 0,0):S(``,!0),c[3]||=a(`div`,{class:`notification--spacer flex-1`},null,-1),a(`div`,U,[t(O,{border:!1,"aria-label":`Copy notification content`,class:`notification--title-button notification--copy-button text-neutral-700 dark:text-neutral-300`,onClick:c[0]||=t=>r(M)(e.handler?e.handler.stringify(e.notification):JSON.stringify(e.notification))},{default:_(()=>[t(k,null,{default:_(()=>[t(r(N))]),_:1})]),_:1}),e.notification.cancellable?(m(),v(O,{key:0,"aria-label":`Dismiss notification`,class:`notification--title-button notification--cancel-button`,border:!1,onClick:c[1]||=t=>r(z).dismiss(e.notification)},{default:_(()=>[t(k,null,{default:_(()=>[t(r(A))]),_:1})]),_:1})):S(``,!0)])]),e.notification.message&&!e.notification.component?x(n.$slots,`message`,l(C(r(D)(`message`,{class:`
				notification--message
				shrink-1
				overflow-auto
				whitespace-pre-wrap
				text-neutral-800
				dark:text-neutral-200
				mb-1
			`,message:e.notification.message}))),()=>[a(`div`,u(r(j).message,{id:`msg-${e.notification.id}`}),h(e.notification.message),17,W)],void 0,0):S(``,!0),e.notification.component?(m(),v(b(e.notification.component),l(u({key:1},{notification:e.notification,message:e.notification.message,messageClasses:`
					notification--message
					whitespace-pre-wrap
					text-neutral-800
					dark:text-neutral-200
					mb-1
				`,...e.notification.componentProps??{}})),null,16)):S(``,!0),a(`div`,G,[e.notification.code?(m(),o(`div`,K,` Code: `+h(e.notification.code),1)):S(``,!0),c[4]||=a(`div`,{class:`notification--footer-spacer flex-1 py-1`},null,-1),e.notification.options?(m(),o(`div`,q,[(m(!0),o(g,null,s(e.notification.options,(t,n)=>(m(),v(O,{label:t,class:i(r(E)(`
					notification--button
					notification--option-button
					px-2
				`,e.notification.default===t&&`notification--default`)),color:I.value[n],key:t,onClick:n=>e.notification.resolve(t)},null,8,[`label`,`class`,`color`,`onClick`]))),128))])):S(``,!0)])],16,V)):S(``,!0)}});export{J as n,z as r,B as t};