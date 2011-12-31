var guiders=(function($){var guiders={};
guiders.version="1.2.0";
guiders._defaultSettings={attachTo:null,buttons:[{name:"Close"}],buttonCustomHTML:"",classString:null,description:"Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",highlight:null,isHashable:true,offset:{top:null,left:null},onShow:null,overlay:false,position:0,title:"Sample title goes here",width:400,xButton:false};
guiders._htmlSkeleton=["<div class='guider'>","  <div class='guider_content'>","    <h1 class='guider_title'></h1>","    <div class='guider_close'></div>","    <p class='guider_description'></p>","    <div class='guider_buttons'>","    </div>","  </div>","  <div class='guider_arrow'>","  </div>","</div>"].join("");
guiders._arrowSize=42;
guiders._closeButtonTitle="Close";
guiders._currentGuiderID=null;
guiders._guiders={};
guiders._lastCreatedGuiderID=null;
guiders._nextButtonTitle="Next";
guiders._zIndexForHighlight=101;
guiders._addButtons=function(myGuider){var guiderButtonsContainer=myGuider.elem.find(".guider_buttons");
if(myGuider.buttons===null||myGuider.buttons.length===0){guiderButtonsContainer.remove();
return
}for(var i=myGuider.buttons.length-1;
i>=0;
i--){var thisButton=myGuider.buttons[i];
var thisButtonElem=$("<a></a>",{"class":"guider_button","text":thisButton.name});
if(typeof thisButton.classString!=="undefined"&&thisButton.classString!==null){thisButtonElem.addClass(thisButton.classString)
}guiderButtonsContainer.append(thisButtonElem);
if(thisButton.onclick){thisButtonElem.bind("click",thisButton.onclick)
}else{if(!thisButton.onclick&&thisButton.name.toLowerCase()===guiders._closeButtonTitle.toLowerCase()){thisButtonElem.bind("click",function(){guiders.hideAll()
})
}else{if(!thisButton.onclick&&thisButton.name.toLowerCase()===guiders._nextButtonTitle.toLowerCase()){thisButtonElem.bind("click",function(){guiders.next()
})
}}}}if(myGuider.buttonCustomHTML!==""){var myCustomHTML=$(myGuider.buttonCustomHTML);
myGuider.elem.find(".guider_buttons").append(myCustomHTML)
}if(myGuider.buttons.length==0){guiderButtonsContainer.remove()
}};
guiders._addXButton=function(myGuider){var xButtonContainer=myGuider.elem.find(".guider_close");
var xButton=$("<div></div>",{"class":"x_button","role":"button"});
xButtonContainer.append(xButton);
xButton.click(function(){guiders.hideAll();
$(document).trigger("closeGuiders")
})
};
guiders._attach=function(myGuider){if(myGuider===null){return
}var myHeight=myGuider.elem.innerHeight();
var myWidth=myGuider.elem.innerWidth();
if(myGuider.position===0||myGuider.attachTo===null){myGuider.elem.css("position","absolute");
myGuider.elem.css("top",($(window).height()-myHeight)/3+$(window).scrollTop()+"px");
myGuider.elem.css("left",($(window).width()-myWidth)/2+$(window).scrollLeft()+"px");
return
}myGuider.attachTo=$(myGuider.attachTo);
var base=myGuider.attachTo.offset();
var attachToHeight=myGuider.attachTo.innerHeight();
var attachToWidth=myGuider.attachTo.innerWidth();
var top=base.top;
var left=base.left;
var bufferOffset=0.9*guiders._arrowSize;
var offsetMap={1:[-bufferOffset-myHeight,attachToWidth-myWidth],2:[0,bufferOffset+attachToWidth],3:[attachToHeight/2-myHeight/2,bufferOffset+attachToWidth],4:[attachToHeight-myHeight,bufferOffset+attachToWidth],5:[bufferOffset+attachToHeight,attachToWidth-myWidth],6:[bufferOffset+attachToHeight,attachToWidth/2-myWidth/2],7:[bufferOffset+attachToHeight,0],8:[attachToHeight-myHeight,-myWidth-bufferOffset],9:[attachToHeight/2-myHeight/2,-myWidth-bufferOffset],10:[0,-myWidth-bufferOffset],11:[-bufferOffset-myHeight,0],12:[-bufferOffset-myHeight,attachToWidth/2-myWidth/2]};
offset=offsetMap[myGuider.position];
top+=offset[0];
left+=offset[1];
if(myGuider.offset.top!==null){top+=myGuider.offset.top
}if(myGuider.offset.left!==null){left+=myGuider.offset.left
}myGuider.elem.css({"position":"absolute","top":top,"left":left})
};
guiders._guiderById=function(id){if(typeof guiders._guiders[id]==="undefined"){throw"Cannot find guider with id "+id
}return guiders._guiders[id]
};
guiders._showOverlay=function(){$("#guider_overlay").fadeIn("fast",function(){if(this.style.removeAttribute){this.style.removeAttribute("filter")
}})
};
guiders._highlightElement=function(selector){$(selector).css({"z-index":guiders._zIndexForHighlight})
};
guiders._dehighlightElement=function(selector){$(selector).css({"z-index":1})
};
guiders._hideOverlay=function(){$("#guider_overlay").fadeOut("fast")
};
guiders._initializeOverlay=function(){if($("#guider_overlay").length===0){$('<div id="guider_overlay"></div>').hide().appendTo("body")
}};
guiders._styleArrow=function(myGuider){var position=myGuider.position||0;
if(!position){return
}var myGuiderArrow=$(myGuider.elem.find(".guider_arrow"));
var newClass={1:"guider_arrow_down",2:"guider_arrow_left",3:"guider_arrow_left",4:"guider_arrow_left",5:"guider_arrow_up",6:"guider_arrow_up",7:"guider_arrow_up",8:"guider_arrow_right",9:"guider_arrow_right",10:"guider_arrow_right",11:"guider_arrow_down",12:"guider_arrow_down"};
myGuiderArrow.addClass(newClass[position]);
var myHeight=myGuider.elem.innerHeight();
var myWidth=myGuider.elem.innerWidth();
var arrowOffset=guiders._arrowSize/2;
var positionMap={1:["right",arrowOffset],2:["top",arrowOffset],3:["top",myHeight/2-arrowOffset],4:["bottom",arrowOffset],5:["right",arrowOffset],6:["left",myWidth/2-arrowOffset],7:["left",arrowOffset],8:["bottom",arrowOffset],9:["top",myHeight/2-arrowOffset],10:["top",arrowOffset],11:["left",arrowOffset],12:["left",myWidth/2-arrowOffset]};
var position=positionMap[myGuider.position];
myGuiderArrow.css(position[0],position[1]+"px")
};
guiders._showIfHashed=function(myGuider){var GUIDER_HASH_TAG="guider=";
var hashIndex=window.location.hash.indexOf(GUIDER_HASH_TAG);
if(hashIndex!==-1){var hashGuiderId=window.location.hash.substr(hashIndex+GUIDER_HASH_TAG.length);
if(myGuider.id.toLowerCase()===hashGuiderId.toLowerCase()){guiders.show(myGuider.id)
}}};
guiders.next=function(){var currentGuider=guiders._guiders[guiders._currentGuiderID];
if(typeof currentGuider==="undefined"){return
}var nextGuiderId=currentGuider.next||null;
if(nextGuiderId!==null&&nextGuiderId!==""){var myGuider=guiders._guiderById(nextGuiderId);
var omitHidingOverlay=myGuider.overlay?true:false;
guiders.hideAll(omitHidingOverlay);
if(currentGuider.highlight){guiders._dehighlightElement(currentGuider.highlight)
}guiders.show(nextGuiderId)
}};
guiders.createGuider=function(passedSettings){if(passedSettings===null||passedSettings===undefined){passedSettings={}
}myGuider=$.extend({},guiders._defaultSettings,passedSettings);
myGuider.id=myGuider.id||String(Math.floor(Math.random()*1000));
var guiderElement=$(guiders._htmlSkeleton);
myGuider.elem=guiderElement;
if(typeof myGuider.classString!=="undefined"&&myGuider.classString!==null){myGuider.elem.addClass(myGuider.classString)
}myGuider.elem.css("width",myGuider.width+"px");
var guiderTitleContainer=guiderElement.find(".guider_title");
guiderTitleContainer.html(myGuider.title);
guiderElement.find(".guider_description").html(myGuider.description);
guiders._addButtons(myGuider);
if(myGuider.xButton){guiders._addXButton(myGuider)
}guiderElement.hide();
guiderElement.appendTo("body");
guiderElement.attr("id",myGuider.id);
if(typeof myGuider.attachTo!=="undefined"&&myGuider!==null){guiders._attach(myGuider);
guiders._styleArrow(myGuider)
}guiders._initializeOverlay();
guiders._guiders[myGuider.id]=myGuider;
guiders._lastCreatedGuiderID=myGuider.id;
if(myGuider.isHashable){guiders._showIfHashed(myGuider)
}return guiders
};
guiders.hideAll=function(omitHidingOverlay){$(".guider").fadeOut("fast");
if(typeof omitHidingOverlay!=="undefined"&&omitHidingOverlay===true){}else{guiders._hideOverlay()
}return guiders
};
guiders.show=function(id){if(!id&&guiders._lastCreatedGuiderID){id=guiders._lastCreatedGuiderID
}var myGuider=guiders._guiderById(id);
if(myGuider.overlay){guiders._showOverlay();
if(myGuider.highlight){guiders._highlightElement(myGuider.highlight)
}}guiders._attach(myGuider);
if(myGuider.onShow){myGuider.onShow(myGuider)
}myGuider.elem.fadeIn("fast");
var windowHeight=$(window).height();
var scrollHeight=$(window).scrollTop();
var guiderOffset=myGuider.elem.offset();
var guiderElemHeight=myGuider.elem.height();
if(guiderOffset.top-scrollHeight<0||guiderOffset.top+guiderElemHeight+40>scrollHeight+windowHeight){window.scrollTo(0,Math.max(guiderOffset.top+(guiderElemHeight/2)-(windowHeight/2),0))
}guiders._currentGuiderID=id;
return guiders
};
return guiders
}).call(this,jQuery);
function setupGuiders(){var nextFn=function(){guiders.next()
},codeBlur=false;
$("li.theme:first .theme-data .name .data").bind("click.guiders",nextFn);
$("li.theme:first .theme-data .code .data").bind("click.guiders",nextFn);
$("li.theme:first .theme-data .code .data input").live("blur",function(){if(!codeBlur){codeBlur=true;
guiders.next();
$(this).die("blur")
}});
$("li.theme:first li.actions a.new-story").bind("focus.guiders",nextFn);
$(document).bind("closeGuiders",function(){tearDownGuiders()
})
}function tearDownGuiders(){$("*").unbind(".guiders");
$("li.theme:first .theme-data .code .data input").die("blur");
$(document).unbind("closeGuiders")
}guiders.createGuider({buttons:[{name:"Close"},{name:"Next",onclick:function(){setupGuiders();
guiders.next()
}}],title:"Example backlog walk through",description:"Let us quickly walk you through some of the key features of easyBacklog.  Click next to proceed or close if you don't want to view the walk through.",id:"first",next:"themes",overlay:true,xButton:true});
guiders.createGuider({buttons:[],title:"Themes",description:"All stories are categorised into themes.  Each theme is automatically assigned a theme code (below) which is used to prefix each story's ID within that theme.<br><br><b>Click on the theme field</b> to the left to edit it now.",offset:{left:-20,top:0},id:"themes",next:"themes.code",attachTo:"li.theme:first .theme-data .name .data",position:3,xButton:true});
guiders.createGuider({buttons:[],title:"Fields are editable",description:"As you have seen, fields become immediately editable when you click on them.<br><br>Now <b>click on the field '"+$("li.theme:first .theme-data .code .data").text()+"' to the right of the text 'Code:'</b> to edit the theme code",id:"themes.code",next:"themes.code.edit",attachTo:"li.theme:first .theme-data .code .data",position:3,xButton:true});
guiders.createGuider({buttons:[],title:"Theme code",description:"Now <b>enter any 3 letter code into this field, press Enter or Tab</b>, and watch how the code changes cascade down to the stories within this theme.",id:"themes.code.edit",next:"story.unique_id",attachTo:"li.theme:first .theme-data .code .data",offset:{left:20,top:0},position:3,xButton:true});
guiders.createGuider({buttons:[],title:"Keyboard navigation",description:"Now try pressing tab &amp; shift tab to navigate forwards and backwards within the story.  <br/><br/><b>Keep tabbing forwards until you stop on the 'Add story' button.</b>",id:"story.unique_id",next:"story.create",attachTo:"li.theme:first li.story:not(.locked):first .unique-id .data",position:12,width:300,xButton:true});
guiders.createGuider({buttons:[{name:"Next"}],title:"Adding story",description:"To add a story at any point to a theme you simply press the 'Add story' button associated with each theme.",id:"story.create",next:"backlog_tab",attachTo:"li.theme:first li.actions a.new-story",position:12,width:300,xButton:true,overlay:true});
guiders.createGuider({buttons:[{name:"Next"}],title:"All stories are in your backlog",description:"Your backlog of user stories is always accessible using this backlog tab",id:"backlog_tab",next:"stats_tab",attachTo:"#tab-sprint-Backlog",position:3,xButton:true});
if($("#backlog-container").is(":visible")){guiders.show("first")
};