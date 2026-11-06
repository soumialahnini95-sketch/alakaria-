(() => {
  "use strict";

  const data = window.AL_AKARIA_DATA || { properties: [], phoneNumber: "+212665652877", phoneDisplay: "+212 6 65 65 28 77" };
  const properties = data.properties || [];
  const phoneNumber = (data.phoneNumber || "+212665652877").replace(/\D/g, "");
  const phoneDisplay = data.phoneDisplay || "+212 6 65 65 28 77";
  const mediaOrigin = (window.AL_AKARIA_MEDIA_ORIGIN || "").replace(/\/$/, "");
  const heroSlides = [
    { path: "assets/hero/hero-01.jpg", title: "Une villa éclairée au crépuscule", alt: "Ambiance d’une villa contemporaine avec piscine au crépuscule" },
    { path: "assets/hero/hero-02.jpg", title: "Des lignes contemporaines, une lumière chaude", alt: "Ambiance d’une façade résidentielle contemporaine éclairée le soir" },
    { path: "assets/hero/hero-03.jpg", title: "Un extérieur pensé pour ralentir", alt: "Ambiance d’une résidence contemporaine et de son jardin le soir" },
  ];
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const state = { deal: "Tous", type: "", district: "", maxPrice: "", amenity: "", query: "", slide: 0 };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const escapeHTML = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const normalize = (value = "") => String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr");
  const numberFormat = new Intl.NumberFormat("fr-FR");
  const priceLabel = (property) => property.priceDh === null ? "Prix sur demande" : `${numberFormat.format(property.priceDh)} DH${property.deal === "Location" ? " / mois" : ""}`;
  const iconHouse = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M7 23 24 9l17 14v18H7V23Z"/><path d="M19 41V27h10v14"/><path d="M4 24 24 7l20 17"/></svg>';
  const iconSize = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5M8 8l8 8"/></svg>';
  const iconBed = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 19v-9m0 5h18v4M3 13h18v2M6 13V9h5a3 3 0 0 1 3 3m0 1V8h4a3 3 0 0 1 3 3v2"/></svg>';
  const iconBath = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-3ZM5 12V6a3 3 0 0 1 6 0v1m-8 5h18m-5 8v2m-8-2v2"/></svg>';

  function initCarousel() {
    const background = $("#heroBackground");
    if (!background) return;
    background.innerHTML = heroSlides.map((slide, index) => `<div class="hero-slide${index === 0 ? " is-active" : ""}" data-slide="${index}"><img src="${escapeHTML(mediaOrigin + slide.path)}" alt="" /></div>`).join("");
    const dots = $("#heroDots");
    dots.innerHTML = heroSlides.map((slide, index) => `<button class="hero-dot${index === 0 ? " is-active" : ""}" type="button" data-slide-to="${index}" aria-label="Afficher la photo ${index + 1} : ${escapeHTML(slide.alt)}" aria-pressed="${index === 0}"></button>`).join("");
    const showSlide = (index) => {
      state.slide = (index + heroSlides.length) % heroSlides.length;
      $$(".hero-slide", background).forEach((element, i) => element.classList.toggle("is-active", i === state.slide));
      $$(".hero-dot", dots).forEach((element, i) => {
        element.classList.toggle("is-active", i === state.slide);
        element.setAttribute("aria-pressed", String(i === state.slide));
      });
      $("#heroCaption").textContent = heroSlides[state.slide].title;
      const indexLabel = String(state.slide + 1).padStart(2, "0");
      const totalLabel = String(heroSlides.length).padStart(2, "0");
      $("#heroCount").innerHTML = `${indexLabel} <i>/ ${totalLabel}</i>`;
      $("#heroNumber").innerHTML = `${indexLabel} <small>/ ${totalLabel}</small>`;
    };
    dots.addEventListener("click", (event) => {
      const button = event.target.closest("[data-slide-to]");
      if (button) showSlide(Number(button.dataset.slideTo));
    });
    $("#heroPrevious").addEventListener("click", () => showSlide(state.slide - 1));
    $("#heroNext").addEventListener("click", () => showSlide(state.slide + 1));
    background.addEventListener("error", (event) => event.target.closest(".hero-slide")?.classList.add("image-unavailable"), true);
    if (!reduceMotion) window.setInterval(() => showSlide(state.slide + 1), 6500);
  }

  function populateFilters() {
    const types = [...new Set(properties.map((property) => property.type))].sort((a, b) => a.localeCompare(b, "fr"));
    const districts = [...new Set(properties.map((property) => property.district))].sort((a, b) => a.localeCompare(b, "fr"));
    types.forEach((type) => $("#typeFilter").insertAdjacentHTML("beforeend", `<option value="${escapeHTML(type)}">${escapeHTML(type)}</option>`));
    districts.forEach((district) => $("#districtFilter").insertAdjacentHTML("beforeend", `<option value="${escapeHTML(district)}">${escapeHTML(district)}</option>`));
  }

  function cardTemplate(property) {
    const dealClass = property.deal === "Vente" ? "deal-badge deal-badge-sale" : "deal-badge";
    const facts = [
      `<span>${iconSize}${numberFormat.format(property.surface)} m²</span>`,
      property.bedrooms ? `<span>${iconBed}${property.bedrooms} ch.</span>` : "",
      property.bathrooms ? `<span>${iconBath}${property.bathrooms} sdb</span>` : "",
    ].filter(Boolean).join("");
    const image = property.images?.[0];
    const imageSource = image ? `${mediaOrigin}${image}` : "";
    const imageMarkup = `<div class="photo-placeholder">${iconHouse}</div>${image ? `<img class="listing-photo" src="${escapeHTML(imageSource)}" alt="${property.imagesAreIllustrations ? `Illustration d’ambiance non contractuelle pour ${escapeHTML(property.title)}` : escapeHTML(property.title)}" loading="lazy" />` : ""}`;
    const disclaimer = property.imagesAreIllustrations ? `<span class="image-disclaimer">Illustration d’ambiance · non contractuelle</span>` : "";
    return `<article class="property-card"><a href="#bien-${escapeHTML(property.id)}" class="property-photo-link" data-property-id="${escapeHTML(property.id)}" aria-label="Découvrir ${escapeHTML(property.title)}"><div class="property-photo">${imageMarkup}${disclaimer}<span class="${dealClass}">${property.deal === "Vente" ? "À vendre" : "À louer"}</span><span class="photo-open" aria-hidden="true">↗</span></div></a><div class="property-card-body"><div class="property-card-meta"><span>${escapeHTML(property.type)}</span><i></i><span>${escapeHTML(property.district)}</span></div><a href="#bien-${escapeHTML(property.id)}" data-property-id="${escapeHTML(property.id)}" class="property-title-link"><h3>${escapeHTML(property.title)}</h3></a><p class="property-location">⌖ ${escapeHTML(property.city)}</p><div class="property-facts">${facts}</div><div class="property-card-bottom"><strong>${priceLabel(property)}</strong><a class="round-arrow" href="#bien-${escapeHTML(property.id)}" data-property-id="${escapeHTML(property.id)}" aria-label="Voir ${escapeHTML(property.title)}">↗</a></div></div></article>`;
  }

  function filteredProperties() {
    return properties.filter((property) => {
      if (state.deal !== "Tous" && property.deal !== state.deal) return false;
      if (state.type && property.type !== state.type) return false;
      if (state.district && property.district !== state.district) return false;
      if (state.maxPrice && (property.priceDh === null || property.priceDh > Number(state.maxPrice))) return false;
      if (state.amenity && !property.amenities.some((amenity) => normalize(amenity).includes(normalize(state.amenity)))) return false;
      if (state.query) {
        const searchable = normalize(`${property.title} ${property.district} ${property.city} ${property.type} ${property.amenities.join(" ")}`);
        if (!searchable.includes(normalize(state.query))) return false;
      }
      return true;
    });
  }

  function renderProperties() {
    const visible = filteredProperties();
    $("#propertyGrid").innerHTML = visible.map(cardTemplate).join("");
    $("#resultsCount").textContent = String(visible.length).padStart(2, "0");
    $("#resultsLabel").textContent = visible.length === 1 ? "bien trouvé" : "biens trouvés";
    $("#emptyState").hidden = visible.length !== 0;
    $("#propertyGrid").hidden = visible.length === 0;
  }

  function detailTemplate(property) {
    const number = String(properties.findIndex((item) => item.id === property.id) + 1).padStart(2, "0");
    const facts = [
      `<div>${iconSize}<span><strong>${numberFormat.format(property.surface)} m²</strong><small>Surface annoncée</small></span></div>`,
      property.rooms ? `<div><span class="detail-fact-icon">⌂</span><span><strong>${property.rooms} pièces</strong><small>Pièces</small></span></div>` : "",
      property.bedrooms ? `<div>${iconBed}<span><strong>${property.bedrooms} chambre${property.bedrooms > 1 ? "s" : ""}</strong><small>Chambres</small></span></div>` : "",
      property.bathrooms ? `<div>${iconBath}<span><strong>${property.bathrooms} salle${property.bathrooms > 1 ? "s" : ""} de bain</strong><small>Salles de bains</small></span></div>` : "",
    ].filter(Boolean).join("");
    const amenities = property.amenities.map((amenity) => `<span>✓ ${escapeHTML(amenity)}</span>`).join("");
    const message = encodeURIComponent(`Bonjour Al Akaria Transactions, je suis intéressé(e) par : ${property.title} (${property.id}) — ${priceLabel(property)}. ${property.sourceUrl}`);
    const description = property.description || `Annonce publiée par Al Akaria Transactions à ${property.district}, Casablanca. Retrouvez les informations complètes et les dernières disponibilités sur la fiche d’origine.`;
    const image = property.images?.[0];
    const imageSource = image ? `${mediaOrigin}${image}` : "";
    const detailVisual = image ? `<img class="detail-photo" src="${escapeHTML(imageSource)}" alt="Illustration d’ambiance non contractuelle pour ${escapeHTML(property.title)}" />` : `<div class="detail-photo-placeholder">${iconHouse}<span>Photos consultables sur l’annonce source</span></div>`;
    const disclaimer = property.imagesAreIllustrations ? `<span class="image-disclaimer">Illustration d’ambiance · non contractuelle</span>` : "";
    return `<div class="detail-dialog-head"><a class="brand" href="#accueil"><img src="assets/logo.png" alt="Al Akaria Transactions" /></a><button class="detail-close" type="button" data-close aria-label="Fermer">×</button></div><div class="detail-dialog-body"><div class="detail-topline"><div><div class="eyebrow"><span class="eyebrow-line"></span>${escapeHTML(property.type)} · ${property.deal === "Vente" ? "À vendre" : "À louer"}</div><h2>${escapeHTML(property.title)}</h2><p class="detail-location">⌖ ${escapeHTML(property.district)}, ${escapeHTML(property.city)}</p></div><div class="detail-price"><span>${property.deal === "Vente" ? "Prix de vente" : "Loyer annoncé"}</span><strong>${priceLabel(property)}</strong></div></div><div class="detail-layout"><div class="detail-visual">${detailVisual}${disclaimer}</div><aside class="detail-sidebar"><span class="sidebar-label">Les informations clés</span><div class="detail-stats">${facts}</div><a class="button-primary sidebar-contact" href="tel:+212665652877">☎ Appeler l’agence</a><a class="button-whatsapp" href="https://wa.me/${phoneNumber}?text=${message}" target="_blank" rel="noopener noreferrer">◉ Demander sur WhatsApp</a><a class="source-link" href="${escapeHTML(property.sourceUrl)}" target="_blank" rel="noopener noreferrer">Voir l’annonce d’origine sur Mubawab ↗</a></aside></div><div class="detail-content-grid"><section class="detail-description"><div class="eyebrow"><span class="eyebrow-line"></span> À propos du bien</div><h3>Un bien à découvrir<br /><em>à ${escapeHTML(property.district)}.</em></h3><p>${escapeHTML(description)}</p><div class="detail-amenities"><h4>Équipements indiqués dans l’annonce</h4><div>${amenities}</div></div><p class="source-disclaimer">Les données et le tarif proviennent de la fiche source de l’agence et peuvent évoluer. Vérifiez la disponibilité directement auprès de l’agence.</p></section><section class="detail-contact-box"><span class="contact-box-number">${number}<small> / 16</small></span><span class="sidebar-label">Un renseignement ?</span><h3>Parlons de<br /><em>ce bien.</em></h3><p>Contactez directement l’équipe Al Akaria Transactions pour organiser une visite ou poser une question.</p><a href="tel:+212665652877" class="detail-contact-row">☎ <span><small>Appelez-nous</small><strong>${phoneDisplay}</strong></span>↗</a><a href="https://wa.me/${phoneNumber}?text=${message}" target="_blank" rel="noopener noreferrer" class="detail-contact-row">◉ <span><small>WhatsApp</small><strong>Écrire au sujet de ce bien</strong></span>↗</a><a class="source-link source-link-box" href="${escapeHTML(property.sourceUrl)}" target="_blank" rel="noopener noreferrer">Source Mubawab ↗</a></section></div></div>`;
  }

  function renderRoute() {
    const match = window.location.hash.match(/^#bien-(\d+)/);
    const dialog = $("#propertyDialog");
    if (!match) {
      if (dialog.open) dialog.close();
      return;
    }
    const property = properties.find((item) => item.id === match[1]);
    if (!property) {
      window.location.hash = "#biens";
      return;
    }
    $("#detailContent").innerHTML = detailTemplate(property);
    if (!dialog.open) dialog.showModal();
  }

  function initSearch() {
    populateFilters();
    const form = $("#searchForm");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      state.query = $("#queryFilter").value.trim();
      state.type = $("#typeFilter").value;
      state.district = $("#districtFilter").value;
      state.maxPrice = $("#priceFilter").value;
      state.amenity = $("#amenityFilter").value;
      renderProperties();
      document.querySelector("#biens").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    });
    $$(".search-tab").forEach((button) => button.addEventListener("click", () => {
      state.deal = button.dataset.deal;
      $$(".search-tab").forEach((tab) => {
        const active = tab === button;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-pressed", String(active));
      });
    }));
    $("#resetFilters").addEventListener("click", () => {
      form.reset();
      state.deal = "Tous";
      state.type = state.district = state.maxPrice = state.amenity = state.query = "";
      $$(".search-tab").forEach((tab) => {
        const active = tab.dataset.deal === "Tous";
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-pressed", String(active));
      });
      renderProperties();
    });
  }

  function initContact() {
    $("#contactForm").addEventListener("submit", (event) => {
      event.preventDefault();
      if (!event.currentTarget.reportValidity()) return;
      const values = new FormData(event.currentTarget);
      const message = [
        "Bonjour Al Akaria Transactions, je souhaite être recontacté(e).",
        `Nom : ${values.get("name")}`,
        `Téléphone : ${values.get("phone")}`,
        `E-mail : ${values.get("email")}`,
        `Mon projet : ${values.get("message")}`,
      ].join("\n");
      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      $("#formSuccess").hidden = false;
    });
  }

  function initNavigation() {
    const toggle = $("#menuToggle");
    const nav = $("#mainNav");
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      toggle.setAttribute("aria-label", expanded ? "Ouvrir le menu" : "Fermer le menu");
      nav.classList.toggle("is-open", !expanded);
    });
    $$(".main-nav a").forEach((link) => link.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Ouvrir le menu");
      nav.classList.remove("is-open");
    }));
    $("#propertyGrid").addEventListener("click", (event) => {
      const link = event.target.closest("[data-property-id]");
      if (!link) return;
      event.preventDefault();
      window.location.hash = `bien-${link.dataset.propertyId}`;
    });
    $("#propertyGrid").addEventListener("error", (event) => {
      if (event.target.matches("img.listing-photo")) event.target.closest(".property-photo")?.classList.add("photo-missing");
    }, true);
    $("#propertyDialog").addEventListener("error", (event) => {
      if (event.target.matches("img.detail-photo")) event.target.closest(".detail-visual")?.classList.add("photo-missing");
    }, true);
    $("#propertyDialog").addEventListener("click", (event) => {
      if (event.target.closest("[data-close]")) {
        $("#propertyDialog").close();
        if (window.location.hash.startsWith("#bien-")) window.location.hash = "#biens";
      } else if (event.target === $("#propertyDialog")) {
        $("#propertyDialog").close();
        if (window.location.hash.startsWith("#bien-")) window.location.hash = "#biens";
      }
    });
    $("#propertyDialog").addEventListener("close", () => {
      if (window.location.hash.startsWith("#bien-")) window.location.hash = "#biens";
    });
    window.addEventListener("hashchange", renderRoute);
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("#year").textContent = new Date().getFullYear();
    initCarousel();
    initSearch();
    initContact();
    initNavigation();
    renderProperties();
    renderRoute();
  });
})();
