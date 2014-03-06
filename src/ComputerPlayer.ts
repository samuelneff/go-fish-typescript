/// <reference path="GamePlay.ts" />
/// <reference path="Card.ts" />
/// <reference path="Deck.ts" />
/// <reference path="HumanPlayer.ts" />
/// <reference path="jquery.d.ts" />
/// <reference path="Player.ts" />
/// <reference path="Rank.ts" />
/// <reference path="Suit.ts" />

class ComputerPlayer extends Player
{
    constructor(name:String, board:GamePlay)     {
        super(name, board);
    }

    public chooseCard(nextStep:(card:Card) => void)
    {
        var card:Card = this.cards[Math.floor(this.cards.length * Math.random())];
        nextStep(card);
    }
}