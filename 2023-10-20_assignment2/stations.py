#!/usr/bin/python

#Extract station data from CSV files by OsloBysykkel in rawdata/ to CSV files in stations/
#Author(s)		: Lukas Mirow
#Date of creation	: 2023-10-07
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
"""Info we need on stations:
* ID
* Name
* Description
* Latitude
* Longitude
* Incoming tours
* Outgoing tours
"""

RAW_DIR = "rawdata"
COOKED_DIR = "stations"
STATION_START_DATES_FNAME = "usage_dates.csv"
STATION_START_TIMES_FNAME = "usage_times.csv"
STATION_USAGE_DURATION_FNAME = "usage_duration.csv"


from os import listdir
from os.path import isfile
from common import row_to_cells


def write_stations():
	for fname in listdir(RAW_DIR):
		fpath = f"{RAW_DIR}/{fname}"
		if isfile(fpath):
			if fname in listdir(COOKED_DIR):
				print(f'The file "{COOKED_DIR}/{fname}" already exists, skipping')
				continue
			with open(fpath, "r") as infile:
				with open(f"{COOKED_DIR}/{fname}", "w") as outfile:

					#Write header
					outfile.write("ID,Name,Description,Latitude,Longitude,Incoming,Outgoing\n")

					#Create content
					stations = {}
					line_counter = 1
					infile.readline() #Ignore header line
					row = infile.readline()
					while row:
						cells = row_to_cells(row[:-1])
						#Incoming
						incoming_id = int(cells[3])
						if incoming_id in stations.keys(): #If we have seen this station before
							stations[incoming_id]["incoming"] += 1
						else: #If this a new station
							stations[incoming_id] = {"name": cells[4], "description": cells[5], "latitude": cells[6], "longitude": cells[7], "incoming": 1, "outgoing": 0}
						#Outgoing
						outgoing_id = int(cells[8])
						if outgoing_id in stations.keys(): #If we have seen this station before
							stations[outgoing_id]["outgoing"] += 1
						else: #If this a new station
							stations[outgoing_id] = {"name": cells[9], "description": cells[10], "latitude": cells[11], "longitude": cells[12], "incoming": 0, "outgoing": 1}
						print(f"\rProcessing file \"{fpath}\" line #{line_counter}", end="")
						line_counter += 1
						row = infile.readline()
					print()

					#Write body
					for key in stations.keys():
						name = stations[key]["name"]
						description = stations[key]["description"]
						latitude = stations[key]["latitude"]
						longitude = stations[key]["longitude"]
						incoming = stations[key]["incoming"]
						outgoing = stations[key]["outgoing"]
						outfile.write(f'{key},"{name}","{description}",{latitude},{longitude},{incoming},{outgoing}\n')

def write_stations_per_date():
	outfpath = f"{COOKED_DIR}/{STATION_START_DATES_FNAME}"
	if isfile(outfpath):
		print(f'The file "{outfpath}" already exists, skipping')
		return
	data = {}
	for fname in listdir(RAW_DIR):
		fpath = f"{RAW_DIR}/{fname}"
		if isfile(fpath):
			print(f'Processing file "{fpath}"')
			with open(fpath, "r") as infile:
				infile.readline() #Ignore header line
				row = infile.readline()
				while row:
					cells = row_to_cells(row[:-1])
					date = cells[0].strip().split(" ")[0].strip()
					if date in data.keys():
						data[date] += 1
					else:
						data[date] = 1
					row = infile.readline()

	with open(f"{outfpath}", "w") as outfile:

		#Write header
		outfile.write("Date,Tours\n")

		#Write body
		for date in data.keys():
			usage_count = data[date]
			outfile.write(f"{date},{usage_count}\n")

def write_station_use_hours():
	outfpath = f"{COOKED_DIR}/{STATION_START_TIMES_FNAME}"
	if isfile(outfpath):
		print(f'The file "{outfpath}" already exists, skipping')
		return
	data = {}
	for fname in listdir(RAW_DIR):
		fpath = f"{RAW_DIR}/{fname}"
		if isfile(fpath):
			print(f'Processing file "{fpath}"')
			with open(fpath, "r") as infile:
				infile.readline() #Ignore header line
				row = infile.readline()
				while row:
					cells = row_to_cells(row[:-1])
					hour = int(cells[0].strip().split(" ")[1].strip().split(":")[0].strip())
					hour = (hour+1) % 24
					if hour in data.keys():
						data[hour] += 1
					else:
						data[hour] = 1
					row = infile.readline()

	with open(f"{outfpath}", "w") as outfile:

		#Write header
		outfile.write("Hour,Tours\n")

		#Write body
		for hour in data.keys():
			usage_count = data[hour]
			outfile.write(f"{hour},{usage_count}\n")

def write_station_use_duration():
	outfpath = f"{COOKED_DIR}/{STATION_USAGE_DURATION_FNAME}"
	if isfile(outfpath):
		print(f'The file "{outfpath}" already exists, skipping')
		return
	data = {}
	for fname in listdir(RAW_DIR):
		fpath = f"{RAW_DIR}/{fname}"
		if isfile(fpath):
			print(f'Processing file "{fpath}"')
			with open(fpath, "r") as infile:
				infile.readline() #Ignore header line
				row = infile.readline()
				while row:
					cells = row_to_cells(row[:-1])
					duration_s = int(cells[2].strip())
					duration_m = int(duration_s/60)
					if duration_m in data.keys():
						data[duration_m] += 1
					else:
						data[duration_m] = 1
					row = infile.readline()

	with open(f"{outfpath}", "w") as outfile:

		#Write header
		outfile.write("Tour duration in mins,Tours\n")

		#Write body
		for duration_m in data.keys():
			usage_count = data[duration_m]
			outfile.write(f"{duration_m},{usage_count}\n")
