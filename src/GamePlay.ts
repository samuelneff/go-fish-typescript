/// <reference path="Card.ts" />
/// <reference path="ComputerPlayer.ts" />
/// <reference path="Deck.ts" />
/// <reference path="HumanPlayer.ts" />
/// <reference path="jquery.d.ts" />
/// <reference path="Player.ts" />
/// <reference path="Rank.ts" />
/// <reference path="Suit.ts" />

class GamePlay {

    private currentPlayer:Player;
    private gameBoard:JQuery;
    private announcement:JQuery;
    private delayEl:JQuery;

    constructor(public deck:Deck) {
        this.gameBoard = $("#gameBoard");
        this.announcement = $("#announcement");
        this.delayEl = $("#delay");

        this.newGame();
    }

    private delay():number
    {
        return parseInt(this.delayEl.val());
    }
    private newGame():void {

        var human:Player = new HumanPlayer("Human", this);
        var computer:Player = new ComputerPlayer("Computer", this);

        human.nextPlayer = computer;
        computer.nextPlayer = human;

        this.currentPlayer = human;

        this.deck.shuffle();

        var cardCount:number = parseInt($("#startingCards").val());
        cardCount = Math.max(1, Math.min(Math.floor(this.deck.cardsLeft() / 2), cardCount));

        for(var i:number = 0; i<cardCount; i++) {
            human.addCard(this.deck.dealCard());
            computer.addCard(this.deck.dealCard());
        }

        this.drawContainers();
        this.showBoard();
        this.playMove();
    }

    private drawContainers():void {
        this.runPlayers(p => {
            var container:JQuery = $("<div>");
            container.addClass("player");
            container.append($("<h1>" + p.name + "</h1>"));
            container.append($("<div class='cards'></div>"));
            container.append($("<div class='stacks'></div>"));
            this.gameBoard.append(container);
            p.container = container;
        });
    }

    private showBoard():void {
        this.runPlayers(p => GamePlay.showCards(p, false, $(".cards", p.container)));
        this.runPlayers(p => GamePlay.showCards(p, true, $(".stacks", p.container)));
    }

    private static showCards(player:Player, isStacks:boolean, container:JQuery):void {

        container.empty();

        var showLinks:boolean = !isStacks && player.showCards();
        var showCards:boolean = isStacks || player.showCards();

        if (player.showCards() && !isStacks)
        {
            player.sortByValue();
        }
        var cards:Card[] = isStacks ? player.stacks : player.cards;

        for(var i:number = 0; i<cards.length; i++) {

            var $el:JQuery;

            $el = $(showLinks ? "<a>" : "<span>");
            $el.addClass("card");
            var image:string = "url(images/cards/" + (showCards ? cards[i].imageName() : "back.png") + ")";
            $el.css("background-image", image);
            $el.data("card", cards[i]);

            container.append($el);
        }

    }

    private runPlayers(action: (player:Player) => void) {
        var player:Player = this.currentPlayer;
        do
        {
            action(player);
            player = player.nextPlayer;
        } while (player != this.currentPlayer);
    }

    private gameOver():boolean
    {
        if (this.deck.cardsLeft() == 0)
        {
            var currentCount:number = this.currentPlayer.stacks.length;
            var nextCount:number = this.currentPlayer.nextPlayer.stacks.length;

            var winner:string;

            if (currentCount == nextCount)
            {
                winner = "Both players have " + currentCount + " stacked cards. It's a draw.";
            }
            else if (currentCount > nextCount)
            {
                winner = this.currentPlayer.name + " won with " + currentCount + " cards.";
            }
            else
            {
                winner = this.currentPlayer.nextPlayer.name + " won with " + nextCount + " cards.";
            }
            this.announce("Game over, all cards dealt. " + winner);
            return true;
        }
        return false;
    }

    private playMove():void {
        // make sure player has at least one card
        if (this.currentPlayer.cardCount() == 0)
        {
            if (this.gameOver())
            {
                return;
            }
            this.currentPlayer.addCard(this.deck.dealCard());
        }
        this.currentPlayer.chooseCard(card => this.playMoveAsk(card));
    }

    private playMoveAsk(card:Card):void {
        this.announce(this.currentPlayer.nextPlayer.name + ", do you have any " + card.prettyValue() + "?");
        setTimeout(() => this.playMoveRespond(card), this.delay());
    }

    private playMoveRespond(card:Card):void {

        var next:Player = this.currentPlayer.nextPlayer;
        var hasCount:number = next.countCardsLike(card);

        if (hasCount)
        {
            this.announce("Yes, I have " + hasCount + " of them." + (hasCount == 1 ? "" : " :: sigh ::"));
            this.currentPlayer.addCards(next.removeCards(card));
            this.showBoard();
            this.playNext();
        }
        else
        {
            this.announce("No, I don't have any.  Go fish." + (next.cardCount() > 14 ? " :: haha ::" : ""));
            setTimeout(() => this.playGoFish(card), this.delay());
        }
    }

    private playGoFish(askedCard:Card):void
    {
        if (this.gameOver())
        {
            return;
        }
        var deltCard:Card = this.deck.dealCard();

        this.announce(
            (this.currentPlayer.showCards() ? "You" : this.currentPlayer.name) +
                " drew a " +
                (this.currentPlayer.showCards() || askedCard.value == deltCard.value ? deltCard.showCard() : "card") +
                "." +
                (askedCard.value == deltCard.value ? "  Go Again!!" : ""));

        this.currentPlayer.addCard(deltCard);
        this.showBoard();

        if (deltCard.value == askedCard.value)
        {
            setTimeout(() => this.playMove(), this.delay());
        }
        else
        {
            this.playNext();
        }
    }

    private playNext():void {
        this.currentPlayer = this.currentPlayer.nextPlayer;
        setTimeout(() => this.playMove(), this.delay());
    }

    public announce(message:string):void {
        this.announcement.text(message);

        $("div.logs").append($("<div>").text(message));
        $("div.logContainer").scrollTop($("div.logContainer")[0].scrollHeight);
    }
}
