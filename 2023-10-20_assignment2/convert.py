#!/usr/bin/python

#Convert data from OsloBysykkel in raw/ to processed data in cooked/
#Author(s)		: Lukas Mirow
#Date of creation	: 2023-10-06

import stations


if __name__ == "__main__":
	print("-----Writing per-month station CSV files-----")
	stations.write_stations()
	print("-----Writing per-date station usage CSV file-----")
	stations.write_stations_per_date()
	print("-----Writing per-hour station usage CSV file-----")
	stations.write_station_use_hours()
