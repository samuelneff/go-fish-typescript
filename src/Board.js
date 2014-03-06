/// <reference path="Card.ts" />
/// <reference path="ComputerPlayer.ts" />
/// <reference path="Deck.ts" />
/// <reference path="HumanPlayer.ts" />
/// <reference path="jquery.d.ts" />
/// <reference path="Player.ts" />
/// <reference path="Rank.ts" />
/// <reference path="Suit.ts" />
var Board = (function () {
    function Board(deck) {
        this.deck = deck;
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

        var cardCount = parseInt($("#startingCards").val());
        cardCount = Math.max(1, Math.min(this.deck.cardsLeft(), cardCount));

        for (var i = 0; i < cardCount; i++) {
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
            this.announce("No, I don't have any.  Go fish." + (next.cardCount() > 14 ? " :: haha ::" : ""));
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
//# sourceMappingURL=Board.js.map
