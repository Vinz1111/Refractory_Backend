/* eslint-disable no-alert */
import * as OBC from "@thatopen/components";
//import * as OBF from "@thatopen/components-front";
//import * as BUI from "@thatopen/ui";
//import * as CUI from "@thatopen/ui-obc";
import * as FRAGS from "@thatopen/fragments";


export default (components: OBC.Components) => {

  const fragments = components.get(OBC.FragmentsManager);


  const loadFragments = async (urlfrag: string, urljson: string) => {
    try {
      // Lade die .frag Datei
      const file = await fetch(`/public/${urlfrag}`);
      if (!file.ok) {
        throw new Error(`Failed to load resource: ${urlfrag}`);
      }
      const data = await file.arrayBuffer();
      const geometry = new Uint8Array(data);

      // Lade die .json Datei mit den Eigenschaften
      let properties: FRAGS.IfcProperties | undefined;
      const propertiesFile = await fetch(`/public/${urljson}`);
      if (!propertiesFile.ok) {
        throw new Error(`Failed to load resource: ${urljson}`);
      }
      properties = await propertiesFile.json();

      
      const model = fragments.load(geometry, { properties });
      model.name = urlfrag;  // Modellname setzen

    } catch (error) {
      console.error(error);
    }
  };

  // Lade alle Modelle beim Aufruf der Seite
  (async () => {
    await loadFragments("Zwickel_Rechts.frag", "Zwickel_Rechts.json");
    await loadFragments("Zwickel_Links.frag", "Zwickel_Links.json");
    await loadFragments("Aschefallschacht.frag", "Aschefallschacht.json");
    await loadFragments("Muellrutsche.frag", "Muellrutsche.json");
    //await loadFragments("Umlenkung.frag", "Umlenkung.json");
    //await loadFragments("1_Zug_Vor-Rueckwand.frag", "1_Zug_Vor-Rueckwand.json");
    //await loadFragments("Decke-Todraum.frag", "Decke-Todraum.json");
    //await loadFragments("Rechte_Seitenwand.frag", "Rechte_Seitenwand.json");
    //await loadFragments("Linke_Seitenwand.frag", "Linke_Seitenwand.json");
  })();
};
