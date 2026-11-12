const TERMS = {
  en: {
    contentType: "text/html",
    content: `<!DOCTYPE html><html><body><h1>Terms of Service</h1><p>By using this service you agree to these terms.</p></body></html>`,
  },
};

const PRIVACY = {
  en: {
    contentType: "text/html",
    content: `<!DOCTYPE html><html><body><h1>Privacy Policy</h1><p>We respect your privacy and handle data as described here.</p></body></html>`,
  },
};

export const getTerms = (locale) => {
  const key = (locale ?? "en").toLowerCase();
  return TERMS[key] ?? null;
};

export const getPrivacy = (locale) => {
  const key = (locale ?? "en").toLowerCase();
  return PRIVACY[key] ?? null;
};
