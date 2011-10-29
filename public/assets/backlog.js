var AcceptanceCriterion=Backbone.Model.extend({Story:function(){return this.collection.story
},IsEditable:function(){return(this.collection.story.IsEditable())
},beforeSave:function(callback){if(this.collection.story.isNew()){if(window.console){console.log("Saving parent Story first")
}this.collection.story.save({},{error:function(model,response){var errorMessage="Unable to save changes...  Please refresh.";
try{errorMessage=$.parseJSON(response.responseText).message
}catch(e){if(window.console){console.log(e)
}}var errorView=new App.Views.Error({message:errorMessage})
},success:function(){callback()
}})
}else{callback()
}}});
var Backlog=Backbone.Model.extend({url:function(){return(this.collection.url()+(this.isNew()?"":"/"+(this.get("snapshot_master_id")?this.get("snapshot_master_id")+"/snapshots/":"")+this.id)+"?cache-buster"+Math.floor(Math.random()*1000000))
},IsEditable:function(){return(this.get("is_editable")?true:false)
},Themes:function(){if(!this._themes){this._themes=new ThemesCollection(this.get("themes"),{backlog:this});
this.unset("themes")
}return(this._themes)
},Sprints:function(){if(!this._sprints){this._sprints=new SprintsCollection(this.get("sprints"),{backlog:this});
this.unset("sprints")
}return(this._sprints)
},Account_ID:function(){return this.collection.account_id
}});
var Sprint=Backbone.Model.extend({Backlog:function(){return this.collection.backlog
},SprintStories:function(){if(!this._sprint_stories){this._sprint_stories=new SprintStoriesCollection(this.get("sprint_stories"),{sprint:this});
this.unset("sprint_stories")
}return(this._sprint_stories)
}});
var SprintStory=Backbone.Model.extend({initialize:function(){if(!App.Collections.SprintStoryStatuses){App.Collections.SprintStoryStatuses=new SprintStoryStatusesCollection();
App.Collections.SprintStoryStatuses.fetch()
}},Sprint:function(){return this.collection.sprint
},Story:function(){var that=this;
if(!this._story){var theme=this.Sprint().Backlog().Themes().get(this.get("theme_id"));
if(!theme){this.Sprint().Backlog().Themes().each(function(theme){if(!that._story){var story=theme.Stories().get(that.get("story_id"));
if(story){that._story=story
}}})
}else{this._story=theme.Stories().get(this.get("story_id"))
}if(!this._story){throw"Data inconsistency error, story "+this.get("story_id")+" does not exist"
}}return this._story
},Status:function(){return App.Collections.SprintStoryStatuses.get(this.get("sprint_story_status_id"))
}});
var SprintStoryStatus=Backbone.Model.extend({isDone:function(){return this.get("code").toUpperCase()=="D"
}});
var Story=Backbone.Model.extend({Theme:function(){return this.collection.theme
},IsEditable:function(){if(!this.collection.theme.IsEditable()){return false
}else{var sprintStory=this.SprintStory();
if(sprintStory){return !sprintStory.Status().isDone()
}return true
}},AcceptanceCriteria:function(){if(!this._acceptance_criteria){this._acceptance_criteria=new AcceptanceCriteriaCollection(this.get("acceptance_criteria"),{story:this});
this.unset("acceptance_criteria")
}return(this._acceptance_criteria)
},MoveToTheme:function(newThemeId,options){var story=this;
$.post(this.collection.url()+"/"+this.get("id")+"/move-to-theme/"+newThemeId).success(function(ajaxResult,status,response){var themeCollection=story.Theme().collection;
story.collection.remove(story);
themeCollection.get(Number(newThemeId)).Stories().add(story);
story.set(ajaxResult);
story.trigger("change:unique_id");
if(_.isFunction(options.success)){options.success(story,response)
}}).error(function(event,response){if(window.console){console.log("Move to theme failed")
}if(_.isFunction(options.error)){options.error(story,response)
}})
},SprintStory:function(){var sprintStoryFound=null,that=this;
this.Theme().Backlog().Sprints().each(function(sprint){if(sprintStoryFound){return
}sprint.SprintStories().each(function(sprintStory){if(!sprintStoryFound&&(sprintStory.get("story_id")===that.get("id"))){sprintStoryFound=sprintStory
}})
});
return sprintStoryFound
}});
var Theme=Backbone.Model.extend({Stories:function(){if(!this._stories){this._stories=new StoriesCollection(this.get("stories"),{theme:this});
this.unset("stories")
}return(this._stories)
},Backlog:function(){return this.collection.backlog
},IsEditable:function(){return(this.collection.backlog.IsEditable())
},ReNumberStories:function(options){var theme=this;
$.post(this.collection.url()+"/"+this.get("id")+"/re-number-stories").success(function(ajaxResult,status,response){theme.Stories().each(function(story){story.fetch()
});
if(_.isFunction(options.success)){options.success(theme,response)
}}).error(function(event,response){if(window.console){console.log("Renumber stories failed")
}if(_.isFunction(options.error)){options.error(theme,response)
}})
}});
var AcceptanceCriteriaCollection=Backbone.Collection.extend({model:AcceptanceCriterion,story:null,url:function(){if(!this.story||!this.story.get("id")){var errorView=new App.Views.Error({message:"Error, missing necessary data ID to display Acceptance Criteria"})
}else{return"/stories/"+this.story.get("id")+"/acceptance_criteria"
}},initialize:function(models,options){this.story=options?options.story:null;
_.bindAll(this,"saveOrder")
},saveOrder:function(idOrderCollection){var thisCollection=this;
_.each(idOrderCollection,function(index,key){var criterion=thisCollection.get(key);
if(criterion){criterion.set({"position":idOrderCollection[key]});
criterion.save(false,{error:function(){var errorView=new App.Views.Error({message:"Error, could not save the new order of criteria"})
}})
}})
}});
var BacklogsCollection=Backbone.Collection.extend({model:Backlog,account_id:null,url:function(){if(!this.account_id){var errorView=new App.Views.Error({message:"Error, missing necessary Account ID to display Backlog"})
}else{return"/accounts/"+this.account_id+"/backlogs"
}},initialize:function(models,options){this.account_id=options?options.account_id:null
}});
var SprintStoriesCollection=Backbone.Collection.extend({model:SprintStory,sprint:null,url:function(){if(!this.sprint){var errorView=new App.Views.Error({message:"Error, cannot find Sprint and thus cannot load SprintStory"})
}else{return"/sprints/"+this.sprint.get("id")+"/sprint-stories"
}},initialize:function(models,options){this.sprint=options?options.sprint:null
},getByStoryId:function(storyId){var sprintStoryMatch=null;
this.each(function(sprintStory){if(Number(sprintStory.get("story_id"))===Number(storyId)){sprintStoryMatch=sprintStory
}});
return sprintStoryMatch
},batchUpdatePosition:function(params,options){var url="/sprints/"+this.sprint.get("id")+"/sprint-stories/update-order",that=this;
options=options||{};
data=_(params).map(function(val,key){return"ids["+key+"]="+val
}).join("&");
$.ajax(url,{success:function(data){_(data).each(function(val){that.get(val.id).set(val)
});
if(options.success){options.success.apply(this,arguments)
}},error:function(){if(options.error){options.error.apply(this,arguments)
}},data:data,dataType:"json",type:"PUT"})
}});
var SprintStoryStatusesCollection=Backbone.Collection.extend({model:SprintStoryStatus,url:"/sprint-story-statuses"});
var SprintsCollection=Backbone.Collection.extend({model:Sprint,backlog:null,url:function(){if(!this.backlog){var errorView=new App.Views.Error({message:"Error, missing necessary Backlog ID to display Sprint"})
}else{return"/backlogs/"+this.backlog.get("id")+"/sprints"
}},initialize:function(models,options){this.backlog=options?options.backlog:null
}});
var StoriesCollection=Backbone.Collection.extend({model:Story,theme:null,url:function(){if(!this.theme||!this.theme.get("id")){var errorView=new App.Views.Error({message:"Error, missing necessary data ID to display Story"})
}else{return"/themes/"+this.theme.get("id")+"/stories"
}},initialize:function(models,options){this.theme=options?options.theme:null
},saveOrder:function(idOrderCollection){var thisCollection=this;
_.each(idOrderCollection,function(index,key){var story=thisCollection.get(key);
if(story){story.set({"position":idOrderCollection[key]});
story.save()
}})
}});
var ThemesCollection=Backbone.Collection.extend({model:Theme,backlog:null,url:function(){if(!this.backlog){var errorView=new App.Views.Error({message:"Error, cannot find Backlog and thus cannot load Theme"})
}else{return"/backlogs/"+this.backlog.get("id")+"/themes"
}},initialize:function(models,options){this.backlog=options?options.backlog:null
},saveOrder:function(idOrderCollection){var thisCollection=this;
_.each(idOrderCollection,function(index,key){var theme=thisCollection.get(key);
if(theme){theme.set({"position":idOrderCollection[key]});
theme.save()
}})
}});
App.Controllers.Statistics={updateStatistics:function(stats){if(!_.isEmpty(stats)){if(window.console){console.log("Updating stats for themes "+_.map(stats.themes,function(theme){return theme.theme_id
}).join(","))
}var backlog=App.Collections.Backlogs.last();
var statsWithoutThemes=_.clone(stats);
delete statsWithoutThemes.themes;
backlog.set(statsWithoutThemes);
backlog.trigger("statisticsUpdated");
_.each(stats.themes,function(themeData){var theme=backlog.Themes().get(themeData.theme_id);
if(theme){theme.set(themeData);
theme.trigger("statisticsUpdated")
}})
}}};
App.Views.Helpers={scrollIntoBacklogView:function(elem,callback){if($(elem).length){var scrollAmount=$(window).scrollTop(),currentPosition=$(elem).offset().top,bufferBottom=100,bufferTop=this.bufferTop?this.bufferTop:this.bufferTop=$("#backlog-container").offset().top,newScrollPosition=false;
if(currentPosition<scrollAmount+bufferTop){newScrollPosition=currentPosition-bufferTop
}else{if(currentPosition>scrollAmount+$(window).height()-bufferBottom){newScrollPosition=currentPosition-$(window).height()+bufferBottom
}}if(newScrollPosition){$("html:not(:animated),body:not(:animated)").animate({scrollTop:newScrollPosition},"fast",null,function(){if(_.isFunction(callback)){callback(elem)
}})
}else{if(_.isFunction(callback)){callback(elem)
}}}else{if(_.isFunction(callback)){callback(elem)
}}},setStatusHover:function(){$(this.el).find(".status .tab").hover(function(){$(this).addClass("hover")
},function(){$(this).removeClass("hover")
})
},statusChangeClick:function(){var dropDownOptions=App.Collections.SprintStoryStatuses.sortBy(function(s){return s.get("position")
}).map(function(status){return('<option value="'+status.get("id")+'">'+htmlEncode(status.get("status"))+"</option>")
}).join(""),dropDownNode=$(this.el).find(".status .drop-down"),className=$(this.el).find(".status .tab").attr("class").match(/(status-code-\w+)/)[1];
$(this.el).find(".status .tab").hide();
dropDownNode.find("select").empty().append($(dropDownOptions)).attr("class",className);
dropDownNode.find("select option[value="+this.model.SprintStory().get("sprint_story_status_id")+"]").attr("selected","selected");
dropDownNode.show().focus()
},statusDropDownChanged:function(){var selected=$(this.el).find(".status .drop-down select option:selected"),code=App.Collections.SprintStoryStatuses.get(selected.val()).get("code"),that=this;
$(this.el).find(".status .tab").attr("class","tab status-code-"+code).find("span").text(selected.text());
this.model.SprintStory().set({sprint_story_status_id:selected.val()});
this.model.SprintStory().save(false,{success:function(model){if(that.parentView){that.parentView.updateStatistics(model.get("sprint_statistics"))
}else{that.model.SprintStory().Sprint().set(model.get("sprint_statistics"))
}},error:function(model,response){var errorMessage="we've got a problem on our side";
try{errorMessage=$.parseJSON(response.responseText).message
}catch(e){if(window.console){console.log(e)
}}var errorView=new App.Views.Error({message:"Oops, "+errorMessage+".  Please refresh your browser"})
}});
this.statusDropDownLostFocus()
},statusDropDownLostFocus:function(){$(this.el).find(".status .tab").show();
$(this.el).find(".status .drop-down").hide()
}};
App.Views.BaseView=Backbone.View.extend({defaultEditableOptions:{onblur:"submit",tooltip:"Click to edit",placeholder:'<span class="editable-blank">[edit]</span>',lesswidth:5,type:"text"},initialize:function(){this.model=this.options.model;
this.parentView=this.options.parentView;
this.beforeChangeValue={};
_.bindAll(this,"beforeChange","contentUpdated");
if(this.changeEvent){_.bindAll(this,"changeEvent");
var changeEvent=this.changeEvent;
this.model.bind("all",function(eventName){changeEvent(eventName,this)
})
}if(this.updateStatistics){_.bindAll(this,"updateStatistics");
this.model.bind("statisticsUpdated",this.updateStatistics)
}},beforeChange:function(value,settings,target){var fieldId=$(target).parent().attr("class").replace(/\-/g,"_");
this.beforeChangeValue[fieldId]=value;
return(value)
},contentUpdated:function(value,settings,target){var fieldId=$(target).parent().attr("class").replace(/\-/g,"_");
var fieldWithValue=$(target);
var beforeChangeValue=this.beforeChangeValue[fieldId];
var view=this;
if(value!=beforeChangeValue){if(window.console){console.log("value for "+fieldId+" has changed from "+this.beforeChangeValue[fieldId]+" to "+value)
}var attributes={};
attributes[fieldId]=value;
this.model.set(attributes);
var this_model=this.model;
var saveModelFunc=function(){this_model.save({},{error:function(model,response){var errorMessage="Unable to save changes...";
try{errorMessage=$.parseJSON(response.responseText).message
}catch(e){if(window.console){console.log(e)
}}var errorView=new App.Views.Error({message:errorMessage});
fieldWithValue.text(_.isEmpty(beforeChangeValue)?"[edit]":beforeChangeValue);
var valBack={};
valBack[fieldId]=_.isEmpty(beforeChangeValue)?null:beforeChangeValue;
this_model.set(valBack);
if(fieldId=="code"){view.model.Stories().each(function(story,index){story.trigger("change:unique_id")
})
}}})
};
if(this.model.beforeSave){this.model.beforeSave(saveModelFunc)
}else{saveModelFunc()
}}return(value)
},remove:function(event){event.preventDefault();
var view=this;
if(view.model.isNew()){view.model.collection.remove(view.model);
$(view.el).slideUp("fast",function(){$(view.el).remove()
})
}else{$("#dialog-delete").remove();
$("body").append(JST[this.deleteDialogTemplate]({model:this.model}));
$("#dialog-delete").dialog({resizable:false,height:170,modal:true,buttons:{Delete:function(){view.deleteAction(this,view)
},Cancel:function(){$(this).dialog("close")
}}})
}return(false)
}});
App.Views.AcceptanceCriteria={Index:Backbone.View.extend({tagName:"div",className:"acceptance-criteria",childId:function(model){return"acceptance-criteria-"+model.get("id")
},events:{"click li.new-acceptance-criterion div":"createNew"},initialize:function(){this.collection=this.options.collection;
_.bindAll(this,"orderChanged","displayOrderIndexes")
},render:function(){var parentView=this;
$(this.el).html(JST["acceptance_criteria/index"]({collection:this.collection.models}));
this.collection.each(function(model){var view=new App.Views.AcceptanceCriteria.Show({model:model,id:parentView.childId(model),parentView:parentView});
parentView.$("ul").append(view.render().el)
});
if(this.collection.story.IsEditable()){this.$("ul").append(JST["acceptance_criteria/new"]());
var orderChangedEvent=this.orderChanged;
this.$("ul.acceptance-criteria").sortable({start:function(event,ui){parentView.$("textarea, input").blur()
},stop:function(event,ui){orderChangedEvent()
},placeholder:"target-order-highlight",axis:"y",handle:".index"}).find(".index").disableSelection()
}this.hideEditIfCriteriaExist();
this.displayOrderIndexes();
return(this)
},createNew:function(event){event.preventDefault();
var lastCriterion=this.$("li.criterion:last");
var model=new AcceptanceCriterion();
var this_view=this;
this.collection.add(model);
var newElem=new App.Views.AcceptanceCriteria.Show({model:model,parentView:this}).render().el;
this.hideEditIfCriteriaExist(true);
if((lastCriterion.find(".data textarea").length)&&(lastCriterion.find(".data textarea").val()==="")){_.delay(function(){this_view.$("ul li:last").before(newElem);
this_view.displayOrderIndexes();
$(newElem).find(".data").click();
App.Views.Helpers.scrollIntoBacklogView($(newElem).find(".data"))
},250)
}else{this.$("ul li:last").before(newElem);
this.displayOrderIndexes();
this.$("ul li.criterion:last").css("display","none").slideDown(100,function(){$(newElem).find(".data").click();
App.Views.Helpers.scrollIntoBacklogView($(newElem).find(".data"))
})
}},orderChanged:function(){var orderIndexesWithIds={};
this.$("li.criterion").each(function(index,elem){var elemId=_.last($(elem).attr("id").split("-"));
orderIndexesWithIds[elemId]=index+1
});
if(window.console){console.log("Order changed and saving - "+JSON.stringify(orderIndexesWithIds))
}this.collection.saveOrder(orderIndexesWithIds);
this.displayOrderIndexes()
},displayOrderIndexes:function(){this.$("li.criterion").each(function(index,elem){$(elem).find(".index").html((index+1)+".")
})
},hideEditIfCriteriaExist:function(force){if(this.collection.length||force){this.$("li.new-acceptance-criterion").hide()
}else{this.$("li.new-acceptance-criterion").show()
}}}),Show:App.Views.BaseView.extend({tagName:"li",className:"criterion",events:{},initialize:function(options){App.Views.BaseView.prototype.initialize.call(this);
this.parentView=options.parentView;
_.bindAll(this,"navigateEvent")
},render:function(){$(this.el).html(JST["acceptance_criteria/show"]({model:this.model}));
if(this.model.IsEditable()){this.makeFieldsEditable();
this.$(".data input, .data textarea").live("keydown",this.navigateEvent)
}return(this)
},changeEvent:function(eventName,model){if(eventName=="change:id"){$(this.el).attr("id","acceptance-criteria-"+model.get("id"))
}},makeFieldsEditable:function(){var ac_view=this;
var contentUpdatedFunc=function(){var newVal=arguments[0];
var model_collection=ac_view.model.collection;
if(_.isEmpty(newVal)){$(ac_view.el).slideUp("fast",function(){ac_view.model.destroy({error:function(model,response){var errorMessage="Unable to delete story...  Please refresh.";
try{errorMessage=$.parseJSON(response.responseText).message
}catch(e){if(window.console){console.log(e)
}}var errorView=new App.Views.Error({message:errorMessage})
}});
$(ac_view.el).remove();
model_collection.remove(ac_view.model);
ac_view.parentView.hideEditIfCriteriaExist();
ac_view.parentView.displayOrderIndexes()
})
}else{return ac_view.contentUpdated(newVal,arguments[1],this)
}};
var beforeChangeFunc=function(){return ac_view.beforeChange(arguments[0],arguments[1],this)
};
var defaultOptions=_.extend(_.clone(this.defaultEditableOptions),{data:beforeChangeFunc,type:"textarea",autoResize:true});
$(this.el).find(">div.data").editable(contentUpdatedFunc,defaultOptions)
},navigateEvent:function(event){if(_.include([9,13,27],event.keyCode)&&(!event.ctrlKey)){$(event.target).blur();
try{event.preventDefault()
}catch(e){}var liElem=$(event.target).parents(".data").parent();
if(!event.shiftKey){if(_.first(liElem)!=_.last(liElem.parent("ul").find("li.criterion"))){App.Views.Helpers.scrollIntoBacklogView(liElem.next().find(".data"),function(elem){elem.click()
})
}else{if($.trim(this.$("textarea").val())===""){App.Views.Helpers.scrollIntoBacklogView($(this.el).parents("li.story").find("div.comments .data"),function(elem){elem.click()
})
}else{this.parentView.createNew(event)
}}}else{if(_.first(liElem)==_.first(liElem.parent("ul").find("li.criterion"))){App.Views.Helpers.scrollIntoBacklogView($(this.el).parents("li.story").find("div.so-i-can .data"),function(elem){elem.click()
})
}else{App.Views.Helpers.scrollIntoBacklogView(liElem.prev().find(".data"),function(elem){elem.click()
})
}}}}})};
App.Views.Backlogs={Show:App.Views.BaseView.extend({dataArea:$("#backlog-data-area"),initialize:function(options){App.Views.BaseView.prototype.initialize.call(this);
this.sprintTabsView=options.sprintTabsView;
_.bindAll(this,"activated")
},render:function(){var use5090estimates=$("#backlog-container #themes-header .columns .score-50").length?true:false;
var view=new App.Views.Themes.Index({collection:this.model.Themes(),use5090estimates:use5090estimates});
this.$("#themes-container").html(view.render().el);
var show_view=this;
this.updateStatistics();
if(this.model.IsEditable()){var firstEditableElem=$("ul.themes li.theme:first .theme-data .name .data");
if(firstEditableElem.length){firstEditableElem.click()
}else{$("ul.themes li.actions a.new-theme").focus()
}}return(this)
},updateStatistics:function(){$("#backlog-data-area .backlog-stats").html(JST["backlogs/stats"]({model:this.model}));
this.sprintTabsView.adjustTabConstraints(true)
},activated:function(){this.updateStatistics();
this.$("ul.stories>li.story").each(function(index,elem){$(elem).data("update-model-data")()
})
}})};
App.Views.BacklogDataArea={Show:App.Views.BaseView.extend({events:{"click #backlog-data-area .actions #print":"print"},initialize:function(options){_.bindAll(this,"print","newSnapshot","jumpToSnapshot","compareSnapshot")
},render:function(){$("#new-snapshot").click(this.newSnapshot);
$("#compare-snapshot").click(this.compareSnapshot);
$("select.snapshot-selector").change(this.jumpToSnapshot);
this.enableSnapshotsMenu();
if(!this.model.IsEditable()){$(this.el).addClass("not-editable");
$("#backlog-container").addClass("not-editable");
$("#add-sprint").hide()
}return this
},enableSnapshotsMenu:function(){var overEitherNode=false,hideMenu=function(){overEitherNode=false;
setTimeout(function(){if(overEitherNode===false){$("#backlog-data-area .snapshot").removeClass("hover");
$("section.for-backlog .snapshot-menu-container").hide()
}},50)
},showMenu=function(){$("#backlog-data-area .snapshot").addClass("hover");
$("section.for-backlog .snapshot-menu-container").show().position({of:$("#backlog-data-area .snapshot"),my:"right top",at:"right bottom",offset:"0 -5"});
overEitherNode=true
};
$("#backlog-data-area .snapshot").mouseover(showMenu).click(showMenu).mouseout(hideMenu);
$("section.for-backlog .snapshot-menu-container").mouseover(function(){overEitherNode=true
}).mouseout(hideMenu)
},print:function(event){var view=this;
event.preventDefault();
$("#dialog-print").remove();
$("body").append(JST["backlogs/print-dialog"]({backlog:this.model}));
$("#dialog-print").dialog({resizable:false,height:350,width:400,modal:true,buttons:{Print:function(){var page_size=$(this).find("#page-size option:selected").attr("id");
var fold_side=$(this).find("#fold-side option:selected").attr("id");
$.cookie("fold-side-default",fold_side);
$.cookie("page-size-default",page_size);
var printUrl=$(event.target).attr("href");
printUrl+="?print_scope="+$(this).find("#print-scope option:selected").attr("id")+"&page_size="+page_size+"&fold_side="+fold_side;
document.location.href=printUrl;
$(this).find("p.progress-placeholder").html("Please wait, we're preparing your PDF...");
$(this).parent().find(".ui-dialog-buttonset button:nth-child(2) span").text("Preparing...");
$(this).parent().find(".ui-dialog-buttonset button:nth-child(1)").remove();
var dialog=this;
_.delay(function(){$(dialog).dialog("close")
},2000)
},Cancel:function(){$(this).dialog("close")
}}})
},newSnapshot:function(event){var view=this;
var newSnapshotLink=$(event.target);
event.preventDefault();
$("#dialog-create-snapshot").remove();
$("body").append(JST["backlogs/create-snapshot-dialog"]({backlog:this.model}));
$("#dialog-create-snapshot").dialog({resizable:false,height:230,width:350,modal:true,buttons:{"Create Snapshot":function(){var name=$(this).find("input[type=text]").val();
if($.trim(name)===""){$(this).find("div.progress-area label").text("You must name your snapshot to continue.");
$(this).find("div.progress-area").addClass("field_with_errors").find("input[type=text]").focus()
}else{var href=newSnapshotLink.attr("href"),csrf_token=$("meta[name=csrf-token]").attr("content"),csrf_param=$("meta[name=csrf-param]").attr("content"),form=$('<form method="post" action="'+href+'"></form>');
var fields='<input name="'+csrf_param+'" value="'+csrf_token+'" type="hidden" />'+'<input name="name" value="'+htmlEncode(name)+'" type="hidden" />';
form.hide().append(fields).appendTo("body");
form.submit();
$(this).find("div.progress-area").html("Please wait, we're creating your snapshot...<br /><br />"+'<span class="progress-icon"></span>');
$(this).parent().find(".ui-dialog-buttonset button:nth-child(2) span").text("Preparing...");
$(this).parent().find(".ui-dialog-buttonset button:nth-child(1)").remove()
}},Cancel:function(){$(this).dialog("close")
}}})
},jumpToSnapshot:function(event){event.preventDefault();
var val=$(event.target).val();
var baseUrl=document.location.href.match(/^.*\/accounts\/\d+\/backlogs\/\d+/i)[0];
if(val.match(/^\d+$/)){baseUrl+="/snapshots/"+val
}$("#loading-new-snapshot").show();
document.location.href=baseUrl
},compareSnapshot:function(event){var view=this;
var newSnapshotLink=$(event.target);
event.preventDefault();
$("#dialog-compare-snapshot").remove();
$("body").append(JST["backlogs/compare-snapshot-dialog"]({snapshot_options:$("select.snapshot-selector").html()}));
var currentSnapshot=document.location.pathname.match(/^\/accounts\/\d+\/backlogs\/\d+\/snapshots\/(\d+)/i);
if(currentSnapshot){$("#dialog-compare-snapshot select#target-snapshot").val($("#dialog-compare-snapshot select#target-snapshot option:first-child").val())
}$("#dialog-compare-snapshot").dialog({resizable:false,height:310,width:400,modal:true,buttons:{"Compare":function(){var base=$(this).find("select#base-snapshot").val();
var target=$(this).find("select#target-snapshot").val();
if(base==target){$(this).find("div.error-message").html('<p><span class="error-alert ui-icon ui-icon-alert"></span>'+"You cannot compare the same snapshots.  Please make another selection.</p>")
}else{var baseUrl=document.location.pathname.match(/^\/accounts\/\d+\/backlogs/i)[0];
var backlogId=document.location.pathname.match(/^\/accounts\/\d+\/backlogs\/(\d+)/i)[1];
var url=baseUrl+"/compare/"+(base.match(/^\d+$/)?base:backlogId)+"/"+(target.match(/^\d+$/)?target:backlogId);
if(App.environment==="test"){document.location.href=url
}else{window.open(url,"_newtab"+Math.floor(Math.random()*10000))
}$(this).dialog("close")
}},Cancel:function(){$(this).dialog("close")
}}})
}})};
App.Views.BacklogStats={Show:App.Views.BaseView.extend({events:{},initialize:function(){App.Views.BaseView.prototype.initialize.call(this)
},render:function(){$(this.el).html(JST["backlogs/sprint-progress-stats"]({model:this.model}));
return this
}})};
App.Views.Notice=Backbone.View.extend({className:"notice",displayLength:5000,defaultMessage:"",initialize:function(){_.bindAll(this,"render");
this.message=this.options.message||this.defaultMessage;
this.render()
},render:function(){var view=this;
$(this.el).html(this.message);
$(this.el).hide();
$("#alert-space").html(this.el);
$(this.el).slideDown();
_.delay(function(){$(view.el).slideUp();
_.delay(function(){view.remove()
},100)
},(this.className=="notice"?this.displayLength:this.displayLength*2));
return this
}});
App.Views.Error=App.Views.Notice.extend({className:"error",defaultMessage:"Uh oh! Something went wrong. Please try again."});
App.Views.Warning=App.Views.Notice.extend({className:"warning",defaultMessage:"Unfortunately we could not perform that action."});
App.Views.Sprints={Show:App.Views.BaseView.extend({childId:function(model){return"sprint-story-"+model.get("id")
},persistOrderActions:0,events:{"click .stories-divider .change-size":"toggleUnassignedStoriesSize"},initialize:function(options){App.Views.BaseView.prototype.initialize.call(this);
this.sprintTabsView=options.sprintTabsView;
_.bindAll(this,"toggleMore","persistSprintStories","positionStoriesContainerOnScroll","updateStatistics")
},render:function(){var that=this,storiesAssignedToSprints={},sortFn;
$(this.el).html(JST["sprints/show"]({model:this.model}));
that.toggleUnassignedStoriesSize(true);
this.updateStatistics(this.model.attributes);
sortFn=function(t){return t.get("position")
};
_(this.model.SprintStories().sortBy(sortFn)).each(function(model){var view=new App.Views.Sprints.SprintStory({model:model.Story(),parentView:that,id:that.childId(model.Story())});
$(that.el).find(".stories-container .cards").append(view.render().el)
});
this.model.collection.each(function(sprint){sprint.SprintStories().each(function(sprintStory){storiesAssignedToSprints[sprintStory.get("story_id")]=sprintStory
})
});
_(this.model.Backlog().Themes().sortBy(sortFn)).each(function(theme){_(theme.Stories().sortBy(sortFn)).each(function(story){if(!storiesAssignedToSprints[story.get("id")]){var view=new App.Views.Sprints.SprintStory({model:story,parentView:that,id:that.childId(story)});
$(that.el).find(".unassigned-stories-container").append(view.render().el)
}})
});
this.$(".stories-container .cards, .unassigned-stories-container").sortable({connectWith:".story-droppable",stop:that.persistSprintStories,placeholder:"story-card-place-holder",cancel:".locked"}).disableSelection();
$(window).bind("scroll.sprints",this.positionStoriesContainerOnScroll).bind("resize.sprints",this.positionStoriesContainerOnScroll);
if(!App.Views.MouseTracker){App.Views.MouseTracker=new MouseTracker(jQuery)
}return this
},updateStatistics:function(attributes){this.model.set(attributes);
$("#backlog-data-area .backlog-stats").html(JST["sprints/stats"]({attributes:attributes}));
var totals=this.$(".stories-container .totals");
if(this.model.SprintStories().length===0){totals.addClass("notice").html(JST["sprints/empty"]())
}else{totals.removeClass("notice").html(JST["sprints/totals"]({attributes:attributes,storyCount:this.model.SprintStories().length}))
}this.sprintTabsView.adjustTabConstraints(true)
},toggleUnassignedStoriesSize:function(dontToggle){var storyContainerSizes=[70,48.5],spaceBetween=3,dividerOffset=1,headingOffset=1.5,that=this;
if(dontToggle!==true){$(this.el).toggleClass("contracted-unassigned-stories")
}if($(this.el).hasClass("contracted-unassigned-stories")){newStoryContainerSize=storyContainerSizes[0]
}else{newStoryContainerSize=storyContainerSizes[1]
}if(dontToggle!==true){this.$(".stories-divider .handle").hide();
this.$(".stories-container").animate({width:newStoryContainerSize+"%"},"fast");
this.$(".unassigned-stories-container").animate({width:(100-newStoryContainerSize-spaceBetween)+"%","margin-left":(newStoryContainerSize+spaceBetween)+"%"},"fast");
this.$(".stories-divider").animate({left:(newStoryContainerSize+dividerOffset)+"%"},"fast");
this.$(".unassigned-stories-heading").animate({left:(newStoryContainerSize+headingOffset)+"%",width:(100-0.5-(newStoryContainerSize+headingOffset))+"%"},"fast",null,function(){var direction=($(that.el).hasClass("contracted-unassigned-stories"))?"right":"left";
that.$(".stories-divider .handle").show("slide",{direction:direction},"fast");
that.$(".story-card").each(function(index,elem){$(elem).data("reset-toggle")()
})
})
}else{this.$(".stories-container").css("width",newStoryContainerSize+"%");
this.$(".unassigned-stories-container").css("width",(100-newStoryContainerSize-spaceBetween)+"%").css("margin-left",(newStoryContainerSize+spaceBetween)+"%");
this.$(".stories-divider").css("left",(newStoryContainerSize+dividerOffset)+"%");
this.$(".unassigned-stories-heading").css("left",(newStoryContainerSize+headingOffset)+"%").css("width",(100-0.5-(newStoryContainerSize+headingOffset))+"%");
this.$(".story-card").each(function(index,elem){$(elem).data("reset-toggle")()
})
}},persistSprintStories:function(){var that=this,persistOrder;
persistOrder=function(){that.persistOrderActions-=1;
if(that.persistOrderActions<=0){that.persistOrderActions=0;
var updateParams={};
that.$(".stories-container .story-card").each(function(index,storyNode){var storyId=Number($(storyNode).attr("id").replace("sprint-story-",""));
var sprintStory=that.model.SprintStories().getByStoryId(storyId);
if(sprintStory.get("position")!==index+1){updateParams[sprintStory.get("id")]=index+1
}});
if(Object.keys(updateParams).length){that.model.SprintStories().batchUpdatePosition(updateParams,{error:function(){var errorView=new App.Views.Error({message:"Order of stories could not be saved.  Please refresh your browser"})
}})
}}};
this.model.SprintStories().each(function(story){if(!that.$(".stories-container #"+that.childId(story.Story())).length){var storyNode=$(".unassigned-stories-container #"+that.childId(story.Story()));
storyNode.data("reset-toggle")();
if(!story.beingDestroyed){that.persistOrderActions+=1;
story.beingDestroyed=true;
story.destroy({success:function(model,response){story.beingDestroyed=false;
that.updateStatistics(response.sprint_statistics);
that.model.set(response.sprint_statistics);
persistOrder();
storyNode.data("update-sprint-story-status")()
},error:function(model,response){story.beingDestroyed=false;
var errorMessage="Oops, we've been unable to remove that story from this sprint.  Please refresh your browser.";
try{errorMessage=$.parseJSON(response.responseText).message
}catch(e){if(window.console){console.log(e)
}}var errorView=new App.Views.Error({message:errorMessage})
}})
}}});
this.$(".stories-container .story-card").each(function(index,storyNode){var storyId=Number($(storyNode).attr("id").replace("sprint-story-",""));
if(!that.model.SprintStories().getByStoryId(storyId)){$(storyNode).data("reset-toggle")();
var newSprintStory=new SprintStory({story_id:$(storyNode).data("story_id"),sprint_id:that.model.get("id")});
that.model.SprintStories().add(newSprintStory);
that.persistOrderActions+=1;
newSprintStory.save(false,{success:function(model,response){that.updateStatistics(model.get("sprint_statistics"));
that.model.set(model.get("sprint_statistics"));
persistOrder();
$(storyNode).data("update-sprint-story-status")()
},error:function(model,response){var errorMessage="we've got a problem on our side";
try{errorMessage=$.parseJSON(response.responseText).message
}catch(e){if(window.console){console.log(e)
}}var errorView=new App.Views.Error({message:"Oops, "+errorMessage+".  Please refresh your browser"})
}})
}});
if(that.persistOrderActions===0){persistOrder()
}this.positionStoriesContainerOnScroll();
$(".story-card").each(function(index,story){if(App.Views.MouseTracker.isOver(story)){$(story).trigger("mouseenter")
}})
},positionStoriesContainerOnScroll:function(){var storyContainer=this.$(".stories-container"),unassignedContainer=this.$(".unassigned-stories-container"),storiesDivider=this.$(".stories-divider"),height=storyContainer.outerHeight(),windowHeight=$(window).height(),scrollAmount=$(window).scrollTop(),maxScroll=Math.max(height-(windowHeight/2)+$(".main-content-pod").offset().top,$(".main-content-pod").offset().top);
if(!this.storiesContainerTop){this.storiesContainerTop=storyContainer.offset().top
}var storiesWidth=unassignedContainer.offset().left-storiesDivider.width()-storyContainer.offset().left+(storiesDivider.offset().left+storiesDivider.width()-unassignedContainer.offset().left)*2;
if((scrollAmount>maxScroll)&&(storyContainer.height()<unassignedContainer.height())){if(storyContainer.css("position")!=="fixed"){storyContainer.css("position","fixed").css("top",Math.floor(this.storiesContainerTop-maxScroll)+"px").css("width",storiesWidth+"px")
}if(storyContainer.css("top")!==Math.floor(this.storiesContainerTop-maxScroll)+"px"){storyContainer.animate({top:Math.floor(this.storiesContainerTop-maxScroll)+"px"},"fast")
}}else{if(storyContainer.css("position")!=="static"){storyContainer.css("position","static").css("top","auto")
}}if(storyContainer.css("width")!==storiesWidth+"px"){storyContainer.css("width",storiesWidth+"px")
}},cleanUp:function(){$(window).unbind(".sprints")
}}),Help:App.Views.BaseView.extend({pod:false,initialize:function(options){App.Views.BaseView.prototype.initialize.call(this);
this.sprintTabsView=options.sprintTabsView;
_.bindAll(this,"addSprint")
},render:function(){$(this.el).html(JST["sprints/help"]());
this.pod=$(JST["sprints/help-pod"]());
this.pod.find("a.add-new-sprint").click(this.addSprint);
$("section.main-content-pod").before(this.pod)
},addSprint:function(event){this.sprintTabsView.createNew(event)
},cleanUp:function(){this.pod.remove()
}}),SprintStory:App.Views.BaseView.extend({tagName:"div",className:"story-card",contractedHeight:90,heightBuffer:10,events:{"click .more .tab":"toggleMore","click .move":"moveStory","click .status .tab":"statusChangeClick","blur .status .drop-down select":"statusDropDownLostFocus","change .status .drop-down select":"statusDropDownChanged",},initialize:function(options){App.Views.BaseView.prototype.initialize.call(this);
this.parentView=options.parentView;
_.bindAll(this,"resetToggle","updateSprintStoryStatus")
},render:function(){var that=this;
$(this.el).html(JST["sprints/sprint-story"]({model:this.model}));
this.setStatusHover();
setTimeout(function(){that.resetToggle()
},1);
$(this.el).data("reset-toggle",this.resetToggle);
$(this.el).hover(function(){$(this).addClass("hover")
},function(){$(this).removeClass("hover")
});
$(this.el).data("story_id",this.model.get("id"));
$(this.el).data("update-sprint-story-status",this.updateSprintStoryStatus);
this.setEditableState();
return this
},resetToggle:function(){$(this.el).css("height","auto");
if($(this.el).height()>this.contractedHeight+this.heightBuffer){$(this.el).data("original-height",$(this.el).height());
this.toggleMore(0)
}else{$(this.el).find(".more").css("display","none")
}},updateSprintStoryStatus:function(){$(this.el).find(".status").html($(JST["sprints/sprint-story"]({model:this.model})).find(".status"));
this.setStatusHover();
this.setEditableState()
},setStatusHover:function(){App.Views.Helpers.setStatusHover.apply(this,arguments)
},statusChangeClick:function(){App.Views.Helpers.statusChangeClick.apply(this,arguments)
},statusDropDownChanged:function(){App.Views.Helpers.statusDropDownChanged.apply(this,arguments);
this.setEditableState()
},statusDropDownLostFocus:function(){App.Views.Helpers.statusDropDownLostFocus.apply(this,arguments)
},setEditableState:function(){if(this.model.IsEditable()){$(this.el).removeClass("locked")
}else{$(this.el).addClass("locked")
}},toggleMore:function(speed){var delay=isNaN(parseInt(speed))?"fast":speed,that=this;
$(this.el).find(".more").css("display","block");
if($(this.el).css("height")===this.contractedHeight+"px"){$(this.el).animate({height:$(this.el).data("original-height")},delay,null,that.parentView.positionStoriesContainerOnScroll);
$(this.el).find(".more").addClass("less").find(".tab").text("less")
}else{$(this.el).animate({height:this.contractedHeight+"px"},delay,null,that.parentView.positionStoriesContainerOnScroll);
$(this.el).find(".more").removeClass("less").find(".tab").text("more")
}},moveStory:function(){$(this.el).removeClass("hover");
var target=$(this.el).parents(".stories-container .cards").length==0?this.parentView.$(".stories-container .cards"):this.parentView.$(".unassigned-stories-container");
target.append(this.el);
this.parentView.persistSprintStories()
}})};
App.Views.SprintTabs={Index:App.Views.BaseView.extend({childId:function(model){return"tab-sprint-"+model.get("id")
},isSettingsPage:false,models:{},events:{"click #add-sprint>a":"createNew"},initialize:function(){this.collection=this.options.collection;
this.router=this.options.router;
_.bindAll(this,"showNew","getModelFromIteration","restoreTab")
},render:function(){var view=this;
this.isSettingsPage=$("#backlog-data-area").length==0;
this.isSnapshot=$(".not-editable-backlog-notice");
var addTabView=function(model){var tabView=new App.Views.SprintTabs.Show({model:model,id:view.childId(model),router:view.router});
view.$("ul.infinite-tabs").append(tabView.render().el);
view.models[model.get("iteration")]=model
};
var pinnedTabs=[{get:function(){return"Backlog"
},active:true,locked:true}];
if(!this.isSettingsPage&&!this.isSnapshot){pinnedTabs.push({get:function(){return"Stats"
},locked:true})
}if(!this.isSettingsPage&&!this.collection.length&&!this.isSnapshot){pinnedTabs.push({get:function(){return"Sprints"
}})
}_(pinnedTabs).each(addTabView);
_(this.collection.sortBy(function(model){return -model.get("id")
})).each(addTabView);
if(!this.isSettingsPage){this.adjustTabConstraints();
$(this.el).css("top",($("#themes-header").offset().top-$(this.el.find("ul li:first")).outerHeight())+"px")
}view.$("ul.infinite-tabs").infiniteTabs();
return this
},adjustTabConstraints:function(resizeExpected){var that=this;
this.totalTabWidth=$("#backlog-data-area .backlog-stats").offset().left-$(this.el).offset().left;
this.windowWidth=$(window).width();
$(this.el).css("width",this.totalTabWidth+"px");
if(resizeExpected){$(this.el).find("ul.infinite-tabs").infiniteTabs("adjust-to-fit")
}if(!this.resizeEventAdded){this.resizeEventAdded=true;
$(window).resize(function(){var resizeWidthBy=$(window).width()-that.windowWidth;
if(resizeWidthBy){that.totalTabWidth+=resizeWidthBy;
that.windowWidth=$(window).width();
$(that.el).css("width",that.totalTabWidth+"px")
}})
}},getModelFromIteration:function(iteration){return this.models[iteration]
},showNew:function(model){this.models[model.get("iteration")]=model;
var tabView=new App.Views.SprintTabs.Show({model:model,id:this.childId(model),router:this.router});
this.$("ul.infinite-tabs").infiniteTabs("prepend-tab",tabView.render().el);
if(this.models["Sprints"]){this.$("ul.infinite-tabs").infiniteTabs("remove-tab",this.$("li#"+this.childId(this.models["Sprints"])));
delete this.models["Sprints"]
}this.router.navigate(model.get("iteration").toString(),true)
},select:function(model){var infinityTab=this.$("ul.infinite-tabs"),currentActive=this.$("li.active");
if(currentActive.length){infinityTab.infiniteTabs("set-tab-content",currentActive,currentActive.find("a").html().replace(/^\s*Sprint (\d+)\s*$/,"$1"))
}var tab=this.$("li#"+this.childId(model));
tab.parents(".infinite-tabs").find("li").removeClass("active");
tab.addClass("active");
infinityTab.infiniteTabs("set-tab-content",tab,tab.find("a").html().replace(/^\s*(\d+)\s*$/,"Sprint $1"))
},restoreTab:function(iteration){var model=this.getModelFromIteration(iteration);
this.select(model)
},destroy:function(model,callback){var view=this;
this.$("ul.infinite-tabs").infiniteTabs("remove-tab",this.$("li#"+this.childId(model)));
delete this.models[model.get("iteration")];
if(model.get("iteration")>1){this.models[model.get("iteration")-1].fetch({success:function(previousModel){view.router.navigate(String(previousModel.get("iteration")),true);
if(_.isFunction(callback)){callback()
}},failure:function(){new App.Views.Error({message:"Internal error, unable to refresh sprint data.  Please refresh your browser"});
view.router.navigate(String(previousModel.get("iteration")),true);
if(_.isFunction(callback)){callback()
}}})
}else{this.router.navigate("Backlog",true);
if(_.isFunction(callback)){callback()
}}},createNew:function(event){var view=this;
event.preventDefault();
$("#dialog-new-sprint").remove();
$("body").append(JST["sprints/new-dialog"]({sprints:this.collection}));
$("#dialog-new-sprint").dialog({resizable:false,height:350,width:400,modal:true,buttons:{Create:function(){var dialog=$(this);
if(!dialog.find("form").valid()){$(dialog).find("p.intro").addClass("error").html("One or more fields are not completed correctly.  Please correct these to continue.");
return false
}$(this).find("p.progress-placeholder").html("Please wait, creating new sprint...");
$(this).parent().find(".ui-dialog-buttonset button:nth-child(2) span").text("Preparing...");
$(this).parent().find(".ui-dialog-buttonset button:nth-child(1)").hide();
var model=new Sprint({start_on:$.datepicker.formatDate("yy-mm-dd",dialog.find("#start-on").datepicker("getDate")),duration_days:dialog.find("#duration-days").val(),number_team_members:dialog.find("#number-team-members").val()});
view.collection.add(model);
model.save(false,{success:function(model,response){view.showNew(model);
new App.Views.Notice({message:"Sprint number "+model.get("iteration")+" has been added"});
$(dialog).dialog("close")
},error:function(model,error){if(window.console){console.log(JSON.stringify(error))
}if($(dialog).is(":visible")){$(dialog).find("p.intro").addClass("error").html("Oops, we could not create a sprint as it looks like you haven't filled in everything correctly:<br>"+JSON.parse(error.responseText).message);
$(dialog).parent().find(".ui-dialog-buttonset button:nth-child(2) span").text("Cancel");
$(dialog).parent().find(".ui-dialog-buttonset button:nth-child(1)").show();
$(dialog).find("p.progress-placeholder").html("")
}else{var errorView=new App.Views.Error({message:"Sprint was not created, please try again"})
}view.collection.remove(model)
}})
},Cancel:function(){$(this).dialog("close")
}}});
var dialog=$("#dialog-new-sprint");
dialog.find("#start-on").datepicker();
if(_.isFunction($.fn.validate)){dialog.find("form").validate({rules:{duration_days:{required:true,digits:true,min:1},number_team_members:{required:true,digits:true,min:1}},messages:{duration_days:{required:"Sprint duration is required",digits:"Enter a value using whole numbers only",min:"Sprint duration must be at least 1 day"},number_team_members:{required:"Number of team members is required",digits:"Enter a value using whole numbers only",min:"Team must comprise of at least one member"}}})
}if(this.collection.length==0){dialog.find("#start-on").datepicker("setDate",new Date(new Date().getTime()+1000*60*60*24));
dialog.find("#duration-days").val("10");
dialog.find("#number-team-members").val("1")
}else{if(this.collection.length==1){var dayInMs=1000*60*60*24,lastSprint=this.collection.at(0),lastDate=parseRubyDate(lastSprint.get("start_on")).getTime(),lastDuration=Number(lastSprint.get("duration_days")),nextDate=lastDate+((lastDuration+1)*dayInMs)+(Math.floor(lastDuration/5)*2*dayInMs);
dialog.find("#start-on").datepicker("setDate",new Date(nextDate));
dialog.find("#duration-days").val(lastDuration);
dialog.find("#number-team-members").val(lastSprint.get("number_team_members"))
}else{var dayInMs=1000*60*60*24,sprintsDesc=this.collection.sortBy(function(sprint){return sprint.get("iteration")
}).reverse(),lastSprint=sprintsDesc[0],previousSprint=sprintsDesc[1],timePassedBetweenDates=parseRubyDate(lastSprint.get("start_on")).getTime()-parseRubyDate(previousSprint.get("start_on")).getTime(),nextDate=parseRubyDate(lastSprint.get("start_on")).getTime()+timePassedBetweenDates;
dialog.find("#start-on").datepicker("setDate",new Date(nextDate));
dialog.find("#duration-days").val(lastSprint.get("duration_days"));
dialog.find("#number-team-members").val(lastSprint.get("number_team_members"))
}}}}),Show:App.Views.BaseView.extend({tagName:"li",className:"sprint-tab",events:{"click a":"activate"},initialize:function(){App.Views.BaseView.prototype.initialize.call(this);
this.router=this.options.router;
this.parentView=this.options.parentView;
_.bindAll(this,"remove")
},render:function(){$(this.el).html(JST["sprints/tabs/show"]({model:this.model}));
if(this.model.active){$(this.el).addClass("active")
}if(this.model.locked){$(this.el).addClass("locked")
}return this
},activate:function(){this.router.navigate(String(this.model.get("iteration")),true)
}})};
App.Views.Stories={Index:Backbone.View.extend({tagName:"div",className:"stories",childId:function(model){return"story-"+model.get("id")
},events:{"click ul.stories .actions a.new-story":"createNew","keydown ul.stories .actions a.new-story":"addStoryKeyPress"},initialize:function(){this.collection=this.options.collection;
this.use5090estimates=this.options.use5090estimates;
_.bindAll(this,"orderChanged","displayOrderIndexes")
},render:function(){var view=this;
$(this.el).html(JST["stories/index"]({collection:this.collection.models}));
this.collection.each(function(model){var storyView=new App.Views.Stories.Show({model:model,id:view.childId(model),use5090estimates:view.use5090estimates});
view.$("ul.stories").append(storyView.render().el)
});
if(this.collection.theme.IsEditable()){if(!this.collection.theme.isNew()){this.$("ul.stories").append(JST["stories/new"]())
}var orderChangedEvent=this.orderChanged;
var actionsElem;
this.$("ul.stories").sortable({start:function(event,ui){actionsElem=view.$("ul.stories>.actions").clone();
view.$("ul.stories>.actions").remove();
view.storyDragged=true;
$("#vtip").remove();
view.$(".move-story.vtipActive").mouseleave();
view.$(".move-story").removeClass("vtip");
$(".color-picker").hide()
},stop:function(event,ui){App.Views.Stories.Index.stopMoveEvent=true;
orderChangedEvent();
view.$("ul.stories").append(actionsElem);
view.$(".move-story").addClass("vtip")
},placeholder:"target-order-highlight",axis:"y",handle:".move-story a"}).find(".move-story").disableSelection();
this.$(".color-picker-icon a").click(function(event){$("#vtip").remove();
$(event.target).mouseleave()
})
}return(this)
},createNew:function(event){event.preventDefault();
var model=new Story();
this.collection.add(model);
this.$("ul.stories li:last").before(new App.Views.Stories.Show({model:model,use5090estimates:this.use5090estimates}).render().el);
var this_view=this;
this.$("ul.stories li.story:last").css("display","none").slideDown("fast",function(){this_view.$("ul.stories li.story:last > .user-story > .as-a > .data").click()
})
},addStoryKeyPress:function(event){var thisTheme,nextTheme,lastStory;
if(9==event.keyCode){event.preventDefault();
if(event.shiftKey){event.preventDefault();
thisTheme=$(this.el).parents("li.theme");
lastStory=thisTheme.find("li.story:not(.locked):last .score-90 .data, li.story:not(.locked):last .score .data");
if(lastStory.length){App.Views.Helpers.scrollIntoBacklogView(lastStory,function(){lastStory.click()
})
}else{App.Views.Helpers.scrollIntoBacklogView(thisTheme.find(".theme-data .name .data"),function(elem){elem.click()
})
}}else{nextTheme=$(this.el).parents("li.theme").next();
if(nextTheme.hasClass("theme")){App.Views.Helpers.scrollIntoBacklogView(nextTheme.find(".theme-data .name .data"),function(elem){elem.click()
})
}else{App.Views.Helpers.scrollIntoBacklogView(nextTheme.find("a.new-theme"),function(elem){elem.focus()
})
}}}else{if(13===event.keyCode){event.preventDefault();
this.createNew(event)
}}},orderChanged:function(){var orderIndexesWithIds={};
this.$("li.story").each(function(index,elem){var elemId=_.last($(elem).attr("id").split("-"));
if(!isNaN(parseInt(elemId,10))){orderIndexesWithIds[elemId]=index+1
}});
if(window.console){console.log("Order changed and saving - "+JSON.stringify(orderIndexesWithIds))
}this.collection.saveOrder(orderIndexesWithIds)
}}),Show:App.Views.BaseView.extend({tagName:"li",className:"story",deleteDialogTemplate:"stories/delete-dialog",isEditable:false,events:{"click .delete-story>a":"remove","click .duplicate-story>a":"duplicate","click .status .tab":"statusChangeClick","blur .status .drop-down select":"statusDropDownLostFocus","change .status .drop-down select":"statusDropDownChanged",},initialize:function(){this.use5090estimates=this.options.use5090estimates;
App.Views.BaseView.prototype.initialize.call(this);
_.bindAll(this,"navigateEvent","moveToThemeDialog","moveToTheme","changeColor","modelDataHasChanged")
},render:function(){this.modelDataHasChanged();
$(this.el).data("update-model-data",this.modelDataHasChanged);
var view=new App.Views.AcceptanceCriteria.Index({collection:this.model.AcceptanceCriteria()});
this.$(".acceptance-criteria").html(view.render().el);
if(this.model.IsEditable()){this.makeFieldsEditable();
var show_view=this;
var tabElems=[".user-story .data",".unique-id .data",".comments .data",".score-50 .data",".score-90 .data",".score .data"];
_.each(tabElems,function(elem){show_view.$(elem+" textarea, "+elem+" input").live("keydown",show_view.navigateEvent)
});
this.$(".move-story a").mousedown(function(event){App.Views.Stories.Index.stopMoveEvent=false
}).click(function(event){event.preventDefault();
if(!App.Views.Stories.Index.stopMoveEvent){show_view.moveToThemeDialog()
}});
this.$(".color-picker-icon a").simpleColorPicker({onChangeColor:function(col){show_view.changeColor(col)
},colorsPerLine:4,colors:["#ffffff","#dddddd","#bbbbbb","#999999","#ff0000","#ff9900","#ffff00","#00ff00","#00ffff","#6666ff","#9900ff","#ff00ff","#f4cccc","#d9ead3","#cfe2f3","#ead1dc","#ffe599","#b6d7a8","#b4a7d6","#d5a6bd","#e06666","#f6b26b","#ffd966","#93c47d"]})
}if(this.model.get("color")){this.changeColor(this.model.get("color"),{silent:true})
}return this
},modelDataHasChanged:function(onlyIfEditableStatusHasChanged){if(this.populatedHtml){if(this.isEditable===this.model.IsEditable()){if(!onlyIfEditableStatusHasChanged){$(this.el).find(".sprint-story-info").html($(JST["stories/show"]({model:this.model,use5090estimates:this.use5090estimates})).find(".sprint-story-info"))
}}else{var newView=new App.Views.Stories.Show({model:this.model,id:$(this.el).attr("id"),use5090estimates:this.use5090estimates});
$(this.el).replaceWith(newView.render().el)
}}else{this.populatedHtml=true;
$(this.el).html(JST["stories/show"]({model:this.model,use5090estimates:this.use5090estimates}))
}if(this.model.IsEditable()){$(this.el).removeClass("locked")
}else{$(this.el).addClass("locked")
}this.setStatusHover()
},setStatusHover:function(){App.Views.Helpers.setStatusHover.apply(this,arguments)
},statusChangeClick:function(){App.Views.Helpers.statusChangeClick.apply(this,arguments)
},statusDropDownLostFocus:function(){App.Views.Helpers.statusDropDownLostFocus.apply(this,arguments)
},statusDropDownChanged:function(){App.Views.Helpers.statusDropDownChanged.apply(this,arguments);
this.modelDataHasChanged(true)
},makeFieldsEditable:function(){var show_view=this,contentUpdatedFunc=function(value,settings){return show_view.contentUpdated(value,settings,this)
},beforeChangeFunc=function(value,settings){return show_view.beforeChange(value,settings,this)
},defaultOptions=_.extend(_.clone(this.defaultEditableOptions),{data:beforeChangeFunc});
this.isEditable=true;
var uniqueIdContentUpdatedFunc=function(value,settings){return(show_view.model.Theme().get("code")+contentUpdatedFunc.call(this,value,settings))
};
var uniqueIdBeforeChangeFunc=function(value,settings){return beforeChangeFunc.call(this,value.substring(3),settings)
};
var uniqueIdOptions=_.extend(_.clone(defaultOptions),{data:uniqueIdBeforeChangeFunc,maxLength:4});
this.$(">div.unique-id .data").editable(uniqueIdContentUpdatedFunc,uniqueIdOptions);
this.$(">div.score-50 .data, >div.score-90 .data, >div.score .data").editable(contentUpdatedFunc,_.extend(_.clone(defaultOptions),{maxLength:2}));
this.$(">div.comments .data").editable(contentUpdatedFunc,_.extend(_.clone(defaultOptions),{type:"textarea",saveonenterkeypress:true,autoResize:true}));
var autoCompleteData=function(){var asAValues=[];
show_view.model.Theme().collection.each(function(theme){asAValues=asAValues.concat(theme.Stories().pluck("as_a"))
});
return _.uniq(_.compact(asAValues)).sort()
};
_.each(["as-a","i-want-to","so-i-can"],function(elem){_.defer(function(){var width=show_view.$(">div.user-story ."+elem+" .heading").outerWidth()+10;
var options=_.extend(_.clone(defaultOptions),{type:(elem=="as-a"?"text":"textarea"),maxLength:(elem=="as-a"?100:2040),saveonenterkeypress:true,lesswidth:width,autoResize:true,autoComplete:autoCompleteData});
show_view.$(">div.user-story ."+elem+" .data").editable(contentUpdatedFunc,options)
})
})
},navigateEvent:function(event){var isInput=$(event.target).is("input"),viewElements,dataClass,dataElem,sibling,previousSelector,lastCriterion,previousUnlocked;
if(_.include([9,13,27],event.keyCode)&&(isInput||!event.ctrlKey)){$(event.target).blur();
try{event.preventDefault()
}catch(e){}viewElements=["unique-id .data","as-a .data","i-want-to .data","so-i-can .data","acceptance-criteria ul.acceptance-criteria li:first-child>*","comments .data"];
if(this.use5090estimates){viewElements.push("score-50 .data");
viewElements.push("score-90 .data")
}else{viewElements.push("score .data")
}dataClass=$(event.target);
if(!dataClass.hasClass("data")){dataClass=dataClass.parents(".data")
}dataClass=dataClass.parent();
dataElem=_.detect(viewElements,function(id){return dataClass.hasClass(_.first(id.split(" ")))
});
if(dataElem){if(!event.shiftKey){if(dataElem!=_.last(viewElements)){this.$("."+viewElements[_.indexOf(viewElements,dataElem)+1]).click()
}else{var sibling=$(this.el).nextAll("li:not(.locked):first");
if(sibling.find("a.new-story").length){App.Views.Helpers.scrollIntoBacklogView(sibling.find("a.new-story"),function(elem){elem.focus()
})
}else{App.Views.Helpers.scrollIntoBacklogView(sibling.find("."+_.first(viewElements)),function(elem){elem.click()
})
}}}else{if(dataElem!=_.first(viewElements)){var previousSelector=viewElements[_.indexOf(viewElements,dataElem)-1];
if(previousSelector.indexOf("acceptance-criteria")===0){var lastCriterion=this.$(".acceptance-criteria ul.acceptance-criteria li:visible:last>*");
App.Views.Helpers.scrollIntoBacklogView(lastCriterion,function(elem){elem.click()
})
}else{this.$("."+previousSelector).click()
}}else{previousUnlocked=$(this.el).prevAll("li:not(.locked):first");
if(previousUnlocked.length){App.Views.Helpers.scrollIntoBacklogView(previousUnlocked.find(".score-90 .data, .score .data"),function(elem){elem.click()
})
}else{App.Views.Helpers.scrollIntoBacklogView($(this.el).parents("li.theme").find(".theme-data >.name .data"),function(elem){elem.click()
})
}}}}}},changeEvent:function(eventName,model){var newValue;
if((eventName.substring(0,7)==="change:")&&(eventName!=="change:acceptance_criteria")){var fieldChanged=eventName.substring(7);
newValue=this.model.get(fieldChanged);
if(fieldChanged==="unique_id"){if(this.$(">div."+fieldChanged.replace(/_/gi,"-")+">div.data input").length===0){newValue=this.model.Theme().get("code")+newValue;
this.$(">div."+fieldChanged.replace(/_/gi,"-")+">div.data").text(newValue)
}else{this.$(">div."+fieldChanged.replace(/_/gi,"-")+">div.data input").val(newValue)
}}else{if(_.isString(newValue)){newValue=multiLineHtmlEncode(newValue);
if(newValue===""){newValue=this.defaultEditableOptions.placeholder
}this.$("div."+fieldChanged.replace(/_/gi,"-")+">div.data").html(newValue)
}}if(eventName=="change:id"){$(this.el).attr("id","story-"+model.get("id"))
}App.Controllers.Statistics.updateStatistics(this.model.get("score_statistics"))
}},deleteAction:function(dialog_obj,view){var model_collection=view.model.collection;
$(dialog_obj).find(">p").html("Deleting story...<br /><br />Please wait.");
$(dialog_obj).parent().find(".ui-dialog-buttonset button:nth-child(2) span").text("Close");
$(dialog_obj).parent().find(".ui-dialog-buttonset button:nth-child(1)").remove();
view.model.destroy({error:function(model,response){var errorMessage="Unable to delete story...";
try{errorMessage=$.parseJSON(response.responseText).message
}catch(e){if(window.console){console.log(e)
}}var errorView=new App.Views.Error({message:errorMessage});
$(dialog_obj).dialog("close")
},success:function(model,response){model_collection.remove(view.model);
$(view.el).remove();
$(dialog_obj).dialog("close");
App.Controllers.Statistics.updateStatistics(response.score_statistics)
}})
},moveToThemeDialog:function(){if(window.console){console.log("Requested to move")
}var view=this;
$("#dialog-move-story").remove();
$("body").append(JST["stories/move-dialog"]({story:this.model,themes:this.model.Theme().Backlog().Themes()}));
$("#dialog-move-story").dialog({resizable:false,height:170,modal:true,buttons:{Move:function(){view.moveToTheme(this)
},Cancel:function(){$(this).dialog("close")
}}})
},moveToTheme:function(dialog){var themeId=$(dialog).find("select#theme-target option:selected").attr("id");
if(themeId!=this.model.Theme().get("id")){if(window.console){console.log("Moving to theme-"+themeId)
}$(this.el).insertBefore($("li.theme#theme-"+themeId+" ul.stories>li:last"));
this.model.MoveToTheme(themeId,{success:function(model,response){var errorView=new App.Views.Notice({message:"The story was moved successfully."})
},error:function(){var errorView=new App.Views.Error({message:"The story move failed.  Please refresh your browser."})
}})
}$(dialog).dialog("close")
},changeColor:function(color,options){var colorWithoutHex=(color.match(/^#/)?color.substring(1):color);
var colorWithHex="#"+colorWithoutHex;
if(colorWithoutHex.toLowerCase()==="ffffff"){colorWithoutHex=colorWithHex=""
}var colors=colorWithoutHex.match(/[\d\w]{2}/g);
$(this.el).css("background-color","rgba("+parseInt(colors[0],16)+", "+parseInt(colors[1],16)+", "+parseInt(colors[2],16)+", 0.15)");
$(this.el).find(".background-color-indicator").css("background-color",colorWithHex);
if(!options||!options.silent){this.model.set({color:colorWithoutHex});
this.model.save()
}},duplicate:function(event){var model=new Story();
var attributes=_.clone(this.model.attributes);
delete attributes.id;
delete attributes.unique_id;
this.model.AcceptanceCriteria().each(function(criterion){var crit=new AcceptanceCriterion();
crit.set({criterion:criterion.get("criterion")});
model.AcceptanceCriteria().add(crit)
});
model.set(attributes);
this.model.collection.add(model);
var storyView=new App.Views.Stories.Show({model:model,id:0,use5090estimates:this.use5090estimates});
var newStoryDomElem=$(storyView.render().el);
newStoryDomElem.insertBefore($(this.el).parents("ul.stories").find(">li.actions"));
model.save(false,{success:function(model,response){model.AcceptanceCriteria().each(function(criterion){criterion.save()
})
},error:function(model,error){if(window.console){console.log(JSON.stringify(error))
}var errorView=new App.Views.Error({message:"The story could not be copied.  Please refresh your browser."})
}});
_.delay(function(){newStoryDomElem.find(".user-story .as-a>.data").click()
},400)
}})};
App.Views.Themes={Index:Backbone.View.extend({tagName:"div",className:"themes",reorderSlideUpElements:"ul.stories,.theme-stats,ul.themes .theme-actions,ul.themes .theme-data .code,ul.themes>li.actions",childId:function(model){return"theme-"+model.get("id")
},events:{"click ul.themes .actions a.new-theme":"createNew","keydown ul.themes .actions a.new-theme":"themeKeyPress","click ul.themes .actions a.reorder-themes":"startReorder","keydown ul.themes .actions a.reorder-themes":"themeKeyPress","click .stop-ordering a":"stopReorder"},initialize:function(){this.collection=this.options.collection;
this.use5090estimates=this.options.use5090estimates;
_.bindAll(this,"orderChanged","displayOrderIndexes")
},render:function(){var that=this;
$(this.el).html(JST["themes/index"]({collection:this.collection.models}));
this.collection.each(function(model){var view=new App.Views.Themes.Show({model:model,id:that.childId(model),use5090estimates:that.use5090estimates});
that.$(">ul").append(view.render().el)
});
this.$("ul.themes").append(JST["themes/new"]());
if(this.collection.backlog.IsEditable()){var orderChangedEvent=this.orderChanged;
var actionsElem;
var moveThemeTitle;
this.$("ul.themes").sortable({start:function(event,ui){},stop:function(event,ui){orderChangedEvent()
},placeholder:"target-order-highlight",axis:"y",handle:".move-theme"}).find(".move-theme").disableSelection()
}else{this.$("ul.themes>li.actions").remove()
}return(this)
},startReorder:function(event){event.preventDefault();
if($("ul.themes li.theme").length<2){var errorView=new App.Views.Warning({message:"You need more than one theme to reorder"})
}else{var that=this;
this.$(this.reorderSlideUpElements).slideUp(250,function(){that.$(".move-theme").css("display","block");
that.$(".stop-ordering").css("display","block")
})
}},stopReorder:function(event){event.preventDefault();
this.$(".move-theme").css("display","none");
this.$(".stop-ordering").css("display","none");
this.$(this.reorderSlideUpElements).slideDown(250)
},createNew:function(event){event.preventDefault();
var model=new Theme();
this.collection.add(model);
this.$("ul.themes li:last").before(new App.Views.Themes.Show({model:model,use5090estimates:this.use5090estimates}).render().el);
var that=this;
this.$("ul.themes li.theme:last").css("display","none").slideDown("fast",function(){$(that.el).find("ul.themes li.theme:last>.theme-data .name .data").click()
})
},themeKeyPress:function(event){var target=$(event.target);
if(9==event.keyCode){event.preventDefault();
if(!event.shiftKey){if(target.is("a.new-theme")){this.$("a.reorder-themes").focus()
}else{if(target.is("a.reorder-themes")){$("#backlog-data-area h2.name .data").click()
}}}else{if(target.is("a.new-theme")){if(this.$("li.theme").length>0){var lastTheme=$("li.theme:last");
if(lastTheme.has("li.actions a.new-story").length){lastTheme.find("li.actions a.new-story").focus()
}else{lastTheme.find(".theme-data .name .data").click()
}}else{}}else{if(target.is("a.reorder-themes")){this.$("a.new-theme").focus()
}}}}else{if(13==event.keyCode){if(target.is("a.new-theme")){this.createNew(event)
}else{if(target.is("a.reorder-themes")){this.startReorder(event)
}}}}},orderChanged:function(){var orderIndexesWithIds={};
this.$("li.theme").each(function(index,elem){var elemId=_.last($(elem).attr("id").split("-"));
if(!isNaN(parseInt(elemId,10))){orderIndexesWithIds[elemId]=index+1
}});
if(window.console){console.log("Order changed and saving - "+JSON.stringify(orderIndexesWithIds))
}this.collection.saveOrder(orderIndexesWithIds)
}}),Show:App.Views.BaseView.extend({tagName:"li",className:"theme",deleteDialogTemplate:"themes/delete-dialog",events:{"click .delete-theme>a":"remove","click .re-number-stories a":"reNumberStories"},initialize:function(){this.use5090estimates=this.options.use5090estimates;
App.Views.BaseView.prototype.initialize.call(this);
_.bindAll(this,"navigateEvent","reNumberStoriesAction")
},render:function(){$(this.el).html(JST["themes/show"]({model:this.model}));
var view=new App.Views.Stories.Index({collection:this.model.Stories(),use5090estimates:this.use5090estimates});
this.$(">.stories").prepend(view.render().el);
this.updateStatistics();
if(this.model.IsEditable()){this.makeFieldsEditable();
var self=this;
_.each([".name",".code"],function(elem){self.$(".theme-data "+elem+">.data input").live("keydown",self.navigateEvent)
})
}else{this.$("ul.stories>li.actions").remove();
this.$(".re-number-stories a").remove();
this.$(".delete-theme>a").remove()
}return(this)
},makeFieldsEditable:function(){var show_view=this;
var contentUpdatedFunc=function(value,settings){var newVal=show_view.contentUpdated(value,settings,this);
var fieldId=$(this).parent().attr("class").replace(/\-/g,"_");
if(fieldId=="code"){show_view.model.Stories().each(function(story,index){story.trigger("change:unique_id")
})
}return(newVal)
};
var beforeChangeFunc=function(value,settings){return show_view.beforeChange(value,settings,this)
};
var defaultOptions=_.extend(_.clone(this.defaultEditableOptions),{data:beforeChangeFunc});
this.$(".theme-data .name div.data").editable(contentUpdatedFunc,_.extend(_.clone(defaultOptions),{maxLength:100}));
this.$(".theme-data .code div.data").editable(contentUpdatedFunc,_.extend(_.clone(defaultOptions),{lesswidth:-10,maxLength:3}))
},navigateEvent:function(event){var storyElem,thisThemeAddStory,target,dataField,prev;
if(_.include([9,13,27],event.keyCode)){try{event.preventDefault()
}catch(e){}if(!event.shiftKey){$(event.target).blur();
storyElem=$(this.el).find("li.story:not(.locked):first");
if(storyElem.length){App.Views.Helpers.scrollIntoBacklogView(storyElem.find(".unique-id .data"),function(elem){elem.click()
})
}else{$(this.el).next().find("a.new-theme").focus();
thisThemeAddStory=$(this.el).find("ul.stories li a.new-story");
if(thisThemeAddStory.length){App.Views.Helpers.scrollIntoBacklogView(thisThemeAddStory,function(elem){elem.focus()
})
}else{App.Views.Helpers.scrollIntoBacklogView($(this.el).next().find(".theme-data > .name .data"),function(elem){elem.click()
})
}}}else{dataField=$(event.target).parents(".data");
if(dataField.parent().hasClass("name")){prev=$(this.el).prev();
if(prev.length){target=prev.find("ul.stories li.actions a.new-story");
if(target.length){$(event.target).blur();
App.Views.Helpers.scrollIntoBacklogView(target,function(elem){elem.focus()
})
}else{$(event.target).blur();
App.Views.Helpers.scrollIntoBacklogView(prev.find(".theme-data >.name .data"),function(elem){elem.click()
})
}}else{}}else{$(event.target).blur();
this.$(".theme-data >.name .data").click()
}}}},changeEvent:function(eventName,model){if(eventName.substring(0,7)=="change:"){var fieldChanged=eventName.substring(7);
this.$(">.theme-data>."+fieldChanged.replace(/_/gi,"-")+">div.data").text(this.model.get(fieldChanged));
this.updateStatistics();
App.Controllers.Statistics.updateStatistics(this.model.get("score_statistics"))
}if(eventName=="change:id"){$(this.el).attr("id","theme-"+model.get("id"));
if(!this.$("ul.stories li.actions .new-story").length){if(!this.model.isNew()){this.$(".stories ul.stories").append(JST["stories/new"]()).find(".actions a").focus()
}}}},deleteAction:function(dialog_obj,view){var model_collection=view.model.collection;
$(dialog_obj).find(">p").html("Deleting theme...<br /><br />Please wait.");
$(dialog_obj).parent().find(".ui-dialog-buttonset button:nth-child(2) span").text("Close");
$(dialog_obj).parent().find(".ui-dialog-buttonset button:nth-child(1)").remove();
view.model.destroy({error:function(model,response){var errorMessage="Unable to delete story...";
try{errorMessage=$.parseJSON(response.responseText).message
}catch(e){if(window.console){console.log(e)
}}var errorView=new App.Views.Error({message:errorMessage});
$(dialog_obj).dialog("close")
},success:function(model,response){model_collection.remove(view.model);
$(view.el).remove();
$(dialog_obj).dialog("close");
App.Controllers.Statistics.updateStatistics(response.score_statistics)
}})
},updateStatistics:function(){this.$(".theme-stats div").html(JST["themes/stats"]({model:this.model}))
},reNumberStories:function(event){var view=this;
event.preventDefault();
$("#dialog-re-number").remove();
$("body").append(JST["themes/re-number-dialog"]({}));
$("#dialog-re-number").dialog({resizable:false,height:170,modal:true,buttons:{"Re-number":function(){view.reNumberStoriesAction(this)
},Cancel:function(){$(this).dialog("close")
}}})
},reNumberStoriesAction:function(dialog){var view=this;
$(dialog).find(">p").html('Re-numbering stories...<br />Please wait.<br /><br /><span class="progress-icon"></span>');
$(dialog).parent().find(".ui-dialog-buttonset button:nth-child(2) span").text("Close");
$(dialog).parent().find(".ui-dialog-buttonset button:nth-child(1)").remove();
view.model.ReNumberStories({success:function(){$(dialog).dialog("close")
},error:function(){var errorView=new App.Views.Error({message:"Server error trying to renumber stories"});
$(dialog).dialog("close")
}})
}})};
App.Routers.Backlog=Backbone.Router.extend({backlogView:false,oldView:false,routes:{"":"showBacklog","Backlog":"showBacklog","Stats":"showStats","Sprints":"showSprintsHelp",":iteration":"showSprint"},initialize:function(options){_.bindAll(this,"setTabsReference","cleanUpOldView")
},setTabsReference:function(tabs){this.sprintTabsView=tabs
},showBacklog:function(){this.cleanUpOldView();
if(!this.backlogView){this.backlogView=new App.Views.Backlogs.Show({model:App.Collections.Backlogs.at(0),el:$("#backlog-container"),sprintTabsView:this.sprintTabsView});
this.showContainer("#backlog-container");
this.backlogView.render()
}else{this.backlogView.activated();
this.showContainer("#backlog-container")
}this.sprintTabsView.select(this.sprintTabsView.getModelFromIteration("Backlog"))
},showStats:function(){this.cleanUpOldView();
this.oldView=new App.Views.BacklogStats.Show({model:App.Collections.Backlogs.at(0),el:this.replaceWithNew("#stats-container")});
this.showContainer("#stats-container");
this.oldView.render();
this.sprintTabsView.select(this.sprintTabsView.getModelFromIteration("Stats"))
},showSprintsHelp:function(){this.cleanUpOldView();
this.oldView=new App.Views.Sprints.Help({sprintTabsView:this.sprintTabsView,el:this.replaceWithNew("#sprints-help-container")});
this.showContainer("#sprints-help-container");
this.oldView.render();
this.sprintTabsView.select(this.sprintTabsView.getModelFromIteration("Sprints"))
},showSprint:function(iteration){var model=this.sprintTabsView.getModelFromIteration(iteration);
this.cleanUpOldView();
if(!model){var err=new App.Views.Error({message:"Internal error, could not display sprint correctly.  Please refresh your browser"})
}else{this.oldView=new App.Views.Sprints.Show({model:model,el:this.replaceWithNew("#sprints-container"),sprintTabsView:this.sprintTabsView});
this.showContainer("#sprints-container");
this.oldView.render();
this.sprintTabsView.select(model)
}},replaceWithNew:function(nodePath){var oldNode=$(nodePath).empty(),oldNodeHtml=oldNode[0].outerHTML||new XMLSerializer().serializeToString(oldNode[0]);
$(nodePath).replaceWith($(oldNodeHtml));
return $(nodePath)
},showContainer:function(container){containers=["#sprints-container","#sprints-help-container","#stats-container","#backlog-container"];
_(containers).each(function(elem){$("section.main-content-pod").removeClass("showing-"+elem.replace(/#|\-container/gi,""))
});
$("section.main-content-pod").addClass("showing-"+container.replace(/#|\-container/gi,""))
},cleanUpOldView:function(){if(this.oldView){if(_.isFunction(this.oldView.cleanUp)){this.oldView.cleanUp()
}this.oldView=false
}}});