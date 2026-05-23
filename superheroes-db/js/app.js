/* ==========================================================================
   SuperHeroes DB - Core JavaScript Orchestration Engine (Refined Grotesque)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  
  // 1. Core State Management
  let activeSearch = "";
  let activePublisher = "all";
  let activeAlignment = "all";
  let activeSorter = "default";
  
  // Persistent Favorites Set
  let favorites = new Set();
  
  // Battle Arena Fighters State
  let fighter1 = null;
  let fighter2 = null;
  let pickingFighterSlot = null; // 1 or 2
  let isSimulating = false;

  // 2. DOM Elements Selection
  const heroesGrid = document.getElementById("heroes-grid");
  const searchInput = document.getElementById("search-input");
  const publisherFilters = document.getElementById("filter-publisher");
  const alignmentFilters = document.getElementById("filter-alignment");
  const sortSelect = document.getElementById("sort-select");
  const statusText = document.getElementById("status-text");

  // Favorites UI
  const favDrawer = document.getElementById("favorites-drawer");
  const favsTrigger = document.getElementById("hud-favs-trigger");
  const favsClose = document.getElementById("hud-favs-close");
  const favDrawerOverlay = document.getElementById("fav-drawer-overlay");
  const favCount = document.getElementById("fav-count");
  const favListContainer = document.getElementById("fav-list-container");

  // Character Detail Modal UI
  const detailModal = document.getElementById("detail-modal");
  const modalCloseTrigger = document.getElementById("modal-close-trigger");
  const modalCloseBackdrop = document.getElementById("modal-close-backdrop");
  const modalTabs = document.querySelector(".modal-tabs");
  const tabContents = document.querySelectorAll(".tab-content");
  const tabTriggers = document.querySelectorAll(".tab-trigger");

  // Battle Arena Modal UI
  const battleArenaModal = document.getElementById("battle-arena-modal");
  const battleTrigger = document.getElementById("hud-battle-trigger");
  const battleCloseTrigger = document.getElementById("battle-close-trigger");
  const battleCloseBackdrop = document.getElementById("battle-close-backdrop");
  
  const f1SelectorTrigger = document.getElementById("f1-selector-trigger");
  const f2SelectorTrigger = document.getElementById("f2-selector-trigger");
  const f1Placeholder = document.getElementById("f1-placeholder-ui");
  const f2Placeholder = document.getElementById("f2-placeholder-ui");
  const f1Profile = document.getElementById("f1-profile-ui");
  const f2Profile = document.getElementById("f2-profile-ui");
  const f1Telemetry = document.getElementById("f1-telemetry");
  const f2Telemetry = document.getElementById("f2-telemetry");

  const fightBtn = document.getElementById("arena-fight-btn");
  const resetBtn = document.getElementById("arena-reset-btn");
  const consoleLogs = document.getElementById("arena-console");
  const logsWindow = document.getElementById("console-logs-window");

  // Fighter Picker Modal UI
  const pickerModal = document.getElementById("fighter-picker-modal");
  const pickerCloseTrigger = document.getElementById("picker-close-trigger");
  const pickerCloseBackdrop = document.getElementById("picker-close-backdrop");
  const pickerListContainer = document.getElementById("picker-list-container");

  // Initialize App
  function init() {
    loadFavorites();
    renderRegistry();
    setupEventListeners();
  }

  // 3. Persistent Favorites Lifecycle (LocalStorage)
  function loadFavorites() {
    try {
      const stored = localStorage.getItem("metahuman_favorites");
      if (stored) {
        const parsed = JSON.parse(stored);
        favorites = new Set(parsed);
      }
    } catch (e) {
      console.error("Error reading favorites:", e);
    }
    updateFavoritesBadge();
  }

  function saveFavorites() {
    try {
      localStorage.setItem("metahuman_favorites", JSON.stringify([...favorites]));
    } catch (e) {
      console.error("Error saving favorites:", e);
    }
    updateFavoritesBadge();
    renderFavoritesDrawer();
  }

  function toggleFavorite(id, e) {
    if (e) e.stopPropagation(); // Stop details modal from triggering
    if (favorites.has(id)) {
      favorites.delete(id);
    } else {
      favorites.add(id);
    }
    saveFavorites();
    // Update local card UI without re-rendering everything
    const cardFavBtn = document.querySelector(`.hero-card[data-id="${id}"] .fav-card-btn`);
    if (cardFavBtn) {
      cardFavBtn.classList.toggle("active", favorites.has(id));
      cardFavBtn.innerHTML = favorites.has(id) ? '<i class="fa-solid fa-bookmark"></i>' : '<i class="fa-regular fa-bookmark"></i>';
    }
  }

  function updateFavoritesBadge() {
    favCount.textContent = favorites.size;
  }

  function renderFavoritesDrawer() {
    favListContainer.innerHTML = "";
    if (favorites.size === 0) {
      favListContainer.innerHTML = `
        <div class="empty-fav-state">
          <i class="fa-solid fa-bookmark-slash"></i>
          <p>NO PERSISTED BOOKMARKS</p>
          <span style="font-size: 0.65rem; color: var(--color-text-muted);">Add heroes to quick access</span>
        </div>
      `;
      return;
    }

    favorites.forEach(id => {
      const hero = SUPERHEROES_DB.find(h => h.id === id);
      if (hero) {
        const itemRow = document.createElement("div");
        itemRow.className = "fav-item-row";
        itemRow.innerHTML = `
          <div class="fav-item-avatar" style="background-image: url('${hero.avatar}')"></div>
          <div class="fav-item-info">
            <h4>${hero.name}</h4>
            <p>${hero.realName} | ${hero.publisher}</p>
          </div>
          <button class="fav-delete-btn" title="Remove Bookmark"><i class="fa-solid fa-trash-can"></i></button>
        `;
        
        // Open details on click
        itemRow.addEventListener("click", () => {
          closeFavoritesDrawer();
          openDetailsModal(hero.id);
        });

        // Delete trigger
        itemRow.querySelector(".fav-delete-btn").addEventListener("click", (e) => {
          e.stopPropagation();
          toggleFavorite(hero.id);
        });

        favListContainer.appendChild(itemRow);
      }
    });
  }

  // 4. Registry Rendering & Card 3D-Tilt Interaction
  function renderRegistry() {
    heroesGrid.innerHTML = "";

    // Apply Search debouncing and Filter chains
    let filtered = SUPERHEROES_DB.filter(hero => {
      const matchName = hero.name.toLowerCase().includes(activeSearch.toLowerCase()) || 
                        hero.realName.toLowerCase().includes(activeSearch.toLowerCase());
      const matchPublisher = activePublisher === "all" || hero.publisher.toLowerCase() === activePublisher.toLowerCase();
      const matchAlignment = activeAlignment === "all" || hero.alignment.toLowerCase() === activeAlignment.toLowerCase();
      return matchName && matchPublisher && matchAlignment;
    });

    // Apply Calibrated Sorter Slices
    if (activeSorter !== "default") {
      filtered.sort((a, b) => b.stats[activeSorter] - a.stats[activeSorter]);
    }

    // Update Status Banner
    statusText.textContent = `METAHUMAN DATABASE ONLINE (${filtered.length} PROFILE${filtered.length === 1 ? '' : 'S'} MOUNTED)`;

    if (filtered.length === 0) {
      heroesGrid.innerHTML = `
        <div class="no-results-box animate-fade-in">
          <i class="fa-solid fa-face-frown-open"></i>
          <h3>REGISTRY QUERY BLANK</h3>
          <p>Scanner found no metahumans matching the active criteria. Re-calibrate filters.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(hero => {
      const card = document.createElement("div");
      card.className = "hero-card";
      card.setAttribute("data-publisher", hero.publisher);
      card.setAttribute("data-id", hero.id);
      
      const isFav = favorites.has(hero.id);
      const pubClass = hero.publisher === "Marvel" ? "marvel-tag" : "dc-tag";

      card.innerHTML = `
        <div class="card-avatar-box">
          <img src="${hero.avatar}" class="card-img" alt="${hero.name}" loading="lazy">
          <div class="card-gradient-overlay"></div>
          <span class="pub-tag ${pubClass}">${hero.publisher.toUpperCase()}</span>
        </div>
        <div class="card-body">
          <div class="card-title-row">
            <h3>${hero.name}</h3>
            <button class="fav-card-btn ${isFav ? 'active' : ''}" title="Bookmark">
              ${isFav ? '<i class="fa-solid fa-bookmark"></i>' : '<i class="fa-regular fa-bookmark"></i>'}
            </button>
          </div>
          <p class="card-realname">${hero.realName}</p>
          
          <div class="card-stats-hud">
            <div class="c-stat-row">
              <span>INTELLECT</span>
              <div class="c-stat-bar-container">
                <div class="c-stat-bar-fill intellect-bg" style="width: ${hero.stats.intelligence}%"></div>
              </div>
            </div>
            <div class="c-stat-row">
              <span>STRENGTH</span>
              <div class="c-stat-bar-container">
                <div class="c-stat-bar-fill strength-bg" style="width: ${hero.stats.strength}%"></div>
              </div>
            </div>
            <div class="c-stat-row">
              <span>POWER</span>
              <div class="c-stat-bar-container">
                <div class="c-stat-bar-fill power-bg" style="width: ${hero.stats.power}%"></div>
              </div>
            </div>
          </div>
          
          <span class="card-alignment-badge ${hero.alignment}">${hero.alignment.toUpperCase()}</span>
        </div>
      `;

      // 3D Perspective Mousemove Tilt Effect
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; 
        const y = e.clientY - rect.top; 
        const xc = rect.width / 2;
        const yc = rect.height / 2;
        
        // Calculate angle ratios
        const tiltX = (yc - y) / 10;
        const tiltY = (x - xc) / 10;

        card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
        card.style.transition = "transform 0.5s ease";
      });

      card.addEventListener("mouseenter", () => {
        card.style.transition = "none";
      });

      // Bind details modal open on click
      card.addEventListener("click", () => {
        openDetailsModal(hero.id);
      });

      // Bind favorites toggle on click
      card.querySelector(".fav-card-btn").addEventListener("click", (e) => {
        toggleFavorite(hero.id, e);
      });

      heroesGrid.appendChild(card);
    });
  }

  // 5. Dynamic Details Modal & Sleek Progress Bars
  function openDetailsModal(id) {
    const hero = SUPERHEROES_DB.find(h => h.id === id);
    if (!hero) return;

    // Reset tabs back to Stats
    tabTriggers.forEach(t => t.classList.remove("active"));
    tabContents.forEach(c => c.classList.remove("active"));
    document.querySelector('.tab-trigger[data-tab="stats-tab"]').classList.add("active");
    document.getElementById("stats-tab").classList.add("active");

    // Inject identity
    document.getElementById("modal-char-name").textContent = hero.name.toUpperCase();
    document.getElementById("modal-real-name").textContent = `Real Identity: ${hero.realName}`;
    
    // Set artwork backdrop
    document.getElementById("modal-profile-art-bg").style.backgroundImage = `url('${hero.avatar}')`;

    // Inject Publisher badge
    const pubBadge = document.getElementById("modal-badge-publisher");
    pubBadge.className = `modal-pub-tag ${hero.publisher === "Marvel" ? "marvel-accent" : "dc-accent"}`;
    pubBadge.textContent = hero.publisher.toUpperCase();

    // Inject Alignment badge
    const alignBadge = document.getElementById("modal-badge-alignment");
    alignBadge.className = `modal-alignment-badge ${hero.alignment}`;
    alignBadge.textContent = hero.alignment.toUpperCase();

    // Inject Stats & Sleek Horizontal Progress Bars
    const statsArr = ["intelligence", "strength", "speed", "durability", "power", "combat"];
    
    statsArr.forEach(statKey => {
      const val = hero.stats[statKey];
      const barEl = document.getElementById(`bar-${statKey}`);
      const valEl = document.getElementById(`val-${statKey}`);

      valEl.textContent = val;
      barEl.style.width = "0%";
      
      // Delay slightly for animation transition
      setTimeout(() => {
        barEl.style.width = `${val}%`;
      }, 50);
    });

    // Inject Aggregate stat fill bar
    const sum = statsArr.reduce((acc, curr) => acc + hero.stats[curr], 0);
    const avg = Math.round(sum / 6);
    document.getElementById("agg-stat-value").textContent = `${avg}%`;
    document.getElementById("agg-fill-percentage").style.width = "0%";
    
    setTimeout(() => {
      document.getElementById("agg-fill-percentage").style.width = `${avg}%`;
    }, 200);

    // Inject Biography details
    document.getElementById("bio-first-app").textContent = hero.biography.firstAppearance;
    document.getElementById("bio-birthplace").textContent = hero.biography.placeOfBirth;
    document.getElementById("bio-occupation").textContent = hero.biography.occupation;
    document.getElementById("bio-alter-egos").textContent = hero.biography.alterEgos;

    // Inject Connections details
    document.getElementById("conn-groups").textContent = hero.connections.groupAffiliation;
    document.getElementById("conn-relatives").textContent = hero.connections.relatives;

    // Activate modal
    detailModal.classList.add("active");
    document.body.style.overflow = "hidden"; // Disable background scrolling
  }

  function closeDetailsModal() {
    detailModal.classList.remove("active");
    document.body.style.overflow = ""; // Restore background scrolling
    
    // Clear bar widths back to default
    const statsArr = ["intelligence", "strength", "speed", "durability", "power", "combat"];
    statsArr.forEach(statKey => {
      document.getElementById(`bar-${statKey}`).style.width = "0%";
    });
  }

  // 6. Holographic Combat Simulator logic
  function openBattleArena() {
    battleArenaModal.classList.add("active");
    document.body.style.overflow = "hidden";
    resetBattleSimulation();
  }

  function closeBattleArena() {
    if (isSimulating) return; // Prevent closing mid-simulation
    battleArenaModal.classList.remove("active");
    document.body.style.overflow = "";
  }

  function resetBattleSimulation() {
    fighter1 = null;
    fighter2 = null;
    isSimulating = false;

    // Reset visual frames
    f1Placeholder.classList.remove("hide");
    f1Profile.classList.add("hide");
    f1Telemetry.innerHTML = "";
    document.getElementById("fighter1-card").className = "fighter-select-panel";

    f2Placeholder.classList.remove("hide");
    f2Profile.classList.add("hide");
    f2Telemetry.innerHTML = "";
    document.getElementById("fighter2-card").className = "fighter-select-panel";

    fightBtn.removeAttribute("disabled");
    fightBtn.classList.remove("hide");
    fightBtn.textContent = "RUN SIMULATION";
    resetBtn.classList.add("hide");
    consoleLogs.classList.add("hide");
    logsWindow.innerHTML = "";
    updateFightBtnState();
  }

  function updateFightBtnState() {
    if (fighter1 && fighter2) {
      fightBtn.removeAttribute("disabled");
    } else {
      fightBtn.setAttribute("disabled", "true");
    }
  }

  function openFighterPicker(slot) {
    pickingFighterSlot = slot;
    pickerListContainer.innerHTML = "";

    SUPERHEROES_DB.forEach(hero => {
      // Prevent selecting the same hero in both chambers
      const alreadyPicked = (slot === 1 && fighter2 && fighter2.id === hero.id) ||
                            (slot === 2 && fighter1 && fighter1.id === hero.id);

      const pickerRow = document.createElement("div");
      pickerRow.className = `picker-row ${alreadyPicked ? 'disabled' : ''}`;
      pickerRow.innerHTML = `
        <div class="picker-avatar" style="background-image: url('${hero.avatar}')"></div>
        <div class="picker-info">
          <h4>${hero.name}</h4>
          <p>${hero.realName} | ${hero.publisher}</p>
        </div>
      `;

      if (!alreadyPicked) {
        pickerRow.addEventListener("click", () => {
          selectFighter(hero.id);
        });
      }

      pickerListContainer.appendChild(pickerRow);
    });

    pickerModal.classList.add("active");
  }

  function closeFighterPicker() {
    pickerModal.classList.remove("active");
    pickingFighterSlot = null;
  }

  function selectFighter(id) {
    const hero = SUPERHEROES_DB.find(h => h.id === id);
    if (!hero) return;

    if (pickingFighterSlot === 1) {
      fighter1 = hero;
      
      // Update UI Frame
      f1Placeholder.classList.add("hide");
      f1Profile.classList.remove("hide");
      document.getElementById("f1-avatar").style.backgroundImage = `url('${hero.avatar}')`;
      document.getElementById("f1-name").textContent = hero.name.toUpperCase();
      document.getElementById("f1-pub").textContent = hero.publisher.toUpperCase();
      
      const cardF1 = document.getElementById("fighter1-card");
      cardF1.className = `fighter-select-panel has-selected ${hero.publisher === "Marvel" ? "marvel-selected" : "dc-selected"}`;

      // Inject telemetry bars
      f1Telemetry.innerHTML = `
        <div class="a-stat-row">
          <div class="a-stat-label-row"><span>COMBAT</span><span>${hero.stats.combat}</span></div>
          <div class="a-stat-bar-container"><div class="a-stat-bar-fill" style="width: ${hero.stats.combat}%; background-color: var(--color-combat)"></div></div>
        </div>
        <div class="a-stat-row">
          <div class="a-stat-label-row"><span>POWER</span><span>${hero.stats.power}</span></div>
          <div class="a-stat-bar-container"><div class="a-stat-bar-fill" style="width: ${hero.stats.power}%; background-color: var(--color-power)"></div></div>
        </div>
        <div class="a-stat-row">
          <div class="a-stat-label-row"><span>STRENGTH</span><span>${hero.stats.strength}</span></div>
          <div class="a-stat-bar-container"><div class="a-stat-bar-fill" style="width: ${hero.stats.strength}%; background-color: var(--color-strength)"></div></div>
        </div>
      `;
    } else if (pickingFighterSlot === 2) {
      fighter2 = hero;
      
      // Update UI Frame
      f2Placeholder.classList.add("hide");
      f2Profile.classList.remove("hide");
      document.getElementById("f2-avatar").style.backgroundImage = `url('${hero.avatar}')`;
      document.getElementById("f2-name").textContent = hero.name.toUpperCase();
      document.getElementById("f2-pub").textContent = hero.publisher.toUpperCase();
      
      const cardF2 = document.getElementById("fighter2-card");
      cardF2.className = `fighter-select-panel has-selected ${hero.publisher === "Marvel" ? "marvel-selected" : "dc-selected"}`;

      // Inject telemetry bars
      f2Telemetry.innerHTML = `
        <div class="a-stat-row">
          <div class="a-stat-label-row"><span>COMBAT</span><span>${hero.stats.combat}</span></div>
          <div class="a-stat-bar-container"><div class="a-stat-bar-fill" style="width: ${hero.stats.combat}%; background-color: var(--color-combat)"></div></div>
        </div>
        <div class="a-stat-row">
          <div class="a-stat-label-row"><span>POWER</span><span>${hero.stats.power}</span></div>
          <div class="a-stat-bar-container"><div class="a-stat-bar-fill" style="width: ${hero.stats.power}%; background-color: var(--color-power)"></div></div>
        </div>
        <div class="a-stat-row">
          <div class="a-stat-label-row"><span>STRENGTH</span><span>${hero.stats.strength}</span></div>
          <div class="a-stat-bar-container"><div class="a-stat-bar-fill" style="width: ${hero.stats.strength}%; background-color: var(--color-strength)"></div></div>
        </div>
      `;
    }

    closeFighterPicker();
    updateFightBtnState();
  }

  // Holographic battle evaluating simulation engine
  function executeBattleSimulation() {
    if (!fighter1 || !fighter2 || isSimulating) return;

    isSimulating = true;
    fightBtn.setAttribute("disabled", "true");
    consoleLogs.classList.remove("hide");
    logsWindow.innerHTML = "";

    const logs = [];
    logs.push({ text: `>>> INITIALIZING TACTICAL SYSTEM OVERLAY...`, type: "system" });
    logs.push({ text: `>>> SCANNING FIGHTER 1 PROFILE: ${fighter1.name.toUpperCase()} [Combat Core: ${fighter1.stats.combat}]`, type: "system" });
    logs.push({ text: `>>> SCANNING FIGHTER 2 PROFILE: ${fighter2.name.toUpperCase()} [Combat Core: ${fighter2.stats.combat}]`, type: "system" });
    logs.push({ text: `>>> BATTLE TELEMETRY LOCK ON. COMMENCING COMBAT SIMULATION...`, type: "system" });

    // Round by round simulation loop
    let hp1 = 100;
    let hp2 = 100;
    let round = 1;
    
    // Weighted Combat Evaluator formula:
    const getAttackRating = (f) => (f.stats.combat * 0.35) + (f.stats.power * 0.25) + (f.stats.strength * 0.2) + (f.stats.speed * 0.2);
    const getDefenseRating = (f) => (f.stats.durability * 0.2) + (f.stats.speed * 0.1);

    const f1Attack = getAttackRating(fighter1);
    const f1Defense = getDefenseRating(fighter1);
    const f2Attack = getAttackRating(fighter2);
    const f2Defense = getDefenseRating(fighter2);

    while (hp1 > 0 && hp2 > 0 && round <= 6) {
      logs.push({ text: `\n[ROUND ${round}] ------------------------------------------`, type: "system" });

      // Fighter 1 attacks Fighter 2
      const baseDamage1 = f1Attack - f2Defense * 0.5;
      const finalDamage1 = Math.max(8, Math.round(baseDamage1 + (Math.random() * 15)));
      hp2 = Math.max(0, hp2 - finalDamage1);

      const actionTexts1 = [
        `${fighter1.name} unleashes a devastating physical combo, hitting for ${finalDamage1} points!`,
        `${fighter1.name} channels cosmic energy output, tearing down ${fighter2.name}'s defenses for ${finalDamage1} damage!`,
        `${fighter1.name} strikes with precise tactical combat intelligence, finding a critical opening for ${finalDamage1} damage!`
      ];
      logs.push({ text: actionTexts1[Math.floor(Math.random() * actionTexts1.length)], type: "action" });
      logs.push({ text: `>> ${fighter2.name} Health drops to ${hp2}%`, type: "system" });

      if (hp2 <= 0) {
        break;
      }

      // Fighter 2 attacks Fighter 1
      const baseDamage2 = f2Attack - f1Defense * 0.5;
      const finalDamage2 = Math.max(8, Math.round(baseDamage2 + (Math.random() * 15)));
      hp1 = Math.max(0, hp1 - finalDamage2);

      const actionTexts2 = [
        `${fighter2.name} counterattacks with extreme swift velocity, striking back for ${finalDamage2} points!`,
        `${fighter2.name} harnesses the strength of their metahuman power, causing ${finalDamage2} points of raw damage!`,
        `${fighter2.name} executes a flawless counter-maneuver, slamming ${fighter1.name} for ${finalDamage2} damage!`
      ];
      logs.push({ text: actionTexts2[Math.floor(Math.random() * actionTexts2.length)], type: "action" });
      logs.push({ text: `>> ${fighter1.name} Health drops to ${hp1}%`, type: "system" });

      round++;
    }

    // Determine the ultimate champion
    let winner = null;
    let hpRemaining = 0;
    if (hp1 > hp2) {
      winner = fighter1;
      hpRemaining = hp1;
    } else {
      winner = fighter2;
      hpRemaining = hp2;
    }

    logs.push({ text: `\n================================================`, type: "system" });
    logs.push({ text: `>>> SIMULATION ENGINE SHUTDOWN COMPLETE.`, type: "system" });
    logs.push({ text: `>>> THE CHAMPION IS: ${winner.name.toUpperCase()} (Health: ${hpRemaining}%)`, type: "winner" });

    // Print logs to window with typewriter micro-delays
    let logIndex = 0;
    function printNextLog() {
      if (logIndex < logs.length) {
        const log = logs[logIndex];
        const line = document.createElement("div");
        line.className = `console-line ${log.type}-line`;
        line.innerHTML = log.text.replace(/\n/g, "<br/>");
        
        logsWindow.appendChild(line);
        logsWindow.scrollTop = logsWindow.scrollHeight; // Auto scroll to bottom
        
        logIndex++;
        setTimeout(printNextLog, log.type === "system" ? 250 : 600); // Dynamic reading pacing
      } else {
        // Simulation finishes
        isSimulating = false;
        fightBtn.classList.add("hide");
        resetBtn.classList.remove("hide");
      }
    }

    printNextLog();
  }

  // 7. Core Event Listeners Bindings
  function setupEventListeners() {
    
    // Keystroke Debouncer for identity scanner
    let searchTimeout = null;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        activeSearch = e.target.value;
        renderRegistry();
      }, 150);
    });

    // Universe filters click
    publisherFilters.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      publisherFilters.querySelectorAll("button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      activePublisher = btn.getAttribute("data-publisher");
      renderRegistry();
    });

    // Alignment filters click
    alignmentFilters.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      alignmentFilters.querySelectorAll("button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      activeAlignment = btn.getAttribute("data-alignment");
      renderRegistry();
    });

    // Sort select change
    sortSelect.addEventListener("change", (e) => {
      activeSorter = e.target.value;
      renderRegistry();
    });

    // Favorites HUD triggers
    favsTrigger.addEventListener("click", openFavoritesDrawer);
    favsClose.addEventListener("click", closeFavoritesDrawer);
    favDrawerOverlay.addEventListener("click", closeFavoritesDrawer);

    // Detail Modal Close
    modalCloseTrigger.addEventListener("click", closeDetailsModal);
    modalCloseBackdrop.addEventListener("click", closeDetailsModal);

    // Modal Tabs logic
    modalTabs.addEventListener("click", (e) => {
      const tabBtn = e.target.closest(".tab-trigger");
      if (!tabBtn) return;

      tabTriggers.forEach(t => t.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));

      tabBtn.classList.add("active");
      const contentId = tabBtn.getAttribute("data-tab");
      document.getElementById(contentId).classList.add("active");
    });

    // Battle Arena Hud triggers
    battleTrigger.addEventListener("click", openBattleArena);
    battleCloseTrigger.addEventListener("click", closeBattleArena);
    battleCloseBackdrop.addEventListener("click", closeBattleArena);

    // Arena Select slot triggers
    f1SelectorTrigger.addEventListener("click", () => {
      if (isSimulating) return;
      openFighterPicker(1);
    });
    f2SelectorTrigger.addEventListener("click", () => {
      if (isSimulating) return;
      openFighterPicker(2);
    });

    // Pick Fighter modal close
    pickerCloseTrigger.addEventListener("click", closeFighterPicker);
    pickerCloseBackdrop.addEventListener("click", closeFighterPicker);

    // Combat execute & Reset
    fightBtn.addEventListener("click", executeBattleSimulation);
    resetBtn.addEventListener("click", resetBattleSimulation);
  }

  function openFavoritesDrawer() {
    renderFavoritesDrawer();
    favDrawer.classList.add("active");
  }

  function closeFavoritesDrawer() {
    favDrawer.classList.remove("active");
  }

  // Launch Registry
  init();

});
