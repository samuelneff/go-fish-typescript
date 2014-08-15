/// <reference path="GamePlay.ts" />
/// <reference path="Card.ts" />
/// <reference path="ComputerPlayer.ts" />
/// <reference path="Deck.ts" />
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
var HumanPlayer = (function (_super) {
    __extends(HumanPlayer, _super);
    function HumanPlayer(name, board) {
        _super.call(this, name, board);
    }
    HumanPlayer.prototype.showCards = function () {
        return true;
    };

    HumanPlayer.prototype.chooseCard = function (nextStep) {
        this.gamePlay.announce(this.name + ", choose a card.");
        var _self = this;

        $("a", this.container).unbind("click").attr("href", "#").click(function () {
            // 'this' refers to the 'a' element
            var card = $(this).data("card");
            _self.choseCard();
            nextStep(card);
        });
    };

    HumanPlayer.prototype.choseCard = function () {
        $("a", this.container).unbind("click").removeAttr("href");
    };
    return HumanPlayer;
})(Player);
//# sourceMappingURL=HumanPlayer.js.map
