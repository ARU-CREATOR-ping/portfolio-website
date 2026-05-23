/* ==========================================================================
   SuperHeroes DB - Bulletproof Robust JavaScript Engine
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  
  // 1. Core State Management
  let activeSearch = "";
  let activePublisher = "all";
  let activeAlignment = "all";
  let activeSorter = "default";
  
  // Persistent Bookmarks Set
  let favorites = new Set();
  
  // Battle Arena Fighters State
  let fighter1 = null;
  let fighter2 = null;
  let pickingFighterSlot = null; // 1 or 2
  let isSimulating = false;

  // 2. DOM Elements Selection with Safety
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
    if (favCount) {
      favCount.textContent = favorites.size;
    }
  }

  function renderFavoritesDrawer() {
    if (!favListContainer) return;
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
    if (!heroesGrid) return;
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
    if (statusText) {
      statusText.textContent = `METAHUMAN DATABASE ONLINE (${filtered.length} PROFILE${filtered.length === 1 ? '' : 'S'} MOUNTED)`;
    }

    if (filtered.length === 0) {
      heroesGrid.innerHTML = `
        <div class="no-results-box">
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
      const favBtn = card.querySelector(".fav-card-btn");
      if (favBtn) {
        favBtn.addEventListener("click", (e) => {
          toggleFavorite(hero.id, e);
        });
      }

      heroesGrid.appendChild(card);
    });
  }

  // 5. Dynamic Details Modal & Sleek Progress Bars
  function openDetailsModal(id) {
    const hero = SUPERHEROES_DB.find(h => h.id === id);
    if (!hero) return;

    // Reset tabs back to Stats
    if (tabTriggers && tabTriggers.length > 0) {
      tabTriggers.forEach(t => t.classList.remove("active"));
      const firstTab = document.querySelector('.tab-trigger[data-tab="stats-tab"]');
      if (firstTab) firstTab.classList.add("active");
    }
    if (tabContents && tabContents.length > 0) {
      tabContents.forEach(c => c.classList.remove("active"));
      const firstContent = document.getElementById("stats-tab");
      if (firstContent) firstContent.classList.add("active");
    }

    // Inject identity safely
    const charNameEl = document.getElementById("modal-char-name");
    const realNameEl = document.getElementById("modal-real-name");
    const artBgEl = document.getElementById("modal-profile-art-bg");
    
    if (charNameEl) charNameEl.textContent = hero.name.toUpperCase();
    if (realNameEl) realNameEl.textContent = `Real Identity: ${hero.realName}`;
    if (artBgEl) artBgEl.style.backgroundImage = `url('${hero.avatar}')`;

    // Inject Publisher badge
    const pubBadge = document.getElementById("modal-badge-publisher");
    if (pubBadge) {
      pubBadge.className = `modal-pub-tag ${hero.publisher === "Marvel" ? "marvel-accent" : "dc-accent"}`;
      pubBadge.textContent = hero.publisher.toUpperCase();
    }

    // Inject Alignment badge
    const alignBadge = document.getElementById("modal-badge-alignment");
    if (alignBadge) {
      alignBadge.className = `modal-alignment-badge ${hero.alignment}`;
      alignBadge.textContent = hero.alignment.toUpperCase();
    }

    // Inject Stats & Sleek Horizontal Progress Bars
    const statsArr = ["intelligence", "strength", "speed", "durability", "power", "combat"];
    
    statsArr.forEach(statKey => {
      const val = hero.stats[statKey];
      const barEl = document.getElementById(`bar-${statKey}`);
      const valEl = document.getElementById(`val-${statKey}`);
      const ringEl = document.getElementById(`ring-${statKey}`); // Fallback for old circular gauges cached

      if (valEl) valEl.textContent = val;
      
      if (barEl) {
        barEl.style.width = "0%";
        setTimeout(() => {
          barEl.style.width = `${val}%`;
        }, 50);
      }

      if (ringEl) {
        const strokeMax = 238;
        const offset = strokeMax - (val / 100) * strokeMax;
        setTimeout(() => {
          ringEl.style.strokeDashoffset = offset;
        }, 50);
      }
    });

    // Inject Aggregate stat fill bar safely
    const sum = statsArr.reduce((acc, curr) => acc + hero.stats[curr], 0);
    const avg = Math.round(sum / 6);
    
    const aggValueEl = document.getElementById("agg-stat-value");
    const aggFillEl = document.getElementById("agg-fill-percentage");
    
    if (aggValueEl) aggValueEl.textContent = `${avg}%`;
    if (aggFillEl) {
      aggFillEl.style.width = "0%";
      setTimeout(() => {
        aggFillEl.style.width = `${avg}%`;
      }, 200);
    }

    // Inject Biography details safely
    const bioFirstEl = document.getElementById("bio-first-app");
    const bioBirthEl = document.getElementById("bio-birthplace");
    const bioOccEl = document.getElementById("bio-occupation");
    const bioAlterEl = document.getElementById("bio-alter-egos");
    
    if (bioFirstEl) bioFirstEl.textContent = hero.biography.firstAppearance;
    if (bioBirthEl) bioBirthEl.textContent = hero.biography.placeOfBirth;
    if (bioOccEl) bioOccEl.textContent = hero.biography.occupation;
    if (bioAlterEl) bioAlterEl.textContent = hero.biography.alterEgos;

    // Inject Connections details safely
    const connGroupsEl = document.getElementById("conn-groups");
    const connRelEl = document.getElementById("conn-relatives");
    
    if (connGroupsEl) connGroupsEl.textContent = hero.connections.groupAffiliation;
    if (connRelEl) connRelEl.textContent = hero.connections.relatives;

    // Activate modal
    if (detailModal) {
      detailModal.classList.add("active");
    }
    document.body.style.overflow = "hidden"; // Disable background scrolling
  }

  function closeDetailsModal() {
    if (detailModal) {
      detailModal.classList.remove("active");
    }
    document.body.style.overflow = ""; // Restore background scrolling
    
    // Clear bar and circle elements safely
    const statsArr = ["intelligence", "strength", "speed", "durability", "power", "combat"];
    statsArr.forEach(statKey => {
      const barEl = document.getElementById(`bar-${statKey}`);
      if (barEl) barEl.style.width = "0%";
      
      const ringEl = document.getElementById(`ring-${statKey}`);
      if (ringEl) ringEl.style.strokeDashoffset = 238;
    });
  }

  // 6. Holographic Combat Simulator logic
  function openBattleArena() {
    if (battleArenaModal) {
      battleArenaModal.classList.add("active");
    }
    document.body.style.overflow = "hidden";
    resetBattleSimulation();
  }

  function closeBattleArena() {
    if (isSimulating) return; // Prevent closing mid-simulation
    if (battleArenaModal) {
      battleArenaModal.classList.remove("active");
    }
    document.body.style.overflow = "";
  }

  function resetBattleSimulation() {
    fighter1 = null;
    fighter2 = null;
    isSimulating = false;

    // Reset visual frames safely
    if (f1Placeholder) f1Placeholder.classList.remove("hide");
    if (f1Profile) f1Profile.classList.add("hide");
    if (f1Telemetry) f1Telemetry.innerHTML = "";
    const cardF1 = document.getElementById("fighter1-card");
    if (cardF1) cardF1.className = "fighter-select-panel";

    if (f2Placeholder) f2Placeholder.classList.remove("hide");
    if (f2Profile) f2Profile.classList.add("hide");
    if (f2Telemetry) f2Telemetry.innerHTML = "";
    const cardF2 = document.getElementById("fighter2-card");
    if (cardF2) cardF2.className = "fighter-select-panel";

    if (fightBtn) {
      fightBtn.removeAttribute("disabled");
      fightBtn.classList.remove("hide");
      fightBtn.textContent = "RUN SIMULATION";
    }
    if (resetBtn) resetBtn.classList.add("hide");
    if (consoleLogs) consoleLogs.classList.add("hide");
    if (logsWindow) logsWindow.innerHTML = "";
    
    updateFightBtnState();
  }

  function updateFightBtnState() {
    if (!fightBtn) return;
    if (fighter1 && fighter2) {
      fightBtn.removeAttribute("disabled");
    } else {
      fightBtn.setAttribute("disabled", "true");
    }
  }

  function openFighterPicker(slot) {
    pickingFighterSlot = slot;
    if (!pickerListContainer) return;
    pickerListContainer.innerHTML = "";

    SUPERHEROES_DB.forEach(hero => {
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

    if (pickerModal) {
      pickerModal.classList.add("active");
    }
  }

  function closeFighterPicker() {
    if (pickerModal) {
      pickerModal.classList.remove("active");
    }
    pickingFighterSlot = null;
  }

  function selectFighter(id) {
    const hero = SUPERHEROES_DB.find(h => h.id === id);
    if (!hero) return;

    if (pickingFighterSlot === 1) {
      fighter1 = hero;
      
      // Update UI Frame safely
      if (f1Placeholder) f1Placeholder.classList.add("hide");
      if (f1Profile) f1Profile.classList.remove("hide");
      
      const avatarEl = document.getElementById("f1-avatar");
      const nameEl = document.getElementById("f1-name");
      const pubEl = document.getElementById("f1-pub");
      
      if (avatarEl) avatarEl.style.backgroundImage = `url('${hero.avatar}')`;
      if (nameEl) nameEl.textContent = hero.name.toUpperCase();
      if (pubEl) pubEl.textContent = hero.publisher.toUpperCase();
      
      const cardF1 = document.getElementById("fighter1-card");
      if (cardF1) cardF1.className = `fighter-select-panel has-selected ${hero.publisher === "Marvel" ? "marvel-selected" : "dc-selected"}`;

      // Inject telemetry bars safely
      if (f1Telemetry) {
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
      }
    } else if (pickingFighterSlot === 2) {
      fighter2 = hero;
      
      // Update UI Frame safely
      if (f2Placeholder) f2Placeholder.classList.add("hide");
      if (f2Profile) f2Profile.classList.remove("hide");
      
      const avatarEl = document.getElementById("f2-avatar");
      const nameEl = document.getElementById("f2-name");
      const pubEl = document.getElementById("f2-pub");
      
      if (avatarEl) avatarEl.style.backgroundImage = `url('${hero.avatar}')`;
      if (nameEl) nameEl.textContent = hero.name.toUpperCase();
      if (pubEl) pubEl.textContent = hero.publisher.toUpperCase();
      
      const cardF2 = document.getElementById("fighter2-card");
      if (cardF2) cardF2.className = `fighter-select-panel has-selected ${hero.publisher === "Marvel" ? "marvel-selected" : "dc-selected"}`;

      // Inject telemetry bars safely
      if (f2Telemetry) {
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
    }

    closeFighterPicker();
    updateFightBtnState();
  }

  // Combat evaluating simulation engine
  function executeBattleSimulation() {
    if (!fighter1 || !fighter2 || isSimulating) return;

    isSimulating = true;
    if (fightBtn) fightBtn.setAttribute("disabled", "true");
    if (consoleLogs) consoleLogs.classList.remove("hide");
    if (logsWindow) logsWindow.innerHTML = "";

    const logs = [];
    logs.push({ text: `>>> INITIALIZING TACTICAL SYSTEM OVERLAY...`, type: "system" });
    logs.push({ text: `>>> SCANNING CHAMPION 1: ${fighter1.name.toUpperCase()} [Combat Core: ${fighter1.stats.combat}]`, type: "system" });
    logs.push({ text: `>>> SCANNING CHAMPION 2: ${fighter2.name.toUpperCase()} [Combat Core: ${fighter2.stats.combat}]`, type: "system" });
    logs.push({ text: `>>> BATTLE TELEMETRY LOCK ON. COMMENCING COMBAT SIMULATION...`, type: "system" });

    let hp1 = 100;
    let hp2 = 100;
    let round = 1;
    
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

    // Print logs safely with typewriter pacing
    let logIndex = 0;
    function printNextLog() {
      if (!logsWindow) {
        isSimulating = false;
        return;
      }
      if (logIndex < logs.length) {
        const log = logs[logIndex];
        const line = document.createElement("div");
        line.className = `console-line ${log.type}-line`;
        line.innerHTML = log.text.replace(/\n/g, "<br/>");
        
        logsWindow.appendChild(line);
        logsWindow.scrollTop = logsWindow.scrollHeight; // Auto scroll
        
        logIndex++;
        setTimeout(printNextLog, log.type === "system" ? 200 : 500);
      } else {
        isSimulating = false;
        if (fightBtn) fightBtn.classList.add("hide");
        if (resetBtn) resetBtn.classList.remove("hide");
      }
    }

    printNextLog();
  }

  // 7. Core Event Listeners Bindings with Safety
  function setupEventListeners() {
    
    // Keystroke Debouncer safely
    if (searchInput) {
      let searchTimeout = null;
      searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          activeSearch = e.target.value;
          renderRegistry();
        }, 150);
      });
    }

    // Universe filters click safely
    if (publisherFilters) {
      publisherFilters.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;

        publisherFilters.querySelectorAll("button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        
        activePublisher = btn.getAttribute("data-publisher");
        renderRegistry();
      });
    }

    // Alignment filters click safely
    if (alignmentFilters) {
      alignmentFilters.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;

        alignmentFilters.querySelectorAll("button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        activeAlignment = btn.getAttribute("data-alignment");
        renderRegistry();
      });
    }

    // Sort select change safely
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        activeSorter = e.target.value;
        renderRegistry();
      });
    }

    // Favorites HUD triggers safely
    if (favsTrigger) favsTrigger.addEventListener("click", openFavoritesDrawer);
    if (favsClose) favsClose.addEventListener("click", closeFavoritesDrawer);
    if (favDrawerOverlay) favDrawerOverlay.addEventListener("click", closeFavoritesDrawer);

    // Detail Modal Close safely
    if (modalCloseTrigger) modalCloseTrigger.addEventListener("click", closeDetailsModal);
    if (modalCloseBackdrop) modalCloseBackdrop.addEventListener("click", closeDetailsModal);

    // Modal Tabs logic safely
    if (modalTabs) {
      modalTabs.addEventListener("click", (e) => {
        const tabBtn = e.target.closest(".tab-trigger");
        if (!tabBtn) return;

        if (tabTriggers) tabTriggers.forEach(t => t.classList.remove("active"));
        if (tabContents) tabContents.forEach(c => c.classList.remove("active"));

        tabBtn.classList.add("active");
        const contentId = tabBtn.getAttribute("data-tab");
        const targetContent = document.getElementById(contentId);
        if (targetContent) targetContent.classList.add("active");
      });
    }

    // Battle Arena HUD triggers safely
    if (battleTrigger) battleTrigger.addEventListener("click", openBattleArena);
    if (battleCloseTrigger) battleCloseTrigger.addEventListener("click", closeBattleArena);
    if (battleCloseBackdrop) battleCloseBackdrop.addEventListener("click", closeBattleArena);

    // Arena Select slot triggers safely
    if (f1SelectorTrigger) {
      f1SelectorTrigger.addEventListener("click", () => {
        if (isSimulating) return;
        openFighterPicker(1);
      });
    }
    if (f2SelectorTrigger) {
      f2SelectorTrigger.addEventListener("click", () => {
        if (isSimulating) return;
        openFighterPicker(2);
      });
    }

    // Pick Fighter modal close safely
    if (pickerCloseTrigger) pickerCloseTrigger.addEventListener("click", closeFighterPicker);
    if (pickerCloseBackdrop) pickerCloseBackdrop.addEventListener("click", closeFighterPicker);

    // Combat execute & Reset safely
    if (fightBtn) fightBtn.addEventListener("click", executeBattleSimulation);
    if (resetBtn) resetBtn.addEventListener("click", resetBattleSimulation);
  }

  function openFavoritesDrawer() {
    renderFavoritesDrawer();
    if (favDrawer) {
      favDrawer.classList.add("active");
    }
  }

  function closeFavoritesDrawer() {
    if (favDrawer) {
      favDrawer.classList.remove("active");
    }
  }

  // Launch Registry
  init();

});
