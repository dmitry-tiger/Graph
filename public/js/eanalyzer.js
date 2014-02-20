$(document).ready(function() {
   var UserAuthenticated=true;
   $('*[name=from_date]').appendDtpicker();
   $('*[name=from_date]').val("");
   $('*[name=to_date]').appendDtpicker();
   $('*[name=to_date]').val("");
   
   $.ajaxSetup({
        beforeSend:function(){
	$.blockUI({ message: '<h3> Loading data...</h3>' });     
        },
        complete:function(){
	    $.unblockUI;
        },

   });
   $(document).ajaxStop(function() {
        $.unblockUI();
   });
   
   function pad(n){return n<10 ? '0'+n : n}
   
   $("body").click(function(e) {
    	 if($(e.target).is("input[name=get_events]")){
	    fGetEvents();
	 }
         if($(e.target).is("input[name=MassCheckbox]")){
	    MassCheckbox(e.target,"all");
	 }
         if($(e.target).is("input[name=MassCheckboxMaintenance]")){
	    MassCheckbox(e.target,"maintenance");
	 }
         if($(e.target).is("input[name=MassCheckboxUndefined]")){
	    MassCheckbox(e.target,"0");
	 }
         if($(e.target).is("input[name=MassCheckboxInformational]")){
	    MassCheckbox(e.target,"1");
	 }
         if($(e.target).is("input[name=MassCheckboxWarning]")){
	    MassCheckbox(e.target,"2");
	 }
         if($(e.target).is("input[name=MassCheckboxCritical]")){
	    MassCheckbox(e.target,"3");
	 }
         if($(e.target).is("input[name=MassCheckboxOutage]")){
	    MassCheckbox(e.target,"4");
	 }
         if($(e.target).is("input[name=MassCheckboxDisaster]")){
	    MassCheckbox(e.target,"5");
	 }
         if($(e.target).is("input[name=grpaph_gen]")){
	    GenerateGraphs();
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
         if($(e.target).is("input[name=signin]")){
	    doLogin();
	 }
         if($(e.target).is("input[name=move_to_tool]")){
	    doMoveToTool();
	 }
   });
    
   function sortObject(o) {
      var sorted = {},
      key, a = [];
  
      for (key in o) {
          if (o.hasOwnProperty(key)) {
                  a.push(key);
          }
      }
  
      a.sort();
  
      for (key = 0; key < a.length; key++) {
          sorted[a[key]] = o[a[key]];
      }
      return sorted;
   }
    
    function fGetEvents() {
        if ($('input[name=from_date]').val()=="" || $('input[name=to_date]').val()=="") {
            alert("Please fill all inputs");
            return;
        }
        data_json = JSON.stringify({from_date:$('input[name=from_date]').val(),to_date:$('input[name=to_date]').val(),zserver:$("#zserver :selected").val()});
        $.ajax({
            type: 'post',
            url: '/do/getevents',
            data:data_json,
            success: onGetEventsSuccess,
            dataType: 'json'
        });
    }
    
    function onGetEventsSuccess(data) {
      if (data['error']==1) {
	    alert("Fetch error: "+data['error_str']);
      }
      $('#events').html("");
//      alert(Object.keys(data).length);
      if (Object.keys(data).length==0) {
         $('#events').html("<h2>No events found in this period</h2>");
         return;
      }
      var sorteddata = sortObject(data);
      var filterstr="Filter:&nbsp;<span style=\"background-color:#FFA700\"><input name=\"MassCheckboxMaintenance\" type=\"checkbox\" checked>Maintenance</span>&nbsp;";
      filterstr+="&nbsp;Trigger severity:&nbsp;<input name=\"MassCheckbox\" type=\"checkbox\" checked>-All&nbsp;<span style=\"background-color:#DBDBDB\"><input name=\"MassCheckboxUndefined\" type=\"checkbox\" checked>Undefined</span>&nbsp;";
      filterstr+="<span style=\"background-color:#BBE2BB\"><input name=\"MassCheckboxInformational\" type=\"checkbox\" checked>Informational</span>&nbsp;";
      filterstr+="<span style=\"background-color:#EFEFCC\"><input name=\"MassCheckboxWarning\" type=\"checkbox\" checked>Warning</span>&nbsp;";
      filterstr+="<span style=\"background-color:#DDAAAA\"><input name=\"MassCheckboxCritical\" type=\"checkbox\" checked>Critical</span>&nbsp;";
      filterstr+="<span style=\"background-color:#FF8888\"><input name=\"MassCheckboxOutage\" type=\"checkbox\" checked>Service Outage</span>&nbsp;";
      filterstr+="<span style=\"background-color:#888888\"><input name=\"MassCheckboxDisaster\" type=\"checkbox\" checked>Disaster</span>";
      $('<div style="display:table-caption">'+filterstr+'</div><div class="eventhead">'+
        '<div class="tablehead"><input name=\"MassCheckbox\" type=\"checkbox\" checked>-All</div><div class="tablehead">Date</div><div class="tablehead">Hosts</div>'+
        '<div class="tablehead">Items</div><div class="tablehead">Triggers</div></div>').appendTo('#events');
      $.each(sorteddata, function(key,val) {
         var ehosts= "";
         var etriggers= "";
         var eitems= "";
         var tcolor = "";
         var newdate = new Date(val['clock']* 1000);
         edate=pad(newdate.getUTCDate())+"-"+pad((newdate.getUTCMonth()+1))+"-"+newdate.getUTCFullYear()+" "+pad(newdate.getUTCHours())+":"+pad(newdate.getUTCMinutes())+":"+pad(newdate.getUTCSeconds())+" UTC";
         $.each(val['hosts'], function(key,val){
            if (val['maintenance']) {
               ehosts+="<span class=\"eitemm\">"+val['name']+"<input type=\"hidden\" name=\"maintenance\" value=\"1\"></span>";
            }
            else{
               ehosts+="<span class=\"eitem\">"+val['name']+"<input type=\"hidden\" name=\"maintenance\" value=\"0\"></span>";
            }
       
         });
         $.each(val['triggers'], function(key,val){
            switch (val['priority']) {
               case "0":
                  tcolor="#DBDBDB";
                  break
               case "1":
                  tcolor="#BBE2BB";
                  break
               case "2":
                  tcolor="#EFEFCC";
                  break
               case "3":
                  tcolor="#DDAAAA";
                  break
               case "4":
                  tcolor="#FF8888";
                  break
               case "5":
                  tcolor="#888888";
                  break
               default:
                  tcolor="#DBDBDB";
                  break
            }
            etriggers+="<span class=\"etrigger\" style=\"background-color:"+tcolor+"\">"+val['description']+'<input type="hidden" name="priority" value="'+val['priority']+'">'+"</span>";
         });
         $.each(val['items'], function(key,val){
            eitems+="<span class=\"eitem\"><input type=\"hidden\" name=\"itemid\" value=\""+key+"\">"+val['name']+"</span>";
         });
         $('<div class="event"><div class="evcb"><input type=\"checkbox\" checked><input type="hidden" value="'+key+'" name="eventid"></div><div class="evdate">'+edate+'</div><div class="evhosts">'+ehosts+
           '</div><div class="evitems">'+eitems+'</div><div class="evtriggers">'+etriggers+'</div></div>').appendTo('#events');
      });
      if (UserAuthenticated){disstate =""}else{disstate="disabled=true"}
      $('#events-footer').html('<div id="eventlistfooter"><input type="button" value="generate graphs" name="grpaph_gen">&nbsp;<input type="button" value="Open in Graph tool" name="move_to_tool" '+disstate+'>&nbsp;Screen name:<input type="text" name="screen_name" placeholder="Unnamed Project"></div>');
      //$('<div id="eventlistfooter"><input type="button" value="generate graphs" name="grpaph_gen">&nbsp;<input type="button" value="Захуярить в тулзу" name="move_to_tool" '+disstate+'>&nbsp;Screen name:<input type="text" name="screen_name"></div>').appendTo('#events');
    }
   
   function MassCheckbox(data,tpriority) {
      //var checked =
      if (data['checked'] == true) {  
      // checked
         $('.event').each(function(){
            if (tpriority=="all") {
               $(this).find('input[type=checkbox]').prop("checked", true);
            }
            else if (tpriority=="maintenance") {
               if ($(this).find('input[name=maintenance]').val()=="1"){
                     $(this).find('input[type=checkbox]').prop("checked", true);
               }
            }
            else{
               if ($(this).find('input[name=priority]').val()==tpriority){
                  $(this).find('input[type=checkbox]').prop("checked", true);
               }
            }
            
         });
      }
      //unchecked
      else{
         $('.event').each(function(){
            if (tpriority=="all") {
               $(this).find('input[type=checkbox]').prop("checked", false);
            }
            else if (tpriority=="maintenance") {
               if ($(this).find('input[name=maintenance]').val()=="1"){
                     $(this).find('input[type=checkbox]').prop("checked", false);
               }
            }
            else{
               if ($(this).find('input[name=priority]').val()==tpriority){
                  $(this).find('input[type=checkbox]').prop("checked", false);
               }
            }
         });
         //alert("unchecked");   
      }
      
   }
   
   function GenerateGraphs() {
      var items = new Array();
      $('.event').each(function(){
         if ($(this).find('input[type=checkbox]').prop("checked")){
            $(this).find('.evitems')
            .find('span.eitem').each(function(){
              var item=$(this).find('input[name=itemid]').val();
               if (items.indexOf(item)==-1){items.push(item)  }
               
            });
         }
      });
      data_json = JSON.stringify({from_date:$('input[name=from_date]').val(),to_date:$('input[name=to_date]').val(),zserver:$("#zserver :selected").val(),data:items});
      $.ajax({
            type: 'post',
            url: '/do/gengraphfromevents',
            data:data_json,
            success: onGengraphSuccess,
            dataType: 'json'
      });
   }
   
   function onGengraphSuccess(data) {
      $('#graphs').html("");
      $(data['urls']).each(function(key,url){
         $('<img src="'+url+'">').appendTo('#graphs');
      });
   }
   
   function CheckIfLogged(data) {
	if(data['authenticated']==1){
	    $('#user_welcome').html("Welcome "+data['username'][0]);
	    //$('#user_bar').css({'visibility':"visible"});
	    //$('#user_auth').css({'visibility':"hidden"});
	    $('#user_bar').css({'display':"block"});
	    $('#user_auth').css({'display':"none"});
            $('input[name=move_to_tool]').prop('disabled',false);
            UserAuthenticated=true;
	}
	else{
	    //$('#user_auth').css({'visibility':"visible"});
	    //$('#user_bar').css({'visibility':"hidden"});
            $('input[name=move_to_tool]').prop('disabled',true);
	    $('#user_auth').css({'display':"block"});
	    $('#user_bar').css({'display':"none"});
            UserAuthenticated=false;
	}
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
       	    $('#user_auth').css({'display':"none"});
	    $('#user_bar').css({'display':"block"});
	    $('#user_welcome').html("Welcome "+data['username'][0]);

	    //$('#user_auth').css({'visibility':"hidden"});
	    $('input[name=move_to_tool]').prop('disabled',false);
            UserAuthenticated=true;
	 }
//	    alert ("login success");
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
            $('input[name=move_to_tool]').prop('disabled',true);
            UserAuthenticated=false;
	    }
   }
   
   function doMoveToTool() {
      if ($('#graphs img').length==0) {
         alert ("Generate some graphs first!!");
         return;
      }
      var gpos = $('#graphs').position();
      var diff=gpos.top;
      var graphs = new Array();
      $('#graphs img').each(function(key,val){
         otop=val['offsetTop']-diff;
         oleft=val['offsetLeft'];
         owidth=val['offsetWidth'];
         oheight=val['offsetHeight'];
         src=val['src'];
         graphs.push({'item_img':src,'item_top':otop,'item_left':oleft,'item_width':owidth,'item_height':oheight});
      });
      sname=$('input[name=screen_name]').val();
      data_json = JSON.stringify({'data':graphs,'screen_name':sname,'screen_id':""});
      $.ajax({
	    type: "POST",
	    url: "/do/save",
	    data:data_json,
	    success: onSaveGraphSuccess,
	    dataType: 'json'
      });
   }
  
   function onSaveGraphSuccess(data){
      	 if (data['error']==1) {
	    alert("Save error: "+data['error_str']);
	 }
         else{
            alert("Screen saved under id: "+data['screen_id']+" and name: "+data['screen_name']+". \nScreen will automatically open in new window");
            window.open("/"+data['screen_id']+"/view/",'_newtab');
         }
   }
   
   $.ajax({
	type: "GET",
	url: "/do/islogined",
	cache: false,
	success: CheckIfLogged,
	dataType: 'json'
    });
   
   
});