// App logic for Delivery Matcher with dynamic 5/6/7 Zone Setup

// Initialize Lucide Icons
if (typeof lucide !== 'undefined') {
  lucide.createIcons();
}

  // State Management
  let currentZoneCount = 5;
  
  // Custom user edits for zone names (mapped by zone count -> array of names)
  const customZoneNames = {
    5: [],
    6: [],
    7: []
  };

  // Default config data
  const defaultConfigs = {
    5: {
      names: [
        '독산북부 (구로지사)',
        '독산서부 (청광아파트)',
        '독산중앙 (독산2동/현대오일뱅크)',
        '시흥남부 (폭포공원)',
        '시흥동부 (동일여고/벽산5단지)'
      ],
      mapImage: 'assets/map_5zones.jpg',
      description: '3,4번 지점(독산2동/현대오일뱅크)과 6,7번 지점(동일여고/벽산5단지)이 각각 하나로 통합된 총 5개 배송 구역 지도입니다.'
    },
    6: {
      names: [
        '독산북부 (구로지사)',
        '독산서부 (청광아파트)',
        '독산중앙 (독산2동/현대오일뱅크)',
        '시흥남부 (폭포공원)',
        '동일여고 부근',
        '벽산5단지 부근'
      ],
      mapImage: 'assets/map_6zones.jpg',
      description: '3,4번 지점(독산2동/현대오일뱅크)만 통합되고, 남동쪽(동일여고/벽산5단지)은 개별 구역으로 쪼개어 운행하는 총 6개 배송 구역 지도입니다.'
    },
    7: {
      names: [
        '독산북부 (구로지사)',
        '독산서부 (청광아파트)',
        '독산중앙 (독산2동)',
        '시흥대로 (희명병원)',
        '시흥남부 (폭포공원)',
        '동일여고 부근',
        '벽산5단지 부근'
      ],
      mapImage: 'assets/map_7zones.jpg',
      description: '모든 배송지(빨간색 별)가 각각 1대1로 독립되어 총 7개 배송 구역으로 나누어진 상세 분할 지도입니다.'
    }
  };

  // Bounding box percentages for overlaying markers on maps (based on 678x1024)
  const zoneCoordinates = {
    5: [
      { x: 49.4, y: 16.1 }, // 1구역
      { x: 15.2, y: 35.0 }, // 2구역
      { x: 50.5, y: 66.2 }, // 3구역
      { x: 59.1, y: 91.3 }, // 4구역
      { x: 80.2, y: 85.9 }  // 5구역
    ],
    6: [
      { x: 49.4, y: 16.1 }, // 1구역
      { x: 15.2, y: 35.0 }, // 2구역
      { x: 50.5, y: 66.2 }, // 3구역
      { x: 59.1, y: 91.3 }, // 4구역
      { x: 76.7, y: 83.7 }, // 5구역
      { x: 83.6, y: 88.0 }  // 6구역
    ],
    7: [
      { x: 49.4, y: 16.1 }, // 1구역
      { x: 15.2, y: 35.0 }, // 2구역
      { x: 43.4, y: 60.4 }, // 3구역
      { x: 57.7, y: 72.0 }, // 4구역
      { x: 59.1, y: 91.3 }, // 5구역
      { x: 76.7, y: 83.7 }, // 6구역
      { x: 83.6, y: 88.0 }  // 7구역
    ]
  };

  // Custom offsets (--tx, --ty) to prevent overlaps and edge clipping
  const zoneOffsets = {
    5: [
      { tx: '-50%', ty: '-50%' }, // 1구역
      { tx: '-10%', ty: '-50%' }, // 2구역
      { tx: '-50%', ty: '-50%' }, // 3구역
      { tx: '-95%', ty: '-60%' }, // 4구역 (Star 5) - 왼편 이동
      { tx: '-85%', ty: '-50%' }  // 5구역 (Star 6 & 7) - 왼편 이동
    ],
    6: [
      { tx: '-50%', ty: '-50%' }, // 1구역
      { tx: '-10%', ty: '-50%' }, // 2구역
      { tx: '-50%', ty: '-50%' }, // 3구역
      { tx: '-95%', ty: '-60%' }, // 4구역 (Star 5) - 왼편 이동
      { tx: '-50%', ty: '-100%' },// 5구역 (Star 6) - 원의 위쪽 이동
      { tx: '-85%', ty: '-50%' }  // 6구역 (Star 7) - 왼편 이동
    ],
    7: [
      { tx: '-50%', ty: '-50%' }, // 1구역
      { tx: '-10%', ty: '-50%' }, // 2구역
      { tx: '-50%', ty: '-50%' }, // 3구역
      { tx: '-50%', ty: '-50%' }, // 4구역
      { tx: '-95%', ty: '-60%' }, // 5구역 (Star 5) - 왼편 이동
      { tx: '-50%', ty: '-100%' },// 6구역 (Star 6) - 원의 위쪽 이동
      { tx: '-85%', ty: '-50%' }  // 7구역 (Star 7) - 왼편 이동
    ]
  };

  // Senior citizen details mapped by original zone numbers (1-7)
  const seniorData = {
    1: [
      { name: '김갑수', phone: '010-9959-5761', address: '독산로 108번길 9 그린힐 오피스텔 504호', note: '' }
    ],
    2: [
      { name: '김동수', phone: '010-9857-3389', address: '두산로 9길 23, 아이유하임 302호', note: '' }
    ],
    3: [
      { name: '박주길', phone: '010-6304-4151', address: '독산로 47가길 38 보린주택 501호', note: '현관 비번: 종+1074' }
    ],
    4: [
      { name: '김재호', phone: '010-9797-9297', address: '독산로 24나길 13 시흥아파트 C동 305호', note: '' }
    ],
    5: [
      { name: '감평욱', phone: '010-4595-9394', address: '독산로 8길 63(시흥동) 201호', note: '단독주택 오른쪽 철문, 제일 안쪽 우리 샷시문' }
    ],
    6: [
      { name: '박경순', phone: '010-5900-0511', address: '탑골로4길 50 1층', note: '청담복지관 옆, 하얀나무로된 쪽문' }
    ],
    7: [
      { name: '김영백', phone: '010-5268-6098', address: '금하로 796, 벽산아파트 601동 1402호', note: '' },
      { name: '강명석', phone: '010-4710-4654', address: '금하로 796, 벽산아파트 604동 1409호', note: '' }
    ]
  };

  // Helper to aggregate senior citizens based on zone mode and index
  function getSeniorsForZone(mode, idx) {
    if (mode === 7) {
      return seniorData[idx + 1] || [];
    } else if (mode === 6) {
      if (idx === 0) return seniorData[1];
      if (idx === 1) return seniorData[2];
      if (idx === 2) return [...seniorData[3], ...seniorData[4]];
      if (idx === 3) return seniorData[5];
      if (idx === 4) return seniorData[6];
      if (idx === 5) return seniorData[7];
    } else if (mode === 5) {
      if (idx === 0) return seniorData[1];
      if (idx === 1) return seniorData[2];
      if (idx === 2) return [...seniorData[3], ...seniorData[4]];
      if (idx === 3) return seniorData[5];
      if (idx === 4) return [...seniorData[6], ...seniorData[7]];
    }
    return [];
  }

  // Elements
  const memberInput = document.getElementById('memberInput');
  const memberCountBadge = document.getElementById('memberCountBadge');
  const zoneInputsGrid = document.getElementById('zoneInputsGrid');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const mapImage = document.getElementById('mapImage');
  const mapDescription = document.getElementById('mapDescription');
  const resultsMapImage = document.getElementById('resultsMapImage');
  const mapMarkersContainer = document.getElementById('mapMarkersContainer');
  const resultsSeniorsList = document.getElementById('resultsSeniorsList');
  const matchBtn = document.getElementById('matchBtn');
  
  const inputPanel = document.querySelector('.input-panel');
  const matchingPanel = document.getElementById('matchingPanel');
  const resultsPanel = document.getElementById('resultsPanel');
  const configGrid = document.getElementById('configGrid');
  
  const shufflingStatus = document.querySelector('.shuffling-status');
  const retryBtn = document.getElementById('retryBtn');
  const copyBtn = document.getElementById('copyBtn');
  
  const statTotalUsers = document.getElementById('statTotalUsers');
  const statTotalTeams = document.getElementById('statTotalTeams');
  const statAssignedZones = document.getElementById('statAssignedZones');
  
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');

  // Keep track of current results for copying
  let currentResults = [];

  // Initialize UI with 5 zones mode
  initZoneInputs(5);

  // Update member count badge on input change
  memberInput.addEventListener('input', () => {
    const names = parseMembers(memberInput.value);
    memberCountBadge.textContent = `${names.length}명`;
  });

  // Handle Zone Count Tabs
  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Save current input names before switching
      saveCurrentZoneInputs();

      // Switch active class
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const zones = parseInt(btn.getAttribute('data-zones'), 10);
      currentZoneCount = zones;

      // Re-initialize fields & map
      initZoneInputs(zones);
      updateMapPanel(zones);
    });
  });

  // Start Matching
  matchBtn.addEventListener('click', () => {
    const names = parseMembers(memberInput.value);
    
    if (names.length === 0) {
      showToast('배송원 이름을 입력해주세요!', 'alert-triangle');
      return;
    }

    if (names.length < currentZoneCount + 1) {
      showToast(`벽산5단지 부근에 최소 2명을 배정하려면 최소 ${currentZoneCount + 1}명의 배송원이 필요합니다. (현재: ${names.length}명)`, 'alert-circle');
      return;
    }

    // Save current input text edits to our custom states
    saveCurrentZoneInputs();

    // Get current zone names to use in routing
    const activeZones = customZoneNames[currentZoneCount];

    // Run the matching process
    runMatching(names, activeZones);
  });

  // Retry Button
  retryBtn.addEventListener('click', () => {
    resultsPanel.classList.add('hidden');
    configGrid.classList.remove('hidden');
    // Scroll back to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Copy Button
  copyBtn.addEventListener('click', () => {
    if (currentResults.length === 0) return;
    
    let textToCopy = `🚚 [배송 랜덤 매칭 결과 - ${currentZoneCount}구역 모드] 🚚\n\n`;
    
    currentResults.forEach(item => {
      textToCopy += `📍 ${item.zoneName}\n`;
      if (item.teams.length === 0) {
        textToCopy += '   (배정된 팀 없음)\n';
      } else {
        item.teams.forEach(team => {
          const typeStr = team.isSolo ? '[1인팀]' : `[${team.members.length}인팀]`;
          textToCopy += `   • ${team.name} ${typeStr}: ${team.members.join(', ')}\n`;
        });
      }
      textToCopy += '\n';
    });

    navigator.clipboard.writeText(textToCopy.trim())
      .then(() => {
        showToast('결과가 클립보드에 복사되었습니다!', 'check-circle');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        showToast('클립보드 복사에 실패했습니다. 수동으로 복사해주세요.', 'alert-circle');
      });
  });

  // Render input fields based on selected zone count
  function initZoneInputs(zones) {
    zoneInputsGrid.innerHTML = '';
    
    const defaults = defaultConfigs[zones].names;
    const currentEdits = customZoneNames[zones];

    for (let i = 0; i < zones; i++) {
      const defaultValue = currentEdits[i] || defaults[i];
      
      const fieldDiv = document.createElement('div');
      fieldDiv.className = 'zone-input-field';
      fieldDiv.style.animationDelay = `${i * 0.05}s`;
      
      fieldDiv.innerHTML = `
        <span class="zone-number">${i + 1}</span>
        <input type="text" id="zoneInput_${i}" value="${defaultValue}" placeholder="구역 이름 입력">
      `;
      
      zoneInputsGrid.appendChild(fieldDiv);
    }
  }

  // Save current zone input edits into the customZoneNames state
  function saveCurrentZoneInputs() {
    const inputs = zoneInputsGrid.querySelectorAll('input');
    const tempArray = [];
    inputs.forEach((input) => {
      tempArray.push(input.value.trim());
    });
    customZoneNames[currentZoneCount] = tempArray;
  }

  // Update map visual panel
  function updateMapPanel(zones) {
    const config = defaultConfigs[zones];
    mapImage.src = config.mapImage;
    mapDescription.textContent = config.description;
  }

  // Parse member input
  function parseMembers(rawText) {
    if (!rawText) return [];
    const rawNames = rawText.split(/[,\n]/);
    return rawNames
      .map(name => name.trim())
      .filter(name => name.length > 0);
  }

  // Toast helper
  function showToast(message, iconName = 'info') {
    toastMsg.textContent = message;
    
    const iconSpan = toast.querySelector('.toast-icon');
    if (iconSpan && typeof lucide !== 'undefined') {
      iconSpan.setAttribute('data-lucide', iconName);
      lucide.createIcons();
    }
    
    toast.classList.remove('hidden');
    toast.offsetHeight; // force reflow
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.classList.add('hidden');
      }, 400);
    }, 3000);
  }

  // Shuffle array using Fisher-Yates
  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Core Matching Logic
  function runMatching(names, zones) {
    // 1. Hide config panel, show Animation panel
    configGrid.classList.add('hidden');
    matchingPanel.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 2. Stages for animation
    const stages = [
      { delay: 0, text: '입력된 명단을 정리하는 중...' },
      { delay: 800, text: `구역 배정을 위해 인원을 ${currentZoneCount}개 팀으로 분할 중...` },
      { delay: 1600, text: `${currentZoneCount}개 지정 구역에 무작위 배정 중...` },
      { delay: 2400, text: '매칭 완료! 최종 보고서를 작성하는 중...' }
    ];

    stages.forEach(stage => {
      setTimeout(() => {
        shufflingStatus.textContent = stage.text;
      }, stage.delay);
    });

    // 3. Run match
    setTimeout(() => {
      const N = names.length;
      const shuffledNames = shuffle(names);
      
      // Create empty teams
      const teams = Array.from({ length: currentZoneCount }, (_, idx) => ({
        id: idx + 1,
        name: `TEAM ${String(idx + 1).padStart(2, '0')}`,
        members: [],
        isSolo: false
      }));

      // Determine which zone slot corresponds to 벽산5단지 부근 (must have ≥2 members)
      // 5-zone mode: index 4 (시흥동부 - 동일여고/벽산5단지 merged)
      // 6-zone mode: index 5 (벽산5단지 부근)
      // 7-zone mode: index 6 (벽산5단지 부근)
      const byeoksanSlotIndex = { 5: 4, 6: 5, 7: 6 }[currentZoneCount];

      // In 5-zone mode, zone 3 (index 2, merged 독산2동/현대오일뱅크) should also avoid solo teams
      const mergedZone3Index = currentZoneCount === 5 ? 2 : -1;

      // Minimum members required for the 벽산5단지 zone
      const BYEOKSAN_MIN = 2;

      // Distribute names: guarantee 벽산5단지 gets at least BYEOKSAN_MIN members,
      // then distribute remaining members as evenly as possible across all zones.
      const remainingAfterReserve = N - BYEOKSAN_MIN;
      const otherZoneCount = currentZoneCount - 1;
      const otherBaseSize = Math.floor(remainingAfterReserve / otherZoneCount);
      const otherRemainder = remainingAfterReserve % otherZoneCount;

      // Calculate how many extra members 벽산5단지 should get beyond the minimum
      // to keep distribution roughly fair
      const otherMaxSize = otherBaseSize + (otherRemainder > 0 ? 1 : 0);
      const byeoksanSize = Math.max(BYEOKSAN_MIN, otherMaxSize);

      // Recalculate distribution with the actual 벽산5단지 size
      const remainingForOthers = N - byeoksanSize;
      const fairBase = Math.floor(remainingForOthers / otherZoneCount);
      const fairRemainder = remainingForOthers % otherZoneCount;

      let nameIdx = 0;
      for (let i = 0; i < currentZoneCount; i++) {
        let teamSize;
        if (i === 0) {
          // Team 0 is pre-designated for 벽산5단지 slot
          teamSize = byeoksanSize;
        } else {
          // Remaining teams get fair distribution
          const otherIdx = i - 1;
          teamSize = fairBase + (otherIdx < fairRemainder ? 1 : 0);
        }
        for (let s = 0; s < teamSize; s++) {
          teams[i].members.push(shuffledNames[nameIdx++]);
        }
        teams[i].isSolo = (teamSize === 1);
      }

      // Assign teams to zone slots.
      // Team 0 (벽산5단지 guaranteed ≥2) goes to byeoksanSlotIndex.
      // In 5-zone mode, merged zone 3 (index 2) also prefers multi-person teams.
      let assignedTeams = [];
      const slots = Array(currentZoneCount).fill(null);

      // Place the 벽산5단지 team (team 0) in its designated slot
      slots[byeoksanSlotIndex] = teams[0];

      // Remaining teams to assign
      const remainingTeams = teams.slice(1);

      if (mergedZone3Index >= 0) {
        // 5-zone mode: also try to place a multi-person team at index 2
        const multiTeams = remainingTeams.filter(t => t.members.length > 1);
        const soloTeams = remainingTeams.filter(t => t.members.length === 1);
        const shuffledMulti = shuffle(multiTeams);
        const shuffledSolo = shuffle(soloTeams);

        if (shuffledMulti.length > 0) {
          slots[mergedZone3Index] = shuffledMulti[0];
          const leftover = shuffle([...shuffledMulti.slice(1), ...shuffledSolo]);
          let li = 0;
          for (let i = 0; i < currentZoneCount; i++) {
            if (slots[i] === null) {
              slots[i] = leftover[li++];
            }
          }
        } else {
          // All remaining are solo — just fill randomly
          const leftover = shuffle(remainingTeams);
          let li = 0;
          for (let i = 0; i < currentZoneCount; i++) {
            if (slots[i] === null) {
              slots[i] = leftover[li++];
            }
          }
        }
      } else {
        // 6 or 7-zone mode: fill remaining slots randomly
        const shuffledRemaining = shuffle(remainingTeams);
        let li = 0;
        for (let i = 0; i < currentZoneCount; i++) {
          if (slots[i] === null) {
            slots[i] = shuffledRemaining[li++];
          }
        }
      }
      assignedTeams = slots;

      // Create 1-to-1 mapping from zones (in order) to assigned teams
      const resultsMap = zones.map((zoneName, index) => ({
        zoneName: zoneName || `${index + 1}구역`,
        teams: [assignedTeams[index]]
      }));

      // Save global state
      currentResults = resultsMap;

      // Set the map image for results view
      resultsMapImage.src = defaultConfigs[currentZoneCount].mapImage;

      // Render Results
      renderResults(N, currentZoneCount, resultsMap);

      // Transition screen
      matchingPanel.classList.add('hidden');
      resultsPanel.classList.remove('hidden');
      
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });

    }, 3000); // 3 seconds of cool animation
  }

  // Render Results HTML
  function renderResults(totalUsers, totalTeams, resultsMap) {
    statTotalUsers.textContent = `${totalUsers}명`;
    statTotalTeams.textContent = `${totalTeams}팀`;
    statAssignedZones.textContent = `${currentZoneCount}개`;

    // Clear previous markers and list
    mapMarkersContainer.innerHTML = '';
    resultsSeniorsList.innerHTML = '';

    // Create markers and senior detail cards for each of the active zones
    resultsMap.forEach((zone, idx) => {
      const coord = zoneCoordinates[currentZoneCount][idx];
      const team = zone.teams[0];
      const namesText = team ? team.members.join(', ') : '미배정';
      
      // 1. Render marker on the map
      if (coord) {
        const markerDiv = document.createElement('div');
        markerDiv.className = 'map-marker';
        markerDiv.style.left = `${coord.x}%`;
        markerDiv.style.top = `${coord.y}%`;
        
        // Load custom offset to prevent overlap and edge clipping
        const offset = zoneOffsets[currentZoneCount][idx] || { tx: '-50%', ty: '-50%' };
        markerDiv.style.setProperty('--tx', offset.tx);
        markerDiv.style.setProperty('--ty', offset.ty);
        
        // Show zone number and actual member names directly on the map
        markerDiv.innerHTML = `
          <span class="marker-zone-num">${idx + 1}</span>
          <span class="marker-team-name">${namesText}</span>
        `;
        mapMarkersContainer.appendChild(markerDiv);
      }

      // 2. Render senior info card in the list next to the map
      const seniors = getSeniorsForZone(currentZoneCount, idx);
      const cardDiv = document.createElement('div');
      cardDiv.className = 'senior-zone-card';
      cardDiv.style.animationDelay = `${idx * 0.08}s`;

      let seniorsHTML = '';
      seniors.forEach(s => {
        const noteHTML = s.note ? `<div class="senior-note">${s.note}</div>` : '';
        seniorsHTML += `
          <div class="senior-person-item">
            <div class="senior-name-phone">
              <span class="senior-name">${s.name} 어르신</span>
              <a href="tel:${s.phone}" class="senior-phone">${s.phone}</a>
            </div>
            <div class="senior-address">${s.address}</div>
            ${noteHTML}
          </div>
        `;
      });

      cardDiv.innerHTML = `
        <div class="senior-zone-header">
          <div class="senior-zone-title">
            <h4>${idx + 1}구역</h4>
            <span class="senior-zone-landmark">${zone.zoneName}</span>
          </div>
        </div>
        <div class="senior-zone-agents">
          <span class="agent-label">배송 요원:</span>
          <span class="agent-names">${namesText}</span>
        </div>
        <div class="senior-people-list">
          ${seniorsHTML}
        </div>
      `;

      resultsSeniorsList.appendChild(cardDiv);
    });
  }
