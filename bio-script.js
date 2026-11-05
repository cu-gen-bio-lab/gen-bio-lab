const searchInput = document.getElementById("searchInput");
const labCards = document.querySelectorAll(".lab-card");

searchInput.addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase();

  labCards.forEach(card => {
    const title = card.getAttribute("data-title").toLowerCase();
    const visible = title.includes(searchTerm);
    card.style.display = visible ? "flex" : "none";
  });
});