/// <reference path="jquery.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/**
* Simple card game, we implement all classes and constructs within this one
* file for simplicity.
*
* Finish the implementation for <code>Player</code> and <code>Deck</code>. Implement dealing to certain
* hands and showing the hand contents. You can then choose what you want to do after that.
*
* - Implement a game (e.g. BlackJack, Poker, etc.)
* - Show pictures for the cards.
* - Add a server component and have a two player game.
*/
// Constructs
var Suit;
(function (Suit) {
    Suit[Suit["SPADE"] = 0] = "SPADE";
    Suit[Suit["HEART"] = 1] = "HEART";
    Suit[Suit["CLUB"] = 2] = "CLUB";
    Suit[Suit["DIAMOND"] = 3] = "DIAMOND";
})(Suit || (Suit = {}));

var Rank;
(function (Rank) {
    Rank[Rank["ACE"] = 0] = "ACE";
    Rank[Rank["2"] = 1] = "2";
    Rank[Rank["3"] = 2] = "3";
    Rank[Rank["4"] = 3] = "4";
    Rank[Rank["5"] = 4] = "5";
    Rank[Rank["6"] = 5] = "6";
    Rank[Rank["7"] = 6] = "7";
    Rank[Rank["8"] = 7] = "8";
    Rank[Rank["9"] = 8] = "9";
    Rank[Rank["10"] = 9] = "10";
    Rank[Rank["JACK"] = 10] = "JACK";
    Rank[Rank["QUEEN"] = 11] = "QUEEN";
    Rank[Rank["KING"] = 12] = "KING";
})(Rank || (Rank = {}));

