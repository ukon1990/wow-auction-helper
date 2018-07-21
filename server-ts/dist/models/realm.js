"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_service_1 = require("../services/shared.service");
const user_1 = require("./user/user");
class Realm {
    constructor() {
        this.connected_realms = new Array();
    }
    static gatherRealms() {
        const tmpMap = new Map();
        shared_service_1.SharedService.userRealms = new Array();
        shared_service_1.SharedService.user.characters.forEach(character => {
            if (!tmpMap[character.realm]) {
                const realm = shared_service_1.SharedService.realms[user_1.User.slugifyString(character.realm)];
                tmpMap[character.realm] = realm;
            }
        });
        Object.keys(tmpMap).forEach(key => shared_service_1.SharedService.userRealms.push(tmpMap[key]));
    }
}
exports.Realm = Realm;
//# sourceMappingURL=realm.js.map