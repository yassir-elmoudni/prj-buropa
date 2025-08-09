# STG Buropa Web

Salut ! Ce projet c'est mon interface vocale pour le web. J'ai essayé de faire quelque chose de cool avec React.

## Comment ça marche

L'idée c'est simple : tu choisis ta langue, tu dis ton nom, et après tu peux parler dans le micro. L'app va essayer de comprendre ce que tu dis et te proposer des produits.

## Pour lancer le projet

```bash
npm install
npm start
```

Ou alors tu peux juste ouvrir le fichier `public/index.html` dans ton navigateur ça marche aussi.

## Ce qu'il y a dedans

- On peut choisir entre 3 langues : Français, English et العربية
- Il y a un micro qui écoute quand tu parles
- Le cercle rouge bouge selon ta voix (c'est stylé !)
- Ça transcrit ce que tu dis avec l'API Speech du navigateur
- Après ça montre des produits (pour l'instant c'est juste des trucs au hasard)

## Les trucs techniques

J'ai utilisé :
- React avec des hooks (useState, useEffect...)
- L'API Web Audio pour le micro
- Web Speech API pour comprendre ce qu'on dit
- Du CSS en ligne (je sais c'est pas top mais ça marche)

## Notes

C'est pas parfait, il y a sûrement des bugs. Et faut autoriser le micro dans le navigateur sinon ça marche pas.

Le dossier `services/` contient les trucs pour simuler une vraie API. 