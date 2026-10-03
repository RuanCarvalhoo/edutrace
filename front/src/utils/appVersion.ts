// A versão vem do build da imagem: a esteira de release passa o número da
// release como APP_VERSION, e o Dockerfile o grava em NEXT_PUBLIC_APP_VERSION.
// Build feito fora da esteira, como o de desenvolvimento ou um build direto no
// servidor, não tem versão e aparece como "local".
const RELEASE_TAG_URL =
  "https://github.com/jardimdesoftware/edutrace/releases/tag/";
const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;

export type AppVersion = {
  label: string;
  url: string | null;
};

export function describeAppVersion(version: string | undefined): AppVersion {
  if (version && VERSION_PATTERN.test(version)) {
    return { label: version, url: `${RELEASE_TAG_URL}${version}` };
  }

  return { label: "local", url: null };
}
