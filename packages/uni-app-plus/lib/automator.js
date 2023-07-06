/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
var __assign=function(){return __assign=Object.assign||function(t){for(var s,i=1,n=arguments.length;i<n;i++)for(var p in s=arguments[i])Object.prototype.hasOwnProperty.call(s,p)&&(t[p]=s[p]);return t},__assign.apply(this,arguments)};function __spreadArrays(){for(var s=0,i=0,il=arguments.length;i<il;i++)s+=arguments[i].length;var r=Array(s),k=0;for(i=0;i<il;i++)for(var a=arguments[i],j=0,jl=a.length;j<jl;j++,k++)r[k]=a[j];return r}var CALL_METHOD_ERROR,hasOwnProperty=Object.prototype.hasOwnProperty,isUndef=function(v){return null==v},isArray=Array.isArray,cacheStringFunction=function(fn){var cache=Object.create(null);return function(str){return cache[str]||(cache[str]=fn(str))}},hyphenateRE=/\B([A-Z])/g,hyphenate=cacheStringFunction((function(str){return str.replace(hyphenateRE,"-$1").toLowerCase()})),camelizeRE=/-(\w)/g,camelize=cacheStringFunction((function(str){return str.replace(camelizeRE,(function(_,c){return c?c.toUpperCase():""}))})),capitalize=cacheStringFunction((function(str){return str.charAt(0).toUpperCase()+str.slice(1)})),PATH_RE=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;function getPaths(path,data){if(isArray(path))return path;if(data&&(val=data,key=path,hasOwnProperty.call(val,key)))return[path];var val,key,res=[];return path.replace(PATH_RE,(function(match,p1,offset,string){return res.push(offset?string.replace(/\\(\\)?/g,"$1"):p1||match),string})),res}function getDataByPath(data,path){var dataPath,paths=getPaths(path,data);for(dataPath=paths.shift();!isUndef(dataPath);){if(null==(data=data[dataPath]))return;dataPath=paths.shift()}return data}function getPageId(page){return page.__wxWebviewId__?page.__wxWebviewId__:page.privateProperties?page.privateProperties.slaveId:page.$page?page.$page.id:void 0}function getPagePath(page){return page.route||page.uri}function getPageQuery(page){return page.options||page.$page&&page.$page.options||{}}function parsePage(page){return{id:getPageId(page),path:getPagePath(page),query:getPageQuery(page)}}function getPageVm(id){var page=function(id){return getCurrentPages().find((function(page){return getPageId(page)===id}))}(id);return page&&page.$vm}function findComponentVm(vm,nodeId){var res;return vm&&(!function(vm,nodeId){return function(vm){if(vm._$weex)return vm._uid;if(vm._$id)return vm._$id;var parent_1=function(vm){for(var parent=vm.$parent;parent;){if(parent._$id)return parent;parent=parent.$parent}}(vm);if(!vm.$parent)return"-1";var vnode=vm.$vnode,context=vnode.context;return context&&context!==parent_1&&context._$id?context._$id+";"+parent_1._$id+","+vnode.data.attrs._i:parent_1._$id+","+vnode.data.attrs._i}(vm)===nodeId}(vm,nodeId)?vm.$children.find((function(child){return res=findComponentVm(child,nodeId)})):res=vm),res}function getComponentVm(pageId,nodeId){var pageVm=getPageVm(pageId);return pageVm&&findComponentVm(pageVm,nodeId)}function getData(vm,path){var data;return vm&&(data=path?getDataByPath(vm.$data,path):Object.assign({},vm.$data)),Promise.resolve({data:data})}function setData(vm,data){return vm&&Object.keys(data).forEach((function(name){vm[name]=data[name]})),Promise.resolve()}function callMethod(vm,method,args){return new Promise((function(resolve,reject){if(!vm)return reject(CALL_METHOD_ERROR.VM_NOT_EXISTS);if(!vm[method])return reject(CALL_METHOD_ERROR.METHOD_NOT_EXISTS);var obj,ret=vm[method].apply(vm,args);!(obj=ret)||"object"!=typeof obj&&"function"!=typeof obj||"function"!=typeof obj.then?resolve({result:ret}):ret.then((function(res){resolve({result:res})}))}))}!function(CALL_METHOD_ERROR){CALL_METHOD_ERROR.VM_NOT_EXISTS="VM_NOT_EXISTS",CALL_METHOD_ERROR.METHOD_NOT_EXISTS="METHOD_NOT_EXISTS"}(CALL_METHOD_ERROR||(CALL_METHOD_ERROR={}));var socketInstanceMap=new Map,firstSocketTaskEmitter=function(options){return new Promise((function(resolve,reject){var socketInstanceData=socketInstanceMap.values().next().value;if(socketInstanceData){var method_1=options.method;if("onOpen"===method_1)return handleOnOpen(socketInstanceData,resolve);if(method_1.startsWith("on"))return socketInstanceData.instance[method_1]((function(data){resolve(data)}));"sendMessage"===method_1&&(method_1="send"),socketInstanceData.instance[method_1](__assign(__assign({},options),{success:function(result){resolve({result:result}),"close"===method_1&&socketInstanceMap.delete(socketInstanceMap.keys().next().value)},fail:function(error){reject(error)}}))}else reject({errMsg:"socketTask not exists."})}))};function handleOnOpen(socketInstanceData,resolve){if(socketInstanceData.isOpend)resolve({data:socketInstanceData.openData});else{var timer_1=setInterval((function(){socketInstanceData.isOpend&&(clearInterval(timer_1),resolve({data:socketInstanceData.openData}))}),200);setTimeout((function(){clearInterval(timer_1)}),2e3)}}var SYNC_APIS=["stopRecord","getRecorderManager","pauseVoice","stopVoice","pauseBackgroundAudio","stopBackgroundAudio","getBackgroundAudioManager","createAudioContext","createInnerAudioContext","createVideoContext","createCameraContext","createMapContext","canIUse","startAccelerometer","stopAccelerometer","startCompass","stopCompass","hideToast","hideLoading","showNavigationBarLoading","hideNavigationBarLoading","navigateBack","createAnimation","pageScrollTo","createSelectorQuery","createCanvasContext","createContext","drawCanvas","hideKeyboard","stopPullDownRefresh","arrayBufferToBase64","base64ToArrayBuffer"],onApisEventMap=new Map,ON_APIS=["onCompassChange","onThemeChange","onUserCaptureScreen","onWindowResize","onMemoryWarning","onAccelerometerChange","onKeyboardHeightChange","onNetworkStatusChange","onPushMessage","onLocationChange","onGetWifiList","onWifiConnected","onWifiConnectedWithPartialInfo","onSocketOpen","onSocketError","onSocketMessage","onSocketClose"],originUni={},SYNC_API_RE=/^\$|Sync$|Window$|WindowStyle$|sendHostEvent|sendNativeEvent|restoreGlobal|requireGlobal|getCurrentSubNVue|getMenuButtonBoundingClientRect|^report|interceptors|Interceptor$|getSubNVueById|requireNativePlugin|upx2px|hideKeyboard|canIUse|^create|Sync$|Manager$|base64ToArrayBuffer|arrayBufferToBase64|getLocale|setLocale|invokePushCallback|getWindowInfo|getDeviceInfo|getAppBaseInfo|getSystemSetting|getAppAuthorizeSetting|initUTS|requireUTS|registerUTS/,MOCK_API_BLACKLIST_RE=/^on|^off/;function isSyncApi(method){return SYNC_API_RE.test(method)||-1!==SYNC_APIS.indexOf(method)}var App={getPageStack:function(){return Promise.resolve({pageStack:getCurrentPages().map((function(page){return parsePage(page)}))})},getCurrentPage:function(){var pages=getCurrentPages(),len=pages.length;return new Promise((function(resolve,reject){len?resolve(parsePage(pages[len-1])):reject(Error("getCurrentPages().length=0"))}))},callUniMethod:function(params){var method=params.method,args=params.args;return new Promise((function(resolve,reject){if("connectSocket"!==method){var id,url;if(ON_APIS.includes(method)){onApisEventMap.has(method)||onApisEventMap.set(method,new Map);var uuid_1=args[0],callback_1=function(res){send({id:uuid_1,result:__assign({method:method},res)})};return method.startsWith("onSocket")?firstSocketTaskEmitter({method:method.replace("Socket","")}).then((function(res){return callback_1(res)})).catch((function(err){return callback_1(err)})):(onApisEventMap.get(method).set(uuid_1,callback_1),uni[method](callback_1)),resolve({result:null})}if(method.startsWith("off")&&ON_APIS.includes(method.replace("off","on"))){var onMethod=method.replace("off","on");if(onApisEventMap.has(onMethod)){var uuid=args[0];if(void 0!==uuid){var callback=onApisEventMap.get(onMethod).get(uuid);uni[method](callback),onApisEventMap.get(onMethod).delete(uuid)}else{onApisEventMap.get(onMethod).forEach((function(callback){uni[method](callback)})),onApisEventMap.delete(onMethod)}}return resolve({result:null})}if(method.indexOf("Socket")>0)return firstSocketTaskEmitter(__assign({method:method.replace("Socket","")},args[0])).then((function(res){return resolve(res)})).catch((function(err){return reject(err)}));if(!uni[method])return reject(Error("uni."+method+" not exists"));if(isSyncApi(method))return resolve({result:uni[method].apply(uni,args)});var params=[Object.assign({},args[0]||{},{success:function(result){setTimeout((function(){resolve({result:result})}),"pageScrollTo"===method?350:0)},fail:function(res){reject(Error(res.errMsg.replace(method+":fail ","")))}})];uni[method].apply(uni,params)}else(id=args[0].id,url=args[0].url,new Promise((function(resolve,reject){var socketTask=uni.connectSocket({url:url,success:function(){resolve({result:{errMsg:"connectSocket:ok"}})},fail:function(){reject({result:{errMsg:"connectSocket:fail"}})}});socketInstanceMap.set(id,{instance:socketTask,isOpend:!1}),socketTask.onOpen((function(data){socketInstanceMap.get(id).isOpend=!0,socketInstanceMap.get(id).openData=data}))}))).then((function(res){return resolve(res)})).catch((function(err){return reject(err)}))}))},mockUniMethod:function(params){var method=params.method;if(!uni[method])throw Error("uni."+method+" not exists");if(!function(method){return!MOCK_API_BLACKLIST_RE.test(method)}(method))throw Error("You can't mock uni."+method);var mockFn,result=params.result,functionDeclaration=params.functionDeclaration;return isUndef(result)&&isUndef(functionDeclaration)?(originUni[method]&&(uni[method]=originUni[method],delete originUni[method]),Promise.resolve()):(mockFn=isUndef(functionDeclaration)?isSyncApi(method)?function(){return result}:function(params){setTimeout((function(){result.errMsg&&-1!==result.errMsg.indexOf(":fail")?params.fail&&params.fail(result):params.success&&params.success(result),params.complete&&params.complete(result)}),4)}:function(){for(var args=[],_i=0;_i<arguments.length;_i++)args[_i]=arguments[_i];return new Function("return "+functionDeclaration)().apply(mockFn,args.concat(params.args))},mockFn.origin=originUni[method]||uni[method],originUni[method]||(originUni[method]=uni[method]),uni[method]=mockFn,Promise.resolve())},captureScreenshot:function(params){return new Promise((function(resolve,reject){var pages=getCurrentPages(),len=pages.length;if(len){var page=pages[len-1];if(page){var webview=page.$getAppWebview(),bitmap_1=new plus.nativeObj.Bitmap("captureScreenshot","captureScreenshot.png");webview.draw(bitmap_1,(function(res){var data=bitmap_1.toBase64Data().replace("data:image/png;base64,","");bitmap_1.clear(),resolve({data:data})}),(function(err){reject(Error("captureScreenshot fail: "+err.message))}),{wholeContent:!!params.fullPage})}}else reject(Error("getCurrentPage fail."))}))},socketEmitter:function(params){return new Promise((function(resolve,reject){(function(params){return new Promise((function(resolve,reject){if(socketInstanceMap.has(params.id)){var socketInstanceData=socketInstanceMap.get(params.id),socketTask=socketInstanceData.instance,method_2=params.method,id_1=params.id;if("onOpen"==method_2)return handleOnOpen(socketInstanceData,resolve);if(method_2.startsWith("on"))return socketTask[method_2]((function(data){resolve({method:"Socket."+method_2,id:id_1,data:data})}));socketTask[method_2](__assign(__assign({},params),{success:function(result){resolve(result),"close"===method_2&&socketInstanceMap.delete(params.id)},fail:function(error){reject(error)}}))}else reject({errMsg:"socketTask not exists."})}))})(params).then((function(res){return resolve(res)})).catch((function(err){return reject(err)}))}))}},App$1=App,Page$1={getData:function(params){return getData(getPageVm(params.pageId),params.path)},setData:function(params){return setData(getPageVm(params.pageId),params.data)},callMethod:function(params){var _a,err=((_a={})[CALL_METHOD_ERROR.VM_NOT_EXISTS]="Page["+params.pageId+"] not exists",_a[CALL_METHOD_ERROR.METHOD_NOT_EXISTS]="page."+params.method+" not exists",_a);return new Promise((function(resolve,reject){callMethod(getPageVm(params.pageId),params.method,params.args).then((function(res){return resolve(res)})).catch((function(type){reject(Error(err[type]))}))}))},callMethodWithCallback:function(params){var _a,err=((_a={})[CALL_METHOD_ERROR.VM_NOT_EXISTS]="callMethodWithCallback:fail, Page["+params.pageId+"] not exists",_a[CALL_METHOD_ERROR.METHOD_NOT_EXISTS]="callMethodWithCallback:fail, page."+params.method+" not exists",_a),callback=params.args[params.args.length-1];callMethod(getPageVm(params.pageId),params.method,params.args).catch((function(type){callback({errMsg:err[type]})}))}};function getNodeId(params){return params.nodeId||params.elementId}var Element$1={getData:function(params){return getData(getComponentVm(params.pageId,getNodeId(params)),params.path)},setData:function(params){return setData(getComponentVm(params.pageId,getNodeId(params)),params.data)},callMethod:function(params){var _a,nodeId=getNodeId(params),err=((_a={})[CALL_METHOD_ERROR.VM_NOT_EXISTS]="Component["+params.pageId+":"+nodeId+"] not exists",_a[CALL_METHOD_ERROR.METHOD_NOT_EXISTS]="component."+params.method+" not exists",_a);return new Promise((function(resolve,reject){callMethod(getComponentVm(params.pageId,nodeId),params.method,params.args).then((function(res){return resolve(res)})).catch((function(type){reject(Error(err[type]))}))}))}};function getDocument(pageId){var page=getCurrentPages().find((function(page){return page.$page.id===pageId}));if(!page)throw Error("page["+pageId+"] not found");var weex=page.$vm._$weex;return weex.document.__$weex__||(weex.document.__$weex__=weex),weex.document}var TAGS={},U_TAGS={};["text","image","input","textarea","video","web-view","slider"].forEach((function(tag){TAGS[tag]=!0,U_TAGS["u-"+tag]=!0}));var BUILITIN=["movable-view","picker","ad","button","checkbox-group","checkbox","form","icon","label","movable-area","navigator","picker-view-column","picker-view","progress","radio-group","radio","rich-text","u-slider","swiper-item","swiper","switch"],BUILITIN_ALIAS=BUILITIN.map((function(tag){return capitalize(camelize(tag))}));function transTagName(el){var tagName=el.type;if(U_TAGS[tagName])return tagName.replace("u-","");var componentName=el.__vue__&&el.__vue__.$options.name;return"USlider"===componentName?"slider":componentName&&-1!==BUILITIN_ALIAS.indexOf(componentName)?hyphenate(componentName):tagName}function transEl(el){var elem={elementId:el.nodeId,tagName:transTagName(el),nvue:!0},vm=el.__vue__;return vm&&!vm.$options.isReserved&&(elem.nodeId=vm._uid),"video"===elem.tagName&&(elem.videoId=elem.nodeId),elem}function querySelectorByFn(node,match,result){for(var children=node.children,i=0;i<children.length;i++){var childNode=children[i];if(match(childNode)){if(!result)return childNode;result.push(childNode)}if(result)querySelectorByFn(childNode,match,result);else{var res=querySelectorByFn(childNode,match,result);if(res)return res}}return result}function querySelector(context,selector,result){var matchSelector,match;if(0===selector.indexOf("#")?(matchSelector=selector.substr(1),match=function(node){return node.attr&&node.attr.id===matchSelector}):0===selector.indexOf(".")&&(matchSelector=selector.substr(1),match=function(node){return node.classList&&-1!==node.classList.indexOf(matchSelector)}),match){var ret_1=querySelectorByFn(context,match,result);if(!ret_1)throw Error("Node("+selector+") not exists");return ret_1}if("body"===selector)return Object.assign({},context,{type:"page"});0===selector.indexOf("uni-")&&(selector=selector.replace("uni-",""));var tagName=TAGS[selector]?"u-"+selector:selector,aliasTagName=-1!==BUILITIN.indexOf(tagName)?capitalize(camelize(tagName)):"",ret=querySelectorByFn(context,(function(node){return node.type===tagName||aliasTagName&&node.__vue__&&node.__vue__.$options.name===aliasTagName}),result);if(!ret)throw Error("Node("+selector+") not exists");return ret}var DOM_PROPERTIES=[{test:function(names){return 2===names.length&&-1!==names.indexOf("document.documentElement.scrollWidth")&&-1!==names.indexOf("document.documentElement.scrollHeight")},call:function(node){var weex=node.__$weex__||node.ownerDocument.__$weex__;return new Promise((function(resolve){"scroll-view"===node.type&&1===node.children.length&&(node=node.children[0]),weex.requireModule("dom").getComponentRect(node.ref,(function(res){res.result?resolve([res.size.width,res.size.height]):resolve([0,0])}))}))}},{test:function(names){return 1===names.length&&"document.documentElement.scrollTop"===names[0]},call:function(node){var weex=node.__$weex__||node.ownerDocument.__$weex__;return new Promise((function(resolve){"scroll-view"===node.type&&1===node.children.length&&(node=node.children[0]),weex.requireModule("dom").getComponentRect(node.ref,(function(res){resolve([res.size&&Math.abs(res.size.top)||0])}))}))}},{test:function(names){return 2===names.length&&-1!==names.indexOf("offsetWidth")&&-1!==names.indexOf("offsetHeight")},call:function(node){var weex=node.__$weex__||node.ownerDocument.__$weex__;return new Promise((function(resolve){weex.requireModule("dom").getComponentRect(node.ref,(function(res){res.result?resolve([res.size.width,res.size.height]):resolve([0,0])}))}))}},{test:function(names,node){return 1===names.length&&"innerText"===names[0]},call:function(node){return Promise.resolve([toText(node,[]).join("")])}}];function toText(node,res){return"u-text"===node.type?res.push(node.attr.value):node.pureChildren.map((function(child){return toText(child,res)})),res}function formatHTML(html){return html.replace(/\n/g,"").replace(/<u-/g,"<").replace(/<\/u-/g,"</")}function toHTML(node,type){return"outer"===type?"body"===node.role&&"scroll-view"===node.type?"<page>"+formatHTML(toHTML(node,"inner"))+"</page>":formatHTML(node.toString()):formatHTML(node.pureChildren.map((function(child){return child.toString()})).join(""))}var FUNCTIONS={input:{input:function(el,value){el.setValue(value)}},textarea:{input:function(el,value){el.setValue(value)}},"scroll-view":{scrollTo:function(el,x,y){el.scrollTo(y)},scrollTop:function(el){return 0},scrollLeft:function(el){return 0},scrollWidth:function(el){return 0},scrollHeight:function(el){return 0}},swiper:{swipeTo:function(el,index){el.__vue__.current=index}},"movable-view":{moveTo:function(el,x,y){var vm=el.__vue__;vm.x=x,vm.y=y}},switch:{tap:function(el){var vm=el.__vue__;vm.checked=!vm.checked}},slider:{slideTo:function(el,value){el.__vue__.value=value}}};function getRoot(pageId){return getDocument(pageId).body}var NativeAdapter={getWindow:function(pageId){return getRoot(pageId)},getDocument:function(pageId){return getRoot(pageId)},getEl:function(elementId,pageId){var element=getDocument(pageId).getRef(elementId);if(!element)throw Error("element destroyed");return element},getOffset:function(node){var weex=node.__$weex__||node.ownerDocument.__$weex__;return new Promise((function(resolve){weex.requireModule("dom").getComponentRect(node.ref,(function(res){res.result?resolve({left:res.size.left,top:res.size.top}):resolve({left:0,top:0})}))}))},querySelector:function(context,selector){return Promise.resolve(transEl(querySelector(context,selector)))},querySelectorAll:function(context,selector){return Promise.resolve({elements:querySelector(context,selector,[]).map((function(el){return transEl(el)}))})},queryProperties:function(context,names){var options=DOM_PROPERTIES.find((function(options){return options.test(names,context)}));return options?options.call(context).then((function(properties){return{properties:properties}})):Promise.resolve({properties:names.map((function(name){return getDataByPath(context,name)}))})},queryAttributes:function(context,names){var attr=context.attr;return Promise.resolve({attributes:names.map((function(name){return"class"===name?(context.classList||[]).join(" "):String(attr[name]||attr[camelize(name)]||"")}))})},queryStyles:function(context,names){var style=context.style;return Promise.resolve({styles:names.map((function(name){return style[name]}))})},queryHTML:function(context,type){return Promise.resolve({html:toHTML(context,type)})},dispatchTapEvent:function(el){return el.fireEvent("click",{timeStamp:Date.now(),target:el,currentTarget:el},!0),Promise.resolve()},dispatchLongpressEvent:function(el){return el.fireEvent("longpress",{timeStamp:Date.now(),target:el,currentTarget:el},!0),Promise.resolve()},dispatchTouchEvent:function(el,type,eventInitDict){return eventInitDict||(eventInitDict={}),eventInitDict.touches||(eventInitDict.touches=[]),eventInitDict.changedTouches||(eventInitDict.changedTouches=[]),eventInitDict.touches.length||eventInitDict.touches.push({identifier:Date.now(),target:el}),el.fireEvent(type,Object.assign({timeStamp:Date.now(),target:el,currentTarget:el},eventInitDict),!0),Promise.resolve()},callFunction:function(el,functionName,args){var fn=getDataByPath(FUNCTIONS,functionName);return fn?Promise.resolve({result:fn.apply(null,__spreadArrays([el],args))}):Promise.reject(Error(functionName+" not exists"))},triggerEvent:function(el,type,detail){var vm=el.__vue__;return vm?vm.$trigger&&vm.$trigger(type,{},detail):el.fireEvent(type,{timeStamp:Date.now(),target:el,currentTarget:el},!1,{params:[{detail:detail}]}),Promise.resolve()}};var Api={};Object.keys(App$1).forEach((function(method){Api["App."+method]=App$1[method]})),Object.keys(Page$1).forEach((function(method){Api["Page."+method]=Page$1[method]})),Object.keys(Element$1).forEach((function(method){Api["Element."+method]=Element$1[method]}));var NVueApi,fallback,socketTask,wsEndpoint=process.env.UNI_AUTOMATOR_WS_ENDPOINT;function send(data){socketTask.send({data:JSON.stringify(data)})}function onMessage(res){var _a=JSON.parse(res.data),id=_a.id,method=_a.method,params=_a.params,data={id:id},fn=Api[method];if(!fn){if(fallback){var result=fallback(id,method,params,data);if(!0===result)return;fn=result}if(!fn)return data.error={message:method+" unimplemented"},send(data)}try{fn(params).then((function(res){res&&(data.result=res)})).catch((function(err){data.error={message:err.message}})).finally((function(){send(data)}))}catch(err){data.error={message:err.message},send(data)}}fallback=function(id,method,params,data){var pageId=params.pageId,page=function(pageId){var pages=getCurrentPages();if(!pageId)return pages[pages.length-1];return pages.find((function(page){return page.$page.id===pageId}))}(pageId);return page?!page.$page.meta.isNVue?(UniServiceJSBridge.publishHandler("sendAutoMessage",{id:id,method:method,params:params},pageId),!0):(NVueApi||(NVueApi=Object.assign({},function(adapter){return{"Page.getElement":function(params){return adapter.querySelector(adapter.getDocument(params.pageId),params.selector)},"Page.getElements":function(params){return adapter.querySelectorAll(adapter.getDocument(params.pageId),params.selector)},"Page.getWindowProperties":function(params){return adapter.queryProperties(adapter.getWindow(params.pageId),params.names)}}}(NativeAdapter),function(adapter){var getEl=function(params){return adapter.getEl(params.elementId,params.pageId)};return{"Element.getElement":function(params){return adapter.querySelector(getEl(params),params.selector)},"Element.getElements":function(params){return adapter.querySelectorAll(getEl(params),params.selector)},"Element.getDOMProperties":function(params){return adapter.queryProperties(getEl(params),params.names)},"Element.getProperties":function(params){var el=getEl(params),ctx=el.__vue__||el.attr||{};return adapter.queryProperties(ctx,params.names)},"Element.getOffset":function(params){return adapter.getOffset(getEl(params))},"Element.getAttributes":function(params){return adapter.queryAttributes(getEl(params),params.names)},"Element.getStyles":function(params){return adapter.queryStyles(getEl(params),params.names)},"Element.getHTML":function(params){return adapter.queryHTML(getEl(params),params.type)},"Element.tap":function(params){return adapter.dispatchTapEvent(getEl(params))},"Element.longpress":function(params){return adapter.dispatchLongpressEvent(getEl(params))},"Element.touchstart":function(params){return adapter.dispatchTouchEvent(getEl(params),"touchstart",params)},"Element.touchmove":function(params){return adapter.dispatchTouchEvent(getEl(params),"touchmove",params)},"Element.touchend":function(params){return adapter.dispatchTouchEvent(getEl(params),"touchend",params)},"Element.callFunction":function(params){return adapter.callFunction(getEl(params),params.functionName,params.args)},"Element.triggerEvent":function(params){return adapter.triggerEvent(getEl(params),params.type,params.detail)}}}(NativeAdapter))),NVueApi[method]):(data.error={message:"page["+pageId+"] not exists"},send(data),!0)},UniServiceJSBridge.subscribe("onAutoMessageReceive",(function(res){send(res)})),setTimeout((function(){var options;void 0===options&&(options={}),(socketTask=uni.connectSocket({url:wsEndpoint,complete:function(){}})).onMessage(onMessage),socketTask.onOpen((function(res){options.success&&options.success(),console.log("已开启自动化测试...")})),socketTask.onError((function(res){console.log("automator.onError",res)})),socketTask.onClose((function(){options.fail&&options.fail({errMsg:"$$initRuntimeAutomator:fail"}),console.log("automator.onClose")}))}),500);export{send};
