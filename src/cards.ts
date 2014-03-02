/// <reference path="jquery.d.ts" />

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

enum Suit {
    SPADE,
    HEART,
    CLUB,
    DIAMOND
}

enum Rank {
    ACE,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    JACK,
    QUEEN,
    KING
}

/**
 * Manages the game board.
 */
class Board {

    private boardName:string;

    private currentPlayer:Player;
    private gameBoard:JQuery;
    private announcement:JQuery;
    private delayEl:JQuery;

    constructor(public deck:Deck) {
        this.boardName = "gameBoard";
        this.gameBoard = $("#gameBoard");
        this.announcement = $("#announcement");
        this.delayEl = $("#delay");

        this.wireEvents();
        this.newGame();
    }

    private wireEvents():void {

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

        for(var i:number = 0; i<17; i++) {
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
        this.runPlayers(p => this.showCards(p, false, $(".cards", p.container)));
        this.runPlayers(p => this.showCards(p, true, $(".stacks", p.container)));
    }

    private showCards(player:Player, isStacks:boolean, container:JQuery):void {

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
            this.announce("No, I don't have any.  Go fish." + (next.cardCount() > 10 ? " :: haha ::" : ""));
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
    }
}

class Deck {

    public cards:Card[] = new Array<Card>();

    constructor() {

        this.shuffle();
    }

    getAllCards():Card[] {
        return this.cards;
    }

    // Shuffle algorithm -> Fisher-Yates 
    // (http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
    shuffle():void {

        this.cards = new Array();

        // enums are just integers so create the deck by looping through the known values
        for (var suitIndex = 0; suitIndex < 4; suitIndex++) {
            for (var rankIndex = 0; rankIndex < 13; rankIndex++) {
                this.cards.push(new Card(suitIndex, rankIndex));
            }
        }

        var curr: number = this.cards.length;
        var swap: Card;
        var random: number;

        while (0 !== curr) {

            random = Math.floor(Math.random() * curr);
            curr -= 1;

            swap = this.cards[curr];

            this.cards[curr] = this.cards[random];
            this.cards[random] = swap;
        }
    }

    cardsLeft() {
        return this.cards.length;
    }

    dealCard():Card {
        return this.cards.shift();
    }
}

class Player {

    public cards:Card[] = new Array<Card>();
    public stacks:Card[] = new Array<Card>();
    public nextPlayer:Player;
    public container:JQuery;

    constructor(public name:String, public board:Board) {

    }

    public clear() {
        this.cards = new Array<Card>();
    }

    public chooseCard(nextStep:(card:Card) => void)
    {
        // should be overridden in child class, if not, we're just going to choose first
        nextStep(this.cards[0]);
    }

    public countCardsLike(card:Card):number
    {
        var count:number = 0;

        this.cards.forEach((handCard:Card) => count += handCard.value == card.value ? 1 : 0);

        return count;
    }

    public addCard(card:Card):void {
        this.cards.push(card);
        this.checkForNewStack();
    }

    public addCards(cards:Card[]):void
    {
        this.cards = this.cards.concat(cards);
        this.checkForNewStack();
    }

    public removeCard(card:Card):Card {
        var a:Card[] = this.cards;
        var i:number = a.length;
        while(i--)
        {
            var other:Card = a[i];
            if (other.value == card.value)
            {
                return a.splice(i, 1)[0];
            }
        }
        return null;
    }

    public removeCards(card:Card):Card[] {
        var removedCards:Card[] = [];

        var removedCard:Card;

        while( (removedCard = this.removeCard(card)) != null)
        {
            removedCards.push(removedCard);
        }

        return removedCards;
    }

    public showCards():boolean {
        return false;
    }

    public cardCount():number {
        return this.cards.length;
    }

    public checkForNewStack():void {
        if (this.cards.length == 0) {
            return;
        }

        this.sortByValue();

        var previousValue:Rank = null;
        var valueCount:number = 0;

        // since we're removing cards from array, must loop backwards
        var cards:Card[] = this.cards;
        var i:number = cards.length;

        while (i--)
        {
            var card:Card = cards[i];
            if (previousValue == card.value)
            {
                valueCount++;

                if (valueCount == 4)
                {
                    this.stacks = this.stacks.concat(cards.splice(i, 4));
                }
            }
            else
            {
                previousValue = card.value;
                valueCount = 1;
            }
        }
    }

    public sortBySuit() {
       this.sort((card:Card) => card.suit, (card:Card) => card.value);
    }

    public sortByValue() {
        this.sort((card:Card) => card.value, (card:Card) => card.suit);
    }

    private sort(sorter1: (card:Card) => number, sorter2: (card:Card) => number ) {
        this.cards.sort((t1:Card, t2:Card) => {
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
        })
    }
}

class HumanPlayer extends Player
{
    constructor(name:String, board:Board)     {
        super(name, board);
    }

    public showCards():boolean {
        return true;
    }

    public chooseCard(nextStep:(card:Card) => void)
    {
        this.board.announce(this.name + ", choose a card.");
        var _this = this;

        $("a", this.container)
            .unbind("click")
            .attr("href", "#")
            .click(function(e:JQueryEventObject) {
                // 'this' refers to the 'a' element
                var card:Card = $(this).data("card");
                _this.choseCard(card);
                nextStep(card);
            });
    }

    private choseCard(card:Card):void {
        $("a", this.container)
            .unbind("click")
            .removeAttr("href");
    }
}

class ComputerPlayer extends Player
{
    constructor(name:String, board:Board)     {
        super(name, board);
    }

    public chooseCard(nextStep:(card:Card) => void)
    {
        var card:Card = this.cards[Math.floor(this.cards.length * Math.random())];
        nextStep(card);
    }
}

class Card {

    constructor(public suit:Suit, public value:Rank) {

    }

    prettySuit():string {
        return Suit[this.suit];
    }

    prettyValue():string {
        return Rank[this.value];
    }

    showCard():string {
        return this.prettyValue() + " " + this.prettySuit();
    }

    imageName():string
    {
        return this.prettySuit() + "-" + this.prettyValue() + ".png";
    }

}

// Entry point

$(document).ready(()=> {

    var deck = new Deck();
    var board = new Board(deck);

});



