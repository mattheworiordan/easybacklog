(function(){var doc=document,win=window,math=Math,mathRound=math.round,mathFloor=math.floor,mathCeil=math.ceil,mathMax=math.max,mathMin=math.min,mathAbs=math.abs,mathCos=math.cos,mathSin=math.sin,mathPI=math.PI,deg2rad=mathPI*2/360,userAgent=navigator.userAgent,isIE=/msie/i.test(userAgent)&&!win.opera,docMode8=doc.documentMode===8,isWebKit=/AppleWebKit/.test(userAgent),isFirefox=/Firefox/.test(userAgent),SVG_NS="http://www.w3.org/2000/svg",hasSVG=!!doc.createElementNS&&!!doc.createElementNS(SVG_NS,"svg").createSVGRect,hasRtlBug=isFirefox&&parseInt(userAgent.split("Firefox/")[1],10)<4,Renderer,hasTouch=doc.documentElement.ontouchstart!==undefined,symbolSizes={},idCounter=0,timeFactor=1,garbageBin,defaultOptions,dateFormat,globalAnimation,pathAnim,UNDEFINED,DIV="div",ABSOLUTE="absolute",RELATIVE="relative",HIDDEN="hidden",PREFIX="highcharts-",VISIBLE="visible",PX="px",NONE="none",M="M",L="L",TRACKER_FILL="rgba(192,192,192,"+(hasSVG?0.000001:0.002)+")",NORMAL_STATE="",HOVER_STATE="hover",SELECT_STATE="select",makeTime,getMinutes,getHours,getDay,getDate,getMonth,getFullYear,setMinutes,setHours,setDate,setMonth,setFullYear,globalAdapter=win.HighchartsAdapter,adapter=globalAdapter||{},each=adapter.each,grep=adapter.grep,map=adapter.map,merge=adapter.merge,addEvent=adapter.addEvent,removeEvent=adapter.removeEvent,fireEvent=adapter.fireEvent,animate=adapter.animate,stop=adapter.stop,seriesTypes={};
function extend(a,b){var n;
if(!a){a={}
}for(n in b){a[n]=b[n]
}return a
}function pInt(s,mag){return parseInt(s,mag||10)
}function isString(s){return typeof s==="string"
}function isObject(obj){return typeof obj==="object"
}function isArray(obj){return Object.prototype.toString.call(obj)==="[object Array]"
}function isNumber(n){return typeof n==="number"
}function log2lin(num){return math.log(num)/math.LN10
}function lin2log(num){return math.pow(10,num)
}function erase(arr,item){var i=arr.length;
while(i--){if(arr[i]===item){arr.splice(i,1);
break
}}}function defined(obj){return obj!==UNDEFINED&&obj!==null
}function attr(elem,prop,value){var key,setAttribute="setAttribute",ret;
if(isString(prop)){if(defined(value)){elem[setAttribute](prop,value)
}else{if(elem&&elem.getAttribute){ret=elem.getAttribute(prop)
}}}else{if(defined(prop)&&isObject(prop)){for(key in prop){elem[setAttribute](key,prop[key])
}}}return ret
}function splat(obj){return isArray(obj)?obj:[obj]
}function pick(){var args=arguments,i,arg,length=args.length;
for(i=0;
i<length;
i++){arg=args[i];
if(typeof arg!=="undefined"&&arg!==null){return arg
}}}function css(el,styles){if(isIE){if(styles&&styles.opacity!==UNDEFINED){styles.filter="alpha(opacity="+(styles.opacity*100)+")"
}}extend(el.style,styles)
}function createElement(tag,attribs,styles,parent,nopad){var el=doc.createElement(tag);
if(attribs){extend(el,attribs)
}if(nopad){css(el,{padding:0,border:NONE,margin:0})
}if(styles){css(el,styles)
}if(parent){parent.appendChild(el)
}return el
}function extendClass(parent,members){var object=function(){};
object.prototype=new parent();
extend(object.prototype,members);
return object
}function numberFormat(number,decimals,decPoint,thousandsSep){var lang=defaultOptions.lang,n=number,c=isNaN(decimals=mathAbs(decimals))?2:decimals,d=decPoint===undefined?lang.decimalPoint:decPoint,t=thousandsSep===undefined?lang.thousandsSep:thousandsSep,s=n<0?"-":"",i=String(pInt(n=mathAbs(+n||0).toFixed(c))),j=i.length>3?i.length%3:0;
return s+(j?i.substr(0,j)+t:"")+i.substr(j).replace(/(\d{3})(?=\d)/g,"$1"+t)+(c?d+mathAbs(n-i).toFixed(c).slice(2):"")
}dateFormat=function(format,timestamp,capitalize){function pad(number){return number.toString().replace(/^([0-9])$/,"0$1")
}if(!defined(timestamp)||isNaN(timestamp)){return"Invalid date"
}format=pick(format,"%Y-%m-%d %H:%M:%S");
var date=new Date(timestamp*timeFactor),key,hours=date[getHours](),day=date[getDay](),dayOfMonth=date[getDate](),month=date[getMonth](),fullYear=date[getFullYear](),lang=defaultOptions.lang,langWeekdays=lang.weekdays,replacements={"a":langWeekdays[day].substr(0,3),"A":langWeekdays[day],"d":pad(dayOfMonth),"e":dayOfMonth,"b":lang.shortMonths[month],"B":lang.months[month],"m":pad(month+1),"y":fullYear.toString().substr(2,2),"Y":fullYear,"H":pad(hours),"I":pad((hours%12)||12),"l":(hours%12)||12,"M":pad(date[getMinutes]()),"p":hours<12?"AM":"PM","P":hours<12?"am":"pm","S":pad(date.getSeconds())};
for(key in replacements){format=format.replace("%"+key,replacements[key])
}return capitalize?format.substr(0,1).toUpperCase()+format.substr(1):format
};
function getPosition(el){var p={left:el.offsetLeft,top:el.offsetTop};
el=el.offsetParent;
while(el){p.left+=el.offsetLeft;
p.top+=el.offsetTop;
if(el!==doc.body&&el!==doc.documentElement){p.left-=el.scrollLeft;
p.top-=el.scrollTop
}el=el.offsetParent
}return p
}function ChartCounters(){this.color=0;
this.symbol=0
}ChartCounters.prototype={wrapColor:function(length){if(this.color>=length){this.color=0
}},wrapSymbol:function(length){if(this.symbol>=length){this.symbol=0
}}};
function placeBox(boxWidth,boxHeight,outerLeft,outerTop,outerWidth,outerHeight,point){var pointX=point.x,pointY=point.y,x=pointX-boxWidth+outerLeft-25,y=pointY-boxHeight+outerTop+10,alignedRight;
if(x<7){x=outerLeft+pointX+15
}if((x+boxWidth)>(outerLeft+outerWidth)){x-=(x+boxWidth)-(outerLeft+outerWidth);
y-=boxHeight;
alignedRight=true
}if(y<5){y=5;
if(alignedRight&&pointY>=y&&pointY<=(y+boxHeight)){y=pointY+boxHeight-5
}}else{if(y+boxHeight>outerTop+outerHeight){y=outerTop+outerHeight-boxHeight-5
}}return{x:x,y:y}
}function stableSort(arr,sortFunction){var length=arr.length,i;
for(i=0;
i<length;
i++){arr[i].ss_i=i
}arr.sort(function(a,b){var sortValue=sortFunction(a,b);
return sortValue===0?a.ss_i-b.ss_i:sortValue
});
for(i=0;
i<length;
i++){delete arr[i].ss_i
}}function destroyObjectProperties(obj){var n;
for(n in obj){if(obj[n]&&obj[n].destroy){obj[n].destroy()
}delete obj[n]
}}pathAnim={init:function(elem,fromD,toD){fromD=fromD||"";
var shift=elem.shift,bezier=fromD.indexOf("C")>-1,numParams=bezier?7:3,endLength,slice,i,start=fromD.split(" "),end=[].concat(toD),startBaseLine,endBaseLine,sixify=function(arr){i=arr.length;
while(i--){if(arr[i]===M){arr.splice(i+1,0,arr[i+1],arr[i+2],arr[i+1],arr[i+2])
}}};
if(bezier){sixify(start);
sixify(end)
}if(elem.isArea){startBaseLine=start.splice(start.length-6,6);
endBaseLine=end.splice(end.length-6,6)
}if(shift){end=[].concat(end).splice(0,numParams).concat(end);
elem.shift=false
}if(start.length){endLength=end.length;
while(start.length<endLength){slice=[].concat(start).splice(start.length-numParams,numParams);
if(bezier){slice[numParams-6]=slice[numParams-2];
slice[numParams-5]=slice[numParams-1]
}start=start.concat(slice)
}}if(startBaseLine){start=start.concat(startBaseLine);
end=end.concat(endBaseLine)
}return[start,end]
},step:function(start,end,pos,complete){var ret=[],i=start.length,startVal;
if(pos===1){ret=complete
}else{if(i===end.length&&pos<1){while(i--){startVal=parseFloat(start[i]);
ret[i]=isNaN(startVal)?start[i]:pos*(parseFloat(end[i]-startVal))+startVal
}}else{ret=end
}}return ret
}};
function setAnimation(animation,chart){globalAnimation=pick(animation,chart.animation)
}if(globalAdapter&&globalAdapter.init){globalAdapter.init(pathAnim)
}if(!globalAdapter&&win.jQuery){var jQ=jQuery;
each=function(arr,fn){var i=0,len=arr.length;
for(;
i<len;
i++){if(fn.call(arr[i],arr[i],i,arr)===false){return i
}}};
grep=jQ.grep;
map=function(arr,fn){var results=[],i=0,len=arr.length;
for(;
i<len;
i++){results[i]=fn.call(arr[i],arr[i],i,arr)
}return results
};
merge=function(){var args=arguments;
return jQ.extend(true,null,args[0],args[1],args[2],args[3])
};
addEvent=function(el,event,fn){jQ(el).bind(event,fn)
};
removeEvent=function(el,eventType,handler){var func=doc.removeEventListener?"removeEventListener":"detachEvent";
if(doc[func]&&!el[func]){el[func]=function(){}
}jQ(el).unbind(eventType,handler)
};
fireEvent=function(el,type,eventArguments,defaultFunction){var event=jQ.Event(type),detachedType="detached"+type;
extend(event,eventArguments);
if(el[type]){el[detachedType]=el[type];
el[type]=null
}jQ(el).trigger(event);
if(el[detachedType]){el[type]=el[detachedType];
el[detachedType]=null
}if(defaultFunction&&!event.isDefaultPrevented()){defaultFunction(event)
}};
animate=function(el,params,options){var $el=jQ(el);
if(params.d){el.toD=params.d;
params.d=1
}$el.stop();
$el.animate(params,options)
};
stop=function(el){jQ(el).stop()
};
jQ.extend(jQ.easing,{easeOutQuad:function(x,t,b,c,d){return -c*(t/=d)*(t-2)+b
}});
var oldStepDefault=jQuery.fx.step._default,oldCur=jQuery.fx.prototype.cur;
jQ.fx.step._default=function(fx){var elem=fx.elem;
if(elem.attr){elem.attr(fx.prop,fx.now)
}else{oldStepDefault.apply(this,arguments)
}};
jQ.fx.step.d=function(fx){var elem=fx.elem;
if(!fx.started){var ends=pathAnim.init(elem,elem.d,elem.toD);
fx.start=ends[0];
fx.end=ends[1];
fx.started=true
}elem.attr("d",pathAnim.step(fx.start,fx.end,fx.pos,elem.toD))
};
jQ.fx.prototype.cur=function(){var elem=this.elem,r;
if(elem.attr){r=elem.attr(this.prop)
}else{r=oldCur.apply(this,arguments)
}return r
}
}function setTimeMethods(){var useUTC=defaultOptions.global.useUTC;
makeTime=useUTC?Date.UTC:function(year,month,date,hours,minutes,seconds){return new Date(year,month,pick(date,1),pick(hours,0),pick(minutes,0),pick(seconds,0)).getTime()
};
getMinutes=useUTC?"getUTCMinutes":"getMinutes";
getHours=useUTC?"getUTCHours":"getHours";
getDay=useUTC?"getUTCDay":"getDay";
getDate=useUTC?"getUTCDate":"getDate";
getMonth=useUTC?"getUTCMonth":"getMonth";
getFullYear=useUTC?"getUTCFullYear":"getFullYear";
setMinutes=useUTC?"setUTCMinutes":"setMinutes";
setHours=useUTC?"setUTCHours":"setHours";
setDate=useUTC?"setUTCDate":"setDate";
setMonth=useUTC?"setUTCMonth":"setMonth";
setFullYear=useUTC?"setUTCFullYear":"setFullYear"
}function setOptions(options){defaultOptions=merge(defaultOptions,options);
setTimeMethods();
return defaultOptions
}function getOptions(){return defaultOptions
}function discardElement(element){if(!garbageBin){garbageBin=createElement(DIV)
}if(element){garbageBin.appendChild(element)
}garbageBin.innerHTML=""
}var defaultLabelOptions={enabled:true,align:"center",x:0,y:15,style:{color:"#666",fontSize:"11px",lineHeight:"14px"}};
defaultOptions={colors:["#4572A7","#AA4643","#89A54E","#80699B","#3D96AE","#DB843D","#92A8CD","#A47D7C","#B5CA92"],symbols:["circle","diamond","square","triangle","triangle-down"],lang:{loading:"Loading...",months:["January","February","March","April","May","June","July","August","September","October","November","December"],shortMonths:["Jan","Feb","Mar","Apr","May","June","Jul","Aug","Sep","Oct","Nov","Dec"],weekdays:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],decimalPoint:".",resetZoom:"Reset zoom",resetZoomTitle:"Reset zoom level 1:1",thousandsSep:","},global:{useUTC:true},chart:{borderColor:"#4572A7",borderRadius:5,defaultSeriesType:"line",ignoreHiddenSeries:true,spacingTop:10,spacingRight:10,spacingBottom:15,spacingLeft:10,style:{fontFamily:'"Lucida Grande", "Lucida Sans Unicode", Verdana, Arial, Helvetica, sans-serif',fontSize:"12px"},backgroundColor:"#FFFFFF",plotBorderColor:"#C0C0C0"},title:{text:"Chart title",align:"center",y:15,style:{color:"#3E576F",fontSize:"16px"}},subtitle:{text:"",align:"center",y:30,style:{color:"#6D869F"}},plotOptions:{line:{allowPointSelect:false,showCheckbox:false,animation:{duration:1000},events:{},lineWidth:2,shadow:true,marker:{enabled:true,lineWidth:0,radius:4,lineColor:"#FFFFFF",states:{hover:{},select:{fillColor:"#FFFFFF",lineColor:"#000000",lineWidth:2}}},point:{events:{}},dataLabels:merge(defaultLabelOptions,{enabled:false,y:-6,formatter:function(){return this.y
}}),showInLegend:true,states:{hover:{marker:{}},select:{marker:{}}},stickyTracking:true}},labels:{style:{position:ABSOLUTE,color:"#3E576F"}},legend:{enabled:true,align:"center",layout:"horizontal",labelFormatter:function(){return this.name
},borderWidth:1,borderColor:"#909090",borderRadius:5,shadow:false,style:{padding:"5px"},itemStyle:{cursor:"pointer",color:"#3E576F"},itemHoverStyle:{cursor:"pointer",color:"#000000"},itemHiddenStyle:{color:"#C0C0C0"},itemCheckboxStyle:{position:ABSOLUTE,width:"13px",height:"13px"},symbolWidth:16,symbolPadding:5,verticalAlign:"bottom",x:0,y:0},loading:{hideDuration:100,labelStyle:{fontWeight:"bold",position:RELATIVE,top:"1em"},showDuration:100,style:{position:ABSOLUTE,backgroundColor:"white",opacity:0.5,textAlign:"center"}},tooltip:{enabled:true,backgroundColor:"rgba(255, 255, 255, .85)",borderWidth:2,borderRadius:5,shadow:true,snap:hasTouch?25:10,style:{color:"#333333",fontSize:"12px",padding:"5px",whiteSpace:"nowrap"}},toolbar:{itemStyle:{color:"#4572A7",cursor:"pointer"}},credits:{enabled:true,text:"Highcharts.com",href:"http://www.highcharts.com",position:{align:"right",x:-10,verticalAlign:"bottom",y:-5},style:{cursor:"pointer",color:"#909090",fontSize:"10px"}}};
var defaultXAxisOptions={dateTimeLabelFormats:{second:"%H:%M:%S",minute:"%H:%M",hour:"%H:%M",day:"%e. %b",week:"%e. %b",month:"%b '%y",year:"%Y"},endOnTick:false,gridLineColor:"#C0C0C0",labels:defaultLabelOptions,lineColor:"#C0D0E0",lineWidth:1,max:null,min:null,minPadding:0.01,maxPadding:0.01,minorGridLineColor:"#E0E0E0",minorGridLineWidth:1,minorTickColor:"#A0A0A0",minorTickLength:2,minorTickPosition:"outside",startOfWeek:1,startOnTick:false,tickColor:"#C0D0E0",tickLength:5,tickmarkPlacement:"between",tickPixelInterval:100,tickPosition:"outside",tickWidth:1,title:{align:"middle",style:{color:"#6D869F",fontWeight:"bold"}},type:"linear"},defaultYAxisOptions=merge(defaultXAxisOptions,{endOnTick:true,gridLineWidth:1,tickPixelInterval:72,showLastLabel:true,labels:{align:"right",x:-8,y:3},lineWidth:0,maxPadding:0.05,minPadding:0.05,startOnTick:true,tickWidth:0,title:{rotation:270,text:"Y-values"},stackLabels:{enabled:false,formatter:function(){return this.total
},style:defaultLabelOptions.style}}),defaultLeftAxisOptions={labels:{align:"right",x:-8,y:null},title:{rotation:270}},defaultRightAxisOptions={labels:{align:"left",x:8,y:null},title:{rotation:90}},defaultBottomAxisOptions={labels:{align:"center",x:0,y:14},title:{rotation:0}},defaultTopAxisOptions=merge(defaultBottomAxisOptions,{labels:{y:-5}});
var defaultPlotOptions=defaultOptions.plotOptions,defaultSeriesOptions=defaultPlotOptions.line;
defaultPlotOptions.spline=merge(defaultSeriesOptions);
defaultPlotOptions.scatter=merge(defaultSeriesOptions,{lineWidth:0,states:{hover:{lineWidth:0}}});
defaultPlotOptions.area=merge(defaultSeriesOptions,{});
defaultPlotOptions.areaspline=merge(defaultPlotOptions.area);
defaultPlotOptions.column=merge(defaultSeriesOptions,{borderColor:"#FFFFFF",borderWidth:1,borderRadius:0,groupPadding:0.2,marker:null,pointPadding:0.1,minPointLength:0,states:{hover:{brightness:0.1,shadow:false},select:{color:"#C0C0C0",borderColor:"#000000",shadow:false}},dataLabels:{y:null,verticalAlign:null}});
defaultPlotOptions.bar=merge(defaultPlotOptions.column,{dataLabels:{align:"left",x:5,y:0}});
defaultPlotOptions.pie=merge(defaultSeriesOptions,{borderColor:"#FFFFFF",borderWidth:1,center:["50%","50%"],colorByPoint:true,dataLabels:{distance:30,enabled:true,formatter:function(){return this.point.name
},y:5},legendType:"point",marker:null,size:"75%",showInLegend:false,slicedOffset:10,states:{hover:{brightness:0.1,shadow:false}}});
setTimeMethods();
var Color=function(input){var rgba=[],result;
function init(input){result=/rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]?(?:\.[0-9]+)?)\s*\)/.exec(input);
if(result){rgba=[pInt(result[1]),pInt(result[2]),pInt(result[3]),parseFloat(result[4],10)]
}else{result=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(input);
if(result){rgba=[pInt(result[1],16),pInt(result[2],16),pInt(result[3],16),1]
}}}function get(format){var ret;
if(rgba&&!isNaN(rgba[0])){if(format==="rgb"){ret="rgb("+rgba[0]+","+rgba[1]+","+rgba[2]+")"
}else{if(format==="a"){ret=rgba[3]
}else{ret="rgba("+rgba.join(",")+")"
}}}else{ret=input
}return ret
}function brighten(alpha){if(isNumber(alpha)&&alpha!==0){var i;
for(i=0;
i<3;
i++){rgba[i]+=pInt(alpha*255);
if(rgba[i]<0){rgba[i]=0
}if(rgba[i]>255){rgba[i]=255
}}}return this
}function setOpacity(alpha){rgba[3]=alpha;
return this
}init(input);
return{get:get,brighten:brighten,setOpacity:setOpacity}
};
function SVGElement(){}SVGElement.prototype={init:function(renderer,nodeName){this.element=doc.createElementNS(SVG_NS,nodeName);
this.renderer=renderer
},animate:function(params,options,complete){var animOptions=pick(options,globalAnimation,true);
if(animOptions){animOptions=merge(animOptions);
if(complete){animOptions.complete=complete
}animate(this,params,animOptions)
}else{this.attr(params);
if(complete){complete()
}}},attr:function(hash,val){var key,value,i,child,element=this.element,nodeName=element.nodeName,renderer=this.renderer,skipAttr,shadows=this.shadows,htmlNode=this.htmlNode,hasSetSymbolSize,ret=this;
if(isString(hash)&&defined(val)){key=hash;
hash={};
hash[key]=val
}if(isString(hash)){key=hash;
if(nodeName==="circle"){key={x:"cx",y:"cy"}[key]||key
}else{if(key==="strokeWidth"){key="stroke-width"
}}ret=attr(element,key)||this[key]||0;
if(key!=="d"&&key!=="visibility"){ret=parseFloat(ret)
}}else{for(key in hash){skipAttr=false;
value=hash[key];
if(key==="d"){if(value&&value.join){value=value.join(" ")
}if(/(NaN| {2}|^$)/.test(value)){value="M 0 0"
}this.d=value
}else{if(key==="x"&&nodeName==="text"){for(i=0;
i<element.childNodes.length;
i++){child=element.childNodes[i];
if(attr(child,"x")===attr(element,"x")){attr(child,"x",value)
}}if(this.rotation){attr(element,"transform","rotate("+this.rotation+" "+value+" "+pInt(hash.y||attr(element,"y"))+")")
}}else{if(key==="fill"){value=renderer.color(value,element,key)
}else{if(nodeName==="circle"&&(key==="x"||key==="y")){key={x:"cx",y:"cy"}[key]||key
}else{if(key==="translateX"||key==="translateY"||key==="rotation"||key==="verticalAlign"){this[key]=value;
this.updateTransform();
skipAttr=true
}else{if(key==="stroke"){value=renderer.color(value,element,key)
}else{if(key==="dashstyle"){key="stroke-dasharray";
value=value&&value.toLowerCase();
if(value==="solid"){value=NONE
}else{if(value){value=value.replace("shortdashdotdot","3,1,1,1,1,1,").replace("shortdashdot","3,1,1,1").replace("shortdot","1,1,").replace("shortdash","3,1,").replace("longdash","8,3,").replace(/dot/g,"1,3,").replace("dash","4,3,").replace(/,$/,"").split(",");
i=value.length;
while(i--){value[i]=pInt(value[i])*hash["stroke-width"]
}value=value.join(",")
}}}else{if(key==="isTracker"){this[key]=value
}else{if(key==="width"){value=pInt(value)
}else{if(key==="align"){key="text-anchor";
value={left:"start",center:"middle",right:"end"}[value]
}else{if(key==="title"){var title=doc.createElementNS(SVG_NS,"title");
title.appendChild(doc.createTextNode(value));
element.appendChild(title)
}}}}}}}}}}}if(key==="strokeWidth"){key="stroke-width"
}if(isWebKit&&key==="stroke-width"&&value===0){value=0.000001
}if(this.symbolName&&/^(x|y|r|start|end|innerR)/.test(key)){if(!hasSetSymbolSize){this.symbolAttr(hash);
hasSetSymbolSize=true
}skipAttr=true
}if(shadows&&/^(width|height|visibility|x|y|d)$/.test(key)){i=shadows.length;
while(i--){attr(shadows[i],key,value)
}}if((key==="width"||key==="height")&&nodeName==="rect"&&value<0){value=0
}if(key==="text"){this.textStr=value;
if(this.added){renderer.buildText(this)
}}else{if(!skipAttr){attr(element,key,value)
}}if(htmlNode&&(key==="x"||key==="y"||key==="translateX"||key==="translateY"||key==="visibility")){var wrapper=this,bBox,arr=htmlNode.length?htmlNode:[this],length=arr.length,itemWrapper,j;
for(j=0;
j<length;
j++){itemWrapper=arr[j];
bBox=itemWrapper.getBBox();
htmlNode=itemWrapper.htmlNode;
css(htmlNode,extend(wrapper.styles,{left:(bBox.x+(wrapper.translateX||0))+PX,top:(bBox.y+(wrapper.translateY||0))+PX}));
if(key==="visibility"){css(htmlNode,{visibility:value})
}}}}}return ret
},symbolAttr:function(hash){var wrapper=this;
each(["x","y","r","start","end","width","height","innerR"],function(key){wrapper[key]=pick(hash[key],wrapper[key])
});
wrapper.attr({d:wrapper.renderer.symbols[wrapper.symbolName](mathRound(wrapper.x*2)/2,mathRound(wrapper.y*2)/2,wrapper.r,{start:wrapper.start,end:wrapper.end,width:wrapper.width,height:wrapper.height,innerR:wrapper.innerR})})
},clip:function(clipRect){return this.attr("clip-path","url("+this.renderer.url+"#"+clipRect.id+")")
},crisp:function(strokeWidth,x,y,width,height){var wrapper=this,key,attr={},values={},normalizer;
strokeWidth=strokeWidth||wrapper.strokeWidth||0;
normalizer=strokeWidth%2/2;
values.x=mathFloor(x||wrapper.x||0)+normalizer;
values.y=mathFloor(y||wrapper.y||0)+normalizer;
values.width=mathFloor((width||wrapper.width||0)-2*normalizer);
values.height=mathFloor((height||wrapper.height||0)-2*normalizer);
values.strokeWidth=strokeWidth;
for(key in values){if(wrapper[key]!==values[key]){wrapper[key]=attr[key]=values[key]
}}return attr
},css:function(styles){var elemWrapper=this,elem=elemWrapper.element,textWidth=styles&&styles.width&&elem.nodeName==="text",n,serializedCss="",hyphenate=function(a,b){return"-"+b.toLowerCase()
};
if(styles&&styles.color){styles.fill=styles.color
}styles=extend(elemWrapper.styles,styles);
elemWrapper.styles=styles;
if(isIE&&!hasSVG){if(textWidth){delete styles.width
}css(elemWrapper.element,styles)
}else{for(n in styles){serializedCss+=n.replace(/([A-Z])/g,hyphenate)+":"+styles[n]+";"
}elemWrapper.attr({style:serializedCss})
}if(textWidth&&elemWrapper.added){elemWrapper.renderer.buildText(elemWrapper)
}return elemWrapper
},on:function(eventType,handler){var fn=handler;
if(hasTouch&&eventType==="click"){eventType="touchstart";
fn=function(e){e.preventDefault();
handler()
}
}this.element["on"+eventType]=fn;
return this
},translate:function(x,y){return this.attr({translateX:x,translateY:y})
},invert:function(){var wrapper=this;
wrapper.inverted=true;
wrapper.updateTransform();
return wrapper
},updateTransform:function(){var wrapper=this,translateX=wrapper.translateX||0,translateY=wrapper.translateY||0,inverted=wrapper.inverted,rotation=wrapper.rotation,transform=[];
if(inverted){translateX+=wrapper.attr("width");
translateY+=wrapper.attr("height")
}if(translateX||translateY){transform.push("translate("+translateX+","+translateY+")")
}if(inverted){transform.push("rotate(90) scale(-1,1)")
}else{if(rotation){transform.push("rotate("+rotation+" "+wrapper.x+" "+wrapper.y+")")
}}if(transform.length){attr(wrapper.element,"transform",transform.join(" "))
}},toFront:function(){var element=this.element;
element.parentNode.appendChild(element);
return this
},align:function(alignOptions,alignByTranslate,box){var elemWrapper=this;
if(!alignOptions){alignOptions=elemWrapper.alignOptions;
alignByTranslate=elemWrapper.alignByTranslate
}else{elemWrapper.alignOptions=alignOptions;
elemWrapper.alignByTranslate=alignByTranslate;
if(!box){elemWrapper.renderer.alignedObjects.push(elemWrapper)
}}box=pick(box,elemWrapper.renderer);
var align=alignOptions.align,vAlign=alignOptions.verticalAlign,x=(box.x||0)+(alignOptions.x||0),y=(box.y||0)+(alignOptions.y||0),attribs={};
if(/^(right|center)$/.test(align)){x+=(box.width-(alignOptions.width||0))/{right:1,center:2}[align]
}attribs[alignByTranslate?"translateX":"x"]=mathRound(x);
if(/^(bottom|middle)$/.test(vAlign)){y+=(box.height-(alignOptions.height||0))/({bottom:1,middle:2}[vAlign]||1)
}attribs[alignByTranslate?"translateY":"y"]=mathRound(y);
elemWrapper[elemWrapper.placed?"animate":"attr"](attribs);
elemWrapper.placed=true;
elemWrapper.alignAttr=attribs;
return elemWrapper
},getBBox:function(){var bBox,width,height,rotation=this.rotation,rad=rotation*deg2rad;
try{bBox=extend({},this.element.getBBox())
}catch(e){bBox={width:0,height:0}
}width=bBox.width;
height=bBox.height;
if(rotation){bBox.width=mathAbs(height*mathSin(rad))+mathAbs(width*mathCos(rad));
bBox.height=mathAbs(height*mathCos(rad))+mathAbs(width*mathSin(rad))
}return bBox
},show:function(){return this.attr({visibility:VISIBLE})
},hide:function(){return this.attr({visibility:HIDDEN})
},add:function(parent){var renderer=this.renderer,parentWrapper=parent||renderer,parentNode=parentWrapper.element||renderer.box,childNodes=parentNode.childNodes,element=this.element,zIndex=attr(element,"zIndex"),otherElement,otherZIndex,i;
this.parentInverted=parent&&parent.inverted;
if(this.textStr!==undefined){renderer.buildText(this)
}if(parent&&this.htmlNode){if(!parent.htmlNode){parent.htmlNode=[]
}parent.htmlNode.push(this)
}if(zIndex){parentWrapper.handleZ=true;
zIndex=pInt(zIndex)
}if(parentWrapper.handleZ){for(i=0;
i<childNodes.length;
i++){otherElement=childNodes[i];
otherZIndex=attr(otherElement,"zIndex");
if(otherElement!==element&&(pInt(otherZIndex)>zIndex||(!defined(zIndex)&&defined(otherZIndex)))){parentNode.insertBefore(element,otherElement);
return this
}}}parentNode.appendChild(element);
this.added=true;
return this
},destroy:function(){var wrapper=this,element=wrapper.element||{},shadows=wrapper.shadows,parentNode=element.parentNode,key,i;
element.onclick=element.onmouseout=element.onmouseover=element.onmousemove=null;
stop(wrapper);
if(wrapper.clipPath){wrapper.clipPath=wrapper.clipPath.destroy()
}if(wrapper.stops){for(i=0;
i<wrapper.stops.length;
i++){wrapper.stops[i]=wrapper.stops[i].destroy()
}wrapper.stops=null
}if(parentNode){parentNode.removeChild(element)
}if(shadows){each(shadows,function(shadow){parentNode=shadow.parentNode;
if(parentNode){parentNode.removeChild(shadow)
}})
}erase(wrapper.renderer.alignedObjects,wrapper);
for(key in wrapper){delete wrapper[key]
}return null
},empty:function(){var element=this.element,childNodes=element.childNodes,i=childNodes.length;
while(i--){element.removeChild(childNodes[i])
}},shadow:function(apply,group){var shadows=[],i,shadow,element=this.element,transform=this.parentInverted?"(-1,-1)":"(1,1)";
if(apply){for(i=1;
i<=3;
i++){shadow=element.cloneNode(0);
attr(shadow,{"isShadow":"true","stroke":"rgb(0, 0, 0)","stroke-opacity":0.05*i,"stroke-width":7-2*i,"transform":"translate"+transform,"fill":NONE});
if(group){group.element.appendChild(shadow)
}else{element.parentNode.insertBefore(shadow,element)
}shadows.push(shadow)
}this.shadows=shadows
}return this
}};
var SVGRenderer=function(){this.init.apply(this,arguments)
};
SVGRenderer.prototype={Element:SVGElement,init:function(container,width,height,forExport){var renderer=this,loc=location,boxWrapper;
boxWrapper=renderer.createElement("svg").attr({xmlns:SVG_NS,version:"1.1"});
container.appendChild(boxWrapper.element);
renderer.box=boxWrapper.element;
renderer.boxWrapper=boxWrapper;
renderer.alignedObjects=[];
renderer.url=isIE?"":loc.href.replace(/#.*?$/,"");
renderer.defs=this.createElement("defs").add();
renderer.forExport=forExport;
renderer.gradients=[];
renderer.setSize(width,height,false)
},destroy:function(){var renderer=this,i,rendererGradients=renderer.gradients,rendererDefs=renderer.defs;
renderer.box=null;
renderer.boxWrapper=renderer.boxWrapper.destroy();
if(rendererGradients){for(i=0;
i<rendererGradients.length;
i++){renderer.gradients[i]=rendererGradients[i].destroy()
}renderer.gradients=null
}if(rendererDefs){renderer.defs=rendererDefs.destroy()
}renderer.alignedObjects=null;
return null
},createElement:function(nodeName){var wrapper=new this.Element();
wrapper.init(this,nodeName);
return wrapper
},buildText:function(wrapper){var textNode=wrapper.element,lines=pick(wrapper.textStr,"").toString().replace(/<(b|strong)>/g,'<span style="font-weight:bold">').replace(/<(i|em)>/g,'<span style="font-style:italic">').replace(/<a/g,"<span").replace(/<\/(b|strong|i|em|a)>/g,"</span>").split(/<br.*?>/g),childNodes=textNode.childNodes,styleRegex=/style="([^"]+)"/,hrefRegex=/href="([^"]+)"/,parentX=attr(textNode,"x"),textStyles=wrapper.styles,renderAsHtml=textStyles&&wrapper.useHTML&&!this.forExport,htmlNode=wrapper.htmlNode,width=textStyles&&pInt(textStyles.width),textLineHeight=textStyles&&textStyles.lineHeight,lastLine,GET_COMPUTED_STYLE="getComputedStyle",i=childNodes.length;
while(i--){textNode.removeChild(childNodes[i])
}if(width&&!wrapper.added){this.box.appendChild(textNode)
}each(lines,function(line,lineNo){var spans,spanNo=0,lineHeight;
line=line.replace(/<span/g,"|||<span").replace(/<\/span>/g,"</span>|||");
spans=line.split("|||");
each(spans,function(span){if(span!==""||spans.length===1){var attributes={},tspan=doc.createElementNS(SVG_NS,"tspan");
if(styleRegex.test(span)){attr(tspan,"style",span.match(styleRegex)[1].replace(/(;| |^)color([ :])/,"$1fill$2"))
}if(hrefRegex.test(span)){attr(tspan,"onclick",'location.href="'+span.match(hrefRegex)[1]+'"');
css(tspan,{cursor:"pointer"})
}span=(span.replace(/<(.|\n)*?>/g,"")||" ").replace(/&lt;/g,"<").replace(/&gt;/g,">");
tspan.appendChild(doc.createTextNode(span));
if(!spanNo){attributes.x=parentX
}else{attributes.dx=3
}if(!spanNo){if(lineNo){if(!hasSVG&&wrapper.renderer.forExport){css(tspan,{display:"block"})
}lineHeight=win[GET_COMPUTED_STYLE]&&pInt(win[GET_COMPUTED_STYLE](lastLine,null).getPropertyValue("line-height"));
if(!lineHeight||isNaN(lineHeight)){lineHeight=textLineHeight||lastLine.offsetHeight||18
}attr(tspan,"dy",lineHeight)
}lastLine=tspan
}attr(tspan,attributes);
textNode.appendChild(tspan);
spanNo++;
if(width){var words=span.replace(/-/g,"- ").split(" "),tooLong,actualWidth,rest=[];
while(words.length||rest.length){actualWidth=textNode.getBBox().width;
tooLong=actualWidth>width;
if(!tooLong||words.length===1){words=rest;
rest=[];
if(words.length){tspan=doc.createElementNS(SVG_NS,"tspan");
attr(tspan,{dy:textLineHeight||16,x:parentX});
textNode.appendChild(tspan);
if(actualWidth>width){width=actualWidth
}}}else{tspan.removeChild(tspan.firstChild);
rest.unshift(words.pop())
}if(words.length){tspan.appendChild(doc.createTextNode(words.join(" ").replace(/- /g,"-")))
}}}}})
});
if(renderAsHtml){if(!htmlNode){htmlNode=wrapper.htmlNode=createElement("span",null,extend(textStyles,{position:ABSOLUTE,top:0,left:0}),this.box.parentNode)
}htmlNode.innerHTML=wrapper.textStr;
i=childNodes.length;
while(i--){childNodes[i].style.visibility=HIDDEN
}}},crispLine:function(points,width){if(points[1]===points[4]){points[1]=points[4]=mathRound(points[1])+(width%2/2)
}if(points[2]===points[5]){points[2]=points[5]=mathRound(points[2])+(width%2/2)
}return points
},path:function(path){return this.createElement("path").attr({d:path,fill:NONE})
},circle:function(x,y,r){var attr=isObject(x)?x:{x:x,y:y,r:r};
return this.createElement("circle").attr(attr)
},arc:function(x,y,r,innerR,start,end){if(isObject(x)){y=x.y;
r=x.r;
innerR=x.innerR;
start=x.start;
end=x.end;
x=x.x
}return this.symbol("arc",x||0,y||0,r||0,{innerR:innerR||0,start:start||0,end:end||0})
},rect:function(x,y,width,height,r,strokeWidth){if(isObject(x)){y=x.y;
width=x.width;
height=x.height;
r=x.r;
strokeWidth=x.strokeWidth;
x=x.x
}var wrapper=this.createElement("rect").attr({rx:r,ry:r,fill:NONE});
return wrapper.attr(wrapper.crisp(strokeWidth,x,y,mathMax(width,0),mathMax(height,0)))
},setSize:function(width,height,animate){var renderer=this,alignedObjects=renderer.alignedObjects,i=alignedObjects.length;
renderer.width=width;
renderer.height=height;
renderer.boxWrapper[pick(animate,true)?"animate":"attr"]({width:width,height:height});
while(i--){alignedObjects[i].align()
}},g:function(name){var elem=this.createElement("g");
return defined(name)?elem.attr({"class":PREFIX+name}):elem
},image:function(src,x,y,width,height){var attribs={preserveAspectRatio:NONE},elemWrapper;
if(arguments.length>1){extend(attribs,{x:x,y:y,width:width,height:height})
}elemWrapper=this.createElement("image").attr(attribs);
if(elemWrapper.element.setAttributeNS){elemWrapper.element.setAttributeNS("http://www.w3.org/1999/xlink","href",src)
}else{elemWrapper.element.setAttribute("hc-svg-href",src)
}return elemWrapper
},symbol:function(symbol,x,y,radius,options){var obj,symbolFn=this.symbols[symbol],path=symbolFn&&symbolFn(mathRound(x),mathRound(y),radius,options),imageRegex=/^url\((.*?)\)$/,imageSrc,imageSize;
if(path){obj=this.path(path);
extend(obj,{symbolName:symbol,x:x,y:y,r:radius});
if(options){extend(obj,options)
}}else{if(imageRegex.test(symbol)){var centerImage=function(img,size){img.attr({width:size[0],height:size[1]}).translate(-mathRound(size[0]/2),-mathRound(size[1]/2))
};
imageSrc=symbol.match(imageRegex)[1];
imageSize=symbolSizes[imageSrc];
obj=this.image(imageSrc).attr({x:x,y:y});
if(imageSize){centerImage(obj,imageSize)
}else{obj.attr({width:0,height:0});
createElement("img",{onload:function(){var img=this;
centerImage(obj,symbolSizes[imageSrc]=[img.width,img.height])
},src:imageSrc})
}}else{obj=this.circle(x,y,radius)
}}return obj
},symbols:{"square":function(x,y,radius){var len=0.707*radius;
return[M,x-len,y-len,L,x+len,y-len,x+len,y+len,x-len,y+len,"Z"]
},"triangle":function(x,y,radius){return[M,x,y-1.33*radius,L,x+radius,y+0.67*radius,x-radius,y+0.67*radius,"Z"]
},"triangle-down":function(x,y,radius){return[M,x,y+1.33*radius,L,x-radius,y-0.67*radius,x+radius,y-0.67*radius,"Z"]
},"diamond":function(x,y,radius){return[M,x,y-radius,L,x+radius,y,x,y+radius,x-radius,y,"Z"]
},"arc":function(x,y,radius,options){var start=options.start,end=options.end-0.000001,innerRadius=options.innerR,cosStart=mathCos(start),sinStart=mathSin(start),cosEnd=mathCos(end),sinEnd=mathSin(end),longArc=options.end-start<mathPI?0:1;
return[M,x+radius*cosStart,y+radius*sinStart,"A",radius,radius,0,longArc,1,x+radius*cosEnd,y+radius*sinEnd,L,x+innerRadius*cosEnd,y+innerRadius*sinEnd,"A",innerRadius,innerRadius,0,longArc,0,x+innerRadius*cosStart,y+innerRadius*sinStart,"Z"]
}},clipRect:function(x,y,width,height){var wrapper,id=PREFIX+idCounter++,clipPath=this.createElement("clipPath").attr({id:id}).add(this.defs);
wrapper=this.rect(x,y,width,height,0).add(clipPath);
wrapper.id=id;
wrapper.clipPath=clipPath;
return wrapper
},color:function(color,elem,prop){var colorObject,regexRgba=/^rgba/;
if(color&&color.linearGradient){var renderer=this,strLinearGradient="linearGradient",linearGradient=color[strLinearGradient],id=PREFIX+idCounter++,gradientObject,stopColor,stopOpacity;
gradientObject=renderer.createElement(strLinearGradient).attr({id:id,gradientUnits:"userSpaceOnUse",x1:linearGradient[0],y1:linearGradient[1],x2:linearGradient[2],y2:linearGradient[3]}).add(renderer.defs);
renderer.gradients.push(gradientObject);
gradientObject.stops=[];
each(color.stops,function(stop){var stopObject;
if(regexRgba.test(stop[1])){colorObject=Color(stop[1]);
stopColor=colorObject.get("rgb");
stopOpacity=colorObject.get("a")
}else{stopColor=stop[1];
stopOpacity=1
}stopObject=renderer.createElement("stop").attr({offset:stop[0],"stop-color":stopColor,"stop-opacity":stopOpacity}).add(gradientObject);
gradientObject.stops.push(stopObject)
});
return"url("+this.url+"#"+id+")"
}else{if(regexRgba.test(color)){colorObject=Color(color);
attr(elem,prop+"-opacity",colorObject.get("a"));
return colorObject.get("rgb")
}else{elem.removeAttribute(prop+"-opacity");
return color
}}},text:function(str,x,y,useHTML){var defaultChartStyle=defaultOptions.chart.style,wrapper;
x=mathRound(pick(x,0));
y=mathRound(pick(y,0));
wrapper=this.createElement("text").attr({x:x,y:y,text:str}).css({fontFamily:defaultChartStyle.fontFamily,fontSize:defaultChartStyle.fontSize});
wrapper.x=x;
wrapper.y=y;
wrapper.useHTML=useHTML;
return wrapper
}};
Renderer=SVGRenderer;
var VMLRenderer;
if(!hasSVG){var VMLElement=extendClass(SVGElement,{init:function(renderer,nodeName){var markup=["<",nodeName,' filled="f" stroked="f"'],style=["position: ",ABSOLUTE,";"];
if(nodeName==="shape"||nodeName===DIV){style.push("left:0;top:0;width:10px;height:10px;")
}if(docMode8){style.push("visibility: ",nodeName===DIV?HIDDEN:VISIBLE)
}markup.push(' style="',style.join(""),'"/>');
if(nodeName){markup=nodeName===DIV||nodeName==="span"||nodeName==="img"?markup.join(""):renderer.prepVML(markup);
this.element=createElement(markup)
}this.renderer=renderer
},add:function(parent){var wrapper=this,renderer=wrapper.renderer,element=wrapper.element,box=renderer.box,inverted=parent&&parent.inverted,parentNode=parent?parent.element||parent:box;
if(inverted){renderer.invertChild(element,parentNode)
}if(docMode8&&parentNode.gVis===HIDDEN){css(element,{visibility:HIDDEN})
}parentNode.appendChild(element);
wrapper.added=true;
if(wrapper.alignOnAdd){wrapper.updateTransform()
}return wrapper
},attr:function(hash,val){var key,value,i,element=this.element||{},elemStyle=element.style,nodeName=element.nodeName,renderer=this.renderer,symbolName=this.symbolName,childNodes,hasSetSymbolSize,shadows=this.shadows,skipAttr,ret=this;
if(isString(hash)&&defined(val)){key=hash;
hash={};
hash[key]=val
}if(isString(hash)){key=hash;
if(key==="strokeWidth"||key==="stroke-width"){ret=this.strokeweight
}else{ret=this[key]
}}else{for(key in hash){value=hash[key];
skipAttr=false;
if(symbolName&&/^(x|y|r|start|end|width|height|innerR)/.test(key)){if(!hasSetSymbolSize){this.symbolAttr(hash);
hasSetSymbolSize=true
}skipAttr=true
}else{if(key==="d"){value=value||[];
this.d=value.join(" ");
i=value.length;
var convertedPath=[];
while(i--){if(isNumber(value[i])){convertedPath[i]=mathRound(value[i]*10)-5
}else{if(value[i]==="Z"){convertedPath[i]="x"
}else{convertedPath[i]=value[i]
}}}value=convertedPath.join(" ")||"x";
element.path=value;
if(shadows){i=shadows.length;
while(i--){shadows[i].path=value
}}skipAttr=true
}else{if(key==="zIndex"||key==="visibility"){if(docMode8&&key==="visibility"&&nodeName==="DIV"){element.gVis=value;
childNodes=element.childNodes;
i=childNodes.length;
while(i--){css(childNodes[i],{visibility:value})
}if(value===VISIBLE){value=null
}}if(value){elemStyle[key]=value
}skipAttr=true
}else{if(/^(width|height)$/.test(key)){this[key]=value;
if(this.updateClipping){this[key]=value;
this.updateClipping()
}else{elemStyle[key]=value
}skipAttr=true
}else{if(/^(x|y)$/.test(key)){this[key]=value;
if(element.tagName==="SPAN"){this.updateTransform()
}else{elemStyle[{x:"left",y:"top"}[key]]=value
}}else{if(key==="class"){element.className=value
}else{if(key==="stroke"){value=renderer.color(value,element,key);
key="strokecolor"
}else{if(key==="stroke-width"||key==="strokeWidth"){element.stroked=value?true:false;
key="strokeweight";
this[key]=value;
if(isNumber(value)){value+=PX
}}else{if(key==="dashstyle"){var strokeElem=element.getElementsByTagName("stroke")[0]||createElement(renderer.prepVML(["<stroke/>"]),null,null,element);
strokeElem[key]=value||"solid";
this.dashstyle=value;
skipAttr=true
}else{if(key==="fill"){if(nodeName==="SPAN"){elemStyle.color=value
}else{element.filled=value!==NONE?true:false;
value=renderer.color(value,element,key);
key="fillcolor"
}}else{if(key==="translateX"||key==="translateY"||key==="rotation"||key==="align"){if(key==="align"){key="textAlign"
}this[key]=value;
this.updateTransform();
skipAttr=true
}else{if(key==="text"){this.bBox=null;
element.innerHTML=value;
skipAttr=true
}}}}}}}}}}}}if(shadows&&key==="visibility"){i=shadows.length;
while(i--){shadows[i].style[key]=value
}}if(!skipAttr){if(docMode8){element[key]=value
}else{attr(element,key,value)
}}}}return ret
},clip:function(clipRect){var wrapper=this,clipMembers=clipRect.members;
clipMembers.push(wrapper);
wrapper.destroyClip=function(){erase(clipMembers,wrapper)
};
return wrapper.css(clipRect.getCSS(wrapper.inverted))
},css:function(styles){var wrapper=this,element=wrapper.element,textWidth=styles&&element.tagName==="SPAN"&&styles.width;
if(textWidth){delete styles.width;
wrapper.textWidth=textWidth;
wrapper.updateTransform()
}wrapper.styles=extend(wrapper.styles,styles);
css(wrapper.element,styles);
return wrapper
},destroy:function(){var wrapper=this;
if(wrapper.destroyClip){wrapper.destroyClip()
}return SVGElement.prototype.destroy.apply(wrapper)
},empty:function(){var element=this.element,childNodes=element.childNodes,i=childNodes.length,node;
while(i--){node=childNodes[i];
node.parentNode.removeChild(node)
}},getBBox:function(){var wrapper=this,element=wrapper.element,bBox=wrapper.bBox;
if(!bBox){if(element.nodeName==="text"){element.style.position=ABSOLUTE
}bBox=wrapper.bBox={x:element.offsetLeft,y:element.offsetTop,width:element.offsetWidth,height:element.offsetHeight}
}return bBox
},on:function(eventType,handler){this.element["on"+eventType]=function(){var evt=win.event;
evt.target=evt.srcElement;
handler(evt)
};
return this
},updateTransform:function(){if(!this.added){this.alignOnAdd=true;
return
}var wrapper=this,elem=wrapper.element,translateX=wrapper.translateX||0,translateY=wrapper.translateY||0,x=wrapper.x||0,y=wrapper.y||0,align=wrapper.textAlign||"left",alignCorrection={left:0,center:0.5,right:1}[align],nonLeft=align&&align!=="left";
if(translateX||translateY){wrapper.css({marginLeft:translateX,marginTop:translateY})
}if(wrapper.inverted){each(elem.childNodes,function(child){wrapper.renderer.invertChild(child,elem)
})
}if(elem.tagName==="SPAN"){var width,height,rotation=wrapper.rotation,lineHeight,radians=0,costheta=1,sintheta=0,quad,textWidth=pInt(wrapper.textWidth),xCorr=wrapper.xCorr||0,yCorr=wrapper.yCorr||0,currentTextTransform=[rotation,align,elem.innerHTML,wrapper.textWidth].join(",");
if(currentTextTransform!==wrapper.cTT){if(defined(rotation)){radians=rotation*deg2rad;
costheta=mathCos(radians);
sintheta=mathSin(radians);
css(elem,{filter:rotation?["progid:DXImageTransform.Microsoft.Matrix(M11=",costheta,", M12=",-sintheta,", M21=",sintheta,", M22=",costheta,", sizingMethod='auto expand')"].join(""):NONE})
}width=elem.offsetWidth;
height=elem.offsetHeight;
if(width>textWidth){css(elem,{width:textWidth+PX,display:"block",whiteSpace:"normal"});
width=textWidth
}lineHeight=mathRound((pInt(elem.style.fontSize)||12)*1.2);
xCorr=costheta<0&&-width;
yCorr=sintheta<0&&-height;
quad=costheta*sintheta<0;
xCorr+=sintheta*lineHeight*(quad?1-alignCorrection:alignCorrection);
yCorr-=costheta*lineHeight*(rotation?(quad?alignCorrection:1-alignCorrection):1);
if(nonLeft){xCorr-=width*alignCorrection*(costheta<0?-1:1);
if(rotation){yCorr-=height*alignCorrection*(sintheta<0?-1:1)
}css(elem,{textAlign:align})
}wrapper.xCorr=xCorr;
wrapper.yCorr=yCorr
}css(elem,{left:x+xCorr,top:y+yCorr});
wrapper.cTT=currentTextTransform
}},shadow:function(apply,group){var shadows=[],i,element=this.element,renderer=this.renderer,shadow,elemStyle=element.style,markup,path=element.path;
if(path&&typeof path.value!=="string"){path="x"
}if(apply){for(i=1;
i<=3;
i++){markup=['<shape isShadow="true" strokeweight="',(7-2*i),'" filled="false" path="',path,'" coordsize="100,100" style="',element.style.cssText,'" />'];
shadow=createElement(renderer.prepVML(markup),null,{left:pInt(elemStyle.left)+1,top:pInt(elemStyle.top)+1});
markup=['<stroke color="black" opacity="',(0.05*i),'"/>'];
createElement(renderer.prepVML(markup),null,null,shadow);
if(group){group.element.appendChild(shadow)
}else{element.parentNode.insertBefore(shadow,element)
}shadows.push(shadow)
}this.shadows=shadows
}return this
}});
VMLRenderer=function(){this.init.apply(this,arguments)
};
VMLRenderer.prototype=merge(SVGRenderer.prototype,{Element:VMLElement,isIE8:userAgent.indexOf("MSIE 8.0")>-1,init:function(container,width,height){var renderer=this,boxWrapper;
renderer.alignedObjects=[];
boxWrapper=renderer.createElement(DIV);
container.appendChild(boxWrapper.element);
renderer.box=boxWrapper.element;
renderer.boxWrapper=boxWrapper;
renderer.setSize(width,height,false);
if(!doc.namespaces.hcv){doc.namespaces.add("hcv","urn:schemas-microsoft-com:vml");
doc.createStyleSheet().cssText="hcv\\:fill, hcv\\:path, hcv\\:shape, hcv\\:stroke"+"{ behavior:url(#default#VML); display: inline-block; } "
}},clipRect:function(x,y,width,height){var clipRect=this.createElement();
return extend(clipRect,{members:[],left:x,top:y,width:width,height:height,getCSS:function(inverted){var rect=this,top=rect.top,left=rect.left,right=left+rect.width,bottom=top+rect.height,ret={clip:"rect("+mathRound(inverted?left:top)+"px,"+mathRound(inverted?bottom:right)+"px,"+mathRound(inverted?right:bottom)+"px,"+mathRound(inverted?top:left)+"px)"};
if(!inverted&&docMode8){extend(ret,{width:right+PX,height:bottom+PX})
}return ret
},updateClipping:function(){each(clipRect.members,function(member){member.css(clipRect.getCSS(member.inverted))
})
}})
},color:function(color,elem,prop){var colorObject,regexRgba=/^rgba/,markup;
if(color&&color.linearGradient){var stopColor,stopOpacity,linearGradient=color.linearGradient,angle,color1,opacity1,color2,opacity2;
each(color.stops,function(stop,i){if(regexRgba.test(stop[1])){colorObject=Color(stop[1]);
stopColor=colorObject.get("rgb");
stopOpacity=colorObject.get("a")
}else{stopColor=stop[1];
stopOpacity=1
}if(!i){color1=stopColor;
opacity1=stopOpacity
}else{color2=stopColor;
opacity2=stopOpacity
}});
angle=90-math.atan((linearGradient[3]-linearGradient[1])/(linearGradient[2]-linearGradient[0]))*180/mathPI;
markup=["<",prop,' colors="0% ',color1,",100% ",color2,'" angle="',angle,'" opacity="',opacity2,'" o:opacity2="',opacity1,'" type="gradient" focus="100%" />'];
createElement(this.prepVML(markup),null,null,elem)
}else{if(regexRgba.test(color)&&elem.tagName!=="IMG"){colorObject=Color(color);
markup=["<",prop,' opacity="',colorObject.get("a"),'"/>'];
createElement(this.prepVML(markup),null,null,elem);
return colorObject.get("rgb")
}else{var strokeNodes=elem.getElementsByTagName(prop);
if(strokeNodes.length){strokeNodes[0].opacity=1
}return color
}}},prepVML:function(markup){var vmlStyle="display:inline-block;behavior:url(#default#VML);",isIE8=this.isIE8;
markup=markup.join("");
if(isIE8){markup=markup.replace("/>",' xmlns="urn:schemas-microsoft-com:vml" />');
if(markup.indexOf('style="')===-1){markup=markup.replace("/>",' style="'+vmlStyle+'" />')
}else{markup=markup.replace('style="','style="'+vmlStyle)
}}else{markup=markup.replace("<","<hcv:")
}return markup
},text:function(str,x,y){var defaultChartStyle=defaultOptions.chart.style;
return this.createElement("span").attr({text:str,x:mathRound(x),y:mathRound(y)}).css({whiteSpace:"nowrap",fontFamily:defaultChartStyle.fontFamily,fontSize:defaultChartStyle.fontSize})
},path:function(path){return this.createElement("shape").attr({coordsize:"100 100",d:path})
},circle:function(x,y,r){return this.symbol("circle").attr({x:x,y:y,r:r})
},g:function(name){var wrapper,attribs;
if(name){attribs={"className":PREFIX+name,"class":PREFIX+name}
}wrapper=this.createElement(DIV).attr(attribs);
return wrapper
},image:function(src,x,y,width,height){var obj=this.createElement("img").attr({src:src});
if(arguments.length>1){obj.css({left:x,top:y,width:width,height:height})
}return obj
},rect:function(x,y,width,height,r,strokeWidth){if(isObject(x)){y=x.y;
width=x.width;
height=x.height;
r=x.r;
strokeWidth=x.strokeWidth;
x=x.x
}var wrapper=this.symbol("rect");
wrapper.r=r;
return wrapper.attr(wrapper.crisp(strokeWidth,x,y,mathMax(width,0),mathMax(height,0)))
},invertChild:function(element,parentNode){var parentStyle=parentNode.style;
css(element,{flip:"x",left:pInt(parentStyle.width)-10,top:pInt(parentStyle.height)-10,rotation:-90})
},symbols:{arc:function(x,y,radius,options){var start=options.start,end=options.end,cosStart=mathCos(start),sinStart=mathSin(start),cosEnd=mathCos(end),sinEnd=mathSin(end),innerRadius=options.innerR,circleCorrection=0.07/radius,innerCorrection=(innerRadius&&0.1/innerRadius)||0;
if(end-start===0){return["x"]
}else{if(2*mathPI-end+start<circleCorrection){cosEnd=-circleCorrection
}else{if(end-start<innerCorrection){cosEnd=mathCos(start+innerCorrection)
}}}return["wa",x-radius,y-radius,x+radius,y+radius,x+radius*cosStart,y+radius*sinStart,x+radius*cosEnd,y+radius*sinEnd,"at",x-innerRadius,y-innerRadius,x+innerRadius,y+innerRadius,x+innerRadius*cosEnd,y+innerRadius*sinEnd,x+innerRadius*cosStart,y+innerRadius*sinStart,"x","e"]
},circle:function(x,y,r){return["wa",x-r,y-r,x+r,y+r,x+r,y,x+r,y,"e"]
},rect:function(left,top,r,options){if(!defined(options)){return[]
}var width=options.width,height=options.height,right=left+width,bottom=top+height;
r=mathMin(r,width,height);
return[M,left+r,top,L,right-r,top,"wa",right-2*r,top,right,top+2*r,right-r,top,right,top+r,L,right,bottom-r,"wa",right-2*r,bottom-2*r,right,bottom,right,bottom-r,right-r,bottom,L,left+r,bottom,"wa",left,bottom-2*r,left+2*r,bottom,left+r,bottom,left,bottom-r,L,left,top+r,"wa",left,top,left+2*r,top+2*r,left,top+r,left+r,top,"x","e"]
}}});
Renderer=VMLRenderer
}function Chart(options,callback){defaultXAxisOptions=merge(defaultXAxisOptions,defaultOptions.xAxis);
defaultYAxisOptions=merge(defaultYAxisOptions,defaultOptions.yAxis);
defaultOptions.xAxis=defaultOptions.yAxis=null;
options=merge(defaultOptions,options);
var optionsChart=options.chart,optionsMargin=optionsChart.margin,margin=isObject(optionsMargin)?optionsMargin:[optionsMargin,optionsMargin,optionsMargin,optionsMargin],optionsMarginTop=pick(optionsChart.marginTop,margin[0]),optionsMarginRight=pick(optionsChart.marginRight,margin[1]),optionsMarginBottom=pick(optionsChart.marginBottom,margin[2]),optionsMarginLeft=pick(optionsChart.marginLeft,margin[3]),spacingTop=optionsChart.spacingTop,spacingRight=optionsChart.spacingRight,spacingBottom=optionsChart.spacingBottom,spacingLeft=optionsChart.spacingLeft,spacingBox,chartTitleOptions,chartSubtitleOptions,plotTop,marginRight,marginBottom,plotLeft,axisOffset,renderTo,renderToClone,container,containerId,containerWidth,containerHeight,chartWidth,chartHeight,oldChartWidth,oldChartHeight,chartBackground,plotBackground,plotBGImage,plotBorder,chart=this,chartEvents=optionsChart.events,runChartClick=chartEvents&&!!chartEvents.click,eventType,isInsidePlot,tooltip,mouseIsDown,loadingDiv,loadingSpan,loadingShown,plotHeight,plotWidth,tracker,trackerGroup,placeTrackerGroup,legend,legendWidth,legendHeight,chartPosition,hasCartesianSeries=optionsChart.showAxes,isResizing=0,axes=[],maxTicks,series=[],inverted,renderer,tooltipTick,tooltipInterval,hoverX,drawChartBox,getMargins,resetMargins,setChartSize,resize,zoom,zoomOut;
function Axis(userOptions){var isXAxis=userOptions.isX,opposite=userOptions.opposite,horiz=inverted?!isXAxis:isXAxis,side=horiz?(opposite?0:2):(opposite?1:3),stacks={},options=merge(isXAxis?defaultXAxisOptions:defaultYAxisOptions,[defaultTopAxisOptions,defaultRightAxisOptions,defaultBottomAxisOptions,defaultLeftAxisOptions][side],userOptions),axis=this,axisTitle,type=options.type,isDatetimeAxis=type==="datetime",isLog=type==="logarithmic",offset=options.offset||0,xOrY=isXAxis?"x":"y",axisLength,transA,oldTransA,transB=horiz?plotLeft:marginBottom,translate,getPlotLinePath,axisGroup,gridGroup,axisLine,dataMin,dataMax,associatedSeries,userMin,userMax,max=null,min=null,oldMin,oldMax,minPadding=options.minPadding,maxPadding=options.maxPadding,isLinked=defined(options.linkedTo),ignoreMinPadding,ignoreMaxPadding,usePercentage,events=options.events,eventType,plotLinesAndBands=[],tickInterval,minorTickInterval,magnitude,tickPositions,ticks={},minorTicks={},alternateBands={},tickAmount,labelOffset,axisTitleMargin,dateTimeLabelFormat,categories=options.categories,labelFormatter=options.labels.formatter||function(){var value=this.value,ret;
if(dateTimeLabelFormat){ret=dateFormat(dateTimeLabelFormat,value)
}else{if(tickInterval%1000000===0){ret=(value/1000000)+"M"
}else{if(tickInterval%1000===0){ret=(value/1000)+"k"
}else{if(!categories&&value>=1000){ret=numberFormat(value,0)
}else{ret=value
}}}}return ret
},staggerLines=horiz&&options.labels.staggerLines,reversed=options.reversed,tickmarkOffset=(categories&&options.tickmarkPlacement==="between")?0.5:0;
function Tick(pos,minor){var tick=this;
tick.pos=pos;
tick.minor=minor;
tick.isNew=true;
if(!minor){tick.addLabel()
}}Tick.prototype={addLabel:function(){var pos=this.pos,labelOptions=options.labels,str,withLabel=!((pos===min&&!pick(options.showFirstLabel,1))||(pos===max&&!pick(options.showLastLabel,0))),width=(categories&&horiz&&categories.length&&!labelOptions.step&&!labelOptions.staggerLines&&!labelOptions.rotation&&plotWidth/categories.length)||(!horiz&&plotWidth/2),css,value=categories&&defined(categories[pos])?categories[pos]:pos,label=this.label;
str=labelFormatter.call({isFirst:pos===tickPositions[0],isLast:pos===tickPositions[tickPositions.length-1],dateTimeLabelFormat:dateTimeLabelFormat,value:isLog?lin2log(value):value});
css=width&&{width:mathMax(1,mathRound(width-2*(labelOptions.padding||10)))+PX};
css=extend(css,labelOptions.style);
if(label===UNDEFINED){this.label=defined(str)&&withLabel&&labelOptions.enabled?renderer.text(str,0,0,labelOptions.useHTML).attr({align:labelOptions.align,rotation:labelOptions.rotation}).css(css).add(axisGroup):null
}else{if(label){label.attr({text:str}).css(css)
}}},getLabelSize:function(){var label=this.label;
return label?((this.labelBBox=label.getBBox()))[horiz?"height":"width"]:0
},render:function(index,old){var tick=this,major=!tick.minor,label=tick.label,pos=tick.pos,labelOptions=options.labels,gridLine=tick.gridLine,gridLineWidth=major?options.gridLineWidth:options.minorGridLineWidth,gridLineColor=major?options.gridLineColor:options.minorGridLineColor,dashStyle=major?options.gridLineDashStyle:options.minorGridLineDashStyle,gridLinePath,mark=tick.mark,markPath,tickLength=major?options.tickLength:options.minorTickLength,tickWidth=major?options.tickWidth:(options.minorTickWidth||0),tickColor=major?options.tickColor:options.minorTickColor,tickPosition=major?options.tickPosition:options.minorTickPosition,step=labelOptions.step,cHeight=(old&&oldChartHeight)||chartHeight,attribs,x,y;
x=horiz?translate(pos+tickmarkOffset,null,null,old)+transB:plotLeft+offset+(opposite?((old&&oldChartWidth)||chartWidth)-marginRight-plotLeft:0);
y=horiz?cHeight-marginBottom+offset-(opposite?plotHeight:0):cHeight-translate(pos+tickmarkOffset,null,null,old)-transB;
if(gridLineWidth){gridLinePath=getPlotLinePath(pos+tickmarkOffset,gridLineWidth,old);
if(gridLine===UNDEFINED){attribs={stroke:gridLineColor,"stroke-width":gridLineWidth};
if(dashStyle){attribs.dashstyle=dashStyle
}if(major){attribs.zIndex=1
}tick.gridLine=gridLine=gridLineWidth?renderer.path(gridLinePath).attr(attribs).add(gridGroup):null
}if(!old&&gridLine&&gridLinePath){gridLine.animate({d:gridLinePath})
}}if(tickWidth){if(tickPosition==="inside"){tickLength=-tickLength
}if(opposite){tickLength=-tickLength
}markPath=renderer.crispLine([M,x,y,L,x+(horiz?0:-tickLength),y+(horiz?tickLength:0)],tickWidth);
if(mark){mark.animate({d:markPath})
}else{tick.mark=renderer.path(markPath).attr({stroke:tickColor,"stroke-width":tickWidth}).add(axisGroup)
}}if(label&&!isNaN(x)){x=x+labelOptions.x-(tickmarkOffset&&horiz?tickmarkOffset*transA*(reversed?-1:1):0);
y=y+labelOptions.y-(tickmarkOffset&&!horiz?tickmarkOffset*transA*(reversed?1:-1):0);
if(!defined(labelOptions.y)){y+=pInt(label.styles.lineHeight)*0.9-label.getBBox().height/2
}if(staggerLines){y+=(index/(step||1)%staggerLines)*16
}if(step){label[index%step?"hide":"show"]()
}label[tick.isNew?"attr":"animate"]({x:x,y:y})
}tick.isNew=false
},destroy:function(){destroyObjectProperties(this)
}};
function PlotLineOrBand(options){var plotLine=this;
if(options){plotLine.options=options;
plotLine.id=options.id
}return plotLine
}PlotLineOrBand.prototype={render:function(){var plotLine=this,options=plotLine.options,optionsLabel=options.label,label=plotLine.label,width=options.width,to=options.to,from=options.from,value=options.value,toPath,dashStyle=options.dashStyle,svgElem=plotLine.svgElem,path=[],addEvent,eventType,xs,ys,x,y,color=options.color,zIndex=options.zIndex,events=options.events,attribs;
if(isLog){from=log2lin(from);
to=log2lin(to);
value=log2lin(value)
}if(width){path=getPlotLinePath(value,width);
attribs={stroke:color,"stroke-width":width};
if(dashStyle){attribs.dashstyle=dashStyle
}}else{if(defined(from)&&defined(to)){from=mathMax(from,min);
to=mathMin(to,max);
toPath=getPlotLinePath(to);
path=getPlotLinePath(from);
if(path&&toPath){path.push(toPath[4],toPath[5],toPath[1],toPath[2])
}else{path=null
}attribs={fill:color}
}else{return
}}if(defined(zIndex)){attribs.zIndex=zIndex
}if(svgElem){if(path){svgElem.animate({d:path},null,svgElem.onGetPath)
}else{svgElem.hide();
svgElem.onGetPath=function(){svgElem.show()
}
}}else{if(path&&path.length){plotLine.svgElem=svgElem=renderer.path(path).attr(attribs).add();
if(events){addEvent=function(eventType){svgElem.on(eventType,function(e){events[eventType].apply(plotLine,[e])
})
};
for(eventType in events){addEvent(eventType)
}}}}if(optionsLabel&&defined(optionsLabel.text)&&path&&path.length&&plotWidth>0&&plotHeight>0){optionsLabel=merge({align:horiz&&toPath&&"center",x:horiz?!toPath&&4:10,verticalAlign:!horiz&&toPath&&"middle",y:horiz?toPath?16:10:toPath?6:-4,rotation:horiz&&!toPath&&90},optionsLabel);
if(!label){plotLine.label=label=renderer.text(optionsLabel.text,0,0).attr({align:optionsLabel.textAlign||optionsLabel.align,rotation:optionsLabel.rotation,zIndex:zIndex}).css(optionsLabel.style).add()
}xs=[path[1],path[4],pick(path[6],path[1])];
ys=[path[2],path[5],pick(path[7],path[2])];
x=mathMin.apply(math,xs);
y=mathMin.apply(math,ys);
label.align(optionsLabel,false,{x:x,y:y,width:mathMax.apply(math,xs)-x,height:mathMax.apply(math,ys)-y});
label.show()
}else{if(label){label.hide()
}}return plotLine
},destroy:function(){var obj=this;
destroyObjectProperties(obj);
erase(plotLinesAndBands,obj)
}};
function StackItem(options,isNegative,x,stackOption){var stackItem=this;
stackItem.isNegative=isNegative;
stackItem.options=options;
stackItem.x=x;
stackItem.stack=stackOption;
stackItem.alignOptions={align:options.align||(inverted?(isNegative?"left":"right"):"center"),verticalAlign:options.verticalAlign||(inverted?"middle":(isNegative?"bottom":"top")),y:pick(options.y,inverted?4:(isNegative?14:-6)),x:pick(options.x,inverted?(isNegative?-6:6):0)};
stackItem.textAlign=options.textAlign||(inverted?(isNegative?"right":"left"):"center")
}StackItem.prototype={destroy:function(){destroyObjectProperties(this)
},setTotal:function(total){this.total=total;
this.cum=total
},render:function(group){var stackItem=this,str=stackItem.options.formatter.call(stackItem);
if(stackItem.label){stackItem.label.attr({text:str,visibility:HIDDEN})
}else{stackItem.label=chart.renderer.text(str,0,0).css(stackItem.options.style).attr({align:stackItem.textAlign,rotation:stackItem.options.rotation,visibility:HIDDEN}).add(group)
}},setOffset:function(xOffset,xWidth){var stackItem=this,neg=stackItem.isNegative,y=axis.translate(stackItem.total),yZero=axis.translate(0),h=mathAbs(y-yZero),x=chart.xAxis[0].translate(stackItem.x)+xOffset,plotHeight=chart.plotHeight,stackBox={x:inverted?(neg?y:y-h):x,y:inverted?plotHeight-x-xWidth:(neg?(plotHeight-y-h):plotHeight-y),width:inverted?h:xWidth,height:inverted?xWidth:h};
if(stackItem.label){stackItem.label.align(stackItem.alignOptions,null,stackBox).attr({visibility:VISIBLE})
}}};
function getSeriesExtremes(){var posStack=[],negStack=[],run;
dataMin=dataMax=null;
associatedSeries=[];
each(series,function(serie){run=false;
each(["xAxis","yAxis"],function(strAxis){if(serie.isCartesian&&((strAxis==="xAxis"&&isXAxis)||(strAxis==="yAxis"&&!isXAxis))&&((serie.options[strAxis]===options.index)||(serie.options[strAxis]===UNDEFINED&&options.index===0))){serie[strAxis]=axis;
associatedSeries.push(serie);
run=true
}});
if(!serie.visible&&optionsChart.ignoreHiddenSeries){run=false
}if(run){var stacking,posPointStack,negPointStack,stackKey,stackOption,negKey;
if(!isXAxis){stacking=serie.options.stacking;
usePercentage=stacking==="percent";
if(stacking){stackOption=serie.options.stack;
stackKey=serie.type+pick(stackOption,"");
negKey="-"+stackKey;
serie.stackKey=stackKey;
posPointStack=posStack[stackKey]||[];
posStack[stackKey]=posPointStack;
negPointStack=negStack[negKey]||[];
negStack[negKey]=negPointStack
}if(usePercentage){dataMin=0;
dataMax=99
}}if(serie.isCartesian){each(serie.data,function(point){var pointX=point.x,pointY=point.y,isNegative=pointY<0,pointStack=isNegative?negPointStack:posPointStack,key=isNegative?negKey:stackKey,totalPos,pointLow;
if(dataMin===null){dataMin=dataMax=point[xOrY]
}if(isXAxis){if(pointX>dataMax){dataMax=pointX
}else{if(pointX<dataMin){dataMin=pointX
}}}else{if(defined(pointY)){if(stacking){pointStack[pointX]=defined(pointStack[pointX])?pointStack[pointX]+pointY:pointY
}totalPos=pointStack?pointStack[pointX]:pointY;
pointLow=pick(point.low,totalPos);
if(!usePercentage){if(totalPos>dataMax){dataMax=totalPos
}else{if(pointLow<dataMin){dataMin=pointLow
}}}if(stacking){if(!stacks[key]){stacks[key]={}
}if(!stacks[key][pointX]){stacks[key][pointX]=new StackItem(options.stackLabels,isNegative,pointX,stackOption)
}stacks[key][pointX].setTotal(totalPos)
}}}});
if(/(area|column|bar)/.test(serie.type)&&!isXAxis){var threshold=0;
if(dataMin>=threshold){dataMin=threshold;
ignoreMinPadding=true
}else{if(dataMax<threshold){dataMax=threshold;
ignoreMaxPadding=true
}}}}}})
}translate=function(val,backwards,cvsCoord,old,handleLog){var sign=1,cvsOffset=0,localA=old?oldTransA:transA,localMin=old?oldMin:min,returnValue;
if(!localA){localA=transA
}if(cvsCoord){sign*=-1;
cvsOffset=axisLength
}if(reversed){sign*=-1;
cvsOffset-=sign*axisLength
}if(backwards){if(reversed){val=axisLength-val
}returnValue=val/localA+localMin;
if(isLog&&handleLog){returnValue=lin2log(returnValue)
}}else{if(isLog&&handleLog){val=log2lin(val)
}returnValue=sign*(val-localMin)*localA+cvsOffset
}return returnValue
};
getPlotLinePath=function(value,lineWidth,old){var x1,y1,x2,y2,translatedValue=translate(value,null,null,old),cHeight=(old&&oldChartHeight)||chartHeight,cWidth=(old&&oldChartWidth)||chartWidth,skip;
x1=x2=mathRound(translatedValue+transB);
y1=y2=mathRound(cHeight-translatedValue-transB);
if(isNaN(translatedValue)){skip=true
}else{if(horiz){y1=plotTop;
y2=cHeight-marginBottom;
if(x1<plotLeft||x1>plotLeft+plotWidth){skip=true
}}else{x1=plotLeft;
x2=cWidth-marginRight;
if(y1<plotTop||y1>plotTop+plotHeight){skip=true
}}}return skip?null:renderer.crispLine([M,x1,y1,L,x2,y2],lineWidth||0)
};
function normalizeTickInterval(interval,multiples){var normalized,i;
magnitude=multiples?1:math.pow(10,mathFloor(math.log(interval)/math.LN10));
normalized=interval/magnitude;
if(!multiples){multiples=[1,2,2.5,5,10];
if(options.allowDecimals===false||isLog){if(magnitude===1){multiples=[1,2,5,10]
}else{if(magnitude<=0.1){multiples=[1/magnitude]
}}}}for(i=0;
i<multiples.length;
i++){interval=multiples[i];
if(normalized<=(multiples[i]+(multiples[i+1]||multiples[i]))/2){break
}}interval*=magnitude;
return interval
}function setDateTimeTickPositions(){tickPositions=[];
var i,useUTC=defaultOptions.global.useUTC,oneSecond=1000/timeFactor,oneMinute=60000/timeFactor,oneHour=3600000/timeFactor,oneDay=24*3600000/timeFactor,oneWeek=7*24*3600000/timeFactor,oneMonth=30*24*3600000/timeFactor,oneYear=31556952000/timeFactor,units=[["second",oneSecond,[1,2,5,10,15,30]],["minute",oneMinute,[1,2,5,10,15,30]],["hour",oneHour,[1,2,3,4,6,8,12]],["day",oneDay,[1,2]],["week",oneWeek,[1,2]],["month",oneMonth,[1,2,3,4,6]],["year",oneYear,null]],unit=units[6],interval=unit[1],multiples=unit[2];
for(i=0;
i<units.length;
i++){unit=units[i];
interval=unit[1];
multiples=unit[2];
if(units[i+1]){var lessThan=(interval*multiples[multiples.length-1]+units[i+1][1])/2;
if(tickInterval<=lessThan){break
}}}if(interval===oneYear&&tickInterval<5*interval){multiples=[1,2,5]
}var multitude=normalizeTickInterval(tickInterval/interval,multiples),minYear,minDate=new Date(min*timeFactor);
minDate.setMilliseconds(0);
if(interval>=oneSecond){minDate.setSeconds(interval>=oneMinute?0:multitude*mathFloor(minDate.getSeconds()/multitude))
}if(interval>=oneMinute){minDate[setMinutes](interval>=oneHour?0:multitude*mathFloor(minDate[getMinutes]()/multitude))
}if(interval>=oneHour){minDate[setHours](interval>=oneDay?0:multitude*mathFloor(minDate[getHours]()/multitude))
}if(interval>=oneDay){minDate[setDate](interval>=oneMonth?1:multitude*mathFloor(minDate[getDate]()/multitude))
}if(interval>=oneMonth){minDate[setMonth](interval>=oneYear?0:multitude*mathFloor(minDate[getMonth]()/multitude));
minYear=minDate[getFullYear]()
}if(interval>=oneYear){minYear-=minYear%multitude;
minDate[setFullYear](minYear)
}if(interval===oneWeek){minDate[setDate](minDate[getDate]()-minDate[getDay]()+options.startOfWeek)
}i=1;
minYear=minDate[getFullYear]();
var time=minDate.getTime()/timeFactor,minMonth=minDate[getMonth](),minDateDate=minDate[getDate]();
while(time<max&&i<plotWidth){tickPositions.push(time);
if(interval===oneYear){time=makeTime(minYear+i*multitude,0)/timeFactor
}else{if(interval===oneMonth){time=makeTime(minYear,minMonth+i*multitude)/timeFactor
}else{if(!useUTC&&(interval===oneDay||interval===oneWeek)){time=makeTime(minYear,minMonth,minDateDate+i*multitude*(interval===oneDay?1:7))
}else{time+=interval*multitude
}}}i++
}tickPositions.push(time);
dateTimeLabelFormat=options.dateTimeLabelFormats[unit[0]]
}function correctFloat(num){var invMag,ret=num;
magnitude=pick(magnitude,math.pow(10,mathFloor(math.log(tickInterval)/math.LN10)));
if(magnitude<1){invMag=mathRound(1/magnitude)*10;
ret=mathRound(num*invMag)/invMag
}return ret
}function setLinearTickPositions(){var i,roundedMin=correctFloat(mathFloor(min/tickInterval)*tickInterval),roundedMax=correctFloat(mathCeil(max/tickInterval)*tickInterval);
tickPositions=[];
i=correctFloat(roundedMin);
while(i<=roundedMax){tickPositions.push(i);
i=correctFloat(i+tickInterval)
}}function setTickPositions(){var length,catPad,linkedParent,linkedParentExtremes,tickIntervalOption=options.tickInterval,tickPixelIntervalOption=options.tickPixelInterval,maxZoom=options.maxZoom||(isXAxis&&!defined(options.min)&&!defined(options.max)?mathMin(chart.smallestInterval*5,dataMax-dataMin):null),zoomOffset;
axisLength=horiz?plotWidth:plotHeight;
if(isLinked){linkedParent=chart[isXAxis?"xAxis":"yAxis"][options.linkedTo];
linkedParentExtremes=linkedParent.getExtremes();
min=pick(linkedParentExtremes.min,linkedParentExtremes.dataMin);
max=pick(linkedParentExtremes.max,linkedParentExtremes.dataMax)
}else{min=pick(userMin,options.min,dataMin);
max=pick(userMax,options.max,dataMax)
}if(isLog){min=log2lin(min);
max=log2lin(max)
}if(max-min<maxZoom){zoomOffset=(maxZoom-max+min)/2;
min=mathMax(min-zoomOffset,pick(options.min,min-zoomOffset),dataMin);
max=mathMin(min+maxZoom,pick(options.max,min+maxZoom),dataMax)
}if(!categories&&!usePercentage&&!isLinked&&defined(min)&&defined(max)){length=(max-min)||1;
if(!defined(options.min)&&!defined(userMin)&&minPadding&&(dataMin<0||!ignoreMinPadding)){min-=length*minPadding
}if(!defined(options.max)&&!defined(userMax)&&maxPadding&&(dataMax>0||!ignoreMaxPadding)){max+=length*maxPadding
}}if(min===max){tickInterval=1
}else{if(isLinked&&!tickIntervalOption&&tickPixelIntervalOption===linkedParent.options.tickPixelInterval){tickInterval=linkedParent.tickInterval
}else{tickInterval=pick(tickIntervalOption,categories?1:(max-min)*tickPixelIntervalOption/axisLength)
}}if(!isDatetimeAxis&&!defined(options.tickInterval)){tickInterval=normalizeTickInterval(tickInterval)
}axis.tickInterval=tickInterval;
minorTickInterval=options.minorTickInterval==="auto"&&tickInterval?tickInterval/5:options.minorTickInterval;
if(isDatetimeAxis){setDateTimeTickPositions()
}else{setLinearTickPositions()
}if(!isLinked){if(categories||(isXAxis&&chart.hasColumn)){catPad=(categories?1:tickInterval)*0.5;
if(categories||!defined(pick(options.min,userMin))){min-=catPad
}if(categories||!defined(pick(options.max,userMax))){max+=catPad
}}var roundedMin=tickPositions[0],roundedMax=tickPositions[tickPositions.length-1];
if(options.startOnTick){min=roundedMin
}else{if(min>roundedMin){tickPositions.shift()
}}if(options.endOnTick){max=roundedMax
}else{if(max<roundedMax){tickPositions.pop()
}}if(!maxTicks){maxTicks={x:0,y:0}
}if(!isDatetimeAxis&&tickPositions.length>maxTicks[xOrY]){maxTicks[xOrY]=tickPositions.length
}}}function adjustTickAmount(){if(maxTicks&&!isDatetimeAxis&&!categories&&!isLinked){var oldTickAmount=tickAmount,calculatedTickAmount=tickPositions.length;
tickAmount=maxTicks[xOrY];
if(calculatedTickAmount<tickAmount){while(tickPositions.length<tickAmount){tickPositions.push(correctFloat(tickPositions[tickPositions.length-1]+tickInterval))
}transA*=(calculatedTickAmount-1)/(tickAmount-1);
max=tickPositions[tickPositions.length-1]
}if(defined(oldTickAmount)&&tickAmount!==oldTickAmount){axis.isDirty=true
}}}function setScale(){var type,i;
oldMin=min;
oldMax=max;
getSeriesExtremes();
setTickPositions();
oldTransA=transA;
transA=axisLength/((max-min)||1);
if(!isXAxis){for(type in stacks){for(i in stacks[type]){stacks[type][i].cum=stacks[type][i].total
}}}if(!axis.isDirty){axis.isDirty=(min!==oldMin||max!==oldMax)
}}function setExtremes(newMin,newMax,redraw,animation){redraw=pick(redraw,true);
fireEvent(axis,"setExtremes",{min:newMin,max:newMax},function(){userMin=newMin;
userMax=newMax;
if(redraw){chart.redraw(animation)
}})
}function getExtremes(){return{min:min,max:max,dataMin:dataMin,dataMax:dataMax,userMin:userMin,userMax:userMax}
}function getThreshold(threshold){if(min>threshold){threshold=min
}else{if(max<threshold){threshold=max
}}return translate(threshold,0,1)
}function addPlotBandOrLine(options){var obj=new PlotLineOrBand(options).render();
plotLinesAndBands.push(obj);
return obj
}function getOffset(){var hasData=associatedSeries.length&&defined(min)&&defined(max),titleOffset=0,titleMargin=0,axisTitleOptions=options.title,labelOptions=options.labels,directionFactor=[-1,1,1,-1][side],n;
if(!axisGroup){axisGroup=renderer.g("axis").attr({zIndex:7}).add();
gridGroup=renderer.g("grid").attr({zIndex:1}).add()
}labelOffset=0;
if(hasData||isLinked){each(tickPositions,function(pos){if(!ticks[pos]){ticks[pos]=new Tick(pos)
}else{ticks[pos].addLabel()
}if(side===0||side===2||{1:"left",3:"right"}[side]===labelOptions.align){labelOffset=mathMax(ticks[pos].getLabelSize(),labelOffset)
}});
if(staggerLines){labelOffset+=(staggerLines-1)*16
}}else{for(n in ticks){ticks[n].destroy();
delete ticks[n]
}}if(axisTitleOptions&&axisTitleOptions.text){if(!axisTitle){axisTitle=axis.axisTitle=renderer.text(axisTitleOptions.text,0,0,axisTitleOptions.useHTML).attr({zIndex:7,rotation:axisTitleOptions.rotation||0,align:axisTitleOptions.textAlign||{low:"left",middle:"center",high:"right"}[axisTitleOptions.align]}).css(axisTitleOptions.style).add();
axisTitle.isNew=true
}titleOffset=axisTitle.getBBox()[horiz?"height":"width"];
titleMargin=pick(axisTitleOptions.margin,horiz?5:10)
}offset=directionFactor*(options.offset||axisOffset[side]);
axisTitleMargin=labelOffset+(side!==2&&labelOffset&&directionFactor*options.labels[horiz?"y":"x"])+titleMargin;
axisOffset[side]=mathMax(axisOffset[side],axisTitleMargin+titleOffset+directionFactor*offset)
}function render(){var axisTitleOptions=options.title,stackLabelOptions=options.stackLabels,alternateGridColor=options.alternateGridColor,lineWidth=options.lineWidth,lineLeft,lineTop,linePath,hasRendered=chart.hasRendered,slideInTicks=hasRendered&&defined(oldMin)&&!isNaN(oldMin),hasData=associatedSeries.length&&defined(min)&&defined(max);
axisLength=horiz?plotWidth:plotHeight;
transA=axisLength/((max-min)||1);
transB=horiz?plotLeft:marginBottom;
if(hasData||isLinked){if(minorTickInterval&&!categories){var pos=min+(tickPositions[0]-min)%minorTickInterval;
for(;
pos<=max;
pos+=minorTickInterval){if(!minorTicks[pos]){minorTicks[pos]=new Tick(pos,true)
}if(slideInTicks&&minorTicks[pos].isNew){minorTicks[pos].render(null,true)
}minorTicks[pos].isActive=true;
minorTicks[pos].render()
}}each(tickPositions,function(pos,i){if(!isLinked||(pos>=min&&pos<=max)){if(slideInTicks&&ticks[pos].isNew){ticks[pos].render(i,true)
}ticks[pos].isActive=true;
ticks[pos].render(i)
}});
if(alternateGridColor){each(tickPositions,function(pos,i){if(i%2===0&&pos<max){if(!alternateBands[pos]){alternateBands[pos]=new PlotLineOrBand()
}alternateBands[pos].options={from:pos,to:tickPositions[i+1]!==UNDEFINED?tickPositions[i+1]:max,color:alternateGridColor};
alternateBands[pos].render();
alternateBands[pos].isActive=true
}})
}if(!hasRendered){each((options.plotLines||[]).concat(options.plotBands||[]),function(plotLineOptions){plotLinesAndBands.push(new PlotLineOrBand(plotLineOptions).render())
})
}}each([ticks,minorTicks,alternateBands],function(coll){var pos;
for(pos in coll){if(!coll[pos].isActive){coll[pos].destroy();
delete coll[pos]
}else{coll[pos].isActive=false
}}});
if(lineWidth){lineLeft=plotLeft+(opposite?plotWidth:0)+offset;
lineTop=chartHeight-marginBottom-(opposite?plotHeight:0)+offset;
linePath=renderer.crispLine([M,horiz?plotLeft:lineLeft,horiz?lineTop:plotTop,L,horiz?chartWidth-marginRight:lineLeft,horiz?lineTop:chartHeight-marginBottom],lineWidth);
if(!axisLine){axisLine=renderer.path(linePath).attr({stroke:options.lineColor,"stroke-width":lineWidth,zIndex:7}).add()
}else{axisLine.animate({d:linePath})
}}if(axisTitle){var margin=horiz?plotLeft:plotTop,fontSize=pInt(axisTitleOptions.style.fontSize||12),alongAxis={low:margin+(horiz?0:axisLength),middle:margin+axisLength/2,high:margin+(horiz?axisLength:0)}[axisTitleOptions.align],offAxis=(horiz?plotTop+plotHeight:plotLeft)+(horiz?1:-1)*(opposite?-1:1)*axisTitleMargin+(side===2?fontSize:0);
axisTitle[axisTitle.isNew?"attr":"animate"]({x:horiz?alongAxis:offAxis+(opposite?plotWidth:0)+offset+(axisTitleOptions.x||0),y:horiz?offAxis-(opposite?plotHeight:0)+offset:alongAxis+(axisTitleOptions.y||0)});
axisTitle.isNew=false
}if(stackLabelOptions&&stackLabelOptions.enabled){var stackKey,oneStack,stackCategory,stackTotalGroup=axis.stackTotalGroup;
if(!stackTotalGroup){axis.stackTotalGroup=stackTotalGroup=renderer.g("stack-labels").attr({visibility:VISIBLE,zIndex:6}).translate(plotLeft,plotTop).add()
}for(stackKey in stacks){oneStack=stacks[stackKey];
for(stackCategory in oneStack){oneStack[stackCategory].render(stackTotalGroup)
}}}axis.isDirty=false
}function removePlotBandOrLine(id){var i=plotLinesAndBands.length;
while(i--){if(plotLinesAndBands[i].id===id){plotLinesAndBands[i].destroy()
}}}function redraw(){if(tracker.resetTracker){tracker.resetTracker()
}render();
each(plotLinesAndBands,function(plotLine){plotLine.render()
});
each(associatedSeries,function(series){series.isDirty=true
})
}function setCategories(newCategories,doRedraw){axis.categories=userOptions.categories=categories=newCategories;
each(associatedSeries,function(series){series.translate();
series.setTooltipPoints(true)
});
axis.isDirty=true;
if(pick(doRedraw,true)){chart.redraw()
}}function destroy(){var stackKey;
removeEvent(axis);
for(stackKey in stacks){destroyObjectProperties(stacks[stackKey]);
stacks[stackKey]=null
}if(axis.stackTotalGroup){axis.stackTotalGroup=axis.stackTotalGroup.destroy()
}each([ticks,minorTicks,alternateBands,plotLinesAndBands],function(coll){destroyObjectProperties(coll)
});
each([axisLine,axisGroup,gridGroup,axisTitle],function(obj){if(obj){obj.destroy()
}});
axisLine=axisGroup=gridGroup=axisTitle=null
}if(inverted&&isXAxis&&reversed===UNDEFINED){reversed=true
}extend(axis,{addPlotBand:addPlotBandOrLine,addPlotLine:addPlotBandOrLine,adjustTickAmount:adjustTickAmount,categories:categories,getExtremes:getExtremes,getPlotLinePath:getPlotLinePath,getThreshold:getThreshold,isXAxis:isXAxis,options:options,plotLinesAndBands:plotLinesAndBands,getOffset:getOffset,render:render,setCategories:setCategories,setExtremes:setExtremes,setScale:setScale,setTickPositions:setTickPositions,translate:translate,redraw:redraw,removePlotBand:removePlotBandOrLine,removePlotLine:removePlotBandOrLine,reversed:reversed,stacks:stacks,destroy:destroy});
for(eventType in events){addEvent(axis,eventType,events[eventType])
}setScale()
}function Toolbar(){var buttons={};
function add(id,text,title,fn){if(!buttons[id]){var button=renderer.text(text,0,0).css(options.toolbar.itemStyle).align({align:"right",x:-marginRight-20,y:plotTop+30}).on("click",fn).attr({align:"right",zIndex:20}).add();
buttons[id]=button
}}function remove(id){discardElement(buttons[id].element);
buttons[id]=null
}return{add:add,remove:remove}
}function Tooltip(options){var currentSeries,borderWidth=options.borderWidth,crosshairsOptions=options.crosshairs,crosshairs=[],style=options.style,shared=options.shared,padding=pInt(style.padding),boxOffLeft=borderWidth+padding,tooltipIsHidden=true,boxWidth,boxHeight,currentX=0,currentY=0;
style.padding=0;
var group=renderer.g("tooltip").attr({zIndex:8}).add(),box=renderer.rect(boxOffLeft,boxOffLeft,0,0,options.borderRadius,borderWidth).attr({fill:options.backgroundColor,"stroke-width":borderWidth}).add(group).shadow(options.shadow),label=renderer.text("",padding+boxOffLeft,pInt(style.fontSize)+padding+boxOffLeft,options.useHTML).attr({zIndex:1}).css(style).add(group);
group.hide();
function destroy(){each(crosshairs,function(crosshair){if(crosshair){crosshair.destroy()
}});
each([box,label,group],function(obj){if(obj){obj.destroy()
}});
box=label=group=null
}function defaultFormatter(){var pThis=this,items=pThis.points||splat(pThis),xAxis=items[0].series.xAxis,x=pThis.x,isDateTime=xAxis&&xAxis.options.type==="datetime",useHeader=isString(x)||isDateTime,s;
s=useHeader?['<span style="font-size: 10px">'+(isDateTime?dateFormat("%A, %b %e, %Y",x):x)+"</span>"]:[];
each(items,function(item){s.push(item.point.tooltipFormatter(useHeader))
});
return s.join("<br/>")
}function move(finalX,finalY){currentX=tooltipIsHidden?finalX:(2*currentX+finalX)/3;
currentY=tooltipIsHidden?finalY:(currentY+finalY)/2;
group.translate(currentX,currentY);
if(mathAbs(finalX-currentX)>1||mathAbs(finalY-currentY)>1){tooltipTick=function(){move(finalX,finalY)
}
}else{tooltipTick=null
}}function hide(){if(!tooltipIsHidden){var hoverPoints=chart.hoverPoints;
group.hide();
each(crosshairs,function(crosshair){if(crosshair){crosshair.hide()
}});
if(hoverPoints){each(hoverPoints,function(point){point.setState()
})
}chart.hoverPoints=null;
tooltipIsHidden=true
}}function refresh(point){var x,y,show,bBox,plotX,plotY=0,textConfig={},text,pointConfig=[],tooltipPos=point.tooltipPos,formatter=options.formatter||defaultFormatter,hoverPoints=chart.hoverPoints,placedTooltipPoint;
if(shared){if(hoverPoints){each(hoverPoints,function(point){point.setState()
})
}chart.hoverPoints=point;
each(point,function(item){item.setState(HOVER_STATE);
plotY+=item.plotY;
pointConfig.push(item.getLabelConfig())
});
plotX=point[0].plotX;
plotY=mathRound(plotY)/point.length;
textConfig={x:point[0].category};
textConfig.points=pointConfig;
point=point[0]
}else{textConfig=point.getLabelConfig()
}text=formatter.call(textConfig);
currentSeries=point.series;
plotX=shared?plotX:point.plotX;
plotY=shared?plotY:point.plotY;
x=mathRound(tooltipPos?tooltipPos[0]:(inverted?plotWidth-plotY:plotX));
y=mathRound(tooltipPos?tooltipPos[1]:(inverted?plotHeight-plotX:plotY));
show=shared||!point.series.isCartesian||isInsidePlot(x,y);
if(text===false||!show){hide()
}else{if(tooltipIsHidden){group.show();
tooltipIsHidden=false
}label.attr({text:text});
bBox=label.getBBox();
boxWidth=bBox.width+2*padding;
boxHeight=bBox.height+2*padding;
box.attr({width:boxWidth,height:boxHeight,stroke:options.borderColor||point.color||currentSeries.color||"#606060"});
placedTooltipPoint=placeBox(boxWidth,boxHeight,plotLeft,plotTop,plotWidth,plotHeight,{x:x,y:y});
move(mathRound(placedTooltipPoint.x-boxOffLeft),mathRound(placedTooltipPoint.y-boxOffLeft))
}if(crosshairsOptions){crosshairsOptions=splat(crosshairsOptions);
var path,i=crosshairsOptions.length,attribs,axis;
while(i--){axis=point.series[i?"yAxis":"xAxis"];
if(crosshairsOptions[i]&&axis){path=axis.getPlotLinePath(point[i?"y":"x"],1);
if(crosshairs[i]){crosshairs[i].attr({d:path,visibility:VISIBLE})
}else{attribs={"stroke-width":crosshairsOptions[i].width||1,stroke:crosshairsOptions[i].color||"#C0C0C0",zIndex:2};
if(crosshairsOptions[i].dashStyle){attribs.dashstyle=crosshairsOptions[i].dashStyle
}crosshairs[i]=renderer.path(path).attr(attribs).add()
}}}}}return{shared:shared,refresh:refresh,hide:hide,destroy:destroy}
}function MouseTracker(options){var mouseDownX,mouseDownY,hasDragged,selectionMarker,zoomType=optionsChart.zoomType,zoomX=/x/.test(zoomType),zoomY=/y/.test(zoomType),zoomHor=(zoomX&&!inverted)||(zoomY&&inverted),zoomVert=(zoomY&&!inverted)||(zoomX&&inverted);
function normalizeMouseEvent(e){var ePos,pageZoomFix=isWebKit&&doc.width/doc.body.scrollWidth-1,chartPosLeft,chartPosTop,chartX,chartY;
e=e||win.event;
if(!e.target){e.target=e.srcElement
}ePos=e.touches?e.touches.item(0):e;
if(e.type!=="mousemove"||win.opera||pageZoomFix){chartPosition=getPosition(container);
chartPosLeft=chartPosition.left;
chartPosTop=chartPosition.top
}if(isIE){chartX=e.x;
chartY=e.y
}else{if(ePos.layerX===UNDEFINED){chartX=ePos.pageX-chartPosLeft;
chartY=ePos.pageY-chartPosTop
}else{chartX=e.layerX;
chartY=e.layerY
}}if(pageZoomFix){chartX+=mathRound((pageZoomFix+1)*chartPosLeft-chartPosLeft);
chartY+=mathRound((pageZoomFix+1)*chartPosTop-chartPosTop)
}return extend(e,{chartX:chartX,chartY:chartY})
}function getMouseCoordinates(e){var coordinates={xAxis:[],yAxis:[]};
each(axes,function(axis){var translate=axis.translate,isXAxis=axis.isXAxis,isHorizontal=inverted?!isXAxis:isXAxis;
coordinates[isXAxis?"xAxis":"yAxis"].push({axis:axis,value:translate(isHorizontal?e.chartX-plotLeft:plotHeight-e.chartY+plotTop,true)})
});
return coordinates
}function onmousemove(e){var point,points,hoverPoint=chart.hoverPoint,hoverSeries=chart.hoverSeries,i,j,distance=chartWidth,index=inverted?e.chartY:e.chartX-plotLeft;
if(tooltip&&options.shared){points=[];
i=series.length;
for(j=0;
j<i;
j++){if(series[j].visible&&series[j].tooltipPoints.length){point=series[j].tooltipPoints[index];
point._dist=mathAbs(index-point.plotX);
distance=mathMin(distance,point._dist);
points.push(point)
}}i=points.length;
while(i--){if(points[i]._dist>distance){points.splice(i,1)
}}if(points.length&&(points[0].plotX!==hoverX)){tooltip.refresh(points);
hoverX=points[0].plotX
}}if(hoverSeries&&hoverSeries.tracker){point=hoverSeries.tooltipPoints[index];
if(point&&point!==hoverPoint){point.onMouseOver()
}}}function resetTracker(){var hoverSeries=chart.hoverSeries,hoverPoint=chart.hoverPoint;
if(hoverPoint){hoverPoint.onMouseOut()
}if(hoverSeries){hoverSeries.onMouseOut()
}if(tooltip){tooltip.hide()
}hoverX=null
}function drop(){if(selectionMarker){var selectionData={xAxis:[],yAxis:[]},selectionBox=selectionMarker.getBBox(),selectionLeft=selectionBox.x-plotLeft,selectionTop=selectionBox.y-plotTop;
if(hasDragged){each(axes,function(axis){var translate=axis.translate,isXAxis=axis.isXAxis,isHorizontal=inverted?!isXAxis:isXAxis,selectionMin=translate(isHorizontal?selectionLeft:plotHeight-selectionTop-selectionBox.height,true,0,0,1),selectionMax=translate(isHorizontal?selectionLeft+selectionBox.width:plotHeight-selectionTop,true,0,0,1);
selectionData[isXAxis?"xAxis":"yAxis"].push({axis:axis,min:mathMin(selectionMin,selectionMax),max:mathMax(selectionMin,selectionMax)})
});
fireEvent(chart,"selection",selectionData,zoom)
}selectionMarker=selectionMarker.destroy()
}chart.mouseIsDown=mouseIsDown=hasDragged=false;
removeEvent(doc,hasTouch?"touchend":"mouseup",drop)
}function hideTooltipOnMouseMove(e){var pageX=defined(e.pageX)?e.pageX:e.page.x,pageY=defined(e.pageX)?e.pageY:e.page.y;
if(chartPosition&&!isInsidePlot(pageX-chartPosition.left-plotLeft,pageY-chartPosition.top-plotTop)){resetTracker()
}}function setDOMEvents(){var lastWasOutsidePlot=true;
container.onmousedown=function(e){e=normalizeMouseEvent(e);
if(!hasTouch&&e.preventDefault){e.preventDefault()
}chart.mouseIsDown=mouseIsDown=true;
mouseDownX=e.chartX;
mouseDownY=e.chartY;
addEvent(doc,hasTouch?"touchend":"mouseup",drop)
};
var mouseMove=function(e){if(e&&e.touches&&e.touches.length>1){return
}e=normalizeMouseEvent(e);
if(!hasTouch){e.returnValue=false
}var chartX=e.chartX,chartY=e.chartY,isOutsidePlot=!isInsidePlot(chartX-plotLeft,chartY-plotTop);
if(!chartPosition){chartPosition=getPosition(container)
}if(hasTouch&&e.type==="touchstart"){if(attr(e.target,"isTracker")){if(!chart.runTrackerClick){e.preventDefault()
}}else{if(!runChartClick&&!isOutsidePlot){e.preventDefault()
}}}if(isOutsidePlot){if(chartX<plotLeft){chartX=plotLeft
}else{if(chartX>plotLeft+plotWidth){chartX=plotLeft+plotWidth
}}if(chartY<plotTop){chartY=plotTop
}else{if(chartY>plotTop+plotHeight){chartY=plotTop+plotHeight
}}}if(mouseIsDown&&e.type!=="touchstart"){hasDragged=Math.sqrt(Math.pow(mouseDownX-chartX,2)+Math.pow(mouseDownY-chartY,2));
if(hasDragged>10){if(hasCartesianSeries&&(zoomX||zoomY)&&isInsidePlot(mouseDownX-plotLeft,mouseDownY-plotTop)){if(!selectionMarker){selectionMarker=renderer.rect(plotLeft,plotTop,zoomHor?1:plotWidth,zoomVert?1:plotHeight,0).attr({fill:optionsChart.selectionMarkerFill||"rgba(69,114,167,0.25)",zIndex:7}).add()
}}if(selectionMarker&&zoomHor){var xSize=chartX-mouseDownX;
selectionMarker.attr({width:mathAbs(xSize),x:(xSize>0?0:xSize)+mouseDownX})
}if(selectionMarker&&zoomVert){var ySize=chartY-mouseDownY;
selectionMarker.attr({height:mathAbs(ySize),y:(ySize>0?0:ySize)+mouseDownY})
}}}else{if(!isOutsidePlot){onmousemove(e)
}}lastWasOutsidePlot=isOutsidePlot;
return isOutsidePlot||!hasCartesianSeries
};
container.onmousemove=mouseMove;
addEvent(container,"mouseleave",resetTracker);
addEvent(doc,"mousemove",hideTooltipOnMouseMove);
container.ontouchstart=function(e){if(zoomX||zoomY){container.onmousedown(e)
}mouseMove(e)
};
container.ontouchmove=mouseMove;
container.ontouchend=function(){if(hasDragged){resetTracker()
}};
container.onclick=function(e){var hoverPoint=chart.hoverPoint;
e=normalizeMouseEvent(e);
e.cancelBubble=true;
if(!hasDragged){if(hoverPoint&&attr(e.target,"isTracker")){var plotX=hoverPoint.plotX,plotY=hoverPoint.plotY;
extend(hoverPoint,{pageX:chartPosition.left+plotLeft+(inverted?plotWidth-plotY:plotX),pageY:chartPosition.top+plotTop+(inverted?plotHeight-plotX:plotY)});
fireEvent(hoverPoint.series,"click",extend(e,{point:hoverPoint}));
hoverPoint.firePointEvent("click",e)
}else{extend(e,getMouseCoordinates(e));
if(isInsidePlot(e.chartX-plotLeft,e.chartY-plotTop)){fireEvent(chart,"click",e)
}}}hasDragged=false
}
}function destroy(){if(chart.trackerGroup){chart.trackerGroup=trackerGroup=chart.trackerGroup.destroy()
}removeEvent(doc,"mousemove",hideTooltipOnMouseMove);
container.onclick=container.onmousedown=container.onmousemove=container.ontouchstart=container.ontouchend=container.ontouchmove=null
}placeTrackerGroup=function(){if(!trackerGroup){chart.trackerGroup=trackerGroup=renderer.g("tracker").attr({zIndex:9}).add()
}else{trackerGroup.translate(plotLeft,plotTop);
if(inverted){trackerGroup.attr({width:chart.plotWidth,height:chart.plotHeight}).invert()
}}};
placeTrackerGroup();
if(options.enabled){chart.tooltip=tooltip=Tooltip(options)
}setDOMEvents();
tooltipInterval=setInterval(function(){if(tooltipTick){tooltipTick()
}},32);
extend(this,{zoomX:zoomX,zoomY:zoomY,resetTracker:resetTracker,destroy:destroy})
}var Legend=function(){var options=chart.options.legend;
if(!options.enabled){return
}var horizontal=options.layout==="horizontal",symbolWidth=options.symbolWidth,symbolPadding=options.symbolPadding,allItems,style=options.style,itemStyle=options.itemStyle,itemHoverStyle=options.itemHoverStyle,itemHiddenStyle=options.itemHiddenStyle,padding=pInt(style.padding),y=18,initialItemX=4+padding+symbolWidth+symbolPadding,itemX,itemY,lastItemY,itemHeight=0,box,legendBorderWidth=options.borderWidth,legendBackgroundColor=options.backgroundColor,legendGroup,offsetWidth,widthOption=options.width,series=chart.series,reversedLegend=options.reversed;
function colorizeItem(item,visible){var legendItem=item.legendItem,legendLine=item.legendLine,legendSymbol=item.legendSymbol,hiddenColor=itemHiddenStyle.color,textColor=visible?options.itemStyle.color:hiddenColor,lineColor=visible?item.color:hiddenColor,symbolAttr=visible?item.pointAttr[NORMAL_STATE]:{stroke:hiddenColor,fill:hiddenColor};
if(legendItem){legendItem.css({fill:textColor})
}if(legendLine){legendLine.attr({stroke:lineColor})
}if(legendSymbol){legendSymbol.attr(symbolAttr)
}}function positionItem(item,itemX,itemY){var legendItem=item.legendItem,legendLine=item.legendLine,legendSymbol=item.legendSymbol,checkbox=item.checkbox;
if(legendItem){legendItem.attr({x:itemX,y:itemY})
}if(legendLine){legendLine.translate(itemX,itemY-4)
}if(legendSymbol){legendSymbol.attr({x:itemX+legendSymbol.xOff,y:itemY+legendSymbol.yOff})
}if(checkbox){checkbox.x=itemX;
checkbox.y=itemY
}}function destroyItem(item){var checkbox=item.checkbox;
each(["legendItem","legendLine","legendSymbol"],function(key){if(item[key]){item[key].destroy()
}});
if(checkbox){discardElement(item.checkbox)
}}function destroy(){if(box){box=box.destroy()
}if(legendGroup){legendGroup=legendGroup.destroy()
}}function positionCheckboxes(){each(allItems,function(item){var checkbox=item.checkbox,alignAttr=legendGroup.alignAttr;
if(checkbox){css(checkbox,{left:(alignAttr.translateX+item.legendItemWidth+checkbox.x-40)+PX,top:(alignAttr.translateY+checkbox.y-11)+PX})
}})
}function renderItem(item){var bBox,itemWidth,legendSymbol,symbolX,symbolY,simpleSymbol,li=item.legendItem,series=item.series||item,itemOptions=series.options,strokeWidth=(itemOptions&&itemOptions.borderWidth)||0;
if(!li){simpleSymbol=/^(bar|pie|area|column)$/.test(series.type);
item.legendItem=li=renderer.text(options.labelFormatter.call(item),0,0).css(item.visible?itemStyle:itemHiddenStyle).on("mouseover",function(){item.setState(HOVER_STATE);
li.css(itemHoverStyle)
}).on("mouseout",function(){li.css(item.visible?itemStyle:itemHiddenStyle);
item.setState()
}).on("click",function(){var strLegendItemClick="legendItemClick",fnLegendItemClick=function(){item.setVisible()
};
if(item.firePointEvent){item.firePointEvent(strLegendItemClick,null,fnLegendItemClick)
}else{fireEvent(item,strLegendItemClick,null,fnLegendItemClick)
}}).attr({zIndex:2}).add(legendGroup);
if(!simpleSymbol&&itemOptions&&itemOptions.lineWidth){var attrs={"stroke-width":itemOptions.lineWidth,zIndex:2};
if(itemOptions.dashStyle){attrs.dashstyle=itemOptions.dashStyle
}item.legendLine=renderer.path([M,-symbolWidth-symbolPadding,0,L,-symbolPadding,0]).attr(attrs).add(legendGroup)
}if(simpleSymbol){legendSymbol=renderer.rect((symbolX=-symbolWidth-symbolPadding),(symbolY=-11),symbolWidth,12,2).attr({zIndex:3}).add(legendGroup)
}else{if(itemOptions&&itemOptions.marker&&itemOptions.marker.enabled){legendSymbol=renderer.symbol(item.symbol,(symbolX=-symbolWidth/2-symbolPadding),(symbolY=-4),itemOptions.marker.radius).attr({zIndex:3}).add(legendGroup)
}}if(legendSymbol){legendSymbol.xOff=symbolX+(strokeWidth%2/2);
legendSymbol.yOff=symbolY+(strokeWidth%2/2)
}item.legendSymbol=legendSymbol;
colorizeItem(item,item.visible);
if(itemOptions&&itemOptions.showCheckbox){item.checkbox=createElement("input",{type:"checkbox",checked:item.selected,defaultChecked:item.selected},options.itemCheckboxStyle,container);
addEvent(item.checkbox,"click",function(event){var target=event.target;
fireEvent(item,"checkboxClick",{checked:target.checked},function(){item.select()
})
})
}}bBox=li.getBBox();
itemWidth=item.legendItemWidth=options.itemWidth||symbolWidth+symbolPadding+bBox.width+padding;
itemHeight=bBox.height;
if(horizontal&&itemX-initialItemX+itemWidth>(widthOption||(chartWidth-2*padding-initialItemX))){itemX=initialItemX;
itemY+=itemHeight
}lastItemY=itemY;
positionItem(item,itemX,itemY);
if(horizontal){itemX+=itemWidth
}else{itemY+=itemHeight
}offsetWidth=widthOption||mathMax(horizontal?itemX-initialItemX:itemWidth,offsetWidth)
}function renderLegend(){itemX=initialItemX;
itemY=y;
offsetWidth=0;
lastItemY=0;
if(!legendGroup){legendGroup=renderer.g("legend").attr({zIndex:7}).add()
}allItems=[];
each(series,function(serie){var seriesOptions=serie.options;
if(!seriesOptions.showInLegend){return
}allItems=allItems.concat(seriesOptions.legendType==="point"?serie.data:serie)
});
stableSort(allItems,function(a,b){return(a.options.legendIndex||0)-(b.options.legendIndex||0)
});
if(reversedLegend){allItems.reverse()
}each(allItems,renderItem);
legendWidth=widthOption||offsetWidth;
legendHeight=lastItemY-y+itemHeight;
if(legendBorderWidth||legendBackgroundColor){legendWidth+=2*padding;
legendHeight+=2*padding;
if(!box){box=renderer.rect(0,0,legendWidth,legendHeight,options.borderRadius,legendBorderWidth||0).attr({stroke:options.borderColor,"stroke-width":legendBorderWidth||0,fill:legendBackgroundColor||NONE}).add(legendGroup).shadow(options.shadow);
box.isNew=true
}else{if(legendWidth>0&&legendHeight>0){box[box.isNew?"attr":"animate"](box.crisp(null,null,null,legendWidth,legendHeight));
box.isNew=false
}}box[allItems.length?"show":"hide"]()
}var props=["left","right","top","bottom"],prop,i=4;
while(i--){prop=props[i];
if(style[prop]&&style[prop]!=="auto"){options[i<2?"align":"verticalAlign"]=prop;
options[i<2?"x":"y"]=pInt(style[prop])*(i%2?-1:1)
}}if(allItems.length){legendGroup.align(extend(options,{width:legendWidth,height:legendHeight}),true,spacingBox)
}if(!isResizing){positionCheckboxes()
}}renderLegend();
addEvent(chart,"endResize",positionCheckboxes);
return{colorizeItem:colorizeItem,destroyItem:destroyItem,renderLegend:renderLegend,destroy:destroy}
};
function initSeries(options){var type=options.type||optionsChart.type||optionsChart.defaultSeriesType,typeClass=seriesTypes[type],serie,hasRendered=chart.hasRendered;
if(hasRendered){if(inverted&&type==="column"){typeClass=seriesTypes.bar
}else{if(!inverted&&type==="bar"){typeClass=seriesTypes.column
}}}serie=new typeClass();
serie.init(chart,options);
if(!hasRendered&&serie.inverted){inverted=true
}if(serie.isCartesian){hasCartesianSeries=serie.isCartesian
}series.push(serie);
return serie
}function addSeries(options,redraw,animation){var series;
if(options){setAnimation(animation,chart);
redraw=pick(redraw,true);
fireEvent(chart,"addSeries",{options:options},function(){series=initSeries(options);
series.isDirty=true;
chart.isDirtyLegend=true;
if(redraw){chart.redraw()
}})
}return series
}isInsidePlot=function(x,y){return x>=0&&x<=plotWidth&&y>=0&&y<=plotHeight
};
function adjustTickAmounts(){if(optionsChart.alignTicks!==false){each(axes,function(axis){axis.adjustTickAmount()
})
}maxTicks=null
}function redraw(animation){var redrawLegend=chart.isDirtyLegend,hasStackedSeries,isDirtyBox=chart.isDirtyBox,seriesLength=series.length,i=seriesLength,clipRect=chart.clipRect,serie;
setAnimation(animation,chart);
while(i--){serie=series[i];
if(serie.isDirty&&serie.options.stacking){hasStackedSeries=true;
break
}}if(hasStackedSeries){i=seriesLength;
while(i--){serie=series[i];
if(serie.options.stacking){serie.isDirty=true
}}}each(series,function(serie){if(serie.isDirty){serie.cleanData();
serie.getSegments();
if(serie.options.legendType==="point"){redrawLegend=true
}}});
if(redrawLegend&&legend.renderLegend){legend.renderLegend();
chart.isDirtyLegend=false
}if(hasCartesianSeries){if(!isResizing){maxTicks=null;
each(axes,function(axis){axis.setScale()
})
}adjustTickAmounts();
getMargins();
each(axes,function(axis){if(axis.isDirty||isDirtyBox){axis.redraw();
isDirtyBox=true
}})
}if(isDirtyBox){drawChartBox();
placeTrackerGroup();
if(clipRect){stop(clipRect);
clipRect.animate({width:chart.plotSizeX,height:chart.plotSizeY})
}}each(series,function(serie){if(serie.isDirty&&serie.visible&&(!serie.isCartesian||serie.xAxis)){serie.redraw()
}});
if(tracker&&tracker.resetTracker){tracker.resetTracker()
}fireEvent(chart,"redraw")
}function showLoading(str){var loadingOptions=options.loading;
if(!loadingDiv){loadingDiv=createElement(DIV,{className:"highcharts-loading"},extend(loadingOptions.style,{left:plotLeft+PX,top:plotTop+PX,width:plotWidth+PX,height:plotHeight+PX,zIndex:10,display:NONE}),container);
loadingSpan=createElement("span",null,loadingOptions.labelStyle,loadingDiv)
}loadingSpan.innerHTML=str||options.lang.loading;
if(!loadingShown){css(loadingDiv,{opacity:0,display:""});
animate(loadingDiv,{opacity:loadingOptions.style.opacity},{duration:loadingOptions.showDuration});
loadingShown=true
}}function hideLoading(){animate(loadingDiv,{opacity:0},{duration:options.loading.hideDuration,complete:function(){css(loadingDiv,{display:NONE})
}});
loadingShown=false
}function get(id){var i,j,data;
for(i=0;
i<axes.length;
i++){if(axes[i].options.id===id){return axes[i]
}}for(i=0;
i<series.length;
i++){if(series[i].options.id===id){return series[i]
}}for(i=0;
i<series.length;
i++){data=series[i].data;
for(j=0;
j<data.length;
j++){if(data[j].id===id){return data[j]
}}}return null
}function getAxes(){var xAxisOptions=options.xAxis||{},yAxisOptions=options.yAxis||{},axis;
xAxisOptions=splat(xAxisOptions);
each(xAxisOptions,function(axis,i){axis.index=i;
axis.isX=true
});
yAxisOptions=splat(yAxisOptions);
each(yAxisOptions,function(axis,i){axis.index=i
});
axes=xAxisOptions.concat(yAxisOptions);
chart.xAxis=[];
chart.yAxis=[];
axes=map(axes,function(axisOptions){axis=new Axis(axisOptions);
chart[axis.isXAxis?"xAxis":"yAxis"].push(axis);
return axis
});
adjustTickAmounts()
}function getSelectedPoints(){var points=[];
each(series,function(serie){points=points.concat(grep(serie.data,function(point){return point.selected
}))
});
return points
}function getSelectedSeries(){return grep(series,function(serie){return serie.selected
})
}zoomOut=function(){fireEvent(chart,"selection",{resetSelection:true},zoom);
chart.toolbar.remove("zoom")
};
zoom=function(event){var lang=defaultOptions.lang,animate=chart.pointCount<100;
chart.toolbar.add("zoom",lang.resetZoom,lang.resetZoomTitle,zoomOut);
if(!event||event.resetSelection){each(axes,function(axis){axis.setExtremes(null,null,false,animate)
})
}else{each(event.xAxis.concat(event.yAxis),function(axisData){var axis=axisData.axis;
if(chart.tracker[axis.isXAxis?"zoomX":"zoomY"]){axis.setExtremes(axisData.min,axisData.max,false,animate)
}})
}redraw()
};
function setTitle(titleOptions,subtitleOptions){chartTitleOptions=merge(options.title,titleOptions);
chartSubtitleOptions=merge(options.subtitle,subtitleOptions);
each([["title",titleOptions,chartTitleOptions],["subtitle",subtitleOptions,chartSubtitleOptions]],function(arr){var name=arr[0],title=chart[name],titleOptions=arr[1],chartTitleOptions=arr[2];
if(title&&titleOptions){title=title.destroy()
}if(chartTitleOptions&&chartTitleOptions.text&&!title){chart[name]=renderer.text(chartTitleOptions.text,0,0,chartTitleOptions.useHTML).attr({align:chartTitleOptions.align,"class":"highcharts-"+name,zIndex:1}).css(chartTitleOptions.style).add().align(chartTitleOptions,false,spacingBox)
}})
}function getChartSize(){containerWidth=(renderToClone||renderTo).offsetWidth;
containerHeight=(renderToClone||renderTo).offsetHeight;
chart.chartWidth=chartWidth=optionsChart.width||containerWidth||600;
chart.chartHeight=chartHeight=optionsChart.height||(containerHeight>19?containerHeight:400)
}function getContainer(){renderTo=optionsChart.renderTo;
containerId=PREFIX+idCounter++;
if(isString(renderTo)){renderTo=doc.getElementById(renderTo)
}renderTo.innerHTML="";
if(!renderTo.offsetWidth){renderToClone=renderTo.cloneNode(0);
css(renderToClone,{position:ABSOLUTE,top:"-9999px",display:""});
doc.body.appendChild(renderToClone)
}getChartSize();
chart.container=container=createElement(DIV,{className:"highcharts-container"+(optionsChart.className?" "+optionsChart.className:""),id:containerId},extend({position:RELATIVE,overflow:HIDDEN,width:chartWidth+PX,height:chartHeight+PX,textAlign:"left"},optionsChart.style),renderToClone||renderTo);
chart.renderer=renderer=optionsChart.forExport?new SVGRenderer(container,chartWidth,chartHeight,true):new Renderer(container,chartWidth,chartHeight);
var subPixelFix,rect;
if(isFirefox&&container.getBoundingClientRect){subPixelFix=function(){css(container,{left:0,top:0});
rect=container.getBoundingClientRect();
css(container,{left:(-(rect.left-pInt(rect.left)))+PX,top:(-(rect.top-pInt(rect.top)))+PX})
};
subPixelFix();
addEvent(win,"resize",subPixelFix);
addEvent(chart,"destroy",function(){removeEvent(win,"resize",subPixelFix)
})
}}getMargins=function(){var legendOptions=options.legend,legendMargin=pick(legendOptions.margin,10),legendX=legendOptions.x,legendY=legendOptions.y,align=legendOptions.align,verticalAlign=legendOptions.verticalAlign,titleOffset;
resetMargins();
if((chart.title||chart.subtitle)&&!defined(optionsMarginTop)){titleOffset=mathMax((chart.title&&!chartTitleOptions.floating&&!chartTitleOptions.verticalAlign&&chartTitleOptions.y)||0,(chart.subtitle&&!chartSubtitleOptions.floating&&!chartSubtitleOptions.verticalAlign&&chartSubtitleOptions.y)||0);
if(titleOffset){plotTop=mathMax(plotTop,titleOffset+pick(chartTitleOptions.margin,15)+spacingTop)
}}if(legendOptions.enabled&&!legendOptions.floating){if(align==="right"){if(!defined(optionsMarginRight)){marginRight=mathMax(marginRight,legendWidth-legendX+legendMargin+spacingRight)
}}else{if(align==="left"){if(!defined(optionsMarginLeft)){plotLeft=mathMax(plotLeft,legendWidth+legendX+legendMargin+spacingLeft)
}}else{if(verticalAlign==="top"){if(!defined(optionsMarginTop)){plotTop=mathMax(plotTop,legendHeight+legendY+legendMargin+spacingTop)
}}else{if(verticalAlign==="bottom"){if(!defined(optionsMarginBottom)){marginBottom=mathMax(marginBottom,legendHeight-legendY+legendMargin+spacingBottom)
}}}}}}if(hasCartesianSeries){each(axes,function(axis){axis.getOffset()
})
}if(!defined(optionsMarginLeft)){plotLeft+=axisOffset[3]
}if(!defined(optionsMarginTop)){plotTop+=axisOffset[0]
}if(!defined(optionsMarginBottom)){marginBottom+=axisOffset[2]
}if(!defined(optionsMarginRight)){marginRight+=axisOffset[1]
}setChartSize()
};
function initReflow(){var reflowTimeout;
function reflow(){var width=optionsChart.width||renderTo.offsetWidth,height=optionsChart.height||renderTo.offsetHeight;
if(width&&height){if(width!==containerWidth||height!==containerHeight){clearTimeout(reflowTimeout);
reflowTimeout=setTimeout(function(){resize(width,height,false)
},100)
}containerWidth=width;
containerHeight=height
}}addEvent(win,"resize",reflow);
addEvent(chart,"destroy",function(){removeEvent(win,"resize",reflow)
})
}function fireEndResize(){fireEvent(chart,"endResize",null,function(){isResizing-=1
})
}resize=function(width,height,animation){var chartTitle=chart.title,chartSubtitle=chart.subtitle;
isResizing+=1;
setAnimation(animation,chart);
oldChartHeight=chartHeight;
oldChartWidth=chartWidth;
chart.chartWidth=chartWidth=mathRound(width);
chart.chartHeight=chartHeight=mathRound(height);
css(container,{width:chartWidth+PX,height:chartHeight+PX});
renderer.setSize(chartWidth,chartHeight,animation);
plotWidth=chartWidth-plotLeft-marginRight;
plotHeight=chartHeight-plotTop-marginBottom;
maxTicks=null;
each(axes,function(axis){axis.isDirty=true;
axis.setScale()
});
each(series,function(serie){serie.isDirty=true
});
chart.isDirtyLegend=true;
chart.isDirtyBox=true;
getMargins();
if(chartTitle){chartTitle.align(null,null,spacingBox)
}if(chartSubtitle){chartSubtitle.align(null,null,spacingBox)
}redraw(animation);
oldChartHeight=null;
fireEvent(chart,"resize");
if(globalAnimation===false){fireEndResize()
}else{setTimeout(fireEndResize,(globalAnimation&&globalAnimation.duration)||500)
}};
setChartSize=function(){chart.plotLeft=plotLeft=mathRound(plotLeft);
chart.plotTop=plotTop=mathRound(plotTop);
chart.plotWidth=plotWidth=mathRound(chartWidth-plotLeft-marginRight);
chart.plotHeight=plotHeight=mathRound(chartHeight-plotTop-marginBottom);
chart.plotSizeX=inverted?plotHeight:plotWidth;
chart.plotSizeY=inverted?plotWidth:plotHeight;
spacingBox={x:spacingLeft,y:spacingTop,width:chartWidth-spacingLeft-spacingRight,height:chartHeight-spacingTop-spacingBottom}
};
resetMargins=function(){plotTop=pick(optionsMarginTop,spacingTop);
marginRight=pick(optionsMarginRight,spacingRight);
marginBottom=pick(optionsMarginBottom,spacingBottom);
plotLeft=pick(optionsMarginLeft,spacingLeft);
axisOffset=[0,0,0,0]
};
drawChartBox=function(){var chartBorderWidth=optionsChart.borderWidth||0,chartBackgroundColor=optionsChart.backgroundColor,plotBackgroundColor=optionsChart.plotBackgroundColor,plotBackgroundImage=optionsChart.plotBackgroundImage,mgn,plotSize={x:plotLeft,y:plotTop,width:plotWidth,height:plotHeight};
mgn=chartBorderWidth+(optionsChart.shadow?8:0);
if(chartBorderWidth||chartBackgroundColor){if(!chartBackground){chartBackground=renderer.rect(mgn/2,mgn/2,chartWidth-mgn,chartHeight-mgn,optionsChart.borderRadius,chartBorderWidth).attr({stroke:optionsChart.borderColor,"stroke-width":chartBorderWidth,fill:chartBackgroundColor||NONE}).add().shadow(optionsChart.shadow)
}else{chartBackground.animate(chartBackground.crisp(null,null,null,chartWidth-mgn,chartHeight-mgn))
}}if(plotBackgroundColor){if(!plotBackground){plotBackground=renderer.rect(plotLeft,plotTop,plotWidth,plotHeight,0).attr({fill:plotBackgroundColor}).add().shadow(optionsChart.plotShadow)
}else{plotBackground.animate(plotSize)
}}if(plotBackgroundImage){if(!plotBGImage){plotBGImage=renderer.image(plotBackgroundImage,plotLeft,plotTop,plotWidth,plotHeight).add()
}else{plotBGImage.animate(plotSize)
}}if(optionsChart.plotBorderWidth){if(!plotBorder){plotBorder=renderer.rect(plotLeft,plotTop,plotWidth,plotHeight,0,optionsChart.plotBorderWidth).attr({stroke:optionsChart.plotBorderColor,"stroke-width":optionsChart.plotBorderWidth,zIndex:4}).add()
}else{plotBorder.animate(plotBorder.crisp(null,plotLeft,plotTop,plotWidth,plotHeight))
}}chart.isDirtyBox=false
};
function render(){var labels=options.labels,credits=options.credits,creditsHref;
setTitle();
legend=chart.legend=new Legend();
getMargins();
each(axes,function(axis){axis.setTickPositions(true)
});
adjustTickAmounts();
getMargins();
drawChartBox();
if(hasCartesianSeries){each(axes,function(axis){axis.render()
})
}if(!chart.seriesGroup){chart.seriesGroup=renderer.g("series-group").attr({zIndex:3}).add()
}each(series,function(serie){serie.translate();
serie.setTooltipPoints();
serie.render()
});
if(labels.items){each(labels.items,function(){var style=extend(labels.style,this.style),x=pInt(style.left)+plotLeft,y=pInt(style.top)+plotTop+12;
delete style.left;
delete style.top;
renderer.text(this.html,x,y).attr({zIndex:2}).css(style).add()
})
}if(!chart.toolbar){chart.toolbar=Toolbar()
}if(credits.enabled&&!chart.credits){creditsHref=credits.href;
chart.credits=renderer.text(credits.text,0,0).on("click",function(){if(creditsHref){location.href=creditsHref
}}).attr({align:credits.position.align,zIndex:8}).css(credits.style).add().align(credits.position)
}placeTrackerGroup();
chart.hasRendered=true;
if(renderToClone){renderTo.appendChild(container);
discardElement(renderToClone)
}}function destroy(){var i,parentNode=container&&container.parentNode;
if(chart===null){return
}fireEvent(chart,"destroy");
removeEvent(win,"unload",destroy);
removeEvent(chart);
i=axes.length;
while(i--){axes[i]=axes[i].destroy()
}i=series.length;
while(i--){series[i]=series[i].destroy()
}each(["title","subtitle","seriesGroup","clipRect","credits","tracker"],function(name){var prop=chart[name];
if(prop){chart[name]=prop.destroy()
}});
each([chartBackground,legend,tooltip,renderer,tracker],function(obj){if(obj&&obj.destroy){obj.destroy()
}});
chartBackground=legend=tooltip=renderer=tracker=null;
if(container){container.innerHTML="";
removeEvent(container);
if(parentNode){parentNode.removeChild(container)
}container=null
}clearInterval(tooltipInterval);
for(i in chart){delete chart[i]
}chart=null
}function firstRender(){var ONREADYSTATECHANGE="onreadystatechange",COMPLETE="complete";
if(!hasSVG&&win==win.top&&doc.readyState!==COMPLETE){doc.attachEvent(ONREADYSTATECHANGE,function(){doc.detachEvent(ONREADYSTATECHANGE,firstRender);
if(doc.readyState===COMPLETE){firstRender()
}});
return
}getContainer();
resetMargins();
setChartSize();
each(options.series||[],function(serieOptions){initSeries(serieOptions)
});
chart.inverted=inverted=pick(inverted,options.chart.inverted);
getAxes();
chart.render=render;
chart.tracker=tracker=new MouseTracker(options.tooltip);
render();
fireEvent(chart,"load");
if(callback){callback.apply(chart,[chart])
}each(chart.callbacks,function(fn){fn.apply(chart,[chart])
})
}addEvent(win,"unload",destroy);
if(optionsChart.reflow!==false){addEvent(chart,"load",initReflow)
}if(chartEvents){for(eventType in chartEvents){addEvent(chart,eventType,chartEvents[eventType])
}}chart.options=options;
chart.series=series;
chart.addSeries=addSeries;
chart.animation=pick(optionsChart.animation,true);
chart.destroy=destroy;
chart.get=get;
chart.getSelectedPoints=getSelectedPoints;
chart.getSelectedSeries=getSelectedSeries;
chart.hideLoading=hideLoading;
chart.isInsidePlot=isInsidePlot;
chart.redraw=redraw;
chart.setSize=resize;
chart.setTitle=setTitle;
chart.showLoading=showLoading;
chart.pointCount=0;
chart.counters=new ChartCounters();
firstRender()
}Chart.prototype.callbacks=[];
var Point=function(){};
Point.prototype={init:function(series,options){var point=this,counters=series.chart.counters,defaultColors;
point.series=series;
point.applyOptions(options);
point.pointAttr={};
if(series.options.colorByPoint){defaultColors=series.chart.options.colors;
if(!point.options){point.options={}
}point.color=point.options.color=point.color||defaultColors[counters.color++];
counters.wrapColor(defaultColors.length)
}series.chart.pointCount++;
return point
},applyOptions:function(options){var point=this,series=point.series;
point.config=options;
if(isNumber(options)||options===null){point.y=options
}else{if(isObject(options)&&!isNumber(options.length)){extend(point,options);
point.options=options
}else{if(isString(options[0])){point.name=options[0];
point.y=options[1]
}else{if(isNumber(options[0])){point.x=options[0];
point.y=options[1]
}}}}if(point.x===UNDEFINED){point.x=series.autoIncrement()
}},destroy:function(){var point=this,series=point.series,hoverPoints=series.chart.hoverPoints,prop;
series.chart.pointCount--;
if(hoverPoints){point.setState();
erase(hoverPoints,point)
}if(point===series.chart.hoverPoint){point.onMouseOut()
}removeEvent(point);
each(["graphic","tracker","group","dataLabel","connector","shadowGroup"],function(prop){if(point[prop]){point[prop].destroy()
}});
if(point.legendItem){point.series.chart.legend.destroyItem(point)
}for(prop in point){point[prop]=null
}},getLabelConfig:function(){var point=this;
return{x:point.category,y:point.y,series:point.series,point:point,percentage:point.percentage,total:point.total||point.stackTotal}
},select:function(selected,accumulate){var point=this,series=point.series,chart=series.chart;
selected=pick(selected,!point.selected);
point.firePointEvent(selected?"select":"unselect",{accumulate:accumulate},function(){point.selected=selected;
point.setState(selected&&SELECT_STATE);
if(!accumulate){each(chart.getSelectedPoints(),function(loopPoint){if(loopPoint.selected&&loopPoint!==point){loopPoint.selected=false;
loopPoint.setState(NORMAL_STATE);
loopPoint.firePointEvent("unselect")
}})
}})
},onMouseOver:function(){var point=this,chart=point.series.chart,tooltip=chart.tooltip,hoverPoint=chart.hoverPoint;
if(hoverPoint&&hoverPoint!==point){hoverPoint.onMouseOut()
}point.firePointEvent("mouseOver");
if(tooltip&&!tooltip.shared){tooltip.refresh(point)
}point.setState(HOVER_STATE);
chart.hoverPoint=point
},onMouseOut:function(){var point=this;
point.firePointEvent("mouseOut");
point.setState();
point.series.chart.hoverPoint=null
},tooltipFormatter:function(useHeader){var point=this,series=point.series;
return['<span style="color:'+series.color+'">',(point.name||series.name),"</span>: ",(!useHeader?("<b>x = "+(point.name||point.x)+",</b> "):""),"<b>",(!useHeader?"y = ":""),point.y,"</b>"].join("")
},update:function(options,redraw,animation){var point=this,series=point.series,graphic=point.graphic,chart=series.chart;
redraw=pick(redraw,true);
point.firePointEvent("update",{options:options},function(){point.applyOptions(options);
if(isObject(options)){series.getAttribs();
if(graphic){graphic.attr(point.pointAttr[series.state])
}}series.isDirty=true;
if(redraw){chart.redraw(animation)
}})
},remove:function(redraw,animation){var point=this,series=point.series,chart=series.chart,data=series.data;
setAnimation(animation,chart);
redraw=pick(redraw,true);
point.firePointEvent("remove",null,function(){erase(data,point);
point.destroy();
series.isDirty=true;
if(redraw){chart.redraw()
}})
},firePointEvent:function(eventType,eventArgs,defaultFunction){var point=this,series=this.series,seriesOptions=series.options;
if(seriesOptions.point.events[eventType]||(point.options&&point.options.events&&point.options.events[eventType])){this.importEvents()
}if(eventType==="click"&&seriesOptions.allowPointSelect){defaultFunction=function(event){point.select(null,event.ctrlKey||event.metaKey||event.shiftKey)
}
}fireEvent(this,eventType,eventArgs,defaultFunction)
},importEvents:function(){if(!this.hasImportedEvents){var point=this,options=merge(point.series.options.point,point.options),events=options.events,eventType;
point.events=events;
for(eventType in events){addEvent(point,eventType,events[eventType])
}this.hasImportedEvents=true
}},setState:function(state){var point=this,series=point.series,stateOptions=series.options.states,markerOptions=defaultPlotOptions[series.type].marker&&series.options.marker,normalDisabled=markerOptions&&!markerOptions.enabled,markerStateOptions=markerOptions&&markerOptions.states[state],stateDisabled=markerStateOptions&&markerStateOptions.enabled===false,stateMarkerGraphic=series.stateMarkerGraphic,chart=series.chart,pointAttr=point.pointAttr;
state=state||NORMAL_STATE;
if(state===point.state||(point.selected&&state!==SELECT_STATE)||(stateOptions[state]&&stateOptions[state].enabled===false)||(state&&(stateDisabled||(normalDisabled&&!markerStateOptions.enabled)))){return
}if(point.graphic){point.graphic.attr(pointAttr[state])
}else{if(state){if(!stateMarkerGraphic){series.stateMarkerGraphic=stateMarkerGraphic=chart.renderer.circle(0,0,pointAttr[state].r).attr(pointAttr[state]).add(series.group)
}stateMarkerGraphic.translate(point.plotX,point.plotY)
}if(stateMarkerGraphic){stateMarkerGraphic[state?"show":"hide"]()
}}point.state=state
}};
var Series=function(){};
Series.prototype={isCartesian:true,type:"line",pointClass:Point,pointAttrToOptions:{stroke:"lineColor","stroke-width":"lineWidth",fill:"fillColor",r:"radius"},init:function(chart,options){var series=this,eventType,events,index=chart.series.length;
series.chart=chart;
options=series.setOptions(options);
extend(series,{index:index,options:options,name:options.name||"Series "+(index+1),state:NORMAL_STATE,pointAttr:{},visible:options.visible!==false,selected:options.selected===true});
events=options.events;
for(eventType in events){addEvent(series,eventType,events[eventType])
}if((events&&events.click)||(options.point&&options.point.events&&options.point.events.click)||options.allowPointSelect){chart.runTrackerClick=true
}series.getColor();
series.getSymbol();
series.setData(options.data,false)
},autoIncrement:function(){var series=this,options=series.options,xIncrement=series.xIncrement;
xIncrement=pick(xIncrement,options.pointStart,0);
series.pointInterval=pick(series.pointInterval,options.pointInterval,1);
series.xIncrement=xIncrement+series.pointInterval;
return xIncrement
},cleanData:function(){var series=this,chart=series.chart,data=series.data,closestPoints,smallestInterval,chartSmallestInterval=chart.smallestInterval,interval,i;
stableSort(data,function(a,b){return(a.x-b.x)
});
if(series.options.connectNulls){for(i=data.length-1;
i>=0;
i--){if(data[i].y===null&&data[i-1]&&data[i+1]){data.splice(i,1)
}}}for(i=data.length-1;
i>=0;
i--){if(data[i-1]){interval=data[i].x-data[i-1].x;
if(interval>0&&(smallestInterval===UNDEFINED||interval<smallestInterval)){smallestInterval=interval;
closestPoints=i
}}}if(chartSmallestInterval===UNDEFINED||smallestInterval<chartSmallestInterval){chart.smallestInterval=smallestInterval
}series.closestPoints=closestPoints
},getSegments:function(){var lastNull=-1,segments=[],data=this.data;
each(data,function(point,i){if(point.y===null){if(i>lastNull+1){segments.push(data.slice(lastNull+1,i))
}lastNull=i
}else{if(i===data.length-1){segments.push(data.slice(lastNull+1,i+1))
}}});
this.segments=segments
},setOptions:function(itemOptions){var plotOptions=this.chart.options.plotOptions,options=merge(plotOptions[this.type],plotOptions.series,itemOptions);
return options
},getColor:function(){var defaultColors=this.chart.options.colors,counters=this.chart.counters;
this.color=this.options.color||defaultColors[counters.color++]||"#0000ff";
counters.wrapColor(defaultColors.length)
},getSymbol:function(){var defaultSymbols=this.chart.options.symbols,counters=this.chart.counters;
this.symbol=this.options.marker.symbol||defaultSymbols[counters.symbol++];
counters.wrapSymbol(defaultSymbols.length)
},addPoint:function(options,redraw,shift,animation){var series=this,data=series.data,graph=series.graph,area=series.area,chart=series.chart,point=(new series.pointClass()).init(series,options);
setAnimation(animation,chart);
if(graph&&shift){graph.shift=shift
}if(area){area.shift=shift;
area.isArea=true
}redraw=pick(redraw,true);
data.push(point);
if(shift){data[0].remove(false)
}series.getAttribs();
series.isDirty=true;
if(redraw){chart.redraw()
}},setData:function(data,redraw){var series=this,oldData=series.data,initialColor=series.initialColor,chart=series.chart,i=(oldData&&oldData.length)||0;
series.xIncrement=null;
if(defined(initialColor)){chart.counters.color=initialColor
}data=map(splat(data||[]),function(pointOptions){return(new series.pointClass()).init(series,pointOptions)
});
while(i--){oldData[i].destroy()
}series.data=data;
series.cleanData();
series.getSegments();
series.getAttribs();
series.isDirty=true;
chart.isDirtyBox=true;
if(pick(redraw,true)){chart.redraw(false)
}},remove:function(redraw,animation){var series=this,chart=series.chart;
redraw=pick(redraw,true);
if(!series.isRemoving){series.isRemoving=true;
fireEvent(series,"remove",null,function(){series.destroy();
chart.isDirtyLegend=chart.isDirtyBox=true;
if(redraw){chart.redraw(animation)
}})
}series.isRemoving=false
},translate:function(){var series=this,chart=series.chart,stacking=series.options.stacking,categories=series.xAxis.categories,yAxis=series.yAxis,data=series.data,i=data.length;
while(i--){var point=data[i],xValue=point.x,yValue=point.y,yBottom=point.low,stack=yAxis.stacks[(yValue<0?"-":"")+series.stackKey],pointStack,pointStackTotal;
point.plotX=series.xAxis.translate(xValue);
if(stacking&&series.visible&&stack&&stack[xValue]){pointStack=stack[xValue];
pointStackTotal=pointStack.total;
pointStack.cum=yBottom=pointStack.cum-yValue;
yValue=yBottom+yValue;
if(stacking==="percent"){yBottom=pointStackTotal?yBottom*100/pointStackTotal:0;
yValue=pointStackTotal?yValue*100/pointStackTotal:0
}point.percentage=pointStackTotal?point.y*100/pointStackTotal:0;
point.stackTotal=pointStackTotal
}if(defined(yBottom)){point.yBottom=yAxis.translate(yBottom,0,1,0,1)
}if(yValue!==null){point.plotY=yAxis.translate(yValue,0,1,0,1)
}point.clientX=chart.inverted?chart.plotHeight-point.plotX:point.plotX;
point.category=categories&&categories[point.x]!==UNDEFINED?categories[point.x]:point.x
}},setTooltipPoints:function(renew){var series=this,chart=series.chart,inverted=chart.inverted,data=[],plotSize=mathRound((inverted?chart.plotTop:chart.plotLeft)+chart.plotSizeX),low,high,tooltipPoints=[];
if(renew){series.tooltipPoints=null
}each(series.segments,function(segment){data=data.concat(segment)
});
if(series.xAxis&&series.xAxis.reversed){data=data.reverse()
}each(data,function(point,i){low=data[i-1]?data[i-1]._high+1:0;
high=point._high=data[i+1]?(mathFloor((point.plotX+(data[i+1]?data[i+1].plotX:plotSize))/2)):plotSize;
while(low<=high){tooltipPoints[inverted?plotSize-low++:low++]=point
}});
series.tooltipPoints=tooltipPoints
},onMouseOver:function(){var series=this,chart=series.chart,hoverSeries=chart.hoverSeries;
if(!hasTouch&&chart.mouseIsDown){return
}if(hoverSeries&&hoverSeries!==series){hoverSeries.onMouseOut()
}if(series.options.events.mouseOver){fireEvent(series,"mouseOver")
}if(series.tracker){series.tracker.toFront()
}series.setState(HOVER_STATE);
chart.hoverSeries=series
},onMouseOut:function(){var series=this,options=series.options,chart=series.chart,tooltip=chart.tooltip,hoverPoint=chart.hoverPoint;
if(hoverPoint){hoverPoint.onMouseOut()
}if(series&&options.events.mouseOut){fireEvent(series,"mouseOut")
}if(tooltip&&!options.stickyTracking){tooltip.hide()
}series.setState();
chart.hoverSeries=null
},animate:function(init){var series=this,chart=series.chart,clipRect=series.clipRect,animation=series.options.animation;
if(animation&&!isObject(animation)){animation={}
}if(init){if(!clipRect.isAnimating){clipRect.attr("width",0);
clipRect.isAnimating=true
}}else{clipRect.animate({width:chart.plotSizeX},animation);
this.animate=null
}},drawPoints:function(){var series=this,pointAttr,data=series.data,chart=series.chart,plotX,plotY,i,point,radius,graphic;
if(series.options.marker.enabled){i=data.length;
while(i--){point=data[i];
plotX=point.plotX;
plotY=point.plotY;
graphic=point.graphic;
if(plotY!==UNDEFINED&&!isNaN(plotY)){pointAttr=point.pointAttr[point.selected?SELECT_STATE:NORMAL_STATE];
radius=pointAttr.r;
if(graphic){graphic.animate({x:plotX,y:plotY,r:radius})
}else{point.graphic=chart.renderer.symbol(pick(point.marker&&point.marker.symbol,series.symbol),plotX,plotY,radius).attr(pointAttr).add(series.group)
}}}}},convertAttribs:function(options,base1,base2,base3){var conversion=this.pointAttrToOptions,attr,option,obj={};
options=options||{};
base1=base1||{};
base2=base2||{};
base3=base3||{};
for(attr in conversion){option=conversion[attr];
obj[attr]=pick(options[option],base1[attr],base2[attr],base3[attr])
}return obj
},getAttribs:function(){var series=this,normalOptions=defaultPlotOptions[series.type].marker?series.options.marker:series.options,stateOptions=normalOptions.states,stateOptionsHover=stateOptions[HOVER_STATE],pointStateOptionsHover,seriesColor=series.color,normalDefaults={stroke:seriesColor,fill:seriesColor},data=series.data,i,point,seriesPointAttr=[],pointAttr,pointAttrToOptions=series.pointAttrToOptions,hasPointSpecificOptions,key;
if(series.options.marker){stateOptionsHover.radius=stateOptionsHover.radius||normalOptions.radius+2;
stateOptionsHover.lineWidth=stateOptionsHover.lineWidth||normalOptions.lineWidth+1
}else{stateOptionsHover.color=stateOptionsHover.color||Color(stateOptionsHover.color||seriesColor).brighten(stateOptionsHover.brightness).get()
}seriesPointAttr[NORMAL_STATE]=series.convertAttribs(normalOptions,normalDefaults);
each([HOVER_STATE,SELECT_STATE],function(state){seriesPointAttr[state]=series.convertAttribs(stateOptions[state],seriesPointAttr[NORMAL_STATE])
});
series.pointAttr=seriesPointAttr;
i=data.length;
while(i--){point=data[i];
normalOptions=(point.options&&point.options.marker)||point.options;
if(normalOptions&&normalOptions.enabled===false){normalOptions.radius=0
}hasPointSpecificOptions=false;
if(point.options){for(key in pointAttrToOptions){if(defined(normalOptions[pointAttrToOptions[key]])){hasPointSpecificOptions=true
}}}if(hasPointSpecificOptions){pointAttr=[];
stateOptions=normalOptions.states||{};
pointStateOptionsHover=stateOptions[HOVER_STATE]=stateOptions[HOVER_STATE]||{};
if(!series.options.marker){pointStateOptionsHover.color=Color(pointStateOptionsHover.color||point.options.color).brighten(pointStateOptionsHover.brightness||stateOptionsHover.brightness).get()
}pointAttr[NORMAL_STATE]=series.convertAttribs(normalOptions,seriesPointAttr[NORMAL_STATE]);
pointAttr[HOVER_STATE]=series.convertAttribs(stateOptions[HOVER_STATE],seriesPointAttr[HOVER_STATE],pointAttr[NORMAL_STATE]);
pointAttr[SELECT_STATE]=series.convertAttribs(stateOptions[SELECT_STATE],seriesPointAttr[SELECT_STATE],pointAttr[NORMAL_STATE])
}else{pointAttr=seriesPointAttr
}point.pointAttr=pointAttr
}},destroy:function(){var series=this,chart=series.chart,seriesClipRect=series.clipRect,issue134=/\/5[0-9\.]+ (Safari|Mobile)\//.test(userAgent),destroy,prop;
fireEvent(series,"destroy");
removeEvent(series);
if(series.legendItem){series.chart.legend.destroyItem(series)
}each(series.data,function(point){point.destroy()
});
if(seriesClipRect&&seriesClipRect!==chart.clipRect){series.clipRect=seriesClipRect.destroy()
}each(["area","graph","dataLabelsGroup","group","tracker"],function(prop){if(series[prop]){destroy=issue134&&prop==="group"?"hide":"destroy";
series[prop][destroy]()
}});
if(chart.hoverSeries===series){chart.hoverSeries=null
}erase(chart.series,series);
for(prop in series){delete series[prop]
}},drawDataLabels:function(){if(this.options.dataLabels.enabled){var series=this,x,y,data=series.data,seriesOptions=series.options,options=seriesOptions.dataLabels,str,dataLabelsGroup=series.dataLabelsGroup,chart=series.chart,renderer=chart.renderer,inverted=chart.inverted,seriesType=series.type,color,stacking=seriesOptions.stacking,isBarLike=seriesType==="column"||seriesType==="bar",vAlignIsNull=options.verticalAlign===null,yIsNull=options.y===null;
if(isBarLike){if(stacking){if(vAlignIsNull){options=merge(options,{verticalAlign:"middle"})
}if(yIsNull){options=merge(options,{y:{top:14,middle:4,bottom:-6}[options.verticalAlign]})
}}else{if(vAlignIsNull){options=merge(options,{verticalAlign:"top"})
}}}if(!dataLabelsGroup){dataLabelsGroup=series.dataLabelsGroup=renderer.g("data-labels").attr({visibility:series.visible?VISIBLE:HIDDEN,zIndex:6}).translate(chart.plotLeft,chart.plotTop).add()
}else{dataLabelsGroup.translate(chart.plotLeft,chart.plotTop)
}color=options.color;
if(color==="auto"){color=null
}options.style.color=pick(color,series.color,"black");
each(data,function(point){var barX=point.barX,plotX=(barX&&barX+point.barW/2)||point.plotX||-999,plotY=pick(point.plotY,-999),dataLabel=point.dataLabel,align=options.align,individualYDelta=yIsNull?(point.y>=0?-6:12):options.y;
str=options.formatter.call(point.getLabelConfig());
x=(inverted?chart.plotWidth-plotY:plotX)+options.x;
y=(inverted?chart.plotHeight-plotX:plotY)+individualYDelta;
if(seriesType==="column"){x+={left:-1,right:1}[align]*point.barW/2||0
}if(inverted&&point.y<0){align="right";
x-=10
}if(dataLabel){if(inverted&&!options.y){y=y+pInt(dataLabel.styles.lineHeight)*0.9-dataLabel.getBBox().height/2
}dataLabel.attr({text:str}).animate({x:x,y:y})
}else{if(defined(str)){dataLabel=point.dataLabel=renderer.text(str,x,y).attr({align:align,rotation:options.rotation,zIndex:1}).css(options.style).add(dataLabelsGroup);
if(inverted&&!options.y){dataLabel.attr({y:y+pInt(dataLabel.styles.lineHeight)*0.9-dataLabel.getBBox().height/2})
}}}if(isBarLike&&seriesOptions.stacking&&dataLabel){var barY=point.barY,barW=point.barW,barH=point.barH;
dataLabel.align(options,null,{x:inverted?chart.plotWidth-barY-barH:barX,y:inverted?chart.plotHeight-barX-barW:barY,width:inverted?barH:barW,height:inverted?barW:barH})
}})
}},drawGraph:function(){var series=this,options=series.options,chart=series.chart,graph=series.graph,graphPath=[],fillColor,area=series.area,group=series.group,color=options.lineColor||series.color,lineWidth=options.lineWidth,dashStyle=options.dashStyle,segmentPath,renderer=chart.renderer,translatedThreshold=series.yAxis.getThreshold(options.threshold||0),useArea=/^area/.test(series.type),singlePoints=[],areaPath=[],attribs;
each(series.segments,function(segment){segmentPath=[];
each(segment,function(point,i){if(series.getPointSpline){segmentPath.push.apply(segmentPath,series.getPointSpline(segment,point,i))
}else{segmentPath.push(i?L:M);
if(i&&options.step){var lastPoint=segment[i-1];
segmentPath.push(point.plotX,lastPoint.plotY)
}segmentPath.push(point.plotX,point.plotY)
}});
if(segment.length>1){graphPath=graphPath.concat(segmentPath)
}else{singlePoints.push(segment[0])
}if(useArea){var areaSegmentPath=[],i,segLength=segmentPath.length;
for(i=0;
i<segLength;
i++){areaSegmentPath.push(segmentPath[i])
}if(segLength===3){areaSegmentPath.push(L,segmentPath[1],segmentPath[2])
}if(options.stacking&&series.type!=="areaspline"){for(i=segment.length-1;
i>=0;
i--){areaSegmentPath.push(segment[i].plotX,segment[i].yBottom)
}}else{areaSegmentPath.push(L,segment[segment.length-1].plotX,translatedThreshold,L,segment[0].plotX,translatedThreshold)
}areaPath=areaPath.concat(areaSegmentPath)
}});
series.graphPath=graphPath;
series.singlePoints=singlePoints;
if(useArea){fillColor=pick(options.fillColor,Color(series.color).setOpacity(options.fillOpacity||0.75).get());
if(area){area.animate({d:areaPath})
}else{series.area=series.chart.renderer.path(areaPath).attr({fill:fillColor}).add(group)
}}if(graph){stop(graph);
graph.animate({d:graphPath})
}else{if(lineWidth){attribs={"stroke":color,"stroke-width":lineWidth};
if(dashStyle){attribs.dashstyle=dashStyle
}series.graph=renderer.path(graphPath).attr(attribs).add(group).shadow(options.shadow)
}}},render:function(){var series=this,chart=series.chart,group,setInvert,options=series.options,animation=options.animation,doAnimation=animation&&series.animate,duration=doAnimation?(animation&&animation.duration)||500:0,clipRect=series.clipRect,renderer=chart.renderer;
if(!clipRect){clipRect=series.clipRect=!chart.hasRendered&&chart.clipRect?chart.clipRect:renderer.clipRect(0,0,chart.plotSizeX,chart.plotSizeY);
if(!chart.clipRect){chart.clipRect=clipRect
}}if(!series.group){group=series.group=renderer.g("series");
if(chart.inverted){setInvert=function(){group.attr({width:chart.plotWidth,height:chart.plotHeight}).invert()
};
setInvert();
addEvent(chart,"resize",setInvert);
addEvent(series,"destroy",function(){removeEvent(chart,"resize",setInvert)
})
}group.clip(series.clipRect).attr({visibility:series.visible?VISIBLE:HIDDEN,zIndex:options.zIndex}).translate(chart.plotLeft,chart.plotTop).add(chart.seriesGroup)
}series.drawDataLabels();
if(doAnimation){series.animate(true)
}if(series.drawGraph){series.drawGraph()
}series.drawPoints();
if(series.options.enableMouseTracking!==false){series.drawTracker()
}if(doAnimation){series.animate()
}setTimeout(function(){clipRect.isAnimating=false;
group=series.group;
if(group&&clipRect!==chart.clipRect&&clipRect.renderer){group.clip((series.clipRect=chart.clipRect));
clipRect.destroy()
}},duration);
series.isDirty=false
},redraw:function(){var series=this,chart=series.chart,group=series.group;
if(group){if(chart.inverted){group.attr({width:chart.plotWidth,height:chart.plotHeight})
}group.animate({translateX:chart.plotLeft,translateY:chart.plotTop})
}series.translate();
series.setTooltipPoints(true);
series.render()
},setState:function(state){var series=this,options=series.options,graph=series.graph,stateOptions=options.states,lineWidth=options.lineWidth;
state=state||NORMAL_STATE;
if(series.state!==state){series.state=state;
if(stateOptions[state]&&stateOptions[state].enabled===false){return
}if(state){lineWidth=stateOptions[state].lineWidth||lineWidth+1
}if(graph&&!graph.dashstyle){graph.attr({"stroke-width":lineWidth},state?0:500)
}}},setVisible:function(vis,redraw){var series=this,chart=series.chart,legendItem=series.legendItem,seriesGroup=series.group,seriesTracker=series.tracker,dataLabelsGroup=series.dataLabelsGroup,showOrHide,i,data=series.data,point,ignoreHiddenSeries=chart.options.chart.ignoreHiddenSeries,oldVisibility=series.visible;
series.visible=vis=vis===UNDEFINED?!oldVisibility:vis;
showOrHide=vis?"show":"hide";
if(seriesGroup){seriesGroup[showOrHide]()
}if(seriesTracker){seriesTracker[showOrHide]()
}else{i=data.length;
while(i--){point=data[i];
if(point.tracker){point.tracker[showOrHide]()
}}}if(dataLabelsGroup){dataLabelsGroup[showOrHide]()
}if(legendItem){chart.legend.colorizeItem(series,vis)
}series.isDirty=true;
if(series.options.stacking){each(chart.series,function(otherSeries){if(otherSeries.options.stacking&&otherSeries.visible){otherSeries.isDirty=true
}})
}if(ignoreHiddenSeries){chart.isDirtyBox=true
}if(redraw!==false){chart.redraw()
}fireEvent(series,showOrHide)
},show:function(){this.setVisible(true)
},hide:function(){this.setVisible(false)
},select:function(selected){var series=this;
series.selected=selected=(selected===UNDEFINED)?!series.selected:selected;
if(series.checkbox){series.checkbox.checked=selected
}fireEvent(series,selected?"select":"unselect")
},drawTracker:function(){var series=this,options=series.options,trackerPath=[].concat(series.graphPath),trackerPathLength=trackerPath.length,chart=series.chart,snap=chart.options.tooltip.snap,tracker=series.tracker,cursor=options.cursor,css=cursor&&{cursor:cursor},singlePoints=series.singlePoints,singlePoint,i;
if(trackerPathLength){i=trackerPathLength+1;
while(i--){if(trackerPath[i]===M){trackerPath.splice(i+1,0,trackerPath[i+1]-snap,trackerPath[i+2],L)
}if((i&&trackerPath[i]===M)||i===trackerPathLength){trackerPath.splice(i,0,L,trackerPath[i-2]+snap,trackerPath[i-1])
}}}for(i=0;
i<singlePoints.length;
i++){singlePoint=singlePoints[i];
trackerPath.push(M,singlePoint.plotX-snap,singlePoint.plotY,L,singlePoint.plotX+snap,singlePoint.plotY)
}if(tracker){tracker.attr({d:trackerPath})
}else{series.tracker=chart.renderer.path(trackerPath).attr({isTracker:true,stroke:TRACKER_FILL,fill:NONE,"stroke-width":options.lineWidth+2*snap,visibility:series.visible?VISIBLE:HIDDEN,zIndex:options.zIndex||1}).on(hasTouch?"touchstart":"mouseover",function(){if(chart.hoverSeries!==series){series.onMouseOver()
}}).on("mouseout",function(){if(!options.stickyTracking){series.onMouseOut()
}}).css(css).add(chart.trackerGroup)
}}};
var LineSeries=extendClass(Series);
seriesTypes.line=LineSeries;
var AreaSeries=extendClass(Series,{type:"area"});
seriesTypes.area=AreaSeries;
var SplineSeries=extendClass(Series,{type:"spline",getPointSpline:function(segment,point,i){var smoothing=1.5,denom=smoothing+1,plotX=point.plotX,plotY=point.plotY,lastPoint=segment[i-1],nextPoint=segment[i+1],leftContX,leftContY,rightContX,rightContY,ret;
if(i&&i<segment.length-1){var lastX=lastPoint.plotX,lastY=lastPoint.plotY,nextX=nextPoint.plotX,nextY=nextPoint.plotY,correction;
leftContX=(smoothing*plotX+lastX)/denom;
leftContY=(smoothing*plotY+lastY)/denom;
rightContX=(smoothing*plotX+nextX)/denom;
rightContY=(smoothing*plotY+nextY)/denom;
correction=((rightContY-leftContY)*(rightContX-plotX))/(rightContX-leftContX)+plotY-rightContY;
leftContY+=correction;
rightContY+=correction;
if(leftContY>lastY&&leftContY>plotY){leftContY=mathMax(lastY,plotY);
rightContY=2*plotY-leftContY
}else{if(leftContY<lastY&&leftContY<plotY){leftContY=mathMin(lastY,plotY);
rightContY=2*plotY-leftContY
}}if(rightContY>nextY&&rightContY>plotY){rightContY=mathMax(nextY,plotY);
leftContY=2*plotY-rightContY
}else{if(rightContY<nextY&&rightContY<plotY){rightContY=mathMin(nextY,plotY);
leftContY=2*plotY-rightContY
}}point.rightContX=rightContX;
point.rightContY=rightContY
}if(!i){ret=[M,plotX,plotY]
}else{ret=["C",lastPoint.rightContX||lastPoint.plotX,lastPoint.rightContY||lastPoint.plotY,leftContX||plotX,leftContY||plotY,plotX,plotY];
lastPoint.rightContX=lastPoint.rightContY=null
}return ret
}});
seriesTypes.spline=SplineSeries;
var AreaSplineSeries=extendClass(SplineSeries,{type:"areaspline"});
seriesTypes.areaspline=AreaSplineSeries;
var ColumnSeries=extendClass(Series,{type:"column",pointAttrToOptions:{stroke:"borderColor","stroke-width":"borderWidth",fill:"color",r:"borderRadius"},init:function(){Series.prototype.init.apply(this,arguments);
var series=this,chart=series.chart;
chart.hasColumn=true;
if(chart.hasRendered){each(chart.series,function(otherSeries){if(otherSeries.type===series.type){otherSeries.isDirty=true
}})
}},translate:function(){var series=this,chart=series.chart,options=series.options,stacking=options.stacking,borderWidth=options.borderWidth,columnCount=0,reversedXAxis=series.xAxis.reversed,categories=series.xAxis.categories,stackGroups={},stackKey,columnIndex;
Series.prototype.translate.apply(series);
each(chart.series,function(otherSeries){if(otherSeries.type===series.type&&otherSeries.visible){if(otherSeries.options.stacking){stackKey=otherSeries.stackKey;
if(stackGroups[stackKey]===UNDEFINED){stackGroups[stackKey]=columnCount++
}columnIndex=stackGroups[stackKey]
}else{columnIndex=columnCount++
}otherSeries.columnIndex=columnIndex
}});
var data=series.data,closestPoints=series.closestPoints,categoryWidth=mathAbs(data[1]?data[closestPoints].plotX-data[closestPoints-1].plotX:chart.plotSizeX/((categories&&categories.length)||1)),groupPadding=categoryWidth*options.groupPadding,groupWidth=categoryWidth-2*groupPadding,pointOffsetWidth=groupWidth/columnCount,optionPointWidth=options.pointWidth,pointPadding=defined(optionPointWidth)?(pointOffsetWidth-optionPointWidth)/2:pointOffsetWidth*options.pointPadding,pointWidth=mathMax(pick(optionPointWidth,pointOffsetWidth-2*pointPadding),1),colIndex=(reversedXAxis?columnCount-series.columnIndex:series.columnIndex)||0,pointXOffset=pointPadding+(groupPadding+colIndex*pointOffsetWidth-(categoryWidth/2))*(reversedXAxis?-1:1),threshold=options.threshold||0,translatedThreshold=series.yAxis.getThreshold(threshold),minPointLength=pick(options.minPointLength,5);
each(data,function(point){var plotY=point.plotY,yBottom=point.yBottom||translatedThreshold,barX=point.plotX+pointXOffset,barY=mathCeil(mathMin(plotY,yBottom)),barH=mathCeil(mathMax(plotY,yBottom)-barY),stack=series.yAxis.stacks[(point.y<0?"-":"")+series.stackKey],trackerY,shapeArgs;
if(stacking&&series.visible&&stack&&stack[point.x]){stack[point.x].setOffset(pointXOffset,pointWidth)
}if(mathAbs(barH)<minPointLength){if(minPointLength){barH=minPointLength;
barY=mathAbs(barY-translatedThreshold)>minPointLength?yBottom-minPointLength:translatedThreshold-(plotY<=translatedThreshold?minPointLength:0)
}trackerY=barY-3
}extend(point,{barX:barX,barY:barY,barW:pointWidth,barH:barH});
point.shapeType="rect";
shapeArgs=extend(chart.renderer.Element.prototype.crisp.apply({},[borderWidth,barX,barY,pointWidth,barH]),{r:options.borderRadius});
if(borderWidth%2){shapeArgs.y-=1;
shapeArgs.height+=1
}point.shapeArgs=shapeArgs;
point.trackerArgs=defined(trackerY)&&merge(point.shapeArgs,{height:mathMax(6,barH+3),y:trackerY})
})
},getSymbol:function(){},drawGraph:function(){},drawPoints:function(){var series=this,options=series.options,renderer=series.chart.renderer,graphic,shapeArgs;
each(series.data,function(point){var plotY=point.plotY;
if(plotY!==UNDEFINED&&!isNaN(plotY)&&point.y!==null){graphic=point.graphic;
shapeArgs=point.shapeArgs;
if(graphic){stop(graphic);
graphic.animate(shapeArgs)
}else{point.graphic=renderer[point.shapeType](shapeArgs).attr(point.pointAttr[point.selected?SELECT_STATE:NORMAL_STATE]).add(series.group).shadow(options.shadow)
}}})
},drawTracker:function(){var series=this,chart=series.chart,renderer=chart.renderer,shapeArgs,tracker,trackerLabel=+new Date(),options=series.options,cursor=options.cursor,css=cursor&&{cursor:cursor},rel;
each(series.data,function(point){tracker=point.tracker;
shapeArgs=point.trackerArgs||point.shapeArgs;
delete shapeArgs.strokeWidth;
if(point.y!==null){if(tracker){tracker.attr(shapeArgs)
}else{point.tracker=renderer[point.shapeType](shapeArgs).attr({isTracker:trackerLabel,fill:TRACKER_FILL,visibility:series.visible?VISIBLE:HIDDEN,zIndex:options.zIndex||1}).on(hasTouch?"touchstart":"mouseover",function(event){rel=event.relatedTarget||event.fromElement;
if(chart.hoverSeries!==series&&attr(rel,"isTracker")!==trackerLabel){series.onMouseOver()
}point.onMouseOver()
}).on("mouseout",function(event){if(!options.stickyTracking){rel=event.relatedTarget||event.toElement;
if(attr(rel,"isTracker")!==trackerLabel){series.onMouseOut()
}}}).css(css).add(point.group||chart.trackerGroup)
}}})
},animate:function(init){var series=this,data=series.data;
if(!init){each(data,function(point){var graphic=point.graphic,shapeArgs=point.shapeArgs;
if(graphic){graphic.attr({height:0,y:series.yAxis.translate(0,0,1)});
graphic.animate({height:shapeArgs.height,y:shapeArgs.y},series.options.animation)
}});
series.animate=null
}},remove:function(){var series=this,chart=series.chart;
if(chart.hasRendered){each(chart.series,function(otherSeries){if(otherSeries.type===series.type){otherSeries.isDirty=true
}})
}Series.prototype.remove.apply(series,arguments)
}});
seriesTypes.column=ColumnSeries;
var BarSeries=extendClass(ColumnSeries,{type:"bar",init:function(chart){chart.inverted=this.inverted=true;
ColumnSeries.prototype.init.apply(this,arguments)
}});
seriesTypes.bar=BarSeries;
var ScatterSeries=extendClass(Series,{type:"scatter",translate:function(){var series=this;
Series.prototype.translate.apply(series);
each(series.data,function(point){point.shapeType="circle";
point.shapeArgs={x:point.plotX,y:point.plotY,r:series.chart.options.tooltip.snap}
})
},drawTracker:function(){var series=this,cursor=series.options.cursor,css=cursor&&{cursor:cursor},graphic;
each(series.data,function(point){graphic=point.graphic;
if(graphic){graphic.attr({isTracker:true}).on("mouseover",function(){series.onMouseOver();
point.onMouseOver()
}).on("mouseout",function(){if(!series.options.stickyTracking){series.onMouseOut()
}}).css(css)
}})
},cleanData:function(){}});
seriesTypes.scatter=ScatterSeries;
var PiePoint=extendClass(Point,{init:function(){Point.prototype.init.apply(this,arguments);
var point=this,toggleSlice;
extend(point,{visible:point.visible!==false,name:pick(point.name,"Slice")});
toggleSlice=function(){point.slice()
};
addEvent(point,"select",toggleSlice);
addEvent(point,"unselect",toggleSlice);
return point
},setVisible:function(vis){var point=this,chart=point.series.chart,tracker=point.tracker,dataLabel=point.dataLabel,connector=point.connector,shadowGroup=point.shadowGroup,method;
point.visible=vis=vis===UNDEFINED?!point.visible:vis;
method=vis?"show":"hide";
point.group[method]();
if(tracker){tracker[method]()
}if(dataLabel){dataLabel[method]()
}if(connector){connector[method]()
}if(shadowGroup){shadowGroup[method]()
}if(point.legendItem){chart.legend.colorizeItem(point,vis)
}},slice:function(sliced,redraw,animation){var point=this,series=point.series,chart=series.chart,slicedTranslation=point.slicedTranslation,translation;
setAnimation(animation,chart);
redraw=pick(redraw,true);
sliced=point.sliced=defined(sliced)?sliced:!point.sliced;
translation={translateX:(sliced?slicedTranslation[0]:chart.plotLeft),translateY:(sliced?slicedTranslation[1]:chart.plotTop)};
point.group.animate(translation);
if(point.shadowGroup){point.shadowGroup.animate(translation)
}}});
var PieSeries=extendClass(Series,{type:"pie",isCartesian:false,pointClass:PiePoint,pointAttrToOptions:{stroke:"borderColor","stroke-width":"borderWidth",fill:"color"},getColor:function(){this.initialColor=this.chart.counters.color
},animate:function(){var series=this,data=series.data;
each(data,function(point){var graphic=point.graphic,args=point.shapeArgs,up=-mathPI/2;
if(graphic){graphic.attr({r:0,start:up,end:up});
graphic.animate({r:args.r,start:args.start,end:args.end},series.options.animation)
}});
series.animate=null
},translate:function(){var total=0,series=this,cumulative=-0.25,precision=1000,options=series.options,slicedOffset=options.slicedOffset,connectorOffset=slicedOffset+options.borderWidth,positions=options.center.concat([options.size,options.innerSize||0]),chart=series.chart,plotWidth=chart.plotWidth,plotHeight=chart.plotHeight,start,end,angle,data=series.data,circ=2*mathPI,fraction,smallestSize=mathMin(plotWidth,plotHeight),isPercent,radiusX,radiusY,labelDistance=options.dataLabels.distance;
positions=map(positions,function(length,i){isPercent=/%$/.test(length);
return isPercent?[plotWidth,plotHeight,smallestSize,smallestSize][i]*pInt(length)/100:length
});
series.getX=function(y,left){angle=math.asin((y-positions[1])/(positions[2]/2+labelDistance));
return positions[0]+(left?-1:1)*(mathCos(angle)*(positions[2]/2+labelDistance))
};
series.center=positions;
each(data,function(point){total+=point.y
});
each(data,function(point){fraction=total?point.y/total:0;
start=mathRound(cumulative*circ*precision)/precision;
cumulative+=fraction;
end=mathRound(cumulative*circ*precision)/precision;
point.shapeType="arc";
point.shapeArgs={x:positions[0],y:positions[1],r:positions[2]/2,innerR:positions[3]/2,start:start,end:end};
angle=(end+start)/2;
point.slicedTranslation=map([mathCos(angle)*slicedOffset+chart.plotLeft,mathSin(angle)*slicedOffset+chart.plotTop],mathRound);
radiusX=mathCos(angle)*positions[2]/2;
radiusY=mathSin(angle)*positions[2]/2;
point.tooltipPos=[positions[0]+radiusX*0.7,positions[1]+radiusY*0.7];
point.labelPos=[positions[0]+radiusX+mathCos(angle)*labelDistance,positions[1]+radiusY+mathSin(angle)*labelDistance,positions[0]+radiusX+mathCos(angle)*connectorOffset,positions[1]+radiusY+mathSin(angle)*connectorOffset,positions[0]+radiusX,positions[1]+radiusY,labelDistance<0?"center":angle<circ/4?"left":"right",angle];
point.percentage=fraction*100;
point.total=total
});
this.setTooltipPoints()
},render:function(){var series=this;
this.drawPoints();
if(series.options.enableMouseTracking!==false){series.drawTracker()
}this.drawDataLabels();
if(series.options.animation&&series.animate){series.animate()
}series.isDirty=false
},drawPoints:function(){var series=this,chart=series.chart,renderer=chart.renderer,groupTranslation,graphic,group,shadow=series.options.shadow,shadowGroup,shapeArgs;
each(series.data,function(point){graphic=point.graphic;
shapeArgs=point.shapeArgs;
group=point.group;
shadowGroup=point.shadowGroup;
if(shadow&&!shadowGroup){shadowGroup=point.shadowGroup=renderer.g("shadow").attr({zIndex:4}).add()
}if(!group){group=point.group=renderer.g("point").attr({zIndex:5}).add()
}groupTranslation=point.sliced?point.slicedTranslation:[chart.plotLeft,chart.plotTop];
group.translate(groupTranslation[0],groupTranslation[1]);
if(shadowGroup){shadowGroup.translate(groupTranslation[0],groupTranslation[1])
}if(graphic){graphic.animate(shapeArgs)
}else{point.graphic=renderer.arc(shapeArgs).attr(extend(point.pointAttr[NORMAL_STATE],{"stroke-linejoin":"round"})).add(point.group).shadow(shadow,shadowGroup)
}if(point.visible===false){point.setVisible(false)
}})
},drawDataLabels:function(){var series=this,data=series.data,point,chart=series.chart,options=series.options.dataLabels,connectorPadding=pick(options.connectorPadding,10),connectorWidth=pick(options.connectorWidth,1),connector,connectorPath,softConnector=pick(options.softConnector,true),distanceOption=options.distance,seriesCenter=series.center,radius=seriesCenter[2]/2,centerY=seriesCenter[1],outside=distanceOption>0,dataLabel,labelPos,labelHeight,halves=[[],[]],x,y,visibility,rankArr,sort,i=2,j;
if(!options.enabled){return
}Series.prototype.drawDataLabels.apply(series);
each(data,function(point){if(point.dataLabel){halves[point.labelPos[7]<mathPI/2?0:1].push(point)
}});
halves[1].reverse();
sort=function(a,b){return b.y-a.y
};
labelHeight=halves[0][0]&&halves[0][0].dataLabel&&pInt(halves[0][0].dataLabel.styles.lineHeight);
while(i--){var slots=[],slotsLength,usedSlots=[],points=halves[i],pos,length=points.length,slotIndex;
for(pos=centerY-radius-distanceOption;
pos<=centerY+radius+distanceOption;
pos+=labelHeight){slots.push(pos)
}slotsLength=slots.length;
if(length>slotsLength){rankArr=[].concat(points);
rankArr.sort(sort);
j=length;
while(j--){rankArr[j].rank=j
}j=length;
while(j--){if(points[j].rank>=slotsLength){points.splice(j,1)
}}length=points.length
}for(j=0;
j<length;
j++){point=points[j];
labelPos=point.labelPos;
var closest=9999,distance,slotI;
for(slotI=0;
slotI<slotsLength;
slotI++){distance=mathAbs(slots[slotI]-labelPos[1]);
if(distance<closest){closest=distance;
slotIndex=slotI
}}if(slotIndex<j&&slots[j]!==null){slotIndex=j
}else{if(slotsLength<length-j+slotIndex&&slots[j]!==null){slotIndex=slotsLength-length+j;
while(slots[slotIndex]===null){slotIndex++
}}else{while(slots[slotIndex]===null){slotIndex++
}}}usedSlots.push({i:slotIndex,y:slots[slotIndex]});
slots[slotIndex]=null
}usedSlots.sort(sort);
for(j=0;
j<length;
j++){point=points[j];
labelPos=point.labelPos;
dataLabel=point.dataLabel;
var slot=usedSlots.pop(),naturalY=labelPos[1];
visibility=point.visible===false?HIDDEN:VISIBLE;
slotIndex=slot.i;
y=slot.y;
if((naturalY>y&&slots[slotIndex+1]!==null)||(naturalY<y&&slots[slotIndex-1]!==null)){y=naturalY
}x=series.getX(slotIndex===0||slotIndex===slots.length-1?naturalY:y,i);
dataLabel.attr({visibility:visibility,align:labelPos[6]})[dataLabel.moved?"animate":"attr"]({x:x+options.x+({left:connectorPadding,right:-connectorPadding}[labelPos[6]]||0),y:y+options.y});
dataLabel.moved=true;
if(outside&&connectorWidth){connector=point.connector;
connectorPath=softConnector?[M,x+(labelPos[6]==="left"?5:-5),y,"C",x,y,2*labelPos[2]-labelPos[4],2*labelPos[3]-labelPos[5],labelPos[2],labelPos[3],L,labelPos[4],labelPos[5]]:[M,x+(labelPos[6]==="left"?5:-5),y,L,labelPos[2],labelPos[3],L,labelPos[4],labelPos[5]];
if(connector){connector.animate({d:connectorPath});
connector.attr("visibility",visibility)
}else{point.connector=connector=series.chart.renderer.path(connectorPath).attr({"stroke-width":connectorWidth,stroke:options.connectorColor||point.color||"#606060",visibility:visibility,zIndex:3}).translate(chart.plotLeft,chart.plotTop).add()
}}}}},drawTracker:ColumnSeries.prototype.drawTracker,getSymbol:function(){}});
seriesTypes.pie=PieSeries;
win.Highcharts={Chart:Chart,dateFormat:dateFormat,pathAnim:pathAnim,getOptions:getOptions,hasRtlBug:hasRtlBug,numberFormat:numberFormat,Point:Point,Color:Color,Renderer:Renderer,seriesTypes:seriesTypes,setOptions:setOptions,Series:Series,addEvent:addEvent,createElement:createElement,discardElement:discardElement,css:css,each:each,extend:extend,map:map,merge:merge,pick:pick,extendClass:extendClass,product:"Highcharts",version:"2.1.7"}
}());