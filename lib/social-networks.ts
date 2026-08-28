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
