export const LOGIN_EMAIL_TEMPLATE = `
{{ title Connexion à votre compte }}
{{ subtitle Application de suivi des promotions du Master Bio-Informatique }}

{{ strong promos@bioinfo }} est un service web vous permettant de renseigner des informations
en lien avec votre master effectué à Lyon.

{{ new_line }}

En saisissant des données en rapport avec vos stages, contacts, lieux d'embauche et formations précédentes,
vous aidez les promotions plus récentes grâce à vos données et participez à construire des statistiques sur
les débouchés de la formation.

{{ new_line }}

{{ italic La majorité des données saisies sont uniquement visibles par les enseignants. }}

{{ +subtitle }}
  {{ +center }}
    {{ auth_link "Cliquez ici pour vous connecter automatiquement" }}
  {{ -center }}
{{ -subtitle }}

{{ subtitle Accès au site }}  

{{ +strong }}{{ student }}{{ -strong }}, pour vous connecter, suivez le lien de connexion ci-dessus.
Il vous amène directement sur votre tableau de bord, où vous serez en mesure d'ajouter et
actualiser toutes vos informations.

{{ new_line }}
{{ new_line }}

{{ strong Merci pour votre participation ! }}
`.trim();

export const REFRESH_PROFILE_TEMPLATE = `
{{ title Actualisation de votre profil }}
{{ subtitle Application de suivi des promotions du Master Bio-Informatique }}

Bonjour {{ +strong }}{{ studentFirstName }}{{ -strong }}, 
{{ strong promos@bioinfo }} est un service web vous permettant de renseigner des informations
en lien avec votre master effectué à Lyon.

{{ new_line }}

Cela fait un certain temps que l'on ne vous a pas vu sur la plateforme.
Et si vous passiez nous dire ce que vous devenez ?

{{ new_line }}

{{ italic Vos informations nous aident à proposer une formation plus pertinente. }}

{{ +subtitle }}
  {{ +center }}
    {{ auth_link "Cliquez ici pour vous connecter à votre profil" }}
  {{ -center }}
{{ -subtitle }}

{{ subtitle Accès au site }}  

{{ +strong }}{{ student }}{{ -strong }}, pour vous connecter, suivez le lien de connexion ci-dessus.
Il vous amène directement sur votre tableau de bord, où vous serez en mesure d'ajouter et
actualiser toutes vos informations.

{{ new_line }}
{{ new_line }}

{{ strong Merci pour votre participation ! }}
`.trim();
