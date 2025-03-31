export interface DocumentScreenParams {
    docName: string;
}

export interface RouteParams {
    document: { docName: string }; // Parameter for the "document" screen
    index: undefined; // No parameters for the "index" screen
    plant: undefined; // No parameters for the "plant" screen
};

export const nullID = '00000000-0000-0000-0000-000000000000';
export const unitPC = {
    name: "шт",
    id: "b3243323-c0df-11ea-8275-00c12700489e"
};
export const newSIZE = 'newSize';

export enum UploadStatus {
    Start = 0,
    OneC = 1,
    Excel = 2,
    All = 3
}