/// <reference path="GamePlay.ts" />
/// <reference path="Card.ts" />
/// <reference path="ComputerPlayer.ts" />
/// <reference path="HumanPlayer.ts" />
/// <reference path="jquery.d.ts" />
/// <reference path="Player.ts" />
/// <reference path="Rank.ts" />
/// <reference path="Suit.ts" />

class Deck {

    public cards:Card[] = [];

    constructor() {

        this.shuffle();
    }

    getAllCards():Card[] {
        return this.cards;
    }

    // Shuffle algorithm -> Fisher-Yates 
    // (http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
    shuffle():void {

        this.cards = [];

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