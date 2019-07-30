#!/usr/bin/env bash
# Items
declare locales=('en_GB' 'de_DE' 'es_ES' 'fr_FR' 'it_IT' 'pl_PL' 'pt_PT' 'ru_RU' 'en_US' 'es_MX' 'pt_BR' 'ko_KR' 'zh_TW')

rm -rf json
rm -rf gzip
mkdir json
mkdir gzip

echo ${locales[@]}

for i in ${locales[@]}; do
    echo Downloading locale $i
    curl --header "Content-Type: application/json" --request POST --data '{"timestamp": "2000-06-30T00:00:00.000Z"}' 'http://localhost:3000/api/item?locale='$i'' --output 'json/items-'$i'.json'
    gzip < 'json/items-'$i'.json' > 'gzip/items-'$i'.json.gz'
    curl --header "Content-Type: application/json" --request POST --data '{"timestamp": "2000-06-30T00:00:00.000Z"}' 'http://localhost:3000/api/recipe?locale='$i'' --output 'json/recipes-'$i'.json'
    gzip < 'json/recipes-'$i'.json' > 'gzip/recipes-'$i'.json.gz'
    curl --header "Content-Type: application/json" --request POST --data '{"timestamp": "2000-06-30T00:00:00.000Z"}' 'http://localhost:3000/api/pet?locale='$i'' --output 'json/pets-'$i'.json'
    gzip < 'json/pets-'$i'.json' > 'gzip/pets-'$i'.json.gz'
done

#mv json/*.gzip gzip/

echo 'Done downloading data'
