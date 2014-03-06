/// <reference path="GamePlay.ts" />
/// <reference path="Card.ts" />
/// <reference path="Deck.ts" />
/// <reference path="HumanPlayer.ts" />
/// <reference path="jquery.d.ts" />
/// <reference path="Player.ts" />
/// <reference path="Rank.ts" />
/// <reference path="Suit.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ComputerPlayer = (function (_super) {
    __extends(ComputerPlayer, _super);
    function ComputerPlayer(name, board) {
        _super.call(this, name, board);
    }
    ComputerPlayer.prototype.chooseCard = function (nextStep) {
        var card = this.cards[Math.floor(this.cards.length * Math.random())];
        nextStep(card);
    };
    return ComputerPlayer;
})(Player);
//# sourceMappingURL=ComputerPlayer.js.map
