#!/bin/bash

#Download and unpack all sprites from https://www.spriters-resource.com/nintendo_switch/pokemonhome/
#Author(s)		: Lukas Mirow
#Date of creation	: 2023-12-02


set -e


LINKS="https://www.spriters-resource.com/download/125927/ https://www.spriters-resource.com/download/125928/ https://www.spriters-resource.com/download/125929/ https://www.spriters-resource.com/download/125930/ https://www.spriters-resource.com/download/125931/ https://www.spriters-resource.com/download/125932/ https://www.spriters-resource.com/download/125933/"


#Downloading
echo "=====Downloading====="
counter=0
for link in $LINKS
do
	counter="$((${counter}+1))"
	target_fname="gen${counter}.zip"
	echo "-----Downloading \`${target_fname}\`-----"
	if [ -f "${target_fname}" ]
	then
		echo "${target_fname} already exists, skipping..."
	else
		wget --output-document="${target_fname}" "${link}"
	fi
done

#Unpacking
counter=0
EXTRACT_PATTERN='*/poke_capture_????_000_??_n_00000000_f_n.png'
echo "=====Unpacking====="
for zipfile in gen?.zip
do
	counter="$((${counter}+1))"
	echo "-----Unpacking \`${zipfile}\`-----"
	unzip -q -n "${zipfile}" "${EXTRACT_PATTERN}" -d . "${zipfile}"
done

#Moving files into place
GENDERS="uk fo mo mf fd md"
echo "=====Moving files into place====="
for i in {1..790}
do
	#Get sprite for the first matching gender
	id="$(printf '%04d' "${i}")"
	for gender in ${GENDERS}
	do
		# echo "Gender: \`${gender}\`"
		f="Pokemon HOME/Pokemon Previews/poke_capture_${id}_000_${gender}_n_00000000_f_n.png"
		# echo "f: \`${f}\`"
		if [ -f "${f}" ]
		then
			mv --verbose "${f}" ./
			break
		fi
		if [ "${gender}" == "md" ]
		then
			echo "No matching sprite for ${id} found" >&2
			exit 1
		fi
	done
done
cp --verbose '../../missingno.png' './'

#Cleanup
echo "=====Cleaning up====="
rm --recursive --force 'Pokemon HOME'
