import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";import customSelections from "../../Tables/CustomSelections";
import { table, selectionCache, setSelectionCache } from "../../Tables/CustomSelections";
import axios from "axios";

const serializeFragmentIdMap = (fragmentIdMap: any) => {
  const map: Record<string, number[]> = {};
  for (const fragmentID in fragmentIdMap) {
    map[fragmentID] = [...fragmentIdMap[fragmentID]];
  }
  return JSON.stringify(map);
};

// Funktion zum Speichern einer neuen Section
const saveNewSection = async (name: string, value: string, selectedColor: string, userComment: string): Promise<string | null> => {
  try {
    const response = await axios.post("http://localhost:5555/sections", {
      name: name,
      value: value,
      color: selectedColor[0],
      userComment: userComment  // Kommentar speichern
    });
    // Nach dem Speichern die Cache-Datenbank neu abrufen
    const newCache = await fetchSectionsFromDatabase();
    setSelectionCache(newCache);  // Aktualisiere den globalen Cache
    updateTable();

    return response.data._id;  // ID des neu erstellten Eintrags zurückgeben
  } catch (error) {
    console.error('Error saving section:', (error as any).response ? (error as any).response.data : (error as any).message);
    return null;
  }
};

// Funktion zum Abrufen der Sections aus der Datenbank
const fetchSectionsFromDatabase = async () => {
  try {
    const response = await axios.get("http://localhost:5555/sections");
    return response.data.data;
  } catch (error) {
    console.error("Fehler beim Abrufen der Sections aus der Datenbank:", error);
    return [];
  }
};

// Funktion zum Aktualisieren der Tabelle basierend auf selectionCache
const updateTable = async () => {
  if (!table) return; // Stelle sicher, dass table initialisiert ist

  if (selectionCache) {
    const tableData = selectionCache.map(group => ({
      data: {
        Name: group.name,
        fragmentIdMap: group.value,
        color: group.color,
        selected: false,
        id: group._id,
      }
    }));
    table.data = tableData; // Aktualisiere die Tabelle
  }
};

// Die Hauptfunktion
export default (components: OBC.Components) => {
  const [customSelectionsTable, updateCustomSelections] = customSelections({
    components,
  });
  const highlighter = components.get(OBF.Highlighter);

  let newSelectionForm: HTMLDivElement;
  let groupNameInput: BUI.TextInput;
  let saveSelectionBtn: BUI.Button;

  const onFormCreated = (e?: Element) => {
    if (!e) return;
    newSelectionForm = e as HTMLDivElement;
    highlighter.events.select.onClear.add(() => {
      newSelectionForm.style.display = "none";
    });
  };

  const onGroupNameInputCreated = (e?: Element) => {
    if (!e) return;
    groupNameInput = e as BUI.TextInput;
    highlighter.events.select.onClear.add(() => {
      groupNameInput.value = "";
    });
  };

  const onSaveSelectionCreated = (e?: Element) => {
    if (!e) return;
    saveSelectionBtn = e as BUI.Button;
    highlighter.events.select.onHighlight.add(() => {
      saveSelectionBtn.style.display = "block";
    });
    highlighter.events.select.onClear.add(() => {
      saveSelectionBtn.style.display = "none";
    });
  };

  const onSaveGroupSelection = async () => {
      if (!(groupNameInput && groupNameInput.value.trim() !== "")) return;
  
      newSelectionForm.style.display = "none";
      saveSelectionBtn.style.display = "none";
  
      const selectionData = serializeFragmentIdMap(highlighter.selection.select);
      const userComment = groupCommentInput.value; // Declare the 'userComment' variable and assign it the value from 'groupCommentInput'
  
      // Speichern der neuen Sektion in der Datenbank und ID abrufen
      const newId = await saveNewSection(groupNameInput.value, selectionData, selectedColor, userComment);
      if (newId) {
          // Hinzufügen der neuen Gruppe zu selectionCache
          selectionCache.push({
              _id: newId,
              name: groupNameInput.value,
              value: selectionData,
              color: selectedColor[0],
              comment: userComment  // Kommentar speichern
          });
  
          // Highlighter für die neue Sektion hinzufügen
          const threecolor = new THREE.Color(selectedColor[0]);
          highlighter.add(newId, threecolor);
  
          // Tabelle aktualisieren
          
          highlighter.clear();
      }
      // Reset des Input-Feldes
      groupNameInput.value = "";
      groupCommentInput.value = "";  // Kommentar zurücksetzen
  };

  const onNewSelection = () => {
    const selectionLength = Object.keys(highlighter.selection.select).length;
    if (!(newSelectionForm && selectionLength !== 0)) return;
    newSelectionForm.style.display = "flex";
    saveSelectionBtn.style.display = "none";
  };

  const onCancelGroupCreation = () => {
    if (!newSelectionForm) return;
    newSelectionForm.style.display = "none";
    groupNameInput.value = "";
  };

  // Hier werden die Farben als Hexadezimalwerte definiert
  const colorOptions = [
    { label: "Rot", value: "rgb(255, 0, 0)" },  
    { label: "Orang", value: "rgb(255, 165, 0)" },  
    { label: "Grün", value: "rgb(0, 128, 0)" },     
    { label: "Blau", value: "rgb(0, 0, 255)" }  
  ];

  let selectedColor = "rgb(255, 0, 0)"; // Standardfarbe (Rot)

  const onColorSelected = (event: Event) => {
    const dropdown = event.target as HTMLSelectElement;
    selectedColor = dropdown.value; // Speichere die ausgewählte Farbe als String
  };

  let groupCommentInput: BUI.TextInput;

  const onGroupCommentInputCreated = (e?: Element) => {
    if (!e) return;
    groupCommentInput = e as BUI.TextInput;
    highlighter.events.select.onClear.add(() => {
      groupCommentInput.value = "";
    });
  };
  
  return BUI.Component.create<BUI.PanelSection>(() => {
    return BUI.html`
      <bim-panel-section label="Custom Selections" icon="clarity:blocks-group-solid">
        <div ${BUI.ref(onFormCreated)} style="display: none; flex-direction: column; gap: 0.5rem;">
          
          <div style="display: flex; gap: 0.5rem;">
            <bim-text-input ${BUI.ref(onGroupNameInputCreated)} placeholder="Selection Name..." vertical></bim-text-input>
  
            <bim-dropdown @change=${onColorSelected}>
              ${colorOptions.map(option => BUI.html`
              <bim-option value="${option.value}" label="${option.label}"></bim-option>`)}
            </bim-dropdown>
  
            <bim-button @click=${onSaveGroupSelection} icon="mingcute:check-fill" style="flex: 0" label="Accept"></bim-button>
            <bim-button @click=${onCancelGroupCreation} icon="mingcute:close-fill" style="flex: 0" label="Cancel"></bim-button>
          </div>
          
          <textarea 
            ${BUI.ref(onGroupCommentInputCreated)} 
            placeholder="Your comment..." 
            rows="5" 
            style="width: 100%; resize: vertical;"></textarea>
          
        </div>
        ${customSelectionsTable}
        <bim-button style="display: none;" ${BUI.ref(onSaveSelectionCreated)} @click=${onNewSelection} label="Save Selection"></bim-button>
      </bim-panel-section>
    `;
  });
};  