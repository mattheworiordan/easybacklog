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
$(function(){var frm=$("form#new_company, form.edit_company");
frm.validate({rules:{"company[default_rate]":{number:true,min:0},"company[default_velocity]":{number:true,min:0},"company[name]":{required:true,remote:document.location.href.match(/\/accounts\/\d+\/companies/)+"/name_available"+(frm.find("input#company_name_original").length?"?except="+escape(frm.find("input#company_name_original").val()):"")}},messages:{"company[name]":{required:"You must enter a company name",remote:"A company with this name is already set up.  Please enter another name."}},success:function(label){label.html("&nbsp;").addClass("correct")
}});
App.Views.Shared.EnableBacklogEstimationPreferences(frm,"company")
});