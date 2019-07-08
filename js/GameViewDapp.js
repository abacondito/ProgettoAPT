// Documentation
// https://github.com/ethereum/wiki/wiki/JavaScript-API

//1. Caricare web3 e lanciare la funzione startApp (che lavora come una main)
window.addEventListener('load', function () {

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider
        web3 = new Web3(web3.currentProvider);
    } else {
        console.log('No web3? You should consider trying MetaMask!')
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    // Now you can start your app & access web3 freely:
    startApp()

});


//creo una variabile globale per l'address del contratto
var arenaAddress= '0xaf0db5d6eb6fea6f68c1ba267d0e36c5c5977f00';
var myaddress = web3.eth.accounts[0];

var nomePartita='a';//Nome partita




var startApp = function () {
    //quando il documento è pronto
    $(document).ready(function () {


        //event listener join game
        $("#joinMatch").click(function(){

            //recupera simbolo partita dal form
            nomePartita=document.getElementById("password").value;

            showGame(nomePartita);//mostra stato partita

        });


        //card click event listener
        $(function() {
            $('#handRow').delegate('li', 'click', function() {

                //recupera la posizione della carta nel vettore mano
                var selectedElement=this.getElementsByClassName("composition-position")[0].textContent;

                console.log(selectedElement);

                makeMove(selectedElement);//invia la mossa al contratto
            });
        });


    });
}


var showGame=function (nomePartita){
    $.getJSON("solidity/Arena.abi.json", function(arenaABI){
        const ArenaContract=web3.eth.contract(arenaABI).at(arenaAddress);

        ArenaContract.getPartita( nomePartita , function (err, res) {
            if(err!=null){
                console.log(err);
            }else{
                arrayMano=[];
                arrayPrec=res[4];

                for (i=0;i<res[3].length;i++){
                    arrayMano.push(web3.toDecimal(res[3][i]));
                }
                partita=new Partita(web3.toDecimal(res[1]),web3.toDecimal(res[2]),arrayMano,[web3.toDecimal(arrayPrec[0]),web3.toDecimal(arrayPrec[1])],web3.toDecimal(res[5]));

                console.log(partita);
                console.log(res[0]);
                console.log(res[1]);
                console.log(res[2]);
                console.log(res[3]);
                if(partita.manoPlayer.length==0){
                    showWinner(partita);
                }else{
                    showHand(partita.manoPlayer);
                    showPreviousTurnAndScore(partita.previousturn,partita.punteggioPlayer1,partita.punteggioPlayer2,partita.giocatore);
                }


            }
        });

    });
}

//funzioni Mano
var showHand = function (handVector){

    var i;
    var k=handVector.length;

    for ( i=0; i<k; i++){
        showCardMul(handVector[i],i,'#handRow');
    }

}

var showPreviousTurnAndScore=function (previousturn,punteggio1,punteggio2,giocatore) {
    var cardTemplate = $('#cardTemplate');
    var cardRow = $('#PreviousTurn');
    var score= $('#punteggio');

    for (i=0;i<2;i++){
        console.log(previousturn[i].name);
        console.log(previousturn[i].tipo);
        console.log(previousturn[i].attacco);
        console.log(previousturn[i].img);

        cardTemplate.find(".panel-title").text(previousturn[i].name);
        cardTemplate.find(".composition-text").text(previousturn[i].tipo);
        cardTemplate.find(".composition-ID").text(previousturn[i].attacco);
        cardTemplate.find(".composition-seed").text(previousturn[i].seed);
        cardTemplate.find(".composition-Img").attr("src", previousturn[i].img);


        //cardRow.html(cardTemplate.html());
        // Se voglio vederle aggiunte devo usare la class row e usare append
        cardRow.append(cardTemplate.html());
    }

    if(giocatore==1){
        score.text(punteggio1.toString()+":"+punteggio2.toString());
    }else if(giocatore==2){
        score.text(punteggio2.toString()+":"+punteggio1.toString());
    }



}

//funzioni win condition
var showWinner=function(partita){

    var score= $('#punteggio');

    if(partita.giocatore==1&&(partita.punteggio1>partita.punteggio2)){
        score.text("HAI VINTO!");
    }else {
        score.text("HAI PERSO");
    }

    if(partita.giocatore==2&&(partita.punteggio2>partita.punteggio1)){
        score.text("HAI VINTO!");
    }else {
        score.text("HAI PERSO");
    }

}


/**
 * funzioni per l'esecuzione della partita
 * */
class Partita {


    constructor(punteggio1,punteggio2,mano,previousTurn,giocatore){

        this.punteggioPlayer1=punteggio1;//assegnazione punteggio player1
        this.punteggioPlayer2=punteggio2;//assegnazione punteggio player1

        this.manoPlayer= mano;//asseganzione mano giocatore

        //assegnazione carte del turno precedente
        this.previousturn= [new Card(previousTurn[0]),new Card(previousTurn[1])];

        //assegnazione identificatore
        this.giocatore=giocatore;
    }


}

