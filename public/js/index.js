$(function(){
	var submitButton = $('#submit');
	var getlist = $('#getlist');
	var createdata = $('#createdata');
	var table = $('.striped');
	var tbody = $('#tbody');
	var main = $('.main');
	createdata.on('click',function(){
		table.addClass('hidden');
		main.removeClass('hidden');
		$('#form1').get(0).reset();
	});
	submitButton.on('click', function(){
		$.ajax({
			type:'POST',
			url:'/work',
			data:{
				name:$('#name').val(),
				workDays:$('#workDays').val(),
				workHours:$('#workHours').val()
			},
			success:function(response){
				if(response=='success'){
					table.removeClass('hidden');
					main.addClass('hidden');
					$('#form1').get(0).reset();
					getDataList();
				}
			}
		});
	});
	getlist.on('click',function(){
		if(!table.hasClass('hidden')){
			return false;
		}
		getDataList();
	});
	
	function getDataList(){
		$.ajax({
			type:'GET',
			url:'/worklist',
			data:{},
			success:function(response){
				if(response){
					//window.location.href='/worklist.html';
					var html = '';
					response.forEach(function(item,index){
						html += '<tr>'+
								'<td>'+index+'</td>'+
								'<td>'+item['user']['name']+'</td>'+
								'<td>'+item['user']['workDays']+'</td>'+
								'<td>'+item['user']['workHours']+'</td>'+
								'</tr>';
					});
					tbody.html(html);
					table.removeClass('hidden');
					main.addClass('hidden');
				}
			}
		});
	}
	
});