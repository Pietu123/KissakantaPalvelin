'use strict';

const http=require('http');
const express=require('express');
const cors=require('cors');

const app=express();

const port=process.env.PORT || 4000;
const host=process.env.HOST || 'localhost';

const palvelin = http.createServer(app);

const Tietovarasto=require('./tietovarasto.js');
const kissat = new Tietovarasto();

app.use(express.json());
app.use(cors());

app.get('/',(req,res) => res.json({virhe:'komento puuttuu'}));

app.get('/api/kissat', (req,res)=>
    kissat.haeKaikki()
    .then(tulos=>res.json(tulos))
    .catch(virhe=>res.json({virhe:virhe.message}))
);

app.route('/api/kissat/:numero')
    .get((req,res) => {
        const kissaNumero = req.params.numero;
        kissat.hae(kissaNumero)
            .then(tulos=>res.json(tulos))
            .catch(virhe=>res.json({virhe:virhe.message}))
    })
    .delete((req,res)=> { 
        const kissaNumero = req.params.numero;
        kissat.poista(kissaNumero)
            .then(tulos=>res.json(tulos))
            .catch(virhe=>res.json({virhe:virhe.message}))

    })
    .post((req,res) => {
        if(!req.body) res.json({virhe:'ei löydy'});
        kissat.paivita(req.body)
            .then(tulos=>res.json(tulos))
            .catch(virhe=>res.json({virhe:virhe.message}))

    })
    .put((req,res)=>{
        if(!req.body) res.json({virhe:'ei löydy'});
        kissat.lisaa(req.body)
            .then(tulos=>res.json(tulos))
            .catch(virhe=>res.json({virhe:virhe.message}))

    });

    app.all('*', (req,res) =>
    res.json('resurssia ei löydy tai yksilöivä numero puuttuu')
);

    palvelin.listen(port, host, ()=>
        console.log(`Palvelin ${host} portissa ${port}`)
    );
