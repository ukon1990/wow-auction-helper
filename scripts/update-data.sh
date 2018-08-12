#bin/bash
# Items
declare locales=('en_GB' 'de_DE' 'es_ES' 'fr_FR' 'it_IT' 'pl_PL' 'pt_PT' 'ru_RU' 'en_US' 'es_MX' 'pt_BR')
rm items*.json
rm items*.json.gz
rm recipes*.json
rm recipes*.json.gz
rm pets*.json
rm pets*.json.gz

echo ${locales[@]}

for i in ${locales[@]}; do
    echo Downloading locale $i
    curl --header "Content-Type: application/json" --request POST --data '{"timestamp": "2000-06-30T00:00:00.000Z"}' 'http://localhost:3000/api/item?locale='$i'' --output 'items-'$i'.json'
    gzip 'items-'$i'.json'
    curl --header "Content-Type: application/json" --request POST --data '{"timestamp": "2000-06-30T00:00:00.000Z"}' 'http://localhost:3000/api/recipe?locale='$i'' --output 'recipes-'$i'.json'
    gzip 'recipes-'$i'.json'
    curl --header "Content-Type: application/json" --request POST --data '{"timestamp": "2000-06-30T00:00:00.000Z"}' 'http://localhost:3000/api/pet?locale='$i'' --output 'pets-'$i'.json'
    gzip 'pets-'$i'.json'
done    

echo 'Done downloading data'