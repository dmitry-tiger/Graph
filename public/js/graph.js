$(document).ready(function() {
        
    var AllHosts = [];
    var AllHosts_rev = {};
    var SelectedItems = [];
    var KnownItems = [];
    var CurServer = "";
    var ImgId=0;
    var login_semaphore  = 0;
    var async;
    $(document).ajaxStop($.unblockUI);

    var hexDigits = new Array
        ("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"); 

    //Function to convert hex format to a rgb color
    function rgb2hex(rgb) {
     rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
     return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    }
    
    function hex(x) {
      return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
    }
//    $(document).ajaxStart($.blockUI).ajaxStop($.unblockUI);
    $.ajaxSetup({
        beforeSend:function(){
	$.blockUI({ message: '<h3> Loading data...</h3>' });     
            // show image here
//            $("#busy").show();
        },
        complete:function(){
            // hide image here
//            $("#busy").hide();
	    $.unblockUI;
        },
//	async: false,
    });
    $.cssHooks.backgroundColor = {
	get: function(elem) {
	    if (elem.currentStyle)
               var bg = elem.currentStyle["backgroundColor"];
            else if (window.getComputedStyle)
                var bg = document.defaultView.getComputedStyle(elem,
                    null).getPropertyValue("background-color");
            if (bg.search("rgb") == -1)
                return bg;
            else {
                bg = bg.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
                function hex(x) {
                    return ("0" + parseInt(x).toString(16)).slice(-2);
                }
                return hex(bg[1]) + hex(bg[2]) + hex(bg[3]);
            }
        }
    }
    if ($("#previous_response").html() == "0") { 
	$("#previous_response").removeClass("text-error").addClass("text-success");
	$("#previous_response").html("Completed Successfully");
    } 
    if ($("#previous_response").html() == "1") { 
	$("#previous_response").removeClass("text-success").addClass("text-error");
	$("#previous_response").html("Something wrong, check log");
    }
 
    function showLoadingScreen()
    {
	//include block.js for using this
	$.blockUI({ 
	    message: 'Loading....',
	    css: { 
		border: 'none',
		width: '300px', 
		height: '50px',
		padding: '15px',
		backgroundColor: '#000', 
		'-webkit-border-radius': '10px', 
		'-moz-border-radius': '10px', 
		opacity: .5, 
		color: '#fff'
	    }       
	}); 
    }
 
    function ZabServerLoad(server_name,param,vararr) {
	CurServer = server_name;
	login_semaphore=1;
	$('#item_container').empty();
	//$("#zauth_result").load("/zlogin/"+server_name, function() { 
	//    if (parseInt($("#zauth_result").html()) == 0 ) {
	//	$("#zauth_result").removeClass("text-error").addClass("text-success");
	//	$("#zauth_result").html("Zabbix authentication success, "+CurServer+" server selected");
	//    }
	//    if (parseInt($("#zauth_result").html()) == 1 ) {
	//        $("#zauth_result").removeClass("text-success").addClass("text-error");
	//        $("#zauth_result").html("Zabbix authentication failed, ask MT ;)");
	//    }
//	$.blockUI({ message: '<h3> Loading data...</h3>' });     
	$.ajax({url:"/zlogin/"+server_name,
	        dataType: 'json',
//		async: false,
  		success: function(data){
		    $("#zauth_result").html(data);
		    if (parseInt($("#zauth_result").html()) == 0 ) {
			$("#zauth_result").removeClass("text-error").addClass("text-success");
			$("#zauth_result").html("Zabbix authentication success, "+CurServer+" server selected");
		    }
		    if (parseInt($("#zauth_result").html()) == 1 ) {
		        $("#zauth_result").removeClass("text-success").addClass("text-error");
		        $("#zauth_result").html("Zabbix authentication failed, ask MT ;)");
		    }
//		$.unblockUI;

		     if (param != "noloadhosts") {
			$.ajax({url:"/do/ajax_get_all_hosts/",
				dataType: 'json',
//				async: false,
				//beforeSend: function(){
				//     showLoadingScreen();
				//},
				success: function(data){
				    AllHosts = data;
				    AllHosts_rev = {};
				    $.each(AllHosts, function(key,val) {
					AllHosts_rev[val[0]]= key;
				    });
				    login_semaphore=0;
				    SelectedItems = [];
				    $("#item_list").empty();
				    filter_host($('input[name=host_filter_input]').val());
//				    $.unblockUI;
				    if (param == "loadlist") {
					LoadGraphItemList(vararr[0],vararr[1],vararr[2]);
				    }
				    
				}
			});
		     }
		}
	});
	
	   
		
//		
//		
//	    }
//	 
//        });
	//while (login_semaphore == 1) {
	//    sleep(100);
    }
        
        //$('input[name=filter_button]').click(function() {
        //    filter_host($('input[name=host_filter_input]').val());
        //});
        
    $('input[name=host_filter_input]').keyup(function() {
        filter_host(this.value);
    });
	
    $('input[name=item_filter_input]').keyup(function() {
	filter_item(this.value);
    });
        
    $('#host_list').change(function() {
        var hostIds = [];
        SelectedItems.length = 0;
        var hosts = $("#host_list").val();
        var length = hosts.length;
        for (var i=0; i<length; i++) {
            var hostId = hosts[i];
	    hostIds.push(hostId);
        };
        $.getJSON("/do/ajax_get_items", {hostids:hostIds}, function(data) {
	    //SelectedItems = data;
	    SelectedItems=data;
//		KnownItems.extend(data);
	    KnownItems = $.extend({}, KnownItems, data);
	    var myRe = /\$(\d)/ig;
	    $.each(data, function(key,val) {
		if (val[0].match(myRe) != null ) {
		    a=expanddollars(val[0],val[1]);
		    SelectedItems[parseInt(key)][0]=a;
		}
//				    SelectedItems=data;    
	    });
	    filter_item($('input[name=item_filter_input]').val());
	});
    });
	
    function addImageCallBacks(obj){
	obj.find("img.closeImg").click(function (){
	    obj.detach();
	});
	obj.find("img.editImg").click(function (){
	    $('<span class="warnMsg">This action will reset all selected data except WorkSpace</span>').appendTo('#graph_preview');
	    	    $('#graph_preview').dialog({
		modal: true,
		buttons: {
		    Proceed: function() {
			$(this).dialog( "close" );
			EditGraph(obj);
			
		    },
		    Close: function() {
			$(this).find("span.warnMsg").detach();
			$(this).dialog( "close" );
		    }
		},
		height: "auto",
		width: "auto",
		close: function( event, ui ) {$(this).find("span.warnMsg").detach();}
	    });
	});
    }
	
    function GenerateFastColors() {
	var ColorStr="<span class=\"fcolors\" title=\"Set color\">";
	var fastColors = ["ED1144","ED11D0","7F11ED","1118ED","11E9ED","11ED48","F7F30A","F7890A"];
	for (cindex=0;cindex<fastColors.length;++cindex){
	    ColorStr=ColorStr+'<span class="fcolor" style="color:#'+fastColors[cindex]+'">&#9632;</span>';
	};
        ColorStr=ColorStr+"</span>";
        return ColorStr;
    }
	
    $('#draw').click(function(){
	if ($("#item_container .drag").length == 0)
	{
	    alert("Add items first!!");
	    return;
	}
	graph_url = generate_graph_url();
//	graph_url=graph_url.replace(/"/g, '&quot;');
//	graph_url=graph_url.replace(/\+/g, '%2b');
	$('<div class="resizeDiv" id="GraphImg'+ImgId+'"><input type=hidden name="graph_url" value="'+graph_url+'"><img class="graph_image" src="'+graph_url+
	  '"><img class="editImg image_buttons" src="/img/edit.png"><img class="closeImg image_buttons" src="/img/close.png"></div>').appendTo('#workspace').draggable({ snap: true, cancel:".image_buttons"})
	.find("img.graph_image")
	.load(function (){
	    $(this).parent().css({width:this.width,height:this.height});
	    $(this).parent().resizable({helper: "ui-resizable-helper"});
	    $(this).css({width:"100%",height:"100%"});
	    $(this).parent().unblock();
	    addImageCallBacks($(this).parent());
	})
	.error(function (){
				    $(this).parent().append('<h2>Image load error</h2>');
				    addImageCallBacks($(this).parent());
				    $(this).parent().draggable({ snap: true, cancel:".image_buttons"});
				    $(this).parent().unblock();
				    $(this).parent().css({'background-color':'red'});
				})
	.parent().block({ 
	    message: '<h3>Loading image...</h3><span><img class="closeBlk image_buttons" src="/img/close.png"></span>', 
	    css: { border: '3px solid #a00' } 
	});
	ImgId++;
    });
	
    $("#do_graph_preview").click(function(){
	if ($("#item_container .drag").length == 0){
	    alert("Add items first!!");
	    return;
	}
	graph_url = generate_graph_url();
	graph_url=graph_url.replace(/"/g, '&quot;');
	graph_url=graph_url.replace(/\+/g, '%2b');
	$('<img class="preview_image" src="'+graph_url+'">').appendTo('#graph_preview').load(function (){
	    $('#graph_preview').css({width:this.width,height:this.height});
	    $('#graph_preview').dialog("option","height" , "auto");
	    $('#graph_preview').dialog("option","width" , "auto");
	    $('#graph_preview').unblock();
	});
	$('#graph_preview').block({ 
	    message: '<h3>Loading image</h3>', 
	    css: { border: '3px solid #a00' } 
	});
	$('#graph_preview').dialog({
	    modal: true,
	    buttons: {
		Close: function() {
		    $('#graph_preview').dialog( "close" );
		}
	    },
	    height: 600,
	    width: 800,
	    close: function( event, ui ) {$(this).find("img.preview_image").detach();}
	});
    });

    $('#show_url').click(function(){
	   if ($("#item_container .drag").length == 0)
       {
	   alert("Add items first!!");
	   return;
       }
       graph_url = generate_graph_url();
       copyToClipboard(graph_url);
//		    alert(graph_url);
    });
	 
    function generate_graph_url () {
	url_str = "";
	$("#item_container .drag").each(function( index ) {
	    a=$(this).find("input[name=itemid]").val(); 
	    b=$(this).find(".select_color").css("background-color");
	    c=$(this).find("select :selected").val();
//	    p_str="host[]="+AllHosts[KnownItems[a][2]]+"&item[]="+KnownItems[a][1]+"&color[]="+b+"&drawtype[]="+c+"&";
	    p_str="itemid[]="+a+"&color[]="+b+"&drawtype[]="+c+"&";
	    url_str=url_str+p_str;
	});
	d=$('#graph_options').find("input[name=graph_height]").val();
	d=d.replace(/[\D]/g, '');
	if (d == "") {d=300;}
	e=$('#graph_options').find("input[name=graph_width]").val();
	e=e.replace(/[\D]/g, '');
	if (e == "") {e=800;}
	f=$('#graph_options').find("input[name=graph_date]").val();
	if (f == "") {
	    f="";
	}
	else {
	    f=f.replace(/[\-|\s|:|\D]/g, '');
	    if (f.length != 12) {
		f="";
	    }
	    else {
		f="&stime="+f+"00";
	    }
	};
	g=$('#graph_options').find("input[name=graph_period]").val();
	g=g.replace(/[\D]/g, '');
	if (g == "") {g=10800;} else {g=g*3600;}
	if ($('#graph_options').find("input[name=graph_legend]").prop("checked")) {h="legend=1";} else {h="legend=0";}
	if ($("select[name=graph_yaxismax] :selected").val()=="1") {
	    i=$("input[name=yaxismax]").val();
	    i=i.replace(/[^\d\.]/g, '');
	    i="&ymax_type=1&yaxismax="+i;
	}
	else
	{
	    i="";
	}
	if ($("select[name=graph_yaxismin] :selected").val()=="1") {
	    j=$("input[name=yaxismin]").val();
	    j=j.replace(/[^\d\.]/g, '');
	    j="&ymin_type=1&yaxismin="+j;
	}
	else
	{
	    j="";
	}
	k=$('select[name=graph_type] :selected').val();
	if ($('#graph_options').find("input[name=graph_triggers]").prop("checked")) {l="&showtriggers=1";} else {l="&showtriggers=0";}
	if ($('#graph_options').find("input[name=graph_name]").val() == ""){
	    m='';
	}
	else{
	    m='&name='+$('#graph_options').find("input[name=graph_name]").val();
	}
	
	graph_url="http://"+CurServer+".ringcentral.com/zab_chart2.php?"+url_str+h+f+i+j+"&height="+d+"&width="+e+"&period="+g+"&graphtype="+k+l+m;
	return graph_url;
    }
	
    function copyToClipboard (text) {
	window.prompt ("Copy to clipboard: Ctrl+C, Enter", text);
    }
	
    function filter_host(filter_str) {
	var groups = [];
	var re = new RegExp(filter_str, "i");
	$("#host_list").val("");
//	        AllHosts.sort(function(a,b) {
////		return a.val - b.val;
//	       if(a.value > b.value){
//	            return -1;
//	       }
//	        else if(a.value < b.value){
//	        return 1;
//	       } 
//	       return 0;
//		});
//	AllHosts_rev.sort();
	$.each(AllHosts, function(key,val) {
	    if (val[0].match(re) != null ) {
		if (val[1]== "1") {
		    groups.push('<option name="'+val[0]+'" value="'+key+'" class=\"optionRed\">'+val[0]+'</option>');
		}
		else{
		    groups.push('<option name="'+val[0]+'" value="'+key+'">'+val[0]+'</option>');
		}
	    }
//   groups.sort();
	});
    
	$("#host_list").html(groups.join(''));
    }
	
    function filter_item(filter_str) {
	var groups = [];
	var re = new RegExp(filter_str, "i");
	$("#item_list").val("");
	$.each(SelectedItems, function(key,val) {
//		console.log(key);
	    if (val[0].match(re) != null ) {
//		    var myRe = /\$(\d)/ig;
//		    if (val[0].match(myRe) != null ) {
//			val[0]=expanddollars(val[0],val[1]);
//		    }
//		    val[0] = expanddollars(val[0],val[1]);
		if (+AllHosts[parseInt(val[2])][1]== "1") {
		    groups.push('<option value="'+key+'" class=\"optionRed\">('+AllHosts[parseInt(val[2])][0]+') '+val[0]+'</option>');
		}    
		else if(val[3]=="1"){    
		    groups.push('<option value="'+key+'" class=\"optionRed\">('+AllHosts[parseInt(val[2])][0]+') '+val[0]+'</option>');
		}
		else if(val[3]=="3"){    
		    groups.push('<option value="'+key+'" class=\"optionStr\">('+AllHosts[parseInt(val[2])][0]+') '+val[0]+'</option>');
		}
		else if(val[4]=="0"){    
		    groups.push('<option value="'+key+'" class=\"optionGray\">('+AllHosts[parseInt(val[2])][0]+') '+val[0]+'</option>');
		}
		else{
		    groups.push('<option value="'+key+'">('+AllHosts[parseInt(val[2])][0]+') '+val[0]+'</option>');
		}
	    }    
	});
                
	    
	groups.sort();
	$("#item_list").html(groups.join(''));
    }
	
    function expanddollars(namestring,itemkey) {
	var myRe = /\[([^\[]*)\]/ig;
	itemkey = itemkey.replace(/"/g, "");
	itemkey = itemkey.replace(/'/g, ""); 
	var rearr = myRe.exec(itemkey);
	var itemkeyarr = rearr[1].split(","); 
	myRe = /\$(\d)/ig;
	var rearr2 = myRe.exec(namestring);
	if (rearr2['index']>=0) {
		var re = new RegExp('$$'+rearr2[1], "ig");
		namestring=namestring.replace(rearr2[0],itemkeyarr[rearr2[1]-1])
	};
	if (namestring.match(myRe) != null ) {
		namestring=expanddollars(namestring,itemkey)
	}
	else{
//		alert (namestring);
//
	};
	return (namestring);
    }
	
    $.fn.mydraggable = function(){
	function disableSelection(){
		return false;
	}
	$(".drag").mousedown(function(e){
	    if($(e.target).is("select")) return;
	    if($(e.target).is("span.select_color")) return;
	    var drag = $(this);
	    var posParentTop = drag.parent().offset().top;
	    var posParentBottom = posParentTop + drag.parent().height();
	    var posOld = drag.offset().top;
	    var posOldCorrection = e.pageY - posOld;
	    drag.css({'z-index':2, 'background-color':'#eeeeee'});
	    var mouseMove = function(e){
	        var posNew = e.pageY - posOldCorrection;
	        if (posNew < posParentTop){
		    drag.offset({'top': posParentTop});
	    	    if (drag.prev().length > 0 ) {
			drag.insertBefore(drag.prev().css({'top':-drag.height()}).animate({'top':0}, 100));
		    }
		}
		else if (posNew + drag.height() > posParentBottom){
		    drag.offset({'top': posParentBottom - drag.height()});
		    if (drag.next().length > 0 ) {
		        drag.insertAfter(drag.next().css({'top':drag.height()}).animate({'top':0}, 100));
		    }
		}
		else {
		    drag.offset({'top': posNew});
		    if (posOld - posNew > drag.height() - 1){
		        drag.insertBefore(drag.prev().css({'top':-drag.height()}).animate({'top':0}, 100));
		        drag.css({'top':0});
		        posOld = drag.offset().top;
		        posNew = e.pageY - posOldCorrection;
		        posOldCorrection = e.pageY - posOld;
		    }
		    else if (posNew - posOld > drag.height() - 1){
		        drag.insertAfter(drag.next().css({'top':drag.height()}).animate({'top':0}, 100));
		        drag.css({'top':0});
		        posOld = drag.offset().top;
		        posNew = e.pageY - posOldCorrection;
		        posOldCorrection = e.pageY - posOld;
		    }
		}
	    };
	    var mouseUp = function(){
	        $(document).off('mousemove', mouseMove).off('mouseup', mouseUp);
	        $(document).off('mousedown', disableSelection);
	        drag.animate({'top':0}, 100, function(){
	            drag.css({'z-index':1, 'background-color':'transparent'});
	        });
	    };
	    $(document).on('mousemove', mouseMove).on('mouseup', mouseUp).on('contextmenu', mouseUp);
	    $(document).on('mousedown', disableSelection);
	    $(window).on('blur', mouseUp);
	});
    }

////////////////////////////////
// Main onclick handler
////////////////////////////////
    $("body").click(function(e) {
        if($(e.target).is(".rem_item")) {
             $(e.target).parent().parent().detach();
        }
        if($(e.target).is(".fcolor")) {
	     var fcolor = rgb2hex($(e.target).css("color"));
	     $(e.target).parent().parent().find(".select_color").css("background-color", fcolor);
	}
	if($(e.target).is("input[name=zserver]")) {
	    var zserver = $(e.target).val();
	     ZabServerLoad (zserver,"");
	}
	if($(e.target).is("#itemlist_clear")) {
	    $('#item_container').empty();
	}
	if($(e.target).is("#cancel_edit")) {
	    $("input[name=edit_id]").val("");
	    $("#edit_panel").css({"display":"none"});
	    $('#item_container').empty();
	}
	if($(e.target).is("#save_graph")) {
	    if ($("#item_container .drag").length == 0){
		alert("Add items first!!");
		return;
	    }
	    graph_url = generate_graph_url();
	    //alert($('input[name=edit_id]').val());
	    var MyGraph_id=$('input[name=edit_id]').val();
	    $('#'+$('input[name=edit_id]').val()+'').block({ 
		message: '<h3>Loading image</h3>', 
		css: { border: '3px solid #a00' } 
	    });
	    //$("#GraphImg0").empty();
	    $('#'+$('input[name=edit_id]'+'').val()).find('img.graph_image').attr("src",graph_url).load(function (){
		$('#'+$('input[name=edit_id]').val()+'').unblock()
	    });
	    $("#edit_panel").css({"display":"none"});
	    $('#item_container').empty();
	    $("input[name=edit_id]").val("");
	}
	if($(e.target).is(".select_color")) {
	    $(e.target).ColorPicker({
		color: '#05ED05',
		onShow: function (colpkr) {
		    $(colpkr).fadeIn(500);
		    return false;
		},
		onHide: function (colpkr) {
		    $(colpkr).fadeOut(500);
		    return false;
		},
		onChange: function (hsb, hex, rgb) {
		    $(e.target).css('backgroundColor', '#' + hex);
		}    
	    });
	}
	if($(e.target).is("#project_save")){
	    project_save('save');
	}
	if($(e.target).is("#project_fork")){
	    project_save('fork');
	}
	if($(e.target).is("#project_new")){
	    window.location = "/";
	}
	if($(e.target).is("#project_delete")){
	    project_delete();
	}
	if($(e.target).is("#dash_view")){
	    window.open("/"+$('#screen_id').val()+"/dash/",'_newtab');
	}
	if($(e.target).is("input[name=signin]")){
	    doLogin();
	}
	if($(e.target).is('#add')){
	    var fcolors= "";
	    fcolors=GenerateFastColors();
	    var array_itemids=$('#item_list :selected').map(function(){
		var itemid=$(this).val();
		switch(SelectedItems[itemid][3]) {
		    case "0":{
			icolor="#000000";
			if (SelectedItems[itemid][4]=="0"){
			    icolor="#C8C8C8";
			}
			;break;
		    }
		    case "1":{icolor="#F70C0C";break;}
		    case "3":{icolor="#CD0074";break;}
		}
		var colorsarray = Array('178BCC','3D7899','24FFD8','FF7864','CC0812','25CC52','48995E','7EFF35','D875FF','6716CC','CCC45A','999670','FFDB78','B8DBFF','4BACCC','CC6342','996C5E','FF5A77','A6FF9A','7CCC34');
		var bgcolor = colorsarray[Math.floor(Math.random()*colorsarray.length)];
		var newdiv = "<div class=\"drag\"><input type=\"hidden\" name=\"itemid\" value=\""+$(this).val()+"\"><span style=\"color:"+icolor+"\">"+$(this).text()+
		"</span><span class=\"line_options\"><span class=\"line_type\"><select style=\"line_type_select\"><option value=0>Line</option><option value=1>Filled region</option><option value=2>Bold line</option>"+
		"<option value=3>Dot</option><option value=4>Dashed line</option></select></span><span class=\"select_color\" style=\"background-color: #"+bgcolor+"\" title=\"Select color\"> </span>"+fcolors+"<span class=\"rem_item\" title=\"Remove item\">&times;</span></span>";
		$('#item_container').append(newdiv);
	    });
	    $('.drag').mydraggable();
	}
	if($(e.target).is('input[name=logout]')){
	    $.ajax({
		type: "GET",
		url: "/do/logout",
		cache: false,
		success: doLogout,
		dataType: 'json'
	    });
	}
	if($(e.target).is('input[name=load_project]')){
	    $.ajax({
		type: "GET",
		url: "/do/fetchprojects",
		cache: false,
		success: doFetchProjects,
		dataType: 'json'
	    });
	}
	if($(e.target).is('#close_projlinks')){
	    $('#project_list').css({display:"none"});
	}
	if($(e.target).is("img.closeBlk")){
	    $(e.target).parent().parent().parent().unblock();
	};
    });
    
/////////////////////////////////
// End of main onclick handler
/////////////////////////////////

    $("select[name=graph_yaxismin]").change(function() {
	    if ($("select[name=graph_yaxismin] :selected").val()=="1") {
		$("input[name=yaxismin]").css({"display":"inline"})
	    }
	    else
	    {
		$("input[name=yaxismin]").css({"display":"none"})
	    }
    });
    $("select[name=graph_yaxismax]").change(function() {
	    if ($("select[name=graph_yaxismax] :selected").val()=="1") {
		$("input[name=yaxismax]").css({"display":"inline"})
	    }
	    else
	    {
		$("input[name=yaxismax]").css({"display":"none"})
	    }
    });
    
//    $("#signin").click(function() {
//	var username = $("#username").val();
//	var password = $("#password").val();
//	$.post("login.cgi", { rm:"login", username:username, password:password},function(username){
//	    $("#logged_in").html("Logged in as: " + username);
//	});
//    });
    
    function EditGraph(obj) {
	var param_pair = [];
	var param_pairs = [];
	var split_arr = [];
	var hosts = [];
	var items = [];
	var colors = [];
	var drawtypes = [];
	var legend = "";
	var height = "";
	var width = "";
	var period = "";
	var stime = "";
	var ymin_type = "";
	var ymax_type = "";
	var name = "";
	var showtriggers="";
	var graphtype="";
	var yaxismax="";
	var yaxismin="";
	$("input[name=edit_id]").val(obj.attr("id"));
	url_str=obj.find('input[name=graph_url]').val();
	url_split=url_str.match(/.+:\/\/(\w+)\.[^\?]+\?(.*)/);
	zbx_srv=url_split[1];
	param_pairs=url_split[2].split('&');
	for (var key in param_pairs) {
	   split_arr=param_pairs[key].match(/([^=]+)=(.*)/);
	   param_pair.push([split_arr[1],split_arr[2]]);
	}
	for (var i in param_pair) {
	    switch (param_pair[i][0]) {
		//case "host[]":
		//    hosts.push(param_pair[i][1]);
		//    break
		//case "item[]":
		//    items.push(param_pair[i][1]);
		//    break
		case "itemid[]":
		    items.push(param_pair[i][1]);
		    break
		case "color[]":
		    colors.push(param_pair[i][1]);
		    break
		case "drawtype[]":
		    drawtypes.push(param_pair[i][1]);
		    break
		case "legend":
		    legend = param_pair[i][1];
		    break
		case "stime":
		    stime = param_pair[i][1];
		    break
		case "height":
		    height = param_pair[i][1];
		    break
		case "width":
		    width = param_pair[i][1];
		    break
		case "period":
		    period = param_pair[i][1];
		    break
		case "name":
		    name = param_pair[i][1];
		    break
		case "showtriggers":
		    showtriggers = param_pair[i][1];
		    break
		case "graphtype":
		    graphtype = param_pair[i][1];
		    break
		case "ymax_type":
		    ymax_type = param_pair[i][1];
		    break
		case "ymin_type":
		    ymin_type = param_pair[i][1];
		    break
		case "yaxismax":
		    yaxismax = param_pair[i][1];
		    break
		case "yaxismin":
		    yaxismin = param_pair[i][1];
		    break
		default:
		    alert("Found unparsed parameter "+param_pair[i][0]+" with value "+param_pair[i][1]+", please send bug to zabbix@nordigy.ru" );
		    break
	    };
	};
	$('input[name=graph_height]').val(height);
	$('input[name=graph_width]').val(width);
	$('input[name=graph_period]').val(period/3600);
	if (stime != "") {
	    stime=stime.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})\d{2}/,"$1-$2-$3 $4:$5");
	}
	$('input[name=graph_date]').val(stime);
	$('input[name=graph_name]').val(name);
	$('select[name=graph_type]').val(graphtype).prop('selected',true);
	if (ymin_type == "1") {
	    $('select[name=graph_yaxismin]').val(ymin_type).prop('selected',true);
	    $("input[name=yaxismin]").css({"display":"inline"});
	    $("input[name=yaxismin]").val(yaxismin);
	}
	else{
	    $('select[name=graph_yaxismin]').val("0").prop('selected',true);
	    $("input[name=yaxismin]").css({"display":"none"})
	}
	if (ymax_type == "1") {
	    $('select[name=graph_yaxismax]').val(ymax_type).prop('selected',true);
	    $("input[name=yaxismax]").css({"display":"inline"});
	    $("input[name=yaxismax]").val(yaxismax);
	}
	else{
	    $('select[name=graph_yaxismax]').val("0").prop('selected',true);
	    $("input[name=yaxismax]").css({"display":"none"})
	}
	if (legend == "1"){
	    $('input[name=graph_legend]').prop("checked",true);
	}
	else if (legend == "") {
	     $('input[name=graph_legend]').prop("checked",true);
	}
	else {
	    $('input[name=graph_legend]').prop("checked",false);
	}
	if (showtriggers == "1"){
	    $('input[name=graph_triggers]').prop("checked",true);
	}
	else if (showtriggers == "") {
	     $('input[name=graph_triggers]').prop("checked",true);
	}
	else {
	    $('input[name=graph_triggers]').prop("checked",false);
	}
	//async=$.getJSON("do/ajax_get_all_hosts/", function(data) {
	//	    AllHosts = data;
	//	    AllHosts_rev = {};
	//	    $.each(AllHosts, function(key,val) {
	//		AllHosts_rev[val]= key;
	//	    });
	//	    login_semaphore=0;
	//	    SelectedItems = [];
	//	    $("#item_list").empty();
	//	    filter_host($('input[name=host_filter_input]').val());
	//	});
//	$.when(async).done(function(){
//	ZabServerLoad(zbx_srv,"noloadhosts");
	ZabServerLoad(zbx_srv,"loadlist",[items,colors,drawtypes]);
	//ZabServerLoad(zbx_srv,"noloadhosts");
	   // LoadGraphItemList(items,colors,drawtypes);
//	    });
	$("#edit_panel").css({"display":"block"});
    };
    
    function LoadGraphItemList(gr_items,gr_colors,gr_drawtypes) {
	$.getJSON("/do/ajax_get_items_by_itemids", {itemids:gr_items}, function(data) {
	    SelectedItems=data;
	    KnownItems = $.extend({}, KnownItems, data);
	    var myRe = /\$(\d)/ig;
	    $.each(data, function(key,val) {
		if (val[0].match(myRe) != null ) {
		    a=expanddollars(val[0],val[1]);
		    SelectedItems[parseInt(key)][0]=a;
		}
	    });
	    var fcolors= "";
	    var hcolor="";
	    var icolor="";
	    fcolors=GenerateFastColors();
	    for (var i in gr_items){
		switch(AllHosts[SelectedItems[gr_items[i]][2]][1]) {
		    case "0":{hcolor="#000000";break;}
		    case "1":{hcolor="#F70C0C";break;}
		}
		switch(SelectedItems[gr_items[i]][3]) {
		    case "0":{
			icolor="#000000";
			if (SelectedItems[gr_items[i]][4]=="0"){
			    icolor="#C8C8C8";
			}
			;break;
		    }
		    case "1":{icolor="#F70C0C";break;}
		    case "3":{icolor="#CD0074";break;}
		}
		gr_items[i]
		gr_colors[i]
		gr_drawtypes[i]
//		var newdiv = "<div class=\"drag\"><input type=\"hidden\" name=\"itemid\" value=\""+gr_items[i]+"\">"+"(<span style=\"color:"+hcolor+"\">"+AllHosts[SelectedItems[gr_items[i]][2]][0]+"</span>):&nbsp;<span style=\"color:"+hcolor+"\">"+SelectedItems[gr_items[i]][0]+"</span>"+
//    "<span class=\"line_options\"><span class=\"line_type\"><select style=\"line_type_select\"><option value=0>Line</option><option value=1>Filled region</option><option value=2>Bold line</option><option value=3>Dot</option><option value=4>Dashed line</option></select></span><span class=\"select_color\" style=\"background-color: #"+
//    gr_colors[i]+"\" title=\"Select color\"> </span>"+fcolors+"<span class=\"rem_item\" title=\"Remove item\">&times;</span></span>";
    		var newdiv = "<div class=\"drag\"><input type=\"hidden\" name=\"itemid\" value=\""+gr_items[i]+"\">"+"(<span style=\"color:"+hcolor+"\">"+AllHosts[SelectedItems[gr_items[i]][2]][0]+"</span>):&nbsp;<span style=\"color:"+icolor+"\">"+SelectedItems[gr_items[i]][0]+"</span>"+
    "<span class=\"line_options\"><span class=\"line_type\"><select style=\"line_type_select\"><option value=0>Line</option><option value=1>Filled region</option><option value=2>Bold line</option><option value=3>Dot</option><option value=4>Dashed line</option></select></span><span class=\"select_color\" style=\"background-color: #"+
    gr_colors[i]+"\" title=\"Select color\"> </span>"+fcolors+"<span class=\"rem_item\" title=\"Remove item\">&times;</span></span>";
	    $(newdiv).appendTo('#item_container').find('select option[value='+gr_drawtypes[i]+']').attr("selected","selected");
	    }
	    $('.drag').mydraggable();
	});
	
    }
    
    function project_delete(){
	data_json = JSON.stringify({'screen_id':$('#screen_id').val()});
	$.ajax({
		type: "POST",
		url: "/do/delete",
		data:data_json,
		success: onDeleteSuccess,
		dataType: 'json'
	    });
    }
    
    //$('#project_save').click(function()
    function project_save(type){
	var item_arr = [];
	$('#workspace .resizeDiv').each(function(index){
	    item_width=$(this).width();
	    item_height=$(this).height();
	    item_left=$(this).position().left;
	    item_top=$(this).position().top;
	    item_img=$(this).find('input[name=graph_url]').val();
//	    item_img=$(this).find("img .graph_image").attr('src');
	    item_arr.push({'item_width':item_width,'item_height':item_height,'item_left':item_left,'item_top':item_top,'item_img':item_img});
	});
	var project_name = "";
	if ($('#project_name').val()=="") {
	    project_name = $('#screen_name').val();
	}
	else{
	    project_name=$('#project_name').val();
	}
	data = {'screen_name':project_name,'screen_id':$('#screen_id').val(),'data':item_arr};
	data_json = JSON.stringify(data);
	if (type=='save') {
	    $.ajax({
		type: "POST",
		url: "/do/save",
		data:data_json,
		success: onSaveSuccess,
		dataType: 'json'
	    });
	}
	else if (type=='fork') {
	    $.ajax({
		type: "POST",
		url: "/do/fork",
		data:data_json,
		success: onForkSuccess,
		dataType: 'json'
	    });	
	}
	else{
	    alert("Something wrong!!!");
	}
    };
    
    function onForkSuccess(data){
	if (data['error']==1) {
	    alert("Fork error: "+data['error_str']);
	}
	else{
	    if ($('#screen_id').val() == data['screen_id']) {
		alert("Screen forked");
		$('#screen_name').val(data['screen_name']);
		document.title = "Graph tool :: "+data['screen_name'];
	    }
	    else {
		alert("Page should be reloaded with new token...");
		window.location = "/"+data['screen_id']+"/view/";
	    }
	}
    }
    
    function onDeleteSuccess(data) {
	if (data['error']==1) {
	    alert("Delete error: "+data['error_str']);
	}
	else{
	    alert("Project deleted, new project started");
	    window.location = "/";
	}
    }
    
    function onSaveSuccess(data){
	if (data['error']==1) {
	    alert("Save error: "+data['error_str']);
	}
	else{
	    if ($('#screen_id').val() == data['screen_id']) {
		alert("Screen saved");
		$('#screen_name').val(data['screen_name']);
		document.title = "Graph tool :: "+data['screen_name'];
	    }
	    else {
		alert("Page should be reloaded with new token...");
		window.location = "/"+data['screen_id']+"/view/";
	    }
	}
    }
    
    function FetchScreen(url){
//	alert("Fetch "+url);
	$.ajax({url:"/"+url+"/fetch/",
	    dataType: 'json',
	    async: false,
	    success: function(data){
		if (data['error']==1) {
		    alert("Fetch error: "+data['error_str']);
		}	
		else{
		    if ($('#screen_type').val()=="view") {
			document.title = "Graph tool :: "+data['scr_name'];
			$('#screen_name').val(data['scr_name']);
			$('#screen_id').val(url);
			$.each(data['data'], function(key,val) {
    
				myheight=data['data'][key]['height'];
				mywidth=data['data'][key]['width'];
				myleft=data['data'][key]['left'];
				mytop=data['data'][key]['top'];
				myurl=data['data'][key]['url'];
			    //    var options = {
			    //	"my": mytop,
			    //	"at": myleft,
			    //	"of": "#workspace"
			    //    };
				$('<div class="resizeDiv" id="GraphImg'+ImgId+'"><input type=hidden name="graph_url" value="'+myurl+'"><img class="graph_image" src="'+myurl+
				'"><img class="editImg image_buttons" src="/img/edit.png"><img class="closeImg image_buttons" src="/img/close.png"></div>').appendTo('#workspace')

    			    .css({width:mywidth,height:myheight,left:myleft,top:mytop}).find("img.graph_image")
				.load(function (){
    
    //$("#GraphImg"+ImgId+"").position(options);
    //				$(this).parent().offset({ top: offset.top, left: offset.left})
				    
				    $(this).parent().draggable({ snap: true, cancel:".image_buttons"});
				    $(this).parent().resizable({helper: "ui-resizable-helper"});
				    $(this).css({width:"100%",height:"100%"});
//				    $(this).parent().css({width:mywidth,height:myheight,left:myleft,top:mytop});
				    $(this).parent().unblock();
				    addImageCallBacks($(this).parent());
				})
				.error(function (){
				    $(this).parent().append('<h2>Image load error</h2>');
				    addImageCallBacks($(this).parent());
				    $(this).parent().draggable({ snap: true, cancel:".image_buttons"});
				    $(this).parent().unblock();
				    $(this).parent().css({'background-color':'red'});
				})
				.parent().block({
				    onOverlayClick: $.unblock,
				    message: '<h3>Loading image...</h3><span><img class="closeBlk image_buttons" src="/img/close.png"></span>', 
				    css: { border: '3px solid #a00' } 
				});
				ImgId++;				
			});
		    }
		    else if (($('#screen_type').val()=="dash")) {
			document.title = "Dasboard :: "+data['scr_name'];
			$('#screen_name').val(data['scr_name']);
			$('#screen_id').val(url);
			$.each(data['data'], function(key,val) {
				myheight=data['data'][key]['height'];
				mywidth=data['data'][key]['width'];
				myleft=data['data'][key]['left'];
				mytop=data['data'][key]['top'];
				myurl=data['data'][key]['url'];
			    //    var options = {
			    //	"my": mytop,
			    //	"at": myleft,
			    //	"of": "#workspace"
			    //    };
				$('<div class="resizeDiv" id="GraphImg'+ImgId+'" ><input type=hidden name="graph_url" value="'+myurl+'"><img class="graph_image" src="'+myurl+
				'>"</div>').appendTo('#workspace')
			    
    			    .css({width:mywidth,height:myheight,left:myleft,top:mytop})
    .find("img.graph_image")
				
				
			      
				.load(function (){
    
    //$("#GraphImg"+ImgId+"").position(options);
    //				$(this).parent().offset({ top: offset.top, left: offset.left})
				    
				    //$(this).parent().draggable({ snap: true, cancel:".image_buttons"})
				    //$(this).parent().resizable({helper: "ui-resizable-helper"});
				    $(this).css({width:"100%",height:"100%"});
//				    $("#GraphImg"+ImgId+"").css({width:mywidth,height:myheight,left:myleft,top:mytop});
//				    $(this).parent().unblock();
				    //addImageCallBacks($(this).parent());
//		})
//				.parent().block({ 
//				    message: '<h3>Loading image...</h3><span><img class="closeImg image_buttons" src="/img/close.png"></span>', 
//				    css: { border: '3px solid #a00' } 
				});
				ImgId++;				
			});

		    }
		}
	    }
	});
    }
    
    function doLogin() {
	//username=$('#username').val();
	//password=$('#password').val();
	data = {'username':$('#username').val(),'password':$('#password').val()};
	data_json = JSON.stringify(data);
	$.ajax({
	    type: "POST",
	    url: "/do/login",
	    data:data_json,
	    success: onLoginSuccess,
	    dataType: 'json'
	});
	
    }
    
    function onLoginSuccess(data) {
	if (data['error']==1) {
	    alert("Login error: "+data['error_str']);
	}
	else{
	    //$('#user_auth').css({'visibility':"hidden"});
	    //$('#user_bar').css({'visibility':"visible"});
	    $('#user_auth').css({'display':"none"});
	    $('#user_bar').css({'display':"block"});
	    $('#user_welcome').html("Welcome "+data['username'][0]);
	    $('#project_save').prop('disabled',false);
	    if($('#screen_id').val()!=""){
		$('#project_fork').prop('disabled',false);
		$('#project_delete').prop('disabled',false);
		$('#dash_view').prop('disabled',false);
	    }
//	    alert ("login success");
	}
//	return 1;
    }
    
    function CheckIfLogged(data) {
	if(data['authenticated']==1){
	    $('#user_welcome').html("Welcome "+data['username'][0]);
	    //$('#user_bar').css({'visibility':"visible"});
	    //$('#user_auth').css({'visibility':"hidden"});
	    $('#user_bar').css({'display':"block"});
	    $('#user_auth').css({'display':"none"});
	    $('#project_save').prop('disabled',false);
	    if($('#screen_id').val()!=""){
		$('#project_fork').prop('disabled',false);
		$('#project_delete').prop('disabled',false);
		$('#dash_view').prop('disabled',false);
	    }
	}
	else{
	    //$('#user_auth').css({'visibility':"visible"});
	    //$('#user_bar').css({'visibility':"hidden"});
	    $('#project_fork').prop('disabled',true);
	    $('#project_delete').prop('disabled',true);
	    $('#project_save').prop('disabled',true);
	    $('#user_auth').css({'display':"block"});
	    $('#user_bar').css({'display':"none"});
	}
    }
    
    function doLogout(data) {
	if (data['error']==1) {
	    alert("Logout error: "+data['error_str']);
	}
	else{
	    //$('#user_auth').css({'visibility':"visible"});
	    //$('#user_bar').css({'visibility':"hidden"});
	    $('#user_auth').css({'display':"block"});
	    $('#user_bar').css({'display':"none"});
	    $('#project_fork').prop('disabled',true);
	    $('#project_delete').prop('disabled',true);
	    $('#project_save').prop('disabled',true);
	    }
    }
    
    function doFetchProjects(data) {
	if (data['error']==1) {
	    alert("Fetch error: "+data['error_str']);
	}
	else{
	    //$('#user_auth').css({'visibility':"hidden"});
	    //$('#user_bar').css({'visibility':"visible"});
	    if (data['data'].length > 0) {
		var links_content='<div id="close_projlinks">&times;</div><ul id=projlinks>';
		$.each(data['data'], function(projid,proj){
		    tinyurl=proj['tiny'];
		    projname=proj['name'];
		    links_content+="<li class=\"projli\"><a class=\"projlink\" href=\"/"+tinyurl+"/view/\">"+projname+"</a></li>";
		});
		links_content+='</ul>';
		$("#project_list").html(links_content);
	    }
	    else{
		$("#project_list").html("<div id=\"close_projlinks\">&times;</div>List empty.");
		$("#project_list").css({height:"30px"});
	    }
	    if ( $("#project_list" ).is( ":hidden" ) ) {
		$( "#project_list" ).slideDown( "slow" );
	    } else {
		    $("#project_list" ).hide();
	    }
//	    alert ("login success");
	}
    }
    
    if ($('#onload').val()!="none") {
	FetchScreen($('#onload').val());
    }
    
    $.ajax({
	type: "GET",
	url: "/do/islogined",
	cache: false,
	success: CheckIfLogged,
	dataType: 'json'
    });
});
