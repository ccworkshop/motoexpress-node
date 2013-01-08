var stores = require('../modules/util/stores');

exports.listAll = function(req,res){

  stores.motostores.find({},
  function (err, motostores) {
    if(err) {

      res.contentType('json');
      res.json({
        success: false
      });
    }else {
      console.log(motostores);

      res.contentType('json');
      res.json({
        success: true,
        data: motostores
      });
    }
  })
};


exports.listNear =function(req,res){

  console.log("do listNear");

  var latitude = parseFloat(req.param("latitude"));
  var longitude = parseFloat(req.param("longitude"));
  var distinct = parseFloat(req.param("distinct"));



  stores.motostores.find({
    latitude:{
      $lt: latitude+distinct,
      $gt: latitude-distinct
    }
  },
  function (err, motostores) {
    if(err) {

      res.contentType('json');
      res.json({
        success: false
      });
    }else {
      res.contentType('json');
      res.json({
        success: true,
        data: motostores
      });
    }
  })
};