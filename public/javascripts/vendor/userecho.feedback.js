var _ues = {
host:'easybacklog.userecho.com',
forum:'4890',
lang:'en',
tab_icon_show:false,
tab_corner_radius:10,
tab_font_size:14,
tab_image_hash:'RmVlZGJhY2s%3D',
tab_alignment:'right',
tab_text_color:'#000000',
tab_bg_color:'#FFC31F',
tab_hover_color:'#FF9305',
tab_top: '75%'
};

// if we're testing, don't include UserEcho
if ( !((document.location.href.match(/localhost|127.0.0.1/)) && (document.location.href.indexOf(':3000') < 0)) ) {
  $(document).ready(function() {
    var _ue = document.createElement('script'); _ue.type = 'text/javascript'; _ue.async = true;
    _ue.src = ('https:' == document.location.protocol ? 'https://s3.amazonaws.com/' : 'http://') + 'cdn.userecho.com/js/widget-1.4.gz.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(_ue, s);
  });
}
