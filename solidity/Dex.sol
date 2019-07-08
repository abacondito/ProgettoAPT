pragma solidity ^0.5.0;
import "./Generatore.sol";

/**
* Implementa un semplice DEX per il contratto Generatore
*
* L'owner del DEX può aggiungere diversi generatori, dandone il simbolo e l'address dello SC Generatore
*
* Il Maker vuole scambiare il suo token A per un token B di un altro utente detto compratore
* egli deve:
* - inviare l'offerta al DEX (addOffer)
* - abilitare il DEX a ritirare il token A tramite la funzione approve inviata allo SC Generatore
* - confermare lo scambio (acceptOffer) dopo che l'utente compratore ha inviato la sua contro offerta(respondOffer)
*
* Se il compratore B desidera rispondere all'offerta del Maker A, deve:
* - rispondere all'offerta chiamando la funzione respondOffer del DEX
* - abilitare il DEX a ritirare il token B tramite la funzione approve inviata allo SC Generatore
*
* Il maker A vuole vendere il suo token A ad un compratore bool egli deve:
* - inviare la vendita al DEX (addSale)
* - abilitare il DEX a ritirare il token A tramite la funzione approve inviata allo SC Generatore
*
* Se il compratore B desidera rispondere all'offerta del Maker A, deve:
* - abilitare il DEX a ritirare il token B tramite la funzione approve inviata allo SC Generatore
* - accettare la vendita(acceptSale)
*/
contract DEX{

    address owner; // variabile di stato
    constructor() public { // costruttore
        owner = msg.sender; // address di creazione
    }
    modifier onlyOwner { // funzione modifier che verifica che il chiamante sia il proprietario del contratto
        require(msg.sender == owner);
        _;
    }

    struct Offer { // Offerta del Maker
        bool initialized; // true se offerta valida, false se annullata
        bytes4 tokenType; // bytes4 coi caratteri del simbolo del token da cedere
        uint32 tokenOfferedId;// uint32 con l'id della carta offerta
        uint32 tokenTradedId;//uint32 con l'id della carta proposta da chi risponde all'offerta
        address compratore;//indirizzo del compratore
    }

    struct Sale{
        bool initialized;//true se la vendita è valida, false se annullata
        bytes4 tokenType;// bytes4 coi caratteri del simbolo del token da cedere
        uint32 tokenOnSale;// uint32 con l'id della carta offerta
        uint32 finPrice;//uint32 con il prezzo in finney richiesto
    }


    Offer nullOffer; // Offerta nulla (initialized è zero, quindi false)
    Sale nullSale;//Sale nulla (initialized è zero, quindi false)
    address nullAddress;//indirizzo nullo
    mapping (bytes4 => address) public _tokens; // dato il simbolo, rende l'address del token
    mapping (address => Offer) private _offers; // una offer per maker
    mapping (address => Sale) private _sales;//una vendita per maker


/**
* Aggiunge un nuovo token.
* _symbStr è la stringa del simbolo
*/
    function addTokenType(string memory _symbStr, address _tokenAddr) public onlyOwner {
        bytes4 _symb = _string_tobytes4(_symbStr);
        _tokens[_symb] = _tokenAddr;
    }

/**
* getter dell'address di un token passato come stringa
*/
    function showTokenType(string memory _symbStr) public view returns(address){
        bytes4 _symb = _string_tobytes4(_symbStr);
        return _tokens[_symb];
    }

/**
* Aggiunge la vendita del Maker
* Controlla che i simboli dei token siano gestiti
* Perché sia valida, richiede che il Maker abbia abilitato l'address del DEX
* a ritirare _toSell token _symbSell tramite funzione approve inviata allo SC di _symbSell
*/
    function addSale(string memory _symbTradeStr, uint32 _toSell,uint32 _finPrice) public returns (bool) {
        bytes4 _symbTrade=_string_tobytes4(_symbTradeStr);
        require(_tokens[_symbTrade] != address(0));
        _sales[msg.sender] = Sale(true,_symbTrade, _toSell,_finPrice);
        return true;
    }

/**
* funzione per conoscere l'ultima vendita del msg.sender
*/
    function showMySale() public view returns(string memory, uint32, uint32){
        string memory _tokenType=_bytes4ToStr(_sales[msg.sender].tokenType);
        return (_tokenType, _sales[msg.sender].tokenOnSale, _sales[msg.sender].finPrice);
    }


/**
* funzione per conoscere l'ultima offerta dell'inidrizzo dato
*/
    function showSale(address indirizzo) public view returns(string memory, uint32, uint32){
        string memory _tokenType=_bytes4ToStr(_sales[indirizzo].tokenType);
        return (_tokenType, _sales[indirizzo].tokenOnSale, _sales[indirizzo].finPrice);
    }


/**
* Elimina la vendita del Maker, mettendo al suo address un'offerta nulla
*/
    function removeSale() public {
        _sales[msg.sender] = nullSale;
    }

/**
* Elimina la vendita del Maker, associando al address un'offerta nulla viene richiamata da acceptSale
*/
    function closeSale(address makerAddress) private{
        _sales[makerAddress]=nullSale;
    }

/**
* Funzione che effettua il pagamento per la carta ed il passaggio di proprietadella stessa
*
*/
    function acceptSale(address payable _maker) public payable {

        Sale memory _sale = _sales[_maker]; // Recupera la vendita del Maker
        Generatore _token;
        uint endprice =_sale.finPrice;//recupera il prezzo della vendita

        require(_sale.initialized); // Controlla che non sia nulla
        require(msg.value==(endprice*1000000000000000));//controlla che sia stata inviata la cifra corretta

        //chiamata al contratto Generatore
        _token = Generatore (_tokens[_sale.tokenType]);
        _token.sellCard(_maker,msg.sender, _sale.tokenOnSale);

        //trasferimento dei finney al maker
        _maker.transfer(msg.value);

        closeSale(_maker);//eliminazione la vendita
}

/**
* Il maker accetta l'offerta ricevuta
*/
    function acceptOffer() public returns (bool) {
        Generatore _token;
        Offer memory _offer = _offers[msg.sender]; // Recupera l'offerta del Maker
        require(_offer.initialized); // Controlla che non sia nulla

        _token = Generatore(_tokens[_offer.tokenType]);
        _token.tradeCards (msg.sender, _offer.tokenOfferedId, _offer.compratore, _offer.tokenTradedId);//effettua scambio

        _offers[msg.sender] = nullOffer; // Annulla l'offerta del Maker
        return true;
    }


/**
* Aggiunge l'offerta del Maker
* Controlla che i simboli dei token siano gestiti
* aggiunge all'offerta l'id della carta offerta ed il simbolo corrispondente al contratto Generatore
*/
    function addOffer(string memory _symbTradeStr, uint32 _toTrade) public returns (bool) {
        bytes4 _symbTrade=_string_tobytes4(_symbTradeStr);
        require(_tokens[_symbTrade] != address(0));//controlla che il simbolo sia presente in _tokens
        _offers[msg.sender] = Offer(true,_symbTrade, _toTrade,0,nullAddress);//inizializzazione dell'offerta
        return true;
    }

/**
* funzione per conoscere l'ultima offerta del msg.sender
*/
    function showMyOffer() public view returns(string memory, uint32, uint32, address){
        string memory _tokenType=_bytes4ToStr(_offers[msg.sender].tokenType);
        return (_tokenType, _offers[msg.sender].tokenOfferedId, _offers[msg.sender].tokenTradedId, _offers[msg.sender].compratore);
    }


/**
* Elimina l'offerta del Maker, mettendo al suo address un'offerta nulla
*/
    function removeOffer() public {
        _offers[msg.sender] = nullOffer;
    }

/**
* Il compratore risponde all'offerta e propone una carta da scambiare
*/
    function respondOffer(address _maker, uint32  _cardId) public returns (bool) {
        Offer memory _offer = _offers[_maker]; // Recupera l'offerta del Maker
        require(_offer.initialized); // Controlla che non sia nulla
        _offer.compratore=msg.sender; //Imposta il compratore
        _offer.tokenTradedId=_cardId;//imposta la carta compratore
        _offers[_maker]=_offer;
        return true;
}

/**
* Converte una stringa in bytes4, tagliando la parte in eccesso
*/
    function _string_tobytes4(string memory s) private pure returns ( bytes4 outBytes4){
        bytes memory b = bytes(s);
        if (b.length == 0) {
            return 0x0;
        }
        assembly {
        outBytes4 := mload(add(b, 32))
        }
    }

/**
* Converte bytes4 in stringa
*/
    function _bytes4ToStr(bytes4 _bytes4) private pure returns (string memory){
        bytes memory bytesArray = new bytes(4);
        for (uint256 i; i < 4; i++) {
            bytesArray[i] = _bytes4[i];
        }
        return string(bytesArray);
    }
}