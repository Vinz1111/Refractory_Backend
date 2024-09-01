import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as CUI from "@thatopen/ui-obc";
import { AppManager } from "../../bim-components";

export default (components: OBC.Components) => {
  const fragments = components.get(OBC.FragmentsManager);
  const highlighter = components.get(OBF.Highlighter);
  const appManager = components.get(AppManager);
  const viewportGrid = appManager.grids.get("viewport");

  const [propsTable, updatePropsTable] = CUI.tables.elementProperties({
    components,
    fragmentIdMap: {},
  });


  propsTable.preserveStructureOnFilter = true;
  fragments.onFragmentsDisposed.add(() => updatePropsTable()); 


  highlighter.events.select.onHighlight.add((fragmentIdMap) => {// Hier werden die Properties der selektierten Elemente angezeigt
    if (!viewportGrid) return;                                // müsste Dynamisch angepasst werden
    viewportGrid.layout = "second";                              // fragmentIdMap sind die ExpressID's die geheilightet sind
    propsTable.expanded = false;
    propsTable.headersHidden = false;
    updatePropsTable({ fragmentIdMap });
  });


  highlighter.events.select.onClear.add(() => {
    updatePropsTable({ fragmentIdMap: {} });
    if (!viewportGrid) return;
    viewportGrid.layout = "main";
  });
  
  return BUI.Component.create<BUI.Panel>(() => {
    return BUI.html`
      <bim-panel>
        <bim-panel-section name="selection" label="Selection Information in work" icon="solar:document-bold" fixed>
          ${propsTable}
        </bim-panel-section>
      </bim-panel> 
    `;
  });
};

