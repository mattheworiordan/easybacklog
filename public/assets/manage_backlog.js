$(document).ready(function(){var excludeThisBacklog="";
if(isEditingBacklog()){excludeThisBacklog="?exclude="+document.location.href.match(/\/backlogs\/(\d+)\//i)[1]
}var rules={"backlog[name]":{required:true,remote:"/accounts/"+$("form#new_backlog, form.edit_backlog").attr("action").match(/^\/accounts\/(\d+)/i)[1]+"/backlogs/name_available"+excludeThisBacklog},"backlog[rate]":{required:true,number:true,min:0},"backlog[velocity]":{required:true,number:true,min:0}};
$("form#new_backlog, form.edit_backlog").validate({rules:rules,messages:{"backlog[name]":{required:"You must enter a backlog name",remote:"That backlog name is already taken.  Please enter another name"}},success:function(label){label.html("&nbsp;").addClass("correct")
}});
storeAccountDefaults();
setCompanyVisibility();
$("input#backlog_has_company_false, input#backlog_has_company_true").change(function(){setCompanyVisibility()
});
$("a#add_new_company").click(function(){$(".existing").hide();
$(".new").show();
setAccountDefaults();
$("input#company_name").focus()
});
$("a#select_an_existing_company").click(function(){$("input#company_name").val("");
$(".existing").show();
$(".new").hide();
getCompanyDefaults();
$("select#backlog_company_id").focus()
});
$("select#backlog_company_id").change(getCompanyDefaults)
});
function setCompanyVisibility(){if($("input#backlog_has_company_false").is(":checked")){$(".client-select, .existing, .new").hide();
$("#has_company_false_label").addClass("selected");
$("#has_company_true_label").removeClass("selected");
setAccountDefaults()
}else{$("#has_company_true_label").addClass("selected");
$("#has_company_false_label").removeClass("selected");
$(".client-select").show();
if($("#backlog_company_id option").length>0){$(".existing").slideDown();
$("select#backlog_company_id").focus();
getCompanyDefaults()
}else{$(".new").slideDown();
$(".select-existing").hide();
$("input#company_name").focus();
setAccountDefaults()
}}}function storeAccountDefaults(){$("input#backlog_rate").data("default",$("input#backlog_rate").val());
$("input#backlog_velocity").data("default",$("input#backlog_velocity").val());
$("input#backlog_use_50_90").data("default",$("input#backlog_use_50_90").attr("checked"))
}function setAccountDefaults(){if(!isEditingBacklog()){$("input#backlog_rate").val($("input#backlog_rate").data("default"));
$("input#backlog_velocity").val($("input#backlog_velocity").data("default"));
$("input#backlog_use_50_90").attr("checked",$("input#backlog_use_50_90").data("default"))
}}function getCompanyDefaults(){if(!isEditingBacklog()){var selected=$("select#backlog_company_id option:selected").val();
var account_ID=document.location.href.match(/\/accounts\/(\d+)\//i);
$.getJSON("/accounts/"+account_ID[1]+"/companies/"+selected+".json",{},function(data){$("input#backlog_rate").val(data.default_rate);
$("input#backlog_velocity").val(data.default_velocity);
$("input#backlog_use_50_90").attr("checked",data.default_use_50_90)
})
}}function isEditingBacklog(){return $("form.edit_backlog").length>0
};