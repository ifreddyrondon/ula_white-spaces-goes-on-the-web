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
		error = true;
		number_split = $("#ipt_umbral").val().split('.');
		for (i = 0 ; i < val.length ; i++){
			if (val[i].checked){
				error = false;
				break;
			}
		}
		if (error == true){
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
		$("#form-sync").ajaxForm({  
			url: "/sync/upload", 
			type: "post",    
			beforeSubmit: function(){
    		$("#bowlG").show();
      },
			success: function(res){	
				$("#bowlG").hide();
				if(res == 1)
					errorHandler("sync-enviar-1");
				else if(res == 2)
					errorHandler("sync-enviar-2");
				else if(res == 3)
					errorHandler("sync-enviar-3");
				else if(res == 0){
					alert("cargado!!");
				}
			}	
    }); 
	});

});
