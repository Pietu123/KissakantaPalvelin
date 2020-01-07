'use strict'

const Tietokanta = require('./tietokanta.js');

const kohtalokasVirhe = virhe => new Error('Anteeksi'+virhe.message);

const haeKaikki = 
    'select numero, nimi, rotu, syntymavuosi, lukumaara from kissa';
const haeKissaSql = 
    'select numero, nimi, rotu, syntymavuosi, lukumaara from kissa where numero=?';
const lisaaKissaSql= 
    'insert into kissa(numero, nimi, rotu, syntymavuosi, lukumaara) values (?,?,?,?,?)';
const paivitaKissaSql = 
    'update kissa set nimi=?, rotu=?, syntymavuosi=?, lukumaara=? where numero = ?';
const poistaKissaSql = 
    'delete from kissa where numero =?';
    
// funktiot jossa arvot lisätään taulukkona
const lisattavaKissa = kissa => [
        +kissa.numero, kissa.nimi, kissa.rotu, kissa.syntymavuosi, + kissa.lukumaara
    ];


const paivitettavaKissa = kissa => [
    kissa.nimi, kissa.rotu, kissa.syntymavuosi, +kissa.lukumaara, +kissa.numero
];




module.exports = class Kissakanta {
    constructor () { 
    this.kissaDb = new Tietokanta({
        host: 'localhost',
        port: 3306,
        user:'sampo',
        password: 'kegQw0VU',
        database: 'kissatietokanta'

    });
}


    haeKaikki() {
        return new Promise(async (resolve, reject) => {
            try {
                const tulos = await this.kissaDb.suoritaKysely(haeKaikki);
                resolve(tulos.kyselynTulos);

            }
            catch(virhe) {
                reject(kohtalokasVirhe(virhe));
            }
        })
    };


    hae(numero) {
        return new Promise(async (resolve, reject) => {
        try { 
            console.log(numero);
            const tulos = await this.kissaDb.suoritaKysely(haeKissaSql, [+numero]);
            console.log(tulos);
           if(tulos.kyselynTulos.length === 0) {
               reject (new Error('Kissaa ei löytynyt'));
           }
           else {
               resolve(tulos.kyselynTulos[0]);
           }
        }
        catch(virhe) {
            reject(kohtalokasVirhe(virhe));
        }

        });
    };
    lisaa(kissa) { 
        return new Promise(async (resolve, reject) => {
            try {
                const tulos = await this.kissaDb.suoritaKysely(lisaaKissaSql, lisattavaKissa(kissa));
                if (tulos.kyselynTulos.muutetutRivitLkm === 0) {
                    reject (new Error('Kissaa ei lisätty'))
                }
                else {
                    resolve(`Lisättiin kissa numerolla ${kissa.numero}`);
                }
                
            } catch (virhe) {
                reject(kohtalokasVirhe(virhe));
                
            }
        
        });

    }
    paivita(kissa) {
        return new Promise(async (resolve, reject)=> {
            try {
                const tulos = await this.kissaDb.suoritaKysely(paivitaKissaSql, paivitettavaKissa(kissa));
             if(tulos.kyselynTulos.muutetutRivitLkm === 0) {
                 reject(new Error('tietoja ei päivitetty'));
             }else{
                resolve(`Kissan numero ${kissa.numero} tietoja muutettiin`);
             }
             }catch (virhe) {
                 reject(kohtalokasVirhe(virhe));
             } 
        });
    }
    poista(numero){
        return new Promise(async(resolve, reject)=>{
            try{
                const tulos=await this.kissaDb.suoritaKysely(poistaKissaSql,[+numero]);
                if(tulos.kyselynTulos.muutetutRivitLkm ===0) {
                    resolve('Antamallasi numerolla ei ole kissaa. Mitään ei poistettu');

                }
                else {
                    resolve(`Kissa numerolla ${numero} poistettiin`);
                }
            }
            catch(virhe) {
                reject(kohtalokasVirhe(virhe));
            }  
        })
    }


};
