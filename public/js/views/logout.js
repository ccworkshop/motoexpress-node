
$(document).ready(function(){
	$('#btn-logout').click(function(){ 

		var that = this;
		$.ajax({
			url: "/logout",
			type: "POST",
			data: {logout : true},
			success: function(data){
	 			showLockedAlert('You are now logged out.<br>Redirecting you back to the homepage.');
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
	});
})

var showLockedAlert = function(msg){
	$('.modal-alert').modal({ show : false, keyboard : false, backdrop : 'static' });
	$('.modal-alert .modal-header h3').text('Success!');
	$('.modal-alert .modal-body p').html(msg);
	$('.modal-alert').modal('show');
	$('.modal-alert button').click(function(){window.location.href = '/';})
	setTimeout(function(){window.location.href = '/';}, 3000);
}