//funzione per l'invio della mossa
// chiede in input l'indice della carta nella mano
var makeMove = function(handIndex){
    console.log(handIndex);
    $.getJSON("solidity/Arena.abi.json", function(arenaABI){//caricamento ABI
        const ArenaContract=web3.eth.contract(arenaABI).at(arenaAddress);

        //chiamata al contratto per inviare la mossa
        ArenaContract.sendMove(nomePartita,handIndex, function (err, res) {
            if(err!=null){
                console.log(err);
                alert("errore chiamata contratto");
            }else{
                alert("mossa inviata");
            }
        });

    });

}


/**
 * funzioni per mostrare le carte
 * */

//funzione che aggiunge carte al container selezionato
// chiede in input il metadato della carta, la posizione nell'array
// mano e il container dove verra visualzzata
var showCardMul = function (cardData,i,container) {
    var cardTemplate = $('#cardTemplate');//recupero template carta
    var cardRow = $(container);//recupero riferimento container
    console.log(cardData);
    var card = new Card(cardData);//generazione carta

    console.log(card.name);
    console.log(card.tipo);
    console.log(card.attacco);
    console.log(card.img);

    cardTemplate.find(".panel-title").text(card.name);//modifica del nome nel template
    cardTemplate.find(".composition-Type").attr("src",card.tipo);//modifica del tipo nel template
    cardTemplate.find(".composition-ID").text(card.attacco);//modifica dell' attacco nel template
    cardTemplate.find(".composition-Img").attr("src",card.img);// modifica dell'illustrazione nel template
    cardTemplate.find(".composition-seed").text(card.seed);//modifica del seed nel template
    cardTemplate.find(".composition-position").text(i);//modifica dell'identificatore posizione del template

    console.log(cardTemplate);


    cardRow.append(cardTemplate.html());//aggiunta della carta al container html
}


/**
 * funzioni per la creazione delle carte
 * */
function Card (seed) {

    this.rarita=seed%19;//rarita della carta
    this.name=getName(seed);//generazione nome carta
    this.tipo=getTypeImage(seed%3);//recupero simbolo del tipo
    this.attacco=1000+100*(seed%20);//calcolo attacco
    this.img=getImage(seed%3,this.rarita);//recupero illustrazione
    this.seed=seed;//seme carta
}

//funzione per la scelta dell'illustrazione richiede il tipo della carta ed la sua rarita
function getImage(tipo,rarita) {

    return "img/"+tipo.toString()+rarita.toString()+".jpg";
}

//funzione per la scelta del simbolo del tipo richiede in input il tipo dellla carta
function getTypeImage(tipo) {

    return "tipo/"+tipo.toString()+".png";
}

//funzione per la generazione del nome della carta
function getName(seed) {
    var nome;
    var profes;//corrisponde al tipo della carta
    var luogo;
    var colore;
    switch (seed%7) {
        case 0:
            nome="Alessio";
            break;
        case 1:
            nome="Andrea";
            break;
        case 2:
            nome="Federico";
            break;
        case 3:
            nome="Daniel";
            break;
        case 4:
            nome="Simon";
            break;
        case 5:
            nome="Riccardo";
            break;
        case 6:
            nome="Nicola";
            break;
    }

    switch (seed%3) {
        case 0:
            profes="Cavaliere";
            break;
        case 1:
            profes="Picchiere";
            break;
        case 2:
            profes="Mago";
            break;
    }

    switch (seed%11) {
        case 0:
            luogo="Deserto";
            break;
        case 1:
            luogo="Ghiaccio";
            break;
        case 2:
            luogo="Regno";
            break;
        case 3:
            luogo="Concilio";
            break;
        case 4:
            luogo="Palazzo";
            break;
        case 5:
            luogo="Drago";
            break;
        case 6:
            luogo="Vento";
            break;
        case 7:
            luogo="Tuono";
            break;
        case 8:
            luogo="Fuoco";
            break;
        case 9:
            luogo="Monte";
            break;
        case 10:
            luogo="Fiore";
            break;
    }

    switch (seed%13) {
        case 0:
            colore="Nero";
            break;
        case 1:
            colore="Blu";
            break;
        case 2:
            colore="Rosso";
            break;
        case 3:
            colore="Giallo";
            break;
        case 4:
            colore="Verde";
            break;
        case 5:
            colore="D'Oro";
            break;
        case 6:
            colore="Oscuro";
            break;
        case 7:
            colore="Luminoso";
            break;
        case 8:
            colore="Degli Antichi";
            break;
        case 9:
            colore="Policromo";
            break;
        case 10:
            colore="Della Luna";
            break;
        case 11:
            colore="Del Sole";
            break;
        case 12:
            colore="Del Re";
            break;
    }


    //restituzione del nome generato
    return nome.toString()+" "+profes.toString()+" Del "+luogo.toString()+" "+colore.toString();

}

