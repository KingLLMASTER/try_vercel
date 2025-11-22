# 📤 Guide de Transfert vers GitHub

Ce projet est prêt à être envoyé sur GitHub. Suivez ces étapes pour publier votre code.

## 1. Préparer GitHub

1.  Connectez-vous à votre compte GitHub.
2.  Créez un **Nouveau Repository** (bouton "New" ou "+").
3.  Donnez-lui un nom (ex: `flux-plan`).
4.  **Ne cochez pas** "Initialize with README", "Add .gitignore", ou "Add license" (nous avons déjà ces fichiers).
5.  Cliquez sur **Create repository**.

## 2. Initialiser Git localement

Ouvrez votre terminal dans le dossier du projet (`d:\Workplace_Antigravity_google_gemini`) et lancez les commandes suivantes :

```bash
# 1. Initialiser git (si ce n'est pas déjà fait)
git init

# 2. Ajouter tous les fichiers
git add .

# 3. Faire le premier commit
git commit -m "Initial commit: Flux Plan v1.0"

# 4. Renommer la branche principale en 'main'
git branch -M main

# 5. Lier votre dossier local à GitHub (remplacez URL_DU_REPO par l'lien de votre repo créé à l'étape 1)
git remote add origin URL_DU_REPO

# 6. Envoyer le code
git push -u origin main
```

## ⚠️ Important

-   Le fichier `.env` contenant vos clés secrètes est **ignoré** par git (grâce au fichier `.gitignore`). C'est normal et sécurisé.
-   Vous devrez configurer ces variables d'environnement manuellement sur votre plateforme de déploiement (Vercel, Netlify, etc.).
