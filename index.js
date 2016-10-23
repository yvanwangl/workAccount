var express = require('express');
var querystring = require('querystring');
var app = express();
var mongodb = require('mongodb');
var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

var mongoServer = new mongodb.Server(
				'10.0.250.140',
				27017
			);
var dbHandler = new mongodb.Db('work', mongoServer, {safe:true});

app.get('/',function(req, res){
	res.sendfile(__dirname+'/index.html');
});

app.post('/work',function(req, res){
	req.on('data',function(data){
		var obj = querystring.parse(data.toString());
		dbHandler.open(function(error, dbHandler){
			dbHandler.collection(
				'works',
				function(ourter_error, collection){
					var options_map = {safe:true};
					var obj_map = {
						weekName:getWeekName(),
						weekData:[
							{
								user:{
									name:obj.name, 
									workDays:obj.workDays,
									workHours:obj.workHours
								}
							}
						]
					};
					collection.find({'weekName':getWeekName()}).toArray(function(inner_error,map_list){
						if(map_list.length==0){
							collection.insert(
								obj_map,
								options_map,
								function(inner_error, result_map){
									res.send( 'success' );
									dbHandler.close();
								}
							);
						}else{
							collection.find({'weekName':getWeekName(), 'weekData.user.name':obj.name}).toArray(function(inner_error,map_list){
								if(map_list.length>0){
									var userList = map_list[0].weekData;
									var newList = [];
									userList.forEach(function(item){
										if(item['user']['name']==obj.name){
											item = {
												user:{
													name:obj.name, 
													workDays:obj.workDays,
													workHours:obj.workHours
												}
											}
										}
										console.log(item['user']['name']);
										newList.push(item);
									});
									console.log(newList);
									var obj_map = {
											weekName:getWeekName(),
											weekData:newList
										};
									collection.findAndModify(
										{'weekName':getWeekName(), 'weekData.user.name':obj.name},
										[],
										obj_map,
										{
											upsert:true,
											multi:true
										},
										function(inner_error, result_map){
											res.send( 'success' );
											dbHandler.close();
										}
									);
								}else {
									collection.find({'weekName':getWeekName()}).toArray(function(inner_error,map_list){
										var userList = map_list[0].weekData;
										userList.push({
											user:{
												name:obj.name, 
												workDays:+obj.workDays,
												workHours:+obj.workHours
											}
										});
										var obj_map = {
											weekName:getWeekName(),
											weekData:userList
										};
										collection.findAndModify(
											{'weekName':getWeekName()},
											[],
											obj_map,
											{
												upsert:true,
												multi:true
											},
											function(inner_error, result_map){
												res.send( 'success' );
												dbHandler.close();
											}
										);
									});
								}
							});
						}
					});
				}
			);
		});
	});
});

app.get('/worklist',function(req, res){
	dbHandler.open(function(error, dbHandler){
		dbHandler.collection(
			'works',
			function(ourter_error, collection){
				var options_map = {safe:true};
				collection.find({weekName:getWeekName()}).toArray(function(inner_error, map_list){
					if(inner_error){
						res.send(inner_error);
					}
					var userList = map_list[0].weekData;
					res.send(userList);
					//res.redirect('/worklist.html');
					dbHandler.close();
				});
			}
		);
	});
});

function getWeekName(){
	var time,
		week,
		checkDate = new Date(new Date());
	checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7));
	time = checkDate.getTime();
	checkDate.setMonth(0);
	checkDate.setDate(1);
	week=Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;	
	return week;
}

app.listen(1338,'192.168.20.225');
console.log('正在监听端口：%d', 1338);
