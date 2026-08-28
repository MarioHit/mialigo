export interface SocialNetworkVariant {
  id: string;
  label: string;
  icon: string;
}

export interface SocialNetwork {
  id: string;
  name: string;
  variants: SocialNetworkVariant[];
}

export const socialNetworks: SocialNetwork[] = [
  {
    id: "instagram",
    name: "Instagram",
    variants: [
      {
        id: "official",
        label: "Logo officiel",
        icon: "fa-brands fa-instagram",
      },
      { id: "camera", label: "Appareil photo", icon: "fa-solid fa-camera" },
    ],
  },
  {
    id: "youtube",
    name: "YouTube",
    variants: [
      { id: "official", label: "Logo officiel", icon: "fa-brands fa-youtube" },
      { id: "play", label: "Lecture", icon: "fa-solid fa-play" },
    ],
  },
  {
    id: "tiktok",
    name: "TikTok",
    variants: [
      { id: "official", label: "Logo officiel", icon: "fa-brands fa-tiktok" },
      { id: "music", label: "Musique", icon: "fa-solid fa-music" },
    ],
  },
  {
    id: "facebook",
    name: "Facebook",
    variants: [
      { id: "official", label: "Logo officiel", icon: "fa-brands fa-facebook" },
      { id: "comment", label: "Discussion", icon: "fa-solid fa-comment" },
    ],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    variants: [
      { id: "official", label: "Logo officiel", icon: "fa-brands fa-linkedin" },
      {
        id: "briefcase",
        label: "Professionnel",
        icon: "fa-solid fa-briefcase",
      },
    ],
  },
  {
    id: "github",
    name: "GitHub",
    variants: [
      { id: "official", label: "Logo officiel", icon: "fa-brands fa-github" },
      { id: "code", label: "Code", icon: "fa-solid fa-code" },
    ],
  },
  {
    id: "discord",
    name: "Discord",
    variants: [
      { id: "official", label: "Logo officiel", icon: "fa-brands fa-discord" },
      { id: "message", label: "Message", icon: "fa-solid fa-message" },
    ],
  },
  {
    id: "twitch",
    name: "Twitch",
    variants: [
      { id: "official", label: "Logo officiel", icon: "fa-brands fa-twitch" },
      { id: "video", label: "Vidéo en direct", icon: "fa-solid fa-video" },
    ],
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    variants: [
      { id: "official", label: "Logo officiel", icon: "fa-brands fa-whatsapp" },
      { id: "message", label: "Message", icon: "fa-solid fa-comment" },
    ],
  },
  {
    id: "telegram",
    name: "Telegram",
    variants: [
      { id: "official", label: "Logo officiel", icon: "fa-brands fa-telegram" },
      { id: "send", label: "Envoyer", icon: "fa-solid fa-paper-plane" },
    ],
  },
  {
    id: "x",
    name: "X / Twitter",
    variants: [
      { id: "official", label: "Logo officiel", icon: "fa-brands fa-twitter" },
      { id: "at", label: "Compte", icon: "fa-solid fa-at" },
    ],
  },
  {
    id: "snapchat",
    name: "Snapchat",
    variants: [
      { id: "official", label: "Logo officiel", icon: "fa-brands fa-snapchat" },
      { id: "camera", label: "Appareil photo", icon: "fa-solid fa-camera" },
    ],
  },
  {
    id: "pinterest",
    name: "Pinterest",
    variants: [
      {
        id: "official",
        label: "Logo officiel",
        icon: "fa-brands fa-pinterest",
      },
      { id: "pin", label: "Épingle", icon: "fa-solid fa-thumbtack" },
    ],
  },
  {
    id: "spotify",
    name: "Spotify",
    variants: [
      { id: "official", label: "Logo officiel", icon: "fa-brands fa-spotify" },
      { id: "music", label: "Musique", icon: "fa-solid fa-music" },
    ],
  },
  {
    id: "gitlab",
    name: "GitLab",
    variants: [
      { id: "official", label: "Logo officiel", icon: "fa-brands fa-gitlab" },
      { id: "code", label: "Code", icon: "fa-solid fa-code" },
    ],
  },
  {
    id: "reddit",
    name: "Reddit",
    variants: [
      { id: "official", label: "Logo officiel", icon: "fa-brands fa-reddit" },
      { id: "comment", label: "Discussion", icon: "fa-solid fa-comments" },
    ],
  },
  {
    id: "patreon",
    name: "Patreon",
    variants: [
      { id: "official", label: "Logo officiel", icon: "fa-brands fa-patreon" },
      { id: "heart", label: "Soutien", icon: "fa-solid fa-heart" },
    ],
  },
  {
    id: "email",
    name: "Email",
    variants: [
      { id: "envelope", label: "Enveloppe", icon: "fa-solid fa-envelope" },
      { id: "at", label: "Adresse email", icon: "fa-solid fa-at" },
    ],
  },
  {
    id: "phone",
    name: "Téléphone",
    variants: [
      { id: "phone", label: "Téléphone", icon: "fa-solid fa-phone" },
      {
        id: "mobile",
        label: "Mobile",
        icon: "fa-solid fa-mobile-screen-button",
      },
    ],
  },
  {
    id: "website",
    name: "Site web",
    variants: [
      { id: "globe", label: "Globe", icon: "fa-solid fa-globe" },
      { id: "link", label: "Lien", icon: "fa-solid fa-link" },
    ],
  },
];

export const defaultNetworkIcon = "fa-solid fa-link";

export function findNetworkByIcon(icon: string) {
  return socialNetworks.find((network) =>
    network.variants.some((variant) => variant.icon === icon),
  );
}
