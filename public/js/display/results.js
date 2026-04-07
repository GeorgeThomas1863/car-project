import { buildCollapseContainer } from "./collapse.js";

const formatPrice = (price) => {
  if (price == null) return "Price N/A";
  return Number(price).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
};

const formatMileage = (mileage) => {
  if (!mileage) return null;
  return Number(mileage).toLocaleString("en-US") + " mi";
};

const buildListingCard = (listing, isAlternative) => {
  const card = document.createElement("div");
  card.className = isAlternative ? "listing-card listing-card--alt" : "listing-card";

  // Header: year/make/model/trim + price
  const header = document.createElement("div");
  header.className = "listing-card__header";

  const titleSpan = document.createElement("span");
  titleSpan.className = "listing-card__year-make-model";
  const titleParts = [listing.year, listing.make, listing.model, listing.trim].filter(Boolean);
  titleSpan.textContent = titleParts.join(" ");

  const priceSpan = document.createElement("span");
  priceSpan.className = "listing-card__price";
  priceSpan.textContent = formatPrice(listing.price);

  header.append(titleSpan, priceSpan);

  // Meta row: mileage, condition, source, seller — location
  const metaRow = document.createElement("div");
  metaRow.className = "listing-card__meta";

  const metaItems = [
    formatMileage(listing.mileage),
    listing.condition || null,
    listing.source || null,
    listing.seller && listing.location
      ? `${listing.seller} — ${listing.location}`
      : (listing.seller || listing.location || null),
  ].filter(Boolean);

  for (const item of metaItems) {
    const span = document.createElement("span");
    span.className = "listing-card__meta-item";
    span.textContent = item;
    metaRow.append(span);
  }

  card.append(header, metaRow);

  // Missing criteria badges
  if (listing.missing_criteria && listing.missing_criteria.length > 0) {
    const badgesDiv = document.createElement("div");
    badgesDiv.className = "listing-card__badges";
    for (const criterion of listing.missing_criteria) {
      const badge = document.createElement("span");
      badge.className = "listing-badge";
      badge.textContent = criterion;
      badgesDiv.append(badge);
    }
    card.append(badgesDiv);
  }

  // View listing link
  if (listing.url) {
    const link = document.createElement("a");
    link.className = "listing-card__link";
    link.href = listing.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "View Listing →";
    card.append(link);
  }

  return card;
};

const buildSummarySection = (summary) => {
  const section = document.createElement("div");
  section.className = "results-summary-section";
  const p = document.createElement("p");
  p.className = "results-summary";
  p.textContent = summary;
  section.append(p);
  return section;
};

const buildListingsSection = (listings, isAlternative) => {
  const section = document.createElement("div");
  section.className = isAlternative ? "results-alternatives-section" : "results-listings-section";

  const header = document.createElement("h3");
  header.className = isAlternative
    ? "results-section-header alternatives-header"
    : "results-section-header";
  header.textContent = isAlternative
    ? `Alternatives (${listings.length})`
    : `Matches (${listings.length})`;

  const grid = document.createElement("div");
  grid.className = "listings-grid";

  for (const listing of listings) {
    grid.append(buildListingCard(listing, isAlternative));
  }

  section.append(header, grid);
  return section;
};

const buildNotesSection = (notes) => {
  const section = document.createElement("div");
  section.className = "results-notes-section";
  const p = document.createElement("p");
  p.className = "results-notes";
  p.textContent = notes;
  section.append(p);
  return section;
};

export const buildResultsDisplay = async (data) => {
  if (!data) return null;

  const titleElement = document.createElement("h2");
  titleElement.className = "form-title";
  titleElement.textContent = "Search Results";

  const contentElement = document.createElement("div");
  contentElement.className = "results-content";

  if (data.summary) {
    contentElement.append(buildSummarySection(data.summary));
  }

  const hasListings = data.listings && data.listings.length > 0;
  const hasAlternatives = data.alternatives && data.alternatives.length > 0;

  if (hasListings) {
    contentElement.append(buildListingsSection(data.listings, false));
  }

  if (hasAlternatives) {
    contentElement.append(buildListingsSection(data.alternatives, true));
  }

  if (!hasListings && !hasAlternatives) {
    const empty = document.createElement("div");
    empty.className = "results-listings-section";
    const p = document.createElement("p");
    p.className = "results-summary";
    p.textContent = "No listings found matching your criteria.";
    empty.append(p);
    contentElement.append(empty);
  }

  if (data.notes) {
    contentElement.append(buildNotesSection(data.notes));
  }

  const collapseContainer = await buildCollapseContainer({
    titleElement,
    contentElement,
    isExpanded: true,
    className: "results-collapse",
    dataAttribute: "resultsCollapse",
  });

  const wrapper = document.createElement("div");
  wrapper.id = "results-wrapper";
  wrapper.append(collapseContainer);

  return wrapper;
};
