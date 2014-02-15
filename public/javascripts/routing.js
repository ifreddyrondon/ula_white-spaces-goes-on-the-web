$(document).ready(function(){
	
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

	// Form opciones de zona y umbral, validador de vacios-----------------------------
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
			return false;
		} else if($("#ipt_umbral").val() == '' || !validator("number","number","ipt_umbral"))
			return false;
		else if(!validator("numberBetweenMin","numberBetweenMin","ipt_umbral",-120) || !validator("numberBetweenMax","numberBetweenMax","ipt_umbral",-20))
			return false;
		else if(number_split[1] != undefined && number_split[1].length > 2){
			errorHandler("number_decimal");
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
							errorHandler("sync-enviar-3");
					}	
		    }); 
			}
		} else {
			errorHandler("sync-enviar-1");	
			return false;
		}
	});
	
	// Select-frequency-enviar------------------------------------------------------------------------
	$("#select-frequency-enviar").click(function(){
		if(!validator("number","number","from_frequency") || !validator("number","number","to_frequency")){
			return false;
		}
		else if($("#from_frequency").val() > $("#to_frequency").val()){
			errorHandler("number_from_greater_than_to");	
			return false;
		}
	});
	// Download CSV all files------------------------------------------------------------------------
	$("#generate-csv-to-heatmap").click(function(){
		if(!validator("number","number","from_frequency") || !validator("number","number","to_frequency")){
			return false;
		}
		else if($("#from_frequency").val() > $("#to_frequency").val()){
			errorHandler("number_from_greater_than_to");	
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
			    	$("#generate-csv-to-heatmap").hide();
			    	$("#generate-csv-to-heatmap2").show();
						$("#dowload-csv-to-myheatmap").hide();	
						$("#dowload-csv-to-myheatmap2").show();	
		    	}
				}
			});
		
		}
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
		    	$("#generate_pdf_chart").hide();
					$("#download_pdf_chart").show();	
	    	}
			}
		});
		
	});
	
});
