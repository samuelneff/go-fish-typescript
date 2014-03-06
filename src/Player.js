/// <reference path="Board.ts" />
/// <reference path="Card.ts" />
/// <reference path="ComputerPlayer.ts" />
/// <reference path="Deck.ts" />
/// <reference path="HumanPlayer.ts" />
/// <reference path="jquery.d.ts" />
/// <reference path="Rank.ts" />
/// <reference path="Suit.ts" />
var Player = (function () {
    function Player(name, board) {
        this.name = name;
        this.board = board;
        this.cards = new Array();
        this.stacks = new Array();
    }
    Player.prototype.clear = function () {
        this.cards = new Array();
    };

    Player.prototype.chooseCard = function (nextStep) {
        // should be overridden in child class, if not, we're just going to choose first
        nextStep(this.cards[0]);
    };

    Player.prototype.countCardsLike = function (card) {
        var count = 0;

        this.cards.forEach(function (handCard) {
            return count += handCard.value == card.value ? 1 : 0;
        });

        return count;
    };

    Player.prototype.addCard = function (card) {
        this.cards.push(card);
        this.checkForNewStack();
    };

    Player.prototype.addCards = function (cards) {
        this.cards = this.cards.concat(cards);
        this.checkForNewStack();
    };

    Player.prototype.removeCard = function (card) {
        var a = this.cards;
        var i = a.length;
        while (i--) {
            var other = a[i];
            if (other.value == card.value) {
                return a.splice(i, 1)[0];
            }
        }
        return null;
    };

    Player.prototype.removeCards = function (card) {
        var removedCards = [];

        var removedCard;

        while ((removedCard = this.removeCard(card)) != null) {
            removedCards.push(removedCard);
        }

        return removedCards;
    };

    Player.prototype.showCards = function () {
        return false;
    };

    Player.prototype.cardCount = function () {
        return this.cards.length;
    };

    Player.prototype.checkForNewStack = function () {
        if (this.cards.length == 0) {
            return;
        }

        this.sortByValue();

        var previousValue = null;
        var valueCount = 0;

        // since we're removing cards from array, must loop backwards
        var cards = this.cards;
        var i = cards.length;

        while (i--) {
            var card = cards[i];
            if (previousValue == card.value) {
                valueCount++;

                if (valueCount == 4) {
                    this.stacks = this.stacks.concat(cards.splice(i, 4));
                }
            } else {
                previousValue = card.value;
                valueCount = 1;
            }
        }
    };

    Player.prototype.sortBySuit = function () {
        this.sort(function (card) {
            return card.suit;
        }, function (card) {
            return card.value;
        });
    };

    Player.prototype.sortByValue = function () {
        this.sort(function (card) {
            return card.value;
        }, function (card) {
            return card.suit;
        });
    };

    Player.prototype.sort = function (sorter1, sorter2) {
        this.cards.sort(function (t1, t2) {
            var v1 = sorter1(t1);
            var v2 = sorter1(t2);

            if (v1 < v2) {
                return -1;
            }
            if (v1 > v2) {
                return 1;
            }

            v1 = sorter2(t1);
            v2 = sorter2(t2);
            if (v1 < v2) {
                return -1;
            }
            if (v1 > v2) {
                return 1;
            }

            return 0;
        });
    };
    return Player;
})();
//# sourceMappingURL=Player.js.map
