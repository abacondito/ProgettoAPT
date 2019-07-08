pragma solidity ^0.5.0;

import "http://github.com/OpenZeppelin/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

/**
 * implementa un sistema che estende l'interfaccia ERC721 per la  creazione e gestione dei token
 *
 * l'utente può comprare un nuovo token, visualizzare la lista dei token in suo possesso
 * recuperare lo stato della partita e trasferire uno dei suoi token in cambio di un altro token o senza ricevere nulla
 *
 */

contract Generatore is ERC721{

    mapping(uint => uint32) private _cards;//mapping che collega l'indice del token al corrispettivo metadata
    uint32 lastid; //id dell'ultimo token

    //struct che contiene il vettore dei token posseduti dal giocatore per una la visualizzazione da parte dell'utente
    struct Player{
        uint32[] cardVect;
    }

    //mapping che collega a gli indirizzi dei giocatori alla corrispettiva struct Player
    mapping(address => Player) private _players;


    //modifier per il controllo del prezzo
    modifier checkValue(){
            require(msg.value==0.05 ether,"Each card costs 0.05 Ether. Please pay exactly 0.05 ether to buy");
        _;
    }

    //modifier che controlla che i token stiano venendo utilizzati dal proprietario o da uno degli indirizzi autorizzati da esso
    modifier onlyCardAllowed(uint32 id){
        require(ownerOf(id)==msg.sender ||
                getApproved(id)==msg.sender ||
                isApprovedForAll(ownerOf(id),msg.sender) ,
                "You don't own this card");
        _;
    }


    //funzione per l'acquisto di una carta riceve un numero random detto nonce dalla web interface
    function buyCard(uint256 nonce) payable checkValue public {
        uint256 addressHash=_byteToUint(keccak256(abi.encodePacked(msg.sender)));//hashing dell'indirizzo utente seguito dalla conversione in un uint256
        lastid=lastid+1;//avanzamento di lastid
        _mint(msg.sender,lastid);//coniazione del token

        uint32 _cardCode=uint32((addressHash*now+nonce)%1000000);//generazione metadati
        _cards[lastid]=_cardCode;//associazione del metadato all'indice
        _players[msg.sender].cardVect.push(lastid);//aggiunta della carta alla player del chiamante
    }



    //getter per la visualizzazione dei token posseduti
    function getBoughtCards() public view returns(uint32[] memory){
        return(_players[msg.sender].cardVect);
    }

    //funzione per la restituzione dei metadati
    function tokenMetadata(uint256 _tokenId) public view returns (uint32 _cardCode) {
        return _cards[_tokenId];
    }


    //funzione per lo scambio di proprieta di 2 token
    function tradeCards (address maker,uint32 makerCard,address buyer,uint32 buyerCard) public{
        transferFrom(maker,buyer, makerCard); // Trasf. da Taker a Maker
        transferFrom(buyer,maker,buyerCard); // Trasf. da Maker a Taker

        uint makerIndex;
        uint buyerIndex;
        uint32 tmp;

        //ricerca del token del maker nella sua struct Player
        for (uint i=0; i<_players[maker].cardVect.length; i++) {
            if (_players[maker].cardVect[i]==makerCard){
                makerIndex=i;
            }
        }

        //ricerca del token del buyer nella sua struct Player
        for (uint i=0; i<_players[buyer].cardVect.length; i++) {
            if (_players[buyer].cardVect[i]==buyerCard){
                buyerIndex=i;
            }
        }

        //aggiornamento delle struct Player coinvolte
        tmp=_players[maker].cardVect[makerIndex];
        _players[maker].cardVect[makerIndex]=_players[buyer].cardVect[buyerIndex];
        _players[buyer].cardVect[buyerIndex]=tmp;
    }


    //funzione per il trasferimento di un token ad un altro utente il pagamento viene effettuato all'interno del Dex
    function sellCard (address maker,address buyer,uint32 cardId) public{

        uint lunghezza=_players[maker].cardVect.length;

        //trasferimento del token al nuovo proprietario
        transferFrom(maker,buyer,cardId);

        //ricerca della posizione del token scambiato
        for (uint i=0; i<_players[maker].cardVect.length; i++) {
            if (_players[maker].cardVect[i]==cardId){
                //aggiornamento della struct Player del Maker
                _players[maker].cardVect[i]=_players[maker].cardVect[lunghezza-1];
                _players[maker].cardVect.length=lunghezza-1;
            }
        }

        //aggiornamento della struct Player del buyer
        lunghezza=_players[buyer].cardVect.length;
        _players[buyer].cardVect.length=lunghezza+1;
        _players[buyer].cardVect[lunghezza]=cardId;

    }

    //funzione per convertire gli uint256 in bytes32
    function _uintToByte(uint256 n) public pure returns (bytes32) {
        return bytes32(n);
    }
    //funzione per convertire i bytes32 in uint256
    function _byteToUint(bytes32 n) public pure returns (uint256) {
        return uint256(n);
    }



}