/// <reference path="Board.ts" />
/// <reference path="Card.ts" />
/// <reference path="ComputerPlayer.ts" />
/// <reference path="HumanPlayer.ts" />
/// <reference path="jquery.d.ts" />
/// <reference path="Player.ts" />
/// <reference path="Rank.ts" />
/// <reference path="Suit.ts" />
var Deck = (function () {
    function Deck() {
        this.cards = new Array();
        this.shuffle();
    }
    Deck.prototype.getAllCards = function () {
        return this.cards;
    };

    // Shuffle algorithm -> Fisher-Yates
    // (http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
    Deck.prototype.shuffle = function () {
        this.cards = new Array();

        for (var suitIndex = 0; suitIndex < 4; suitIndex++) {
            for (var rankIndex = 0; rankIndex < 13; rankIndex++) {
                this.cards.push(new Card(suitIndex, rankIndex));
            }
        }

        var curr = this.cards.length;
        var swap;
        var random;

        while (0 !== curr) {
            random = Math.floor(Math.random() * curr);
            curr -= 1;

            swap = this.cards[curr];

            this.cards[curr] = this.cards[random];
            this.cards[random] = swap;
        }
    };

    Deck.prototype.cardsLeft = function () {
        return this.cards.length;
    };

    Deck.prototype.dealCard = function () {
        return this.cards.shift();
    };
    return Deck;
})();
//# sourceMappingURL=Deck.js.map
