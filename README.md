# ⏰ TaskRemember — Application de rappels mobile

Petite application développée en **React Native**, permettant à l’utilisateur de créer des rappels avec notifications.

---

## 🎯 Objectif

Un projet personnel simple, conçu pour :

- Pratiquer React Native dans un contexte concret
- Manipuler **AsyncStorage** pour le stockage local
- Gérer les **notifications programmées**
- Générer un **APK Android** prêt à être testé ou distribué

---

## ✨ Fonctionnalités

- Création de rappels avec :
  - Titre
  - Date et heure
  - Déclenchement d’une **notification X minutes avant**
- Stockage des rappels en **local** (AsyncStorage)
- Notification locale (via `notifee`)
- Liste des rappels enregistrés
- APK générée pour Android

---

## ⚠️ Limitations actuelles

- L’utilisateur doit encore **autoriser manuellement** les notifications en arrière-plan dans les **paramètres système (feature à venir ?).

---

## 🔧 Stack technique

- **React Native (TypeScript)**
- **AsyncStorage**
- **Notifee** ou équivalent pour les notifications
- **React Navigation**
- Testée sous **Android**

---

## 📱 Statut

Application **fonctionnelle**, à améliorer éventuellement pour une V2 avec :
- Notifications automatiques sans paramétrage manuel
- Design amélioré

---

## 📦 Build

APK Android généré manuellement pour tests internes.

