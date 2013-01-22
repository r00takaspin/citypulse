Instagram = new Meteor.Collection("instagram");
Locations = new Meteor.Collection("locations");

instagram_filter = {}

var loc_to_point = [];


 
function loadScript() {

  var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'http://maps.api.2gis.ru/1.0?callback=initialize';
      document.body.appendChild(script);
}

function updatePlaceTranslation()
{
  for (l_p in loc_to_point)
  {
    if (this._id == loc_to_point[l_p].point_id)
    {
      loc = Locations.findOne({"_id":loc_to_point[l_p].location_id});
      
      Session.set("location_id", loc_to_point[l_p].location_id);

      //$("#location_name").html(Locations.findOne({_id:Session.get("location_id")}).name);

      $('html, body').animate({
         scrollTop: $("#location_photos").offset().top
      }, 2000);
    }
  }
}

function setUpMarkets(myMap)
{
  var myBalloon = new DG.Balloons.Common({ 
        // Местоположение, на которое указывает балун: 
        geoPoint: new DG.GeoPoint(20.487023,54.715074),
        // Текст внутри балуна: 
        contentHtml: '<div class="alert" style="text-align:left;"><b>Привет!</b><br/>Кликни по любому маркету, чтобы выбрать вечеринку. Например, по этому.</div>'
     }); 

  myMap.balloons.add(myBalloon);

  Locations.find().forEach(function(loc)
  {
    // Добавляем элемент управления коэффициентом масштабирования: 
    myMap.controls.add(new DG.Controls.Zoom()); 
    // Добавить маркер на карту:
    
    var point = new DG.Markers.Common({
         // Местоположение на которое указывает маркер:
         geoPoint: new DG.GeoPoint(loc.lng,loc.lat),
         // Функция, вызываемая при клике по маркеру
         clickCallback: updatePlaceTranslation
    });

    loc_to_point.push({location_id:loc._id,point_id:point.getId()})

    myMap.markers.add(point);
  });
}

function initializeMap(){
    DG.autoload(function() { 
        // Создаем объект карты, связанный с контейнером: 
        var myMap = new DG.Map('map_canvas'); 
        // Устанавливаем центр карты, и коэффициент масштабирования: 
        myMap.setCenter(new DG.GeoPoint(20.487023,54.715074), 13);

        setTimeout(setUpMarkets,2000,myMap);
    });
}

if (Meteor.isServer)
{
    Meteor.publish("instagram-feed", function () 
    {
      return Instagram.find({},{sort:{created_time:-1},limit:4});
    });

    Meteor.publish("locations",function()
    {
      return Locations.find();
    });
}

if (Meteor.isClient) {
  Meteor.subscribe("instagram-feed");
  Meteor.subscribe("locations");
  Template.hello_message.today_party_num = function() { return Locations.find().count(); };
  Template.hello_message.today_post_num = function() { Instagram.find().count(); }
  Template.inst_trans.instagram = function() 
  { 
    return Instagram.find({},{limit:10,sort:{inst_id:-1}});
  }
  Template.inst_trans.get_date = function(unix_timestamp)
  {
        var a = new Date(unix_timestamp*1000);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        var time = date+','+month+' '+year+' '+hour+':'+min+':'+sec;
        return time;
    }


  Template.instagram_posts.posts = function() { return  Instagram.find({location_id:Session.get("location_id")},{limit:21,sort:{created_time:-1}}); }
  Template.location_description.location_name = function() {
      if (Session.get("location_id"))
      {
        return Locations.findOne(
          {
            _id:Session.get("location_id")
          }
        ).name; 
      }
  }; 

  Template.location_description.location_desc = function() {
      if (Session.get("location_id"))
      {
        return Locations.findOne(
          {
            _id:Session.get("location_id")
          }
        ).desc; 
      }
  }; 

  //Template.inst_trans.today_post_num = Template.random();
  //var clientID = new Date().getTime(); //this could probably be more random
  $(document).ready(function() {
    $.getScript("http://maps.api.2gis.ru/1.0?callback=initialize").done(function() {
      DG.loadLib();
      initializeMap();
    });
  });
}