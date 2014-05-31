$(document).ready(function(){
	// loader GIF------------------------------------------------------------------------
	$("a").click(function(){
		$("#bowlG").show();
	});
	$( ":submit" ).click(function(){
		$("#bowlG").show();
	});
	
	// Input Select-----------------------------------------------------------------
	if (Modernizr.touch) {
		$(".radio-options").bind("click", function(event) {
			if (!($(this).parent('.radio-container').hasClass("active")))	{
				$(this).parent('.radio-container').addClass("active"); 
				event.stopPropagation();
			}
		});	
		$(".toggle").bind("click", function(){ 
			$(this).parents('.radio-container').removeClass("active"); 
			return false;
		});  
	}

	// Form opciones de zona, umbral y channels lugar validador de vacios-----------------------------
	$(document).on("click","#options-enviar",function(){
		val = $(document.getElementsByName('zona'));
		allocation = $(document.getElementsByName('allocation'));
		error = true;
		error2 = true;
		number_split = $("#ipt_umbral").val().split('.');
		for (i = 0 ; i < val.length ; i++){
			if (val[i].checked){
				error = false;
				break;
			}
		}
		for (j = 0 ; j < allocation.length ; j++){
			if (allocation[j].checked){
				error2 = false;
				break;
			}
		}
		if (error == true || error2 == true){
			errorHandler("enter-data");
			$("#bowlG").hide();
			return false;
		} else if($("#ipt_umbral").val() == '' || !validator("number","number","ipt_umbral")){
			$("#bowlG").hide();
			return false;
		}
		else if(!validator("numberBetweenMin","numberBetweenMin","ipt_umbral",-120) || !validator("numberBetweenMax","numberBetweenMax","ipt_umbral",-20)){
			$("#bowlG").hide();
			return false;
		}
		else if(number_split[1] != undefined && number_split[1].length > 2){
			errorHandler("number_decimal");
			$("#bowlG").hide();
			return false;
		}
	});

	
	// Input file ---------------------------------------------------------------------------
		$("input[type=file]").nicefileinput({ 
    	label : 'browse..'
		});

			
	// Form files sync------------------------------------------------------------------------
	$("#sync-enviar").click(function(){
		val = $(document.getElementsByName('zona_admin'));
		var error = true;
		for (i = 0 ; i < val.length ; i++){
			if (val[i].checked){
				error = false;
				break;
			}
		}	
		if( (!error || $("#new_zone").val() != '') && $("#data_measures").val().length != 0){
			if( !error && $("#new_zone").val() != ''){	
				errorHandler("sync-enviar-0");
				return false;
			} else {
				$("#form-sync").ajaxForm({  
					url: "/sync/upload", 
					type: "post",    
					beforeSubmit: function(){
		    		$("#bowlG").show();
		      },
					success: function(res){	
						$("#bowlG").hide();
						if (res == 0)
							errorHandler("sync-enviar-0");
						else if(res == 1)
							errorHandler("sync-enviar-1");
						else if(res == 2)
							errorHandler("sync-enviar-2");
						else if(res == 3)
							errorHandler("sync-enviar-3");
						else if(res == 4)
							errorHandler("sync-enviar-4");
						else if(res == 5)
							errorHandler("sync-enviar-5");
						else if(res == 10) {
							$('#new_zone').val('');
							$('.success').show();
						}
					}	
		    }); 
			}
		} else {
			errorHandler("sync-enviar-1");	
			$("#bowlG").hide();
			return false;
		}
	});
	
	// EDIT ACCOUNT----------------------------------------------------------------------
	$("#button-change-email").click(function(){
		if($("#email_ipt").val() == ''){
			errorHandler("form-account-error-email-empty");	
			$("#bowlG").hide();
			return false;
		
		} else if(!validator("correo","IsCorreo",$("#email_ipt").attr('id'))) {
			$("#bowlG").hide();
			return false;
		
		} else {
			$("#form-account").ajaxForm({  
				url: "/edit_account_email", 
				type: "post",    
				beforeSubmit: function(){
	    		$("#bowlG").show();
	      },
				success: function(res){	
					$("#bowlG").hide();
					if(res == '0')
			    	errorHandler("sync-enviar-3");
					else if(res == '10')
						$('.success').show();
				}	
	    });
		}
	});
	// --------------------------------------------------------
	$("#button-show-password").click(function(){
		$("#button-change-password-div").hide();
		$("#bowlG").hide();
		$("#div-password").show();
		return false;
	});
		$("#button-change-password").click(function(){
		if($("#old_pass_ipt").val() == '' || $("#new_pass_ipt").val() == '' || $("#repeat_new_pass_ipt").val() == ''){
			errorHandler("enter-data");	
			$("#bowlG").hide();
			return false;
		
		} else if($("#new_pass_ipt").val() != $("#repeat_new_pass_ipt").val()){
			errorHandler("form-account-error-password-different");	
			$("#bowlG").hide();
			return false;
		
		} else {
			$("#old_pass_ipt").val(CryptoJS.SHA512($('#old_pass_ipt').val()));
			$("#new_pass_ipt").val(CryptoJS.SHA512($('#new_pass_ipt').val()));
			$("#repeat_new_pass_ipt").val(CryptoJS.SHA512($('#repeat_new_pass_ipt').val()));
			$("#form-account").ajaxForm({  
				url: "/edit_account_password", 
				type: "post",    
				beforeSubmit: function(){
	    		$("#bowlG").show();
	      },
				success: function(res){	
					$("#bowlG").hide();
					if(res == '0')
			    	errorHandler("sync-enviar-3");
			    if(res == '1')
			    	errorHandler("form-account-error-password-different");	
			    if(res == '2')
			    	errorHandler("form-account-error-password-old");	
					else if(res == '10')
						$('.success').show();
				}	
	    });
		}
	});
	
	// EDIT ZONES------------------------------------------------------------------------
		$("#form-edit-zone-edit-name").click(function(){
			val = $(document.getElementsByName('zona_admin'));
			var error = true;
			for (i = 0 ; i < val.length ; i++){
				if (val[i].checked){
					error = false;
					break;
				}
			}
			if(error){	
				$("#bowlG").hide();
				errorHandler("edit-zone-enviar-0");
				return false;
			}	
			else {
				$("#div-form-edit-zone-edit-name-enviar").hide();
				$("#div-form-edit-zone-delete-enviar").hide();
				$("#div-edit-name-zone-field").show();
				$("#div-edit-name-zone-button").show();
				$("#new_name_zone").focus();
				$("#bowlG").hide();
				return false;
			}
		});
		$("#form-edit-zone-edit-name-enviar").click(function(){
			if($("#new_name_zone").val() == ''){
				$("#bowlG").hide();
				errorHandler("edit-zone-enviar-1");
				return false;
			}
			else {
				$("#form-edit-zone").ajaxForm({  
					url: "/edit_zone_name", 
					type: "post",    
					beforeSubmit: function(){
		    		$("#bowlG").show();
		      },
					success: function(res){	
						$("#bowlG").hide();
						if(res == '0')
				    	errorHandler("enter-data");
						else if(res == '1')
							errorHandler("sync-enviar-3");
						else if(res == '10')
							window.location.href ="/admin";
					}	
		    });
			}
		});
		
		// --------------------------------------------------------
		$("#form-edit-zone-delete-enviar").click(function(){
			val = $(document.getElementsByName('zona_admin'));
			var error = true;
			for (i = 0 ; i < val.length ; i++){
				if (val[i].checked){
					error = false;
					break;
				}
			}
			if(error){	
				$("#bowlG").hide();
				errorHandler("edit-zone-enviar-0");
				return false;
			}	else {
				$("#form-edit-zone").ajaxForm({  
					url: "/delete_zone", 
					type: "post",    
					beforeSubmit: function(){
		    		$("#bowlG").show();
		      },
					success: function(res){	
						$("#bowlG").hide();
						if(res == '0')
				    	errorHandler("enter-data");
				    else if(res == '1')
							errorHandler("sync-enviar-3");
						else if(res == '10')
							window.location.href ="/admin";
					}	
		    });
			}
		});
		
	// Select-frequency-enviar------------------------------------------------------------------------
	$("#select-frequency-enviar").click(function(){
		if(!validator("number","number","from_frequency") || !validator("number","number","to_frequency")){
			$("#bowlG").hide();
			return false;
		}
		else if($("#from_frequency").val() > $("#to_frequency").val()){
			$("#bowlG").hide();
			errorHandler("number_from_greater_than_to");	
			return false;
		}
		else if($("#from_frequency").val() < $("#min_ipt_hidden").val()){
			$("#bowlG").hide();
			errorHandler("values_within_range");	
			return false;
		}
		else if($("#to_frequency").val() > $("#max_ipt_hidden").val()){
			$("#bowlG").hide();
			errorHandler("values_within_range");	
			return false;
		}
		else if(!validator("number","number","min_count") || !validator("number","number","radius") || !validator("number","number","opacity")){
			$("#bowlG").hide();
			return false;
		}
	});
	// Select-channels-enviar------------------------------------------------------------------------
	$("#select-channels-enviar").click(function(){
		val = $(document.getElementsByName('channel'));
		error = true;
		for (i = 0 ; i < val.length ; i++){
			if (val[i].checked){
				error = false;
				break;
			}
		}
		if(error){	
			$("#bowlG").hide();
			errorHandler("select-one-channel");
			return false;
		}
		else if(!validator("number","number","min_count") || !validator("number","number","radius") || !validator("number","number","opacity")){
			$("#bowlG").hide();
			return false;
		}
	});
	// Download CSV all files------------------------------------------------------------------------
	$("#generate-csv-to-heatmap").click(function(){
		if(!validator("number","number","from_frequency") || !validator("number","number","to_frequency")){
			$("#bowlG").hide();
			return false;
		}
		else if($("#from_frequency").val() > $("#to_frequency").val()){
			errorHandler("number_from_greater_than_to");	
			$("#bowlG").hide();
			return false;
		} else {
			$.ajax({
		  	type: 'POST',
				url: 'generate-csv-to-myheatmap',
				data: {from:$("#from_frequency").val(), to:$("#to_frequency").val(), zona:$("#zona_ipt_hidden").val(), umbral:$("#umbral_ipt_hidden").val()},
		    beforeSend: function(){
				 	$("#bowlG").show();
				},
		    success: function(res){
		    	$("#bowlG").hide();
		    	if(res == '1'){
			    	errorHandler("frequency_not_recorded");	
		    	}
		    	else if(res == '0'){
						window.location.href ="/dowload-csv-to-myheatmap";
		    	}
				}
			});
		}
	});
	// Download CSV data------------------------------------------------------------------------
	$("#download-csv-data").click(function(){
		$("#bowlG").hide();
	});
	// Download PDF chart------------------------------------------------------------------------
	$("#generate_pdf_chart").click(function(){
		$.ajax({
	  	type: 'POST',
	  	traditional: true,
			url: 'generate-pdf-of-chart',
			data: {zona:$("#zona_ipt_hidden").val(), umbral:$("#umbral_ipt_hidden").val(), img:$("#img_chart_ipt_hidden").val()},
	    beforeSend: function(){
			 	$("#bowlG").show();
			},
	    success: function(res){
	    	$("#bowlG").hide();
	    	if(res == '0'){
		    	window.location.href ="/download-pdf-of-chart";
	    	}
			}
		});
	});
	
});
