/// <reference path="GamePlay.ts" />
/// <reference path="Card.ts" />
/// <reference path="ComputerPlayer.ts" />
/// <reference path="Deck.ts" />
/// <reference path="HumanPlayer.ts" />
/// <reference path="jquery.d.ts" />
/// <reference path="Player.ts" />
/// <reference path="Rank.ts" />
/// <reference path="Suit.ts" />
$(document).ready(function () {
    var deck = new Deck();
    var board = new GamePlay(deck);
});
//# sourceMappingURL=cards.js.map
