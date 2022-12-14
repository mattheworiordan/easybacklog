var Exceptional = {
  KEY : null,
  HOST : 'api.getexceptional.com',
  action : '',
  handle: function (msg,url,line) {
    if (Exceptional.KEY) {
      var request = document.createElement('iframe');
      var protocol_version = 5;
      request.style.width   = '1px';
      request.style.height  = '1px';
      request.style.display = 'none';
      var api_url     = document.location.protocol + '//' + Exceptional.HOST + '/api/errors/new?protocol_version=' + protocol_version + '&msg=' + Exceptional.customEscape(msg) + '&url=' + Exceptional.customEscape(url) + '&line=' + Exceptional.customEscape(line) + '&api_key=' + Exceptional.KEY + '&customaction=' + Exceptional.customEscape(Exceptional.action);
      request.src = api_url;
      if (document.body) {
        document.body.appendChild(request);
      } else{
        addLoadEvent(function() {
          document.body.appendChild(request);
        });
      };

    };
    return api_url;
  },
  setKey: function (key) {
    Exceptional.KEY = key;
  },
  setHost: function (host) {
    Exceptional.HOST = host;
  },
  setAction: function (action) {
    Exceptional.action = action;
  },
  customEscape: function (escape_me) {
    if (typeof(escape_me) == "object") {
      return(escape(JSON.stringify(escape_me)));
    } else{
      return(escape(escape_me));
    };
  }
};

window.onerror = function(msg, url, line) {
  Exceptional.handle(msg,url,line);
};

// nice way to register the execution of some code when  the page has finished loading - from http://simonwillison.net/2004/May/26/addLoadEvent/
function addLoadEvent(func) {
  var oldonload = window.onload;
  if (typeof window.onload != 'function') {
    window.onload = func;
  } else {
    window.onload = function() {
      if (oldonload) {
        oldonload();
      }
      func();
    };
  }
}

// add JSON support - from here https://github.com/douglascrockford/JSON-js
if(!this.JSON)this.JSON={};
(function(){function k(a){return a<10?"0"+a:a}if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+k(this.getUTCMonth()+1)+"-"+k(this.getUTCDate())+"T"+k(this.getUTCHours())+":"+k(this.getUTCMinutes())+":"+k(this.getUTCSeconds())+"Z":null};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(){return this.valueOf()}}var n=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,o=
/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,f,l,q={"\u0008":"\\b","\t":"\\t","\n":"\\n","\u000c":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},i;function p(a){o.lastIndex=0;return o.test(a)?'"'+a.replace(o,function(c){var d=q[c];return typeof d==="string"?d:"\\u"+("0000"+c.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+a+'"'}function m(a,c){var d,g,j=f,e,b=c[a];if(b&&typeof b==="object"&&typeof b.toJSON==="function")b=b.toJSON(a);
if(typeof i==="function")b=i.call(c,a,b);switch(typeof b){case "string":return p(b);case "number":return isFinite(b)?String(b):"null";case "boolean":case "null":return String(b);case "object":if(!b)return"null";f+=l;e=[];if(Object.prototype.toString.apply(b)==="[object Array]"){g=b.length;for(a=0;a<g;a+=1)e[a]=m(a,b)||"null";c=e.length===0?"[]":f?"[\n"+f+e.join(",\n"+f)+"\n"+j+"]":"["+e.join(",")+"]";f=j;return c}if(i&&typeof i==="object"){g=i.length;for(a=0;a<g;a+=1){d=i[a];if(typeof d==="string")if(c=
m(d,b))e.push(p(d)+(f?": ":":")+c)}}else for(d in b)if(Object.hasOwnProperty.call(b,d))if(c=m(d,b))e.push(p(d)+(f?": ":":")+c);c=e.length===0?"{}":f?"{\n"+f+e.join(",\n"+f)+"\n"+j+"}":"{"+e.join(",")+"}";f=j;return c}}if(typeof JSON.stringify!=="function")JSON.stringify=function(a,c,d){var g;l=f="";if(typeof d==="number")for(g=0;g<d;g+=1)l+=" ";else if(typeof d==="string")l=d;if((i=c)&&typeof c!=="function"&&(typeof c!=="object"||typeof c.length!=="number"))throw new Error("JSON.stringify");return m("",
{"":a})};if(typeof JSON.parse!=="function")JSON.parse=function(a,c){function d(g,j){var e,b,h=g[j];if(h&&typeof h==="object")for(e in h)if(Object.hasOwnProperty.call(h,e)){b=d(h,e);if(b!==undefined)h[e]=b;else delete h[e]}return c.call(g,j,h)}a=String(a);n.lastIndex=0;if(n.test(a))a=a.replace(n,function(g){return"\\u"+("0000"+g.charCodeAt(0).toString(16)).slice(-4)});if(/^[\],:{}\s]*$/.test(a.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){a=eval("("+a+")");return typeof c==="function"?d({"":a},""):a}throw new SyntaxError("JSON.parse");}})();