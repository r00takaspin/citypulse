# -*- coding: utf-8 -*-
__author__ = 'voldemar'

__name__ = "dgis_place_parse"

import dgis
from pymongo import Connection
import json
import urllib2
import time

api = dgis.API('ruuzoe3493')
con = Connection(host='127.0.0.1', port=3002)
db = con["meteor"]
cities = db["cities"].find()
locations = db["locations"]


def parse_objects(what,obj_type):
    page_num = 1;
    while True:
        data = urllib2.urlopen('http://catalog.api.2gis.ru/search?key=ruuzoe3493&what=рестораны&where=%D0%9A%D0%B0%D0%BB%D0%B8%D0%BD%D0%B8%D0%BD%D0%B3%D1%80%D0%B0%D0%B4&version=1.3&pagesize=50&page='+str(page_num));
        j = json.load(data)

        if not j.get("result") or (j.get("error_code") and j.get("error_code")=="incorrectPage"):
            break;

        for result in j['result']:

            if  locations.findOne({"lat":result["lat"],"lng":result["lng"]}):
                continue;

            insert = {
                "name":result["name"],
                "lat":result["lat"],
                "lng":result["lon"],
                "type":obj_type,
                "city_id":"50feaedb708ddbf3bfeb004b"
            };
            locations.save(insert);

        page_num = page_num+1
        time.sleep(1);

parse_objects(u'Рестораны',u'restaurants');
