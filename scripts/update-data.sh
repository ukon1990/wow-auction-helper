# Items
array ()
rm items*.json
curl --header "Content-Type: application/json" --request POST --data '{}' http://localhost:3000/api/item?locale=pt_PT --output items-pt_PT.json
gzip items-pt_PT.json