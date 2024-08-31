export const sharedIdMapManager = {
    sharedIdMap: {} as Record<string, any>,
  
    clear() {
      this.sharedIdMap = {};
    },
  
    setMap(newMap: Record<string, any>) {
      this.sharedIdMap = newMap;
    },
  
    getMap() {
      return this.sharedIdMap;
    },
  };
  