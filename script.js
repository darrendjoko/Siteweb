/* ==========================================================================
   Emtop Cameroun — validation des formulaires côté client
   Aucun backend : à la soumission, on vérifie les champs, on affiche un
   message d'erreur sous chaque champ invalide, puis un message de
   confirmation si tout est correct. Rien n'est envoyé à un serveur.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  initContactForm();
  initNewsletterForm();
});

/* ---------- Formulaire de contact ---------- */

function initContactForm() {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var messageBox = document.getElementById('contact-message');

  // Chaque champ à valider : élément + fonction de validation + libellé
  var fields = [
    { el: document.getElementById('nom'), validate: validateRequired },
    { el: document.getElementById('telephone'), validate: validatePhone },
    { el: document.getElementById('email'), validate: validateEmailOptional },
    { el: document.getElementById('ville'), validate: validateRequired },
    { el: document.getElementById('message'), validate: validateRequired }
  ];

  // Validation au moment où l'utilisateur quitte un champ (plus confortable
  // qu'une validation à chaque frappe, qui affiche des erreurs trop tôt)
  fields.forEach(function (field) {
    if (!field.el) return;
    field.el.addEventListener('blur', function () {
      var error = field.validate(field.el.value);
      showFieldError(field.el, error);
    });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var firstInvalid = null;
    var isValid = true;

    fields.forEach(function (field) {
      if (!field.el) return;
      var error = field.validate(field.el.value);
      showFieldError(field.el, error);
      if (error) {
        isValid = false;
        if (!firstInvalid) firstInvalid = field.el;
      }
    });

    if (!isValid) {
      showMessage(messageBox, 'Merci de corriger les champs signalés en rouge.', 'error');
      firstInvalid.focus();
      return;
    }

    // Pas de backend ici : on simule simplement l'envoi.
    // C'est à cet endroit qu'un vrai appel réseau (fetch) serait ajouté.
    showMessage(
      messageBox,
      'Merci ! Votre demande a bien été enregistrée. Nous vous recontactons sous 24 h ouvrées.',
      'success'
    );
    form.reset();
    clearAllFieldErrors(fields);
  });
}

/* ---------- Formulaire newsletter (pied de page) ---------- */

function initNewsletterForm() {
  var form = document.getElementById('newsletter-form');
  if (!form) return;

  var input = document.getElementById('email-newsletter');
  var messageBox = document.getElementById('newsletter-message');

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var error = validateEmailRequired(input.value);
    showFieldError(input, error);

    if (error) {
      showMessage(messageBox, 'Merci d\u2019indiquer une adresse e-mail valide.', 'error');
      input.focus();
      return;
    }

    showMessage(messageBox, 'Inscription confirmée, merci !', 'success');
    form.reset();
    showFieldError(input, '');
  });
}

/* ---------- Règles de validation ---------- */

function validateRequired(value) {
  return value.trim().length === 0 ? 'Ce champ est obligatoire.' : '';
}

function validatePhone(value) {
  var trimmed = value.trim();
  if (!trimmed) return 'Le téléphone est obligatoire.';

  var digitsOnly = trimmed.replace(/[\s.\-]/g, '');
  var phonePattern = /^\+?\d{8,15}$/;

  return phonePattern.test(digitsOnly)
    ? ''
    : 'Entrez un numéro valide (8 à 15 chiffres, ex. +237 6 00 00 00 00).';
}

function validateEmailOptional(value) {
  var trimmed = value.trim();
  if (!trimmed) return ''; // champ facultatif dans le formulaire de contact
  return isValidEmail(trimmed) ? '' : 'Entrez une adresse e-mail valide.';
}

function validateEmailRequired(value) {
  var trimmed = value.trim();
  if (!trimmed) return 'L\u2019adresse e-mail est obligatoire.';
  return isValidEmail(trimmed) ? '' : 'Entrez une adresse e-mail valide.';
}

function isValidEmail(value) {
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(value);
}

/* ---------- Affichage des erreurs et messages ---------- */

function showFieldError(inputEl, errorText) {
  if (!inputEl) return;

  var errorEl = document.getElementById(inputEl.id + '-error');

  if (errorEl) {
    errorEl.textContent = errorText;
  }

  if (errorText) {
    inputEl.setAttribute('aria-invalid', 'true');
    inputEl.classList.add('invalid');
  } else {
    inputEl.removeAttribute('aria-invalid');
    inputEl.classList.remove('invalid');
  }
}

function clearAllFieldErrors(fields) {
  fields.forEach(function (field) {
    if (field.el) showFieldError(field.el, '');
  });
}

function showMessage(box, text, type) {
  if (!box) return;

  box.textContent = text;
  box.classList.remove('form-message--success', 'form-message--error');
  box.classList.add(type === 'success' ? 'form-message--success' : 'form-message--error');
  box.hidden = false;

  // Ramène le message dans le champ visible si l'utilisateur a scrollé
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}