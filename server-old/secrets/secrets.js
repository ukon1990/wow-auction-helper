const local = false;


var databaseConn = {
	host: local ? 'localhost' : '217.170.198.43',
	user: local ? 'root' : '100680_ri31956',
	password: local ? 'root' : 'P4rt1sj0n132',
	database: '100680-wah'
};

module.exports.apikey = local ? 'da2pynxu5vnhzzfu778q49ff62jc6dfk' : 'qpchg6w7bhn9vxnpgycnpd9ve6wdjtat';
module.exports.databaseConn = databaseConn;
