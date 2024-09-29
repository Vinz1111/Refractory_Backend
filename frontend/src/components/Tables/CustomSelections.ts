import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";
import { world } from '../../HomePage.js';
import axios from "axios";
import '../../style.css';  // Importiere die ausgelagerte CSS-Datei


export let selectionCache: any[] = [];

export function setSelectionCache(newCache: any[]) {
  selectionCache = newCache;
}

export let table: any; // Globale Variable für die Tabelle

// Funktion zum Löschen einer Sektion anhand der ID
const deleteSection = async (id: string) => {
  try {
    await axios.delete(`http://localhost:5555/sections/${id}`);
  } catch (error) {
    console.error(`Failed to delete section ${id}:`, error);
  }
};

// Funktion zum Abrufen der Sektionen aus der Datenbank
const fetchSectionsFromDatabase = async () => {
  try {
    const response = await axios.get("http://localhost:5555/sections");
    return response.data.data;
  } catch (error) {
    console.error("Fehler beim Abrufen der Sections aus der Datenbank:", error);
    return [];
  }
};

interface GroupingsUIState {
  components: OBC.Components;
}

export default (state: GroupingsUIState) => {
  const { components } = state;
  const highlighter = components.get(OBF.Highlighter);

  highlighter.clear();

  const computeTableData = (components: OBC.Components) => {
    const data: BUI.TableGroupData[] = [];

    fetchSectionsFromDatabase().then((selection) => {
      selectionCache = selection;
      selection.forEach((group: any) => {
        

        const fragmentIdMap = group.value;
        const color = group.color;
        const name = group.name;
        const id = group._id;
        const autor = "Vinzent"
        const role =  "Berater"
        const task = "1"
        
        const groupRow: BUI.TableGroupData = {
          data: {
            Name: name,
            fragmentIdMap: fragmentIdMap,
            color: color,
            selected: false,
            id: id,
            autor: autor,
            role: role,
            task: task,
          },
        };
        const threecolor = new THREE.Color(color);
        highlighter.add(String(id), threecolor);
        data.push(groupRow);
      });

      table.data = data;
    }).catch(error => {
      console.error("Fehler beim Abrufen der Sections:", error);
    });
  };

  const onDeleteGroup = async (id: string) => {
    try {
      await deleteSection(id);
      selectionCache = selectionCache.filter(group => group._id !== id);

      const updatedData = selectionCache.map(group => ({
        data: {
          Name: group.name,
          fragmentIdMap: group.value,
          color: group.color,
          selected: false,
          id: group._id,
          autor: group.autor,
          role: group.role,
          task: group.task,
          
        },
      }));
      highlighter.clear();
      table.data = updatedData;
      console.log(`Group ${id} deleted successfully.`);
    } catch (error) {
      console.error(`Failed to delete group ${id}:`, error);
    }
  };

  const onCheckboxChange = (event: Event, id: string) => {
    const checkbox = event.target as HTMLInputElement;
    const isChecked = checkbox.checked;

    const group = selectionCache.find(group => group._id === id);
    if (group) {
      group.selected = isChecked;

      if (isChecked) {
        const idMap = JSON.parse(group.value);
        highlighter.highlightByID(id, idMap, true, false);
      } else {
        const deselectedIdMap = JSON.parse(group.value);
        let sharedFragments: Record<string, any> = {};

        selectionCache.forEach(selectedGroup => {
          if (selectedGroup.selected && selectedGroup._id !== id) {
            const selectedIdMap = JSON.parse(selectedGroup.value);
            Object.keys(selectedIdMap).forEach(fragmentId => {
              if (fragmentId in deselectedIdMap) {
                sharedFragments[fragmentId] = selectedIdMap[fragmentId];
              }
            });
          }
        });

        highlighter.clear(id);

        Object.keys(sharedFragments).forEach(fragmentId => {
          const sharedGroup = selectionCache.find(g => JSON.parse(g.value).hasOwnProperty(fragmentId) && g.selected);
          if (sharedGroup) {
            const sharedIdMap = JSON.parse(sharedGroup.value);
            highlighter.highlightByID(sharedGroup._id, sharedIdMap, true, false);
          }
        });
      }
    }
  };

  const onFocusSelection = async (id: string) => {
    if (!world) return;
    if (!world.camera.hasCameraControls()) return;

    const bbox = components.get(OBC.BoundingBoxer);
    const fragments = components.get(OBC.FragmentsManager);
    bbox.reset();

    const group = selectionCache.find(group => group._id === id);
    if (!group) return;

    const idMap = JSON.parse(group.value);

    for (const fragID in idMap) {
      const fragment = fragments.list.get(fragID);
      if (!fragment) continue;
      const ids = idMap[fragID];
      bbox.addMesh(fragment.mesh, ids);
    }

    const sphere = bbox.getSphere();
    const isInvalidSphere = sphere.radius === Infinity || sphere.radius === 0;
    if (isInvalidSphere) {
      return;
    }

    sphere.radius *= 1.2;
    const camera = world.camera;
    await camera.controls.fitToSphere(sphere, true);
  };

  const onArrowRightClick = (id: string) => {
    const group = selectionCache.find(group => group._id === id);
    if (group) {
      const idMap = JSON.parse(group.value);
      highlighter.clear(id);
      highlighter.highlightByID("select", idMap, false, true);
    } else {
      console.error(`Group with id ${id} not found.`);
    }
  };

  const formatDateTime = (isoString: any) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('de-DE') + ' ' + date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  const showPopup = (group: any) => {
    const popup = document.createElement("div");
    popup.classList.add("popup");

    const formattedDate = group.updatedAt ? formatDateTime(group.updatedAt) : "Unbekannt";

    popup.innerHTML = `
      <h2>Subset Info</h2>
      <p><strong>Name:</strong> ${group.name}</p>
      <p><strong>ID:</strong> ${group._id}</p>
      <p><strong>Erstellername:</strong> ${group.autor || "Unbekannt"}</p>
      <p><strong>Rolle:</strong> ${group.role || "Unbekannt"}</p>
      <p><strong>Aufgabe:</strong> ${group.task || "Unbekannt"}</p>
      <p><strong>Erstellungsdatum:</strong> ${formattedDate}</p>
      <button id="closePopup">Schließen</button>
    `;

    document.body.appendChild(popup);

    const closeButton = popup.querySelector("#closePopup");
    closeButton?.addEventListener("click", () => {
      document.body.removeChild(popup);
    });
  };

  table = document.createElement("bim-table");
  table.headersHidden = true;
  table.hiddenColumns = ["fragmentIdMap", "color", "selected", "autor", "role", "task"];

  table.dataTransform = {
    id: (value: any) => {
      if (typeof value !== "string") return value;
  
      const group = selectionCache.find(group => group._id === value);
  
      return BUI.html`
        <div style="display: flex; flex: 1; justify-content: space-between; overflow: auto;">
          <bim-label style="display: none;">${value}</bim-label>
          <bim-checkbox data-id="${value}" @change=${(event: Event) => onCheckboxChange(event, value)}></bim-checkbox>
          <bim-button @click=${() => onFocusSelection(value)} icon="ri:focus-mode" tooltip-title="Focus" tooltip-text="Focus the camera to the current selection."></bim-button>
          <bim-button @click=${() => onArrowRightClick(value)} icon="ri:arrow-right-line" tooltip-title="Move Right" tooltip-text="Select and highlight the group."></bim-button>
          <bim-button @click=${() => onDeleteGroup(value)} style="flex: 0" icon="majesticons:delete-bin"></bim-button>
          <bim-button @click=${() => showPopup(group)} icon="ic:round-info" tooltip-title="Info" tooltip-text="Show more information about this Selection." style="flex: 0"></bim-button> 
        </div> 
      `;
    },
  };

  table.addEventListener("cellcreated", ({ detail }: { detail: any }) => {
    const { cell } = detail;
    if (cell && cell.style) {
      cell.style.padding = "0.25rem 0";
    }
  });

  table.addEventListener("rowcreated", ({ detail }: { detail: any }) => {
    const { row } = detail;
    const { fragmentIdMap } = row.data;
    if (typeof fragmentIdMap !== "string") return;
    const idMap = JSON.parse(fragmentIdMap);
    if (Object.keys(idMap).length === 0) return;

    row.onmouseleave = () => {
      row.style.removeProperty("--bim-label--c");
      row.style.cursor = "default";
    };
  });

  return BUI.Component.create<BUI.Table, GroupingsUIState>(
    (state: GroupingsUIState) => {
      computeTableData(state.components);
      return BUI.html`${table}`;
    },
    state,
  );
};
