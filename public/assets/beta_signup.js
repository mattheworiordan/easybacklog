$(document).ready(function(){var validateEmail=function(required){var valid=false;
if($(this).val().match(/^([^\s]+)((?:[-a-z0-9]\.)[a-z]{2,})$/i)){valid=true
}else{if(!$(this).data("original-value")||($(this).data("original-value")===$(this).val())){console.log($(this).data("original-value")+" -- "+$(this).val()+" -- "+required);
if(!required){valid=true
}}}if(valid){$(this).removeClass("invalid");
$(".error-message .container").html("")
}else{$(this).addClass("invalid");
$(".error-message .container").html("Please enter a valid email address")
}return valid
};
$("input[type=text]").inputLabelize();
$("input#beta_signup_email").blur(function(){validateEmail.call(this)
});
$("form").submit(function(){if(!validateEmail.call($("input#beta_signup_email")[0],true)){$(".error-message .container").animate({backgroundColor:"#FFFF00"},500,function(){$(this).animate({backgroundColor:"#FFFFFF"})
});
return false
}return true
})
});
jQuery.fn.inputLabelize=function(){this.focus(function(){var firstClick=false;
if(!$(this).data("original-value")){firstClick=true;
$(this).data("original-value",$(this).val())
}var faded=$('<div id="'+$(this).attr("id")+'_faded" class="faded">');
faded.text($(this).data("original-value"));
faded.css("position","absolute");
faded.css("width",$(this).width()+"px");
faded.css("height",$(this).height()+"px");
var that=this;
faded.position({my:"top left",at:"top left",of:$(this),offset:$.browser.webkit?"1 -3":"1 -4"}).click(function(){$(that).focus()
});
if((!this.firstClick)&&($(this).data("original-value")!=$(this).val())){faded.hide()
}else{$(this).val("")
}$("section.content").append(faded);
$(this).addClass("enabled")
}).keyup(function(evt){if($(this).val()==""){$(".faded").show()
}else{$(".faded").hide()
}}).blur(function(){if($(this).val().replace(/\s+/)==""){$(this).val($(this).data("original-value"));
$(this).removeClass("enabled")
}$(".faded").remove()
})
};