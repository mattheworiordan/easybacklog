App.Views.BacklogSettings={Show:App.Views.BaseView.extend({tagName:"section",className:"content",stateHtml:false,initialize:function(){App.Views.BaseView.prototype.initialize.call(this);
this.sprintTabsView=this.options.sprintTabsView;
_.bindAll(this,"storeBacklogSettings","retrieveBacklogSettings","deleteSprint","storeState","stateChanged","restoreState","updateSprint","cancel")
},render:function(){if(this.model.get("iteration")==="Backlog"){this.retrieveBacklogSettings();
App.Views.BacklogCreateUpdateMethods.initializeManageBacklog();
this.el=$("section.content .backlog-settings-body")
}else{this.storeBacklogSettings();
$("section.title h1").html("Sprint "+this.model.get("iteration")+" settings");
$("section.side-panel").html(JST["sprints/sprint-delete-panel"]({model:this.model}));
$("section.side-panel a.delete-sprint").click(this.deleteSprint);
this.el=$("section.content .backlog-settings-body").html(JST["sprints/edit-sprint"]({model:this.model,backlog:this.model.Backlog()}));
this.$("#start-on").datepicker().datepicker("setDate",parseRubyDate(this.model.get("start_on")));
this.$("a#sprint_submit").click(this.updateSprint);
this.$("a#sprint_cancel").click(this.cancel);
this.disableFieldsIfNotEditable();
this.$("form").validate(App.Views.SharedSprintSettings.formValidationConfig);
App.Views.SharedSprintSettings.addFormBehaviour(this.$("form"),this.model.Backlog().get("velocity"))
}this.storeState();
return this
},storeState:function(){this.stateHtml=$(this.el).clone()
},stateChanged:function(){return !this.stateHtml||haveFormElementValuesChanged(this.el,this.stateHtml)
},restoreState:function(){$(this.el).replaceWith(this.stateHtml)
},storeBacklogSettings:function(){if(!App.Views.BacklogSettings.fragments){App.Views.BacklogSettings.fragments={"section.title .heading":false,"section.side-panel":false,"section.main-content-pod .backlog-settings-body":false};
_(App.Views.BacklogSettings.fragments).each(function(val,key){App.Views.BacklogSettings.fragments[key]=$(key).clone()
})
}},retrieveBacklogSettings:function(){if(App.Views.BacklogSettings.fragments){_(App.Views.BacklogSettings.fragments).each(function(val,key){$(key).replaceWith(App.Views.BacklogSettings.fragments[key])
})
}delete App.Views.BacklogSettings.fragments
},deleteSprint:function(event){var view=this;
event.preventDefault();
$("#dialog-delete-sprint").remove();
$("body").append(JST["sprints/delete-sprint-dialog"]({iteration:this.model.get("iteration")}));
$("#dialog-delete-sprint").dialog({resizable:false,height:170,modal:true,buttons:{"Delete":function(){var dialog=this;
$(this).find(">p").html('Deleting sprint, please wait<br /><br /><span class="progress-icon"></span>');
$(this).parent().find(".ui-dialog-buttonset button:nth-child(2) span").text("Close");
$(this).parent().find(".ui-dialog-buttonset button:nth-child(1)").remove();
view.model.destroy({success:function(){new App.Views.Notice({message:"Sprint number "+view.model.get("iteration")+" has been deleted"});
view.sprintTabsView.destroy(view.model,function(){$(dialog).dialog("close")
})
},error:function(){var errorView=new App.Views.Error({message:"Internal error, unable to delete sprint"});
$(dialog).dialog("close")
}})
},Cancel:function(){$(this).dialog("close")
}}})
},updateSprint:function(event){var view=this;
event.preventDefault();
if(!this.$("form").valid()){view.$("#form-errors").addClass("form_errors").html("Oops, we could not update the sprint as it looks like you haven't filled in everything correctly.  Please correct the fields marked in red to continue.").hide().slideDown()
}else{if(this.model.IsComplete()){if(this.$("#sprint_status_completed").is(":checked")){new App.Views.Warning({message:"Nothing has changed so nothing has been updated"})
}else{this.model.set({completed:"false"});
this.saveSprintFields()
}}else{this.model.set({start_on:$.datepicker.formatDate("yy-mm-dd",this.$("#start-on").datepicker("getDate")),duration_days:this.$("#duration-days").val()});
if(!this.model.Backlog().get("velocity")||this.$("#use-explicit-velocity").is(":checked")){this.model.set({explicit_velocity:this.$("#explicit-velocity").val(),number_team_members:null})
}else{this.model.set({explicit_velocity:null,number_team_members:this.$("#number-team-members").val()})
}if(this.$("#sprint_status_completed").is(":checked")){this.saveSprintFields(function(){view.saveSprintFields(function(){view.model.set({completed:"true"});
view.saveSprintFields()
})
})
}else{this.saveSprintFields()
}}}},saveSprintFields:function(callbackOnSuccess){var view=this;
this.model.save(false,{success:function(){if(_.isFunction(callbackOnSuccess)){callbackOnSuccess()
}else{new App.Views.Notice({message:"Sprint number "+view.model.get("iteration")+" has been updated"});
view.$("#form-errors").removeClass("form_errors");
view.storeState();
view.disableFieldsIfNotEditable()
}},error:function(model,error){var errorView;
if(window.console){console.log(JSON.stringify(error))
}if(JSON.parse(error.responseText).message){view.$("#form-errors").addClass("form_errors").html("Oops, we could not update the sprint as it looks like you haven't filled in everything correctly:<br/>"+JSON.parse(error.responseText).message.replace("Validation failed: Completed at ","")).hide().slideDown();
errorView=new App.Views.Warning({message:"Sprint was not updated.  Please address problems and try again"})
}else{errorView=new App.Views.Error({message:"An internal error occured and the sprint was not updated.  Please refresh your browser"})
}}})
},disableFieldsIfNotEditable:function(){if(!this.model.IsEditable()){this.$("#number-team-members, #start-on, #duration-days, #explicit-velocity, input[name=calculation_method]").attr("disabled",true);
if(!this.model.CanEdit()){this.$("input[type=radio][name=sprint_status]").attr("disabled",true)
}}},cancel:function(event){event.preventDefault();
document.location.href=$("#back-to-backlog").attr("href")
}})};
App.Routers.BacklogSettings=Backbone.Router.extend({currentIteration:false,defaultTab:"Backlog",routes:{"":"defaultRoute",":iteration":"viewSprintOrBacklog"},initialize:function(options){_.bindAll(this,"setTabsReference","confirmDiscardChanges")
},setTabsReference:function(tabs){this.sprintTabsView=tabs
},defaultRoute:function(){this.viewSprintOrBacklog(this.defaultTab)
},viewSprintOrBacklog:function(iteration){var model=this.sprintTabsView.getModelFromIteration(iteration),that=this;
if(!model){model=this.sprintTabsView.getModelFromIteration(this.defaultTab);
if(!model){var err=new App.Views.Error({message:"Internal error, could not display default tab correctly.  Please refresh your browser"})
}}$("a#back-to-backlog").attr("href",$("a#back-to-backlog").attr("href").replace(/#[\d\w_-]*$/,"")+"#"+iteration);
this.confirmDiscardChanges(function(){if(that.view){that.view.restoreState()
}that.view=new App.Views.BacklogSettings.Show({model:model,sprintTabsView:that.sprintTabsView});
that.view.render();
that.sprintTabsView.select(model);
that.currentIteration=model.get("iteration")
},function(){that.sprintTabsView.restoreTab(that.currentIteration);
that.navigate(String(that.currentIteration))
})
},confirmDiscardChanges:function(continueWithChangeCallback,cancelCallback){if(this.currentIteration&&this.view.stateChanged()){$("#dialog-changed-confirm").remove();
$("body").append(JST["sprints/changed-confirm-dialog"]());
$("#dialog-changed-confirm").dialog({resizable:false,height:170,modal:true,buttons:{"Discard changes":function(){continueWithChangeCallback();
$(this).dialog("close")
},Cancel:function(){cancelCallback();
$(this).dialog("close")
}}})
}else{continueWithChangeCallback()
}}});