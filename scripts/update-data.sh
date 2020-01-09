#!/usr/bin/env bash
# Items
declare locales=('en_GB' 'de_DE' 'es_ES' 'fr_FR' 'it_IT' 'pl_PL' 'pt_PT' 'ru_RU' 'en_US' 'es_MX' 'pt_BR' 'ko_KR' 'zh_TW')

rm -rf gzip
mkdir gzip
mkdir gzip/pet
mkdir gzip/item
mkdir gzip/recipe
mkdir gzip/npc
mkdir gzip/zone

echo ${locales[@]}

for i in ${locales[@]}; do
    echo Downloading locale $i
    curl -d '{"locale":"'$i'", "timestamp": "2000-06-30T00:00:00.000Z"}' -H "Content-Type: application/json" -X POST 'http://localhost:3000/npc/all' -o 'gzip/npc/'$i'.json.gz'
    curl -d '{"locale":"'$i'", "timestamp": "2000-06-30T00:00:00.000Z"}' -H "Content-Type: application/json" -X POST 'http://localhost:3000/pet' -o 'gzip/pet/'$i'.json.gz'
    curl -d '{"locale":"'$i'", "timestamp": "2000-06-30T00:00:00.000Z"}' -H "Content-Type: application/json" -X POST 'http://localhost:3000/item' -o 'gzip/item/'$i'.json.gz'
    curl -d '{"locale":"'$i'", "timestamp": "2000-06-30T00:00:00.000Z"}' -H "Content-Type: application/json" -X POST 'http://localhost:3000/recipe' -o 'gzip/recipe/'$i'.json.gz'
    curl -d '{"locale":"'$i'", "timestamp": "2000-06-30T00:00:00.000Z"}' -H "Content-Type: application/json" -X POST 'http://localhost:3000/zone' -o 'gzip/zone/'$i'.json.gz'
done

#mv json/*.gzip gzip/

echo 'Done downloading data'
