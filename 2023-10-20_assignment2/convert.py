#!/usr/bin/python

#Convert data from OsloBysykkel in raw/ to processed data in cooked/
#Author(s)		: Lukas Mirow
#Date of creation	: 2023-10-06

import stations


if __name__ == "__main__":
	stations.write_stations()
