$(document).ready(function(){
	//Login
	$(document).on("focus","#login_user",function(){if(this.value=='Email')focusEmpty('login_user')});
	$(document).on("blur","#login_user",function(){if(this.value =='') this.value='Email'; else validator("correo","IsCorreo",$(this).attr('id'))});
	$(document).on("focus","#login_pass_temp",function(){$('#login_pass_temp').hide();$('#login_pass').show();$("#login_pass").focus();});
	$(document).on("blur","#login_pass",function(){if(this.value ==''){$('#login_pass').hide();$('#login_pass_temp').show();}});
	
	$(document).on("click","#login_enviar",function(){
		if($('#login_user').val()!='Email' && $('#login_pass_temp').css("display")=="none" && validator("correo","IsCorreo","login_user")){
			$(document.getElementById("err_btn_login")).remove();
			$("#login_pass").val(CryptoJS.SHA512($('#login_pass').val()));
			ajaxDatosReload("/loginSend","form-login","form-login_inv");
		}
		else{
			errorHandler('form-login');
			return false;
		}
	});
});