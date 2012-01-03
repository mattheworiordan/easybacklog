var guiders=(function($){var guiders={};
guiders.version="1.2.0";
guiders._defaultSettings={attachTo:null,buttons:[{name:"Next"}],buttonCustomHTML:"",classString:null,description:"Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",highlight:null,isHashable:true,offset:{top:null,left:null},onShow:null,onHide:null,overlay:false,position:0,title:"Sample title goes here",width:400,xButton:true};
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
if(thisButton.onclick){thisButtonElem.bind("click",myGuider,thisButton.onclick)
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
xButton.click(function(){guiders.hideAll()
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
if(myGuider.attachTo.length<1){return
}var base=myGuider.attachTo.offset();
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
guiders.hideAll(omitHidingOverlay,true);
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
guiders.hideAll=function(omitHidingOverlay,next){if(typeof next==="undefined"){next=false
}$(".guider:visible").each(function(index,elem){var myGuider=guiders._guiderById($(elem).attr("id"));
if(myGuider.onHide){myGuider.onHide(myGuider,next)
}});
$(".guider").fadeOut("fast");
if(typeof omitHidingOverlay!=="undefined"&&omitHidingOverlay===true){}else{guiders._hideOverlay()
}return guiders
};
guiders.show=function(id){if(!id&&guiders._lastCreatedGuiderID){id=guiders._lastCreatedGuiderID
}var myGuider=guiders._guiderById(id);
if(myGuider.overlay){guiders._showOverlay();
if(myGuider.highlight){guiders._highlightElement(myGuider.highlight)
}}if(myGuider.onShow){myGuider.onShow(myGuider)
}guiders._attach(myGuider);
myGuider.elem.fadeIn("fast");
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
$(function(){var nextFn=function(){guiders.next()
},unbind=function(){$("*").unbind(".guiders")
};
if(!$("#backlog-container").is(":visible")){return
}guiders.createGuider({buttons:[{name:"Close"},{name:"Next"}],title:"easyBacklog walk through",description:"In <b>less than 3 minutes</b> we will walk you through some of the key features of easyBacklog.  <br/><br/>"+"<b>Click next (highly recommended for new users)</b> to proceed or close if you don't want to view the walk through.",id:"first",next:"themes",overlay:true,onHide:function(){$(".filter-container input#filter_completed").attr("checked",false).change()
}});
guiders.createGuider({buttons:[],title:"Themes",description:"All stories are categorised into themes.  Each theme is automatically assigned a theme code (shown below as '"+htmlEncode($("li.theme:first .theme-data .code .data").text())+"') which is used to prefix each story's ID within that theme."+"<br><br><b>Click on the theme field '"+htmlEncode($("li.theme:first .theme-data .name .data").text())+"'</b> to the left to edit it now.",offset:{left:-20,top:0},id:"themes",next:"themes.code",attachTo:"li.theme:first .theme-data .name .data",position:3,onShow:function(){$("li.theme:first .theme-data .name .data").bind("click.guiders",nextFn)
},onHide:function(){unbind()
}});
guiders.createGuider({buttons:[],title:"Fields are editable",description:"The theme name field is now editable as you have clicked on it - clicking on theme or story fields allows you to edit theme inline.<br><br>Now <b>click on the field '"+$("li.theme:first .theme-data .code .data").text()+"' to the right of the text 'Code:'</b> to edit the theme code",id:"themes.code",next:"themes.code.edit",attachTo:"li.theme:first .theme-data .code .data",position:3,onShow:function(){$("li.theme:first .theme-data .code .data").bind("click.guiders",nextFn)
},onHide:function(){unbind()
}});
guiders.createGuider({buttons:[],title:"Theme code",description:"Now <b>change this field to any 3 letters or digits  and press Enter or Tab</b>, and watch how the code changes cascade down to the stories within this theme.",id:"themes.code.edit",next:"themes.code.view",attachTo:"li.theme:first .theme-data .code .data",offset:{left:20,top:0},position:3,onShow:function(){$("li.theme:first .theme-data .code .data input").live("blur",nextFn)
},onHide:function(){$("li.theme:first .theme-data .code .data input").die("blur")
}});
guiders.createGuider({title:"Theme code",description:"See how the ID for each story is prefixed with the 3 letter code from the theme.  This system of naming stories allows you to easily locate a story by theme and its unique ID.",id:"themes.code.view",next:"story.unique_id",attachTo:"li.theme:first li.story.locked:first .unique-id .data",position:3,offset:{left:-20,top:0}});
guiders.createGuider({title:"Keyboard navigation",description:"Now try pressing Tab &amp; Shift-Tab to navigate forwards and backwards within the story.  <br/><br/>"+"If you've mistakenly lost focus of an editable field, simply click on a field in this story to edit it.<br/><br/><b>Keep tabbing forwards until you stop on the 'Add story' button.</b>",id:"story.unique_id",next:"story.create",attachTo:"li.theme:first li.story:not(.locked):first .unique-id .data",position:_.include($("li.theme:first li.story:lt(2)"),$("li.theme:first li.story:not(.locked):first")[0])?6:12,onShow:function(){$("li.theme:first li.story:not(.locked) .unique-id .data").click();
$("li.theme:first li.actions a.new-story").bind("focus.guiders",nextFn)
},onHide:function(){unbind()
},width:300});
guiders.createGuider({title:"Adding story",description:"To add a story at any point to a theme you simply press the 'Add story' button associated with each theme.",id:"story.create",next:"story.tools",attachTo:"li.theme:first li.actions a.new-story",position:12,width:300,overlay:true});
guiders.createGuider({title:"Story tools",description:"Each story has a set of tools you can click on to do one of the following<ul><li>Assign a colour to a story</li><li>Delete a story</li><li>Duplicate a story</li><li>Move a story</li></ul>Note: Story tools are only visible on editable stories (ones that are not marked as Done).",id:"story.tools",next:"story.drag",attachTo:"li.theme:first li.story:not(.locked):first .story-actions",position:3,overlay:true,offset:{left:-15,top:0}});
guiders.createGuider({title:"Reordering stories",description:"Stories can be re-prioritized and ordered by simply dragging them up or down, or clicking on the move tool.<br><br><b>Try dragging this story up now to reorder it</b>",id:"story.drag",next:"backlog.total",attachTo:"li.theme:first li.story:last",offset:{top:40,left:0},position:12,onShow:function(){$("li.theme:first li.story:last").bind("mousedown.guiders",function(){$(this).unbind("mousedown.guiders");
guiders.hideAll()
}).bind("mouseup.guiders",function(){guiders.show("backlog.total");
$(this).unbind("mouseup.guiders")
})
}});
guiders.createGuider({title:"Backlog totals",description:"The total points within your backlog is shown here.  If you are using cost and day estimates, then the total estimated man days and cost based on your day rate will be shown.",id:"backlog.total",next:"backlog.export",attachTo:"#backlog-data-area .backlog-stats",position:9});
guiders.createGuider({title:"Exporting and Printing",description:"You can <b>Export</b> your entire backlog into Microsoft Excel format.<br><br>And you can <b>Print</b> double-sided story cards that can be placed on your scrum boards.",id:"backlog.export",next:"backlog.filter",attachTo:"#backlog-data-area .actions a:contains(Export)",position:6,width:330});
guiders.createGuider({buttons:[],title:"Filtering Done Stories",description:"When stories are assigned to sprints, they will be assigned a status such as To Do, In Progress or Done.  When viewing and editing the backlog, it is often useful to filter out all Done stories so that you can see which stories are still remaining."+"<br><br><b>Now roll over 'Filter' above, and click on 'Hide completed stories in the backlog' to filter out all Done stories</b>",id:"backlog.filter",next:"backlog.filtered",attachTo:"#backlog-data-area .actions a:contains(Filter)",position:6,width:330,offset:{top:20,left:0},onShow:function(){$(".filter-container input#filter_completed").attr("checked",false).change().bind("change.guiders",function(){nextFn()
})
},onHide:function(){unbind()
}});
guiders.createGuider({title:"Filtered view",description:"As you can now see, all the stories that were previously marked as Done are no longer visible in the backlog.<br><br>"+"<b>Now click on the 'Remove filter' link above to remove the filter.</b>",id:"backlog.filtered",next:"backlog.tab",attachTo:"#backlog-container .filter-notifier:first",position:6,width:330,offset:{top:20,left:0},onShow:function(){$("#backlog-container .filter-notifier a").bind("click.guiders",function(){nextFn()
})
},onHide:function(){unbind();
$(".filter-container input#filter_completed").attr("checked",false).change()
}});
guiders.createGuider({title:"Backlog tab",description:"All your user stories are always accessible using this backlog tab.",id:"backlog.tab",next:"stats.tab",attachTo:"#tab-sprint-Backlog",position:3});
guiders.createGuider({buttons:[],title:"Stats tab",description:"As your project progresses and you start completing sprints, statistics and graphs relating to the progress of your project will be shown to you in this tab.<br><br>"+"<b>Click on the Stats tab now to continue</b>",id:"stats.tab",next:"stats.loading",attachTo:"#tab-sprint-Stats",position:3,onShow:function(){$("#tab-sprint-Stats").bind("click.guiders",function(){nextFn()
})
},onHide:function(){unbind()
}});
guiders.createGuider({buttons:[],title:"Loading stats",description:"Please wait while the backlog statistics load...",id:"stats.loading",next:"stats.burn-down",attachTo:"#tab-sprint-Stats",position:3,overlay:true,onShow:function(){$("#stats-container").live("renderingCharts",function(){_.delay(function(){setupStatsGuiders();
nextFn()
},500)
})
},onHide:function(){$("#stats-container").die("renderingCharts")
}});
function setupStatsGuiders(){guiders.createGuider({title:"Burn down",description:"The burn down chart illustrates your actual progress versus your project progress along with a projected (green) line demonstrating when you are likely to complete at your current run rate.",id:"stats.burn-down",next:"stats.burn-up",attachTo:"#burn-down-chart",position:3,offset:{left:-30,top:0}});
guiders.createGuider({title:"Burn up",description:"The burn up chart shows you how many points in total you have in your backlog at the start and end of each sprint using blue, and shows you your progress in completing stories and their points for each sprint.",id:"stats.burn-up",next:"stats.completed-sprints",attachTo:"#burn-up-chart",position:9,});
guiders.createGuider({title:"Completed sprints",description:"The completed sprints chart shows you your velocity (completed points) for each completed sprint",id:"stats.completed-sprints",next:"sprints.tabs",attachTo:"#velocity-chart",position:3,offset:{left:-30,top:0},});
guiders.createGuider({buttons:[],title:"Sprint tabs",description:"For each sprint, a tab is added above in numerical order, with 1 being the first sprint.<br><br>"+"<b>Click on the Sprint 3 tab above to continue.</b>",id:"sprints.tabs",next:"sprint.3.overview",attachTo:"ul.infinite-tabs li.sprint-tab:contains(3)",position:6,onShow:function(){$("ul.infinite-tabs li.sprint-tab:contains(3) a").bind("click.guiders",function(){_.delay(function(){setupSprint3Guiders();
nextFn()
},50)
})
},onHide:function(){unbind()
}})
}function setupSprint3Guiders(){guiders.createGuider({title:"Completed sprint",description:"As you can see, Sprint 3 is marked as completed indicated by the tick and the green background of the header.<br><br>"+"All stories listed on the left are Done.  Before a sprint can be marked as complete, all stories must first be marked as Done.",id:"sprint.3.overview",next:"sprints.3.totals",overlay:true,offset:{left:-100,top:-10}});
guiders.createGuider({title:"Sprint totals",description:"As you add and remove stories to your sprint, the sprint totals above will be updated.  This is useful in ensuring you don't overallocate stories to a sprint.",id:"sprints.3.totals",next:"sprints.5",attachTo:"#backlog-data-area .backlog-stats",position:6,offset:{left:0,top:-10}});
guiders.createGuider({buttons:[],title:"Incomplete sprints",description:"Sprint 5 is not yet complete and as such stories can added or removed from this sprint.<br><br>"+"<b>Click on the Sprint 5 tab to continue</b>",id:"sprints.5",next:"sprints.5.overview",attachTo:"ul.infinite-tabs li.sprint-tab:contains(5)",position:6,width:260,onShow:function(){$("ul.infinite-tabs li.sprint-tab:contains(5)").bind("click.guiders",function(){_.delay(function(){setupSprint5Guiders();
nextFn()
},50)
})
},onHide:function(){unbind()
}})
}function setupSprint5Guiders(){guiders.createGuider({title:"Current sprint",description:"As you can see on the left, Sprint 5 has a number of stories assigned to it which are in progress and not all marked as Done.  As progress on each story is made, the status can be updated from this area.",id:"sprints.5.overview",next:"sprints.5.unassigned-stories",overlay:true,offset:{left:100,top:0}});
guiders.createGuider({title:"Unassigned backlog stories",description:"Stories from the backlog that are not yet assigned to a sprint are listed on the right.<br><br>You can click on or drag a story to the left to assign it to the current sprint.",id:"sprints.5.unassigned-stories",next:"sprints.5.story",attachTo:"#sprints-container .unassigned-stories-container .story-card:first",position:9});
guiders.createGuider({title:"Stories assigned to a sprint",description:"The story below has been assigned to the current sprint.  You can unassign this story from this sprint by simply clicking on the story or dragging it to the right.",id:"sprints.5.story",next:"sprints.5.story-status",attachTo:"#sprints-container .stories-container .story-card:last",position:12,offset:{top:15,left:0}});
guiders.createGuider({title:"Story status",description:"You can change the status of any story assigned to a sprint by simply clicking on the status tab and updating the status.<br><br>"+"<b>Click on the status '"+$("#sprints-container .stories-container .story-card:last .status .tab").text()+"' to change it now.</b>",id:"sprints.5.story-status",next:"sprints.5.finished",attachTo:"#sprints-container .stories-container .story-card:last .status .tab",position:3,onShow:function(){var selector="#sprints-container .stories-container .story-card:last .status .tab";
$(selector).bind("click.guiders",function(){unbind();
var statusUpdated=function(){unbind();
$("#sprint-story-status-dropdown li").die("statusChanged");
nextFn()
};
$(selector).bind("click.guiders",statusUpdated);
$("#sprint-story-status-dropdown li").live("statusChanged",statusUpdated)
})
},onHide:function(){unbind();
$("#sprint-story-status-dropdown li").die("click")
}});
guiders.createGuider({buttons:[],title:"Back to backlog",description:"<b>Now click on the Backlog tab to return to the main backlog view of all stories.</b>",id:"sprints.5.finished",next:"sprints.backlog.snapshots",attachTo:"#tab-sprint-Backlog",position:3,onShow:function(){$("#tab-sprint-Backlog").bind("click.guiders",nextFn)
},onHide:function(){unbind()
}})
}guiders.createGuider({title:"Snapshots",description:"Snapshots are one of the killer features of easyBacklog that will help you to manage and report on change throughout your project.  This is especially useful when you are working with fixed resources or a fixed budget.<br><br>"+"Snapshots of the entire backlog are automatically taken at the start of each sprint, but snapshots can also be manually created at any point in time.  An example of when a snapshot may be manually created could be following a meeting where a project scope has been agreed with a client based on the backlog.<br><br>"+"To view a snapshot you simply roll over the snapshots menu in the top right, and select the snapshot you wish to view from the drop down.<br><br>"+"We will now show you how to compare a snapshot with the current version.",id:"sprints.backlog.snapshots",next:"sprints.backlog.snapshots.rollover",overlay:true,width:500});
guiders.createGuider({title:"Compare snapshots",description:"<b>Roll over the Snapshots menu item and click 'Compare snapshots'</b>",id:"sprints.backlog.snapshots.rollover",next:"sprints.backlog.snapshots.compare",attachTo:"#backlog-data-area #snapshot-menu",position:6,onShow:function(){$("#backlog-data-area #snapshot-menu").bind("mouseover.guiders",function(){_.delay(function(){setupSnapshotCompare();
nextFn()
},50)
})
},onHide:function(){unbind()
}});
function setupSnapshotCompare(){guiders.createGuider({title:"Compare snapshots",description:"<b>Roll over the Snapshots menu item and click 'Compare snapshots'</b>",id:"sprints.backlog.snapshots.compare",next:"sprints.backlog.snapshots.compare.dialog",attachTo:".snapshot-menu-container a#compare-snapshot",position:6,onShow:function(){$(".snapshot-menu-container a#compare-snapshot").bind("click.guiders",function(){_.delay(function(){setupSnapshotCompareDialog();
nextFn()
},50)
})
},onHide:function(){unbind()
}})
}function setupSnapshotCompareDialog(){guiders.createGuider({title:"Compare snapshots",description:"When comparing a snapshot you typically chose the older version as the base version for your report.<br><br><b>Select Sprint 1 from the drop down</b>",id:"sprints.backlog.snapshots.compare.dialog",next:"sprints.backlog.compare.dialog.view",attachTo:"#dialog-compare-snapshot select#base-snapshot",position:3,width:270,onShow:function(){$("#dialog-compare-snapshot select#base-snapshot").bind("change.guiders",nextFn)
},onHide:function(){unbind()
}});
guiders.createGuider({title:"Compare snapshots",description:"<b>Before you press 'Compare', please note that a new browser Tab or Window will open with the snapshot comparison report.  <span style='color: red'>Once you have finished viewing the report, please close the Tab or Window to return to this walk through.</span><br><br>Now click 'Compare'</b>",id:"sprints.backlog.compare.dialog.view",next:"sprints.backlog.summary",attachTo:"#dialog-compare-snapshot+.ui-dialog-buttonpane button:first",position:9,width:270,onShow:function(){$("#dialog-compare-snapshot+.ui-dialog-buttonpane button:first, #dialog-compare-snapshot+.ui-dialog-buttonpane button:last").bind("click.guiders",nextFn)
},onHide:function(){unbind()
}})
}guiders.createGuider({buttons:[{name:"Close"}],title:"easyBacklog walk through complete",description:"We hope you found this walk through useful.<br><br>"+"Please remember that you have a plethora of settings for your backlog in the <b>'Settings'</b> menu item in the top right that will allow you to configure your backlog as it suits you.<br><br>"+"We welcome any questions or suggestions, so please do get in touch by following the <b>'Support'</b> menu item at the top of the page, or the <b>'Feedback'</b> button in the bottom right.",id:"sprints.backlog.summary",overlay:true,width:500});
guiders.show("first")
});