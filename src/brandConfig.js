// White label (co-branding level 4, planned): agencies and recruiters with their own brand.
// When VITE_WHITE_LABEL_NAME is set at build time, the partner logo replaces macher.ki in the
// app and login, and macher.ki only appears as «powered by» in the login footer.
//
//   VITE_WHITE_LABEL_NAME=Muster Personal AG
//   VITE_WHITE_LABEL_LOGO=/partner/logo.svg   (optional)
//   VITE_WHITE_LABEL_COLOR=#2747C9            (optional, runs through the client-colour rules)
const env = import.meta.env || {}
const name = (env.VITE_WHITE_LABEL_NAME || '').trim()

export const WHITE_LABEL = name
  ? Object.freeze({ name, logo: (env.VITE_WHITE_LABEL_LOGO || '').trim(), color: (env.VITE_WHITE_LABEL_COLOR || '').trim() })
  : null
