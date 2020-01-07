'use strict';

const http=require('http');
const path=require('path');
const express=require('express');

const app=express();

const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

const palvelin=http.createServer(app);

const Tietovarasto=require('./tietovarasto.js');
const kissat = new Tietovarasto();

app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'sivut'));

const valikko=path.join(__dirname, 'public','valikko.html');

app.use(express.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname,'public')));

app.get('/', (req,res) => res.sendFile(valikko));

app.get('/haekaikki',(req,res)=>kissat.haeKaikki()
    .then(tulos=>res.render('kaikkiKissat', {tulos}))
    .catch(virhe=>lahetaVirheViesti(res, virhe.message))
    
    );

app.get('/haekissa',(req,res)=>
    res.render('haekissa',{paaotsikko:'Kissan haku', otsikko:'Hae', toiminto:'/haekissa' })
)

app.post('/haekissa',(req,res)=>{
    if(!req.body || req.body.numero === ''){
    lahetaVirheViesti(res, 'Ei löytynyt');
     }else{
    const numero=req.body.numero;
    kissat.hae(numero)
        .then(kissa => res.render('kissasivu', {kissa}))
        .catch(virhe=>lahetaVirheViesti(res, virhe.message));
     }
});

app.get('/lisaakissa', (req,res)=> {
    res.render('kissalomake', {
    paaotsikko: 'Lisaa kissa',
    otsikko: 'Uusi kissa',
    toiminto: '/lisaa',
    numero: {arvo:'', readonly:''},
    nimi: {arvo:'', readonly:''}, 
    rotu: {arvo:'', readonly:''},
    syntymavuosi: {arvo:'', readonly:''},
    lukumaara: {arvo:'', readonly:''} 

    });
});

// app.post('/lisaakissa', (req,res)=> {
//     if(!req.body) lahetaVirheviesti(res,'Ei löytynyt');
//     kissat.lisaa(req.body)
//     .then(viesti=>lahetaTilatieto(res,viesti))
//     .catch(virhe=>lahetaVirheViesti(res,virhe.message));
// });


app.post('/lisaa', (req,res)=> {
    if(!req.body || req.body.numero === ''){ 
     lahetaVirheViesti(res, 'Ei löytynyt');
      }else{  
         kissat.lisaa(req.body)
        .then(viesti=>lahetaTilatieto(res, viesti))
        .catch(virhe=>lahetaVirheViesti(res,virhe.message));
      }
});

app.get('/muutaKissanTietoja', (req,res)=>{
    res.render('kissalomake',{
        paaotsikko:'Kissan päivitys',
        otsikko:'Päivitä tietoja',
        toiminto:'/paivitakissa',
        numero:{arvo:'', readonly:''},
        nimi:{arvo:'', readonly:'readonly'},
        rotu:{arvo:'', readonly:'readonly'},
        syntymavuosi:{arvo:'', readonly:'readonly'},
        lukumaara:{arvo:'', readonly:'readonly'}
    });

});

app.post('/paivitakissa', async(req,res)=>{
    try {
        const numero=req.body.numero;
        const kissa=await kissat.hae(numero);
        res.render('kissalomake', {
            paaotsikko:'Päivitä kissa',
            otsikko:'Pävitä tiedot',
            toiminto: '/paivitatiedot',
            numero:{arvo:kissa.numero, readonly:'readonly'},
            nimi:{arvo:kissa.nimi, readonly:''},
            rotu:{arvo:kissa.rotu, readonly:''},
            syntymavuosi:{arvo:kissa.syntymavuosi, readonly:''},
            lukumaara:{arvo:kissa.lukumaara, readonly:''}
        });
        
    } catch (virhe) {
        lahetaVirheViesti(res,virhe.message);
    }
});

app.post('/paivitatiedot', (req,res)=> {
    if(!req.body) lahetaVirheViesti(res, 'Ei löytynyt');
    kissat.paivita(req.body)
        .then(viesti=>lahetaTilatieto(res,viesti))
        .catch(virhe=>lahetaVirheViesti(res, virhe.message));
});

app.get('/poistakissa', (req,res) => {
    res.render('haekissa',{
        paaotsikko:'Poista',
        otsikko:'Poista kissa',
        toiminto:'/poistakissa'

    });

});

app.post('/poistakissa',(req,res)=>{
    if(!req.body || req.body.numero === ''){ 
     lahetaVirheViesti(res, 'Ei löytynyt');
      }else{  kissat.poista(req.body.numero)
        .then(viesti=>lahetaTilatieto(res,viesti))
        .catch(virhe=>lahetaVirheViesti(res,virhe.message));
      }

});

palvelin.listen(port,host, () => 
                console.log(`Palvelin ${host} portissa ${port}`)
); 

function lahetaVirheViesti(res, viesti) {
    // sivun nimi ja olio josta data löytyy
    res.render('statussivu', {
        paaotsikko:'Virhe',
        otsikko: 'Virhe',
        viesti:viesti
    })
};

function lahetaTilatieto(res,viesti) {
    res.render('statussivu', {
        paaotsikko:'Tilanne',
        otsikko:'Tila',
        viesti:viesti
    })

};
