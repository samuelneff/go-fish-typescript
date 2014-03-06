/// <reference path="Rank.ts" />
/// <reference path="Suit.ts" />
var Card = (function () {
    function Card(suit, value) {
        this.suit = suit;
        this.value = value;
    }
    Card.prototype.prettySuit = function () {
        return Suit[this.suit];
    };

    Card.prototype.prettyValue = function () {
        return Rank[this.value];
    };

    Card.prototype.showCard = function () {
        return this.prettyValue() + " " + this.prettySuit();
    };

    Card.prototype.imageName = function () {
        return this.prettySuit() + "-" + this.prettyValue() + ".png";
    };
    return Card;
})();
//# sourceMappingURL=Card.js.map
