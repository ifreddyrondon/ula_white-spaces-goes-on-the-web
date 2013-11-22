$(document).ready(function(){
	// Enrutamiento # ---------------------------
	routie({
		'': function(){
			ajax("/",null,null,"wrapper");
		},
		'white_spaces': function(){
			ajax("/white_spaces",null,null,"wrapper");
		}
	});
	
	// Select input ------------------------------
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

	// Form opciones validador-----------------------------
	$(document).on("click","#options-enviar",function(){
		var val = $(document.getElementsByName('zona'));
		var error = true;
		for (i = 0 ; i < val.length ; i++){
			if (val[i].checked){
				error = false;
				break;
			}
		}
		if (error == true){
			$(".error-center-screen").show();
			return false;
		}
		else {
			error = true;
			var val = $(document.getElementsByName('frecuencia'));
			for (i = 0 ; i < val.length ; i++){
				if (val[i].checked){
					error = false;
					break;
				}
			}
			if (error == true){
				$(".error-center-screen").show();
				return false;
				}
		}

				

		
	
	});
	
	
});


function ajax(url,datos,reload,renderID){
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