'use strict';

const Tietovarasto=require('./tietovarasto.js');
const kissat = new Tietovarasto();

async function kaikkiHaku() {
    try{
        const tulos= await kissat.haeKaikki();
        console.log(tulos);

    }
    catch(virhe){
        console.log(virhe.message);
    }

}

async function haeYksi(numero) {
    try{
        const tulos = await kissat.hae(numero);
        console.log(tulos);

    }

    catch (virhe) {
        console.log(virhe.message);
        
    }
};

    async function lisaaYksi(kissa) {
    try {
        const tulos = await kissat.lisaa(kissa);
        console.log(tulos);

    }
    catch (virhe) {
        console.log(virhe.message);
    }

    }

    async function muutaYksi(kissa){
        try {
            const tulos = await kissat.paivita(kissa);
            console.log(tulos);
        }
    catch (virhe) {
        console.log(virhe.message);
    }
}

    async function poistaYksi(numero) {
        try {
            const tulos = await  kissat.poista(numero);
            console.log(tulos);
        }
    catch(virhe) {
        console.log(virhe.message);
    }
    }


    

async function aja() {
await kaikkiHaku();
console.log("###############");
await haeYksi(1);
console.log("###############");
//await lisaaYksi({numero:4, nimi:"Musta", rotu:"Persialainen", syntymavuosi:2019, lukumaara:6});
// await muutaYksi({numero:4, nimi:"Valkoinen", rotu:"Persialainen", syntymavuosi:2019, lukumaara:6});
//await poistaYksi(4);
};

aja();