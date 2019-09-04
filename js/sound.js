'use strict';

export default class Sound {

    constructor() {
        //pripremi zvukove, objekt su da se mogu slat referencom
        this.playerShoot = {decodedBuffer: undefined, audioSource: undefined, path: undefined};
        this.enemyShoot = {decodedBuffer: undefined, audioSource: undefined, path: undefined};
        this.enemyExplosion = {decodedBuffer: undefined, audioSource: undefined, path: undefined};
        this.playerCollision = {decodedBuffer: undefined, audioSource: undefined, path: undefined};
        this.levelComplete = {decodedBuffer: undefined, audioSource: undefined, path: undefined};
        this.menuAction = {decodedBuffer: undefined, audioSource: undefined, path: undefined};
        this.fail = {decodedBuffer: undefined, audioSource: undefined, path: undefined};
        this.track = {decodedBuffer: undefined, audioSource: undefined, path: undefined};
        
        //audio okružje
        this.audioContext = undefined;
        this.gain = undefined;
    }


    startAudio(){
        //pokreće audio okružje, na prvoj interakciji korisnika
        this.audioContext = new AudioContext();

        //dodaje kontrolu volumena(na ovaj node će se spajati umjesto audioContext)
        this.gain = this.audioContext.createGain();
        this.gain.gain.value = 0.1;
        this.gain.connect(this.audioContext.destination);

        //učitaj audio
        this.init();
    }


    setGain(reference, level){
        reference.gain = this.audioContext.createGain();
        reference.gain.gain.value = level;
        reference.gain.connect(this.audioContext.destination);
    }
    
    
    setSource(reference) {
        let source = this.audioContext.createBufferSource();
        source.buffer = reference.decodedBuffer;
        source.connect(reference.gain);
        reference.audioSource = source;
    }


    loadAudio(reference) {
        var request = new XMLHttpRequest();
        request.open('GET', reference.path, true);
        request.responseType = 'arraybuffer';

        //sprema u variable audio kad se vrati requestom
        request.onload = () => {
            if(this.audioContext){
                this.audioContext.decodeAudioData(request.response, (decodedBuffer) => {
                    reference.decodedBuffer = decodedBuffer;
                });
            }
        }
        request.send();
    }


    init() {
        this.playerShoot.path = '/sound/playerShoot.mp3';
        this.enemyShoot.path = '/sound/enemyShoot.mp3';
        this.enemyExplosion.path = '/sound/enemyExplosion.mp3';
        this.playerCollision.path = '/sound/playerCollision.mp3';
        this.levelComplete.path = '/sound/levelComplete.mp3';
        this.menuAction.path = '/sound/menuAction.mp3';
        this.fail.path = '/sound/fail.mp3';
        this.track.path = '/sound/track.mp3';
        this.loadAudio(this.playerShoot);
        this.loadAudio(this.enemyShoot);
        this.loadAudio(this.enemyExplosion);
        this.loadAudio(this.playerCollision);
        this.loadAudio(this.levelComplete);
        this.loadAudio(this.menuAction);
        this.loadAudio(this.fail);
        this.loadAudio(this.track);
    }


    tryPlayAudio(reference, level){
        //ako je zvuk učitan, ako ne pokušaj ga ponovno učitati
        if(reference.decodedBuffer){
            if(!reference.gain){
                this.setGain(reference, level);
            }
            this.setSource(reference);
            reference.audioSource.start(0);
        } else {
            this.loadAudio(reference);
        }
    }

    
    playPlayerShoot() {
        this.tryPlayAudio(this.playerShoot, 0.1);
    }
    
    
    playEnemyShoot() {
        this.tryPlayAudio(this.enemyShoot, 0.2);
    }


    playEnemyExplosion() {
        this.tryPlayAudio(this.enemyExplosion, 0.3);
    }


    playPlayerCollision() {
        this.tryPlayAudio(this.playerCollision, 0.4);
    }


    playLevelComplete() {
        this.tryPlayAudio(this.levelComplete, 2.0);
    }


    playMenuAction() {
        this.tryPlayAudio(this.menuAction, 0.2);
    }


    playFailed() {
        this.tryPlayAudio(this.fail, 2.0);
    }


    playTrack(offset) {
        if(this.track.decodedBuffer){
            if(!this.track.gain){
                this.setGain(this.track, 0.5);
            }
            this.setSource(this.track);
            this.track.audioSource.start(0,offset);
            //bilježi vrijeme za pauziranje
            this.track.startTime = Date.now();
            this.track.playingTime = offset;
            this.track.audioSource.loop = true;
        } else {
            this.loadAudio(this.track);

            //pokušaj ponovno nakon nekog vremena
            setTimeout(() => {
                this.playTrack(offset);
            }, 1000);
        }
    }


    stopTrack(){
        if(this.track.audioSource){
            this.track.audioSource.stop();
        }
    }


    pauseTrack(){
        //samo zabilježi vrijeme kad je pauzirano
        if(this.track.startTime && !this.track.pauseTime){
            this.track.pauseTime = Date.now();
            this.track.playingTime += (this.track.pauseTime - this.track.startTime)/1000;
            this.stopTrack();
        }
        
    }
    
    
    resumeTrack(){
        //samo zabilježi vrijeme kad je pauzirano
        if(this.track.startTime && this.track.pauseTime){
            this.playTrack(this.track.playingTime);
            this.track.pauseTime = undefined;
        }

    }


}