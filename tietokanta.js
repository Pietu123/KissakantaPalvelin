'use strict'

const mariadb=require('mariadb');

module.exports= class Tietokanta {
    constructor(optiot){
        this.optiot=optiot;
    }
    //sql: sql lause,
    // parametrit: taulukko parametrejä ?-merkkien tilalle
    suoritaKysely(sql, parametrit){
        return new Promise(async (resolve, reject) => {
            let yhteys;
            try{
                
                yhteys=await mariadb.createConnection(this.optiot); // yritetään luoda yhteys
                let kyselynTulos=await yhteys.query(sql, parametrit); // yritetään tehdä kysely
                if(typeof kyselynTulos==='undefined') { // jos kyselynTulosta ei ole annetaan error
                    reject(new Error('Kyselyvirhe'))
                }
                // tulee tulos, poistetaan metadata
                else if(typeof kyselynTulos.affectedRows==='undefined') { 
                    delete kyselynTulos.meta;           
                    resolve({kyselynTulos, tulosjoukko:true});
                // tulee tulos
                }else {            
                    resolve ({
                        kyselynTulos:{
                            muutetutRivitLkm:kyselynTulos.affectedRows,
                            lisattyNro:kyselynTulos.insertId,
                            status:kyselynTulos.warningStatus
                        },
                        tulosjoukko:false
                    })
                }
            }
            catch(virhe){
                reject(new Error('SQL-virhe'+virhe.message));
            }
            
            finally { // tehdään aina
                if(yhteys) yhteys.end(); // testaa että yhteys oli auki ennen sulkemista
            }
        });
    };
}