/// <reference path="GamePlay.ts" />
/// <reference path="Card.ts" />
/// <reference path="ComputerPlayer.ts" />
/// <reference path="Deck.ts" />
/// <reference path="jquery.d.ts" />
/// <reference path="Player.ts" />
/// <reference path="Rank.ts" />
/// <reference path="Suit.ts" />

class HumanPlayer extends Player
{
    constructor(name:String, board:GamePlay)     {
        super(name, board);
    }

    public showCards():boolean {
        return true;
    }

    public chooseCard(nextStep:(card:Card) => void)
    {
        this.gamePlay.announce(this.name + ", choose a card.");
        var _this = this;

        $("a", this.container)
            .unbind("click")
            .attr("href", "#")
            .click(function() {
                // 'this' refers to the 'a' element
                var card:Card = $(this).data("card");
                _this.choseCard();
                nextStep(card);
            });
    }

    private choseCard():void {
        $("a", this.container)
            .unbind("click")
            .removeAttr("href");
    }
}