
$(document).ready(function(){

	var sc = new storeCtrl();


	$('#store-form').ajaxForm({
		beforeSubmit : function(formData, jqForm, options){
			console.log(formData[1].value);
			sc.showLatlong(formData[1].value,function(markdata){

				formData.latitude=markdata.latitude;
				formData.longitude=markdata.longitude;
				$('#latitude-tf').val( formData.latitude );
				$('#longitude-tf').val( formData.longitude );
				

			});

			console.log(formData);
			return true;
		},
		success	: function(responseText, status, xhr, $form){
			if (status == 'success') sc.onUpdateSuccess();
		},
		error : function(e){
			if (e.responseText == 'name-taken'){
				alert("店家已存在！");
			}
		}
	});


// customize the account settings form //
	
	$('#store-form h1').text('新增店家');
	$('#store-form #sub1').text('在這裡可以新增店家資訊，幫助我們豐富我們的地圖！');
	$('#store-form #sub2').text('經緯度');
	$('#store-form-btn1').html('取消');
	$('#store-form-btn2').html('新增');


	// $('#name-tf').val("勝祥機車行");
	// $('#address-tf').val( "台北市汀州路一段354號" );

// setup the confirm window that displays when the user chooses to delete their account //
	// $('.modal-confirm').modal({ show : false, keyboard : true, backdrop : true });
	// $('.modal-confirm .modal-header h3').text('Delete Account');
	// $('.modal-confirm .modal-body p').html('Are you sure you want to delete your account?');
	// $('.modal-confirm .cancel').html('Cancel');
	// $('.modal-confirm .submit').html('Delete');
	// $('.modal-confirm .submit').addClass('btn-danger');

});