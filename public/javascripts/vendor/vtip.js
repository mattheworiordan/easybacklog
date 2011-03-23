/**
Vertigo Tip by www.vertigo-project.com
Requires jQuery
*/

this.vtip = function() {    
    this.xOffset = -10; // x distance from mouse
    this.yOffset = 10; // y distance from mouse       
    
    $(".vtip").unbind().live('mouseenter',
        function(e) {
            this.t = this.title;
            if (this.t != '') {
              this.title = '';
              this.top = (e.pageY + yOffset); this.left = (e.pageX + xOffset);
              $(this).addClass('vtipActive'); // workaround for JQuery UI where vtips were displaying whilst dragging and then emptying the title, so we need to tag which item is active
            
              $('body').append( '<p id="vtip"><img id="vtipArrow" />' + this.t + '</p>' );
                        
              $('p#vtip #vtipArrow').attr("src", '/images/vtip_arrow.png');
              $('p#vtip').css("top", this.top+"px").css("left", this.left+"px").fadeIn("slow");
            }
        }).live('mouseleave',
        function() {
            if (this.title == '') {  // only change if emptied
              this.title = this.t;
              $("p#vtip").fadeOut("slow").remove();
              $(this).removeClass('vtipActive');  // workaround for JQuery UI where vtips were displaying whilst dragging and then emptying the title, so we need to tag which item is active
            }
        }
    ).live('mousemove',
        function(e) {
            this.top = (e.pageY + yOffset);
            this.left = (e.pageX + xOffset);
                         
            $("p#vtip").css("top", this.top+"px").css("left", this.left+"px");
        }
    );            
    
};

jQuery(document).ready(function($){vtip();})