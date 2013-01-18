
function storeCtrl()
{
	$('#store-form-btn1').click(function(){ window.location.href = '/';});

	this.showLatlong=function(address,callback){
		addressParseLatlong(address,function(markData){
			callback(markData);
		});

	}

}

storeCtrl.prototype.onUpdateSuccess = function()
{
	$('.modal-alert').modal({ show : false, keyboard : true, backdrop : true });
	$('.modal-alert .modal-header h3').text('Success!');
	$('.modal-alert .modal-body p').html('店家已新增！');
	$('.modal-alert').modal('show');
	$('.modal-alert button').off('click');
}
