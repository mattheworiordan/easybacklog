(function($){$.fn.lightBox=function(settings){settings=jQuery.extend({overlayBgColor:"#000",overlayOpacity:0.8,fixedNavigation:false,imageLoading:"images/lightbox-ico-loading.gif",imageBtnPrev:"images/lightbox-btn-prev.gif",imageBtnNext:"images/lightbox-btn-next.gif",imageBtnClose:"images/lightbox-btn-close.gif",imageBlank:"images/lightbox-blank.gif",containerBorderSize:10,containerResizeSpeed:400,txtImage:"Image",txtOf:"of",keyToClose:"c",keyToPrev:"p",keyToNext:"n",imageArray:[],activeImage:0},settings);
var jQueryMatchedObj=this;
function _initialize(){_start(this,jQueryMatchedObj);
return false
}function _start(objClicked,jQueryMatchedObj){$("embed, object, select").css({"visibility":"hidden"});
_set_interface();
settings.imageArray.length=0;
settings.activeImage=0;
if(jQueryMatchedObj.length==1){settings.imageArray.push(new Array(objClicked.getAttribute("href"),objClicked.getAttribute("title")))
}else{for(var i=0;
i<jQueryMatchedObj.length;
i++){settings.imageArray.push(new Array(jQueryMatchedObj[i].getAttribute("href"),jQueryMatchedObj[i].getAttribute("title")))
}}while(settings.imageArray[settings.activeImage][0]!=objClicked.getAttribute("href")){settings.activeImage++
}_set_image_to_view()
}function _set_interface(){$("body").append('<div id="jquery-overlay"></div><div id="jquery-lightbox"><div id="lightbox-container-image-box"><div id="lightbox-container-image"><img id="lightbox-image"><div style="" id="lightbox-nav"><a href="#" id="lightbox-nav-btnPrev"></a><a href="#" id="lightbox-nav-btnNext"></a></div><div id="lightbox-loading"><a href="#" id="lightbox-loading-link"><img src="'+settings.imageLoading+'"></a></div></div></div><div id="lightbox-container-image-data-box"><div id="lightbox-container-image-data"><div id="lightbox-image-details"><span id="lightbox-image-details-caption"></span><span id="lightbox-image-details-currentNumber"></span></div><div id="lightbox-secNav"><a href="#" id="lightbox-secNav-btnClose"><img src="'+settings.imageBtnClose+'"></a></div></div></div></div>');
var arrPageSizes=___getPageSize();
$("#jquery-overlay").css({backgroundColor:settings.overlayBgColor,opacity:settings.overlayOpacity,width:arrPageSizes[0],height:arrPageSizes[1]}).fadeIn();
var arrPageScroll=___getPageScroll();
$("#jquery-lightbox").css({top:arrPageScroll[1]+(arrPageSizes[3]/10),left:arrPageScroll[0]}).show();
$("#jquery-overlay,#jquery-lightbox").click(function(){_finish()
});
$("#lightbox-loading-link,#lightbox-secNav-btnClose").click(function(){_finish();
return false
});
$(window).resize(function(){var arrPageSizes=___getPageSize();
$("#jquery-overlay").css({width:arrPageSizes[0],height:arrPageSizes[1]});
var arrPageScroll=___getPageScroll();
$("#jquery-lightbox").css({top:arrPageScroll[1]+(arrPageSizes[3]/10),left:arrPageScroll[0]})
})
}function _set_image_to_view(){$("#lightbox-loading").show();
if(settings.fixedNavigation){$("#lightbox-image,#lightbox-container-image-data-box,#lightbox-image-details-currentNumber").hide()
}else{$("#lightbox-image,#lightbox-nav,#lightbox-nav-btnPrev,#lightbox-nav-btnNext,#lightbox-container-image-data-box,#lightbox-image-details-currentNumber").hide()
}var objImagePreloader=new Image();
objImagePreloader.onload=function(){$("#lightbox-image").attr("src",settings.imageArray[settings.activeImage][0]);
_resize_container_image_box(objImagePreloader.width,objImagePreloader.height);
objImagePreloader.onload=function(){}
};
objImagePreloader.src=settings.imageArray[settings.activeImage][0]
}function _resize_container_image_box(intImageWidth,intImageHeight){var intCurrentWidth=$("#lightbox-container-image-box").width();
var intCurrentHeight=$("#lightbox-container-image-box").height();
var intWidth=(intImageWidth+(settings.containerBorderSize*2));
var intHeight=(intImageHeight+(settings.containerBorderSize*2));
var intDiffW=intCurrentWidth-intWidth;
var intDiffH=intCurrentHeight-intHeight;
$("#lightbox-container-image-box").animate({width:intWidth,height:intHeight},settings.containerResizeSpeed,function(){_show_image()
});
if((intDiffW==0)&&(intDiffH==0)){if($.browser.msie){___pause(250)
}else{___pause(100)
}}$("#lightbox-container-image-data-box").css({width:intImageWidth});
$("#lightbox-nav-btnPrev,#lightbox-nav-btnNext").css({height:intImageHeight+(settings.containerBorderSize*2)})
}function _show_image(){$("#lightbox-loading").hide();
$("#lightbox-image").fadeIn(function(){_show_image_data();
_set_navigation()
});
_preload_neighbor_images()
}function _show_image_data(){$("#lightbox-container-image-data-box").slideDown("fast");
$("#lightbox-image-details-caption").hide();
if(settings.imageArray[settings.activeImage][1]){$("#lightbox-image-details-caption").html(settings.imageArray[settings.activeImage][1]).show()
}if(settings.imageArray.length>1){$("#lightbox-image-details-currentNumber").html(settings.txtImage+" "+(settings.activeImage+1)+" "+settings.txtOf+" "+settings.imageArray.length).show()
}}function _set_navigation(){$("#lightbox-nav").show();
$("#lightbox-nav-btnPrev,#lightbox-nav-btnNext").css({"background":"transparent url("+settings.imageBlank+") no-repeat"});
if(settings.activeImage!=0){if(settings.fixedNavigation){$("#lightbox-nav-btnPrev").css({"background":"url("+settings.imageBtnPrev+") left 15% no-repeat"}).unbind().bind("click",function(){settings.activeImage=settings.activeImage-1;
_set_image_to_view();
return false
})
}else{$("#lightbox-nav-btnPrev").unbind().hover(function(){$(this).css({"background":"url("+settings.imageBtnPrev+") left 15% no-repeat"})
},function(){$(this).css({"background":"transparent url("+settings.imageBlank+") no-repeat"})
}).show().bind("click",function(){settings.activeImage=settings.activeImage-1;
_set_image_to_view();
return false
})
}}if(settings.activeImage!=(settings.imageArray.length-1)){if(settings.fixedNavigation){$("#lightbox-nav-btnNext").css({"background":"url("+settings.imageBtnNext+") right 15% no-repeat"}).unbind().bind("click",function(){settings.activeImage=settings.activeImage+1;
_set_image_to_view();
return false
})
}else{$("#lightbox-nav-btnNext").unbind().hover(function(){$(this).css({"background":"url("+settings.imageBtnNext+") right 15% no-repeat"})
},function(){$(this).css({"background":"transparent url("+settings.imageBlank+") no-repeat"})
}).show().bind("click",function(){settings.activeImage=settings.activeImage+1;
_set_image_to_view();
return false
})
}}_enable_keyboard_navigation()
}function _enable_keyboard_navigation(){$(document).keydown(function(objEvent){_keyboard_action(objEvent)
})
}function _disable_keyboard_navigation(){$(document).unbind()
}function _keyboard_action(objEvent){if(objEvent==null){keycode=event.keyCode;
escapeKey=27
}else{keycode=objEvent.keyCode;
escapeKey=objEvent.DOM_VK_ESCAPE
}key=String.fromCharCode(keycode).toLowerCase();
if((key==settings.keyToClose)||(key=="x")||(keycode==escapeKey)){_finish()
}if((key==settings.keyToPrev)||(keycode==37)){if(settings.activeImage!=0){settings.activeImage=settings.activeImage-1;
_set_image_to_view();
_disable_keyboard_navigation()
}}if((key==settings.keyToNext)||(keycode==39)){if(settings.activeImage!=(settings.imageArray.length-1)){settings.activeImage=settings.activeImage+1;
_set_image_to_view();
_disable_keyboard_navigation()
}}}function _preload_neighbor_images(){if((settings.imageArray.length-1)>settings.activeImage){objNext=new Image();
objNext.src=settings.imageArray[settings.activeImage+1][0]
}if(settings.activeImage>0){objPrev=new Image();
objPrev.src=settings.imageArray[settings.activeImage-1][0]
}}function _finish(){$("#jquery-lightbox").remove();
$("#jquery-overlay").fadeOut(function(){$("#jquery-overlay").remove()
});
$("embed, object, select").css({"visibility":"visible"})
}function ___getPageSize(){var xScroll,yScroll;
if(window.innerHeight&&window.scrollMaxY){xScroll=window.innerWidth+window.scrollMaxX;
yScroll=window.innerHeight+window.scrollMaxY
}else{if(document.body.scrollHeight>document.body.offsetHeight){xScroll=document.body.scrollWidth;
yScroll=document.body.scrollHeight
}else{xScroll=document.body.offsetWidth;
yScroll=document.body.offsetHeight
}}var windowWidth,windowHeight;
if(self.innerHeight){if(document.documentElement.clientWidth){windowWidth=document.documentElement.clientWidth
}else{windowWidth=self.innerWidth
}windowHeight=self.innerHeight
}else{if(document.documentElement&&document.documentElement.clientHeight){windowWidth=document.documentElement.clientWidth;
windowHeight=document.documentElement.clientHeight
}else{if(document.body){windowWidth=document.body.clientWidth;
windowHeight=document.body.clientHeight
}}}if(yScroll<windowHeight){pageHeight=windowHeight
}else{pageHeight=yScroll
}if(xScroll<windowWidth){pageWidth=xScroll
}else{pageWidth=windowWidth
}arrayPageSize=new Array(pageWidth,pageHeight,windowWidth,windowHeight);
return arrayPageSize
}function ___getPageScroll(){var xScroll,yScroll;
if(self.pageYOffset){yScroll=self.pageYOffset;
xScroll=self.pageXOffset
}else{if(document.documentElement&&document.documentElement.scrollTop){yScroll=document.documentElement.scrollTop;
xScroll=document.documentElement.scrollLeft
}else{if(document.body){yScroll=document.body.scrollTop;
xScroll=document.body.scrollLeft
}}}arrayPageScroll=new Array(xScroll,yScroll);
return arrayPageScroll
}function ___pause(ms){var date=new Date();
curDate=null;
do{var curDate=new Date()
}while(curDate-date<ms)
}return this.unbind("click").click(_initialize)
}
})(jQuery);
$(document).ready(function(){var visibleCriteriaCard,lightBoxOptions,featureNavs,animatingCards;
function validateEmail(required){var valid=false;
if($(this).val().match(/^\b[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,4}\b$/i)){valid=true
}else{if(!$(this).data("original-value")||($(this).data("original-value")===$(this).val())){if(!required){valid=true
}}}if(valid){$(this).removeClass("invalid");
$(".error-message .container").html("")
}else{$(this).addClass("invalid");
$(".error-message .container").html("Oops, that's not a valid email.<br/>Please try again.")
}return valid
}$("input[type=text]").inputLabelize();
$("input#beta_signup_email").blur(function(){validateEmail.call(this)
});
$("form").submit(function(){if(!validateEmail.call($("input#beta_signup_email")[0],true)){$(".error-message .container").animate({backgroundColor:"#FFFF00"},500,function(){$(this).animate({backgroundColor:"#FAFAFA"},function(){$(this).css("background-color","transparent")
})
});
return false
}else{$(".request-access input[type=submit]").addClass("disabled");
$(".request-access input[type=submit]").attr("disabled",true);
$(".request-access .progress").show();
return true
}});
featureNavs=$(".feature-nav ul li");
animatingCards=false;
function showCard(moveForward){var selectedIndex,visibleCard,visibleStoryCard;
featureNavs.each(function(index,elem){if($(elem).hasClass("selected")){selectedIndex=index+1
}});
if(moveForward){featureNavs.removeClass("selected");
if(selectedIndex<featureNavs.length){selectedIndex+=1
}else{selectedIndex=1
}$(".feature-nav ul li:nth-child("+selectedIndex+")").addClass("selected")
}visibleCard=$(".dual-cards .card.visible").css("z-index",10);
visibleStoryCard=visibleCard.find(".story-card");
visibleCriteriaCard=visibleCard.find(".criteria-card");
animatingCards=true;
$(".dual-cards .card:nth-child("+(selectedIndex+2)+")").addClass("visible").css("z-index",5);
visibleStoryCard.animate({left:"-=330",top:"-=60"},300,"easeInCubic",function(){visibleCard.css("z-index",1);
visibleStoryCard.animate({left:"+=330",top:"+=60"},300,"easeOutCubic",function(){visibleCard.removeClass("visible");
animatingCards=false
})
});
visibleCriteriaCard.animate({left:"+=330",top:"+=60"},300,"easeInCubic",function(){visibleCriteriaCard.animate({left:"-=330",top:"-=60"},300,"easeOutCubic")
})
}featureNavs.click(function(){if(!animatingCards){if(!$(this).hasClass("selected")){featureNavs.removeClass("selected");
$(this).addClass("selected");
showCard()
}}}).disableSelection();
$(".dual-cards .card").click(function(){if(!animatingCards){showCard(true)
}}).disableSelection();
$("a#request-invitation-footer").click(function(){$("#beta_signup_email").focus()
});
lightBoxOptions={imageBtnPrev:"/images/beta_signup/lightbox-prev.png",imageBtnNext:"/images/beta_signup/lightbox-next.png"};
$(".content-mix a.light-box").lightBox(lightBoxOptions);
$(".features a.light-box").lightBox(lightBoxOptions);
$("a.light-box-group, .screen-shots a").lightBox($.extend(lightBoxOptions,{fixedNavigation:true}))
});
jQuery.fn.inputLabelize=function(){this.focus(function(){var firstClick=false,faded,offset,that;
if(!$(this).data("original-value")){firstClick=true;
$(this).data("original-value",$(this).val())
}faded=$('<div id="'+$(this).attr("id")+'_faded" class="faded-request-access">');
faded.text($(this).data("original-value"));
faded.css("position","absolute");
faded.css("width",$(this).width()+"px");
faded.css("height",$(this).height()+"px");
that=this;
offset="1 -3";
if($.browser.mozilla){if($.browser.versionInt>=5){offset="0 -2"
}else{offset="1 -2"
}}else{if($.browser.msie){offset="-1 -2"
}}faded.position({my:"top left",at:"top left",of:$(this),offset:offset}).click(function(){$(that).focus()
});
if((!this.firstClick)&&($(this).data("original-value")!==$(this).val())){faded.hide()
}else{$(this).val("")
}$("section.content").append(faded);
$(this).addClass("enabled")
}).keyup(function(){if($(this).val()===""){$(".faded-request-access").show()
}else{$(".faded-request-access").hide()
}}).blur(function(){if($(this).val().replace(/\s+/)===""){$(this).val($(this).data("original-value"));
$(this).removeClass("enabled")
}$(".faded-request-access").remove()
})
};