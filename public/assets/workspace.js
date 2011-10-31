(function(){var root=this;
var previousUnderscore=root._;
var breaker={};
var ArrayProto=Array.prototype,ObjProto=Object.prototype;
var slice=ArrayProto.slice,unshift=ArrayProto.unshift,toString=ObjProto.toString,hasOwnProperty=ObjProto.hasOwnProperty;
var nativeForEach=ArrayProto.forEach,nativeMap=ArrayProto.map,nativeReduce=ArrayProto.reduce,nativeReduceRight=ArrayProto.reduceRight,nativeFilter=ArrayProto.filter,nativeEvery=ArrayProto.every,nativeSome=ArrayProto.some,nativeIndexOf=ArrayProto.indexOf,nativeLastIndexOf=ArrayProto.lastIndexOf,nativeIsArray=Array.isArray,nativeKeys=Object.keys;
var _=function(obj){return new wrapper(obj)
};
if(typeof module!=="undefined"&&module.exports){module.exports=_;
_._=_
}else{root._=_
}_.VERSION="1.1.4";
var each=_.each=_.forEach=function(obj,iterator,context){var value;
if(obj==null){return
}if(nativeForEach&&obj.forEach===nativeForEach){obj.forEach(iterator,context)
}else{if(_.isNumber(obj.length)){for(var i=0,l=obj.length;
i<l;
i++){if(iterator.call(context,obj[i],i,obj)===breaker){return
}}}else{for(var key in obj){if(hasOwnProperty.call(obj,key)){if(iterator.call(context,obj[key],key,obj)===breaker){return
}}}}}};
_.map=function(obj,iterator,context){var results=[];
if(obj==null){return results
}if(nativeMap&&obj.map===nativeMap){return obj.map(iterator,context)
}each(obj,function(value,index,list){results[results.length]=iterator.call(context,value,index,list)
});
return results
};
_.reduce=_.foldl=_.inject=function(obj,iterator,memo,context){var initial=memo!==void 0;
if(obj==null){obj=[]
}if(nativeReduce&&obj.reduce===nativeReduce){if(context){iterator=_.bind(iterator,context)
}return initial?obj.reduce(iterator,memo):obj.reduce(iterator)
}each(obj,function(value,index,list){if(!initial&&index===0){memo=value;
initial=true
}else{memo=iterator.call(context,memo,value,index,list)
}});
if(!initial){throw new TypeError("Reduce of empty array with no initial value")
}return memo
};
_.reduceRight=_.foldr=function(obj,iterator,memo,context){if(obj==null){obj=[]
}if(nativeReduceRight&&obj.reduceRight===nativeReduceRight){if(context){iterator=_.bind(iterator,context)
}return memo!==void 0?obj.reduceRight(iterator,memo):obj.reduceRight(iterator)
}var reversed=(_.isArray(obj)?obj.slice():_.toArray(obj)).reverse();
return _.reduce(reversed,iterator,memo,context)
};
_.find=_.detect=function(obj,iterator,context){var result;
any(obj,function(value,index,list){if(iterator.call(context,value,index,list)){result=value;
return true
}});
return result
};
_.filter=_.select=function(obj,iterator,context){var results=[];
if(obj==null){return results
}if(nativeFilter&&obj.filter===nativeFilter){return obj.filter(iterator,context)
}each(obj,function(value,index,list){if(iterator.call(context,value,index,list)){results[results.length]=value
}});
return results
};
_.reject=function(obj,iterator,context){var results=[];
if(obj==null){return results
}each(obj,function(value,index,list){if(!iterator.call(context,value,index,list)){results[results.length]=value
}});
return results
};
_.every=_.all=function(obj,iterator,context){iterator=iterator||_.identity;
var result=true;
if(obj==null){return result
}if(nativeEvery&&obj.every===nativeEvery){return obj.every(iterator,context)
}each(obj,function(value,index,list){if(!(result=result&&iterator.call(context,value,index,list))){return breaker
}});
return result
};
var any=_.some=_.any=function(obj,iterator,context){iterator=iterator||_.identity;
var result=false;
if(obj==null){return result
}if(nativeSome&&obj.some===nativeSome){return obj.some(iterator,context)
}each(obj,function(value,index,list){if(result=iterator.call(context,value,index,list)){return breaker
}});
return result
};
_.include=_.contains=function(obj,target){var found=false;
if(obj==null){return found
}if(nativeIndexOf&&obj.indexOf===nativeIndexOf){return obj.indexOf(target)!=-1
}any(obj,function(value){if(found=value===target){return true
}});
return found
};
_.invoke=function(obj,method){var args=slice.call(arguments,2);
return _.map(obj,function(value){return(method?value[method]:value).apply(value,args)
})
};
_.pluck=function(obj,key){return _.map(obj,function(value){return value[key]
})
};
_.max=function(obj,iterator,context){if(!iterator&&_.isArray(obj)){return Math.max.apply(Math,obj)
}var result={computed:-Infinity};
each(obj,function(value,index,list){var computed=iterator?iterator.call(context,value,index,list):value;
computed>=result.computed&&(result={value:value,computed:computed})
});
return result.value
};
_.min=function(obj,iterator,context){if(!iterator&&_.isArray(obj)){return Math.min.apply(Math,obj)
}var result={computed:Infinity};
each(obj,function(value,index,list){var computed=iterator?iterator.call(context,value,index,list):value;
computed<result.computed&&(result={value:value,computed:computed})
});
return result.value
};
_.sortBy=function(obj,iterator,context){return _.pluck(_.map(obj,function(value,index,list){return{value:value,criteria:iterator.call(context,value,index,list)}
}).sort(function(left,right){var a=left.criteria,b=right.criteria;
return a<b?-1:a>b?1:0
}),"value")
};
_.sortedIndex=function(array,obj,iterator){iterator=iterator||_.identity;
var low=0,high=array.length;
while(low<high){var mid=(low+high)>>1;
iterator(array[mid])<iterator(obj)?low=mid+1:high=mid
}return low
};
_.toArray=function(iterable){if(!iterable){return[]
}if(iterable.toArray){return iterable.toArray()
}if(_.isArray(iterable)){return iterable
}if(_.isArguments(iterable)){return slice.call(iterable)
}return _.values(iterable)
};
_.size=function(obj){return _.toArray(obj).length
};
_.first=_.head=function(array,n,guard){return n&&!guard?slice.call(array,0,n):array[0]
};
_.rest=_.tail=function(array,index,guard){return slice.call(array,_.isUndefined(index)||guard?1:index)
};
_.last=function(array){return array[array.length-1]
};
_.compact=function(array){return _.filter(array,function(value){return !!value
})
};
_.flatten=function(array){return _.reduce(array,function(memo,value){if(_.isArray(value)){return memo.concat(_.flatten(value))
}memo[memo.length]=value;
return memo
},[])
};
_.without=function(array){var values=slice.call(arguments,1);
return _.filter(array,function(value){return !_.include(values,value)
})
};
_.uniq=_.unique=function(array,isSorted){return _.reduce(array,function(memo,el,i){if(0==i||(isSorted===true?_.last(memo)!=el:!_.include(memo,el))){memo[memo.length]=el
}return memo
},[])
};
_.intersect=function(array){var rest=slice.call(arguments,1);
return _.filter(_.uniq(array),function(item){return _.every(rest,function(other){return _.indexOf(other,item)>=0
})
})
};
_.zip=function(){var args=slice.call(arguments);
var length=_.max(_.pluck(args,"length"));
var results=new Array(length);
for(var i=0;
i<length;
i++){results[i]=_.pluck(args,""+i)
}return results
};
_.indexOf=function(array,item,isSorted){if(array==null){return -1
}if(isSorted){var i=_.sortedIndex(array,item);
return array[i]===item?i:-1
}if(nativeIndexOf&&array.indexOf===nativeIndexOf){return array.indexOf(item)
}for(var i=0,l=array.length;
i<l;
i++){if(array[i]===item){return i
}}return -1
};
_.lastIndexOf=function(array,item){if(array==null){return -1
}if(nativeLastIndexOf&&array.lastIndexOf===nativeLastIndexOf){return array.lastIndexOf(item)
}var i=array.length;
while(i--){if(array[i]===item){return i
}}return -1
};
_.range=function(start,stop,step){var args=slice.call(arguments),solo=args.length<=1,start=solo?0:args[0],stop=solo?args[0]:args[1],step=args[2]||1,len=Math.max(Math.ceil((stop-start)/step),0),idx=0,range=new Array(len);
while(idx<len){range[idx++]=start;
start+=step
}return range
};
_.bind=function(func,obj){var args=slice.call(arguments,2);
return function(){return func.apply(obj||{},args.concat(slice.call(arguments)))
}
};
_.bindAll=function(obj){var funcs=slice.call(arguments,1);
if(funcs.length==0){funcs=_.functions(obj)
}each(funcs,function(f){obj[f]=_.bind(obj[f],obj)
});
return obj
};
_.memoize=function(func,hasher){var memo={};
hasher=hasher||_.identity;
return function(){var key=hasher.apply(this,arguments);
return key in memo?memo[key]:(memo[key]=func.apply(this,arguments))
}
};
_.delay=function(func,wait){var args=slice.call(arguments,2);
return setTimeout(function(){return func.apply(func,args)
},wait)
};
_.defer=function(func){return _.delay.apply(_,[func,1].concat(slice.call(arguments,1)))
};
var limit=function(func,wait,debounce){var timeout;
return function(){var context=this,args=arguments;
var throttler=function(){timeout=null;
func.apply(context,args)
};
if(debounce){clearTimeout(timeout)
}if(debounce||!timeout){timeout=setTimeout(throttler,wait)
}}
};
_.throttle=function(func,wait){return limit(func,wait,false)
};
_.debounce=function(func,wait){return limit(func,wait,true)
};
_.wrap=function(func,wrapper){return function(){var args=[func].concat(slice.call(arguments));
return wrapper.apply(this,args)
}
};
_.compose=function(){var funcs=slice.call(arguments);
return function(){var args=slice.call(arguments);
for(var i=funcs.length-1;
i>=0;
i--){args=[funcs[i].apply(this,args)]
}return args[0]
}
};
_.keys=nativeKeys||function(obj){if(_.isArray(obj)){return _.range(0,obj.length)
}var keys=[];
for(var key in obj){if(hasOwnProperty.call(obj,key)){keys[keys.length]=key
}}return keys
};
_.values=function(obj){return _.map(obj,_.identity)
};
_.functions=_.methods=function(obj){return _.filter(_.keys(obj),function(key){return _.isFunction(obj[key])
}).sort()
};
_.extend=function(obj){each(slice.call(arguments,1),function(source){for(var prop in source){obj[prop]=source[prop]
}});
return obj
};
_.clone=function(obj){return _.isArray(obj)?obj.slice():_.extend({},obj)
};
_.tap=function(obj,interceptor){interceptor(obj);
return obj
};
_.isEqual=function(a,b){if(a===b){return true
}var atype=typeof(a),btype=typeof(b);
if(atype!=btype){return false
}if(a==b){return true
}if((!a&&b)||(a&&!b)){return false
}if(a._chain){a=a._wrapped
}if(b._chain){b=b._wrapped
}if(a.isEqual){return a.isEqual(b)
}if(_.isDate(a)&&_.isDate(b)){return a.getTime()===b.getTime()
}if(_.isNaN(a)&&_.isNaN(b)){return false
}if(_.isRegExp(a)&&_.isRegExp(b)){return a.source===b.source&&a.global===b.global&&a.ignoreCase===b.ignoreCase&&a.multiline===b.multiline
}if(atype!=="object"){return false
}if(a.length&&(a.length!==b.length)){return false
}var aKeys=_.keys(a),bKeys=_.keys(b);
if(aKeys.length!=bKeys.length){return false
}for(var key in a){if(!(key in b)||!_.isEqual(a[key],b[key])){return false
}}return true
};
_.isEmpty=function(obj){if(_.isArray(obj)||_.isString(obj)){return obj.length===0
}for(var key in obj){if(hasOwnProperty.call(obj,key)){return false
}}return true
};
_.isElement=function(obj){return !!(obj&&obj.nodeType==1)
};
_.isArray=nativeIsArray||function(obj){return toString.call(obj)==="[object Array]"
};
_.isArguments=function(obj){return !!(obj&&hasOwnProperty.call(obj,"callee"))
};
_.isFunction=function(obj){return !!(obj&&obj.constructor&&obj.call&&obj.apply)
};
_.isString=function(obj){return !!(obj===""||(obj&&obj.charCodeAt&&obj.substr))
};
_.isNumber=function(obj){return !!(obj===0||(obj&&obj.toExponential&&obj.toFixed))
};
_.isNaN=function(obj){return obj!==obj
};
_.isBoolean=function(obj){return obj===true||obj===false
};
_.isDate=function(obj){return !!(obj&&obj.getTimezoneOffset&&obj.setUTCFullYear)
};
_.isRegExp=function(obj){return !!(obj&&obj.test&&obj.exec&&(obj.ignoreCase||obj.ignoreCase===false))
};
_.isNull=function(obj){return obj===null
};
_.isUndefined=function(obj){return obj===void 0
};
_.noConflict=function(){root._=previousUnderscore;
return this
};
_.identity=function(value){return value
};
_.times=function(n,iterator,context){for(var i=0;
i<n;
i++){iterator.call(context,i)
}};
_.mixin=function(obj){each(_.functions(obj),function(name){addToWrapper(name,_[name]=obj[name])
})
};
var idCounter=0;
_.uniqueId=function(prefix){var id=idCounter++;
return prefix?prefix+id:id
};
_.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g};
_.template=function(str,data){var c=_.templateSettings;
var tmpl="var __p=[],print=function(){__p.push.apply(__p,arguments);};"+"with(obj||{}){__p.push('"+str.replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(c.interpolate,function(match,code){return"',"+code.replace(/\\'/g,"'")+",'"
}).replace(c.evaluate||null,function(match,code){return"');"+code.replace(/\\'/g,"'").replace(/[\r\n\t]/g," ")+"__p.push('"
}).replace(/\r/g,"\\r").replace(/\n/g,"\\n").replace(/\t/g,"\\t")+"');}return __p.join('');";
var func=new Function("obj",tmpl);
return data?func(data):func
};
var wrapper=function(obj){this._wrapped=obj
};
_.prototype=wrapper.prototype;
var result=function(obj,chain){return chain?_(obj).chain():obj
};
var addToWrapper=function(name,func){wrapper.prototype[name]=function(){var args=slice.call(arguments);
unshift.call(args,this._wrapped);
return result(func.apply(_,args),this._chain)
}
};
_.mixin(_);
each(["pop","push","reverse","shift","sort","splice","unshift"],function(name){var method=ArrayProto[name];
wrapper.prototype[name]=function(){method.apply(this._wrapped,arguments);
return result(this._wrapped,this._chain)
}
});
each(["concat","join","slice"],function(name){var method=ArrayProto[name];
wrapper.prototype[name]=function(){return result(method.apply(this._wrapped,arguments),this._chain)
}
});
wrapper.prototype.chain=function(){this._chain=true;
return this
};
wrapper.prototype.value=function(){return this._wrapped
}
})();
/*!
 * jQuery JavaScript Library v1.6.4
 * http://jquery.com/
 *
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2011, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: Mon Sep 12 18:54:48 2011 -0400
 */
(function(window,undefined){var document=window.document,navigator=window.navigator,location=window.location;
var jQuery=(function(){var jQuery=function(selector,context){return new jQuery.fn.init(selector,context,rootjQuery)
},_jQuery=window.jQuery,_$=window.$,rootjQuery,quickExpr=/^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,rnotwhite=/\S/,trimLeft=/^\s+/,trimRight=/\s+$/,rdigit=/\d/,rsingleTag=/^<(\w+)\s*\/?>(?:<\/\1>)?$/,rvalidchars=/^[\],:{}\s]*$/,rvalidescape=/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,rvalidtokens=/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,rvalidbraces=/(?:^|:|,)(?:\s*\[)+/g,rwebkit=/(webkit)[ \/]([\w.]+)/,ropera=/(opera)(?:.*version)?[ \/]([\w.]+)/,rmsie=/(msie) ([\w.]+)/,rmozilla=/(mozilla)(?:.*? rv:([\w.]+))?/,rdashAlpha=/-([a-z]|[0-9])/ig,rmsPrefix=/^-ms-/,fcamelCase=function(all,letter){return(letter+"").toUpperCase()
},userAgent=navigator.userAgent,browserMatch,readyList,DOMContentLoaded,toString=Object.prototype.toString,hasOwn=Object.prototype.hasOwnProperty,push=Array.prototype.push,slice=Array.prototype.slice,trim=String.prototype.trim,indexOf=Array.prototype.indexOf,class2type={};
jQuery.fn=jQuery.prototype={constructor:jQuery,init:function(selector,context,rootjQuery){var match,elem,ret,doc;
if(!selector){return this
}if(selector.nodeType){this.context=this[0]=selector;
this.length=1;
return this
}if(selector==="body"&&!context&&document.body){this.context=document;
this[0]=document.body;
this.selector=selector;
this.length=1;
return this
}if(typeof selector==="string"){if(selector.charAt(0)==="<"&&selector.charAt(selector.length-1)===">"&&selector.length>=3){match=[null,selector,null]
}else{match=quickExpr.exec(selector)
}if(match&&(match[1]||!context)){if(match[1]){context=context instanceof jQuery?context[0]:context;
doc=(context?context.ownerDocument||context:document);
ret=rsingleTag.exec(selector);
if(ret){if(jQuery.isPlainObject(context)){selector=[document.createElement(ret[1])];
jQuery.fn.attr.call(selector,context,true)
}else{selector=[doc.createElement(ret[1])]
}}else{ret=jQuery.buildFragment([match[1]],[doc]);
selector=(ret.cacheable?jQuery.clone(ret.fragment):ret.fragment).childNodes
}return jQuery.merge(this,selector)
}else{elem=document.getElementById(match[2]);
if(elem&&elem.parentNode){if(elem.id!==match[2]){return rootjQuery.find(selector)
}this.length=1;
this[0]=elem
}this.context=document;
this.selector=selector;
return this
}}else{if(!context||context.jquery){return(context||rootjQuery).find(selector)
}else{return this.constructor(context).find(selector)
}}}else{if(jQuery.isFunction(selector)){return rootjQuery.ready(selector)
}}if(selector.selector!==undefined){this.selector=selector.selector;
this.context=selector.context
}return jQuery.makeArray(selector,this)
},selector:"",jquery:"1.6.4",length:0,size:function(){return this.length
},toArray:function(){return slice.call(this,0)
},get:function(num){return num==null?this.toArray():(num<0?this[this.length+num]:this[num])
},pushStack:function(elems,name,selector){var ret=this.constructor();
if(jQuery.isArray(elems)){push.apply(ret,elems)
}else{jQuery.merge(ret,elems)
}ret.prevObject=this;
ret.context=this.context;
if(name==="find"){ret.selector=this.selector+(this.selector?" ":"")+selector
}else{if(name){ret.selector=this.selector+"."+name+"("+selector+")"
}}return ret
},each:function(callback,args){return jQuery.each(this,callback,args)
},ready:function(fn){jQuery.bindReady();
readyList.done(fn);
return this
},eq:function(i){return i===-1?this.slice(i):this.slice(i,+i+1)
},first:function(){return this.eq(0)
},last:function(){return this.eq(-1)
},slice:function(){return this.pushStack(slice.apply(this,arguments),"slice",slice.call(arguments).join(","))
},map:function(callback){return this.pushStack(jQuery.map(this,function(elem,i){return callback.call(elem,i,elem)
}))
},end:function(){return this.prevObject||this.constructor(null)
},push:push,sort:[].sort,splice:[].splice};
jQuery.fn.init.prototype=jQuery.fn;
jQuery.extend=jQuery.fn.extend=function(){var options,name,src,copy,copyIsArray,clone,target=arguments[0]||{},i=1,length=arguments.length,deep=false;
if(typeof target==="boolean"){deep=target;
target=arguments[1]||{};
i=2
}if(typeof target!=="object"&&!jQuery.isFunction(target)){target={}
}if(length===i){target=this;
--i
}for(;
i<length;
i++){if((options=arguments[i])!=null){for(name in options){src=target[name];
copy=options[name];
if(target===copy){continue
}if(deep&&copy&&(jQuery.isPlainObject(copy)||(copyIsArray=jQuery.isArray(copy)))){if(copyIsArray){copyIsArray=false;
clone=src&&jQuery.isArray(src)?src:[]
}else{clone=src&&jQuery.isPlainObject(src)?src:{}
}target[name]=jQuery.extend(deep,clone,copy)
}else{if(copy!==undefined){target[name]=copy
}}}}}return target
};
jQuery.extend({noConflict:function(deep){if(window.$===jQuery){window.$=_$
}if(deep&&window.jQuery===jQuery){window.jQuery=_jQuery
}return jQuery
},isReady:false,readyWait:1,holdReady:function(hold){if(hold){jQuery.readyWait++
}else{jQuery.ready(true)
}},ready:function(wait){if((wait===true&&!--jQuery.readyWait)||(wait!==true&&!jQuery.isReady)){if(!document.body){return setTimeout(jQuery.ready,1)
}jQuery.isReady=true;
if(wait!==true&&--jQuery.readyWait>0){return
}readyList.resolveWith(document,[jQuery]);
if(jQuery.fn.trigger){jQuery(document).trigger("ready").unbind("ready")
}}},bindReady:function(){if(readyList){return
}readyList=jQuery._Deferred();
if(document.readyState==="complete"){return setTimeout(jQuery.ready,1)
}if(document.addEventListener){document.addEventListener("DOMContentLoaded",DOMContentLoaded,false);
window.addEventListener("load",jQuery.ready,false)
}else{if(document.attachEvent){document.attachEvent("onreadystatechange",DOMContentLoaded);
window.attachEvent("onload",jQuery.ready);
var toplevel=false;
try{toplevel=window.frameElement==null
}catch(e){}if(document.documentElement.doScroll&&toplevel){doScrollCheck()
}}}},isFunction:function(obj){return jQuery.type(obj)==="function"
},isArray:Array.isArray||function(obj){return jQuery.type(obj)==="array"
},isWindow:function(obj){return obj&&typeof obj==="object"&&"setInterval" in obj
},isNaN:function(obj){return obj==null||!rdigit.test(obj)||isNaN(obj)
},type:function(obj){return obj==null?String(obj):class2type[toString.call(obj)]||"object"
},isPlainObject:function(obj){if(!obj||jQuery.type(obj)!=="object"||obj.nodeType||jQuery.isWindow(obj)){return false
}try{if(obj.constructor&&!hasOwn.call(obj,"constructor")&&!hasOwn.call(obj.constructor.prototype,"isPrototypeOf")){return false
}}catch(e){return false
}var key;
for(key in obj){}return key===undefined||hasOwn.call(obj,key)
},isEmptyObject:function(obj){for(var name in obj){return false
}return true
},error:function(msg){throw msg
},parseJSON:function(data){if(typeof data!=="string"||!data){return null
}data=jQuery.trim(data);
if(window.JSON&&window.JSON.parse){return window.JSON.parse(data)
}if(rvalidchars.test(data.replace(rvalidescape,"@").replace(rvalidtokens,"]").replace(rvalidbraces,""))){return(new Function("return "+data))()
}jQuery.error("Invalid JSON: "+data)
},parseXML:function(data){var xml,tmp;
try{if(window.DOMParser){tmp=new DOMParser();
xml=tmp.parseFromString(data,"text/xml")
}else{xml=new ActiveXObject("Microsoft.XMLDOM");
xml.async="false";
xml.loadXML(data)
}}catch(e){xml=undefined
}if(!xml||!xml.documentElement||xml.getElementsByTagName("parsererror").length){jQuery.error("Invalid XML: "+data)
}return xml
},noop:function(){},globalEval:function(data){if(data&&rnotwhite.test(data)){(window.execScript||function(data){window["eval"].call(window,data)
})(data)
}},camelCase:function(string){return string.replace(rmsPrefix,"ms-").replace(rdashAlpha,fcamelCase)
},nodeName:function(elem,name){return elem.nodeName&&elem.nodeName.toUpperCase()===name.toUpperCase()
},each:function(object,callback,args){var name,i=0,length=object.length,isObj=length===undefined||jQuery.isFunction(object);
if(args){if(isObj){for(name in object){if(callback.apply(object[name],args)===false){break
}}}else{for(;
i<length;
){if(callback.apply(object[i++],args)===false){break
}}}}else{if(isObj){for(name in object){if(callback.call(object[name],name,object[name])===false){break
}}}else{for(;
i<length;
){if(callback.call(object[i],i,object[i++])===false){break
}}}}return object
},trim:trim?function(text){return text==null?"":trim.call(text)
}:function(text){return text==null?"":text.toString().replace(trimLeft,"").replace(trimRight,"")
},makeArray:function(array,results){var ret=results||[];
if(array!=null){var type=jQuery.type(array);
if(array.length==null||type==="string"||type==="function"||type==="regexp"||jQuery.isWindow(array)){push.call(ret,array)
}else{jQuery.merge(ret,array)
}}return ret
},inArray:function(elem,array){if(!array){return -1
}if(indexOf){return indexOf.call(array,elem)
}for(var i=0,length=array.length;
i<length;
i++){if(array[i]===elem){return i
}}return -1
},merge:function(first,second){var i=first.length,j=0;
if(typeof second.length==="number"){for(var l=second.length;
j<l;
j++){first[i++]=second[j]
}}else{while(second[j]!==undefined){first[i++]=second[j++]
}}first.length=i;
return first
},grep:function(elems,callback,inv){var ret=[],retVal;
inv=!!inv;
for(var i=0,length=elems.length;
i<length;
i++){retVal=!!callback(elems[i],i);
if(inv!==retVal){ret.push(elems[i])
}}return ret
},map:function(elems,callback,arg){var value,key,ret=[],i=0,length=elems.length,isArray=elems instanceof jQuery||length!==undefined&&typeof length==="number"&&((length>0&&elems[0]&&elems[length-1])||length===0||jQuery.isArray(elems));
if(isArray){for(;
i<length;
i++){value=callback(elems[i],i,arg);
if(value!=null){ret[ret.length]=value
}}}else{for(key in elems){value=callback(elems[key],key,arg);
if(value!=null){ret[ret.length]=value
}}}return ret.concat.apply([],ret)
},guid:1,proxy:function(fn,context){if(typeof context==="string"){var tmp=fn[context];
context=fn;
fn=tmp
}if(!jQuery.isFunction(fn)){return undefined
}var args=slice.call(arguments,2),proxy=function(){return fn.apply(context,args.concat(slice.call(arguments)))
};
proxy.guid=fn.guid=fn.guid||proxy.guid||jQuery.guid++;
return proxy
},access:function(elems,key,value,exec,fn,pass){var length=elems.length;
if(typeof key==="object"){for(var k in key){jQuery.access(elems,k,key[k],exec,fn,value)
}return elems
}if(value!==undefined){exec=!pass&&exec&&jQuery.isFunction(value);
for(var i=0;
i<length;
i++){fn(elems[i],key,exec?value.call(elems[i],i,fn(elems[i],key)):value,pass)
}return elems
}return length?fn(elems[0],key):undefined
},now:function(){return(new Date()).getTime()
},uaMatch:function(ua){ua=ua.toLowerCase();
var match=rwebkit.exec(ua)||ropera.exec(ua)||rmsie.exec(ua)||ua.indexOf("compatible")<0&&rmozilla.exec(ua)||[];
return{browser:match[1]||"",version:match[2]||"0"}
},sub:function(){function jQuerySub(selector,context){return new jQuerySub.fn.init(selector,context)
}jQuery.extend(true,jQuerySub,this);
jQuerySub.superclass=this;
jQuerySub.fn=jQuerySub.prototype=this();
jQuerySub.fn.constructor=jQuerySub;
jQuerySub.sub=this.sub;
jQuerySub.fn.init=function init(selector,context){if(context&&context instanceof jQuery&&!(context instanceof jQuerySub)){context=jQuerySub(context)
}return jQuery.fn.init.call(this,selector,context,rootjQuerySub)
};
jQuerySub.fn.init.prototype=jQuerySub.fn;
var rootjQuerySub=jQuerySub(document);
return jQuerySub
},browser:{}});
jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "),function(i,name){class2type["[object "+name+"]"]=name.toLowerCase()
});
browserMatch=jQuery.uaMatch(userAgent);
if(browserMatch.browser){jQuery.browser[browserMatch.browser]=true;
jQuery.browser.version=browserMatch.version
}if(jQuery.browser.webkit){jQuery.browser.safari=true
}if(rnotwhite.test("\xA0")){trimLeft=/^[\s\xA0]+/;
trimRight=/[\s\xA0]+$/
}rootjQuery=jQuery(document);
if(document.addEventListener){DOMContentLoaded=function(){document.removeEventListener("DOMContentLoaded",DOMContentLoaded,false);
jQuery.ready()
}
}else{if(document.attachEvent){DOMContentLoaded=function(){if(document.readyState==="complete"){document.detachEvent("onreadystatechange",DOMContentLoaded);
jQuery.ready()
}}
}}function doScrollCheck(){if(jQuery.isReady){return
}try{document.documentElement.doScroll("left")
}catch(e){setTimeout(doScrollCheck,1);
return
}jQuery.ready()
}return jQuery
})();
var promiseMethods="done fail isResolved isRejected promise then always pipe".split(" "),sliceDeferred=[].slice;
jQuery.extend({_Deferred:function(){var callbacks=[],fired,firing,cancelled,deferred={done:function(){if(!cancelled){var args=arguments,i,length,elem,type,_fired;
if(fired){_fired=fired;
fired=0
}for(i=0,length=args.length;
i<length;
i++){elem=args[i];
type=jQuery.type(elem);
if(type==="array"){deferred.done.apply(deferred,elem)
}else{if(type==="function"){callbacks.push(elem)
}}}if(_fired){deferred.resolveWith(_fired[0],_fired[1])
}}return this
},resolveWith:function(context,args){if(!cancelled&&!fired&&!firing){args=args||[];
firing=1;
try{while(callbacks[0]){callbacks.shift().apply(context,args)
}}finally{fired=[context,args];
firing=0
}}return this
},resolve:function(){deferred.resolveWith(this,arguments);
return this
},isResolved:function(){return !!(firing||fired)
},cancel:function(){cancelled=1;
callbacks=[];
return this
}};
return deferred
},Deferred:function(func){var deferred=jQuery._Deferred(),failDeferred=jQuery._Deferred(),promise;
jQuery.extend(deferred,{then:function(doneCallbacks,failCallbacks){deferred.done(doneCallbacks).fail(failCallbacks);
return this
},always:function(){return deferred.done.apply(deferred,arguments).fail.apply(this,arguments)
},fail:failDeferred.done,rejectWith:failDeferred.resolveWith,reject:failDeferred.resolve,isRejected:failDeferred.isResolved,pipe:function(fnDone,fnFail){return jQuery.Deferred(function(newDefer){jQuery.each({done:[fnDone,"resolve"],fail:[fnFail,"reject"]},function(handler,data){var fn=data[0],action=data[1],returned;
if(jQuery.isFunction(fn)){deferred[handler](function(){returned=fn.apply(this,arguments);
if(returned&&jQuery.isFunction(returned.promise)){returned.promise().then(newDefer.resolve,newDefer.reject)
}else{newDefer[action+"With"](this===deferred?newDefer:this,[returned])
}})
}else{deferred[handler](newDefer[action])
}})
}).promise()
},promise:function(obj){if(obj==null){if(promise){return promise
}promise=obj={}
}var i=promiseMethods.length;
while(i--){obj[promiseMethods[i]]=deferred[promiseMethods[i]]
}return obj
}});
deferred.done(failDeferred.cancel).fail(deferred.cancel);
delete deferred.cancel;
if(func){func.call(deferred,deferred)
}return deferred
},when:function(firstParam){var args=arguments,i=0,length=args.length,count=length,deferred=length<=1&&firstParam&&jQuery.isFunction(firstParam.promise)?firstParam:jQuery.Deferred();
function resolveFunc(i){return function(value){args[i]=arguments.length>1?sliceDeferred.call(arguments,0):value;
if(!(--count)){deferred.resolveWith(deferred,sliceDeferred.call(args,0))
}}
}if(length>1){for(;
i<length;
i++){if(args[i]&&jQuery.isFunction(args[i].promise)){args[i].promise().then(resolveFunc(i),deferred.reject)
}else{--count
}}if(!count){deferred.resolveWith(deferred,args)
}}else{if(deferred!==firstParam){deferred.resolveWith(deferred,length?[firstParam]:[])
}}return deferred.promise()
}});
jQuery.support=(function(){var div=document.createElement("div"),documentElement=document.documentElement,all,a,select,opt,input,marginDiv,support,fragment,body,testElementParent,testElement,testElementStyle,tds,events,eventName,i,isSupported;
div.setAttribute("className","t");
div.innerHTML="   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>";
all=div.getElementsByTagName("*");
a=div.getElementsByTagName("a")[0];
if(!all||!all.length||!a){return{}
}select=document.createElement("select");
opt=select.appendChild(document.createElement("option"));
input=div.getElementsByTagName("input")[0];
support={leadingWhitespace:(div.firstChild.nodeType===3),tbody:!div.getElementsByTagName("tbody").length,htmlSerialize:!!div.getElementsByTagName("link").length,style:/top/.test(a.getAttribute("style")),hrefNormalized:(a.getAttribute("href")==="/a"),opacity:/^0.55$/.test(a.style.opacity),cssFloat:!!a.style.cssFloat,checkOn:(input.value==="on"),optSelected:opt.selected,getSetAttribute:div.className!=="t",submitBubbles:true,changeBubbles:true,focusinBubbles:false,deleteExpando:true,noCloneEvent:true,inlineBlockNeedsLayout:false,shrinkWrapBlocks:false,reliableMarginRight:true};
input.checked=true;
support.noCloneChecked=input.cloneNode(true).checked;
select.disabled=true;
support.optDisabled=!opt.disabled;
try{delete div.test
}catch(e){support.deleteExpando=false
}if(!div.addEventListener&&div.attachEvent&&div.fireEvent){div.attachEvent("onclick",function(){support.noCloneEvent=false
});
div.cloneNode(true).fireEvent("onclick")
}input=document.createElement("input");
input.value="t";
input.setAttribute("type","radio");
support.radioValue=input.value==="t";
input.setAttribute("checked","checked");
div.appendChild(input);
fragment=document.createDocumentFragment();
fragment.appendChild(div.firstChild);
support.checkClone=fragment.cloneNode(true).cloneNode(true).lastChild.checked;
div.innerHTML="";
div.style.width=div.style.paddingLeft="1px";
body=document.getElementsByTagName("body")[0];
testElement=document.createElement(body?"div":"body");
testElementStyle={visibility:"hidden",width:0,height:0,border:0,margin:0,background:"none"};
if(body){jQuery.extend(testElementStyle,{position:"absolute",left:"-1000px",top:"-1000px"})
}for(i in testElementStyle){testElement.style[i]=testElementStyle[i]
}testElement.appendChild(div);
testElementParent=body||documentElement;
testElementParent.insertBefore(testElement,testElementParent.firstChild);
support.appendChecked=input.checked;
support.boxModel=div.offsetWidth===2;
if("zoom" in div.style){div.style.display="inline";
div.style.zoom=1;
support.inlineBlockNeedsLayout=(div.offsetWidth===2);
div.style.display="";
div.innerHTML="<div style='width:4px;'></div>";
support.shrinkWrapBlocks=(div.offsetWidth!==2)
}div.innerHTML="<table><tr><td style='padding:0;border:0;display:none'></td><td>t</td></tr></table>";
tds=div.getElementsByTagName("td");
isSupported=(tds[0].offsetHeight===0);
tds[0].style.display="";
tds[1].style.display="none";
support.reliableHiddenOffsets=isSupported&&(tds[0].offsetHeight===0);
div.innerHTML="";
if(document.defaultView&&document.defaultView.getComputedStyle){marginDiv=document.createElement("div");
marginDiv.style.width="0";
marginDiv.style.marginRight="0";
div.appendChild(marginDiv);
support.reliableMarginRight=(parseInt((document.defaultView.getComputedStyle(marginDiv,null)||{marginRight:0}).marginRight,10)||0)===0
}testElement.innerHTML="";
testElementParent.removeChild(testElement);
if(div.attachEvent){for(i in {submit:1,change:1,focusin:1}){eventName="on"+i;
isSupported=(eventName in div);
if(!isSupported){div.setAttribute(eventName,"return;");
isSupported=(typeof div[eventName]==="function")
}support[i+"Bubbles"]=isSupported
}}testElement=fragment=select=opt=body=marginDiv=div=input=null;
return support
})();
jQuery.boxModel=jQuery.support.boxModel;
var rbrace=/^(?:\{.*\}|\[.*\])$/,rmultiDash=/([A-Z])/g;
jQuery.extend({cache:{},uuid:0,expando:"jQuery"+(jQuery.fn.jquery+Math.random()).replace(/\D/g,""),noData:{"embed":true,"object":"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000","applet":true},hasData:function(elem){elem=elem.nodeType?jQuery.cache[elem[jQuery.expando]]:elem[jQuery.expando];
return !!elem&&!isEmptyDataObject(elem)
},data:function(elem,name,data,pvt){if(!jQuery.acceptData(elem)){return
}var thisCache,ret,internalKey=jQuery.expando,getByName=typeof name==="string",isNode=elem.nodeType,cache=isNode?jQuery.cache:elem,id=isNode?elem[jQuery.expando]:elem[jQuery.expando]&&jQuery.expando;
if((!id||(pvt&&id&&(cache[id]&&!cache[id][internalKey])))&&getByName&&data===undefined){return
}if(!id){if(isNode){elem[jQuery.expando]=id=++jQuery.uuid
}else{id=jQuery.expando
}}if(!cache[id]){cache[id]={};
if(!isNode){cache[id].toJSON=jQuery.noop
}}if(typeof name==="object"||typeof name==="function"){if(pvt){cache[id][internalKey]=jQuery.extend(cache[id][internalKey],name)
}else{cache[id]=jQuery.extend(cache[id],name)
}}thisCache=cache[id];
if(pvt){if(!thisCache[internalKey]){thisCache[internalKey]={}
}thisCache=thisCache[internalKey]
}if(data!==undefined){thisCache[jQuery.camelCase(name)]=data
}if(name==="events"&&!thisCache[name]){return thisCache[internalKey]&&thisCache[internalKey].events
}if(getByName){ret=thisCache[name];
if(ret==null){ret=thisCache[jQuery.camelCase(name)]
}}else{ret=thisCache
}return ret
},removeData:function(elem,name,pvt){if(!jQuery.acceptData(elem)){return
}var thisCache,internalKey=jQuery.expando,isNode=elem.nodeType,cache=isNode?jQuery.cache:elem,id=isNode?elem[jQuery.expando]:jQuery.expando;
if(!cache[id]){return
}if(name){thisCache=pvt?cache[id][internalKey]:cache[id];
if(thisCache){if(!thisCache[name]){name=jQuery.camelCase(name)
}delete thisCache[name];
if(!isEmptyDataObject(thisCache)){return
}}}if(pvt){delete cache[id][internalKey];
if(!isEmptyDataObject(cache[id])){return
}}var internalCache=cache[id][internalKey];
if(jQuery.support.deleteExpando||!cache.setInterval){delete cache[id]
}else{cache[id]=null
}if(internalCache){cache[id]={};
if(!isNode){cache[id].toJSON=jQuery.noop
}cache[id][internalKey]=internalCache
}else{if(isNode){if(jQuery.support.deleteExpando){delete elem[jQuery.expando]
}else{if(elem.removeAttribute){elem.removeAttribute(jQuery.expando)
}else{elem[jQuery.expando]=null
}}}}},_data:function(elem,name,data){return jQuery.data(elem,name,data,true)
},acceptData:function(elem){if(elem.nodeName){var match=jQuery.noData[elem.nodeName.toLowerCase()];
if(match){return !(match===true||elem.getAttribute("classid")!==match)
}}return true
}});
jQuery.fn.extend({data:function(key,value){var data=null;
if(typeof key==="undefined"){if(this.length){data=jQuery.data(this[0]);
if(this[0].nodeType===1){var attr=this[0].attributes,name;
for(var i=0,l=attr.length;
i<l;
i++){name=attr[i].name;
if(name.indexOf("data-")===0){name=jQuery.camelCase(name.substring(5));
dataAttr(this[0],name,data[name])
}}}}return data
}else{if(typeof key==="object"){return this.each(function(){jQuery.data(this,key)
})
}}var parts=key.split(".");
parts[1]=parts[1]?"."+parts[1]:"";
if(value===undefined){data=this.triggerHandler("getData"+parts[1]+"!",[parts[0]]);
if(data===undefined&&this.length){data=jQuery.data(this[0],key);
data=dataAttr(this[0],key,data)
}return data===undefined&&parts[1]?this.data(parts[0]):data
}else{return this.each(function(){var $this=jQuery(this),args=[parts[0],value];
$this.triggerHandler("setData"+parts[1]+"!",args);
jQuery.data(this,key,value);
$this.triggerHandler("changeData"+parts[1]+"!",args)
})
}},removeData:function(key){return this.each(function(){jQuery.removeData(this,key)
})
}});
function dataAttr(elem,key,data){if(data===undefined&&elem.nodeType===1){var name="data-"+key.replace(rmultiDash,"-$1").toLowerCase();
data=elem.getAttribute(name);
if(typeof data==="string"){try{data=data==="true"?true:data==="false"?false:data==="null"?null:!jQuery.isNaN(data)?parseFloat(data):rbrace.test(data)?jQuery.parseJSON(data):data
}catch(e){}jQuery.data(elem,key,data)
}else{data=undefined
}}return data
}function isEmptyDataObject(obj){for(var name in obj){if(name!=="toJSON"){return false
}}return true
}function handleQueueMarkDefer(elem,type,src){var deferDataKey=type+"defer",queueDataKey=type+"queue",markDataKey=type+"mark",defer=jQuery.data(elem,deferDataKey,undefined,true);
if(defer&&(src==="queue"||!jQuery.data(elem,queueDataKey,undefined,true))&&(src==="mark"||!jQuery.data(elem,markDataKey,undefined,true))){setTimeout(function(){if(!jQuery.data(elem,queueDataKey,undefined,true)&&!jQuery.data(elem,markDataKey,undefined,true)){jQuery.removeData(elem,deferDataKey,true);
defer.resolve()
}},0)
}}jQuery.extend({_mark:function(elem,type){if(elem){type=(type||"fx")+"mark";
jQuery.data(elem,type,(jQuery.data(elem,type,undefined,true)||0)+1,true)
}},_unmark:function(force,elem,type){if(force!==true){type=elem;
elem=force;
force=false
}if(elem){type=type||"fx";
var key=type+"mark",count=force?0:((jQuery.data(elem,key,undefined,true)||1)-1);
if(count){jQuery.data(elem,key,count,true)
}else{jQuery.removeData(elem,key,true);
handleQueueMarkDefer(elem,type,"mark")
}}},queue:function(elem,type,data){if(elem){type=(type||"fx")+"queue";
var q=jQuery.data(elem,type,undefined,true);
if(data){if(!q||jQuery.isArray(data)){q=jQuery.data(elem,type,jQuery.makeArray(data),true)
}else{q.push(data)
}}return q||[]
}},dequeue:function(elem,type){type=type||"fx";
var queue=jQuery.queue(elem,type),fn=queue.shift(),defer;
if(fn==="inprogress"){fn=queue.shift()
}if(fn){if(type==="fx"){queue.unshift("inprogress")
}fn.call(elem,function(){jQuery.dequeue(elem,type)
})
}if(!queue.length){jQuery.removeData(elem,type+"queue",true);
handleQueueMarkDefer(elem,type,"queue")
}}});
jQuery.fn.extend({queue:function(type,data){if(typeof type!=="string"){data=type;
type="fx"
}if(data===undefined){return jQuery.queue(this[0],type)
}return this.each(function(){var queue=jQuery.queue(this,type,data);
if(type==="fx"&&queue[0]!=="inprogress"){jQuery.dequeue(this,type)
}})
},dequeue:function(type){return this.each(function(){jQuery.dequeue(this,type)
})
},delay:function(time,type){time=jQuery.fx?jQuery.fx.speeds[time]||time:time;
type=type||"fx";
return this.queue(type,function(){var elem=this;
setTimeout(function(){jQuery.dequeue(elem,type)
},time)
})
},clearQueue:function(type){return this.queue(type||"fx",[])
},promise:function(type,object){if(typeof type!=="string"){object=type;
type=undefined
}type=type||"fx";
var defer=jQuery.Deferred(),elements=this,i=elements.length,count=1,deferDataKey=type+"defer",queueDataKey=type+"queue",markDataKey=type+"mark",tmp;
function resolve(){if(!(--count)){defer.resolveWith(elements,[elements])
}}while(i--){if((tmp=jQuery.data(elements[i],deferDataKey,undefined,true)||(jQuery.data(elements[i],queueDataKey,undefined,true)||jQuery.data(elements[i],markDataKey,undefined,true))&&jQuery.data(elements[i],deferDataKey,jQuery._Deferred(),true))){count++;
tmp.done(resolve)
}}resolve();
return defer.promise()
}});
var rclass=/[\n\t\r]/g,rspace=/\s+/,rreturn=/\r/g,rtype=/^(?:button|input)$/i,rfocusable=/^(?:button|input|object|select|textarea)$/i,rclickable=/^a(?:rea)?$/i,rboolean=/^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,nodeHook,boolHook;
jQuery.fn.extend({attr:function(name,value){return jQuery.access(this,name,value,true,jQuery.attr)
},removeAttr:function(name){return this.each(function(){jQuery.removeAttr(this,name)
})
},prop:function(name,value){return jQuery.access(this,name,value,true,jQuery.prop)
},removeProp:function(name){name=jQuery.propFix[name]||name;
return this.each(function(){try{this[name]=undefined;
delete this[name]
}catch(e){}})
},addClass:function(value){var classNames,i,l,elem,setClass,c,cl;
if(jQuery.isFunction(value)){return this.each(function(j){jQuery(this).addClass(value.call(this,j,this.className))
})
}if(value&&typeof value==="string"){classNames=value.split(rspace);
for(i=0,l=this.length;
i<l;
i++){elem=this[i];
if(elem.nodeType===1){if(!elem.className&&classNames.length===1){elem.className=value
}else{setClass=" "+elem.className+" ";
for(c=0,cl=classNames.length;
c<cl;
c++){if(!~setClass.indexOf(" "+classNames[c]+" ")){setClass+=classNames[c]+" "
}}elem.className=jQuery.trim(setClass)
}}}}return this
},removeClass:function(value){var classNames,i,l,elem,className,c,cl;
if(jQuery.isFunction(value)){return this.each(function(j){jQuery(this).removeClass(value.call(this,j,this.className))
})
}if((value&&typeof value==="string")||value===undefined){classNames=(value||"").split(rspace);
for(i=0,l=this.length;
i<l;
i++){elem=this[i];
if(elem.nodeType===1&&elem.className){if(value){className=(" "+elem.className+" ").replace(rclass," ");
for(c=0,cl=classNames.length;
c<cl;
c++){className=className.replace(" "+classNames[c]+" "," ")
}elem.className=jQuery.trim(className)
}else{elem.className=""
}}}}return this
},toggleClass:function(value,stateVal){var type=typeof value,isBool=typeof stateVal==="boolean";
if(jQuery.isFunction(value)){return this.each(function(i){jQuery(this).toggleClass(value.call(this,i,this.className,stateVal),stateVal)
})
}return this.each(function(){if(type==="string"){var className,i=0,self=jQuery(this),state=stateVal,classNames=value.split(rspace);
while((className=classNames[i++])){state=isBool?state:!self.hasClass(className);
self[state?"addClass":"removeClass"](className)
}}else{if(type==="undefined"||type==="boolean"){if(this.className){jQuery._data(this,"__className__",this.className)
}this.className=this.className||value===false?"":jQuery._data(this,"__className__")||""
}}})
},hasClass:function(selector){var className=" "+selector+" ";
for(var i=0,l=this.length;
i<l;
i++){if(this[i].nodeType===1&&(" "+this[i].className+" ").replace(rclass," ").indexOf(className)>-1){return true
}}return false
},val:function(value){var hooks,ret,elem=this[0];
if(!arguments.length){if(elem){hooks=jQuery.valHooks[elem.nodeName.toLowerCase()]||jQuery.valHooks[elem.type];
if(hooks&&"get" in hooks&&(ret=hooks.get(elem,"value"))!==undefined){return ret
}ret=elem.value;
return typeof ret==="string"?ret.replace(rreturn,""):ret==null?"":ret
}return undefined
}var isFunction=jQuery.isFunction(value);
return this.each(function(i){var self=jQuery(this),val;
if(this.nodeType!==1){return
}if(isFunction){val=value.call(this,i,self.val())
}else{val=value
}if(val==null){val=""
}else{if(typeof val==="number"){val+=""
}else{if(jQuery.isArray(val)){val=jQuery.map(val,function(value){return value==null?"":value+""
})
}}}hooks=jQuery.valHooks[this.nodeName.toLowerCase()]||jQuery.valHooks[this.type];
if(!hooks||!("set" in hooks)||hooks.set(this,val,"value")===undefined){this.value=val
}})
}});
jQuery.extend({valHooks:{option:{get:function(elem){var val=elem.attributes.value;
return !val||val.specified?elem.value:elem.text
}},select:{get:function(elem){var value,index=elem.selectedIndex,values=[],options=elem.options,one=elem.type==="select-one";
if(index<0){return null
}for(var i=one?index:0,max=one?index+1:options.length;
i<max;
i++){var option=options[i];
if(option.selected&&(jQuery.support.optDisabled?!option.disabled:option.getAttribute("disabled")===null)&&(!option.parentNode.disabled||!jQuery.nodeName(option.parentNode,"optgroup"))){value=jQuery(option).val();
if(one){return value
}values.push(value)
}}if(one&&!values.length&&options.length){return jQuery(options[index]).val()
}return values
},set:function(elem,value){var values=jQuery.makeArray(value);
jQuery(elem).find("option").each(function(){this.selected=jQuery.inArray(jQuery(this).val(),values)>=0
});
if(!values.length){elem.selectedIndex=-1
}return values
}}},attrFn:{val:true,css:true,html:true,text:true,data:true,width:true,height:true,offset:true},attrFix:{tabindex:"tabIndex"},attr:function(elem,name,value,pass){var nType=elem.nodeType;
if(!elem||nType===3||nType===8||nType===2){return undefined
}if(pass&&name in jQuery.attrFn){return jQuery(elem)[name](value)
}if(!("getAttribute" in elem)){return jQuery.prop(elem,name,value)
}var ret,hooks,notxml=nType!==1||!jQuery.isXMLDoc(elem);
if(notxml){name=jQuery.attrFix[name]||name;
hooks=jQuery.attrHooks[name];
if(!hooks){if(rboolean.test(name)){hooks=boolHook
}else{if(nodeHook){hooks=nodeHook
}}}}if(value!==undefined){if(value===null){jQuery.removeAttr(elem,name);
return undefined
}else{if(hooks&&"set" in hooks&&notxml&&(ret=hooks.set(elem,value,name))!==undefined){return ret
}else{elem.setAttribute(name,""+value);
return value
}}}else{if(hooks&&"get" in hooks&&notxml&&(ret=hooks.get(elem,name))!==null){return ret
}else{ret=elem.getAttribute(name);
return ret===null?undefined:ret
}}},removeAttr:function(elem,name){var propName;
if(elem.nodeType===1){name=jQuery.attrFix[name]||name;
jQuery.attr(elem,name,"");
elem.removeAttribute(name);
if(rboolean.test(name)&&(propName=jQuery.propFix[name]||name) in elem){elem[propName]=false
}}},attrHooks:{type:{set:function(elem,value){if(rtype.test(elem.nodeName)&&elem.parentNode){jQuery.error("type property can't be changed")
}else{if(!jQuery.support.radioValue&&value==="radio"&&jQuery.nodeName(elem,"input")){var val=elem.value;
elem.setAttribute("type",value);
if(val){elem.value=val
}return value
}}}},value:{get:function(elem,name){if(nodeHook&&jQuery.nodeName(elem,"button")){return nodeHook.get(elem,name)
}return name in elem?elem.value:null
},set:function(elem,value,name){if(nodeHook&&jQuery.nodeName(elem,"button")){return nodeHook.set(elem,value,name)
}elem.value=value
}}},propFix:{tabindex:"tabIndex",readonly:"readOnly","for":"htmlFor","class":"className",maxlength:"maxLength",cellspacing:"cellSpacing",cellpadding:"cellPadding",rowspan:"rowSpan",colspan:"colSpan",usemap:"useMap",frameborder:"frameBorder",contenteditable:"contentEditable"},prop:function(elem,name,value){var nType=elem.nodeType;
if(!elem||nType===3||nType===8||nType===2){return undefined
}var ret,hooks,notxml=nType!==1||!jQuery.isXMLDoc(elem);
if(notxml){name=jQuery.propFix[name]||name;
hooks=jQuery.propHooks[name]
}if(value!==undefined){if(hooks&&"set" in hooks&&(ret=hooks.set(elem,value,name))!==undefined){return ret
}else{return(elem[name]=value)
}}else{if(hooks&&"get" in hooks&&(ret=hooks.get(elem,name))!==null){return ret
}else{return elem[name]
}}},propHooks:{tabIndex:{get:function(elem){var attributeNode=elem.getAttributeNode("tabindex");
return attributeNode&&attributeNode.specified?parseInt(attributeNode.value,10):rfocusable.test(elem.nodeName)||rclickable.test(elem.nodeName)&&elem.href?0:undefined
}}}});
jQuery.attrHooks.tabIndex=jQuery.propHooks.tabIndex;
boolHook={get:function(elem,name){var attrNode;
return jQuery.prop(elem,name)===true||(attrNode=elem.getAttributeNode(name))&&attrNode.nodeValue!==false?name.toLowerCase():undefined
},set:function(elem,value,name){var propName;
if(value===false){jQuery.removeAttr(elem,name)
}else{propName=jQuery.propFix[name]||name;
if(propName in elem){elem[propName]=true
}elem.setAttribute(name,name.toLowerCase())
}return name
}};
if(!jQuery.support.getSetAttribute){nodeHook=jQuery.valHooks.button={get:function(elem,name){var ret;
ret=elem.getAttributeNode(name);
return ret&&ret.nodeValue!==""?ret.nodeValue:undefined
},set:function(elem,value,name){var ret=elem.getAttributeNode(name);
if(!ret){ret=document.createAttribute(name);
elem.setAttributeNode(ret)
}return(ret.nodeValue=value+"")
}};
jQuery.each(["width","height"],function(i,name){jQuery.attrHooks[name]=jQuery.extend(jQuery.attrHooks[name],{set:function(elem,value){if(value===""){elem.setAttribute(name,"auto");
return value
}}})
})
}if(!jQuery.support.hrefNormalized){jQuery.each(["href","src","width","height"],function(i,name){jQuery.attrHooks[name]=jQuery.extend(jQuery.attrHooks[name],{get:function(elem){var ret=elem.getAttribute(name,2);
return ret===null?undefined:ret
}})
})
}if(!jQuery.support.style){jQuery.attrHooks.style={get:function(elem){return elem.style.cssText.toLowerCase()||undefined
},set:function(elem,value){return(elem.style.cssText=""+value)
}}
}if(!jQuery.support.optSelected){jQuery.propHooks.selected=jQuery.extend(jQuery.propHooks.selected,{get:function(elem){var parent=elem.parentNode;
if(parent){parent.selectedIndex;
if(parent.parentNode){parent.parentNode.selectedIndex
}}return null
}})
}if(!jQuery.support.checkOn){jQuery.each(["radio","checkbox"],function(){jQuery.valHooks[this]={get:function(elem){return elem.getAttribute("value")===null?"on":elem.value
}}
})
}jQuery.each(["radio","checkbox"],function(){jQuery.valHooks[this]=jQuery.extend(jQuery.valHooks[this],{set:function(elem,value){if(jQuery.isArray(value)){return(elem.checked=jQuery.inArray(jQuery(elem).val(),value)>=0)
}}})
});
var rnamespaces=/\.(.*)$/,rformElems=/^(?:textarea|input|select)$/i,rperiod=/\./g,rspaces=/ /g,rescape=/[^\w\s.|`]/g,fcleanup=function(nm){return nm.replace(rescape,"\\$&")
};
jQuery.event={add:function(elem,types,handler,data){if(elem.nodeType===3||elem.nodeType===8){return
}if(handler===false){handler=returnFalse
}else{if(!handler){return
}}var handleObjIn,handleObj;
if(handler.handler){handleObjIn=handler;
handler=handleObjIn.handler
}if(!handler.guid){handler.guid=jQuery.guid++
}var elemData=jQuery._data(elem);
if(!elemData){return
}var events=elemData.events,eventHandle=elemData.handle;
if(!events){elemData.events=events={}
}if(!eventHandle){elemData.handle=eventHandle=function(e){return typeof jQuery!=="undefined"&&(!e||jQuery.event.triggered!==e.type)?jQuery.event.handle.apply(eventHandle.elem,arguments):undefined
}
}eventHandle.elem=elem;
types=types.split(" ");
var type,i=0,namespaces;
while((type=types[i++])){handleObj=handleObjIn?jQuery.extend({},handleObjIn):{handler:handler,data:data};
if(type.indexOf(".")>-1){namespaces=type.split(".");
type=namespaces.shift();
handleObj.namespace=namespaces.slice(0).sort().join(".")
}else{namespaces=[];
handleObj.namespace=""
}handleObj.type=type;
if(!handleObj.guid){handleObj.guid=handler.guid
}var handlers=events[type],special=jQuery.event.special[type]||{};
if(!handlers){handlers=events[type]=[];
if(!special.setup||special.setup.call(elem,data,namespaces,eventHandle)===false){if(elem.addEventListener){elem.addEventListener(type,eventHandle,false)
}else{if(elem.attachEvent){elem.attachEvent("on"+type,eventHandle)
}}}}if(special.add){special.add.call(elem,handleObj);
if(!handleObj.handler.guid){handleObj.handler.guid=handler.guid
}}handlers.push(handleObj);
jQuery.event.global[type]=true
}elem=null
},global:{},remove:function(elem,types,handler,pos){if(elem.nodeType===3||elem.nodeType===8){return
}if(handler===false){handler=returnFalse
}var ret,type,fn,j,i=0,all,namespaces,namespace,special,eventType,handleObj,origType,elemData=jQuery.hasData(elem)&&jQuery._data(elem),events=elemData&&elemData.events;
if(!elemData||!events){return
}if(types&&types.type){handler=types.handler;
types=types.type
}if(!types||typeof types==="string"&&types.charAt(0)==="."){types=types||"";
for(type in events){jQuery.event.remove(elem,type+types)
}return
}types=types.split(" ");
while((type=types[i++])){origType=type;
handleObj=null;
all=type.indexOf(".")<0;
namespaces=[];
if(!all){namespaces=type.split(".");
type=namespaces.shift();
namespace=new RegExp("(^|\\.)"+jQuery.map(namespaces.slice(0).sort(),fcleanup).join("\\.(?:.*\\.)?")+"(\\.|$)")
}eventType=events[type];
if(!eventType){continue
}if(!handler){for(j=0;
j<eventType.length;
j++){handleObj=eventType[j];
if(all||namespace.test(handleObj.namespace)){jQuery.event.remove(elem,origType,handleObj.handler,j);
eventType.splice(j--,1)
}}continue
}special=jQuery.event.special[type]||{};
for(j=pos||0;
j<eventType.length;
j++){handleObj=eventType[j];
if(handler.guid===handleObj.guid){if(all||namespace.test(handleObj.namespace)){if(pos==null){eventType.splice(j--,1)
}if(special.remove){special.remove.call(elem,handleObj)
}}if(pos!=null){break
}}}if(eventType.length===0||pos!=null&&eventType.length===1){if(!special.teardown||special.teardown.call(elem,namespaces)===false){jQuery.removeEvent(elem,type,elemData.handle)
}ret=null;
delete events[type]
}}if(jQuery.isEmptyObject(events)){var handle=elemData.handle;
if(handle){handle.elem=null
}delete elemData.events;
delete elemData.handle;
if(jQuery.isEmptyObject(elemData)){jQuery.removeData(elem,undefined,true)
}}},customEvent:{"getData":true,"setData":true,"changeData":true},trigger:function(event,data,elem,onlyHandlers){var type=event.type||event,namespaces=[],exclusive;
if(type.indexOf("!")>=0){type=type.slice(0,-1);
exclusive=true
}if(type.indexOf(".")>=0){namespaces=type.split(".");
type=namespaces.shift();
namespaces.sort()
}if((!elem||jQuery.event.customEvent[type])&&!jQuery.event.global[type]){return
}event=typeof event==="object"?event[jQuery.expando]?event:new jQuery.Event(type,event):new jQuery.Event(type);
event.type=type;
event.exclusive=exclusive;
event.namespace=namespaces.join(".");
event.namespace_re=new RegExp("(^|\\.)"+namespaces.join("\\.(?:.*\\.)?")+"(\\.|$)");
if(onlyHandlers||!elem){event.preventDefault();
event.stopPropagation()
}if(!elem){jQuery.each(jQuery.cache,function(){var internalKey=jQuery.expando,internalCache=this[internalKey];
if(internalCache&&internalCache.events&&internalCache.events[type]){jQuery.event.trigger(event,data,internalCache.handle.elem)
}});
return
}if(elem.nodeType===3||elem.nodeType===8){return
}event.result=undefined;
event.target=elem;
data=data!=null?jQuery.makeArray(data):[];
data.unshift(event);
var cur=elem,ontype=type.indexOf(":")<0?"on"+type:"";
do{var handle=jQuery._data(cur,"handle");
event.currentTarget=cur;
if(handle){handle.apply(cur,data)
}if(ontype&&jQuery.acceptData(cur)&&cur[ontype]&&cur[ontype].apply(cur,data)===false){event.result=false;
event.preventDefault()
}cur=cur.parentNode||cur.ownerDocument||cur===event.target.ownerDocument&&window
}while(cur&&!event.isPropagationStopped());
if(!event.isDefaultPrevented()){var old,special=jQuery.event.special[type]||{};
if((!special._default||special._default.call(elem.ownerDocument,event)===false)&&!(type==="click"&&jQuery.nodeName(elem,"a"))&&jQuery.acceptData(elem)){try{if(ontype&&elem[type]){old=elem[ontype];
if(old){elem[ontype]=null
}jQuery.event.triggered=type;
elem[type]()
}}catch(ieError){}if(old){elem[ontype]=old
}jQuery.event.triggered=undefined
}}return event.result
},handle:function(event){event=jQuery.event.fix(event||window.event);
var handlers=((jQuery._data(this,"events")||{})[event.type]||[]).slice(0),run_all=!event.exclusive&&!event.namespace,args=Array.prototype.slice.call(arguments,0);
args[0]=event;
event.currentTarget=this;
for(var j=0,l=handlers.length;
j<l;
j++){var handleObj=handlers[j];
if(run_all||event.namespace_re.test(handleObj.namespace)){event.handler=handleObj.handler;
event.data=handleObj.data;
event.handleObj=handleObj;
var ret=handleObj.handler.apply(this,args);
if(ret!==undefined){event.result=ret;
if(ret===false){event.preventDefault();
event.stopPropagation()
}}if(event.isImmediatePropagationStopped()){break
}}}return event.result
},props:"altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),fix:function(event){if(event[jQuery.expando]){return event
}var originalEvent=event;
event=jQuery.Event(originalEvent);
for(var i=this.props.length,prop;
i;
){prop=this.props[--i];
event[prop]=originalEvent[prop]
}if(!event.target){event.target=event.srcElement||document
}if(event.target.nodeType===3){event.target=event.target.parentNode
}if(!event.relatedTarget&&event.fromElement){event.relatedTarget=event.fromElement===event.target?event.toElement:event.fromElement
}if(event.pageX==null&&event.clientX!=null){var eventDocument=event.target.ownerDocument||document,doc=eventDocument.documentElement,body=eventDocument.body;
event.pageX=event.clientX+(doc&&doc.scrollLeft||body&&body.scrollLeft||0)-(doc&&doc.clientLeft||body&&body.clientLeft||0);
event.pageY=event.clientY+(doc&&doc.scrollTop||body&&body.scrollTop||0)-(doc&&doc.clientTop||body&&body.clientTop||0)
}if(event.which==null&&(event.charCode!=null||event.keyCode!=null)){event.which=event.charCode!=null?event.charCode:event.keyCode
}if(!event.metaKey&&event.ctrlKey){event.metaKey=event.ctrlKey
}if(!event.which&&event.button!==undefined){event.which=(event.button&1?1:(event.button&2?3:(event.button&4?2:0)))
}return event
},guid:100000000,proxy:jQuery.proxy,special:{ready:{setup:jQuery.bindReady,teardown:jQuery.noop},live:{add:function(handleObj){jQuery.event.add(this,liveConvert(handleObj.origType,handleObj.selector),jQuery.extend({},handleObj,{handler:liveHandler,guid:handleObj.handler.guid}))
},remove:function(handleObj){jQuery.event.remove(this,liveConvert(handleObj.origType,handleObj.selector),handleObj)
}},beforeunload:{setup:function(data,namespaces,eventHandle){if(jQuery.isWindow(this)){this.onbeforeunload=eventHandle
}},teardown:function(namespaces,eventHandle){if(this.onbeforeunload===eventHandle){this.onbeforeunload=null
}}}}};
jQuery.removeEvent=document.removeEventListener?function(elem,type,handle){if(elem.removeEventListener){elem.removeEventListener(type,handle,false)
}}:function(elem,type,handle){if(elem.detachEvent){elem.detachEvent("on"+type,handle)
}};
jQuery.Event=function(src,props){if(!this.preventDefault){return new jQuery.Event(src,props)
}if(src&&src.type){this.originalEvent=src;
this.type=src.type;
this.isDefaultPrevented=(src.defaultPrevented||src.returnValue===false||src.getPreventDefault&&src.getPreventDefault())?returnTrue:returnFalse
}else{this.type=src
}if(props){jQuery.extend(this,props)
}this.timeStamp=jQuery.now();
this[jQuery.expando]=true
};
function returnFalse(){return false
}function returnTrue(){return true
}jQuery.Event.prototype={preventDefault:function(){this.isDefaultPrevented=returnTrue;
var e=this.originalEvent;
if(!e){return
}if(e.preventDefault){e.preventDefault()
}else{e.returnValue=false
}},stopPropagation:function(){this.isPropagationStopped=returnTrue;
var e=this.originalEvent;
if(!e){return
}if(e.stopPropagation){e.stopPropagation()
}e.cancelBubble=true
},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=returnTrue;
this.stopPropagation()
},isDefaultPrevented:returnFalse,isPropagationStopped:returnFalse,isImmediatePropagationStopped:returnFalse};
var withinElement=function(event){var related=event.relatedTarget,inside=false,eventType=event.type;
event.type=event.data;
if(related!==this){if(related){inside=jQuery.contains(this,related)
}if(!inside){jQuery.event.handle.apply(this,arguments);
event.type=eventType
}}},delegate=function(event){event.type=event.data;
jQuery.event.handle.apply(this,arguments)
};
jQuery.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(orig,fix){jQuery.event.special[orig]={setup:function(data){jQuery.event.add(this,fix,data&&data.selector?delegate:withinElement,orig)
},teardown:function(data){jQuery.event.remove(this,fix,data&&data.selector?delegate:withinElement)
}}
});
if(!jQuery.support.submitBubbles){jQuery.event.special.submit={setup:function(data,namespaces){if(!jQuery.nodeName(this,"form")){jQuery.event.add(this,"click.specialSubmit",function(e){var elem=e.target,type=jQuery.nodeName(elem,"input")||jQuery.nodeName(elem,"button")?elem.type:"";
if((type==="submit"||type==="image")&&jQuery(elem).closest("form").length){trigger("submit",this,arguments)
}});
jQuery.event.add(this,"keypress.specialSubmit",function(e){var elem=e.target,type=jQuery.nodeName(elem,"input")||jQuery.nodeName(elem,"button")?elem.type:"";
if((type==="text"||type==="password")&&jQuery(elem).closest("form").length&&e.keyCode===13){trigger("submit",this,arguments)
}})
}else{return false
}},teardown:function(namespaces){jQuery.event.remove(this,".specialSubmit")
}}
}if(!jQuery.support.changeBubbles){var changeFilters,getVal=function(elem){var type=jQuery.nodeName(elem,"input")?elem.type:"",val=elem.value;
if(type==="radio"||type==="checkbox"){val=elem.checked
}else{if(type==="select-multiple"){val=elem.selectedIndex>-1?jQuery.map(elem.options,function(elem){return elem.selected
}).join("-"):""
}else{if(jQuery.nodeName(elem,"select")){val=elem.selectedIndex
}}}return val
},testChange=function testChange(e){var elem=e.target,data,val;
if(!rformElems.test(elem.nodeName)||elem.readOnly){return
}data=jQuery._data(elem,"_change_data");
val=getVal(elem);
if(e.type!=="focusout"||elem.type!=="radio"){jQuery._data(elem,"_change_data",val)
}if(data===undefined||val===data){return
}if(data!=null||val){e.type="change";
e.liveFired=undefined;
jQuery.event.trigger(e,arguments[1],elem)
}};
jQuery.event.special.change={filters:{focusout:testChange,beforedeactivate:testChange,click:function(e){var elem=e.target,type=jQuery.nodeName(elem,"input")?elem.type:"";
if(type==="radio"||type==="checkbox"||jQuery.nodeName(elem,"select")){testChange.call(this,e)
}},keydown:function(e){var elem=e.target,type=jQuery.nodeName(elem,"input")?elem.type:"";
if((e.keyCode===13&&!jQuery.nodeName(elem,"textarea"))||(e.keyCode===32&&(type==="checkbox"||type==="radio"))||type==="select-multiple"){testChange.call(this,e)
}},beforeactivate:function(e){var elem=e.target;
jQuery._data(elem,"_change_data",getVal(elem))
}},setup:function(data,namespaces){if(this.type==="file"){return false
}for(var type in changeFilters){jQuery.event.add(this,type+".specialChange",changeFilters[type])
}return rformElems.test(this.nodeName)
},teardown:function(namespaces){jQuery.event.remove(this,".specialChange");
return rformElems.test(this.nodeName)
}};
changeFilters=jQuery.event.special.change.filters;
changeFilters.focus=changeFilters.beforeactivate
}function trigger(type,elem,args){var event=jQuery.extend({},args[0]);
event.type=type;
event.originalEvent={};
event.liveFired=undefined;
jQuery.event.handle.call(elem,event);
if(event.isDefaultPrevented()){args[0].preventDefault()
}}if(!jQuery.support.focusinBubbles){jQuery.each({focus:"focusin",blur:"focusout"},function(orig,fix){var attaches=0;
jQuery.event.special[fix]={setup:function(){if(attaches++===0){document.addEventListener(orig,handler,true)
}},teardown:function(){if(--attaches===0){document.removeEventListener(orig,handler,true)
}}};
function handler(donor){var e=jQuery.event.fix(donor);
e.type=fix;
e.originalEvent={};
jQuery.event.trigger(e,null,e.target);
if(e.isDefaultPrevented()){donor.preventDefault()
}}})
}jQuery.each(["bind","one"],function(i,name){jQuery.fn[name]=function(type,data,fn){var handler;
if(typeof type==="object"){for(var key in type){this[name](key,data,type[key],fn)
}return this
}if(arguments.length===2||data===false){fn=data;
data=undefined
}if(name==="one"){handler=function(event){jQuery(this).unbind(event,handler);
return fn.apply(this,arguments)
};
handler.guid=fn.guid||jQuery.guid++
}else{handler=fn
}if(type==="unload"&&name!=="one"){this.one(type,data,fn)
}else{for(var i=0,l=this.length;
i<l;
i++){jQuery.event.add(this[i],type,handler,data)
}}return this
}
});
jQuery.fn.extend({unbind:function(type,fn){if(typeof type==="object"&&!type.preventDefault){for(var key in type){this.unbind(key,type[key])
}}else{for(var i=0,l=this.length;
i<l;
i++){jQuery.event.remove(this[i],type,fn)
}}return this
},delegate:function(selector,types,data,fn){return this.live(types,data,fn,selector)
},undelegate:function(selector,types,fn){if(arguments.length===0){return this.unbind("live")
}else{return this.die(types,null,fn,selector)
}},trigger:function(type,data){return this.each(function(){jQuery.event.trigger(type,data,this)
})
},triggerHandler:function(type,data){if(this[0]){return jQuery.event.trigger(type,data,this[0],true)
}},toggle:function(fn){var args=arguments,guid=fn.guid||jQuery.guid++,i=0,toggler=function(event){var lastToggle=(jQuery.data(this,"lastToggle"+fn.guid)||0)%i;
jQuery.data(this,"lastToggle"+fn.guid,lastToggle+1);
event.preventDefault();
return args[lastToggle].apply(this,arguments)||false
};
toggler.guid=guid;
while(i<args.length){args[i++].guid=guid
}return this.click(toggler)
},hover:function(fnOver,fnOut){return this.mouseenter(fnOver).mouseleave(fnOut||fnOver)
}});
var liveMap={focus:"focusin",blur:"focusout",mouseenter:"mouseover",mouseleave:"mouseout"};
jQuery.each(["live","die"],function(i,name){jQuery.fn[name]=function(types,data,fn,origSelector){var type,i=0,match,namespaces,preType,selector=origSelector||this.selector,context=origSelector?this:jQuery(this.context);
if(typeof types==="object"&&!types.preventDefault){for(var key in types){context[name](key,data,types[key],selector)
}return this
}if(name==="die"&&!types&&origSelector&&origSelector.charAt(0)==="."){context.unbind(origSelector);
return this
}if(data===false||jQuery.isFunction(data)){fn=data||returnFalse;
data=undefined
}types=(types||"").split(" ");
while((type=types[i++])!=null){match=rnamespaces.exec(type);
namespaces="";
if(match){namespaces=match[0];
type=type.replace(rnamespaces,"")
}if(type==="hover"){types.push("mouseenter"+namespaces,"mouseleave"+namespaces);
continue
}preType=type;
if(liveMap[type]){types.push(liveMap[type]+namespaces);
type=type+namespaces
}else{type=(liveMap[type]||type)+namespaces
}if(name==="live"){for(var j=0,l=context.length;
j<l;
j++){jQuery.event.add(context[j],"live."+liveConvert(type,selector),{data:data,selector:selector,handler:fn,origType:type,origHandler:fn,preType:preType})
}}else{context.unbind("live."+liveConvert(type,selector),fn)
}}return this
}
});
function liveHandler(event){var stop,maxLevel,related,match,handleObj,elem,j,i,l,data,close,namespace,ret,elems=[],selectors=[],events=jQuery._data(this,"events");
if(event.liveFired===this||!events||!events.live||event.target.disabled||event.button&&event.type==="click"){return
}if(event.namespace){namespace=new RegExp("(^|\\.)"+event.namespace.split(".").join("\\.(?:.*\\.)?")+"(\\.|$)")
}event.liveFired=this;
var live=events.live.slice(0);
for(j=0;
j<live.length;
j++){handleObj=live[j];
if(handleObj.origType.replace(rnamespaces,"")===event.type){selectors.push(handleObj.selector)
}else{live.splice(j--,1)
}}match=jQuery(event.target).closest(selectors,event.currentTarget);
for(i=0,l=match.length;
i<l;
i++){close=match[i];
for(j=0;
j<live.length;
j++){handleObj=live[j];
if(close.selector===handleObj.selector&&(!namespace||namespace.test(handleObj.namespace))&&!close.elem.disabled){elem=close.elem;
related=null;
if(handleObj.preType==="mouseenter"||handleObj.preType==="mouseleave"){event.type=handleObj.preType;
related=jQuery(event.relatedTarget).closest(handleObj.selector)[0];
if(related&&jQuery.contains(elem,related)){related=elem
}}if(!related||related!==elem){elems.push({elem:elem,handleObj:handleObj,level:close.level})
}}}}for(i=0,l=elems.length;
i<l;
i++){match=elems[i];
if(maxLevel&&match.level>maxLevel){break
}event.currentTarget=match.elem;
event.data=match.handleObj.data;
event.handleObj=match.handleObj;
ret=match.handleObj.origHandler.apply(match.elem,arguments);
if(ret===false||event.isPropagationStopped()){maxLevel=match.level;
if(ret===false){stop=false
}if(event.isImmediatePropagationStopped()){break
}}}return stop
}function liveConvert(type,selector){return(type&&type!=="*"?type+".":"")+selector.replace(rperiod,"`").replace(rspaces,"&")
}jQuery.each(("blur focus focusin focusout load resize scroll unload click dblclick "+"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave "+"change select submit keydown keypress keyup error").split(" "),function(i,name){jQuery.fn[name]=function(data,fn){if(fn==null){fn=data;
data=null
}return arguments.length>0?this.bind(name,data,fn):this.trigger(name)
};
if(jQuery.attrFn){jQuery.attrFn[name]=true
}});
/*!
 * Sizzle CSS Selector Engine
 *  Copyright 2011, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){var chunker=/((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,done=0,toString=Object.prototype.toString,hasDuplicate=false,baseHasDuplicate=true,rBackslash=/\\/g,rNonWord=/\W/;
[0,0].sort(function(){baseHasDuplicate=false;
return 0
});
var Sizzle=function(selector,context,results,seed){results=results||[];
context=context||document;
var origContext=context;
if(context.nodeType!==1&&context.nodeType!==9){return[]
}if(!selector||typeof selector!=="string"){return results
}var m,set,checkSet,extra,ret,cur,pop,i,prune=true,contextXML=Sizzle.isXML(context),parts=[],soFar=selector;
do{chunker.exec("");
m=chunker.exec(soFar);
if(m){soFar=m[3];
parts.push(m[1]);
if(m[2]){extra=m[3];
break
}}}while(m);
if(parts.length>1&&origPOS.exec(selector)){if(parts.length===2&&Expr.relative[parts[0]]){set=posProcess(parts[0]+parts[1],context)
}else{set=Expr.relative[parts[0]]?[context]:Sizzle(parts.shift(),context);
while(parts.length){selector=parts.shift();
if(Expr.relative[selector]){selector+=parts.shift()
}set=posProcess(selector,set)
}}}else{if(!seed&&parts.length>1&&context.nodeType===9&&!contextXML&&Expr.match.ID.test(parts[0])&&!Expr.match.ID.test(parts[parts.length-1])){ret=Sizzle.find(parts.shift(),context,contextXML);
context=ret.expr?Sizzle.filter(ret.expr,ret.set)[0]:ret.set[0]
}if(context){ret=seed?{expr:parts.pop(),set:makeArray(seed)}:Sizzle.find(parts.pop(),parts.length===1&&(parts[0]==="~"||parts[0]==="+")&&context.parentNode?context.parentNode:context,contextXML);
set=ret.expr?Sizzle.filter(ret.expr,ret.set):ret.set;
if(parts.length>0){checkSet=makeArray(set)
}else{prune=false
}while(parts.length){cur=parts.pop();
pop=cur;
if(!Expr.relative[cur]){cur=""
}else{pop=parts.pop()
}if(pop==null){pop=context
}Expr.relative[cur](checkSet,pop,contextXML)
}}else{checkSet=parts=[]
}}if(!checkSet){checkSet=set
}if(!checkSet){Sizzle.error(cur||selector)
}if(toString.call(checkSet)==="[object Array]"){if(!prune){results.push.apply(results,checkSet)
}else{if(context&&context.nodeType===1){for(i=0;
checkSet[i]!=null;
i++){if(checkSet[i]&&(checkSet[i]===true||checkSet[i].nodeType===1&&Sizzle.contains(context,checkSet[i]))){results.push(set[i])
}}}else{for(i=0;
checkSet[i]!=null;
i++){if(checkSet[i]&&checkSet[i].nodeType===1){results.push(set[i])
}}}}}else{makeArray(checkSet,results)
}if(extra){Sizzle(extra,origContext,results,seed);
Sizzle.uniqueSort(results)
}return results
};
Sizzle.uniqueSort=function(results){if(sortOrder){hasDuplicate=baseHasDuplicate;
results.sort(sortOrder);
if(hasDuplicate){for(var i=1;
i<results.length;
i++){if(results[i]===results[i-1]){results.splice(i--,1)
}}}}return results
};
Sizzle.matches=function(expr,set){return Sizzle(expr,null,null,set)
};
Sizzle.matchesSelector=function(node,expr){return Sizzle(expr,null,null,[node]).length>0
};
Sizzle.find=function(expr,context,isXML){var set;
if(!expr){return[]
}for(var i=0,l=Expr.order.length;
i<l;
i++){var match,type=Expr.order[i];
if((match=Expr.leftMatch[type].exec(expr))){var left=match[1];
match.splice(1,1);
if(left.substr(left.length-1)!=="\\"){match[1]=(match[1]||"").replace(rBackslash,"");
set=Expr.find[type](match,context,isXML);
if(set!=null){expr=expr.replace(Expr.match[type],"");
break
}}}}if(!set){set=typeof context.getElementsByTagName!=="undefined"?context.getElementsByTagName("*"):[]
}return{set:set,expr:expr}
};
Sizzle.filter=function(expr,set,inplace,not){var match,anyFound,old=expr,result=[],curLoop=set,isXMLFilter=set&&set[0]&&Sizzle.isXML(set[0]);
while(expr&&set.length){for(var type in Expr.filter){if((match=Expr.leftMatch[type].exec(expr))!=null&&match[2]){var found,item,filter=Expr.filter[type],left=match[1];
anyFound=false;
match.splice(1,1);
if(left.substr(left.length-1)==="\\"){continue
}if(curLoop===result){result=[]
}if(Expr.preFilter[type]){match=Expr.preFilter[type](match,curLoop,inplace,result,not,isXMLFilter);
if(!match){anyFound=found=true
}else{if(match===true){continue
}}}if(match){for(var i=0;
(item=curLoop[i])!=null;
i++){if(item){found=filter(item,match,i,curLoop);
var pass=not^!!found;
if(inplace&&found!=null){if(pass){anyFound=true
}else{curLoop[i]=false
}}else{if(pass){result.push(item);
anyFound=true
}}}}}if(found!==undefined){if(!inplace){curLoop=result
}expr=expr.replace(Expr.match[type],"");
if(!anyFound){return[]
}break
}}}if(expr===old){if(anyFound==null){Sizzle.error(expr)
}else{break
}}old=expr
}return curLoop
};
Sizzle.error=function(msg){throw"Syntax error, unrecognized expression: "+msg
};
var Expr=Sizzle.selectors={order:["ID","NAME","TAG"],match:{ID:/#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,CLASS:/\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,NAME:/\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,ATTR:/\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,TAG:/^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,CHILD:/:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,POS:/:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,PSEUDO:/:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/},leftMatch:{},attrMap:{"class":"className","for":"htmlFor"},attrHandle:{href:function(elem){return elem.getAttribute("href")
},type:function(elem){return elem.getAttribute("type")
}},relative:{"+":function(checkSet,part){var isPartStr=typeof part==="string",isTag=isPartStr&&!rNonWord.test(part),isPartStrNotTag=isPartStr&&!isTag;
if(isTag){part=part.toLowerCase()
}for(var i=0,l=checkSet.length,elem;
i<l;
i++){if((elem=checkSet[i])){while((elem=elem.previousSibling)&&elem.nodeType!==1){}checkSet[i]=isPartStrNotTag||elem&&elem.nodeName.toLowerCase()===part?elem||false:elem===part
}}if(isPartStrNotTag){Sizzle.filter(part,checkSet,true)
}},">":function(checkSet,part){var elem,isPartStr=typeof part==="string",i=0,l=checkSet.length;
if(isPartStr&&!rNonWord.test(part)){part=part.toLowerCase();
for(;
i<l;
i++){elem=checkSet[i];
if(elem){var parent=elem.parentNode;
checkSet[i]=parent.nodeName.toLowerCase()===part?parent:false
}}}else{for(;
i<l;
i++){elem=checkSet[i];
if(elem){checkSet[i]=isPartStr?elem.parentNode:elem.parentNode===part
}}if(isPartStr){Sizzle.filter(part,checkSet,true)
}}},"":function(checkSet,part,isXML){var nodeCheck,doneName=done++,checkFn=dirCheck;
if(typeof part==="string"&&!rNonWord.test(part)){part=part.toLowerCase();
nodeCheck=part;
checkFn=dirNodeCheck
}checkFn("parentNode",part,doneName,checkSet,nodeCheck,isXML)
},"~":function(checkSet,part,isXML){var nodeCheck,doneName=done++,checkFn=dirCheck;
if(typeof part==="string"&&!rNonWord.test(part)){part=part.toLowerCase();
nodeCheck=part;
checkFn=dirNodeCheck
}checkFn("previousSibling",part,doneName,checkSet,nodeCheck,isXML)
}},find:{ID:function(match,context,isXML){if(typeof context.getElementById!=="undefined"&&!isXML){var m=context.getElementById(match[1]);
return m&&m.parentNode?[m]:[]
}},NAME:function(match,context){if(typeof context.getElementsByName!=="undefined"){var ret=[],results=context.getElementsByName(match[1]);
for(var i=0,l=results.length;
i<l;
i++){if(results[i].getAttribute("name")===match[1]){ret.push(results[i])
}}return ret.length===0?null:ret
}},TAG:function(match,context){if(typeof context.getElementsByTagName!=="undefined"){return context.getElementsByTagName(match[1])
}}},preFilter:{CLASS:function(match,curLoop,inplace,result,not,isXML){match=" "+match[1].replace(rBackslash,"")+" ";
if(isXML){return match
}for(var i=0,elem;
(elem=curLoop[i])!=null;
i++){if(elem){if(not^(elem.className&&(" "+elem.className+" ").replace(/[\t\n\r]/g," ").indexOf(match)>=0)){if(!inplace){result.push(elem)
}}else{if(inplace){curLoop[i]=false
}}}}return false
},ID:function(match){return match[1].replace(rBackslash,"")
},TAG:function(match,curLoop){return match[1].replace(rBackslash,"").toLowerCase()
},CHILD:function(match){if(match[1]==="nth"){if(!match[2]){Sizzle.error(match[0])
}match[2]=match[2].replace(/^\+|\s*/g,"");
var test=/(-?)(\d*)(?:n([+\-]?\d*))?/.exec(match[2]==="even"&&"2n"||match[2]==="odd"&&"2n+1"||!/\D/.test(match[2])&&"0n+"+match[2]||match[2]);
match[2]=(test[1]+(test[2]||1))-0;
match[3]=test[3]-0
}else{if(match[2]){Sizzle.error(match[0])
}}match[0]=done++;
return match
},ATTR:function(match,curLoop,inplace,result,not,isXML){var name=match[1]=match[1].replace(rBackslash,"");
if(!isXML&&Expr.attrMap[name]){match[1]=Expr.attrMap[name]
}match[4]=(match[4]||match[5]||"").replace(rBackslash,"");
if(match[2]==="~="){match[4]=" "+match[4]+" "
}return match
},PSEUDO:function(match,curLoop,inplace,result,not){if(match[1]==="not"){if((chunker.exec(match[3])||"").length>1||/^\w/.test(match[3])){match[3]=Sizzle(match[3],null,null,curLoop)
}else{var ret=Sizzle.filter(match[3],curLoop,inplace,true^not);
if(!inplace){result.push.apply(result,ret)
}return false
}}else{if(Expr.match.POS.test(match[0])||Expr.match.CHILD.test(match[0])){return true
}}return match
},POS:function(match){match.unshift(true);
return match
}},filters:{enabled:function(elem){return elem.disabled===false&&elem.type!=="hidden"
},disabled:function(elem){return elem.disabled===true
},checked:function(elem){return elem.checked===true
},selected:function(elem){if(elem.parentNode){elem.parentNode.selectedIndex
}return elem.selected===true
},parent:function(elem){return !!elem.firstChild
},empty:function(elem){return !elem.firstChild
},has:function(elem,i,match){return !!Sizzle(match[3],elem).length
},header:function(elem){return(/h\d/i).test(elem.nodeName)
},text:function(elem){var attr=elem.getAttribute("type"),type=elem.type;
return elem.nodeName.toLowerCase()==="input"&&"text"===type&&(attr===type||attr===null)
},radio:function(elem){return elem.nodeName.toLowerCase()==="input"&&"radio"===elem.type
},checkbox:function(elem){return elem.nodeName.toLowerCase()==="input"&&"checkbox"===elem.type
},file:function(elem){return elem.nodeName.toLowerCase()==="input"&&"file"===elem.type
},password:function(elem){return elem.nodeName.toLowerCase()==="input"&&"password"===elem.type
},submit:function(elem){var name=elem.nodeName.toLowerCase();
return(name==="input"||name==="button")&&"submit"===elem.type
},image:function(elem){return elem.nodeName.toLowerCase()==="input"&&"image"===elem.type
},reset:function(elem){var name=elem.nodeName.toLowerCase();
return(name==="input"||name==="button")&&"reset"===elem.type
},button:function(elem){var name=elem.nodeName.toLowerCase();
return name==="input"&&"button"===elem.type||name==="button"
},input:function(elem){return(/input|select|textarea|button/i).test(elem.nodeName)
},focus:function(elem){return elem===elem.ownerDocument.activeElement
}},setFilters:{first:function(elem,i){return i===0
},last:function(elem,i,match,array){return i===array.length-1
},even:function(elem,i){return i%2===0
},odd:function(elem,i){return i%2===1
},lt:function(elem,i,match){return i<match[3]-0
},gt:function(elem,i,match){return i>match[3]-0
},nth:function(elem,i,match){return match[3]-0===i
},eq:function(elem,i,match){return match[3]-0===i
}},filter:{PSEUDO:function(elem,match,i,array){var name=match[1],filter=Expr.filters[name];
if(filter){return filter(elem,i,match,array)
}else{if(name==="contains"){return(elem.textContent||elem.innerText||Sizzle.getText([elem])||"").indexOf(match[3])>=0
}else{if(name==="not"){var not=match[3];
for(var j=0,l=not.length;
j<l;
j++){if(not[j]===elem){return false
}}return true
}else{Sizzle.error(name)
}}}},CHILD:function(elem,match){var type=match[1],node=elem;
switch(type){case"only":case"first":while((node=node.previousSibling)){if(node.nodeType===1){return false
}}if(type==="first"){return true
}node=elem;
case"last":while((node=node.nextSibling)){if(node.nodeType===1){return false
}}return true;
case"nth":var first=match[2],last=match[3];
if(first===1&&last===0){return true
}var doneName=match[0],parent=elem.parentNode;
if(parent&&(parent.sizcache!==doneName||!elem.nodeIndex)){var count=0;
for(node=parent.firstChild;
node;
node=node.nextSibling){if(node.nodeType===1){node.nodeIndex=++count
}}parent.sizcache=doneName
}var diff=elem.nodeIndex-last;
if(first===0){return diff===0
}else{return(diff%first===0&&diff/first>=0)
}}},ID:function(elem,match){return elem.nodeType===1&&elem.getAttribute("id")===match
},TAG:function(elem,match){return(match==="*"&&elem.nodeType===1)||elem.nodeName.toLowerCase()===match
},CLASS:function(elem,match){return(" "+(elem.className||elem.getAttribute("class"))+" ").indexOf(match)>-1
},ATTR:function(elem,match){var name=match[1],result=Expr.attrHandle[name]?Expr.attrHandle[name](elem):elem[name]!=null?elem[name]:elem.getAttribute(name),value=result+"",type=match[2],check=match[4];
return result==null?type==="!=":type==="="?value===check:type==="*="?value.indexOf(check)>=0:type==="~="?(" "+value+" ").indexOf(check)>=0:!check?value&&result!==false:type==="!="?value!==check:type==="^="?value.indexOf(check)===0:type==="$="?value.substr(value.length-check.length)===check:type==="|="?value===check||value.substr(0,check.length+1)===check+"-":false
},POS:function(elem,match,i,array){var name=match[2],filter=Expr.setFilters[name];
if(filter){return filter(elem,i,match,array)
}}}};
var origPOS=Expr.match.POS,fescape=function(all,num){return"\\"+(num-0+1)
};
for(var type in Expr.match){Expr.match[type]=new RegExp(Expr.match[type].source+(/(?![^\[]*\])(?![^\(]*\))/.source));
Expr.leftMatch[type]=new RegExp(/(^(?:.|\r|\n)*?)/.source+Expr.match[type].source.replace(/\\(\d+)/g,fescape))
}var makeArray=function(array,results){array=Array.prototype.slice.call(array,0);
if(results){results.push.apply(results,array);
return results
}return array
};
try{Array.prototype.slice.call(document.documentElement.childNodes,0)[0].nodeType
}catch(e){makeArray=function(array,results){var i=0,ret=results||[];
if(toString.call(array)==="[object Array]"){Array.prototype.push.apply(ret,array)
}else{if(typeof array.length==="number"){for(var l=array.length;
i<l;
i++){ret.push(array[i])
}}else{for(;
array[i];
i++){ret.push(array[i])
}}}return ret
}
}var sortOrder,siblingCheck;
if(document.documentElement.compareDocumentPosition){sortOrder=function(a,b){if(a===b){hasDuplicate=true;
return 0
}if(!a.compareDocumentPosition||!b.compareDocumentPosition){return a.compareDocumentPosition?-1:1
}return a.compareDocumentPosition(b)&4?-1:1
}
}else{sortOrder=function(a,b){if(a===b){hasDuplicate=true;
return 0
}else{if(a.sourceIndex&&b.sourceIndex){return a.sourceIndex-b.sourceIndex
}}var al,bl,ap=[],bp=[],aup=a.parentNode,bup=b.parentNode,cur=aup;
if(aup===bup){return siblingCheck(a,b)
}else{if(!aup){return -1
}else{if(!bup){return 1
}}}while(cur){ap.unshift(cur);
cur=cur.parentNode
}cur=bup;
while(cur){bp.unshift(cur);
cur=cur.parentNode
}al=ap.length;
bl=bp.length;
for(var i=0;
i<al&&i<bl;
i++){if(ap[i]!==bp[i]){return siblingCheck(ap[i],bp[i])
}}return i===al?siblingCheck(a,bp[i],-1):siblingCheck(ap[i],b,1)
};
siblingCheck=function(a,b,ret){if(a===b){return ret
}var cur=a.nextSibling;
while(cur){if(cur===b){return -1
}cur=cur.nextSibling
}return 1
}
}Sizzle.getText=function(elems){var ret="",elem;
for(var i=0;
elems[i];
i++){elem=elems[i];
if(elem.nodeType===3||elem.nodeType===4){ret+=elem.nodeValue
}else{if(elem.nodeType!==8){ret+=Sizzle.getText(elem.childNodes)
}}}return ret
};
(function(){var form=document.createElement("div"),id="script"+(new Date()).getTime(),root=document.documentElement;
form.innerHTML="<a name='"+id+"'/>";
root.insertBefore(form,root.firstChild);
if(document.getElementById(id)){Expr.find.ID=function(match,context,isXML){if(typeof context.getElementById!=="undefined"&&!isXML){var m=context.getElementById(match[1]);
return m?m.id===match[1]||typeof m.getAttributeNode!=="undefined"&&m.getAttributeNode("id").nodeValue===match[1]?[m]:undefined:[]
}};
Expr.filter.ID=function(elem,match){var node=typeof elem.getAttributeNode!=="undefined"&&elem.getAttributeNode("id");
return elem.nodeType===1&&node&&node.nodeValue===match
}
}root.removeChild(form);
root=form=null
})();
(function(){var div=document.createElement("div");
div.appendChild(document.createComment(""));
if(div.getElementsByTagName("*").length>0){Expr.find.TAG=function(match,context){var results=context.getElementsByTagName(match[1]);
if(match[1]==="*"){var tmp=[];
for(var i=0;
results[i];
i++){if(results[i].nodeType===1){tmp.push(results[i])
}}results=tmp
}return results
}
}div.innerHTML="<a href='#'></a>";
if(div.firstChild&&typeof div.firstChild.getAttribute!=="undefined"&&div.firstChild.getAttribute("href")!=="#"){Expr.attrHandle.href=function(elem){return elem.getAttribute("href",2)
}
}div=null
})();
if(document.querySelectorAll){(function(){var oldSizzle=Sizzle,div=document.createElement("div"),id="__sizzle__";
div.innerHTML="<p class='TEST'></p>";
if(div.querySelectorAll&&div.querySelectorAll(".TEST").length===0){return
}Sizzle=function(query,context,extra,seed){context=context||document;
if(!seed&&!Sizzle.isXML(context)){var match=/^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec(query);
if(match&&(context.nodeType===1||context.nodeType===9)){if(match[1]){return makeArray(context.getElementsByTagName(query),extra)
}else{if(match[2]&&Expr.find.CLASS&&context.getElementsByClassName){return makeArray(context.getElementsByClassName(match[2]),extra)
}}}if(context.nodeType===9){if(query==="body"&&context.body){return makeArray([context.body],extra)
}else{if(match&&match[3]){var elem=context.getElementById(match[3]);
if(elem&&elem.parentNode){if(elem.id===match[3]){return makeArray([elem],extra)
}}else{return makeArray([],extra)
}}}try{return makeArray(context.querySelectorAll(query),extra)
}catch(qsaError){}}else{if(context.nodeType===1&&context.nodeName.toLowerCase()!=="object"){var oldContext=context,old=context.getAttribute("id"),nid=old||id,hasParent=context.parentNode,relativeHierarchySelector=/^\s*[+~]/.test(query);
if(!old){context.setAttribute("id",nid)
}else{nid=nid.replace(/'/g,"\\$&")
}if(relativeHierarchySelector&&hasParent){context=context.parentNode
}try{if(!relativeHierarchySelector||hasParent){return makeArray(context.querySelectorAll("[id='"+nid+"'] "+query),extra)
}}catch(pseudoError){}finally{if(!old){oldContext.removeAttribute("id")
}}}}}return oldSizzle(query,context,extra,seed)
};
for(var prop in oldSizzle){Sizzle[prop]=oldSizzle[prop]
}div=null
})()
}(function(){var html=document.documentElement,matches=html.matchesSelector||html.mozMatchesSelector||html.webkitMatchesSelector||html.msMatchesSelector;
if(matches){var disconnectedMatch=!matches.call(document.createElement("div"),"div"),pseudoWorks=false;
try{matches.call(document.documentElement,"[test!='']:sizzle")
}catch(pseudoError){pseudoWorks=true
}Sizzle.matchesSelector=function(node,expr){expr=expr.replace(/\=\s*([^'"\]]*)\s*\]/g,"='$1']");
if(!Sizzle.isXML(node)){try{if(pseudoWorks||!Expr.match.PSEUDO.test(expr)&&!/!=/.test(expr)){var ret=matches.call(node,expr);
if(ret||!disconnectedMatch||node.document&&node.document.nodeType!==11){return ret
}}}catch(e){}}return Sizzle(expr,null,null,[node]).length>0
}
}})();
(function(){var div=document.createElement("div");
div.innerHTML="<div class='test e'></div><div class='test'></div>";
if(!div.getElementsByClassName||div.getElementsByClassName("e").length===0){return
}div.lastChild.className="e";
if(div.getElementsByClassName("e").length===1){return
}Expr.order.splice(1,0,"CLASS");
Expr.find.CLASS=function(match,context,isXML){if(typeof context.getElementsByClassName!=="undefined"&&!isXML){return context.getElementsByClassName(match[1])
}};
div=null
})();
function dirNodeCheck(dir,cur,doneName,checkSet,nodeCheck,isXML){for(var i=0,l=checkSet.length;
i<l;
i++){var elem=checkSet[i];
if(elem){var match=false;
elem=elem[dir];
while(elem){if(elem.sizcache===doneName){match=checkSet[elem.sizset];
break
}if(elem.nodeType===1&&!isXML){elem.sizcache=doneName;
elem.sizset=i
}if(elem.nodeName.toLowerCase()===cur){match=elem;
break
}elem=elem[dir]
}checkSet[i]=match
}}}function dirCheck(dir,cur,doneName,checkSet,nodeCheck,isXML){for(var i=0,l=checkSet.length;
i<l;
i++){var elem=checkSet[i];
if(elem){var match=false;
elem=elem[dir];
while(elem){if(elem.sizcache===doneName){match=checkSet[elem.sizset];
break
}if(elem.nodeType===1){if(!isXML){elem.sizcache=doneName;
elem.sizset=i
}if(typeof cur!=="string"){if(elem===cur){match=true;
break
}}else{if(Sizzle.filter(cur,[elem]).length>0){match=elem;
break
}}}elem=elem[dir]
}checkSet[i]=match
}}}if(document.documentElement.contains){Sizzle.contains=function(a,b){return a!==b&&(a.contains?a.contains(b):true)
}
}else{if(document.documentElement.compareDocumentPosition){Sizzle.contains=function(a,b){return !!(a.compareDocumentPosition(b)&16)
}
}else{Sizzle.contains=function(){return false
}
}}Sizzle.isXML=function(elem){var documentElement=(elem?elem.ownerDocument||elem:0).documentElement;
return documentElement?documentElement.nodeName!=="HTML":false
};
var posProcess=function(selector,context){var match,tmpSet=[],later="",root=context.nodeType?[context]:context;
while((match=Expr.match.PSEUDO.exec(selector))){later+=match[0];
selector=selector.replace(Expr.match.PSEUDO,"")
}selector=Expr.relative[selector]?selector+"*":selector;
for(var i=0,l=root.length;
i<l;
i++){Sizzle(selector,root[i],tmpSet)
}return Sizzle.filter(later,tmpSet)
};
jQuery.find=Sizzle;
jQuery.expr=Sizzle.selectors;
jQuery.expr[":"]=jQuery.expr.filters;
jQuery.unique=Sizzle.uniqueSort;
jQuery.text=Sizzle.getText;
jQuery.isXMLDoc=Sizzle.isXML;
jQuery.contains=Sizzle.contains
})();
var runtil=/Until$/,rparentsprev=/^(?:parents|prevUntil|prevAll)/,rmultiselector=/,/,isSimple=/^.[^:#\[\.,]*$/,slice=Array.prototype.slice,POS=jQuery.expr.match.POS,guaranteedUnique={children:true,contents:true,next:true,prev:true};
jQuery.fn.extend({find:function(selector){var self=this,i,l;
if(typeof selector!=="string"){return jQuery(selector).filter(function(){for(i=0,l=self.length;
i<l;
i++){if(jQuery.contains(self[i],this)){return true
}}})
}var ret=this.pushStack("","find",selector),length,n,r;
for(i=0,l=this.length;
i<l;
i++){length=ret.length;
jQuery.find(selector,this[i],ret);
if(i>0){for(n=length;
n<ret.length;
n++){for(r=0;
r<length;
r++){if(ret[r]===ret[n]){ret.splice(n--,1);
break
}}}}}return ret
},has:function(target){var targets=jQuery(target);
return this.filter(function(){for(var i=0,l=targets.length;
i<l;
i++){if(jQuery.contains(this,targets[i])){return true
}}})
},not:function(selector){return this.pushStack(winnow(this,selector,false),"not",selector)
},filter:function(selector){return this.pushStack(winnow(this,selector,true),"filter",selector)
},is:function(selector){return !!selector&&(typeof selector==="string"?jQuery.filter(selector,this).length>0:this.filter(selector).length>0)
},closest:function(selectors,context){var ret=[],i,l,cur=this[0];
if(jQuery.isArray(selectors)){var match,selector,matches={},level=1;
if(cur&&selectors.length){for(i=0,l=selectors.length;
i<l;
i++){selector=selectors[i];
if(!matches[selector]){matches[selector]=POS.test(selector)?jQuery(selector,context||this.context):selector
}}while(cur&&cur.ownerDocument&&cur!==context){for(selector in matches){match=matches[selector];
if(match.jquery?match.index(cur)>-1:jQuery(cur).is(match)){ret.push({selector:selector,elem:cur,level:level})
}}cur=cur.parentNode;
level++
}}return ret
}var pos=POS.test(selectors)||typeof selectors!=="string"?jQuery(selectors,context||this.context):0;
for(i=0,l=this.length;
i<l;
i++){cur=this[i];
while(cur){if(pos?pos.index(cur)>-1:jQuery.find.matchesSelector(cur,selectors)){ret.push(cur);
break
}else{cur=cur.parentNode;
if(!cur||!cur.ownerDocument||cur===context||cur.nodeType===11){break
}}}}ret=ret.length>1?jQuery.unique(ret):ret;
return this.pushStack(ret,"closest",selectors)
},index:function(elem){if(!elem){return(this[0]&&this[0].parentNode)?this.prevAll().length:-1
}if(typeof elem==="string"){return jQuery.inArray(this[0],jQuery(elem))
}return jQuery.inArray(elem.jquery?elem[0]:elem,this)
},add:function(selector,context){var set=typeof selector==="string"?jQuery(selector,context):jQuery.makeArray(selector&&selector.nodeType?[selector]:selector),all=jQuery.merge(this.get(),set);
return this.pushStack(isDisconnected(set[0])||isDisconnected(all[0])?all:jQuery.unique(all))
},andSelf:function(){return this.add(this.prevObject)
}});
function isDisconnected(node){return !node||!node.parentNode||node.parentNode.nodeType===11
}jQuery.each({parent:function(elem){var parent=elem.parentNode;
return parent&&parent.nodeType!==11?parent:null
},parents:function(elem){return jQuery.dir(elem,"parentNode")
},parentsUntil:function(elem,i,until){return jQuery.dir(elem,"parentNode",until)
},next:function(elem){return jQuery.nth(elem,2,"nextSibling")
},prev:function(elem){return jQuery.nth(elem,2,"previousSibling")
},nextAll:function(elem){return jQuery.dir(elem,"nextSibling")
},prevAll:function(elem){return jQuery.dir(elem,"previousSibling")
},nextUntil:function(elem,i,until){return jQuery.dir(elem,"nextSibling",until)
},prevUntil:function(elem,i,until){return jQuery.dir(elem,"previousSibling",until)
},siblings:function(elem){return jQuery.sibling(elem.parentNode.firstChild,elem)
},children:function(elem){return jQuery.sibling(elem.firstChild)
},contents:function(elem){return jQuery.nodeName(elem,"iframe")?elem.contentDocument||elem.contentWindow.document:jQuery.makeArray(elem.childNodes)
}},function(name,fn){jQuery.fn[name]=function(until,selector){var ret=jQuery.map(this,fn,until),args=slice.call(arguments);
if(!runtil.test(name)){selector=until
}if(selector&&typeof selector==="string"){ret=jQuery.filter(selector,ret)
}ret=this.length>1&&!guaranteedUnique[name]?jQuery.unique(ret):ret;
if((this.length>1||rmultiselector.test(selector))&&rparentsprev.test(name)){ret=ret.reverse()
}return this.pushStack(ret,name,args.join(","))
}
});
jQuery.extend({filter:function(expr,elems,not){if(not){expr=":not("+expr+")"
}return elems.length===1?jQuery.find.matchesSelector(elems[0],expr)?[elems[0]]:[]:jQuery.find.matches(expr,elems)
},dir:function(elem,dir,until){var matched=[],cur=elem[dir];
while(cur&&cur.nodeType!==9&&(until===undefined||cur.nodeType!==1||!jQuery(cur).is(until))){if(cur.nodeType===1){matched.push(cur)
}cur=cur[dir]
}return matched
},nth:function(cur,result,dir,elem){result=result||1;
var num=0;
for(;
cur;
cur=cur[dir]){if(cur.nodeType===1&&++num===result){break
}}return cur
},sibling:function(n,elem){var r=[];
for(;
n;
n=n.nextSibling){if(n.nodeType===1&&n!==elem){r.push(n)
}}return r
}});
function winnow(elements,qualifier,keep){qualifier=qualifier||0;
if(jQuery.isFunction(qualifier)){return jQuery.grep(elements,function(elem,i){var retVal=!!qualifier.call(elem,i,elem);
return retVal===keep
})
}else{if(qualifier.nodeType){return jQuery.grep(elements,function(elem,i){return(elem===qualifier)===keep
})
}else{if(typeof qualifier==="string"){var filtered=jQuery.grep(elements,function(elem){return elem.nodeType===1
});
if(isSimple.test(qualifier)){return jQuery.filter(qualifier,filtered,!keep)
}else{qualifier=jQuery.filter(qualifier,filtered)
}}}}return jQuery.grep(elements,function(elem,i){return(jQuery.inArray(elem,qualifier)>=0)===keep
})
}var rinlinejQuery=/ jQuery\d+="(?:\d+|null)"/g,rleadingWhitespace=/^\s+/,rxhtmlTag=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,rtagName=/<([\w:]+)/,rtbody=/<tbody/i,rhtml=/<|&#?\w+;/,rnocache=/<(?:script|object|embed|option|style)/i,rchecked=/checked\s*(?:[^=]|=\s*.checked.)/i,rscriptType=/\/(java|ecma)script/i,rcleanScript=/^\s*<!(?:\[CDATA\[|\-\-)/,wrapMap={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],area:[1,"<map>","</map>"],_default:[0,"",""]};
wrapMap.optgroup=wrapMap.option;
wrapMap.tbody=wrapMap.tfoot=wrapMap.colgroup=wrapMap.caption=wrapMap.thead;
wrapMap.th=wrapMap.td;
if(!jQuery.support.htmlSerialize){wrapMap._default=[1,"div<div>","</div>"]
}jQuery.fn.extend({text:function(text){if(jQuery.isFunction(text)){return this.each(function(i){var self=jQuery(this);
self.text(text.call(this,i,self.text()))
})
}if(typeof text!=="object"&&text!==undefined){return this.empty().append((this[0]&&this[0].ownerDocument||document).createTextNode(text))
}return jQuery.text(this)
},wrapAll:function(html){if(jQuery.isFunction(html)){return this.each(function(i){jQuery(this).wrapAll(html.call(this,i))
})
}if(this[0]){var wrap=jQuery(html,this[0].ownerDocument).eq(0).clone(true);
if(this[0].parentNode){wrap.insertBefore(this[0])
}wrap.map(function(){var elem=this;
while(elem.firstChild&&elem.firstChild.nodeType===1){elem=elem.firstChild
}return elem
}).append(this)
}return this
},wrapInner:function(html){if(jQuery.isFunction(html)){return this.each(function(i){jQuery(this).wrapInner(html.call(this,i))
})
}return this.each(function(){var self=jQuery(this),contents=self.contents();
if(contents.length){contents.wrapAll(html)
}else{self.append(html)
}})
},wrap:function(html){return this.each(function(){jQuery(this).wrapAll(html)
})
},unwrap:function(){return this.parent().each(function(){if(!jQuery.nodeName(this,"body")){jQuery(this).replaceWith(this.childNodes)
}}).end()
},append:function(){return this.domManip(arguments,true,function(elem){if(this.nodeType===1){this.appendChild(elem)
}})
},prepend:function(){return this.domManip(arguments,true,function(elem){if(this.nodeType===1){this.insertBefore(elem,this.firstChild)
}})
},before:function(){if(this[0]&&this[0].parentNode){return this.domManip(arguments,false,function(elem){this.parentNode.insertBefore(elem,this)
})
}else{if(arguments.length){var set=jQuery(arguments[0]);
set.push.apply(set,this.toArray());
return this.pushStack(set,"before",arguments)
}}},after:function(){if(this[0]&&this[0].parentNode){return this.domManip(arguments,false,function(elem){this.parentNode.insertBefore(elem,this.nextSibling)
})
}else{if(arguments.length){var set=this.pushStack(this,"after",arguments);
set.push.apply(set,jQuery(arguments[0]).toArray());
return set
}}},remove:function(selector,keepData){for(var i=0,elem;
(elem=this[i])!=null;
i++){if(!selector||jQuery.filter(selector,[elem]).length){if(!keepData&&elem.nodeType===1){jQuery.cleanData(elem.getElementsByTagName("*"));
jQuery.cleanData([elem])
}if(elem.parentNode){elem.parentNode.removeChild(elem)
}}}return this
},empty:function(){for(var i=0,elem;
(elem=this[i])!=null;
i++){if(elem.nodeType===1){jQuery.cleanData(elem.getElementsByTagName("*"))
}while(elem.firstChild){elem.removeChild(elem.firstChild)
}}return this
},clone:function(dataAndEvents,deepDataAndEvents){dataAndEvents=dataAndEvents==null?false:dataAndEvents;
deepDataAndEvents=deepDataAndEvents==null?dataAndEvents:deepDataAndEvents;
return this.map(function(){return jQuery.clone(this,dataAndEvents,deepDataAndEvents)
})
},html:function(value){if(value===undefined){return this[0]&&this[0].nodeType===1?this[0].innerHTML.replace(rinlinejQuery,""):null
}else{if(typeof value==="string"&&!rnocache.test(value)&&(jQuery.support.leadingWhitespace||!rleadingWhitespace.test(value))&&!wrapMap[(rtagName.exec(value)||["",""])[1].toLowerCase()]){value=value.replace(rxhtmlTag,"<$1></$2>");
try{for(var i=0,l=this.length;
i<l;
i++){if(this[i].nodeType===1){jQuery.cleanData(this[i].getElementsByTagName("*"));
this[i].innerHTML=value
}}}catch(e){this.empty().append(value)
}}else{if(jQuery.isFunction(value)){this.each(function(i){var self=jQuery(this);
self.html(value.call(this,i,self.html()))
})
}else{this.empty().append(value)
}}}return this
},replaceWith:function(value){if(this[0]&&this[0].parentNode){if(jQuery.isFunction(value)){return this.each(function(i){var self=jQuery(this),old=self.html();
self.replaceWith(value.call(this,i,old))
})
}if(typeof value!=="string"){value=jQuery(value).detach()
}return this.each(function(){var next=this.nextSibling,parent=this.parentNode;
jQuery(this).remove();
if(next){jQuery(next).before(value)
}else{jQuery(parent).append(value)
}})
}else{return this.length?this.pushStack(jQuery(jQuery.isFunction(value)?value():value),"replaceWith",value):this
}},detach:function(selector){return this.remove(selector,true)
},domManip:function(args,table,callback){var results,first,fragment,parent,value=args[0],scripts=[];
if(!jQuery.support.checkClone&&arguments.length===3&&typeof value==="string"&&rchecked.test(value)){return this.each(function(){jQuery(this).domManip(args,table,callback,true)
})
}if(jQuery.isFunction(value)){return this.each(function(i){var self=jQuery(this);
args[0]=value.call(this,i,table?self.html():undefined);
self.domManip(args,table,callback)
})
}if(this[0]){parent=value&&value.parentNode;
if(jQuery.support.parentNode&&parent&&parent.nodeType===11&&parent.childNodes.length===this.length){results={fragment:parent}
}else{results=jQuery.buildFragment(args,this,scripts)
}fragment=results.fragment;
if(fragment.childNodes.length===1){first=fragment=fragment.firstChild
}else{first=fragment.firstChild
}if(first){table=table&&jQuery.nodeName(first,"tr");
for(var i=0,l=this.length,lastIndex=l-1;
i<l;
i++){callback.call(table?root(this[i],first):this[i],results.cacheable||(l>1&&i<lastIndex)?jQuery.clone(fragment,true,true):fragment)
}}if(scripts.length){jQuery.each(scripts,evalScript)
}}return this
}});
function root(elem,cur){return jQuery.nodeName(elem,"table")?(elem.getElementsByTagName("tbody")[0]||elem.appendChild(elem.ownerDocument.createElement("tbody"))):elem
}function cloneCopyEvent(src,dest){if(dest.nodeType!==1||!jQuery.hasData(src)){return
}var internalKey=jQuery.expando,oldData=jQuery.data(src),curData=jQuery.data(dest,oldData);
if((oldData=oldData[internalKey])){var events=oldData.events;
curData=curData[internalKey]=jQuery.extend({},oldData);
if(events){delete curData.handle;
curData.events={};
for(var type in events){for(var i=0,l=events[type].length;
i<l;
i++){jQuery.event.add(dest,type+(events[type][i].namespace?".":"")+events[type][i].namespace,events[type][i],events[type][i].data)
}}}}}function cloneFixAttributes(src,dest){var nodeName;
if(dest.nodeType!==1){return
}if(dest.clearAttributes){dest.clearAttributes()
}if(dest.mergeAttributes){dest.mergeAttributes(src)
}nodeName=dest.nodeName.toLowerCase();
if(nodeName==="object"){dest.outerHTML=src.outerHTML
}else{if(nodeName==="input"&&(src.type==="checkbox"||src.type==="radio")){if(src.checked){dest.defaultChecked=dest.checked=src.checked
}if(dest.value!==src.value){dest.value=src.value
}}else{if(nodeName==="option"){dest.selected=src.defaultSelected
}else{if(nodeName==="input"||nodeName==="textarea"){dest.defaultValue=src.defaultValue
}}}}dest.removeAttribute(jQuery.expando)
}jQuery.buildFragment=function(args,nodes,scripts){var fragment,cacheable,cacheresults,doc;
if(nodes&&nodes[0]){doc=nodes[0].ownerDocument||nodes[0]
}if(!doc.createDocumentFragment){doc=document
}if(args.length===1&&typeof args[0]==="string"&&args[0].length<512&&doc===document&&args[0].charAt(0)==="<"&&!rnocache.test(args[0])&&(jQuery.support.checkClone||!rchecked.test(args[0]))){cacheable=true;
cacheresults=jQuery.fragments[args[0]];
if(cacheresults&&cacheresults!==1){fragment=cacheresults
}}if(!fragment){fragment=doc.createDocumentFragment();
jQuery.clean(args,doc,fragment,scripts)
}if(cacheable){jQuery.fragments[args[0]]=cacheresults?fragment:1
}return{fragment:fragment,cacheable:cacheable}
};
jQuery.fragments={};
jQuery.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(name,original){jQuery.fn[name]=function(selector){var ret=[],insert=jQuery(selector),parent=this.length===1&&this[0].parentNode;
if(parent&&parent.nodeType===11&&parent.childNodes.length===1&&insert.length===1){insert[original](this[0]);
return this
}else{for(var i=0,l=insert.length;
i<l;
i++){var elems=(i>0?this.clone(true):this).get();
jQuery(insert[i])[original](elems);
ret=ret.concat(elems)
}return this.pushStack(ret,name,insert.selector)
}}
});
function getAll(elem){if("getElementsByTagName" in elem){return elem.getElementsByTagName("*")
}else{if("querySelectorAll" in elem){return elem.querySelectorAll("*")
}else{return[]
}}}function fixDefaultChecked(elem){if(elem.type==="checkbox"||elem.type==="radio"){elem.defaultChecked=elem.checked
}}function findInputs(elem){if(jQuery.nodeName(elem,"input")){fixDefaultChecked(elem)
}else{if("getElementsByTagName" in elem){jQuery.grep(elem.getElementsByTagName("input"),fixDefaultChecked)
}}}jQuery.extend({clone:function(elem,dataAndEvents,deepDataAndEvents){var clone=elem.cloneNode(true),srcElements,destElements,i;
if((!jQuery.support.noCloneEvent||!jQuery.support.noCloneChecked)&&(elem.nodeType===1||elem.nodeType===11)&&!jQuery.isXMLDoc(elem)){cloneFixAttributes(elem,clone);
srcElements=getAll(elem);
destElements=getAll(clone);
for(i=0;
srcElements[i];
++i){if(destElements[i]){cloneFixAttributes(srcElements[i],destElements[i])
}}}if(dataAndEvents){cloneCopyEvent(elem,clone);
if(deepDataAndEvents){srcElements=getAll(elem);
destElements=getAll(clone);
for(i=0;
srcElements[i];
++i){cloneCopyEvent(srcElements[i],destElements[i])
}}}srcElements=destElements=null;
return clone
},clean:function(elems,context,fragment,scripts){var checkScriptType;
context=context||document;
if(typeof context.createElement==="undefined"){context=context.ownerDocument||context[0]&&context[0].ownerDocument||document
}var ret=[],j;
for(var i=0,elem;
(elem=elems[i])!=null;
i++){if(typeof elem==="number"){elem+=""
}if(!elem){continue
}if(typeof elem==="string"){if(!rhtml.test(elem)){elem=context.createTextNode(elem)
}else{elem=elem.replace(rxhtmlTag,"<$1></$2>");
var tag=(rtagName.exec(elem)||["",""])[1].toLowerCase(),wrap=wrapMap[tag]||wrapMap._default,depth=wrap[0],div=context.createElement("div");
div.innerHTML=wrap[1]+elem+wrap[2];
while(depth--){div=div.lastChild
}if(!jQuery.support.tbody){var hasBody=rtbody.test(elem),tbody=tag==="table"&&!hasBody?div.firstChild&&div.firstChild.childNodes:wrap[1]==="<table>"&&!hasBody?div.childNodes:[];
for(j=tbody.length-1;
j>=0;
--j){if(jQuery.nodeName(tbody[j],"tbody")&&!tbody[j].childNodes.length){tbody[j].parentNode.removeChild(tbody[j])
}}}if(!jQuery.support.leadingWhitespace&&rleadingWhitespace.test(elem)){div.insertBefore(context.createTextNode(rleadingWhitespace.exec(elem)[0]),div.firstChild)
}elem=div.childNodes
}}var len;
if(!jQuery.support.appendChecked){if(elem[0]&&typeof(len=elem.length)==="number"){for(j=0;
j<len;
j++){findInputs(elem[j])
}}else{findInputs(elem)
}}if(elem.nodeType){ret.push(elem)
}else{ret=jQuery.merge(ret,elem)
}}if(fragment){checkScriptType=function(elem){return !elem.type||rscriptType.test(elem.type)
};
for(i=0;
ret[i];
i++){if(scripts&&jQuery.nodeName(ret[i],"script")&&(!ret[i].type||ret[i].type.toLowerCase()==="text/javascript")){scripts.push(ret[i].parentNode?ret[i].parentNode.removeChild(ret[i]):ret[i])
}else{if(ret[i].nodeType===1){var jsTags=jQuery.grep(ret[i].getElementsByTagName("script"),checkScriptType);
ret.splice.apply(ret,[i+1,0].concat(jsTags))
}fragment.appendChild(ret[i])
}}}return ret
},cleanData:function(elems){var data,id,cache=jQuery.cache,internalKey=jQuery.expando,special=jQuery.event.special,deleteExpando=jQuery.support.deleteExpando;
for(var i=0,elem;
(elem=elems[i])!=null;
i++){if(elem.nodeName&&jQuery.noData[elem.nodeName.toLowerCase()]){continue
}id=elem[jQuery.expando];
if(id){data=cache[id]&&cache[id][internalKey];
if(data&&data.events){for(var type in data.events){if(special[type]){jQuery.event.remove(elem,type)
}else{jQuery.removeEvent(elem,type,data.handle)
}}if(data.handle){data.handle.elem=null
}}if(deleteExpando){delete elem[jQuery.expando]
}else{if(elem.removeAttribute){elem.removeAttribute(jQuery.expando)
}}delete cache[id]
}}}});
function evalScript(i,elem){if(elem.src){jQuery.ajax({url:elem.src,async:false,dataType:"script"})
}else{jQuery.globalEval((elem.text||elem.textContent||elem.innerHTML||"").replace(rcleanScript,"/*$0*/"))
}if(elem.parentNode){elem.parentNode.removeChild(elem)
}}var ralpha=/alpha\([^)]*\)/i,ropacity=/opacity=([^)]*)/,rupper=/([A-Z]|^ms)/g,rnumpx=/^-?\d+(?:px)?$/i,rnum=/^-?\d/,rrelNum=/^([\-+])=([\-+.\de]+)/,cssShow={position:"absolute",visibility:"hidden",display:"block"},cssWidth=["Left","Right"],cssHeight=["Top","Bottom"],curCSS,getComputedStyle,currentStyle;
jQuery.fn.css=function(name,value){if(arguments.length===2&&value===undefined){return this
}return jQuery.access(this,name,value,true,function(elem,name,value){return value!==undefined?jQuery.style(elem,name,value):jQuery.css(elem,name)
})
};
jQuery.extend({cssHooks:{opacity:{get:function(elem,computed){if(computed){var ret=curCSS(elem,"opacity","opacity");
return ret===""?"1":ret
}else{return elem.style.opacity
}}}},cssNumber:{"fillOpacity":true,"fontWeight":true,"lineHeight":true,"opacity":true,"orphans":true,"widows":true,"zIndex":true,"zoom":true},cssProps:{"float":jQuery.support.cssFloat?"cssFloat":"styleFloat"},style:function(elem,name,value,extra){if(!elem||elem.nodeType===3||elem.nodeType===8||!elem.style){return
}var ret,type,origName=jQuery.camelCase(name),style=elem.style,hooks=jQuery.cssHooks[origName];
name=jQuery.cssProps[origName]||origName;
if(value!==undefined){type=typeof value;
if(type==="string"&&(ret=rrelNum.exec(value))){value=(+(ret[1]+1)*+ret[2])+parseFloat(jQuery.css(elem,name));
type="number"
}if(value==null||type==="number"&&isNaN(value)){return
}if(type==="number"&&!jQuery.cssNumber[origName]){value+="px"
}if(!hooks||!("set" in hooks)||(value=hooks.set(elem,value))!==undefined){try{style[name]=value
}catch(e){}}}else{if(hooks&&"get" in hooks&&(ret=hooks.get(elem,false,extra))!==undefined){return ret
}return style[name]
}},css:function(elem,name,extra){var ret,hooks;
name=jQuery.camelCase(name);
hooks=jQuery.cssHooks[name];
name=jQuery.cssProps[name]||name;
if(name==="cssFloat"){name="float"
}if(hooks&&"get" in hooks&&(ret=hooks.get(elem,true,extra))!==undefined){return ret
}else{if(curCSS){return curCSS(elem,name)
}}},swap:function(elem,options,callback){var old={};
for(var name in options){old[name]=elem.style[name];
elem.style[name]=options[name]
}callback.call(elem);
for(name in options){elem.style[name]=old[name]
}}});
jQuery.curCSS=jQuery.css;
jQuery.each(["height","width"],function(i,name){jQuery.cssHooks[name]={get:function(elem,computed,extra){var val;
if(computed){if(elem.offsetWidth!==0){return getWH(elem,name,extra)
}else{jQuery.swap(elem,cssShow,function(){val=getWH(elem,name,extra)
})
}return val
}},set:function(elem,value){if(rnumpx.test(value)){value=parseFloat(value);
if(value>=0){return value+"px"
}}else{return value
}}}
});
if(!jQuery.support.opacity){jQuery.cssHooks.opacity={get:function(elem,computed){return ropacity.test((computed&&elem.currentStyle?elem.currentStyle.filter:elem.style.filter)||"")?(parseFloat(RegExp.$1)/100)+"":computed?"1":""
},set:function(elem,value){var style=elem.style,currentStyle=elem.currentStyle,opacity=jQuery.isNaN(value)?"":"alpha(opacity="+value*100+")",filter=currentStyle&&currentStyle.filter||style.filter||"";
style.zoom=1;
if(value>=1&&jQuery.trim(filter.replace(ralpha,""))===""){style.removeAttribute("filter");
if(currentStyle&&!currentStyle.filter){return
}}style.filter=ralpha.test(filter)?filter.replace(ralpha,opacity):filter+" "+opacity
}}
}jQuery(function(){if(!jQuery.support.reliableMarginRight){jQuery.cssHooks.marginRight={get:function(elem,computed){var ret;
jQuery.swap(elem,{"display":"inline-block"},function(){if(computed){ret=curCSS(elem,"margin-right","marginRight")
}else{ret=elem.style.marginRight
}});
return ret
}}
}});
if(document.defaultView&&document.defaultView.getComputedStyle){getComputedStyle=function(elem,name){var ret,defaultView,computedStyle;
name=name.replace(rupper,"-$1").toLowerCase();
if(!(defaultView=elem.ownerDocument.defaultView)){return undefined
}if((computedStyle=defaultView.getComputedStyle(elem,null))){ret=computedStyle.getPropertyValue(name);
if(ret===""&&!jQuery.contains(elem.ownerDocument.documentElement,elem)){ret=jQuery.style(elem,name)
}}return ret
}
}if(document.documentElement.currentStyle){currentStyle=function(elem,name){var left,ret=elem.currentStyle&&elem.currentStyle[name],rsLeft=elem.runtimeStyle&&elem.runtimeStyle[name],style=elem.style;
if(!rnumpx.test(ret)&&rnum.test(ret)){left=style.left;
if(rsLeft){elem.runtimeStyle.left=elem.currentStyle.left
}style.left=name==="fontSize"?"1em":(ret||0);
ret=style.pixelLeft+"px";
style.left=left;
if(rsLeft){elem.runtimeStyle.left=rsLeft
}}return ret===""?"auto":ret
}
}curCSS=getComputedStyle||currentStyle;
function getWH(elem,name,extra){var val=name==="width"?elem.offsetWidth:elem.offsetHeight,which=name==="width"?cssWidth:cssHeight;
if(val>0){if(extra!=="border"){jQuery.each(which,function(){if(!extra){val-=parseFloat(jQuery.css(elem,"padding"+this))||0
}if(extra==="margin"){val+=parseFloat(jQuery.css(elem,extra+this))||0
}else{val-=parseFloat(jQuery.css(elem,"border"+this+"Width"))||0
}})
}return val+"px"
}val=curCSS(elem,name,name);
if(val<0||val==null){val=elem.style[name]||0
}val=parseFloat(val)||0;
if(extra){jQuery.each(which,function(){val+=parseFloat(jQuery.css(elem,"padding"+this))||0;
if(extra!=="padding"){val+=parseFloat(jQuery.css(elem,"border"+this+"Width"))||0
}if(extra==="margin"){val+=parseFloat(jQuery.css(elem,extra+this))||0
}})
}return val+"px"
}if(jQuery.expr&&jQuery.expr.filters){jQuery.expr.filters.hidden=function(elem){var width=elem.offsetWidth,height=elem.offsetHeight;
return(width===0&&height===0)||(!jQuery.support.reliableHiddenOffsets&&(elem.style.display||jQuery.css(elem,"display"))==="none")
};
jQuery.expr.filters.visible=function(elem){return !jQuery.expr.filters.hidden(elem)
}
}var r20=/%20/g,rbracket=/\[\]$/,rCRLF=/\r?\n/g,rhash=/#.*$/,rheaders=/^(.*?):[ \t]*([^\r\n]*)\r?$/mg,rinput=/^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,rlocalProtocol=/^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,rnoContent=/^(?:GET|HEAD)$/,rprotocol=/^\/\//,rquery=/\?/,rscript=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,rselectTextarea=/^(?:select|textarea)/i,rspacesAjax=/\s+/,rts=/([?&])_=[^&]*/,rurl=/^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,_load=jQuery.fn.load,prefilters={},transports={},ajaxLocation,ajaxLocParts,allTypes=["*/"]+["*"];
try{ajaxLocation=location.href
}catch(e){ajaxLocation=document.createElement("a");
ajaxLocation.href="";
ajaxLocation=ajaxLocation.href
}ajaxLocParts=rurl.exec(ajaxLocation.toLowerCase())||[];
function addToPrefiltersOrTransports(structure){return function(dataTypeExpression,func){if(typeof dataTypeExpression!=="string"){func=dataTypeExpression;
dataTypeExpression="*"
}if(jQuery.isFunction(func)){var dataTypes=dataTypeExpression.toLowerCase().split(rspacesAjax),i=0,length=dataTypes.length,dataType,list,placeBefore;
for(;
i<length;
i++){dataType=dataTypes[i];
placeBefore=/^\+/.test(dataType);
if(placeBefore){dataType=dataType.substr(1)||"*"
}list=structure[dataType]=structure[dataType]||[];
list[placeBefore?"unshift":"push"](func)
}}}
}function inspectPrefiltersOrTransports(structure,options,originalOptions,jqXHR,dataType,inspected){dataType=dataType||options.dataTypes[0];
inspected=inspected||{};
inspected[dataType]=true;
var list=structure[dataType],i=0,length=list?list.length:0,executeOnly=(structure===prefilters),selection;
for(;
i<length&&(executeOnly||!selection);
i++){selection=list[i](options,originalOptions,jqXHR);
if(typeof selection==="string"){if(!executeOnly||inspected[selection]){selection=undefined
}else{options.dataTypes.unshift(selection);
selection=inspectPrefiltersOrTransports(structure,options,originalOptions,jqXHR,selection,inspected)
}}}if((executeOnly||!selection)&&!inspected["*"]){selection=inspectPrefiltersOrTransports(structure,options,originalOptions,jqXHR,"*",inspected)
}return selection
}function ajaxExtend(target,src){var key,deep,flatOptions=jQuery.ajaxSettings.flatOptions||{};
for(key in src){if(src[key]!==undefined){(flatOptions[key]?target:(deep||(deep={})))[key]=src[key]
}}if(deep){jQuery.extend(true,target,deep)
}}jQuery.fn.extend({load:function(url,params,callback){if(typeof url!=="string"&&_load){return _load.apply(this,arguments)
}else{if(!this.length){return this
}}var off=url.indexOf(" ");
if(off>=0){var selector=url.slice(off,url.length);
url=url.slice(0,off)
}var type="GET";
if(params){if(jQuery.isFunction(params)){callback=params;
params=undefined
}else{if(typeof params==="object"){params=jQuery.param(params,jQuery.ajaxSettings.traditional);
type="POST"
}}}var self=this;
jQuery.ajax({url:url,type:type,dataType:"html",data:params,complete:function(jqXHR,status,responseText){responseText=jqXHR.responseText;
if(jqXHR.isResolved()){jqXHR.done(function(r){responseText=r
});
self.html(selector?jQuery("<div>").append(responseText.replace(rscript,"")).find(selector):responseText)
}if(callback){self.each(callback,[responseText,status,jqXHR])
}}});
return this
},serialize:function(){return jQuery.param(this.serializeArray())
},serializeArray:function(){return this.map(function(){return this.elements?jQuery.makeArray(this.elements):this
}).filter(function(){return this.name&&!this.disabled&&(this.checked||rselectTextarea.test(this.nodeName)||rinput.test(this.type))
}).map(function(i,elem){var val=jQuery(this).val();
return val==null?null:jQuery.isArray(val)?jQuery.map(val,function(val,i){return{name:elem.name,value:val.replace(rCRLF,"\r\n")}
}):{name:elem.name,value:val.replace(rCRLF,"\r\n")}
}).get()
}});
jQuery.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "),function(i,o){jQuery.fn[o]=function(f){return this.bind(o,f)
}
});
jQuery.each(["get","post"],function(i,method){jQuery[method]=function(url,data,callback,type){if(jQuery.isFunction(data)){type=type||callback;
callback=data;
data=undefined
}return jQuery.ajax({type:method,url:url,data:data,success:callback,dataType:type})
}
});
jQuery.extend({getScript:function(url,callback){return jQuery.get(url,undefined,callback,"script")
},getJSON:function(url,data,callback){return jQuery.get(url,data,callback,"json")
},ajaxSetup:function(target,settings){if(settings){ajaxExtend(target,jQuery.ajaxSettings)
}else{settings=target;
target=jQuery.ajaxSettings
}ajaxExtend(target,settings);
return target
},ajaxSettings:{url:ajaxLocation,isLocal:rlocalProtocol.test(ajaxLocParts[1]),global:true,type:"GET",contentType:"application/x-www-form-urlencoded",processData:true,async:true,accepts:{xml:"application/xml, text/xml",html:"text/html",text:"text/plain",json:"application/json, text/javascript","*":allTypes},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText"},converters:{"* text":window.String,"text html":true,"text json":jQuery.parseJSON,"text xml":jQuery.parseXML},flatOptions:{context:true,url:true}},ajaxPrefilter:addToPrefiltersOrTransports(prefilters),ajaxTransport:addToPrefiltersOrTransports(transports),ajax:function(url,options){if(typeof url==="object"){options=url;
url=undefined
}options=options||{};
var s=jQuery.ajaxSetup({},options),callbackContext=s.context||s,globalEventContext=callbackContext!==s&&(callbackContext.nodeType||callbackContext instanceof jQuery)?jQuery(callbackContext):jQuery.event,deferred=jQuery.Deferred(),completeDeferred=jQuery._Deferred(),statusCode=s.statusCode||{},ifModifiedKey,requestHeaders={},requestHeadersNames={},responseHeadersString,responseHeaders,transport,timeoutTimer,parts,state=0,fireGlobals,i,jqXHR={readyState:0,setRequestHeader:function(name,value){if(!state){var lname=name.toLowerCase();
name=requestHeadersNames[lname]=requestHeadersNames[lname]||name;
requestHeaders[name]=value
}return this
},getAllResponseHeaders:function(){return state===2?responseHeadersString:null
},getResponseHeader:function(key){var match;
if(state===2){if(!responseHeaders){responseHeaders={};
while((match=rheaders.exec(responseHeadersString))){responseHeaders[match[1].toLowerCase()]=match[2]
}}match=responseHeaders[key.toLowerCase()]
}return match===undefined?null:match
},overrideMimeType:function(type){if(!state){s.mimeType=type
}return this
},abort:function(statusText){statusText=statusText||"abort";
if(transport){transport.abort(statusText)
}done(0,statusText);
return this
}};
function done(status,nativeStatusText,responses,headers){if(state===2){return
}state=2;
if(timeoutTimer){clearTimeout(timeoutTimer)
}transport=undefined;
responseHeadersString=headers||"";
jqXHR.readyState=status>0?4:0;
var isSuccess,success,error,statusText=nativeStatusText,response=responses?ajaxHandleResponses(s,jqXHR,responses):undefined,lastModified,etag;
if(status>=200&&status<300||status===304){if(s.ifModified){if((lastModified=jqXHR.getResponseHeader("Last-Modified"))){jQuery.lastModified[ifModifiedKey]=lastModified
}if((etag=jqXHR.getResponseHeader("Etag"))){jQuery.etag[ifModifiedKey]=etag
}}if(status===304){statusText="notmodified";
isSuccess=true
}else{try{success=ajaxConvert(s,response);
statusText="success";
isSuccess=true
}catch(e){statusText="parsererror";
error=e
}}}else{error=statusText;
if(!statusText||status){statusText="error";
if(status<0){status=0
}}}jqXHR.status=status;
jqXHR.statusText=""+(nativeStatusText||statusText);
if(isSuccess){deferred.resolveWith(callbackContext,[success,statusText,jqXHR])
}else{deferred.rejectWith(callbackContext,[jqXHR,statusText,error])
}jqXHR.statusCode(statusCode);
statusCode=undefined;
if(fireGlobals){globalEventContext.trigger("ajax"+(isSuccess?"Success":"Error"),[jqXHR,s,isSuccess?success:error])
}completeDeferred.resolveWith(callbackContext,[jqXHR,statusText]);
if(fireGlobals){globalEventContext.trigger("ajaxComplete",[jqXHR,s]);
if(!(--jQuery.active)){jQuery.event.trigger("ajaxStop")
}}}deferred.promise(jqXHR);
jqXHR.success=jqXHR.done;
jqXHR.error=jqXHR.fail;
jqXHR.complete=completeDeferred.done;
jqXHR.statusCode=function(map){if(map){var tmp;
if(state<2){for(tmp in map){statusCode[tmp]=[statusCode[tmp],map[tmp]]
}}else{tmp=map[jqXHR.status];
jqXHR.then(tmp,tmp)
}}return this
};
s.url=((url||s.url)+"").replace(rhash,"").replace(rprotocol,ajaxLocParts[1]+"//");
s.dataTypes=jQuery.trim(s.dataType||"*").toLowerCase().split(rspacesAjax);
if(s.crossDomain==null){parts=rurl.exec(s.url.toLowerCase());
s.crossDomain=!!(parts&&(parts[1]!=ajaxLocParts[1]||parts[2]!=ajaxLocParts[2]||(parts[3]||(parts[1]==="http:"?80:443))!=(ajaxLocParts[3]||(ajaxLocParts[1]==="http:"?80:443))))
}if(s.data&&s.processData&&typeof s.data!=="string"){s.data=jQuery.param(s.data,s.traditional)
}inspectPrefiltersOrTransports(prefilters,s,options,jqXHR);
if(state===2){return false
}fireGlobals=s.global;
s.type=s.type.toUpperCase();
s.hasContent=!rnoContent.test(s.type);
if(fireGlobals&&jQuery.active++===0){jQuery.event.trigger("ajaxStart")
}if(!s.hasContent){if(s.data){s.url+=(rquery.test(s.url)?"&":"?")+s.data;
delete s.data
}ifModifiedKey=s.url;
if(s.cache===false){var ts=jQuery.now(),ret=s.url.replace(rts,"$1_="+ts);
s.url=ret+((ret===s.url)?(rquery.test(s.url)?"&":"?")+"_="+ts:"")
}}if(s.data&&s.hasContent&&s.contentType!==false||options.contentType){jqXHR.setRequestHeader("Content-Type",s.contentType)
}if(s.ifModified){ifModifiedKey=ifModifiedKey||s.url;
if(jQuery.lastModified[ifModifiedKey]){jqXHR.setRequestHeader("If-Modified-Since",jQuery.lastModified[ifModifiedKey])
}if(jQuery.etag[ifModifiedKey]){jqXHR.setRequestHeader("If-None-Match",jQuery.etag[ifModifiedKey])
}}jqXHR.setRequestHeader("Accept",s.dataTypes[0]&&s.accepts[s.dataTypes[0]]?s.accepts[s.dataTypes[0]]+(s.dataTypes[0]!=="*"?", "+allTypes+"; q=0.01":""):s.accepts["*"]);
for(i in s.headers){jqXHR.setRequestHeader(i,s.headers[i])
}if(s.beforeSend&&(s.beforeSend.call(callbackContext,jqXHR,s)===false||state===2)){jqXHR.abort();
return false
}for(i in {success:1,error:1,complete:1}){jqXHR[i](s[i])
}transport=inspectPrefiltersOrTransports(transports,s,options,jqXHR);
if(!transport){done(-1,"No Transport")
}else{jqXHR.readyState=1;
if(fireGlobals){globalEventContext.trigger("ajaxSend",[jqXHR,s])
}if(s.async&&s.timeout>0){timeoutTimer=setTimeout(function(){jqXHR.abort("timeout")
},s.timeout)
}try{state=1;
transport.send(requestHeaders,done)
}catch(e){if(state<2){done(-1,e)
}else{jQuery.error(e)
}}}return jqXHR
},param:function(a,traditional){var s=[],add=function(key,value){value=jQuery.isFunction(value)?value():value;
s[s.length]=encodeURIComponent(key)+"="+encodeURIComponent(value)
};
if(traditional===undefined){traditional=jQuery.ajaxSettings.traditional
}if(jQuery.isArray(a)||(a.jquery&&!jQuery.isPlainObject(a))){jQuery.each(a,function(){add(this.name,this.value)
})
}else{for(var prefix in a){buildParams(prefix,a[prefix],traditional,add)
}}return s.join("&").replace(r20,"+")
}});
function buildParams(prefix,obj,traditional,add){if(jQuery.isArray(obj)){jQuery.each(obj,function(i,v){if(traditional||rbracket.test(prefix)){add(prefix,v)
}else{buildParams(prefix+"["+(typeof v==="object"||jQuery.isArray(v)?i:"")+"]",v,traditional,add)
}})
}else{if(!traditional&&obj!=null&&typeof obj==="object"){for(var name in obj){buildParams(prefix+"["+name+"]",obj[name],traditional,add)
}}else{add(prefix,obj)
}}}jQuery.extend({active:0,lastModified:{},etag:{}});
function ajaxHandleResponses(s,jqXHR,responses){var contents=s.contents,dataTypes=s.dataTypes,responseFields=s.responseFields,ct,type,finalDataType,firstDataType;
for(type in responseFields){if(type in responses){jqXHR[responseFields[type]]=responses[type]
}}while(dataTypes[0]==="*"){dataTypes.shift();
if(ct===undefined){ct=s.mimeType||jqXHR.getResponseHeader("content-type")
}}if(ct){for(type in contents){if(contents[type]&&contents[type].test(ct)){dataTypes.unshift(type);
break
}}}if(dataTypes[0] in responses){finalDataType=dataTypes[0]
}else{for(type in responses){if(!dataTypes[0]||s.converters[type+" "+dataTypes[0]]){finalDataType=type;
break
}if(!firstDataType){firstDataType=type
}}finalDataType=finalDataType||firstDataType
}if(finalDataType){if(finalDataType!==dataTypes[0]){dataTypes.unshift(finalDataType)
}return responses[finalDataType]
}}function ajaxConvert(s,response){if(s.dataFilter){response=s.dataFilter(response,s.dataType)
}var dataTypes=s.dataTypes,converters={},i,key,length=dataTypes.length,tmp,current=dataTypes[0],prev,conversion,conv,conv1,conv2;
for(i=1;
i<length;
i++){if(i===1){for(key in s.converters){if(typeof key==="string"){converters[key.toLowerCase()]=s.converters[key]
}}}prev=current;
current=dataTypes[i];
if(current==="*"){current=prev
}else{if(prev!=="*"&&prev!==current){conversion=prev+" "+current;
conv=converters[conversion]||converters["* "+current];
if(!conv){conv2=undefined;
for(conv1 in converters){tmp=conv1.split(" ");
if(tmp[0]===prev||tmp[0]==="*"){conv2=converters[tmp[1]+" "+current];
if(conv2){conv1=converters[conv1];
if(conv1===true){conv=conv2
}else{if(conv2===true){conv=conv1
}}break
}}}}if(!(conv||conv2)){jQuery.error("No conversion from "+conversion.replace(" "," to "))
}if(conv!==true){response=conv?conv(response):conv2(conv1(response))
}}}}return response
}var jsc=jQuery.now(),jsre=/(\=)\?(&|$)|\?\?/i;
jQuery.ajaxSetup({jsonp:"callback",jsonpCallback:function(){return jQuery.expando+"_"+(jsc++)
}});
jQuery.ajaxPrefilter("json jsonp",function(s,originalSettings,jqXHR){var inspectData=s.contentType==="application/x-www-form-urlencoded"&&(typeof s.data==="string");
if(s.dataTypes[0]==="jsonp"||s.jsonp!==false&&(jsre.test(s.url)||inspectData&&jsre.test(s.data))){var responseContainer,jsonpCallback=s.jsonpCallback=jQuery.isFunction(s.jsonpCallback)?s.jsonpCallback():s.jsonpCallback,previous=window[jsonpCallback],url=s.url,data=s.data,replace="$1"+jsonpCallback+"$2";
if(s.jsonp!==false){url=url.replace(jsre,replace);
if(s.url===url){if(inspectData){data=data.replace(jsre,replace)
}if(s.data===data){url+=(/\?/.test(url)?"&":"?")+s.jsonp+"="+jsonpCallback
}}}s.url=url;
s.data=data;
window[jsonpCallback]=function(response){responseContainer=[response]
};
jqXHR.always(function(){window[jsonpCallback]=previous;
if(responseContainer&&jQuery.isFunction(previous)){window[jsonpCallback](responseContainer[0])
}});
s.converters["script json"]=function(){if(!responseContainer){jQuery.error(jsonpCallback+" was not called")
}return responseContainer[0]
};
s.dataTypes[0]="json";
return"script"
}});
jQuery.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/javascript|ecmascript/},converters:{"text script":function(text){jQuery.globalEval(text);
return text
}}});
jQuery.ajaxPrefilter("script",function(s){if(s.cache===undefined){s.cache=false
}if(s.crossDomain){s.type="GET";
s.global=false
}});
jQuery.ajaxTransport("script",function(s){if(s.crossDomain){var script,head=document.head||document.getElementsByTagName("head")[0]||document.documentElement;
return{send:function(_,callback){script=document.createElement("script");
script.async="async";
if(s.scriptCharset){script.charset=s.scriptCharset
}script.src=s.url;
script.onload=script.onreadystatechange=function(_,isAbort){if(isAbort||!script.readyState||/loaded|complete/.test(script.readyState)){script.onload=script.onreadystatechange=null;
if(head&&script.parentNode){head.removeChild(script)
}script=undefined;
if(!isAbort){callback(200,"success")
}}};
head.insertBefore(script,head.firstChild)
},abort:function(){if(script){script.onload(0,1)
}}}
}});
var xhrOnUnloadAbort=window.ActiveXObject?function(){for(var key in xhrCallbacks){xhrCallbacks[key](0,1)
}}:false,xhrId=0,xhrCallbacks;
function createStandardXHR(){try{return new window.XMLHttpRequest()
}catch(e){}}function createActiveXHR(){try{return new window.ActiveXObject("Microsoft.XMLHTTP")
}catch(e){}}jQuery.ajaxSettings.xhr=window.ActiveXObject?function(){return !this.isLocal&&createStandardXHR()||createActiveXHR()
}:createStandardXHR;
(function(xhr){jQuery.extend(jQuery.support,{ajax:!!xhr,cors:!!xhr&&("withCredentials" in xhr)})
})(jQuery.ajaxSettings.xhr());
if(jQuery.support.ajax){jQuery.ajaxTransport(function(s){if(!s.crossDomain||jQuery.support.cors){var callback;
return{send:function(headers,complete){var xhr=s.xhr(),handle,i;
if(s.username){xhr.open(s.type,s.url,s.async,s.username,s.password)
}else{xhr.open(s.type,s.url,s.async)
}if(s.xhrFields){for(i in s.xhrFields){xhr[i]=s.xhrFields[i]
}}if(s.mimeType&&xhr.overrideMimeType){xhr.overrideMimeType(s.mimeType)
}if(!s.crossDomain&&!headers["X-Requested-With"]){headers["X-Requested-With"]="XMLHttpRequest"
}try{for(i in headers){xhr.setRequestHeader(i,headers[i])
}}catch(_){}xhr.send((s.hasContent&&s.data)||null);
callback=function(_,isAbort){var status,statusText,responseHeaders,responses,xml;
try{if(callback&&(isAbort||xhr.readyState===4)){callback=undefined;
if(handle){xhr.onreadystatechange=jQuery.noop;
if(xhrOnUnloadAbort){delete xhrCallbacks[handle]
}}if(isAbort){if(xhr.readyState!==4){xhr.abort()
}}else{status=xhr.status;
responseHeaders=xhr.getAllResponseHeaders();
responses={};
xml=xhr.responseXML;
if(xml&&xml.documentElement){responses.xml=xml
}responses.text=xhr.responseText;
try{statusText=xhr.statusText
}catch(e){statusText=""
}if(!status&&s.isLocal&&!s.crossDomain){status=responses.text?200:404
}else{if(status===1223){status=204
}}}}}catch(firefoxAccessException){if(!isAbort){complete(-1,firefoxAccessException)
}}if(responses){complete(status,statusText,responses,responseHeaders)
}};
if(!s.async||xhr.readyState===4){callback()
}else{handle=++xhrId;
if(xhrOnUnloadAbort){if(!xhrCallbacks){xhrCallbacks={};
jQuery(window).unload(xhrOnUnloadAbort)
}xhrCallbacks[handle]=callback
}xhr.onreadystatechange=callback
}},abort:function(){if(callback){callback(0,1)
}}}
}})
}var elemdisplay={},iframe,iframeDoc,rfxtypes=/^(?:toggle|show|hide)$/,rfxnum=/^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,timerId,fxAttrs=[["height","marginTop","marginBottom","paddingTop","paddingBottom"],["width","marginLeft","marginRight","paddingLeft","paddingRight"],["opacity"]],fxNow;
jQuery.fn.extend({show:function(speed,easing,callback){var elem,display;
if(speed||speed===0){return this.animate(genFx("show",3),speed,easing,callback)
}else{for(var i=0,j=this.length;
i<j;
i++){elem=this[i];
if(elem.style){display=elem.style.display;
if(!jQuery._data(elem,"olddisplay")&&display==="none"){display=elem.style.display=""
}if(display===""&&jQuery.css(elem,"display")==="none"){jQuery._data(elem,"olddisplay",defaultDisplay(elem.nodeName))
}}}for(i=0;
i<j;
i++){elem=this[i];
if(elem.style){display=elem.style.display;
if(display===""||display==="none"){elem.style.display=jQuery._data(elem,"olddisplay")||""
}}}return this
}},hide:function(speed,easing,callback){if(speed||speed===0){return this.animate(genFx("hide",3),speed,easing,callback)
}else{for(var i=0,j=this.length;
i<j;
i++){if(this[i].style){var display=jQuery.css(this[i],"display");
if(display!=="none"&&!jQuery._data(this[i],"olddisplay")){jQuery._data(this[i],"olddisplay",display)
}}}for(i=0;
i<j;
i++){if(this[i].style){this[i].style.display="none"
}}return this
}},_toggle:jQuery.fn.toggle,toggle:function(fn,fn2,callback){var bool=typeof fn==="boolean";
if(jQuery.isFunction(fn)&&jQuery.isFunction(fn2)){this._toggle.apply(this,arguments)
}else{if(fn==null||bool){this.each(function(){var state=bool?fn:jQuery(this).is(":hidden");
jQuery(this)[state?"show":"hide"]()
})
}else{this.animate(genFx("toggle",3),fn,fn2,callback)
}}return this
},fadeTo:function(speed,to,easing,callback){return this.filter(":hidden").css("opacity",0).show().end().animate({opacity:to},speed,easing,callback)
},animate:function(prop,speed,easing,callback){var optall=jQuery.speed(speed,easing,callback);
if(jQuery.isEmptyObject(prop)){return this.each(optall.complete,[false])
}prop=jQuery.extend({},prop);
return this[optall.queue===false?"each":"queue"](function(){if(optall.queue===false){jQuery._mark(this)
}var opt=jQuery.extend({},optall),isElement=this.nodeType===1,hidden=isElement&&jQuery(this).is(":hidden"),name,val,p,display,e,parts,start,end,unit;
opt.animatedProperties={};
for(p in prop){name=jQuery.camelCase(p);
if(p!==name){prop[name]=prop[p];
delete prop[p]
}val=prop[name];
if(jQuery.isArray(val)){opt.animatedProperties[name]=val[1];
val=prop[name]=val[0]
}else{opt.animatedProperties[name]=opt.specialEasing&&opt.specialEasing[name]||opt.easing||"swing"
}if(val==="hide"&&hidden||val==="show"&&!hidden){return opt.complete.call(this)
}if(isElement&&(name==="height"||name==="width")){opt.overflow=[this.style.overflow,this.style.overflowX,this.style.overflowY];
if(jQuery.css(this,"display")==="inline"&&jQuery.css(this,"float")==="none"){if(!jQuery.support.inlineBlockNeedsLayout){this.style.display="inline-block"
}else{display=defaultDisplay(this.nodeName);
if(display==="inline"){this.style.display="inline-block"
}else{this.style.display="inline";
this.style.zoom=1
}}}}}if(opt.overflow!=null){this.style.overflow="hidden"
}for(p in prop){e=new jQuery.fx(this,opt,p);
val=prop[p];
if(rfxtypes.test(val)){e[val==="toggle"?hidden?"show":"hide":val]()
}else{parts=rfxnum.exec(val);
start=e.cur();
if(parts){end=parseFloat(parts[2]);
unit=parts[3]||(jQuery.cssNumber[p]?"":"px");
if(unit!=="px"){jQuery.style(this,p,(end||1)+unit);
start=((end||1)/e.cur())*start;
jQuery.style(this,p,start+unit)
}if(parts[1]){end=((parts[1]==="-="?-1:1)*end)+start
}e.custom(start,end,unit)
}else{e.custom(start,val,"")
}}}return true
})
},stop:function(clearQueue,gotoEnd){if(clearQueue){this.queue([])
}this.each(function(){var timers=jQuery.timers,i=timers.length;
if(!gotoEnd){jQuery._unmark(true,this)
}while(i--){if(timers[i].elem===this){if(gotoEnd){timers[i](true)
}timers.splice(i,1)
}}});
if(!gotoEnd){this.dequeue()
}return this
}});
function createFxNow(){setTimeout(clearFxNow,0);
return(fxNow=jQuery.now())
}function clearFxNow(){fxNow=undefined
}function genFx(type,num){var obj={};
jQuery.each(fxAttrs.concat.apply([],fxAttrs.slice(0,num)),function(){obj[this]=type
});
return obj
}jQuery.each({slideDown:genFx("show",1),slideUp:genFx("hide",1),slideToggle:genFx("toggle",1),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(name,props){jQuery.fn[name]=function(speed,easing,callback){return this.animate(props,speed,easing,callback)
}
});
jQuery.extend({speed:function(speed,easing,fn){var opt=speed&&typeof speed==="object"?jQuery.extend({},speed):{complete:fn||!fn&&easing||jQuery.isFunction(speed)&&speed,duration:speed,easing:fn&&easing||easing&&!jQuery.isFunction(easing)&&easing};
opt.duration=jQuery.fx.off?0:typeof opt.duration==="number"?opt.duration:opt.duration in jQuery.fx.speeds?jQuery.fx.speeds[opt.duration]:jQuery.fx.speeds._default;
opt.old=opt.complete;
opt.complete=function(noUnmark){if(jQuery.isFunction(opt.old)){opt.old.call(this)
}if(opt.queue!==false){jQuery.dequeue(this)
}else{if(noUnmark!==false){jQuery._unmark(this)
}}};
return opt
},easing:{linear:function(p,n,firstNum,diff){return firstNum+diff*p
},swing:function(p,n,firstNum,diff){return((-Math.cos(p*Math.PI)/2)+0.5)*diff+firstNum
}},timers:[],fx:function(elem,options,prop){this.options=options;
this.elem=elem;
this.prop=prop;
options.orig=options.orig||{}
}});
jQuery.fx.prototype={update:function(){if(this.options.step){this.options.step.call(this.elem,this.now,this)
}(jQuery.fx.step[this.prop]||jQuery.fx.step._default)(this)
},cur:function(){if(this.elem[this.prop]!=null&&(!this.elem.style||this.elem.style[this.prop]==null)){return this.elem[this.prop]
}var parsed,r=jQuery.css(this.elem,this.prop);
return isNaN(parsed=parseFloat(r))?!r||r==="auto"?0:r:parsed
},custom:function(from,to,unit){var self=this,fx=jQuery.fx;
this.startTime=fxNow||createFxNow();
this.start=from;
this.end=to;
this.unit=unit||this.unit||(jQuery.cssNumber[this.prop]?"":"px");
this.now=this.start;
this.pos=this.state=0;
function t(gotoEnd){return self.step(gotoEnd)
}t.elem=this.elem;
if(t()&&jQuery.timers.push(t)&&!timerId){timerId=setInterval(fx.tick,fx.interval)
}},show:function(){this.options.orig[this.prop]=jQuery.style(this.elem,this.prop);
this.options.show=true;
this.custom(this.prop==="width"||this.prop==="height"?1:0,this.cur());
jQuery(this.elem).show()
},hide:function(){this.options.orig[this.prop]=jQuery.style(this.elem,this.prop);
this.options.hide=true;
this.custom(this.cur(),0)
},step:function(gotoEnd){var t=fxNow||createFxNow(),done=true,elem=this.elem,options=this.options,i,n;
if(gotoEnd||t>=options.duration+this.startTime){this.now=this.end;
this.pos=this.state=1;
this.update();
options.animatedProperties[this.prop]=true;
for(i in options.animatedProperties){if(options.animatedProperties[i]!==true){done=false
}}if(done){if(options.overflow!=null&&!jQuery.support.shrinkWrapBlocks){jQuery.each(["","X","Y"],function(index,value){elem.style["overflow"+value]=options.overflow[index]
})
}if(options.hide){jQuery(elem).hide()
}if(options.hide||options.show){for(var p in options.animatedProperties){jQuery.style(elem,p,options.orig[p])
}}options.complete.call(elem)
}return false
}else{if(options.duration==Infinity){this.now=t
}else{n=t-this.startTime;
this.state=n/options.duration;
this.pos=jQuery.easing[options.animatedProperties[this.prop]](this.state,n,0,1,options.duration);
this.now=this.start+((this.end-this.start)*this.pos)
}this.update()
}return true
}};
jQuery.extend(jQuery.fx,{tick:function(){for(var timers=jQuery.timers,i=0;
i<timers.length;
++i){if(!timers[i]()){timers.splice(i--,1)
}}if(!timers.length){jQuery.fx.stop()
}},interval:13,stop:function(){clearInterval(timerId);
timerId=null
},speeds:{slow:600,fast:200,_default:400},step:{opacity:function(fx){jQuery.style(fx.elem,"opacity",fx.now)
},_default:function(fx){if(fx.elem.style&&fx.elem.style[fx.prop]!=null){fx.elem.style[fx.prop]=(fx.prop==="width"||fx.prop==="height"?Math.max(0,fx.now):fx.now)+fx.unit
}else{fx.elem[fx.prop]=fx.now
}}}});
if(jQuery.expr&&jQuery.expr.filters){jQuery.expr.filters.animated=function(elem){return jQuery.grep(jQuery.timers,function(fn){return elem===fn.elem
}).length
}
}function defaultDisplay(nodeName){if(!elemdisplay[nodeName]){var body=document.body,elem=jQuery("<"+nodeName+">").appendTo(body),display=elem.css("display");
elem.remove();
if(display==="none"||display===""){if(!iframe){iframe=document.createElement("iframe");
iframe.frameBorder=iframe.width=iframe.height=0
}body.appendChild(iframe);
if(!iframeDoc||!iframe.createElement){iframeDoc=(iframe.contentWindow||iframe.contentDocument).document;
iframeDoc.write((document.compatMode==="CSS1Compat"?"<!doctype html>":"")+"<html><body>");
iframeDoc.close()
}elem=iframeDoc.createElement(nodeName);
iframeDoc.body.appendChild(elem);
display=jQuery.css(elem,"display");
body.removeChild(iframe)
}elemdisplay[nodeName]=display
}return elemdisplay[nodeName]
}var rtable=/^t(?:able|d|h)$/i,rroot=/^(?:body|html)$/i;
if("getBoundingClientRect" in document.documentElement){jQuery.fn.offset=function(options){var elem=this[0],box;
if(options){return this.each(function(i){jQuery.offset.setOffset(this,options,i)
})
}if(!elem||!elem.ownerDocument){return null
}if(elem===elem.ownerDocument.body){return jQuery.offset.bodyOffset(elem)
}try{box=elem.getBoundingClientRect()
}catch(e){}var doc=elem.ownerDocument,docElem=doc.documentElement;
if(!box||!jQuery.contains(docElem,elem)){return box?{top:box.top,left:box.left}:{top:0,left:0}
}var body=doc.body,win=getWindow(doc),clientTop=docElem.clientTop||body.clientTop||0,clientLeft=docElem.clientLeft||body.clientLeft||0,scrollTop=win.pageYOffset||jQuery.support.boxModel&&docElem.scrollTop||body.scrollTop,scrollLeft=win.pageXOffset||jQuery.support.boxModel&&docElem.scrollLeft||body.scrollLeft,top=box.top+scrollTop-clientTop,left=box.left+scrollLeft-clientLeft;
return{top:top,left:left}
}
}else{jQuery.fn.offset=function(options){var elem=this[0];
if(options){return this.each(function(i){jQuery.offset.setOffset(this,options,i)
})
}if(!elem||!elem.ownerDocument){return null
}if(elem===elem.ownerDocument.body){return jQuery.offset.bodyOffset(elem)
}jQuery.offset.initialize();
var computedStyle,offsetParent=elem.offsetParent,prevOffsetParent=elem,doc=elem.ownerDocument,docElem=doc.documentElement,body=doc.body,defaultView=doc.defaultView,prevComputedStyle=defaultView?defaultView.getComputedStyle(elem,null):elem.currentStyle,top=elem.offsetTop,left=elem.offsetLeft;
while((elem=elem.parentNode)&&elem!==body&&elem!==docElem){if(jQuery.offset.supportsFixedPosition&&prevComputedStyle.position==="fixed"){break
}computedStyle=defaultView?defaultView.getComputedStyle(elem,null):elem.currentStyle;
top-=elem.scrollTop;
left-=elem.scrollLeft;
if(elem===offsetParent){top+=elem.offsetTop;
left+=elem.offsetLeft;
if(jQuery.offset.doesNotAddBorder&&!(jQuery.offset.doesAddBorderForTableAndCells&&rtable.test(elem.nodeName))){top+=parseFloat(computedStyle.borderTopWidth)||0;
left+=parseFloat(computedStyle.borderLeftWidth)||0
}prevOffsetParent=offsetParent;
offsetParent=elem.offsetParent
}if(jQuery.offset.subtractsBorderForOverflowNotVisible&&computedStyle.overflow!=="visible"){top+=parseFloat(computedStyle.borderTopWidth)||0;
left+=parseFloat(computedStyle.borderLeftWidth)||0
}prevComputedStyle=computedStyle
}if(prevComputedStyle.position==="relative"||prevComputedStyle.position==="static"){top+=body.offsetTop;
left+=body.offsetLeft
}if(jQuery.offset.supportsFixedPosition&&prevComputedStyle.position==="fixed"){top+=Math.max(docElem.scrollTop,body.scrollTop);
left+=Math.max(docElem.scrollLeft,body.scrollLeft)
}return{top:top,left:left}
}
}jQuery.offset={initialize:function(){var body=document.body,container=document.createElement("div"),innerDiv,checkDiv,table,td,bodyMarginTop=parseFloat(jQuery.css(body,"marginTop"))||0,html="<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";
jQuery.extend(container.style,{position:"absolute",top:0,left:0,margin:0,border:0,width:"1px",height:"1px",visibility:"hidden"});
container.innerHTML=html;
body.insertBefore(container,body.firstChild);
innerDiv=container.firstChild;
checkDiv=innerDiv.firstChild;
td=innerDiv.nextSibling.firstChild.firstChild;
this.doesNotAddBorder=(checkDiv.offsetTop!==5);
this.doesAddBorderForTableAndCells=(td.offsetTop===5);
checkDiv.style.position="fixed";
checkDiv.style.top="20px";
this.supportsFixedPosition=(checkDiv.offsetTop===20||checkDiv.offsetTop===15);
checkDiv.style.position=checkDiv.style.top="";
innerDiv.style.overflow="hidden";
innerDiv.style.position="relative";
this.subtractsBorderForOverflowNotVisible=(checkDiv.offsetTop===-5);
this.doesNotIncludeMarginInBodyOffset=(body.offsetTop!==bodyMarginTop);
body.removeChild(container);
jQuery.offset.initialize=jQuery.noop
},bodyOffset:function(body){var top=body.offsetTop,left=body.offsetLeft;
jQuery.offset.initialize();
if(jQuery.offset.doesNotIncludeMarginInBodyOffset){top+=parseFloat(jQuery.css(body,"marginTop"))||0;
left+=parseFloat(jQuery.css(body,"marginLeft"))||0
}return{top:top,left:left}
},setOffset:function(elem,options,i){var position=jQuery.css(elem,"position");
if(position==="static"){elem.style.position="relative"
}var curElem=jQuery(elem),curOffset=curElem.offset(),curCSSTop=jQuery.css(elem,"top"),curCSSLeft=jQuery.css(elem,"left"),calculatePosition=(position==="absolute"||position==="fixed")&&jQuery.inArray("auto",[curCSSTop,curCSSLeft])>-1,props={},curPosition={},curTop,curLeft;
if(calculatePosition){curPosition=curElem.position();
curTop=curPosition.top;
curLeft=curPosition.left
}else{curTop=parseFloat(curCSSTop)||0;
curLeft=parseFloat(curCSSLeft)||0
}if(jQuery.isFunction(options)){options=options.call(elem,i,curOffset)
}if(options.top!=null){props.top=(options.top-curOffset.top)+curTop
}if(options.left!=null){props.left=(options.left-curOffset.left)+curLeft
}if("using" in options){options.using.call(elem,props)
}else{curElem.css(props)
}}};
jQuery.fn.extend({position:function(){if(!this[0]){return null
}var elem=this[0],offsetParent=this.offsetParent(),offset=this.offset(),parentOffset=rroot.test(offsetParent[0].nodeName)?{top:0,left:0}:offsetParent.offset();
offset.top-=parseFloat(jQuery.css(elem,"marginTop"))||0;
offset.left-=parseFloat(jQuery.css(elem,"marginLeft"))||0;
parentOffset.top+=parseFloat(jQuery.css(offsetParent[0],"borderTopWidth"))||0;
parentOffset.left+=parseFloat(jQuery.css(offsetParent[0],"borderLeftWidth"))||0;
return{top:offset.top-parentOffset.top,left:offset.left-parentOffset.left}
},offsetParent:function(){return this.map(function(){var offsetParent=this.offsetParent||document.body;
while(offsetParent&&(!rroot.test(offsetParent.nodeName)&&jQuery.css(offsetParent,"position")==="static")){offsetParent=offsetParent.offsetParent
}return offsetParent
})
}});
jQuery.each(["Left","Top"],function(i,name){var method="scroll"+name;
jQuery.fn[method]=function(val){var elem,win;
if(val===undefined){elem=this[0];
if(!elem){return null
}win=getWindow(elem);
return win?("pageXOffset" in win)?win[i?"pageYOffset":"pageXOffset"]:jQuery.support.boxModel&&win.document.documentElement[method]||win.document.body[method]:elem[method]
}return this.each(function(){win=getWindow(this);
if(win){win.scrollTo(!i?val:jQuery(win).scrollLeft(),i?val:jQuery(win).scrollTop())
}else{this[method]=val
}})
}
});
function getWindow(elem){return jQuery.isWindow(elem)?elem:elem.nodeType===9?elem.defaultView||elem.parentWindow:false
}jQuery.each(["Height","Width"],function(i,name){var type=name.toLowerCase();
jQuery.fn["inner"+name]=function(){var elem=this[0];
return elem&&elem.style?parseFloat(jQuery.css(elem,type,"padding")):null
};
jQuery.fn["outer"+name]=function(margin){var elem=this[0];
return elem&&elem.style?parseFloat(jQuery.css(elem,type,margin?"margin":"border")):null
};
jQuery.fn[type]=function(size){var elem=this[0];
if(!elem){return size==null?null:this
}if(jQuery.isFunction(size)){return this.each(function(i){var self=jQuery(this);
self[type](size.call(this,i,self[type]()))
})
}if(jQuery.isWindow(elem)){var docElemProp=elem.document.documentElement["client"+name],body=elem.document.body;
return elem.document.compatMode==="CSS1Compat"&&docElemProp||body&&body["client"+name]||docElemProp
}else{if(elem.nodeType===9){return Math.max(elem.documentElement["client"+name],elem.body["scroll"+name],elem.documentElement["scroll"+name],elem.body["offset"+name],elem.documentElement["offset"+name])
}else{if(size===undefined){var orig=jQuery.css(elem,type),ret=parseFloat(orig);
return jQuery.isNaN(ret)?orig:ret
}else{return this.css(type,typeof size==="string"?size:size+"px")
}}}}
});
window.jQuery=window.$=jQuery
})(window);
(function($){$.fn.autoResize=function(options){var settings=$.extend({onResize:function(){},animate:true,animateDuration:150,animateCallback:function(){},extraSpace:20,limit:1000},options);
this.filter("textarea").each(function(){var textarea=$(this).css({resize:"none","overflow-y":"hidden"}),origHeight=textarea.height(),clone=(function(){var props=["height","width","lineHeight","textDecoration","letterSpacing"],propOb={};
$.each(props,function(i,prop){propOb[prop]=textarea.css(prop)
});
return textarea.clone().removeAttr("id").removeAttr("name").css({position:"absolute",top:0,left:-9999}).css(propOb).attr("tabIndex","-1").insertAfter("body")
})(),lastScrollTop=null,updateSize=function(){clone.height(0).val($(this).val()).scrollTop(10000);
var scrollTop=Math.max(clone.scrollTop(),(settings.origHeight?settings.origHeight:origHeight))+settings.extraSpace,toChange=$(this).add(clone);
if(lastScrollTop===scrollTop){return
}lastScrollTop=scrollTop;
if(scrollTop>=settings.limit){$(this).css("overflow-y","");
return
}settings.onResize.call(this);
settings.animate&&textarea.css("display")==="block"?toChange.stop().animate({height:scrollTop},settings.animateDuration,settings.animateCallback):toChange.height(scrollTop)
};
remove=function(){clone.remove()
};
textarea.unbind(".dynSiz").bind("keyup.dynSiz",updateSize).bind("keydown.dynSiz",updateSize).bind("change.dynSiz",updateSize).bind("blur",remove)
});
return this
}
})(jQuery);
(function(){var root=this;
var previousBackbone=root.Backbone;
var Backbone;
if(typeof exports!=="undefined"){Backbone=exports
}else{Backbone=root.Backbone={}
}Backbone.VERSION="0.5.3";
var _=root._;
if(!_&&(typeof require!=="undefined")){_=require("underscore")._
}var $=root.jQuery||root.Zepto;
Backbone.noConflict=function(){root.Backbone=previousBackbone;
return this
};
Backbone.emulateHTTP=false;
Backbone.emulateJSON=false;
Backbone.Events={bind:function(ev,callback,context){var calls=this._callbacks||(this._callbacks={});
var list=calls[ev]||(calls[ev]=[]);
list.push([callback,context]);
return this
},unbind:function(ev,callback){var calls;
if(!ev){this._callbacks={}
}else{if(calls=this._callbacks){if(!callback){calls[ev]=[]
}else{var list=calls[ev];
if(!list){return this
}for(var i=0,l=list.length;
i<l;
i++){if(list[i]&&callback===list[i][0]){list[i]=null;
break
}}}}}return this
},trigger:function(eventName){var list,calls,ev,callback,args;
var both=2;
if(!(calls=this._callbacks)){return this
}while(both--){ev=both?eventName:"all";
if(list=calls[ev]){for(var i=0,l=list.length;
i<l;
i++){if(!(callback=list[i])){list.splice(i,1);
i--;
l--
}else{args=both?Array.prototype.slice.call(arguments,1):arguments;
callback[0].apply(callback[1]||this,args)
}}}}return this
}};
Backbone.Model=function(attributes,options){var defaults;
attributes||(attributes={});
if(defaults=this.defaults){if(_.isFunction(defaults)){defaults=defaults.call(this)
}attributes=_.extend({},defaults,attributes)
}this.attributes={};
this._escapedAttributes={};
this.cid=_.uniqueId("c");
this.set(attributes,{silent:true});
this._changed=false;
this._previousAttributes=_.clone(this.attributes);
if(options&&options.collection){this.collection=options.collection
}this.initialize(attributes,options)
};
_.extend(Backbone.Model.prototype,Backbone.Events,{_previousAttributes:null,_changed:false,idAttribute:"id",initialize:function(){},toJSON:function(){return _.clone(this.attributes)
},get:function(attr){return this.attributes[attr]
},escape:function(attr){var html;
if(html=this._escapedAttributes[attr]){return html
}var val=this.attributes[attr];
return this._escapedAttributes[attr]=escapeHTML(val==null?"":""+val)
},has:function(attr){return this.attributes[attr]!=null
},set:function(attrs,options){options||(options={});
if(!attrs){return this
}if(attrs.attributes){attrs=attrs.attributes
}var now=this.attributes,escaped=this._escapedAttributes;
if(!options.silent&&this.validate&&!this._performValidation(attrs,options)){return false
}if(this.idAttribute in attrs){this.id=attrs[this.idAttribute]
}var alreadyChanging=this._changing;
this._changing=true;
for(var attr in attrs){var val=attrs[attr];
if(!_.isEqual(now[attr],val)){now[attr]=val;
delete escaped[attr];
this._changed=true;
if(!options.silent){this.trigger("change:"+attr,this,val,options)
}}}if(!alreadyChanging&&!options.silent&&this._changed){this.change(options)
}this._changing=false;
return this
},unset:function(attr,options){if(!(attr in this.attributes)){return this
}options||(options={});
var value=this.attributes[attr];
var validObj={};
validObj[attr]=void 0;
if(!options.silent&&this.validate&&!this._performValidation(validObj,options)){return false
}delete this.attributes[attr];
delete this._escapedAttributes[attr];
if(attr==this.idAttribute){delete this.id
}this._changed=true;
if(!options.silent){this.trigger("change:"+attr,this,void 0,options);
this.change(options)
}return this
},clear:function(options){options||(options={});
var attr;
var old=this.attributes;
var validObj={};
for(attr in old){validObj[attr]=void 0
}if(!options.silent&&this.validate&&!this._performValidation(validObj,options)){return false
}this.attributes={};
this._escapedAttributes={};
this._changed=true;
if(!options.silent){for(attr in old){this.trigger("change:"+attr,this,void 0,options)
}this.change(options)
}return this
},fetch:function(options){options||(options={});
var model=this;
var success=options.success;
options.success=function(resp,status,xhr){if(!model.set(model.parse(resp,xhr),options)){return false
}if(success){success(model,resp)
}};
options.error=wrapError(options.error,model,options);
return(this.sync||Backbone.sync).call(this,"read",this,options)
},save:function(attrs,options){options||(options={});
if(attrs&&!this.set(attrs,options)){return false
}var model=this;
var success=options.success;
options.success=function(resp,status,xhr){if(!model.set(model.parse(resp,xhr),options)){return false
}if(success){success(model,resp,xhr)
}};
options.error=wrapError(options.error,model,options);
var method=this.isNew()?"create":"update";
return(this.sync||Backbone.sync).call(this,method,this,options)
},destroy:function(options){options||(options={});
if(this.isNew()){return this.trigger("destroy",this,this.collection,options)
}var model=this;
var success=options.success;
options.success=function(resp){model.trigger("destroy",model,model.collection,options);
if(success){success(model,resp)
}};
options.error=wrapError(options.error,model,options);
return(this.sync||Backbone.sync).call(this,"delete",this,options)
},url:function(){var base=getUrl(this.collection)||this.urlRoot||urlError();
if(this.isNew()){return base
}return base+(base.charAt(base.length-1)=="/"?"":"/")+encodeURIComponent(this.id)
},parse:function(resp,xhr){return resp
},clone:function(){return new this.constructor(this)
},isNew:function(){return this.id==null
},change:function(options){this.trigger("change",this,options);
this._previousAttributes=_.clone(this.attributes);
this._changed=false
},hasChanged:function(attr){if(attr){return this._previousAttributes[attr]!=this.attributes[attr]
}return this._changed
},changedAttributes:function(now){now||(now=this.attributes);
var old=this._previousAttributes;
var changed=false;
for(var attr in now){if(!_.isEqual(old[attr],now[attr])){changed=changed||{};
changed[attr]=now[attr]
}}return changed
},previous:function(attr){if(!attr||!this._previousAttributes){return null
}return this._previousAttributes[attr]
},previousAttributes:function(){return _.clone(this._previousAttributes)
},_performValidation:function(attrs,options){var error=this.validate(attrs);
if(error){if(options.error){options.error(this,error,options)
}else{this.trigger("error",this,error,options)
}return false
}return true
}});
Backbone.Collection=function(models,options){options||(options={});
if(options.comparator){this.comparator=options.comparator
}_.bindAll(this,"_onModelEvent","_removeReference");
this._reset();
if(models){this.reset(models,{silent:true})
}this.initialize.apply(this,arguments)
};
_.extend(Backbone.Collection.prototype,Backbone.Events,{model:Backbone.Model,initialize:function(){},toJSON:function(){return this.map(function(model){return model.toJSON()
})
},add:function(models,options){if(_.isArray(models)){for(var i=0,l=models.length;
i<l;
i++){this._add(models[i],options)
}}else{this._add(models,options)
}return this
},remove:function(models,options){if(_.isArray(models)){for(var i=0,l=models.length;
i<l;
i++){this._remove(models[i],options)
}}else{this._remove(models,options)
}return this
},get:function(id){if(id==null){return null
}return this._byId[id.id!=null?id.id:id]
},getByCid:function(cid){return cid&&this._byCid[cid.cid||cid]
},at:function(index){return this.models[index]
},sort:function(options){options||(options={});
if(!this.comparator){throw new Error("Cannot sort a set without a comparator")
}this.models=this.sortBy(this.comparator);
if(!options.silent){this.trigger("reset",this,options)
}return this
},pluck:function(attr){return _.map(this.models,function(model){return model.get(attr)
})
},reset:function(models,options){models||(models=[]);
options||(options={});
this.each(this._removeReference);
this._reset();
this.add(models,{silent:true});
if(!options.silent){this.trigger("reset",this,options)
}return this
},fetch:function(options){options||(options={});
var collection=this;
var success=options.success;
options.success=function(resp,status,xhr){collection[options.add?"add":"reset"](collection.parse(resp,xhr),options);
if(success){success(collection,resp)
}};
options.error=wrapError(options.error,collection,options);
return(this.sync||Backbone.sync).call(this,"read",this,options)
},create:function(model,options){var coll=this;
options||(options={});
model=this._prepareModel(model,options);
if(!model){return false
}var success=options.success;
options.success=function(nextModel,resp,xhr){coll.add(nextModel,options);
if(success){success(nextModel,resp,xhr)
}};
model.save(null,options);
return model
},parse:function(resp,xhr){return resp
},chain:function(){return _(this.models).chain()
},_reset:function(options){this.length=0;
this.models=[];
this._byId={};
this._byCid={}
},_prepareModel:function(model,options){if(!(model instanceof Backbone.Model)){var attrs=model;
model=new this.model(attrs,{collection:this});
if(model.validate&&!model._performValidation(attrs,options)){model=false
}}else{if(!model.collection){model.collection=this
}}return model
},_add:function(model,options){options||(options={});
model=this._prepareModel(model,options);
if(!model){return false
}var already=this.getByCid(model);
if(already){throw new Error(["Can't add the same model to a set twice",already.id])
}this._byId[model.id]=model;
this._byCid[model.cid]=model;
var index=options.at!=null?options.at:this.comparator?this.sortedIndex(model,this.comparator):this.length;
this.models.splice(index,0,model);
model.bind("all",this._onModelEvent);
this.length++;
if(!options.silent){model.trigger("add",model,this,options)
}return model
},_remove:function(model,options){options||(options={});
model=this.getByCid(model)||this.get(model);
if(!model){return null
}delete this._byId[model.id];
delete this._byCid[model.cid];
this.models.splice(this.indexOf(model),1);
this.length--;
if(!options.silent){model.trigger("remove",model,this,options)
}this._removeReference(model);
return model
},_removeReference:function(model){if(this==model.collection){delete model.collection
}model.unbind("all",this._onModelEvent)
},_onModelEvent:function(ev,model,collection,options){if((ev=="add"||ev=="remove")&&collection!=this){return
}if(ev=="destroy"){this._remove(model,options)
}if(model&&ev==="change:"+model.idAttribute){delete this._byId[model.previous(model.idAttribute)];
this._byId[model.id]=model
}this.trigger.apply(this,arguments)
}});
var methods=["forEach","each","map","reduce","reduceRight","find","detect","filter","select","reject","every","all","some","any","include","contains","invoke","max","min","sortBy","sortedIndex","toArray","size","first","rest","last","without","indexOf","lastIndexOf","isEmpty","groupBy"];
_.each(methods,function(method){Backbone.Collection.prototype[method]=function(){return _[method].apply(_,[this.models].concat(_.toArray(arguments)))
}
});
Backbone.Router=function(options){options||(options={});
if(options.routes){this.routes=options.routes
}this._bindRoutes();
this.initialize.apply(this,arguments)
};
var namedParam=/:([\w\d]+)/g;
var splatParam=/\*([\w\d]+)/g;
var escapeRegExp=/[-[\]{}()+?.,\\^$|#\s]/g;
_.extend(Backbone.Router.prototype,Backbone.Events,{initialize:function(){},route:function(route,name,callback){Backbone.history||(Backbone.history=new Backbone.History);
if(!_.isRegExp(route)){route=this._routeToRegExp(route)
}Backbone.history.route(route,_.bind(function(fragment){var args=this._extractParameters(route,fragment);
callback.apply(this,args);
this.trigger.apply(this,["route:"+name].concat(args))
},this))
},navigate:function(fragment,triggerRoute){Backbone.history.navigate(fragment,triggerRoute)
},_bindRoutes:function(){if(!this.routes){return
}var routes=[];
for(var route in this.routes){routes.unshift([route,this.routes[route]])
}for(var i=0,l=routes.length;
i<l;
i++){this.route(routes[i][0],routes[i][1],this[routes[i][1]])
}},_routeToRegExp:function(route){route=route.replace(escapeRegExp,"\\$&").replace(namedParam,"([^/]*)").replace(splatParam,"(.*?)");
return new RegExp("^"+route+"$")
},_extractParameters:function(route,fragment){return route.exec(fragment).slice(1)
}});
Backbone.History=function(){this.handlers=[];
_.bindAll(this,"checkUrl")
};
var hashStrip=/^#*/;
var isExplorer=/msie [\w.]+/;
var historyStarted=false;
_.extend(Backbone.History.prototype,{interval:50,getFragment:function(fragment,forcePushState){if(fragment==null){if(this._hasPushState||forcePushState){fragment=window.location.pathname;
var search=window.location.search;
if(search){fragment+=search
}if(fragment.indexOf(this.options.root)==0){fragment=fragment.substr(this.options.root.length)
}}else{fragment=window.location.hash
}}return decodeURIComponent(fragment.replace(hashStrip,""))
},start:function(options){if(historyStarted){throw new Error("Backbone.history has already been started")
}this.options=_.extend({},{root:"/"},this.options,options);
this._wantsPushState=!!this.options.pushState;
this._hasPushState=!!(this.options.pushState&&window.history&&window.history.pushState);
var fragment=this.getFragment();
var docMode=document.documentMode;
var oldIE=(isExplorer.exec(navigator.userAgent.toLowerCase())&&(!docMode||docMode<=7));
if(oldIE){this.iframe=$('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo("body")[0].contentWindow;
this.navigate(fragment)
}if(this._hasPushState){$(window).bind("popstate",this.checkUrl)
}else{if("onhashchange" in window&&!oldIE){$(window).bind("hashchange",this.checkUrl)
}else{setInterval(this.checkUrl,this.interval)
}}this.fragment=fragment;
historyStarted=true;
var loc=window.location;
var atRoot=loc.pathname==this.options.root;
if(this._wantsPushState&&!this._hasPushState&&!atRoot){this.fragment=this.getFragment(null,true);
window.location.replace(this.options.root+"#"+this.fragment);
return true
}else{if(this._wantsPushState&&this._hasPushState&&atRoot&&loc.hash){this.fragment=loc.hash.replace(hashStrip,"");
window.history.replaceState({},document.title,loc.protocol+"//"+loc.host+this.options.root+this.fragment)
}}if(!this.options.silent){return this.loadUrl()
}},route:function(route,callback){this.handlers.unshift({route:route,callback:callback})
},checkUrl:function(e){var current=this.getFragment();
if(current==this.fragment&&this.iframe){current=this.getFragment(this.iframe.location.hash)
}if(current==this.fragment||current==decodeURIComponent(this.fragment)){return false
}if(this.iframe){this.navigate(current)
}this.loadUrl()||this.loadUrl(window.location.hash)
},loadUrl:function(fragmentOverride){var fragment=this.fragment=this.getFragment(fragmentOverride);
var matched=_.any(this.handlers,function(handler){if(handler.route.test(fragment)){handler.callback(fragment);
return true
}});
return matched
},navigate:function(fragment,triggerRoute){var frag=(fragment||"").replace(hashStrip,"");
if(this.fragment==frag||this.fragment==decodeURIComponent(frag)){return
}if(this._hasPushState){var loc=window.location;
if(frag.indexOf(this.options.root)!=0){frag=this.options.root+frag
}this.fragment=frag;
window.history.pushState({},document.title,loc.protocol+"//"+loc.host+frag)
}else{window.location.hash=this.fragment=frag;
if(this.iframe&&(frag!=this.getFragment(this.iframe.location.hash))){this.iframe.document.open().close();
this.iframe.location.hash=frag
}}if(triggerRoute){this.loadUrl(fragment)
}}});
Backbone.View=function(options){this.cid=_.uniqueId("view");
this._configure(options||{});
this._ensureElement();
this.delegateEvents();
this.initialize.apply(this,arguments)
};
var selectorDelegate=function(selector){return $(selector,this.el)
};
var eventSplitter=/^(\S+)\s*(.*)$/;
var viewOptions=["model","collection","el","id","attributes","className","tagName"];
_.extend(Backbone.View.prototype,Backbone.Events,{tagName:"div",$:selectorDelegate,initialize:function(){},render:function(){return this
},remove:function(){$(this.el).remove();
return this
},make:function(tagName,attributes,content){var el=document.createElement(tagName);
if(attributes){$(el).attr(attributes)
}if(content){$(el).html(content)
}return el
},delegateEvents:function(events){if(!(events||(events=this.events))){return
}if(_.isFunction(events)){events=events.call(this)
}$(this.el).unbind(".delegateEvents"+this.cid);
for(var key in events){var method=this[events[key]];
if(!method){throw new Error('Event "'+events[key]+'" does not exist')
}var match=key.match(eventSplitter);
var eventName=match[1],selector=match[2];
method=_.bind(method,this);
eventName+=".delegateEvents"+this.cid;
if(selector===""){$(this.el).bind(eventName,method)
}else{$(this.el).delegate(selector,eventName,method)
}}},_configure:function(options){if(this.options){options=_.extend({},this.options,options)
}for(var i=0,l=viewOptions.length;
i<l;
i++){var attr=viewOptions[i];
if(options[attr]){this[attr]=options[attr]
}}this.options=options
},_ensureElement:function(){if(!this.el){var attrs=this.attributes||{};
if(this.id){attrs.id=this.id
}if(this.className){attrs["class"]=this.className
}this.el=this.make(this.tagName,attrs)
}else{if(_.isString(this.el)){this.el=$(this.el).get(0)
}}}});
var extend=function(protoProps,classProps){var child=inherits(this,protoProps,classProps);
child.extend=this.extend;
return child
};
Backbone.Model.extend=Backbone.Collection.extend=Backbone.Router.extend=Backbone.View.extend=extend;
var methodMap={"create":"POST","update":"PUT","delete":"DELETE","read":"GET"};
Backbone.sync=function(method,model,options){var type=methodMap[method];
var params=_.extend({type:type,dataType:"json"},options);
if(!params.url){params.url=getUrl(model)||urlError()
}if(!params.data&&model&&(method=="create"||method=="update")){params.contentType="application/json";
params.data=JSON.stringify(model.toJSON())
}if(Backbone.emulateJSON){params.contentType="application/x-www-form-urlencoded";
params.data=params.data?{model:params.data}:{}
}if(Backbone.emulateHTTP){if(type==="PUT"||type==="DELETE"){if(Backbone.emulateJSON){params.data._method=type
}params.type="POST";
params.beforeSend=function(xhr){xhr.setRequestHeader("X-HTTP-Method-Override",type)
}
}}if(params.type!=="GET"&&!Backbone.emulateJSON){params.processData=false
}return $.ajax(params)
};
var ctor=function(){};
var inherits=function(parent,protoProps,staticProps){var child;
if(protoProps&&protoProps.hasOwnProperty("constructor")){child=protoProps.constructor
}else{child=function(){return parent.apply(this,arguments)
}
}_.extend(child,parent);
ctor.prototype=parent.prototype;
child.prototype=new ctor();
if(protoProps){_.extend(child.prototype,protoProps)
}if(staticProps){_.extend(child,staticProps)
}child.prototype.constructor=child;
child.__super__=parent.prototype;
return child
};
var getUrl=function(object){if(!(object&&object.url)){return null
}return _.isFunction(object.url)?object.url():object.url
};
var urlError=function(){throw new Error('A "url" property or function must be specified')
};
var wrapError=function(onError,model,options){return function(resp){if(onError){onError(model,resp,options)
}else{model.trigger("error",model,resp,options)
}}
};
var escapeHTML=function(string){return string.replace(/&(?!\w+;|#\d+;|#x[\da-f]+;)/gi,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;")
}
}).call(this);
/*!
 * jQuery UI 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI
 */
(function(c,j){function k(a,b){var d=a.nodeName.toLowerCase();
if("area"===d){b=a.parentNode;
d=b.name;
if(!a.href||!d||b.nodeName.toLowerCase()!=="map"){return false
}a=c("img[usemap=#"+d+"]")[0];
return !!a&&l(a)
}return(/input|select|textarea|button|object/.test(d)?!a.disabled:"a"==d?a.href||b:b)&&l(a)
}function l(a){return !c(a).parents().andSelf().filter(function(){return c.curCSS(this,"visibility")==="hidden"||c.expr.filters.hidden(this)
}).length
}c.ui=c.ui||{};
if(!c.ui.version){c.extend(c.ui,{version:"1.8.16",keyCode:{ALT:18,BACKSPACE:8,CAPS_LOCK:20,COMMA:188,COMMAND:91,COMMAND_LEFT:91,COMMAND_RIGHT:93,CONTROL:17,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,INSERT:45,LEFT:37,MENU:93,NUMPAD_ADD:107,NUMPAD_DECIMAL:110,NUMPAD_DIVIDE:111,NUMPAD_ENTER:108,NUMPAD_MULTIPLY:106,NUMPAD_SUBTRACT:109,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SHIFT:16,SPACE:32,TAB:9,UP:38,WINDOWS:91}});
c.fn.extend({propAttr:c.fn.prop||c.fn.attr,_focus:c.fn.focus,focus:function(a,b){return typeof a==="number"?this.each(function(){var d=this;
setTimeout(function(){c(d).focus();
b&&b.call(d)
},a)
}):this._focus.apply(this,arguments)
},scrollParent:function(){var a;
a=c.browser.msie&&/(static|relative)/.test(this.css("position"))||/absolute/.test(this.css("position"))?this.parents().filter(function(){return/(relative|absolute|fixed)/.test(c.curCSS(this,"position",1))&&/(auto|scroll)/.test(c.curCSS(this,"overflow",1)+c.curCSS(this,"overflow-y",1)+c.curCSS(this,"overflow-x",1))
}).eq(0):this.parents().filter(function(){return/(auto|scroll)/.test(c.curCSS(this,"overflow",1)+c.curCSS(this,"overflow-y",1)+c.curCSS(this,"overflow-x",1))
}).eq(0);
return/fixed/.test(this.css("position"))||!a.length?c(document):a
},zIndex:function(a){if(a!==j){return this.css("zIndex",a)
}if(this.length){a=c(this[0]);
for(var b;
a.length&&a[0]!==document;
){b=a.css("position");
if(b==="absolute"||b==="relative"||b==="fixed"){b=parseInt(a.css("zIndex"),10);
if(!isNaN(b)&&b!==0){return b
}}a=a.parent()
}}return 0
},disableSelection:function(){return this.bind((c.support.selectstart?"selectstart":"mousedown")+".ui-disableSelection",function(a){a.preventDefault()
})
},enableSelection:function(){return this.unbind(".ui-disableSelection")
}});
c.each(["Width","Height"],function(a,b){function d(f,g,m,n){c.each(e,function(){g-=parseFloat(c.curCSS(f,"padding"+this,true))||0;
if(m){g-=parseFloat(c.curCSS(f,"border"+this+"Width",true))||0
}if(n){g-=parseFloat(c.curCSS(f,"margin"+this,true))||0
}});
return g
}var e=b==="Width"?["Left","Right"]:["Top","Bottom"],h=b.toLowerCase(),i={innerWidth:c.fn.innerWidth,innerHeight:c.fn.innerHeight,outerWidth:c.fn.outerWidth,outerHeight:c.fn.outerHeight};
c.fn["inner"+b]=function(f){if(f===j){return i["inner"+b].call(this)
}return this.each(function(){c(this).css(h,d(this,f)+"px")
})
};
c.fn["outer"+b]=function(f,g){if(typeof f!=="number"){return i["outer"+b].call(this,f)
}return this.each(function(){c(this).css(h,d(this,f,true,g)+"px")
})
}
});
c.extend(c.expr[":"],{data:function(a,b,d){return !!c.data(a,d[3])
},focusable:function(a){return k(a,!isNaN(c.attr(a,"tabindex")))
},tabbable:function(a){var b=c.attr(a,"tabindex"),d=isNaN(b);
return(d||b>=0)&&k(a,!d)
}});
c(function(){var a=document.body,b=a.appendChild(b=document.createElement("div"));
c.extend(b.style,{minHeight:"100px",height:"auto",padding:0,borderWidth:0});
c.support.minHeight=b.offsetHeight===100;
c.support.selectstart="onselectstart" in b;
a.removeChild(b).style.display="none"
});
c.extend(c.ui,{plugin:{add:function(a,b,d){a=c.ui[a].prototype;
for(var e in d){a.plugins[e]=a.plugins[e]||[];
a.plugins[e].push([b,d[e]])
}},call:function(a,b,d){if((b=a.plugins[b])&&a.element[0].parentNode){for(var e=0;
e<b.length;
e++){a.options[b[e][0]]&&b[e][1].apply(a.element,d)
}}}},contains:function(a,b){return document.compareDocumentPosition?a.compareDocumentPosition(b)&16:a!==b&&a.contains(b)
},hasScroll:function(a,b){if(c(a).css("overflow")==="hidden"){return false
}b=b&&b==="left"?"scrollLeft":"scrollTop";
var d=false;
if(a[b]>0){return true
}a[b]=1;
d=a[b]>0;
a[b]=0;
return d
},isOverAxis:function(a,b,d){return a>b&&a<b+d
},isOver:function(a,b,d,e,h,i){return c.ui.isOverAxis(a,d,h)&&c.ui.isOverAxis(b,e,i)
}})
}})(jQuery);
/*!
 * jQuery UI Widget 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Widget
 */
(function(b,j){if(b.cleanData){var k=b.cleanData;
b.cleanData=function(a){for(var c=0,d;
(d=a[c])!=null;
c++){try{b(d).triggerHandler("remove")
}catch(e){}}k(a)
}
}else{var l=b.fn.remove;
b.fn.remove=function(a,c){return this.each(function(){if(!c){if(!a||b.filter(a,[this]).length){b("*",this).add([this]).each(function(){try{b(this).triggerHandler("remove")
}catch(d){}})
}}return l.call(b(this),a,c)
})
}
}b.widget=function(a,c,d){var e=a.split(".")[0],f;
a=a.split(".")[1];
f=e+"-"+a;
if(!d){d=c;
c=b.Widget
}b.expr[":"][f]=function(h){return !!b.data(h,a)
};
b[e]=b[e]||{};
b[e][a]=function(h,g){arguments.length&&this._createWidget(h,g)
};
c=new c;
c.options=b.extend(true,{},c.options);
b[e][a].prototype=b.extend(true,c,{namespace:e,widgetName:a,widgetEventPrefix:b[e][a].prototype.widgetEventPrefix||a,widgetBaseClass:f},d);
b.widget.bridge(a,b[e][a])
};
b.widget.bridge=function(a,c){b.fn[a]=function(d){var e=typeof d==="string",f=Array.prototype.slice.call(arguments,1),h=this;
d=!e&&f.length?b.extend.apply(null,[true,d].concat(f)):d;
if(e&&d.charAt(0)==="_"){return h
}e?this.each(function(){var g=b.data(this,a),i=g&&b.isFunction(g[d])?g[d].apply(g,f):g;
if(i!==g&&i!==j){h=i;
return false
}}):this.each(function(){var g=b.data(this,a);
g?g.option(d||{})._init():b.data(this,a,new c(d,this))
});
return h
}
};
b.Widget=function(a,c){arguments.length&&this._createWidget(a,c)
};
b.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",options:{disabled:false},_createWidget:function(a,c){b.data(c,this.widgetName,this);
this.element=b(c);
this.options=b.extend(true,{},this.options,this._getCreateOptions(),a);
var d=this;
this.element.bind("remove."+this.widgetName,function(){d.destroy()
});
this._create();
this._trigger("create");
this._init()
},_getCreateOptions:function(){return b.metadata&&b.metadata.get(this.element[0])[this.widgetName]
},_create:function(){},_init:function(){},destroy:function(){this.element.unbind("."+this.widgetName).removeData(this.widgetName);
this.widget().unbind("."+this.widgetName).removeAttr("aria-disabled").removeClass(this.widgetBaseClass+"-disabled ui-state-disabled")
},widget:function(){return this.element
},option:function(a,c){var d=a;
if(arguments.length===0){return b.extend({},this.options)
}if(typeof a==="string"){if(c===j){return this.options[a]
}d={};
d[a]=c
}this._setOptions(d);
return this
},_setOptions:function(a){var c=this;
b.each(a,function(d,e){c._setOption(d,e)
});
return this
},_setOption:function(a,c){this.options[a]=c;
if(a==="disabled"){this.widget()[c?"addClass":"removeClass"](this.widgetBaseClass+"-disabled ui-state-disabled").attr("aria-disabled",c)
}return this
},enable:function(){return this._setOption("disabled",false)
},disable:function(){return this._setOption("disabled",true)
},_trigger:function(a,c,d){var e=this.options[a];
c=b.Event(c);
c.type=(a===this.widgetEventPrefix?a:this.widgetEventPrefix+a).toLowerCase();
d=d||{};
if(c.originalEvent){a=b.event.props.length;
for(var f;
a;
){f=b.event.props[--a];
c[f]=c.originalEvent[f]
}}this.element.trigger(c,d);
return !(b.isFunction(e)&&e.call(this.element[0],c,d)===false||c.isDefaultPrevented())
}}
})(jQuery);
/*!
 * jQuery UI Mouse 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Mouse
 *
 * Depends:
 *	jquery.ui.widget.js
 */
(function(b){var d=false;
b(document).mouseup(function(){d=false
});
b.widget("ui.mouse",{options:{cancel:":input,option",distance:1,delay:0},_mouseInit:function(){var a=this;
this.element.bind("mousedown."+this.widgetName,function(c){return a._mouseDown(c)
}).bind("click."+this.widgetName,function(c){if(true===b.data(c.target,a.widgetName+".preventClickEvent")){b.removeData(c.target,a.widgetName+".preventClickEvent");
c.stopImmediatePropagation();
return false
}});
this.started=false
},_mouseDestroy:function(){this.element.unbind("."+this.widgetName)
},_mouseDown:function(a){if(!d){this._mouseStarted&&this._mouseUp(a);
this._mouseDownEvent=a;
var c=this,f=a.which==1,g=typeof this.options.cancel=="string"&&a.target.nodeName?b(a.target).closest(this.options.cancel).length:false;
if(!f||g||!this._mouseCapture(a)){return true
}this.mouseDelayMet=!this.options.delay;
if(!this.mouseDelayMet){this._mouseDelayTimer=setTimeout(function(){c.mouseDelayMet=true
},this.options.delay)
}if(this._mouseDistanceMet(a)&&this._mouseDelayMet(a)){this._mouseStarted=this._mouseStart(a)!==false;
if(!this._mouseStarted){a.preventDefault();
return true
}}true===b.data(a.target,this.widgetName+".preventClickEvent")&&b.removeData(a.target,this.widgetName+".preventClickEvent");
this._mouseMoveDelegate=function(e){return c._mouseMove(e)
};
this._mouseUpDelegate=function(e){return c._mouseUp(e)
};
b(document).bind("mousemove."+this.widgetName,this._mouseMoveDelegate).bind("mouseup."+this.widgetName,this._mouseUpDelegate);
a.preventDefault();
return d=true
}},_mouseMove:function(a){if(b.browser.msie&&!(document.documentMode>=9)&&!a.button){return this._mouseUp(a)
}if(this._mouseStarted){this._mouseDrag(a);
return a.preventDefault()
}if(this._mouseDistanceMet(a)&&this._mouseDelayMet(a)){(this._mouseStarted=this._mouseStart(this._mouseDownEvent,a)!==false)?this._mouseDrag(a):this._mouseUp(a)
}return !this._mouseStarted
},_mouseUp:function(a){b(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate);
if(this._mouseStarted){this._mouseStarted=false;
a.target==this._mouseDownEvent.target&&b.data(a.target,this.widgetName+".preventClickEvent",true);
this._mouseStop(a)
}return false
},_mouseDistanceMet:function(a){return Math.max(Math.abs(this._mouseDownEvent.pageX-a.pageX),Math.abs(this._mouseDownEvent.pageY-a.pageY))>=this.options.distance
},_mouseDelayMet:function(){return this.mouseDelayMet
},_mouseStart:function(){},_mouseDrag:function(){},_mouseStop:function(){},_mouseCapture:function(){return true
}})
})(jQuery);
(function(c){c.ui=c.ui||{};
var n=/left|center|right/,o=/top|center|bottom/,t=c.fn.position,u=c.fn.offset;
c.fn.position=function(b){if(!b||!b.of){return t.apply(this,arguments)
}b=c.extend({},b);
var a=c(b.of),d=a[0],g=(b.collision||"flip").split(" "),e=b.offset?b.offset.split(" "):[0,0],h,k,j;
if(d.nodeType===9){h=a.width();
k=a.height();
j={top:0,left:0}
}else{if(d.setTimeout){h=a.width();
k=a.height();
j={top:a.scrollTop(),left:a.scrollLeft()}
}else{if(d.preventDefault){b.at="left top";
h=k=0;
j={top:b.of.pageY,left:b.of.pageX}
}else{h=a.outerWidth();
k=a.outerHeight();
j=a.offset()
}}}c.each(["my","at"],function(){var f=(b[this]||"").split(" ");
if(f.length===1){f=n.test(f[0])?f.concat(["center"]):o.test(f[0])?["center"].concat(f):["center","center"]
}f[0]=n.test(f[0])?f[0]:"center";
f[1]=o.test(f[1])?f[1]:"center";
b[this]=f
});
if(g.length===1){g[1]=g[0]
}e[0]=parseInt(e[0],10)||0;
if(e.length===1){e[1]=e[0]
}e[1]=parseInt(e[1],10)||0;
if(b.at[0]==="right"){j.left+=h
}else{if(b.at[0]==="center"){j.left+=h/2
}}if(b.at[1]==="bottom"){j.top+=k
}else{if(b.at[1]==="center"){j.top+=k/2
}}j.left+=e[0];
j.top+=e[1];
return this.each(function(){var f=c(this),l=f.outerWidth(),m=f.outerHeight(),p=parseInt(c.curCSS(this,"marginLeft",true))||0,q=parseInt(c.curCSS(this,"marginTop",true))||0,v=l+p+(parseInt(c.curCSS(this,"marginRight",true))||0),w=m+q+(parseInt(c.curCSS(this,"marginBottom",true))||0),i=c.extend({},j),r;
if(b.my[0]==="right"){i.left-=l
}else{if(b.my[0]==="center"){i.left-=l/2
}}if(b.my[1]==="bottom"){i.top-=m
}else{if(b.my[1]==="center"){i.top-=m/2
}}i.left=Math.round(i.left);
i.top=Math.round(i.top);
r={left:i.left-p,top:i.top-q};
c.each(["left","top"],function(s,x){c.ui.position[g[s]]&&c.ui.position[g[s]][x](i,{targetWidth:h,targetHeight:k,elemWidth:l,elemHeight:m,collisionPosition:r,collisionWidth:v,collisionHeight:w,offset:e,my:b.my,at:b.at})
});
c.fn.bgiframe&&f.bgiframe();
f.offset(c.extend(i,{using:b.using}))
})
};
c.ui.position={fit:{left:function(b,a){var d=c(window);
d=a.collisionPosition.left+a.collisionWidth-d.width()-d.scrollLeft();
b.left=d>0?b.left-d:Math.max(b.left-a.collisionPosition.left,b.left)
},top:function(b,a){var d=c(window);
d=a.collisionPosition.top+a.collisionHeight-d.height()-d.scrollTop();
b.top=d>0?b.top-d:Math.max(b.top-a.collisionPosition.top,b.top)
}},flip:{left:function(b,a){if(a.at[0]!=="center"){var d=c(window);
d=a.collisionPosition.left+a.collisionWidth-d.width()-d.scrollLeft();
var g=a.my[0]==="left"?-a.elemWidth:a.my[0]==="right"?a.elemWidth:0,e=a.at[0]==="left"?a.targetWidth:-a.targetWidth,h=-2*a.offset[0];
b.left+=a.collisionPosition.left<0?g+e+h:d>0?g+e+h:0
}},top:function(b,a){if(a.at[1]!=="center"){var d=c(window);
d=a.collisionPosition.top+a.collisionHeight-d.height()-d.scrollTop();
var g=a.my[1]==="top"?-a.elemHeight:a.my[1]==="bottom"?a.elemHeight:0,e=a.at[1]==="top"?a.targetHeight:-a.targetHeight,h=-2*a.offset[1];
b.top+=a.collisionPosition.top<0?g+e+h:d>0?g+e+h:0
}}}};
if(!c.offset.setOffset){c.offset.setOffset=function(b,a){if(/static/.test(c.curCSS(b,"position"))){b.style.position="relative"
}var d=c(b),g=d.offset(),e=parseInt(c.curCSS(b,"top",true),10)||0,h=parseInt(c.curCSS(b,"left",true),10)||0;
g={top:a.top-g.top+e,left:a.left-g.left+h};
"using" in a?a.using.call(b,g):d.css(g)
};
c.fn.offset=function(b){var a=this[0];
if(!a||!a.ownerDocument){return null
}if(b){return this.each(function(){c.offset.setOffset(this,b)
})
}return u.call(this)
}
}})(jQuery);
(function(d){d.widget("ui.sortable",d.ui.mouse,{widgetEventPrefix:"sort",options:{appendTo:"parent",axis:false,connectWith:false,containment:false,cursor:"auto",cursorAt:false,dropOnEmpty:true,forcePlaceholderSize:false,forceHelperSize:false,grid:false,handle:false,helper:"original",items:"> *",opacity:false,placeholder:false,revert:false,scroll:true,scrollSensitivity:20,scrollSpeed:20,scope:"default",tolerance:"intersect",zIndex:1000},_create:function(){var a=this.options;
this.containerCache={};
this.element.addClass("ui-sortable");
this.refresh();
this.floating=this.items.length?a.axis==="x"||/left|right/.test(this.items[0].item.css("float"))||/inline|table-cell/.test(this.items[0].item.css("display")):false;
this.offset=this.element.offset();
this._mouseInit()
},destroy:function(){this.element.removeClass("ui-sortable ui-sortable-disabled").removeData("sortable").unbind(".sortable");
this._mouseDestroy();
for(var a=this.items.length-1;
a>=0;
a--){this.items[a].item.removeData("sortable-item")
}return this
},_setOption:function(a,b){if(a==="disabled"){this.options[a]=b;
this.widget()[b?"addClass":"removeClass"]("ui-sortable-disabled")
}else{d.Widget.prototype._setOption.apply(this,arguments)
}},_mouseCapture:function(a,b){if(this.reverting){return false
}if(this.options.disabled||this.options.type=="static"){return false
}this._refreshItems(a);
var c=null,e=this;
d(a.target).parents().each(function(){if(d.data(this,"sortable-item")==e){c=d(this);
return false
}});
if(d.data(a.target,"sortable-item")==e){c=d(a.target)
}if(!c){return false
}if(this.options.handle&&!b){var f=false;
d(this.options.handle,c).find("*").andSelf().each(function(){if(this==a.target){f=true
}});
if(!f){return false
}}this.currentItem=c;
this._removeCurrentsFromItems();
return true
},_mouseStart:function(a,b,c){b=this.options;
var e=this;
this.currentContainer=this;
this.refreshPositions();
this.helper=this._createHelper(a);
this._cacheHelperProportions();
this._cacheMargins();
this.scrollParent=this.helper.scrollParent();
this.offset=this.currentItem.offset();
this.offset={top:this.offset.top-this.margins.top,left:this.offset.left-this.margins.left};
this.helper.css("position","absolute");
this.cssPosition=this.helper.css("position");
d.extend(this.offset,{click:{left:a.pageX-this.offset.left,top:a.pageY-this.offset.top},parent:this._getParentOffset(),relative:this._getRelativeOffset()});
this.originalPosition=this._generatePosition(a);
this.originalPageX=a.pageX;
this.originalPageY=a.pageY;
b.cursorAt&&this._adjustOffsetFromHelper(b.cursorAt);
this.domPosition={prev:this.currentItem.prev()[0],parent:this.currentItem.parent()[0]};
this.helper[0]!=this.currentItem[0]&&this.currentItem.hide();
this._createPlaceholder();
b.containment&&this._setContainment();
if(b.cursor){if(d("body").css("cursor")){this._storedCursor=d("body").css("cursor")
}d("body").css("cursor",b.cursor)
}if(b.opacity){if(this.helper.css("opacity")){this._storedOpacity=this.helper.css("opacity")
}this.helper.css("opacity",b.opacity)
}if(b.zIndex){if(this.helper.css("zIndex")){this._storedZIndex=this.helper.css("zIndex")
}this.helper.css("zIndex",b.zIndex)
}if(this.scrollParent[0]!=document&&this.scrollParent[0].tagName!="HTML"){this.overflowOffset=this.scrollParent.offset()
}this._trigger("start",a,this._uiHash());
this._preserveHelperProportions||this._cacheHelperProportions();
if(!c){for(c=this.containers.length-1;
c>=0;
c--){this.containers[c]._trigger("activate",a,e._uiHash(this))
}}if(d.ui.ddmanager){d.ui.ddmanager.current=this
}d.ui.ddmanager&&!b.dropBehaviour&&d.ui.ddmanager.prepareOffsets(this,a);
this.dragging=true;
this.helper.addClass("ui-sortable-helper");
this._mouseDrag(a);
return true
},_mouseDrag:function(a){this.position=this._generatePosition(a);
this.positionAbs=this._convertPositionTo("absolute");
if(!this.lastPositionAbs){this.lastPositionAbs=this.positionAbs
}if(this.options.scroll){var b=this.options,c=false;
if(this.scrollParent[0]!=document&&this.scrollParent[0].tagName!="HTML"){if(this.overflowOffset.top+this.scrollParent[0].offsetHeight-a.pageY<b.scrollSensitivity){this.scrollParent[0].scrollTop=c=this.scrollParent[0].scrollTop+b.scrollSpeed
}else{if(a.pageY-this.overflowOffset.top<b.scrollSensitivity){this.scrollParent[0].scrollTop=c=this.scrollParent[0].scrollTop-b.scrollSpeed
}}if(this.overflowOffset.left+this.scrollParent[0].offsetWidth-a.pageX<b.scrollSensitivity){this.scrollParent[0].scrollLeft=c=this.scrollParent[0].scrollLeft+b.scrollSpeed
}else{if(a.pageX-this.overflowOffset.left<b.scrollSensitivity){this.scrollParent[0].scrollLeft=c=this.scrollParent[0].scrollLeft-b.scrollSpeed
}}}else{if(a.pageY-d(document).scrollTop()<b.scrollSensitivity){c=d(document).scrollTop(d(document).scrollTop()-b.scrollSpeed)
}else{if(d(window).height()-(a.pageY-d(document).scrollTop())<b.scrollSensitivity){c=d(document).scrollTop(d(document).scrollTop()+b.scrollSpeed)
}}if(a.pageX-d(document).scrollLeft()<b.scrollSensitivity){c=d(document).scrollLeft(d(document).scrollLeft()-b.scrollSpeed)
}else{if(d(window).width()-(a.pageX-d(document).scrollLeft())<b.scrollSensitivity){c=d(document).scrollLeft(d(document).scrollLeft()+b.scrollSpeed)
}}}c!==false&&d.ui.ddmanager&&!b.dropBehaviour&&d.ui.ddmanager.prepareOffsets(this,a)
}this.positionAbs=this._convertPositionTo("absolute");
if(!this.options.axis||this.options.axis!="y"){this.helper[0].style.left=this.position.left+"px"
}if(!this.options.axis||this.options.axis!="x"){this.helper[0].style.top=this.position.top+"px"
}for(b=this.items.length-1;
b>=0;
b--){c=this.items[b];
var e=c.item[0],f=this._intersectsWithPointer(c);
if(f){if(e!=this.currentItem[0]&&this.placeholder[f==1?"next":"prev"]()[0]!=e&&!d.ui.contains(this.placeholder[0],e)&&(this.options.type=="semi-dynamic"?!d.ui.contains(this.element[0],e):true)){this.direction=f==1?"down":"up";
if(this.options.tolerance=="pointer"||this._intersectsWithSides(c)){this._rearrange(a,c)
}else{break
}this._trigger("change",a,this._uiHash());
break
}}}this._contactContainers(a);
d.ui.ddmanager&&d.ui.ddmanager.drag(this,a);
this._trigger("sort",a,this._uiHash());
this.lastPositionAbs=this.positionAbs;
return false
},_mouseStop:function(a,b){if(a){d.ui.ddmanager&&!this.options.dropBehaviour&&d.ui.ddmanager.drop(this,a);
if(this.options.revert){var c=this;
b=c.placeholder.offset();
c.reverting=true;
d(this.helper).animate({left:b.left-this.offset.parent.left-c.margins.left+(this.offsetParent[0]==document.body?0:this.offsetParent[0].scrollLeft),top:b.top-this.offset.parent.top-c.margins.top+(this.offsetParent[0]==document.body?0:this.offsetParent[0].scrollTop)},parseInt(this.options.revert,10)||500,function(){c._clear(a)
})
}else{this._clear(a,b)
}return false
}},cancel:function(){var a=this;
if(this.dragging){this._mouseUp({target:null});
this.options.helper=="original"?this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper"):this.currentItem.show();
for(var b=this.containers.length-1;
b>=0;
b--){this.containers[b]._trigger("deactivate",null,a._uiHash(this));
if(this.containers[b].containerCache.over){this.containers[b]._trigger("out",null,a._uiHash(this));
this.containers[b].containerCache.over=0
}}}if(this.placeholder){this.placeholder[0].parentNode&&this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
this.options.helper!="original"&&this.helper&&this.helper[0].parentNode&&this.helper.remove();
d.extend(this,{helper:null,dragging:false,reverting:false,_noFinalSort:null});
this.domPosition.prev?d(this.domPosition.prev).after(this.currentItem):d(this.domPosition.parent).prepend(this.currentItem)
}return this
},serialize:function(a){var b=this._getItemsAsjQuery(a&&a.connected),c=[];
a=a||{};
d(b).each(function(){var e=(d(a.item||this).attr(a.attribute||"id")||"").match(a.expression||/(.+)[-=_](.+)/);
if(e){c.push((a.key||e[1]+"[]")+"="+(a.key&&a.expression?e[1]:e[2]))
}});
!c.length&&a.key&&c.push(a.key+"=");
return c.join("&")
},toArray:function(a){var b=this._getItemsAsjQuery(a&&a.connected),c=[];
a=a||{};
b.each(function(){c.push(d(a.item||this).attr(a.attribute||"id")||"")
});
return c
},_intersectsWith:function(a){var b=this.positionAbs.left,c=b+this.helperProportions.width,e=this.positionAbs.top,f=e+this.helperProportions.height,g=a.left,h=g+a.width,i=a.top,k=i+a.height,j=this.offset.click.top,l=this.offset.click.left;
j=e+j>i&&e+j<k&&b+l>g&&b+l<h;
return this.options.tolerance=="pointer"||this.options.forcePointerForContainers||this.options.tolerance!="pointer"&&this.helperProportions[this.floating?"width":"height"]>a[this.floating?"width":"height"]?j:g<b+this.helperProportions.width/2&&c-this.helperProportions.width/2<h&&i<e+this.helperProportions.height/2&&f-this.helperProportions.height/2<k
},_intersectsWithPointer:function(a){var b=d.ui.isOverAxis(this.positionAbs.top+this.offset.click.top,a.top,a.height);
a=d.ui.isOverAxis(this.positionAbs.left+this.offset.click.left,a.left,a.width);
b=b&&a;
a=this._getDragVerticalDirection();
var c=this._getDragHorizontalDirection();
if(!b){return false
}return this.floating?c&&c=="right"||a=="down"?2:1:a&&(a=="down"?2:1)
},_intersectsWithSides:function(a){var b=d.ui.isOverAxis(this.positionAbs.top+this.offset.click.top,a.top+a.height/2,a.height);
a=d.ui.isOverAxis(this.positionAbs.left+this.offset.click.left,a.left+a.width/2,a.width);
var c=this._getDragVerticalDirection(),e=this._getDragHorizontalDirection();
return this.floating&&e?e=="right"&&a||e=="left"&&!a:c&&(c=="down"&&b||c=="up"&&!b)
},_getDragVerticalDirection:function(){var a=this.positionAbs.top-this.lastPositionAbs.top;
return a!=0&&(a>0?"down":"up")
},_getDragHorizontalDirection:function(){var a=this.positionAbs.left-this.lastPositionAbs.left;
return a!=0&&(a>0?"right":"left")
},refresh:function(a){this._refreshItems(a);
this.refreshPositions();
return this
},_connectWith:function(){var a=this.options;
return a.connectWith.constructor==String?[a.connectWith]:a.connectWith
},_getItemsAsjQuery:function(a){var b=[],c=[],e=this._connectWith();
if(e&&a){for(a=e.length-1;
a>=0;
a--){for(var f=d(e[a]),g=f.length-1;
g>=0;
g--){var h=d.data(f[g],"sortable");
if(h&&h!=this&&!h.options.disabled){c.push([d.isFunction(h.options.items)?h.options.items.call(h.element):d(h.options.items,h.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"),h])
}}}}c.push([d.isFunction(this.options.items)?this.options.items.call(this.element,null,{options:this.options,item:this.currentItem}):d(this.options.items,this.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"),this]);
for(a=c.length-1;
a>=0;
a--){c[a][0].each(function(){b.push(this)
})
}return d(b)
},_removeCurrentsFromItems:function(){for(var a=this.currentItem.find(":data(sortable-item)"),b=0;
b<this.items.length;
b++){for(var c=0;
c<a.length;
c++){a[c]==this.items[b].item[0]&&this.items.splice(b,1)
}}},_refreshItems:function(a){this.items=[];
this.containers=[this];
var b=this.items,c=[[d.isFunction(this.options.items)?this.options.items.call(this.element[0],a,{item:this.currentItem}):d(this.options.items,this.element),this]],e=this._connectWith();
if(e){for(var f=e.length-1;
f>=0;
f--){for(var g=d(e[f]),h=g.length-1;
h>=0;
h--){var i=d.data(g[h],"sortable");
if(i&&i!=this&&!i.options.disabled){c.push([d.isFunction(i.options.items)?i.options.items.call(i.element[0],a,{item:this.currentItem}):d(i.options.items,i.element),i]);
this.containers.push(i)
}}}}for(f=c.length-1;
f>=0;
f--){a=c[f][1];
e=c[f][0];
h=0;
for(g=e.length;
h<g;
h++){i=d(e[h]);
i.data("sortable-item",a);
b.push({item:i,instance:a,width:0,height:0,left:0,top:0})
}}},refreshPositions:function(a){if(this.offsetParent&&this.helper){this.offset.parent=this._getParentOffset()
}for(var b=this.items.length-1;
b>=0;
b--){var c=this.items[b];
if(!(c.instance!=this.currentContainer&&this.currentContainer&&c.item[0]!=this.currentItem[0])){var e=this.options.toleranceElement?d(this.options.toleranceElement,c.item):c.item;
if(!a){c.width=e.outerWidth();
c.height=e.outerHeight()
}e=e.offset();
c.left=e.left;
c.top=e.top
}}if(this.options.custom&&this.options.custom.refreshContainers){this.options.custom.refreshContainers.call(this)
}else{for(b=this.containers.length-1;
b>=0;
b--){e=this.containers[b].element.offset();
this.containers[b].containerCache.left=e.left;
this.containers[b].containerCache.top=e.top;
this.containers[b].containerCache.width=this.containers[b].element.outerWidth();
this.containers[b].containerCache.height=this.containers[b].element.outerHeight()
}}return this
},_createPlaceholder:function(a){var b=a||this,c=b.options;
if(!c.placeholder||c.placeholder.constructor==String){var e=c.placeholder;
c.placeholder={element:function(){var f=d(document.createElement(b.currentItem[0].nodeName)).addClass(e||b.currentItem[0].className+" ui-sortable-placeholder").removeClass("ui-sortable-helper")[0];
if(!e){f.style.visibility="hidden"
}return f
},update:function(f,g){if(!(e&&!c.forcePlaceholderSize)){g.height()||g.height(b.currentItem.innerHeight()-parseInt(b.currentItem.css("paddingTop")||0,10)-parseInt(b.currentItem.css("paddingBottom")||0,10));
g.width()||g.width(b.currentItem.innerWidth()-parseInt(b.currentItem.css("paddingLeft")||0,10)-parseInt(b.currentItem.css("paddingRight")||0,10))
}}}
}b.placeholder=d(c.placeholder.element.call(b.element,b.currentItem));
b.currentItem.after(b.placeholder);
c.placeholder.update(b,b.placeholder)
},_contactContainers:function(a){for(var b=null,c=null,e=this.containers.length-1;
e>=0;
e--){if(!d.ui.contains(this.currentItem[0],this.containers[e].element[0])){if(this._intersectsWith(this.containers[e].containerCache)){if(!(b&&d.ui.contains(this.containers[e].element[0],b.element[0]))){b=this.containers[e];
c=e
}}else{if(this.containers[e].containerCache.over){this.containers[e]._trigger("out",a,this._uiHash(this));
this.containers[e].containerCache.over=0
}}}}if(b){if(this.containers.length===1){this.containers[c]._trigger("over",a,this._uiHash(this));
this.containers[c].containerCache.over=1
}else{if(this.currentContainer!=this.containers[c]){b=10000;
e=null;
for(var f=this.positionAbs[this.containers[c].floating?"left":"top"],g=this.items.length-1;
g>=0;
g--){if(d.ui.contains(this.containers[c].element[0],this.items[g].item[0])){var h=this.items[g][this.containers[c].floating?"left":"top"];
if(Math.abs(h-f)<b){b=Math.abs(h-f);
e=this.items[g]
}}}if(e||this.options.dropOnEmpty){this.currentContainer=this.containers[c];
e?this._rearrange(a,e,null,true):this._rearrange(a,null,this.containers[c].element,true);
this._trigger("change",a,this._uiHash());
this.containers[c]._trigger("change",a,this._uiHash(this));
this.options.placeholder.update(this.currentContainer,this.placeholder);
this.containers[c]._trigger("over",a,this._uiHash(this));
this.containers[c].containerCache.over=1
}}}}},_createHelper:function(a){var b=this.options;
a=d.isFunction(b.helper)?d(b.helper.apply(this.element[0],[a,this.currentItem])):b.helper=="clone"?this.currentItem.clone():this.currentItem;
a.parents("body").length||d(b.appendTo!="parent"?b.appendTo:this.currentItem[0].parentNode)[0].appendChild(a[0]);
if(a[0]==this.currentItem[0]){this._storedCSS={width:this.currentItem[0].style.width,height:this.currentItem[0].style.height,position:this.currentItem.css("position"),top:this.currentItem.css("top"),left:this.currentItem.css("left")}
}if(a[0].style.width==""||b.forceHelperSize){a.width(this.currentItem.width())
}if(a[0].style.height==""||b.forceHelperSize){a.height(this.currentItem.height())
}return a
},_adjustOffsetFromHelper:function(a){if(typeof a=="string"){a=a.split(" ")
}if(d.isArray(a)){a={left:+a[0],top:+a[1]||0}
}if("left" in a){this.offset.click.left=a.left+this.margins.left
}if("right" in a){this.offset.click.left=this.helperProportions.width-a.right+this.margins.left
}if("top" in a){this.offset.click.top=a.top+this.margins.top
}if("bottom" in a){this.offset.click.top=this.helperProportions.height-a.bottom+this.margins.top
}},_getParentOffset:function(){this.offsetParent=this.helper.offsetParent();
var a=this.offsetParent.offset();
if(this.cssPosition=="absolute"&&this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],this.offsetParent[0])){a.left+=this.scrollParent.scrollLeft();
a.top+=this.scrollParent.scrollTop()
}if(this.offsetParent[0]==document.body||this.offsetParent[0].tagName&&this.offsetParent[0].tagName.toLowerCase()=="html"&&d.browser.msie){a={top:0,left:0}
}return{top:a.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:a.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}
},_getRelativeOffset:function(){if(this.cssPosition=="relative"){var a=this.currentItem.position();
return{top:a.top-(parseInt(this.helper.css("top"),10)||0)+this.scrollParent.scrollTop(),left:a.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()}
}else{return{top:0,left:0}
}},_cacheMargins:function(){this.margins={left:parseInt(this.currentItem.css("marginLeft"),10)||0,top:parseInt(this.currentItem.css("marginTop"),10)||0}
},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}
},_setContainment:function(){var a=this.options;
if(a.containment=="parent"){a.containment=this.helper[0].parentNode
}if(a.containment=="document"||a.containment=="window"){this.containment=[0-this.offset.relative.left-this.offset.parent.left,0-this.offset.relative.top-this.offset.parent.top,d(a.containment=="document"?document:window).width()-this.helperProportions.width-this.margins.left,(d(a.containment=="document"?document:window).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top]
}if(!/^(document|window|parent)$/.test(a.containment)){var b=d(a.containment)[0];
a=d(a.containment).offset();
var c=d(b).css("overflow")!="hidden";
this.containment=[a.left+(parseInt(d(b).css("borderLeftWidth"),10)||0)+(parseInt(d(b).css("paddingLeft"),10)||0)-this.margins.left,a.top+(parseInt(d(b).css("borderTopWidth"),10)||0)+(parseInt(d(b).css("paddingTop"),10)||0)-this.margins.top,a.left+(c?Math.max(b.scrollWidth,b.offsetWidth):b.offsetWidth)-(parseInt(d(b).css("borderLeftWidth"),10)||0)-(parseInt(d(b).css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left,a.top+(c?Math.max(b.scrollHeight,b.offsetHeight):b.offsetHeight)-(parseInt(d(b).css("borderTopWidth"),10)||0)-(parseInt(d(b).css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top]
}},_convertPositionTo:function(a,b){if(!b){b=this.position
}a=a=="absolute"?1:-1;
var c=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,e=/(html|body)/i.test(c[0].tagName);
return{top:b.top+this.offset.relative.top*a+this.offset.parent.top*a-(d.browser.safari&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollTop():e?0:c.scrollTop())*a),left:b.left+this.offset.relative.left*a+this.offset.parent.left*a-(d.browser.safari&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():e?0:c.scrollLeft())*a)}
},_generatePosition:function(a){var b=this.options,c=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,e=/(html|body)/i.test(c[0].tagName);
if(this.cssPosition=="relative"&&!(this.scrollParent[0]!=document&&this.scrollParent[0]!=this.offsetParent[0])){this.offset.relative=this._getRelativeOffset()
}var f=a.pageX,g=a.pageY;
if(this.originalPosition){if(this.containment){if(a.pageX-this.offset.click.left<this.containment[0]){f=this.containment[0]+this.offset.click.left
}if(a.pageY-this.offset.click.top<this.containment[1]){g=this.containment[1]+this.offset.click.top
}if(a.pageX-this.offset.click.left>this.containment[2]){f=this.containment[2]+this.offset.click.left
}if(a.pageY-this.offset.click.top>this.containment[3]){g=this.containment[3]+this.offset.click.top
}}if(b.grid){g=this.originalPageY+Math.round((g-this.originalPageY)/b.grid[1])*b.grid[1];
g=this.containment?!(g-this.offset.click.top<this.containment[1]||g-this.offset.click.top>this.containment[3])?g:!(g-this.offset.click.top<this.containment[1])?g-b.grid[1]:g+b.grid[1]:g;
f=this.originalPageX+Math.round((f-this.originalPageX)/b.grid[0])*b.grid[0];
f=this.containment?!(f-this.offset.click.left<this.containment[0]||f-this.offset.click.left>this.containment[2])?f:!(f-this.offset.click.left<this.containment[0])?f-b.grid[0]:f+b.grid[0]:f
}}return{top:g-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+(d.browser.safari&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollTop():e?0:c.scrollTop()),left:f-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+(d.browser.safari&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():e?0:c.scrollLeft())}
},_rearrange:function(a,b,c,e){c?c[0].appendChild(this.placeholder[0]):b.item[0].parentNode.insertBefore(this.placeholder[0],this.direction=="down"?b.item[0]:b.item[0].nextSibling);
this.counter=this.counter?++this.counter:1;
var f=this,g=this.counter;
window.setTimeout(function(){g==f.counter&&f.refreshPositions(!e)
},0)
},_clear:function(a,b){this.reverting=false;
var c=[];
!this._noFinalSort&&this.currentItem.parent().length&&this.placeholder.before(this.currentItem);
this._noFinalSort=null;
if(this.helper[0]==this.currentItem[0]){for(var e in this._storedCSS){if(this._storedCSS[e]=="auto"||this._storedCSS[e]=="static"){this._storedCSS[e]=""
}}this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper")
}else{this.currentItem.show()
}this.fromOutside&&!b&&c.push(function(f){this._trigger("receive",f,this._uiHash(this.fromOutside))
});
if((this.fromOutside||this.domPosition.prev!=this.currentItem.prev().not(".ui-sortable-helper")[0]||this.domPosition.parent!=this.currentItem.parent()[0])&&!b){c.push(function(f){this._trigger("update",f,this._uiHash())
})
}if(!d.ui.contains(this.element[0],this.currentItem[0])){b||c.push(function(f){this._trigger("remove",f,this._uiHash())
});
for(e=this.containers.length-1;
e>=0;
e--){if(d.ui.contains(this.containers[e].element[0],this.currentItem[0])&&!b){c.push(function(f){return function(g){f._trigger("receive",g,this._uiHash(this))
}
}.call(this,this.containers[e]));
c.push(function(f){return function(g){f._trigger("update",g,this._uiHash(this))
}
}.call(this,this.containers[e]))
}}}for(e=this.containers.length-1;
e>=0;
e--){b||c.push(function(f){return function(g){f._trigger("deactivate",g,this._uiHash(this))
}
}.call(this,this.containers[e]));
if(this.containers[e].containerCache.over){c.push(function(f){return function(g){f._trigger("out",g,this._uiHash(this))
}
}.call(this,this.containers[e]));
this.containers[e].containerCache.over=0
}}this._storedCursor&&d("body").css("cursor",this._storedCursor);
this._storedOpacity&&this.helper.css("opacity",this._storedOpacity);
if(this._storedZIndex){this.helper.css("zIndex",this._storedZIndex=="auto"?"":this._storedZIndex)
}this.dragging=false;
if(this.cancelHelperRemoval){if(!b){this._trigger("beforeStop",a,this._uiHash());
for(e=0;
e<c.length;
e++){c[e].call(this,a)
}this._trigger("stop",a,this._uiHash())
}return false
}b||this._trigger("beforeStop",a,this._uiHash());
this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
this.helper[0]!=this.currentItem[0]&&this.helper.remove();
this.helper=null;
if(!b){for(e=0;
e<c.length;
e++){c[e].call(this,a)
}this._trigger("stop",a,this._uiHash())
}this.fromOutside=false;
return true
},_trigger:function(){d.Widget.prototype._trigger.apply(this,arguments)===false&&this.cancel()
},_uiHash:function(a){var b=a||this;
return{helper:b.helper,placeholder:b.placeholder||d([]),position:b.position,originalPosition:b.originalPosition,offset:b.positionAbs,item:b.currentItem,sender:a?a.element:null}
}});
d.extend(d.ui.sortable,{version:"1.8.16"})
})(jQuery);
(function(d){var e=0;
d.widget("ui.autocomplete",{options:{appendTo:"body",autoFocus:false,delay:300,minLength:1,position:{my:"left top",at:"left bottom",collision:"none"},source:null},pending:0,_create:function(){var a=this,b=this.element[0].ownerDocument,g;
this.element.addClass("ui-autocomplete-input").attr("autocomplete","off").attr({role:"textbox","aria-autocomplete":"list","aria-haspopup":"true"}).bind("keydown.autocomplete",function(c){if(!(a.options.disabled||a.element.propAttr("readOnly"))){g=false;
var f=d.ui.keyCode;
switch(c.keyCode){case f.PAGE_UP:a._move("previousPage",c);
break;
case f.PAGE_DOWN:a._move("nextPage",c);
break;
case f.UP:a._move("previous",c);
c.preventDefault();
break;
case f.DOWN:a._move("next",c);
c.preventDefault();
break;
case f.ENTER:case f.NUMPAD_ENTER:if(a.menu.active){g=true;
c.preventDefault()
}case f.TAB:if(!a.menu.active){return
}a.menu.select(c);
break;
case f.ESCAPE:a.element.val(a.term);
a.close(c);
break;
default:clearTimeout(a.searching);
a.searching=setTimeout(function(){if(a.term!=a.element.val()){a.selectedItem=null;
a.search(null,c)
}},a.options.delay);
break
}}}).bind("keypress.autocomplete",function(c){if(g){g=false;
c.preventDefault()
}}).bind("focus.autocomplete",function(){if(!a.options.disabled){a.selectedItem=null;
a.previous=a.element.val()
}}).bind("blur.autocomplete",function(c){if(!a.options.disabled){clearTimeout(a.searching);
a.closing=setTimeout(function(){a.close(c);
a._change(c)
},150)
}});
this._initSource();
this.response=function(){return a._response.apply(a,arguments)
};
this.menu=d("<ul></ul>").addClass("ui-autocomplete").appendTo(d(this.options.appendTo||"body",b)[0]).mousedown(function(c){var f=a.menu.element[0];
d(c.target).closest(".ui-menu-item").length||setTimeout(function(){d(document).one("mousedown",function(h){h.target!==a.element[0]&&h.target!==f&&!d.ui.contains(f,h.target)&&a.close()
})
},1);
setTimeout(function(){clearTimeout(a.closing)
},13)
}).menu({focus:function(c,f){f=f.item.data("item.autocomplete");
false!==a._trigger("focus",c,{item:f})&&/^key/.test(c.originalEvent.type)&&a.element.val(f.value)
},selected:function(c,f){var h=f.item.data("item.autocomplete"),i=a.previous;
if(a.element[0]!==b.activeElement){a.element.focus();
a.previous=i;
setTimeout(function(){a.previous=i;
a.selectedItem=h
},1)
}false!==a._trigger("select",c,{item:h})&&a.element.val(h.value);
a.term=a.element.val();
a.close(c);
a.selectedItem=h
},blur:function(){a.menu.element.is(":visible")&&a.element.val()!==a.term&&a.element.val(a.term)
}}).zIndex(this.element.zIndex()+1).css({top:0,left:0}).hide().data("menu");
d.fn.bgiframe&&this.menu.element.bgiframe()
},destroy:function(){this.element.removeClass("ui-autocomplete-input").removeAttr("autocomplete").removeAttr("role").removeAttr("aria-autocomplete").removeAttr("aria-haspopup");
this.menu.element.remove();
d.Widget.prototype.destroy.call(this)
},_setOption:function(a,b){d.Widget.prototype._setOption.apply(this,arguments);
a==="source"&&this._initSource();
if(a==="appendTo"){this.menu.element.appendTo(d(b||"body",this.element[0].ownerDocument)[0])
}a==="disabled"&&b&&this.xhr&&this.xhr.abort()
},_initSource:function(){var a=this,b,g;
if(d.isArray(this.options.source)){b=this.options.source;
this.source=function(c,f){f(d.ui.autocomplete.filter(b,c.term))
}
}else{if(typeof this.options.source==="string"){g=this.options.source;
this.source=function(c,f){a.xhr&&a.xhr.abort();
a.xhr=d.ajax({url:g,data:c,dataType:"json",autocompleteRequest:++e,success:function(h){this.autocompleteRequest===e&&f(h)
},error:function(){this.autocompleteRequest===e&&f([])
}})
}
}else{this.source=this.options.source
}}},search:function(a,b){a=a!=null?a:this.element.val();
this.term=this.element.val();
if(a.length<this.options.minLength){return this.close(b)
}clearTimeout(this.closing);
if(this._trigger("search",b)!==false){return this._search(a)
}},_search:function(a){this.pending++;
this.element.addClass("ui-autocomplete-loading");
this.source({term:a},this.response)
},_response:function(a){if(!this.options.disabled&&a&&a.length){a=this._normalize(a);
this._suggest(a);
this._trigger("open")
}else{this.close()
}this.pending--;
this.pending||this.element.removeClass("ui-autocomplete-loading")
},close:function(a){clearTimeout(this.closing);
if(this.menu.element.is(":visible")){this.menu.element.hide();
this.menu.deactivate();
this._trigger("close",a)
}},_change:function(a){this.previous!==this.element.val()&&this._trigger("change",a,{item:this.selectedItem})
},_normalize:function(a){if(a.length&&a[0].label&&a[0].value){return a
}return d.map(a,function(b){if(typeof b==="string"){return{label:b,value:b}
}return d.extend({label:b.label||b.value,value:b.value||b.label},b)
})
},_suggest:function(a){var b=this.menu.element.empty().zIndex(this.element.zIndex()+1);
this._renderMenu(b,a);
this.menu.deactivate();
this.menu.refresh();
b.show();
this._resizeMenu();
b.position(d.extend({of:this.element},this.options.position));
this.options.autoFocus&&this.menu.next(new d.Event("mouseover"))
},_resizeMenu:function(){var a=this.menu.element;
a.outerWidth(Math.max(a.width("").outerWidth(),this.element.outerWidth()))
},_renderMenu:function(a,b){var g=this;
d.each(b,function(c,f){g._renderItem(a,f)
})
},_renderItem:function(a,b){return d("<li></li>").data("item.autocomplete",b).append(d("<a></a>").text(b.label)).appendTo(a)
},_move:function(a,b){if(this.menu.element.is(":visible")){if(this.menu.first()&&/^previous/.test(a)||this.menu.last()&&/^next/.test(a)){this.element.val(this.term);
this.menu.deactivate()
}else{this.menu[a](b)
}}else{this.search(null,b)
}},widget:function(){return this.menu.element
}});
d.extend(d.ui.autocomplete,{escapeRegex:function(a){return a.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")
},filter:function(a,b){var g=new RegExp(d.ui.autocomplete.escapeRegex(b),"i");
return d.grep(a,function(c){return g.test(c.label||c.value||c)
})
}})
})(jQuery);
(function(d){d.widget("ui.menu",{_create:function(){var e=this;
this.element.addClass("ui-menu ui-widget ui-widget-content ui-corner-all").attr({role:"listbox","aria-activedescendant":"ui-active-menuitem"}).click(function(a){if(d(a.target).closest(".ui-menu-item a").length){a.preventDefault();
e.select(a)
}});
this.refresh()
},refresh:function(){var e=this;
this.element.children("li:not(.ui-menu-item):has(a)").addClass("ui-menu-item").attr("role","menuitem").children("a").addClass("ui-corner-all").attr("tabindex",-1).mouseenter(function(a){e.activate(a,d(this).parent())
}).mouseleave(function(){e.deactivate()
})
},activate:function(e,a){this.deactivate();
if(this.hasScroll()){var b=a.offset().top-this.element.offset().top,g=this.element.scrollTop(),c=this.element.height();
if(b<0){this.element.scrollTop(g+b)
}else{b>=c&&this.element.scrollTop(g+b-c+a.height())
}}this.active=a.eq(0).children("a").addClass("ui-state-hover").attr("id","ui-active-menuitem").end();
this._trigger("focus",e,{item:a})
},deactivate:function(){if(this.active){this.active.children("a").removeClass("ui-state-hover").removeAttr("id");
this._trigger("blur");
this.active=null
}},next:function(e){this.move("next",".ui-menu-item:first",e)
},previous:function(e){this.move("prev",".ui-menu-item:last",e)
},first:function(){return this.active&&!this.active.prevAll(".ui-menu-item").length
},last:function(){return this.active&&!this.active.nextAll(".ui-menu-item").length
},move:function(e,a,b){if(this.active){e=this.active[e+"All"](".ui-menu-item").eq(0);
e.length?this.activate(b,e):this.activate(b,this.element.children(a))
}else{this.activate(b,this.element.children(a))
}},nextPage:function(e){if(this.hasScroll()){if(!this.active||this.last()){this.activate(e,this.element.children(".ui-menu-item:first"))
}else{var a=this.active.offset().top,b=this.element.height(),g=this.element.children(".ui-menu-item").filter(function(){var c=d(this).offset().top-a-b+d(this).height();
return c<10&&c>-10
});
g.length||(g=this.element.children(".ui-menu-item:last"));
this.activate(e,g)
}}else{this.activate(e,this.element.children(".ui-menu-item").filter(!this.active||this.last()?":first":":last"))
}},previousPage:function(e){if(this.hasScroll()){if(!this.active||this.first()){this.activate(e,this.element.children(".ui-menu-item:last"))
}else{var a=this.active.offset().top,b=this.element.height();
result=this.element.children(".ui-menu-item").filter(function(){var g=d(this).offset().top-a+b-d(this).height();
return g<10&&g>-10
});
result.length||(result=this.element.children(".ui-menu-item:first"));
this.activate(e,result)
}}else{this.activate(e,this.element.children(".ui-menu-item").filter(!this.active||this.first()?":last":":first"))
}},hasScroll:function(){return this.element.height()<this.element[d.fn.prop?"prop":"attr"]("scrollHeight")
},select:function(e){this._trigger("selected",e,{item:this.active})
}})
})(jQuery);
(function(b){var h,i,j,g,l=function(){var a=b(this).find(":ui-button");
setTimeout(function(){a.button("refresh")
},1)
},k=function(a){var c=a.name,e=a.form,f=b([]);
if(c){f=e?b(e).find("[name='"+c+"']"):b("[name='"+c+"']",a.ownerDocument).filter(function(){return !this.form
})
}return f
};
b.widget("ui.button",{options:{disabled:null,text:true,label:null,icons:{primary:null,secondary:null}},_create:function(){this.element.closest("form").unbind("reset.button").bind("reset.button",l);
if(typeof this.options.disabled!=="boolean"){this.options.disabled=this.element.propAttr("disabled")
}this._determineButtonType();
this.hasTitle=!!this.buttonElement.attr("title");
var a=this,c=this.options,e=this.type==="checkbox"||this.type==="radio",f="ui-state-hover"+(!e?" ui-state-active":"");
if(c.label===null){c.label=this.buttonElement.html()
}if(this.element.is(":disabled")){c.disabled=true
}this.buttonElement.addClass("ui-button ui-widget ui-state-default ui-corner-all").attr("role","button").bind("mouseenter.button",function(){if(!c.disabled){b(this).addClass("ui-state-hover");
this===h&&b(this).addClass("ui-state-active")
}}).bind("mouseleave.button",function(){c.disabled||b(this).removeClass(f)
}).bind("click.button",function(d){if(c.disabled){d.preventDefault();
d.stopImmediatePropagation()
}});
this.element.bind("focus.button",function(){a.buttonElement.addClass("ui-state-focus")
}).bind("blur.button",function(){a.buttonElement.removeClass("ui-state-focus")
});
if(e){this.element.bind("change.button",function(){g||a.refresh()
});
this.buttonElement.bind("mousedown.button",function(d){if(!c.disabled){g=false;
i=d.pageX;
j=d.pageY
}}).bind("mouseup.button",function(d){if(!c.disabled){if(i!==d.pageX||j!==d.pageY){g=true
}}})
}if(this.type==="checkbox"){this.buttonElement.bind("click.button",function(){if(c.disabled||g){return false
}b(this).toggleClass("ui-state-active");
a.buttonElement.attr("aria-pressed",a.element[0].checked)
})
}else{if(this.type==="radio"){this.buttonElement.bind("click.button",function(){if(c.disabled||g){return false
}b(this).addClass("ui-state-active");
a.buttonElement.attr("aria-pressed","true");
var d=a.element[0];
k(d).not(d).map(function(){return b(this).button("widget")[0]
}).removeClass("ui-state-active").attr("aria-pressed","false")
})
}else{this.buttonElement.bind("mousedown.button",function(){if(c.disabled){return false
}b(this).addClass("ui-state-active");
h=this;
b(document).one("mouseup",function(){h=null
})
}).bind("mouseup.button",function(){if(c.disabled){return false
}b(this).removeClass("ui-state-active")
}).bind("keydown.button",function(d){if(c.disabled){return false
}if(d.keyCode==b.ui.keyCode.SPACE||d.keyCode==b.ui.keyCode.ENTER){b(this).addClass("ui-state-active")
}}).bind("keyup.button",function(){b(this).removeClass("ui-state-active")
});
this.buttonElement.is("a")&&this.buttonElement.keyup(function(d){d.keyCode===b.ui.keyCode.SPACE&&b(this).click()
})
}}this._setOption("disabled",c.disabled);
this._resetButton()
},_determineButtonType:function(){this.type=this.element.is(":checkbox")?"checkbox":this.element.is(":radio")?"radio":this.element.is("input")?"input":"button";
if(this.type==="checkbox"||this.type==="radio"){var a=this.element.parents().filter(":last"),c="label[for='"+this.element.attr("id")+"']";
this.buttonElement=a.find(c);
if(!this.buttonElement.length){a=a.length?a.siblings():this.element.siblings();
this.buttonElement=a.filter(c);
if(!this.buttonElement.length){this.buttonElement=a.find(c)
}}this.element.addClass("ui-helper-hidden-accessible");
(a=this.element.is(":checked"))&&this.buttonElement.addClass("ui-state-active");
this.buttonElement.attr("aria-pressed",a)
}else{this.buttonElement=this.element
}},widget:function(){return this.buttonElement
},destroy:function(){this.element.removeClass("ui-helper-hidden-accessible");
this.buttonElement.removeClass("ui-button ui-widget ui-state-default ui-corner-all ui-state-hover ui-state-active  ui-button-icons-only ui-button-icon-only ui-button-text-icons ui-button-text-icon-primary ui-button-text-icon-secondary ui-button-text-only").removeAttr("role").removeAttr("aria-pressed").html(this.buttonElement.find(".ui-button-text").html());
this.hasTitle||this.buttonElement.removeAttr("title");
b.Widget.prototype.destroy.call(this)
},_setOption:function(a,c){b.Widget.prototype._setOption.apply(this,arguments);
if(a==="disabled"){c?this.element.propAttr("disabled",true):this.element.propAttr("disabled",false)
}else{this._resetButton()
}},refresh:function(){var a=this.element.is(":disabled");
a!==this.options.disabled&&this._setOption("disabled",a);
if(this.type==="radio"){k(this.element[0]).each(function(){b(this).is(":checked")?b(this).button("widget").addClass("ui-state-active").attr("aria-pressed","true"):b(this).button("widget").removeClass("ui-state-active").attr("aria-pressed","false")
})
}else{if(this.type==="checkbox"){this.element.is(":checked")?this.buttonElement.addClass("ui-state-active").attr("aria-pressed","true"):this.buttonElement.removeClass("ui-state-active").attr("aria-pressed","false")
}}},_resetButton:function(){if(this.type==="input"){this.options.label&&this.element.val(this.options.label)
}else{var a=this.buttonElement.removeClass("ui-button-icons-only ui-button-icon-only ui-button-text-icons ui-button-text-icon-primary ui-button-text-icon-secondary ui-button-text-only"),c=b("<span></span>").addClass("ui-button-text").html(this.options.label).appendTo(a.empty()).text(),e=this.options.icons,f=e.primary&&e.secondary,d=[];
if(e.primary||e.secondary){if(this.options.text){d.push("ui-button-text-icon"+(f?"s":e.primary?"-primary":"-secondary"))
}e.primary&&a.prepend("<span class='ui-button-icon-primary ui-icon "+e.primary+"'></span>");
e.secondary&&a.append("<span class='ui-button-icon-secondary ui-icon "+e.secondary+"'></span>");
if(!this.options.text){d.push(f?"ui-button-icons-only":"ui-button-icon-only");
this.hasTitle||a.attr("title",c)
}}else{d.push("ui-button-text-only")
}a.addClass(d.join(" "))
}}});
b.widget("ui.buttonset",{options:{items:":button, :submit, :reset, :checkbox, :radio, a, :data(button)"},_create:function(){this.element.addClass("ui-buttonset")
},_init:function(){this.refresh()
},_setOption:function(a,c){a==="disabled"&&this.buttons.button("option",a,c);
b.Widget.prototype._setOption.apply(this,arguments)
},refresh:function(){var a=this.element.css("direction")==="ltr";
this.buttons=this.element.find(this.options.items).filter(":ui-button").button("refresh").end().not(":ui-button").button().end().map(function(){return b(this).button("widget")[0]
}).removeClass("ui-corner-all ui-corner-left ui-corner-right").filter(":first").addClass(a?"ui-corner-left":"ui-corner-right").end().filter(":last").addClass(a?"ui-corner-right":"ui-corner-left").end().end()
},destroy:function(){this.element.removeClass("ui-buttonset");
this.buttons.map(function(){return b(this).button("widget")[0]
}).removeClass("ui-corner-left ui-corner-right").end().button("destroy");
b.Widget.prototype.destroy.call(this)
}})
})(jQuery);
(function(c,l){var m={buttons:true,height:true,maxHeight:true,maxWidth:true,minHeight:true,minWidth:true,width:true},n={maxHeight:true,maxWidth:true,minHeight:true,minWidth:true},o=c.attrFn||{val:true,css:true,html:true,text:true,data:true,width:true,height:true,offset:true,click:true};
c.widget("ui.dialog",{options:{autoOpen:true,buttons:{},closeOnEscape:true,closeText:"close",dialogClass:"",draggable:true,hide:null,height:"auto",maxHeight:false,maxWidth:false,minHeight:150,minWidth:150,modal:false,position:{my:"center",at:"center",collision:"fit",using:function(a){var b=c(this).css(a).offset().top;
b<0&&c(this).css("top",a.top-b)
}},resizable:true,show:null,stack:true,title:"",width:300,zIndex:1000},_create:function(){this.originalTitle=this.element.attr("title");
if(typeof this.originalTitle!=="string"){this.originalTitle=""
}this.options.title=this.options.title||this.originalTitle;
var a=this,b=a.options,d=b.title||"&#160;",e=c.ui.dialog.getTitleId(a.element),g=(a.uiDialog=c("<div></div>")).appendTo(document.body).hide().addClass("ui-dialog ui-widget ui-widget-content ui-corner-all "+b.dialogClass).css({zIndex:b.zIndex}).attr("tabIndex",-1).css("outline",0).keydown(function(i){if(b.closeOnEscape&&!i.isDefaultPrevented()&&i.keyCode&&i.keyCode===c.ui.keyCode.ESCAPE){a.close(i);
i.preventDefault()
}}).attr({role:"dialog","aria-labelledby":e}).mousedown(function(i){a.moveToTop(false,i)
});
a.element.show().removeAttr("title").addClass("ui-dialog-content ui-widget-content").appendTo(g);
var f=(a.uiDialogTitlebar=c("<div></div>")).addClass("ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix").prependTo(g),h=c('<a href="#"></a>').addClass("ui-dialog-titlebar-close ui-corner-all").attr("role","button").hover(function(){h.addClass("ui-state-hover")
},function(){h.removeClass("ui-state-hover")
}).focus(function(){h.addClass("ui-state-focus")
}).blur(function(){h.removeClass("ui-state-focus")
}).click(function(i){a.close(i);
return false
}).appendTo(f);
(a.uiDialogTitlebarCloseText=c("<span></span>")).addClass("ui-icon ui-icon-closethick").text(b.closeText).appendTo(h);
c("<span></span>").addClass("ui-dialog-title").attr("id",e).html(d).prependTo(f);
if(c.isFunction(b.beforeclose)&&!c.isFunction(b.beforeClose)){b.beforeClose=b.beforeclose
}f.find("*").add(f).disableSelection();
b.draggable&&c.fn.draggable&&a._makeDraggable();
b.resizable&&c.fn.resizable&&a._makeResizable();
a._createButtons(b.buttons);
a._isOpen=false;
c.fn.bgiframe&&g.bgiframe()
},_init:function(){this.options.autoOpen&&this.open()
},destroy:function(){var a=this;
a.overlay&&a.overlay.destroy();
a.uiDialog.hide();
a.element.unbind(".dialog").removeData("dialog").removeClass("ui-dialog-content ui-widget-content").hide().appendTo("body");
a.uiDialog.remove();
a.originalTitle&&a.element.attr("title",a.originalTitle);
return a
},widget:function(){return this.uiDialog
},close:function(a){var b=this,d,e;
if(false!==b._trigger("beforeClose",a)){b.overlay&&b.overlay.destroy();
b.uiDialog.unbind("keypress.ui-dialog");
b._isOpen=false;
if(b.options.hide){b.uiDialog.hide(b.options.hide,function(){b._trigger("close",a)
})
}else{b.uiDialog.hide();
b._trigger("close",a)
}c.ui.dialog.overlay.resize();
if(b.options.modal){d=0;
c(".ui-dialog").each(function(){if(this!==b.uiDialog[0]){e=c(this).css("z-index");
isNaN(e)||(d=Math.max(d,e))
}});
c.ui.dialog.maxZ=d
}return b
}},isOpen:function(){return this._isOpen
},moveToTop:function(a,b){var d=this,e=d.options;
if(e.modal&&!a||!e.stack&&!e.modal){return d._trigger("focus",b)
}if(e.zIndex>c.ui.dialog.maxZ){c.ui.dialog.maxZ=e.zIndex
}if(d.overlay){c.ui.dialog.maxZ+=1;
d.overlay.$el.css("z-index",c.ui.dialog.overlay.maxZ=c.ui.dialog.maxZ)
}a={scrollTop:d.element.scrollTop(),scrollLeft:d.element.scrollLeft()};
c.ui.dialog.maxZ+=1;
d.uiDialog.css("z-index",c.ui.dialog.maxZ);
d.element.attr(a);
d._trigger("focus",b);
return d
},open:function(){if(!this._isOpen){var a=this,b=a.options,d=a.uiDialog;
a.overlay=b.modal?new c.ui.dialog.overlay(a):null;
a._size();
a._position(b.position);
d.show(b.show);
a.moveToTop(true);
b.modal&&d.bind("keypress.ui-dialog",function(e){if(e.keyCode===c.ui.keyCode.TAB){var g=c(":tabbable",this),f=g.filter(":first");
g=g.filter(":last");
if(e.target===g[0]&&!e.shiftKey){f.focus(1);
return false
}else{if(e.target===f[0]&&e.shiftKey){g.focus(1);
return false
}}}});
c(a.element.find(":tabbable").get().concat(d.find(".ui-dialog-buttonpane :tabbable").get().concat(d.get()))).eq(0).focus();
a._isOpen=true;
a._trigger("open");
return a
}},_createButtons:function(a){var b=this,d=false,e=c("<div></div>").addClass("ui-dialog-buttonpane ui-widget-content ui-helper-clearfix"),g=c("<div></div>").addClass("ui-dialog-buttonset").appendTo(e);
b.uiDialog.find(".ui-dialog-buttonpane").remove();
typeof a==="object"&&a!==null&&c.each(a,function(){return !(d=true)
});
if(d){c.each(a,function(f,h){h=c.isFunction(h)?{click:h,text:f}:h;
var i=c('<button type="button"></button>').click(function(){h.click.apply(b.element[0],arguments)
}).appendTo(g);
c.each(h,function(j,k){if(j!=="click"){j in o?i[j](k):i.attr(j,k)
}});
c.fn.button&&i.button()
});
e.appendTo(b.uiDialog)
}},_makeDraggable:function(){function a(f){return{position:f.position,offset:f.offset}
}var b=this,d=b.options,e=c(document),g;
b.uiDialog.draggable({cancel:".ui-dialog-content, .ui-dialog-titlebar-close",handle:".ui-dialog-titlebar",containment:"document",start:function(f,h){g=d.height==="auto"?"auto":c(this).height();
c(this).height(c(this).height()).addClass("ui-dialog-dragging");
b._trigger("dragStart",f,a(h))
},drag:function(f,h){b._trigger("drag",f,a(h))
},stop:function(f,h){d.position=[h.position.left-e.scrollLeft(),h.position.top-e.scrollTop()];
c(this).removeClass("ui-dialog-dragging").height(g);
b._trigger("dragStop",f,a(h));
c.ui.dialog.overlay.resize()
}})
},_makeResizable:function(a){function b(f){return{originalPosition:f.originalPosition,originalSize:f.originalSize,position:f.position,size:f.size}
}a=a===l?this.options.resizable:a;
var d=this,e=d.options,g=d.uiDialog.css("position");
a=typeof a==="string"?a:"n,e,s,w,se,sw,ne,nw";
d.uiDialog.resizable({cancel:".ui-dialog-content",containment:"document",alsoResize:d.element,maxWidth:e.maxWidth,maxHeight:e.maxHeight,minWidth:e.minWidth,minHeight:d._minHeight(),handles:a,start:function(f,h){c(this).addClass("ui-dialog-resizing");
d._trigger("resizeStart",f,b(h))
},resize:function(f,h){d._trigger("resize",f,b(h))
},stop:function(f,h){c(this).removeClass("ui-dialog-resizing");
e.height=c(this).height();
e.width=c(this).width();
d._trigger("resizeStop",f,b(h));
c.ui.dialog.overlay.resize()
}}).css("position",g).find(".ui-resizable-se").addClass("ui-icon ui-icon-grip-diagonal-se")
},_minHeight:function(){var a=this.options;
return a.height==="auto"?a.minHeight:Math.min(a.minHeight,a.height)
},_position:function(a){var b=[],d=[0,0],e;
if(a){if(typeof a==="string"||typeof a==="object"&&"0" in a){b=a.split?a.split(" "):[a[0],a[1]];
if(b.length===1){b[1]=b[0]
}c.each(["left","top"],function(g,f){if(+b[g]===b[g]){d[g]=b[g];
b[g]=f
}});
a={my:b.join(" "),at:b.join(" "),offset:d.join(" ")}
}a=c.extend({},c.ui.dialog.prototype.options.position,a)
}else{a=c.ui.dialog.prototype.options.position
}(e=this.uiDialog.is(":visible"))||this.uiDialog.show();
this.uiDialog.css({top:0,left:0}).position(c.extend({of:window},a));
e||this.uiDialog.hide()
},_setOptions:function(a){var b=this,d={},e=false;
c.each(a,function(g,f){b._setOption(g,f);
if(g in m){e=true
}if(g in n){d[g]=f
}});
e&&this._size();
this.uiDialog.is(":data(resizable)")&&this.uiDialog.resizable("option",d)
},_setOption:function(a,b){var d=this,e=d.uiDialog;
switch(a){case"beforeclose":a="beforeClose";
break;
case"buttons":d._createButtons(b);
break;
case"closeText":d.uiDialogTitlebarCloseText.text(""+b);
break;
case"dialogClass":e.removeClass(d.options.dialogClass).addClass("ui-dialog ui-widget ui-widget-content ui-corner-all "+b);
break;
case"disabled":b?e.addClass("ui-dialog-disabled"):e.removeClass("ui-dialog-disabled");
break;
case"draggable":var g=e.is(":data(draggable)");
g&&!b&&e.draggable("destroy");
!g&&b&&d._makeDraggable();
break;
case"position":d._position(b);
break;
case"resizable":(g=e.is(":data(resizable)"))&&!b&&e.resizable("destroy");
g&&typeof b==="string"&&e.resizable("option","handles",b);
!g&&b!==false&&d._makeResizable(b);
break;
case"title":c(".ui-dialog-title",d.uiDialogTitlebar).html(""+(b||"&#160;"));
break
}c.Widget.prototype._setOption.apply(d,arguments)
},_size:function(){var a=this.options,b,d,e=this.uiDialog.is(":visible");
this.element.show().css({width:"auto",minHeight:0,height:0});
if(a.minWidth>a.width){a.width=a.minWidth
}b=this.uiDialog.css({height:"auto",width:a.width}).height();
d=Math.max(0,a.minHeight-b);
if(a.height==="auto"){if(c.support.minHeight){this.element.css({minHeight:d,height:"auto"})
}else{this.uiDialog.show();
a=this.element.css("height","auto").height();
e||this.uiDialog.hide();
this.element.height(Math.max(a,d))
}}else{this.element.height(Math.max(a.height-b,0))
}this.uiDialog.is(":data(resizable)")&&this.uiDialog.resizable("option","minHeight",this._minHeight())
}});
c.extend(c.ui.dialog,{version:"1.8.16",uuid:0,maxZ:0,getTitleId:function(a){a=a.attr("id");
if(!a){this.uuid+=1;
a=this.uuid
}return"ui-dialog-title-"+a
},overlay:function(a){this.$el=c.ui.dialog.overlay.create(a)
}});
c.extend(c.ui.dialog.overlay,{instances:[],oldInstances:[],maxZ:0,events:c.map("focus,mousedown,mouseup,keydown,keypress,click".split(","),function(a){return a+".dialog-overlay"
}).join(" "),create:function(a){if(this.instances.length===0){setTimeout(function(){c.ui.dialog.overlay.instances.length&&c(document).bind(c.ui.dialog.overlay.events,function(d){if(c(d.target).zIndex()<c.ui.dialog.overlay.maxZ){return false
}})
},1);
c(document).bind("keydown.dialog-overlay",function(d){if(a.options.closeOnEscape&&!d.isDefaultPrevented()&&d.keyCode&&d.keyCode===c.ui.keyCode.ESCAPE){a.close(d);
d.preventDefault()
}});
c(window).bind("resize.dialog-overlay",c.ui.dialog.overlay.resize)
}var b=(this.oldInstances.pop()||c("<div></div>").addClass("ui-widget-overlay")).appendTo(document.body).css({width:this.width(),height:this.height()});
c.fn.bgiframe&&b.bgiframe();
this.instances.push(b);
return b
},destroy:function(a){var b=c.inArray(a,this.instances);
b!=-1&&this.oldInstances.push(this.instances.splice(b,1)[0]);
this.instances.length===0&&c([document,window]).unbind(".dialog-overlay");
a.remove();
var d=0;
c.each(this.instances,function(){d=Math.max(d,this.css("z-index"))
});
this.maxZ=d
},height:function(){var a,b;
if(c.browser.msie&&c.browser.version<7){a=Math.max(document.documentElement.scrollHeight,document.body.scrollHeight);
b=Math.max(document.documentElement.offsetHeight,document.body.offsetHeight);
return a<b?c(window).height()+"px":a+"px"
}else{return c(document).height()+"px"
}},width:function(){var a,b;
if(c.browser.msie){a=Math.max(document.documentElement.scrollWidth,document.body.scrollWidth);
b=Math.max(document.documentElement.offsetWidth,document.body.offsetWidth);
return a<b?c(window).width()+"px":a+"px"
}else{return c(document).width()+"px"
}},resize:function(){var a=c([]);
c.each(c.ui.dialog.overlay.instances,function(){a=a.add(this)
});
a.css({width:0,height:0}).css({width:c.ui.dialog.overlay.width(),height:c.ui.dialog.overlay.height()})
}});
c.extend(c.ui.dialog.overlay.prototype,{destroy:function(){c.ui.dialog.overlay.destroy(this.$el)
}})
})(jQuery);
(function(d,C){function M(){this.debug=false;
this._curInst=null;
this._keyEvent=false;
this._disabledInputs=[];
this._inDialog=this._datepickerShowing=false;
this._mainDivId="ui-datepicker-div";
this._inlineClass="ui-datepicker-inline";
this._appendClass="ui-datepicker-append";
this._triggerClass="ui-datepicker-trigger";
this._dialogClass="ui-datepicker-dialog";
this._disableClass="ui-datepicker-disabled";
this._unselectableClass="ui-datepicker-unselectable";
this._currentClass="ui-datepicker-current-day";
this._dayOverClass="ui-datepicker-days-cell-over";
this.regional=[];
this.regional[""]={closeText:"Done",prevText:"Prev",nextText:"Next",currentText:"Today",monthNames:["January","February","March","April","May","June","July","August","September","October","November","December"],monthNamesShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],dayNames:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],dayNamesShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],dayNamesMin:["Su","Mo","Tu","We","Th","Fr","Sa"],weekHeader:"Wk",dateFormat:"mm/dd/yy",firstDay:0,isRTL:false,showMonthAfterYear:false,yearSuffix:""};
this._defaults={showOn:"focus",showAnim:"fadeIn",showOptions:{},defaultDate:null,appendText:"",buttonText:"...",buttonImage:"",buttonImageOnly:false,hideIfNoPrevNext:false,navigationAsDateFormat:false,gotoCurrent:false,changeMonth:false,changeYear:false,yearRange:"c-10:c+10",showOtherMonths:false,selectOtherMonths:false,showWeek:false,calculateWeek:this.iso8601Week,shortYearCutoff:"+10",minDate:null,maxDate:null,duration:"fast",beforeShowDay:null,beforeShow:null,onSelect:null,onChangeMonthYear:null,onClose:null,numberOfMonths:1,showCurrentAtPos:0,stepMonths:1,stepBigMonths:12,altField:"",altFormat:"",constrainInput:true,showButtonPanel:false,autoSize:false,disabled:false};
d.extend(this._defaults,this.regional[""]);
this.dpDiv=N(d('<div id="'+this._mainDivId+'" class="ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>'))
}function N(a){return a.bind("mouseout",function(b){b=d(b.target).closest("button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a");
b.length&&b.removeClass("ui-state-hover ui-datepicker-prev-hover ui-datepicker-next-hover")
}).bind("mouseover",function(b){b=d(b.target).closest("button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a");
if(!(d.datepicker._isDisabledDatepicker(J.inline?a.parent()[0]:J.input[0])||!b.length)){b.parents(".ui-datepicker-calendar").find("a").removeClass("ui-state-hover");
b.addClass("ui-state-hover");
b.hasClass("ui-datepicker-prev")&&b.addClass("ui-datepicker-prev-hover");
b.hasClass("ui-datepicker-next")&&b.addClass("ui-datepicker-next-hover")
}})
}function H(a,b){d.extend(a,b);
for(var c in b){if(b[c]==null||b[c]==C){a[c]=b[c]
}}return a
}d.extend(d.ui,{datepicker:{version:"1.8.16"}});
var B=(new Date).getTime(),J;
d.extend(M.prototype,{markerClassName:"hasDatepicker",maxRows:4,log:function(){this.debug&&console.log.apply("",arguments)
},_widgetDatepicker:function(){return this.dpDiv
},setDefaults:function(a){H(this._defaults,a||{});
return this
},_attachDatepicker:function(a,b){var c=null;
for(var e in this._defaults){var f=a.getAttribute("date:"+e);
if(f){c=c||{};
try{c[e]=eval(f)
}catch(h){c[e]=f
}}}e=a.nodeName.toLowerCase();
f=e=="div"||e=="span";
if(!a.id){this.uuid+=1;
a.id="dp"+this.uuid
}var i=this._newInst(d(a),f);
i.settings=d.extend({},b||{},c||{});
if(e=="input"){this._connectDatepicker(a,i)
}else{f&&this._inlineDatepicker(a,i)
}},_newInst:function(a,b){return{id:a[0].id.replace(/([^A-Za-z0-9_-])/g,"\\\\$1"),input:a,selectedDay:0,selectedMonth:0,selectedYear:0,drawMonth:0,drawYear:0,inline:b,dpDiv:!b?this.dpDiv:N(d('<div class="'+this._inlineClass+' ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>'))}
},_connectDatepicker:function(a,b){var c=d(a);
b.append=d([]);
b.trigger=d([]);
if(!c.hasClass(this.markerClassName)){this._attachments(c,b);
c.addClass(this.markerClassName).keydown(this._doKeyDown).keypress(this._doKeyPress).keyup(this._doKeyUp).bind("setData.datepicker",function(e,f,h){b.settings[f]=h
}).bind("getData.datepicker",function(e,f){return this._get(b,f)
});
this._autoSize(b);
d.data(a,"datepicker",b);
b.settings.disabled&&this._disableDatepicker(a)
}},_attachments:function(a,b){var c=this._get(b,"appendText"),e=this._get(b,"isRTL");
b.append&&b.append.remove();
if(c){b.append=d('<span class="'+this._appendClass+'">'+c+"</span>");
a[e?"before":"after"](b.append)
}a.unbind("focus",this._showDatepicker);
b.trigger&&b.trigger.remove();
c=this._get(b,"showOn");
if(c=="focus"||c=="both"){a.focus(this._showDatepicker)
}if(c=="button"||c=="both"){c=this._get(b,"buttonText");
var f=this._get(b,"buttonImage");
b.trigger=d(this._get(b,"buttonImageOnly")?d("<img/>").addClass(this._triggerClass).attr({src:f,alt:c,title:c}):d('<button type="button"></button>').addClass(this._triggerClass).html(f==""?c:d("<img/>").attr({src:f,alt:c,title:c})));
a[e?"before":"after"](b.trigger);
b.trigger.click(function(){d.datepicker._datepickerShowing&&d.datepicker._lastInput==a[0]?d.datepicker._hideDatepicker():d.datepicker._showDatepicker(a[0]);
return false
})
}},_autoSize:function(a){if(this._get(a,"autoSize")&&!a.inline){var b=new Date(2009,11,20),c=this._get(a,"dateFormat");
if(c.match(/[DM]/)){var e=function(f){for(var h=0,i=0,g=0;
g<f.length;
g++){if(f[g].length>h){h=f[g].length;
i=g
}}return i
};
b.setMonth(e(this._get(a,c.match(/MM/)?"monthNames":"monthNamesShort")));
b.setDate(e(this._get(a,c.match(/DD/)?"dayNames":"dayNamesShort"))+20-b.getDay())
}a.input.attr("size",this._formatDate(a,b).length)
}},_inlineDatepicker:function(a,b){var c=d(a);
if(!c.hasClass(this.markerClassName)){c.addClass(this.markerClassName).append(b.dpDiv).bind("setData.datepicker",function(e,f,h){b.settings[f]=h
}).bind("getData.datepicker",function(e,f){return this._get(b,f)
});
d.data(a,"datepicker",b);
this._setDate(b,this._getDefaultDate(b),true);
this._updateDatepicker(b);
this._updateAlternate(b);
b.settings.disabled&&this._disableDatepicker(a);
b.dpDiv.css("display","block")
}},_dialogDatepicker:function(a,b,c,e,f){a=this._dialogInst;
if(!a){this.uuid+=1;
this._dialogInput=d('<input type="text" id="'+("dp"+this.uuid)+'" style="position: absolute; top: -100px; width: 0px; z-index: -10;"/>');
this._dialogInput.keydown(this._doKeyDown);
d("body").append(this._dialogInput);
a=this._dialogInst=this._newInst(this._dialogInput,false);
a.settings={};
d.data(this._dialogInput[0],"datepicker",a)
}H(a.settings,e||{});
b=b&&b.constructor==Date?this._formatDate(a,b):b;
this._dialogInput.val(b);
this._pos=f?f.length?f:[f.pageX,f.pageY]:null;
if(!this._pos){this._pos=[document.documentElement.clientWidth/2-100+(document.documentElement.scrollLeft||document.body.scrollLeft),document.documentElement.clientHeight/2-150+(document.documentElement.scrollTop||document.body.scrollTop)]
}this._dialogInput.css("left",this._pos[0]+20+"px").css("top",this._pos[1]+"px");
a.settings.onSelect=c;
this._inDialog=true;
this.dpDiv.addClass(this._dialogClass);
this._showDatepicker(this._dialogInput[0]);
d.blockUI&&d.blockUI(this.dpDiv);
d.data(this._dialogInput[0],"datepicker",a);
return this
},_destroyDatepicker:function(a){var b=d(a),c=d.data(a,"datepicker");
if(b.hasClass(this.markerClassName)){var e=a.nodeName.toLowerCase();
d.removeData(a,"datepicker");
if(e=="input"){c.append.remove();
c.trigger.remove();
b.removeClass(this.markerClassName).unbind("focus",this._showDatepicker).unbind("keydown",this._doKeyDown).unbind("keypress",this._doKeyPress).unbind("keyup",this._doKeyUp)
}else{if(e=="div"||e=="span"){b.removeClass(this.markerClassName).empty()
}}}},_enableDatepicker:function(a){var b=d(a),c=d.data(a,"datepicker");
if(b.hasClass(this.markerClassName)){var e=a.nodeName.toLowerCase();
if(e=="input"){a.disabled=false;
c.trigger.filter("button").each(function(){this.disabled=false
}).end().filter("img").css({opacity:"1.0",cursor:""})
}else{if(e=="div"||e=="span"){b=b.children("."+this._inlineClass);
b.children().removeClass("ui-state-disabled");
b.find("select.ui-datepicker-month, select.ui-datepicker-year").removeAttr("disabled")
}}this._disabledInputs=d.map(this._disabledInputs,function(f){return f==a?null:f
})
}},_disableDatepicker:function(a){var b=d(a),c=d.data(a,"datepicker");
if(b.hasClass(this.markerClassName)){var e=a.nodeName.toLowerCase();
if(e=="input"){a.disabled=true;
c.trigger.filter("button").each(function(){this.disabled=true
}).end().filter("img").css({opacity:"0.5",cursor:"default"})
}else{if(e=="div"||e=="span"){b=b.children("."+this._inlineClass);
b.children().addClass("ui-state-disabled");
b.find("select.ui-datepicker-month, select.ui-datepicker-year").attr("disabled","disabled")
}}this._disabledInputs=d.map(this._disabledInputs,function(f){return f==a?null:f
});
this._disabledInputs[this._disabledInputs.length]=a
}},_isDisabledDatepicker:function(a){if(!a){return false
}for(var b=0;
b<this._disabledInputs.length;
b++){if(this._disabledInputs[b]==a){return true
}}return false
},_getInst:function(a){try{return d.data(a,"datepicker")
}catch(b){throw"Missing instance data for this datepicker"
}},_optionDatepicker:function(a,b,c){var e=this._getInst(a);
if(arguments.length==2&&typeof b=="string"){return b=="defaults"?d.extend({},d.datepicker._defaults):e?b=="all"?d.extend({},e.settings):this._get(e,b):null
}var f=b||{};
if(typeof b=="string"){f={};
f[b]=c
}if(e){this._curInst==e&&this._hideDatepicker();
var h=this._getDateDatepicker(a,true),i=this._getMinMaxDate(e,"min"),g=this._getMinMaxDate(e,"max");
H(e.settings,f);
if(i!==null&&f.dateFormat!==C&&f.minDate===C){e.settings.minDate=this._formatDate(e,i)
}if(g!==null&&f.dateFormat!==C&&f.maxDate===C){e.settings.maxDate=this._formatDate(e,g)
}this._attachments(d(a),e);
this._autoSize(e);
this._setDate(e,h);
this._updateAlternate(e);
this._updateDatepicker(e)
}},_changeDatepicker:function(a,b,c){this._optionDatepicker(a,b,c)
},_refreshDatepicker:function(a){(a=this._getInst(a))&&this._updateDatepicker(a)
},_setDateDatepicker:function(a,b){if(a=this._getInst(a)){this._setDate(a,b);
this._updateDatepicker(a);
this._updateAlternate(a)
}},_getDateDatepicker:function(a,b){(a=this._getInst(a))&&!a.inline&&this._setDateFromField(a,b);
return a?this._getDate(a):null
},_doKeyDown:function(a){var b=d.datepicker._getInst(a.target),c=true,e=b.dpDiv.is(".ui-datepicker-rtl");
b._keyEvent=true;
if(d.datepicker._datepickerShowing){switch(a.keyCode){case 9:d.datepicker._hideDatepicker();
c=false;
break;
case 13:c=d("td."+d.datepicker._dayOverClass+":not(."+d.datepicker._currentClass+")",b.dpDiv);
c[0]&&d.datepicker._selectDay(a.target,b.selectedMonth,b.selectedYear,c[0]);
if(a=d.datepicker._get(b,"onSelect")){c=d.datepicker._formatDate(b);
a.apply(b.input?b.input[0]:null,[c,b])
}else{d.datepicker._hideDatepicker()
}return false;
case 27:d.datepicker._hideDatepicker();
break;
case 33:d.datepicker._adjustDate(a.target,a.ctrlKey?-d.datepicker._get(b,"stepBigMonths"):-d.datepicker._get(b,"stepMonths"),"M");
break;
case 34:d.datepicker._adjustDate(a.target,a.ctrlKey?+d.datepicker._get(b,"stepBigMonths"):+d.datepicker._get(b,"stepMonths"),"M");
break;
case 35:if(a.ctrlKey||a.metaKey){d.datepicker._clearDate(a.target)
}c=a.ctrlKey||a.metaKey;
break;
case 36:if(a.ctrlKey||a.metaKey){d.datepicker._gotoToday(a.target)
}c=a.ctrlKey||a.metaKey;
break;
case 37:if(a.ctrlKey||a.metaKey){d.datepicker._adjustDate(a.target,e?+1:-1,"D")
}c=a.ctrlKey||a.metaKey;
if(a.originalEvent.altKey){d.datepicker._adjustDate(a.target,a.ctrlKey?-d.datepicker._get(b,"stepBigMonths"):-d.datepicker._get(b,"stepMonths"),"M")
}break;
case 38:if(a.ctrlKey||a.metaKey){d.datepicker._adjustDate(a.target,-7,"D")
}c=a.ctrlKey||a.metaKey;
break;
case 39:if(a.ctrlKey||a.metaKey){d.datepicker._adjustDate(a.target,e?-1:+1,"D")
}c=a.ctrlKey||a.metaKey;
if(a.originalEvent.altKey){d.datepicker._adjustDate(a.target,a.ctrlKey?+d.datepicker._get(b,"stepBigMonths"):+d.datepicker._get(b,"stepMonths"),"M")
}break;
case 40:if(a.ctrlKey||a.metaKey){d.datepicker._adjustDate(a.target,+7,"D")
}c=a.ctrlKey||a.metaKey;
break;
default:c=false
}}else{if(a.keyCode==36&&a.ctrlKey){d.datepicker._showDatepicker(this)
}else{c=false
}}if(c){a.preventDefault();
a.stopPropagation()
}},_doKeyPress:function(a){var b=d.datepicker._getInst(a.target);
if(d.datepicker._get(b,"constrainInput")){b=d.datepicker._possibleChars(d.datepicker._get(b,"dateFormat"));
var c=String.fromCharCode(a.charCode==C?a.keyCode:a.charCode);
return a.ctrlKey||a.metaKey||c<" "||!b||b.indexOf(c)>-1
}},_doKeyUp:function(a){a=d.datepicker._getInst(a.target);
if(a.input.val()!=a.lastVal){try{if(d.datepicker.parseDate(d.datepicker._get(a,"dateFormat"),a.input?a.input.val():null,d.datepicker._getFormatConfig(a))){d.datepicker._setDateFromField(a);
d.datepicker._updateAlternate(a);
d.datepicker._updateDatepicker(a)
}}catch(b){d.datepicker.log(b)
}}return true
},_showDatepicker:function(a){a=a.target||a;
if(a.nodeName.toLowerCase()!="input"){a=d("input",a.parentNode)[0]
}if(!(d.datepicker._isDisabledDatepicker(a)||d.datepicker._lastInput==a)){var b=d.datepicker._getInst(a);
if(d.datepicker._curInst&&d.datepicker._curInst!=b){d.datepicker._datepickerShowing&&d.datepicker._triggerOnClose(d.datepicker._curInst);
d.datepicker._curInst.dpDiv.stop(true,true)
}var c=d.datepicker._get(b,"beforeShow");
c=c?c.apply(a,[a,b]):{};
if(c!==false){H(b.settings,c);
b.lastVal=null;
d.datepicker._lastInput=a;
d.datepicker._setDateFromField(b);
if(d.datepicker._inDialog){a.value=""
}if(!d.datepicker._pos){d.datepicker._pos=d.datepicker._findPos(a);
d.datepicker._pos[1]+=a.offsetHeight
}var e=false;
d(a).parents().each(function(){e|=d(this).css("position")=="fixed";
return !e
});
if(e&&d.browser.opera){d.datepicker._pos[0]-=document.documentElement.scrollLeft;
d.datepicker._pos[1]-=document.documentElement.scrollTop
}c={left:d.datepicker._pos[0],top:d.datepicker._pos[1]};
d.datepicker._pos=null;
b.dpDiv.empty();
b.dpDiv.css({position:"absolute",display:"block",top:"-1000px"});
d.datepicker._updateDatepicker(b);
c=d.datepicker._checkOffset(b,c,e);
b.dpDiv.css({position:d.datepicker._inDialog&&d.blockUI?"static":e?"fixed":"absolute",display:"none",left:c.left+"px",top:c.top+"px"});
if(!b.inline){c=d.datepicker._get(b,"showAnim");
var f=d.datepicker._get(b,"duration"),h=function(){var i=b.dpDiv.find("iframe.ui-datepicker-cover");
if(i.length){var g=d.datepicker._getBorders(b.dpDiv);
i.css({left:-g[0],top:-g[1],width:b.dpDiv.outerWidth(),height:b.dpDiv.outerHeight()})
}};
b.dpDiv.zIndex(d(a).zIndex()+1);
d.datepicker._datepickerShowing=true;
d.effects&&d.effects[c]?b.dpDiv.show(c,d.datepicker._get(b,"showOptions"),f,h):b.dpDiv[c||"show"](c?f:null,h);
if(!c||!f){h()
}b.input.is(":visible")&&!b.input.is(":disabled")&&b.input.focus();
d.datepicker._curInst=b
}}}},_updateDatepicker:function(a){this.maxRows=4;
var b=d.datepicker._getBorders(a.dpDiv);
J=a;
a.dpDiv.empty().append(this._generateHTML(a));
var c=a.dpDiv.find("iframe.ui-datepicker-cover");
c.length&&c.css({left:-b[0],top:-b[1],width:a.dpDiv.outerWidth(),height:a.dpDiv.outerHeight()});
a.dpDiv.find("."+this._dayOverClass+" a").mouseover();
b=this._getNumberOfMonths(a);
c=b[1];
a.dpDiv.removeClass("ui-datepicker-multi-2 ui-datepicker-multi-3 ui-datepicker-multi-4").width("");
c>1&&a.dpDiv.addClass("ui-datepicker-multi-"+c).css("width",17*c+"em");
a.dpDiv[(b[0]!=1||b[1]!=1?"add":"remove")+"Class"]("ui-datepicker-multi");
a.dpDiv[(this._get(a,"isRTL")?"add":"remove")+"Class"]("ui-datepicker-rtl");
a==d.datepicker._curInst&&d.datepicker._datepickerShowing&&a.input&&a.input.is(":visible")&&!a.input.is(":disabled")&&a.input[0]!=document.activeElement&&a.input.focus();
if(a.yearshtml){var e=a.yearshtml;
setTimeout(function(){e===a.yearshtml&&a.yearshtml&&a.dpDiv.find("select.ui-datepicker-year:first").replaceWith(a.yearshtml);
e=a.yearshtml=null
},0)
}},_getBorders:function(a){var b=function(c){return{thin:1,medium:2,thick:3}[c]||c
};
return[parseFloat(b(a.css("border-left-width"))),parseFloat(b(a.css("border-top-width")))]
},_checkOffset:function(a,b,c){var e=a.dpDiv.outerWidth(),f=a.dpDiv.outerHeight(),h=a.input?a.input.outerWidth():0,i=a.input?a.input.outerHeight():0,g=document.documentElement.clientWidth+d(document).scrollLeft(),j=document.documentElement.clientHeight+d(document).scrollTop();
b.left-=this._get(a,"isRTL")?e-h:0;
b.left-=c&&b.left==a.input.offset().left?d(document).scrollLeft():0;
b.top-=c&&b.top==a.input.offset().top+i?d(document).scrollTop():0;
b.left-=Math.min(b.left,b.left+e>g&&g>e?Math.abs(b.left+e-g):0);
b.top-=Math.min(b.top,b.top+f>j&&j>f?Math.abs(f+i):0);
return b
},_findPos:function(a){for(var b=this._get(this._getInst(a),"isRTL");
a&&(a.type=="hidden"||a.nodeType!=1||d.expr.filters.hidden(a));
){a=a[b?"previousSibling":"nextSibling"]
}a=d(a).offset();
return[a.left,a.top]
},_triggerOnClose:function(a){var b=this._get(a,"onClose");
if(b){b.apply(a.input?a.input[0]:null,[a.input?a.input.val():"",a])
}},_hideDatepicker:function(a){var b=this._curInst;
if(!(!b||a&&b!=d.data(a,"datepicker"))){if(this._datepickerShowing){a=this._get(b,"showAnim");
var c=this._get(b,"duration"),e=function(){d.datepicker._tidyDialog(b);
this._curInst=null
};
d.effects&&d.effects[a]?b.dpDiv.hide(a,d.datepicker._get(b,"showOptions"),c,e):b.dpDiv[a=="slideDown"?"slideUp":a=="fadeIn"?"fadeOut":"hide"](a?c:null,e);
a||e();
d.datepicker._triggerOnClose(b);
this._datepickerShowing=false;
this._lastInput=null;
if(this._inDialog){this._dialogInput.css({position:"absolute",left:"0",top:"-100px"});
if(d.blockUI){d.unblockUI();
d("body").append(this.dpDiv)
}}this._inDialog=false
}}},_tidyDialog:function(a){a.dpDiv.removeClass(this._dialogClass).unbind(".ui-datepicker-calendar")
},_checkExternalClick:function(a){if(d.datepicker._curInst){a=d(a.target);
a[0].id!=d.datepicker._mainDivId&&a.parents("#"+d.datepicker._mainDivId).length==0&&!a.hasClass(d.datepicker.markerClassName)&&!a.hasClass(d.datepicker._triggerClass)&&d.datepicker._datepickerShowing&&!(d.datepicker._inDialog&&d.blockUI)&&d.datepicker._hideDatepicker()
}},_adjustDate:function(a,b,c){a=d(a);
var e=this._getInst(a[0]);
if(!this._isDisabledDatepicker(a[0])){this._adjustInstDate(e,b+(c=="M"?this._get(e,"showCurrentAtPos"):0),c);
this._updateDatepicker(e)
}},_gotoToday:function(a){a=d(a);
var b=this._getInst(a[0]);
if(this._get(b,"gotoCurrent")&&b.currentDay){b.selectedDay=b.currentDay;
b.drawMonth=b.selectedMonth=b.currentMonth;
b.drawYear=b.selectedYear=b.currentYear
}else{var c=new Date;
b.selectedDay=c.getDate();
b.drawMonth=b.selectedMonth=c.getMonth();
b.drawYear=b.selectedYear=c.getFullYear()
}this._notifyChange(b);
this._adjustDate(a)
},_selectMonthYear:function(a,b,c){a=d(a);
var e=this._getInst(a[0]);
e["selected"+(c=="M"?"Month":"Year")]=e["draw"+(c=="M"?"Month":"Year")]=parseInt(b.options[b.selectedIndex].value,10);
this._notifyChange(e);
this._adjustDate(a)
},_selectDay:function(a,b,c,e){var f=d(a);
if(!(d(e).hasClass(this._unselectableClass)||this._isDisabledDatepicker(f[0]))){f=this._getInst(f[0]);
f.selectedDay=f.currentDay=d("a",e).html();
f.selectedMonth=f.currentMonth=b;
f.selectedYear=f.currentYear=c;
this._selectDate(a,this._formatDate(f,f.currentDay,f.currentMonth,f.currentYear))
}},_clearDate:function(a){a=d(a);
this._getInst(a[0]);
this._selectDate(a,"")
},_selectDate:function(a,b){a=this._getInst(d(a)[0]);
b=b!=null?b:this._formatDate(a);
a.input&&a.input.val(b);
this._updateAlternate(a);
var c=this._get(a,"onSelect");
if(c){c.apply(a.input?a.input[0]:null,[b,a])
}else{a.input&&a.input.trigger("change")
}if(a.inline){this._updateDatepicker(a)
}else{this._hideDatepicker();
this._lastInput=a.input[0];
typeof a.input[0]!="object"&&a.input.focus();
this._lastInput=null
}},_updateAlternate:function(a){var b=this._get(a,"altField");
if(b){var c=this._get(a,"altFormat")||this._get(a,"dateFormat"),e=this._getDate(a),f=this.formatDate(c,e,this._getFormatConfig(a));
d(b).each(function(){d(this).val(f)
})
}},noWeekends:function(a){a=a.getDay();
return[a>0&&a<6,""]
},iso8601Week:function(a){a=new Date(a.getTime());
a.setDate(a.getDate()+4-(a.getDay()||7));
var b=a.getTime();
a.setMonth(0);
a.setDate(1);
return Math.floor(Math.round((b-a)/86400000)/7)+1
},parseDate:function(a,b,c){if(a==null||b==null){throw"Invalid arguments"
}b=typeof b=="object"?b.toString():b+"";
if(b==""){return null
}var e=(c?c.shortYearCutoff:null)||this._defaults.shortYearCutoff;
e=typeof e!="string"?e:(new Date).getFullYear()%100+parseInt(e,10);
for(var f=(c?c.dayNamesShort:null)||this._defaults.dayNamesShort,h=(c?c.dayNames:null)||this._defaults.dayNames,i=(c?c.monthNamesShort:null)||this._defaults.monthNamesShort,g=(c?c.monthNames:null)||this._defaults.monthNames,j=c=-1,l=-1,u=-1,k=false,o=function(p){(p=A+1<a.length&&a.charAt(A+1)==p)&&A++;
return p
},m=function(p){var D=o(p);
p=new RegExp("^\\d{1,"+(p=="@"?14:p=="!"?20:p=="y"&&D?4:p=="o"?3:2)+"}");
p=b.substring(q).match(p);
if(!p){throw"Missing number at position "+q
}q+=p[0].length;
return parseInt(p[0],10)
},n=function(p,D,K){p=d.map(o(p)?K:D,function(w,x){return[[x,w]]
}).sort(function(w,x){return -(w[1].length-x[1].length)
});
var E=-1;
d.each(p,function(w,x){w=x[1];
if(b.substr(q,w.length).toLowerCase()==w.toLowerCase()){E=x[0];
q+=w.length;
return false
}});
if(E!=-1){return E+1
}else{throw"Unknown name at position "+q
}},s=function(){if(b.charAt(q)!=a.charAt(A)){throw"Unexpected literal at position "+q
}q++
},q=0,A=0;
A<a.length;
A++){if(k){if(a.charAt(A)=="'"&&!o("'")){k=false
}else{s()
}}else{switch(a.charAt(A)){case"d":l=m("d");
break;
case"D":n("D",f,h);
break;
case"o":u=m("o");
break;
case"m":j=m("m");
break;
case"M":j=n("M",i,g);
break;
case"y":c=m("y");
break;
case"@":var v=new Date(m("@"));
c=v.getFullYear();
j=v.getMonth()+1;
l=v.getDate();
break;
case"!":v=new Date((m("!")-this._ticksTo1970)/10000);
c=v.getFullYear();
j=v.getMonth()+1;
l=v.getDate();
break;
case"'":if(o("'")){s()
}else{k=true
}break;
default:s()
}}}if(q<b.length){throw"Extra/unparsed characters found in date: "+b.substring(q)
}if(c==-1){c=(new Date).getFullYear()
}else{if(c<100){c+=(new Date).getFullYear()-(new Date).getFullYear()%100+(c<=e?0:-100)
}}if(u>-1){j=1;
l=u;
do{e=this._getDaysInMonth(c,j-1);
if(l<=e){break
}j++;
l-=e
}while(1)
}v=this._daylightSavingAdjust(new Date(c,j-1,l));
if(v.getFullYear()!=c||v.getMonth()+1!=j||v.getDate()!=l){throw"Invalid date"
}return v
},ATOM:"yy-mm-dd",COOKIE:"D, dd M yy",ISO_8601:"yy-mm-dd",RFC_822:"D, d M y",RFC_850:"DD, dd-M-y",RFC_1036:"D, d M y",RFC_1123:"D, d M yy",RFC_2822:"D, d M yy",RSS:"D, d M y",TICKS:"!",TIMESTAMP:"@",W3C:"yy-mm-dd",_ticksTo1970:(718685+Math.floor(492.5)-Math.floor(19.7)+Math.floor(4.925))*24*60*60*10000000,formatDate:function(a,b,c){if(!b){return""
}var e=(c?c.dayNamesShort:null)||this._defaults.dayNamesShort,f=(c?c.dayNames:null)||this._defaults.dayNames,h=(c?c.monthNamesShort:null)||this._defaults.monthNamesShort;
c=(c?c.monthNames:null)||this._defaults.monthNames;
var i=function(o){(o=k+1<a.length&&a.charAt(k+1)==o)&&k++;
return o
},g=function(o,m,n){m=""+m;
if(i(o)){for(;
m.length<n;
){m="0"+m
}}return m
},j=function(o,m,n,s){return i(o)?s[m]:n[m]
},l="",u=false;
if(b){for(var k=0;
k<a.length;
k++){if(u){if(a.charAt(k)=="'"&&!i("'")){u=false
}else{l+=a.charAt(k)
}}else{switch(a.charAt(k)){case"d":l+=g("d",b.getDate(),2);
break;
case"D":l+=j("D",b.getDay(),e,f);
break;
case"o":l+=g("o",Math.round(((new Date(b.getFullYear(),b.getMonth(),b.getDate())).getTime()-(new Date(b.getFullYear(),0,0)).getTime())/86400000),3);
break;
case"m":l+=g("m",b.getMonth()+1,2);
break;
case"M":l+=j("M",b.getMonth(),h,c);
break;
case"y":l+=i("y")?b.getFullYear():(b.getYear()%100<10?"0":"")+b.getYear()%100;
break;
case"@":l+=b.getTime();
break;
case"!":l+=b.getTime()*10000+this._ticksTo1970;
break;
case"'":if(i("'")){l+="'"
}else{u=true
}break;
default:l+=a.charAt(k)
}}}}return l
},_possibleChars:function(a){for(var b="",c=false,e=function(h){(h=f+1<a.length&&a.charAt(f+1)==h)&&f++;
return h
},f=0;
f<a.length;
f++){if(c){if(a.charAt(f)=="'"&&!e("'")){c=false
}else{b+=a.charAt(f)
}}else{switch(a.charAt(f)){case"d":case"m":case"y":case"@":b+="0123456789";
break;
case"D":case"M":return null;
case"'":if(e("'")){b+="'"
}else{c=true
}break;
default:b+=a.charAt(f)
}}}return b
},_get:function(a,b){return a.settings[b]!==C?a.settings[b]:this._defaults[b]
},_setDateFromField:function(a,b){if(a.input.val()!=a.lastVal){var c=this._get(a,"dateFormat"),e=a.lastVal=a.input?a.input.val():null,f,h;
f=h=this._getDefaultDate(a);
var i=this._getFormatConfig(a);
try{f=this.parseDate(c,e,i)||h
}catch(g){this.log(g);
e=b?"":e
}a.selectedDay=f.getDate();
a.drawMonth=a.selectedMonth=f.getMonth();
a.drawYear=a.selectedYear=f.getFullYear();
a.currentDay=e?f.getDate():0;
a.currentMonth=e?f.getMonth():0;
a.currentYear=e?f.getFullYear():0;
this._adjustInstDate(a)
}},_getDefaultDate:function(a){return this._restrictMinMax(a,this._determineDate(a,this._get(a,"defaultDate"),new Date))
},_determineDate:function(a,b,c){var e=function(h){var i=new Date;
i.setDate(i.getDate()+h);
return i
},f=function(h){try{return d.datepicker.parseDate(d.datepicker._get(a,"dateFormat"),h,d.datepicker._getFormatConfig(a))
}catch(i){}var g=(h.toLowerCase().match(/^c/)?d.datepicker._getDate(a):null)||new Date,j=g.getFullYear(),l=g.getMonth();
g=g.getDate();
for(var u=/([+-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g,k=u.exec(h);
k;
){switch(k[2]||"d"){case"d":case"D":g+=parseInt(k[1],10);
break;
case"w":case"W":g+=parseInt(k[1],10)*7;
break;
case"m":case"M":l+=parseInt(k[1],10);
g=Math.min(g,d.datepicker._getDaysInMonth(j,l));
break;
case"y":case"Y":j+=parseInt(k[1],10);
g=Math.min(g,d.datepicker._getDaysInMonth(j,l));
break
}k=u.exec(h)
}return new Date(j,l,g)
};
if(b=(b=b==null||b===""?c:typeof b=="string"?f(b):typeof b=="number"?isNaN(b)?c:e(b):new Date(b.getTime()))&&b.toString()=="Invalid Date"?c:b){b.setHours(0);
b.setMinutes(0);
b.setSeconds(0);
b.setMilliseconds(0)
}return this._daylightSavingAdjust(b)
},_daylightSavingAdjust:function(a){if(!a){return null
}a.setHours(a.getHours()>12?a.getHours()+2:0);
return a
},_setDate:function(a,b,c){var e=!b,f=a.selectedMonth,h=a.selectedYear;
b=this._restrictMinMax(a,this._determineDate(a,b,new Date));
a.selectedDay=a.currentDay=b.getDate();
a.drawMonth=a.selectedMonth=a.currentMonth=b.getMonth();
a.drawYear=a.selectedYear=a.currentYear=b.getFullYear();
if((f!=a.selectedMonth||h!=a.selectedYear)&&!c){this._notifyChange(a)
}this._adjustInstDate(a);
if(a.input){a.input.val(e?"":this._formatDate(a))
}},_getDate:function(a){return !a.currentYear||a.input&&a.input.val()==""?null:this._daylightSavingAdjust(new Date(a.currentYear,a.currentMonth,a.currentDay))
},_generateHTML:function(a){var b=new Date;
b=this._daylightSavingAdjust(new Date(b.getFullYear(),b.getMonth(),b.getDate()));
var c=this._get(a,"isRTL"),e=this._get(a,"showButtonPanel"),f=this._get(a,"hideIfNoPrevNext"),h=this._get(a,"navigationAsDateFormat"),i=this._getNumberOfMonths(a),g=this._get(a,"showCurrentAtPos"),j=this._get(a,"stepMonths"),l=i[0]!=1||i[1]!=1,u=this._daylightSavingAdjust(!a.currentDay?new Date(9999,9,9):new Date(a.currentYear,a.currentMonth,a.currentDay)),k=this._getMinMaxDate(a,"min"),o=this._getMinMaxDate(a,"max");
g=a.drawMonth-g;
var m=a.drawYear;
if(g<0){g+=12;
m--
}if(o){var n=this._daylightSavingAdjust(new Date(o.getFullYear(),o.getMonth()-i[0]*i[1]+1,o.getDate()));
for(n=k&&n<k?k:n;
this._daylightSavingAdjust(new Date(m,g,1))>n;
){g--;
if(g<0){g=11;
m--
}}}a.drawMonth=g;
a.drawYear=m;
n=this._get(a,"prevText");
n=!h?n:this.formatDate(n,this._daylightSavingAdjust(new Date(m,g-j,1)),this._getFormatConfig(a));
n=this._canAdjustMonth(a,-1,m,g)?'<a class="ui-datepicker-prev ui-corner-all" onclick="DP_jQuery_'+B+".datepicker._adjustDate('#"+a.id+"', -"+j+", 'M');\" title=\""+n+'"><span class="ui-icon ui-icon-circle-triangle-'+(c?"e":"w")+'">'+n+"</span></a>":f?"":'<a class="ui-datepicker-prev ui-corner-all ui-state-disabled" title="'+n+'"><span class="ui-icon ui-icon-circle-triangle-'+(c?"e":"w")+'">'+n+"</span></a>";
var s=this._get(a,"nextText");
s=!h?s:this.formatDate(s,this._daylightSavingAdjust(new Date(m,g+j,1)),this._getFormatConfig(a));
f=this._canAdjustMonth(a,+1,m,g)?'<a class="ui-datepicker-next ui-corner-all" onclick="DP_jQuery_'+B+".datepicker._adjustDate('#"+a.id+"', +"+j+", 'M');\" title=\""+s+'"><span class="ui-icon ui-icon-circle-triangle-'+(c?"w":"e")+'">'+s+"</span></a>":f?"":'<a class="ui-datepicker-next ui-corner-all ui-state-disabled" title="'+s+'"><span class="ui-icon ui-icon-circle-triangle-'+(c?"w":"e")+'">'+s+"</span></a>";
j=this._get(a,"currentText");
s=this._get(a,"gotoCurrent")&&a.currentDay?u:b;
j=!h?j:this.formatDate(j,s,this._getFormatConfig(a));
h=!a.inline?'<button type="button" class="ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all" onclick="DP_jQuery_'+B+'.datepicker._hideDatepicker();">'+this._get(a,"closeText")+"</button>":"";
e=e?'<div class="ui-datepicker-buttonpane ui-widget-content">'+(c?h:"")+(this._isInRange(a,s)?'<button type="button" class="ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all" onclick="DP_jQuery_'+B+".datepicker._gotoToday('#"+a.id+"');\">"+j+"</button>":"")+(c?"":h)+"</div>":"";
h=parseInt(this._get(a,"firstDay"),10);
h=isNaN(h)?0:h;
j=this._get(a,"showWeek");
s=this._get(a,"dayNames");
this._get(a,"dayNamesShort");
var q=this._get(a,"dayNamesMin"),A=this._get(a,"monthNames"),v=this._get(a,"monthNamesShort"),p=this._get(a,"beforeShowDay"),D=this._get(a,"showOtherMonths"),K=this._get(a,"selectOtherMonths");
this._get(a,"calculateWeek");
for(var E=this._getDefaultDate(a),w="",x=0;
x<i[0];
x++){var O="";
this.maxRows=4;
for(var G=0;
G<i[1];
G++){var P=this._daylightSavingAdjust(new Date(m,g,a.selectedDay)),t=" ui-corner-all",y="";
if(l){y+='<div class="ui-datepicker-group';
if(i[1]>1){switch(G){case 0:y+=" ui-datepicker-group-first";
t=" ui-corner-"+(c?"right":"left");
break;
case i[1]-1:y+=" ui-datepicker-group-last";
t=" ui-corner-"+(c?"left":"right");
break;
default:y+=" ui-datepicker-group-middle";
t="";
break
}}y+='">'
}y+='<div class="ui-datepicker-header ui-widget-header ui-helper-clearfix'+t+'">'+(/all|left/.test(t)&&x==0?c?f:n:"")+(/all|right/.test(t)&&x==0?c?n:f:"")+this._generateMonthYearHeader(a,g,m,k,o,x>0||G>0,A,v)+'</div><table class="ui-datepicker-calendar"><thead><tr>';
var z=j?'<th class="ui-datepicker-week-col">'+this._get(a,"weekHeader")+"</th>":"";
for(t=0;
t<7;
t++){var r=(t+h)%7;
z+="<th"+((t+h+6)%7>=5?' class="ui-datepicker-week-end"':"")+'><span title="'+s[r]+'">'+q[r]+"</span></th>"
}y+=z+"</tr></thead><tbody>";
z=this._getDaysInMonth(m,g);
if(m==a.selectedYear&&g==a.selectedMonth){a.selectedDay=Math.min(a.selectedDay,z)
}t=(this._getFirstDayOfMonth(m,g)-h+7)%7;
z=Math.ceil((t+z)/7);
this.maxRows=z=l?this.maxRows>z?this.maxRows:z:z;
r=this._daylightSavingAdjust(new Date(m,g,1-t));
for(var Q=0;
Q<z;
Q++){y+="<tr>";
var R=!j?"":'<td class="ui-datepicker-week-col">'+this._get(a,"calculateWeek")(r)+"</td>";
for(t=0;
t<7;
t++){var I=p?p.apply(a.input?a.input[0]:null,[r]):[true,""],F=r.getMonth()!=g,L=F&&!K||!I[0]||k&&r<k||o&&r>o;
R+='<td class="'+((t+h+6)%7>=5?" ui-datepicker-week-end":"")+(F?" ui-datepicker-other-month":"")+(r.getTime()==P.getTime()&&g==a.selectedMonth&&a._keyEvent||E.getTime()==r.getTime()&&E.getTime()==P.getTime()?" "+this._dayOverClass:"")+(L?" "+this._unselectableClass+" ui-state-disabled":"")+(F&&!D?"":" "+I[1]+(r.getTime()==u.getTime()?" "+this._currentClass:"")+(r.getTime()==b.getTime()?" ui-datepicker-today":""))+'"'+((!F||D)&&I[2]?' title="'+I[2]+'"':"")+(L?"":' onclick="DP_jQuery_'+B+".datepicker._selectDay('#"+a.id+"',"+r.getMonth()+","+r.getFullYear()+', this);return false;"')+">"+(F&&!D?"&#xa0;":L?'<span class="ui-state-default">'+r.getDate()+"</span>":'<a class="ui-state-default'+(r.getTime()==b.getTime()?" ui-state-highlight":"")+(r.getTime()==u.getTime()?" ui-state-active":"")+(F?" ui-priority-secondary":"")+'" href="#">'+r.getDate()+"</a>")+"</td>";
r.setDate(r.getDate()+1);
r=this._daylightSavingAdjust(r)
}y+=R+"</tr>"
}g++;
if(g>11){g=0;
m++
}y+="</tbody></table>"+(l?"</div>"+(i[0]>0&&G==i[1]-1?'<div class="ui-datepicker-row-break"></div>':""):"");
O+=y
}w+=O
}w+=e+(d.browser.msie&&parseInt(d.browser.version,10)<7&&!a.inline?'<iframe src="javascript:false;" class="ui-datepicker-cover" frameborder="0"></iframe>':"");
a._keyEvent=false;
return w
},_generateMonthYearHeader:function(a,b,c,e,f,h,i,g){var j=this._get(a,"changeMonth"),l=this._get(a,"changeYear"),u=this._get(a,"showMonthAfterYear"),k='<div class="ui-datepicker-title">',o="";
if(h||!j){o+='<span class="ui-datepicker-month">'+i[b]+"</span>"
}else{i=e&&e.getFullYear()==c;
var m=f&&f.getFullYear()==c;
o+='<select class="ui-datepicker-month" onchange="DP_jQuery_'+B+".datepicker._selectMonthYear('#"+a.id+"', this, 'M');\" >";
for(var n=0;
n<12;
n++){if((!i||n>=e.getMonth())&&(!m||n<=f.getMonth())){o+='<option value="'+n+'"'+(n==b?' selected="selected"':"")+">"+g[n]+"</option>"
}}o+="</select>"
}u||(k+=o+(h||!(j&&l)?"&#xa0;":""));
if(!a.yearshtml){a.yearshtml="";
if(h||!l){k+='<span class="ui-datepicker-year">'+c+"</span>"
}else{g=this._get(a,"yearRange").split(":");
var s=(new Date).getFullYear();
i=function(q){q=q.match(/c[+-].*/)?c+parseInt(q.substring(1),10):q.match(/[+-].*/)?s+parseInt(q,10):parseInt(q,10);
return isNaN(q)?s:q
};
b=i(g[0]);
g=Math.max(b,i(g[1]||""));
b=e?Math.max(b,e.getFullYear()):b;
g=f?Math.min(g,f.getFullYear()):g;
for(a.yearshtml+='<select class="ui-datepicker-year" onchange="DP_jQuery_'+B+".datepicker._selectMonthYear('#"+a.id+"', this, 'Y');\" >";
b<=g;
b++){a.yearshtml+='<option value="'+b+'"'+(b==c?' selected="selected"':"")+">"+b+"</option>"
}a.yearshtml+="</select>";
k+=a.yearshtml;
a.yearshtml=null
}}k+=this._get(a,"yearSuffix");
if(u){k+=(h||!(j&&l)?"&#xa0;":"")+o
}k+="</div>";
return k
},_adjustInstDate:function(a,b,c){var e=a.drawYear+(c=="Y"?b:0),f=a.drawMonth+(c=="M"?b:0);
b=Math.min(a.selectedDay,this._getDaysInMonth(e,f))+(c=="D"?b:0);
e=this._restrictMinMax(a,this._daylightSavingAdjust(new Date(e,f,b)));
a.selectedDay=e.getDate();
a.drawMonth=a.selectedMonth=e.getMonth();
a.drawYear=a.selectedYear=e.getFullYear();
if(c=="M"||c=="Y"){this._notifyChange(a)
}},_restrictMinMax:function(a,b){var c=this._getMinMaxDate(a,"min");
a=this._getMinMaxDate(a,"max");
b=c&&b<c?c:b;
return b=a&&b>a?a:b
},_notifyChange:function(a){var b=this._get(a,"onChangeMonthYear");
if(b){b.apply(a.input?a.input[0]:null,[a.selectedYear,a.selectedMonth+1,a])
}},_getNumberOfMonths:function(a){a=this._get(a,"numberOfMonths");
return a==null?[1,1]:typeof a=="number"?[1,a]:a
},_getMinMaxDate:function(a,b){return this._determineDate(a,this._get(a,b+"Date"),null)
},_getDaysInMonth:function(a,b){return 32-this._daylightSavingAdjust(new Date(a,b,32)).getDate()
},_getFirstDayOfMonth:function(a,b){return(new Date(a,b,1)).getDay()
},_canAdjustMonth:function(a,b,c,e){var f=this._getNumberOfMonths(a);
c=this._daylightSavingAdjust(new Date(c,e+(b<0?b:f[0]*f[1]),1));
b<0&&c.setDate(this._getDaysInMonth(c.getFullYear(),c.getMonth()));
return this._isInRange(a,c)
},_isInRange:function(a,b){var c=this._getMinMaxDate(a,"min");
a=this._getMinMaxDate(a,"max");
return(!c||b.getTime()>=c.getTime())&&(!a||b.getTime()<=a.getTime())
},_getFormatConfig:function(a){var b=this._get(a,"shortYearCutoff");
b=typeof b!="string"?b:(new Date).getFullYear()%100+parseInt(b,10);
return{shortYearCutoff:b,dayNamesShort:this._get(a,"dayNamesShort"),dayNames:this._get(a,"dayNames"),monthNamesShort:this._get(a,"monthNamesShort"),monthNames:this._get(a,"monthNames")}
},_formatDate:function(a,b,c,e){if(!b){a.currentDay=a.selectedDay;
a.currentMonth=a.selectedMonth;
a.currentYear=a.selectedYear
}b=b?typeof b=="object"?b:this._daylightSavingAdjust(new Date(e,c,b)):this._daylightSavingAdjust(new Date(a.currentYear,a.currentMonth,a.currentDay));
return this.formatDate(this._get(a,"dateFormat"),b,this._getFormatConfig(a))
}});
d.fn.datepicker=function(a){if(!this.length){return this
}if(!d.datepicker.initialized){d(document).mousedown(d.datepicker._checkExternalClick).find("body").append(d.datepicker.dpDiv);
d.datepicker.initialized=true
}var b=Array.prototype.slice.call(arguments,1);
if(typeof a=="string"&&(a=="isDisabled"||a=="getDate"||a=="widget")){return d.datepicker["_"+a+"Datepicker"].apply(d.datepicker,[this[0]].concat(b))
}if(a=="option"&&arguments.length==2&&typeof arguments[1]=="string"){return d.datepicker["_"+a+"Datepicker"].apply(d.datepicker,[this[0]].concat(b))
}return this.each(function(){typeof a=="string"?d.datepicker["_"+a+"Datepicker"].apply(d.datepicker,[this].concat(b)):d.datepicker._attachDatepicker(this,a)
})
};
d.datepicker=new M;
d.datepicker.initialized=false;
d.datepicker.uuid=(new Date).getTime();
d.datepicker.version="1.8.16";
window["DP_jQuery_"+B]=d
})(jQuery);
jQuery.effects||function(f,j){function m(c){var a;
if(c&&c.constructor==Array&&c.length==3){return c
}if(a=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(c)){return[parseInt(a[1],10),parseInt(a[2],10),parseInt(a[3],10)]
}if(a=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(c)){return[parseFloat(a[1])*2.55,parseFloat(a[2])*2.55,parseFloat(a[3])*2.55]
}if(a=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(c)){return[parseInt(a[1],16),parseInt(a[2],16),parseInt(a[3],16)]
}if(a=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(c)){return[parseInt(a[1]+a[1],16),parseInt(a[2]+a[2],16),parseInt(a[3]+a[3],16)]
}if(/rgba\(0, 0, 0, 0\)/.exec(c)){return n.transparent
}return n[f.trim(c).toLowerCase()]
}function s(c,a){var b;
do{b=f.curCSS(c,a);
if(b!=""&&b!="transparent"||f.nodeName(c,"body")){break
}a="backgroundColor"
}while(c=c.parentNode);
return m(b)
}function o(){var c=document.defaultView?document.defaultView.getComputedStyle(this,null):this.currentStyle,a={},b,d;
if(c&&c.length&&c[0]&&c[c[0]]){for(var e=c.length;
e--;
){b=c[e];
if(typeof c[b]=="string"){d=b.replace(/\-(\w)/g,function(g,h){return h.toUpperCase()
});
a[d]=c[b]
}}}else{for(b in c){if(typeof c[b]==="string"){a[b]=c[b]
}}}return a
}function p(c){var a,b;
for(a in c){b=c[a];
if(b==null||f.isFunction(b)||a in t||/scrollbar/.test(a)||!/color/i.test(a)&&isNaN(parseFloat(b))){delete c[a]
}}return c
}function u(c,a){var b={_:0},d;
for(d in a){if(c[d]!=a[d]){b[d]=a[d]
}}return b
}function k(c,a,b,d){if(typeof c=="object"){d=a;
b=null;
a=c;
c=a.effect
}if(f.isFunction(a)){d=a;
b=null;
a={}
}if(typeof a=="number"||f.fx.speeds[a]){d=b;
b=a;
a={}
}if(f.isFunction(b)){d=b;
b=null
}a=a||{};
b=b||a.duration;
b=f.fx.off?0:typeof b=="number"?b:b in f.fx.speeds?f.fx.speeds[b]:f.fx.speeds._default;
d=d||a.complete;
return[c,a,b,d]
}function l(c){if(!c||typeof c==="number"||f.fx.speeds[c]){return true
}if(typeof c==="string"&&!f.effects[c]){return true
}return false
}f.effects={};
f.each(["backgroundColor","borderBottomColor","borderLeftColor","borderRightColor","borderTopColor","borderColor","color","outlineColor"],function(c,a){f.fx.step[a]=function(b){if(!b.colorInit){b.start=s(b.elem,a);
b.end=m(b.end);
b.colorInit=true
}b.elem.style[a]="rgb("+Math.max(Math.min(parseInt(b.pos*(b.end[0]-b.start[0])+b.start[0],10),255),0)+","+Math.max(Math.min(parseInt(b.pos*(b.end[1]-b.start[1])+b.start[1],10),255),0)+","+Math.max(Math.min(parseInt(b.pos*(b.end[2]-b.start[2])+b.start[2],10),255),0)+")"
}
});
var n={aqua:[0,255,255],azure:[240,255,255],beige:[245,245,220],black:[0,0,0],blue:[0,0,255],brown:[165,42,42],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgrey:[169,169,169],darkgreen:[0,100,0],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkviolet:[148,0,211],fuchsia:[255,0,255],gold:[255,215,0],green:[0,128,0],indigo:[75,0,130],khaki:[240,230,140],lightblue:[173,216,230],lightcyan:[224,255,255],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightyellow:[255,255,224],lime:[0,255,0],magenta:[255,0,255],maroon:[128,0,0],navy:[0,0,128],olive:[128,128,0],orange:[255,165,0],pink:[255,192,203],purple:[128,0,128],violet:[128,0,128],red:[255,0,0],silver:[192,192,192],white:[255,255,255],yellow:[255,255,0],transparent:[255,255,255]},q=["add","remove","toggle"],t={border:1,borderBottom:1,borderColor:1,borderLeft:1,borderRight:1,borderTop:1,borderWidth:1,margin:1,padding:1};
f.effects.animateClass=function(c,a,b,d){if(f.isFunction(b)){d=b;
b=null
}return this.queue(function(){var e=f(this),g=e.attr("style")||" ",h=p(o.call(this)),r,v=e.attr("class");
f.each(q,function(w,i){c[i]&&e[i+"Class"](c[i])
});
r=p(o.call(this));
e.attr("class",v);
e.animate(u(h,r),{queue:false,duration:a,easing:b,complete:function(){f.each(q,function(w,i){c[i]&&e[i+"Class"](c[i])
});
if(typeof e.attr("style")=="object"){e.attr("style").cssText="";
e.attr("style").cssText=g
}else{e.attr("style",g)
}d&&d.apply(this,arguments);
f.dequeue(this)
}})
})
};
f.fn.extend({_addClass:f.fn.addClass,addClass:function(c,a,b,d){return a?f.effects.animateClass.apply(this,[{add:c},a,b,d]):this._addClass(c)
},_removeClass:f.fn.removeClass,removeClass:function(c,a,b,d){return a?f.effects.animateClass.apply(this,[{remove:c},a,b,d]):this._removeClass(c)
},_toggleClass:f.fn.toggleClass,toggleClass:function(c,a,b,d,e){return typeof a=="boolean"||a===j?b?f.effects.animateClass.apply(this,[a?{add:c}:{remove:c},b,d,e]):this._toggleClass(c,a):f.effects.animateClass.apply(this,[{toggle:c},a,b,d])
},switchClass:function(c,a,b,d,e){return f.effects.animateClass.apply(this,[{add:a,remove:c},b,d,e])
}});
f.extend(f.effects,{version:"1.8.16",save:function(c,a){for(var b=0;
b<a.length;
b++){a[b]!==null&&c.data("ec.storage."+a[b],c[0].style[a[b]])
}},restore:function(c,a){for(var b=0;
b<a.length;
b++){a[b]!==null&&c.css(a[b],c.data("ec.storage."+a[b]))
}},setMode:function(c,a){if(a=="toggle"){a=c.is(":hidden")?"show":"hide"
}return a
},getBaseline:function(c,a){var b;
switch(c[0]){case"top":b=0;
break;
case"middle":b=0.5;
break;
case"bottom":b=1;
break;
default:b=c[0]/a.height
}switch(c[1]){case"left":c=0;
break;
case"center":c=0.5;
break;
case"right":c=1;
break;
default:c=c[1]/a.width
}return{x:c,y:b}
},createWrapper:function(c){if(c.parent().is(".ui-effects-wrapper")){return c.parent()
}var a={width:c.outerWidth(true),height:c.outerHeight(true),"float":c.css("float")},b=f("<div></div>").addClass("ui-effects-wrapper").css({fontSize:"100%",background:"transparent",border:"none",margin:0,padding:0}),d=document.activeElement;
c.wrap(b);
if(c[0]===d||f.contains(c[0],d)){f(d).focus()
}b=c.parent();
if(c.css("position")=="static"){b.css({position:"relative"});
c.css({position:"relative"})
}else{f.extend(a,{position:c.css("position"),zIndex:c.css("z-index")});
f.each(["top","left","bottom","right"],function(e,g){a[g]=c.css(g);
if(isNaN(parseInt(a[g],10))){a[g]="auto"
}});
c.css({position:"relative",top:0,left:0,right:"auto",bottom:"auto"})
}return b.css(a).show()
},removeWrapper:function(c){var a,b=document.activeElement;
if(c.parent().is(".ui-effects-wrapper")){a=c.parent().replaceWith(c);
if(c[0]===b||f.contains(c[0],b)){f(b).focus()
}return a
}return c
},setTransition:function(c,a,b,d){d=d||{};
f.each(a,function(e,g){unit=c.cssUnit(g);
if(unit[0]>0){d[g]=unit[0]*b+unit[1]
}});
return d
}});
f.fn.extend({effect:function(c){var a=k.apply(this,arguments),b={options:a[1],duration:a[2],callback:a[3]};
a=b.options.mode;
var d=f.effects[c];
if(f.fx.off||!d){return a?this[a](b.duration,b.callback):this.each(function(){b.callback&&b.callback.call(this)
})
}return d.call(this,b)
},_show:f.fn.show,show:function(c){if(l(c)){return this._show.apply(this,arguments)
}else{var a=k.apply(this,arguments);
a[1].mode="show";
return this.effect.apply(this,a)
}},_hide:f.fn.hide,hide:function(c){if(l(c)){return this._hide.apply(this,arguments)
}else{var a=k.apply(this,arguments);
a[1].mode="hide";
return this.effect.apply(this,a)
}},__toggle:f.fn.toggle,toggle:function(c){if(l(c)||typeof c==="boolean"||f.isFunction(c)){return this.__toggle.apply(this,arguments)
}else{var a=k.apply(this,arguments);
a[1].mode="toggle";
return this.effect.apply(this,a)
}},cssUnit:function(c){var a=this.css(c),b=[];
f.each(["em","px","%","pt"],function(d,e){if(a.indexOf(e)>0){b=[parseFloat(a),e]
}});
return b
}});
f.easing.jswing=f.easing.swing;
f.extend(f.easing,{def:"easeOutQuad",swing:function(c,a,b,d,e){return f.easing[f.easing.def](c,a,b,d,e)
},easeInQuad:function(c,a,b,d,e){return d*(a/=e)*a+b
},easeOutQuad:function(c,a,b,d,e){return -d*(a/=e)*(a-2)+b
},easeInOutQuad:function(c,a,b,d,e){if((a/=e/2)<1){return d/2*a*a+b
}return -d/2*(--a*(a-2)-1)+b
},easeInCubic:function(c,a,b,d,e){return d*(a/=e)*a*a+b
},easeOutCubic:function(c,a,b,d,e){return d*((a=a/e-1)*a*a+1)+b
},easeInOutCubic:function(c,a,b,d,e){if((a/=e/2)<1){return d/2*a*a*a+b
}return d/2*((a-=2)*a*a+2)+b
},easeInQuart:function(c,a,b,d,e){return d*(a/=e)*a*a*a+b
},easeOutQuart:function(c,a,b,d,e){return -d*((a=a/e-1)*a*a*a-1)+b
},easeInOutQuart:function(c,a,b,d,e){if((a/=e/2)<1){return d/2*a*a*a*a+b
}return -d/2*((a-=2)*a*a*a-2)+b
},easeInQuint:function(c,a,b,d,e){return d*(a/=e)*a*a*a*a+b
},easeOutQuint:function(c,a,b,d,e){return d*((a=a/e-1)*a*a*a*a+1)+b
},easeInOutQuint:function(c,a,b,d,e){if((a/=e/2)<1){return d/2*a*a*a*a*a+b
}return d/2*((a-=2)*a*a*a*a+2)+b
},easeInSine:function(c,a,b,d,e){return -d*Math.cos(a/e*(Math.PI/2))+d+b
},easeOutSine:function(c,a,b,d,e){return d*Math.sin(a/e*(Math.PI/2))+b
},easeInOutSine:function(c,a,b,d,e){return -d/2*(Math.cos(Math.PI*a/e)-1)+b
},easeInExpo:function(c,a,b,d,e){return a==0?b:d*Math.pow(2,10*(a/e-1))+b
},easeOutExpo:function(c,a,b,d,e){return a==e?b+d:d*(-Math.pow(2,-10*a/e)+1)+b
},easeInOutExpo:function(c,a,b,d,e){if(a==0){return b
}if(a==e){return b+d
}if((a/=e/2)<1){return d/2*Math.pow(2,10*(a-1))+b
}return d/2*(-Math.pow(2,-10*--a)+2)+b
},easeInCirc:function(c,a,b,d,e){return -d*(Math.sqrt(1-(a/=e)*a)-1)+b
},easeOutCirc:function(c,a,b,d,e){return d*Math.sqrt(1-(a=a/e-1)*a)+b
},easeInOutCirc:function(c,a,b,d,e){if((a/=e/2)<1){return -d/2*(Math.sqrt(1-a*a)-1)+b
}return d/2*(Math.sqrt(1-(a-=2)*a)+1)+b
},easeInElastic:function(c,a,b,d,e){c=1.70158;
var g=0,h=d;
if(a==0){return b
}if((a/=e)==1){return b+d
}g||(g=e*0.3);
if(h<Math.abs(d)){h=d;
c=g/4
}else{c=g/(2*Math.PI)*Math.asin(d/h)
}return -(h*Math.pow(2,10*(a-=1))*Math.sin((a*e-c)*2*Math.PI/g))+b
},easeOutElastic:function(c,a,b,d,e){c=1.70158;
var g=0,h=d;
if(a==0){return b
}if((a/=e)==1){return b+d
}g||(g=e*0.3);
if(h<Math.abs(d)){h=d;
c=g/4
}else{c=g/(2*Math.PI)*Math.asin(d/h)
}return h*Math.pow(2,-10*a)*Math.sin((a*e-c)*2*Math.PI/g)+d+b
},easeInOutElastic:function(c,a,b,d,e){c=1.70158;
var g=0,h=d;
if(a==0){return b
}if((a/=e/2)==2){return b+d
}g||(g=e*0.3*1.5);
if(h<Math.abs(d)){h=d;
c=g/4
}else{c=g/(2*Math.PI)*Math.asin(d/h)
}if(a<1){return -0.5*h*Math.pow(2,10*(a-=1))*Math.sin((a*e-c)*2*Math.PI/g)+b
}return h*Math.pow(2,-10*(a-=1))*Math.sin((a*e-c)*2*Math.PI/g)*0.5+d+b
},easeInBack:function(c,a,b,d,e,g){if(g==j){g=1.70158
}return d*(a/=e)*a*((g+1)*a-g)+b
},easeOutBack:function(c,a,b,d,e,g){if(g==j){g=1.70158
}return d*((a=a/e-1)*a*((g+1)*a+g)+1)+b
},easeInOutBack:function(c,a,b,d,e,g){if(g==j){g=1.70158
}if((a/=e/2)<1){return d/2*a*a*(((g*=1.525)+1)*a-g)+b
}return d/2*((a-=2)*a*(((g*=1.525)+1)*a+g)+2)+b
},easeInBounce:function(c,a,b,d,e){return d-f.easing.easeOutBounce(c,e-a,0,d,e)+b
},easeOutBounce:function(c,a,b,d,e){return(a/=e)<1/2.75?d*7.5625*a*a+b:a<2/2.75?d*(7.5625*(a-=1.5/2.75)*a+0.75)+b:a<2.5/2.75?d*(7.5625*(a-=2.25/2.75)*a+0.9375)+b:d*(7.5625*(a-=2.625/2.75)*a+0.984375)+b
},easeInOutBounce:function(c,a,b,d,e){if(a<e/2){return f.easing.easeInBounce(c,a*2,0,d,e)*0.5+b
}return f.easing.easeOutBounce(c,a*2-e,0,d,e)*0.5+d*0.5+b
}})
}(jQuery);
(function(c){c.effects.drop=function(d){return this.queue(function(){var a=c(this),h=["position","top","bottom","left","right","opacity"],e=c.effects.setMode(a,d.options.mode||"hide"),b=d.options.direction||"left";
c.effects.save(a,h);
a.show();
c.effects.createWrapper(a);
var f=b=="up"||b=="down"?"top":"left";
b=b=="up"||b=="left"?"pos":"neg";
var g=d.options.distance||(f=="top"?a.outerHeight({margin:true})/2:a.outerWidth({margin:true})/2);
if(e=="show"){a.css("opacity",0).css(f,b=="pos"?-g:g)
}var i={opacity:e=="show"?1:0};
i[f]=(e=="show"?b=="pos"?"+=":"-=":b=="pos"?"-=":"+=")+g;
a.animate(i,{queue:false,duration:d.duration,easing:d.options.easing,complete:function(){e=="hide"&&a.hide();
c.effects.restore(a,h);
c.effects.removeWrapper(a);
d.callback&&d.callback.apply(this,arguments);
a.dequeue()
}})
})
}
})(jQuery);
(function(b){b.effects.highlight=function(c){return this.queue(function(){var a=b(this),e=["backgroundImage","backgroundColor","opacity"],d=b.effects.setMode(a,c.options.mode||"show"),f={backgroundColor:a.css("backgroundColor")};
if(d=="hide"){f.opacity=0
}b.effects.save(a,e);
a.show().css({backgroundImage:"none",backgroundColor:c.options.color||"#ffff99"}).animate(f,{queue:false,duration:c.duration,easing:c.options.easing,complete:function(){d=="hide"&&a.hide();
b.effects.restore(a,e);
d=="show"&&!b.support.opacity&&this.style.removeAttribute("filter");
c.callback&&c.callback.apply(this,arguments);
a.dequeue()
}})
})
}
})(jQuery);
(function(c){c.effects.slide=function(d){return this.queue(function(){var a=c(this),h=["position","top","bottom","left","right"],f=c.effects.setMode(a,d.options.mode||"show"),b=d.options.direction||"left";
c.effects.save(a,h);
a.show();
c.effects.createWrapper(a).css({overflow:"hidden"});
var g=b=="up"||b=="down"?"top":"left";
b=b=="up"||b=="left"?"pos":"neg";
var e=d.options.distance||(g=="top"?a.outerHeight({margin:true}):a.outerWidth({margin:true}));
if(f=="show"){a.css(g,b=="pos"?isNaN(e)?"-"+e:-e:e)
}var i={};
i[g]=(f=="show"?b=="pos"?"+=":"-=":b=="pos"?"-=":"+=")+e;
a.animate(i,{queue:false,duration:d.duration,easing:d.options.easing,complete:function(){f=="hide"&&a.hide();
c.effects.restore(a,h);
c.effects.removeWrapper(a);
d.callback&&d.callback.apply(this,arguments);
a.dequeue()
}})
})
}
})(jQuery);
jQuery.cookie=function(name,value,options){if(typeof value!="undefined"){options=options||{};
if(value===null){value="";
options.expires=-1
}var expires="";
if(options.expires&&(typeof options.expires=="number"||options.expires.toUTCString)){var date;
if(typeof options.expires=="number"){date=new Date();
date.setTime(date.getTime()+(options.expires*24*60*60*1000))
}else{date=options.expires
}expires="; expires="+date.toUTCString()
}var path=options.path?"; path="+(options.path):"";
var domain=options.domain?"; domain="+(options.domain):"";
var secure=options.secure?"; secure":"";
document.cookie=[name,"=",encodeURIComponent(value),expires,path,domain,secure].join("")
}else{var cookieValue=null;
if(document.cookie&&document.cookie!=""){var cookies=document.cookie.split(";");
for(var i=0;
i<cookies.length;
i++){var cookie=jQuery.trim(cookies[i]);
if(cookie.substring(0,name.length+1)==(name+"=")){cookieValue=decodeURIComponent(cookie.substring(name.length+1));
break
}}}return cookieValue
}};
(function($){var opts,initialize,adjustToFit,addTab,removeTab,setTabContent,moveNonFixedTabsToScroller,addNav,positionNav,getLeftMostTabIndex,totalElemWidth,shiftTabOffset,shiftScroller;
$.fn.infiniteTabs=function(command,options,secondParam){if((typeof command==="object")||!command){opts=$.extend({},$.fn.infiniteTabs.defaults,command);
return this.each(initialize)
}if(typeof command==="string"){switch(command.toLowerCase()){case"adjust-to-fit":return this.each(adjustToFit);
case"append-tab":return this.each(function(index,elem){addTab.call(elem,options,"append")
});
case"prepend-tab":return this.each(function(index,elem){addTab.call(elem,options,"prepend")
});
case"remove-tab":return this.each(function(index,elem){removeTab.call(elem,options)
});
case"set-tab-content":return this.each(function(index,elem){setTabContent.call(elem,options,secondParam)
})
}}};
initialize=function(){var scroller=$('<li class="scroller"><div><ul></ul></div></li>'),scrollableTabs=$(this).find("li:not(.locked)"),that=this,scrollableTabOffset=0,windowWidth=$(window).width(),scrollerWidth,nav,lastPinnedTab,ensurePinnedTabCornersAreCorrect,positionNavFunction,setScrollerWidth;
moveNonFixedTabsToScroller(this,scrollableTabs,scroller);
setScrollerWidth=function(that){lastPinnedTab=$(that).find(">li:not(.navigation):not(.scroller):last");
if(lastPinnedTab.length===0){scrollerWidth=$(that).innerWidth()
}else{scrollerWidth=$(that).innerWidth()-lastPinnedTab.offset().left-lastPinnedTab.width()
}};
setScrollerWidth(this);
nav=addNav(this);
positionNav(this,nav,scroller,scrollerWidth);
$(nav).find("a.previous-tab").click(function(e){e.preventDefault();
e.stopPropagation();
scrollableTabOffset=shiftTabOffset(-1,scrollableTabOffset,scroller,nav,opts);
shiftScroller(scrollableTabOffset,scroller,that)
});
$(nav).find("a.next-tab").click(function(e){e.preventDefault();
e.stopPropagation();
scrollableTabOffset=shiftTabOffset(1,scrollableTabOffset,scroller,nav,opts);
shiftScroller(scrollableTabOffset,scroller,that)
});
scroller.find("div").css("width",(scrollerWidth-20)+"px");
ensurePinnedTabCornersAreCorrect=function(){if(scroller.find("li:not(.hidden)").length===0){$(that).find(">li:not(.navigation):not(.scroller):last").addClass("absolute-last")
}else{$(that).find(">li:not(.navigation):not(.scroller):last").removeClass("absolute-last")
}};
ensurePinnedTabCornersAreCorrect();
positionNavFunction=function(){positionNav(that,nav,scroller,scrollerWidth);
ensurePinnedTabCornersAreCorrect()
};
$(this).data("positionNavFunction",positionNavFunction);
$(this).data("resetScrollerWidth",function(){setScrollerWidth(that);
scroller.find("div").css("width",(scrollerWidth-20)+"px")
});
$(window).resize(function(e){var resizeWidthBy=$(window).width()-windowWidth;
if(resizeWidthBy){scrollerWidth+=resizeWidthBy;
windowWidth=$(window).width();
scroller.find("div").css("width",(scrollerWidth-20)+"px");
positionNavFunction()
}});
$(this).find("li.scroller li").click(function(e){var that=this;
setTimeout(function(){var scrollerList=scroller.find("ul"),tabRightEdge;
if(-scrollableTabOffset>$(that).position().left){scrollableTabOffset=-$(that).position().left+($(that).is(":first-child")?0:opts.initialTabSlideOffset);
scrollerList.css("left",scrollableTabOffset+"px")
}else{if($(nav).is(":visible")){tabRightEdge=$(that).offset().left+$(that).outerWidth();
if(tabRightEdge>$(nav).offset().left){scrollableTabOffset-=tabRightEdge-$(nav).offset().left+opts.initialTabSlideOffset;
scrollerList.css("left",scrollableTabOffset+"px")
}}}},1)
});
$(this).find("li.scroller").click(function(e){e.preventDefault();
e.stopImmediatePropagation()
})
};
getLeftMostTabIndex=function(scroller,scrollableTabOffset){var tabIndex=0,tabFound=false;
scroller.find("ul li").each(function(index,elem){if(!tabFound){if($(elem).position().left>=-scrollableTabOffset){tabFound=true
}else{tabIndex+=1
}}});
return tabIndex
};
totalElemWidth=function(elems){var width=0;
elems.each(function(index,elem){width+=$(elem).outerWidth()
});
return width
};
addNav=function(outerMostList){var backArrow=($.browser.msie&&$.browser.version<=8)?"&lt;":"&#x25C0;",forwardArrow=($.browser.msie&&$.browser.version<=8)?"&gt;":"&#x25B6;",nav=$('<li class="navigation"><div><a href="#next" class="next-tab">'+backArrow+'</a><a href="#previous" class="previous-tab">'+forwardArrow+"</a></div></li>"),navHeightDiff,navPadTop;
$(outerMostList).append(nav);
navHeightDiff=$(outerMostList).outerHeight()-nav.outerHeight();
navPadTop=Math.round(navHeightDiff/2);
$(nav).find("a").css("padding-top",navPadTop+"px").css("padding-bottom",(navHeightDiff-navPadTop)+"px");
return nav
};
positionNav=function(outerMostList,nav,scroller,scrollerWidth){var currentPos,navPosition;
if($(nav).data("scrollerWidth")){currentPos=parseInt(nav.css("left").replace(/px/,""),10);
currentPos+=scrollerWidth-parseInt($(nav).data("scrollerWidth"),10);
nav.css("left",currentPos+"px")
}else{navPosition=($(outerMostList).width()-$(nav).width()+10);
nav.css("left",navPosition+"px")
}$(nav).data("scrollerWidth",scrollerWidth);
if(totalElemWidth(scroller.find("li"))>scrollerWidth-20){nav.css("display","block")
}else{nav.css("display","none")
}};
moveNonFixedTabsToScroller=function(containerList,scrollableTabs,scroller){scrollableTabs.each(function(index,elem){scroller.find("ul").append(elem)
});
if($(containerList).find("li.locked").length%2===1){scroller.find("ul").prepend($('<li class="hidden"></li>'))
}$(containerList).append(scroller);
if($(containerList).find(">li:not(.scroller):not(.nav)").length===0){scroller.find("ul li:first").addClass("absolute-first")
}};
shiftTabOffset=function(direction,currentScrollableTabOffset,scroller,nav,opts){var currentTabIndex=getLeftMostTabIndex(scroller,currentScrollableTabOffset),scrollerList=scroller.find("ul"),scrollMax;
if(direction<0){if(currentScrollableTabOffset===0){currentScrollableTabOffset-=scrollerList.find("li:first").outerWidth()-opts.initialTabSlideOffset
}else{currentScrollableTabOffset-=scrollerList.find("li:nth-child("+(currentTabIndex+1)+")").outerWidth()
}scrollMax=-scroller.find("li:last").position().left+nav.position().left-scroller.position().left-nav.innerWidth()+8-opts.initialTabSlideOffset;
if(currentScrollableTabOffset<scrollMax){currentScrollableTabOffset=scrollMax
}}else{currentScrollableTabOffset+=scrollerList.find("li:nth-child("+(currentTabIndex)+")").outerWidth();
if(currentScrollableTabOffset>=0){currentScrollableTabOffset=0
}}return currentScrollableTabOffset
};
shiftScroller=function(scrollableTabOffset,scroller,outerMostList){var scrollerList=scroller.find("ul");
scrollerList.css("left",scrollableTabOffset+"px");
if(scrollableTabOffset<0){$(outerMostList).find("li.locked").filter(":last").addClass("overlay")
}else{$(outerMostList).find("li.locked").filter(":last").removeClass("overlay")
}};
adjustToFit=function(){if($(this).is("ul.infinite-tabs")){$(this).data("resetScrollerWidth")();
$(this).data("positionNavFunction")()
}};
removeTab=function(tab){if($(this).is("ul.infinite-tabs")){$(tab).remove();
adjustToFit.call(this)
}};
addTab=function(tab,position){if($(this).is("ul.infinite-tabs")){if(position==="append"){$(this).find("li.scroller ul").append(tab)
}else{$(this).find("li.scroller ul li:not(.hidden):first").before(tab)
}adjustToFit.call(this)
}};
setTabContent=function(tab,newTabContent){if($(this).is("ul.infinite-tabs")){if(typeof newTabContent==="string"){$(tab).find("a").html(newTabContent)
}else{$(tab).find("a").empty().append($(newTabContent))
}}adjustToFit.call(this)
};
$.fn.infiniteTabs.defaults={initialTabSlideOffset:10}
}(jQuery));
(function($){$.fn.editable=function(target,options){if("disable"==target){$(this).data("disabled.editable",true);
return
}if("enable"==target){$(this).data("disabled.editable",false);
return
}if("destroy"==target){$(this).unbind($(this).data("event.editable")).removeData("disabled.editable").removeData("event.editable");
return
}var settings=$.extend({},$.fn.editable.defaults,{target:target},options);
var plugin=$.editable.types[settings.type].plugin||function(){};
var submit=$.editable.types[settings.type].submit||function(){};
var buttons=$.editable.types[settings.type].buttons||$.editable.types["defaults"].buttons;
var content=$.editable.types[settings.type].content||$.editable.types["defaults"].content;
var element=$.editable.types[settings.type].element||$.editable.types["defaults"].element;
var reset=$.editable.types[settings.type].reset||$.editable.types["defaults"].reset;
var callback=settings.callback||function(){};
var onedit=settings.onedit||function(){};
var onsubmit=settings.onsubmit||function(){};
var onreset=settings.onreset||function(){};
var onerror=settings.onerror||reset;
if(settings.tooltip){$(this).attr("title",settings.tooltip)
}settings.autowidth="auto"==settings.width;
settings.autoheight="auto"==settings.height;
return this.each(function(){var self=this;
var savedwidth=$(self).width();
var savedheight=$(self).height();
$(this).data("event.editable",settings.event);
if(!$.trim($(this).html())){$(this).html(settings.placeholder)
}$(this).bind(settings.event,function(e){if(true===$(this).data("disabled.editable")){return
}if(self.editing){return
}if(false===onedit.apply(this,[settings,self])){return
}e.preventDefault();
if(settings.tooltip){$(self).removeAttr("title")
}if(0==$(self).width()){settings.width=savedwidth;
settings.height=savedheight
}else{if(settings.width!="none"){settings.width=settings.autowidth?$(self).width():settings.width
}if(settings.height!="none"){settings.height=settings.autoheight?$(self).height():settings.height
}}if(settings.lesswidth){settings.width-=settings.lesswidth
}if(settings.lessheight){settings.width-=settings.lessheight
}if($(this).html().toLowerCase().replace(/(;|")/g,"")==settings.placeholder.toLowerCase().replace(/(;|")/g,"")){$(this).html("")
}self.editing=true;
self.revert=$(self).html();
self.text=$(self).text();
var spaceItem=$("<div>&nbsp;</div").css("width",$(self).width()).css("height",$(self).height());
$(self).html("");
var form=$("<form />");
if(settings.cssclass){if("inherit"==settings.cssclass){form.attr("class",$(self).attr("class"))
}else{form.attr("class",settings.cssclass)
}}if(settings.style){if("inherit"==settings.style){form.attr("style",$(self).attr("style"));
form.css("display",$(self).css("display"))
}else{form.attr("style",settings.style)
}}var input=element.apply(form,[settings,self]);
var input_content;
if(settings.loadurl){var t=setTimeout(function(){input.disabled=true;
content.apply(form,[settings.loadtext,settings,self])
},100);
var loaddata={};
loaddata[settings.id]=self.id;
if($.isFunction(settings.loaddata)){$.extend(loaddata,settings.loaddata.apply(self,[self.text,settings]))
}else{$.extend(loaddata,settings.loaddata)
}$.ajax({type:settings.loadtype,url:settings.loadurl,data:loaddata,async:false,success:function(result){window.clearTimeout(t);
input_content=result;
input.disabled=false
}})
}else{if(settings.data){input_content=settings.data;
if($.isFunction(settings.data)){input_content=settings.data.apply(self,[self.text,settings])
}}else{input_content=self.text
}}content.apply(form,[input_content,settings,self]);
input.attr("name",settings.name);
buttons.apply(form,[settings,self]);
$(self).append(form);
$(self).append(spaceItem);
plugin.apply(form,[settings,self]);
$(":input:visible:enabled:first",form).focus();
if(settings.select){input.select()
}input.keydown(function(e){if(e.keyCode==27){e.preventDefault();
reset.apply(form,[settings,self]);
$(self).trigger(event)
}});
var t;
if("cancel"==settings.onblur){input.blur(function(e){t=setTimeout(function(){reset.apply(form,[settings,self])
},200)
})
}else{if("submit"==settings.onblur){input.blur(function(e){t=setTimeout(function(){form.submit()
},200)
})
}else{if($.isFunction(settings.onblur)){input.blur(function(e){settings.onblur.apply(self,[input.val(),settings])
})
}else{input.blur(function(e){})
}}}form.submit(function(e){if(t){clearTimeout(t)
}e.preventDefault();
if(false!==onsubmit.apply(form,[settings,self])){if(false!==submit.apply(form,[settings,self])){if($.isFunction(settings.target)){var str=settings.target.apply(self,[input.val(),settings]);
$(self).html(multiLineHtmlEncode(str));
self.editing=false;
callback.apply(self,[self.innerHTML,settings]);
if(!$.trim($(self).html())){$(self).html(settings.placeholder)
}}else{var submitdata={};
submitdata[settings.name]=input.val();
submitdata[settings.id]=self.id;
if($.isFunction(settings.submitdata)){$.extend(submitdata,settings.submitdata.apply(self,[self.revert,settings]))
}else{$.extend(submitdata,settings.submitdata)
}if("PUT"==settings.method){submitdata["_method"]="put"
}$(self).html(settings.indicator);
var ajaxoptions={type:"POST",data:submitdata,dataType:"html",url:settings.target,success:function(result,status){if(ajaxoptions.dataType=="html"){$(self).html(multiLineHtmlEncode(result))
}self.editing=false;
callback.apply(self,[result,settings]);
if(!$.trim($(self).html())){$(self).html(settings.placeholder)
}},error:function(xhr,status,error){onerror.apply(form,[settings,self,xhr])
}};
$.extend(ajaxoptions,settings.ajaxoptions);
$.ajax(ajaxoptions)
}}}$(self).attr("title",settings.tooltip);
return false
})
});
this.reset=function(form){if(this.editing){if(false!==onreset.apply(form,[settings,self])){$(self).html(self.revert);
self.editing=false;
if(!$.trim($(self).html())){$(self).html(settings.placeholder)
}if(settings.tooltip){$(self).attr("title",settings.tooltip)
}}}}
})
};
$.editable={types:{defaults:{element:function(settings,original){var input=$('<input type="hidden"></input>');
$(this).append(input);
return(input)
},content:function(string,settings,original){$(":input:first",this).val(string)
},reset:function(settings,original){original.reset(this)
},buttons:function(settings,original){var form=this;
if(settings.submit){if(settings.submit.match(/>$/)){var submit=$(settings.submit).click(function(){if(submit.attr("type")!="submit"){form.submit()
}})
}else{var submit=$('<button type="submit" />');
submit.html(settings.submit)
}$(this).append(submit)
}if(settings.cancel){if(settings.cancel.match(/>$/)){var cancel=$(settings.cancel)
}else{var cancel=$('<button type="cancel" />');
cancel.html(settings.cancel)
}$(this).append(cancel);
$(cancel).click(function(event){if($.isFunction($.editable.types[settings.type].reset)){var reset=$.editable.types[settings.type].reset
}else{var reset=$.editable.types["defaults"].reset
}reset.apply(form,[settings,original]);
return false
})
}}},text:{element:function(settings,original){var input=$("<input />");
if(settings.width!="none"){input.width(settings.width)
}if(settings.height!="none"){input.height(settings.height)
}if(settings.maxLength){input.attr("maxlength",settings.maxLength)
}input.attr("autocomplete","off");
if(settings.autoComplete){input.autocomplete({source:($.isArray(settings.autoComplete)?settings.autoComplete:settings.autoComplete()),minLength:0,delay:0})
}$(this).append(input);
return(input)
}},textarea:{element:function(settings,original){var textarea=$("<textarea />");
if(settings.rows){textarea.attr("rows",settings.rows)
}else{if(settings.height!="none"){textarea.height(settings.height)
}}if(settings.cols){textarea.attr("cols",settings.cols)
}else{if(settings.width!="none"){textarea.width(settings.width)
}}if(settings.saveonenterkeypress){textarea.keypress(function(event){if((event.charCode==13)&&!event.ctrlKey){textarea.blur()
}})
}if(settings.autoResize){textarea.css("dispay","block");
textarea.autoResize({limit:150,extraSpace:10,origHeight:20})
}if(settings.maxLength){$.each(["keyup","paste","blue"],function(i,eventName){textarea.bind("keyup",function(){$(this).val($(this).val().slice(0,settings.maxLength))
})
})
}$(this).append(textarea);
return(textarea)
}},select:{element:function(settings,original){var select=$("<select />");
$(this).append(select);
return(select)
},content:function(data,settings,original){if(String==data.constructor){eval("var json = "+data)
}else{var json=data
}for(var key in json){if(!json.hasOwnProperty(key)){continue
}if("selected"==key){continue
}var option=$("<option />").val(key).append(json[key]);
$("select",this).append(option)
}$("select",this).children().each(function(){if($(this).val()==json["selected"]||$(this).text()==$.trim(original.revert)){$(this).attr("selected","selected")
}})
}}},addInputType:function(name,input){$.editable.types[name]=input
}};
$.fn.editable.defaults={name:"value",id:"id",type:"text",width:"auto",height:"auto",event:"click.editable",onblur:"cancel",loadtype:"GET",loadtext:"Loading...",placeholder:"Click to edit",loaddata:{},submitdata:{},ajaxoptions:{}}
})(jQuery);
$.fn.simpleColorPicker=function(options){var defaults={colorsPerLine:8,colors:["#000000","#444444","#666666","#999999","#cccccc","#eeeeee","#f3f3f3","#ffffff","#ff0000","#ff9900","#ffff00","#00ff00","#00ffff","#0000ff","#9900ff","#ff00ff","#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc","#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd","#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0","#cc0000","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79","#990000","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47","#660000","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4C1130"],showEffect:"",hideEffect:"",onChangeColor:false};
var opts=$.extend(defaults,options);
return this.each(function(){var txt=$(this);
var colorsMarkup="";
var prefix=String(txt.attr("id")).replace(/-/,"")+"_";
for(var i=0;
i<opts.colors.length;
i++){var item=opts.colors[i];
var breakLine="";
if(i%opts.colorsPerLine==0){breakLine="clear: both; "
}if(i>0&&breakLine&&$.browser&&$.browser.msie&&$.browser.version<=7){breakLine="";
colorsMarkup+='<li style="float: none; clear: both; overflow: hidden; background-color: #fff; display: block; height: 1px; line-height: 1px; font-size: 1px; margin-bottom: -2px;"></li>'
}colorsMarkup+='<li id="'+prefix+"color-"+i+'" class="color-box" style="'+breakLine+"background-color: "+item+'" title="'+item+'"></li>'
}var box=$('<div id="'+prefix+'color-picker" class="color-picker" style="position: absolute; left: 0px; top: 0px;"><ul>'+colorsMarkup+'</ul><div style="clear: both;"></div></div>');
$("body").append(box);
box.hide();
box.find("li.color-box").click(function(){if(!txt.is("input")){txt.val(opts.colors[this.id.substr(this.id.indexOf("-")+1)]);
txt.blur()
}if($.isFunction(defaults.onChangeColor)){defaults.onChangeColor.call(txt,opts.colors[this.id.substr(this.id.indexOf("-")+1)])
}hideBox(box)
});
$("body").live("click",function(){hideBox(box)
});
box.click(function(event){event.stopPropagation()
});
var positionAndShowBox=function(box){var pos=txt.offset();
var left=pos.left+txt.outerWidth()-box.outerWidth();
if(left<pos.left){left=pos.left
}box.css({left:left,top:(pos.top+txt.outerHeight())});
showBox(box)
};
txt.click(function(event){event.stopPropagation();
if(!txt.is("input")){positionAndShowBox(box)
}});
txt.focus(function(){positionAndShowBox(box)
});
function hideBox(box){if(opts.hideEffect=="fade"){box.fadeOut()
}else{if(opts.hideEffect=="slide"){box.slideUp()
}else{box.hide()
}}}function showBox(box){if(opts.showEffect=="fade"){box.fadeIn()
}else{if(opts.showEffect=="slide"){box.slideDown()
}else{box.show()
}}}})
};
(function($){function CSRFProtection(xhr){var token=$('meta[name="csrf-token"]').attr("content");
if(token){xhr.setRequestHeader("X-CSRF-Token",token)
}}if("ajaxPrefilter" in $){$.ajaxPrefilter(function(options,originalOptions,xhr){CSRFProtection(xhr)
})
}else{$(document).ajaxSend(function(e,xhr){CSRFProtection(xhr)
})
}function fire(obj,name,data){var event=$.Event(name);
obj.trigger(event,data);
return event.result!==false
}function handleRemote(element){var method,url,data,dataType=element.data("type")||($.ajaxSettings&&$.ajaxSettings.dataType);
if(fire(element,"ajax:before")){if(element.is("form")){method=element.attr("method");
url=element.attr("action");
data=element.serializeArray();
var button=element.data("ujs:submit-button");
if(button){data.push(button);
element.data("ujs:submit-button",null)
}}else{method=element.data("method");
url=element.attr("href");
data=null
}$.ajax({url:url,type:method||"GET",data:data,dataType:dataType,beforeSend:function(xhr,settings){if(settings.dataType===undefined){xhr.setRequestHeader("accept","*/*;q=0.5, "+settings.accepts.script)
}return fire(element,"ajax:beforeSend",[xhr,settings])
},success:function(data,status,xhr){element.trigger("ajax:success",[data,status,xhr])
},complete:function(xhr,status){element.trigger("ajax:complete",[xhr,status])
},error:function(xhr,status,error){element.trigger("ajax:error",[xhr,status,error])
}})
}}function handleMethod(link){var href=link.attr("href"),method=link.data("method"),csrf_token=$("meta[name=csrf-token]").attr("content"),csrf_param=$("meta[name=csrf-param]").attr("content"),form=$('<form method="post" action="'+href+'"></form>'),metadata_input='<input name="_method" value="'+method+'" type="hidden" />';
if(csrf_param!==undefined&&csrf_token!==undefined){metadata_input+='<input name="'+csrf_param+'" value="'+csrf_token+'" type="hidden" />'
}form.hide().append(metadata_input).appendTo("body");
form.submit()
}function disableFormElements(form){form.find("input[data-disable-with], button[data-disable-with]").each(function(){var element=$(this),method=element.is("button")?"html":"val";
element.data("ujs:enable-with",element[method]());
element[method](element.data("disable-with"));
element.attr("disabled","disabled")
})
}function enableFormElements(form){form.find("input[data-disable-with]:disabled, button[data-disable-with]:disabled").each(function(){var element=$(this),method=element.is("button")?"html":"val";
if(element.data("ujs:enable-with")){element[method](element.data("ujs:enable-with"))
}element.removeAttr("disabled")
})
}function allowAction(element){var message=element.data("confirm");
return !message||(fire(element,"confirm")&&confirm(message))
}function requiredValuesMissing(form){var missing=false;
form.find("input[name][required]").each(function(){if(!$(this).val()){missing=true
}});
return missing
}$("a[data-confirm], a[data-method], a[data-remote]").live("click.rails",function(e){var link=$(this);
if(!allowAction(link)){return false
}if(link.data("remote")!=undefined){handleRemote(link);
return false
}else{if(link.data("method")){handleMethod(link);
return false
}}});
$("form").live("submit.rails",function(e){var form=$(this),remote=form.data("remote")!=undefined;
if(!allowAction(form)){return false
}if(requiredValuesMissing(form)){return !remote
}if(remote){handleRemote(form);
return false
}else{setTimeout(function(){disableFormElements(form)
},13)
}});
$("form input[type=submit], form input[type=image], form button[type=submit], form button:not([type])").live("click.rails",function(){var button=$(this);
if(!allowAction(button)){return false
}var name=button.attr("name"),data=name?{name:name,value:button.val()}:null;
button.closest("form").data("ujs:submit-button",data)
});
$("form").live("ajax:beforeSend.rails",function(event){if(this==event.target){disableFormElements($(this))
}});
$("form").live("ajax:complete.rails",function(event){if(this==event.target){enableFormElements($(this))
}})
})(jQuery);
vtip=function(){this.xOffset=-10;
this.yOffset=10;
$(".vtip").unbind().live("mouseenter",function(e){$(this).data("vtip-title",this.title);
this.t=this.title;
if(this.t!=""){this.title="";
this.top=(e.pageY+yOffset);
this.left=(e.pageX+xOffset);
$(this).addClass("vtipActive");
$("body").append('<p id="vtip"><img id="vtipArrow" />'+this.t+"</p>");
$("p#vtip #vtipArrow").attr("src","/images/vtip_arrow.png");
$("p#vtip").css("top",this.top+"px").css("left",this.left+"px").fadeIn("slow")
}}).live("mouseleave",function(){if(this.title==""){this.title=this.t;
$("p#vtip").fadeOut("slow").remove();
$(this).removeClass("vtipActive")
}}).live("mousemove",function(e){this.top=(e.pageY+yOffset);
this.left=(e.pageX+xOffset);
$("p#vtip").css("top",this.top+"px").css("left",this.left+"px")
})
};
jQuery(document).ready(function($){vtip()
});
(function($){$.datepicker.regional["en-EU"]={closeText:"Done",prevText:"Prev",nextText:"Next",currentText:"Today",monthNames:["January","February","March","April","May","June","July","August","September","October","November","December"],monthNamesShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],dayNames:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],dayNamesShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],dayNamesMin:["Su","Mo","Tu","We","Th","Fr","Sa"],weekHeader:"Wk",dateFormat:"dd/mm/yy",firstDay:1,isRTL:false,showMonthAfterYear:false,yearSuffix:""}
})(jQuery);
(function($){$.datepicker.regional["en-GB"]={closeText:"Done",prevText:"Prev",nextText:"Next",currentText:"Today",monthNames:["January","February","March","April","May","June","July","August","September","October","November","December"],monthNamesShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],dayNames:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],dayNamesShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],dayNamesMin:["Su","Mo","Tu","We","Th","Fr","Sa"],weekHeader:"Wk",dateFormat:"dd/mm/yy",firstDay:1,isRTL:false,showMonthAfterYear:false,yearSuffix:""}
})(jQuery);
(function($){$.datepicker.regional["en-US"]={closeText:"Done",prevText:"Prev",nextText:"Next",currentText:"Today",monthNames:["January","February","March","April","May","June","July","August","September","October","November","December"],monthNamesShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],dayNames:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],dayNamesShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],dayNamesMin:["Su","Mo","Tu","We","Th","Fr","Sa"],weekHeader:"Wk",dateFormat:"mm/dd/yy",firstDay:0,isRTL:false,showMonthAfterYear:false,yearSuffix:""}
})(jQuery);
function addCommas(nStr){var x,x1,x2;
nStr+="";
x=nStr.split(".");
x1=x[0];
x2=x.length>1?"."+x[1]:"";
var rgx=/(\d+)(\d{3})/;
while(rgx.test(x1)){x1=x1.replace(rgx,"$1"+","+"$2")
}return x1+x2
}function htmlEncode(value){if(value){return $("<span/>").text(value).html()
}else{return""
}}function multiLineHtmlEncode(value){if(_.isString(value)){var lines=value.split(/\r\n|\r|\n/);
for(var i=0;
i<lines.length;
i++){lines[i]=htmlEncode(lines[i])
}return lines.join("<br/>")
}else{return""
}}function parseRubyDate(value){var dateParts=String(value).split("-");
return new Date(dateParts[0],Number(dateParts[1])-1,dateParts[2])
}function haveFormElementValuesChanged(dom1,dom2){var same=false;
$(dom1).find("input[type=text],input[type=password],select").each(function(i,elem){if($(dom2).find("#"+$(elem).attr("id")).val()!==$(elem).val()){same=true
}});
$(dom1).find("input[type=checkbox],input[type=radio]").each(function(i,elem){if($(dom2).find("#"+$(elem).attr("id")).is(":checked")!==$(elem).is(":checked")){same=true
}});
return same
}function MouseTracker($){var mouseX,mouseY;
$(document).mousemove(function(e){mouseX=e.pageX;
mouseY=e.pageY
});
return{isOver:function(node){var p=$(node).offset();
if(mouseX>=p.left&&mouseX<=p.left+$(node).width()&&mouseY>=p.top&&mouseY<=p.top+$(node).height()){return true
}return false
}}
}var App={Views:{},Collections:{},Controllers:{},Routers:{}},_ues;
(function(){function proxyAjaxEvent(event,options,dit){var eventCallback=options[event];
options[event]=function(){if(eventCallback){eventCallback.apply(options,arguments)
}dit.processQueue()
}
}Backbone.Model.prototype._save=Backbone.Model.prototype.save;
Backbone.Model.prototype.save=function(attrs,options){if(!options){options={}
}if(this.saving){this.saveQueue=this.saveQueue||[];
this.saveQueue.push({attrs:_.extend({},this.attributes,attrs),options:options})
}else{this.saving=true;
proxyAjaxEvent("success",options,this);
proxyAjaxEvent("error",options,this);
Backbone.Model.prototype._save.call(this,attrs,options)
}};
Backbone.Model.prototype.processQueue=function(){if(this.saveQueue&&this.saveQueue.length){var saveArgs=this.saveQueue.shift();
proxyAjaxEvent("success",saveArgs.options,this);
proxyAjaxEvent("error",saveArgs.options,this);
Backbone.Model.prototype._save.call(this,saveArgs.attrs,saveArgs.options)
}else{this.saving=false
}}
}());
$(document).ready(function(){var alertNotice,version,supported;
$("a").live("confirm",function(event){var clickedLink,title,actionButton,buttons;
event.preventDefault();
event.stopPropagation();
clickedLink=$(this);
$("#dialog-confirm").remove();
title=(clickedLink.attr("title")||(clickedLink.data("vtip-title")||"Please confirm"));
$("body").append(JST["layouts/confirm-dialog"]({title:title,confirmationMessage:clickedLink.data("confirm")}));
actionButton="Delete";
buttons={};
buttons[actionButton]=function(){clickedLink.data("confirm","");
clickedLink.click();
$(this).dialog("close")
};
buttons.Cancel=function(){$(this).dialog("close")
};
$("#dialog-confirm").dialog({resizable:false,height:140,modal:true,buttons:buttons});
return(false)
});
alertNotice=$("#alert-space .notice, #alert-space .error, #alert-space .warning");
alertNotice.css("display","none").slideDown(function(){_.delay(function(){alertNotice.slideUp()
},5000)
});
if(App.environment!=="test"){_ues={host:"easybacklog.userecho.com",forum:"4890",lang:"en",tab_show:false};
(function(){var s,_ue=document.createElement("script");
_ue.type="text/javascript";
_ue.async=true;
_ue.src=("https:"===document.location.protocol?"https://s3.amazonaws.com/":"http://")+"cdn.userecho.com/js/widget-1.4.gz.js";
s=document.getElementsByTagName("script")[0];
s.parentNode.insertBefore(_ue,s)
}())
}setTimeout(function(){$("a.feedback-button").mouseover(function(){if(typeof UE!=="undefined"){UE.Popin.preload()
}}).click(function(event){event.preventDefault();
if(typeof UE!=="undefined"){UE.Popin.show()
}else{document.location.href="/contact"
}}).fadeIn()
},1500);
version=Number(String($.browser.version).match(/^\d+/)[0]);
$.browser.versionInt=version;
supported=(($.browser.webkit)||($.browser.mozilla&&(version>=2))||($.browser.msie&&(version>=9)));
if(!supported){$(".unsupported_browser .hide_notice a").click(function(event){event.preventDefault();
$.cookie("hide_unsupported_browser_notice","true",{expires:30});
$(".unsupported_browser").slideUp()
});
if($.cookie("hide_unsupported_browser_notice")!=="true"){$(".unsupported_browser").show()
}}});
(function(){window.JST=window.JST||{};
window.JST["acceptance_criteria/index"]=_.template('<ul class="acceptance-criteria"></ul>');
window.JST["acceptance_criteria/new"]=_.template('<li class="actions new-acceptance-criterion">\n  <div>[edit]</div>\n</li>');
window.JST["acceptance_criteria/show"]=_.template('<div class="index" title="Drag to reorder">&nbsp;</div>\n<div class="data"><%= multiLineHtmlEncode(model.get(\'criterion\')) %></div>');
window.JST["backlogs/compare-snapshot-dialog"]=_.template('<div id="dialog-compare-snapshot" title="Compare snapshots">\n  <form>\n    <p>\n      <span class="ui-icon ui-icon-transferthick-e-w" style="float:left; margin:0 7px 30px 0;" />\n      Please choose which snapshots you wish to compare, and a new window will be opened showing you the comparison.\n    </p>\n    <div class="error-message"></div>\n    <div class="elements">\n      <p>\n        <label for="base-snapshot">Which snapshot is your base (typically the older version)?</label>\n      </p>\n      <p>\n        <select id="base-snapshot">\n          <%= snapshot_options %>\n        </select>\n      </p>\n      <br />\n      <p>\n        <label for="target-snapshot">Which snapshot are you comparing against (typically the newer version)?</label>\n      </p>\n      <p>\n        <select id="target-snapshot">\n          <%= snapshot_options %>\n        </select>\n      </p>\n    </div>\n  </form>\n</div>');
window.JST["backlogs/create-snapshot-dialog"]=_.template('<div id="dialog-create-snapshot" title="Create new snapshot">\n  <form>\n    <p>\n      <span class="ui-icon ui-icon-plusthick" style="float:left; margin:0 7px 30px 0;" />\n      Creating a snapshot of the current working version of the backlog saves an exact replica of the backlog now for later reference.\n    </p>\n    <div class="progress-area">\n      <p>\n        <label for="snapshot-name">Please name your snapshot:</label>\n      </p>\n      <p>\n        <input id="snapshot-name" type="text" value="">\n      </p>\n    </div>\n  </form>\n</div>');
window.JST["backlogs/presence"]=_.template('<div class="header">\n  <div class="icon">\n    <span class="ui-icon ui-icon-alert"></span>\n  </div>\n  <div class="title">\n    <%= people.length %> other <% if (people.length === 1) { %>person is<% } else { %>people are<% } %> simultaneously editing this backlog\n  </div>\n</div>\n<div class="people">\n  The following <% if (people.length === 1) { %>person is<% } else { %>people are<% } %> currently editing this backlog:\n  <ul>\n    <% _(people).each(function(person) { %>\n      <li><%= htmlEncode(person.name) %></li>\n    <% }); %>\n  </ul>\n</div>');
window.JST["backlogs/print-dialog"]=_.template('<div id="dialog-print" title="Print story cards">\n  <form>\n    <p>\n      <span class="ui-icon ui-icon-print" style="float:left; margin:0 7px 30px 0;" />\n      Printing story cards requires the use of a printer that is capable of duplexing (double-sided printing).  Alternatively, and less favourably, you can glue each page pair together.\n    </p>\n    <p>\n      What would you like to print?\n    </p>\n    <p>\n      <select id="print-scope">\n        <option id="">All themes</option>\n        <optgroup label="Only the following theme">\n        <% backlog.Themes().each(function(theme) { %>\n          <option id="<%= theme.get(\'id\') %>"><%= htmlEncode(theme.get(\'name\')) %></option>\n        <% }); %>\n        </optgroup>\n      </select>\n      <br />\n    </p>\n    <p>\n      Please select your paper size\n    </p>\n    <p>\n      <select id="page-size">\n        <option id="A4"<%= ($.cookie("page-size-default") == \'A4\') ? \' selected\' : \'\' %>>A4</option>\n        <option id="LETTER"<%= ($.cookie("page-size-default") == \'LETTER\') ? \' selected\' : \'\' %>>Letter</option>\n      </select>\n      <br />\n    </p>\n    <p>\n      Which printer setting do you use for double-sided printing?\n    </p>\n    <p>\n      <select id="fold-side">\n        <option id="long"<%= ($.cookie("fold-side-default") == \'long\') ? \' selected\' : \'\' %>>Long side binding</option>\n        <option id="short"<%= ($.cookie("fold-side-default") == \'short\') ? \' selected\' : \'\' %>>Short side binding</option>\n      </select>\n      <br />\n    </p>\n    <p class="progress-placeholder">\n    </p>\n  </form>\n</div>');
window.JST["backlogs/sprint-progress-stats"]=_.template("<h2 class=\"divider\">Statistics</h2>\n\n<p>Out of luck!  You have not completed any sprints yet, so we can't build any reports for you.  Once you have completed your first sprint we'll have some reports waiting for you.</p>\n\n<h2>Burn down</h2>\n<h2>Burn up</h2>\n<h2>Velocity</h2>\n<h2>Velocity mean</h2>");
window.JST["backlogs/stats"]=_.template("<div class=\"title\">Backlog total:</div>\n<div class=\"output\">\n  <%= addCommas((model.get('points') || 0).toFixed(1)) %> points / <%= model.get('cost_formatted')%> / <strong><%= addCommas((model.get('days') || 0).toFixed(1)) %> days</strong>\n</div>");
window.JST["layouts/confirm-dialog"]=_.template('<div id="dialog-confirm" class="dialog" title="<%= title %>"}\n  <p>\n    <span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"></span>\n    <%= confirmationMessage %>\n  </p>\n</div>');
window.JST["snapshots/snapshot-header"]=_.template('<td class="logo-space" colspan="<%=columns%>">\n  <a href="/" target="_blank" class="main-title">\n    <span class="easy">easy</span><span class="backlog">Backlog</span>\n  </a>\n  <span class="divider">|</span>\n  <b>Comparing Snapshots</b>\n</td>\n<td class="actions" colspan="<%=columns%>">\n  <a href="#help" id="help">Help?\n    <div id="help-rollover">\n      <div class="key"><span class="deleted"></span> Deleted from left</div>\n      <div class="key"><span class="new"></span> Added to right</div>\n      <div class="key"><span class="changed"></span> Value changed</div>\n      <div class="key"><span class="changed">▽</span> Value decreased</div>\n      <div class="key"><span class="changed">△</span> Value increased</div>\n    </div>\n  </a>\n  <span class="divider">|</span>\n  <a href="<%= document.location.href %>.xls">Export</a>\n  <span class="divider">|</span>\n  <a href="#print" id="print">Print</a>\n  <span class="divider">|</span>\n  <a href="#close-window" id="close-window">Close</a>\n</td>');
window.JST["sprints/changed-confirm-dialog"]=_.template('<div id="dialog-changed-confirm" title="Discard changes?">\n  <form>\n    <p class="intro">\n      You have made changes.  Do you want to discard your changes?\n    </p>\n  </form>\n</div>');
window.JST["sprints/delete-sprint-dialog"]=_.template('<div id="dialog-delete-sprint" title="Delete sprint">\n  <form>\n    <p class="intro">\n      Are you sure you want to permanently delete sprint <%= iteration %>?\n    </p>\n  </form>\n</div>');
window.JST["sprints/edit-sprint"]=_.template('<form class="edit_sprint">\n  <div id="form-errors"></div>\n  <label for="number-team-members">Number of team members</label>\n  <div class=\'label-hint\'>\n    (working on this sprint completing stories)\n  </div>\n  <div class=\'input-row\'>\n    <input id="number-team-members" name="number_team_members" type="text" value="<%=model.get(\'number_team_members\')%>" class="narrow"/>\n  </div>\n\n  <div class=\'label-spacer\'></div>\n\n  <label for="start-on">Sprint start date</label>\n  <div class=\'label-hint\'>\n    (click to show the calendar)\n  </div>\n  <div class=\'input-row\'>\n    <input id="start-on" name="start_on" type="text" value="" />\n  </div>\n\n  <div class=\'label-spacer\'></div>\n\n  <label for="duration-days">Duration of sprint in days</label>\n  <div class=\'label-hint\'>\n    (typically working days)\n  </div>\n  <div class=\'input-row\'>\n    <input id="duration-days" name="duration_days" type="text" value="<%=model.get(\'duration_days\')%>" class="narrow"/>\n  </div>\n\n  <div class=\'label-spacer\'></div>\n\n  <input id="sprint_submit" type="submit" value="Update sprint settings">\n  <a id="sprint_cancel" href="#cancel">cancel</a>\n</form>');
window.JST["sprints/empty"]=_.template('<div class="notice">\n  Drag an unassigned story from the right hand side to allocate it to this sprint.\n</div>');
window.JST["sprints/help-pod"]=_.template('<section class="side-panel">\n  <div class="button-container">\n    <a href="#" class="add-new-sprint button">Create new sprint</a>\n    <div class="button-help">\n      For future sprints, the Sprints tab above will no longer appear, so you must use the <b>+</b> icon next to the Backlog tab to add further sprints.\n    </div>\n  </div>\n</section>');
window.JST["sprints/help"]=_.template('<h2 class="divider">Sprints</h2>\n\n<p>\n  Once you are ready to start working on your backlog, you can create sprints and assign stories to those sprints.\n<p>\n\n\n<h3>First time using sprints?</h3>\n<p>\n  We\'d recommend you take a quick look at this one minute demo of how to use sprints.\n</p>\n<p>\n  [VIDEO HERE]\n</p>');
window.JST["sprints/new-dialog"]=_.template('<div id="dialog-new-sprint" title="Create a new sprint">\n  <form>\n    <p class="intro">\n      Each sprint must have a start date, a set duration and a pre-determined number of team members for that sprint.  Enter the details below to create a new sprint.\n    </p>\n    <p>\n      <div>\n        <p>\n          <label for="number-team-members">Number of team members working on completing stories</label>\n        </p>\n        <p>\n          <input id="number-team-members" name="number_team_members" type="text" value="">\n        </p>\n        <p>\n          <label for="start-on">Sprint start date</label>\n        </p>\n        <p>\n          <input id="start-on" name="start_on" type="text" value="">\n        </p>\n        <p>\n          <label for="duration-days">Duration of sprint in days (typically working days)</label>\n        </p>\n        <p>\n          <input id="duration-days" name="duration_days" type="text" value="">\n        </p>\n      </div>\n    </p>\n    <p class="progress-placeholder"></p>\n  </form>\n</div>');
window.JST["sprints/show"]=_.template('<h2 class="divider">Sprint <%= model.get(\'iteration\') %> stories</h2>\n\n<div class="all-stories">\n  <div class="stories-container">\n    <div class="cards story-droppable"></div>\n    <div class="totals"></div>\n  </div>\n  <div class="unassigned-stories-heading">Unassigned stories</div>\n  <div class="stories-divider">\n    <div class="handle"><div class="change-size">expand</div></div>\n  </div>\n  <div class="unassigned-stories-container story-droppable"></div>\n</div>');
window.JST["sprints/sprint-delete-panel"]=_.template('<div class="backlog-tool-panel">\n  <h2>Delete sprint</h2>\n  <% if (model.get(\'completed?\')) { %>\n    This sprint is no longer editable as it is marked as complete.  If you need to delete this sprint, mark this sprint as incomplete.\n  <% } else if (!model.get(\'deletable?\')) { %>\n    This sprint cannot be deleted as it is not the last sprint.  You must delete all successive sprints before you can delete this sprint.\n  <% } else { %>\n    Deleting a sprint immediately will remove all stories from this sprint and this sprint will be <b>permanently deleted</b>.\n    <b>There is no undo</b> so make sure you absolutely sure you want to delete this sprint.\n    <div class="button-container">\n      <a href="#delete-sprint" class="delete-sprint">Yes, I understand — delete this sprint</a>\n    </div>\n  <% } %>\n</div>');
window.JST["sprints/sprint-story"]=_.template('<div class="fields">\n  <div class="code">\n    <div class="heading">ID:</div>\n    <div class="data"><%= model.Theme().get(\'code\')%><%= model.get(\'unique_id\')%></div>\n  </div>\n  <div class="points">\n    <div class="heading">Points:</div>\n    <div class="data"><% if (model.get(\'score_50\') === model.get(\'score_90\')) { %>\n        <%= !model.get(\'score_50\') ? \'0\' : model.get(\'score_50\') %>\n      <% } else {\n           if (!model.get(\'score_50\') && !model.get(\'score_90\')) { %>\n             0\n        <% } else { %>\n          <%= !model.get(\'score_50\') ? 0 : model.get(\'score_50\') %>/<%= !model.get(\'score_90\') ? 0 : model.get(\'score_90\')%>\n        <% } %>\n      <% } %>\n    </div>\n  </div>\n  <div class="status">\n    <% if (model.SprintStory()) { %>\n      <div class="tab status-code-<%= model.SprintStory().Status().get(\'code\') %>"><span><%= model.SprintStory().Status().get(\'status\') %></span></div>\n      <div class="drop-down"><select id="sprint-story-status"></select></div>\n    <% } %>\n  </div>\n</div>\n\n<div class="story">\n  <div class="theme"><div class="heading">Theme:</div><div class="data"><%= htmlEncode(model.Theme().get(\'name\')) %></div></div>\n  <div class="as-a"><div class="heading">As </div><div class="data"><%= htmlEncode(model.get(\'as_a\')) %></div></div>\n  <div class="i-want-to"><div class="heading">I want to </div><div class="data"><%= multiLineHtmlEncode(model.get(\'i_want_to\')) %></div></div>\n  <div class="so-i-can"><div class="heading">So I can </div><div class="data"><%= multiLineHtmlEncode(model.get(\'so_i_can\')) %></div></div>\n</div>\n\n<div class="acceptance-criteria">\n  <ol>\n    <% model.AcceptanceCriteria().each(function(criterion) { %>\n      <li><%= multiLineHtmlEncode(criterion.get(\'criterion\')) %></li>\n    <% }); %>\n  </ol>\n</div>\n\n<div class="more"><div class="tab"></div></div>\n\n<div class="move">move</div>');
window.JST["sprints/stats"]=_.template('<div class="title">\n  Sprint total\n</div>\n<div class="divider"></div>\n<div class="output<% if (Number(attributes.total_allocated_points) > Number(attributes.total_expected_points)) { %> highlight<% } %>">\n  <%= addCommas((Number(attributes.total_allocated_points) || 0).toFixed(1)) %> pts allocated\n</div>\n<div class="divider"></div>\n<div class="output">\n  <%= addCommas((Number(attributes.total_expected_points) || 0).toFixed(1)) %> pts expected\n</div>\n<div class="divider"></div>\n<div class="output">\n  <%= addCommas((Number(attributes.total_completed_points) || 0).toFixed(1)) %> pts completed\n</div>\n');
window.JST["sprints/tabs/show"]=_.template("<a>\n  <%= model.get('iteration')%>\n</a>");
window.JST["sprints/totals"]=_.template('<div class="title">\n  Sprint totals\n</div>\n\n<div class="amount<% if (Number(attributes.total_allocated_points) > Number(attributes.total_expected_points)) { %> highlight<% } %>">\n<%= addCommas((Number(attributes.total_allocated_points) || 0).toFixed(1)) %>\n</div>\n<div class="output<% if (Number(attributes.total_allocated_points) > Number(attributes.total_expected_points)) { %> highlight<% } %>">\n  Points in this sprint from the <%= (storyCount === 1 ? storyCount + \' story\' : storyCount + \' stories\' ) %>:\n</div>\n\n<div class="amount">\n<%= addCommas((Number(attributes.total_expected_points) || 0).toFixed(1)) %>\n</div>\n<div class="output">\n  Points expected in this sprint:\n</div>\n\n<div class="amount">\n<%= addCommas((Number(attributes.total_completed_points) || 0).toFixed(1)) %>\n</div>\n<div class="output">\n  Points completed:\n</div>');
window.JST["stories/delete-dialog"]=_.template('<div id="dialog-delete" title="Delete story?">\n  <p>\n    <span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;" />\n    This story will be permanently deleted and cannot be recovered. Are you sure?\n  </p>\n</div>');
window.JST["stories/index"]=_.template('<ul class="stories">\n</ul>');
window.JST["stories/move-dialog"]=_.template("<div id=\"dialog-move-story\" title=\"Move story\">\n  <p>\n    <span class=\"ui-icon ui-icon-arrow-4\" style=\"float:left; margin:0 7px 20px 0;\" />\n    Move story '<%=story.Theme().get('code') + story.get('unique_id')%>' to which theme?\n  </p>\n  <p>\n    <form>\n    <select id=\"theme-target\">\n      <% themes.each(function(theme) { %>\n        <option id=\"<%=theme.get('id')%>\"<%=(theme == story.Theme() ? ' selected=\"\"' : '') %>><%=theme.get('name')%></option>\n      <% }); %>\n    </select>\n    </form>\n  </p>\n</div>");
window.JST["stories/new"]=_.template('<li class="actions">\n  <a href="#new-story" class="new-story">Add story</a>\n</li>');
window.JST["stories/show"]=_.template('<div class="background-color-indicator"></div>\n<div class="unique-id">\n  <div class="data"><%= model.Theme().get(\'code\')%><%= model.get(\'unique_id\')%></div>\n  <% if (model.IsEditable()) { %>\n    <div class="story-actions">\n      <div class="color-picker-icon">\n        <a class="vtip" title="Assign a color"></a>\n      </div>\n      <div class="delete-story">\n        <a href="#delete-story" class="ui-icon ui-icon-trash vtip" title="Delete this story"></a>\n      </div>\n      <div class="duplicate-story">\n        <a href="#duplicate-story" class="ui-icon ui-icon-newwin vtip" title="Duplicate this story"></a>\n      </div>\n      <div class="move-story">\n        <a href="#move-story" class="vtip ui-icon ui-icon-arrow-4" title="Drag move to re-order this story, or click to move to another theme"></a>\n      </div>\n    </div>\n  <% } %>\n  <div class="sprint-story-info">\n    <% if (model.SprintStory()) { %>\n      <div class="status">\n        <div class="tab status-code-<%= model.SprintStory().Status().get(\'code\') %>"><span><%= model.SprintStory().Status().get(\'status\') %></span></div>\n        <div class="drop-down"><select id="sprint-story-status"></select></div>\n      </div>\n    <% } %>\n    <% if (model.SprintStory()) { %>\n      <div class="sprint"><div class="tab"><a href="#<%= model.SprintStory().Sprint().get(\'iteration\')%>">sprint <%= model.SprintStory().Sprint().get(\'iteration\')%></a></div></div>\n    <% } %>\n  </div>\n</div>\n<div class="user-story">\n  <div class="as-a"><div class="heading">As </div><div class="data"><%= htmlEncode(model.get(\'as_a\')) %></div></div>\n  <div class="i-want-to"><div class="heading">I want to </div><div class="data"><%= multiLineHtmlEncode(model.get(\'i_want_to\')) %></div></div>\n  <div class="so-i-can"><div class="heading">So I can </div><div class="data"><%= multiLineHtmlEncode(model.get(\'so_i_can\')) %></div></div>\n</div>\n<div class="acceptance-criteria">\n</div>\n<div class="comments">\n  <div class="data"><%= multiLineHtmlEncode(model.get(\'comments\')) %></div>\n</div>\n<% if (use5090estimates) { %>\n<div class="score-50">\n  <div class="data"><%= htmlEncode(model.get(\'score_50\')) %></div>\n</div>\n<div class="score-90">\n  <div class="data"><%= htmlEncode(model.get(\'score_90\')) %></div>\n</div>\n<% } else { %>\n<div class="score">\n  <div class="data"><%= htmlEncode(model.get(\'score\')) %></div>\n</div>\n<% } %>\n<div class="cost-formatted">\n  <div class="data"><%= model.get(\'cost_formatted\') %></div>\n</div>\n<div class="days-formatted">\n  <div class="data"><%= model.get(\'days_formatted\') %></div>\n</div>');
window.JST["themes/delete-dialog"]=_.template('<div id="dialog-delete" title="Delete theme?">\n  <p>\n    <span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;" />\n    This theme and all its stories will be permanently deleted and cannot be recovered. Are you sure?\n  </p>\n</div>');
window.JST["themes/index"]=_.template('<ul class="themes">\n</ul>\n<div class="stop-ordering">\n  <a href="#stop-ordering">Stop ordering</a>\n</div>');
window.JST["themes/new"]=_.template('<li class="actions">\n  <a href="#new-theme" class="new-theme">Add theme</a>\n  <a href="#reorder-themes" class="reorder-themes">Reorder themes</a>\n</li>');
window.JST["themes/re-number-dialog"]=_.template('<div id="dialog-re-number" title="Re-number stories in this theme?">\n  <p>\n    <span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;" />\n    Are you sure you want to re-number all the stories in this theme?  You cannot undo this?\n  </p>\n</div>');
window.JST["themes/show"]=_.template('<div class="theme-data">\n  <div class="name">\n    <div class="data"><%= htmlEncode(model.get(\'name\')) %></div>\n  </div>\n  <div class="theme-actions">\n    <div class="delete-theme"><a href="#delete-theme" class="ui-icon ui-icon-trash vtip" title="Delete this theme"></a></div>\n    <div class="re-number-stories"><a href="#re-number-stories" class="ui-icon ui-icon-shuffle vtip" title="Re-number the stories in this theme"></a></div>\n  </div>\n  <div class="code">\n    <div class="heading">Code:</div>\n    <div class="data"><%= htmlEncode(model.get(\'code\')) %></div>\n  </div>\n</div>\n<div class="stories">\n  <div class="theme-stats">\n    <div>&nbsp;</div>\n  </div>\n</div>\n<div class="move-theme">\n  <div class="icon ui-icon ui-icon-arrow-4"></div>\n  <div class="instructions">Drag this to reorder this theme</div>\n</div>\n');
window.JST["themes/stats"]=_.template("<div class=\"container\">\n  <% if (model.get('name') && model.get('name').length) { %>\n    <div class=\"title\">\n      Total for theme '<%= htmlEncode(model.get('name')) %>'\n    </div>\n  <% } %>\n  <div class=\"metrics\">\n    <%= addCommas((model.get('points') || 0).toFixed(1)) %> points / <%= model.get('cost_formatted')%> / <strong><%= addCommas((model.get('days') || 0).toFixed(1)) %> days</strong>\n  </div>\n</div>")
})();