# Pelato Rosso — sito statico

Questa cartella contiene il sito completo: HTML, CSS, JavaScript e immagini.
Non servono installazione, compilazione, dipendenze o credenziali.

## Caricamento su GitHub

Carica **il contenuto di questa cartella** nel tuo repository, mantenendo
`index.html` nella radice e la struttura della cartella `assets/`.
Per GitHub Pages usa il branch del repository e la cartella radice `/` come
sorgente di pubblicazione. Il file `.nojekyll` è già incluso.
I percorsi sono relativi, quindi il sito funziona anche sotto il nome del repository.

## Anteprima e aggiornamenti

Puoi aprire direttamente `index.html` nel browser. In alternativa avvia:

```sh
python3 -m http.server 4173
```

Per aggiornare menu e recapiti modifica `business.js`.
Il prezzo di 7,50 € della farinata con un ingrediente è un esempio ed è indicato
come tale nel sito. La copertina usa tre coppie di immagini desktop/mobile fornite
per il progetto, con dissolvenze e testi sincronizzati. Modifica titoli e sottotitoli
nelle tre `.hero-scene` di `index.html`; i tempi sono negli attributi `data-*` della
sezione. Stili e comportamento sono in `hero.css` e `hero.js`. La hero non ha overlay,
indicatori o pulsante di pausa; usa le frecce da tastiera o lo swipe per cambiare
scena e la barra spaziatrice per avviare o fermare. La preferenza di movimento ridotto
disattiva animazioni e avanzamento automatico. Anche il logo e le fotografie del
carosello nel menu sono quelli forniti per il progetto.

Il tema nero con testi centrati è in `theme.css`. L’header mobile resta visibile
durante lo scorrimento; la fascia sotto la copertina è bianca con testo nero.
Il carosello prodotti precede il listino sia su mobile sia su desktop. Su mobile le categorie del menu
scorrono orizzontalmente su una riga; la selezione funziona anche con le frecce
da tastiera. La CTA della copertina è rossa e ovale, con testo corretto. I titoli bianchi
hanno ombra e contorno sulle lettere, senza overlay sulle immagini. Il carosello
prodotti mostra solo le frecce; spazio da tastiera permette pausa e ripresa.
Il footer è compatto e la sezione storia usa la nuova fotografia della pizza alla pala.

Questa copia è indipendente dall’hosting Sites e non include la sua configurazione.
