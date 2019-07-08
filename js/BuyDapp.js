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
var myaddress = web3.eth.accounts[0];



var startApp = function () {
    //quando il documento è pronto
    $(document).ready(function () {


        $("#buyButton").click(function () {//event listener acquisto
            if(web3.isAddress(genAddress))console.log(genAddress);
            buyCard(Math.floor(Math.random() * 10000));//acquisto carta e generazione nonce

        });



    });
}

/**
 * funzione di acquisto carta
 * contatta il contratto generatore per eseguire l'acquisto
 * */
var buyCard = function (nonce) {
    $.getJSON("solidity/Generatore.abi.json", function (cABI) {//importazione ABI
        console.log(genAddress);
        console.log(myaddress);
        const GenContract = web3.eth.contract(cABI).at(genAddress);//caricamento contratto

        //chiamata al contratto
        GenContract.buyCard(nonce,{from: myaddress, gas: 3000000, value: 50000000000000000}, function(err, res){
            if (err != null){
                alert('there was an error fetching the contract');//messaggio d'errore
            }else if(res!=null){
                alert("richiesta di acquisto inviata");
            }
        });
    });
}