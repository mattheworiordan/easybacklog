$(document).ready(function(){var rules={"backlog[name]":{required:true,remote:"/companies/"+$("form#new_backlog").attr("action").match(/^\/companies\/(\d+)/i)[1]+"/backlogs/name_available"},"backlog[rate]":{required:true,number:true,min:0},"backlog[velocity]":{required:true,number:true,min:0}};
$("form#new_backlog").validate({rules:rules,messages:{"backlog[name]":{required:"You must enter a backlog name",remote:"That backlog name is already taken.  Please enter another name"}},success:function(label){label.html("&nbsp;").addClass("correct")
}})
});