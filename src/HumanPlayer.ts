/// <reference path="Board.ts" />
/// <reference path="Card.ts" />
/// <reference path="ComputerPlayer.ts" />
/// <reference path="Deck.ts" />
/// <reference path="jquery.d.ts" />
/// <reference path="Player.ts" />
/// <reference path="Rank.ts" />
/// <reference path="Suit.ts" />

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