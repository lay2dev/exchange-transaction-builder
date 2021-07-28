"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeployBuilder = void 0;
var pw_core_1 = require("@lay2/pw-core");
var DeployBuilder = /** @class */ (function (_super) {
    __extends(DeployBuilder, _super);
    function DeployBuilder(address, amount, withType, options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, options.feeRate, options.collector, options.witnessArgs) || this;
        _this.address = address;
        _this.amount = amount;
        _this.withType = withType;
        _this.options = options;
        _this.SYSTEM_TYPE_ID = "0x00000000000000000000000000000000000000000000000000545950455f4944";
        return _this;
    }
    DeployBuilder.prototype.build = function (fee) {
        if (fee === void 0) { fee = pw_core_1.Amount.ZERO; }
        return __awaiter(this, void 0, void 0, function () {
            var outputCell, neededAmount, inputSum, inputCells, cells, _i, cells_1, cell, firstInput, blake, args, changeCell, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        outputCell = new pw_core_1.Cell(this.amount, this.address.toLockScript());
                        neededAmount = this.amount
                            .add(pw_core_1.Builder.MIN_CHANGE)
                            .add(pw_core_1.Builder.MIN_CHANGE)
                            .add(fee);
                        inputSum = new pw_core_1.Amount('0');
                        inputCells = [];
                        return [4 /*yield*/, this.collector.collect(pw_core_1.default.provider.address, {
                                neededAmount: neededAmount,
                            })];
                    case 1:
                        cells = _a.sent();
                        for (_i = 0, cells_1 = cells; _i < cells_1.length; _i++) {
                            cell = cells_1[_i];
                            inputCells.push(cell);
                            inputSum = inputSum.add(cell.capacity);
                            if (inputSum.gte(neededAmount))
                                break;
                        }
                        if (inputSum.lt(neededAmount)) {
                            throw new Error("input capacity not enough,need " + neededAmount.toString(pw_core_1.AmountUnit.ckb) + ",got " + inputSum.toString(pw_core_1.AmountUnit.ckb));
                        }
                        if (this.withType) {
                            firstInput = pw_core_1.SerializeCellInput(inputCells[0]);
                            blake = new pw_core_1.Blake2bHasher;
                            blake.update(firstInput);
                            args = "0x" + blake.digest();
                            outputCell.type = new pw_core_1.Script(this.SYSTEM_TYPE_ID, args, pw_core_1.HashType.type);
                        }
                        changeCell = new pw_core_1.Cell(inputSum.sub(outputCell.capacity), pw_core_1.default.provider.address.toLockScript());
                        tx = new pw_core_1.Transaction(new pw_core_1.RawTransaction(inputCells, [outputCell, changeCell]), [pw_core_1.Builder.WITNESS_ARGS.Secp256k1]);
                        this.fee = pw_core_1.Builder.calcFee(tx, this.feeRate);
                        changeCell.capacity = changeCell.capacity.sub(this.fee);
                        tx.raw.outputs.pop();
                        tx.raw.outputs.push(changeCell);
                        return [2 /*return*/, tx];
                }
            });
        });
    };
    return DeployBuilder;
}(pw_core_1.Builder));
exports.DeployBuilder = DeployBuilder;
//# sourceMappingURL=builder.js.map