/**
* Manages the game board.
*/
var Board = (function () {
    function Board(deck) {
        this.deck = deck;
        this.boardName = "gameBoard";
        this.gameBoard = $("#gameBoard");
        this.announcement = $("#announcement");
        this.delayEl = $("#delay");

        this.wireEvents();
        this.newGame();
    }
    Board.prototype.wireEvents = function () {
    };

    Board.prototype.delay = function () {
        return parseInt(this.delayEl.val());
    };
    Board.prototype.newGame = function () {
        var human = new HumanPlayer("Human", this);
        var computer = new ComputerPlayer("Computer", this);
        human.nextPlayer = computer;
        computer.nextPlayer = human;

        this.currentPlayer = human;

        this.deck.shuffle();

        for (var i = 0; i < 17; i++) {
            human.addCard(this.deck.dealCard());
            computer.addCard(this.deck.dealCard());
        }

        this.drawContainers();
        this.showBoard();
        this.playMove();
    };

    Board.prototype.drawContainers = function () {
        var _this = this;
        this.runPlayers(function (p) {
            var container = $("<div>");
            container.addClass("player");
            container.append($("<h1>" + p.name + "</h1>"));
            container.append($("<div class='cards'></div>"));
            container.append($("<div class='stacks'></div>"));
            _this.gameBoard.append(container);
            p.container = container;
        });
    };

    Board.prototype.showBoard = function () {
        var _this = this;
        this.runPlayers(function (p) {
            return _this.showCards(p, false, $(".cards", p.container));
        });
        this.runPlayers(function (p) {
            return _this.showCards(p, true, $(".stacks", p.container));
        });
    };

    Board.prototype.showCards = function (player, isStacks, container) {
        container.empty();

        var showLinks = !isStacks && player.showCards();
        var showCards = isStacks || player.showCards();

        if (player.showCards() && !isStacks) {
            player.sortByValue();
        }
        var cards = isStacks ? player.stacks : player.cards;

        for (var i = 0; i < cards.length; i++) {
            var $el;

            $el = $(showLinks ? "<a>" : "<span>");
            $el.addClass("card");
            var image = "url(images/cards/" + (showCards ? cards[i].imageName() : "back.png") + ")";
            $el.css("background-image", image);
            $el.data("card", cards[i]);

            container.append($el);
        }
    };

    Board.prototype.runPlayers = function (action) {
        var player = this.currentPlayer;
        do {
            action(player);
            player = player.nextPlayer;
        } while(player != this.currentPlayer);
    };

    Board.prototype.gameOver = function () {
        if (this.deck.cardsLeft() == 0) {
            var currentCount = this.currentPlayer.stacks.length;
            var nextCount = this.currentPlayer.nextPlayer.stacks.length;

            var winner;

            if (currentCount == nextCount) {
                winner = "Both players have " + currentCount + " stacked cards. It's a draw.";
            } else if (currentCount > nextCount) {
                winner = this.currentPlayer.name + " won with " + currentCount + " cards.";
            } else {
                winner = this.currentPlayer.nextPlayer.name + " won with " + nextCount + " cards.";
            }
            this.announce("Game over, all cards dealt. " + winner);
            return true;
        }
        return false;
    };

    Board.prototype.playMove = function () {
        var _this = this;
        // make sure player has at least one card
        if (this.currentPlayer.cardCount() == 0) {
            if (this.gameOver()) {
                return;
            }
            this.currentPlayer.addCard(this.deck.dealCard());
        }
        this.currentPlayer.chooseCard(function (card) {
            return _this.playMoveAsk(card);
        });
    };

    Board.prototype.playMoveAsk = function (card) {
        var _this = this;
        this.announce(this.currentPlayer.nextPlayer.name + ", do you have any " + card.prettyValue() + "?");
        setTimeout(function () {
            return _this.playMoveRespond(card);
        }, this.delay());
    };

    Board.prototype.playMoveRespond = function (card) {
        var _this = this;
        var next = this.currentPlayer.nextPlayer;
        var hasCount = next.countCardsLike(card);

        if (hasCount) {
            this.announce("Yes, I have " + hasCount + " of them." + (hasCount == 1 ? "" : " :: sigh ::"));
            this.currentPlayer.addCards(next.removeCards(card));
            this.showBoard();
            this.playNext();
        } else {
            this.announce("No, I don't have any.  Go fish." + (next.cardCount() > 10 ? " :: haha ::" : ""));
            setTimeout(function () {
                return _this.playGoFish(card);
            }, this.delay());
        }
    };

    Board.prototype.playGoFish = function (askedCard) {
        var _this = this;
        if (this.gameOver()) {
            return;
        }
        var deltCard = this.deck.dealCard();

        this.announce((this.currentPlayer.showCards() ? "You" : this.currentPlayer.name) + " drew a " + (this.currentPlayer.showCards() || askedCard.value == deltCard.value ? deltCard.showCard() : "card") + "." + (askedCard.value == deltCard.value ? "  Go Again!!" : ""));

        this.currentPlayer.addCard(deltCard);
        this.showBoard();

        if (deltCard.value == askedCard.value) {
            setTimeout(function () {
                return _this.playMove();
            }, this.delay());
        } else {
            this.playNext();
        }
    };

    Board.prototype.playNext = function () {
        var _this = this;
        this.currentPlayer = this.currentPlayer.nextPlayer;
        setTimeout(function () {
            return _this.playMove();
        }, this.delay());
    };

    Board.prototype.announce = function (message) {
        this.announcement.text(message);
    };
    return Board;
})();

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

var HumanPlayer = (function (_super) {
    __extends(HumanPlayer, _super);
    function HumanPlayer(name, board) {
        _super.call(this, name, board);
    }
    HumanPlayer.prototype.showCards = function () {
        return true;
    };

    HumanPlayer.prototype.chooseCard = function (nextStep) {
        this.board.announce(this.name + ", choose a card.");
        var _this = this;

        $("a", this.container).unbind("click").attr("href", "#").click(function (e) {
            // 'this' refers to the 'a' element
            var card = $(this).data("card");
            _this.choseCard(card);
            nextStep(card);
        });
    };

    HumanPlayer.prototype.choseCard = function (card) {
        $("a", this.container).unbind("click").removeAttr("href");
    };
    return HumanPlayer;
})(Player);

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

// Entry point
$(document).ready(function () {
    var deck = new Deck();
    var board = new Board(deck);
});
//# sourceMappingURL=cards.js.map
