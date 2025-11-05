import{j as p,r as A,v as m,x as u,A as o,B as a,ah as v,ag as S,P as D,N as t,Q as B,aP as q,aQ as C,aR as H,aS as T,aT as $,S as g,T as _,C as h,z as w,aU as k,aV as z,L as x,O}from"./C3NUVL-0.js";import{_ as b,N as j}from"./DunzkZtg.js";import L from"./m32PJMbW.js";let y=!0;const d={notificationHandler:void 0,isClientSide:void 0},R=(r,l)=>{const i=l??d.isClientSide;if(i){if(y)if(y=!1,d.isClientSide=i??!0,r)d.notificationHandler=r;else throw new Error("You must set the notification handler to use at least once before using it.");else(r||l)&&console.warn("You can only configure useNotificationHandler once. (Note that there might be false positive during HMR).");return d.notificationHandler}},V=Object.assign({name:"LibNotifications",inheritAttrs:!1},{__name:"WNotifications",props:{id:{type:String,required:!1},handler:{type:Object,required:!1}},setup(r){const l=r,i=p(()=>n.queue.filter(s=>s.requiresAction).reverse()),N=p(()=>n.queue.filter(s=>!s.requiresAction)),c=A(Date.now());setInterval(()=>{requestAnimationFrame(()=>{c.value=Date.now()})},50);const n=l.handler??R();return(s,f)=>(u(),m(v,null,[o(q,D({name:"list",tag:"div",class:t(B)(`
		notifications
		[--notification-width:300px]
		fixed
		top-0
		z-50
		right-[calc(var(--notification-width)*-1)]
		w-[calc(var(--spacing)*2+var(--notification-width)*2)]
		[&_.notification]:w-[var(--notification-width)]
		max-h-[100dvh]
		flex
		flex-col
		[&_.notification]:shrink-0
		gap-1
		list-none
		outline-none
		overflow-y-auto
		overflow-x-clip
		scrollbar-hidden
	`,s.$attrs.class)},{...s.$attrs,class:void 0}),{default:a(()=>[(u(!0),m(v,null,S(N.value,e=>(u(),x(b,{handler:t(n),tabindex:"0",notification:e,class:"overflow-hidden my-2",key:e.id,onPointerenter:P=>e.timeout&&!e.isPaused&&t(n).pause(e),onBlur:P=>e.timeout&&e.isPaused&&t(n).resume(e)},{top:a(()=>[e.timeout!==void 0?(u(),x(L,{key:0,class:"w-full h-1 before:duration-[10ms] -mt-1 -mx-[calc(var(--spacing)*2+2px)] rounded-none",progress:100-(e.isPaused?e._timer.elapsedBeforePause:e._timer.elapsedBeforePause+(c.value-e.startTime))/e.timeout*100},null,8,["progress"])):O("",!0)]),_:2},1032,["handler","notification","onPointerenter","onBlur"]))),128))]),_:1},16,["class"]),o(t(z),{open:i.value.length>0&&i.value[0]!==void 0,"onUpdate:open":f[0]||(f[0]=e=>i.value[0]&&t(j).dismiss(i.value[0]))},{default:a(()=>[o(t(C),{to:"#root"},{default:a(()=>[o(t(H),{class:"fixed inset-0 z-30 bg-neutral-950/20 data-[state=open]:animate-overlayShow"}),o(t(T),{class:"data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] max-h-[80dvh] max-w-[700px] z-100"},{default:a(()=>[o(b,{class:"top-notification text-md gap-2 p-2 [&_.notification--button]:p-2 [&_.notification--button]:py-1 [&_.notification--header]:text-lg [&_.notification--message]:py-3",handler:t(n),notification:i.value[0],ref:"topNotificationComp"},{title:a(e=>[o(t(k),g(_(e)),{default:a(()=>[h(w(e.title),1)]),_:2},1040)]),message:a(e=>[o(t($),g(_(e)),{default:a(()=>[h(w(e.message),1)]),_:2},1040)]),_:1},8,["handler","notification"])]),_:1})]),_:1})]),_:1},8,["open"])],64))}}),Q=Object.freeze(Object.defineProperty({__proto__:null,default:V},Symbol.toStringTag,{value:"Module"}));export{Q as L,V as _,R as u};
