# Réglages GitHub

## Sécurité du dépôt

Dans **Settings → Code security**, vérifier les options suivantes :

- [ ] Secret Protection et Push protection
- [ ] Dependabot alerts
- [ ] Dependabot security updates

Ajouter une capture d'écran des paramètres une fois activés.

L'analyse CodeQL est configurée dans `.github/workflows/codeql.yml`.

## Protection de la branche main

Dans **Settings → Branches**, configurer une règle pour `main` :

- [ ] Demander une pull request avant la fusion
- [ ] Rendre obligatoires les contrôles `test`, `deps-audit` et CodeQL
- [ ] Vérifier que la branche est à jour avant la fusion
- [ ] Interdire les push forcés et la suppression de la branche

Les cases sont à cocher après vérification sur GitHub.
