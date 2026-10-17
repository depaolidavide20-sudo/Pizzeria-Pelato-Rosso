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
sezione. Stili e comportamento sono in `hero.css` e `hero.js`. La navigazione manuale
e il pulsante pausa sono accessibili da tastiera; la preferenza di movimento ridotto
disattiva animazioni e avanzamento automatico. Anche il logo e le fotografie del
carosello nel menu sono quelli forniti per il progetto.

Questa copia è indipendente dall’hosting Sites e non include la sua configurazione.
