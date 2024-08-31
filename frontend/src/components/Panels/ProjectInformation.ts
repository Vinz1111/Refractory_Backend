import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as CUI from "@thatopen/ui-obc";
import groupings from "./Sections/Groupings";

export default (components: OBC.Components) => {

  const [modelsList] = CUI.tables.modelsList({
    components, 
    tags: {schema: false, viewDefinition: true},
    actions: { download: false, dispose: false, },
  });
  


  return BUI.Component.create<BUI.Panel>(() => {
    return BUI.html`
      <bim-panel>
        <bim-panel-section label="Loaded Models" icon="mage:box-3d-fill">
          ${modelsList}
        </bim-panel-section>
        ${groupings(components)}
      </bim-panel> 
    `;
  });
};
