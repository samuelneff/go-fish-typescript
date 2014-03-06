/// <reference path="GamePlay.ts" />
/// <reference path="Card.ts" />
/// <reference path="ComputerPlayer.ts" />
/// <reference path="Deck.ts" />
/// <reference path="HumanPlayer.ts" />
/// <reference path="jquery.d.ts" />
/// <reference path="Rank.ts" />
/// <reference path="Suit.ts" />

class Player {

    public cards:Card[] = [];
    public stacks:Card[] = [];
    public nextPlayer:Player;
    public container:JQuery;

    constructor(public name:String, public gamePlay:GamePlay) {

    }

    public clear() {
        this.cards = [];
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