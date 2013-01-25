function hello()
{
	console.log(this);
}

Instagram = new Meteor.Collection("instagram");

lastInstagram = function() {
  return Instagram.find({},{sort:{created_time:-1},limit:4});
}
locationInstagram = function(location_id_var) 
{
	console.log(location_id_var);
	Meteor.uuid();
	return Instagram.find({location_id: location_id_var},{limit:14});
}
