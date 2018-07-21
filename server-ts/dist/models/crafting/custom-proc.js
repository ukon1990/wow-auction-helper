"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_service_1 = require("../../services/shared.service");
class CustomProcs {
    static get(recipe) {
        return shared_service_1.SharedService.customProcsMap[recipe.spellID] ?
            shared_service_1.SharedService.customProcsMap[recipe.spellID].rate : recipe.minCount;
    }
    static add(recipe) {
        if (!shared_service_1.SharedService.customProcsMap[recipe.spellID]) {
            const customProc = new CustomProc(recipe);
            shared_service_1.SharedService.customProcsMap[recipe.spellID] = customProc;
            shared_service_1.SharedService.user.customProcs.unshift(customProc);
            CustomProcs.save();
        }
    }
    static remove(customProc, index) {
        shared_service_1.SharedService.user.customProcs.splice(index, 1);
        delete shared_service_1.SharedService.customProcsMap[customProc.spellID];
        CustomProcs.save();
    }
    static createMap(customProcs) {
        customProcs.forEach(c => shared_service_1.SharedService.customProcsMap[c.spellID] = c);
    }
    static save() {
        localStorage['custom_procs'] = JSON.stringify(shared_service_1.SharedService.user.customProcs);
    }
}
exports.CustomProcs = CustomProcs;
class CustomProc {
    constructor(recipe) {
        if (recipe) {
            this.spellID = recipe.spellID;
            this.itemID = recipe.itemID;
            this.name = recipe.name;
            this.profession = recipe.profession;
            this.rank = recipe.rank;
            this.rate = recipe.minCount;
        }
    }
}
exports.CustomProc = CustomProc;
//# sourceMappingURL=custom-proc.js.map