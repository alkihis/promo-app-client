# promo-app-client

Ce projet a été créé depuis [Create React App](https://github.com/facebook/create-react-app).

## Introduction

Partie client du projet à destination de l'acquisition de données à propos des étudiants et promotions du master 
bio-informatique de Lyon.

Cette documentation expliquera:
- Les technologies utilisées
- Fonctionnalités
- L'architecture du projet
- Un exemple d'ajout de fonctionnalité (statistiques)
- Scripts pour lancer le serveur de développement et compiler le projet

## Technologies

### Langages utilisés

#### TypeScript

[TypeScript](https://www.typescriptlang.org/), superset du langage JavaScript dans lequel il se compile, permet l'utilisation de types statiques lors du développement (typage de variables, propriétés, retour de fonctions...) permettant de débugger et programmer plus efficacement.

En run-time cependant, le langage ne propose plus aucune vérification de type.

---

#### SCSS

Dérivé des possibilités du [Sass](https://sass-lang.com/), un langage se transpilant en CSS, **SCSS** ressemble syntaxiquement grandement au *CSS*, dans lequel il se transpile également, mais permet la création de structures plus avancées: variables entre fichiers, boucles, modules, mixins, fonctions, extensions de sélecteurs...

### Bibliothèques / frameworks

#### React

[React.js](https://fr.reactjs.org/) est une bibliothèque JavaScript permettant de simplifier la création d'interfaces utilisateur. Elle permet notamment de créer des *composants*, sortes d'éléments autonomes sur la page dont le rendu HTML est capable de s'actualiser automatiquement lorsque ses propriétés sont mises à jour.

React permet l'utilisation du [JSX](https://fr.reactjs.org/docs/introducing-jsx.html), un syntaxe proche de l'HTML à l'intérieur du JavaScript. Le JSX permet d'utiliser les composants React comme de vraies balises HTML, mais autorise comme attributs à ces balises des objets, tableaux, entiers...

---

#### Material UI

[Material UI](https://material-ui.com/fr) est un framework aidant à la stylisation de l'interface utilisateur créée avec React. Il apporte un nombre important de composants ayant déjà un style Material Design, ainsi que d'autres bénéficiant d'une logique déjà implémentée (ex: pop-ups, menu au survol...).

### Outils

#### Leaflet

[Leaflet](https://leafletjs.com/) est un outil de manipulation cartographique laissant à l'utilisateur de nombreuses options pour ajouter des marqueurs, changer de fond de carte, réagir à des zooms/dézooms sur la carte.

---

#### react-router

[react-router](https://reacttraining.com/react-router/web/guides/quick-start) est un composant React utilisé pour construire des "routes" (des chemins de l'URL) à l'intérieur de site web et afficher/faire réagir des composants en conséquence de la route entrée par l'utilisateur.

Ainsi, le *routing* intégralement géré par React, le serveur doit, pour n'importe quelle URL (qui n'est pas déclarée dans le serveur), renvoyer le fichier `index.html` contenant le point d'entrée vers l'application JavaScript plutôt que de calculer le résultat d'une vue pour l'URL considérée.

----

#### d3

[d3](https://d3js.org/) est une bibliothèque de création d'images vectorielles (SVG). Elle est utilisée ici pour créer des graphiques à des fins d'observation statistiques.


## Fonctionnalités / Pages

Lorsque le fichier est évoqué, la racine du chemin précisé est `./src/components/pages/`.

### Page d'accueil

Fichier: `Home/Home.tsx`

La page d'accueil présente une description rapide du site (intérêt, qui est responsable), ainsi qu'une carte des entreprises où les étudiants du master ont été en stage / embauchés.

Pour avoir accès à la liste des entreprises et de leurs contacts à l'intérieur, l'utilisateur doit être connecté à son profil.

### Connexion

Fichier: `Login/Login.tsx`

Cette page permet à l'utilisateur de se connecter.

Cependant, le projet imposant une contrainte d'absence de mot de passe pour les étudiants, la connexion étudiante est symbolisée par l'entrée d'une **clé d'accès** qui authentifiera l'étudiant. 

Une connexion automatique via un lien de connexion amènera l'étudiant sur cette page avec le champ **clé d'accès** déjà rempli. Ce lien de connexion sera automatiquement envoyé à l'étudiant par e-mail lors de la création de son profil par les enseignants ou via une demande de création.

Concernant les enseignants, un mot de passe leur est demandé pour se connecter. Ce mot de passe est modifiable via le serveur Python par la commande `python src/app.py --password`.

### Récupération de la clé d'accès

Fichier: `LostToken/LostToken.tsx`

Si un étudiant a perdu l'e-mail lui permettant de se connecter, cette page lui permet de re-demander un nouvel e-mail.

### Tableau de bord étudiant

Fichier: `Student/Dashboard/Dashboard.tsx`

Ce tableau de bord rassemble les différentes opérations qu'un étudiant peut effectuer sur son profil.

Il est également accessible par les enseignants sur n'importe quel profil, via la page de sélection d'étudiants dédiée.

C'est dans ce fichier que ce situe la logique de routage des pages du tableau de bord (voir partie *Architechture du projet*).

#### Informations personnelles

Fichier: `Student/Informations/StudentInformations.tsx`

Cette page permet à l'étudiant de configurer son profil : si il est diplômé, en quelle année il est sorti du master ou encore si il souhaite voir son e-mail apparaître sur la carte des emplois.

#### Acceuil

Fichier: `Student/Home/Home.tsx`

Page d'accueil présentant rapidement les informations importantes de l'étudiant connecté: Dernier emploi en cours, date de sortie du master, e-mail...

#### Emplois

Fichiers: `Student/Job/Job.tsx` et `Student/Job/AddJob.tsx`

Ces deux pages présentent une interface permettant, pour la première, d'accéder à la liste (triée par en cours/terminés) des emplois enregistrés par l'étudiant, et pour la seconde un formulaire pour ajouter un nouvel emploi.

Un emploi se définit par une entreprise dans laquelle l'étudiant a travaillé, un optionnel contact dans l'entreprise, une date de début et de fin d'emploi, le domaine, salaire et le niveau de l'emploi.

#### Stages

Fichiers: `Student/Internship/Internship.tsx` et `Student/Internship/AddInternship.tsx`

Ces deux pages sont les pendants fonctionnelles de la visualisation et ajout d'emploi, mais dans le cas des stages.

La particularité d'un stage est qu'il est lié à une promotion plutôt qu'à un intervalle de date, et qu'il n'a pas d'autre attribut que le domaine d'activité.

### Tableau de bord enseignant

Fichier: `Teacher/Dashboard/Dashboard.tsx`

Ce tableau de bord rassemble les différentes opérations auquelles les enseignants ont accès.

C'est dans ce fichier que ce situe la logique de routage des pages du tableau de bord (voir partie *Architechture du projet*).

#### Page d'accueil

Fichier: `Teacher/Home/Home.tsx`

La page d'accueil des enseignants présente très rapidement l'état de la base de données: nombre d'étudiants enregistrés, étudiants actuellement employés.

#### Étudiants

Fichier: `Teacher/Students/Students.tsx`

Annexes: `Teacher/Students/FindOptions/FindOptions.tsx`, `Teacher/Students/SendEmail/SendEmail.tsx` 

Cette page est le point central du tableau de bord des enseignants: elle permet la sélection de groupe par recherche et filtrage des étudiants, afin de leur envoyer des e-mails, modifier leur profil, exporter leurs données ou copier leurs adresses e-mails.

Les composants `FindOptions` et `SendEmail` sont liés à cette page.

#### Ajout d'étudiant

Fichier: `Teacher/AddStudent/AddStudent.tsx`

Permet aux enseignants d'ajouter un étudiant si ils connaissent déjà ses détails.

L'utilisation de `SendAskCreation` (permettant à l'étudiant de s'enregistrer lui-même) est préférée.

#### Envoyer une demande de création de compte

Fichier: `Teacher/SendAskCreation/SendAskCreation.tsx`

Via cette page, les enseignants peuvent spécifier différentes adresses e-mails (séparées par des virgules), et un e-mail sera envoyé à chacune de ses adresses pour demander de créer un compte en tant qu'étudiant sur le service.

Notez que l'adresse e-mail renseignée ici n'est **pas** systématiquement l'adresse e-mail qui sera assignée au compte créé (l'étudiant décidera).

#### Statistiques

Fichier: `Teacher/Stats/Stats.tsx`

Cette page présente quelques statistiques sur la base de données. (elle peut être enrichie !)

#### Gestion des entreprises enregistrées

Fichier: `Teacher/Entreprises/Entreprises.tsx`

Annexe: `Teacher/Entreprises/ContactEdit.tsx`

Cette page liste les entreprises enregistrées par les étudiants quand ils créent leurs emplois/stages.

Via cette interface, les enseignants peuvent modifier, supprimer l'entreprise et gérer les contacts affiliées à celle-ci.
Il est également possible de fusionner deux ou plus entreprises entre elles si celles-ci sont redondantes.

#### Gérer les formations enregistrées

Fichier: `Teacher/Formations/Formations.tsx`

De la même manière que pour les entreprises, cette page permet la modification, suppression et fusion des formations entrées par les étudiants dans leurs informations personnelles.

#### Gérer les domaines proposés

Fichier: `Teacher/Domaines/Domaines.tsx`

Les enseignants peuvent gérer et ajouter ici les domaines d'activités que l'on peut retrouver dans les emplois des étudiants.

### Ajout/Modification de stage/emploi/formation

Fichiers: `Modals/*.tsx`

Ces fichiers décrivent les modals autorisant la création et modification des-dits éléments pour lequels ils sont dédiés.

### Page non trouvée

Les pages gérant les 404 sont situées dans le répertoire `NotFound`. Le fichier `NotFound.tsx` est généraliste, tant que `StudentNotFound.tsx` gère les 404 à l'intérieur du tableau de bord des étudiants, et enfin `TeacherNotFound.tsx` fait la même chose pour le tableau de bord enseignant.


## Architechture du projet

### Point d'entrée
Le fichier `./src/index.tsx` est le point d'entrée de l'application: ce fichier sera exécuté au démarrage de la page web.

La seule utilité de ce fichier est de charger le composant `App`, racine des composants, et de la bind dans la page web.

Le composant `App` se trouve dans `./src/components/app/App.tsx`.

### Routing

Le routage par URL se réalise dès la racine de l'application: Le seul composant affiché chargé par `App` est le router.

Il est situé dans `./src/components/Router/Router.tsx`.
Les pages déclarées à l'aide de `react-router` dans ce composant lient URL à un composant à charger si la route matche.

#### Protection des pages

Certaines pages (à accès protégé) sont encapsulées dans un composant "wrapper" (tel `TeacherWrapper` ou `StudentWrapper`).
Ces composants permettent, si un token est enregistré dans le localStorage, d'attendre que celui-ci soit validé (existe) par le serveur, que les informations de connexion soient téléchargés et de vérifier que l'utilisateur connecté ait accès à la page. Lors de l'attente de validation, ces composants affichent un spinner en plein écran. Si la validation échoue, un message d'erreur sera affiché.

- `TeacherWrapper` protège le composant passé en attribut derrière une connexion enseignante obligatoire.

- `StudentWrapper` protège le composant passé en attribut derrière une connexion étudiante obligatoire.

- Le générique `LoginWrapper` vous permet de créer votre propre wrapper en fonction de différentes constantes. Voir son implémentation (exemple dans `./src/components/shared/TeacherWrapper/TeacherWrapper.tsx`).

Exemple d'utilisation: 
```tsx
// Charge le composant TeacherPage uniquement si l'utilisateur
// est connecté et si c'est un enseignant.
<TeacherWrapper component={TeacherPage} />
```

Pour l'utiliser au sein d'une route, il faut attribuer un `render` à celle-ci:
```tsx
/* 
 Attribue à la route '/teacher/' (et ses sous-routes)
 le rendu du TeacherWrapper englobant TeacherPage.
 TeacherWrapper reçoit les attributs RouteComponentProps
 plus l'attribut 'component'. 
*/
<Route path="/teacher/" render={
  (props: RouteComponentProps) => (
    <TeacherWrapper 
      component={TeacherPage} 
      {...props} 
    />
  )
} />  
```

#### Routing dans les tableaux de bords

Chaque tableau de bord dispose de son propre sous-routeur.

Les routeurs sont situés dans le fichier `Dashboard/Dashboard.tsx` des dossiers `Teacher` et `Student`.
Lorsque ce fichier est modifié, vous devez déclarer votre route dans le rendu du composant, et, si vous le souhaitez, l'ajouter au menu "drawer" du dashboard.

*Ajouter au menu du tableau de bord*

Déclarez votre route dans `ROUTES_AVAILABLE` sous forme clé = Texte de la route, valeur = URL de la route.
Ajoutez ensuite une entrée dans le drawer à l'intérieur de la fonction `makeDrawerSections` à l'intérieur du composant (des exemples y figurent).


### Pipeline d'initialisation

Description succinte de la pipeline d'initialisation du site lorsque la page est chargée:

- Lecture du HTML

Le parser lit le HTML et charge le script d'entrée de React.

- Construction du point d'entrée `App`

Le composant racine commence à se rendre.
Si l'utilisateur dispose d'un token stocké dans le `localStorage` du navigateur, la vérification de la véracité du token est lancée.
Cette vérification est symobolisée par une promesse disponible sur le singleton `SETTINGS` dans le fichier `./src/utils/Settings.ts` sous l'attribut `.login_promise`. Vous pouvez vérifier à tout moment si une vérification est lancée avec l'attribut `.login_pending`.

- Rendu du routeur

Le routeur et le composant correspondant à la route est chargé. 

Si le composant est derrière une protection de connexion, un spinner est rendu en attendant la finalisation de `.login_promise`. 

Si aucune connexion est en cours (`.login_pending === false`) et que l'utilisateur n'est pas connecté (`SETTINGS.logged === 0`), affiche que la page est protégée.

- Connexion établie

Lorsque la connexion est réalisée (promesse `.login_promise` résolue) et que le niveau de connexion (accessible avec `.logged`) est accepté par la protection de la page, alors la page protégée est rendue automatiquement.

Si la connexion échoue ou ne vérifie pas le niveau de permission demandé, affiche une erreur.

### Styles

Chaque composant peut disposer de son propre fichier de style. Par soucis d'indépendance, les composants ont des fichiers de style locaux (les éléments déclarés ne sont disponibles que pour le composant en question). Pour être local, le nom du fichier **doit** terminer en `.module.scss`. Importez votre fichier de style dans le fichier tsx avec un
```tsx
import classes from './<name>.module.scss';
```
**Attention**: Seules les classes sont importées. Si vous souhaitez utiliser d'autres sélecteurs, assurez vous qu'une classe les englobent.

Fichier *MyComponent.module.scss*:
```scss
.root {
  input[type="file"] {
    margin: 0 1rem;
  }
  ...
}
```

Fichier *MyComponent.tsx*:
```tsx
import classes from './MyComponent.module.scss';

function MyComponent(props: {}) {
  return (
    <div className={classes.root}>
      <div>
        {/* Elements... */}

        {/* Le sélecteur s'appliquera correctement ! */}
        <input type="file" />
      </div>
    </div>
  )
}
```

### Variables/Fonctions globales

#### Communication avec l'API

La communication se fait avec un singleton nommé `APIHELPER`. Il est disponible dans le fichier `./src/utils/APIHelper.ts`. Il expose une méthode `.request(url: string, params: object)`. Lisez sa documentation pour plus d'informations.

Si une requête échoue, `.request()` renvoie une promesse rejetée avec valeur `[Response, content]`.

**`Response`** est l'objet [Response](https://developer.mozilla.org/fr/docs/Web/API/Response) classique.

**`content`** est, soit vide (erreur de communication), soit du texte (le serveur a répondu un contenu invalide), soit une `APIError`.

Le type `APIError` est disponible dans le fichier `./src/utils/APIHelper.ts`. Vous pouvez vérifier rapidement qu'une erreur de requête contient une erreur d'API avec le code suivant:
```ts
try {
  await APIHELPER.request('url');
} catch (e) {
  if (Array.isArray(e) && APIHELPER.isApiError(e[1])) {
    // utiliser e[1]...
  }
}
```

#### Fonctions d'aide

Des fonctions servant régulièrement dans différents contextes (par exemple le formatage d'une date) sont disponibles dans `./src/utils/helpers.tsx`.

#### Constantes

Les constantes du projet doivent être déclarées dans `./src/constants.ts`.

#### Connexion / déconnexion

La connexion / déconnexion des utilisateurs est géré par l'objet `SETTINGS` du fichier `./src/utils/Settings.ts`. Cet objet auto-connecte l'utilisateur au démarrage, télécharge son objet utilisateur (par exemple, son objet `Student`) et lance le téléchargement des domaines définis par les enseignants.

#### Types

Les types génériques renvoyées par l'API sont déclarés dans `./src/interfaces.ts`. Ils correspondent à ce que renvoient les modèles du serveur, dans leur méthode `.to_json()`.

Ce fichier contient également les valeurs disponibles dans les choix multiples des formulaires (niveau de l'emploi, taille de l'entreprise...).

## Exemple d'ajout de fonctionnalité

Imaginons que l'on aimerait ajouter un graphique supplémentaire dans les statistiques des enseignants.

Ouvrons le fichier `./src/components/Teacher/Stats/Stats.tsx`.

Imaginons que le serveur, dans l'objet renvoyé par `teacher/stats`, a une nouvelle propriété `avg_wage` qui contient le salaire moyen des emplois, triés par promotion des étudiants.

Il faut modifier l'interface `FullStats` pour lui dire qu'une nouvelle clé est présente dans l'objet reçu:
```ts
interface FullStats {
  <données présentes>,
  avg_wage: {
    // Pour une année donnée (year, en clé), associe un salaire moyen
    [year: string]: number;
  }
}
```

Modifions maintenant le composant `TeacherStats`.

Déclarons que nous avons une balise avec un ID `avg_wage_g` dans laquelle est censée se placer notre graphique.
Il faut modifier ce qui est *retourné* par le composant (render):
```tsx
return (
  <DashboardContainer>
    {!!stats && <div className={classes.grid_insertion}>
      ...
      
      {/* On ajoute un titre et une balise "placeholder" pour notre graph */}
      <Typography variant="h6" className={classes.wage_title}>
        Salaire moyen par année
      </Typography>
    
      <div id="avg_wage_g" className={classes.wage_graph} />
    </div>}
  </DashboardContainer>
);
```

On modifie le CSS pour que le graphe s'affiche correctement.

Fichier *Stats.module.scss*
```scss
.wage_title {
  grid-area: wage-title;
}

.wage_graph {
  grid-area: wage-graph;
}

.grid_insertion {
  ...
  grid-template-areas: "tx-title repartition-title"
                       "tx-graph repartition-graph"
                       "wage-title wage-graph";
}

@media screen and (max-width: 700px) {
  .grid_insertion {
    ...
    grid-template-areas: "tx-title"
                         "tx-graph"
                         "repartition-title"
                         "repartition-graph"
                         "wage-title"
                         "wage-graph";
  }
}
```

Ajoutons une nouvelle fonction `constructAvgWagBarPlot()` à l'intérieur du composant. Nous n'allons pas écrire ici le corps de la fonction, mais imaginons qu'elle construit un bar plot en SVG dans la balise à l'ID `avg_wage_g` depuis `stats.avg_wage`.

Enfin, à l'intérieur de la fonction anonyme prise par le second `React.useEffect` du composant (qui se lance dès que la variable `stats` est modifiée), ajoutons l'appel de notre fonction avec les autres:
```ts
React.useEffect(() => {
  if (stats) {
    ...
    // On ajoute notre fonction de construction
    constructAvgWagBarPlot();
  }
  // Sinon: stats n'est pas défini (chargement en cours)
}, [stats]);
```

Notre graphique est ajouté !

## Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3540](http://localhost:3540) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More about React

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
