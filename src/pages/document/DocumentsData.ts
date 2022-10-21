import { File } from "../../models/File";

export const dummyArticlesContent : Array<Array<any>> = [
    ['1','Qué es la sostenibilidad: definición, tipos y ejemplos', 'SubtitleThe', 'article',
     `
     La sostenibilidad consiste en satisfacer las necesidades de las generaciones actuales sin comprometer a las necesidades de las generaciones futuras, al mismo tiempo que se garantiza un equilibrio entre el crecimiento de la economía, el respeto al medioambiente y el bienestar social. 
     Tal y como veíamos en el apartado anterior, los plásticos son un grave problema para los océanos y, según estos mismos datos de Naciones Unidas, más de tres millones de personas dependen de los océanos para su subsistencia. Por tanto, la situación actual debe cambiar si queremos cumplir con el objetivo número 14 de los Objetivos de Desarrollo Sostenible (ODS): “conservar y utilizar sosteniblemente los océanos, los mares y los recursos marinos para el desarrollo sostenible”.
     `, 
     'https://images.squarespace-cdn.com/content/v1/5e45e5757350894b2a8b7b22/1596220173913-BWWOP9KOFDRXSDK9LMOL/alex-loup-mwINQsW2KJs-unsplash.jpg?', 'Sostek', 'TRUE', "1x1J2haBHZBTpVHkiQ19UN_lpYTSlxr1T44TOzqeSdgQ"],
    ['1','TheTitle', 'SubtitleThe', 'article', 'Había una vez', 'https://img.freepik.com/free-photo/environmental-conservation-garden-children_1150-15276.jpg?w=740&t=st=1665674411~exp=1665675011~hmac=cce6c0e4a24265f927554dfb1b11ba792faed308b59d78e398087f7006b664ff', 'Grecia', 'TRUE', "1y5_4JtMlZIYY5EjMd9LeMiQDFdZxlcpvBj-Z16ppWz8"],
    ['1','TheTitle', 'SubtitleThe', 'article', 'Había una vez', 'https://img.freepik.com/free-photo/environmental-conservation-garden-children_1150-15276.jpg?w=740&t=st=1665674411~exp=1665675011~hmac=cce6c0e4a24265f927554dfb1b11ba792faed308b59d78e398087f7006b664ff', 'Grecia', 'TRUE', "1rk0FDGDRPSz3p8IqyEy1Sy5HGbzYy6xls5cwtpDAlsk"]

]
export const dummyArticles : Array<File> | null =
[
    {
        driveId: "0AGxiS_Xq3bvYUk9PVA",
        id: "1x1J2haBHZBTpVHkiQ19UN_lpYTSlxr1T44TOzqeSdgQ",
        kind: "drive#file",
        mimeType: "application/vnd.google-apps.spreadsheet",
        name: "FirstArticle",
        teamDriveId: "0AGxiS_Xq3bvYUk9PVA",
    },
    {
        driveId: "0AGxiS_Xq3bvYUk9PVA",
        id: "1y5_4JtMlZIYY5EjMd9LeMiQDFdZxlcpvBj-Z16ppWz8",
        kind: "drive#file",
        mimeType: "application/vnd.google-apps.spreadsheet",
        name: "secondArticle",
        teamDriveId: "0AGxiS_Xq3bvYUk9PVA",
    },
    {
        driveId: "0AGxiS_Xq3bvYUk9PVA",
        id: "1rk0FDGDRPSz3p8IqyEy1Sy5HGbzYy6xls5cwtpDAlsk",
        kind: "drive#file",
        mimeType: "application/vnd.google-apps.spreadsheet",
        name: "firstPresentation",
        teamDriveId: "0AGxiS_Xq3bvYUk9PVA",
    }
]