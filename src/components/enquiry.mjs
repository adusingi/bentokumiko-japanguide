export const enquiryFields = [
  ["name", "Your name", "required"],
  ["email", "Your email", "required"],
  ["language", "Preferred language", "required: English or French"],
  ["travel_when", "Travel timing", "required"],
  ["days", "Duration", "required"],
  ["who", "Party", "required"],
  ["where", "Destinations", "optional"],
  ["loves", "Interests", "required"],
  ["travel_style", "Pace and travel style", "optional"],
  ["budget", "Rough budget", "optional"],
  ["anything_else", "Extra notes", "optional"],
  ["call_preference", "Call preference", "optional"],
];

const configuredCopy = {
  en: {
    trip: ["Japan trip enquiry", "open the enquiry form directly on Tally"],
    shopping: ["Shopping day enquiry", "open the shopping enquiry form directly on Tally"],
    loadFailure: "If the form does not load",
  },
  fr: {
    trip: ["Formulaire de demande pour un voyage au Japon", "ouvrez directement le formulaire de voyage sur Tally"],
    shopping: ["Formulaire de demande pour une journée shopping", "ouvrez directement le formulaire shopping sur Tally"],
    loadFailure: "Si le formulaire ne se charge pas",
  },
};

export function renderEnquiry(tallyFormId, { locale = "en", kind = "trip" } = {}) {
  const copy = configuredCopy[locale];
  if (tallyFormId) {
    const embedUrl = `https://tally.so/embed/${tallyFormId}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`;
    const hostedUrl = `https://tally.so/r/${tallyFormId}`;
    return `<div class="form-card tally-card" data-form-mode="tally">
        <iframe class="tally-frame" data-tally-src="${embedUrl}" title="${copy[kind][0]}" loading="lazy" width="100%" height="200" frameborder="0" marginheight="0" marginwidth="0"></iframe>
        <p class="f-note">${copy.loadFailure}, <a href="${hostedUrl}">${copy[kind][1]}</a>.</p>
      </div>`;
  }

  if (locale === "fr") {
    const service = kind === "shopping" ? "journée shopping" : "voyage sur mesure";
    return `<div class="form-card french-form-placeholder" data-form-mode="placeholder" role="status">
        <div class="form-status preview-status">
          <strong>Le formulaire français est en préparation.</strong>
          <span>La propriétaire prépare un formulaire distinct pour votre demande de ${service}. Aucun renseignement ne peut être saisi, envoyé ou enregistré ici.</span>
        </div>
        <p class="f-note">Cette prévisualisation locale ne remplace pas le formulaire français qui sera publié avant la mise en ligne.</p>
      </div>`;
  }

  return `<div class="form-card" data-form-mode="preview">
        <div class="form-status preview-status" role="status">
          <strong>Form preview — enquiries are not open yet.</strong>
          <span>You can check that your answers are complete, but nothing on this page is sent or saved.</span>
        </div>
        <form class="enquiry-form" id="enquiryForm" method="dialog" novalidate>
          <div class="f-grid">
            <div class="f-field">
              <label for="f-name">Your name <span class="req" aria-hidden="true">*</span></label>
              <input id="f-name" data-field="name" type="text" autocomplete="name" required aria-required="true" />
            </div>
            <div class="f-field">
              <label for="f-email">Your email <span class="req" aria-hidden="true">*</span></label>
              <input id="f-email" data-field="email" type="email" autocomplete="email" required aria-required="true" />
            </div>
            <div class="f-field f-wide">
              <fieldset class="f-radios">
                <legend>Preferred language <span class="req" aria-hidden="true">*</span></legend>
                <div class="f-radio-row">
                  <label class="f-radio"><input type="radio" data-field="language" name="preview-language" value="English" required /> English</label>
                  <label class="f-radio"><input type="radio" data-field="language" name="preview-language" value="French" /> French</label>
                </div>
              </fieldset>
            </div>
            <div class="f-field">
              <label for="f-when">When would you like to travel? <span class="req" aria-hidden="true">*</span></label>
              <input id="f-when" data-field="travel_when" type="text" placeholder="e.g. April 2027 — or ‘not sure yet’" required aria-required="true" />
            </div>
            <div class="f-field">
              <label for="f-days">How many days? <span class="req" aria-hidden="true">*</span></label>
              <input id="f-days" data-field="days" type="text" inputmode="numeric" placeholder="e.g. 12" required aria-required="true" />
            </div>
            <div class="f-field f-wide">
              <label for="f-who">Who is travelling? <span class="req" aria-hidden="true">*</span></label>
              <input id="f-who" data-field="who" type="text" placeholder="e.g. 2 adults, just me, or a family with 2 children" required aria-required="true" />
            </div>
            <div class="f-field f-wide">
              <label for="f-where">Where in Japan do you want to go?</label>
              <input id="f-where" data-field="where" type="text" placeholder="e.g. Kyoto and Tokyo — or no idea yet" />
            </div>
            <div class="f-field f-wide">
              <label for="f-loves">What do you love? <span class="req" aria-hidden="true">*</span></label>
              <textarea id="f-loves" data-field="loves" placeholder="Food, gardens, history, hiking, tea, shopping, quiet places…" required aria-required="true"></textarea>
            </div>
            <div class="f-field f-wide">
              <label for="f-style">How do you like to travel?</label>
              <textarea id="f-style" data-field="travel_style" placeholder="Your pace, comfort level, early starts or slow mornings, must-sees and no-gos…"></textarea>
            </div>
            <div class="f-field f-wide">
              <label for="f-budget">Rough budget</label>
              <input id="f-budget" data-field="budget" type="text" placeholder="An estimate is fine; ‘not sure’ is fine too" />
            </div>
            <div class="f-field f-wide">
              <label for="f-else">Anything else I should know?</label>
              <textarea id="f-else" data-field="anything_else" placeholder="Occasion, mobility, dietary needs, or a place you have always dreamed of…"></textarea>
            </div>
            <div class="f-field f-wide">
              <fieldset class="f-radios">
                <legend>Would you like a call to talk it through?</legend>
                <div class="f-radio-row">
                  <label class="f-radio"><input type="radio" data-field="call_preference" name="preview-call" value="Yes please" /> Yes please</label>
                  <label class="f-radio"><input type="radio" data-field="call_preference" name="preview-call" value="No need" /> No need</label>
                  <label class="f-radio"><input type="radio" data-field="call_preference" name="preview-call" value="Only if useful" /> Only if you think it is useful</label>
                </div>
              </fieldset>
            </div>
          </div>
          <button class="btn btn-red f-submit" type="submit">Check my answers</button>
          <p class="f-note">Fields marked * are required. This preview keeps answers only in this page until you leave or refresh it.</p>
          <p class="form-result" id="formResult" role="status" tabindex="-1" hidden></p>
          <noscript><p class="form-result">JavaScript is required to check this preview. The enquiry form is not live, and nothing has been sent.</p></noscript>
        </form>
      </div>`;
}
