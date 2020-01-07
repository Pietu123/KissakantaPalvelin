'use strict';
const Tietokanta = require('./tietokanta.js');

let luontilausetiedosto = './luontilauseet.json';

if (process.argv.length > 2) {
    luontilausetiedosto = `./${process.argv[2]}`;
}

try {
    luoKanta(require(luontilausetiedosto));
}
catch (virhe) {
    console.log(`Virhe: ${virhe.message}`);
}
// tietokannnan luontilauseet ja luonti
async function luoKanta(luontilauseet) {
    //console.log(luontilauseet);
    const luontiOptiot = {
        host: luontilauseet.palvelin,
        port: luontilauseet.portti,
        user: luontilauseet.paakayttaja,
        password: luontilauseet.paakayttajanSalasana
    };
    const DEBUG = luontilauseet.debugKaytossa;
    const db = new Tietokanta(luontiOptiot);
    
    const kayttaja = `'${luontilauseet.kayttaja}'@'${luontilauseet.palvelin}'`;
    //luontilauseet
    const dropDatabaseSql = `drop database if exists ${luontilauseet.tietokanta}`;
    const createDatabaseSql = `create database ${luontilauseet.tietokanta}`;
    const dropUserSql = `drop user if  exists ${kayttaja}`;
    const createUserSql = `create user if not exists ${kayttaja} ` +
        `identified by '${luontilauseet.kayttajanSalasana}'`;
    //annetaan kaikki oikeudet kayttajalle
    const grantPrivilegesSql =
        `grant all privileges on  ${luontilauseet.tietokanta}.* to ${kayttaja}`;

    //tietokantaoperaatiot
    try {
        await db.suoritaKysely(dropDatabaseSql);
        if (DEBUG) console.log(dropDatabaseSql);
        await db.suoritaKysely(createDatabaseSql);
        if (DEBUG) console.log(createDatabaseSql);
        if (luontilauseet.poistaKayttaja) {
            await db.suoritaKysely(dropUserSql);
            if (DEBUG) console.log(dropUserSql);
        }
        await db.suoritaKysely(createUserSql);
        if (DEBUG) console.log(createUserSql);
        await db.suoritaKysely(grantPrivilegesSql);
        if (DEBUG) console.log(grantPrivilegesSql);

        for (let taulu of luontilauseet.taulut) {
            const createTableSql =
                `create table ${luontilauseet.tietokanta}.${taulu.taulunNimi} (
                        ${taulu.sarakkeet.join(',\n\t')}
                    )`;

            await db.suoritaKysely(createTableSql);
            if (DEBUG) console.log(createTableSql);
            const rivit = [];
            for (let tieto of taulu.tiedot) {
                const insertRowSql=
                    `insert into ${luontilauseet.tietokanta}.${taulu.taulunNimi} `+
                    `values(${Array(tieto.length).fill('?').join(',')})`;
                rivit.push(db.suoritaKysely(insertRowSql, tieto));
            }
            await Promise.all(rivit);
            if(DEBUG) console.log('tiedot lisätty');
        }
    }
    catch (virhe) {
        console.log(virhe.message);
    }
}