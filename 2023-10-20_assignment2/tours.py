#!/usr/bin/python

#Convert data from OsloBysykkel in rawdata/ to GeoJSON data in geojson/
#Author(s)		: Lukas Mirow
#Date of creation	: 2023-10-06
"""Data columns:
 0: started_at
 1: ended_at
 2: duration
 3: start_station_id
 4: start_station_name
 5: start_station_description
 6: start_station_latitude
 7: start_station_longitude
 8: end_station_id
 9: end_station_name
10: end_station_description
11: end_station_latitude
12: end_station_longitude
"""


RAW_DIR = "rawdata"
COOKED_DIR = "tours"


from os import listdir
from os.path import isfile


def write_tour_geo_json():
	for fname in listdir(RAW_DIR):
		fpath = f"{RAW_DIR}/{fname}"
		if isfile(fpath):
			with open(fpath, "r") as infile:
				with open(f"{COOKED_DIR}/{fname}", "w") as outfile:

					#Write header
					outfile.write("{\n")
					outfile.write("\t\"type\": \"FeatureCollection\",\n")
					outfile.write("\t\"features\":\n")
					outfile.write("\t[\n")

					#Write content
					infile.readline() #Ignore header line
					row = infile.readline()
					while row:
						cells = row_to_cells(row[:-1])
						outfile.write("\t\t{\n")
						outfile.write("\t\t\t\"type\": \"Feature\",\n")
						outfile.write("\t\t\t\"properties\":\n")
						outfile.write("\t\t\t\t{\n")
						outfile.write(f"\t\t\t\t\t\"Duration (in s)\": {int(cells[2])}\n")
						outfile.write("\t\t\t\t},\n")
						outfile.write("\t\t\t\"geometry\":\n")
						outfile.write("\t\t\t\t{\n")
						outfile.write("\t\t\t\t\t\"coordinates\":\n")
						outfile.write("\t\t\t\t\t[\n")
						outfile.write(f"\t\t\t\t\t\t[{float(cells[7])}, {float(cells[6])}],\n")
						outfile.write(f"\t\t\t\t\t\t[{float(cells[12])}, {float(cells[11])}]\n")
						outfile.write("\t\t\t\t\t],\n")
						outfile.write("\t\t\t\t\t\"type\": \"LineString\"\n")
						outfile.write("\t\t\t\t}\n")
						outfile.write("\t\t},\n")
						row = infile.readline()

					#Write footer
					outfile.write("\t]\n")
					outfile.write("}\n")
