/// <reference path="Rank.ts" />
/// <reference path="Suit.ts" />

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