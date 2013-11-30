$(document).ready(function(){
	
	//--Enrutamiento-local-----------------------------------------------------------------
/*	routie({
		'': function(){
			ajaxNormal("/",null,null,"wrapper");
		},
		'white_spaces': function(){
			ajaxNormal("/white_spaces",null,null,"wrapper");
		},
		'login': function(){
			ajaxNormal("/login",null,null,"wrapper");
		},
	});
	*/
	
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

	// Form opciones de ubicacion y frecuenca validador de vacios-----------------------------
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