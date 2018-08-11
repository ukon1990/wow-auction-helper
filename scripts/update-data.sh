#bin/bash
# Items
declare locales=('en_GB' 'de_DE' 'es_ES' 'fr_FR' 'it_IT' 'pl_PL' 'pt_PT' 'ru_RU' 'en_US' 'es_MX' 'pt_BR')
rm items*.json
rm recipes*.json
rm pets*.json

echo ${locales[@]}

for i in ${locales[@]}; do
    echo Downloading locale ${locales[$i]}
    curl --header "Content-Type: application/json" --request POST --data '{}' http://localhost:3000/api/item?locale=${locales[$i]} --output items-${locales[$i]}.json
    gzip items-${locales[$i]}.json
    curl --header "Content-Type: application/json" --request POST --data '{}' http://localhost:3000/api/recipe?locale=${locales[$i]} --output recipes-${locales[$i]}.json
    gzip recipes-${locales[$i]}.json
    curl --header "Content-Type: application/json" --request POST --data '{}' http://localhost:3000/api/pets?locale=${locales[$i]} --output pets-${locales[$i]}.json
    gzip pets-${locales[$i]}.json
done    