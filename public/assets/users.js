$(document).ready(function(){$("input.admin:checkbox").change(function(c){var e=$(c.target).attr("id").replace("user-","");var a;if($(c.target).is(":checked")){$("label#label-user-"+e).text("Yes");a=true}else{$("label#label-user-"+e).text("No");a=false}var b={id:e,admin:a};var d={url:document.location.pathname+"/"+e,type:"PUT",contentType:"application/json",data:JSON.stringify(b),dataType:"json",processData:false,success:function(f){console.log("Updated user successfully")},error:function(f,h,g){console.log(h);console.log(g);new App.Views.Error({message:"The user could not be updated, please refresh your browser"})}};$.ajax(d)})});