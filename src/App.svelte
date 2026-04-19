<script lang="ts">
  import { flip } from 'svelte/animate';
  type Bereich = 
    "Pflichtbereich" |
    "Studium Generale" |
    "Abschlussbereich/Thesis" |
    "Wahlfplichtbereich" |
    "Infromatik-Wahlbereich" |
    "Studienbegeleitende Leistung"
  
  type CPRange = number | {min: number; max: number};

  const bereicheList : Bereich[] = [
    "Pflichtbereich", "Studium Generale", "Wahlfplichtbereich",
    "Infromatik-Wahlbereich", "Studienbegeleitende Leistung", "Abschlussbereich/Thesis"
  ];

  const semesterList = [0,1,2,3,4,5,6];

  const sollCP: Record<Bereich, CPRange> = {
    "Pflichtbereich": 114,
    "Studium Generale": {min: 5, max: 6},
    "Abschlussbereich/Thesis": 12,
    "Wahlfplichtbereich": {min: 10, max: 35},
    "Infromatik-Wahlbereich": {min: 5, max: 30},
    "Studienbegeleitende Leistung": {min: 9, max: 18}

  }

  let allModuls: Modul[] = [];

  let showPopup = false;

  let newName = "";
  let newModulID = "";
  let newCP = 0;
  let newBereich: Bereich = bereicheList[0];
  let newSemester = 1;

  let draggedModul: Modul | null = null;
  let hoveredSemester: number | null = null;

  $: gewerteteModule = allModuls.filter(m => m.semester > 0);
  $: gesamtCP = gewerteteModule.reduce((sum, m) => sum + m.cp, 0)

  interface Modul {
    readonly id: string;
    readonly name: string;
    readonly modulID: string;
    readonly cp: number;
    readonly bereich: Bereich;
    semester: number
  }

  function createModul(name: string, modulID: string, cp: number, bereich: Bereich, semester: number): Modul {
    return {
      id: crypto.randomUUID(),
      name,
      modulID,
      cp,
      bereich,
      semester,
    };
  }

  function addModul() {
    if(newName && newModulID) {
      const m = createModul(newName, newModulID, newCP, newBereich, newSemester);
      allModuls = [...allModuls, m];

      newName = "";
      newModulID = "";
      showPopup = false;
    }
  }

  function getSummPerBereich(ber: Bereich): number {
    return gewerteteModule.filter(m => m.bereich === ber).reduce((sum,m) => sum + m.cp, 0)
  }

  function handleDragStart(modul: Modul) {
    draggedModul = modul;
  }

  function handleDrop(targetSemester: number) {
    if(draggedModul) {
      draggedModul.semester = targetSemester;
      allModuls = [...allModuls];
      draggedModul = null;
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
  }


</script>

<style>
  :global(body, html) {
    margin: 0;
    display: block;
    overflow-x: hidden;
    width: 100%;
    min-height: 100vh;
    display: block !important;
    background-color: #0f172a;
    overflow-x: hidden;
  }

  :global(#app) {
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
    text-align: left !important;
  }
  main {
    font-family: sans-serif;
    background-color: #0f172a;
    color: white;
    min-height: 100vh;
    width: 100%;
  }

  .board {
    display: flex;
    flex-direction: row;
    gap: 10px;
    padding: 10px;
    width: 100%;
    box-sizing: border-box;
    align-items: flex-start;
    justify-content: center;
    padding-bottom: 120px;
    overflow-x: auto;
  }

  .column {
    background-color: #1e293b;
    border-radius: 12px;
    flex: 1 1 56px;
    min-width: 56px;
    padding: 10px;
    font-size: 0.8rem;
    border: 1px solid #334155;
  }

  .column h2 {
    margin-top: 0;
    font-size: 1.2rem;
    color: #f1f5f9;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .column.drag-over {
    background-color: #334155;
    border: 1px dashed #3b82f6;
    transform: scale(1.01);
    transition: all 0.2s ease;
  }

  .card {
    cursor: grab;
  }

  .card:active {
    cursor: grabbing;
  }

  .sem-sum {
    display: block;
    text-align: center;
    color: #94a3b8;
  }

  .stats-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    background-color: #1e293b;
    padding: 20px;
    border-top: 2px solid #3b82f6;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    z-index: 100;
  }

  .bereich-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px 40px;
  }

  .total-score {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    min-width: 100px;
  }

  .total-score strong {
    font-size: 1.5rem;
    color: #3b82f6;
  }

  .add-btn {
    margin-left: 20px;
    margin-top: 20px;
    margin-bottom: 10px;
    background: #3b82f6;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 50px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    z-index: 200;
  }

  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }

  .popup-content {
    background: #1e293b;
    padding: 30px;
    border-radius: 16px;
    width: 400px;
    border: 1px solid #334155;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  }

  .form-group {
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .form-row {
    display: flex;
    gap: 15px;
  }

  input, select {
    background: #0f172a;
    border: 1px solid #334155;
    color: white;
    padding: 10px;
    border-radius: 8px;
  }

  .popup-actions {
    margin-top: 25px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .btn-pri { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
  .btn-sec { background: transparent; color: #94a3b8; border: 1px solid #334155; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
</style>

<main>
  <header class="add-bar">
    <button class="add-btn" on:click={() => showPopup = true}>+ Modul hinzufügen </button>
    {#if showPopup}
      <div 
        class="popup-overlay" 
        role="button" tabindex="0" 
        aria-label="Popup schließen" 
        on:keydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            showPopup = false;
            }
          }}
        on:click|self={() => showPopup = false}
      >
        <div class="popup-content">
          <h2>Neues Modul</h2>

          <div class="form-group">
            <label>Name</label>
            <input type="text" bind:value={newName} placeholder="z.B Mathematik I" />
          </div>

          <div class="form-group">
            <label>Modul ID</label>
            <input type="text" bind:value={newModulID} placeholder="z.B 20-00-1150-iv" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>CP</label>
              <input type="number" bind:value={newCP} />
            </div>
            <div class="form-group">
              <label>Semester</label>
              <select bind:value={newSemester}>
                {#each semesterList as s}
                  <option value={s}>{s === 0 ? 'Platzhalter' : s + '. Semester'}</option>
                {/each}
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Bereich</label>
            <select bind:value={newBereich}>
              {#each bereicheList as b}
                <option value={b}>{b}</option>
              {/each}
            </select>
          </div>

          <div class="popup-actions">
            <button class="btn-sec" on:click={() => showPopup = false}>Abbrechen</button>
            <button class="btn-pri" on:click={addModul}>Speichern</button>
          </div>
        </div>
      </div>
    {/if}

  </header>
  <div class="board">
    {#each semesterList as sem}
      <div 
        class="column"
        class:is-placeholder={sem === 0}
        class:drag-over={hoveredSemester === sem}

        role="list"
        aria-label="{sem === 0 ? 'Platzhalter' : sem + '. Semester'}"
        on:drop={() => {handleDrop(sem); hoveredSemester = null;}}
        on:dragleave={() => hoveredSemester = null}
        on:dragenter={() => hoveredSemester = sem}
        on:dragover={handleDragOver}
      >
        <div class="column-header">
          <h2>{sem === 0 ? "Platzhalter" : `${sem}. Semester`}</h2>
          <span class="sem-sum">
            {allModuls.filter(m => m.semester === sem).reduce((s,m) => s + m.cp, 0)} CP
          </span>
        </div>

        <div class="modul-liste">
          {#each bereicheList as ber}
            {@const modulImBereich = allModuls.filter(m => m.semester === sem && m.bereich === ber)}
            {#if modulImBereich.length > 0}
              <div class="bereich-gruppe">
                <span class="divider-text"> {ber} </span>
                <hr />
                {#each modulImBereich as modul (modul.id)}
                  <div 
                    class="card" 
                    animate:flip
                    draggable="true"
                    role="listitem"
                    on:dragstart={() => handleDragStart(modul)}
                  >
                    <div class="card-main">
                      <strong> {modul.name} </strong>
                      <code class="id-badge"> {modul.modulID} </code>
                    </div>
                    <div class="card-cp"> {modul.cp} </div>
                  </div>
                {/each}
              </div>
            {/if}
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <footer class="stats-bar">
    <div class="bereich-grid">
      {#each bereicheList as ber}
        <div class="stat-item">
          <span class="stat-label"> {ber}: </span>
          <br>
          <span class="stat-value"> 
            {getSummPerBereich(ber)} /
            {#if typeof sollCP[ber] === 'number'}
              {sollCP[ber]}
            {:else}
              {sollCP[ber].min}-{sollCP[ber].max}
            {/if}
            CP
          </span>
        </div>
      {/each}
    </div>
    <div class="total-score">
      Gesamt CP: 
      <br>
      <strong> {gesamtCP} </strong>
    </div>
  </footer>
</main>
