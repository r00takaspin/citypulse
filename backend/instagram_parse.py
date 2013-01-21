# -*- coding: utf-8 -*-
from instagram import InstagramAPI
from pymongo import Connection
import time

# Время начала работы программы
t1 = time.time()


access_token = "203831044.2974fce.974b8a55e6014f7ca6dc98cfd3e80d8f"
api = InstagramAPI(access_token=access_token)

con = Connection(host='127.0.0.1', port=3002)
db = con["meteor"]

locations = db["locations"].find()

for loc in locations:
     instagram_locations = api.location_search(lat=loc['lat'],lng=loc['lng'])
     for inst_loc in instagram_locations:
         recent_photos = api.location_recent_media(location_id=inst_loc.id)

         for p in recent_photos[0]:
             text = ''
             if not db['instagram'].find({"inst_id":p.id}).count():
                 db["instagram"].insert({
                     u"thumb":p.images['low_resolution'].url,
                     u'text':text,
                     u'location_id':loc["_id"],
                     u'inst_id':p.id,
                     u'user':p.user.username,
                     u'created_time':time.mktime(p.created_time.timetuple()),
                     u'location':inst_loc.name
                 })
                 print "location %s has new photo: %s" % (loc["name"],p.images['low_resolution'].url)



t2 = time.time()
print 'Execution of all threads is complete, time: %.2f' % (t2-t1)

