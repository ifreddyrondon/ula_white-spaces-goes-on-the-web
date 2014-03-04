$(document).ready(function(){
//Ppal Validados-------------------------------------------------------
	var error;
	function validator(stringError,funciones,id,min){
		if(stringError=='name') error="ERROR:  You must put your first name and last name.<br> Do you want to try again?";
		if(stringError=='correo') error="ERROR: Invalid Email. Do you want to try again?";
		if(stringError=='ci') error="ERROR: Invalid Id format. Try again, take this as an example: V12345678, E12345678";
		if(stringError=='pass') error="ERROR: Short password are easy to guess. Try again. Use at least 6 characters.";
		if(stringError=='number') error="ERROR: You must put a number.<br> Do you want to try again?";
		if(stringError=='numberBetweenMin') error="ERROR: The number must be greater than " + min + ".<br> Do you want to try again?";
		if(stringError=='numberBetweenMax') error="ERROR: The number should be less than " + min + ".<br> Do you want to try again?";
		if (validar(funciones,id,min)){
			document.getElementById(id).style.backgroundImage="url('images/check.png')";
	  	document.getElementById(id).style.backgroundRepeat="no-repeat";
	  	document.getElementById(id).style.backgroundPosition="right center";
	  	document.getElementById(id).style.backgroundColor="transparent";
	  	$(document.getElementById(stringError)).remove();
	  	return true;
		}
		else{
			document.getElementById(id).style.backgroundImage="url('images/false.png')";
	  	document.getElementById(id).style.backgroundRepeat="no-repeat";
	  	document.getElementById(id).style.backgroundPosition="right center";
	  	document.getElementById(id).style.backgroundColor="rgba(253,160,160,0.43)";
	  	if(document.getElementById(stringError) == null){
		  	$('.error').append('<div id="'+stringError+'"><center>'+error+'</center></div>');
	  		$('.error').append('<br><center><a id="error-got-it" href="#" class="button-error">Got it</a></center>');
	  	}
	  	return false;
		}
	}
	function validar(funciones,id,min){
		empty = true;
		number = true;
		numberBetweenMin = true;
		numberBetweenMax = true;
		ci = true;
		formatoImagen = true;
	  correo = true;
	  correo_formato = true;
	  minimo = true;
		funciones = funciones.split(',');
		for(i=0;i<funciones.length;i++){
			if(funciones[i]=='empty')
				empty = IsEmpty(document.getElementById(id));
			if(funciones[i]=='number')
				number = IsNumeric(document.getElementById(id));
			if(funciones[i]=='numberBetweenMin')
				numberBetweenMin = numberBetweenMIN(document.getElementById(id),min);		
			if(funciones[i]=='numberBetweenMax')
				numberBetweenMax = numberBetweenMAX(document.getElementById(id),min);		
			if(funciones[i]=='formatImage')
				number = formatImage(document.getElementById(id));
			if(funciones[i]=='IsCorreo')
				correo_formato = validaCorreo(document.getElementById(id).value);		
			if(funciones[i]=='CorreoAvailability')
				correo = CorreoAvailability(document.getElementById(id));		
			if(funciones[i]=='min')
				minimo = minChar(document.getElementById(id),min);		
			if(funciones[i]=='ci')
				ci = IsCi(document.getElementById(id));		
		}
		return empty && number && formatoImagen && correo && correo_formato && minimo && ci && numberBetweenMin && numberBetweenMax;	
	}
  window.validator=validator;
//Funciones-validadoras--------------------------------------------------------------------
	function IsEmpty(el){
	  if(el.value == '')
	  	return false;
	  else if(el.value != '')
		  return true;
  }
  function IsNumeric(el){
	  RE = /^-{0,1}\d*\.{0,1}\d+$/;
	  return RE.test(el.value);
  }
  function numberBetweenMIN(el,min){
		if(el.value < min)
	  	return false;
	  else 
	  	return true;
  }
  function numberBetweenMAX(el,min){
	  if(el.value > min)
	  	return false;
	  else 
	  	return true;
  }
  function formatImage(el){
	  ext = el.value.split('.').pop().toLowerCase(); 	
		if (! (ext && /^(jpg|png|jpeg|gif)$/.test(ext)))
			return false;
		else
			return true;  
  }
  function minChar(el,min){
	  if(el.value.length < min)
	  	return false;
	  else 
		  return true;
  }
  function IsCi(el){
  	RE = /^([V|E|v|e])([0-9]{5,8})$/;
  	if(RE.test(el.value)){
	  	ci_data = 'cedula='+ el.value;
	  	$.ajax({
				type: "POST",
				url: "/disponibilidad/ci",
				data: ci_data,
				async: false,
				beforeSend: function(){
				  //$("#btn_update_enviar").attr("disabled", true);
				  el.style.backgroundImage="url('images/loader.gif')";
				  el.style.backgroundRepeat="no-repeat";
				  el.style.backgroundPosition="right center";
				},
				success: function( respuesta_ci ){
					//$("#btn_update_enviar").attr("disabled", false);
					if(respuesta_ci == '1'){
						resCi = false; 
						error = "Id already exist.Try again?";
					}
					else if(respuesta_ci == '0')
						resCi = true;
				}
			});
			return resCi;
  	}
  	else return false;
  }
  function validaCorreo(valor) {
		var expresion = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
		return expresion.test(valor);
	}
	function CorreoAvailability(el){
		if(validaCorreo(el.value)){
			email_data = 'email='+ el.value;
			$.ajax({
				type: "POST",
				url: "/disponibilidad/email",
				data: email_data,
				async: false,
				beforeSend: function(){
				  //$("#btn_update_enviar").attr("disabled", true);
				  el.style.backgroundImage="url('images/loader.gif')";
				  el.style.backgroundRepeat="no-repeat";
				  el.style.backgroundPosition="right center";
				},
				success: function( respuesta_email ){
					//$("#btn_update_enviar").attr("disabled", false);
					if(respuesta_email == '1'){
						resEmail = false; 
						error = "Email already exist.Try again?";
					}
					else if(respuesta_email == '0')
						resEmail = true;
				}
			});
			return resEmail;
		}
		else return false;	
	}
//----AJAX----------------------------------------------------------------------------------
	function ajaxNormal(url,datos,reload,renderID){
		$(document.getElementById(renderID)).fadeOut('fast');
		$.ajax({
	  	type: 'POST',
			url: url,
			data: datos,
	    beforeSend: function(){
			 	$("#bowlG").show();
			},
	    success: function(res){
	    	$("#bowlG").hide();
	    	if (res == '1')
	      	alert("error");
	    	else {
		    	if(reload)	window.location = res;
		    	else {
			    	if(renderID)
			    		$(document.getElementById(renderID)).html(res).fadeIn('fast');
			    	else
			    		alert("No RENDER");
		    	}
	    	}
			}
		});
	}
	function ajaxDatos(url,id){
		$(document.getElementById(id)).ajaxForm({
	  	type: 'POST',
			url: url,
	    beforeSend: function(){
			 	$("#bowlG").show();
			},
	    success: function(res){
	    	$("#bowlG").hide();
	    	if (res == '1')
	      	errorHandler(id);
	    	else 
	        $("#wrapper").html(res);
			}
		});
	}
	function ajaxDatosReload(url,id,error_id,type_send){
		$(document.getElementById(id)).ajaxForm({
	  	type: 'POST',
			url: url,
	    beforeSend: function(){
			 	$("#bowlG").show();
			},
	    success: function(res){
	    	$("#bowlG").hide();
	    	if (res == '1')
	    		if(error_id)
		      	errorHandler(error_id);
		      else
		      	alert("Error");
	    	else 
	        window.location = res;
			}
		});
	}
	function focusEmpty(id){document.getElementById(id).value=''}
	window.ajaxNormal=ajaxNormal;	
	window.ajaxDatos=ajaxDatos;	
	window.ajaxDatosReload=ajaxDatosReload;		
	window.focusEmpty=focusEmpty;	

	function errorHandler(id){
		if(id=="form-login")	stringHandlerError = "ERROR: You can Log in with your email address. Please be sure to write the correctly data..";
		if(id=="form-login_inv")	stringHandlerError = "ERROR: <h3>Invalid Data!</h3> <br />You can Log in with any email address.Please, be sure to write the correctly data..";
		if(id=="form-registrar")	stringHandlerError = "ERROR: Wow! An error has occurred, try again in a few seconds";
		
		if(id=="form-account-error-email")	stringHandlerError = "ERROR: Invalid Email";
		if(id=="form-account-error-email-empty")	stringHandlerError = "ERROR: You must enter the email";
		if(id=="form-account-error-password-different")	stringHandlerError = "ERROR: The 'New password' and 'Repeat password' fields must be equal";
		if(id=="form-account-error-password-old")	stringHandlerError = "ERROR: The old password does not match with the password entered";
		
		if(id=="sync-enviar-0")	stringHandlerError = "ERROR: You must enter just! the zone or new zone not both";
		if(id=="sync-enviar-1")	stringHandlerError = "ERROR: You must enter the zone or new zone and upload data file (measure & tracks)";
		if(id=="sync-enviar-2")	stringHandlerError = "ERROR: The files must be on .txt";
		if(id=="sync-enviar-3")	stringHandlerError = "ERROR: Wow! An error has occurred, try again in a few seconds";
		if(id=="sync-enviar-4")	stringHandlerError = "ERROR: Wow! An error has occurred, uploading files";
		if(id=="sync-enviar-5")	stringHandlerError = "ERROR: Entered zone was added before, please change the zone or choose it from the list of zones already added";
		
		if(id=="edit-zone-enviar-0")	stringHandlerError = "ERROR: You must enter the zone";
		if(id=="edit-zone-enviar-1")	stringHandlerError = "ERROR: You must enter the zone name";
		
		if(id=="enter-data") stringHandlerError = "ERROR: You must enter all the data!!";
		if(id=="enter-number") stringHandlerError = "ERROR: You must put a number.<br> Do you want to try again?";
		if(id=="number_decimal") stringHandlerError = "ERROR: Maximum two (2) decimals!!";
		if(id=="number_from_greater_than_to") stringHandlerError = "ERROR: 'From' value should not be greater than 'To' value!!";
		if(id=="values_within_range") stringHandlerError = 'ERROR: values ​​must be within the range!!';
		if(id=="frequency_not_recorded") stringHandlerError = "ERROR: Frequency values ​​are not recorded. Do you want to try again?";
		
		if(id=="select-one-channel") stringHandlerError = "ERROR: You must select at least one channel";
		
		if(document.getElementById(id+'-error') == null){
	  	$('.error').append('<div id="'+id+'-error"><center>'+stringHandlerError+'</center></div>');
	  	$('.error').append('<br><center><a id="error-got-it" href="#" class="button-error">Got it</a></center>');
	  }
	}
	// Ocultar error cuando le da got it
	$(document).on("click","#error-got-it",function(){
		$('.error').empty();
	});
	
	$(document).on("click","#success-got-it",function(){
		$('.success').hide();
		$("#bowlG").hide();
	});
	
	
	window.errorHandler=errorHandler;
	function spanishDate(d){
		var weekday=["domingo","lunes","martes","miercoles","jueves","viernes","sabado"];
		var monthname=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
		return weekday[d.getDay()]+", "+d.getDate()+" de "+monthname[d.getMonth()];
	}
	
/*	function englishDate(d){
		var weekday=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
		var monthname=["January","February","March","April","May","June","July","August","September","October","November","December"];
		return weekday[d.getDay()]+", "+d.getDate()+" de "+monthname[d.getMonth()];
	}*/
	function sendDate(){
		d = $("#datepicker").datepicker("getDate");
		$('.day_big_view').html(d.getDate());
		$('.day_completa_view').html(spanishDate(d)+"<br />"+d.getFullYear());
		window.location = '/#events/'+d;
	}
	//window.englishDate=englishDate;
	window.spanishDate=spanishDate;
	window.sendDate=sendDate;
	
});
