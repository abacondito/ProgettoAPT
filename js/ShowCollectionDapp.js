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
var genAddress= '0x88327dec9f8c791a35f70566fea85b9f4854f01c';
var dexAddress= '0xe49ea494e25ae0f853c55e48164dcb0220443453';
var myaddress = web3.eth.accounts[0];

var partita;//rivedere

//var aComposition = {title: "", text: "", id: 0, published: false, votes: 0};


var startApp = function () {
    //quando il documento è pronto
    $(document).ready(function () {




        showCollection(); //aggiumgere condizione


    });
}


/**
 * funzioni per la creazione delle carte
 * */
function Card (seed) {

    this.rarita=seed%19;//rarita della carta
    this.tipo=getTypeImage(seed%3);//recupero simbolo del tipo
    this.attacco=1000+100*(seed%20);//calcolo attacco
    this.name=getName(seed,this.rarita);//generazione nome carta
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


/**
 * funzioni per mostrare le carte
 * */


//funzione che recupera dal contratto generator la collezione per mostrarla al giocatore
//chiama la funzione showCardMul per far visualizzare le singole carte
var showCardMul = function (cardData) {
    var cardTemplate = $('#cardTemplate');//recupero template carta
    var cardRow = $('#cardRow');//recupero riferimento container
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

    cardRow.append(cardTemplate.html());//aggiunta della carta al container html
}

//funzione che recupera dal contratto generator la collezione per mostrarla al giocatore
//chiama la funzione showCardMul per far visualizzare le singole carte
var showCollection = function (){

    $.getJSON("solidity/Generatore.abi.json", function(cont){//caricamento ABi generatore
        const GenContract=web3.eth.contract(cont).at(genAddress);

        var cardArray;
        var seed=0;
        var k;
        var id;

        //chiamata al contratto generatore per ottenere l'elenco delle carte possedute
        GenContract.getBoughtCards( {from: myaddress}, function (err, res) {
            if(err!=null){
                console.log(err);
                alert("errore chiamata contratto");//messaggio di errore
            }else{
                cardArray=res;
                k=cardArray.length;
                console.log(k);
                for (var i=0; i<k; i++){
                    id=web3.toDecimal(cardArray[i]);//parsing della recepit

                    //chiamata al generatore per ottenere i metadati
                    GenContract.tokenMetadata(id,
                        function (err, res) {
                            if(err!=null){
                                console.log(err);
                                alert("errore chiamata contratto");//mesagio di errore
                            }else{
                                seed=web3.toDecimal(res);//parsing receipt
                                console.log(seed);
                                showCardMul(seed,'#cardRow');//visualizzazione carta
                            }
                        });
                }


            }
        });
    });



}