"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NFTCollector = void 0;
const pw_core_1 = require("@lay2/pw-core");
const config_1 = require("../config");
class NFTCollector extends pw_core_1.Collector {
    constructor(indexerUrl) {
        super();
        this.indexer = new pw_core_1.CkbIndexer(indexerUrl);
    }
    collect(address, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!options || !options.neededAmount) {
                throw new Error("'neededAmount' in options must be provided");
            }
            let accCapacity = pw_core_1.Amount.ZERO;
            const terminator = (_index, cell) => {
                if (accCapacity.gte(options.neededAmount != undefined ? options.neededAmount : pw_core_1.Amount.ZERO)) {
                    return { stop: true, push: false };
                }
                if (cell.output_data.length / 2 - 1 > 0 || cell.output.type !== null) {
                    return { stop: false, push: false };
                }
                else {
                    accCapacity = accCapacity.add(new pw_core_1.Amount(cell.output.capacity, pw_core_1.AmountUnit.shannon));
                    return { stop: false, push: true };
                }
            };
            const searchKey = {
                script: address.toLockScript().serializeJson(),
                script_type: pw_core_1.ScriptType.lock,
                filter: {
                    output_data_len_range: ['0x0', '0x1'],
                    script: {
                        code_hash: config_1.NFTTypeScript.code_hash,
                        args: config_1.NFTTypeScript.args,
                        hash_type: pw_core_1.HashType.type,
                    },
                },
            };
            const cells = yield this.indexer.getCells(searchKey, terminator);
            return cells.map(cell => pw_core_1.IndexerCellToCell(cell));
        });
    }
    getBalance(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const searchKey = {
                script: address.toLockScript().serializeJson(),
                script_type: pw_core_1.ScriptType.lock,
                filter: {
                    output_data_len_range: ['0x0', '0x1'],
                    script: {
                        code_hash: config_1.NFTTypeScript.code_hash,
                        args: config_1.NFTTypeScript.args,
                        hash_type: pw_core_1.HashType.type,
                    },
                },
            };
            const cells = (yield this.indexer.getCells(searchKey)).filter((cell) => cell.output.type === null);
            let balance = pw_core_1.Amount.ZERO;
            cells.forEach((cell) => {
                const amount = new pw_core_1.Amount(cell.output.capacity, pw_core_1.AmountUnit.shannon);
                balance = balance.add(amount);
            });
            return balance;
        });
    }
}
exports.NFTCollector = NFTCollector;
//# sourceMappingURL=nft-collector.js.map