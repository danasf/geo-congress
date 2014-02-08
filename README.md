Geo-Congress
------------

Learning node.js via common work tasks.

This script takes a CSV with identifier and address columns, geocodes and appends congressional district, bioguide (unique) id for matching members of Congress, output as a new CSV.

I recommend using a Data Science Toolkit VM locally for high volume geocoding.

DSTK can append political information but was returning pre-2013 districts --- so I shifted to the Sunlight Congress API for that data!
