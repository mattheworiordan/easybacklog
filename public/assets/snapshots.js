$(document).ready(function(event){$(".changed").css("color","black");
$("tr.header").html(JST["snapshots/snapshot-header"]({columns:$("tr.header td:first-child").attr("colspan")}));
$("a#close-window").click(function(event){event.preventDefault();
window.close()
});
$("a#print").click(function(event){event.preventDefault();
window.print()
});
$("a#help").click(function(event){event.preventDefault()
})
});