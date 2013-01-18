

function setCookie(name,value)
{
  var Days = 30; //此 cookie 将被保存 30 天
  var exp  = new Date();    //new Date("December 31, 9998");
  exp.setTime(exp.getTime() + Days*24*60*60*1000);
  document.cookie = name + "="+ escape(value) +";expires="+ exp.toGMTString();
}
function getCookie(name)
{
  var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
  if(arr != null) return unescape(arr[2]); return null;
}
function delCookie(name)
{
  var exp = new Date();
  exp.setTime(exp.getTime() - 1);
  var cval=getCookie(name);
  if(cval!=null) document.cookie=name +"="+cval+";expires="+exp.toGMTString();
}

function addressParseLatlong(address,callback){
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {

      var geometry=results[0].geometry;

      var markConfig=new Object();
      markConfig.point=geometry;
      markConfig.latitude=geometry.location.lat();
      markConfig.longitude=geometry.location.lng();
      markConfig.name=address;
      
      callback(markConfig);

    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
}


function latlongParseAddress(latlng,callback){
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode( {'latLng': latlng}, function(results, status) {
    var markConfig=new Object();
     markConfig.city="";
     markConfig.name="";
     markConfig.address="";

    if (status == google.maps.GeocoderStatus.OK) {
      var geometry=results[0].geometry;
      
      markConfig.point=geometry;
      markConfig.latitude=geometry.location.lat();
      markConfig.longitude=geometry.location.lng();
      markConfig.address=results[0].formatted_address;
      markConfig.name="你的所在位置";
      
      markConfig.city=results[0].address_components[4].long_name;
      
      
    } else {

      alert("Geocode was not successful for the following reason: " + status);
      markConfig.address="查無目前地址！";
      markConfig.name=markConfig.address;
      

      
    }
    callback(markConfig);
  });
}
