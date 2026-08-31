# Confirm sign up (Inscription)

## Subject

`Mialigo - Confirmation d'inscription`

## Body (HTML)

```html
<div
  style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #111827;"
>
  <h2
    style="font-size: 22px; font-weight: 700; color: #4f46e5; margin-bottom: 16px;"
  >
    Bienvenue sur Mialigo !
  </h2>

  <p style="font-size: 15px; line-height: 22px; color: #374151;">
    Merci de votre inscription. Cliquez sur le bouton ci-dessous pour valider
    votre compte et activer votre page :
  </p>

  <div style="margin: 28px 0; text-align: center;">
    <a
      href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=signup"
      style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;"
    >
      Confirmer mon inscription
    </a>
  </div>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

  <p style="font-size: 13px; color: #6b7280; line-height: 18px;">
    Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br />
    <a
      href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=signup"
      style="color: #4f46e5; word-break: break-all;"
    >
      {{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=signup
    </a>
  </p>
</div>
```

---

# Magic link or OTP (Connexion)

## Subject

`Mialigo - Votre lien de connexion`

## Body (HTML)

```html
<div
  style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #111827;"
>
  <h2
    style="font-size: 22px; font-weight: 700; color: #4f46e5; margin-bottom: 16px;"
  >
    Connexion à Mialigo
  </h2>

  <p style="font-size: 15px; line-height: 22px; color: #374151;">
    Cliquez sur le bouton ci-dessous pour accéder directement à votre tableau de
    bord. Ce lien est à usage unique et utilisable depuis
    <strong>n'importe quel appareil ou navigateur</strong>.
  </p>

  <div style="margin: 28px 0; text-align: center;">
    <a
      href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=magiclink"
      style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;"
    >
      Se connecter à mon compte
    </a>
  </div>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

  <p style="font-size: 13px; color: #6b7280; line-height: 18px;">
    Si le bouton ne fonctionne pas, vous pouvez copier-coller ce lien dans votre
    navigateur :<br />
    <a
      href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=magiclink"
      style="color: #4f46e5; word-break: break-all;"
    >
      {{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=magiclink
    </a>
  </p>
</div>
```
