// 載入 Visualization API
var query =null;
$(function(){

	var URL = 'http://spreadsheets.google.com/tq?key=0AsXj_vRMyOYydEk5OXdKRlJJSXdGZ1FZU3FXRjl6SlE#gid=0';
      google.load('visualization', '1',
          {'packages': ['table']});
	query = new google.visualization.Query(URL);

});


function queryData(queryStr,createMarker){
		// 使用 query language 查詢資料
	console.log("start queryData");

	query.setQuery("select B,C,D,E,F where H='Y' "+queryStr);



	query.send(function(resp){
		console.log("query send fin");
	  if (!resp.isError()) {
	    var dataTable = resp.getDataTable();
	    var jsonData = JSON.parse(dataTable.toJSON());

	    

	    var len = jsonData.rows.length;

	   	console.log("mark Count="+len);

			for (var i = 0; i < len; ++i) {
			  var row = jsonData.rows[i];

				var markConfig=new Object();
				markConfig.latitude=row.c[3].v;
				markConfig.longitude=row.c[4].v;
				markConfig.address=row.c[2].v;
				markConfig.name=row.c[0].v;
				markConfig.description=row.c[1].v;




				createMarker(markConfig);

			}

		}

	});
}