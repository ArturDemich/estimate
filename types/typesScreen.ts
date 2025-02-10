export interface DocumentScreenParams {
    docName: string;
}

export interface RouteParams {
    document: { docName: string }; // Parameter for the "document" screen
    index: undefined; // No parameters for the "index" screen
    plant: undefined; // No parameters for the "plant" screen
  };