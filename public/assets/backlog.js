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
},Company_ID:function(){return this.collection.company_id
}});
var Story=Backbone.Model.extend({Theme:function(){return this.collection.theme
},IsEditable:function(){return(this.collection.theme.IsEditable())
},AcceptanceCriteria:function(){if(!this._acceptance_criteria){this._acceptance_criteria=new AcceptanceCriteriaCollection(this.get("acceptance_criteria"),{story:this});
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
var AcceptanceCriteriaCollection=Backbone.Collection.extend({model:AcceptanceCriterion,story:null,url:function(){if(!this.story||!this.story.get("id")){var errorView=new App.Views.Error("Error, missing necessary data ID to display Acceptance Criteria")
}else{return"/stories/"+this.story.get("id")+"/acceptance_criteria"
}},initialize:function(models,options){this.story=options?options.story:null;
_.bindAll(this,"saveOrder")
},saveOrder:function(idOrderCollection){var thisCollection=this;
_.each(idOrderCollection,function(index,key){var criterion=thisCollection.get(key);
if(criterion){criterion.set({"position":idOrderCollection[key]});
criterion.save()
}})
}});
var BacklogsCollection=Backbone.Collection.extend({model:Backlog,company_id:null,url:function(){if(!this.company_id){var errorView=new App.Views.Error("Error, missing necesary ID to display Backlog")
}else{return"/companies/"+this.company_id+"/backlogs"
}},initialize:function(models,options){this.company_id=options?options.company_id:null
}});
var StoriesCollection=Backbone.Collection.extend({model:Story,theme:null,url:function(){if(!this.theme||!this.theme.get("id")){var errorView=new App.Views.Error("Error, missing necessary data ID to display Story")
}else{return"/themes/"+this.theme.get("id")+"/stories"
}},initialize:function(models,options){this.theme=options?options.theme:null
},saveOrder:function(idOrderCollection){var thisCollection=this;
_.each(idOrderCollection,function(index,key){var story=thisCollection.get(key);
if(story){story.set({"position":idOrderCollection[key]});
story.save()
}})
}});
var ThemesCollection=Backbone.Collection.extend({model:Theme,backlog:null,url:function(){if(!this.backlog){var errorView=new App.Views.Error("Error, cannot find Backlog and thus cannot load Theme")
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
},events:{"click .actions a.new-acceptance-criterion":"createNew"},initialize:function(){this.collection=this.options.collection;
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
}this.displayOrderIndexes();
return(this)
},createNew:function(event){event.preventDefault();
var lastCriterion=this.$("li.criterion:last");
var model=new AcceptanceCriterion();
var this_view=this;
this.collection.add(model);
var newElem=new App.Views.AcceptanceCriteria.Show({model:model,parentView:this}).render().el;
if((lastCriterion.find(".data textarea").length)&&(lastCriterion.find(".data textarea").val()==="")){_.delay(function(){this_view.$("ul li:last").before(newElem);
this_view.displayOrderIndexes();
$(newElem).find(".data").click()
},250)
}else{this.$("ul li:last").before(newElem);
this.displayOrderIndexes();
this.$("ul li.criterion:last").css("display","none").slideDown(100,function(){$(newElem).find(".data").click()
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
}}),Show:App.Views.BaseView.extend({tagName:"li",className:"criterion",events:{},initialize:function(){App.Views.BaseView.prototype.initialize.call(this);
_.bindAll(this,"navigateEvent")
},render:function(){$(this.el).html(JST["acceptance_criteria/show"]({model:this.model}));
if(this.model.IsEditable()){this.makeFieldsEditable();
this.$(".data input, .data textarea").live("keydown",this.navigateEvent)
}return(this)
},changeEvent:function(eventName,model){if(eventName=="change:id"){$(this.el).attr("id","acceptance-criteria-"+model.get("id"))
}},makeFieldsEditable:function(){var ac_view=this;
var contentUpdatedFunc=function(){var newVal=arguments[0];
var model_collection=ac_view.model.collection;
if(_.isEmpty(newVal)){$(ac_view.el).slideUp("fast",function(){$(ac_view.el).remove();
if(ac_view.model.isNew()){model_collection.remove(ac_view.model)
}else{ac_view.model.destroy({error:function(model,response){var errorMessage="Unable to delete story...  Please refresh.";
try{errorMessage=$.parseJSON(response.responseText).message
}catch(e){if(window.console){console.log(e)
}}var errorView=new App.Views.Error({message:errorMessage})
}})
}ac_view.parentView.displayOrderIndexes()
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
if(!event.shiftKey){if(_.first(liElem)!=_.last(liElem.parent("ul").find("li.criterion"))){liElem.next().find(".data").click()
}else{if($.trim(this.$("textarea").val())===""){$(this.el).parents("li.story").find("div.comments .data").click()
}else{this.parentView.createNew(event)
}}}else{if(_.first(liElem)==_.first(liElem.parent("ul").find("li.criterion"))){$(this.el).parents("li.story").find("div.so-i-can .data").click()
}else{liElem.prev().find(".data").click()
}}}}})};
App.Views.Backlogs={Show:App.Views.BaseView.extend({dataArea:$("#backlog-data-area"),initialize:function(){App.Views.BaseView.prototype.initialize.call(this);
_.bindAll(this,"navigateEvent","print","newSnapshot","jumpToSnapshot","compareSnapshot")
},render:function(){var use5090estimates=$("#backlog-container #themes-header .columns .score-50").length?true:false;
var view=new App.Views.Themes.Index({collection:this.model.Themes(),use5090estimates:use5090estimates});
this.$("#themes-container").html(view.render().el);
var show_view=this;
this.updateStatistics();
$("#backlog-data-area .actions #print").click(this.print);
$("#backlog-data-area #new-snapshot").click(this.newSnapshot);
$("#backlog-data-area #compare-snapshot").click(this.compareSnapshot);
$("#backlog-data-area select#snapshot-selector").change(this.jumpToSnapshot);
if(this.model.IsEditable()){this.makeFieldsEditable();
$("#backlog-data-area div.data input").live("keydown",this.navigateEvent);
var firstEditableElem=$("ul.themes li.theme:first .theme-data .name .data");
if(firstEditableElem.length){firstEditableElem.click()
}else{$("ul.themes li.actions a.new-theme").focus()
}}else{$("#backlog-data-area").addClass("not-editable");
$("#backlog-container").addClass("not-editable")
}return(this)
},makeFieldsEditable:function(){var show_view=this;
var contentUpdatedFunc=function(value,settings){return show_view.contentUpdated(value,settings,this)
};
var beforeChangeFunc=function(value,settings){return show_view.beforeChange(value,settings,this)
};
var defaultOptions=_.extend(_.clone(this.defaultEditableOptions),{data:beforeChangeFunc,lesswidth:-20,maxLength:100,style:"margin-top: -3px"});
var previousRateFormatted,previousRate;
var beforeRateChangeFunc=function(value,settings){previousRateFormatted=value;
previousRate=show_view.model.get("rate");
return show_view.beforeChange(previousRate,settings,this)
};
var rateUpdatedFunc=function(value,settings){if(previousRate==value){_.delay(function(){show_view.changeEvent("change:rate_formatted")
},100)
}return show_view.contentUpdated(value,settings,this)
};
$("#backlog-data-area h2.name .data, #backlog-data-area #backlog-velocity .data").editable(contentUpdatedFunc,defaultOptions);
$("#backlog-data-area #backlog-rate .data").editable(rateUpdatedFunc,_.extend(_.clone(defaultOptions),{data:beforeRateChangeFunc}))
},changeEvent:function(eventName,model){if(eventName.substring(0,7)=="change:"){var fieldChanged=eventName.substring(7);
if(fieldChanged=="rate_formatted"){$("#backlog-data-area .rate>div.data").text(this.model.get(fieldChanged))
}else{$("#backlog-data-area ."+fieldChanged.replace(/_/gi,"-")+">div.data").text(this.model.get(fieldChanged))
}App.Controllers.Statistics.updateStatistics(this.model.get("score_statistics"))
}},updateStatistics:function(){$("#backlog-data-area .backlog-stats div.output").html(JST["backlogs/stats"]({model:this.model}))
},navigateEvent:function(event){if(_.include([9,13,27],event.keyCode)){$(event.target).blur();
try{event.preventDefault()
}catch(e){}if(!event.shiftKey){var firstTheme=$("#themes-container ul.themes li.theme:first>.theme-data .name .data");
if(firstTheme.length){firstTheme.click()
}else{$("#themes-container ul.themes li.actions a.new-theme").focus()
}}else{if(!$(event.target).parents("h2.name").is("h2")){$("#backlog-data-area h2.name>div.data").click()
}else{$("li:last a:last").focus()
}}}},print:function(event){var view=this;
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
$("#dialog-create-snapshot").dialog({resizable:false,height:210,width:350,modal:true,buttons:{"Create Snapshot":function(){var name=$(this).find("input[type=text]").val();
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
var baseUrl=document.location.pathname.match(/^\/companies\/\d+\/backlogs\/\d+/i)[0];
if(val.match(/^\d+$/)){baseUrl+="/snapshots/"+val
}$("#loading-new-snapshot").show();
document.location.pathname=baseUrl
},compareSnapshot:function(event){var view=this;
var newSnapshotLink=$(event.target);
event.preventDefault();
$("#dialog-compare-snapshot").remove();
$("body").append(JST["backlogs/compare-snapshot-dialog"]({snapshot_options:$("#backlog-data-area select#snapshot-selector").html()}));
var currentSnapshot=document.location.pathname.match(/^\/companies\/\d+\/backlogs\/\d+\/snapshots\/(\d+)/i);
if(currentSnapshot){$("#dialog-compare-snapshot select#target-snapshot").val($("#dialog-compare-snapshot select#target-snapshot option:first-child").val())
}$("#dialog-compare-snapshot").dialog({resizable:false,height:320,width:400,modal:true,buttons:{"Compare":function(){var base=$(this).find("select#base-snapshot").val();
var target=$(this).find("select#target-snapshot").val();
if(base==target){$(this).find("div.error-message").html('<p><span class="error-alert ui-icon ui-icon-alert"></span>'+"You cannot compare the same snapshots.  Please make another selection.</p>")
}else{var baseUrl=document.location.pathname.match(/^\/companies\/\d+\/backlogs/i)[0];
var backlogId=document.location.pathname.match(/^\/companies\/\d+\/backlogs\/(\d+)/i)[1];
var url=baseUrl+"/compare/"+(base.match(/^\d+$/)?base:backlogId)+"/"+(target.match(/^\d+$/)?target:backlogId);
if(App.environment==="test"){document.location.href=url
}else{window.open(url,"_newtab"+Math.floor(Math.random()*10000))
}$(this).dialog("close")
}},Cancel:function(){$(this).dialog("close")
}}})
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
App.Views.Stories={Index:Backbone.View.extend({tagName:"div",className:"stories",childId:function(model){return"story-"+model.get("id")
},events:{"click ul.stories .actions a.new-story":"createNew","keydown ul.stories .actions a.new-story":"storyKeyPress"},initialize:function(){this.collection=this.options.collection;
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
}else{this.$(".story-actions").remove()
}return(this)
},createNew:function(event){event.preventDefault();
var model=new Story();
this.collection.add(model);
this.$("ul.stories li:last").before(new App.Views.Stories.Show({model:model,use5090estimates:this.use5090estimates}).render().el);
var this_view=this;
this.$("ul.stories li.story:last").css("display","none").slideDown("fast",function(){this_view.$("ul.stories li.story:last > .user-story > .as-a > .data").click()
})
},storyKeyPress:function(event){if(9==event.keyCode){if(event.shiftKey){event.preventDefault();
var thisTheme=$(this.el).parents("li.theme");
if(thisTheme.has("li.story:last .score-90 .data").length){thisTheme.find("li.story:last .score-90 .data").click()
}else{thisTheme.find(".theme-data .name .data").click()
}}else{var nextTheme=$(this.el).parents("li.theme").next();
if(nextTheme.length){nextTheme.find(".theme-data .name .data").click()
}}}else{if(13==event.keyCode){this.createNew(event)
}}},orderChanged:function(){var orderIndexesWithIds={};
this.$("li.story").each(function(index,elem){var elemId=_.last($(elem).attr("id").split("-"));
if(!isNaN(parseInt(elemId,10))){orderIndexesWithIds[elemId]=index+1
}});
if(window.console){console.log("Order changed and saving - "+JSON.stringify(orderIndexesWithIds))
}this.collection.saveOrder(orderIndexesWithIds)
}}),Show:App.Views.BaseView.extend({tagName:"li",className:"story",deleteDialogTemplate:"stories/delete-dialog",events:{"click .delete-story>a":"remove","click .duplicate-story>a":"duplicate"},initialize:function(){this.use5090estimates=this.options.use5090estimates;
App.Views.BaseView.prototype.initialize.call(this);
_.bindAll(this,"navigateEvent","moveToThemeDialog","moveToTheme","changeColor")
},render:function(){$(this.el).html(JST["stories/show"]({model:this.model,use5090estimates:this.use5090estimates}));
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
},makeFieldsEditable:function(){var show_view=this;
var contentUpdatedFunc=function(value,settings){return show_view.contentUpdated(value,settings,this)
};
var beforeChangeFunc=function(value,settings){return show_view.beforeChange(value,settings,this)
};
var defaultOptions=_.extend(_.clone(this.defaultEditableOptions),{data:beforeChangeFunc});
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
},navigateEvent:function(event){var isInput=$(event.target).is("input");
if(_.include([9,13,27],event.keyCode)&&(!event.ctrlKey||isInput)){$(event.target).blur();
try{event.preventDefault()
}catch(e){}var viewElements=["unique-id .data","as-a .data","i-want-to .data","so-i-can .data","acceptance-criteria ul.acceptance-criteria li:first-child>*","comments .data"];
if(this.use5090estimates){viewElements.push("score-50 .data");
viewElements.push("score-90 .data")
}else{viewElements.push("score .data")
}var dataClass=$(event.target);
if(!dataClass.hasClass("data")){dataClass=dataClass.parents(".data")
}dataClass=dataClass.parent().attr("class");
var dataElem=_.detect(viewElements,function(id){return(_.first(id.split(" "))==dataClass)
});
if(dataElem){if(!event.shiftKey){if(dataElem!=_.last(viewElements)){this.$("."+viewElements[_.indexOf(viewElements,dataElem)+1]).click()
}else{var sibling=$(this.el).next();
if(sibling.find("a.new-story").length){sibling.find("a.new-story").focus()
}else{sibling.find("."+_.first(viewElements)).click()
}}}else{if(dataElem!=_.first(viewElements)){var previousSelector=viewElements[_.indexOf(viewElements,dataElem)-1];
if(previousSelector.indexOf("acceptance-criteria")===0){var lastCriterion=this.$(".acceptance-criteria ul.acceptance-criteria li.criterion:last>*");
if(lastCriterion.length){lastCriterion.click()
}else{this.$(".acceptance-criteria ul.acceptance-criteria li:last a").click()
}}else{this.$("."+previousSelector).click()
}}else{if($(this.el).prev().length){$(this.el).prev().find(".score-90 .data, .score .data").click()
}else{$(this.el).parents("li.theme").find(".theme-data >.name .data").click()
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
}$(this.el).css("background-color",colorWithHex);
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
}}else{$("#backlog-data-area h2.name .data").click()
}}else{if(target.is("a.reorder-themes")){this.$("a.new-theme").focus()
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
});
this.$("ul.stories li.actions a.new-story").live("keydown",this.navigateEvent)
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
},navigateEvent:function(event){if(_.include([9,13,27],event.keyCode)){$(event.target).blur();
try{event.preventDefault()
}catch(e){}if(!$(event.target).hasClass("new-story")){if(!event.shiftKey){var storyElem=$(this.el).find("li.story:first-child");
if(storyElem.length){storyElem.find(".unique-id .data").click()
}else{$(this.el).next().find("a.new-theme").focus();
$(this.el).find("ul.stories li a.new-story").focus()
}}else{var dataClass=$(event.target).parents(".data").parent().attr("class");
if(dataClass=="name"){var prev=$(this.el).prev();
if(prev.length){if(prev.find("ul.stories li.actions a.new-story")){prev.find("ul.stories li.actions a.new-story").focus()
}else{prev.find(".theme-data >.name .data").click()
}}else{$("#backlog-data-area h2.name .data").click()
}}else{this.$(".theme-data >.name .data").click()
}}}else{if(!event.shiftKey){var nextThemeLi=$(event.target).parents("li.theme").next();
if(nextThemeLi.hasClass("theme")){nextThemeLi.find(">.name .data").click()
}else{nextThemeLi.find("a.new-theme").focus()
}}else{var previous_story_matcher="ul.stories li.story:last .score-90 .data, ul.stories li.story:last .score .data";
var previous_story=$(this.el).find(previous_story_matcher);
if(previous_story.length){previous_story.click()
}else{$(this.el).find(">.name .data").click()
}}}}},changeEvent:function(eventName,model){if(eventName.substring(0,7)=="change:"){var fieldChanged=eventName.substring(7);
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