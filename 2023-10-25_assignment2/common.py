#!/usr/bin/python

#Common functions for DataVisualization assignment 2
#Author(s)		: Lukas Mirow
#Date of creation	: 2023-10-06


#Convert a CSV row with quoted strings into a Python array of strings
def row_to_cells(row):
	if '"' in row:
		ret = []
		parts = row.split('"')
		for i in range(len(parts)):
			if i % 2 == 0: #Even part (parts 0, 2, 4, ...)
				part2add = parts[i].split(",")
				if part2add[0].strip() == "":
					part2add = part2add[1:]
				if part2add[-1].strip() == "":
					part2add = part2add[:-1]
				ret += part2add
			else: #Odd part (parts 1, 3, 5, ...)
				ret.append(parts[i])
		return ret
	else:
		return row.split(",")
