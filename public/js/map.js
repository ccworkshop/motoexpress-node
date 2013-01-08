
var map = null;
var objMarker;
var objPoint;
var objCity;
var objAddress;
var lastQuery;
var markers = new Array();
var geocoder = new google.maps.Geocoder();
var openedInfowindow=null;

$(function(){
  $(window).resize(function () {

      var h = $(window).height();
      var offsetTop = 200; // Calculate the top offset

      $('#map_canvas').css('height', (h - offsetTop));
  }).resize();


  gpsLocal();
});

// 顯示經緯度 透過GPS 定位

function init(latitude, longitude){

  if(latitude==null || longitude==null){
    showAddress();


  }else{
    $("#address").val("你的所在位置");
    var latlng = new google.maps.LatLng(latitude, longitude);

    geocoder.geocode({'latLng': latlng}, function(results, status) {

      if (status == google.maps.GeocoderStatus.OK && results[0]) {
        objAddress=results[0].formatted_address;
        objCity=results[0].address_components[4].long_name;

        console.log("所處都市:"+objCity);

        $("#city").val(objCity);

      } else {
        objAddress="查無目前地址！";
      }


      var markConfig=new Object();
      markConfig.address=objAddress;
      markConfig.latitude=latitude;
      markConfig.longitude=longitude;
      markConfig.name="你目前位置";


      if(map==null)
        createMap(markConfig)
      createObjMarker(markConfig);

    });


  }

}

function createMap(markConfig){
  console.log("do createMap");
  var latlng = new google.maps.LatLng(markConfig.latitude, markConfig.longitude);
  var myOptions = {
    zoom: 15,
    center: latlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  

  map = new google.maps.Map(document.getElementById("map_canvas"),
      myOptions);
}



function createObjMarker(markConfig){


  var latlng = new google.maps.LatLng(markConfig.latitude, markConfig.longitude);
  map.setCenter(latlng);



  if(objMarker)objMarker.setMap(null);

  objMarker = new google.maps.Marker({
    position: latlng,
    title: markConfig.name,
    icon: "http://maps.google.com/mapfiles/arrow.png",
    map:map
  });

  var contentString = '<div id="content">'+
    '<h2 id="firstHeading" class="firstHeading">'+markConfig.name+'</h2>'+
    '<p>'+markConfig.address+'</p>'
    '<p>'+markConfig.description+'</p>'
    '</div>'+
    '</div>';

  createInfoWin(contentString,objMarker);


  //google query 對同樣的查詢沒有反應
  var queryStr=" and D like '"+objCity+"%'";
  if(queryStr!=lastQuery){
    deleteOverlays();
    
  $.ajax({
    type:"GET",
    url:"/listNear/"+markConfig.latitude+"/"+markConfig.longitude+"/"+0.1,
    dataType:"json",
    cache:false,
    async:false,
    success:function(result){


      if(result.success){
        var store=result.data;

        for (var i = 0; i < store.length; i++) {
          createMarker(store[i]);
        };

      }

    },
    error:function(){
      alert("執行失敗，請檢查您的網路");
      return false;
    }
  })




  }
  lastQuery=queryStr;







}


function showAddress()
{
  if ($('#city').val()==''){
    alert("請先選擇縣市");
    return false;
  }else {
  


    objAddress=$('#city').val()+$('#address').val();
    objCity= $('#city').val();


    setCookie('city',$('#city').val());
    setCookie('address',$('#address').val());

    



    geocoder.geocode( { 'address': "台灣"+objAddress}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {

        var geometry=results[0].geometry;

        var markConfig=new Object();
        markConfig.point=geometry;
        markConfig.latitude=geometry.location.lat();
        markConfig.longitude=geometry.location.lng();
        markConfig.name=objAddress;
        
        createObjMarker(markConfig);

      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });

    return ;
  }
}
function gpsLocal(){
  // 瀏覽器支援 HTML5 定位方法
  if (navigator.geolocation) {
   
      // HTML5 定位抓取
      navigator.geolocation.getCurrentPosition(function(position) {
          init(position.coords.latitude, position.coords.longitude);
      },
      function(error) {
          switch (error.code) {
              case error.TIMEOUT:
                  alert('連線逾時');
                  break;
   
              case error.POSITION_UNAVAILABLE:
                  alert('無法取得定位');
                  break;
   
              case error.PERMISSION_DENIED://拒絕
                  alert('為了更方便使用此功能請允許手機的GPS定位功能!');
                  break;
   
              case error.UNKNOWN_ERROR:
                  alert('不明的錯誤，請稍候再試');
                  break;
          }
      });
   
  } else { // 不支援 HTML5 定位

      cookieAddress=getCookie('address');

      console.log("cookieAddress="+cookieAddress);

      if(cookieAddress==null){
        cookieAddress="台北市汀州路一段354號";
        setCookie('address',cookieAddress);
      }

      $("#address").val(cookieAddress);

      init();

      // 若支援 Google Gears
      if (window.google && google.gears) {
          try {
                // 嘗試以 Gears 取得定位
                var geo = google.gears.factory.create('beta.geolocation');
                geo.getCurrentPosition(successCallback,errorCallback, { enableHighAccuracy: true,gearsRequestAddress: true });
          } catch(e){
                alert("定位失敗請稍候再試");
          }
      }else{
          alert("想要參加本活動，\n記得允許手機的GPS定位功能喔!");
      }
  }  
}

function createMarker(markConfig)
{

  var myLatlng = new google.maps.LatLng(markConfig.latitude, markConfig.longitude);


  var marker = new google.maps.Marker({
    position: myLatlng,
    map: map,
    title: markConfig.name,
    icon: "http://www.google.com/mapfiles/marker.png"
  });


  var contentString = '<div id="content">'+
    '<h2 id="firstHeading" class="firstHeading">'+markConfig.name+'</h2>'+
    '<p>'+markConfig.address+'</p>'
    '<p>'+markConfig.description+'</p>'
    '</div>'+
    '</div>';

  createInfoWin(contentString,marker);

  markers.push(marker);

}

// Deletes all markers in the array by removing references to them
function deleteOverlays() {


  if (markers) {
    for (i in markers) {

      markers[i].setMap(null);
    }
    markers.length = 0;
  }
}

function createInfoWin(contentString,marker){


  var infowindow = new google.maps.InfoWindow({
      content: contentString
  });

  google.maps.event.addListener(marker, 'click', function() {
    if(openedInfowindow!=null)openedInfowindow.close();
    infowindow.open(map,marker);
    openedInfowindow=infowindow;
  });
}










// 取得 Gears 定位發生錯誤
function errorCallback(err) {
    var msg = 'Error retrieving your location: ' + err.message;
    alert(msg);
}
 
// 成功取得 Gears 定位
function successCallback(p) {
  mapServiceProvider(p.latitude, p.longitude);
}
 

