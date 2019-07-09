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
var genAddress= '0x88327dec9f8c791a35f70566fea85b9f4854f01c';//indirizzo generatore
var dexAddress= '0x40f4cbed4896e029534a6df0cc10eec2844f5741';//indirizzo Dex
var myaddress = web3.eth.accounts[0];
let finney=1000000000000000;//costante finney in wei

var elementoSelezionato=0;



var startApp = function () {
    //quando il documento è pronto
    $(document).ready(function () {

        //event listener offer button
        $("#buttonOffer").click(function () {

            if(elementoSelezionato!=0){//controlla che un elemento sia selezionato
                startTrade(elementoSelezionato); //creazione Trade
            }else {
                alert("non hai selezionato alcuna carta");//messaggio di errore
            }


        });

        //event listener response button
        $("#buttonResponse").click(function () {

            //recupera l'address del maker dal form
            makerAddress = document.getElementById("makerAddress").value;


            if(elementoSelezionato!=0){//controlla che un elemento sia selezionato
                answerTrade(makerAddress,elementoSelezionato);//risposta al trade
            }else {
                alert("non hai selezionato alcuna carta");
            }

        });

        //event listener Confirmation button
        $("#confirmationButton").click(function () {
            confirmTrade();//conferma l'accettazione dell'offerta
        });

        //event listener sale button
        $("#buttonSale").click(function () {

            price= document.getElementById("price").value;//recupero il prezzo dal form


            if(elementoSelezionato!=0){//controlla che sia selezionata una carta
                createSale(elementoSelezionato,price);//crea la vendita
            }else {
                alert("non hai selezionato alcuna carta");
            }

        });

        //event listener answer sale button
        $("#answerSale").click(function () {

            //recupera la vendita dal form
            makerAddress = document.getElementById("saleMakerAddress").value;

            acceptSale(makerAddress);//accetta la vendita

        });

        //event listener button auth
        $("#buttonAuth").click(function(){


            if(elementoSelezionato!=0){//controllo elemento selezionato
                autorizeCard(elementoSelezionato);//approva carta
            }else {
                alert("non hai selezionato alcuna carta");
            }

        });

        //event listener click card
        $(function() {
            $('#cardRow').delegate('li', 'click', function() {

                //recupera l'eelmento selezionato (id della carta)
                var selectedElement=this.getElementsByClassName("composition-seed")[0].textContent;

                console.log(selectedElement);
                elementoSelezionato=selectedElement;
                showInputCard(selectedElement);//mostra la carta scelta come input
            });
        });

        showCollection(); //mostra collezione

        getMySale();//mostra la propria vendita

        getMyOffer();//mostra la propria offerta

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

//funzione che mostra una sola carta
// sovrascrivendola all'interno del container selezionato
var showCard = function (cardData,container) {
    var cardTemplate = $('#cardTemplate');//recupera il template della carta
    var cardRow = $(container.toString());//recupera il riferimento al container delle carte
    console.log(cardData);
    var card = new Card(cardData);//generazione carta

    console.log(card.name);
    console.log(card.seed);
    console.log(card.tipo);
    console.log(card.attacco);
    console.log(card.img);

    cardTemplate.find(".panel-title").text(card.name);//modifica il name del template
    cardTemplate.find(".composition-Type").attr("src",card.tipo);//modifica simbolo tipo carta del tempalte
    cardTemplate.find(".composition-ID").text(card.attacco);//modifica l'attacco del template
    cardTemplate.find(".composition-Img").attr("src",card.img);//modifica l'illlustrazione del template

    cardRow.html(cardTemplate.html());//sostituisce l'html della row con la carta da visualizzare
}




/**
 * Funzioni di gestione delle offerte
 * */
function Offer(tokType, makerId, respondAddress,respondId) {
    this.makerAddress=myaddress;//indirizzo del maker
    this.makerId=makerId;//id della carta offerta dal maker
    this.respondAddress=respondAddress;//indirizzo del permutante
    this.respondId=respondId;//id della carta offerta dal permutante
}

//funzione per iniziare lo scambio
var startTrade = function (id) {
    $.getJSON("solidity/Dex.abi.json", function (dexAbi) {//caricamento Abi del Dex
        const DexContract=web3.eth.contract(dexAbi).at(dexAddress);

        DexContract.addOffer("card", id, {from: myaddress},//chiamata per la creazione dell'offerta
            (err, res) => {
                if (err != null) {
                    console.log(err);
                    alert("errore chiamata contratto");
                } else {
                    console.log(res);
                    alert("offerta inviata");
                }
            });

    });
}


//funzione per rispondere allo scambio
//richiede l'address del maker e l'id della carta
var answerTrade = function (makerAddress,id) {
    $.getJSON("solidity/Dex.abi.json", function (dexAbi) {//caricamento Abi del Dex
        const DexContract=web3.eth.contract(dexAbi).at(dexAddress);

        //chiamata per inviare la risposta all'offerta del maker
        DexContract.respondOffer(makerAddress,id,{from: myaddress},
            (err, res) => {
                if (err != null) {
                    console.log(err);
                    alert("errore chiamata contratto");
                } else {
                    console.log(res);
                    alert("risposta inviata");
                }
            });

    });
};


//funzione per confermare lo scambio
var confirmTrade = function () {
    $.getJSON("solidity/Dex.abi.json", function (dexAbi) {//caricamento Abi del Dex
        const DexContract=web3.eth.contract(dexAbi).at(dexAddress);

        //chiamata per accettare l'offerta di scambio
        DexContract.acceptOffer({from: myaddress},
            (err, res) => {
                if (err != null) {
                    console.log(err);
                    alert("errore chiamata contratto");
                } else {
                    console.log(res);
                    alert("conferma inviata");
                }
            });

    });
}


//funzione per recuperare la propria offerta
var getMyOffer= function () {
    $.getJSON("solidity/Dex.abi.json", function (dexAbi) {//cariacmento Abi del Dex
        const DexContract=web3.eth.contract(dexAbi).at(dexAddress);

        var offerta;

        //chiamata dell contratto dex per mostrare l'offer
        DexContract.showMyOffer({from: myaddress}, function (err, res) {
            if (err != null) {
                console.log(err);
                alert("errore chiamata contratto");
            } else {
                //parsing dell'offerta
                offerta=new Offer(res[0].toString(),web3.toDecimal(res[1]), res[3].toString(),web3.toDecimal( res[2]));
                console.log(offerta);
                if(offerta.respondAddress!=0){//se l'offerta non ha una risposta non verra mostrata
                    showMyOffer(offerta);
                }

            }
        });
    });
}

//funzione per mostrare l'offerta
var  showMyOffer = function (offerData) {
    var offerTemplate = $('#offerTemplate');//carica template offerta
    var offerRow = $('#offerRow');//caricamento container offerta
    console.log(offerData);

    //modifica l'indirizzo maker nel template
    offerTemplate.find(".composition-oAddress").text(offerData.makerAddress);
    //modifica l'indirizzo respond nel template
    offerTemplate.find(".composition-aAddress").text(offerData.respondAddress);

    $.getJSON("solidity/Generatore.abi.json", function (genAbi) {//caricamento abi del generatore
        const GenContract=web3.eth.contract(genAbi).at(genAddress);

        //chiamata per ottenere il metadata della carta del maker
        GenContract.tokenMetadata(offerData.makerId, function(err,res){
            if (err!=null){
                console.log(err);
                alert("errore chiamata contratto");
            } else{
                cardId=web3.toDecimal(res);
                showCard(cardId,'#slotCartaOfferente')//mostra carta del maker
            }
        });

        //chiamata per ottenere il metadata della carta del acquirente
        GenContract.tokenMetadata(offerData.respondId, function(err,res){
            if (err!=null){
                console.log(err);
                alert("errore chiamata contratto");
            } else{
                cardId=web3.toDecimal(res);
                showCard(cardId,'#slotCartaAcquirente')//mostra carta dell'acquirente
            }
        });

    });



    offerRow.html(offerTemplate.html());//inserisce il template nello spazio apposito

}


/**
 * funzioni per la vendita
 */
function Sale(tokenId, price) {
    this.cardId=tokenId;//id della carta in vendita
    this.price=price;//prezzo in finney
}


//funzione per creare la vendita
var createSale = function (id,finPrice) {
    $.getJSON("solidity/Dex.abi.json", function (dexAbi) {//caricamento Abi del Dex
        const DexContract=web3.eth.contract(dexAbi).at(dexAddress);

        //chiamata al contratto per la creazione
        DexContract.addSale("card", id, finPrice,{from: myaddress},
            (err, res) => {
                if (err != null) {
                    console.log(err);
                    alert("errore chiamata contratto");
                } else {
                    console.log(res);
                    alert("proposta di vendita inviata");
                }
            });

    });
}

//funzione per accettare la carta
var acceptSale = function (makerAddress) {
    $.getJSON("solidity/Dex.abi.json", function (dexAbi) {//caricamento abi del Dex
        const DexContract=web3.eth.contract(dexAbi).at(dexAddress);

        //chiamata al contratto per ricevere i dati relativi alla vendita del maker
        DexContract.showSale(makerAddress,(err,res)=>{
            if (err!=null){
                console.log(err);
                alert("errore chiamata contratto");
            }else{
                prezzo=web3.toDecimal(res[2]);//parsing prezzo

                //chiamata al dex per accettare la vendita
                DexContract.acceptSale(makerAddress,{from: myaddress,value: prezzo*finney },
                    (err, res) => {
                        if (err != null) {
                            console.log(err);
                            alert("errore chiamata contratto");
                        } else {
                            console.log(res);
                            alert("accettazione inviata");
                        }
                    });
            }
        });



    });
};

//funzione per recuperare i dati della propria vendita
var getMySale= function () {
    $.getJSON("solidity/Dex.abi.json", function (dexAbi) {//caricamento del abi del dex
        const DexContract=web3.eth.contract(dexAbi).at(dexAddress);

        var vendita;

        //chiamata al dex per richiedere i dati del sale
        DexContract.showMySale({from: myaddress}, function (err, res) {
            if (err != null) {
                console.log(err);
                alert("errore chiamata contratto");
            } else {
                vendita=new Sale(web3.toDecimal(res[1]),web3.toDecimal( res[2]));//parsing vendita
                console.log(vendita);
                if(vendita.cardId!=0){//se la vendita non è inizializata non verra visualizzata
                    showMySale(vendita);
                }

            }
        });
    });
}

//funzione per mostrare la vendita
var  showMySale = function (saleData) {
    var saleTemplate = $('#saleTemplate');//caricamento template vendita
    var saleRow = $('#saleRow');//caricamento spazio vendita
    console.log(saleData);

    saleTemplate.find(".composition-price").text(saleData.price);//modifica prezzo template


    $.getJSON("solidity/Generatore.abi.json", function (genAbi) {//cariacamento abi generatore
        const GenContract=web3.eth.contract(genAbi).at(genAddress);

        //chiamata a generatore per i metadati della carta
        GenContract.tokenMetadata(saleData.cardId, function(err,res){
            if (err!=null){
                console.log(err);
            } else{
                seed=web3.toDecimal(res);//parsing seed
                showCard(seed,'#slotCartaInVendita')//visualizzazione carta
            }
        });


    });



    saleRow.html(saleTemplate.html());//inserimento nella pagina

}

//funzione per autorizzare lo scambio/vendita della carta
var autorizeCard=function(authCard){

    $.getJSON("solidity/Generatore.abi.json", function (genAbi) {//carica l'abi  del generatore
        const GenContract=web3.eth.contract(genAbi).at(genAddress);

        //chiamata della funzione approve del contratto generatore
        GenContract.approve(dexAddress,authCard, function(err,res){
            if (err!=null){
                console.log(err);
                alert("errore chiamata contratto");
            } else{
                alert("autorizzazione inviata");
            }
        });

    });
}


/**
 * funzioni per la selezione della carta
 * */

//funzione usata per trasportare l'id della carta oltre la chiamata per i metadati
function Carda (id) {

    var semeGen;


    $.getJSON("solidity/Generatore.abi.json", function(cont){//caricamento abi generatore
        const GenContract=web3.eth.contract(cont).at(genAddress);

        //ottenimento metadati
        GenContract.tokenMetadata(id,
            function (err, res) {
                if(err!=null){
                    console.log(err);
                    alert("errore chiamata contratto");
                }else{
                    semeGen=web3.toDecimal(res);//parsing seme
                    console.log(semeGen);
                    console.log(id);
                    showCardMul(semeGen,'#cardRow',id);//visualizzazione carta
                }
            });
    });






}

//funzione che mostra la carta usata come input
var showInputCard=function(selectedElement){
    console.log(selectedElement);

    //caricamento abi generatore
    $.getJSON("solidity/Generatore.abi.json", function (genAbi) {
        const GenContract=web3.eth.contract(genAbi).at(genAddress);

        //chiamata a generatore per ottenere i metadati
        GenContract.tokenMetadata(selectedElement, function(err,res){
            if (err!=null){
                console.log(err);
            } else{
                seed=web3.toDecimal(res);//parsing seme
                showCard(seed,'#slotCartaInput');
            }
        });


    });
}

//funzione per mostrare carte nel container scelto
var showCardMul = function (cardData,container,id) {
    var cardTemplate = $('#cardTemplate');//caricamento template carta
    var cardRow = $(container);//caricamento container
    console.log(cardData);
    var card = new Card(cardData);//generazione carta

    console.log(card.name);
    console.log(card.tipo);
    console.log(card.attacco);
    console.log(card.img);
    console.log(card.seed);

    cardTemplate.find(".panel-title").text(card.name);//cambia name nel template
    cardTemplate.find(".composition-Type").attr("src",card.tipo);//cambia icona del tipo
    cardTemplate.find(".composition-ID").text(card.attacco);//cambia attacco nel template
    cardTemplate.find(".composition-seed").text(id);//cambia l'id nel template
    cardTemplate.find(".composition-Img").attr("src",card.img);//cambia l'illustrazione nel template


    cardRow.append(cardTemplate.html());//aggiunge la carta al container
}

var showCollection = function (){

    $.getJSON("solidity/Generatore.abi.json", function(cont){//caricamento abi generatore
        const GenContract=web3.eth.contract(cont).at(genAddress);

        var cardArray;
        var seed=0;
        var k;//lunghezza array
        var id;//id della carta

        GenContract.getBoughtCards( {from: myaddress}, function (err, res) {
            if(err!=null){
                console.log(err);
                alert("errore chiamata contratto")
            }else{
                cardArray=res;
                k=cardArray.length;
                console.log(k);

                //scorrimento collezione
                for (var i=0; i<k; i++){
                    id=web3.toDecimal(cardArray[i]);//assegnazione id
                    Carda(id);// visualizzazione carta
                }


            }
        });
    });



}
