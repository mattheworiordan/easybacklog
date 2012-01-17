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
},isComplete:function(){return this.get("completed?")
}});
var SprintStory=Backbone.Model.extend({initialize:function(){if(!App.Collections.SprintStoryStatuses){App.Collections.SprintStoryStatuses=new SprintStoryStatusesCollection();
App.Collections.SprintStoryStatuses.fetch()
}this.bind("change",function(model){if(this.Story()){this.Story().set({sprint_story_status_id:this.get("sprint_story_status_id"),sprint_story_id:this.get("id")})
}});
this.bind("remove",function(model){if(this.Story()){this.Story().set({sprint_story_status_id:-1,sprint_story_id:-1})
}})
},Sprint:function(){return this.collection.sprint
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
var SprintStoryStatus=Backbone.Model.extend({DoneCode:"D",isDone:function(){return this.get("code").toUpperCase()==this.DoneCode
}});
var Story=Backbone.Model.extend({Theme:function(){return this.collection.theme
},IsEditable:function(){if(!this.collection.theme.IsEditable()){return false
}else{var sprintStory=this.SprintStory();
if(sprintStory){if(sprintStory.Status()){return !sprintStory.Status().isDone()
}else{return false
}}return true
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
}}).error(function(event){if(window.console){console.log("Renumber stories failed")
}if(_.isFunction(options.error)){options.error(event)
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
},incompleteStories:function(){return this.filter(function(sprintStory){return sprintStory.Story().IsEditable()
})
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
App.Controllers.Statistics={updateStatistics:function(stats){if(!_.isEmpty(stats)){var backlog=App.Collections.Backlogs.last();
var statsWithoutThemes=_.clone(stats);
delete statsWithoutThemes.themes;
backlog.set(statsWithoutThemes);
backlog.trigger("statisticsUpdated");
_.each(stats.themes,function(themeData){var theme=backlog.Themes().get(themeData.theme_id);
if(theme){theme.set(themeData);
theme.trigger("statisticsUpdated")
}})
}}};
App.Views.SharedSprintSettings={formValidationConfig:{rules:{start_on:{required:true},duration_days:{required:true,digits:true,min:1},number_team_members:{number:true,min:0},explicit_velocity:{number:true,min:1}},messages:{start_on:{required:"Date&nbsp;missing"},duration_days:{required:"Sprint duration is required",digits:"Enter a value using whole numbers",min:"Sprint duration must be at least 1 day"},number_team_members:{required:"Team size is required",min:"Team size must be greater than 0",number:"Team size must be a valid number"},explicit_velocity:{required:"Velocity is required",number:"Velocity must be a valid number",min:"Velocity must be at least 1"}}},addFormBehaviour:function(target,backlogVelocity){var firstRun=false,velocityCalculationMethodChanged=function(){target.find("tr").removeClass("disabled").find("input").removeAttr("disabled");
target.find("#explicit-velocity, #number-team-members").rules("add",{required:false});
if(target.find("#use-team-members").is(":checked")){target.find("tr.use-explicit-velocity").addClass("disabled").find("input").attr("disabled","true");
if(firstRun){target.find("#use-explicit-velocity-container").slideUp()
}else{target.find("#use-explicit-velocity-container").hide();
firstRun=true
}target.find("#use-team-members-container").slideDown();
target.find("#number-team-members").rules("add",{required:true});
target.find("label#use-explicit-velocity-false").addClass("selected");
target.find("label#use-explicit-velocity-true").removeClass("selected")
}else{target.find("tr.use-team-members").addClass("disabled").find("input").attr("disabled","true");
target.find("#explicit-velocity").rules("add",{required:true});
if(firstRun){target.find("#use-team-members-container").slideUp()
}else{target.find("#use-team-members-container").hide();
firstRun=true
}target.find("#use-explicit-velocity-container").slideDown();
target.find("label#use-explicit-velocity-true").addClass("selected");
target.find("label#use-explicit-velocity-false").removeClass("selected")
}},teamSizeChanged=function(){var expectedVelocity;
if(isNaN(parseFloat(target.find("#number-team-members").val()))){target.find("#expected-velocity").text("(enter your team size)")
}else{if(isNaN(parseFloat(target.find("#duration-days").val()))){target.find("#expected-velocity").text("(enter duration of sprint)")
}else{expectedVelocity=parseFloat(target.find("#number-team-members").val())*parseFloat(target.find("#duration-days").val())*backlogVelocity;
target.find("#expected-velocity").text(expectedVelocity===1?niceNum(expectedVelocity)+" point":niceNum(expectedVelocity)+" points")
}}};
if(backlogVelocity&&!target.find("#explicit-velocity").val()){target.find("#use-team-members").attr("checked",true)
}else{target.find("#use-explicit-velocity").attr("checked",true)
}target.find("#use-team-members, #use-explicit-velocity").change(velocityCalculationMethodChanged);
velocityCalculationMethodChanged();
target.find("#duration-days, #number-team-members").keyup(teamSizeChanged);
teamSizeChanged()
}};
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
},statusChangeClick:function(event){var that=this,dropDown=$(JST["stories/status-drop-down"]({model:this.model}));
event.preventDefault();
event.stopPropagation();
if(this.model.SprintStory().Sprint().isComplete()){new App.Views.Warning({message:"You cannot change the status of this story as it's assigned to a completed sprint"})
}else{$("body").find("#sprint-story-status-dropdown").remove();
$("body").append(dropDown);
dropDown.find("li").hover(function(){$(this).addClass("hover")
},function(){$(this).removeClass("hover")
});
if(dropDown.width()<$(this.el).find(".status .tab").outerWidth()){dropDown.css("width",$(this.el).find(".status .tab").outerWidth()+"px")
}dropDown.css("position","absolute").position({of:$(this.el).find(".status .tab"),my:"center top",at:"center bottom",offset:"0 0"});
$("html").bind("click.status-drop-down",function(){$("body").find("#sprint-story-status-dropdown").remove();
$("html").unbind("click.status-drop-down")
});
dropDown.find("li").click(function(event){event.preventDefault();
event.stopPropagation();
$(event.target).trigger("statusChanged");
var id=$(this).attr("id").replace("status-id-",""),code=$(this).attr("class").match(/status-code-(\w+)/)[1],name=$(this).text();
$("body").find("#sprint-story-status-dropdown").remove();
$("html").unbind("click.status-drop-down");
App.Views.Helpers.statusDropDownChanged.call(that,id,code,name)
})
}},statusDropDownChanged:function(id,code,name){var that=this;
$(this.el).find(".status .tab").attr("class","tab status-code-"+code).removeClass("hover").find("span").text(name);
if(code===this.model.SprintStory().Status().DoneCode){$(this.el).addClass("locked")
}else{$(this.el).removeClass("locked")
}this.model.SprintStory().set({sprint_story_status_id:Number(id)});
this.model.SprintStory().save(false,{success:function(model){that.model.SprintStory().Sprint().set(model.get("sprint_statistics"));
if(that.parentView){that.parentView.updateStatistics(model.get("sprint_statistics"))
}},error:function(model,response){var errorMessage="we've got a problem on our side";
try{errorMessage=$.parseJSON(response.responseText).message
}catch(e){if(window.console){console.log(e)
}}var errorView=new App.Views.Error({message:"Oops, "+errorMessage+".  Please refresh your browser"})
}})
},activateUrlify:function(target){var that=this;
$(target).find("a.urlified").live("mouseover",function(event){if(that.linkHelper){that.linkHelper.remove()
}if(that.linkRolloutTimeout){clearTimeout(that.linkRolloutTimeout)
}var originalHref=$("<div>").html($(this).attr("href")).text(),href=originalHref;
if(href.match(/^[-;&=\+\$,\w]+@/)){href="mailto:"+href
}if(href.match(/^www\./)){href="http://"+href
}var anchor=$("<a>").attr("href",href).text(originalHref);
if(!href.match(/^mailto:/i)){anchor.attr("target","_blank")
}that.linkHelper=$('<div class="link-helper">').text("Go to link: ").append(anchor);
$("body").append(that.linkHelper);
that.linkHelper.position({of:$(this),my:"right top",at:"right bottom",offset:"0 0"});
$(that.linkHelper).children().andSelf().mouseover(function(){if(that.linkRolloutTimeout){clearTimeout(that.linkRolloutTimeout);
that.linkRolloutTimeout=false
}}).mouseout(function(){if(that.linkRolloutTimeout){clearTimeout(that.linkRolloutTimeout)
}that.linkRolloutTimeout=setTimeout(function(){that.linkHelper.remove()
},100)
})
}).live("mouseout",function(event){that.linkRolloutTimeout=setTimeout(function(){that.linkHelper.remove()
},150)
}).live("click",function(event){event.preventDefault();
if(that.linkRolloutTimeout){clearTimeout(that.linkRolloutTimeout)
}if(that.linkHelper){that.linkHelper.remove()
}})
},addUseOptions:function(target,options){return _(target).extend({use5090Estimates:options.use5090Estimates,useCostEstimates:options.useCostEstimates,useDaysEstimates:options.useDaysEstimates})
}};
App.Views.BaseView=Backbone.View.extend({defaultEditableOptions:{placeHolder:'<span class="editable-blank">[edit]</span>',type:"text",zIndex:3},initialize:function(){this.model=this.options.model;
this.parentView=this.options.parentView;
this.beforeChangeValue={};
_.bindAll(this,"beforeChange","contentUpdated");
if(this.changeEvent){_.bindAll(this,"changeEvent");
var changeEvent=this.changeEvent;
this.model.bind("all",function(eventName){changeEvent(eventName,this)
})
}if(this.updateStatistics){_.bindAll(this,"updateStatistics");
this.model.bind("statisticsUpdated",this.updateStatistics)
}},beforeChange:function(value,target){var fieldId=$(target).parent().attr("class").replace(/\-/g,"_");
this.beforeChangeValue[fieldId]=value;
return(value)
},contentUpdated:function(value,target){var fieldId=$(target).parent().attr("class").replace(/\-/g,"_");
var fieldWithValue=$(target);
var beforeChangeValue=this.beforeChangeValue[fieldId];
var view=this;
if(value!=beforeChangeValue){if(window.console){console.log("value for "+fieldId+" has changed from: "+this.beforeChangeValue[fieldId]+" to: "+value)
}var attributes={};
attributes[fieldId]=value;
this.model.set(attributes);
var this_model=this.model;
var saveModelFunc=function(){this_model.save({},{error:function(model,response){var errorMessage="Unable to save changes...";
try{errorMessage=$.parseJSON(response.responseText).message;
if(errorMessage.match(/^Score 50(.*), Score 90(?:\1)$/)){errorMessage="Score "+errorMessage.match(/^Score 50(.*), Score 90(?:\1)$/)[1]
}}catch(e){if(window.console){console.log(e)
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
App.Views.Helpers.scrollIntoBacklogView($(newElem).find(".data"),function(){$(newElem).find(".data").click()
})
},150)
}else{this.$("ul li:last").before(newElem);
this.displayOrderIndexes();
this.$("ul li.criterion:last").css("display","none").slideDown(100,function(){App.Views.Helpers.scrollIntoBacklogView($(newElem).find(".data"),function(){$(newElem).find(".data").click()
})
})
}},orderChanged:function(){var orderIndexesWithIds={};
this.$("li.criterion").each(function(index,elem){var elemId=_.last($(elem).attr("id").split("-"));
orderIndexesWithIds[elemId]=index+1
});
if(window.console){console.log("Order changed and saving - "+JSON.stringify(orderIndexesWithIds))
}this.collection.saveOrder(orderIndexesWithIds);
this.displayOrderIndexes()
},displayOrderIndexes:function(){var charFrom=97,charMax=26;
this.$("li.criterion").each(function(index,elem){$(elem).find(".index").html(String.fromCharCode(charFrom+(index%charMax))+(index<charMax?"":Math.floor(index/charMax))+")")
})
},hideEditIfCriteriaExist:function(force){if(this.collection.length||force){this.$("li.new-acceptance-criterion").hide()
}else{this.$("li.new-acceptance-criterion").show()
}}}),Show:App.Views.BaseView.extend({tagName:"li",className:"criterion",events:{},initialize:function(options){App.Views.BaseView.prototype.initialize.call(this);
this.parentView=options.parentView;
_.bindAll(this,"navigateEvent")
},render:function(){$(this.el).html(JST["acceptance_criteria/show"]({model:this.model}));
if(this.model.IsEditable()){this.makeFieldsEditable()
}else{$(this.el).find(">div.data").click(function(){new App.Views.Warning({message:"You cannot edit a story that is marked as done"})
})
}return(this)
},changeEvent:function(eventName,model){if(eventName=="change:id"){$(this.el).attr("id","acceptance-criteria-"+model.get("id"))
}},makeFieldsEditable:function(){var ac_view=this;
var contentUpdatedFunc=function(newVal){var that=this,model_collection=ac_view.model.collection;
if(_.isEmpty(newVal)){$(ac_view.el).slideUp("fast",function(){ac_view.model.destroy({error:function(model,response){var errorMessage="Unable to delete criteria...  Please refresh.";
try{errorMessage=$.parseJSON(response.responseText).message
}catch(e){if(window.console){console.log(e)
}}var errorView=new App.Views.Error({message:errorMessage})
}});
$(ac_view.el).remove();
model_collection.remove(ac_view.model);
ac_view.parentView.hideEditIfCriteriaExist();
ac_view.parentView.displayOrderIndexes()
})
}else{setTimeout(function(){$(that).html(urlify($(that).html(),35))
},25);
return ac_view.contentUpdated(newVal,this)
}};
var beforeChangeFunc=function(value){unUrlify(this);
return ac_view.beforeChange($(this).text(),this)
};
var defaultOptions=_.extend(_.clone(this.defaultEditableOptions),{data:beforeChangeFunc,noChange:contentUpdatedFunc,type:"textarea",autoResize:true,displayDelay:40,onKeyDown:ac_view.navigateEvent});
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
App.Views.Backlogs={Show:App.Views.BaseView.extend({dataArea:$("#backlog-data-area"),useOptions:{},initialize:function(options){var columns=$("#backlog-container #themes-header .columns");
App.Views.BaseView.prototype.initialize.call(this);
this.sprintTabsView=options.sprintTabsView;
_.bindAll(this,"activated");
this.useOptions={use5090Estimates:columns.find(".score-50").length?true:false,useCostEstimates:columns.find(".cost-formatted").length?true:false,useDaysEstimates:columns.find(".days-formatted").length?true:false}
},render:function(){var view=new App.Views.Themes.Index(_.extend({collection:this.model.Themes()},this.useOptions));
this.$("#themes-container").html(view.render().el);
var show_view=this;
this.activated();
return(this)
},updateStatistics:function(){$("#backlog-data-area .backlog-stats").html(JST["backlogs/stats"](_.extend({model:this.model},this.useOptions)));
this.sprintTabsView.adjustTabConstraints(true)
},activated:function(){this.updateStatistics();
if(this.model.IsEditable()){setTimeout(function(){var firstEditableElem=$("ul.themes li.theme:first .theme-data .name .data");
if(firstEditableElem.length){firstEditableElem.click()
}else{$("ul.themes li.actions a.new-theme").focus()
}},10)
}}})};
App.Views.BacklogDataArea={Show:App.Views.BaseView.extend({events:{"click #backlog-data-area .actions #print":"print","click #backlog-data-area a#backlog-settings-link":"backlogSettings"},initialize:function(options){_.bindAll(this,"print","newSnapshot","jumpToSnapshot","compareSnapshot","sprintsChanged");
this.model.Sprints().bind("change:completed_at",this.sprintsChanged)
},render:function(){$("#new-snapshot").click(this.newSnapshot);
$("#compare-snapshot").click(this.compareSnapshot);
$("select.snapshot-selector").change(this.jumpToSnapshot);
this.enableSnapshotsMenu();
this.enableFilterMenu();
if(!this.model.IsEditable()){$(this.el).addClass("not-editable");
$("#backlog-container").addClass("not-editable");
$("#add-sprint").hide()
}return this
},sprintsChanged:function(model){var that=this;
var url=document.location.pathname.replace("#.*$","");
$.get(url+"/snapshots-list-html",false,function(data){$(".snapshot-menu-container .select, #viewing-snapshot-container .selector").html(data);
$("select.snapshot-selector").change(that.jumpToSnapshot)
},"html")
},backlogSettings:function(event){var link=$(event.target).attr("href"),route=document.location.href.match(/(#[\w\d_-]+)$/);
event.preventDefault();
document.location.href=link+(route?route[1]:"")
},enableSnapshotsMenu:function(){var overEitherNode=false,selectIsOpen=false,hideMenu=function(){overEitherNode=false;
if(!selectIsOpen){setTimeout(function(){if(overEitherNode===false){$("#backlog-data-area .snapshot").removeClass("hover");
$("section.for-backlog .snapshot-menu-container").hide()
}},50)
}},showMenu=function(){$("#backlog-data-area .snapshot").addClass("hover");
$("section.for-backlog .snapshot-menu-container").show().position({of:$("#backlog-data-area .snapshot"),my:"right top",at:"right bottom",offset:"0 -8"});
overEitherNode=true
};
$("#backlog-data-area .snapshot").mouseover(showMenu).click(showMenu).mouseout(hideMenu);
$("section.for-backlog .snapshot-menu-container").mouseover(function(){overEitherNode=true
}).mouseout(hideMenu);
$(".snapshot-menu-container .select select").click(function(event){selectIsOpen=!selectIsOpen;
event.stopPropagation();
if(selectIsOpen){$("html").bind("click.snapshotmenu",function(){selectIsOpen=false;
hideMenu();
$("html").unbind("click.snapshotmenu")
})
}}).keydown(function(){selectIsOpen=false
})
},enableFilterMenu:function(){var overEitherNode=false,selectIsOpen=false,hideMenu=function(){overEitherNode=false;
if(!selectIsOpen){_.delay(function(){if(overEitherNode===false){$("#backlog-data-area .filter").removeClass("hover");
$("section.for-backlog .filter-container").hide()
}},50)
}},showMenu=function(){$("#backlog-data-area .filter").addClass("hover");
$("section.for-backlog .filter-container").show().position({of:$("#backlog-data-area .filter"),my:"right top",at:"right bottom",offset:"0 -8"});
overEitherNode=true
},filterChangeEvent=function(event){var backlog=App.Collections.Backlogs.at(0),hideCompleted=($(event.target).is(":checked"));
if(hideCompleted){$(".filter-notifier").slideDown();
$.cookie("filter_completed_stories",true)
}else{$(".filter-notifier").slideUp();
$.cookie("filter_completed_stories",null)
}backlog.Themes().each(function(theme){theme.Stories().each(function(story){if(story.SprintStory()&&story.SprintStory().Status().isDone()){if(hideCompleted){$("#story-"+story.get("id")).slideUp()
}else{$("#story-"+story.get("id")).slideDown()
}}})
})
},filterNoticeClicked=function(event){event.preventDefault();
var filterCheckbox=$(".filter-container input[type=checkbox]").removeAttr("checked");
filterChangeEvent({target:filterCheckbox})
};
$("#backlog-data-area .filter").mouseover(showMenu).click(showMenu).mouseout(hideMenu);
$("section.for-backlog .filter-container").mouseover(function(){overEitherNode=true
}).mouseout(hideMenu);
$(".filter-container input[type=checkbox]").change(filterChangeEvent);
$(".filter-notifier a").click(filterNoticeClicked);
if($.cookie("filter_completed_stories")){_.delay(function(){var filterCheckbox=$(".filter-container input[type=checkbox]").attr("checked","checked");
filterChangeEvent({target:filterCheckbox});
var focus=$("input[name=value]").parents(".data");
if(focus){$("input[name=value]").blur();
_.delay(function(){focus.click()
},150)
}},750)
}},print:function(event){var view=this;
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
var val=$(event.target).val(),isSprintSnapshot=$(event.target).hasClass("sprint")||$(event.target).find(":selected").hasClass("sprint");
var baseUrl=document.location.href.match(/^.*\/accounts\/\d+\/backlogs\/\d+/i)[0];
if(val.match(/^\d+$/)){if(isSprintSnapshot){baseUrl+="/sprint-snapshots/"+val
}else{baseUrl+="/snapshots/"+val
}}$("#loading-new-snapshot").show();
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
App.Views.BacklogPresence={Show:App.Views.BaseView.extend({presenceServerUrl:window.location.protocol+"//realtime-easybacklog.dotcloud.com/",initialize:function(options){this.userId=Math.floor(Math.random()*1000000000).toString(36);
this.name=options.name
},render:function(){var that=this;
$.support.cors=true;
if(App.environment!=="test"){that.startPolling();
that.closeConnectionOnUnload()
}return(this)
},ajaxRequest:function(options){var that=this,ajaxOptions={url:that.presenceServerUrl+options.path,data:options.data,crossDomain:true,async:options.async===false?false:true,success:function(response){if(options.success){options.success(response)
}},error:function(jqXHR){if(options.error){options.error(jqXHR)
}}};
if($.browser.msie&&parseInt($.browser.version,10)>=8){_.extend(ajaxOptions,{type:"GET",cache:false,dataType:"jsonp"});
$.ajax(ajaxOptions)
}else{_.extend(ajaxOptions,{type:"POST"});
$.ajax(ajaxOptions)
}},startPolling:function(){var that=this;
var _poll=function(){that.ajaxRequest({path:"poll",data:{id:that.userId,name:that.name,channel:that.model.get("id")},success:function(response){if((typeof response==="string")&&response.replace(/\s/g,"").length){response=JSON.parse(response)
}if(response&&response.length){if(response.length>1){var people=_(response).reject(function(elem){return elem.id===that.userId
});
$(that.el).html(JST["backlogs/presence"]({people:people}));
$(that.el).show()
}else{if($(that.el).is(":visible")){$(that.el).hide()
}}}_poll()
},error:function(jqXHR){if(jqXHR.status===410){if(window.console){console.log("Connection closed upon request")
}}else{setTimeout(_poll,5000)
}}})
};
_poll()
},closeConnectionOnUnload:function(){var that=this;
window.onbeforeunload=function(){that.ajaxRequest({path:"close",data:{id:that.userId,channel:that.model.get("id")},async:false,success:function(response){if(window.console){console.log("Connection close request sent")
}},error:function(jqXHR){if(window.console){console.log("Connection close request FAILED")
}}})
}
}})};
App.Views.BacklogStats={Show:App.Views.BaseView.extend({events:{"click a#stats-backlog-settings-change":"backlogSettings","click input#show-projected":"burnDownProjectedCheckboxClicked"},initialize:function(){App.Views.BaseView.prototype.initialize.call(this)
},render:function(){var that=this;
$(this.el).html(JST["backlogs/sprint-progress-stats"]({model:this.model}));
$("#backlog-data-area .backlog-stats").html("");
that.waitUntilChartsLoaded(function(){that.showCharts()
});
return this
},activated:function(){$("#backlog-data-area .backlog-stats").html("");
this.$(".loading").show();
this.$(".stats").hide();
this.$(".no-stats").hide();
this.$(".no-points").hide();
this.showCharts()
},waitUntilChartsLoaded:function(callback,counter){var nextRequestIn=250,that=this;
if(!counter){counter=1
}if(!window.Highcharts){if(counter*nextRequestIn>10000){new App.Views.Error({message:"Internal error, could not load charting libraries.  Please refresh your browser."})
}else{setTimeout(function(){that.waitUntilChartsLoaded(callback,counter+1)
},nextRequestIn)
}}else{callback()
}},showCharts:function(){var that=this;
if(this.model.Sprints().select(function(sprint){return sprint.isComplete()
}).length>0){$.getJSON("/backlogs/"+this.model.get("id")+"/backlog-stats").success(function(data){that.$(".loading").hide();
that.$(".no-stats").hide();
if(data.zero_points){that.$(".no-points").show();
that.$(".stats").hide()
}else{that.$(".stats").show();
that.$(".no-points").hide();
if($.cookie("stats_show_projected")==="no"){that.$("#show-projected").removeAttr("checked")
}else{that.$("#show-projected").attr("checked","checked")
}that.displayBurnDown(data.burn_down);
that.displayBurnUp(data.burn_up);
that.displayVelocityCompleted(data.velocity_completed);
that.displayVelocityStats(data.velocity_stats);
$(that.el).trigger("renderingCharts")
}}).error(function(err){new App.Views.Error({message:'Unfortunately there has been an internal error loading your statistics.  Please refresh this page or report this error using the "feedback" button on the bottom right of this page.'})
})
}else{this.$(".loading").hide();
this.$(".stats").hide();
this.$(".no-points").hide();
this.$(".no-stats").show()
}},backlogSettings:function(event){event.preventDefault();
document.location.href=$("#backlog-data-area a:last").attr("href")
},displayBurnDown:function(data){this.burnDownChart=new Highcharts.Chart({chart:{renderTo:"burn-down-chart",type:"line"},title:{text:"Burn down",style:{fontSize:"20px",color:"#000000"}},xAxis:{type:"datetime",dateTimeLabelFormats:{month:"%e %b",year:"%b"}},yAxis:{title:{text:"Points"},min:0},colors:["#0000FF","#009900","#FF0000"],tooltip:{formatter:function(){var dataSeries,that=this,sprint,completedTerminology,pluralize,seriesName=this.series.name,html;
switch(seriesName){case"Trend":dataSeries=data.trend;
completedTerminology="expected";
break;
case"Projected":dataSeries=data.projected;
completedTerminology="projected";
break;
case"Actual":dataSeries=data.actual;
completedTerminology="completed"
}sprint=_(dataSeries).find(function(elem){return that.x===parseRubyDate(elem.completed_on).getTime()
});
if((dataSeries===data.projected)&&(sprint===data.projected[0])){dataSeries=data.actual;
completedTerminology="completed";
sprint=_(data.actual).last();
seriesName="Actual"
}pluralize=function(val){return Number(val)===1?"":"s"
},round=function(val){return Math.max(0,Math.round(val*10)/10)
};
html="<b>"+seriesName;
if(sprint.iteration===0){html+=" - Sprint 0</b> (Project start)<br/>"+"Project started on "+$.datepicker.formatDate($.datepicker._defaults.dateFormat,parseRubyDate(sprint.starts_on))+"<br/>"+round(this.y)+" points remaining"
}else{html+=" - Sprint "+sprint.iteration+"</b><br/>"+"Sprint "+sprint.iteration+" finished, "+completedTerminology+" "+round(sprint.completed)+" point"+pluralize(sprint.completed)+"<br/>"+round(this.y)+" points remaining";
if((seriesName==="Actual")&&(sprint.actual)){html+="<br/>Actual velocity per day per person: "+round(sprint.actual)
}if(sprint.team){html+="<br/>"+niceNum(sprint.team)+" team member"+pluralize(sprint.team)+" for "+round(sprint.duration)+" day"+pluralize(sprint.duration)
}else{html+="<br/>Sprint duration: "+round(sprint.duration)+" day"+pluralize(sprint.duration)
}html+="<br/>Dates: "+$.datepicker.formatDate($.datepicker._defaults.dateFormat,parseRubyDate(sprint.starts_on))+" - "+$.datepicker.formatDate($.datepicker._defaults.dateFormat,parseRubyDate(sprint.completed_on))
}return html
}},series:[{name:"Trend",data:_(data.trend).map(function(d){return[parseRubyDate(d.completed_on).getTime(),Number(d.points)]
}),},{name:"Projected",data:_(data.projected).map(function(d){return[parseRubyDate(d.completed_on).getTime(),Number(d.points)]
}),dashStyle:"LongDash"},{name:"Actual",data:_(data.actual).map(function(d){return[parseRubyDate(d.completed_on).getTime(),Number(d.points)]
})}]});
this.showOrHideBurnDownProjected()
},burnDownProjectedCheckboxClicked:function(){$.cookie("stats_show_projected",this.$("#show-projected").is(":checked")?"yes":"no");
this.showOrHideBurnDownProjected()
},showOrHideBurnDownProjected:function(){if(this.$("#show-projected").is(":checked")){this.burnDownChart.series[1].show()
}else{this.burnDownChart.series[1].hide()
}},displayBurnUp:function(data){chart1=new Highcharts.Chart({chart:{renderTo:"burn-up-chart",type:"area"},title:{text:"Burn up",style:{fontSize:"20px",color:"#000000"}},xAxis:{type:"datetime",dateTimeLabelFormats:{month:"%e %b",year:"%b"}},yAxis:{title:{text:"Points"}},colors:["#0000FF","#FF0000"],tooltip:{formatter:function(){var dataSeries,that=this,sprint,pluralize,seriesName=this.series.name,html,lastSprint;
switch(seriesName){case"Actual":dataSeries=data.actual;
break;
case"Total":dataSeries=data.total
}sprint=_(dataSeries).find(function(elem){return that.x===parseRubyDate(elem.starts_on).getTime()
});
pluralize=function(val){return Number(val)===1?"":"s"
},round=function(val){return Math.max(0,Math.round(val*10)/10)
};
html="<b>"+seriesName;
if(sprint.iteration===0){lastSprint=dataSeries[dataSeries.length-2];
html+=" - end of sprint "+lastSprint.iteration+"</b><br/>"+"Sprint ended on "+$.datepicker.formatDate($.datepicker._defaults.dateFormat,parseRubyDate(lastSprint.completed_on))+"<br/>";
if(seriesName==="Actual"){html+="Completed "+round(sprint.total_points)+" point"+pluralize(sprint.total_points)
}else{html+="Total points to complete: "+round(this.y)
}}else{html+=" - Sprint "+sprint.iteration+"</b><br/>";
if(seriesName==="Actual"){html+=round(sprint.total_points)+" point"+pluralize(sprint.total_points)+" completed at the start"+"<br/>Velocity this sprint: "+round(sprint.completed)+" point"+pluralize(sprint.completed);
if(sprint.actual){html+="<br/>Velocity per day per person: "+round(sprint.actual)+"<br/>"+niceNum(sprint.team)+" team member"+pluralize(sprint.team)+" for "+round(sprint.duration)+" day"+pluralize(sprint.duration)
}else{html+="<br/>Sprint duration: "+round(sprint.duration)+" day"+pluralize(sprint.duration)
}}else{html+="Total points to complete: "+round(this.y)
}html+="<br />Dates: "+$.datepicker.formatDate($.datepicker._defaults.dateFormat,parseRubyDate(sprint.starts_on))+" - "+$.datepicker.formatDate($.datepicker._defaults.dateFormat,parseRubyDate(sprint.completed_on))
}return html
}},series:[{name:"Total",data:_(data.total).map(function(d){return[parseRubyDate(d.starts_on).getTime(),Number(d.total_points)]
}),},{name:"Actual",data:_(data.actual).map(function(d){return[parseRubyDate(d.starts_on).getTime(),Number(d.total_points)]
})}]})
},displayVelocityCompleted:function(data){chart1=new Highcharts.Chart({chart:{renderTo:"velocity-chart",type:"column"},title:{text:"Velocity of completed sprints",style:{fontSize:"20px",color:"#000000"}},xAxis:{categories:_(data).map(function(d){return"Sprint "+d.iteration
})},yAxis:{title:{text:"Points"}},colors:["#0000FF"],tooltip:{formatter:function(){var that=this,sprint,pluralize,html;
sprint=_(data).find(function(elem){return that.x==="Sprint "+elem.iteration
});
pluralize=function(val){return Number(val)===1?"":"s"
},round=function(val){return Math.max(0,Math.round(val*10)/10)
};
html="<b>Sprint "+sprint.iteration+"</b><br />"+"Completed "+round(sprint.completed)+" point"+pluralize(sprint.completed);
if(sprint.actual){html+="<br/>Actual velocity per day per person: "+round(sprint.actual)+"<br/>"+niceNum(sprint.team)+" team member"+pluralize(sprint.team)+" for "+round(sprint.duration)+" day"+pluralize(sprint.duration)
}else{html+="<br/>Sprint duration: "+round(sprint.duration)+" day"+pluralize(sprint.duration)
}html+="<br/>Dates: "+$.datepicker.formatDate($.datepicker._defaults.dateFormat,parseRubyDate(sprint.starts_on))+" - "+$.datepicker.formatDate($.datepicker._defaults.dateFormat,parseRubyDate(sprint.completed_on));
return html
}},series:[{name:"Total",data:_(data).map(function(d){return d.completed
})}]})
},displayVelocityStats:function(data){var expectedDay=data.expected_day,expectedSprint=data.expected_sprint,actualDay=data.actual_day,actualSprint=data.actual_sprint;
if(expectedDay){this.$("#velocity-per-day-average").text(Math.round(actualDay*10)/10);
this.$("#velocity-per-day-expected").text(Math.round(expectedDay*10)/10);
this.$(".stats .average .notice").html("The expected backlog daily velocity is configured as "+(expectedDay==1?"1 point":expectedDay+" points")+' per day per team member. <br/><a href="#backlog-settings" id="stats-backlog-settings-change">Change backlog settings &raquo;</a>')
}else{this.$(".average .per-day").hide();
this.$(".stats .average .notice").html("The expected velocity is based on the velocity set up in the most recent sprint. "+'<a href="#backlog-settings" id="stats-backlog-settings-change">Change backlog and sprint settings &raquo;</a>')
}this.$("#velocity-per-sprint-average").text(Math.round(actualSprint*10)/10);
this.$("#velocity-per-sprint-expected").text(Math.round(expectedSprint*10)/10)
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
},persistOrderActions:0,events:{"click .stories-divider .change-size":"toggleUnassignedStoriesSize","click a.mark-sprint-as-incomplete":"markSprintAsIncomplete","click a.mark-sprint-as-complete":"markSprintAsComplete","click a.bulk-move-stories":"bulkMoveStories"},initialize:function(options){App.Views.BaseView.prototype.initialize.call(this);
this.sprintTabsView=options.sprintTabsView;
_.bindAll(this,"persistSprintStories","positionStoriesContainerOnScroll","updateStatistics")
},render:function(){var that=this,storiesAssignedToSprints={},sortFn;
$(this.el).html(JST["sprints/show"]({model:this.model}));
that.toggleUnassignedStoriesSize(true);
this.updateStatistics(this.model.attributes);
this.model.fetch({success:function(model){that.updateStatistics(model.attributes)
}});
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
if(this.model.isComplete()){this.$(".unassigned-stories-container .story-card").addClass("locked")
}this.$(".stories-container .cards, .unassigned-stories-container").sortable({connectWith:".story-droppable",stop:that.persistSprintStories,placeholder:"story-card-place-holder",cancel:".locked"}).disableSelection();
$(window).bind("scroll.sprints",this.positionStoriesContainerOnScroll).bind("resize.sprints",this.positionStoriesContainerOnScroll);
if(!App.Views.MouseTracker){App.Views.MouseTracker=new MouseTracker(jQuery)
}return this
},updateStatistics:function(attributes){this.model.set(attributes);
$("#backlog-data-area .backlog-stats").html(JST["sprints/stats"]({attributes:attributes}));
var totals=this.$(".stories-container .totals");
if(this.model.SprintStories().length===0){totals.addClass("notice").html(JST["sprints/empty"]())
}else{totals.removeClass("notice").html(JST["sprints/totals"]({attributes:attributes,storyCount:this.model.SprintStories().length,sprint:this.model}))
}this.sprintTabsView.adjustTabConstraints(true);
this.updateSprintButtonsView()
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
},markSprintAsComplete:function(event){var that=this;
event.preventDefault();
var incompleteStories=this.model.SprintStories().reject(function(story){return story.Status().isDone()
}),previousIncompleteSprints=_(this.model.Backlog().Sprints().select(function(sprint){return(sprint.get("iteration")<that.model.get("iteration"))&&!sprint.isComplete()
})).sortBy(function(sprint){return sprint.get("iteration")
});
if(incompleteStories.length){new App.Views.Warning({message:"All stories must be marked as Done before marking this sprint as complete"})
}else{if(previousIncompleteSprints.length){new App.Views.Warning({message:"Sprint "+_(previousIncompleteSprints).last().get("iteration")+" is not complete. Please mark as complete first"})
}else{this.model.set({"completed":"true"});
this.updatedSprintCompletedStatus()
}}},markSprintAsIncomplete:function(event){var that=this;
event.preventDefault();
var successiveCompleteSprints=_(this.model.Backlog().Sprints().select(function(sprint){return(sprint.get("iteration")>that.model.get("iteration"))&&sprint.isComplete()
})).sortBy(function(sprint){return sprint.get("iteration")
});
if(successiveCompleteSprints.length){new App.Views.Warning({message:"Sprint "+_(successiveCompleteSprints).first().get("iteration")+" is complete. Please mark as incomplete first"})
}else{this.model.set({"completed":"false"});
this.updatedSprintCompletedStatus()
}},updatedSprintCompletedStatus:function(){var that=this;
this.model.save(false,{success:function(model,response){that.updateSprintButtonsView();
new App.Views.Notice({message:"Sprint status updated"})
},error:function(model,response){var errorMessage="Oops, we've been unable to update the sprint, please try again";
try{errorMessage=$.parseJSON(response.responseText).message
}catch(e){if(window.console){console.log(e)
}}var errorView=new App.Views.Error({message:errorMessage})
}})
},updateSprintButtonsView:function(){var that=this;
var completeView=$("<div>"+JST["sprints/show"]({model:that.model})+"</div>");
that.$("h2").replaceWith(completeView.find("h2"));
that.$(".complete-status").replaceWith(completeView.find(".complete-status"));
that.$(".unassigned-stories-container .notice").remove();
if(that.model.isComplete()){that.$(".unassigned-stories-container").prepend(completeView.find(".unassigned-stories-container .notice"));
that.$(".unassigned-stories-container .story-card").addClass("locked")
}else{that.$(".unassigned-stories-container .story-card").removeClass("locked")
}},bulkMoveStories:function(event){var that=this,eligibleSprints=this.model.Backlog().Sprints().filter(function(sprint){return sprint.get("iteration")>that.model.get("iteration")
});
event.preventDefault();
$("#dialog-move-sprint-stories").remove();
$("body").append(JST["sprints/move-dialog"]({sprints:eligibleSprints}));
$("#dialog-move-sprint-stories").dialog({resizable:false,height:200,width:280,modal:true,buttons:{"Move":function(){var target=$(this).find("select").val(),sprintStories=that.model.SprintStories().incompleteStories();
if(target===""){$(this).find("div.error-message").html("<p>You must select a destination first.</p>")
}else{$(this).find(".progress-placeholder").html("<p>Please wait while we move the incomplete stories...</p>");
$(this).parent().find(".ui-dialog-buttonset button:nth-child(2) span").text("Preparing...");
$(this).parent().find(".ui-dialog-buttonset button:nth-child(1)").hide();
_(sprintStories).each(function(sprintStory){var story=sprintStory.Story(),storyNode=that.$("#"+that.childId(story));
if(target==="backlog"){storyNode.data("move-story")()
}else{storyNode.slideUp();
sprintStory.save({"move_to_sprint_id":target},{success:function(model,response){that.model.SprintStories().remove(model);
that.model.collection.get(target).SprintStories().add(model)
},error:function(model,response){var errorMessage="There was an error moving the stories...  Please refresh your browser.";
try{errorMessage=$.parseJSON(response.responseText).message
}catch(e){if(window.console){console.log(e)
}}var errorView=new App.Views.Error({message:errorMessage})
}})
}});
$(this).dialog("close")
}},Cancel:function(){$(this).dialog("close")
}}})
}}),Help:App.Views.BaseView.extend({pod:false,initialize:function(options){App.Views.BaseView.prototype.initialize.call(this);
this.sprintTabsView=options.sprintTabsView;
_.bindAll(this,"addSprint")
},render:function(){$(this.el).html(JST["sprints/help"]());
this.pod=$(JST["sprints/help-pod"]());
this.pod.find("a.add-new-sprint").click(this.addSprint);
this.$("a.add-new-sprint").click(this.addSprint);
$("section.main-content-pod").before(this.pod)
},addSprint:function(event){this.sprintTabsView.createNew(event)
},cleanUp:function(){this.pod.remove()
}}),SprintStory:App.Views.BaseView.extend({tagName:"div",className:"story-card",contractedHeight:90,heightBuffer:10,events:{"click .more .tab":"toggleMore","click .move":"moveStory","click .status .tab":"statusChangeClick"},initialize:function(options){App.Views.BaseView.prototype.initialize.call(this);
this.parentView=options.parentView;
_.bindAll(this,"resetToggle","updateSprintStoryStatus")
},render:function(){var that=this;
$(this.el).html(JST["sprints/sprint-story"]({model:this.model}));
this.setStatusHover();
setTimeout(function(){that.resetToggle()
},1);
$(this.el).data("reset-toggle",this.resetToggle);
$(this.el).data("move-story",function(){that.moveStory()
});
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
},setEditableState:function(){if(this.model.IsEditable()){$(this.el).removeClass("locked")
}else{$(this.el).addClass("locked")
}},toggleMore:function(speed){var delay=isNaN(parseInt(speed))?"fast":speed,that=this;
$(this.el).find(".more").css("display","block");
if($(this.el).css("height")===this.contractedHeight+"px"){$(this.el).animate({height:$(this.el).data("original-height")},delay,null,that.parentView.positionStoriesContainerOnScroll);
$(this.el).find(".more").addClass("less").find(".tab").text("less")
}else{$(this.el).animate({height:this.contractedHeight+"px"},delay,null,that.parentView.positionStoriesContainerOnScroll);
$(this.el).find(".more").removeClass("less").find(".tab").text("more")
}},moveStory:function(){$(this.el).removeClass("hover");
if($(this.el).parents(".stories-container .cards").length==0){this.parentView.$(".stories-container .cards").append(this.el)
}else{this.parentView.$(".unassigned-stories-container").prepend(this.el)
}this.parentView.persistSprintStories()
}})};
App.Views.SprintTabs={Index:App.Views.BaseView.extend({childId:function(model){return"tab-sprint-"+model.get("id")
},isSettingsPage:false,models:{},events:{"click #add-sprint>a":"createNew"},initialize:function(){this.collection=this.options.collection;
this.router=this.options.router;
_.bindAll(this,"showNew","getModelFromIteration","restoreTab")
},render:function(){var view=this;
this.isSettingsPage=$("#backlog-data-area").length==0;
this.isSnapshot=$(".not-editable-backlog-notice").length>=1?true:false;
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
}}},createNew:function(event){var view=this,backlogVelocity=this.collection.backlog.get("velocity");
event.preventDefault();
$("#dialog-new-sprint").remove();
$("body").append(JST["sprints/new-dialog"]({sprints:this.collection,backlog:this.collection.backlog}));
$("#dialog-new-sprint").dialog({resizable:false,height:backlogVelocity?400:285,width:470,modal:true,buttons:{Create:function(){var dialog=$(this),modelData,model;
if(!dialog.find("form").valid()){$(dialog).find("p.intro").addClass("error").html("One or more fields are not completed correctly.  Please correct these to continue.");
return false
}$(this).find("p.progress-placeholder").html("Please wait, creating new sprint...");
$(this).parent().find(".ui-dialog-buttonset button:nth-child(2) span").text("Preparing...");
$(this).parent().find(".ui-dialog-buttonset button:nth-child(1)").hide();
modelData={start_on:$.datepicker.formatDate("yy-mm-dd",dialog.find("#start-on").datepicker("getDate")),duration_days:dialog.find("#duration-days").val()};
if(!backlogVelocity||dialog.find("#use-explicit-velocity").is(":checked")){modelData["explicit_velocity"]=dialog.find("#explicit-velocity").val()
}else{modelData["number_team_members"]=dialog.find("#number-team-members").val()
}model=new Sprint(modelData);
if(view.collection.length===0){$.cookie("sprint_duration",model.get("duration_days"))
}view.collection.add(model);
model.save(false,{success:function(model,response){view.showNew(model);
new App.Views.Notice({message:"Sprint number "+model.get("iteration")+" has been added"});
$(dialog).dialog("close")
},error:function(model,error){var errorMessage;
if(window.console){console.log(JSON.stringify(error))
}if($(dialog).is(":visible")){try{errorMessage=JSON.parse(error.responseText).message;
$(dialog).find("p.intro").addClass("error").html("Oops, we could not create a sprint as it looks like you haven't filled in everything correctly:<br>"+errorMessage)
}catch(e){$(dialog).find("p.intro").addClass("error").html("Oops, somethign has gone wrong and we could not create the sprint.  Please try again.");
if(window.console){console.log(e)
}}$(dialog).parent().find(".ui-dialog-buttonset button:nth-child(2) span").text("Cancel");
$(dialog).parent().find(".ui-dialog-buttonset button:nth-child(1)").show();
$(dialog).find("p.progress-placeholder").html("")
}else{var errorView=new App.Views.Error({message:"Sprint was not created, please try again"})
}view.collection.remove(model)
}})
},Cancel:function(){$(this).dialog("close")
}}});
var dialog=$("#dialog-new-sprint");
dialog.find("#start-on").blur().datepicker();
if(_.isFunction($.fn.validate)){dialog.find("form").validate(App.Views.SharedSprintSettings.formValidationConfig)
}var dayInMs=1000*60*60*24,shiftToNextWeekday=function(dateInMs){var date=new Date(dateInMs);
switch(date.getDay()){case 0:return dateInMs+dayInMs;
case 6:return dateInMs+(dayInMs*2)
}return dateInMs
};
if(this.collection.length===0){dialog.find("#start-on").datepicker("setDate",new Date(new Date().getTime()+1000*60*60*24));
dialog.find("#duration-days").val(!isNaN(parseInt($.cookie("sprint_duration")))?$.cookie("sprint_duration"):10);
dialog.find("#number-team-members").val("1")
}else{if(this.collection.length==1){var lastSprint=this.collection.at(0),lastDate=parseRubyDate(lastSprint.get("start_on")).getTime(),lastDuration=Number(lastSprint.get("duration_days")),nextDate=lastDate+(lastDuration*dayInMs)+(Math.floor(lastDuration/5)*2*dayInMs);
dialog.find("#start-on").datepicker("setDate",new Date(shiftToNextWeekday(nextDate)));
dialog.find("#duration-days").val(lastDuration);
dialog.find("#number-team-members").val(niceNum(lastSprint.get("number_team_members")));
dialog.find("#explicit-velocity").val(niceNum(lastSprint.get("explicit_velocity")))
}else{var sprintsDesc=this.collection.sortBy(function(sprint){return sprint.get("iteration")
}).reverse(),lastSprint=sprintsDesc[0],previousSprint=sprintsDesc[1],lastDate=parseRubyDate(lastSprint.get("start_on")).getTime(),lastDuration=Number(lastSprint.get("duration_days")),timePassedBetweenDates=parseRubyDate(lastSprint.get("start_on")).getTime()-parseRubyDate(previousSprint.get("start_on")).getTime(),nextDateByDuration=lastDate+(lastDuration*dayInMs)+(Math.floor(lastDuration/5)*2*dayInMs),nextDateByTimeBetweenSprints=lastDate+timePassedBetweenDates,nextDate=Math.max(nextDateByDuration,nextDateByTimeBetweenSprints);
dialog.find("#start-on").datepicker("setDate",new Date(shiftToNextWeekday(nextDate)));
dialog.find("#duration-days").val(lastSprint.get("duration_days"));
dialog.find("#number-team-members").val(niceNum(lastSprint.get("number_team_members")));
dialog.find("#explicit-velocity").val(niceNum(lastSprint.get("explicit_velocity")))
}}App.Views.SharedSprintSettings.addFormBehaviour(dialog,backlogVelocity)
}}),Show:App.Views.BaseView.extend({tagName:"li",className:"sprint-tab",events:{"click a":"activate"},initialize:function(){App.Views.BaseView.prototype.initialize.call(this);
this.router=this.options.router;
this.parentView=this.options.parentView;
_.bindAll(this,"remove")
},render:function(){$(this.el).html(JST["sprints/tabs/show"]({model:this.model}));
if(this.model.active){$(this.el).addClass("active")
}if(this.model.locked){$(this.el).addClass("locked")
}return this
},activate:function(){this.router.navigate(String(this.model.get("iteration")),true)
}})};
App.Views.Stories={Index:Backbone.View.extend({tagName:"ul",className:"stories",childId:function(model){return"story-"+model.get("id")
},events:{"click .actions a.new-story":"createNew","keydown .actions a.new-story":"addStoryKeyPress"},initialize:function(){this.collection=this.options.collection;
_.bindAll(this,"orderChanged")
},render:function(){var view=this;
this.collection.each(function(model){var storyView=new App.Views.Stories.Show(App.Views.Helpers.addUseOptions({model:model,id:view.childId(model)},view.options));
$(view.el).append(storyView.render().el)
});
if(this.collection.theme.IsEditable()){if(!this.collection.theme.isNew()){$(this.el).append(JST["stories/new"]())
}var orderChangedEvent=this.orderChanged;
var actionsElem;
$(this.el).sortable({start:function(event,ui){actionsElem=view.$(">.actions").clone();
view.$(">.actions").remove();
view.storyDragged=true;
$("#vtip").remove();
view.$(".move-story.vtipActive").mouseleave();
view.$(".move-story").removeClass("vtip");
$(".color-picker").hide()
},stop:function(event,ui){App.Views.Stories.Index.stopMoveEvent=true;
orderChangedEvent();
$(view.el).append(actionsElem);
view.$(".move-story").addClass("vtip")
},placeholder:"target-order-highlight",axis:"y",items:"li.story"}).find(".move-story").disableSelection();
this.$(".color-picker-icon a").click(function(event){$("#vtip").remove();
$(event.target).mouseleave()
})
}return(this)
},createNew:function(event){event.preventDefault();
var model=new Story();
this.collection.add(model);
this.$("li:last").before(new App.Views.Stories.Show(App.Views.Helpers.addUseOptions({model:model},this.options)).render().el);
var view=this;
this.$("li.story:last").css("display","none").slideDown("fast",function(){view.$("li.story:last > .user-story > .as-a > .data").click()
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
}}),Show:App.Views.BaseView.extend({tagName:"li",className:"story",deleteDialogTemplate:"stories/delete-dialog",events:{"click .delete-story>a":"remove","click .duplicate-story>a":"duplicate","click .status .tab":"statusChangeClick"},initialize:function(){var that=this;
App.Views.BaseView.prototype.initialize.call(this);
_.bindAll(this,"navigateEvent","moveToThemeDialog","moveToTheme","changeColor","updateViewWithModelData");
this.model.bind("change",function(model){that.updateViewWithModelData(model.changedAttributes())
})
},render:function(){this.updateViewWithModelData("all");
this.configureView();
return this
},configureView:function(){var view=new App.Views.AcceptanceCriteria.Index({collection:this.model.AcceptanceCriteria()}),show_view=this,tabElems=[".user-story .data",".unique-id .data",".comments .data",".score-50 .data",".score-90 .data",".score .data"];
this.$(".acceptance-criteria").html(view.render().el);
if(this.model.IsEditable()){this.makeFieldsEditable();
this.$(".move-story a").mousedown(function(event){App.Views.Stories.Index.stopMoveEvent=false
}).click(function(event){event.preventDefault();
if(!App.Views.Stories.Index.stopMoveEvent){show_view.moveToThemeDialog()
}});
this.$(".color-picker-icon a").simpleColorPicker({onChangeColor:function(col){show_view.changeColor(col)
},colorsPerLine:4,colors:["#ffffff","#dddddd","#bbbbbb","#999999","#ff0000","#ff9900","#ffff00","#00ff00","#00ffff","#6666ff","#9900ff","#ff00ff","#f4cccc","#d9ead3","#cfe2f3","#ead1dc","#ffe599","#b6d7a8","#b4a7d6","#d5a6bd","#e06666","#f6b26b","#ffd966","#93c47d"]})
}else{_.each(tabElems,function(elem){show_view.$(elem).click(function(){new App.Views.Warning({message:"You cannot edit a story that is marked as done"})
})
})
}if(this.model.get("color")){this.changeColor(this.model.get("color"),{silent:true})
}App.Views.Helpers.activateUrlify(this.el);
this.setStatusHover()
},updateViewWithModelData:function(attributes){var that=this;
if(attributes==="all"){$(this.el).html(JST["stories/show"](App.Views.Helpers.addUseOptions({model:this.model},this.options)))
}else{if(attributes&&(attributes.sprint_story_status_id||attributes.sprint_story_id)){$(this.el).html(JST["stories/show"](App.Views.Helpers.addUseOptions({model:this.model},this.options)));
this.configureView()
}}if(this.model.IsEditable()){$(this.el).removeClass("locked")
}else{$(this.el).addClass("locked")
}},setStatusHover:function(){App.Views.Helpers.setStatusHover.apply(this,arguments)
},statusChangeClick:function(event){App.Views.Helpers.statusChangeClick.apply(this,arguments)
},makeFieldsEditable:function(){var show_view=this,contentUpdatedFunc=function(value){return show_view.contentUpdated(value,this)
},beforeChangeFunc=function(value){return show_view.beforeChange(value,this)
},defaultOptions=_.extend(_.clone(this.defaultEditableOptions),{data:beforeChangeFunc,onKeyDown:show_view.navigateEvent});
var uniqueIdContentUpdatedFunc=function(value){return show_view.model.Theme().get("code")+contentUpdatedFunc.call(this,value)
},uniqueIdBeforeChangeFunc=function(value){return beforeChangeFunc.call(this,value.substring(3))
},scoreContentUpdatedFunc=function(value){return contentUpdatedFunc.call(this,niceNum(value))
},commentsContentUpdatedFunc=function(value){var that=this;
setTimeout(function(){$(that).html(urlify($(that).html(),35))
},100);
return contentUpdatedFunc.call(this,value)
},commentsBeforeChangeFunc=function(value){unUrlify(this);
return beforeChangeFunc.call(this,$(this).text())
};
var uniqueIdOptions=_.extend(_.clone(defaultOptions),{data:uniqueIdBeforeChangeFunc,maxLength:4});
this.$(">div.unique-id .data").editable(uniqueIdContentUpdatedFunc,uniqueIdOptions);
this.$(">div.score-50 .data, >div.score-90 .data, >div.score .data").editable(scoreContentUpdatedFunc,_.extend(_.clone(defaultOptions),{maxLength:4}));
this.$(">div.comments .data").editable(commentsContentUpdatedFunc,_.extend(_.clone(defaultOptions),{type:"textarea",saveonenterkeypress:true,autoResize:true,data:commentsBeforeChangeFunc,noChange:commentsContentUpdatedFunc}));
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
if(this.options.use5090Estimates){viewElements.push("score-50 .data");
viewElements.push("score-90 .data")
}else{viewElements.push("score .data")
}dataClass=$(event.target);
if(!dataClass.hasClass("data")){dataClass=dataClass.parents(".data:first")
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
}}else{if(_.isString(newValue)){if(fieldChanged.match(/^score/)){newValue=niceNum(newValue)
}else{newValue=multiLineHtmlEncode(newValue)
}if(newValue===""){newValue=this.defaultEditableOptions.placeholder
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
if(colorWithoutHex.toLowerCase()==="ffffff"){colorWithoutHex=colorWithHex="";
$(this.el).css("background-color","transparent")
}else{var colors=colorWithoutHex.match(/[\d\w]{2}/g);
$(this.el).css("background-color","rgba("+parseInt(colors[0],16)+", "+parseInt(colors[1],16)+", "+parseInt(colors[2],16)+", 0.15)")
}$(this.el).find(".background-color-indicator").css("background-color",colorWithHex);
if(!options||!options.silent){this.model.set({color:colorWithoutHex});
this.model.save()
}},duplicate:function(event){var model=new Story(),attributes=_.clone(this.model.attributes);
event.preventDefault();
delete attributes.id;
delete attributes.unique_id;
this.model.AcceptanceCriteria().each(function(criterion){var crit=new AcceptanceCriterion();
crit.set({criterion:criterion.get("criterion")});
model.AcceptanceCriteria().add(crit)
});
model.set(attributes);
this.model.collection.add(model);
var storyView=new App.Views.Stories.Show(App.Views.Helpers.addUseOptions({model:model,id:0},this.options));
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
_.bindAll(this,"orderChanged")
},render:function(){var that=this;
$(this.el).html(JST["themes/index"]({collection:this.collection.models}));
this.collection.each(function(model){var view=new App.Views.Themes.Show(App.Views.Helpers.addUseOptions({model:model,id:that.childId(model)},that.options));
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
this.$("ul.themes li:last").before(new App.Views.Themes.Show(App.Views.Helpers.addUseOptions({model:model},this.options)).render().el);
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
}}),Show:App.Views.BaseView.extend({tagName:"li",className:"theme",deleteDialogTemplate:"themes/delete-dialog",events:{"click .delete-theme>a":"remove","click .re-number-stories a":"reNumberStories"},initialize:function(){App.Views.BaseView.prototype.initialize.call(this);
_.bindAll(this,"navigateEvent","reNumberStoriesAction")
},render:function(){$(this.el).html(JST["themes/show"]({model:this.model}));
var view=new App.Views.Stories.Index(App.Views.Helpers.addUseOptions({collection:this.model.Stories()},this.options));
this.$(">.stories").prepend(view.render().el);
this.updateStatistics();
if(this.model.IsEditable()){this.makeFieldsEditable()
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
var defaultOptions=_.extend(_.clone(this.defaultEditableOptions),{data:beforeChangeFunc,onKeyDown:show_view.navigateEvent});
this.$(".theme-data .name div.data").editable(contentUpdatedFunc,_.extend(_.clone(defaultOptions),{maxLength:100}));
this.$(".theme-data .code div.data").editable(contentUpdatedFunc,_.extend(_.clone(defaultOptions),{widen:8,maxLength:3}))
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
}}else{_.delay(function(){dataField.click()
},200)
}}else{$(event.target).blur();
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
},updateStatistics:function(){this.$(".theme-stats div").html(JST["themes/stats"](App.Views.Helpers.addUseOptions({model:this.model},this.options)))
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
},error:function(event){var errorMessage="Server error trying to renumber stories";
try{errorMessage=$.parseJSON(event.responseText).message;
var errorView=new App.Views.Warning({message:errorMessage})
}catch(e){if(window.console){console.log(e)
}var errorView=new App.Views.Error({message:errorMessage})
}$(dialog).dialog("close")
}})
}})};
App.Routers.Backlog=Backbone.Router.extend({backlogView:false,oldView:false,routes:{"":"showBacklog","Backlog":"showBacklog","Stats":"showStats","Sprints":"showSprintsHelp",":iteration":"showSprint"},initialize:function(options){_.bindAll(this,"setTabsReference","cleanUpOldView")
},setTabsReference:function(tabs){this.sprintTabsView=tabs
},showBacklog:function(){this.cleanUpOldView();
if(!this.backlogView){this.backlogView=new App.Views.Backlogs.Show({model:App.Collections.Backlogs.at(0),el:$("#backlog-container"),sprintTabsView:this.sprintTabsView});
this.backlogView.render();
this.showContainer("#backlog-container")
}else{this.backlogView.activated();
this.showContainer("#backlog-container")
}this.sprintTabsView.select(this.sprintTabsView.getModelFromIteration("Backlog"))
},showStats:function(){this.cleanUpOldView();
if(!this.statsView){this.statsView=new App.Views.BacklogStats.Show({model:App.Collections.Backlogs.at(0),el:this.replaceWithNew("#stats-container")});
this.statsView.render();
this.showContainer("#stats-container")
}else{this.statsView.activated();
this.showContainer("#stats-container")
}this.sprintTabsView.select(this.sprintTabsView.getModelFromIteration("Stats"))
},showSprintsHelp:function(){this.cleanUpOldView();
this.oldView=new App.Views.Sprints.Help({sprintTabsView:this.sprintTabsView,el:this.replaceWithNew("#sprints-help-container")});
this.showContainer("#sprints-help-container");
this.oldView.render();
this.sprintTabsView.select(this.sprintTabsView.getModelFromIteration("Sprints"))
},showSprint:function(iteration){var model=this.sprintTabsView.getModelFromIteration(iteration);
this.cleanUpOldView();
if(!model){var err=new App.Views.Warning({message:"Sprint "+iteration+" was not found"});
this.navigate("Backlog",true)
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