import { GoogleAnalytics } from "@next/third-parties/google";
import { CONSENT_STORAGE_KEY, GA_MEASUREMENT_ID } from "@/lib/analytics";
import { CookieBanner } from "@/components/analytics/CookieBanner";
import type { Locale } from "@/i18n/locales";

/**
 * Script de arranque de Consent Mode v2.
 *
 * Va como <script> inline (no next/script): el navegador lo ejecuta al parsear
 * el HTML, es decir ANTES de que gtag.js se cargue con `afterInteractive`. Ese
 * orden es obligatorio — si los `default` llegan después del config, GA4 ya
 * habría escrito cookies.
 *
 * `wait_for_update: 500` da medio segundo a que el banner aplique una decisión
 * ya guardada antes de que GA mande el primer hit.
 */
function ConsentBootstrap() {
  const js = `
window.dataLayer=window.dataLayer||[];
function gtag(){window.dataLayer.push(arguments);}
window.gtag=gtag;
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});
try{if(window.localStorage.getItem('${CONSENT_STORAGE_KEY}')==='granted'){gtag('consent','update',{analytics_storage:'granted'});}}catch(e){}
`.trim();

  return <script id="consent-bootstrap" dangerouslySetInnerHTML={{ __html: js }} />;
}

/**
 * Analítica de la parte pública: Consent Mode + GA4 + banner de cookies.
 * Sin `NEXT_PUBLIC_GA_MEASUREMENT_ID` no se renderiza nada (entornos locales y
 * previews quedan limpios por defecto). No se monta en `area-privada/`: el uso
 * interno del panel no debe contaminar las métricas de marketing.
 */
export function Analytics({ locale = "es" }: { locale?: Locale }) {
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <ConsentBootstrap />
      <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
      <CookieBanner locale={locale} />
    </>
  );
}
