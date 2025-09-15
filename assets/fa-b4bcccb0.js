import{g as aa,R as Gr,r as sa}from"./dndkit-57209f9c.js";/*!
 * Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
 * Copyright 2025 Fonticons, Inc.
 */function lt(e,t){(t==null||t>e.length)&&(t=e.length);for(var r=0,n=Array(t);r<t;r++)n[r]=e[r];return n}function ia(e){if(Array.isArray(e))return e}function oa(e){if(Array.isArray(e))return lt(e)}function la(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function Ut(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,Ur(n.key),n)}}function fa(e,t,r){return t&&Ut(e.prototype,t),r&&Ut(e,r),Object.defineProperty(e,"prototype",{writable:!1}),e}function Le(e,t){var r=typeof Symbol<"u"&&e[Symbol.iterator]||e["@@iterator"];if(!r){if(Array.isArray(e)||(r=At(e))||t&&e&&typeof e.length=="number"){r&&(e=r);var n=0,a=function(){};return{s:a,n:function(){return n>=e.length?{done:!0}:{done:!1,value:e[n++]}},e:function(o){throw o},f:a}}throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}var s,i=!0,f=!1;return{s:function(){r=r.call(e)},n:function(){var o=r.next();return i=o.done,o},e:function(o){f=!0,s=o},f:function(){try{i||r.return==null||r.return()}finally{if(f)throw s}}}}function R(e,t,r){return(t=Ur(t))in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function ca(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function ua(e,t){var r=e==null?null:typeof Symbol<"u"&&e[Symbol.iterator]||e["@@iterator"];if(r!=null){var n,a,s,i,f=[],o=!0,c=!1;try{if(s=(r=r.call(e)).next,t===0){if(Object(r)!==r)return;o=!1}else for(;!(o=(n=s.call(r)).done)&&(f.push(n.value),f.length!==t);o=!0);}catch(l){c=!0,a=l}finally{try{if(!o&&r.return!=null&&(i=r.return(),Object(i)!==i))return}finally{if(c)throw a}}return f}}function da(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function ma(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Wt(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter(function(a){return Object.getOwnPropertyDescriptor(e,a).enumerable})),r.push.apply(r,n)}return r}function m(e){for(var t=1;t<arguments.length;t++){var r=arguments[t]!=null?arguments[t]:{};t%2?Wt(Object(r),!0).forEach(function(n){R(e,n,r[n])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):Wt(Object(r)).forEach(function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(r,n))})}return e}function De(e,t){return ia(e)||ua(e,t)||At(e,t)||da()}function U(e){return oa(e)||ca(e)||At(e)||ma()}function ha(e,t){if(typeof e!="object"||!e)return e;var r=e[Symbol.toPrimitive];if(r!==void 0){var n=r.call(e,t||"default");if(typeof n!="object")return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}function Ur(e){var t=ha(e,"string");return typeof t=="symbol"?t:t+""}function Fe(e){"@babel/helpers - typeof";return Fe=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},Fe(e)}function At(e,t){if(e){if(typeof e=="string")return lt(e,t);var r={}.toString.call(e).slice(8,-1);return r==="Object"&&e.constructor&&(r=e.constructor.name),r==="Map"||r==="Set"?Array.from(e):r==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?lt(e,t):void 0}}var Vt=function(){},It={},Wr={},Vr=null,Xr={mark:Vt,measure:Vt};try{typeof window<"u"&&(It=window),typeof document<"u"&&(Wr=document),typeof MutationObserver<"u"&&(Vr=MutationObserver),typeof performance<"u"&&(Xr=performance)}catch{}var pa=It.navigator||{},Xt=pa.userAgent,Yt=Xt===void 0?"":Xt,Q=It,T=Wr,Ht=Vr,Ie=Xr;Q.document;var J=!!T.documentElement&&!!T.head&&typeof T.addEventListener=="function"&&typeof T.createElement=="function",Yr=~Yt.indexOf("MSIE")||~Yt.indexOf("Trident/"),Ke,va=/fa(k|kd|s|r|l|t|d|dr|dl|dt|b|slr|slpr|wsb|tl|ns|nds|es|jr|jfr|jdr|cr|ss|sr|sl|st|sds|sdr|sdl|sdt)?[\-\ ]/,ga=/Font ?Awesome ?([567 ]*)(Solid|Regular|Light|Thin|Duotone|Brands|Free|Pro|Sharp Duotone|Sharp|Kit|Notdog Duo|Notdog|Chisel|Etch|Thumbprint|Jelly Fill|Jelly Duo|Jelly|Slab Press|Slab|Whiteboard)?.*/i,Hr={classic:{fa:"solid",fas:"solid","fa-solid":"solid",far:"regular","fa-regular":"regular",fal:"light","fa-light":"light",fat:"thin","fa-thin":"thin",fab:"brands","fa-brands":"brands"},duotone:{fa:"solid",fad:"solid","fa-solid":"solid","fa-duotone":"solid",fadr:"regular","fa-regular":"regular",fadl:"light","fa-light":"light",fadt:"thin","fa-thin":"thin"},sharp:{fa:"solid",fass:"solid","fa-solid":"solid",fasr:"regular","fa-regular":"regular",fasl:"light","fa-light":"light",fast:"thin","fa-thin":"thin"},"sharp-duotone":{fa:"solid",fasds:"solid","fa-solid":"solid",fasdr:"regular","fa-regular":"regular",fasdl:"light","fa-light":"light",fasdt:"thin","fa-thin":"thin"},slab:{"fa-regular":"regular",faslr:"regular"},"slab-press":{"fa-regular":"regular",faslpr:"regular"},thumbprint:{"fa-light":"light",fatl:"light"},whiteboard:{"fa-semibold":"semibold",fawsb:"semibold"},notdog:{"fa-solid":"solid",fans:"solid"},"notdog-duo":{"fa-solid":"solid",fands:"solid"},etch:{"fa-solid":"solid",faes:"solid"},jelly:{"fa-regular":"regular",fajr:"regular"},"jelly-fill":{"fa-regular":"regular",fajfr:"regular"},"jelly-duo":{"fa-regular":"regular",fajdr:"regular"},chisel:{"fa-regular":"regular",facr:"regular"}},ba={GROUP:"duotone-group",SWAP_OPACITY:"swap-opacity",PRIMARY:"primary",SECONDARY:"secondary"},Br=["fa-classic","fa-duotone","fa-sharp","fa-sharp-duotone","fa-thumbprint","fa-whiteboard","fa-notdog","fa-notdog-duo","fa-chisel","fa-etch","fa-jelly","fa-jelly-fill","fa-jelly-duo","fa-slab","fa-slab-press"],_="classic",Ee="duotone",qr="sharp",Kr="sharp-duotone",Jr="chisel",Zr="etch",Qr="jelly",en="jelly-duo",tn="jelly-fill",rn="notdog",nn="notdog-duo",an="slab",sn="slab-press",on="thumbprint",ln="whiteboard",ya="Classic",Ea="Duotone",$a="Sharp",Sa="Sharp Duotone",Aa="Chisel",Ia="Etch",wa="Jelly",xa="Jelly Duo",Ra="Jelly Fill",Na="Notdog",Oa="Notdog Duo",Pa="Slab",ka="Slab Press",La="Thumbprint",Ta="Whiteboard",fn=[_,Ee,qr,Kr,Jr,Zr,Qr,en,tn,rn,nn,an,sn,on,ln];Ke={},R(R(R(R(R(R(R(R(R(R(Ke,_,ya),Ee,Ea),qr,$a),Kr,Sa),Jr,Aa),Zr,Ia),Qr,wa),en,xa),tn,Ra),rn,Na),R(R(R(R(R(Ke,nn,Oa),an,Pa),sn,ka),on,La),ln,Ta);var Ca={classic:{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"},duotone:{900:"fad",400:"fadr",300:"fadl",100:"fadt"},sharp:{900:"fass",400:"fasr",300:"fasl",100:"fast"},"sharp-duotone":{900:"fasds",400:"fasdr",300:"fasdl",100:"fasdt"},slab:{400:"faslr"},"slab-press":{400:"faslpr"},whiteboard:{600:"fawsb"},thumbprint:{300:"fatl"},notdog:{900:"fans"},"notdog-duo":{900:"fands"},etch:{900:"faes"},chisel:{400:"facr"},jelly:{400:"fajr"},"jelly-fill":{400:"fajfr"},"jelly-duo":{400:"fajdr"}},Fa={"Font Awesome 7 Free":{900:"fas",400:"far"},"Font Awesome 7 Pro":{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"},"Font Awesome 7 Brands":{400:"fab",normal:"fab"},"Font Awesome 7 Duotone":{900:"fad",400:"fadr",normal:"fadr",300:"fadl",100:"fadt"},"Font Awesome 7 Sharp":{900:"fass",400:"fasr",normal:"fasr",300:"fasl",100:"fast"},"Font Awesome 7 Sharp Duotone":{900:"fasds",400:"fasdr",normal:"fasdr",300:"fasdl",100:"fasdt"},"Font Awesome 7 Jelly":{400:"fajr",normal:"fajr"},"Font Awesome 7 Jelly Fill":{400:"fajfr",normal:"fajfr"},"Font Awesome 7 Jelly Duo":{400:"fajdr",normal:"fajdr"},"Font Awesome 7 Slab":{400:"faslr",normal:"faslr"},"Font Awesome 7 Slab Press":{400:"faslpr",normal:"faslpr"},"Font Awesome 7 Thumbprint":{300:"fatl",normal:"fatl"},"Font Awesome 7 Notdog":{900:"fans",normal:"fans"},"Font Awesome 7 Notdog Duo":{900:"fands",normal:"fands"},"Font Awesome 7 Etch":{900:"faes",normal:"faes"},"Font Awesome 7 Chisel":{400:"facr",normal:"facr"},"Font Awesome 7 Whiteboard":{600:"fawsb",normal:"fawsb"}},ja=new Map([["classic",{defaultShortPrefixId:"fas",defaultStyleId:"solid",styleIds:["solid","regular","light","thin","brands"],futureStyleIds:[],defaultFontWeight:900}],["duotone",{defaultShortPrefixId:"fad",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["sharp",{defaultShortPrefixId:"fass",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["sharp-duotone",{defaultShortPrefixId:"fasds",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["chisel",{defaultShortPrefixId:"facr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["etch",{defaultShortPrefixId:"faes",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["jelly",{defaultShortPrefixId:"fajr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["jelly-duo",{defaultShortPrefixId:"fajdr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["jelly-fill",{defaultShortPrefixId:"fajfr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["notdog",{defaultShortPrefixId:"fans",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["notdog-duo",{defaultShortPrefixId:"fands",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["slab",{defaultShortPrefixId:"faslr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["slab-press",{defaultShortPrefixId:"faslpr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["thumbprint",{defaultShortPrefixId:"fatl",defaultStyleId:"light",styleIds:["light"],futureStyleIds:[],defaultFontWeight:300}],["whiteboard",{defaultShortPrefixId:"fawsb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}]]),_a={chisel:{regular:"facr"},classic:{brands:"fab",light:"fal",regular:"far",solid:"fas",thin:"fat"},duotone:{light:"fadl",regular:"fadr",solid:"fad",thin:"fadt"},etch:{solid:"faes"},jelly:{regular:"fajr"},"jelly-duo":{regular:"fajdr"},"jelly-fill":{regular:"fajfr"},notdog:{solid:"fans"},"notdog-duo":{solid:"fands"},sharp:{light:"fasl",regular:"fasr",solid:"fass",thin:"fast"},"sharp-duotone":{light:"fasdl",regular:"fasdr",solid:"fasds",thin:"fasdt"},slab:{regular:"faslr"},"slab-press":{regular:"faslpr"},thumbprint:{light:"fatl"},whiteboard:{semibold:"fawsb"}},cn=["fak","fa-kit","fakd","fa-kit-duotone"],Bt={kit:{fak:"kit","fa-kit":"kit"},"kit-duotone":{fakd:"kit-duotone","fa-kit-duotone":"kit-duotone"}},Da=["kit"],Ma="kit",za="kit-duotone",Ga="Kit",Ua="Kit Duotone";R(R({},Ma,Ga),za,Ua);var Wa={kit:{"fa-kit":"fak"},"kit-duotone":{"fa-kit-duotone":"fakd"}},Va={"Font Awesome Kit":{400:"fak",normal:"fak"},"Font Awesome Kit Duotone":{400:"fakd",normal:"fakd"}},Xa={kit:{fak:"fa-kit"},"kit-duotone":{fakd:"fa-kit-duotone"}},qt={kit:{kit:"fak"},"kit-duotone":{"kit-duotone":"fakd"}},Je,we={GROUP:"duotone-group",SWAP_OPACITY:"swap-opacity",PRIMARY:"primary",SECONDARY:"secondary"},Ya=["fa-classic","fa-duotone","fa-sharp","fa-sharp-duotone","fa-thumbprint","fa-whiteboard","fa-notdog","fa-notdog-duo","fa-chisel","fa-etch","fa-jelly","fa-jelly-fill","fa-jelly-duo","fa-slab","fa-slab-press"],Ha="classic",Ba="duotone",qa="sharp",Ka="sharp-duotone",Ja="chisel",Za="etch",Qa="jelly",es="jelly-duo",ts="jelly-fill",rs="notdog",ns="notdog-duo",as="slab",ss="slab-press",is="thumbprint",os="whiteboard",ls="Classic",fs="Duotone",cs="Sharp",us="Sharp Duotone",ds="Chisel",ms="Etch",hs="Jelly",ps="Jelly Duo",vs="Jelly Fill",gs="Notdog",bs="Notdog Duo",ys="Slab",Es="Slab Press",$s="Thumbprint",Ss="Whiteboard";Je={},R(R(R(R(R(R(R(R(R(R(Je,Ha,ls),Ba,fs),qa,cs),Ka,us),Ja,ds),Za,ms),Qa,hs),es,ps),ts,vs),rs,gs),R(R(R(R(R(Je,ns,bs),as,ys),ss,Es),is,$s),os,Ss);var As="kit",Is="kit-duotone",ws="Kit",xs="Kit Duotone";R(R({},As,ws),Is,xs);var Rs={classic:{"fa-brands":"fab","fa-duotone":"fad","fa-light":"fal","fa-regular":"far","fa-solid":"fas","fa-thin":"fat"},duotone:{"fa-regular":"fadr","fa-light":"fadl","fa-thin":"fadt"},sharp:{"fa-solid":"fass","fa-regular":"fasr","fa-light":"fasl","fa-thin":"fast"},"sharp-duotone":{"fa-solid":"fasds","fa-regular":"fasdr","fa-light":"fasdl","fa-thin":"fasdt"},slab:{"fa-regular":"faslr"},"slab-press":{"fa-regular":"faslpr"},whiteboard:{"fa-semibold":"fawsb"},thumbprint:{"fa-light":"fatl"},notdog:{"fa-solid":"fans"},"notdog-duo":{"fa-solid":"fands"},etch:{"fa-solid":"faes"},jelly:{"fa-regular":"fajr"},"jelly-fill":{"fa-regular":"fajfr"},"jelly-duo":{"fa-regular":"fajdr"},chisel:{"fa-regular":"facr"}},Ns={classic:["fas","far","fal","fat","fad"],duotone:["fadr","fadl","fadt"],sharp:["fass","fasr","fasl","fast"],"sharp-duotone":["fasds","fasdr","fasdl","fasdt"],slab:["faslr"],"slab-press":["faslpr"],whiteboard:["fawsb"],thumbprint:["fatl"],notdog:["fans"],"notdog-duo":["fands"],etch:["faes"],jelly:["fajr"],"jelly-fill":["fajfr"],"jelly-duo":["fajdr"],chisel:["facr"]},ft={classic:{fab:"fa-brands",fad:"fa-duotone",fal:"fa-light",far:"fa-regular",fas:"fa-solid",fat:"fa-thin"},duotone:{fadr:"fa-regular",fadl:"fa-light",fadt:"fa-thin"},sharp:{fass:"fa-solid",fasr:"fa-regular",fasl:"fa-light",fast:"fa-thin"},"sharp-duotone":{fasds:"fa-solid",fasdr:"fa-regular",fasdl:"fa-light",fasdt:"fa-thin"},slab:{faslr:"fa-regular"},"slab-press":{faslpr:"fa-regular"},whiteboard:{fawsb:"fa-semibold"},thumbprint:{fatl:"fa-light"},notdog:{fans:"fa-solid"},"notdog-duo":{fands:"fa-solid"},etch:{faes:"fa-solid"},jelly:{fajr:"fa-regular"},"jelly-fill":{fajfr:"fa-regular"},"jelly-duo":{fajdr:"fa-regular"},chisel:{facr:"fa-regular"}},Os=["fa-solid","fa-regular","fa-light","fa-thin","fa-duotone","fa-brands","fa-semibold"],un=["fa","fas","far","fal","fat","fad","fadr","fadl","fadt","fab","fass","fasr","fasl","fast","fasds","fasdr","fasdl","fasdt","faslr","faslpr","fawsb","fatl","fans","fands","faes","fajr","fajfr","fajdr","facr"].concat(Ya,Os),Ps=["solid","regular","light","thin","duotone","brands","semibold"],dn=[1,2,3,4,5,6,7,8,9,10],ks=dn.concat([11,12,13,14,15,16,17,18,19,20]),Ls=["aw","fw","pull-left","pull-right"],Ts=[].concat(U(Object.keys(Ns)),Ps,Ls,["2xs","xs","sm","lg","xl","2xl","beat","border","fade","beat-fade","bounce","flip-both","flip-horizontal","flip-vertical","flip","inverse","layers","layers-bottom-left","layers-bottom-right","layers-counter","layers-text","layers-top-left","layers-top-right","li","pull-end","pull-start","pulse","rotate-180","rotate-270","rotate-90","rotate-by","shake","spin-pulse","spin-reverse","spin","stack-1x","stack-2x","stack","ul","width-auto","width-fixed",we.GROUP,we.SWAP_OPACITY,we.PRIMARY,we.SECONDARY]).concat(dn.map(function(e){return"".concat(e,"x")})).concat(ks.map(function(e){return"w-".concat(e)})),Cs={"Font Awesome 5 Free":{900:"fas",400:"far"},"Font Awesome 5 Pro":{900:"fas",400:"far",normal:"far",300:"fal"},"Font Awesome 5 Brands":{400:"fab",normal:"fab"},"Font Awesome 5 Duotone":{900:"fad"}},q="___FONT_AWESOME___",ct=16,mn="fa",hn="svg-inline--fa",ne="data-fa-i2svg",ut="data-fa-pseudo-element",Fs="data-fa-pseudo-element-pending",wt="data-prefix",xt="data-icon",Kt="fontawesome-i2svg",js="async",_s=["HTML","HEAD","STYLE","SCRIPT"],pn=["::before","::after",":before",":after"],vn=function(){try{return!0}catch{return!1}}();function $e(e){return new Proxy(e,{get:function(r,n){return n in r?r[n]:r[_]}})}var gn=m({},Hr);gn[_]=m(m(m(m({},{"fa-duotone":"duotone"}),Hr[_]),Bt.kit),Bt["kit-duotone"]);var Ds=$e(gn),dt=m({},_a);dt[_]=m(m(m(m({},{duotone:"fad"}),dt[_]),qt.kit),qt["kit-duotone"]);var Jt=$e(dt),mt=m({},ft);mt[_]=m(m({},mt[_]),Xa.kit);var bn=$e(mt),ht=m({},Rs);ht[_]=m(m({},ht[_]),Wa.kit);$e(ht);var Ms=va,yn="fa-layers-text",zs=ga,Gs=m({},Ca);$e(Gs);var Us=["class","data-prefix","data-icon","data-fa-transform","data-fa-mask"],Ze=ba,Ws=[].concat(U(Da),U(Ts)),ge=Q.FontAwesomeConfig||{};function Vs(e){var t=T.querySelector("script["+e+"]");if(t)return t.getAttribute(e)}function Xs(e){return e===""?!0:e==="false"?!1:e==="true"?!0:e}if(T&&typeof T.querySelector=="function"){var Ys=[["data-family-prefix","familyPrefix"],["data-css-prefix","cssPrefix"],["data-family-default","familyDefault"],["data-style-default","styleDefault"],["data-replacement-class","replacementClass"],["data-auto-replace-svg","autoReplaceSvg"],["data-auto-add-css","autoAddCss"],["data-search-pseudo-elements","searchPseudoElements"],["data-search-pseudo-elements-warnings","searchPseudoElementsWarnings"],["data-search-pseudo-elements-full-scan","searchPseudoElementsFullScan"],["data-observe-mutations","observeMutations"],["data-mutate-approach","mutateApproach"],["data-keep-original-source","keepOriginalSource"],["data-measure-performance","measurePerformance"],["data-show-missing-icons","showMissingIcons"]];Ys.forEach(function(e){var t=De(e,2),r=t[0],n=t[1],a=Xs(Vs(r));a!=null&&(ge[n]=a)})}var En={styleDefault:"solid",familyDefault:_,cssPrefix:mn,replacementClass:hn,autoReplaceSvg:!0,autoAddCss:!0,searchPseudoElements:!1,searchPseudoElementsWarnings:!0,searchPseudoElementsFullScan:!1,observeMutations:!0,mutateApproach:"async",keepOriginalSource:!0,measurePerformance:!1,showMissingIcons:!0};ge.familyPrefix&&(ge.cssPrefix=ge.familyPrefix);var fe=m(m({},En),ge);fe.autoReplaceSvg||(fe.observeMutations=!1);var b={};Object.keys(En).forEach(function(e){Object.defineProperty(b,e,{enumerable:!0,set:function(r){fe[e]=r,be.forEach(function(n){return n(b)})},get:function(){return fe[e]}})});Object.defineProperty(b,"familyPrefix",{enumerable:!0,set:function(t){fe.cssPrefix=t,be.forEach(function(r){return r(b)})},get:function(){return fe.cssPrefix}});Q.FontAwesomeConfig=b;var be=[];function Hs(e){return be.push(e),function(){be.splice(be.indexOf(e),1)}}var Z=ct,Y={size:16,x:0,y:0,rotate:0,flipX:!1,flipY:!1};function Bs(e){if(!(!e||!J)){var t=T.createElement("style");t.setAttribute("type","text/css"),t.innerHTML=e;for(var r=T.head.childNodes,n=null,a=r.length-1;a>-1;a--){var s=r[a],i=(s.tagName||"").toUpperCase();["STYLE","LINK"].indexOf(i)>-1&&(n=s)}return T.head.insertBefore(t,n),e}}var qs="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";function Zt(){for(var e=12,t="";e-- >0;)t+=qs[Math.random()*62|0];return t}function ce(e){for(var t=[],r=(e||[]).length>>>0;r--;)t[r]=e[r];return t}function Rt(e){return e.classList?ce(e.classList):(e.getAttribute("class")||"").split(" ").filter(function(t){return t})}function $n(e){return"".concat(e).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Ks(e){return Object.keys(e||{}).reduce(function(t,r){return t+"".concat(r,'="').concat($n(e[r]),'" ')},"").trim()}function Me(e){return Object.keys(e||{}).reduce(function(t,r){return t+"".concat(r,": ").concat(e[r].trim(),";")},"")}function Nt(e){return e.size!==Y.size||e.x!==Y.x||e.y!==Y.y||e.rotate!==Y.rotate||e.flipX||e.flipY}function Js(e){var t=e.transform,r=e.containerWidth,n=e.iconWidth,a={transform:"translate(".concat(r/2," 256)")},s="translate(".concat(t.x*32,", ").concat(t.y*32,") "),i="scale(".concat(t.size/16*(t.flipX?-1:1),", ").concat(t.size/16*(t.flipY?-1:1),") "),f="rotate(".concat(t.rotate," 0 0)"),o={transform:"".concat(s," ").concat(i," ").concat(f)},c={transform:"translate(".concat(n/2*-1," -256)")};return{outer:a,inner:o,path:c}}function Zs(e){var t=e.transform,r=e.width,n=r===void 0?ct:r,a=e.height,s=a===void 0?ct:a,i=e.startCentered,f=i===void 0?!1:i,o="";return f&&Yr?o+="translate(".concat(t.x/Z-n/2,"em, ").concat(t.y/Z-s/2,"em) "):f?o+="translate(calc(-50% + ".concat(t.x/Z,"em), calc(-50% + ").concat(t.y/Z,"em)) "):o+="translate(".concat(t.x/Z,"em, ").concat(t.y/Z,"em) "),o+="scale(".concat(t.size/Z*(t.flipX?-1:1),", ").concat(t.size/Z*(t.flipY?-1:1),") "),o+="rotate(".concat(t.rotate,"deg) "),o}var Qs=`:root, :host {
  --fa-font-solid: normal 900 1em/1 "Font Awesome 7 Free";
  --fa-font-regular: normal 400 1em/1 "Font Awesome 7 Free";
  --fa-font-light: normal 300 1em/1 "Font Awesome 7 Pro";
  --fa-font-thin: normal 100 1em/1 "Font Awesome 7 Pro";
  --fa-font-duotone: normal 900 1em/1 "Font Awesome 7 Duotone";
  --fa-font-duotone-regular: normal 400 1em/1 "Font Awesome 7 Duotone";
  --fa-font-duotone-light: normal 300 1em/1 "Font Awesome 7 Duotone";
  --fa-font-duotone-thin: normal 100 1em/1 "Font Awesome 7 Duotone";
  --fa-font-brands: normal 400 1em/1 "Font Awesome 7 Brands";
  --fa-font-sharp-solid: normal 900 1em/1 "Font Awesome 7 Sharp";
  --fa-font-sharp-regular: normal 400 1em/1 "Font Awesome 7 Sharp";
  --fa-font-sharp-light: normal 300 1em/1 "Font Awesome 7 Sharp";
  --fa-font-sharp-thin: normal 100 1em/1 "Font Awesome 7 Sharp";
  --fa-font-sharp-duotone-solid: normal 900 1em/1 "Font Awesome 7 Sharp Duotone";
  --fa-font-sharp-duotone-regular: normal 400 1em/1 "Font Awesome 7 Sharp Duotone";
  --fa-font-sharp-duotone-light: normal 300 1em/1 "Font Awesome 7 Sharp Duotone";
  --fa-font-sharp-duotone-thin: normal 100 1em/1 "Font Awesome 7 Sharp Duotone";
  --fa-font-slab-regular: normal 400 1em/1 "Font Awesome 7 Slab";
  --fa-font-slab-press-regular: normal 400 1em/1 "Font Awesome 7 Slab Press";
  --fa-font-whiteboard-semibold: normal 600 1em/1 "Font Awesome 7 Whiteboard";
  --fa-font-thumbprint-light: normal 300 1em/1 "Font Awesome 7 Thumbprint";
  --fa-font-notdog-solid: normal 900 1em/1 "Font Awesome 7 Notdog";
  --fa-font-notdog-duo-solid: normal 900 1em/1 "Font Awesome 7 Notdog Duo";
  --fa-font-etch-solid: normal 900 1em/1 "Font Awesome 7 Etch";
  --fa-font-jelly-regular: normal 400 1em/1 "Font Awesome 7 Jelly";
  --fa-font-jelly-fill-regular: normal 400 1em/1 "Font Awesome 7 Jelly Fill";
  --fa-font-jelly-duo-regular: normal 400 1em/1 "Font Awesome 7 Jelly Duo";
  --fa-font-chisel-regular: normal 400 1em/1 "Font Awesome 7 Chisel";
}

.svg-inline--fa {
  box-sizing: content-box;
  display: var(--fa-display, inline-block);
  height: 1em;
  overflow: visible;
  vertical-align: -0.125em;
  width: var(--fa-width, 1.25em);
}
.svg-inline--fa.fa-2xs {
  vertical-align: 0.1em;
}
.svg-inline--fa.fa-xs {
  vertical-align: 0em;
}
.svg-inline--fa.fa-sm {
  vertical-align: -0.0714285714em;
}
.svg-inline--fa.fa-lg {
  vertical-align: -0.2em;
}
.svg-inline--fa.fa-xl {
  vertical-align: -0.25em;
}
.svg-inline--fa.fa-2xl {
  vertical-align: -0.3125em;
}
.svg-inline--fa.fa-pull-left,
.svg-inline--fa .fa-pull-start {
  float: inline-start;
  margin-inline-end: var(--fa-pull-margin, 0.3em);
}
.svg-inline--fa.fa-pull-right,
.svg-inline--fa .fa-pull-end {
  float: inline-end;
  margin-inline-start: var(--fa-pull-margin, 0.3em);
}
.svg-inline--fa.fa-li {
  width: var(--fa-li-width, 2em);
  inset-inline-start: calc(-1 * var(--fa-li-width, 2em));
  inset-block-start: 0.25em; /* syncing vertical alignment with Web Font rendering */
}

.fa-layers-counter, .fa-layers-text {
  display: inline-block;
  position: absolute;
  text-align: center;
}

.fa-layers {
  display: inline-block;
  height: 1em;
  position: relative;
  text-align: center;
  vertical-align: -0.125em;
  width: var(--fa-width, 1.25em);
}
.fa-layers .svg-inline--fa {
  inset: 0;
  margin: auto;
  position: absolute;
  transform-origin: center center;
}

.fa-layers-text {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  transform-origin: center center;
}

.fa-layers-counter {
  background-color: var(--fa-counter-background-color, #ff253a);
  border-radius: var(--fa-counter-border-radius, 1em);
  box-sizing: border-box;
  color: var(--fa-inverse, #fff);
  line-height: var(--fa-counter-line-height, 1);
  max-width: var(--fa-counter-max-width, 5em);
  min-width: var(--fa-counter-min-width, 1.5em);
  overflow: hidden;
  padding: var(--fa-counter-padding, 0.25em 0.5em);
  right: var(--fa-right, 0);
  text-overflow: ellipsis;
  top: var(--fa-top, 0);
  transform: scale(var(--fa-counter-scale, 0.25));
  transform-origin: top right;
}

.fa-layers-bottom-right {
  bottom: var(--fa-bottom, 0);
  right: var(--fa-right, 0);
  top: auto;
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: bottom right;
}

.fa-layers-bottom-left {
  bottom: var(--fa-bottom, 0);
  left: var(--fa-left, 0);
  right: auto;
  top: auto;
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: bottom left;
}

.fa-layers-top-right {
  top: var(--fa-top, 0);
  right: var(--fa-right, 0);
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: top right;
}

.fa-layers-top-left {
  left: var(--fa-left, 0);
  right: auto;
  top: var(--fa-top, 0);
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: top left;
}

.fa-1x {
  font-size: 1em;
}

.fa-2x {
  font-size: 2em;
}

.fa-3x {
  font-size: 3em;
}

.fa-4x {
  font-size: 4em;
}

.fa-5x {
  font-size: 5em;
}

.fa-6x {
  font-size: 6em;
}

.fa-7x {
  font-size: 7em;
}

.fa-8x {
  font-size: 8em;
}

.fa-9x {
  font-size: 9em;
}

.fa-10x {
  font-size: 10em;
}

.fa-2xs {
  font-size: calc(10 / 16 * 1em); /* converts a 10px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 10 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 10 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-xs {
  font-size: calc(12 / 16 * 1em); /* converts a 12px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 12 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 12 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-sm {
  font-size: calc(14 / 16 * 1em); /* converts a 14px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 14 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 14 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-lg {
  font-size: calc(20 / 16 * 1em); /* converts a 20px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 20 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 20 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-xl {
  font-size: calc(24 / 16 * 1em); /* converts a 24px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 24 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 24 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-2xl {
  font-size: calc(32 / 16 * 1em); /* converts a 32px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 32 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 32 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-width-auto {
  --fa-width: auto;
}

.fa-fw,
.fa-width-fixed {
  --fa-width: 1.25em;
}

.fa-ul {
  list-style-type: none;
  margin-inline-start: var(--fa-li-margin, 2.5em);
  padding-inline-start: 0;
}
.fa-ul > li {
  position: relative;
}

.fa-li {
  inset-inline-start: calc(-1 * var(--fa-li-width, 2em));
  position: absolute;
  text-align: center;
  width: var(--fa-li-width, 2em);
  line-height: inherit;
}

/* Heads Up: Bordered Icons will not be supported in the future!
  - This feature will be deprecated in the next major release of Font Awesome (v8)!
  - You may continue to use it in this version *v7), but it will not be supported in Font Awesome v8.
*/
/* Notes:
* --@{v.$css-prefix}-border-width = 1/16 by default (to render as ~1px based on a 16px default font-size)
* --@{v.$css-prefix}-border-padding =
  ** 3/16 for vertical padding (to give ~2px of vertical whitespace around an icon considering it's vertical alignment)
  ** 4/16 for horizontal padding (to give ~4px of horizontal whitespace around an icon)
*/
.fa-border {
  border-color: var(--fa-border-color, #eee);
  border-radius: var(--fa-border-radius, 0.1em);
  border-style: var(--fa-border-style, solid);
  border-width: var(--fa-border-width, 0.0625em);
  box-sizing: var(--fa-border-box-sizing, content-box);
  padding: var(--fa-border-padding, 0.1875em 0.25em);
}

.fa-pull-left,
.fa-pull-start {
  float: inline-start;
  margin-inline-end: var(--fa-pull-margin, 0.3em);
}

.fa-pull-right,
.fa-pull-end {
  float: inline-end;
  margin-inline-start: var(--fa-pull-margin, 0.3em);
}

.fa-beat {
  animation-name: fa-beat;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, ease-in-out);
}

.fa-bounce {
  animation-name: fa-bounce;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.28, 0.84, 0.42, 1));
}

.fa-fade {
  animation-name: fa-fade;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));
}

.fa-beat-fade {
  animation-name: fa-beat-fade;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));
}

.fa-flip {
  animation-name: fa-flip;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, ease-in-out);
}

.fa-shake {
  animation-name: fa-shake;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, linear);
}

.fa-spin {
  animation-name: fa-spin;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 2s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, linear);
}

.fa-spin-reverse {
  --fa-animation-direction: reverse;
}

.fa-pulse,
.fa-spin-pulse {
  animation-name: fa-spin;
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, steps(8));
}

@media (prefers-reduced-motion: reduce) {
  .fa-beat,
  .fa-bounce,
  .fa-fade,
  .fa-beat-fade,
  .fa-flip,
  .fa-pulse,
  .fa-shake,
  .fa-spin,
  .fa-spin-pulse {
    animation: none !important;
    transition: none !important;
  }
}
@keyframes fa-beat {
  0%, 90% {
    transform: scale(1);
  }
  45% {
    transform: scale(var(--fa-beat-scale, 1.25));
  }
}
@keyframes fa-bounce {
  0% {
    transform: scale(1, 1) translateY(0);
  }
  10% {
    transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);
  }
  30% {
    transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));
  }
  50% {
    transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);
  }
  57% {
    transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));
  }
  64% {
    transform: scale(1, 1) translateY(0);
  }
  100% {
    transform: scale(1, 1) translateY(0);
  }
}
@keyframes fa-fade {
  50% {
    opacity: var(--fa-fade-opacity, 0.4);
  }
}
@keyframes fa-beat-fade {
  0%, 100% {
    opacity: var(--fa-beat-fade-opacity, 0.4);
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(var(--fa-beat-fade-scale, 1.125));
  }
}
@keyframes fa-flip {
  50% {
    transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));
  }
}
@keyframes fa-shake {
  0% {
    transform: rotate(-15deg);
  }
  4% {
    transform: rotate(15deg);
  }
  8%, 24% {
    transform: rotate(-18deg);
  }
  12%, 28% {
    transform: rotate(18deg);
  }
  16% {
    transform: rotate(-22deg);
  }
  20% {
    transform: rotate(22deg);
  }
  32% {
    transform: rotate(-12deg);
  }
  36% {
    transform: rotate(12deg);
  }
  40%, 100% {
    transform: rotate(0deg);
  }
}
@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.fa-rotate-90 {
  transform: rotate(90deg);
}

.fa-rotate-180 {
  transform: rotate(180deg);
}

.fa-rotate-270 {
  transform: rotate(270deg);
}

.fa-flip-horizontal {
  transform: scale(-1, 1);
}

.fa-flip-vertical {
  transform: scale(1, -1);
}

.fa-flip-both,
.fa-flip-horizontal.fa-flip-vertical {
  transform: scale(-1, -1);
}

.fa-rotate-by {
  transform: rotate(var(--fa-rotate-angle, 0));
}

.svg-inline--fa .fa-primary {
  fill: var(--fa-primary-color, currentColor);
  opacity: var(--fa-primary-opacity, 1);
}

.svg-inline--fa .fa-secondary {
  fill: var(--fa-secondary-color, currentColor);
  opacity: var(--fa-secondary-opacity, 0.4);
}

.svg-inline--fa.fa-swap-opacity .fa-primary {
  opacity: var(--fa-secondary-opacity, 0.4);
}

.svg-inline--fa.fa-swap-opacity .fa-secondary {
  opacity: var(--fa-primary-opacity, 1);
}

.svg-inline--fa mask .fa-primary,
.svg-inline--fa mask .fa-secondary {
  fill: black;
}

.svg-inline--fa.fa-inverse {
  fill: var(--fa-inverse, #fff);
}

.fa-stack {
  display: inline-block;
  height: 2em;
  line-height: 2em;
  position: relative;
  vertical-align: middle;
  width: 2.5em;
}

.fa-inverse {
  color: var(--fa-inverse, #fff);
}

.svg-inline--fa.fa-stack-1x {
  height: 1em;
  width: 1.25em;
}
.svg-inline--fa.fa-stack-2x {
  height: 2em;
  width: 2.5em;
}

.fa-stack-1x,
.fa-stack-2x {
  bottom: 0;
  left: 0;
  margin: auto;
  position: absolute;
  right: 0;
  top: 0;
  z-index: var(--fa-stack-z-index, auto);
}`;function Sn(){var e=mn,t=hn,r=b.cssPrefix,n=b.replacementClass,a=Qs;if(r!==e||n!==t){var s=new RegExp("\\.".concat(e,"\\-"),"g"),i=new RegExp("\\--".concat(e,"\\-"),"g"),f=new RegExp("\\.".concat(t),"g");a=a.replace(s,".".concat(r,"-")).replace(i,"--".concat(r,"-")).replace(f,".".concat(n))}return a}var Qt=!1;function Qe(){b.autoAddCss&&!Qt&&(Bs(Sn()),Qt=!0)}var ei={mixout:function(){return{dom:{css:Sn,insertCss:Qe}}},hooks:function(){return{beforeDOMElementCreation:function(){Qe()},beforeI2svg:function(){Qe()}}}},K=Q||{};K[q]||(K[q]={});K[q].styles||(K[q].styles={});K[q].hooks||(K[q].hooks={});K[q].shims||(K[q].shims=[]);var G=K[q],An=[],In=function(){T.removeEventListener("DOMContentLoaded",In),je=1,An.map(function(t){return t()})},je=!1;J&&(je=(T.documentElement.doScroll?/^loaded|^c/:/^loaded|^i|^c/).test(T.readyState),je||T.addEventListener("DOMContentLoaded",In));function ti(e){J&&(je?setTimeout(e,0):An.push(e))}function Se(e){var t=e.tag,r=e.attributes,n=r===void 0?{}:r,a=e.children,s=a===void 0?[]:a;return typeof e=="string"?$n(e):"<".concat(t," ").concat(Ks(n),">").concat(s.map(Se).join(""),"</").concat(t,">")}function er(e,t,r){if(e&&e[t]&&e[t][r])return{prefix:t,iconName:r,icon:e[t][r]}}var ri=function(t,r){return function(n,a,s,i){return t.call(r,n,a,s,i)}},et=function(t,r,n,a){var s=Object.keys(t),i=s.length,f=a!==void 0?ri(r,a):r,o,c,l;for(n===void 0?(o=1,l=t[s[0]]):(o=0,l=n);o<i;o++)c=s[o],l=f(l,t[c],c,t);return l};function wn(e){return U(e).length!==1?null:e.codePointAt(0).toString(16)}function tr(e){return Object.keys(e).reduce(function(t,r){var n=e[r],a=!!n.icon;return a?t[n.iconName]=n.icon:t[r]=n,t},{})}function xn(e,t){var r=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{},n=r.skipHooks,a=n===void 0?!1:n,s=tr(t);typeof G.hooks.addPack=="function"&&!a?G.hooks.addPack(e,tr(t)):G.styles[e]=m(m({},G.styles[e]||{}),s),e==="fas"&&xn("fa",t)}var ye=G.styles,ni=G.shims,Rn=Object.keys(bn),ai=Rn.reduce(function(e,t){return e[t]=Object.keys(bn[t]),e},{}),Ot=null,Nn={},On={},Pn={},kn={},Ln={};function si(e){return~Ws.indexOf(e)}function ii(e,t){var r=t.split("-"),n=r[0],a=r.slice(1).join("-");return n===e&&a!==""&&!si(a)?a:null}var Tn=function(){var t=function(s){return et(ye,function(i,f,o){return i[o]=et(f,s,{}),i},{})};Nn=t(function(a,s,i){if(s[3]&&(a[s[3]]=i),s[2]){var f=s[2].filter(function(o){return typeof o=="number"});f.forEach(function(o){a[o.toString(16)]=i})}return a}),On=t(function(a,s,i){if(a[i]=i,s[2]){var f=s[2].filter(function(o){return typeof o=="string"});f.forEach(function(o){a[o]=i})}return a}),Ln=t(function(a,s,i){var f=s[2];return a[i]=i,f.forEach(function(o){a[o]=i}),a});var r="far"in ye||b.autoFetchSvg,n=et(ni,function(a,s){var i=s[0],f=s[1],o=s[2];return f==="far"&&!r&&(f="fas"),typeof i=="string"&&(a.names[i]={prefix:f,iconName:o}),typeof i=="number"&&(a.unicodes[i.toString(16)]={prefix:f,iconName:o}),a},{names:{},unicodes:{}});Pn=n.names,kn=n.unicodes,Ot=ze(b.styleDefault,{family:b.familyDefault})};Hs(function(e){Ot=ze(e.styleDefault,{family:b.familyDefault})});Tn();function Pt(e,t){return(Nn[e]||{})[t]}function oi(e,t){return(On[e]||{})[t]}function re(e,t){return(Ln[e]||{})[t]}function Cn(e){return Pn[e]||{prefix:null,iconName:null}}function li(e){var t=kn[e],r=Pt("fas",e);return t||(r?{prefix:"fas",iconName:r}:null)||{prefix:null,iconName:null}}function ee(){return Ot}var Fn=function(){return{prefix:null,iconName:null,rest:[]}};function fi(e){var t=_,r=Rn.reduce(function(n,a){return n[a]="".concat(b.cssPrefix,"-").concat(a),n},{});return fn.forEach(function(n){(e.includes(r[n])||e.some(function(a){return ai[n].includes(a)}))&&(t=n)}),t}function ze(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},r=t.family,n=r===void 0?_:r,a=Ds[n][e];if(n===Ee&&!e)return"fad";var s=Jt[n][e]||Jt[n][a],i=e in G.styles?e:null,f=s||i||null;return f}function ci(e){var t=[],r=null;return e.forEach(function(n){var a=ii(b.cssPrefix,n);a?r=a:n&&t.push(n)}),{iconName:r,rest:t}}function rr(e){return e.sort().filter(function(t,r,n){return n.indexOf(t)===r})}var nr=un.concat(cn);function Ge(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},r=t.skipLookups,n=r===void 0?!1:r,a=null,s=rr(e.filter(function(d){return nr.includes(d)})),i=rr(e.filter(function(d){return!nr.includes(d)})),f=s.filter(function(d){return a=d,!Br.includes(d)}),o=De(f,1),c=o[0],l=c===void 0?null:c,u=fi(s),p=m(m({},ci(i)),{},{prefix:ze(l,{family:u})});return m(m(m({},p),hi({values:e,family:u,styles:ye,config:b,canonical:p,givenPrefix:a})),ui(n,a,p))}function ui(e,t,r){var n=r.prefix,a=r.iconName;if(e||!n||!a)return{prefix:n,iconName:a};var s=t==="fa"?Cn(a):{},i=re(n,a);return a=s.iconName||i||a,n=s.prefix||n,n==="far"&&!ye.far&&ye.fas&&!b.autoFetchSvg&&(n="fas"),{prefix:n,iconName:a}}var di=fn.filter(function(e){return e!==_||e!==Ee}),mi=Object.keys(ft).filter(function(e){return e!==_}).map(function(e){return Object.keys(ft[e])}).flat();function hi(e){var t=e.values,r=e.family,n=e.canonical,a=e.givenPrefix,s=a===void 0?"":a,i=e.styles,f=i===void 0?{}:i,o=e.config,c=o===void 0?{}:o,l=r===Ee,u=t.includes("fa-duotone")||t.includes("fad"),p=c.familyDefault==="duotone",d=n.prefix==="fad"||n.prefix==="fa-duotone";if(!l&&(u||p||d)&&(n.prefix="fad"),(t.includes("fa-brands")||t.includes("fab"))&&(n.prefix="fab"),!n.prefix&&di.includes(r)){var O=Object.keys(f).find(function(P){return mi.includes(P)});if(O||c.autoFetchSvg){var h=ja.get(r).defaultShortPrefixId;n.prefix=h,n.iconName=re(n.prefix,n.iconName)||n.iconName}}return(n.prefix==="fa"||s==="fa")&&(n.prefix=ee()||"fas"),n}var pi=function(){function e(){la(this,e),this.definitions={}}return fa(e,[{key:"add",value:function(){for(var r=this,n=arguments.length,a=new Array(n),s=0;s<n;s++)a[s]=arguments[s];var i=a.reduce(this._pullDefinitions,{});Object.keys(i).forEach(function(f){r.definitions[f]=m(m({},r.definitions[f]||{}),i[f]),xn(f,i[f]),Tn()})}},{key:"reset",value:function(){this.definitions={}}},{key:"_pullDefinitions",value:function(r,n){var a=n.prefix&&n.iconName&&n.icon?{0:n}:n;return Object.keys(a).map(function(s){var i=a[s],f=i.prefix,o=i.iconName,c=i.icon,l=c[2];r[f]||(r[f]={}),l.length>0&&l.forEach(function(u){typeof u=="string"&&(r[f][u]=c)}),r[f][o]=c}),r}}])}(),ar=[],oe={},le={},vi=Object.keys(le);function gi(e,t){var r=t.mixoutsTo;return ar=e,oe={},Object.keys(le).forEach(function(n){vi.indexOf(n)===-1&&delete le[n]}),ar.forEach(function(n){var a=n.mixout?n.mixout():{};if(Object.keys(a).forEach(function(i){typeof a[i]=="function"&&(r[i]=a[i]),Fe(a[i])==="object"&&Object.keys(a[i]).forEach(function(f){r[i]||(r[i]={}),r[i][f]=a[i][f]})}),n.hooks){var s=n.hooks();Object.keys(s).forEach(function(i){oe[i]||(oe[i]=[]),oe[i].push(s[i])})}n.provides&&n.provides(le)}),r}function pt(e,t){for(var r=arguments.length,n=new Array(r>2?r-2:0),a=2;a<r;a++)n[a-2]=arguments[a];var s=oe[e]||[];return s.forEach(function(i){t=i.apply(null,[t].concat(n))}),t}function ae(e){for(var t=arguments.length,r=new Array(t>1?t-1:0),n=1;n<t;n++)r[n-1]=arguments[n];var a=oe[e]||[];a.forEach(function(s){s.apply(null,r)})}function te(){var e=arguments[0],t=Array.prototype.slice.call(arguments,1);return le[e]?le[e].apply(null,t):void 0}function vt(e){e.prefix==="fa"&&(e.prefix="fas");var t=e.iconName,r=e.prefix||ee();if(t)return t=re(r,t)||t,er(jn.definitions,r,t)||er(G.styles,r,t)}var jn=new pi,bi=function(){b.autoReplaceSvg=!1,b.observeMutations=!1,ae("noAuto")},yi={i2svg:function(){var t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};return J?(ae("beforeI2svg",t),te("pseudoElements2svg",t),te("i2svg",t)):Promise.reject(new Error("Operation requires a DOM of some kind."))},watch:function(){var t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},r=t.autoReplaceSvgRoot;b.autoReplaceSvg===!1&&(b.autoReplaceSvg=!0),b.observeMutations=!0,ti(function(){$i({autoReplaceSvgRoot:r}),ae("watch",t)})}},Ei={icon:function(t){if(t===null)return null;if(Fe(t)==="object"&&t.prefix&&t.iconName)return{prefix:t.prefix,iconName:re(t.prefix,t.iconName)||t.iconName};if(Array.isArray(t)&&t.length===2){var r=t[1].indexOf("fa-")===0?t[1].slice(3):t[1],n=ze(t[0]);return{prefix:n,iconName:re(n,r)||r}}if(typeof t=="string"&&(t.indexOf("".concat(b.cssPrefix,"-"))>-1||t.match(Ms))){var a=Ge(t.split(" "),{skipLookups:!0});return{prefix:a.prefix||ee(),iconName:re(a.prefix,a.iconName)||a.iconName}}if(typeof t=="string"){var s=ee();return{prefix:s,iconName:re(s,t)||t}}}},z={noAuto:bi,config:b,dom:yi,parse:Ei,library:jn,findIconDefinition:vt,toHtml:Se},$i=function(){var t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},r=t.autoReplaceSvgRoot,n=r===void 0?T:r;(Object.keys(G.styles).length>0||b.autoFetchSvg)&&J&&b.autoReplaceSvg&&z.dom.i2svg({node:n})};function Ue(e,t){return Object.defineProperty(e,"abstract",{get:t}),Object.defineProperty(e,"html",{get:function(){return e.abstract.map(function(n){return Se(n)})}}),Object.defineProperty(e,"node",{get:function(){if(J){var n=T.createElement("div");return n.innerHTML=e.html,n.children}}}),e}function Si(e){var t=e.children,r=e.main,n=e.mask,a=e.attributes,s=e.styles,i=e.transform;if(Nt(i)&&r.found&&!n.found){var f=r.width,o=r.height,c={x:f/o/2,y:.5};a.style=Me(m(m({},s),{},{"transform-origin":"".concat(c.x+i.x/16,"em ").concat(c.y+i.y/16,"em")}))}return[{tag:"svg",attributes:a,children:t}]}function Ai(e){var t=e.prefix,r=e.iconName,n=e.children,a=e.attributes,s=e.symbol,i=s===!0?"".concat(t,"-").concat(b.cssPrefix,"-").concat(r):s;return[{tag:"svg",attributes:{style:"display: none;"},children:[{tag:"symbol",attributes:m(m({},a),{},{id:i}),children:n}]}]}function Ii(e){var t=["aria-label","aria-labelledby","title","role"];return t.some(function(r){return r in e})}function kt(e){var t=e.icons,r=t.main,n=t.mask,a=e.prefix,s=e.iconName,i=e.transform,f=e.symbol,o=e.maskId,c=e.extra,l=e.watchable,u=l===void 0?!1:l,p=n.found?n:r,d=p.width,O=p.height,h=[b.replacementClass,s?"".concat(b.cssPrefix,"-").concat(s):""].filter(function(w){return c.classes.indexOf(w)===-1}).filter(function(w){return w!==""||!!w}).concat(c.classes).join(" "),P={children:[],attributes:m(m({},c.attributes),{},{"data-prefix":a,"data-icon":s,class:h,role:c.attributes.role||"img",viewBox:"0 0 ".concat(d," ").concat(O)})};!Ii(c.attributes)&&!c.attributes["aria-hidden"]&&(P.attributes["aria-hidden"]="true"),u&&(P.attributes[ne]="");var N=m(m({},P),{},{prefix:a,iconName:s,main:r,mask:n,maskId:o,transform:i,symbol:f,styles:m({},c.styles)}),L=n.found&&r.found?te("generateAbstractMask",N)||{children:[],attributes:{}}:te("generateAbstractIcon",N)||{children:[],attributes:{}},I=L.children,j=L.attributes;return N.children=I,N.attributes=j,f?Ai(N):Si(N)}function sr(e){var t=e.content,r=e.width,n=e.height,a=e.transform,s=e.extra,i=e.watchable,f=i===void 0?!1:i,o=m(m({},s.attributes),{},{class:s.classes.join(" ")});f&&(o[ne]="");var c=m({},s.styles);Nt(a)&&(c.transform=Zs({transform:a,startCentered:!0,width:r,height:n}),c["-webkit-transform"]=c.transform);var l=Me(c);l.length>0&&(o.style=l);var u=[];return u.push({tag:"span",attributes:o,children:[t]}),u}function wi(e){var t=e.content,r=e.extra,n=m(m({},r.attributes),{},{class:r.classes.join(" ")}),a=Me(r.styles);a.length>0&&(n.style=a);var s=[];return s.push({tag:"span",attributes:n,children:[t]}),s}var tt=G.styles;function gt(e){var t=e[0],r=e[1],n=e.slice(4),a=De(n,1),s=a[0],i=null;return Array.isArray(s)?i={tag:"g",attributes:{class:"".concat(b.cssPrefix,"-").concat(Ze.GROUP)},children:[{tag:"path",attributes:{class:"".concat(b.cssPrefix,"-").concat(Ze.SECONDARY),fill:"currentColor",d:s[0]}},{tag:"path",attributes:{class:"".concat(b.cssPrefix,"-").concat(Ze.PRIMARY),fill:"currentColor",d:s[1]}}]}:i={tag:"path",attributes:{fill:"currentColor",d:s}},{found:!0,width:t,height:r,icon:i}}var xi={found:!1,width:512,height:512};function Ri(e,t){!vn&&!b.showMissingIcons&&e&&console.error('Icon with name "'.concat(e,'" and prefix "').concat(t,'" is missing.'))}function bt(e,t){var r=t;return t==="fa"&&b.styleDefault!==null&&(t=ee()),new Promise(function(n,a){if(r==="fa"){var s=Cn(e)||{};e=s.iconName||e,t=s.prefix||t}if(e&&t&&tt[t]&&tt[t][e]){var i=tt[t][e];return n(gt(i))}Ri(e,t),n(m(m({},xi),{},{icon:b.showMissingIcons&&e?te("missingIconAbstract")||{}:{}}))})}var ir=function(){},yt=b.measurePerformance&&Ie&&Ie.mark&&Ie.measure?Ie:{mark:ir,measure:ir},ve='FA "7.0.0"',Ni=function(t){return yt.mark("".concat(ve," ").concat(t," begins")),function(){return _n(t)}},_n=function(t){yt.mark("".concat(ve," ").concat(t," ends")),yt.measure("".concat(ve," ").concat(t),"".concat(ve," ").concat(t," begins"),"".concat(ve," ").concat(t," ends"))},Lt={begin:Ni,end:_n},Te=function(){};function or(e){var t=e.getAttribute?e.getAttribute(ne):null;return typeof t=="string"}function Oi(e){var t=e.getAttribute?e.getAttribute(wt):null,r=e.getAttribute?e.getAttribute(xt):null;return t&&r}function Pi(e){return e&&e.classList&&e.classList.contains&&e.classList.contains(b.replacementClass)}function ki(){if(b.autoReplaceSvg===!0)return Ce.replace;var e=Ce[b.autoReplaceSvg];return e||Ce.replace}function Li(e){return T.createElementNS("http://www.w3.org/2000/svg",e)}function Ti(e){return T.createElement(e)}function Dn(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},r=t.ceFn,n=r===void 0?e.tag==="svg"?Li:Ti:r;if(typeof e=="string")return T.createTextNode(e);var a=n(e.tag);Object.keys(e.attributes||[]).forEach(function(i){a.setAttribute(i,e.attributes[i])});var s=e.children||[];return s.forEach(function(i){a.appendChild(Dn(i,{ceFn:n}))}),a}function Ci(e){var t=" ".concat(e.outerHTML," ");return t="".concat(t,"Font Awesome fontawesome.com "),t}var Ce={replace:function(t){var r=t[0];if(r.parentNode)if(t[1].forEach(function(a){r.parentNode.insertBefore(Dn(a),r)}),r.getAttribute(ne)===null&&b.keepOriginalSource){var n=T.createComment(Ci(r));r.parentNode.replaceChild(n,r)}else r.remove()},nest:function(t){var r=t[0],n=t[1];if(~Rt(r).indexOf(b.replacementClass))return Ce.replace(t);var a=new RegExp("".concat(b.cssPrefix,"-.*"));if(delete n[0].attributes.id,n[0].attributes.class){var s=n[0].attributes.class.split(" ").reduce(function(f,o){return o===b.replacementClass||o.match(a)?f.toSvg.push(o):f.toNode.push(o),f},{toNode:[],toSvg:[]});n[0].attributes.class=s.toSvg.join(" "),s.toNode.length===0?r.removeAttribute("class"):r.setAttribute("class",s.toNode.join(" "))}var i=n.map(function(f){return Se(f)}).join(`
`);r.setAttribute(ne,""),r.innerHTML=i}};function lr(e){e()}function Mn(e,t){var r=typeof t=="function"?t:Te;if(e.length===0)r();else{var n=lr;b.mutateApproach===js&&(n=Q.requestAnimationFrame||lr),n(function(){var a=ki(),s=Lt.begin("mutate");e.map(a),s(),r()})}}var Tt=!1;function zn(){Tt=!0}function Et(){Tt=!1}var _e=null;function fr(e){if(Ht&&b.observeMutations){var t=e.treeCallback,r=t===void 0?Te:t,n=e.nodeCallback,a=n===void 0?Te:n,s=e.pseudoElementsCallback,i=s===void 0?Te:s,f=e.observeMutationsRoot,o=f===void 0?T:f;_e=new Ht(function(c){if(!Tt){var l=ee();ce(c).forEach(function(u){if(u.type==="childList"&&u.addedNodes.length>0&&!or(u.addedNodes[0])&&(b.searchPseudoElements&&i(u.target),r(u.target)),u.type==="attributes"&&u.target.parentNode&&b.searchPseudoElements&&i([u.target],!0),u.type==="attributes"&&or(u.target)&&~Us.indexOf(u.attributeName))if(u.attributeName==="class"&&Oi(u.target)){var p=Ge(Rt(u.target)),d=p.prefix,O=p.iconName;u.target.setAttribute(wt,d||l),O&&u.target.setAttribute(xt,O)}else Pi(u.target)&&a(u.target)})}}),J&&_e.observe(o,{childList:!0,attributes:!0,characterData:!0,subtree:!0})}}function Fi(){_e&&_e.disconnect()}function ji(e){var t=e.getAttribute("style"),r=[];return t&&(r=t.split(";").reduce(function(n,a){var s=a.split(":"),i=s[0],f=s.slice(1);return i&&f.length>0&&(n[i]=f.join(":").trim()),n},{})),r}function _i(e){var t=e.getAttribute("data-prefix"),r=e.getAttribute("data-icon"),n=e.innerText!==void 0?e.innerText.trim():"",a=Ge(Rt(e));return a.prefix||(a.prefix=ee()),t&&r&&(a.prefix=t,a.iconName=r),a.iconName&&a.prefix||(a.prefix&&n.length>0&&(a.iconName=oi(a.prefix,e.innerText)||Pt(a.prefix,wn(e.innerText))),!a.iconName&&b.autoFetchSvg&&e.firstChild&&e.firstChild.nodeType===Node.TEXT_NODE&&(a.iconName=e.firstChild.data)),a}function Di(e){var t=ce(e.attributes).reduce(function(r,n){return r.name!=="class"&&r.name!=="style"&&(r[n.name]=n.value),r},{});return t}function Mi(){return{iconName:null,prefix:null,transform:Y,symbol:!1,mask:{iconName:null,prefix:null,rest:[]},maskId:null,extra:{classes:[],styles:{},attributes:{}}}}function cr(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{styleParser:!0},r=_i(e),n=r.iconName,a=r.prefix,s=r.rest,i=Di(e),f=pt("parseNodeAttributes",{},e),o=t.styleParser?ji(e):[];return m({iconName:n,prefix:a,transform:Y,mask:{iconName:null,prefix:null,rest:[]},maskId:null,symbol:!1,extra:{classes:s,styles:o,attributes:i}},f)}var zi=G.styles;function Gn(e){var t=b.autoReplaceSvg==="nest"?cr(e,{styleParser:!1}):cr(e);return~t.extra.classes.indexOf(yn)?te("generateLayersText",e,t):te("generateSvgReplacementMutation",e,t)}function Gi(){return[].concat(U(cn),U(un))}function ur(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;if(!J)return Promise.resolve();var r=T.documentElement.classList,n=function(u){return r.add("".concat(Kt,"-").concat(u))},a=function(u){return r.remove("".concat(Kt,"-").concat(u))},s=b.autoFetchSvg?Gi():Br.concat(Object.keys(zi));s.includes("fa")||s.push("fa");var i=[".".concat(yn,":not([").concat(ne,"])")].concat(s.map(function(l){return".".concat(l,":not([").concat(ne,"])")})).join(", ");if(i.length===0)return Promise.resolve();var f=[];try{f=ce(e.querySelectorAll(i))}catch{}if(f.length>0)n("pending"),a("complete");else return Promise.resolve();var o=Lt.begin("onTree"),c=f.reduce(function(l,u){try{var p=Gn(u);p&&l.push(p)}catch(d){vn||d.name==="MissingIcon"&&console.error(d)}return l},[]);return new Promise(function(l,u){Promise.all(c).then(function(p){Mn(p,function(){n("active"),n("complete"),a("pending"),typeof t=="function"&&t(),o(),l()})}).catch(function(p){o(),u(p)})})}function Ui(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;Gn(e).then(function(r){r&&Mn([r],t)})}function Wi(e){return function(t){var r=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},n=(t||{}).icon?t:vt(t||{}),a=r.mask;return a&&(a=(a||{}).icon?a:vt(a||{})),e(n,m(m({},r),{},{mask:a}))}}var Vi=function(t){var r=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},n=r.transform,a=n===void 0?Y:n,s=r.symbol,i=s===void 0?!1:s,f=r.mask,o=f===void 0?null:f,c=r.maskId,l=c===void 0?null:c,u=r.classes,p=u===void 0?[]:u,d=r.attributes,O=d===void 0?{}:d,h=r.styles,P=h===void 0?{}:h;if(t){var N=t.prefix,L=t.iconName,I=t.icon;return Ue(m({type:"icon"},t),function(){return ae("beforeDOMElementCreation",{iconDefinition:t,params:r}),kt({icons:{main:gt(I),mask:o?gt(o.icon):{found:!1,width:null,height:null,icon:{}}},prefix:N,iconName:L,transform:m(m({},Y),a),symbol:i,maskId:l,extra:{attributes:O,styles:P,classes:p}})})}},Xi={mixout:function(){return{icon:Wi(Vi)}},hooks:function(){return{mutationObserverCallbacks:function(r){return r.treeCallback=ur,r.nodeCallback=Ui,r}}},provides:function(t){t.i2svg=function(r){var n=r.node,a=n===void 0?T:n,s=r.callback,i=s===void 0?function(){}:s;return ur(a,i)},t.generateSvgReplacementMutation=function(r,n){var a=n.iconName,s=n.prefix,i=n.transform,f=n.symbol,o=n.mask,c=n.maskId,l=n.extra;return new Promise(function(u,p){Promise.all([bt(a,s),o.iconName?bt(o.iconName,o.prefix):Promise.resolve({found:!1,width:512,height:512,icon:{}})]).then(function(d){var O=De(d,2),h=O[0],P=O[1];u([r,kt({icons:{main:h,mask:P},prefix:s,iconName:a,transform:i,symbol:f,maskId:c,extra:l,watchable:!0})])}).catch(p)})},t.generateAbstractIcon=function(r){var n=r.children,a=r.attributes,s=r.main,i=r.transform,f=r.styles,o=Me(f);o.length>0&&(a.style=o);var c;return Nt(i)&&(c=te("generateAbstractTransformGrouping",{main:s,transform:i,containerWidth:s.width,iconWidth:s.width})),n.push(c||s.icon),{children:n,attributes:a}}}},Yi={mixout:function(){return{layer:function(r){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},a=n.classes,s=a===void 0?[]:a;return Ue({type:"layer"},function(){ae("beforeDOMElementCreation",{assembler:r,params:n});var i=[];return r(function(f){Array.isArray(f)?f.map(function(o){i=i.concat(o.abstract)}):i=i.concat(f.abstract)}),[{tag:"span",attributes:{class:["".concat(b.cssPrefix,"-layers")].concat(U(s)).join(" ")},children:i}]})}}}},Hi={mixout:function(){return{counter:function(r){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},a=n.title,s=a===void 0?null:a,i=n.classes,f=i===void 0?[]:i,o=n.attributes,c=o===void 0?{}:o,l=n.styles,u=l===void 0?{}:l;return Ue({type:"counter",content:r},function(){return ae("beforeDOMElementCreation",{content:r,params:n}),wi({content:r.toString(),title:s,extra:{attributes:c,styles:u,classes:["".concat(b.cssPrefix,"-layers-counter")].concat(U(f))}})})}}}},Bi={mixout:function(){return{text:function(r){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},a=n.transform,s=a===void 0?Y:a,i=n.classes,f=i===void 0?[]:i,o=n.attributes,c=o===void 0?{}:o,l=n.styles,u=l===void 0?{}:l;return Ue({type:"text",content:r},function(){return ae("beforeDOMElementCreation",{content:r,params:n}),sr({content:r,transform:m(m({},Y),s),extra:{attributes:c,styles:u,classes:["".concat(b.cssPrefix,"-layers-text")].concat(U(f))}})})}}},provides:function(t){t.generateLayersText=function(r,n){var a=n.transform,s=n.extra,i=null,f=null;if(Yr){var o=parseInt(getComputedStyle(r).fontSize,10),c=r.getBoundingClientRect();i=c.width/o,f=c.height/o}return Promise.resolve([r,sr({content:r.innerHTML,width:i,height:f,transform:a,extra:s,watchable:!0})])}}},Un=new RegExp('"',"ug"),dr=[1105920,1112319],mr=m(m(m(m({},{FontAwesome:{normal:"fas",400:"fas"}}),Fa),Cs),Va),$t=Object.keys(mr).reduce(function(e,t){return e[t.toLowerCase()]=mr[t],e},{}),qi=Object.keys($t).reduce(function(e,t){var r=$t[t];return e[t]=r[900]||U(Object.entries(r))[0][1],e},{});function Ki(e){var t=e.replace(Un,"");return wn(U(t)[0]||"")}function Ji(e){var t=e.getPropertyValue("font-feature-settings").includes("ss01"),r=e.getPropertyValue("content"),n=r.replace(Un,""),a=n.codePointAt(0),s=a>=dr[0]&&a<=dr[1],i=n.length===2?n[0]===n[1]:!1;return s||i||t}function Zi(e,t){var r=e.replace(/^['"]|['"]$/g,"").toLowerCase(),n=parseInt(t),a=isNaN(n)?"normal":n;return($t[r]||{})[a]||qi[r]}function hr(e,t){var r="".concat(Fs).concat(t.replace(":","-"));return new Promise(function(n,a){if(e.getAttribute(r)!==null)return n();var s=ce(e.children),i=s.filter(function(de){return de.getAttribute(ut)===t})[0],f=Q.getComputedStyle(e,t),o=f.getPropertyValue("font-family"),c=o.match(zs),l=f.getPropertyValue("font-weight"),u=f.getPropertyValue("content");if(i&&!c)return e.removeChild(i),n();if(c&&u!=="none"&&u!==""){var p=f.getPropertyValue("content"),d=Zi(o,l),O=Ki(p),h=c[0].startsWith("FontAwesome"),P=Ji(f),N=Pt(d,O),L=N;if(h){var I=li(O);I.iconName&&I.prefix&&(N=I.iconName,d=I.prefix)}if(N&&!P&&(!i||i.getAttribute(wt)!==d||i.getAttribute(xt)!==L)){e.setAttribute(r,L),i&&e.removeChild(i);var j=Mi(),w=j.extra;w.attributes[ut]=t,bt(N,d).then(function(de){var Be=kt(m(m({},j),{},{icons:{main:de,mask:Fn()},prefix:d,iconName:L,extra:w,watchable:!0})),me=T.createElementNS("http://www.w3.org/2000/svg","svg");t==="::before"?e.insertBefore(me,e.firstChild):e.appendChild(me),me.outerHTML=Be.map(function(qe){return Se(qe)}).join(`
`),e.removeAttribute(r),n()}).catch(a)}else n()}else n()})}function Qi(e){return Promise.all([hr(e,"::before"),hr(e,"::after")])}function eo(e){return e.parentNode!==document.head&&!~_s.indexOf(e.tagName.toUpperCase())&&!e.getAttribute(ut)&&(!e.parentNode||e.parentNode.tagName!=="svg")}var to=function(t){return!!t&&pn.some(function(r){return t.includes(r)})},ro=function(t){if(!t)return[];for(var r=new Set,n=[t],a=[/(?=\s:)/,new RegExp("(?<=\\)\\)?[^,]*,)")],s=function(){var d=f[i];n=n.flatMap(function(O){return O.split(d).map(function(h){return h.replace(/,\s*$/,"").trim()})})},i=0,f=a;i<f.length;i++)s();n=n.flatMap(function(p){return p.includes("(")?p:p.split(",").map(function(d){return d.trim()})});var o=Le(n),c;try{for(o.s();!(c=o.n()).done;){var l=c.value;if(to(l)){var u=pn.reduce(function(p,d){return p.replace(d,"")},l);u!==""&&u!=="*"&&r.add(u)}}}catch(p){o.e(p)}finally{o.f()}return r};function pr(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!1;if(J){var r;if(t)r=e;else if(b.searchPseudoElementsFullScan)r=e.querySelectorAll("*");else{var n=new Set,a=Le(document.styleSheets),s;try{for(a.s();!(s=a.n()).done;){var i=s.value;try{var f=Le(i.cssRules),o;try{for(f.s();!(o=f.n()).done;){var c=o.value,l=ro(c.selectorText),u=Le(l),p;try{for(u.s();!(p=u.n()).done;){var d=p.value;n.add(d)}}catch(h){u.e(h)}finally{u.f()}}}catch(h){f.e(h)}finally{f.f()}}catch(h){b.searchPseudoElementsWarnings&&console.warn("Font Awesome: cannot parse stylesheet: ".concat(i.href," (").concat(h.message,`)
If it declares any Font Awesome CSS pseudo-elements, they will not be rendered as SVG icons. Add crossorigin="anonymous" to the <link>, enable searchPseudoElementsFullScan for slower but more thorough DOM parsing, or suppress this warning by setting searchPseudoElementsWarnings to false.`))}}}catch(h){a.e(h)}finally{a.f()}if(!n.size)return;var O=Array.from(n).join(", ");try{r=e.querySelectorAll(O)}catch{}}return new Promise(function(h,P){var N=ce(r).filter(eo).map(Qi),L=Lt.begin("searchPseudoElements");zn(),Promise.all(N).then(function(){L(),Et(),h()}).catch(function(){L(),Et(),P()})})}}var no={hooks:function(){return{mutationObserverCallbacks:function(r){return r.pseudoElementsCallback=pr,r}}},provides:function(t){t.pseudoElements2svg=function(r){var n=r.node,a=n===void 0?T:n;b.searchPseudoElements&&pr(a)}}},vr=!1,ao={mixout:function(){return{dom:{unwatch:function(){zn(),vr=!0}}}},hooks:function(){return{bootstrap:function(){fr(pt("mutationObserverCallbacks",{}))},noAuto:function(){Fi()},watch:function(r){var n=r.observeMutationsRoot;vr?Et():fr(pt("mutationObserverCallbacks",{observeMutationsRoot:n}))}}}},gr=function(t){var r={size:16,x:0,y:0,flipX:!1,flipY:!1,rotate:0};return t.toLowerCase().split(" ").reduce(function(n,a){var s=a.toLowerCase().split("-"),i=s[0],f=s.slice(1).join("-");if(i&&f==="h")return n.flipX=!0,n;if(i&&f==="v")return n.flipY=!0,n;if(f=parseFloat(f),isNaN(f))return n;switch(i){case"grow":n.size=n.size+f;break;case"shrink":n.size=n.size-f;break;case"left":n.x=n.x-f;break;case"right":n.x=n.x+f;break;case"up":n.y=n.y-f;break;case"down":n.y=n.y+f;break;case"rotate":n.rotate=n.rotate+f;break}return n},r)},so={mixout:function(){return{parse:{transform:function(r){return gr(r)}}}},hooks:function(){return{parseNodeAttributes:function(r,n){var a=n.getAttribute("data-fa-transform");return a&&(r.transform=gr(a)),r}}},provides:function(t){t.generateAbstractTransformGrouping=function(r){var n=r.main,a=r.transform,s=r.containerWidth,i=r.iconWidth,f={transform:"translate(".concat(s/2," 256)")},o="translate(".concat(a.x*32,", ").concat(a.y*32,") "),c="scale(".concat(a.size/16*(a.flipX?-1:1),", ").concat(a.size/16*(a.flipY?-1:1),") "),l="rotate(".concat(a.rotate," 0 0)"),u={transform:"".concat(o," ").concat(c," ").concat(l)},p={transform:"translate(".concat(i/2*-1," -256)")},d={outer:f,inner:u,path:p};return{tag:"g",attributes:m({},d.outer),children:[{tag:"g",attributes:m({},d.inner),children:[{tag:n.icon.tag,children:n.icon.children,attributes:m(m({},n.icon.attributes),d.path)}]}]}}}},rt={x:0,y:0,width:"100%",height:"100%"};function br(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!0;return e.attributes&&(e.attributes.fill||t)&&(e.attributes.fill="black"),e}function io(e){return e.tag==="g"?e.children:[e]}var oo={hooks:function(){return{parseNodeAttributes:function(r,n){var a=n.getAttribute("data-fa-mask"),s=a?Ge(a.split(" ").map(function(i){return i.trim()})):Fn();return s.prefix||(s.prefix=ee()),r.mask=s,r.maskId=n.getAttribute("data-fa-mask-id"),r}}},provides:function(t){t.generateAbstractMask=function(r){var n=r.children,a=r.attributes,s=r.main,i=r.mask,f=r.maskId,o=r.transform,c=s.width,l=s.icon,u=i.width,p=i.icon,d=Js({transform:o,containerWidth:u,iconWidth:c}),O={tag:"rect",attributes:m(m({},rt),{},{fill:"white"})},h=l.children?{children:l.children.map(br)}:{},P={tag:"g",attributes:m({},d.inner),children:[br(m({tag:l.tag,attributes:m(m({},l.attributes),d.path)},h))]},N={tag:"g",attributes:m({},d.outer),children:[P]},L="mask-".concat(f||Zt()),I="clip-".concat(f||Zt()),j={tag:"mask",attributes:m(m({},rt),{},{id:L,maskUnits:"userSpaceOnUse",maskContentUnits:"userSpaceOnUse"}),children:[O,N]},w={tag:"defs",children:[{tag:"clipPath",attributes:{id:I},children:io(p)},j]};return n.push(w,{tag:"rect",attributes:m({fill:"currentColor","clip-path":"url(#".concat(I,")"),mask:"url(#".concat(L,")")},rt)}),{children:n,attributes:a}}}},lo={provides:function(t){var r=!1;Q.matchMedia&&(r=Q.matchMedia("(prefers-reduced-motion: reduce)").matches),t.missingIconAbstract=function(){var n=[],a={fill:"currentColor"},s={attributeType:"XML",repeatCount:"indefinite",dur:"2s"};n.push({tag:"path",attributes:m(m({},a),{},{d:"M156.5,447.7l-12.6,29.5c-18.7-9.5-35.9-21.2-51.5-34.9l22.7-22.7C127.6,430.5,141.5,440,156.5,447.7z M40.6,272H8.5 c1.4,21.2,5.4,41.7,11.7,61.1L50,321.2C45.1,305.5,41.8,289,40.6,272z M40.6,240c1.4-18.8,5.2-37,11.1-54.1l-29.5-12.6 C14.7,194.3,10,216.7,8.5,240H40.6z M64.3,156.5c7.8-14.9,17.2-28.8,28.1-41.5L69.7,92.3c-13.7,15.6-25.5,32.8-34.9,51.5 L64.3,156.5z M397,419.6c-13.9,12-29.4,22.3-46.1,30.4l11.9,29.8c20.7-9.9,39.8-22.6,56.9-37.6L397,419.6z M115,92.4 c13.9-12,29.4-22.3,46.1-30.4l-11.9-29.8c-20.7,9.9-39.8,22.6-56.8,37.6L115,92.4z M447.7,355.5c-7.8,14.9-17.2,28.8-28.1,41.5 l22.7,22.7c13.7-15.6,25.5-32.9,34.9-51.5L447.7,355.5z M471.4,272c-1.4,18.8-5.2,37-11.1,54.1l29.5,12.6 c7.5-21.1,12.2-43.5,13.6-66.8H471.4z M321.2,462c-15.7,5-32.2,8.2-49.2,9.4v32.1c21.2-1.4,41.7-5.4,61.1-11.7L321.2,462z M240,471.4c-18.8-1.4-37-5.2-54.1-11.1l-12.6,29.5c21.1,7.5,43.5,12.2,66.8,13.6V471.4z M462,190.8c5,15.7,8.2,32.2,9.4,49.2h32.1 c-1.4-21.2-5.4-41.7-11.7-61.1L462,190.8z M92.4,397c-12-13.9-22.3-29.4-30.4-46.1l-29.8,11.9c9.9,20.7,22.6,39.8,37.6,56.9 L92.4,397z M272,40.6c18.8,1.4,36.9,5.2,54.1,11.1l12.6-29.5C317.7,14.7,295.3,10,272,8.5V40.6z M190.8,50 c15.7-5,32.2-8.2,49.2-9.4V8.5c-21.2,1.4-41.7,5.4-61.1,11.7L190.8,50z M442.3,92.3L419.6,115c12,13.9,22.3,29.4,30.5,46.1 l29.8-11.9C470,128.5,457.3,109.4,442.3,92.3z M397,92.4l22.7-22.7c-15.6-13.7-32.8-25.5-51.5-34.9l-12.6,29.5 C370.4,72.1,384.4,81.5,397,92.4z"})});var i=m(m({},s),{},{attributeName:"opacity"}),f={tag:"circle",attributes:m(m({},a),{},{cx:"256",cy:"364",r:"28"}),children:[]};return r||f.children.push({tag:"animate",attributes:m(m({},s),{},{attributeName:"r",values:"28;14;28;28;14;28;"})},{tag:"animate",attributes:m(m({},i),{},{values:"1;0;1;1;0;1;"})}),n.push(f),n.push({tag:"path",attributes:m(m({},a),{},{opacity:"1",d:"M263.7,312h-16c-6.6,0-12-5.4-12-12c0-71,77.4-63.9,77.4-107.8c0-20-17.8-40.2-57.4-40.2c-29.1,0-44.3,9.6-59.2,28.7 c-3.9,5-11.1,6-16.2,2.4l-13.1-9.2c-5.6-3.9-6.9-11.8-2.6-17.2c21.2-27.2,46.4-44.7,91.2-44.7c52.3,0,97.4,29.8,97.4,80.2 c0,67.6-77.4,63.5-77.4,107.8C275.7,306.6,270.3,312,263.7,312z"}),children:r?[]:[{tag:"animate",attributes:m(m({},i),{},{values:"1;0;0;0;0;1;"})}]}),r||n.push({tag:"path",attributes:m(m({},a),{},{opacity:"0",d:"M232.5,134.5l7,168c0.3,6.4,5.6,11.5,12,11.5h9c6.4,0,11.7-5.1,12-11.5l7-168c0.3-6.8-5.2-12.5-12-12.5h-23 C237.7,122,232.2,127.7,232.5,134.5z"}),children:[{tag:"animate",attributes:m(m({},i),{},{values:"0;0;1;1;0;0;"})}]}),{tag:"g",attributes:{class:"missing"},children:n}}}},fo={hooks:function(){return{parseNodeAttributes:function(r,n){var a=n.getAttribute("data-fa-symbol"),s=a===null?!1:a===""?!0:a;return r.symbol=s,r}}}},co=[ei,Xi,Yi,Hi,Bi,no,ao,so,oo,lo,fo];gi(co,{mixoutsTo:z});z.noAuto;z.config;z.library;z.dom;var Wn=z.parse;z.findIconDefinition;z.toHtml;var uo=z.icon;z.layer;z.text;z.counter;const mo="The iconic font, CSS, and SVG framework",ho=["font","awesome","fontawesome","icon","svg","bootstrap"],po="https://fontawesome.com",vo={url:"https://github.com/FortAwesome/Font-Awesome/issues"},go="The Font Awesome Team (https://github.com/orgs/FortAwesome/people)",bo={type:"git",url:"https://github.com/FortAwesome/Font-Awesome"},yo={node:">=6"},Eo={"@fortawesome/fontawesome-common-types":"7.0.0"},$o="7.0.0",So="@fortawesome/fontawesome-svg-core",Ao="index.js",Io="index.mjs",wo="styles.css",xo="MIT",Ro="./index.d.ts",No={".":{types:"./index.d.ts",module:"./index.mjs",import:"./index.mjs",require:"./index.js",style:"./styles.css",default:"./index.js"},"./index":{types:"./index.d.ts",module:"./index.mjs",import:"./index.mjs",require:"./index.js",default:"./index.js"},"./index.js":{types:"./index.d.ts",module:"./index.mjs",import:"./index.mjs",require:"./index.js",default:"./index.js"},"./plugins":{types:"./index.d.ts",module:"./plugins.mjs",import:"./plugins.mjs",default:"./plugins.mjs"},"./import.macro":"./import.macro.js","./import.macro.js":"./import.macro.js","./styles":"./styles.css","./styles.css":"./styles.css","./package.json":"./package.json"},Oo=["./index.js","./index.mjs","./styles.css"],Po={description:mo,keywords:ho,homepage:po,bugs:vo,author:go,repository:bo,engines:yo,dependencies:Eo,version:$o,name:So,main:Ao,module:Io,"jsnext:main":"index.mjs",style:wo,license:xo,types:Ro,exports:No,sideEffects:Oo};var St={exports:{}};const ko="2.0.0",Vn=256,Lo=Number.MAX_SAFE_INTEGER||9007199254740991,To=16,Co=Vn-6,Fo=["major","premajor","minor","preminor","patch","prepatch","prerelease"];var We={MAX_LENGTH:Vn,MAX_SAFE_COMPONENT_LENGTH:To,MAX_SAFE_BUILD_LENGTH:Co,MAX_SAFE_INTEGER:Lo,RELEASE_TYPES:Fo,SEMVER_SPEC_VERSION:ko,FLAG_INCLUDE_PRERELEASE:1,FLAG_LOOSE:2};const jo=typeof process=="object"&&process.env&&{}.NODE_DEBUG&&/\bsemver\b/i.test({}.NODE_DEBUG)?(...e)=>console.error("SEMVER",...e):()=>{};var Ve=jo;(function(e,t){const{MAX_SAFE_COMPONENT_LENGTH:r,MAX_SAFE_BUILD_LENGTH:n,MAX_LENGTH:a}=We,s=Ve;t=e.exports={};const i=t.re=[],f=t.safeRe=[],o=t.src=[],c=t.safeSrc=[],l=t.t={};let u=0;const p="[a-zA-Z0-9-]",d=[["\\s",1],["\\d",a],[p,n]],O=P=>{for(const[N,L]of d)P=P.split(`${N}*`).join(`${N}{0,${L}}`).split(`${N}+`).join(`${N}{1,${L}}`);return P},h=(P,N,L)=>{const I=O(N),j=u++;s(P,j,N),l[P]=j,o[j]=N,c[j]=I,i[j]=new RegExp(N,L?"g":void 0),f[j]=new RegExp(I,L?"g":void 0)};h("NUMERICIDENTIFIER","0|[1-9]\\d*"),h("NUMERICIDENTIFIERLOOSE","\\d+"),h("NONNUMERICIDENTIFIER",`\\d*[a-zA-Z-]${p}*`),h("MAINVERSION",`(${o[l.NUMERICIDENTIFIER]})\\.(${o[l.NUMERICIDENTIFIER]})\\.(${o[l.NUMERICIDENTIFIER]})`),h("MAINVERSIONLOOSE",`(${o[l.NUMERICIDENTIFIERLOOSE]})\\.(${o[l.NUMERICIDENTIFIERLOOSE]})\\.(${o[l.NUMERICIDENTIFIERLOOSE]})`),h("PRERELEASEIDENTIFIER",`(?:${o[l.NONNUMERICIDENTIFIER]}|${o[l.NUMERICIDENTIFIER]})`),h("PRERELEASEIDENTIFIERLOOSE",`(?:${o[l.NONNUMERICIDENTIFIER]}|${o[l.NUMERICIDENTIFIERLOOSE]})`),h("PRERELEASE",`(?:-(${o[l.PRERELEASEIDENTIFIER]}(?:\\.${o[l.PRERELEASEIDENTIFIER]})*))`),h("PRERELEASELOOSE",`(?:-?(${o[l.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${o[l.PRERELEASEIDENTIFIERLOOSE]})*))`),h("BUILDIDENTIFIER",`${p}+`),h("BUILD",`(?:\\+(${o[l.BUILDIDENTIFIER]}(?:\\.${o[l.BUILDIDENTIFIER]})*))`),h("FULLPLAIN",`v?${o[l.MAINVERSION]}${o[l.PRERELEASE]}?${o[l.BUILD]}?`),h("FULL",`^${o[l.FULLPLAIN]}$`),h("LOOSEPLAIN",`[v=\\s]*${o[l.MAINVERSIONLOOSE]}${o[l.PRERELEASELOOSE]}?${o[l.BUILD]}?`),h("LOOSE",`^${o[l.LOOSEPLAIN]}$`),h("GTLT","((?:<|>)?=?)"),h("XRANGEIDENTIFIERLOOSE",`${o[l.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`),h("XRANGEIDENTIFIER",`${o[l.NUMERICIDENTIFIER]}|x|X|\\*`),h("XRANGEPLAIN",`[v=\\s]*(${o[l.XRANGEIDENTIFIER]})(?:\\.(${o[l.XRANGEIDENTIFIER]})(?:\\.(${o[l.XRANGEIDENTIFIER]})(?:${o[l.PRERELEASE]})?${o[l.BUILD]}?)?)?`),h("XRANGEPLAINLOOSE",`[v=\\s]*(${o[l.XRANGEIDENTIFIERLOOSE]})(?:\\.(${o[l.XRANGEIDENTIFIERLOOSE]})(?:\\.(${o[l.XRANGEIDENTIFIERLOOSE]})(?:${o[l.PRERELEASELOOSE]})?${o[l.BUILD]}?)?)?`),h("XRANGE",`^${o[l.GTLT]}\\s*${o[l.XRANGEPLAIN]}$`),h("XRANGELOOSE",`^${o[l.GTLT]}\\s*${o[l.XRANGEPLAINLOOSE]}$`),h("COERCEPLAIN",`(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?`),h("COERCE",`${o[l.COERCEPLAIN]}(?:$|[^\\d])`),h("COERCEFULL",o[l.COERCEPLAIN]+`(?:${o[l.PRERELEASE]})?(?:${o[l.BUILD]})?(?:$|[^\\d])`),h("COERCERTL",o[l.COERCE],!0),h("COERCERTLFULL",o[l.COERCEFULL],!0),h("LONETILDE","(?:~>?)"),h("TILDETRIM",`(\\s*)${o[l.LONETILDE]}\\s+`,!0),t.tildeTrimReplace="$1~",h("TILDE",`^${o[l.LONETILDE]}${o[l.XRANGEPLAIN]}$`),h("TILDELOOSE",`^${o[l.LONETILDE]}${o[l.XRANGEPLAINLOOSE]}$`),h("LONECARET","(?:\\^)"),h("CARETTRIM",`(\\s*)${o[l.LONECARET]}\\s+`,!0),t.caretTrimReplace="$1^",h("CARET",`^${o[l.LONECARET]}${o[l.XRANGEPLAIN]}$`),h("CARETLOOSE",`^${o[l.LONECARET]}${o[l.XRANGEPLAINLOOSE]}$`),h("COMPARATORLOOSE",`^${o[l.GTLT]}\\s*(${o[l.LOOSEPLAIN]})$|^$`),h("COMPARATOR",`^${o[l.GTLT]}\\s*(${o[l.FULLPLAIN]})$|^$`),h("COMPARATORTRIM",`(\\s*)${o[l.GTLT]}\\s*(${o[l.LOOSEPLAIN]}|${o[l.XRANGEPLAIN]})`,!0),t.comparatorTrimReplace="$1$2$3",h("HYPHENRANGE",`^\\s*(${o[l.XRANGEPLAIN]})\\s+-\\s+(${o[l.XRANGEPLAIN]})\\s*$`),h("HYPHENRANGELOOSE",`^\\s*(${o[l.XRANGEPLAINLOOSE]})\\s+-\\s+(${o[l.XRANGEPLAINLOOSE]})\\s*$`),h("STAR","(<|>)?=?\\s*\\*"),h("GTE0","^\\s*>=\\s*0\\.0\\.0\\s*$"),h("GTE0PRE","^\\s*>=\\s*0\\.0\\.0-0\\s*$")})(St,St.exports);var Ae=St.exports;const _o=Object.freeze({loose:!0}),Do=Object.freeze({}),Mo=e=>e?typeof e!="object"?_o:e:Do;var Ct=Mo;const yr=/^[0-9]+$/,Xn=(e,t)=>{const r=yr.test(e),n=yr.test(t);return r&&n&&(e=+e,t=+t),e===t?0:r&&!n?-1:n&&!r?1:e<t?-1:1},zo=(e,t)=>Xn(t,e);var Yn={compareIdentifiers:Xn,rcompareIdentifiers:zo};const xe=Ve,{MAX_LENGTH:Er,MAX_SAFE_INTEGER:Re}=We,{safeRe:Ne,t:Oe}=Ae,Go=Ct,{compareIdentifiers:se}=Yn;let Uo=class X{constructor(t,r){if(r=Go(r),t instanceof X){if(t.loose===!!r.loose&&t.includePrerelease===!!r.includePrerelease)return t;t=t.version}else if(typeof t!="string")throw new TypeError(`Invalid version. Must be a string. Got type "${typeof t}".`);if(t.length>Er)throw new TypeError(`version is longer than ${Er} characters`);xe("SemVer",t,r),this.options=r,this.loose=!!r.loose,this.includePrerelease=!!r.includePrerelease;const n=t.trim().match(r.loose?Ne[Oe.LOOSE]:Ne[Oe.FULL]);if(!n)throw new TypeError(`Invalid Version: ${t}`);if(this.raw=t,this.major=+n[1],this.minor=+n[2],this.patch=+n[3],this.major>Re||this.major<0)throw new TypeError("Invalid major version");if(this.minor>Re||this.minor<0)throw new TypeError("Invalid minor version");if(this.patch>Re||this.patch<0)throw new TypeError("Invalid patch version");n[4]?this.prerelease=n[4].split(".").map(a=>{if(/^[0-9]+$/.test(a)){const s=+a;if(s>=0&&s<Re)return s}return a}):this.prerelease=[],this.build=n[5]?n[5].split("."):[],this.format()}format(){return this.version=`${this.major}.${this.minor}.${this.patch}`,this.prerelease.length&&(this.version+=`-${this.prerelease.join(".")}`),this.version}toString(){return this.version}compare(t){if(xe("SemVer.compare",this.version,this.options,t),!(t instanceof X)){if(typeof t=="string"&&t===this.version)return 0;t=new X(t,this.options)}return t.version===this.version?0:this.compareMain(t)||this.comparePre(t)}compareMain(t){return t instanceof X||(t=new X(t,this.options)),se(this.major,t.major)||se(this.minor,t.minor)||se(this.patch,t.patch)}comparePre(t){if(t instanceof X||(t=new X(t,this.options)),this.prerelease.length&&!t.prerelease.length)return-1;if(!this.prerelease.length&&t.prerelease.length)return 1;if(!this.prerelease.length&&!t.prerelease.length)return 0;let r=0;do{const n=this.prerelease[r],a=t.prerelease[r];if(xe("prerelease compare",r,n,a),n===void 0&&a===void 0)return 0;if(a===void 0)return 1;if(n===void 0)return-1;if(n===a)continue;return se(n,a)}while(++r)}compareBuild(t){t instanceof X||(t=new X(t,this.options));let r=0;do{const n=this.build[r],a=t.build[r];if(xe("build compare",r,n,a),n===void 0&&a===void 0)return 0;if(a===void 0)return 1;if(n===void 0)return-1;if(n===a)continue;return se(n,a)}while(++r)}inc(t,r,n){if(t.startsWith("pre")){if(!r&&n===!1)throw new Error("invalid increment argument: identifier is empty");if(r){const a=`-${r}`.match(this.options.loose?Ne[Oe.PRERELEASELOOSE]:Ne[Oe.PRERELEASE]);if(!a||a[1]!==r)throw new Error(`invalid identifier: ${r}`)}}switch(t){case"premajor":this.prerelease.length=0,this.patch=0,this.minor=0,this.major++,this.inc("pre",r,n);break;case"preminor":this.prerelease.length=0,this.patch=0,this.minor++,this.inc("pre",r,n);break;case"prepatch":this.prerelease.length=0,this.inc("patch",r,n),this.inc("pre",r,n);break;case"prerelease":this.prerelease.length===0&&this.inc("patch",r,n),this.inc("pre",r,n);break;case"release":if(this.prerelease.length===0)throw new Error(`version ${this.raw} is not a prerelease`);this.prerelease.length=0;break;case"major":(this.minor!==0||this.patch!==0||this.prerelease.length===0)&&this.major++,this.minor=0,this.patch=0,this.prerelease=[];break;case"minor":(this.patch!==0||this.prerelease.length===0)&&this.minor++,this.patch=0,this.prerelease=[];break;case"patch":this.prerelease.length===0&&this.patch++,this.prerelease=[];break;case"pre":{const a=Number(n)?1:0;if(this.prerelease.length===0)this.prerelease=[a];else{let s=this.prerelease.length;for(;--s>=0;)typeof this.prerelease[s]=="number"&&(this.prerelease[s]++,s=-2);if(s===-1){if(r===this.prerelease.join(".")&&n===!1)throw new Error("invalid increment argument: identifier already exists");this.prerelease.push(a)}}if(r){let s=[r,a];n===!1&&(s=[r]),se(this.prerelease[0],r)===0?isNaN(this.prerelease[1])&&(this.prerelease=s):this.prerelease=s}break}default:throw new Error(`invalid increment argument: ${t}`)}return this.raw=this.format(),this.build.length&&(this.raw+=`+${this.build.join(".")}`),this}};var D=Uo;const $r=D,Wo=(e,t,r=!1)=>{if(e instanceof $r)return e;try{return new $r(e,t)}catch(n){if(!r)return null;throw n}};var ue=Wo;const Vo=ue,Xo=(e,t)=>{const r=Vo(e,t);return r?r.version:null};var Yo=Xo;const Ho=ue,Bo=(e,t)=>{const r=Ho(e.trim().replace(/^[=v]+/,""),t);return r?r.version:null};var qo=Bo;const Sr=D,Ko=(e,t,r,n,a)=>{typeof r=="string"&&(a=n,n=r,r=void 0);try{return new Sr(e instanceof Sr?e.version:e,r).inc(t,n,a).version}catch{return null}};var Jo=Ko;const Ar=ue,Zo=(e,t)=>{const r=Ar(e,null,!0),n=Ar(t,null,!0),a=r.compare(n);if(a===0)return null;const s=a>0,i=s?r:n,f=s?n:r,o=!!i.prerelease.length;if(!!f.prerelease.length&&!o){if(!f.patch&&!f.minor)return"major";if(f.compareMain(i)===0)return f.minor&&!f.patch?"minor":"patch"}const l=o?"pre":"";return r.major!==n.major?l+"major":r.minor!==n.minor?l+"minor":r.patch!==n.patch?l+"patch":"prerelease"};var Qo=Zo;const el=D,tl=(e,t)=>new el(e,t).major;var rl=tl;const nl=D,al=(e,t)=>new nl(e,t).minor;var sl=al;const il=D,ol=(e,t)=>new il(e,t).patch;var ll=ol;const fl=ue,cl=(e,t)=>{const r=fl(e,t);return r&&r.prerelease.length?r.prerelease:null};var ul=cl;const Ir=D,dl=(e,t,r)=>new Ir(e,r).compare(new Ir(t,r));var W=dl;const ml=W,hl=(e,t,r)=>ml(t,e,r);var pl=hl;const vl=W,gl=(e,t)=>vl(e,t,!0);var bl=gl;const wr=D,yl=(e,t,r)=>{const n=new wr(e,r),a=new wr(t,r);return n.compare(a)||n.compareBuild(a)};var Ft=yl;const El=Ft,$l=(e,t)=>e.sort((r,n)=>El(r,n,t));var Sl=$l;const Al=Ft,Il=(e,t)=>e.sort((r,n)=>Al(n,r,t));var wl=Il;const xl=W,Rl=(e,t,r)=>xl(e,t,r)>0;var Xe=Rl;const Nl=W,Ol=(e,t,r)=>Nl(e,t,r)<0;var jt=Ol;const Pl=W,kl=(e,t,r)=>Pl(e,t,r)===0;var Hn=kl;const Ll=W,Tl=(e,t,r)=>Ll(e,t,r)!==0;var Bn=Tl;const Cl=W,Fl=(e,t,r)=>Cl(e,t,r)>=0;var _t=Fl;const jl=W,_l=(e,t,r)=>jl(e,t,r)<=0;var Dt=_l;const Dl=Hn,Ml=Bn,zl=Xe,Gl=_t,Ul=jt,Wl=Dt,Vl=(e,t,r,n)=>{switch(t){case"===":return typeof e=="object"&&(e=e.version),typeof r=="object"&&(r=r.version),e===r;case"!==":return typeof e=="object"&&(e=e.version),typeof r=="object"&&(r=r.version),e!==r;case"":case"=":case"==":return Dl(e,r,n);case"!=":return Ml(e,r,n);case">":return zl(e,r,n);case">=":return Gl(e,r,n);case"<":return Ul(e,r,n);case"<=":return Wl(e,r,n);default:throw new TypeError(`Invalid operator: ${t}`)}};var qn=Vl;const Xl=D,Yl=ue,{safeRe:Pe,t:ke}=Ae,Hl=(e,t)=>{if(e instanceof Xl)return e;if(typeof e=="number"&&(e=String(e)),typeof e!="string")return null;t=t||{};let r=null;if(!t.rtl)r=e.match(t.includePrerelease?Pe[ke.COERCEFULL]:Pe[ke.COERCE]);else{const o=t.includePrerelease?Pe[ke.COERCERTLFULL]:Pe[ke.COERCERTL];let c;for(;(c=o.exec(e))&&(!r||r.index+r[0].length!==e.length);)(!r||c.index+c[0].length!==r.index+r[0].length)&&(r=c),o.lastIndex=c.index+c[1].length+c[2].length;o.lastIndex=-1}if(r===null)return null;const n=r[2],a=r[3]||"0",s=r[4]||"0",i=t.includePrerelease&&r[5]?`-${r[5]}`:"",f=t.includePrerelease&&r[6]?`+${r[6]}`:"";return Yl(`${n}.${a}.${s}${i}${f}`,t)};var Bl=Hl;class ql{constructor(){this.max=1e3,this.map=new Map}get(t){const r=this.map.get(t);if(r!==void 0)return this.map.delete(t),this.map.set(t,r),r}delete(t){return this.map.delete(t)}set(t,r){if(!this.delete(t)&&r!==void 0){if(this.map.size>=this.max){const a=this.map.keys().next().value;this.delete(a)}this.map.set(t,r)}return this}}var Kl=ql,nt,xr;function V(){if(xr)return nt;xr=1;const e=/\s+/g;class t{constructor(v,$){if($=a($),v instanceof t)return v.loose===!!$.loose&&v.includePrerelease===!!$.includePrerelease?v:new t(v.raw,$);if(v instanceof s)return this.raw=v.value,this.set=[[v]],this.formatted=void 0,this;if(this.options=$,this.loose=!!$.loose,this.includePrerelease=!!$.includePrerelease,this.raw=v.trim().replace(e," "),this.set=this.raw.split("||").map(y=>this.parseRange(y.trim())).filter(y=>y.length),!this.set.length)throw new TypeError(`Invalid SemVer Range: ${this.raw}`);if(this.set.length>1){const y=this.set[0];if(this.set=this.set.filter(S=>!h(S[0])),this.set.length===0)this.set=[y];else if(this.set.length>1){for(const S of this.set)if(S.length===1&&P(S[0])){this.set=[S];break}}}this.formatted=void 0}get range(){if(this.formatted===void 0){this.formatted="";for(let v=0;v<this.set.length;v++){v>0&&(this.formatted+="||");const $=this.set[v];for(let y=0;y<$.length;y++)y>0&&(this.formatted+=" "),this.formatted+=$[y].toString().trim()}}return this.formatted}format(){return this.range}toString(){return this.range}parseRange(v){const y=((this.options.includePrerelease&&d)|(this.options.loose&&O))+":"+v,S=n.get(y);if(S)return S;const E=this.options.loose,A=E?o[c.HYPHENRANGELOOSE]:o[c.HYPHENRANGE];v=v.replace(A,ra(this.options.includePrerelease)),i("hyphen replace",v),v=v.replace(o[c.COMPARATORTRIM],l),i("comparator trim",v),v=v.replace(o[c.TILDETRIM],u),i("tilde trim",v),v=v.replace(o[c.CARETTRIM],p),i("caret trim",v);let k=v.split(" ").map(F=>L(F,this.options)).join(" ").split(/\s+/).map(F=>ta(F,this.options));E&&(k=k.filter(F=>(i("loose invalid filter",F,this.options),!!F.match(o[c.COMPARATORLOOSE])))),i("range list",k);const x=new Map,C=k.map(F=>new s(F,this.options));for(const F of C){if(h(F))return[F];x.set(F.value,F)}x.size>1&&x.has("")&&x.delete("");const M=[...x.values()];return n.set(y,M),M}intersects(v,$){if(!(v instanceof t))throw new TypeError("a Range is required");return this.set.some(y=>N(y,$)&&v.set.some(S=>N(S,$)&&y.every(E=>S.every(A=>E.intersects(A,$)))))}test(v){if(!v)return!1;if(typeof v=="string")try{v=new f(v,this.options)}catch{return!1}for(let $=0;$<this.set.length;$++)if(na(this.set[$],v,this.options))return!0;return!1}}nt=t;const r=Kl,n=new r,a=Ct,s=Ye(),i=Ve,f=D,{safeRe:o,t:c,comparatorTrimReplace:l,tildeTrimReplace:u,caretTrimReplace:p}=Ae,{FLAG_INCLUDE_PRERELEASE:d,FLAG_LOOSE:O}=We,h=g=>g.value==="<0.0.0-0",P=g=>g.value==="",N=(g,v)=>{let $=!0;const y=g.slice();let S=y.pop();for(;$&&y.length;)$=y.every(E=>S.intersects(E,v)),S=y.pop();return $},L=(g,v)=>(i("comp",g,v),g=de(g,v),i("caret",g),g=j(g,v),i("tildes",g),g=me(g,v),i("xrange",g),g=ea(g,v),i("stars",g),g),I=g=>!g||g.toLowerCase()==="x"||g==="*",j=(g,v)=>g.trim().split(/\s+/).map($=>w($,v)).join(" "),w=(g,v)=>{const $=v.loose?o[c.TILDELOOSE]:o[c.TILDE];return g.replace($,(y,S,E,A,k)=>{i("tilde",g,y,S,E,A,k);let x;return I(S)?x="":I(E)?x=`>=${S}.0.0 <${+S+1}.0.0-0`:I(A)?x=`>=${S}.${E}.0 <${S}.${+E+1}.0-0`:k?(i("replaceTilde pr",k),x=`>=${S}.${E}.${A}-${k} <${S}.${+E+1}.0-0`):x=`>=${S}.${E}.${A} <${S}.${+E+1}.0-0`,i("tilde return",x),x})},de=(g,v)=>g.trim().split(/\s+/).map($=>Be($,v)).join(" "),Be=(g,v)=>{i("caret",g,v);const $=v.loose?o[c.CARETLOOSE]:o[c.CARET],y=v.includePrerelease?"-0":"";return g.replace($,(S,E,A,k,x)=>{i("caret",g,S,E,A,k,x);let C;return I(E)?C="":I(A)?C=`>=${E}.0.0${y} <${+E+1}.0.0-0`:I(k)?E==="0"?C=`>=${E}.${A}.0${y} <${E}.${+A+1}.0-0`:C=`>=${E}.${A}.0${y} <${+E+1}.0.0-0`:x?(i("replaceCaret pr",x),E==="0"?A==="0"?C=`>=${E}.${A}.${k}-${x} <${E}.${A}.${+k+1}-0`:C=`>=${E}.${A}.${k}-${x} <${E}.${+A+1}.0-0`:C=`>=${E}.${A}.${k}-${x} <${+E+1}.0.0-0`):(i("no pr"),E==="0"?A==="0"?C=`>=${E}.${A}.${k}${y} <${E}.${A}.${+k+1}-0`:C=`>=${E}.${A}.${k}${y} <${E}.${+A+1}.0-0`:C=`>=${E}.${A}.${k} <${+E+1}.0.0-0`),i("caret return",C),C})},me=(g,v)=>(i("replaceXRanges",g,v),g.split(/\s+/).map($=>qe($,v)).join(" ")),qe=(g,v)=>{g=g.trim();const $=v.loose?o[c.XRANGELOOSE]:o[c.XRANGE];return g.replace($,(y,S,E,A,k,x)=>{i("xRange",g,y,S,E,A,k,x);const C=I(E),M=C||I(A),F=M||I(k),he=F;return S==="="&&he&&(S=""),x=v.includePrerelease?"-0":"",C?S===">"||S==="<"?y="<0.0.0-0":y="*":S&&he?(M&&(A=0),k=0,S===">"?(S=">=",M?(E=+E+1,A=0,k=0):(A=+A+1,k=0)):S==="<="&&(S="<",M?E=+E+1:A=+A+1),S==="<"&&(x="-0"),y=`${S+E}.${A}.${k}${x}`):M?y=`>=${E}.0.0${x} <${+E+1}.0.0-0`:F&&(y=`>=${E}.${A}.0${x} <${E}.${+A+1}.0-0`),i("xRange return",y),y})},ea=(g,v)=>(i("replaceStars",g,v),g.trim().replace(o[c.STAR],"")),ta=(g,v)=>(i("replaceGTE0",g,v),g.trim().replace(o[v.includePrerelease?c.GTE0PRE:c.GTE0],"")),ra=g=>(v,$,y,S,E,A,k,x,C,M,F,he)=>(I(y)?$="":I(S)?$=`>=${y}.0.0${g?"-0":""}`:I(E)?$=`>=${y}.${S}.0${g?"-0":""}`:A?$=`>=${$}`:$=`>=${$}${g?"-0":""}`,I(C)?x="":I(M)?x=`<${+C+1}.0.0-0`:I(F)?x=`<${C}.${+M+1}.0-0`:he?x=`<=${C}.${M}.${F}-${he}`:g?x=`<${C}.${M}.${+F+1}-0`:x=`<=${x}`,`${$} ${x}`.trim()),na=(g,v,$)=>{for(let y=0;y<g.length;y++)if(!g[y].test(v))return!1;if(v.prerelease.length&&!$.includePrerelease){for(let y=0;y<g.length;y++)if(i(g[y].semver),g[y].semver!==s.ANY&&g[y].semver.prerelease.length>0){const S=g[y].semver;if(S.major===v.major&&S.minor===v.minor&&S.patch===v.patch)return!0}return!1}return!0};return nt}var at,Rr;function Ye(){if(Rr)return at;Rr=1;const e=Symbol("SemVer ANY");class t{static get ANY(){return e}constructor(l,u){if(u=r(u),l instanceof t){if(l.loose===!!u.loose)return l;l=l.value}l=l.trim().split(/\s+/).join(" "),i("comparator",l,u),this.options=u,this.loose=!!u.loose,this.parse(l),this.semver===e?this.value="":this.value=this.operator+this.semver.version,i("comp",this)}parse(l){const u=this.options.loose?n[a.COMPARATORLOOSE]:n[a.COMPARATOR],p=l.match(u);if(!p)throw new TypeError(`Invalid comparator: ${l}`);this.operator=p[1]!==void 0?p[1]:"",this.operator==="="&&(this.operator=""),p[2]?this.semver=new f(p[2],this.options.loose):this.semver=e}toString(){return this.value}test(l){if(i("Comparator.test",l,this.options.loose),this.semver===e||l===e)return!0;if(typeof l=="string")try{l=new f(l,this.options)}catch{return!1}return s(l,this.operator,this.semver,this.options)}intersects(l,u){if(!(l instanceof t))throw new TypeError("a Comparator is required");return this.operator===""?this.value===""?!0:new o(l.value,u).test(this.value):l.operator===""?l.value===""?!0:new o(this.value,u).test(l.semver):(u=r(u),u.includePrerelease&&(this.value==="<0.0.0-0"||l.value==="<0.0.0-0")||!u.includePrerelease&&(this.value.startsWith("<0.0.0")||l.value.startsWith("<0.0.0"))?!1:!!(this.operator.startsWith(">")&&l.operator.startsWith(">")||this.operator.startsWith("<")&&l.operator.startsWith("<")||this.semver.version===l.semver.version&&this.operator.includes("=")&&l.operator.includes("=")||s(this.semver,"<",l.semver,u)&&this.operator.startsWith(">")&&l.operator.startsWith("<")||s(this.semver,">",l.semver,u)&&this.operator.startsWith("<")&&l.operator.startsWith(">")))}}at=t;const r=Ct,{safeRe:n,t:a}=Ae,s=qn,i=Ve,f=D,o=V();return at}const Jl=V(),Zl=(e,t,r)=>{try{t=new Jl(t,r)}catch{return!1}return t.test(e)};var He=Zl;const Ql=V(),ef=(e,t)=>new Ql(e,t).set.map(r=>r.map(n=>n.value).join(" ").trim().split(" "));var tf=ef;const rf=D,nf=V(),af=(e,t,r)=>{let n=null,a=null,s=null;try{s=new nf(t,r)}catch{return null}return e.forEach(i=>{s.test(i)&&(!n||a.compare(i)===-1)&&(n=i,a=new rf(n,r))}),n};var sf=af;const of=D,lf=V(),ff=(e,t,r)=>{let n=null,a=null,s=null;try{s=new lf(t,r)}catch{return null}return e.forEach(i=>{s.test(i)&&(!n||a.compare(i)===1)&&(n=i,a=new of(n,r))}),n};var cf=ff;const st=D,uf=V(),Nr=Xe,df=(e,t)=>{e=new uf(e,t);let r=new st("0.0.0");if(e.test(r)||(r=new st("0.0.0-0"),e.test(r)))return r;r=null;for(let n=0;n<e.set.length;++n){const a=e.set[n];let s=null;a.forEach(i=>{const f=new st(i.semver.version);switch(i.operator){case">":f.prerelease.length===0?f.patch++:f.prerelease.push(0),f.raw=f.format();case"":case">=":(!s||Nr(f,s))&&(s=f);break;case"<":case"<=":break;default:throw new Error(`Unexpected operation: ${i.operator}`)}}),s&&(!r||Nr(r,s))&&(r=s)}return r&&e.test(r)?r:null};var mf=df;const hf=V(),pf=(e,t)=>{try{return new hf(e,t).range||"*"}catch{return null}};var vf=pf;const gf=D,Kn=Ye(),{ANY:bf}=Kn,yf=V(),Ef=He,Or=Xe,Pr=jt,$f=Dt,Sf=_t,Af=(e,t,r,n)=>{e=new gf(e,n),t=new yf(t,n);let a,s,i,f,o;switch(r){case">":a=Or,s=$f,i=Pr,f=">",o=">=";break;case"<":a=Pr,s=Sf,i=Or,f="<",o="<=";break;default:throw new TypeError('Must provide a hilo val of "<" or ">"')}if(Ef(e,t,n))return!1;for(let c=0;c<t.set.length;++c){const l=t.set[c];let u=null,p=null;if(l.forEach(d=>{d.semver===bf&&(d=new Kn(">=0.0.0")),u=u||d,p=p||d,a(d.semver,u.semver,n)?u=d:i(d.semver,p.semver,n)&&(p=d)}),u.operator===f||u.operator===o||(!p.operator||p.operator===f)&&s(e,p.semver))return!1;if(p.operator===o&&i(e,p.semver))return!1}return!0};var Mt=Af;const If=Mt,wf=(e,t,r)=>If(e,t,">",r);var xf=wf;const Rf=Mt,Nf=(e,t,r)=>Rf(e,t,"<",r);var Of=Nf;const kr=V(),Pf=(e,t,r)=>(e=new kr(e,r),t=new kr(t,r),e.intersects(t,r));var kf=Pf;const Lf=He,Tf=W;var Cf=(e,t,r)=>{const n=[];let a=null,s=null;const i=e.sort((l,u)=>Tf(l,u,r));for(const l of i)Lf(l,t,r)?(s=l,a||(a=l)):(s&&n.push([a,s]),s=null,a=null);a&&n.push([a,null]);const f=[];for(const[l,u]of n)l===u?f.push(l):!u&&l===i[0]?f.push("*"):u?l===i[0]?f.push(`<=${u}`):f.push(`${l} - ${u}`):f.push(`>=${l}`);const o=f.join(" || "),c=typeof t.raw=="string"?t.raw:String(t);return o.length<c.length?o:t};const Lr=V(),zt=Ye(),{ANY:it}=zt,pe=He,Gt=W,Ff=(e,t,r={})=>{if(e===t)return!0;e=new Lr(e,r),t=new Lr(t,r);let n=!1;e:for(const a of e.set){for(const s of t.set){const i=_f(a,s,r);if(n=n||i!==null,i)continue e}if(n)return!1}return!0},jf=[new zt(">=0.0.0-0")],Tr=[new zt(">=0.0.0")],_f=(e,t,r)=>{if(e===t)return!0;if(e.length===1&&e[0].semver===it){if(t.length===1&&t[0].semver===it)return!0;r.includePrerelease?e=jf:e=Tr}if(t.length===1&&t[0].semver===it){if(r.includePrerelease)return!0;t=Tr}const n=new Set;let a,s;for(const d of e)d.operator===">"||d.operator===">="?a=Cr(a,d,r):d.operator==="<"||d.operator==="<="?s=Fr(s,d,r):n.add(d.semver);if(n.size>1)return null;let i;if(a&&s){if(i=Gt(a.semver,s.semver,r),i>0)return null;if(i===0&&(a.operator!==">="||s.operator!=="<="))return null}for(const d of n){if(a&&!pe(d,String(a),r)||s&&!pe(d,String(s),r))return null;for(const O of t)if(!pe(d,String(O),r))return!1;return!0}let f,o,c,l,u=s&&!r.includePrerelease&&s.semver.prerelease.length?s.semver:!1,p=a&&!r.includePrerelease&&a.semver.prerelease.length?a.semver:!1;u&&u.prerelease.length===1&&s.operator==="<"&&u.prerelease[0]===0&&(u=!1);for(const d of t){if(l=l||d.operator===">"||d.operator===">=",c=c||d.operator==="<"||d.operator==="<=",a){if(p&&d.semver.prerelease&&d.semver.prerelease.length&&d.semver.major===p.major&&d.semver.minor===p.minor&&d.semver.patch===p.patch&&(p=!1),d.operator===">"||d.operator===">="){if(f=Cr(a,d,r),f===d&&f!==a)return!1}else if(a.operator===">="&&!pe(a.semver,String(d),r))return!1}if(s){if(u&&d.semver.prerelease&&d.semver.prerelease.length&&d.semver.major===u.major&&d.semver.minor===u.minor&&d.semver.patch===u.patch&&(u=!1),d.operator==="<"||d.operator==="<="){if(o=Fr(s,d,r),o===d&&o!==s)return!1}else if(s.operator==="<="&&!pe(s.semver,String(d),r))return!1}if(!d.operator&&(s||a)&&i!==0)return!1}return!(a&&c&&!s&&i!==0||s&&l&&!a&&i!==0||p||u)},Cr=(e,t,r)=>{if(!e)return t;const n=Gt(e.semver,t.semver,r);return n>0?e:n<0||t.operator===">"&&e.operator===">="?t:e},Fr=(e,t,r)=>{if(!e)return t;const n=Gt(e.semver,t.semver,r);return n<0?e:n>0||t.operator==="<"&&e.operator==="<="?t:e};var Df=Ff;const ot=Ae,jr=We,Mf=D,_r=Yn,zf=ue,Gf=Yo,Uf=qo,Wf=Jo,Vf=Qo,Xf=rl,Yf=sl,Hf=ll,Bf=ul,qf=W,Kf=pl,Jf=bl,Zf=Ft,Qf=Sl,ec=wl,tc=Xe,rc=jt,nc=Hn,ac=Bn,sc=_t,ic=Dt,oc=qn,lc=Bl,fc=Ye(),cc=V(),uc=He,dc=tf,mc=sf,hc=cf,pc=mf,vc=vf,gc=Mt,bc=xf,yc=Of,Ec=kf,$c=Cf,Sc=Df;var Ac={parse:zf,valid:Gf,clean:Uf,inc:Wf,diff:Vf,major:Xf,minor:Yf,patch:Hf,prerelease:Bf,compare:qf,rcompare:Kf,compareLoose:Jf,compareBuild:Zf,sort:Qf,rsort:ec,gt:tc,lt:rc,eq:nc,neq:ac,gte:sc,lte:ic,cmp:oc,coerce:lc,Comparator:fc,Range:cc,satisfies:uc,toComparators:dc,maxSatisfying:mc,minSatisfying:hc,minVersion:pc,validRange:vc,outside:gc,gtr:bc,ltr:yc,intersects:Ec,simplifyRange:$c,subset:Sc,SemVer:Mf,re:ot.re,src:ot.src,tokens:ot.t,SEMVER_SPEC_VERSION:jr.SEMVER_SPEC_VERSION,RELEASE_TYPES:jr.RELEASE_TYPES,compareIdentifiers:_r.compareIdentifiers,rcompareIdentifiers:_r.rcompareIdentifiers};const Ic=aa(Ac);function wc(e){return e=e-0,e===e}function Jn(e){return wc(e)?e:(e=e.replaceAll(/[_-]+(.)?/g,(t,r)=>r?r.toUpperCase():""),e.charAt(0).toLowerCase()+e.slice(1))}function xc(e){return e.charAt(0).toUpperCase()+e.slice(1)}var ie=new Map,Rc=1e3;function Nc(e){if(ie.has(e))return ie.get(e);const t={};let r=0;const n=e.length;for(;r<n;){const a=e.indexOf(";",r),s=a===-1?n:a,i=e.slice(r,s).trim();if(i){const f=i.indexOf(":");if(f>0){const o=i.slice(0,f).trim(),c=i.slice(f+1).trim();if(o&&c){const l=Jn(o);t[l.startsWith("webkit")?xc(l):l]=c}}}r=s+1}if(ie.size===Rc){const a=ie.keys().next().value;a&&ie.delete(a)}return ie.set(e,t),t}function Zn(e,t,r={}){if(typeof t=="string")return t;const n=(t.children||[]).map(o=>Zn(e,o)),a=t.attributes||{},s={};for(const[o,c]of Object.entries(a))switch(!0){case o==="class":{s.className=c,delete a.class;break}case o==="style":{s.style=Nc(String(c));break}case o==="aria-label":{s["aria-label"]=c,s["aria-hidden"]="false";break}case o==="aria-hidden":{s["aria-hidden"]=s["aria-label"]?"false":c;break}case o.startsWith("aria-"):case o.startsWith("data-"):{s[o.toLowerCase()]=c;break}default:s[Jn(o)]=c}const{style:i,...f}=r;return i&&(s.style=s.style?{...s.style,...i}:i),e(t.tag,{...f,...s},...n)}var Dr=(e,t)=>{const r=sa.useId();return e||(t?r:void 0)},Oc=class{constructor(e="react-fontawesome"){this.enabled=!1;let t=!1;try{t=typeof process<"u"&&!1}catch{}this.scope=e,this.enabled=t}log(...e){this.enabled&&console.log(`[${this.scope}]`,...e)}warn(...e){this.enabled&&console.warn(`[${this.scope}]`,...e)}error(...e){this.enabled&&console.error(`[${this.scope}]`,...e)}},Pc="7.0.0",kc=typeof process<"u"&&{}.FA_VERSION||"7.0.0",Lc=Po.version||kc,Tc=Ic.gte(Lc,Pc),H={beat:"fa-beat",fade:"fa-fade",beatFade:"fa-beat-fade",bounce:"fa-bounce",shake:"fa-shake",spin:"fa-spin",spinPulse:"fa-spin-pulse",spinReverse:"fa-spin-reverse",pulse:"fa-pulse"},Cc={left:"fa-pull-left",right:"fa-pull-right"},Fc={90:"fa-rotate-90",180:"fa-rotate-180",270:"fa-rotate-270"},jc={"2xs":"fa-2xs",xs:"fa-xs",sm:"fa-sm",lg:"fa-lg",xl:"fa-xl","2xl":"fa-2xl","1x":"fa-1x","2x":"fa-2x","3x":"fa-3x","4x":"fa-4x","5x":"fa-5x","6x":"fa-6x","7x":"fa-7x","8x":"fa-8x","9x":"fa-9x","10x":"fa-10x"},B={border:"fa-border",fixedWidth:"fa-fw",flip:"fa-flip",flipHorizontal:"fa-flip-horizontal",flipVertical:"fa-flip-vertical",inverse:"fa-inverse",rotateBy:"fa-rotate-by",swapOpacity:"fa-swap-opacity",widthAuto:"fa-width-auto"};function _c(e){const{beat:t,fade:r,beatFade:n,bounce:a,shake:s,spin:i,spinPulse:f,spinReverse:o,pulse:c,fixedWidth:l,inverse:u,border:p,flip:d,size:O,rotation:h,pull:P,swapOpacity:N,rotateBy:L,widthAuto:I,className:j}=e,w=[];return j&&w.push(...j.split(" ")),t&&w.push(H.beat),r&&w.push(H.fade),n&&w.push(H.beatFade),a&&w.push(H.bounce),s&&w.push(H.shake),i&&w.push(H.spin),o&&w.push(H.spinReverse),f&&w.push(H.spinPulse),c&&w.push(H.pulse),l&&w.push(B.fixedWidth),u&&w.push(B.inverse),p&&w.push(B.border),d===!0&&w.push(B.flip),(d==="horizontal"||d==="both")&&w.push(B.flipHorizontal),(d==="vertical"||d==="both")&&w.push(B.flipVertical),O!=null&&w.push(jc[O]),h!=null&&h!==0&&w.push(Fc[h]),P!=null&&w.push(Cc[P]),N&&w.push(B.swapOpacity),Tc&&(L&&w.push(B.rotateBy),I&&w.push(B.widthAuto)),w}var Dc=e=>typeof e=="object"&&"icon"in e&&!!e.icon;function Mr(e){if(e)return Dc(e)?e:Wn.icon(e)}function Mc(e){return Object.keys(e)}var zr=new Oc("FontAwesomeIcon"),Qn={border:!1,className:"",mask:void 0,maskId:void 0,fixedWidth:!1,inverse:!1,flip:!1,icon:void 0,listItem:!1,pull:void 0,pulse:!1,rotation:void 0,rotateBy:!1,size:void 0,spin:!1,spinPulse:!1,spinReverse:!1,beat:!1,fade:!1,beatFade:!1,bounce:!1,shake:!1,symbol:!1,title:"",titleId:void 0,transform:void 0,swapOpacity:!1,widthAuto:!1},zc=new Set(Object.keys(Qn)),Gc=Gr.forwardRef((e,t)=>{const r={...Qn,...e},{icon:n,mask:a,symbol:s,title:i,titleId:f,maskId:o,transform:c}=r,l=Dr(o,!!a),u=Dr(f,!!i),p=Mr(n);if(!p)return zr.error("Icon lookup is undefined",n),null;const d=_c(r),O=typeof c=="string"?Wn.transform(c):c,h=Mr(a),P=uo(p,{...d.length>0&&{classes:d},...O&&{transform:O},...h&&{mask:h},symbol:s,title:i,titleId:u,maskId:l});if(!P)return zr.error("Could not find icon",p),null;const{abstract:N}=P,L={ref:t};for(const I of Mc(r))zc.has(I)||(L[I]=r[I]);return Uc(N[0],L)});Gc.displayName="FontAwesomeIcon";var Uc=Zn.bind(null,Gr.createElement);/*!
 * Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
 * Copyright 2025 Fonticons, Inc.
 */var Vc={prefix:"fas",iconName:"skull",icon:[512,512,[128128],"f54c","M416 427.4c58.5-44 96-111.6 96-187.4 0-132.5-114.6-240-256-240S0 107.5 0 240c0 75.8 37.5 143.4 96 187.4L96 464c0 26.5 21.5 48 48 48l32 0 0-40c0-13.3 10.7-24 24-24s24 10.7 24 24l0 40 64 0 0-40c0-13.3 10.7-24 24-24s24 10.7 24 24l0 40 32 0c26.5 0 48-21.5 48-48l0-36.6zM96 256a64 64 0 1 1 128 0 64 64 0 1 1 -128 0zm256-64a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"]},Xc={prefix:"fas",iconName:"clock",icon:[512,512,[128339,"clock-four"],"f017","M256 0a256 256 0 1 1 0 512 256 256 0 1 1 0-512zM232 120l0 136c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2 280 120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"]},Yc={prefix:"fas",iconName:"heart",icon:[512,512,[128153,128154,128155,128156,128420,129293,129294,129505,9829,10084,61578],"f004","M241 87.1l15 20.7 15-20.7C296 52.5 336.2 32 378.9 32 452.4 32 512 91.6 512 165.1l0 2.6c0 112.2-139.9 242.5-212.9 298.2-12.4 9.4-27.6 14.1-43.1 14.1s-30.8-4.6-43.1-14.1C139.9 410.2 0 279.9 0 167.7l0-2.6C0 91.6 59.6 32 133.1 32 175.8 32 216 52.5 241 87.1z"]},Hc={prefix:"fas",iconName:"fire",icon:[448,512,[128293],"f06d","M160.5-26.4c9.3-7.8 23-7.5 31.9 .9 12.3 11.6 23.3 24.4 33.9 37.4 13.5 16.5 29.7 38.3 45.3 64.2 5.2-6.8 10-12.8 14.2-17.9 1.1-1.3 2.2-2.7 3.3-4.1 7.9-9.8 17.7-22.1 30.8-22.1 13.4 0 22.8 11.9 30.8 22.1 1.3 1.7 2.6 3.3 3.9 4.8 10.3 12.4 24 30.3 37.7 52.4 27.2 43.9 55.6 106.4 55.6 176.6 0 123.7-100.3 224-224 224S0 411.7 0 288c0-91.1 41.1-170 80.5-225 19.9-27.7 39.7-49.9 54.6-65.1 8.2-8.4 16.5-16.7 25.5-24.2zM225.7 416c25.3 0 47.7-7 68.8-21 42.1-29.4 53.4-88.2 28.1-134.4-4.5-9-16-9.6-22.5-2l-25.2 29.3c-6.6 7.6-18.5 7.4-24.7-.5-17.3-22.1-49.1-62.4-65.3-83-5.4-6.9-15.2-8-21.5-1.9-18.3 17.8-51.5 56.8-51.5 104.3 0 68.6 50.6 109.2 113.7 109.2z"]};export{Gc as F,Yc as a,Hc as b,Xc as c,Vc as f};
