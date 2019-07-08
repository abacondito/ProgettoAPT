pragma solidity ^0.5.0;

/**
 * implementa un sistema per la creazione e gestione delle partite
 *
 * l'utente puo creare una ppartita con un determinato nome,unirsi ad
 * una partita, recuperare lo stato della partita e inviare la propria mossa
 *
 */

 contract Arena{


     /**
     *struct che rappresenta lo stato della Partita
     */
     struct Partita{
        address player1;//indirizzo primo giocatore
        uint8 punteggioPlayer1;//punteggio primo giocatore
        uint32[] manoPlayer1;//mano del primo giocatore
        uint32 mossaPlayer1;//mossa primo giocatore
        bool moveFlag1;//flag mossa effettuata primo giocatore

        address player2;//indirizzo secondo giocatore
        uint8 punteggioPlayer2;//punteggio secondo giocatore
        uint32[] manoPlayer2;//mano del secondo giocatore
        uint32 mossaPlayer2;//mossa secondo giocatore
        bool moveFlag2;//flag mossa effettuata secondo giocatore

        uint32[2] previousTurn;//turno precedente
     }

    //varie variabili inizializzate a 0
    address nullAddress;
    Partita nullPartita;
    uint32[] nullArray;
    uint32[2] nullArray2;
    uint32[10] nullArray10;
    uint32 nullUint;


    //mapping fra le struct Partita ed un symbolo in bytes4
    mapping (bytes4=>Partita) public _listaPartite;

    /**
     * funzione per creare una nuova partita
     * riceve in input una stringa simbolo, che costituira il nome della partita, e
     * la mano del primo giocatore
     **/
    function createGame(string memory nomePartita,uint32[] memory mano) public {

        bytes4 symbPartita=_string_tobytes4(nomePartita);//conversione in bytes4

        require(_listaPartite[symbPartita].player1==nullAddress);//controlla che la partita non sia inizializzata

        _listaPartite[symbPartita]=Partita(msg.sender,0,mano,nullUint,false,nullAddress,0,nullArray,nullUint,false,nullArray2);//aggiorna il valore di Partita in storage
    }

    /**
     * funzione per unirsi alla partita
     * chiede in input la stringa simbolo della nuova partita
     */
    function joinGame(string memory nomePartita,uint32[] memory mano) public {
        bytes4 symbPartita=_string_tobytes4(nomePartita);

        require(_listaPartite[symbPartita].player1!=nullAddress);//controlla che la partita non sia inizializzata
        require(_listaPartite[symbPartita].player2==nullAddress);//controlla che non sia già presente un secondo giocatore

        Partita memory _partita = _listaPartite[symbPartita]; // Recupera la partita

        _partita.player2=msg.sender;
        _partita.manoPlayer2=mano;

        _listaPartite[symbPartita]=_partita;//aggiorna il valore della Partita in storage

    }


    /**
     * funzione per inviare la propria mossa
     * richiede in input il nome e la mossa sotto forma di indice dell' array mano
     */
    function sendMove(string memory nomePartita, uint32 move) public {

        bytes4 symbPartita=_string_tobytes4(nomePartita);
        Partita memory _partita = _listaPartite[symbPartita];// Recupera la partita




        require(_partita.player1!=nullAddress);//controlla che la partita sia inizializzata
        require((_partita.player1==msg.sender)||(_partita.player2==msg.sender));//controlla che il sender sia uno dei giocatori



        if(_partita.player1==msg.sender){//contralla se il chiamante è il primo giocatore
            require(_partita.moveFlag1==false);//controlla che  il primo giocatore non abbia fatto la mossa
            _partita.mossaPlayer1=_partita.manoPlayer1[move];//assegnazione mossa
            _partita.moveFlag1=true;//impostazione flag mossa effettuata

            uint32 [] storage manoTmp=_listaPartite[symbPartita].manoPlayer1;//creazione mano temporanea
            manoTmp[move]=manoTmp[(manoTmp.length) - 1];//assegna al posto della carta impiegata nella mossa l'ultimo elemento dellla mano
            manoTmp.length=(manoTmp.length)-1;//diminuzione della lunghezza
            _partita.manoPlayer1=manoTmp;//aggiornamento mano

        }else{
            require(_partita.moveFlag2==false);//controlla se il chiamante è il secondo giocatore
            _partita.mossaPlayer2=_partita.manoPlayer2[move];
            _partita.moveFlag2=true;

            uint32 [] storage manoTmp=_listaPartite[symbPartita].manoPlayer2;
            manoTmp[move]=manoTmp[(manoTmp.length) - 1];
            manoTmp.length=(manoTmp.length)-1;
            _partita.manoPlayer2=manoTmp;
        }

        _listaPartite[symbPartita]=_partita;//aggiornamento dello stato in storage

        if((_partita.moveFlag1== true)&&(_partita.moveFlag2== true)){//se entrambi i giocatori hanno mandato la loro mossa
            resolveTurn(nomePartita);//chiama resolveTurn
        }

    }


    /**
     *funzione che esegue il turno calcolando l'attacco delle carte usate e confrontando il loro tipo,
     * dopo aver decretato il vincitore del turno aumenta il punteggio associato aggiorna la _previousTurn
     * e imposta a false i moveFlag
     */
    function resolveTurn(string memory nomePartita) private {

        bytes4 symbPartita=_string_tobytes4(nomePartita);
        Partita memory partita=_listaPartite[symbPartita];//recupera partita

        uint8 mult1=1;//moltiplicatore attacco player1
        uint8 mult2=1;//moltiplicatore attacco player2

        uint32 [2] memory _previousTurn;


        /**
         * il confronto consiste in una partita di "carta, forbice, sasso" seguita da un confronto fra l'attacco delle due carte coinvolte
         * (il vincitore della fase precedente dispone di attacco raddopiato)
         */
        if(partita.mossaPlayer1%3==partita.mossaPlayer2%3){
            mult1=1;
            mult2=1;
        }else if((partita.mossaPlayer1%3==0 && partita.mossaPlayer2%3==2)||(partita.mossaPlayer1%3==1 && partita.mossaPlayer2%3==0)||(partita.mossaPlayer1%3==2 && partita.mossaPlayer2%3==1)){
            mult1=2;
            mult2=1;
        }else{
            mult1=1;
            mult2=2;
        }

        if (((partita.mossaPlayer1%20+10)*mult1)>((partita.mossaPlayer2%20+10)*mult2)){
            partita.punteggioPlayer1++;
        }else if (((partita.mossaPlayer1%20+10)*mult1)==((partita.mossaPlayer2%20+10)*mult2)){
        }else{
            partita.punteggioPlayer2++;
        }


        _previousTurn=[partita.mossaPlayer1,partita.mossaPlayer2];
        partita.previousTurn=_previousTurn;

        //impostazione dei flag a falso
        partita.moveFlag1=false;
        partita.moveFlag2=false;

        _listaPartite[symbPartita]=partita;//aggiornamento partita in storage
    }


    /**
     * funzione per la cancellazione della partita utilizzabile solo dal primo giocatore
    */
    function removeGame(string memory nomePartita) public{
        bytes4 symbPartita=_string_tobytes4(nomePartita);
        require(_listaPartite[symbPartita].player1==msg.sender);//controlla che il chiamante sià il primo giocatore della partita
        _listaPartite[symbPartita]=nullPartita;
    }


    /**
     * funzione per recuperare lo stato della partita
     * viene restituito dal punto di vista del giocatore chiamante
     * richiede in input il simbolo della partita
    */
    function getPartita(string memory nomePartita) public view returns(string memory,uint8,uint8,uint32[] memory,uint32[2] memory,uint8){
        bytes4 symbPartita=_string_tobytes4(nomePartita);
        require(_listaPartite[symbPartita].player1 != nullAddress);//controlla che la partita sia inizializzata
        require((_listaPartite[symbPartita].player1==msg.sender)||(_listaPartite[symbPartita].player2==msg.sender));//controlla che il chiamante sia uno dei giocatori

        Partita memory game=_listaPartite[symbPartita];//recupera stato partita

        if(game.player1==msg.sender){
            return (nomePartita, game.punteggioPlayer1, game.punteggioPlayer2, game.manoPlayer1, game.previousTurn,1);
        }else{
            return (nomePartita, game.punteggioPlayer1, game.punteggioPlayer2, game.manoPlayer2, game.previousTurn,2);
        }

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