#!/usr/bin/python

#Convert the Pokemon CSV to JSON
#Author(s)		: Lukas Mirow
#Date of creation	: 2023-12-04


import csv
from os import path


CSV_PATH = "pokemon.csv"
JSON_PATH = path.join("website", "pokemon.js")


def convert():
	ret = []
	row_count = 0
	header = None
	with open(CSV_PATH, "r") as infile:
		csvr = csv.reader(infile, delimiter=",", quotechar='"')
		for row in csvr:

			#Save header information from the first row
			if row_count == 0:
				header = row

			#Else append dicts to `ret`
			else:
				to_add = {}
				for i in range(len(row)):
					column = header[i]
					cell = row[i]
					to_add[column] = cell
				ret.append(to_add)
			row_count += 1

	return ret

if __name__ == "__main__":
	with open(JSON_PATH, "w") as outfile:
		outfile.write(f"const DATA = {convert()}\n")
