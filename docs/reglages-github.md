# Réglages à vérifier sur GitHub

Les fichiers sont publiés par la connexion GitHub. Les outils de cette connexion ne permettent pas de modifier les paramètres d'administration. La session web n'est pas connectée : les points ci-dessous ne sont donc pas attestés.

## Settings → Code security / Secret Protection

- [ ] Secret scanning / Secret Protection activé.
- [ ] Push protection activée.
- [ ] Dependabot alerts activé.
- [ ] Dependabot security updates activé.
- [ ] Ajouter ici une capture réelle de ces réglages (ne pas inventer une capture).

CodeQL est déjà lancé par `.github/workflows/codeql.yml`, en configuration avancée. Ne pas activer Default en plus de ce workflow.

## Settings → Branches → règle pour main

- [ ] Exiger une pull request avant la fusion.
- [ ] Exiger les contrôles `test`, `deps-audit`, `CodeQL` et `image`.
- [ ] Exiger une branche à jour avant la fusion.
- [ ] Bloquer les suppressions et les push forcés.

Pour ce dépôt solo, la PR peut être obligatoire sans imposer un avis d'une autre personne. Les noms des contrôles sont à sélectionner après leur première exécution réussie.

Ce fichier décrit ce qui reste à vérifier ; il ne constitue pas une preuve d'activation.
