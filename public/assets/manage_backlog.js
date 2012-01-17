App.Views.Shared={EnableBacklogEstimationPreferences:function(frm,namespace){var defaultPrefix=(namespace=="backlog"?"":"_default"),haveSuggestedEstimates=false,setDaysEstimatableVisibility=function(){if($("input#"+namespace+"_days_estimatable_false").is(":checked")){frm.find("#"+namespace+defaultPrefix+"_velocity").rules("add",{required:false});
frm.find("input#velocity_was").val(frm.find("input#"+namespace+defaultPrefix+"_velocity").val());
frm.find("input#rate_was").val(frm.find("input#"+namespace+defaultPrefix+"_rate").val());
frm.find("input#"+namespace+defaultPrefix+"_velocity, input#"+namespace+defaultPrefix+"_rate").val("");
frm.find(".cost-elements").hide();
frm.find("#days_estimatable_false_label").addClass("selected");
frm.find("#days_estimatable_true_label").removeClass("selected")
}else{frm.find("input#"+namespace+defaultPrefix+"_velocity").rules("add",{required:true});
if(frm.find("input#velocity_was").val()){frm.find("input#"+namespace+defaultPrefix+"_velocity").val(frm.find("input#velocity_was").val())
}if(frm.find("input#rate_was").val()){frm.find("input#"+namespace+defaultPrefix+"_rate").val(frm.find("input#rate_was").val())
}frm.find("#days_estimatable_true_label").addClass("selected");
frm.find("#days_estimatable_false_label").removeClass("selected");
frm.find(".cost-elements").slideDown()
}};
if(!haveSuggestedEstimates&&frm.find("input#"+namespace+"_days_estimatable_false").is(":checked")){if(_.include(["","false","f"],frm.find("input#account_defaults_set").val())){$("input#"+namespace+"_days_estimatable_true").attr("checked",true);
haveSuggestedEstimates=true
}}setDaysEstimatableVisibility();
$("input#"+namespace+"_days_estimatable_false, input#"+namespace+"_days_estimatable_true").change(function(){setDaysEstimatableVisibility()
});
return setDaysEstimatableVisibility
}};
App.Views.BacklogCreateUpdateMethods=(function(){var setDaysEstimatableVisibility;
function initializeManageBacklog(){var frm=$("form#new_backlog, form.edit_backlog");
frm.validate({rules:{"backlog[name]":{required:true},"backlog[rate]":{number:true,min:0},"backlog[velocity]":{number:true,min:0.1}},messages:{"backlog[name]":{required:"You must enter a backlog name",remote:"That backlog name is already taken.  Please enter another name"},"backlog[velocity]":{min:"Please enter a velocity greater than zero"}},success:function(label){label.html("&nbsp;").addClass("correct")
}});
setDaysEstimatableVisibility=App.Views.Shared.EnableBacklogEstimationPreferences(frm,"backlog");
storeAccountDefaults();
$("input#backlog_has_company_false, input#backlog_has_company_true").change(function(){setCompanyVisibility()
});
$("a#add_new_company").click(function(event){event.preventDefault();
$(".client-select .existing").hide();
$(".client-select .new").show();
return;
setAccountDefaults();
$("input#company_name").focus()
});
$("a#select_an_existing_company").click(function(event){event.preventDefault();
$("input#company_name").val("");
$(".client-select .existing").show();
$(".client-select .new").hide();
getCompanyDefaults();
$("select#backlog_company_id").focus()
});
if($(".client-select .existing select option").length===0){$(".client-select .new .select-existing").hide()
}if($(".not-editable-notice").length){$('input[type=text],input[type=checkbox],input[name="backlog[scoring_rule_id]"],select').attr("disabled",true);
$("#backlog_has_company_false, #backlog_has_company_true").attr("disabled",true);
$(".client-select .new-company").hide()
}setCompanyVisibility(true);
$("select#backlog_company_id").change(function(){getCompanyDefaults()
})
}function setCompanyVisibility(firstCall){if($("input#backlog_has_company_false").is(":checked")){$(".client-select, .client-select .existing, .client-select .new").hide();
$("#has_company_false_label").addClass("selected");
$("#has_company_true_label").removeClass("selected");
setAccountDefaults(firstCall)
}else{$("#has_company_true_label").addClass("selected");
$("#has_company_false_label").removeClass("selected");
$(".client-select").show();
if($("#backlog_company_id option").length>0){$(".client-select .existing").css("height","auto").slideDown();
$("select#backlog_company_id").focus();
getCompanyDefaults(firstCall)
}else{$(".client-select .new").css("height","auto").slideDown();
$(".client-select .existing").hide();
$("input#company_name").focus();
setAccountDefaults(firstCall)
}}}function storeAccountDefaults(){$("input#backlog_rate").data("default",$("input#backlog_rate").val());
$("input#backlog_velocity").data("default",$("input#backlog_velocity").val());
$("input#backlog_use_50_90").data("default",$("input#backlog_use_50_90").attr("checked"))
}function setAccountDefaults(firstCall){if(!isEditingBacklog()){$("input#backlog_rate").val($("input#backlog_rate").data("default"));
$("input#backlog_velocity").val($("input#backlog_velocity").data("default"));
$("input#backlog_use_50_90").attr("checked",$("input#backlog_use_50_90").data("default"));
if(!firstCall){resetEstimatableVisibility()
}}}function getCompanyDefaults(firstCall){if(!isEditingBacklog()){var selected=$("select#backlog_company_id option:selected").val();
var account_ID=document.location.href.match(/\/accounts\/(\d+)\//i);
$.getJSON("/accounts/"+account_ID[1]+"/companies/"+selected+".json",{},function(data){$("input#backlog_rate").val(data.default_rate);
$("input#backlog_velocity").val(data.default_velocity);
$("input#backlog_use_50_90").attr("checked",data.default_use_50_90);
console.log("value:"+firstCall+".");
if(!firstCall){resetEstimatableVisibility()
}})
}}function resetEstimatableVisibility(){console.log("value"+$("input#backlog_velocity").val()+".");
if($("input#backlog_velocity").val()){$("input#backlog_days_estimatable_true").attr("checked",true)
}else{$("input#backlog_days_estimatable_false").attr("checked",true)
}setDaysEstimatableVisibility()
}function isEditingBacklog(){return $("form.edit_backlog").length>0
}return{initializeManageBacklog:initializeManageBacklog}
})();